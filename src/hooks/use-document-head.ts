import { useEffect } from 'react';
import type { PageSeo } from '../lib/seo';

/**
 * Applies per-route metadata in the browser.
 *
 * The prerender pass writes the same tags into the static HTML, so this hook
 * only matters for client-side navigations after hydration. It upserts rather
 * than appends, so repeated navigation does not accumulate duplicate tags.
 */

/**
 * Marks every element this module created, so it can be distinguished from tags
 * written by the prerender pass. The attribute NAME and its VALUE are separate:
 * passing `data-managed="head"` as a name throws `InvalidCharacterError`, which
 * during hydration wipes the whole prerendered page. Covered by a jsdom test.
 */
const MANAGED_ATTR = 'data-managed';
const MANAGED_VALUE = 'head';

function upsertMeta(selector: string, attrs: Record<string, string>): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(MANAGED_ATTR, MANAGED_VALUE);
    document.head.appendChild(element);
  }
  for (const [key, value] of Object.entries(attrs)) element.setAttribute(key, value);
}

function upsertLink(rel: string, hreflang: string | null, href: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    if (hreflang) element.hreflang = hreflang;
    element.setAttribute(MANAGED_ATTR, MANAGED_VALUE);
    document.head.appendChild(element);
  }
  element.href = href;
}

export function applyDocumentHead(seo: PageSeo, structuredData: Record<string, unknown>[]): void {
  document.title = seo.title;

  const root = document.documentElement;
  root.lang = seo.locale;
  root.dir = seo.locale === 'ar' ? 'rtl' : 'ltr';

  upsertMeta('meta[name="description"]', { name: 'description', content: seo.description });
  upsertMeta('meta[name="robots"]', { name: 'robots', content: seo.robots });

  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: seo.title });
  upsertMeta('meta[property="og:description"]', {
    property: 'og:description',
    content: seo.description,
  });
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: seo.canonical });
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: seo.ogType });
  upsertMeta('meta[property="og:locale"]', {
    property: 'og:locale',
    content: seo.locale === 'ar' ? 'ar_EG' : 'en_US',
  });
  upsertMeta('meta[property="og:image"]', {
    property: 'og:image',
    content: new URL('/og-image.svg', seo.canonical).toString(),
  });

  upsertMeta('meta[name="twitter:card"]', {
    name: 'twitter:card',
    content: 'summary_large_image',
  });
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: seo.title });
  upsertMeta('meta[name="twitter:description"]', {
    name: 'twitter:description',
    content: seo.description,
  });

  upsertLink('canonical', null, seo.canonical);

  // Remove stale alternates before writing the current set.
  for (const stale of document.head.querySelectorAll('link[rel="alternate"][hreflang]')) {
    stale.remove();
  }
  for (const alternate of seo.alternates) {
    upsertLink('alternate', alternate.hreflang, alternate.href);
  }

  // Drop any JSON-LD block this module does not own. The prerendered document
  // ships exactly one, already carrying the managed id, so it is updated in
  // place; without this, a block that lacked the id would survive and every
  // navigation would leave an extra, stale copy behind.
  for (const stale of document.head.querySelectorAll(
    'script[type="application/ld+json"]:not(#structured-data)',
  )) {
    stale.remove();
  }

  let script = document.getElementById('structured-data');
  if (!script) {
    script = document.createElement('script');
    script.id = 'structured-data';
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData);
}

export function useDocumentHead(seo: PageSeo, structuredData: Record<string, unknown>[]): void {
  useEffect(() => {
    applyDocumentHead(seo, structuredData);
  }, [seo, structuredData]);
}
