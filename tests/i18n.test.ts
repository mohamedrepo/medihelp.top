import { describe, expect, it } from 'vitest';
import { ar } from '../src/i18n/ar';
import { en } from '../src/i18n/en';
import { dictionaries } from '../src/i18n';
import { dirFor, isLocale, LOCALES, LOCALE_HREFLANG, toLocale } from '../src/i18n/types';

/**
 * Structural comparison.
 *
 * TypeScript already guarantees that `ar` has the same *shape* as `en`, but it
 * cannot check that arrays have the same length or that a string was left empty.
 * Those are exactly the ways a translation silently goes missing, so they are
 * asserted here at runtime.
 */

type Path = string;

function collectStrings(value: unknown, path: Path = '', out: Map<Path, string[]> = new Map()) {
  if (typeof value === 'string') {
    const existing = out.get(path) ?? [];
    existing.push(value);
    out.set(path, existing);
    return out;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectStrings(item, `${path}[${index}]`, out));
    return out;
  }
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) {
      collectStrings(nested, path ? `${path}.${key}` : key, out);
    }
  }
  return out;
}

/** Replace array indices with a `[]` marker so lengths can be compared. */
function shapeOf(value: unknown, path = ''): Map<Path, number | 'string' | 'array'> {
  const out = new Map<Path, number | 'string' | 'array'>();
  const walk = (node: unknown, current: string) => {
    if (typeof node === 'string') {
      out.set(current, 'string');
      return;
    }
    if (Array.isArray(node)) {
      out.set(current, 'array');
      out.set(`${current}.length`, node.length);
      node.forEach((item, index) => walk(item, `${current}[${index}]`));
      return;
    }
    if (node && typeof node === 'object') {
      for (const [key, nested] of Object.entries(node)) {
        walk(nested, current ? `${current}.${key}` : key);
      }
    }
  };
  walk(value, path);
  return out;
}

describe('locale constants', () => {
  it('exposes exactly English and Arabic, with English first as the default', () => {
    expect(LOCALES).toEqual(['en', 'ar']);
  });

  it('maps direction correctly', () => {
    expect(dirFor('en')).toBe('ltr');
    expect(dirFor('ar')).toBe('rtl');
  });

  it('narrows untrusted values to the default locale', () => {
    expect(isLocale('ar')).toBe(true);
    expect(isLocale('fr')).toBe(false);
    expect(isLocale(undefined)).toBe(false);
    expect(toLocale('fr')).toBe('en');
    expect(toLocale(null)).toBe('en');
    expect(toLocale('ar')).toBe('ar');
  });

  it('declares hreflang codes for both locales', () => {
    expect(LOCALE_HREFLANG.en).toBe('en');
    expect(LOCALE_HREFLANG.ar).toBe('ar');
  });
});

describe('dictionary completeness', () => {
  it('has a dictionary for every declared locale', () => {
    for (const locale of LOCALES) {
      expect(dictionaries[locale]).toBeDefined();
    }
  });

  it('matches key structure exactly', () => {
    const english = shapeOf(en);
    const arabic = shapeOf(ar);

    const missingInArabic = [...english.keys()].filter((key) => !arabic.has(key));
    const extraInArabic = [...arabic.keys()].filter((key) => !english.has(key));

    expect(missingInArabic).toEqual([]);
    expect(extraInArabic).toEqual([]);
  });

  it('keeps every array the same length', () => {
    const english = shapeOf(en);
    const arabic = shapeOf(ar);

    const mismatches: string[] = [];
    for (const [key, value] of english) {
      if (key.endsWith('.length') && arabic.get(key) !== value) {
        mismatches.push(`${key}: en=${value} ar=${arabic.get(key)}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('has no empty or whitespace-only strings in either locale', () => {
    for (const locale of LOCALES) {
      const strings = collectStrings(dictionaries[locale]);
      const blanks: string[] = [];
      for (const [path, values] of strings) {
        values.forEach((value, index) => {
          if (value.trim().length === 0) blanks.push(`${locale}:${path}[${index}]`);
        });
      }
      expect(blanks).toEqual([]);
    }
  });

  it('translates the copy that actually differs between locales', () => {
    // These must not be identical, or Arabic is not really translated.
    expect(ar.nav.projects).not.toBe(en.nav.projects);
    expect(ar.home.hero.title).not.toBe(en.home.hero.title);
    expect(ar.contact.form.submit).not.toBe(en.contact.form.submit);
    expect(ar.notFound.heading).not.toBe(en.notFound.heading);
  });

  it('keeps the brand name identical across locales', () => {
    // A transliterated brand name would be worse than keeping it in Latin.
    expect(ar.brand.name).toBe(en.brand.name);
  });

  it('uses Arabic script in Arabic copy and Latin script in English copy', () => {
    const arabicScript = /[\u0600-\u06FF]/;
    expect(arabicScript.test(ar.home.hero.title)).toBe(true);
    expect(arabicScript.test(ar.nav.contact)).toBe(true);
    expect(arabicScript.test(en.home.hero.title)).toBe(false);
  });

  it('never states a price or a delivery promise in either locale', () => {
    const banned = [/\$\s?\d/, /\bper month\b/i, /\b\d+\s?(day|week)s? delivery\b/i, /warranty/i];
    for (const locale of LOCALES) {
      for (const [, values] of collectStrings(dictionaries[locale])) {
        for (const value of values) {
          for (const pattern of banned) {
            expect(pattern.test(value), `${locale}: ${value}`).toBe(false);
          }
        }
      }
    }
  });
});
