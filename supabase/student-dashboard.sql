-- ============================================================
-- GELAKRAFT · ESKEMA OSAGARRIA: IKASLEAREN PANELA
-- ============================================================
-- 1. Añade columna `avatar` a students
-- 2. Crea tabla `activities` (historial de batallas y retos)
-- 3. Función RPC `get_student_dashboard` (todo el panel en una llamada)
-- 4. Función RPC `update_student_avatar` (cambiar avatar)
-- 5. Función `record_activity` (registrar batalla/reto)
--
-- CÓMO EJECUTAR:
--   1. Supabase: SQL Editor → New query
--   2. Pegar este script y Run
-- ============================================================

-- ============================================================
-- 1. COLUMNA AVATAR EN STUDENTS
-- ============================================================
alter table public.students
  add column if not exists avatar text not null default '🌙';

-- Asignar avatar aleatorio a alumnos existentes
update public.students
set avatar = (
  array[
    '🐉','🦊','🐺','🦅','🦉','🐴','🐱','🐰','🦋','🐝',
    '🌙','⭐','🔥','⚡','🌊','🍃','🌳','🌺','🍄','⛰️',
    '💎','🔮','⚔️','🛡️','🪄','📜','🗝️','🏰','⚱️','🌀'
  ]
)[floor(random() * 30 + 1)::int]
where avatar = '🌙' and created_at < now() - interval '1 second';


-- ============================================================
-- 2. TABLA ACTIVITIES (historial)
-- ============================================================
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  activity_type text not null check (activity_type in ('battle', 'silence', 'event', 'reward')),
  outcome text not null check (outcome in ('victory', 'defeat', 'success', 'failure', 'neutral')),
  xp_delta integer not null default 0,
  hearts_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.activities is 'Historial de batallas, retos y eventos de cada ikasgela';

create index if not exists activities_classroom_id_created_at_idx
  on public.activities(classroom_id, created_at desc);

-- RLS: el profesor ve solo las de sus classrooms
alter table public.activities enable row level security;

drop policy if exists "activities_select_own" on public.activities;
create policy "activities_select_own"
  on public.activities for select
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = activities.classroom_id and c.teacher_id = auth.uid()
    )
  );

drop policy if exists "activities_insert_own" on public.activities;
create policy "activities_insert_own"
  on public.activities for insert
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = activities.classroom_id and c.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- 3. RPC: get_student_dashboard
-- ============================================================
-- Devuelve TODO el panel del alumno en una sola llamada:
--   { student, classroom, ranking, activities }
-- SECURITY DEFINER porque los alumnos no tienen sesión Supabase.
-- El server action que llama a esto valida primero la sesión
-- iron-session contra el student_id solicitado.
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
  v_classroom_id uuid;
  v_position integer;
begin
  -- Datos del alumno
  select to_jsonb(s.*) - 'password_hash' - 'password_plain'
    into v_student
  from public.students s
  where id = p_student_id;

  if v_student is null then
    raise exception 'Student not found';
  end if;

  v_classroom_id := (v_student->>'classroom_id')::uuid;

  -- Datos de la classroom
  select to_jsonb(c.*) into v_classroom
  from public.classrooms c
  where id = v_classroom_id;

  -- Ranking del classroom (todos, ordenados por XP)
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'avatar', avatar,
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

  -- Posición del alumno actual en el ranking
  select count(*) + 1 into v_position
  from public.students s2
  where s2.classroom_id = v_classroom_id
    and (s2.xp > (v_student->>'xp')::integer
      or (s2.xp = (v_student->>'xp')::integer
        and s2.full_name < (v_student->>'full_name')::text));

  -- Actividades recientes (top 15)
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'activity_type', activity_type,
      'outcome', outcome,
      'xp_delta', xp_delta,
      'hearts_delta', hearts_delta,
      'metadata', metadata,
      'created_at', created_at
    )
    order by created_at desc
  ), '[]'::jsonb)
    into v_activities
  from (
    select *
    from public.activities
    where classroom_id = v_classroom_id
    order by created_at desc
    limit 15
  ) sub;

  return jsonb_build_object(
    'student', v_student,
    'classroom', v_classroom,
    'ranking', v_ranking,
    'position', v_position,
    'activities', v_activities
  );
end;
$$;

comment on function public.get_student_dashboard is
  'Devuelve el panel completo del alumno en una llamada (security definer)';


-- ============================================================
-- 4. RPC: update_student_avatar
-- ============================================================
create or replace function public.update_student_avatar(
  p_student_id uuid,
  p_avatar text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_avatar is null or length(p_avatar) > 10 then
    raise exception 'Avatar baliogabea';
  end if;

  update public.students
  set avatar = p_avatar, updated_at = now()
  where id = p_student_id;
end;
$$;

comment on function public.update_student_avatar is
  'Actualiza el avatar de un alumno (security definer, validar en server action)';


-- ============================================================
-- 5. RPC: record_activity
-- ============================================================
-- Una sola operación atómica que:
--  1. Aplica xp_delta y hearts_delta a todos los alumnos de la classroom
--  2. Registra una entrada en activities
--
-- Usada desde server actions de battle e isiltasun-erronka.
-- SECURITY INVOKER → respeta RLS del profesor.
-- ============================================================

create or replace function public.record_activity(
  p_classroom_id uuid,
  p_activity_type text,
  p_outcome text,
  p_xp_delta integer,
  p_hearts_delta integer,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- Aplicar stats a alumnos
  update public.students
  set
    xp = greatest(0, xp + p_xp_delta),
    hearts = greatest(0, least(max_hearts, hearts + p_hearts_delta)),
    updated_at = now()
  where classroom_id = p_classroom_id;

  -- Registrar entrada en historial
  insert into public.activities (
    classroom_id, activity_type, outcome, xp_delta, hearts_delta, metadata
  ) values (
    p_classroom_id, p_activity_type, p_outcome, p_xp_delta, p_hearts_delta, p_metadata
  );
end;
$$;

comment on function public.record_activity is
  'Aplica stats a alumnos y registra en activities en una sola transacción';
