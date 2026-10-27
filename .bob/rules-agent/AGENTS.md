# Coding Rules & Implementation Patterns (Non-Obvious Only)

- **Always use `withFallback()` for data access functions** in `src/lib/data/` so public pages never throw during build time when Supabase environment variables are missing.
- **Do not call `cookies()` in public read functions:** Use `getPublicClient()` from `src/lib/data/client.ts` rather than `src/lib/supabase/server.ts` so public pages remain statically optimizable.
- **Service role security:** Never import `src/lib/supabase/admin.ts` into client components (`'use client'`). It imports `server-only` and will fail the build if bundled into client assets.
- **Supabase TypeScript types:** Keep all entity schemas in `src/types/database.ts` as `type` rather than `interface` to prevent generic type inference errors on Supabase `.insert()` / `.update()` queries.
- **RTL Icon flipping:** Chevrons, back arrows, and directional indicators must include `rtl:rotate-180` or conditional logic based on locale/direction.
