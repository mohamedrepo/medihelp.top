import { ar } from './ar';
import { en, type Dictionary } from './en';
import type { Locale } from './types';

export const dictionaries: Record<Locale, Dictionary> = { en, ar };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Replace `{name}` placeholders in a translated string.
 * Values are inserted verbatim; nothing is interpreted as HTML.
 */
export function formatMessage(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value === undefined ? match : String(value);
  });
}

/** Pick the singular or plural string for a count. */
export function pluralize(
  forms: { one: string; many: string },
  count: number,
  vars: Record<string, string | number> = {},
): string {
  const template = count === 1 ? forms.one : forms.many;
  return formatMessage(template, { count, ...vars });
}

export * from './types';
export type { Dictionary };
