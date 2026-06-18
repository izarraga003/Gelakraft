-- ============================================================
-- GELAKRAFT · KONFIGURAZIOA + ASTEKO SARIAK + BOTERE OVERRIDE
-- ============================================================
-- 1. classrooms.weekly_mana / weekly_hearts (cuánto se regala a cada alumno por semana)
-- 2. students.last_weekly_grant_at (timestamp de última aplicación)
-- 3. tabla `power_overrides` para personalizar modo/coste de un poder por aula
-- 4. RPC apply_weekly_grants (aplicación lazy al cargar dashboard)
-- 5. update de get_student_dashboard para llamar apply_weekly_grants
-- 6. RPC update_student_hero_class
-- ============================================================

-- 1. Columnas nuevas en classrooms
alter table public.classrooms
  add column if not exists weekly_mana integer not null default 2 check (weekly_mana >= 0 and weekly_mana <= 10),
  add column if not exists weekly_hearts integer not null default 1 check (weekly_hearts >= 0 and weekly_hearts <= 10);

-- 2. Columna en students
alter table public.students
  add column if not exists last_weekly_grant_at timestamptz;

-- Inicializar timestamp para alumnos ya creados (para que el primer grant no salte por años)
update public.students set last_weekly_grant_at = now()
  where last_weekly_grant_at is null;


-- 3. Tabla power_overrides
create table if not exists public.power_overrides (
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  power_id text not null,
  mode text check (mode in ('auto', 'manual')), -- null = mantén el del catálogo
  mana_cost integer check (mana_cost is null or mana_cost >= 0),
  primary key (classroom_id, power_id)
);

alter table public.power_overrides enable row level security;

drop policy if exists "power_overrides_owner_all" on public.power_overrides;
create policy "power_overrides_owner_all"
  on public.power_overrides for all
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = power_overrides.classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = power_overrides.classroom_id and c.teacher_id = auth.uid()
    )
  );


