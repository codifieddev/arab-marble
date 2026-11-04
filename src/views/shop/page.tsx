'use client';

import CmsPage from '@/components/cms/CmsPage';

export default function ShopPage({ locale = 'en' }: { locale?: string }) {
  const localePrefix = locale === 'en' ? '' : `/${locale}`;
  return <CmsPage slug="shop" locale={locale} localePrefix={localePrefix} />;
}
