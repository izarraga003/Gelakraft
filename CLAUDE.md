# GELAKRAFT

## Supabase: tablas nuevas

Desde el 30/10/2026, Supabase ya no da acceso automático por la Data API a las tablas nuevas del esquema `public`.

Cada vez que crees una tabla en Supabase (en `supabase/*.sql`), incluye en el mismo SQL:

- `alter table public.<tabla> enable row level security;`
- sus políticas RLS;
- `grant select, insert, update, delete on public.<tabla> to authenticated;`
- `grant select, insert, update, delete on public.<tabla> to service_role;`
- `grant select on public.<tabla> to anon;` solo si la tabla debe ser legible sin login.

Si alguna vez se recrea la base de datos desde estos scripts, las tablas existentes también necesitarán sus GRANT.
