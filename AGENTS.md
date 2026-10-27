# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Commands
- **Dev:** `npm run dev` (runs Next.js with Turbopack)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (runs `eslint src` using ESLint 9 flat config)
- **Typecheck:** `npx tsc --noEmit`

## Architecture & Non-Obvious Project Conventions

### 1. Bilingual i18n & RTL Layout
- Locales are `'en'` and `'he'` configured via `next-intl` in [`src/i18n/routing.ts`](src/i18n/routing.ts) with `localePrefix: 'always'`.
- All routes live under `src/app/[locale]/...`. Root [`src/app/page.tsx`](src/app/page.tsx) automatically redirects to `/en`.
- Direction (`dir="rtl"` vs `dir="ltr"`) and Hebrew Google fonts (`Heebo`, `Rubik`) are dynamically applied in [`src/app/[locale]/layout.tsx`](src/app/[locale]/layout.tsx). Use `rtl:` Tailwind variants for directional icons/chevrons.

### 2. Resilient Data Layer & Zero-Config Fallbacks
- Data fetching in [`src/lib/data/`](src/lib/data/) wraps Supabase queries in `withFallback()` ([`src/lib/data/client.ts`](src/lib/data/client.ts)). When Supabase env vars are missing or queries fail, it gracefully returns seed mock data from [`src/lib/data/seed.ts`](src/lib/data/seed.ts) without crashing or breaking static site generation.
- **Client Separation:**
  - `getPublicClient()` ([`src/lib/data/client.ts`](src/lib/data/client.ts)): Cookieless anon client for public reads/inserts without breaking SSG.
  - `createClient()` ([`src/lib/supabase/server.ts`](src/lib/supabase/server.ts)): Cookie-based SSR client for authenticated admin sessions.
  - `getAdminClient()` ([`src/lib/supabase/admin.ts`](src/lib/supabase/admin.ts)): Protected with `import 'server-only'` to prevent leaking service role keys.

### 3. Database Types
- Table definitions in [`src/types/database.ts`](src/types/database.ts) must remain `type` aliases (not `interface`) to satisfy generic Supabase `.insert()` / `.update()` constraint checking.

### 4. Custom Design Tokens
- Brand colors are configured in [`tailwind.config.js`](tailwind.config.js): `brand.gold` (`#d4af37`), `brand.gold-hover` (`#c59b27`), `brand.navy` (`#0f172a`), `brand.navy-light` (`#1e293b`), `brand.cream` (`#faf8f5`).
