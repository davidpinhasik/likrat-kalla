# Project Structure & Context Rules (Non-Obvious Only)

- **Translations:** UI strings are split into `messages/en.json` and `messages/he.json`. Next-intl middleware in `middleware.ts` enforces `/[locale]/...` prefixes for all app routes.
- **Payment Gateway:** Likrat Kalla does not process credit cards directly; donations and sponsorships compute totals and branch to Lemaan Achai's secure payment portal.
- **Data Fallback System:** Fallback mock data in `src/lib/data/seed.ts` mirrors the SQL schema defined in `supabase-schema.md` and provides offline capability during development.
- **Event Link Scheduling:** Chinese auction navbar link and top banner visibility are controlled dynamically via `isAuctionBannerActive()` checking `site_settings.chinese_auction` date bounds.
