// @vitest-environment jsdom
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LocaleSwitcher } from '../src/components/LocaleSwitcher';
import { RouterProvider, setInitialHref } from '../src/router-context';

/**
 * The switcher is server-rendered, so `renderToStaticMarkup` exercises exactly
 * the markup the prerender pass writes into each static page — no test library
 * and no hydration needed.
 *
 * These tests exist because the component used the raw `pathname` for the
 * current locale. On the 404 document that emitted a link to `/en/404/`, a path
 * with no generated file, so a visitor who clicked their own language was sent
 * to a dead route.
 *
 * Assertions read the parsed DOM rather than the raw markup: React emits the
 * `hrefLang` prop verbatim, and HTML attribute names are case-insensitive, so
 * `hreflang` is what both the browser and a crawler actually see.
 */
function renderSwitcherAt(pathname: string): Document {
  setInitialHref(pathname);
  const markup = renderToStaticMarkup(
    createElement(RouterProvider, null, createElement(LocaleSwitcher)),
  );
  return new DOMParser().parseFromString(markup, 'text/html');
}

/** Every link the switcher emitted, in render order (always en, then ar). */
function links(pathname: string): HTMLAnchorElement[] {
  return [...renderSwitcherAt(pathname).querySelectorAll('a')];
}

function hrefs(pathname: string): string[] {
  return links(pathname).map((link) => link.getAttribute('href') ?? '');
}

describe('LocaleSwitcher', () => {
  it('links both locales to the equivalent page on a normal route', () => {
    expect(hrefs('/en/projects/card-scanner/')).toEqual([
      '/en/projects/card-scanner/',
      '/ar/projects/card-scanner/',
    ]);
    // The order is fixed by LOCALES, not by which locale is active.
    expect(hrefs('/ar/services/')).toEqual(['/en/services/', '/ar/services/']);
    expect(hrefs('/en/')).toEqual(['/en/', '/ar/']);
    expect(hrefs('/ar/')).toEqual(['/en/', '/ar/']);
  });

  it('never links to a not-found path, in either locale', () => {
    for (const [from, expected] of [
      ['/en/does-not-exist/', ['/en/', '/ar/']],
      // The path the 404 document is actually prerendered from.
      ['/en/404/', ['/en/', '/ar/']],
      ['/ar/missing/deeper/', ['/en/', '/ar/']],
    ] as const) {
      const result = hrefs(from);
      expect(result).toEqual([...expected]);
      for (const href of result) {
        expect(href).not.toMatch(/404/);
        expect(href).not.toContain('does-not-exist');
        expect(href).not.toContain('missing');
      }
    }
  });

  it('keeps a safe query string on both links', () => {
    expect(hrefs('/en/projects/?category=fleet')).toEqual([
      '/en/projects/?category=fleet',
      '/ar/projects/?category=fleet',
    ]);
  });

  it('drops an unsafe query string rather than reflecting it into a link', () => {
    for (const href of hrefs('/en/projects/?q=<script>')) {
      expect(href).not.toMatch(/[<>"']/);
    }
  });

  it('states the hreflang relationship and marks exactly one active language', () => {
    for (const locale of ['en', 'ar'] as const) {
      const rendered = links(`/${locale}/about/`);
      expect(rendered.map((link) => link.getAttribute('hreflang'))).toEqual(['en', 'ar']);
      expect(rendered.map((link) => link.getAttribute('lang'))).toEqual(['en', 'ar']);

      const current = rendered.filter((link) => link.getAttribute('aria-current') === 'true');
      expect(current).toHaveLength(1);
      expect(current[0].getAttribute('lang')).toBe(locale);
      // The inactive language carries a title describing the action, not the state.
      const other = rendered.find((link) => link !== current[0]);
      expect(other?.getAttribute('title')).toBeTruthy();
      expect(other?.getAttribute('aria-current')).toBeNull();
    }
  });

  it('names the switcher for screen readers in the active language', () => {
    expect(links('/en/').find((l) => l.getAttribute('aria-current'))?.textContent).toContain(
      'English',
    );
    const arabic = renderSwitcherAt('/ar/').querySelector('[role="group"]');
    expect(arabic?.getAttribute('aria-label')).toBe('اللغة');
  });
});
