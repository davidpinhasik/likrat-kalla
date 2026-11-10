import type { Metadata } from 'next';

type Props = {
  children: React.ReactNode;
};

// Admin pages must never appear in search results.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: Props) {
  return <>{children}</>;
}
