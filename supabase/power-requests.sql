-- ============================================================
-- GELAKRAFT · ESKAERAK ETA POWER EFFECTS
-- ============================================================
-- 1. RPC `get_student_xp_safe` — devuelve XP sin restricciones RLS
--    (necesaria para que el alumno pueda actualizar su avatar)
-- 2. Tabla `power_requests` — cola de poderes pendientes de validación
-- 3. RPCs `request_power`, `approve_power_request`, `deny_power_request`
-- 4. RPCs auto-aplicables para poderes (heal, grant_xp, grant_mana)
-- 5. Update de get_student_dashboard para incluir power_requests
-- ============================================================


-- 1. RPC para obtener XP de un alumno sin RLS (uso en server actions de iron-session)
create or replace function public.get_student_xp_safe(p_student_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_xp integer;
begin
  select xp into v_xp from public.students where id = p_student_id;
  if v_xp is null then
    raise exception 'Student not found';
  end if;
  return v_xp;
end;
$$;


-- 2. Tabla `power_requests`
create table if not exists public.power_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  target_student_id uuid references public.students(id) on delete cascade,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  power_id text not null,
  power_name text not null,
  mana_cost integer not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolver_id uuid references auth.users(id)
);

create index if not exists power_requests_classroom_idx
  on public.power_requests(classroom_id, status, created_at desc);
create index if not exists power_requests_student_idx
  on public.power_requests(student_id, created_at desc);

alter table public.power_requests enable row level security;

drop policy if exists "power_requests_owner_all" on public.power_requests;
create policy "power_requests_owner_all"
  on public.power_requests for all
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = power_requests.classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = power_requests.classroom_id and c.teacher_id = auth.uid()
    )
  );


