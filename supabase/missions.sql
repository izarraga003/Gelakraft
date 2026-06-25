-- ============================================================
-- GELAKRAFT · MISIOAK (sistema de misiones / mapa de aventura)
-- ============================================================
-- 4 tablas:
--   missions             → la misión (nombre, mapa, recompensa final)
--   mission_nodes        → objetivos/nodos posicionados en el mapa
--   mission_edges        → conexiones entre nodos (incluye condition)
--   mission_progress     → progreso de cada alumno en cada nodo
-- ============================================================

create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  name text not null,
  description text default '',
  background_id text not null default 'anboto',
  is_active boolean not null default true,
  final_xp_reward int not null default 0,
  final_hearts_reward int not null default 0,
  final_mana_reward int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_missions_classroom on public.missions(classroom_id);

create table if not exists public.mission_nodes (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  title text not null,
  description text default '',
  -- Posición porcentual en el mapa (0–100)
  position_x numeric not null default 50 check (position_x >= 0 and position_x <= 100),
  position_y numeric not null default 50 check (position_y >= 0 and position_y <= 100),
  -- Contenido
  content_type text not null default 'text' check (content_type in ('text','pdf','image','youtube','link')),
  content_url text default '',
  content_text text default '',
  -- Validación
  validation_type text not null default 'auto' check (validation_type in ('auto','manual')),
  -- Recompensas individuales (al completar)
  xp_reward int not null default 10,
  hearts_delta int not null default 0,
  mana_reward int not null default 0,
  -- Penalización si falla
  hearts_penalty int not null default 0,
  -- Nodo inicial (true para el primer nodo de la misión)
  is_start boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_mission_nodes_mission on public.mission_nodes(mission_id);

create table if not exists public.mission_edges (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  from_node_id uuid not null references public.mission_nodes(id) on delete cascade,
  to_node_id uuid not null references public.mission_nodes(id) on delete cascade,
  condition text not null default 'always' check (condition in ('always','success','failure')),
  created_at timestamptz not null default now(),
  unique(from_node_id, to_node_id, condition)
);

create index if not exists idx_mission_edges_mission on public.mission_edges(mission_id);
create index if not exists idx_mission_edges_from on public.mission_edges(from_node_id);

create table if not exists public.mission_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  node_id uuid not null references public.mission_nodes(id) on delete cascade,
  status text not null default 'available' check (status in ('available','pending_review','completed','failed')),
  submission_text text default '',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(student_id, node_id)
);

create index if not exists idx_mission_progress_student on public.mission_progress(student_id);
create index if not exists idx_mission_progress_mission on public.mission_progress(mission_id);
create index if not exists idx_mission_progress_status on public.mission_progress(status);

-- ============================================================
-- RLS: solo el profesor del aula puede ver/modificar la misión.
-- Los alumnos NO usan RLS directo (acceden vía RPC con sesión).
-- ============================================================
alter table public.missions enable row level security;
alter table public.mission_nodes enable row level security;
alter table public.mission_edges enable row level security;
alter table public.mission_progress enable row level security;

-- Limpiar políticas previas si se ejecuta varias veces
drop policy if exists missions_owner on public.missions;
drop policy if exists mission_nodes_owner on public.mission_nodes;
drop policy if exists mission_edges_owner on public.mission_edges;
drop policy if exists mission_progress_owner on public.mission_progress;

create policy missions_owner on public.missions
  for all
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = missions.classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = missions.classroom_id and c.teacher_id = auth.uid()
    )
  );

create policy mission_nodes_owner on public.mission_nodes
  for all
  using (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_nodes.mission_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_nodes.mission_id and c.teacher_id = auth.uid()
    )
  );

create policy mission_edges_owner on public.mission_edges
  for all
  using (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_edges.mission_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_edges.mission_id and c.teacher_id = auth.uid()
    )
  );

create policy mission_progress_owner on public.mission_progress
  for all
  using (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_progress.mission_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.missions m
      join public.classrooms c on c.id = m.classroom_id
      where m.id = mission_progress.mission_id and c.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- RPCs PARA ALUMNOS (security definer; verifica student_id == sesión)
-- ============================================================

-- Obtener misiones activas con nodos visibles y progreso del alumno
create or replace function public.get_student_missions(p_student_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom uuid;
  v_result jsonb;
begin
  select classroom_id into v_classroom from public.students where id = p_student_id;
  if v_classroom is null then return '[]'::jsonb; end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', m.id,
    'name', m.name,
    'description', m.description,
    'background_id', m.background_id,
    'final_xp_reward', m.final_xp_reward,
    'final_hearts_reward', m.final_hearts_reward,
    'final_mana_reward', m.final_mana_reward
  ) order by m.created_at desc), '[]'::jsonb)
  into v_result
  from public.missions m
  where m.classroom_id = v_classroom and m.is_active = true;

  return v_result;
end;
$$;

