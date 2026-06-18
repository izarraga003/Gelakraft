-- ============================================================
-- GELAKRAFT · FIX: get_power_effective
-- ============================================================
-- Resuelve modo y coste efectivos de un poder para un alumno concreto,
-- bypassando RLS (SECURITY DEFINER). Necesario porque el alumno se
-- autentica con iron-session, no con Supabase auth, así que un SELECT
-- directo a `students` y `power_overrides` devuelve vacío y aparece
-- "Ikaslea ez da aurkitu" al intentar usar un boterea.
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
