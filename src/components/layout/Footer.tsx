'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectBlueprint, selectFooterConfig } from '@/lib/store/blueprint';
import { resolveBrandLogo, resolveBrandName } from '@/lib/brand/brand-resolver';
import footerData from '@/lib/pages/footerData.json';
import { resolveHrefWithPermalinks } from '@/lib/permalink/url-helper';
import { buildLocalizedHref } from './Header';
import { Reveal, GoldDivider } from '@/components/motion';

export function getFooterLocalizedText(val: any, locale = 'en'): string {
  if (!val) return '';
  if (typeof val === 'object' && !Array.isArray(val)) {
    const text = val[locale] || val.en || Object.values(val)[0];
    if (typeof text === 'string') return text;
    if (text) return String(text);
  }
  if (typeof val === 'string') return val;
  return String(val);
}

export default function Footer({
  locale: propLocale,
  localePrefix: propLocalePrefix,
}: {
  locale?: string;
  localePrefix?: string;
} = {}) {
  const params = useParams();
  const pathname = usePathname();
  const pathLocale = (pathname || '').split('/').filter(Boolean)[0]?.toLowerCase();
  const locale = propLocale || (params?.locale as string) || (pathLocale === 'ar' ? 'ar' : 'en');
  const blueprint = useAppSelector(selectBlueprint);
  const footerConfig = useAppSelector(selectFooterConfig);

  const [liveFooter, setLiveFooter] = useState<any>(null);

  const fetchLiveFooter = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/footer', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.data || [];
        if (items.length > 0) {
          setLiveFooter(items[0]);
        }
      }
    } catch {
      // Fallback to Redux / static config
    }
  }, []);

  useEffect(() => {
    fetchLiveFooter();
    const handleFocus = () => fetchLiveFooter();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('kalp-cms-updated' as any, handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('kalp-cms-updated' as any, handleFocus);
    };
  }, [fetchLiveFooter]);

  const activeFooter = liveFooter || footerConfig || footerData;

  const defaultLanguage = (blueprint?.localization?.defaultLanguage || 'en').toLowerCase();
  const localePrefix = propLocalePrefix ?? (locale === defaultLanguage ? '' : `/${locale}`);

  if (
    pathname?.includes('/login') ||
    pathname?.includes('/signup') ||
    pathname?.includes('/studio')
  ) {
    return null;
  }

  const footerLogoImage = activeFooter?.logo?.image || activeFooter?.logo?.imageUrl;
  const resolvedLogo = resolveBrandLogo(blueprint);
  const dynamicLogo =
    (footerLogoImage && !footerLogoImage.startsWith('media://') && !footerLogoImage.includes('Arab-Marble-Final-All-04.png') ? footerLogoImage : null) ||
    (resolvedLogo && !resolvedLogo.startsWith('media://') && !resolvedLogo.includes('Arab-Marble-Final-All-04.png') ? resolvedLogo : null) ||
    '/images/arab-marble-footer-logo.png';

  const brandDescription =
    getFooterLocalizedText(activeFooter?.brand?.description, locale) || '';

  const contactData = activeFooter?.contact || activeFooter?.companyInfo || footerData.contact;
  const phone = contactData?.phone || '+971 2 555 4008';
  const fax = contactData?.fax || '+971 2 555 4005';
  const email = contactData?.email || 'am@arabmarble.ae';

  const rawColumns =
    (Array.isArray(activeFooter?.quickLinksColumns) && activeFooter.quickLinksColumns.length > 0)
      ? activeFooter.quickLinksColumns
      : (Array.isArray(activeFooter?.columns) && activeFooter.columns.length > 0)
        ? activeFooter.columns
        : [];
  const columns = Array.isArray(rawColumns) ? rawColumns : [];

  const rawCopyright =
    activeFooter?.copyright ||
    activeFooter?.bottomBar?.copyright ||
    (footerData as any).bottomBar?.copyright ||
    'Copyright © 2025 | ARAB MARBLE |All Rights Reserved';
  const copyrightText = getFooterLocalizedText(rawCopyright, locale).replace(
    '{year}',
    String(new Date().getFullYear())
  );

  const rawCredits =
    activeFooter?.bottomBar?.credits ||
    (footerData as any).bottomBar?.credits ||
    'Designed & Managed by CODIFIED';
  const creditsText = getFooterLocalizedText(rawCredits, locale);

  const socialLinks: any[] =
    (Array.isArray(activeFooter?.socialLinks) && activeFooter.socialLinks.length > 0)
      ? activeFooter.socialLinks
      : [];

  const contactTitle =
    getFooterLocalizedText(contactData?.title, locale) || (locale === 'ar' ? 'اتصل بنا' : 'Contact Us');
  const phoneLabel =
    getFooterLocalizedText(contactData?.phoneLabel, locale) || (locale === 'ar' ? 'الهاتف:' : 'Phone:');
  const faxLabel =
    getFooterLocalizedText(contactData?.faxLabel, locale) || (locale === 'ar' ? 'الفاكس:' : 'Fax:');
  const emailLabel =
    getFooterLocalizedText(contactData?.emailLabel, locale) || (locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:');

  return (
    <footer style={{ background: '#505050', color: '#FFFFFF', marginTop: 'auto' }} className="relative overflow-hidden font-sans">
      {/* Decorative Gold Accent Bar */}
      <div className="w-full flex justify-center">
        <GoldDivider centered className="!my-0 !max-w-[200px]" delay={0.1} />
      </div>

      {/* Main Footer Row */}
      <Reveal direction="up" duration={1.1} distance={20} className="w-full">
        <div className="max-w-[1240px] mx-auto px-6 py-10 md:py-24 flex flex-col md:flex-row justify-between items-start gap-8 md:gap-10">
          {/* Left Column: Brand Logo */}
          <div className="space-y-3 flex flex-col items-start rtl:items-end">
            <Link href={localePrefix || '/'} className="inline-block">
              <img
                src={dynamicLogo}
                alt={getFooterLocalizedText(activeFooter?.brand?.name, locale) || 'Arab Marble'}
                className="h-20 md:h-26 w-auto object-contain object-left rtl:object-right transition-transform duration-300 hover:scale-[1.02]"
                onError={(e) => {
                  e.currentTarget.src = '/images/arab-marble-footer-logo.png';
                }}
              />
            </Link>
            {brandDescription && (
              <p className="text-xs text-neutral-300 font-light leading-relaxed max-w-sm pt-2">
                {brandDescription}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-3 pt-2">
                {socialLinks.map((s, sIdx) => {
                  const platform = String(s.platform || '').toLowerCase();
                  const url = s.url || '#';
                  return (
                    <a
                      key={sIdx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-neutral-700/60 hover:bg-neutral-600 flex items-center justify-center text-white transition-colors"
                      title={platform}
                    >
                      <span className="text-[10px] uppercase font-bold">{platform.slice(0, 2)}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dynamic Navigation Columns (if any in DB) */}
          {columns.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 flex-1 max-w-lg">
              {columns.map((col: any, idx: number) => {
                const colTitle = getFooterLocalizedText(col.title, locale);
                const links = col.links || col.items || [];
                return (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
                      {colTitle}
                    </h4>
                    <ul className="space-y-2 text-xs text-neutral-300 font-light">
                      {links.map((link: any, lIdx: number) => {
                        const label = getFooterLocalizedText(link.label || link.title, locale);
                        const rawHref = getFooterLocalizedText(link.href || link.path, locale) || '#';
                        const fullHref = buildLocalizedHref(localePrefix, rawHref, locale);
                        return (
                          <li key={lIdx}>
                            <Link href={fullHref} className="hover:text-white transition-colors">
                              {label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* Right Column: Contact Us */}
          <div className="space-y-3 rtl:text-right ltr:text-left w-full md:w-auto md:min-w-[240px]">
            <div className="inline-block border-b-2 border-white pb-1 mb-2">
              <h3 className="text-lg md:text-2xl font-bold text-white font-medium tracking-wide">
                {contactTitle}
              </h3>
            </div>
            <div className="flex pt-2 md:pt-4 flex-col gap-2.5 text-sm md:text-[16px] text-neutral-200 font-normal">
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">{phoneLabel}</span>
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:underline transition-colors" dir="ltr">
                  {phone}
                </a>
              </p>
              {fax && (
                <p className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-white">{faxLabel}</span>
                  <span dir="ltr">{fax}</span>
                </p>
              )}
              <p className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-white">{emailLabel}</span>
                <a href={`mailto:${email}`} className="hover:underline transition-colors break-all" dir="ltr">
                  {email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Bottom Bar: Black */}
      <div style={{ background: '#191919' }} className="border-t border-neutral-700/50">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left text-xs text-neutral-400 gap-2 font-normal">
          <div>{copyrightText}</div>
          <div>
            {creditsText.includes('CODIFIED') ? (
              <span>
                {creditsText.split('CODIFIED')[0]}
                <strong className="text-white font-semibold">CODIFIED</strong>
                {creditsText.split('CODIFIED')[1]}
              </span>
            ) : (
              creditsText
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
