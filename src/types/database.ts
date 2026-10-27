/**
 * Database types for the Likrat Kalla Supabase (Postgres) schema.
 * Mirrors supabase-schema.md. Keep in sync when the schema changes.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Locale = 'en' | 'he';

export type MediaSection =
  | 'landing_carousel'
  | 'about_gallery'
  | 'events'
  | 'general';

export type MediaCategory =
  | 'yearly_events'
  | 'parlor_meetings'
  | 'distribution_days'
  | 'special_videos'
  | 'other';

export type MediaType = 'image' | 'video';

export type CatalogCategory = 'core_package_item' | 'random_choice_item';

export type SponsorshipType =
  | 'package'
  | 'kalla_by_date'
  | 'kalla_by_story'
  | 'catalog_items'
  | 'general';

/** One entry of prayer_submissions.names_list */
export type PrayerName = {
  name: string;
  reason_id?: string | null;
  note?: string | null;
}

/** Shape of the `chinese_auction` site_settings value. */
export type ChineseAuctionSettings = {
  enabled: boolean;
  start_date: string;
  end_date: string;
  url: string;
}

/** Known site_settings keys and their JSON value types. */
export type SiteSettingValues = {
  package_cost_nis: number;
  admin_emails: string[];
  chinese_auction: ChineseAuctionSettings;
  lemaan_achai_donation_url: string;
}

export type SiteSettingKey = keyof SiteSettingValues;

// ---------------------------------------------------------------------------
// Row interfaces
// ---------------------------------------------------------------------------

export type SiteContent = {
  key: string;
  locale: Locale;
  value: string;
  updated_at: string;
}

export type SiteMedia = {
  id: string;
  section: MediaSection;
  category: MediaCategory | null;
  media_type: MediaType;
  url: string;
  title_en: string | null;
  title_he: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type CatalogItem = {
  id: string;
  title_en: string;
  title_he: string;
  description_en: string | null;
  description_he: string | null;
  price_nis: number;
  image_url: string | null;
  category: CatalogCategory;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type Kalla = {
  id: string;
  /** ISO date (YYYY-MM-DD) */
  wedding_date: string;
  story_en: string;
  story_he: string;
  target_amount_nis: number;
  is_sponsored: boolean;
  created_at: string;
}

export type PrayerReason = {
  id: string;
  label_en: string;
  label_he: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export type PrayerSubmission = {
  id: string;
  donor_name: string;
  donor_email: string;
  donor_phone: string | null;
  sponsorship_type: SponsorshipType;
  kalla_id: string | null;
  amount_nis: number;
  names_list: PrayerName[];
  emailed_to_admin: boolean;
  is_printed: boolean;
  created_at: string;
}

export type SiteSetting = {
  key: string;
  value: Json;
  description: string | null;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Insert / Update helpers
// ---------------------------------------------------------------------------

export type SiteContentInsert = Pick<SiteContent, 'key' | 'locale'> &
  Partial<Pick<SiteContent, 'value' | 'updated_at'>>;

export type SiteMediaInsert = Pick<SiteMedia, 'section' | 'media_type' | 'url'> &
  Partial<Omit<SiteMedia, 'section' | 'media_type' | 'url'>>;

export type CatalogItemInsert = Pick<CatalogItem, 'title_en' | 'title_he'> &
  Partial<Omit<CatalogItem, 'title_en' | 'title_he'>>;

export type KallaInsert = Pick<Kalla, 'wedding_date' | 'story_en' | 'story_he'> &
  Partial<Omit<Kalla, 'wedding_date' | 'story_en' | 'story_he'>>;

export type PrayerReasonInsert = Pick<PrayerReason, 'label_en' | 'label_he'> &
  Partial<Omit<PrayerReason, 'label_en' | 'label_he'>>;

export type PrayerSubmissionInsert = Pick<
  PrayerSubmission,
  'donor_name' | 'donor_email' | 'sponsorship_type'
> &
  Partial<
    Omit<PrayerSubmission, 'donor_name' | 'donor_email' | 'sponsorship_type'>
  >;

export type SiteSettingInsert = Pick<SiteSetting, 'key' | 'value'> &
  Partial<Omit<SiteSetting, 'key' | 'value'>>;

// ---------------------------------------------------------------------------
// Supabase Database generic
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      site_content: {
        Row: SiteContent;
        Insert: SiteContentInsert;
        Update: Partial<SiteContent>;
        Relationships: [];
      };
      site_media: {
        Row: SiteMedia;
        Insert: SiteMediaInsert;
        Update: Partial<SiteMedia>;
        Relationships: [];
      };
      catalog_items: {
        Row: CatalogItem;
        Insert: CatalogItemInsert;
        Update: Partial<CatalogItem>;
        Relationships: [];
      };
      kallas: {
        Row: Kalla;
        Insert: KallaInsert;
        Update: Partial<Kalla>;
        Relationships: [];
      };
      prayer_reasons: {
        Row: PrayerReason;
        Insert: PrayerReasonInsert;
        Update: Partial<PrayerReason>;
        Relationships: [];
      };
      prayer_submissions: {
        Row: PrayerSubmission;
        Insert: PrayerSubmissionInsert;
        Update: Partial<PrayerSubmission>;
        Relationships: [
          {
            foreignKeyName: 'prayer_submissions_kalla_id_fkey';
            columns: ['kalla_id'];
            isOneToOne: false;
            referencedRelation: 'kallas';
            referencedColumns: ['id'];
          },
        ];
      };
      site_settings: {
        Row: SiteSetting;
        Insert: SiteSettingInsert;
        Update: Partial<SiteSetting>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
