-- ============================================================
-- PATCH v5: añadir mission_id a mission_progress + fix RPCs
-- EJECUTAR EN SUPABASE SQL EDITOR (después de missions.sql, v2, v3).
-- ============================================================

-- 1) Añadir columna mission_id (idempotente)
alter table public.mission_progress
  add column if not exists mission_id uuid;

-- 2) Backfill desde mission_nodes
update public.mission_progress mp
set mission_id = n.mission_id
from public.mission_nodes n
where n.id = mp.node_id and mp.mission_id is null;

-- 3) Limpieza por si quedaron progresos huérfanos
delete from public.mission_progress where mission_id is null;

-- 4) NOT NULL y FK
alter table public.mission_progress
  alter column mission_id set not null;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mission_progress_mission_id_fkey'
  ) then
    alter table public.mission_progress
      add constraint mission_progress_mission_id_fkey
      foreign key (mission_id) references public.missions(id) on delete cascade;
  end if;
end $$;

create index if not exists idx_mp_mission_id on public.mission_progress(mission_id);
create index if not exists idx_mp_student_mission on public.mission_progress(student_id, mission_id);

-- 5) Trigger: rellenar mission_id automáticamente desde el nodo en INSERT
create or replace function public._fill_mp_mission_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.mission_id is null then
    select mission_id into new.mission_id
    from public.mission_nodes where id = new.node_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_fill_mp_mid on public.mission_progress;
create trigger trg_fill_mp_mid
  before insert on public.mission_progress
  for each row execute function public._fill_mp_mission_id();

-- 6) Reescribir get_mission_classroom_progress (más robusto)
create or replace function public.get_mission_classroom_progress(p_mission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_teacher_id uuid;
  v_total_nodes int;
  v_result jsonb;
begin
  select classroom_id into v_classroom_id from public.missions where id = p_mission_id;
  if v_classroom_id is null then
    return '[]'::jsonb;
  end if;

  select teacher_id into v_teacher_id from public.classrooms where id = v_classroom_id;
  if v_teacher_id is null or v_teacher_id != auth.uid() then
    return '[]'::jsonb;
  end if;

  select count(*) into v_total_nodes from public.mission_nodes where mission_id = p_mission_id;

  select coalesce(jsonb_agg(row order by row->>'student_name'), '[]'::jsonb) into v_result
  from (
    select jsonb_build_object(
      'student_id', s.id,
      'student_name', s.full_name,
      'total_nodes', v_total_nodes,
      'completed', coalesce((
        select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'completed'
      ), 0),
      'pending_review', coalesce((
        select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'pending_review'
      ), 0),
      'failed', coalesce((
        select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'failed'
      ), 0),
      'available', coalesce((
        select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'available'
      ), 0),
      'fully_completed', exists(
        select 1 from public.mission_completions mc
        where mc.student_id = s.id and mc.mission_id = p_mission_id
      ),
      'current_node_title', (
        select n.title from public.mission_progress mp
        join public.mission_nodes n on n.id = mp.node_id
        where mp.student_id = s.id and mp.mission_id = p_mission_id
          and mp.status in ('available', 'pending_review')
        order by mp.submitted_at desc nulls last
        limit 1
      )
    ) as row
    from public.students s
    where s.classroom_id = v_classroom_id
  ) sub;

  return v_result;
end;
$$;

-- 7) Reescribir check_mission_completion (mp.mission_id ya existe)
create or replace function public.check_mission_completion(
  p_student_id uuid,
  p_mission_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_completed int;
  v_already_done boolean;
  v_final_xp int;
  v_final_hearts int;
  v_final_mana int;
  v_mission_name text;
begin
  select exists(select 1 from public.mission_completions
    where student_id = p_student_id and mission_id = p_mission_id)
    into v_already_done;
  if v_already_done then
    return jsonb_build_object('completed', false, 'already', true);
  end if;

  select count(*) into v_total
  from public.mission_nodes where mission_id = p_mission_id;
  if v_total = 0 then
    return jsonb_build_object('completed', false, 'no_nodes', true);
  end if;

  select count(*) into v_completed
  from public.mission_progress mp
  where mp.student_id = p_student_id
    and mp.mission_id = p_mission_id
    and mp.status = 'completed';

  if v_completed < v_total then
    return jsonb_build_object('completed', false, 'progress', v_completed, 'total', v_total);
  end if;

  select final_xp_reward, final_hearts_reward, final_mana_reward, name
  into v_final_xp, v_final_hearts, v_final_mana, v_mission_name
  from public.missions where id = p_mission_id;

  update public.students
  set xp = greatest(0, xp + v_final_xp),
      hearts = greatest(0, least(max_hearts, hearts + v_final_hearts)),
      mana = greatest(0, least(max_mana, mana + v_final_mana))
  where id = p_student_id;

  insert into public.mission_completions(student_id, mission_id,
    final_xp_granted, final_hearts_granted, final_mana_granted)
  values (p_student_id, p_mission_id, v_final_xp, v_final_hearts, v_final_mana);

  return jsonb_build_object(
    'completed', true,
    'mission_name', v_mission_name,
    'final_xp', v_final_xp,
    'final_hearts', v_final_hearts,
    'final_mana', v_final_mana
  );
end;
$$;

-- 8) Sanity check (no muta, solo informa)
-- Esto debe devolver el número total de mission_progress que tienes
do $$
declare
  v_n int;
  v_null int;
begin
  select count(*) into v_n from public.mission_progress;
  select count(*) into v_null from public.mission_progress where mission_id is null;
  raise notice 'mission_progress: % rows total, % rows con mission_id null', v_n, v_null;
end $$;
