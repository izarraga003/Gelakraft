-- ============================================================
-- GELAKRAFT · ESKEMA OSAGARRIA: IKASLE ESTATISTIKAK
-- ============================================================
-- Añade campos persistentes a la tabla students para gamificación:
--   - hero_class: clase del héroe (sorgina, lamia, jentila)
--   - xp: puntos de experiencia (suma a lo largo del curso)
--   - hearts: vidas actuales
--   - max_hearts: vidas máximas
--   - mana: maná actual (para futuras tools)
--   - max_mana: maná máximo
--
-- CÓMO EJECUTAR:
--   1. En Supabase: SQL Editor → New query
--   2. Pegar este script y Run
-- ============================================================

-- Añadir columnas (idempotente: si ya existen, no falla)
alter table public.students
  add column if not exists hero_class text
    check (hero_class in ('sorgina', 'lamia', 'jentila')),
  add column if not exists xp integer not null default 0,
  add column if not exists hearts integer not null default 5,
  add column if not exists max_hearts integer not null default 5,
  add column if not exists mana integer not null default 3,
  add column if not exists max_mana integer not null default 3;

-- Constraints de coherencia (vida no negativa, no superior al máximo)
alter table public.students
  drop constraint if exists students_hearts_valid;
alter table public.students
  add constraint students_hearts_valid
  check (hearts >= 0 and hearts <= max_hearts);

alter table public.students
  drop constraint if exists students_mana_valid;
alter table public.students
  add constraint students_mana_valid
  check (mana >= 0 and mana <= max_mana);

alter table public.students
  drop constraint if exists students_xp_valid;
alter table public.students
  add constraint students_xp_valid
  check (xp >= 0);

-- Para alumnos existentes sin hero_class, asignar uno aleatorio
update public.students
set hero_class = (
  array['sorgina', 'lamia', 'jentila']
)[floor(random() * 3 + 1)::int]
where hero_class is null;

-- Hacer hero_class obligatorio a partir de ahora
alter table public.students
  alter column hero_class set not null;


-- ============================================================
-- FUNCIÓN: aplicar resultado de batalla a varios alumnos
-- ============================================================
-- Llamada desde el server action al final de una batalla.
-- Una sola operación atómica para todos los alumnos del grupo.
-- ============================================================

create or replace function public.apply_battle_result(
  p_classroom_id uuid,
  p_xp_delta integer,
  p_hearts_delta integer
)
returns void
language plpgsql
security invoker
as $$
begin
  update public.students
  set
    xp = greatest(0, xp + p_xp_delta),
    hearts = greatest(0, least(max_hearts, hearts + p_hearts_delta)),
    updated_at = now()
  where classroom_id = p_classroom_id;
end;
$$;

comment on function public.apply_battle_result is
  'Aplica el resultado de una batalla a todos los alumnos de una ikasgela.';
