'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectBlueprint, selectFooterConfig } from '@/lib/store/blueprint';
import { resolveBrandLogo, resolveBrandName } from '@/lib/brand/brand-resolver';
import footerData from '@/lib/pages/footerData.json';
import { resolveHrefWithPermalinks } from '@/lib/permalink/url-helper';

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

export default function Footer() {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';
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
  const localePrefix = locale === defaultLanguage ? '' : `/${locale}`;

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
    (footerLogoImage && !footerLogoImage.startsWith('media://') ? footerLogoImage : null) ||
    (resolvedLogo && !resolvedLogo.startsWith('media://') ? resolvedLogo : null) ||
    footerData.logo?.imageUrl ||
    '/images/arab-marble-logo-white.svg';

  const brandDescription =
    getFooterLocalizedText(activeFooter?.brand?.description, locale) ||
    getFooterLocalizedText(footerData?.brand?.description, locale) ||
    'Arab Marble was established in Abu Dhabi in 1973. Exclusive distributor of Omani Beige marble, Italian marble, and natural stone solutions across the UAE.';

  const contactData = activeFooter?.contact || activeFooter?.companyInfo || footerData.contact;
  const phone = contactData?.phone || '+971 2 555 4008';
  const fax = contactData?.fax || '+971 2 555 4005';
  const email = contactData?.email || 'am@arabmarble.ae';

  const rawColumns =
    (Array.isArray(activeFooter?.quickLinksColumns) && activeFooter.quickLinksColumns.length > 0)
      ? activeFooter.quickLinksColumns
      : (Array.isArray(activeFooter?.columns) && activeFooter.columns.length > 0)
        ? activeFooter.columns
        : (footerData as any).quickLinksColumns || (footerData as any).columns || [];
  const columns = Array.isArray(rawColumns) ? rawColumns : [];

  const rawCopyright =
    activeFooter?.bottomBar?.copyright ||
    activeFooter?.copyright ||
    (footerData as any).copyright?.text ||
    (footerData as any).copyright ||
    'Copyright © {year} | ARAB MARBLE | All Rights Reserved';
  const copyrightText = getFooterLocalizedText(rawCopyright, locale).replace(
    '{year}',
    String(new Date().getFullYear())
  );

  const rawCredits =
    activeFooter?.bottomBar?.credits ||
    (footerData as any).bottomBar?.credits ||
    (footerData as any).copyright?.credits ||
    'Designed & Managed by CODIFIED';
  const creditsText = getFooterLocalizedText(rawCredits, locale);

  const socialLinks: any[] =
    (Array.isArray(activeFooter?.socialLinks) && activeFooter.socialLinks.length > 0)
      ? activeFooter.socialLinks
      : (footerData as any).socialLinks || [];

  return (
    <footer style={{ background: '#383838', color: '#FFFFFF', marginTop: 'auto' }}>
      {/* Main Footer Row */}
      <div className="max-w-[1240px] mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Logo & Tagline & Socials */}
        <div className="md:col-span-4 space-y-4">
          <Link href={localePrefix || '/'}>
            <img
              src={dynamicLogo}
              alt={getFooterLocalizedText(activeFooter?.brand?.name, locale) || 'Arab Marble'}
              className="h-16 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/arab-marble-logo-white.svg';
              }}
            />
          </Link>
          <p className="text-xs text-neutral-300 font-light leading-relaxed max-w-sm">
            {brandDescription}
          </p>
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
                    {platform === 'instagram' ? (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                      </svg>
                    ) : platform === 'facebook' ? (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    ) : platform === 'linkedin' ? (
                      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.77v8.37H6.46v-8.37M7.84 6.2a1.62 1.62 0 1 0 1.62 1.62A1.62 1.62 0 0 0 7.84 6.2z" />
                      </svg>
                    ) : (
                      <span className="text-[10px] uppercase font-bold">{platform.slice(0, 2)}</span>
                    )}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic Navigation Columns */}
        {columns.length > 0 ? (
          <div className="md:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-6">
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
                      const fullHref =
                        rawHref.startsWith('http') || rawHref.startsWith('tel:') || rawHref.startsWith('mailto:')
                          ? rawHref
                          : resolveHrefWithPermalinks(rawHref, locale);
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
        ) : (
          <div className="md:col-span-5" />
        )}

        {/* Right Column: Contact Us */}
        <div className="md:col-span-3 space-y-3 text-left">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">
            {getFooterLocalizedText(contactData?.title, locale) || 'Contact Us'}
          </h3>
          <div className="flex flex-col gap-2 text-xs text-neutral-300 font-light">
            <p className="flex items-center gap-2">
              <span className="font-medium text-neutral-400">Phone:</span>
              <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                {phone}
              </a>
            </p>
            {fax && (
              <p className="flex items-center gap-2">
                <span className="font-medium text-neutral-400">Fax:</span>
                <span>{fax}</span>
              </p>
            )}
            <p className="flex items-center gap-2">
              <span className="font-medium text-neutral-400">Email:</span>
              <a href={`mailto:${email}`} className="hover:text-white transition-colors">
                {email}
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Black */}
      <div style={{ background: '#191919' }} className="border-t border-neutral-700/50">
        <div className="max-w-[1240px] mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-2">
          <div>{copyrightText}</div>
          <div>{creditsText}</div>
        </div>
      </div>
    </footer>
  );
}
