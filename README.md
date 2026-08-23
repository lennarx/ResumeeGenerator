# JobFinder

PWA para gestionar CVs y postulaciones laborales. Next.js (App Router) + TypeScript + Tailwind CSS.

Los CVs y postulaciones se guardan en Supabase (Postgres + Storage), accedido solo desde el servidor con la `service_role` key — sin autenticación, sin llamadas a IA todavía.

## Desarrollo

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

> El service worker de PWA (`@ducanh2912/next-pwa`) está deshabilitado en desarrollo y solo se genera en `npm run build`.

## Estructura

- `app/cvs`, `app/nueva`, `app/historial` — las 3 pantallas principales, navegadas por el `BottomNav`.
- `lib/supabase-admin.ts` — cliente de Supabase server-only (nunca se importa desde un client component).
- `lib/seed-data.ts` — CVs y postulaciones de ejemplo, para cargar a mano en Supabase.
- `supabase/schema.sql` — esquema de las tablas `cvs` y `applications`.
- `scripts/setup-storage.mjs` — crea el bucket privado `cvs-files` (correr una vez con las credenciales reales en `.env.local`).
- `scripts/generate-icons.mjs` — genera los íconos placeholder de `public/icons`.
