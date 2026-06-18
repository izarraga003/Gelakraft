-- ============================================================
-- GELAKRAFT · ESKEMA OSAGARRIA: JOKABIDEAK + TALDEAK + PODEREAK
-- ============================================================
-- 1. Tabla `behaviors` (conductas reutilizables por classroom)
-- 2. Tabla `teams` + `team_members` (grupos de alumnos)
-- 3. Tabla `power_usages` (registro de uso de poderes)
-- 4. Función `seed_default_behaviors`: rellena conductas por defecto
-- 5. Función `generate_teams`: auto-generación de grupos
-- 6. Trigger para seed automático al crear classroom
-- 7. Update de `get_student_dashboard` para incluir team + powers
-- 8. Ampliar `activities.activity_type` con 'power_used'
-- ============================================================


-- ============================================================
-- 1. TABLA BEHAVIORS (conductas)
-- ============================================================
create table if not exists public.behaviors (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  behavior_type text not null check (behavior_type in ('positive', 'negative')),
  description text not null,
  xp_delta integer not null default 0,
  hearts_delta integer not null default 0,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists behaviors_classroom_id_idx on public.behaviors(classroom_id, behavior_type, display_order);

alter table public.behaviors enable row level security;

drop policy if exists "behaviors_owner_all" on public.behaviors;
create policy "behaviors_owner_all"
  on public.behaviors for all
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = behaviors.classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = behaviors.classroom_id and c.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 2. TABLAS TEAMS + TEAM_MEMBERS
-- ============================================================
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  name text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists teams_classroom_id_idx on public.teams(classroom_id, position);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  primary key (team_id, student_id),
  unique (student_id) -- un alumno solo puede estar en UN equipo
);

create index if not exists team_members_student_idx on public.team_members(student_id);

alter table public.teams enable row level security;
alter table public.team_members enable row level security;