-- 3. RPC: request_power (alumno solicita un poder MANUAL)
--    Descuenta mana al momento (reserva) y crea entrada pendiente.
--    Si se rechaza después, se devuelve el mana.
create or replace function public.request_power(
  p_student_id uuid,
  p_power_id text,
  p_power_name text,
  p_mana_cost integer,
  p_target_student_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_current_mana integer;
  v_request_id uuid;
begin
  select classroom_id, mana into v_classroom_id, v_current_mana
  from public.students where id = p_student_id;

  if v_classroom_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikaslea ez da aurkitu.');
  end if;

  if v_current_mana < p_mana_cost then
    return jsonb_build_object('success', false, 'error', 'Mana nahikorik ez.');
  end if;

  -- Si hay target, validar mismo classroom
  if p_target_student_id is not null then
    if not exists (
      select 1 from public.students
      where id = p_target_student_id and classroom_id = v_classroom_id
    ) then
      return jsonb_build_object('success', false, 'error', 'Helburu ikaslea ez da baliozkoa.');
    end if;
  end if;

  -- Descontar mana (reserva)
  update public.students
  set mana = mana - p_mana_cost, updated_at = now()
  where id = p_student_id;

  -- Crear request
  insert into public.power_requests (
    student_id, target_student_id, classroom_id, power_id, power_name, mana_cost
  ) values (
    p_student_id, p_target_student_id, v_classroom_id, p_power_id, p_power_name, p_mana_cost
  ) returning id into v_request_id;

  return jsonb_build_object('success', true, 'request_id', v_request_id);
end;
$$;


-- 4. RPC: approve_power_request (profesor aprueba)
create or replace function public.approve_power_request(p_request_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_request record;
begin
  select * into v_request
  from public.power_requests
  where id = p_request_id and status = 'pending';

  if v_request.id is null then
    return jsonb_build_object('success', false, 'error', 'Eskaera ez da aurkitu edo ez dago zain.');
  end if;

  -- Marcar como aprobado
  update public.power_requests
  set status = 'approved', resolved_at = now(), resolver_id = auth.uid()
  where id = p_request_id;

  -- Registrar como activity
  insert into public.activities (
    classroom_id, activity_type, outcome, xp_delta, hearts_delta, metadata, affected_student_ids
  ) values (
    v_request.classroom_id, 'power_used', 'success', 0, 0,
    jsonb_build_object(
      'power_id', v_request.power_id,
      'power_name', v_request.power_name,
      'mana_cost', v_request.mana_cost,
      'approved', true,
      'target_student_id', v_request.target_student_id
    ),
    case when v_request.target_student_id is not null
         then array[v_request.student_id, v_request.target_student_id]
         else array[v_request.student_id]
    end
  );

  -- Registrar uso en power_usages
  insert into public.power_usages (student_id, power_id, mana_cost)
  values (v_request.student_id, v_request.power_id, v_request.mana_cost);

  return jsonb_build_object('success', true);
end;
$$;


-- 5. RPC: deny_power_request (profesor rechaza → devuelve mana)
create or replace function public.deny_power_request(p_request_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_request record;
begin
  select * into v_request
  from public.power_requests
  where id = p_request_id and status = 'pending';

  if v_request.id is null then
    return jsonb_build_object('success', false, 'error', 'Eskaera ez da aurkitu edo ez dago zain.');
  end if;

  -- Marcar como rechazado
  update public.power_requests
  set status = 'denied', resolved_at = now(), resolver_id = auth.uid()
  where id = p_request_id;

  -- Devolver mana al alumno
  update public.students
  set mana = least(max_mana, mana + v_request.mana_cost), updated_at = now()
  where id = v_request.student_id;

  return jsonb_build_object('success', true);
end;
$$;


-- 6. RPC: execute_power_auto (alumno ejecuta poder AUTO directamente)
--    Aplica el efecto, descuenta mana y registra activity.
--    El efecto depende del effect_type pasado.
create or replace function public.execute_power_auto(
  p_student_id uuid,
  p_power_id text,
  p_power_name text,
  p_mana_cost integer,
  p_effect_type text,        -- 'heal_member' | 'heal_team_except_self' | 'mana_team_except_self' | 'mana_member' | 'xp_team_all' | 'heal_self'
  p_effect_value integer,    -- cantidad a aplicar (hearts/xp/mana)
  p_target_student_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_current_mana integer;
  v_team_id uuid;
  v_affected uuid[];
  v_team_members uuid[];
begin
  select classroom_id, mana into v_classroom_id, v_current_mana
  from public.students where id = p_student_id;

  if v_classroom_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikaslea ez da aurkitu.');
  end if;

  if v_current_mana < p_mana_cost then
    return jsonb_build_object('success', false, 'error', 'Mana nahikorik ez.');
  end if;

  -- Obtener equipo
  select team_id into v_team_id
  from public.team_members where student_id = p_student_id;

  -- Validaciones target
  if p_effect_type in ('heal_member', 'mana_member') then
    if p_target_student_id is null then
      return jsonb_build_object('success', false, 'error', 'Helburua aukeratu behar duzu.');
    end if;
    -- Validar que target esté en mismo equipo
    if v_team_id is null or not exists (
      select 1 from public.team_members
      where team_id = v_team_id and student_id = p_target_student_id
    ) then
      return jsonb_build_object('success', false, 'error', 'Helburua ez dago zure taldean.');
    end if;
  end if;

  if p_effect_type in ('heal_team_except_self', 'mana_team_except_self', 'xp_team_all') then
    if v_team_id is null then
      return jsonb_build_object('success', false, 'error', 'Ez zaude talde batean.');
    end if;
  end if;

  -- Descontar mana del que invoca
  update public.students
  set mana = mana - p_mana_cost, updated_at = now()
  where id = p_student_id;

  -- Aplicar efecto
  if p_effect_type = 'heal_self' then
    update public.students
    set hearts = least(max_hearts, hearts + p_effect_value), updated_at = now()
    where id = p_student_id;
    v_affected := array[p_student_id];

  elsif p_effect_type = 'heal_member' then
    update public.students
    set hearts = least(max_hearts, hearts + p_effect_value), updated_at = now()
    where id = p_target_student_id;
    v_affected := array[p_student_id, p_target_student_id];

  elsif p_effect_type = 'mana_member' then
    update public.students
    set mana = least(max_mana, mana + p_effect_value), updated_at = now()
    where id = p_target_student_id;
    v_affected := array[p_student_id, p_target_student_id];

  elsif p_effect_type = 'heal_team_except_self' then
    select array_agg(tm.student_id) into v_team_members
    from public.team_members tm
    where tm.team_id = v_team_id and tm.student_id <> p_student_id;
    if v_team_members is not null then
      update public.students
      set hearts = least(max_hearts, hearts + p_effect_value), updated_at = now()
      where id = any(v_team_members);
    end if;
    v_affected := array_append(coalesce(v_team_members, array[]::uuid[]), p_student_id);

  elsif p_effect_type = 'mana_team_except_self' then
    select array_agg(tm.student_id) into v_team_members
    from public.team_members tm
    where tm.team_id = v_team_id and tm.student_id <> p_student_id;
    if v_team_members is not null then
      update public.students
      set mana = least(max_mana, mana + p_effect_value), updated_at = now()
      where id = any(v_team_members);
    end if;
    v_affected := array_append(coalesce(v_team_members, array[]::uuid[]), p_student_id);

  elsif p_effect_type = 'xp_team_all' then
    select array_agg(tm.student_id) into v_team_members
    from public.team_members tm
    where tm.team_id = v_team_id;
    if v_team_members is not null then
      update public.students
      set xp = xp + p_effect_value, updated_at = now()
      where id = any(v_team_members);
    end if;
    v_affected := coalesce(v_team_members, array[p_student_id]);

  else
    return jsonb_build_object('success', false, 'error', 'Efektu mota ezezaguna.');
  end if;

  -- Registrar uso
  insert into public.power_usages (student_id, power_id, mana_cost)
  values (p_student_id, p_power_id, p_mana_cost);

  -- Registrar activity
  insert into public.activities (
    classroom_id, activity_type, outcome, xp_delta, hearts_delta, metadata, affected_student_ids
  ) values (
    v_classroom_id, 'power_used', 'success',
    case when p_effect_type = 'xp_team_all' then p_effect_value else 0 end,
    case when p_effect_type in ('heal_self', 'heal_member', 'heal_team_except_self') then p_effect_value else 0 end,
    jsonb_build_object(
      'power_id', p_power_id,
      'power_name', p_power_name,
      'mana_cost', p_mana_cost,
      'effect_type', p_effect_type,
      'effect_value', p_effect_value,
      'target_student_id', p_target_student_id,
      'auto', true
    ),
    v_affected
  );

  return jsonb_build_object('success', true);
end;
$$;


-- 7. UPDATE get_student_dashboard: añadir requests pendientes del alumno
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
  select to_jsonb(s.*) - 'password_hash' - 'password_plain'
    into v_student
  from public.students s
  where id = p_student_id;

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
    select * from public.power_usages
    where student_id = p_student_id
    order by used_at desc limit 10
  ) sub;

  -- Pending power requests del alumno
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
    select *
    from public.activities
    where classroom_id = v_classroom_id
      and (affected_student_ids is null or p_student_id = any(affected_student_ids))
    order by created_at desc limit 25
  ) sub;

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
