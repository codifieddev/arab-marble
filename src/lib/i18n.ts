/**
 * i18n helpers
 * Picks the correct locale value from a localized field map: { en: "...", hi: "..." }
 */
import { buildLocalizedHref, isLocalePattern, stripLocalePrefix } from './locale-utils';

export { buildLocalizedHref, isLocalePattern, stripLocalePrefix };

export type LocaleMap = Record<string, unknown>;
export type SupportedLocale = 'en' | string;

export const DEFAULT_LOCALE: SupportedLocale = 'en';

/**
 * Resolve a localized value — returns the locale string, falls back to defaultLocale, then first available.
 */
export function t(
  field: unknown,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (typeof field === 'number' || typeof field === 'boolean') return String(field);
  if (typeof field !== 'object' || Array.isArray(field)) return '';

  const record = field as Record<string, unknown>;
  if ('type' in record && 'value' in record) return t(record.value, locale);

  const localized = record[locale] ?? record[DEFAULT_LOCALE] ?? Object.values(record)[0];
  if (typeof localized === 'string') return localized;
  if (typeof localized === 'number' || typeof localized === 'boolean') return String(localized);
  if (localized && typeof localized === 'object') return t(localized, locale);

  return '';
}

/**
 * Resolve a localized value with HTML (for dangerouslySetInnerHTML use-cases).
 */
export function tHtml(
  field: unknown,
  locale: SupportedLocale = DEFAULT_LOCALE
): string {
  return t(field, locale);
}

// Backward compatibility alias
export function getLocalizedString(
  value: string | number | LocaleMap | undefined | null,
  locale: string = 'en'
): string {
  return t(value, locale);
}

/**
 * URL builder delegating to centralized buildLocalizedHref helper.
 */
export function getLocalizedUrl(
  path: string,
  locale: string = 'en',
  defaultLocale: string = 'en'
): string {
  return buildLocalizedHref(path, locale, defaultLocale);
}