drop policy if exists "teams_owner_all" on public.teams;
create policy "teams_owner_all"
  on public.teams for all
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = teams.classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = teams.classroom_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "team_members_owner_all" on public.team_members;
create policy "team_members_owner_all"
  on public.team_members for all
  using (
    exists (
      select 1 from public.teams t
      join public.classrooms c on c.id = t.classroom_id
      where t.id = team_members.team_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.teams t
      join public.classrooms c on c.id = t.classroom_id
      where t.id = team_members.team_id and c.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 3. TABLA POWER_USAGES (historial de poderes usados)
-- ============================================================
create table if not exists public.power_usages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  power_id text not null,
  mana_cost integer not null,
  used_at timestamptz not null default now()
);

create index if not exists power_usages_student_idx on public.power_usages(student_id, used_at desc);

alter table public.power_usages enable row level security;

drop policy if exists "power_usages_owner_all" on public.power_usages;
create policy "power_usages_owner_all"
  on public.power_usages for all
  using (
    exists (
      select 1 from public.students s
      join public.classrooms c on c.id = s.classroom_id
      where s.id = power_usages.student_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.students s
      join public.classrooms c on c.id = s.classroom_id
      where s.id = power_usages.student_id and c.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 4. AMPLIAR ACTIVITY_TYPE
-- ============================================================
alter table public.activities
  drop constraint if exists activities_activity_type_check;

alter table public.activities
  add constraint activities_activity_type_check
  check (activity_type in (
    'battle', 'silence', 'event', 'reward', 'adjustment', 'power_used'
  ));


-- ============================================================
-- 5. SEED DE CONDUCTAS POR DEFECTO
-- ============================================================
create or replace function public.seed_default_behaviors(p_classroom_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- POSITIVAS
  insert into public.behaviors (classroom_id, behavior_type, description, xp_delta, hearts_delta, display_order) values
    (p_classroom_id, 'positive', 'Klasera puntual etorri',                  30, 0, 1),
    (p_classroom_id, 'positive', 'Ariketa pantailaratu zuzen egin',         50, 0, 2),
    (p_classroom_id, 'positive', 'Lankideen arteko liskarra baretu',        50, 0, 3),
    (p_classroom_id, 'positive', 'Material guztia ekarri',                  20, 0, 4),
    (p_classroom_id, 'positive', 'Klasea garbi utzi',                       30, 0, 5),
    (p_classroom_id, 'positive', 'Lankide bati lagundu',                    25, 0, 6),
    (p_classroom_id, 'positive', 'Etxeko lanak garaiz aurkeztu',            40, 0, 7),
    (p_classroom_id, 'positive', 'Klasean parte hartu',                     15, 0, 8);

  -- NEGATIVAS
  insert into public.behaviors (classroom_id, behavior_type, description, xp_delta, hearts_delta, display_order) values
    (p_classroom_id, 'negative', 'Lankide bati irain egin',                  0, -3, 1),
    (p_classroom_id, 'negative', 'Berandu etorri',                           0, -2, 2),
    (p_classroom_id, 'negative', 'Klasean lo egin',                          0, -3, 3),
    (p_classroom_id, 'negative', 'Klasean jan',                              0, -3, 4),
    (p_classroom_id, 'negative', 'Materiala ez zaindu',                      0, -4, 5),
    (p_classroom_id, 'negative', 'Mugikorra erabili klasean',                0, -3, 6),
    (p_classroom_id, 'negative', 'Komentario iraingarriak (arrazista, etab.)', 0, -5, 7),
    (p_classroom_id, 'negative', 'Lankideen datuak ezabatu',                 0, -10, 8),
    (p_classroom_id, 'negative', 'Objektuak bota',                           0, -5, 9),
    (p_classroom_id, 'negative', 'Lankide bati kableak deskonektatu',        0, -4, 10);
end;
$$;

comment on function public.seed_default_behaviors is 'Sembra conductas por defecto al crear una ikasgela.';


-- ============================================================
-- 6. TRIGGER: seed automático al crear classroom
-- ============================================================
create or replace function public.trigger_seed_behaviors()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_behaviors(new.id);
  return new;
end;
$$;

drop trigger if exists classrooms_seed_behaviors on public.classrooms;
create trigger classrooms_seed_behaviors
  after insert on public.classrooms
  for each row execute function public.trigger_seed_behaviors();

-- Aplicar a classrooms ya existentes sin conductas
do $$
declare
  c record;
begin
  for c in select id from public.classrooms loop
    if not exists (select 1 from public.behaviors where classroom_id = c.id) then
      perform public.seed_default_behaviors(c.id);
    end if;
  end loop;
end $$;


-- ============================================================
-- 7. FUNCIÓN: generate_teams (auto-formar grupos)
-- ============================================================
-- Borra los equipos previos y genera nuevos.
-- Cada equipo tendrá al menos un alumno de cada hero_class.
-- El número de equipos = min(count(sorgina), count(lamia), count(jentila)).
-- Los alumnos extra se distribuyen round-robin entre los equipos.
-- ============================================================

create or replace function public.generate_teams(p_classroom_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_count_sorgina integer;
  v_count_lamia integer;
  v_count_jentila integer;
  v_num_teams integer;
  v_team_ids uuid[];
  v_new_id uuid;
  v_idx integer;
  v_student record;
begin
  -- Contar alumnos por clase
  select count(*) into v_count_sorgina from public.students
    where classroom_id = p_classroom_id and hero_class = 'sorgina';
  select count(*) into v_count_lamia from public.students
    where classroom_id = p_classroom_id and hero_class = 'lamia';
  select count(*) into v_count_jentila from public.students
    where classroom_id = p_classroom_id and hero_class = 'jentila';

  v_num_teams := least(v_count_sorgina, v_count_lamia, v_count_jentila);

  if v_num_teams < 1 then
    return jsonb_build_object(
      'success', false,
      'error', 'Ezin dira taldeak sortu: gutxienez sorgina, lamia eta jentila bana behar dira.'
    );
  end if;

  -- Borrar equipos previos
  delete from public.teams where classroom_id = p_classroom_id;

  -- Crear nuevos equipos vacíos
  v_team_ids := array[]::uuid[];
  for v_idx in 1..v_num_teams loop
    insert into public.teams (classroom_id, name, position)
    values (p_classroom_id, 'Taldea ' || v_idx, v_idx)
    returning id into v_new_id;
    v_team_ids := array_append(v_team_ids, v_new_id);
  end loop;

  -- Repartir un alumno de cada clase por equipo (1 ronda inicial)
  v_idx := 1;
  for v_student in
    select id from public.students
    where classroom_id = p_classroom_id and hero_class = 'sorgina'
    order by random()
    limit v_num_teams
  loop
    insert into public.team_members (team_id, student_id)
    values (v_team_ids[v_idx], v_student.id)
    on conflict do nothing;
    v_idx := v_idx + 1;
  end loop;

  v_idx := 1;
  for v_student in
    select id from public.students
    where classroom_id = p_classroom_id and hero_class = 'lamia'
    order by random()
    limit v_num_teams
  loop
    insert into public.team_members (team_id, student_id)
    values (v_team_ids[v_idx], v_student.id)
    on conflict do nothing;
    v_idx := v_idx + 1;
  end loop;

  v_idx := 1;
  for v_student in
    select id from public.students
    where classroom_id = p_classroom_id and hero_class = 'jentila'
    order by random()
    limit v_num_teams
  loop
    insert into public.team_members (team_id, student_id)
    values (v_team_ids[v_idx], v_student.id)
    on conflict do nothing;
    v_idx := v_idx + 1;
  end loop;

  -- Repartir el resto round-robin entre los equipos
  v_idx := 1;
  for v_student in
    select s.id
    from public.students s
    where s.classroom_id = p_classroom_id
      and not exists (select 1 from public.team_members tm where tm.student_id = s.id)
    order by random()
  loop
    insert into public.team_members (team_id, student_id)
    values (v_team_ids[v_idx], v_student.id)
    on conflict do nothing;
    v_idx := v_idx + 1;
    if v_idx > v_num_teams then
      v_idx := 1;
    end if;
  end loop;

  return jsonb_build_object('success', true, 'num_teams', v_num_teams);
end;
$$;

comment on function public.generate_teams is 'Auto-genera taldeak garantizando 1 sorgina + 1 lamia + 1 jentila por talde.';


-- ============================================================
-- 8. UPDATE: get_student_dashboard (incluye team + powers usados)
-- ============================================================
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

  -- Classroom
  select to_jsonb(c.*) into v_classroom
  from public.classrooms c
  where id = v_classroom_id;

  -- Ranking
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'avatar', avatar,
      'avatar_config', avatar_config,
      'hero_class', hero_class,
      'xp', xp,
      'hearts', hearts,
      'max_hearts', max_hearts
    )
    order by xp desc, full_name asc
  ), '[]'::jsonb)
    into v_ranking
  from public.students
  where classroom_id = v_classroom_id;

  -- Posición
  select count(*) + 1 into v_position
  from public.students s2
  where s2.classroom_id = v_classroom_id
    and (s2.xp > (v_student->>'xp')::integer
      or (s2.xp = (v_student->>'xp')::integer
        and s2.full_name < (v_student->>'full_name')::text));

  -- Team del alumno (si tiene)
  select jsonb_build_object(
    'id', t.id,
    'name', t.name,
    'position', t.position,
    'members', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'full_name', s.full_name,
        'hero_class', s.hero_class,
        'avatar_config', s.avatar_config,
        'xp', s.xp
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

  -- Power usages recientes (top 10)
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'power_id', power_id,
      'mana_cost', mana_cost,
      'used_at', used_at
    )
    order by used_at desc
  ), '[]'::jsonb)
    into v_power_usages
  from (
    select * from public.power_usages
    where student_id = p_student_id
    order by used_at desc
    limit 10
  ) sub;

  -- Activities
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'activity_type', activity_type,
      'outcome', outcome,
      'xp_delta', xp_delta,
      'hearts_delta', hearts_delta,
      'metadata', metadata,
      'created_at', created_at,
      'is_personal', (affected_student_ids is not null),
      'affected_count', case
        when affected_student_ids is null then null
        else array_length(affected_student_ids, 1)
      end
    )
    order by created_at desc
  ), '[]'::jsonb)
    into v_activities
  from (
    select *
    from public.activities
    where classroom_id = v_classroom_id
      and (
        affected_student_ids is null
        or p_student_id = any(affected_student_ids)
      )
    order by created_at desc
    limit 25
  ) sub;

  return jsonb_build_object(
    'student', v_student,
    'classroom', v_classroom,
    'ranking', v_ranking,
    'position', v_position,
    'team', v_team,
    'power_usages', v_power_usages,
    'activities', v_activities
  );
