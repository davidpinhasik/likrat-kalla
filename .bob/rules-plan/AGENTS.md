# Architectural Decisions & Planning Constraints (Non-Obvious Only)

- **Zero-Cost Free Tier Architecture:** Unified Next.js on Vercel + Supabase (Postgres, Auth, Storage) + Resend (email alerts). No separate Railway backend server is needed, keeping monthly runtime costs at $0.00.
- **Prayer Submission Workflow:** Donor tefillah submissions (up to 3 names per package/kalla) must be stored in `prayer_submissions`, emailed to admins, and printable for distribution days before redirecting the donor to Lemaan Achai checkout.
- **Dynamic CMS Scope:** Sadeena and admins manage copy, photos, catalog items, and anonymous bride profiles via Supabase authenticated `/admin` portal without code changes.
