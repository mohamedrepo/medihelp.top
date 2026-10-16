// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';

import { applyDocumentHead } from '../src/hooks/use-document-head';
import { headTags } from '../src/lib/head';
import { seoFor, structuredDataFor } from '../src/lib/seo';
import { projects } from '../src/data/projects';
import type { Route } from '../src/router';
import { LOCALES } from '../src/i18n/types';

/** Every route the application can render, including one valid and one unknown project. */
const ROUTES: Route[] = [
  { kind: 'home' },
  { kind: 'projects' },
  { kind: 'services' },
  { kind: 'about' },
  { kind: 'contact' },
  { kind: 'privacy' },
  { kind: 'notFound', path: '/missing/' },
  ...projects.map((project): Route => ({ kind: 'project', slug: project.slug })),
  { kind: 'project', slug: '__does_not_exist__' },
];

/**
 * Regression tests for the client-side head manager.
 *
 * These exist because a single character turned the entire site blank in a real
 * browser while every static-HTML check still passed: the managed-marker
 * attribute name had been written as `data-managed="head"`, and `setAttribute`
 * rejects an attribute *name* containing `"` and `=`. The throw happened during
 * the hydration effect, React tore down the prerendered tree, and the page
 * rendered empty. Only a DOM test catches this class of failure.
 */

