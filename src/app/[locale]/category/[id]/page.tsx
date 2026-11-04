import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import CategoryPageComponent, { CategoryPageSkeleton } from '@/components/pages/CategoryPage';
import GetProductCategoryWise from '@/lib/GetAllDetails/GetProductCategoryWise';
import { resolvePermalinkAsync } from '@/lib/permalink/resolver';
import { getEntityUrl } from '@/lib/permalink/url-helper';
import { getBlueprintLocalization } from '@/lib/blueprint-server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; id: string }>;
}): Promise<Metadata> {
  const { locale = 'en', id } = await params;
  const resolved = await resolvePermalinkAsync(`/category/${id}`, { locale });

  if (resolved.status === 'match' && resolved.data) {
    const c = resolved.data;
    const { defaultLanguage, supportedLanguages } = await getBlueprintLocalization();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arabmarble.ae';

    const languages: Record<string, string> = {
      'x-default': `${baseUrl}${getEntityUrl({ type: 'category', ...c }, defaultLanguage)}`,
    };
    for (const lang of supportedLanguages) {
      languages[lang] = `${baseUrl}${getEntityUrl({ type: 'category', ...c }, lang, undefined, defaultLanguage)}`;
    }

    return {
      title: `${c.metaTitle || c.name || 'Stone Collection'} | Arab Marble`,
      description:
        c.metaDescription ||
        c.description ||
        'Explore our collection of premium natural marble, granite and stone slabs in Abu Dhabi, UAE.',
      alternates: {
        canonical: `${baseUrl}${resolved.canonicalPath || `/category/${id}`}`,
        languages,
      },
      robots: { index: true, follow: true },
    };
  }

  const titleName = id.replace(/-/g, ' ').toUpperCase();
  return {
    title: `${titleName} Collection | Arab Marble`,
    description: `Explore premium ${titleName.toLowerCase()} and natural stones at Arab Marble Abu Dhabi.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string; id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale = 'en', id } = await params;
  const sp = searchParams ? await searchParams : {};
  const searchStr = new URLSearchParams(
    Object.entries(sp || {}).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((item) => [k, item]) : v !== undefined ? [[k, v]] : []
    )
  ).toString();
  const search = searchStr ? `?${searchStr}` : '';

  // Verify Canonical URL
  const resolved = await resolvePermalinkAsync(`/category/${id}`, { locale, search });

  if (resolved.status === 'redirect' && resolved.redirectUrl) {
    permanentRedirect(resolved.redirectUrl);
  }

  if (resolved.status === 'not_found') {
    notFound();
  }

  const categorySlug = resolved.slug || id;

  return (
    <Suspense fallback={<CategoryPageSkeleton />}>
      <GetProductCategoryWise categorySlug={categorySlug} />
      <CategoryPageComponent categorySlug={categorySlug} />
    </Suspense>
  );
}
