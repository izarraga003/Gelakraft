# GELAKRAFT

Plataforma de gamificación de aula en euskera, basada en mitología vasca.

> _Anbotoko kobazulotik egina._

## Stack técnico

- **Next.js 15** con App Router
- **React 19**
- **TypeScript**
- **Fraunces + Inter** (vía `next/font`)
- **Supabase** — Postgres + Auth (magic links)
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

1. En Supabase: **SQL Editor** (icono de la izquierda).
2. **New query**.
3. Copiar y pegar todo el contenido de `supabase/schema.sql` del proyecto.
4. **Run**. Crea las tablas `profiles` y `classrooms` con RLS activado.

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

Editar `.env.local` y pegar los valores que has copiado:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

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
3. **Environment Variables**: añadir los dos valores:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
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
│   ├── auth/
│   │   ├── callback/route.ts  # Handler del magic link
│   │   └── saioa-itxi/route.ts# Logout
│   └── panela/
│       ├── layout.tsx         # Layout protegido del panel
│       └── page.tsx           # Dashboard del profesor
├── components/
│   ├── icons.tsx              # Todos los iconos SVG
│   ├── auth/AuthForm.tsx      # Formulario de magic link
│   ├── Hero.tsx, ToolsSection.tsx, ...   # Secciones de la landing
│   └── ...
├── lib/
│   └── supabase/
│       ├── client.ts          # Cliente para el navegador
│       ├── server.ts          # Cliente para servidor (RSC, route handlers)
│       └── middleware.ts      # Helper para refrescar sesión
├── middleware.ts              # Protege /panela, refresca sesión
├── supabase/
│   └── schema.sql             # Esquema inicial de BD (ejecutar en Supabase)
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

## Próximos pasos

- Construir las 6 herramientas reales (Sugaarren borroka primero).
- Permitir crear ikasgelak desde el panel.
- Sistema de tokens para alumnos (sin email, solo código).
- Páginas internas (`/nor-gara`, `/pribatutasun-politika`, etc.).

---

## Licencia

Pendiente de definir.

---

© 2026 GELAKRAFT
