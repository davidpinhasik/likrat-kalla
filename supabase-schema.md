# Likrat Kalla — Supabase Database Schema & RLS Policies

```sql
-- ==============================================================================
-- Likrat Kalla Website - Supabase Postgres Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Site Content Table (Dynamic Copy in English & Hebrew)
CREATE TABLE IF NOT EXISTS public.site_content (
    key TEXT NOT NULL,
    locale TEXT NOT NULL CHECK (locale IN ('en', 'he')),
    value TEXT NOT NULL DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (key, locale)
);

-- 3. Site Media Table (Carousels, Galleries, Videos)
CREATE TABLE IF NOT EXISTS public.site_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT NOT NULL CHECK (section IN ('landing_carousel', 'about_gallery', 'events', 'general')),
    category TEXT CHECK (category IN ('yearly_events', 'parlor_meetings', 'distribution_days', 'special_videos', 'other')),
    media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
    url TEXT NOT NULL,
    title_en TEXT,
    title_he TEXT,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Item Catalog (Household gifts given to brides)
CREATE TABLE IF NOT EXISTS public.catalog_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en TEXT NOT NULL,
    title_he TEXT NOT NULL,
    description_en TEXT,
    description_he TEXT,
    price_nis NUMERIC NOT NULL DEFAULT 0,
    image_url TEXT,
    category TEXT NOT NULL DEFAULT 'core_package_item' CHECK (category IN ('core_package_item', 'random_choice_item')),
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Kallas List (Anonymous brides available for sponsorship)
CREATE TABLE IF NOT EXISTS public.kallas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wedding_date DATE NOT NULL,
    story_en TEXT NOT NULL,
    story_he TEXT NOT NULL,
    target_amount_nis NUMERIC NOT NULL DEFAULT 500,
    is_sponsored BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Prayer Reasons (Tefillah dropdown reasons)
CREATE TABLE IF NOT EXISTS public.prayer_reasons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label_en TEXT NOT NULL,
    label_he TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Prayer Submissions (Donor submissions to be prayed for & emailed to admins)
CREATE TABLE IF NOT EXISTS public.prayer_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    donor_phone TEXT,
    sponsorship_type TEXT NOT NULL CHECK (sponsorship_type IN ('package', 'kalla_by_date', 'kalla_by_story', 'catalog_items', 'general')),
    kalla_id UUID REFERENCES public.kallas(id) ON DELETE SET NULL,
    amount_nis NUMERIC NOT NULL DEFAULT 0,
    names_list JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of objects: [{ name: "...", reason_id: "...", note: "..." }]
    emailed_to_admin BOOLEAN NOT NULL DEFAULT false,
    is_printed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Site Settings (Pricing, Event banner date ranges, admin emails)
CREATE TABLE IF NOT EXISTS public.site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- Default Seed Data
-- ==============================================================================

-- Prayer Reasons Seed
INSERT INTO public.prayer_reasons (label_en, label_he, display_order) VALUES
('Refuah Shleima (Speedy Recovery)', 'רפואה שלמה', 1),
('Shidduch / Zivug Hagun (Marriage Match)', 'זיווג הגון / שידוך', 2),
('Ilui Neshama (In Memory of)', 'לעילוי נשמת', 3),
('Parnasah Tova (Livelihood & Success)', 'פרנסה טובה והצלחה', 4),
('Zera Shel Kayama (Healthy Children)', 'זרע של קיימא', 5),
('General Blessing / Hatzlacha', 'ברכה והצלחה כללית', 6)
ON CONFLICT DO NOTHING;

-- Initial Site Settings
INSERT INTO public.site_settings (key, value, description) VALUES
('package_cost_nis', '500'::jsonb, 'Default cost to sponsor a bride gift package in NIS'),
('admin_emails', '["admin@helpjewishbrides.org"]'::jsonb, 'Emails that receive prayer notifications and donor details'),
('chinese_auction', '{"enabled": true, "start_date": "2025-01-01", "end_date": "2025-03-31", "url": "https://www.lkauction.com"}'::jsonb, 'Chinese auction annual event banner settings'),
('lemaan_achai_donation_url', '"https://www.lemaanachai.org/en/project/likrat-kalla"'::jsonb, 'Lemaan Achai Likrat Kalla direct donation portal URL')
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- Row Level Security (RLS) Setup
-- ==============================================================================
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kallas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prayer_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public READ access for public website tables
CREATE POLICY "Public Read Site Content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Public Read Site Media" ON public.site_media FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Catalog Items" ON public.catalog_items FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Kallas" ON public.kallas FOR SELECT USING (true);
CREATE POLICY "Public Read Prayer Reasons" ON public.prayer_reasons FOR SELECT USING (is_active = true);
CREATE POLICY "Public Read Site Settings" ON public.site_settings FOR SELECT USING (true);

-- Public INSERT for donor prayer submissions
CREATE POLICY "Public Insert Prayer Submissions" ON public.prayer_submissions FOR INSERT WITH CHECK (true);

-- Authenticated Admin FULL ACCESS on all tables
CREATE POLICY "Admin Full Access Site Content" ON public.site_content FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Site Media" ON public.site_media FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Catalog Items" ON public.catalog_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Kallas" ON public.kallas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Prayer Reasons" ON public.prayer_reasons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Prayer Submissions" ON public.prayer_submissions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin Full Access Site Settings" ON public.site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
```