/** Attribute names are constrained by the DOM; a name with these characters is invalid. */
const INVALID_ATTR_NAME = /[\s"'<=>/]/;

beforeEach(() => {
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  document.documentElement.removeAttribute('lang');
  document.documentElement.removeAttribute('dir');
  document.title = '';
});

function headElements(): Element[] {
  return Array.from(document.head.children);
}

describe('applyDocumentHead', () => {
  it('never throws and always applies metadata for every route in every locale', () => {
    for (const locale of LOCALES) {
      for (const route of ROUTES) {
        const seo = seoFor(locale, route);
        expect(() => applyDocumentHead(seo, structuredDataFor(locale, route))).not.toThrow();

        expect(document.title).toBe(seo.title);
        expect(document.documentElement.lang).toBe(locale);
        expect(document.documentElement.dir).toBe(locale === 'ar' ? 'rtl' : 'ltr');

        const description = document.head.querySelector('meta[name="description"]');
        expect(description?.getAttribute('content')).toBe(seo.description);

        const canonical = document.head.querySelector('link[rel="canonical"]');
        expect(canonical?.getAttribute('href')).toBe(seo.canonical);
      }
    }
  });

  it('writes the managed marker as a valid attribute name and value', () => {
    const seo = seoFor('en', ROUTES[0]);
    applyDocumentHead(seo, structuredDataFor('en', ROUTES[0]));

    const created = headElements().filter((el) => el.hasAttribute('data-managed'));
    expect(created.length).toBeGreaterThan(0);

    for (const element of created) {
      // The exact bug: `data-managed="head"` used as a NAME produced a literal
      // attribute called `data-managed="head"`, which the DOM refuses.
      expect(element.getAttribute('data-managed')).toBe('head');
      for (const attribute of Array.from(element.attributes)) {
        expect(attribute.name).not.toMatch(INVALID_ATTR_NAME);
      }
    }
  });

  it('does not accumulate duplicate tags across navigations', () => {
    const home: Route = ROUTES[0];
    applyDocumentHead(seoFor('en', home), structuredDataFor('en', home));
    const afterHome = headElements().length;

    // Wander through every route twice. The tag count for any given route must
    // come back identical, which is what proves upsert-never-append.
    for (let pass = 0; pass < 2; pass += 1) {
      for (const route of ROUTES) {
        applyDocumentHead(seoFor('en', route), structuredDataFor('en', route));
      }
      applyDocumentHead(seoFor('en', home), structuredDataFor('en', home));
      expect(headElements().length).toBe(afterHome);
    }

    // No selector may ever match more than once, for any route.
    for (const route of ROUTES) {
      applyDocumentHead(seoFor('en', route), structuredDataFor('en', route));
      expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
      expect(document.head.querySelectorAll('meta[name="robots"]').length).toBe(1);
      expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
      expect(document.head.querySelectorAll('#structured-data').length).toBe(1);
    }
  });

  it('replaces alternates instead of stacking them when the language changes', () => {
    const route = ROUTES[0];
    applyDocumentHead(seoFor('en', route), structuredDataFor('en', route));
    const alternatesEn = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
    expect(alternatesEn.length).toBe(seoFor('en', route).alternates.length);

    applyDocumentHead(seoFor('ar', route), structuredDataFor('ar', route));
    const alternatesAr = document.head.querySelectorAll('link[rel="alternate"][hreflang]');

    expect(alternatesAr.length).toBe(seoFor('ar', route).alternates.length);
    expect(document.documentElement.dir).toBe('rtl');

    // `hreflang` values must be unique, and may not describe the Arabic edition
    // twice. Note the hrefs are deliberately NOT unique: `x-default` resolves to
    // the English edition, so it shares a URL with `hreflang="en"`.
    const hreflangs = Array.from(alternatesAr).map((el) => el.getAttribute('hreflang'));
    expect(new Set(hreflangs).size).toBe(hreflangs.length);
    expect(hreflangs).toContain('en');
    expect(hreflangs).toContain('ar');
    expect(hreflangs).toContain('x-default');

    const englishHref = document.head
      .querySelector('link[rel="alternate"][hreflang="en"]')
      ?.getAttribute('href');
    const defaultHref = document.head
      .querySelector('link[rel="alternate"][hreflang="x-default"]')
      ?.getAttribute('href');
    expect(defaultHref).toBe(englishHref);

    // The canonical tag follows the locale, not the alternate set.
    expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      seoFor('ar', route).canonical,
    );
  });

  /**
   * The real starting condition in a browser is not an empty `<head>`: it is the
   * head the prerender pass wrote into the static HTML. Seeding that head first is
   * what makes these assertions meaningful — a test that begins from an empty head
   * cannot observe a stale tag that the hook fails to reconcile.
   */
  function seedPrerenderedHead(route: Route, locale: 'en' | 'ar' = 'en'): void {
    document.head.innerHTML = headTags(seoFor(locale, route), structuredDataFor(locale, route));
  }

  it('seeds a single title and a single JSON-LD block from the prerendered head', () => {
    seedPrerenderedHead(ROUTES[0]);

    expect(document.head.querySelectorAll('title').length).toBe(1);
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(document.head.querySelectorAll('script[type="application/ld+json"]').length).toBe(1);
    // The prerendered block must be addressable, or the hook cannot update it.
    expect(document.getElementById('structured-data')).not.toBeNull();
  });

  it('reconciles the prerendered head on a client-side navigation', () => {
    const home: Route = ROUTES[0];
    const project: Route = { kind: 'project', slug: projects[0].slug };
    seedPrerenderedHead(home);

    applyDocumentHead(seoFor('en', project), structuredDataFor('en', project));

    // Before the fix the hook created a second JSON-LD block, because the
    // prerendered one carried no id for `getElementById` to find — the page then
    // shipped the previous route's organisation data alongside the current one.
    const blocks = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks.length).toBe(1);
    expect(blocks[0].id).toBe('structured-data');

    const parsed: unknown = JSON.parse(blocks[0].textContent ?? '');
    const entries = Array.isArray(parsed) ? parsed : [parsed];
    const types = entries.map((entry) => (entry as Record<string, unknown>)['@type']);
    expect(types).toContain('Organization');
    expect(types).toContain('SoftwareApplication');

    // Everything else the hook owns stays singular too.
    expect(document.head.querySelectorAll('title').length).toBe(1);
    expect(document.head.querySelectorAll('meta[name="description"]').length).toBe(1);
    expect(document.head.querySelectorAll('meta[name="robots"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="canonical"]').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(
      seoFor('en', project).alternates.length,
    );

    // A language change on top of the same seeded head must not reintroduce a tag.
    applyDocumentHead(seoFor('ar', home), structuredDataFor('ar', home));
    expect(document.head.querySelectorAll('script[type="application/ld+json"]').length).toBe(1);
    expect(document.head.querySelectorAll('title').length).toBe(1);
    expect(document.head.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(
      seoFor('ar', home).alternates.length,
    );
  });

  it('discards a JSON-LD block it does not own', () => {
    seedPrerenderedHead(ROUTES[0]);

    // Simulate a stray block, e.g. one injected by a browser extension or a stale
    // build that predates the managed id.
    const stray = document.createElement('script');
    stray.type = 'application/ld+json';
    stray.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'Thing' });
    document.head.appendChild(stray);
    expect(document.head.querySelectorAll('script[type="application/ld+json"]').length).toBe(2);

    applyDocumentHead(seoFor('en', ROUTES[1]), structuredDataFor('en', ROUTES[1]));

    const blocks = document.head.querySelectorAll('script[type="application/ld+json"]');
    expect(blocks.length).toBe(1);
    expect(blocks[0].textContent).not.toContain('"Thing"');
  });

  it('emits parseable JSON-LD and marks the 404 route as noindex', () => {
    const notFound: Route = { kind: 'notFound', path: '/missing/' };

    applyDocumentHead(seoFor('ar', notFound), structuredDataFor('ar', notFound));

    const robots = document.head.querySelector('meta[name="robots"]');
    expect(robots?.getAttribute('content')).toBe('noindex, follow');
    expect(document.head.querySelectorAll('link[rel="alternate"][hreflang]').length).toBe(0);

    const script = document.getElementById('structured-data');
    expect(script).not.toBeNull();
    expect(() => JSON.parse(script!.textContent ?? '')).not.toThrow();
  });
});
