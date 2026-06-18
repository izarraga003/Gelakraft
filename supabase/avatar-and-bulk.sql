-- ============================================================
-- GELAKRAFT · ESKEMA OSAGARRIA: AVATAR ETA AJUSTE INDIBIDUALAK
-- ============================================================
-- 1. Avatar como JSONB (en lugar de un solo emoji string)
-- 2. max_hearts default 10, max_mana default 5
-- 3. affected_student_ids en activities (para actividades individuales)
-- 4. Funciones SQL nuevas: adjust_students (individual o bulk)
-- ============================================================


-- ============================================================
-- 1. AVATAR_CONFIG JSONB
-- ============================================================
-- Mantenemos la columna `avatar` (emoji legacy) por compatibilidad,
-- pero el frontend usará `avatar_config`.

alter table public.students
  add column if not exists avatar_config jsonb not null default '{}'::jsonb;

-- Asignar configs aleatorios para alumnos existentes que no lo tengan
update public.students
set avatar_config = jsonb_build_object(
  'bgColor', (array['urrea', 'sutea', 'iluntze', 'sorgina', 'lamia', 'pago'])[1 + floor(random() * 6)::int],
  'skinTone', (array['light', 'medium', 'tan', 'dark'])[1 + floor(random() * 4)::int],
  'hairStyle', (array['short', 'wavy', 'long', 'bun', 'curly'])[1 + floor(random() * 5)::int],
  'hairColor', (array['black', 'brown', 'blonde', 'red', 'grey'])[1 + floor(random() * 5)::int],
  'eyes', (array['default', 'wide', 'cheerful'])[1 + floor(random() * 3)::int],
  'mouth', (array['smile', 'neutral', 'open'])[1 + floor(random() * 3)::int],
  'outfit', (array['tunic', 'robe', 'vest'])[1 + floor(random() * 3)::int],
  'accessory', null
)
where avatar_config = '{}'::jsonb;


-- ============================================================
-- 2. NEW DEFAULTS: max_hearts=10, max_mana=5
-- ============================================================
alter table public.students
  alter column max_hearts set default 10;

alter table public.students
  alter column max_mana set default 5;

-- Aplicar a todos los alumnos existentes
update public.students
set
  max_hearts = 10,
  max_mana = 5,
  hearts = least(10, greatest(hearts, 0)),
  mana = least(5, greatest(mana, 0));


-- ============================================================
-- 3. ACTIVIDADES INDIVIDUALES — affected_student_ids
-- ============================================================
-- Si es NULL → afecta a toda la classroom (de aula)
-- Si tiene IDs → solo afecta a esos alumnos (individual / bulk)

alter table public.activities
  add column if not exists affected_student_ids uuid[] default null;

-- Ampliar el check de activity_type para incluir 'adjustment' (cambios manuales del profesor)
alter table public.activities
  drop constraint if exists activities_activity_type_check;

alter table public.activities
  add constraint activities_activity_type_check
  check (activity_type in (
    'battle', 'silence', 'event', 'reward', 'adjustment'
  ));


-- ============================================================
-- 4. NUEVA FUNCIÓN: adjust_students (individual o bulk)
-- ============================================================
-- Aplica xp_delta y hearts_delta a UN conjunto específico de alumnos.
-- También registra la actividad con affected_student_ids.
-- ============================================================

create or replace function public.adjust_students(
  p_classroom_id uuid,
  p_student_ids uuid[],
  p_xp_delta integer,
  p_hearts_delta integer,
  p_note text default null
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_outcome text;
begin
  -- Aplicar stats a los alumnos seleccionados (solo si pertenecen a la classroom)
  update public.students
  set
    xp = greatest(0, xp + p_xp_delta),
    hearts = greatest(0, least(max_hearts, hearts + p_hearts_delta)),
    updated_at = now()
  where id = any(p_student_ids)
    and classroom_id = p_classroom_id;

  -- Outcome semántico
  if p_xp_delta > 0 or p_hearts_delta > 0 then
    v_outcome := 'success';
  elsif p_xp_delta < 0 or p_hearts_delta < 0 then
    v_outcome := 'failure';
  else
    v_outcome := 'neutral';
  end if;

  -- Registrar en historial
  insert into public.activities (
    classroom_id, activity_type, outcome, xp_delta, hearts_delta, metadata, affected_student_ids
  ) values (
    p_classroom_id, 'adjustment', v_outcome, p_xp_delta, p_hearts_delta,
    jsonb_build_object('note', coalesce(p_note, '')),
    p_student_ids
  );
end;
$$;

comment on function public.adjust_students is
  'Aplica XP/hearts a alumnos concretos y registra la actividad individual.';


-- ============================================================
-- 5. UPDATE: get_student_dashboard (incluye actividades individuales)
-- ============================================================
-- Modifica la función existente para que también incluya actividades
-- individuales que afectan al alumno (con affected_student_ids).
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
  -- Datos del alumno (sin password)
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

  -- Posición del alumno
  select count(*) + 1 into v_position
  from public.students s2
  where s2.classroom_id = v_classroom_id
    and (s2.xp > (v_student->>'xp')::integer
      or (s2.xp = (v_student->>'xp')::integer
        and s2.full_name < (v_student->>'full_name')::text));

  -- Actividades que afectan al alumno:
  -- - Las de aula (affected_student_ids is null)
  -- - Las individuales donde él aparece en affected_student_ids
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
    'activities', v_activities
  );
end;
$$;


-- ============================================================
-- 6. UPDATE: update_student_avatar acepta config JSONB
-- ============================================================
create or replace function public.update_student_avatar(
  p_student_id uuid,
  p_avatar_config jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_avatar_config is null then
    raise exception 'Avatar config baliogabea';
  end if;

  update public.students
  set
    avatar_config = p_avatar_config,
    updated_at = now()
  where id = p_student_id;
end;
$$;
