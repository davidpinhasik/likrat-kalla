import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Likrat Kalla',
  description: 'Helping Jewish Brides',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
