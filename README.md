# pulso-web

El frontend web de Pulso. Dashboard para ver el peso, los gastos y las anomalias que el backend detecta, con graficos lindos.

Parte del proyecto Pulso: [pulso-api](https://github.com/MatiasHernanSerrato/pulso-api) (Go + GraphQL) y [pulso-mobile](https://github.com/MatiasHernanSerrato/pulso-mobile) (Flutter).

![next](https://img.shields.io/badge/next.js-15-black)
![react](https://img.shields.io/badge/react-19-61DAFB)
![tailwind](https://img.shields.io/badge/tailwind-v4-38B2AC)
![typescript](https://img.shields.io/badge/typescript-5.6-3178C6)
![vercel](https://img.shields.io/badge/deploy-vercel-000000)

## Indice

- [Pantallas](#pantallas)
- [Stack](#stack)
- [Estructura](#estructura)
- [Correrlo](#correrlo)
- [Env](#env)
- [Deploy](#deploy)
- [Healthchecks](#healthchecks)
- [SEO](#seo)

## Pantallas

<p align="center">
  <img src="public/screenshots/resumen.png" alt="dashboard resumen" width="720" />
</p>

<p align="center">
  <img src="public/screenshots/salud.png" alt="detalle salud" width="360" />
  <img src="public/screenshots/plata.png" alt="detalle finanzas" width="360" />
</p>

El layout es responsive pero el dashboard real brilla desde 1024 px para arriba, que es donde agregamos la sidebar fija y los graficos crecen al ancho que necesitan. En mobile se vuelve una columna con las cards apiladas.

## Stack

- Next.js 15 con App Router y Server Components
- React 19
- Tailwind v4 (sin config, todo en css)
- TypeScript 5.6 con `moduleResolution: bundler`
- shadcn/ui para primitivos (Dialog, Dropdown, Tabs)
- Visx para graficos (el area chart y el pie chart del dashboard)
- urql como cliente de GraphQL, con codegen para los hooks tipados

Estoy probando el motor nuevo de Tailwind v4. Tiene algunos bugs todavia pero el DX me cierra: cero configuracion y los tokens de color viven directo en `@theme` en el CSS.

## Estructura

```
app/
  layout.tsx            ; root layout + ThemeProvider
  globals.css           ; @theme + variables de tailwind v4
  page.tsx              ; landing (redirige a /dashboard si hay cookie)
  login/                ; server action que setea la cookie pulso_session
  dashboard/            ; /resumen /salud /finanzas con layout compartido
  healthz/route.ts      ; endpoint para uptime checks
  robots.ts             ; noindex en previews, index en prod
  sitemap.ts            ; solo en prod
  api/graphql/          ; proxy del endpoint para no exponer la URL cruda
components/
  ui/                   ; shadcn primitives
  dashboard/            ; cards, charts, sidebar
  theme-provider.tsx
lib/
  urql/                 ; client factory + ssr cache
  queries/              ; graphql documents + types generados
middleware.ts           ; valida la cookie de session en rutas /dashboard
```

## Correrlo

Hace falta Node 20+. Despues:

```bash
npm install
npm run dev
```

Abre en http://localhost:3000.

## Env

Copia `.env.example` a `.env.local` y cambia lo que haga falta. Por ahora solo esta la URL del GraphQL del backend.

## Deploy

Esta configurado para Vercel. En el dashboard del proyecto hay que setear:

- `NEXT_PUBLIC_API_URL`: URL del GraphQL del backend (public, va al bundle). En prod, `https://pulso-api.fly.dev/graphql`.
- `API_URL`: misma URL pero sin `/graphql` al final, para los rewrites de server. En prod, `https://pulso-api.fly.dev`.

El `vercel.json` ya tiene los headers de seguridad basicos y el region fijado en gru1 (Sao Paulo) para quedar cerca del backend en fly.

### Healthchecks

- `/healthz` devuelve `{status, service, commit, region}` sin pegarle a la api. Me sirve para los uptime checks y para que Vercel pueda monitorearlo.
- `/status` es un alias por rewrite, por si alguien busca el path ese.

### SEO

Los preview deploys (`VERCEL_ENV !== "production"`) devuelven `X-Robots-Tag: noindex` via `app/robots.ts` y el metadata del layout, asi no terminan rankeando antes que la prod. El sitemap solo se publica cuando `VERCEL_ENV === "production"`.
