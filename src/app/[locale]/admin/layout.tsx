import { redirect } from 'next/navigation';
import { getAdminSession } from '@/app/actions/admin';
import AdminShell from '@/components/admin/AdminShell';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  const session = await getAdminSession();

  if (!session) {
    redirect(`/${locale}/admin/login`);
  }

  return <AdminShell locale={locale}>{children}</AdminShell>;
}
