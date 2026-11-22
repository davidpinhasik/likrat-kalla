import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Likrat Kalla',
  description: 'Helping Jewish Brides',
};

// The <html> and <body> tags live in src/app/[locale]/layout.tsx, because they
// need the page language, text direction and fonts. Rendering them here too
// would nest one <html> inside another.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
