'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import { selectLocalization, selectHeaderConfig } from '@/lib/store/blueprint';

const LANGUAGE_LABELS: Record<string, { label: string; name: string }> = {
  en: { label: 'EN', name: 'English' },
  ar: { label: 'AR', name: 'العربية' },
  hi: { label: 'HI', name: 'हिन्दी' },
  es: { label: 'ES', name: 'Español' },
  fr: { label: 'FR', name: 'Français' },
  de: { label: 'DE', name: 'Deutsch' },
  zh: { label: 'ZH', name: '中文' },
  ja: { label: 'JA', name: '日本語' },
  pt: { label: 'PT', name: 'Português' },
  ru: { label: 'RU', name: 'Русский' },
  it: { label: 'IT', name: 'Italiano' },
  nl: { label: 'NL', name: 'Nederlands' },
  tr: { label: 'TR', name: 'Türkçe' },
  ko: { label: 'KO', name: '한국어' },
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

  // Close dropdown on outside click
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

  // If single language tenant or language switcher turned off in header config, don't show the switcher
  if (supportedLanguages.length <= 1 || headerConfig?.language?.enabled === false) {
    return null;
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button - Refined Arab Marble Luxury Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs text-xs font-semibold tracking-wider text-neutral-800 hover:text-[#C9A96E] border border-neutral-300/80 hover:border-[#C9A96E] bg-white transition-all duration-300 shadow-2xs cursor-pointer select-none"
        aria-label="Switch language"
        aria-expanded={isOpen}
      >
        <svg className="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#C9A96E] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" strokeWidth="1.6" />
          <path
            strokeWidth="1.6"
            d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
          />
        </svg>
        <span className="uppercase font-semibold tracking-[0.15em] text-[11px]">
          {LANGUAGE_LABELS[currentLocale]?.label || currentLocale.toUpperCase()}
        </span>
        <svg
          className={`w-3 h-3 text-neutral-400 group-hover:text-[#C9A96E] transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#C9A96E]' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu - Architectural Luxury Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xs bg-white border border-neutral-200 shadow-2xl z-50 py-1.5 overflow-hidden border-t-2 border-t-[#C9A96E] animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3.5 py-1.5 border-b border-neutral-100 mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#C9A96E] font-semibold">
              Language
            </span>
          </div>
          {supportedLanguages.map((code) => {
            const isSelected = code === currentLocale;
            const lang = LANGUAGE_LABELS[code] || { label: code.toUpperCase(), name: code.toUpperCase() };
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelectLanguage(code)}
                className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between transition-colors duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#C9A96E]/12 text-[#9E7D42] font-semibold border-l-2 border-[#C9A96E]'
                    : 'text-neutral-700 hover:bg-neutral-50 hover:text-black border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs tracking-wider">{lang.label}</span>
                  {lang.name && (
                    <span className="text-[11px] text-neutral-400 font-normal">
                      ({lang.name})
                    </span>
                  )}
                </div>
                {isSelected && (
                  <svg
                    className="w-4 h-4 text-[#C9A96E]"
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
