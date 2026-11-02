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
  // Fetch auction settings server-side so the banner decision is authoritative
  const [auction, content] = await Promise.all([
    getSiteSetting('chinese_auction'),
    getSiteContent(locale as Locale),
  ]);

  const now = new Date();
  const start = new Date(auction.start_date);
  const end = new Date(auction.end_date);
  end.setUTCHours(23, 59, 59, 999);
  const auctionActive = auction.enabled && now >= start && now <= end;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        auctionActive={auctionActive}
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
