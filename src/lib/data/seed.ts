/**
 * Fallback seed data used when Supabase is not configured or a query fails.
 * Lets the site build and render locally with zero setup.
 */
import type {
  CatalogItem,
  Kalla,
  PrayerReason,
  SiteMedia,
  SiteSettingValues,
} from '@/types/database';

const SEED_TIMESTAMP = '2025-01-01T00:00:00.000Z';

/** Default values for the known site_settings keys (matches supabase-schema.md). */
export const SEED_SETTINGS: SiteSettingValues = {
  package_cost_nis: 500,
  admin_emails: ['admin@helpjewishbrides.org'],
  chinese_auction: {
    enabled: true,
    start_date: '2025-01-01',
    end_date: '2025-03-31',
    url: 'https://www.lkauction.com',
  },
  lemaan_achai_donation_url:
    'https://www.lemaanachai.org/en/project/likrat-kalla',
};

/** Dynamic copy overrides. Empty: pages fall back to the next-intl message files. */
export const SEED_CONTENT: Record<'en' | 'he', Record<string, string>> = {
  en: {},
  he: {},
};

export const SEED_PRAYER_REASONS: PrayerReason[] = [
  ['Refuah Shleima (Speedy Recovery)', 'רפואה שלמה'],
  ['Shidduch / Zivug Hagun (Marriage Match)', 'זיווג הגון / שידוך'],
  ['Ilui Neshama (In Memory of)', 'לעילוי נשמת'],
  ['Parnasah Tova (Livelihood & Success)', 'פרנסה טובה והצלחה'],
  ['Zera Shel Kayama (Healthy Children)', 'זרע של קיימא'],
  ['General Blessing / Hatzlacha', 'ברכה והצלחה כללית'],
].map(([label_en, label_he], i) => ({
  id: `seed-prayer-reason-${i + 1}`,
  label_en,
  label_he,
  display_order: i + 1,
  is_active: true,
  created_at: SEED_TIMESTAMP,
}));

export const SEED_CATALOG_ITEMS: CatalogItem[] = [
  {
    id: 'seed-catalog-1',
    title_en: 'Bed Linens Set',
    title_he: 'סט מצעים',
    description_en: 'A complete set of bed linens for the new home.',
    description_he: 'סט מצעים מלא לבית החדש.',
    price_nis: 120,
    image_url: null,
    category: 'core_package_item',
    display_order: 1,
    is_active: true,
    created_at: SEED_TIMESTAMP,
  },
  {
    id: 'seed-catalog-2',
    title_en: 'Kitchen Cookware Set',
    title_he: 'סט כלי בישול',
    description_en: 'Pots and pans to start a new kitchen.',
    description_he: 'סירים ומחבתות להקמת מטבח חדש.',
    price_nis: 180,
    image_url: null,
    category: 'core_package_item',
    display_order: 2,
    is_active: true,
    created_at: SEED_TIMESTAMP,
  },
  {
    id: 'seed-catalog-3',
    title_en: 'Electric Kettle',
    title_he: 'קומקום חשמלי',
    description_en: 'A household essential, chosen from our available stock.',
    description_he: 'פריט חיוני לבית, נבחר מהמלאי הזמין.',
    price_nis: 60,
    image_url: null,
    category: 'random_choice_item',
    display_order: 3,
    is_active: true,
    created_at: SEED_TIMESTAMP,
  },
];

export const SEED_KALLAS: Kalla[] = [
  {
    id: 'seed-kalla-1',
    wedding_date: '2025-06-15',
    story_en:
      'An orphaned bride from a modest family, preparing to build a Jewish home with very limited means.',
    story_he:
      'כלה יתומה ממשפחה צנועה, המתכוננת להקים בית יהודי באמצעים מוגבלים מאוד.',
    target_amount_nis: 500,
    is_sponsored: false,
    created_at: SEED_TIMESTAMP,
  },
  {
    id: 'seed-kalla-2',
    wedding_date: '2025-07-02',
    story_en:
      'A young bride whose family cannot afford the basic household items needed for a new home.',
    story_he:
      'כלה צעירה שמשפחתה אינה יכולה לממן את פריטי הבית הבסיסיים הדרושים לבית חדש.',
    target_amount_nis: 500,
    is_sponsored: false,
    created_at: SEED_TIMESTAMP,
  },
];

export const SEED_MEDIA: SiteMedia[] = [];
