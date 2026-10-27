import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getSiteSetting } from '@/lib/data/settings';

type PublicLayoutProps = {
  children: React.ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  // Fetch auction settings server-side so the banner decision is authoritative
  const auction = await getSiteSetting('chinese_auction');

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
      <Footer />
    </div>
  );
}
