'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/store/hooks';
import { getEntityUrl } from '@/lib/permalink/url-helper';

export default function ProductBreadcrumbs({
  locale, productTitle, cmsProps
}: {
  locale: string;
  productTitle: string;
  cmsProps?: any;
}) {
  const blueprint = useAppSelector((state) => state.blueprint?.payload);
  const permalinks = (blueprint as any)?.seo?.permalinks || (blueprint as any)?.permalinkDetails;
  const shopHref = getEntityUrl({ type: 'shop' }, locale, permalinks);

  const homeLabel = cmsProps?.breadcrumbs?.home?.[locale] || (locale === 'hi' ? 'होम' : 'Home');
  const shopLabel = cmsProps?.breadcrumbs?.shop?.[locale] || (locale === 'hi' ? 'दुकान' : 'Shop');

  return (
    <section className="pt-8 pb-0">
      <div className="container-custom">
        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-8">
          <Link href={`/${locale === 'en' ? '' : locale}`} className="hover:text-[var(--primary)]">{homeLabel}</Link>
          <span>/</span>
          <Link href={shopHref} className="hover:text-[var(--primary)]">{shopLabel}</Link>
          <span>/</span>
          <span className="text-[var(--text)]">{productTitle}</span>
        </div>
      </div>
    </section>
  );
}
