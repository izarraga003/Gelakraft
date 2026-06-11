# GELAKRAFT

Plataforma de gamificación de aula en euskera, basada en mitología vasca.

> _Anbotoko kobazulotik egina._

## Stack técnico

- **Next.js 15** con App Router
- **React 19**
- **TypeScript**
- **Fraunces + Inter** (vía `next/font`)
- **Sin base de datos** en esta v1 (solo landing pública)

## Correr el proyecto en local

Necesitas Node.js 20+ instalado.

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Cualquier cambio en archivos `.tsx` o `.css` se refleja al instante (hot reload).

## Estructura del proyecto

```
gelakraft/
├── app/
│   ├── globals.css        # Tokens de diseño + estilos de toda la web
│   ├── layout.tsx         # Layout raíz (fuentes, metadata, body)
│   └── page.tsx           # Página principal (composición de secciones)
├── components/
│   ├── icons.tsx          # Todos los iconos SVG inline
│   ├── Logo.tsx           # Logo (luna creciente + wordmark)
│   ├── SectionHeader.tsx  # Cabecera reutilizable de cada sección
│   ├── TopBar.tsx         # Barra superior con logo y navegación
│   ├── Hero.tsx           # Cabecera con Mari y CTA principal
│   ├── ToolsSection.tsx   # Las 6 herramientas
│   ├── MythologySection.tsx  # Mari, Sugaar y las 4 criaturas
│   ├── AudienceSection.tsx   # Norentzat (etapas educativas)
│   ├── PrivacySection.tsx    # Privacidad y datos
│   ├── CTASection.tsx        # Llamada final
│   └── Footer.tsx            # Pie de página
└── public/
    └── mari-anboto.jpg    # Ilustración del hero
```

## Compilar para producción

```bash
npm run build
npm start
```

## Despliegue en Vercel

La forma más sencilla y gratuita:

1. **Subir el código a GitHub** (repositorio nuevo, puede ser privado).
2. Ir a [vercel.com](https://vercel.com) y conectar la cuenta con GitHub.
3. **Importar el repositorio**. Vercel detecta Next.js automáticamente.
4. Click en _Deploy_. En 1-2 minutos tendrás una URL tipo `gelakraft.vercel.app`.
5. **Añadir el dominio personalizado** en Settings → Domains: introducir `gelakraft.eus`.
6. Configurar los registros DNS en tu registrador (Vercel te indica los valores exactos).

Cada vez que hagas un `git push` a main, Vercel redespliega automáticamente.

## Próximos pasos del proyecto

Esta v1 es solo la landing pública. Próximas fases:

1. **Construir las 6 herramientas** (Sugaarren borroka, Mariren isiltasun-erronka, etc.)
2. **Sistema de cuentas de profesor** (registro, login, panel de gestión).
3. **Páginas internas** (`/tresnak`, `/nor-gara`, políticas legales).
4. **Sistema de cuestionarios** (para alimentar Sugaarren borroka).

## Licencia

Pendiente de definir. Probablemente Creative Commons + código fuente abierto.

---

© 2026 GELAKRAFT
