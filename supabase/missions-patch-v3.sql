-- ============================================================
-- PARCHE v3 para missions: completions + final reward + progreso aula
-- EJECUTAR EN SUPABASE SQL EDITOR (después de missions.sql y v2).
-- ============================================================

-- Tabla: marcar misión completada por alumno
create table if not exists public.mission_completions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  completed_at timestamptz not null default now(),
  final_xp_granted int not null default 0,
  final_hearts_granted int not null default 0,
  final_mana_granted int not null default 0,
  unique(student_id, mission_id)
);

create index if not exists idx_mc_student on public.mission_completions(student_id);
create index if not exists idx_mc_mission on public.mission_completions(mission_id);

alter table public.mission_completions enable row level security;
drop policy if exists mc_teacher_all on public.mission_completions;
create policy mc_teacher_all on public.mission_completions
  for all using (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_completions.mission_id and c.teacher_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_completions.mission_id and c.teacher_id = auth.uid()
    )
  );

-- ============================================================
-- check_mission_completion: detectar y aplicar recompensa final
-- ============================================================
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

  select count(*) into v_total from public.mission_nodes where mission_id = p_mission_id;
  if v_total = 0 then
    return jsonb_build_object('completed', false, 'no_nodes', true);
  end if;

  select count(*) into v_completed
  from public.mission_progress
  where student_id = p_student_id
    and mission_id = p_mission_id
    and status = 'completed';

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

-- ============================================================
-- submit_mission_node v2: dispara check_mission_completion
-- ============================================================
create or replace function public.submit_mission_node(
  p_student_id uuid,
  p_node_id uuid,
  p_submission_text text default ''
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_node record;
  v_mission_id uuid;
  v_validation text;
  v_status text;
  v_new_status text;
  v_completion jsonb;
  v_unlocked jsonb;
begin
  select n.*, n.mission_id as mid into v_node
  from public.mission_nodes n where n.id = p_node_id;
  if v_node.id is null then
    return jsonb_build_object('success', false, 'error', 'Nodoa ez da existitzen.');
  end if;
  v_mission_id := v_node.mid;
  v_validation := v_node.validation_type;

  select status into v_status
  from public.mission_progress
  where student_id = p_student_id and node_id = p_node_id;
  if v_status is null or v_status != 'available' then
    return jsonb_build_object('success', false, 'error', 'Ezin duzu nodo hau entregatu oraintxe.');
  end if;

  if v_validation = 'auto' then
    v_new_status := 'completed';
    update public.students
    set xp = greatest(0, xp + v_node.xp_reward),
        hearts = greatest(0, least(max_hearts, hearts + v_node.hearts_delta)),
        mana = greatest(0, least(max_mana, mana + v_node.mana_reward))
    where id = p_student_id;
    perform public._unlock_next_nodes(p_student_id, p_node_id, 'success');
  else
    v_new_status := 'pending_review';
  end if;

  update public.mission_progress
  set status = v_new_status,
      submission_text = coalesce(p_submission_text, ''),
      submitted_at = now()
  where student_id = p_student_id and node_id = p_node_id;

  -- Nodos recién desbloqueados (para notificar al alumno)
  if v_new_status = 'completed' then
    select coalesce(jsonb_agg(jsonb_build_object('id', n.id, 'title', n.title)), '[]'::jsonb)
    into v_unlocked
    from public.mission_nodes n
    where n.id in (
      select to_node_id from public.mission_edges
      where from_node_id = p_node_id
        and (condition = 'always' or condition = 'success')
    );
  end if;

  v_completion := null;
  if v_new_status = 'completed' then
    v_completion := public.check_mission_completion(p_student_id, v_mission_id);
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'completion', v_completion,
    'unlocked', coalesce(v_unlocked, '[]'::jsonb),
    'rewards', jsonb_build_object(
      'xp', case when v_new_status = 'completed' then v_node.xp_reward else 0 end,
      'hearts', case when v_new_status = 'completed' then v_node.hearts_delta else 0 end,
      'mana', case when v_new_status = 'completed' then v_node.mana_reward else 0 end
    )
  );
end;
$$;

-- ============================================================
-- review_mission_node v2: idem
-- ============================================================
create or replace function public.review_mission_node(
  p_node_id uuid,
  p_student_id uuid,
  p_outcome text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_node record;
  v_classroom_id uuid;
  v_teacher_id uuid;
  v_new_status text;
  v_completion jsonb;
begin
  select n.*, m.classroom_id into v_node
  from public.mission_nodes n
  join public.missions m on m.id = n.mission_id
  where n.id = p_node_id;
  if v_node.id is null then
    return jsonb_build_object('success', false, 'error', 'Nodoa ez da existitzen.');
  end if;
  v_classroom_id := v_node.classroom_id;
  select teacher_id into v_teacher_id from public.classrooms where id = v_classroom_id;
  if v_teacher_id != auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Ez duzu baimenik.');
  end if;

  if p_outcome = 'success' then
    v_new_status := 'completed';
    update public.students
    set xp = greatest(0, xp + v_node.xp_reward),
        hearts = greatest(0, least(max_hearts, hearts + v_node.hearts_delta)),
        mana = greatest(0, least(max_mana, mana + v_node.mana_reward))
    where id = p_student_id;
    perform public._unlock_next_nodes(p_student_id, p_node_id, 'success');
  else
    v_new_status := 'failed';
    if v_node.hearts_penalty > 0 then
      update public.students
      set hearts = greatest(0, hearts - v_node.hearts_penalty)
      where id = p_student_id;
    end if;
    perform public._unlock_next_nodes(p_student_id, p_node_id, 'failure');
  end if;

  update public.mission_progress
  set status = v_new_status, reviewed_at = now()
  where student_id = p_student_id and node_id = p_node_id;

  v_completion := null;
  if v_new_status = 'completed' then
    v_completion := public.check_mission_completion(p_student_id, v_node.mission_id);
  end if;

  return jsonb_build_object(
    'success', true,
    'status', v_new_status,
    'completion', v_completion
  );
end;
$$;

-- ============================================================
-- Progreso del aula en una misión
-- ============================================================
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
      'completed', coalesce((select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'completed'), 0),
      'pending_review', coalesce((select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'pending_review'), 0),
      'failed', coalesce((select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'failed'), 0),
      'available', coalesce((select count(*)::int from public.mission_progress mp
        where mp.student_id = s.id and mp.mission_id = p_mission_id and mp.status = 'available'), 0),
      'fully_completed', exists(select 1 from public.mission_completions mc
        where mc.student_id = s.id and mc.mission_id = p_mission_id),
      'current_node_title', (
        select n.title from public.mission_progress mp
        join public.mission_nodes n on n.id = mp.node_id
        where mp.student_id = s.id and mp.mission_id = p_mission_id
          and mp.status in ('available', 'pending_review')
        order by mp.created_at desc
        limit 1
      )
    ) as row
    from public.students s
    where s.classroom_id = v_classroom_id
  ) sub;

  return v_result;
end;
$$;
