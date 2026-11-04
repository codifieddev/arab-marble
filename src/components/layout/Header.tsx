'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import {
  selectPublicNavigation,
  selectHeaderConfig,
  selectBlueprint,
} from '@/lib/store/blueprint';
import { resolveBrandLogo, resolveBrandName } from '@/lib/brand/brand-resolver';
import headerData from '@/lib/pages/headerData.json';
import { resolveHrefWithPermalinks } from '@/lib/permalink/url-helper';

export function getItemLabel(item: any, locale = 'en'): string {
  if (!item) return '';
  if (item.label && typeof item.label === 'object') {
    return item.label[locale] || item.label.en || Object.values(item.label)[0] || '';
  }
  if (item.title && typeof item.title === 'object') {
    return item.title[locale] || item.title.en || Object.values(item.title)[0] || '';
  }
  if (typeof item.label === 'string') return item.label;
  if (typeof item.title === 'string') return item.title;
  return '';
}

export function getItemHref(item: any, locale = 'en'): string {
  if (!item) return '/';
  const rawHref = item.path || item.href || item.url || '/';
  return resolveHrefWithPermalinks(rawHref, locale);
}

export function getSubMenuColumns(item: any) {
  if (Array.isArray(item.children) && item.children.length > 0) {
    return item.children.filter((c: any) => c.isActive !== false);
  }
  if (Array.isArray(item.megaColumns) && item.megaColumns.length > 0) {
    return item.megaColumns;
  }
  return [];
}

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';

  const headerConfig = useAppSelector(selectHeaderConfig);
  const blueprintNav = useAppSelector(selectPublicNavigation);
  const blueprint = useAppSelector(selectBlueprint);

  const [liveHeader, setLiveHeader] = useState<any>(null);

  const fetchLiveHeader = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/headers', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = Array.isArray(json) ? json : json?.data || [];
        const active = items.find((h: any) => h.status === true || h.isActive === true) || items[0];
        if (active) {
          setLiveHeader(active);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  useEffect(() => {
    fetchLiveHeader();
    const handleFocus = () => fetchLiveHeader();
    window.addEventListener('focus', handleFocus);
    window.addEventListener('kalp-cms-updated' as any, handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('kalp-cms-updated' as any, handleFocus);
    };
  }, [fetchLiveHeader]);

  const activeHeader = liveHeader || headerConfig;

  const defaultLanguage = (blueprint?.localization?.defaultLanguage || 'en').toLowerCase();
  const localePrefix = locale === defaultLanguage ? '' : `/${locale}`;

  const navigationItems = useMemo(() => {
    let items: any[] = [];
    if (activeHeader?.menu && Array.isArray(activeHeader.menu) && activeHeader.menu.length > 0) {
      items = activeHeader.menu;
    } else if (blueprintNav?.public && Array.isArray(blueprintNav.public) && blueprintNav.public.length > 0) {
      items = blueprintNav.public;
    } else {
      items = headerData.navigation;
    }
    return items.filter((item) => item && item.isActive !== false);
  }, [activeHeader, blueprintNav]);

  const closeMobile = useCallback(() => {
    setIsMobileMenuOpen(false);
    setMobileExpandedIndex(null);
    document.body.classList.remove('scroll-locked');
  }, []);

  const openMobile = useCallback(() => {
    setIsMobileMenuOpen(true);
    document.body.classList.add('scroll-locked');
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    closeMobile();
    setOpenDropdown(null);
  }, [pathname, closeMobile]);

  if (
    pathname?.includes('/login') ||
    pathname?.includes('/signup') ||
    pathname?.includes('/studio')
  ) {
    return null;
  }

  const headerLogoImage = activeHeader?.logo?.image;
  const resolvedLogo = resolveBrandLogo(blueprint);
  const dynamicLogo =
    (headerLogoImage && !headerLogoImage.startsWith('media://') ? headerLogoImage : null) ||
    (resolvedLogo && !resolvedLogo.startsWith('media://') ? resolvedLogo : null) ||
    headerData.logo?.imageUrl ||
    '/images/arab-marble-logo.svg';
  const brandName = activeHeader?.logo?.text || activeHeader?.name || resolveBrandName(blueprint) || 'Arab Marble';

  return (
    <>
      <header
        className="sticky top-0 z-50 bg-white border-b border-gray-200 transition-shadow duration-200"
        style={{
          boxShadow: isScrolled ? '0 2px 10px rgba(0,0,0,0.06)' : 'none',
        }}
      >
        <div className="max-w-[1240px] mx-auto px-6 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href={localePrefix || '/'} className="flex items-center">
            <img
              src={dynamicLogo}
              alt={brandName}
              className="h-14 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/arab-marble-logo.svg';
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navigationItems.map((item, index) => {
              const label = getItemLabel(item, locale);
              const href = getItemHref(item, locale);
              const subItems = getSubMenuColumns(item);
              const hasSub = subItems.length > 0;
              const isOpen = openDropdown === index;
              const fullHref = localePrefix ? `${localePrefix}${href}` : href;
              const isActive = pathname === fullHref || pathname === href;

              return (
                <div
                  key={index}
                  className="relative py-6"
                  onMouseEnter={() => hasSub && setOpenDropdown(index)}
                  onMouseLeave={() => hasSub && setOpenDropdown(null)}
                >
                  <Link
                    href={fullHref}
                    className={`flex items-center gap-1.5 text-xs font-semibold tracking-wider transition-colors uppercase ${
                      isActive || isOpen ? 'text-black' : 'text-gray-600 hover:text-black'
                    }`}
                  >
                    <span>{label}</span>
                    {hasSub && (
                      <svg
                        className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSub && isOpen && (
                    <div className="absolute top-full left-0 w-52 bg-white border border-gray-100 rounded-sm shadow-xl py-2 z-50">
                      {subItems.map((sub: any, subIdx: number) => {
                        const subLabel = getItemLabel(sub, locale);
                        const subHref = getItemHref(sub, locale);
                        const subFullHref = localePrefix ? `${localePrefix}${subHref}` : subHref;

                        return (
                          <Link
                            key={subIdx}
                            href={subFullHref}
                            className="block px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
                          >
                            {subLabel}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button
              ref={hamburgerRef}
              onClick={isMobileMenuOpen ? closeMobile : openMobile}
              aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              className="p-2 text-gray-700 hover:text-black focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={menuPanelRef}
          className="fixed inset-0 top-20 bg-white z-40 p-6 flex flex-col overflow-y-auto md:hidden"
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {navigationItems.map((item, index) => {
              const label = getItemLabel(item, locale);
              const href = getItemHref(item, locale);
              const subItems = getSubMenuColumns(item);
              const hasSub = subItems.length > 0;
              const isExpanded = mobileExpandedIndex === index;
              const fullHref = localePrefix ? `${localePrefix}${href}` : href;

              return (
                <div key={index} className="py-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={fullHref}
                      onClick={closeMobile}
                      className="text-sm font-semibold tracking-wider uppercase text-gray-800"
                    >
                      {label}
                    </Link>
                    {hasSub && (
                      <button
                        onClick={() => setMobileExpandedIndex(isExpanded ? null : index)}
                        className="p-1 text-gray-500"
                        aria-label="Expand submenu"
                      >
                        <svg
                          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {hasSub && isExpanded && (
                    <div className="pl-4 pt-2 pb-1 flex flex-col gap-2">
                      {subItems.map((sub: any, subIdx: number) => {
                        const subLabel = getItemLabel(sub, locale);
                        const subHref = getItemHref(sub, locale);
                        const subFullHref = localePrefix ? `${localePrefix}${subHref}` : subHref;

                        return (
                          <Link
                            key={subIdx}
                            href={subFullHref}
                            onClick={closeMobile}
                            className="text-xs text-gray-600 hover:text-black py-1"
                          >
                            {subLabel}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
