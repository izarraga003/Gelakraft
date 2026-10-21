# GELAKRAFT

Plataforma de gamificación de aula en euskera, basada en mitología vasca.

> _Anbotoko kobazulotik egina._

## Stack técnico

- **Next.js 15** con App Router
- **React 19**
- **TypeScript**
- **Fraunces + Inter** (vía `next/font`)
- **Supabase** — Postgres + Auth (email + contraseña para profesores)
- **iron-session** — sesiones de alumno (sin Supabase Auth)
- **Vercel** — hosting

---

## Setup inicial (primera vez)

### 1. Instalar dependencias

Necesitas Node.js 20 o superior:

```bash
npm install
```

### 2. Crear cuenta y proyecto en Supabase

1. Ir a [supabase.com](https://supabase.com) y crear cuenta (gratis).
2. **New project**:
   - Name: `gelakraft`
   - Database password: genera una fuerte y guárdala en tu gestor de contraseñas.
   - **Region: Frankfurt (eu-central-1)** o París — importante para que los datos vivan en la UE.
3. Esperar 1-2 minutos a que se cree el proyecto.

### 3. Ejecutar el esquema de base de datos

En Supabase: **SQL Editor** → **New query** → pegar el script → **Run**. Repetir con cada uno de los 18 scripts de `supabase/`, **en este orden**:

| # | Script | Qué hace | Depende de |
|---|--------|----------|------------|
| 1 | `schema.sql` | Tablas `profiles`, `classrooms`; trigger que crea el perfil al registrarse | — |
| 2 | `students.sql` | Tabla `students`; RPC `find_student_for_login` | 1 |
| 3 | `students-stats.sql` | Columnas `hero_class`, `xp`, `hearts`, `mana`…; RPC `apply_battle_result` | 2 |
| 4 | `events.sql` | Tabla `events` (ustekabeko gertaerak) | 1 |
| 5 | `student-dashboard.sql` | Columna `avatar`, tabla `activities`; RPC `get_student_dashboard`, `record_activity` | 3 |
| 6 | `avatar-and-bulk.sql` | `avatar_config` (JSONB), `activities.affected_student_ids`; RPC `adjust_students` | 5 |
| 7 | `behaviors-teams-powers.sql` | Tablas `behaviors`, `teams`, `team_members`, `power_usages`; RPC `generate_teams`, `use_power` | 6 |
| 8 | `power-requests.sql` | Tabla `power_requests`; RPC `request_power`, `approve_power_request`… | 7 |
| 9 | `konfigurazioa.sql` | Tabla `power_overrides`, `weekly_mana`/`weekly_hearts`; RPC `apply_weekly_grants`, `update_classroom_settings` | 8 |
| 10 | `grant-days.sql` | Columna `classrooms.grant_days`; redefine `apply_weekly_grants` y `update_classroom_settings` | 9 |
| 11 | `patuak.sql` | Tabla `death_consequences`, `students.pending_death`; RPC `execute_death_sentence` | 6 |
| 12 | `fix-power-invoke.sql` | RPC `get_power_effective`, `list_overrides_for_classroom` | 9 |
| 13 | `full-editable-powers.sql` | Amplía `power_overrides` (nombre, icono…); redefine las dos RPC de 12 | 12 |
| 14 | `fix-duplicate-usernames.sql` | Renombra usernames duplicados y añade `UNIQUE` global a `students.username` | 2 |
| 15 | `missions.sql` | Tablas `missions`, `mission_nodes`, `mission_edges`, `mission_progress` | 2 |
| 16 | `missions-patch-v2.sql` | Redefine `ensure_start_node` | 15 |
| 17 | `missions-patch-v3.sql` | Tabla `mission_completions`; redefine `submit_mission_node`, `review_mission_node` | 16 |
| 18 | `missions-patch-v5.sql` | `mission_progress.mission_id` NOT NULL + trigger; redefine `check_mission_completion`, `get_mission_classroom_progress` | 17 |

No hay `missions-patch-v4.sql`: los commits "misioak v4" solo tocaron código de la app.

El orden es el de creación de cada script en el historial de git, comprobado contra las dependencias (tablas, columnas y funciones que usa cada uno). Los puntos donde un orden distinto rompe algo **sin dar error**:

- **`get_student_dashboard`** se redefine en 5 scripts (5, 6, 7, 8, 9). Gana el último ejecutado. La versión buena es la de `konfigurazioa.sql` (incluye `power_requests` y llama a `apply_weekly_grants`). Si se ejecuta `power-requests.sql` después de `konfigurazioa.sql`, los alumnos dejan de recibir el maná y los corazones semanales.
- **`apply_weekly_grants`**: la versión final es la de `grant-days.sql` (por días de la semana). Si `konfigurazioa.sql` va después, vuelve al reparto semanal antiguo.
- **`list_overrides_for_classroom` / `get_power_effective`**: la versión final es la de `full-editable-powers.sql`. Si `fix-power-invoke.sql` va después, el alumno deja de ver nombre, descripción e icono editados de los poderes.
- **`update_classroom_settings`**: `konfigurazioa.sql` la crea con 4 parámetros y `grant-days.sql` crea otra con 5 (no la reemplaza, queda sobrecargada). La app llama siempre a la de 5 (`lib/classroom/settings.ts`), así que funciona, pero la de 4 sobra.

Todos los scripts usan `if not exists` / `create or replace`, así que volver a ejecutar uno ya aplicado no falla; lo que importa es el orden relativo de los que redefinen funciones.

> **GRANT pendientes.** Ningún script incluye `grant ... to authenticated / service_role / anon`. Las tablas ya creadas conservan su acceso, pero desde el 30/10/2026 Supabase no da acceso por la Data API a las tablas nuevas. Si se monta una base de datos nueva con estos scripts después de esa fecha, habrá que añadir los GRANT de las 17 tablas: `profiles`, `classrooms`, `students`, `events`, `activities`, `behaviors`, `teams`, `team_members`, `power_usages`, `power_requests`, `power_overrides`, `death_consequences`, `missions`, `mission_nodes`, `mission_edges`, `mission_progress`, `mission_completions`. Ver `CLAUDE.md`.

### 4. Configurar Authentication en Supabase

#### 4.1. URLs

1. En Supabase: **Authentication** → **URL Configuration**.
2. **Site URL**: `https://gelakraft.eus`
3. **Redirect URLs**: añadir las dos:
   - `https://gelakraft.eus/auth/callback`
   - `http://localhost:3000/auth/callback` (para desarrollo)
4. Save.

#### 4.2. Confirmación de email obligatoria

1. **Authentication** → **Providers** → **Email**.
2. Asegúrate de que **"Confirm email"** está **activado** (toggle en azul/verde).
3. Esto hace que cada nuevo usuario reciba un email de confirmación al registrarse y deba pulsar el enlace antes de poder iniciar sesión. **Solo se manda este email una vez en la vida del usuario.**
4. Save.

#### 4.3. Personalizar templates de email (recomendado)

En **Authentication** → **Email Templates** hay tres plantillas que recibirá el usuario:

- **Confirm signup** — al registrarse. La debe personalizar a euskera y branding GELAKRAFT.
- **Reset password** — cuando pide recuperar contraseña. Igual.
- **Magic Link** — no la usamos, puedes ignorarla.

Ejemplo de "Confirm signup" en euskera:

```
Asunto: Baieztatu zure GELAKRAFT kontua

Kaixo,

Eskerrik asko GELAKRAFTen izena emateagatik. Sakatu beheko esteka
zure kontua aktibatzeko:

{{ .ConfirmationURL }}

Esteka 24 ordutan iraungiko da.

Mariren bedeinkapenak,
GELAKRAFT taldea — Anbotoko kobazulotik
```

Ejemplo de "Reset password" en euskera:

```
Asunto: Berreskuratu zure GELAKRAFT pasahitza

Kaixo,

Pasahitza berreskuratzeko eskaera bat jaso dugu. Sakatu beheko
estekan pasahitz berri bat sortzeko:

{{ .ConfirmationURL }}

Eskaera hori egin ez baduzu, ahaztu email hau.

GELAKRAFT taldea — Anbotoko kobazulotik
```

### 5. Obtener las credenciales

1. **Settings** → **API**.
2. Copiar:
   - **Project URL** → será `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys** → la clave `anon public` → será `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 6. Configurar variables de entorno (local)

```bash
cp .env.example .env.local
```

Editar `.env.local` y rellenar:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
STUDENT_SESSION_SECRET=...
```

Para generar el `STUDENT_SESSION_SECRET` (32+ caracteres aleatorios):

```bash
# En Linux/macOS:
openssl rand -base64 32

# En Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}))
```

Cualquier cadena aleatoria de 32+ caracteres vale. Si la cambias en el futuro, todos los alumnos quedarán deslogueados (las cookies antiguas dejarán de validarse).

### 7. Arrancar el servidor de desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000). La landing pública carga sin sesión.
Para probar el registro: `/izen-ematea` o click en cualquier botón "Izen-ematea".

---

## Desplegar a producción (Vercel)

### 1. Subir a GitHub

```bash
git init
git add .
git commit -m "GELAKRAFT v1 con auth"
git remote add origin https://github.com/TU_USUARIO/gelakraft.git
git push -u origin main
```

### 2. Importar en Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project**.
2. Seleccionar el repo `gelakraft`.
3. **Environment Variables**: añadir los tres valores:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `STUDENT_SESSION_SECRET` (sin él, los alumnos no pueden iniciar sesión)
4. **Deploy**.

### 3. Conectar el dominio

Settings → Domains → añadir `gelakraft.eus`. Configurar los registros DNS en CDmon
según las instrucciones de Vercel.

---

## Estructura del proyecto

```
gelakraft/
├── app/
│   ├── globals.css            # Tokens de diseño + estilos
│   ├── layout.tsx             # Layout raíz (fuentes, metadata)
│   ├── page.tsx               # Landing pública
│   ├── saioa-hasi/page.tsx    # Login
│   ├── izen-ematea/page.tsx   # Registro
│   ├── auth/                  # Callback, recuperación y cambio de contraseña, logout
│   ├── panela/                # Panel del profesor
│   │   └── ikasgela/[id]/     # Ikasgela: herramientas, misioak, eskaerak, konfiguratu/…
│   ├── ikasle/                # Login y panel del alumno, vista de misión
│   └── proiektatu/            # Vista para proyectar el aula en pantalla
├── components/
│   ├── icons.tsx              # Todos los iconos SVG
│   ├── auth/                  # Formularios de login y registro
│   ├── battle/, missions/, student/, tools/   # UI de cada funcionalidad
│   ├── Hero.tsx, ToolsSection.tsx, ...   # Secciones de la landing
│   └── ...
├── lib/
│   ├── students/, powers/, missions/, patuak/, …   # Server actions por dominio
│   └── supabase/
│       ├── client.ts          # Cliente para el navegador
│       ├── server.ts          # Cliente para servidor (RSC, route handlers)
│       └── middleware.ts      # Helper para refrescar sesión
├── middleware.ts              # Protege /panela, refresca sesión
├── supabase/
│   └── *.sql                  # 18 scripts de BD (orden en "Setup inicial", paso 3)
└── public/
    └── mari-anboto.jpg        # Ilustración del hero
```

---

## Cómo funciona la autenticación

**Email + contraseña** con confirmación de email obligatoria al registrarse (una vez).

### Registro

1. Usuario va a `/izen-ematea` → introduce email + contraseña + confirmar contraseña.
2. Supabase envía un email de confirmación.
3. Usuario hace click en el enlace → llega a `/auth/callback?code=...`.
4. El handler intercambia el código por una sesión y redirige a `/panela`.
5. Un trigger SQL crea automáticamente el perfil en la tabla `profiles`.

### Login

1. Usuario va a `/saioa-hasi` → introduce email + contraseña.
2. Supabase valida y devuelve sesión (cookies firmadas).
3. Redirección a `/panela`.

### Recuperación de contraseña

1. Usuario va a `/pasahitza-berreskuratu` → introduce su email.
2. Supabase envía un email con un enlace de recuperación.
3. Click en el enlace → llega a `/auth/callback?type=recovery&code=...`.
4. El callback detecta `type=recovery` y redirige a `/auth/pasahitza-aldatu`.
5. Usuario establece una nueva contraseña → vuelve al panel autenticado.

### Reglas

- Pasahitza: mínimo **8 caracteres**.
- Sin confirmar email: no se puede hacer login (se muestra un mensaje claro).
- Sesiones gestionadas por Supabase con cookies firmadas (Server-Side).

---

## Sistema de alumnos (ikasleak)

Los alumnos **NO usan Supabase Auth ni emails**. El profesor los crea desde el panel y reciben credenciales (usuario + contraseña) que ven directamente en su tabla de ikasgela.

### Cómo funciona

1. **El profesor crea una ikasgela** (`/panela/ikasgela-berria`).
2. **El profesor añade alumnos** pegando una lista de nombres en un textarea (uno por línea).
3. **El sistema genera automáticamente**:
   - **Username**: `nombre.apellido` (sin tildes, en minúsculas, único dentro de la ikasgela). Si hay duplicados, añade un número: `ane.etxebarria2`.
   - **Contraseña**: una palabra mitológica vasca + número (`Mari-247`, `Sugaar-83`, `Lamia-156`).
4. **El profesor ve la tabla con todos los alumnos**: nombre, usuario, contraseña en texto plano, botones para copiar y regenerar.
5. **Los alumnos hacen login** en `gelakraft.eus/ikasle/sartu` con su username y password.

### Decisiones de seguridad

- La contraseña se guarda **dos veces**: un hash bcrypt para verificación rápida en login, y el texto plano para que el profesor la vea siempre.
- **RLS estricto**: cada profesor solo puede ver/modificar los alumnos de sus propias ikasgelas (verificado a nivel de BD).
- **Función RPC `find_student_for_login`** con `SECURITY DEFINER`: permite buscar un alumno por username durante el login sin estar autenticado, pero solo devuelve los campos necesarios.
- **Sesiones de alumno** gestionadas con `iron-session` (cookies cifradas con secreto del servidor, 30 días de duración).

### Generador de contraseñas

Vocabulario actual (`lib/students/generate-password.ts`): Mari, Sugaar, Lamia, Sorgina, Jentila, Basajaun, Tartalo, Mendi, Aizkorri, Gorbea, Akelarre, Erreka, Haritz, Otso, Hartz, Eguzki, Ilargi, Izar, Gaztelu, Errota… (45 palabras).

Formato: `<Palabra>-<NN>` donde NN es número entre 10 y 999.

---

## Estado de las funcionalidades

Comprobado contra las rutas de `app/` y los scripts de `supabase/`.

### Hecho

- **Profesores**: registro, login y recuperación de contraseña (email + contraseña).
- **Ikasgelak**: crear (`/panela/ikasgela-berria`) y configurar nombre, maná y corazones por reparto, y días de reparto (`konfiguratu`).
- **Alumnos**: alta por lista, usuario + contraseña generados, login en `/ikasle/sartu`, panel propio con avatar editable, XP, corazones, maná y nivel.
- **6 herramientas de aula**: Sugaarren borroka (`borroka`), Mariren isiltasuna (`isiltasuna`), ustekabeko gertaera (`ustekabekoa`), atzerako kontaketa (`kontaketa`), kronometroa (`kronometroa`), ausazko hautatzailea (`hautatzailea`).
- **Jokabideak**: conductas positivas/negativas por aula con XP/corazones (`jokabideak`, `konfiguratu/sariak`, `konfiguratu/zigorrak`).
- **Taldeak**: generación automática y edición (`taldeak`, `konfiguratu/taldeak`).
- **Botereak**: catálogo de poderes, uso por el alumno con coste de maná, cola de solicitudes para el profesor (`eskaerak`) y edición completa por aula (`konfiguratu/botereak`).
- **Patuak**: al llegar a 0 corazones, el profesor ejecuta una consecuencia aleatoria de una lista editable (`konfiguratu/patuak`).
- **Misioak**: mapa de nodos con conexiones, envío de respuestas por el alumno, validación del profesor, progreso del aula y recompensa final.
- **Proyección**: vista del aula para pantalla (`/proiektatu/[classroomId]`).
- **Página de privacidad**: `/pribatutasun-politika`.

### Pendiente

- Enlaces del footer sin destino (`href="#"`): "Nor gara?", "Pribatutasun politika" (la página existe pero no está enlazada) y "Erabilera baldintzak" (no existe página).
- Tarjetas de herramientas de la landing (`components/ToolsSection.tsx`) sin enlace (`href="#"`).
- Música de fondo en la batalla (TODO en `components/battle/sounds.ts`).
- GRANT de las tablas en los scripts SQL (ver nota en el paso 3).
- Licencia.

---

## Licencia

Pendiente de definir.

---

© 2026 GELAKRAFT
