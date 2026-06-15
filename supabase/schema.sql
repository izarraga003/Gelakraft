-- ============================================================
-- GELAKRAFT · ESKEMA INIZIALA (Supabase / PostgreSQL)
-- ============================================================
-- Este script crea las tablas iniciales y configura Row Level
-- Security (RLS) para que cada profesor solo pueda ver y
-- modificar sus propios datos.
--
-- CÓMO EJECUTAR:
--   1. En el dashboard de Supabase, ir a "SQL Editor".
--   2. Pegar todo este script.
--   3. Pulsar "Run". Tardará 1-2 segundos.
--   4. Verificar en "Table Editor" que aparecen las tablas
--      "profiles" y "classrooms".
-- ============================================================


-- ============================================================
-- TABLA: profiles
-- ============================================================
-- Extiende auth.users con datos públicos del profesor.
-- Se crea automáticamente cuando un usuario se registra
-- (ver trigger más abajo).
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  school text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Perfil de cada irakaslea (profesor)';

-- Trigger para crear el profile automáticamente al registrarse.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================
-- TABLA: classrooms
-- ============================================================
-- Cada ikasgela (clase) que un profesor crea.
-- ============================================================

create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  stage text check (stage in ('lehen', 'dbh', 'batxilergoa', 'lh', 'unibertsitatea', 'beste')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.classrooms is 'Ikasgelak (clases) de cada irakaslea';

create index if not exists classrooms_teacher_id_idx
  on public.classrooms(teacher_id);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Sin esto, cualquier usuario podría ver/modificar datos de
-- cualquier otro. Crítico para privacidad.
-- ============================================================

-- PROFILES
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- CLASSROOMS
alter table public.classrooms enable row level security;

drop policy if exists "classrooms_select_own" on public.classrooms;
create policy "classrooms_select_own"
  on public.classrooms for select
  using (auth.uid() = teacher_id);

drop policy if exists "classrooms_insert_own" on public.classrooms;
create policy "classrooms_insert_own"
  on public.classrooms for insert
  with check (auth.uid() = teacher_id);

drop policy if exists "classrooms_update_own" on public.classrooms;
create policy "classrooms_update_own"
  on public.classrooms for update
  using (auth.uid() = teacher_id);

drop policy if exists "classrooms_delete_own" on public.classrooms;
create policy "classrooms_delete_own"
  on public.classrooms for delete
  using (auth.uid() = teacher_id);


-- ============================================================
-- FIN
-- ============================================================
-- Para añadir nuevas tablas (alumnos, cuestionarios, sesiones)
-- en el futuro, añadirlas debajo siguiendo el mismo patrón:
--   1. CREATE TABLE
--   2. ENABLE RLS
--   3. CREATE POLICY
-- ============================================================
