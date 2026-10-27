import SettingsManager from '@/components/admin/SettingsManager';
import { getSiteSettings } from '@/lib/data/settings';

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsManager initialSettings={settings} />;
}
