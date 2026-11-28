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
import LanguageSwitcher from './LanguageSwitcher';
import headerData from '@/lib/pages/headerData.json';
import { resolveHrefWithPermalinks } from '@/lib/permalink/url-helper';

const DEFAULT_FALLBACK_LABELS: Record<string, Record<string, string>> = {
  home: { en: 'Home', ar: 'الرئيسية' },
  products: { en: 'Products', ar: 'المنتجات' },
  shop: { en: 'Shop', ar: 'المنتجات' },
  projects: { en: 'Projects', ar: 'المشاريع' },
  'about us': { en: 'About Us', ar: 'من نحن' },
  about: { en: 'About', ar: 'من نحن' },
  'contact us': { en: 'Contact Us', ar: 'اتصل بنا' },
  contact: { en: 'Contact', ar: 'اتصل بنا' },
  marble: { en: 'Marble', ar: 'رخام' },
  granite: { en: 'Granite', ar: 'جرانيت' },
  'natural stones': { en: 'Natural Stones', ar: 'أحجار طبيعية' },
  'artificial stones': { en: 'Artificial Stones', ar: 'أحجار صناعية' },
  'latest projects': { en: 'Latest Projects', ar: 'أحدث المشاريع' },
  'iconic projects': { en: 'Iconic Projects', ar: 'مشاريع مميزة' },
  'commercial projects': { en: 'Commercial Projects', ar: 'مشاريع تجارية' },
  'custom projects': { en: 'Custom Projects', ar: 'مشاريع مخصصة' },
};

export function getItemLabel(item: any, locale = 'en'): string {
  if (!item) return '';
  if (item.label && typeof item.label === 'object') {
    return item.label[locale] || item.label.en || Object.values(item.label)[0] || '';
  }
  if (item.title && typeof item.title === 'object') {
    return item.title[locale] || item.title.en || Object.values(item.title)[0] || '';
  }
  if (typeof item.label === 'string') {
    if (locale !== 'en') {
      const match = DEFAULT_FALLBACK_LABELS[item.label.trim().toLowerCase()]?.[locale];
      if (match) return match;
    }
    return item.label;
  }
  if (typeof item.title === 'string') {
    if (locale !== 'en') {
      const match = DEFAULT_FALLBACK_LABELS[item.title.trim().toLowerCase()]?.[locale];
      if (match) return match;
    }
    return item.title;
  }
  return '';
}

export function buildLocalizedHref(localePrefix: string, href: any, locale = 'en'): string {
  if (!href) return localePrefix || '/';
  if (typeof href === 'object') {
    href = href[locale] || href.en || href.value || href.url || href.href || href.path || '/';
    if (typeof href !== 'string') href = '/';
  }
  if (typeof href !== 'string') return localePrefix || '/';
  if (
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('tel:') ||
    href.startsWith('mailto:')
  ) {
    return href;
  }
  if (href.startsWith('/#')) return localePrefix ? `${localePrefix}${href.slice(1)}` : href;
  if (href.startsWith('#')) return href;

  // Clean duplicate locale prefixes like /ar/ar/...
  const cleanHref = href.replace(/^(\/[a-z]{2})\/\1(\/|$)/i, '$1$2');
  if (cleanHref !== href) href = cleanHref;

  // If href already starts with current locale, do not prepend again
  const segments = href.split('/').filter(Boolean);
  if (segments.length > 0 && segments[0].toLowerCase() === locale.toLowerCase()) {
    return href;
  }
  if (localePrefix && (href === localePrefix || href.startsWith(`${localePrefix}/`))) return href;

  const resolved = resolveHrefWithPermalinks(href, locale);
  if (resolved !== href) {
    return resolved.replace(/^(\/[a-z]{2})\/\1(\/|$)/i, '$1$2');
  }
  if (href === '/') return localePrefix || '/';
  return `${localePrefix}${href.startsWith('/') ? '' : '/'}${href}`;
}

