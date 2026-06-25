-- ============================================================
-- PARCHE para missions.sql ya ejecutado.
-- Mejora ensure_start_node: si no hay nodo marcado is_start=true,
-- usa el nodo más antiguo como inicial. Y añade idempotencia.
-- EJECUTAR EN SUPABASE SQL EDITOR DESPUÉS DE missions.sql.
-- ============================================================

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

  -- Buscar el nodo marcado como start
  select id into v_start_node
  from public.mission_nodes
  where mission_id = p_mission_id and is_start = true
  limit 1;

  -- Si no hay ninguno marcado, usar el más antiguo como fallback
  -- y marcarlo como start para consistencia futura
  if v_start_node is null then
    select id into v_start_node
    from public.mission_nodes
    where mission_id = p_mission_id
    order by created_at asc
    limit 1;
    if v_start_node is not null then
      update public.mission_nodes set is_start = true where id = v_start_node;
    end if;
  end if;

  if v_start_node is null then return; end if;

  insert into public.mission_progress(student_id, mission_id, node_id, status)
  values (p_student_id, p_mission_id, v_start_node, 'available')
  on conflict (student_id, node_id) do nothing;
end;
$$;
