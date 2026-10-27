import { getSiteContent } from '@/lib/data/content';
import ContentEditor from '@/components/admin/ContentEditor';

type Props = { params: Promise<{ locale: string }> };

export default async function AdminContentPage({ params }: Props) {
  const { locale } = await params;
  const [contentEn, contentHe] = await Promise.all([
    getSiteContent('en'),
    getSiteContent('he'),
  ]);

  return (
    <ContentEditor
      initialEn={contentEn}
      initialHe={contentHe}
      locale={locale}
    />
  );
}
