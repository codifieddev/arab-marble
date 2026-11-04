import ShopPage from '@/views/shop/page';
import { getTenantPermalinkConfig } from '@/lib/permalink/resolver';
import { sanitizeBase } from '@/lib/permalink/config';
import { getEntityUrl } from '@/lib/permalink/url-helper';
import { permanentRedirect } from 'next/navigation';

export default async function Page({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale = 'en' } = await params;
  const config = await getTenantPermalinkConfig();
  const shopBase = sanitizeBase(config.shopBase || 'shop', 'shop');

  if (shopBase !== 'shop') {
    const canonical = getEntityUrl({ type: 'shop' }, locale, config);
    permanentRedirect(canonical);
  }

  return <ShopPage locale={locale} />;
}
