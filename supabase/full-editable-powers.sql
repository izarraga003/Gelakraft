-- ============================================================
-- GELAKRAFT · sync mana / boterea fully editable
-- ============================================================
-- 1) apply_weekly_grants_for_classroom: aplica grants a todos los alumnos
--    del aula (para que el profe vea valores sincronizados)
-- 2) Amplía power_overrides con name, description, level_required, icon
--    para que el profesor pueda editar todo el poder.
-- 3) Re-define list_overrides_for_classroom y get_power_effective para
--    devolver/usar los nuevos campos.
-- ============================================================

-- 1) Grants para classroom entero
create or replace function public.apply_weekly_grants_for_classroom(p_classroom_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_student record;
begin
  for v_student in
    select id from public.students where classroom_id = p_classroom_id
  loop
    perform public.apply_weekly_grants(v_student.id);
  end loop;
end;
$$;

comment on function public.apply_weekly_grants_for_classroom is
  'Aplica los grants semanales pendientes a TODOS los alumnos del aula. Llamar al cargar el panel del profesor para sincronización.';


-- 2) Ampliar power_overrides
alter table public.power_overrides
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists level_required integer check (level_required is null or level_required between 1 and 99),
  add column if not exists icon text;


-- 3) Re-definir list_overrides_for_classroom con los nuevos campos
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
      'mana_cost', mana_cost,
      'name', name,
      'description', description,
      'level_required', level_required,
      'icon', icon
    )
  ), '[]'::jsonb) into v_result
  from public.power_overrides
  where classroom_id = p_classroom_id;
  return v_result;
end;
$$;


-- 4) Re-definir get_power_effective también con los nuevos campos
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
  v_o record;
begin
  select classroom_id into v_classroom_id
    from public.students where id = p_student_id;
  if v_classroom_id is null then
    return jsonb_build_object('found', false);
  end if;

  select mode, mana_cost, name, description, level_required, icon into v_o
    from public.power_overrides
    where classroom_id = v_classroom_id and power_id = p_power_id;

  return jsonb_build_object(
    'found', true,
    'classroom_id', v_classroom_id,
    'override_mode', v_o.mode,
    'override_mana_cost', v_o.mana_cost,
    'override_name', v_o.name,
    'override_description', v_o.description,
    'override_level_required', v_o.level_required,
    'override_icon', v_o.icon
  );
end;
$$;
