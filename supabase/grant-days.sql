-- ============================================================
-- GELAKRAFT · GRANT DAYS (asteko sariak egunez egun)
-- ============================================================
-- Lehen: astero N mana eta M bihotz ematen ziren astebete pasatakoan.
-- Orain: irakasleak erabakitzen du zein egunetan (astelehen-ostiral)
--        eman behar zaizkion ikasleari mana eta bihotz horiek.
-- ============================================================

-- 1. Nueva columna grant_days en classrooms (1=lunes ... 7=domingo, ISO DOW)
alter table public.classrooms
  add column if not exists grant_days integer[] not null default ARRAY[1,2,3,4,5];

-- Comprobación: solo valores 1-7 permitidos
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'classrooms_grant_days_check'
  ) then
    alter table public.classrooms
      add constraint classrooms_grant_days_check
      check (
        grant_days <@ ARRAY[1,2,3,4,5,6,7]
        and array_length(grant_days, 1) is not null
      );
  end if;
end$$;


-- 2. Re-definir apply_weekly_grants con la nueva lógica de días
--    Itera desde last_grant_at hasta hoy, contando cuántos días coinciden
--    con los configurados, y aplica weekly_mana y weekly_hearts por cada uno.
--    Cap a 60 días para evitar abuso si pasa mucho tiempo sin login.
create or replace function public.apply_weekly_grants(p_student_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_last timestamptz;
  v_classroom_id uuid;
  v_per_grant_mana int;
  v_per_grant_hearts int;
  v_grant_days int[];
  v_grants_count int;
  v_start date;
  v_today date := current_date;
  v_max_days int := 60;
begin
  select last_weekly_grant_at, classroom_id
    into v_last, v_classroom_id
  from public.students where id = p_student_id;
  if v_classroom_id is null then return; end if;

  select coalesce(weekly_mana, 0),
         coalesce(weekly_hearts, 0),
         coalesce(grant_days, ARRAY[1,2,3,4,5])
    into v_per_grant_mana, v_per_grant_hearts, v_grant_days
  from public.classrooms where id = v_classroom_id;

  -- Si no hay días configurados o ambas cantidades son cero, no hay nada que dar
  if array_length(v_grant_days, 1) is null then return; end if;
  if v_per_grant_mana = 0 and v_per_grant_hearts = 0 then
    -- Igual marcamos el momento para no acumular
    update public.students set last_weekly_grant_at = now()
      where id = p_student_id;
    return;
  end if;

  -- Primera vez: marcamos hoy
  if v_last is null then
    update public.students set last_weekly_grant_at = now()
      where id = p_student_id;
    return;
  end if;

  v_start := (v_last::date) + 1;
  if v_today < v_start then return; end if;

  -- Cap de días para evitar abusos
  if v_today - v_start > v_max_days then
    v_start := v_today - v_max_days;
  end if;

  -- Contar días que coinciden con grant_days
  select count(*)::int
    into v_grants_count
  from generate_series(v_start::timestamp, v_today::timestamp, interval '1 day') as g(day)
  where (
    case extract(isodow from g.day)::int
      when 0 then 7 -- generate_series ya da isodow correctamente, redundante pero seguro
      else extract(isodow from g.day)::int
    end
  ) = ANY(v_grant_days);

  if v_grants_count is null or v_grants_count < 1 then
    -- Mover el cursor para no recontar mañana
    update public.students set last_weekly_grant_at = (v_today)::timestamptz
      where id = p_student_id;
    return;
  end if;

  update public.students set
    mana = least(max_mana, mana + (v_per_grant_mana * v_grants_count)),
    hearts = least(max_hearts, hearts + (v_per_grant_hearts * v_grants_count)),
    last_weekly_grant_at = (v_today)::timestamptz,
    updated_at = now()
  where id = p_student_id;
end;
$$;


-- 3. Re-definir update_classroom_settings para incluir grant_days
create or replace function public.update_classroom_settings(
  p_classroom_id uuid,
  p_name text,
  p_weekly_mana integer,
  p_weekly_hearts integer,
  p_grant_days integer[] default ARRAY[1,2,3,4,5]
)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_teacher_id uuid;
  v_clean_days int[];
begin
  select teacher_id into v_teacher_id from public.classrooms where id = p_classroom_id;
  if v_teacher_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikasgela ez da aurkitu.');
  end if;
  if v_teacher_id <> auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Ez duzu baimenik.');
  end if;

  if length(trim(p_name)) < 1 then
    return jsonb_build_object('success', false, 'error', 'Izena hutsik ezin da egon.');
  end if;
  if p_weekly_mana < 0 or p_weekly_mana > 10 then
    return jsonb_build_object('success', false, 'error', 'Mana 0-10 artean.');
  end if;
  if p_weekly_hearts < 0 or p_weekly_hearts > 10 then
    return jsonb_build_object('success', false, 'error', 'Bihotzak 0-10 artean.');
  end if;

  -- Limpiar el array: solo valores 1-7 únicos
  select array_agg(distinct d order by d)
    into v_clean_days
  from unnest(p_grant_days) as d
  where d between 1 and 7;

  if v_clean_days is null or array_length(v_clean_days, 1) < 1 then
    return jsonb_build_object('success', false, 'error', 'Egun bat aukeratu behar duzu gutxienez.');
  end if;

  update public.classrooms set
    name = trim(p_name),
    weekly_mana = p_weekly_mana,
    weekly_hearts = p_weekly_hearts,
    grant_days = v_clean_days
  where id = p_classroom_id;

  return jsonb_build_object('success', true);
end;
$$;
