import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/actions/admin';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/** Authenticated admin layout without the dashboard shell, for print pages. */
export default async function AdminPrintLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return <>{children}</>;
}
