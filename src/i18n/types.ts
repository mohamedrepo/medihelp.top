/**
 * Locale contract for the whole site.
 *
 * English is the default and the source of truth for the dictionary shape;
 * Arabic is a fully first-class locale, not a translation layer bolted on.
 */

export const LOCALES = ['en', 'ar'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** HTML `dir` for a locale. Arabic is a right-to-left script. */
export function dirFor(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

/** Native name shown in the language switcher. */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية',
};

/** Short code shown inside the switcher control. */
export const LOCALE_SHORT: Record<Locale, string> = {
  en: 'EN',
  ar: 'AR',
};

/** `hreflang` value for a locale — these are simple language codes, not regions. */
export const LOCALE_HREFLANG: Record<Locale, string> = {
  en: 'en',
  ar: 'ar',
};

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Narrow an untrusted string to a Locale, falling back to the default. */
export function toLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
