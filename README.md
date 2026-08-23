# JobFinder

PWA para gestionar CVs y postulaciones laborales. Next.js (App Router) + TypeScript + Tailwind CSS.

Este es el esqueleto de frontend con datos mockeados en memoria (`lib/mock-data.ts`) — sin backend, sin base de datos, sin llamadas a IA todavía.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

> El service worker de PWA (`@ducanh2912/next-pwa`) está deshabilitado en desarrollo y solo se genera en `npm run build`.

## Estructura

- `app/cvs`, `app/nueva`, `app/historial` — las 3 pantallas principales, navegadas por el `BottomNav`.
- `lib/mock-data.ts` — CVs y postulaciones de ejemplo.
- `scripts/generate-icons.mjs` — genera los íconos placeholder de `public/icons`.
