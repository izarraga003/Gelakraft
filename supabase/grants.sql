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

-- schema.sql
grant select, insert, update, delete on public.profiles to authenticated, service_role;
grant select, insert, update, delete on public.classrooms to authenticated, service_role;

-- students.sql
grant select, insert, update, delete on public.students to authenticated, service_role;

-- student-dashboard.sql
grant select, insert, update, delete on public.activities to authenticated, service_role;

-- behaviors-teams-powers.sql
grant select, insert, update, delete on public.behaviors to authenticated, service_role;
grant select, insert, update, delete on public.teams to authenticated, service_role;
grant select, insert, update, delete on public.team_members to authenticated, service_role;
grant select, insert, update, delete on public.power_usages to authenticated, service_role;

-- konfigurazioa.sql
grant select, insert, update, delete on public.power_overrides to authenticated, service_role;

-- power-requests.sql
grant select, insert, update, delete on public.power_requests to authenticated, service_role;

-- patuak.sql
grant select, insert, update, delete on public.death_consequences to authenticated, service_role;

-- events.sql
grant select, insert, update, delete on public.events to authenticated, service_role;

-- missions.sql
grant select, insert, update, delete on public.missions to authenticated, service_role;
grant select, insert, update, delete on public.mission_nodes to authenticated, service_role;
grant select, insert, update, delete on public.mission_edges to authenticated, service_role;
grant select, insert, update, delete on public.mission_progress to authenticated, service_role;

-- missions-patch-v3.sql
grant select, insert, update, delete on public.mission_completions to authenticated, service_role;
