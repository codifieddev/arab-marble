import { Metadata } from 'next';
import ProjectsCategoryPage from '@/views/projects/ProjectsCategoryPage';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}): Promise<Metadata> {
  const { category = 'latest' } = await params;
  const name = category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `${name} Projects | Arab Marble`,
    description: `Explore ${name} projects executed by Arab Marble across UAE and GCC.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale = 'en', category = 'latest' } = await params;
  return <ProjectsCategoryPage categorySlug={category} locale={locale} />;
}

