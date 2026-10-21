-- ============================================================
-- GRANTS para las tablas de public
-- ============================================================
-- Desde el 30/10/2026, Supabase ya no da acceso automático por la Data API
-- a las tablas nuevas de public. Este script da los permisos explícitos a
-- las 17 tablas del proyecto. Es idempotente: se puede ejecutar varias veces.
-- Ejecutar DESPUÉS de los demás scripts de supabase/ (las tablas deben existir).
--
-- Quién accede a qué:
--
-- * authenticated (profesorado, Supabase Auth): lee y escribe todas las
--   tablas directamente desde el navegador y desde el servidor, y llama a
--   funciones SECURITY INVOKER (use_power, record_activity, adjust_students,
--   approve_power_request, execute_death_sentence...) que escriben en tablas
--   como power_usages o activities con sus permisos. RLS limita cada fila a
--   las aulas del propio profesor.
--
-- * service_role: el código actual no lo usa (lib/supabase/service.ts usa la
--   anon key), pero se da acceso completo para el SQL editor, scripts y
--   futuras rutas de servidor, como pide CLAUDE.md.
--
-- * anon (alumnado con iron-session, y login): sin GRANT en ninguna tabla.
--   El alumnado solo llama a funciones SECURITY DEFINER (find_student_for_login,
--   get_student_dashboard, get_student_missions, get_student_mission_detail,
--   ensure_start_node, submit_mission_node, request_power, get_student_xp_safe,
--   update_student_avatar, list_overrides_for_classroom), que se ejecutan con
--   los permisos del propietario de la función, no con los de anon.
-- ============================================================

-- Si una tabla no existe (por ejemplo, porque no se ha ejecutado su script),
-- se salta con un aviso en lugar de abortar todo el script.
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'classrooms',                                       -- schema.sql
    'students',                                                     -- students.sql
    'activities',                                                   -- student-dashboard.sql
    'behaviors', 'teams', 'team_members', 'power_usages',           -- behaviors-teams-powers.sql
    'power_overrides',                                              -- konfigurazioa.sql
    'power_requests',                                               -- power-requests.sql
    'death_consequences',                                           -- patuak.sql
    'events',                                                       -- events.sql
    'missions', 'mission_nodes', 'mission_edges', 'mission_progress', -- missions.sql
    'mission_completions'                                           -- missions-patch-v3.sql
  ]
  loop
    if to_regclass('public.' || t) is null then
      raise notice 'Tabla public.% no existe, se salta', t;
    else
      execute format(
        'grant select, insert, update, delete on public.%I to authenticated, service_role', t
      );
    end if;
  end loop;
end $$;
