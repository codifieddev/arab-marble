import { notFound, permanentRedirect } from 'next/navigation';
import { Metadata } from 'next';
import { Suspense } from 'react';
import ProductDetailPage from '@/views/shop/[slug]/page';
import ShopPage from '@/views/shop/page';
import CategoryPageComponent from '@/components/pages/CategoryPage';
import GetProductCategoryWise from '@/lib/GetAllDetails/GetProductCategoryWise';
import PageLoader from '@/components/pages/PageLoader';
import TenantAdminLoginSection from '@/components/auth/TenantAdminLoginSection';
import { resolvePermalinkAsync } from '@/lib/permalink/resolver';
import { getEntityUrl } from '@/lib/permalink/url-helper';
import { getBlueprintLocalization } from '@/lib/blueprint-server';
import { loadPageData } from '@/components/cms/loader';
import { getPageData } from '@/lib/getPageData';
import CmsPage from '@/components/cms/CmsPage';
import ContactPage from '@/views/contact/page';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { slug, locale = 'en' } = await params;
  if (
    !slug ||
    slug.length === 0 ||
    slug.some(
      (s) =>
        s.endsWith('.json') ||
        s.endsWith('.map') ||
        s.endsWith('.ico') ||
        s.startsWith('com.chrome')
    )
  ) {
    notFound();
  }

  const rawPath = '/' + slug.join('/');
  const resolved = await resolvePermalinkAsync(rawPath, { locale });

  const { defaultLanguage, supportedLanguages } = await getBlueprintLocalization();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arabmarble.ae';

  if (resolved.status === 'match') {
    if (resolved.type === 'admin') {
      return {
        title: 'Admin Login | Arab Marble',
        robots: { index: false, follow: false },
      };
    }

    if (resolved.type === 'product' && resolved.data) {
      const p = resolved.data;
      const title = p.seoTitle || p.name || 'Product Details';
      const description = p.seoDescription || p.description || 'Premium marble, granite and natural stones by Arab Marble.';

      const languages: Record<string, string> = {
        'x-default': `${baseUrl}${getEntityUrl(p, defaultLanguage)}`,
      };
      for (const lang of supportedLanguages) {
        languages[lang] = `${baseUrl}${getEntityUrl(p, lang, undefined, defaultLanguage)}`;
      }

      return {
        title: `${title} | Arab Marble`,
        description,
        alternates: {
          canonical: `${baseUrl}${resolved.canonicalPath || rawPath}`,
          languages,
        },
        robots: { index: true, follow: true },
      };
    }

    if (resolved.type === 'category') {
      const c = resolved.data;
      const categoryPage = (await getPageData("category")) || loadPageData("category");
      let title: string;
      let description: string;
      if (c && c.name && c.slug && c.slug !== 'all') {
        title = `${c.metaTitle || c.name || 'Category'} | Arab Marble`;
        description =
          c.metaDescription ||
          c.description ||
          'Explore our premium collection of marble, granite, and natural stones.';
      } else {
        title =
          categoryPage?.metaTitle?.[locale] ||
          categoryPage?.metaTitle?.['en'] ||
          'Products | Arab Marble';
        description =
          categoryPage?.metaDescription?.[locale] ||
          categoryPage?.metaDescription?.['en'] ||
          'Explore our complete catalog of natural and artificial stones.';
      }

      const languages: Record<string, string> = {
        'x-default': `${baseUrl}${getEntityUrl({ type: 'category', ...c }, defaultLanguage)}`,
      };
      for (const lang of supportedLanguages) {
        languages[lang] = `${baseUrl}${getEntityUrl({ type: 'category', ...c }, lang, undefined, defaultLanguage)}`;
      }

      return {
        title: `${title} | Arab Marble`,
        description,
        alternates: {
          canonical: `${baseUrl}${resolved.canonicalPath || rawPath}`,
          languages,
        },
        robots: { index: true, follow: true },
      };
    }

    if (resolved.type === 'shop') {
      return {
        title: 'Products | Arab Marble',
        description: 'Explore our complete stone collection: Marble, Granite, Natural Stones, Artificial Stones.',
        alternates: {
          canonical: `${baseUrl}${resolved.canonicalPath || rawPath}`,
        },
        robots: { index: true, follow: true },
      };
    }

    if (resolved.type === 'cms_page') {
      const page = resolved.data;
      const title =
        typeof page?.metaTitle === 'string'
          ? page.metaTitle
          : page?.metaTitle?.[locale] ||
            page?.metaTitle?.[defaultLanguage] ||
            page?.title?.[locale] ||
            page?.title?.[defaultLanguage] ||
            resolved.slug?.replace(/-/g, ' ').replace(/\b\w/g, (char: string) => char.toUpperCase());

      const description =
        typeof page?.metaDescription === 'string'
          ? page.metaDescription
          : page?.metaDescription?.[locale] ||
            page?.metaDescription?.[defaultLanguage] ||
            'Arab Marble - Premium stone and marble supply and fixing in UAE.';

      return {
        title: `${title} | Arab Marble`,
        description,
        alternates: {
          canonical: `${baseUrl}${resolved.canonicalPath || rawPath}`,
        },
        robots: { index: true, follow: true },
      };
    }
  }

  const slugKey = slug.join('/');
  const fallbackSlug = slug[slug.length - 1];

  if (slugKey === 'home' || fallbackSlug === 'home') {
    return {
      title: 'Arab Marble | Create. Build. Design.',
      description: 'Arab Marble has played a pivotal role in the Abu Dhabi Market for Marble and Granite since 1973.',
      alternates: {
        canonical: `${baseUrl}/`,
      },
      robots: { index: true, follow: true },
    };
  }

  const localPage = loadPageData(slugKey) || loadPageData(fallbackSlug);
  if (localPage) {
    const title =
      typeof localPage.metaTitle === 'string'
        ? localPage.metaTitle
        : localPage.metaTitle?.[locale] ||
          localPage.metaTitle?.en ||
          slugKey.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());

    return {
      title: `${title} | Arab Marble`,
      description: 'Arab Marble - Natural and engineered stone solutions in UAE.',
      alternates: {
        canonical: `${baseUrl}/${slugKey}`,
      },
      robots: { index: true, follow: true },
    };
  }

  return {
    title: 'Page Not Found | Arab Marble',
    description: 'The requested page does not exist.',
    robots: { index: false, follow: false },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { slug, locale = 'en' } = await params;

  if (
    !slug ||
    slug.length === 0 ||
    slug.some(
      (s) =>
        s.endsWith('.json') ||
        s.endsWith('.map') ||
        s.endsWith('.ico') ||
        s.startsWith('com.chrome')
    )
  ) {
    notFound();
  }

  const rawPathname = '/' + slug.join('/');
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  // Central Resolution
  const resolved = await resolvePermalinkAsync(rawPathname, { locale });

  if (resolved.status === 'redirect' && resolved.redirectUrl) {
    permanentRedirect(resolved.redirectUrl);
  }

  if (resolved.status === 'match') {
    switch (resolved.type) {
      case 'shop':
        return <ShopPage locale={locale} />;
      case 'product':
        return (
          <ProductDetailPage
            locale={locale}
            slug={resolved.slug || slug[slug.length - 1]}
          />
        );
      case 'admin':
        return <TenantAdminLoginSection />;
      case 'category': {
        const catSlug =
          resolved.slug && resolved.slug !== 'all'
            ? resolved.slug
            : slug.length > 1
            ? slug[slug.length - 1]
            : undefined;
        return (
          <Suspense fallback={<PageLoader text="Loading Category" />}>
            <GetProductCategoryWise categorySlug={catSlug} />
            <CategoryPageComponent categorySlug={catSlug} />
          </Suspense>
        );
      }
      case 'cms_page': {
        const pageSlug = resolved.slug || slug.join('/');
        return (
          <CmsPage
            slug={pageSlug}
            locale={locale}
            localePrefix={localePrefix}
          />
        );
      }
      default:
        break;
    }
  }

  // Fallback to local CMS loader
  const slugKey = slug.join('/');
  const fallbackSlug = slug[slug.length - 1];

  if (slugKey === 'home' || fallbackSlug === 'home') {
    return (
      <CmsPage
        slug="home"
        locale={locale}
        localePrefix={localePrefix}
      />
    );
  }

  const localCms = loadPageData(slugKey) || loadPageData(fallbackSlug);
  if (localCms && localCms.isPublished !== false && localCms.status !== 'draft') {
    return (
      <CmsPage
        slug={slugKey}
        locale={locale}
        localePrefix={localePrefix}
      />
    );
  }

  notFound();
}
