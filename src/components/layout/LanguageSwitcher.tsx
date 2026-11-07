'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectLocalization, selectHeaderConfig } from '@/lib/store/blueprint';

const LANGUAGE_LABELS: Record<string, { label: string }> = {
  en: { label: 'EN' },
  hi: { label: 'HI' },
  es: { label: 'ES' },
  fr: { label: 'FR' },
  de: { label: 'DE' },
  zh: { label: 'ZH' },
  ar: { label: 'AR' },
  ja: { label: 'JA' },
  pt: { label: 'PT' },
  ru: { label: 'RU' },
  it: { label: 'IT' },
  nl: { label: 'NL' },
  tr: { label: 'TR' },
  ko: { label: 'KO' },
};

export default function LanguageSwitcher({
  className = '',
  currentLocale: propLocale,
}: {
  className?: string;
  currentLocale?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  const localization = useAppSelector(selectLocalization);
  const headerConfig = useAppSelector(selectHeaderConfig);
  const defaultLanguage = (localization?.defaultLanguage || 'en').toLowerCase();

  // Extract all enabled languages
  const rawLangs = localization?.languages || localization?.activeLanguages || [];
  const supportedLanguages: string[] = Array.isArray(rawLangs)
    ? rawLangs
        .map((item: any) =>
          typeof item === 'string' ? item : item.enabled !== false ? item.code : null
        )
        .filter(Boolean)
        .map((c: string) => c.toLowerCase())
    : [defaultLanguage];

  if (!supportedLanguages.includes(defaultLanguage)) {
    supportedLanguages.unshift(defaultLanguage);
  }

  const pathSegments = (pathname || '').split('/').filter(Boolean);
  const pathLocale = pathSegments.length > 0 ? pathSegments[0].toLowerCase() : '';
  const detectedLocale =
    propLocale ||
    (params?.locale as string) ||
    (supportedLanguages.includes(pathLocale) ? pathLocale : defaultLanguage);
  const currentLocale = (detectedLocale || defaultLanguage).toLowerCase();

  // Close dropdown on outside click - MUST be before any return to satisfy React Rules of Hooks
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (targetLang: string) => {
    setIsOpen(false);
    if (targetLang === currentLocale) return;

    // Remove any and all supported locale prefixes from current pathname
    const segments = (pathname || '').split('/').filter(Boolean);
    while (segments.length > 0 && supportedLanguages.includes(segments[0].toLowerCase())) {
      segments.shift();
    }
    const cleanPath = segments.length > 0 ? `/${segments.join('/')}` : '/';

    const newPath =
      targetLang === defaultLanguage
        ? cleanPath
        : cleanPath === '/'
        ? `/${targetLang}`
        : `/${targetLang}${cleanPath}`;

    const search = typeof window !== 'undefined' ? window.location.search || '' : '';
    const hash = typeof window !== 'undefined' ? window.location.hash || '' : '';
    router.push(`${newPath}${search}${hash}`);
  };

  // If single language tenant or language switcher turned off in header config, don't show the switcher (checked AFTER all hooks)
  if (supportedLanguages.length <= 1 || headerConfig?.language?.enabled === false) {
    return null;
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="hdr-btn inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-foreground/80 hover:text-foreground border border-border/60 hover:border-border transition-all"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <svg className="w-4 h-4 opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.8" />
          <path
            strokeWidth="1.8"
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
        <span className="uppercase font-bold tracking-wider">
          {LANGUAGE_LABELS[currentLocale]?.label || currentLocale.toUpperCase()}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 rounded-xl bg-card border border-border shadow-xl z-50 py-1.5 overflow-hidden backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150">
          {supportedLanguages.map((code) => {
            const isSelected = code === currentLocale;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectLanguage(code)}
                className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{LANGUAGE_LABELS[code]?.label || code.toUpperCase()}</span>
                {isSelected && (
                  <svg
                    className="w-3.5 h-3.5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