-- Obtener detalle completo de una misión PARA ALUMNO (con su progreso)
create or replace function public.get_student_mission_detail(
  p_student_id uuid,
  p_mission_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom uuid;
  v_mission_classroom uuid;
  v_mission jsonb;
  v_nodes jsonb;
  v_edges jsonb;
  v_progress jsonb;
begin
  select classroom_id into v_classroom from public.students where id = p_student_id;
  select classroom_id into v_mission_classroom from public.missions where id = p_mission_id;
  if v_classroom is null or v_classroom != v_mission_classroom then
    return null;
  end if;

  select jsonb_build_object(
    'id', id,
    'name', name,
    'description', description,
    'background_id', background_id,
    'is_active', is_active,
    'final_xp_reward', final_xp_reward,
    'final_hearts_reward', final_hearts_reward,
    'final_mana_reward', final_mana_reward
  )
  into v_mission
  from public.missions where id = p_mission_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', n.id,
    'title', n.title,
    'description', n.description,
    'position_x', n.position_x,
    'position_y', n.position_y,
    'content_type', n.content_type,
    'content_url', n.content_url,
    'content_text', n.content_text,
    'validation_type', n.validation_type,
    'xp_reward', n.xp_reward,
    'hearts_delta', n.hearts_delta,
    'mana_reward', n.mana_reward,
    'is_start', n.is_start
  )), '[]'::jsonb)
  into v_nodes
  from public.mission_nodes n
  where n.mission_id = p_mission_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'from_node_id', e.from_node_id,
    'to_node_id', e.to_node_id,
    'condition', e.condition
  )), '[]'::jsonb)
  into v_edges
  from public.mission_edges e
  where e.mission_id = p_mission_id;

  select coalesce(jsonb_agg(jsonb_build_object(
    'node_id', p.node_id,
    'status', p.status,
    'submission_text', p.submission_text,
    'submitted_at', p.submitted_at
  )), '[]'::jsonb)
  into v_progress
  from public.mission_progress p
  where p.mission_id = p_mission_id and p.student_id = p_student_id;

  return jsonb_build_object(
    'mission', v_mission,
    'nodes', v_nodes,
    'edges', v_edges,
    'progress', v_progress
  );
end;
$$;

-- Entregar un nodo (alumno)
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
begin
  -- Verificar que el nodo existe y obtener datos
  select n.*, n.mission_id as mid into v_node
  from public.mission_nodes n
  where n.id = p_node_id;

  if v_node.id is null then
    return jsonb_build_object('success', false, 'error', 'Nodoa ez da existitzen.');
  end if;

  v_mission_id := v_node.mid;
  v_validation := v_node.validation_type;

  -- Verificar que el alumno tiene este nodo "available"
  select status into v_status
  from public.mission_progress
  where student_id = p_student_id and node_id = p_node_id;

  if v_status is null or v_status != 'available' then
    return jsonb_build_object('success', false, 'error', 'Ezin duzu nodo hau entregatu oraintxe.');
  end if;

  -- Si la validación es 'auto', completamos directamente (y desbloqueamos siguientes)
  -- Si es 'manual', queda en pending_review
  if v_validation = 'auto' then
    v_new_status := 'completed';
    -- Aplicar recompensas
    update public.students
    set xp = greatest(0, xp + v_node.xp_reward),
        hearts = greatest(0, least(max_hearts, hearts + v_node.hearts_delta)),
        mana = greatest(0, least(max_mana, mana + v_node.mana_reward))
    where id = p_student_id;
    -- Desbloquear nodos siguientes
    perform public._unlock_next_nodes(p_student_id, p_node_id, 'success');
  else
    v_new_status := 'pending_review';
  end if;

  update public.mission_progress
  set status = v_new_status,
      submission_text = coalesce(p_submission_text, ''),
      submitted_at = now()
  where student_id = p_student_id and node_id = p_node_id;

  return jsonb_build_object('success', true, 'status', v_new_status);
end;
$$;

-- Helper: desbloquear los nodos siguientes según la edge correspondiente
create or replace function public._unlock_next_nodes(
  p_student_id uuid,
  p_node_id uuid,
  p_outcome text  -- 'success' o 'failure'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_edge record;
begin
  for v_edge in
    select to_node_id from public.mission_edges
    where from_node_id = p_node_id
      and (condition = 'always' or condition = p_outcome)
  loop
    insert into public.mission_progress(student_id, mission_id, node_id, status)
    select p_student_id, mission_id, v_edge.to_node_id, 'available'
    from public.mission_nodes where id = v_edge.to_node_id
    on conflict (student_id, node_id) do nothing;
  end loop;
end;
$$;

-- Revisar entrega (profesor): marcar éxito o fallo
create or replace function public.review_mission_node(
  p_node_id uuid,
  p_student_id uuid,
  p_outcome text  -- 'success' o 'failure'
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
  v_hearts_change int;
begin
  -- Verificar ownership: el llamante (auth.uid()) debe ser el profesor del aula
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
    v_hearts_change := v_node.hearts_delta;
    -- Aplicar recompensas
    update public.students
    set xp = greatest(0, xp + v_node.xp_reward),
        hearts = greatest(0, least(max_hearts, hearts + v_hearts_change)),
        mana = greatest(0, least(max_mana, mana + v_node.mana_reward))
    where id = p_student_id;
    perform public._unlock_next_nodes(p_student_id, p_node_id, 'success');
  else
    v_new_status := 'failed';
    -- Aplicar penalización (resta corazones)
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

  return jsonb_build_object('success', true, 'status', v_new_status);
end;
$$;

-- Asegurar que el alumno tiene el nodo inicial disponible al abrir la misión
create or replace function public.ensure_start_node(
  p_student_id uuid,
  p_mission_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_node uuid;
  v_classroom uuid;
  v_mission_classroom uuid;
begin
  select classroom_id into v_classroom from public.students where id = p_student_id;
  select classroom_id into v_mission_classroom from public.missions where id = p_mission_id;
  if v_classroom is null or v_classroom != v_mission_classroom then return; end if;

  select id into v_start_node
  from public.mission_nodes
  where mission_id = p_mission_id and is_start = true
  limit 1;

  if v_start_node is null then return; end if;

  insert into public.mission_progress(student_id, mission_id, node_id, status)
  values (p_student_id, p_mission_id, v_start_node, 'available')
  on conflict (student_id, node_id) do nothing;
end;
$$;
