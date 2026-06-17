-- ============================================================
-- GELAKRAFT · ESKEMA OSAGARRIA: USTEKABEKO GERTAERAK
-- ============================================================
-- Tabla `events`: catálogo de eventos del profesor.
-- Cada profesor tiene su propia lista, editable.
--
-- CÓMO EJECUTAR:
--   1. Supabase: SQL Editor → New query
--   2. Pegar este script y Run
-- ============================================================

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.events is 'Ustekabeko gertaeren katalogoa, irakaslearena';

create index if not exists events_teacher_id_idx on public.events(teacher_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.events enable row level security;

drop policy if exists "events_select_own" on public.events;
create policy "events_select_own" on public.events for select
  using (teacher_id = auth.uid());

drop policy if exists "events_insert_own" on public.events;
create policy "events_insert_own" on public.events for insert
  with check (teacher_id = auth.uid());

drop policy if exists "events_update_own" on public.events;
create policy "events_update_own" on public.events for update
  using (teacher_id = auth.uid());

drop policy if exists "events_delete_own" on public.events;
create policy "events_delete_own" on public.events for delete
  using (teacher_id = auth.uid());
