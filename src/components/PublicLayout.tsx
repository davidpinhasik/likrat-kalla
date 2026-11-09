import { getLocale } from 'next-intl/server';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteSetting } from '@/lib/data/settings';
import { getSiteContent } from '@/lib/data/content';
import type { Locale } from '@/types/database';

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const locale = (await getLocale()) === 'he' ? 'he' : 'en';
  // Pages are statically cached, so the date check happens in the browser
  // (see Navbar). The server only passes the settings.
  const [auction, content] = await Promise.all([
    getSiteSetting('chinese_auction'),
    getSiteContent(locale as Locale),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        auctionEnabled={auction.enabled}
        auctionFromDate={auction.start_date}
        auctionToDate={auction.end_date}
        auctionUrl={auction.url}
      />
      <main className="flex-1">{children}</main>
      <Footer
        phone={content['contact_phone']?.trim()}
        phoneNote={content['contact_phone_note']?.trim()}
      />
    </div>
  );
}
