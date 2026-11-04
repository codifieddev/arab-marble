import { Metadata } from 'next';
import ProjectsCategoryPage from '@/views/projects/ProjectsCategoryPage';

export const metadata: Metadata = {
  title: 'Our Projects | Arab Marble',
  description: 'Explore landmark and prestigious stone projects executed by Arab Marble across UAE and GCC.',
};

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale = 'en' } = await params;
  return <ProjectsCategoryPage categorySlug="latest" locale={locale} />;
}

