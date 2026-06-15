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

### 4. Configurar las URLs de autenticación

1. En Supabase: **Authentication** → **URL Configuration**.
2. **Site URL**: `https://gelakraft.eus`
3. **Redirect URLs**: añadir las dos:
   - `https://gelakraft.eus/auth/callback`
   - `http://localhost:3000/auth/callback` (para desarrollo)
4. Save.

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

**Magic link sin contraseña.** Flujo:

1. Usuario introduce email en `/saioa-hasi` o `/izen-ematea`.
2. Supabase envía un email con un enlace único.
3. Usuario hace click → llega a `/auth/callback?code=...`.
4. El handler intercambia el código por una sesión (cookies firmadas).
5. Redirección a `/panela`.

Si el usuario no existía, Supabase lo crea automáticamente. Un trigger SQL
crea automáticamente su perfil en la tabla `profiles`.

### Personalizar el email (opcional pero recomendable)

En Supabase: **Authentication** → **Email Templates** → **Magic Link**.

Sustituir el contenido por una versión en euskera con el branding de GELAKRAFT.
Ejemplo de plantilla:

```
Asunto: Zure GELAKRAFT esteka

Kaixo,

Hau da zure esteka GELAKRAFTen sartzeko:
{{ .ConfirmationURL }}

Esteka 1 ordutan iraungiko da.

Ondo izan,
GELAKRAFT taldea — Anbotoko kobazulotik
```

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
