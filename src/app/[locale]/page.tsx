'use client';

import { useParams, usePathname } from 'next/navigation';
import CmsPage from '@/components/cms/CmsPage';

export default function Page() {
  const params = useParams();
  const pathname = usePathname();
  const pathLocale = (pathname || '').split('/').filter(Boolean)[0]?.toLowerCase();
  const locale = (params?.locale as string) || (pathLocale === 'ar' ? 'ar' : 'en');
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  return <CmsPage slug="home" locale={locale} localePrefix={localePrefix} />;
}
