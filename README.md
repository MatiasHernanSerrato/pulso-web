# pulso-web

El frontend web de Pulso. Dashboard para ver el peso, los gastos y las anomalias que el backend detecta, con graficos lindos.

## Stack

- Next.js 15 con App Router y Server Components
- React 19
- Tailwind v4 (sin config, todo en css)
- TypeScript

Estoy probando el motor nuevo de Tailwind v4. Tiene algunos bugs todavia pero el DX me cierra.

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

- `NEXT_PUBLIC_API_URL`: URL del GraphQL del backend (public, va al bundle)
- `API_URL`: misma URL pero sin `/graphql` al final, para los rewrites de server

El `vercel.json` ya tiene los headers de seguridad basicos y el region fijado en gru1 (Sao Paulo) para quedar cerca del backend en fly.
