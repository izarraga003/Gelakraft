-- ============================================================
-- GELAKRAFT · ESKEMA OSAGARRIA: IKASLEAK (alumnos)
-- ============================================================
-- Este script AÑADE la tabla students al esquema existente.
-- Se ejecuta DESPUÉS de schema.sql.
--
-- CÓMO EJECUTAR:
--   1. En Supabase: SQL Editor → New query.
--   2. Pegar todo este script.
--   3. Pulsar "Run".
--   4. Verificar en Table Editor que aparece la tabla "students".
-- ============================================================

-- ============================================================
-- TABLA: students
-- ============================================================
-- Los alumnos NO son usuarios de Supabase Auth (no tienen email).
-- Tienen username + password generados por el profesor.
--
-- Guardamos:
--   - password_hash: hash bcrypt para verificar el login (seguro)
--   - password_plain: texto plano para que el profesor la vea
--
-- Justificación de guardar texto plano:
-- Los profesores (Classmana, Edmodo, Khan Academy for Kids, etc.) suelen
-- gestionar las contraseñas de sus alumnos directamente. Estas son
-- contraseñas únicas para esta plataforma — no se reúsan en otros sitios.
-- El RLS asegura que SOLO el profesor dueño puede verlas.
-- ============================================================

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  full_name text not null,
  username text not null,
  password_hash text not null,
  password_plain text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Username único dentro de la misma ikasgela.
  -- Distintas ikasgelas pueden tener el mismo username
  -- (porque al hacer login, además filtramos por ikasgela si hace falta).
  unique (classroom_id, username)
);

comment on table public.students is 'Ikasleak (alumnos): username + pasahitza generatuak';

create index if not exists students_classroom_id_idx
  on public.students(classroom_id);

-- Para login rápido por username (sin filtro de classroom)
create index if not exists students_username_idx
  on public.students(username);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
-- Crítico: el profesor solo puede ver/modificar los alumnos
-- de SUS ikasgelas. Esto se verifica con un JOIN a classrooms.
-- ============================================================

alter table public.students enable row level security;

-- SELECT: profesor puede ver alumnos de sus ikasgelak
drop policy if exists "students_select_own" on public.students;
create policy "students_select_own"
  on public.students for select
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = students.classroom_id
        and c.teacher_id = auth.uid()
    )
  );

-- INSERT: profesor puede crear alumnos en sus ikasgelak
drop policy if exists "students_insert_own" on public.students;
create policy "students_insert_own"
  on public.students for insert
  with check (
    exists (
      select 1 from public.classrooms c
      where c.id = students.classroom_id
        and c.teacher_id = auth.uid()
    )
  );

-- UPDATE: profesor puede actualizar alumnos de sus ikasgelak
drop policy if exists "students_update_own" on public.students;
create policy "students_update_own"
  on public.students for update
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = students.classroom_id
        and c.teacher_id = auth.uid()
    )
  );

-- DELETE: profesor puede borrar alumnos de sus ikasgelak
drop policy if exists "students_delete_own" on public.students;
create policy "students_delete_own"
  on public.students for delete
  using (
    exists (
      select 1 from public.classrooms c
      where c.id = students.classroom_id
        and c.teacher_id = auth.uid()
    )
  );


-- ============================================================
-- FUNCIÓN PARA LOGIN DE ALUMNO
-- ============================================================
-- Los alumnos NO usan Supabase Auth. Para hacer login necesitamos
-- buscar el alumno por username SIN tener una sesión activa.
-- Esto requiere una función SECURITY DEFINER que salta el RLS
-- de forma controlada (solo devuelve los campos necesarios).
-- ============================================================

create or replace function public.find_student_for_login(p_username text)
returns table (
  id uuid,
  classroom_id uuid,
  full_name text,
  username text,
  password_hash text
)
language sql
security definer
set search_path = public
as $$
  select id, classroom_id, full_name, username, password_hash
  from public.students
  where username = p_username
  limit 1;
$$;

comment on function public.find_student_for_login is
  'Busca alumno por username para login (salta RLS, solo devuelve campos seguros)';


-- ============================================================
-- FIN
-- ============================================================
