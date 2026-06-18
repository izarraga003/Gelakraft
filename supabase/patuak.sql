-- ============================================================
-- GELAKRAFT · PATUAREN ERRONKAK (consecuencias tras quedar sin vida)
-- ============================================================
-- Cuando un alumno llega a 0 corazones, queda `pending_death = true`.
-- El profesor, desde el panel principal, ejecuta la sentencia que escoge
-- aleatoriamente una entrada de la lista de patuak (death_consequences).
-- Al ejecutarla, se le restauran los corazones al máximo y `pending_death`
-- vuelve a false. La sentencia ejecutada queda registrada en activities.
-- ============================================================


-- 1. Tabla death_consequences
create table if not exists public.death_consequences (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  description text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists death_consequences_classroom_idx
  on public.death_consequences(classroom_id, display_order);

alter table public.death_consequences enable row level security;

drop policy if exists "death_consequences_owner_all" on public.death_consequences;
create policy "death_consequences_owner_all"
  on public.death_consequences for all
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = death_consequences.classroom_id and c.teacher_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = death_consequences.classroom_id and c.teacher_id = auth.uid()
    )
  );


-- 2. Columna pending_death en students
alter table public.students
  add column if not exists pending_death boolean not null default false;

create index if not exists students_pending_death_idx
  on public.students(classroom_id) where pending_death;


-- 3. Función seed_default_consequences
create or replace function public.seed_default_consequences(p_classroom_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  insert into public.death_consequences (classroom_id, description, display_order) values
    (p_classroom_id, 'Ezer ere ez! Ihes egin diozu Mariren haserreari.', 1),
    (p_classroom_id, 'Etxeko lan gehigarri bat hurrengo egunerako.', 2),
    (p_classroom_id, 'Klase aurrean albiste bat aurkeztu beharko duzu.', 3),
    (p_classroom_id, 'Hurrengo lana puntu bat gutxiago izango du.', 4),
    (p_classroom_id, 'Hurrengo lana bi puntu gutxiago izango ditu.', 5),
    (p_classroom_id, 'Astebete osoan klasea garbitzeko ardura.', 6),
    (p_classroom_id, 'Astebetez ezin duzu lehen ilaran eseri.', 7),
    (p_classroom_id, 'Ahozko galdera bat klase hasieran hurrengo astean.', 8),
    (p_classroom_id, 'Euskal mitologiako pertsonaia bati buruzko bost esaldi idatzi.', 9),
    (p_classroom_id, 'Klasea agurtu behar duzu beste hizkuntza batean astebetez.', 10),
    (p_classroom_id, 'Astebetez ezin duzu botererik erabili.', 11),
    (p_classroom_id, 'Hurrengo erronkan denbora gutxiago izango duzu.', 12);
end;
$$;


-- 4. Trigger automático: cuando se crea un classroom, sembrar consecuencias
create or replace function public.trigger_seed_consequences()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.seed_default_consequences(new.id);
  return new;
end;
$$;

drop trigger if exists classrooms_seed_consequences on public.classrooms;
create trigger classrooms_seed_consequences
  after insert on public.classrooms
  for each row execute function public.trigger_seed_consequences();

-- Aplicar a classrooms existentes que no tengan
do $$
declare c record;
begin
  for c in select id from public.classrooms loop
    if not exists (select 1 from public.death_consequences where classroom_id = c.id) then
      perform public.seed_default_consequences(c.id);
    end if;
  end loop;
end $$;


-- 5. Trigger: cuando hearts llega a 0 marcar pending_death
create or replace function public.trigger_mark_pending_death()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.hearts <= 0 and (old.hearts is null or old.hearts > 0) and not new.pending_death then
    new.pending_death := true;
  end if;
  return new;
end;
$$;

drop trigger if exists students_mark_pending_death on public.students;
create trigger students_mark_pending_death
  before update of hearts on public.students
  for each row execute function public.trigger_mark_pending_death();


-- 6. RPC execute_death_sentence: profesor ejecuta sentencia para un alumno
create or replace function public.execute_death_sentence(p_student_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_classroom_id uuid;
  v_teacher_id uuid;
  v_max_hearts int;
  v_chosen record;
  v_count int;
  v_full_name text;
begin
  select classroom_id, max_hearts, full_name
    into v_classroom_id, v_max_hearts, v_full_name
  from public.students where id = p_student_id;

  if v_classroom_id is null then
    return jsonb_build_object('success', false, 'error', 'Ikaslea ez da aurkitu.');
  end if;

  select teacher_id into v_teacher_id from public.classrooms where id = v_classroom_id;
  if v_teacher_id <> auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Ez duzu baimenik.');
  end if;

  -- Comprobar pending_death
  if not exists (
    select 1 from public.students where id = p_student_id and pending_death
  ) then
    return jsonb_build_object('success', false, 'error', 'Ikasle honek ez du patua zain.');
  end if;

  -- Elegir consecuencia aleatoria
  select count(*) into v_count
    from public.death_consequences where classroom_id = v_classroom_id;
  if v_count = 0 then
    return jsonb_build_object('success', false, 'error', 'Ez dago patuak definituta. Konfiguratu lehenbizi.');
  end if;

  select * into v_chosen
    from public.death_consequences
    where classroom_id = v_classroom_id
    order by random()
    limit 1;

  -- Restaurar corazones y limpiar pending_death (necesitamos bypass del trigger,
  -- por eso usamos un UPDATE específico que no toca hearts a 0)
  update public.students set
    hearts = v_max_hearts,
    pending_death = false,
    updated_at = now()
  where id = p_student_id;

  -- Registrar como actividad
  insert into public.activities (
    classroom_id, activity_type, outcome, xp_delta, hearts_delta, metadata, affected_student_ids
  ) values (
    v_classroom_id, 'adjustment', 'neutral', 0, 0,
    jsonb_build_object(
      'patua', v_chosen.description,
      'note', 'Patua: ' || v_chosen.description,
      'kind', 'death_sentence'
    ),
    array[p_student_id]
  );

  return jsonb_build_object(
    'success', true,
    'consequence', v_chosen.description,
    'student_name', v_full_name
  );
end;
$$;


-- 7. RPC list_pending_deaths para el panel del profe
create or replace function public.list_pending_deaths(p_classroom_id uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_teacher_id uuid;
  v_result jsonb;
begin
  select teacher_id into v_teacher_id from public.classrooms where id = p_classroom_id;
  if v_teacher_id <> auth.uid() then
    return jsonb_build_object('success', false, 'error', 'Ez duzu baimenik.');
  end if;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'full_name', full_name,
      'avatar_config', avatar_config,
      'hero_class', hero_class,
      'xp', xp
    )
    order by updated_at desc
  ), '[]'::jsonb) into v_result
  from public.students
  where classroom_id = p_classroom_id and pending_death;

  return jsonb_build_object('success', true, 'students', v_result);
end;
$$;