end;
$$;


-- ============================================================
-- 9. RPC: use_power (descontar mana + registrar uso + activity)
-- ============================================================
create or replace function public.use_power(
  p_student_id uuid,
  p_power_id text,
  p_mana_cost integer,
  p_power_name text
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_current_mana integer;
begin
  select classroom_id, mana into v_classroom_id, v_current_mana
  from public.students where id = p_student_id;

  if v_classroom_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikaslea ez da aurkitu.');
  end if;

  if v_current_mana < p_mana_cost then
    return jsonb_build_object('success', false, 'error', 'Mana nahikorik ez.');
  end if;

  -- Descontar mana
  update public.students
  set mana = mana - p_mana_cost, updated_at = now()
  where id = p_student_id;

  -- Registrar uso
  insert into public.power_usages (student_id, power_id, mana_cost)
  values (p_student_id, p_power_id, p_mana_cost);

  -- Registrar actividad individual
  insert into public.activities (
    classroom_id, activity_type, outcome, xp_delta, hearts_delta, metadata, affected_student_ids
  ) values (
    v_classroom_id, 'power_used', 'neutral', 0, 0,
    jsonb_build_object('power_id', p_power_id, 'power_name', p_power_name, 'mana_cost', p_mana_cost),
    array[p_student_id]
  );

  return jsonb_build_object('success', true);
end;
$$;
