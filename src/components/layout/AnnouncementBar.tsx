'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectHeaderConfig } from '@/lib/store/blueprint';
import { resolveHrefWithPermalinks } from '@/lib/permalink/url-helper';

function buildLocalizedHref(localePrefix: string, href: any, locale = 'en') {
  if (!href) return localePrefix || '/';
  if (typeof href === 'object') {
    href = href[locale] || href.en || href.value || href.url || href.href || href.path || '/';
    if (typeof href !== 'string') href = '/';
  }
  if (typeof href !== 'string') return localePrefix || '/';
  if (href.startsWith('/#')) {
    return localePrefix ? `${localePrefix}${href.slice(1)}` : href;
  }

  if (href.startsWith('#')) {
    return href;
  }

  const resolved = resolveHrefWithPermalinks(href, locale);
  if (resolved !== href) return resolved;

  if (href === '/') {
    return localePrefix || '/';
  }

  return `${localePrefix}${href}`;
}

export default function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();

  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const localePrefix = locale === 'en' ? '' : `/${locale}`;

  const headerConfig = useAppSelector(selectHeaderConfig);
  const announcement = headerConfig?.announcement;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        const bar = document.getElementById('announcement-bar');
        if (bar) {
          bar.style.maxHeight = '0';
          bar.style.padding = '0';
          bar.style.overflow = 'hidden';
          bar.style.transition = 'all 0.4s';
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.includes('/login') || pathname?.includes('/signup')) {
    return null;
  }

  // If explicitly disabled in Kalp-Admin
  if (announcement && (announcement.enabled === false || announcement.isActive === false)) {
    return null;
  }

  if (!isVisible) return null;

  const rawText = announcement?.text;
  const text = typeof rawText === 'object' && rawText !== null
    ? (rawText[locale] || rawText.en || Object.values(rawText)[0] || (locale === 'hi' ? 'सभी यूएस ऑर्डर पर मुफ़्त शिपिंग' : 'Free shipping on all USA orders'))
    : (rawText || (locale === 'hi' ? 'सभी यूएस ऑर्डर पर मुफ़्त शिपिंग' : 'Free shipping on all USA orders'));
  const bgColor = announcement?.bgColor || 'var(--primary)';
  const textColor = announcement?.textColor || 'white';
  const isClosable = announcement?.closable !== false;

  return (
    <div
      id="announcement-bar"
      className="announcement-bar"
      style={{
        background: bgColor,
        textAlign: 'center',
        padding: '9px 20px',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: textColor,
        position: 'relative',
      }}
    >
      <span>{text} &mdash; </span>
      <Link
        href={buildLocalizedHref(localePrefix, '/shop', locale)}
        style={{ color: textColor, textDecoration: 'underline', textUnderlineOffset: 3 }}
      >
        {locale === 'hi' ? 'अभी खरीदें' : 'Shop Now'}
      </Link>
      {isClosable && (
        <button
          onClick={() => setIsVisible(false)}
          style={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            borderRadius: '50%',
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
            cursor: 'pointer',
            transition: 'background 0.28s',
          }}
          aria-label="Close"
        >
          <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 10 10">
            <path d="M1 1l8 8M9 1L1 9" />
          </svg>
        </button>
      )}
    </div>
  );
}
