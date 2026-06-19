-- ============================================================
-- GELAKRAFT · FIX: get_power_effective + list_overrides_for_classroom
-- ============================================================
-- 1) get_power_effective(student_id, power_id) — resuelve modo y coste
--    efectivos de un poder para un alumno concreto, bypassando RLS.
-- 2) list_overrides_for_classroom(classroom_id) — devuelve TODOS los
--    overrides del aula como JSON. SECURITY DEFINER para que el alumno
--    (iron-session) pueda leerlos al cargar su panel.
--
-- Sin esto, el alumno no veía los costes actualizados cuando el profesor
-- modificaba el coste de maná de un poder.
-- ============================================================

create or replace function public.get_power_effective(
  p_student_id uuid,
  p_power_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_override_mode text;
  v_override_cost integer;
begin
  select classroom_id into v_classroom_id
    from public.students where id = p_student_id;

  if v_classroom_id is null then
    return jsonb_build_object('found', false);
  end if;

  select mode, mana_cost into v_override_mode, v_override_cost
    from public.power_overrides
    where classroom_id = v_classroom_id and power_id = p_power_id;

  return jsonb_build_object(
    'found', true,
    'classroom_id', v_classroom_id,
    'override_mode', v_override_mode,
    'override_mana_cost', v_override_cost
  );
end;
$$;

comment on function public.get_power_effective is
  'Devuelve modo y coste efectivos de un boterea para un alumno, aplicando overrides del aula. SECURITY DEFINER para que el alumno (sin auth.uid) pueda leer.';


create or replace function public.list_overrides_for_classroom(
  p_classroom_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'power_id', power_id,
      'mode', mode,
      'mana_cost', mana_cost
    )
  ), '[]'::jsonb) into v_result
  from public.power_overrides
  where classroom_id = p_classroom_id;
  return v_result;
end;
$$;

comment on function public.list_overrides_for_classroom is
  'Devuelve todos los overrides de un aula como array JSON. SECURITY DEFINER para que el alumno pueda leerlos.';
