# Likrat Kalla — Deployment Guide

This guide walks through every step to go from a fresh clone of this repository to a
live, production website at `www.helpjewishbrides.org` running at **$0/month** on the
free tiers of Supabase + Vercel + Resend.

---

## Prerequisites

- Node.js 18+ and npm installed locally.
- A [Supabase](https://supabase.com) account (free).
- A [Vercel](https://vercel.com) account (free Hobby tier).
- A [Resend](https://resend.com) account (free tier: 3,000 emails/month).
- Access to the DNS settings for `helpjewishbrides.org` (managed by your domain registrar).

---

## Step 1 — Supabase: Create Project & Run Schema

### 1.1 Create a new Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Enter project name: `likrat-kalla`.
3. Choose a strong **database password** (save it — you will need it for migrations).
4. Select region: `eu-central-1` (Frankfurt) — closest to Israel.
5. Click **Create new project** and wait ~2 minutes for provisioning.

### 1.2 Run the database schema

1. In the Supabase dashboard, open your project and click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open [`supabase-schema.md`](./supabase-schema.md) in this repository and copy the entire
   SQL block (everything inside the triple-backtick code fence).
4. Paste it into the SQL Editor and click **Run** (▶).
5. Confirm success — you should see `Success. No rows returned` for most statements and
   seed data inserted for `prayer_reasons` and `site_settings`.

### 1.3 Verify tables were created

In the left sidebar, click **Table Editor**. You should see all 7 tables:

| Table | Purpose |
|---|---|
| `site_content` | Bilingual page copy |
| `site_media` | Gallery images and YouTube videos |
| `catalog_items` | Household gift items |
| `kallas` | Anonymous bride profiles |
| `prayer_reasons` | Tefillah dropdown options |
| `prayer_submissions` | Donor prayer requests |
| `site_settings` | Package price, event dates, admin emails |

### 1.4 Create an admin user

1. In the Supabase dashboard click **Authentication** → **Users** → **Add user**.
2. Enter Sadeena's email address and a strong password.
3. Toggle **Auto Confirm User** to `ON` (so she does not need to verify email first).
4. Click **Create user**.
5. Share the credentials with Sadeena securely (not over unencrypted email).
6. She can change her password after first login at `/en/admin/login`.

> **To add more admins later:** repeat this step for each additional admin email.

### 1.5 Create storage buckets

1. Click **Storage** in the left sidebar → **New bucket**.
2. Create the following two buckets:

   | Bucket name | Public? |
   |---|---|
   | `gallery` | ✅ Yes (public read so images load on the site) |
   | `catalog` | ✅ Yes (public read for item photos) |

3. For each bucket, click the bucket → **Policies** → **New policy** → Choose
   **"Give users access to only their own top level folder"** then customise:
   - **Allow SELECT** for `anon` role (public download).
   - **Allow INSERT / UPDATE / DELETE** for `authenticated` role only.
4. Click **Save policy**.

### 1.6 Collect your API keys

In the Supabase dashboard, click **Project Settings** → **API**. Copy:

- `Project URL` → used for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`.
- `anon / public` key → used for `SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- `service_role` key → used for `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ **Never expose the `service_role` key** in client-side code or public repositories.
> It bypasses Row Level Security and has full database access.

---

## Step 2 — Resend: Configure Transactional Email

Resend sends prayer-submission notifications to admins immediately after a donor submits.

### 2.1 Create an account and get your API key

1. Sign up at [https://resend.com](https://resend.com).
2. Click **API Keys** → **Create API Key**.
3. Name it `likrat-kalla-production`.
4. Copy the key — it will only be shown once.

### 2.2 Verify your sender domain

To send from `donations@helpjewishbrides.org` (instead of a `resend.dev` address):

1. In Resend, click **Domains** → **Add domain**.
2. Enter `helpjewishbrides.org`.
3. Resend will give you 2–3 DNS records (TXT or CNAME) to add to your domain registrar.
4. Add those DNS records (see Step 4 for DNS access instructions).
5. Click **Verify** in Resend. Verification usually takes 5–15 minutes.

> **Free tier:** 3,000 emails/month — more than enough for Likrat Kalla's volume.
> If the domain is not verified yet, Resend will send from an `onboarding@resend.dev`
> address as a fallback — still functional for testing.

---

## Step 3 — Vercel: Deploy the Application

### 3.1 Push the repository to GitHub

If the code is not already on GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create likrat-kalla --private --source=. --push
```

Or create the repository on [github.com](https://github.com) and push manually.

### 3.2 Import project into Vercel

1. Go to [https://vercel.com/new](https://vercel.com/new).
2. Click **Import Git Repository** and connect your GitHub account.
3. Select the `likrat-kalla` repository.
4. Vercel will detect **Next.js** automatically. Leave all build settings at their defaults:
   - **Framework Preset:** Next.js
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `npm ci`

### 3.3 Add environment variables

Before clicking **Deploy**, scroll down to **Environment Variables** and add each variable:

| Variable | Value | Notes |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | From Step 1.6 |
| `SUPABASE_ANON_KEY` | `eyJ...` | From Step 1.6 |
| `NEXT_PUBLIC_SUPABASE_URL` | Same as `SUPABASE_URL` | Browser-accessible |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same as `SUPABASE_ANON_KEY` | Browser-accessible |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | From Step 1.6 — server only |
| `RESEND_API_KEY` | `re_...` | From Step 2.1 |
| `EMAIL_FROM` | `Likrat Kalla <donations@helpjewishbrides.org>` | After domain verified |
| `NEXT_PUBLIC_SITE_URL` | `https://www.helpjewishbrides.org` | Final production URL |
| `LEMAAN_ACHAI_BASE_URL` | `https://www.lemaanachai.org` | Payment gateway |

> **Set environment for:** All three environments (Production, Preview, Development)
> unless you want different Supabase projects for staging — for a small site, one project
> for all environments is fine.

### 3.4 Deploy

Click **Deploy**. Vercel will:

1. Clone the repository.
2. Install dependencies (`npm ci`).
3. Run `npm run build`.
4. Publish to a `*.vercel.app` preview URL (e.g. `likrat-kalla.vercel.app`).

The first deploy takes ~2 minutes. Once complete, open the preview URL and verify:
- The site loads in both English and Hebrew (`/en` and `/he`).
- Gallery and catalog pages render (they will use seed data until Supabase is populated).
- The admin login page is accessible at `/en/admin/login`.

---

## Step 4 — Custom Domain: `www.helpjewishbrides.org`

### 4.1 Add the domain to Vercel

1. In your Vercel project, click **Settings** → **Domains**.
2. Click **Add** and enter `www.helpjewishbrides.org`.
3. Also add the apex domain `helpjewishbrides.org` — Vercel will automatically redirect
   the apex to `www`.
4. Vercel will show the DNS records you need to set.

### 4.2 Update DNS records at your registrar

Log in to wherever `helpjewishbrides.org` is registered (e.g., GoDaddy, Namecheap, Wix,
Cloudflare). Open the DNS management panel and add/update:

| Type | Name | Value | TTL |
|---|---|---|---|
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 (or Auto) |
| `A` | `@` (apex) | `76.76.21.21` | 3600 (or Auto) |

> **If using Cloudflare:** Set the proxy status to **DNS only** (grey cloud) for the
> `www` and `@` records until the domain is verified in Vercel, then you can optionally
> re-enable proxying.

> **Wix DNS Note:** If the domain is still pointed at the old Wix site, you must remove
> the existing `A` and `CNAME` records for `@` and `www` before adding the Vercel ones.

### 4.3 Add Resend's domain verification records (if not done already)

While in the DNS panel, also add the TXT/CNAME records that Resend provided in Step 2.2.

### 4.4 Wait for propagation

DNS changes typically propagate within 5–30 minutes, occasionally up to 24 hours.

To check propagation status:
```bash
nslookup www.helpjewishbrides.org
# Expected: resolves to Vercel's IP
```

Or use [https://dnschecker.org](https://dnschecker.org).

### 4.5 Verify SSL certificate

Once DNS propagates, Vercel automatically provisions a **free Let's Encrypt SSL certificate**
for `www.helpjewishbrides.org` and `helpjewishbrides.org`. In Vercel's **Domains** panel,
you should see a green ✅ next to both domains.

---

## Step 5 — Lemaan Achai Redirection (Old Wix Site Handover)

The previous Wix site at `www.helpjewishbrides.org` must be decommissioned once the new
site is live. Complete this checklist with the Lemaan Achai / Wix account holder:

- [ ] Confirm the Wix site is no longer the active DNS target (DNS now points to Vercel).
- [ ] Log into Wix and **Unpublish** or **Disconnect the domain** from the Wix site.
- [ ] Confirm that `www.helpjewishbrides.org` loads the new Next.js site correctly.
- [ ] Confirm that `helpjewishbrides.org` (no www) redirects to `www.helpjewishbrides.org`.
- [ ] Test the payment handoff: click any "Donate Now" button → confirm it redirects
  correctly to the Lemaan Achai campaign page (coordinate the exact URL with the
  Lemaan Achai programmer — see `src/lib/lemaan-achai.ts` and the spec in
  `likrat-kalla-development-plan.md` §4.5).

---

## Step 6 — Production Smoke Test Checklist

After the domain is live, run through this checklist:

### Public Pages
- [ ] `https://www.helpjewishbrides.org/en` loads the English homepage.
- [ ] `https://www.helpjewishbrides.org/he` loads the Hebrew homepage with RTL layout.
- [ ] Language switcher in the header toggles between EN and HE on every page.
- [ ] Navigation links work: Home, About Us, Donate & Sponsor, Contact Us.
- [ ] Footer shows Lemaan Achai endorsement and admin login link.

### Chinese Auction Banner
- [ ] If today's date is within the configured range (check **Admin → Settings**), the
  event banner appears in the header.
- [ ] The banner links correctly to `https://www.lkauction.com`.

### Donation Flows
- [ ] **General Donation** CTA opens the Lemaan Achai donation page.
- [ ] **Sponsor a Package**: Fill out a prayer form and submit. Verify:
  - A row is created in `prayer_submissions` (check Supabase Table Editor).
  - An email notification is received at the configured admin email.
  - The donor is redirected to the Lemaan Achai payment portal with the correct `amount`.
- [ ] **Catalog Donation**: Add items, see running total update, click checkout.
- [ ] **Sponsor a Kalla**: Browse by date and by story, complete the prayer form.

### Admin Portal
- [ ] `https://www.helpjewishbrides.org/en/admin/login` shows the login form.
- [ ] Log in with Sadeena's credentials (created in Step 1.4).
- [ ] Admin dashboard loads. All 6 sections are accessible.
- [ ] Edit a piece of site content and verify it appears on the public page.
- [ ] Upload a test image to the gallery. Verify it appears on the About page.
- [ ] View the **Prayers** section — the submitted test prayer from above should appear.
- [ ] Open **Print View** for prayers and verify it renders cleanly for printing.

### Mobile Responsiveness
- [ ] Test the homepage on a mobile device or browser DevTools at 375px width.
- [ ] Test the Hebrew homepage at 375px — confirm RTL layout is correct.
- [ ] Test the donate form on mobile — prayer name inputs and quantity selector usable.

---

## Ongoing Maintenance

### Updating the site
Content changes (text, prices, gallery, brides) are made through the **Admin Portal** at
`/admin` — no code deployments needed.

For code changes: push to the `main` branch on GitHub → Vercel automatically rebuilds
and deploys within ~2 minutes.

### Supabase free tier limits
- Database: 500 MB storage — sufficient for years of content.
- Storage: 1 GB for media — ~2,000–5,000 photos at typical sizes.
- If limits are approached, archive old `prayer_submissions` rows and compress images
  before uploading.

### Domain renewal
Ensure `helpjewishbrides.org` domain registration is renewed annually through your
registrar. Set up auto-renewal if available.

### Admin user management
Add or remove admin accounts directly in the Supabase dashboard under
**Authentication → Users**. No code changes required.
