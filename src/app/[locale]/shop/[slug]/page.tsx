import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import ProductDetailPage from '@/views/shop/[slug]/page';
import { resolvePermalinkAsync } from '@/lib/permalink/resolver';
import { getEntityUrl } from '@/lib/permalink/url-helper';
import { getBlueprintLocalization } from '@/lib/blueprint-server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string; slug: string }>;
}): Promise<Metadata> {
  const { locale = 'en', slug } = await params;
  const resolved = await resolvePermalinkAsync(`/shop/${slug}`, { locale });

  if (resolved.status === 'match' && resolved.data) {
    const p = resolved.data;
    const { defaultLanguage, supportedLanguages } = await getBlueprintLocalization();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arabmarble.ae';

    const languages: Record<string, string> = {
      'x-default': `${baseUrl}${getEntityUrl(p, defaultLanguage)}`,
    };
    for (const lang of supportedLanguages) {
      languages[lang] = `${baseUrl}${getEntityUrl(p, lang, undefined, defaultLanguage)}`;
    }

    return {
      title: `${p.seoTitle || p.name || 'Stone Product'} | Arab Marble`,
      description:
        p.seoDescription ||
        p.description ||
        'Premium natural and engineered stones by Arab Marble in UAE.',
      alternates: {
        canonical: `${baseUrl}${resolved.canonicalPath || `/shop/${slug}`}`,
        languages,
      },
      robots: { index: true, follow: true },
    };
  }

  return {
    title: 'Product | Arab Marble',
    description: 'Browse marble and natural stone specifications at Arab Marble.',
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale?: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale = 'en', slug } = await params;
  const resolved = await resolvePermalinkAsync(`/shop/${slug}`, { locale });

  if (resolved.status === 'redirect' && resolved.redirectUrl) {
    permanentRedirect(resolved.redirectUrl);
  }

  if (resolved.status === 'not_found') {
    notFound();
  }

  return <ProductDetailPage locale={locale} slug={resolved.slug || slug} />;
}
