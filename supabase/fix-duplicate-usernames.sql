-- ============================================================
-- GELAKRAFT · FIX usernames duplicados entre ikasgelas
-- ============================================================
-- Bug: `find_student_for_login` hace LIMIT 1 sin filtro de ikasgela.
-- Si hay dos alumnos con el mismo username (ej. "maite.garcia" en dos
-- aulas distintas), Postgres devuelve uno al azar y el login falla.
--
-- Solución:
--  1) Detectar duplicados y renombrar añadiendo sufijo numérico.
--  2) Añadir constraint UNIQUE global a `username`.
--
-- Tras ejecutar este SQL:
--  - El profesor verá en su panel los nuevos usernames con sufijo (p.ej.
--    "maite.garcia2") para los alumnos antes duplicados.
--  - El profesor puede usar la opción "Pasahitza birsortu" en cada uno
--    y dárselo al alumno correspondiente.
-- ============================================================

do $$
declare
  v_row record;
  v_count int;
  v_new_username text;
  v_suffix int;
begin
  -- Iterar grupos de duplicados, dejando el más antiguo con el username
  -- original y renombrando los demás con sufijo numérico.
  for v_row in
    select id, username, created_at,
           row_number() over (partition by username order by created_at) as rn
    from public.students
    where username in (
      select username from public.students group by username having count(*) > 1
    )
  loop
    if v_row.rn = 1 then
      raise notice 'Mantengo username original: % (id=%)', v_row.username, v_row.id;
    else
      -- Buscar sufijo libre globalmente
      v_suffix := v_row.rn;
      loop
        v_new_username := v_row.username || v_suffix::text;
        select count(*) into v_count
          from public.students where username = v_new_username;
        exit when v_count = 0;
        v_suffix := v_suffix + 1;
      end loop;
      update public.students
        set username = v_new_username
        where id = v_row.id;
      raise notice 'Renombro % -> % (id=%)', v_row.username, v_new_username, v_row.id;
    end if;
  end loop;
end$$;

-- Añadir constraint UNIQUE global. Si por algún motivo aún hay duplicados,
-- esto fallará y verás un error claro.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'students_username_unique'
  ) then
    alter table public.students
      add constraint students_username_unique unique (username);
  end if;
end$$;


-- RPC para listar TODOS los usernames del sistema. Cualquier profesor
-- autenticado la puede llamar para evitar colisiones al crear alumnos.
-- Solo devuelve los strings, ningún dato sensible.
create or replace function public.list_all_usernames()
returns table (username text)
language sql
security definer
set search_path = public
as $$
  select username from public.students;
$$;

comment on function public.list_all_usernames is
  'Lista todos los usernames de students (security definer) para evitar colisiones entre aulas al generar uno nuevo.';