-- 4. RPC apply_weekly_grants — aplica los regalos semanales acumulados al alumno
create or replace function public.apply_weekly_grants(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_classroom_id uuid;
  v_weekly_mana int;
  v_weekly_hearts int;
  v_weeks_passed int;
  v_max_weeks int := 4;
begin
  select last_weekly_grant_at, classroom_id
    into v_last, v_classroom_id
  from public.students where id = p_student_id;

  if v_classroom_id is null then return; end if;

  select coalesce(weekly_mana, 2), coalesce(weekly_hearts, 1)
    into v_weekly_mana, v_weekly_hearts
  from public.classrooms where id = v_classroom_id;

  if v_last is null then
    update public.students set last_weekly_grant_at = now()
      where id = p_student_id;
    return;
  end if;

  v_weeks_passed := floor(
    extract(epoch from (now() - v_last)) / (7 * 24 * 3600)
  )::int;

  if v_weeks_passed < 1 then return; end if;
  if v_weeks_passed > v_max_weeks then v_weeks_passed := v_max_weeks; end if;

  update public.students set
    mana = least(max_mana, mana + (v_weekly_mana * v_weeks_passed)),
    hearts = least(max_hearts, hearts + (v_weekly_hearts * v_weeks_passed)),
    last_weekly_grant_at = last_weekly_grant_at + (v_weeks_passed || ' weeks')::interval,
    updated_at = now()
  where id = p_student_id;
end;
$$;


-- 5. RPC update_student_hero_class — profesor cambia la clase de un alumno
create or replace function public.update_student_hero_class(
  p_student_id uuid,
  p_new_class text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_teacher_id uuid;
begin
  if p_new_class not in ('sorgina', 'lamia', 'jentila') then
    return jsonb_build_object('success', false, 'error', 'Klase ezezaguna.');
  end if;

  select classroom_id into v_classroom_id
    from public.students where id = p_student_id;
  if v_classroom_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikaslea ez da aurkitu.');
  end if;

  select teacher_id into v_teacher_id
    from public.classrooms where id = v_classroom_id;
  if v_teacher_id <> auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Ez duzu baimenik.');
  end if;

  update public.students set hero_class = p_new_class, updated_at = now()
    where id = p_student_id;

  return jsonb_build_object('success', true);
end;
$$;


-- 6. RPC update_classroom_settings — nombre + weekly mana/hearts
create or replace function public.update_classroom_settings(
  p_classroom_id uuid,
  p_name text,
  p_weekly_mana integer,
  p_weekly_hearts integer
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_teacher_id uuid;
begin
  select teacher_id into v_teacher_id from public.classrooms where id = p_classroom_id;
  if v_teacher_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikasgela ez da aurkitu.');
  end if;
  if v_teacher_id <> auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Ez duzu baimenik.');
  end if;

  if length(trim(p_name)) < 1 then
    return jsonb_build_object('success', false, 'error', 'Izena hutsik ezin da egon.');
  end if;
  if p_weekly_mana < 0 or p_weekly_mana > 10 then
    return jsonb_build_object('success', false, 'error', 'Asteko mana 0-10 artean.');
  end if;
  if p_weekly_hearts < 0 or p_weekly_hearts > 10 then
    return jsonb_build_object('success', false, 'error', 'Asteko bihotzak 0-10 artean.');
  end if;

  update public.classrooms set
    name = trim(p_name),
    weekly_mana = p_weekly_mana,
    weekly_hearts = p_weekly_hearts
  where id = p_classroom_id;

  return jsonb_build_object('success', true);
end;
$$;


-- 7. UPDATE get_student_dashboard: aplicar grants al inicio
create or replace function public.get_student_dashboard(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student jsonb;
  v_classroom jsonb;
  v_ranking jsonb;
  v_activities jsonb;
  v_team jsonb;
  v_power_usages jsonb;
  v_pending_requests jsonb;
  v_classroom_id uuid;
  v_position integer;
begin
  -- Aplicar regalos semanales pendientes antes de leer
  perform public.apply_weekly_grants(p_student_id);

  select to_jsonb(s.*) - 'password_hash' - 'password_plain'
    into v_student
  from public.students s where id = p_student_id;

  if v_student is null then
    raise exception 'Student not found';
  end if;

  v_classroom_id := (v_student->>'classroom_id')::uuid;

  select to_jsonb(c.*) into v_classroom
    from public.classrooms c where id = v_classroom_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id, 'full_name', full_name, 'avatar', avatar,
      'avatar_config', avatar_config, 'hero_class', hero_class,
      'xp', xp, 'hearts', hearts, 'max_hearts', max_hearts
    )
    order by xp desc, full_name asc
  ), '[]'::jsonb)
    into v_ranking
  from public.students where classroom_id = v_classroom_id;

  select count(*) + 1 into v_position
    from public.students s2
    where s2.classroom_id = v_classroom_id
      and (s2.xp > (v_student->>'xp')::integer
        or (s2.xp = (v_student->>'xp')::integer
          and s2.full_name < (v_student->>'full_name')::text));

  select jsonb_build_object(
    'id', t.id, 'name', t.name, 'position', t.position,
    'members', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', s.id, 'full_name', s.full_name, 'hero_class', s.hero_class,
        'avatar_config', s.avatar_config, 'xp', s.xp
      ) order by s.hero_class asc, s.full_name asc
    ) filter (where s.id is not null), '[]'::jsonb)
  ) into v_team
  from public.teams t
  left join public.team_members tm on tm.team_id = t.id
  left join public.students s on s.id = tm.student_id
  where t.id = (
    select team_id from public.team_members where student_id = p_student_id
  )
  group by t.id, t.name, t.position;

  select coalesce(jsonb_agg(
    jsonb_build_object('id', id, 'power_id', power_id, 'mana_cost', mana_cost, 'used_at', used_at)
    order by used_at desc
  ), '[]'::jsonb)
    into v_power_usages
  from (
    select * from public.power_usages where student_id = p_student_id
    order by used_at desc limit 10
  ) sub;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id, 'power_id', power_id, 'power_name', power_name,
      'mana_cost', mana_cost, 'status', status,
      'created_at', created_at, 'resolved_at', resolved_at
    )
    order by created_at desc
  ), '[]'::jsonb)
    into v_pending_requests
  from public.power_requests
  where student_id = p_student_id
    and (status = 'pending' or resolved_at > now() - interval '24 hours');

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id, 'activity_type', activity_type, 'outcome', outcome,
      'xp_delta', xp_delta, 'hearts_delta', hearts_delta,
      'metadata', metadata, 'created_at', created_at,
      'is_personal', (affected_student_ids is not null),
      'affected_count', case when affected_student_ids is null then null
                             else array_length(affected_student_ids, 1) end
    )
    order by created_at desc
  ), '[]'::jsonb)
    into v_activities
  from (
    select * from public.activities
    where classroom_id = v_classroom_id
      and (affected_student_ids is null or p_student_id = any(affected_student_ids))
    order by created_at desc limit 25
  ) sub;

  -- Recargar v_student tras los grants
  select to_jsonb(s.*) - 'password_hash' - 'password_plain'
    into v_student
  from public.students s where id = p_student_id;

  return jsonb_build_object(
    'student', v_student,
    'classroom', v_classroom,
    'ranking', v_ranking,
    'position', v_position,
    'team', v_team,
    'power_usages', v_power_usages,
    'pending_requests', v_pending_requests,
    'activities', v_activities
  );
end;
$$;