export function getItemHref(item: any, locale = 'en', localePrefix = ''): string {
  if (!item) return localePrefix || '/';
  const rawHref = item.path || item.href || item.url || '/';
  return buildLocalizedHref(localePrefix, rawHref, locale);
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

export default function Header({
  locale: propLocale,
  localePrefix: propLocalePrefix,
}: {
  locale?: string;
  localePrefix?: string;
} = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileExpandedIndex, setMobileExpandedIndex] = useState<number | null>(null);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  const params = useParams();
  const pathname = usePathname();
  const pathLocale = (pathname || '').split('/').filter(Boolean)[0]?.toLowerCase();
  const locale = propLocale || (params?.locale as string) || (pathLocale === 'ar' ? 'ar' : 'en');

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
  const isLanguageSwitcherEnabled = activeHeader?.language?.enabled !== false;

  const defaultLanguage = (blueprint?.localization?.defaultLanguage || 'en').toLowerCase();
  const localePrefix = propLocalePrefix ?? (locale === defaultLanguage ? '' : `/${locale}`);

  const navigationItems = useMemo(() => {
    let items: any[] = [];
    if (activeHeader?.menu && Array.isArray(activeHeader.menu) && activeHeader.menu.length > 0) {
      items = activeHeader.menu;
    } else if (blueprintNav?.public && Array.isArray(blueprintNav.public) && blueprintNav.public.length > 0) {
      items = blueprintNav.public;
    } else {
      items = headerData.navigation;
    }

    const filtered = items.filter((item) => {
      if (!item || item.isActive === false) return false;
      const rawPath = String(item.path || item.href || item.url || '').toLowerCase().trim();
      const rawLabel = getItemLabel(item, 'en').toLowerCase().trim();
      if (
        rawPath === '/about' ||
        rawPath === '/about-us' ||
        rawPath === 'about' ||
        rawLabel === 'about' ||
        rawLabel === 'about us'
      ) {
        return false;
      }
      return true;
    });

    const hasPromotions = filtered.some((item) => {
      const rawPath = String(item.path || item.href || item.url || '').toLowerCase().trim();
      const rawLabel = getItemLabel(item, 'en').toLowerCase().trim();
      return rawPath === '/promotions' || rawPath === 'promotions' || rawLabel === 'promotions';
    });

    if (!hasPromotions) {
      const promoItem = {
        label: { en: 'PROMOTIONS', ar: 'العروض' },
        href: '/promotions',
      };
      const contactIdx = filtered.findIndex((item) => {
        const rawPath = String(item.path || item.href || item.url || '').toLowerCase().trim();
        const rawLabel = getItemLabel(item, 'en').toLowerCase().trim();
        return rawPath === '/contact' || rawLabel.includes('contact');
      });
      if (contactIdx >= 0) {
        return [
          ...filtered.slice(0, contactIdx),
          promoItem,
          ...filtered.slice(contactIdx),
        ];
      }
      return [...filtered, promoItem];
    }

    return filtered;
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

  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 15);

      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollYRef.current + 6) {
          setIsHeaderVisible(false); // scrolling down -> hide
        } else if (currentScrollY < lastScrollYRef.current - 6) {
          setIsHeaderVisible(true); // scrolling up -> reveal
        }
      } else {
        setIsHeaderVisible(true);
      }
      lastScrollYRef.current = currentScrollY;
    };
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
    'https://arabmarble.ae/wp-content/uploads/2022/07/Arab-Marble-Final-All-01.png';
  const brandName = activeHeader?.logo?.text || activeHeader?.name || resolveBrandName(blueprint) || 'Arab Marble';

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-500 will-change-transform ${
          isHeaderVisible ? 'translate-y-0' : '-translate-y-full'
        } bg-white border-b border-gray-200 shadow-none`}
      >
        <div className="max-w-[1240px] mx-auto px-6 h-[72px] flex items-center justify-between">
          {/* Brand Logo */}
          <Link href={localePrefix || '/'} className="flex items-center outline-none focus:outline-none">
            <img
              src={dynamicLogo}
              alt={brandName}
              className="h-10 md:h-11 w-auto object-contain"
              onError={(e) => {
                e.currentTarget.src = '/images/arab-marble-logo.svg';
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-9">
            {navigationItems.map((item, index) => {
              const label = getItemLabel(item, locale);
              const fullHref = buildLocalizedHref(localePrefix, item.path || item.href || item.url || '/', locale);
              const subItems = getSubMenuColumns(item);
              const hasSub = subItems.length > 0;
              const isOpen = openDropdown === index;
              const isHome = fullHref === '/' || fullHref === `/${locale}` || item.path === '/' || item.href === '/';
              const isActive = isHome
                ? pathname === '/' || pathname === `/${locale}` || pathname === ''
                : pathname === fullHref || (fullHref !== '/' && pathname.startsWith(fullHref));

              return (
                <div
                  key={index}
                  className="relative py-6"
                  onMouseEnter={() => hasSub && setOpenDropdown(index)}
                  onMouseLeave={() => hasSub && setOpenDropdown(null)}
                >
                  <Link
                    href={fullHref}
                    className={`flex items-center gap-[3px] text-[15px] font-normal tracking-[0.1em] uppercase transition-colors duration-150 outline-none focus:outline-none focus:ring-0 ${
                      isActive
                        ? 'text-[#505050]'
                        : isOpen
                        ? 'text-[#505050]'
                        : 'text-[#aaaaaa] hover:text-[#555555]'
                    }`}
                  >
                    <span>{label}</span>
                    {hasSub && (
                      <svg
                        className={`w-2 h-2 mt-px transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </Link>

                  {/* Dropdown Menu */}
                  {hasSub && isOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[240px] bg-white border border-gray-200 shadow-sm py-1 z-50">
                      {subItems.map((sub: any, subIdx: number) => {
                        const subLabel = getItemLabel(sub, locale);
                        const subFullHref = buildLocalizedHref(localePrefix, sub.path || sub.href || sub.url || '/', locale);

                        return (
                          <Link
                            key={subIdx}
                            href={subFullHref}
                            className="block px-6 py-3 text-[15px] font-normal tracking-[0.1em] uppercase text-[#555555] hover:text-[#222222] hover:bg-gray-50 transition-colors text-center whitespace-nowrap"
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

          {/* Right Controls: Language Switcher (Desktop) & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            {isLanguageSwitcherEnabled && (
              <div className="hidden md:block">
                <LanguageSwitcher currentLocale={locale} />
              </div>
            )}

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
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          ref={menuPanelRef}
          className="fixed inset-0 top-[72px] bg-white z-40 p-6 flex flex-col overflow-y-auto md:hidden"
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {navigationItems.map((item, index) => {
              const label = getItemLabel(item, locale);
              const fullHref = buildLocalizedHref(localePrefix, item.path || item.href || item.url || '/', locale);
              const subItems = getSubMenuColumns(item);
              const hasSub = subItems.length > 0;
              const isExpanded = mobileExpandedIndex === index;

              return (
                <div key={index} className="py-3.5">
                  <div className="flex items-center justify-between">
                    <Link
                      href={fullHref}
                      onClick={closeMobile}
                      className="text-[15px] font-normal tracking-[0.08em] uppercase text-[#505050]"
                    >
                      {label}
                    </Link>
                    {hasSub && (
                      <button
                        onClick={() => setMobileExpandedIndex(isExpanded ? null : index)}
                        className="p-2 -mr-2 text-gray-500"
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
                    <div className="pl-4 pt-2.5 pb-1 flex flex-col gap-2">
                      {subItems.map((sub: any, subIdx: number) => {
                        const subLabel = getItemLabel(sub, locale);
                        const subFullHref = buildLocalizedHref(localePrefix, sub.path || sub.href || sub.url || '/', locale);

                        return (
                          <Link
                            key={subIdx}
                            href={subFullHref}
                            onClick={closeMobile}
                            className="text-[14px] font-normal tracking-[0.08em] uppercase text-[#666666] hover:text-[#222222] py-1.5 transition-colors"
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

          {isLanguageSwitcherEnabled && (
            <div className="pt-4 mt-2 flex items-center justify-between border-t border-gray-100">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Language</span>
              <LanguageSwitcher currentLocale={locale} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
