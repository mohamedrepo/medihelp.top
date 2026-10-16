import { describe, expect, it } from 'vitest';
import { isSafeSearch, parsePath, routePath, switchLocalePath } from '../src/router';

describe('parsePath', () => {
  it('treats the root as the default locale home and asks for a redirect', () => {
    const matched = parsePath('/');
    expect(matched.locale).toBe('en');
    expect(matched.route).toEqual({ kind: 'home' });
    expect(matched.redirectTo).toBe('/en/');
  });

  it('resolves locale-prefixed routes without a redirect', () => {
    expect(parsePath('/en/')).toEqual({ locale: 'en', route: { kind: 'home' } });
    expect(parsePath('/ar/')).toEqual({ locale: 'ar', route: { kind: 'home' } });
    expect(parsePath('/en/projects/')).toEqual({ locale: 'en', route: { kind: 'projects' } });
    expect(parsePath('/ar/services/')).toEqual({ locale: 'ar', route: { kind: 'services' } });
    expect(parsePath('/en/about/')).toEqual({ locale: 'en', route: { kind: 'about' } });
    expect(parsePath('/en/contact/')).toEqual({ locale: 'en', route: { kind: 'contact' } });
    expect(parsePath('/en/privacy/')).toEqual({ locale: 'en', route: { kind: 'privacy' } });
  });

  it('tolerates a missing trailing slash', () => {
    expect(parsePath('/en/projects')?.route).toEqual({ kind: 'projects' });
    expect(parsePath('/ar/projects/smartfleet-manager')?.route).toEqual({
      kind: 'project',
      slug: 'smartfleet-manager',
    });
  });

  it('parses a project detail route', () => {
    const matched = parsePath('/ar/projects/eta-invoicing-exporter/');
    expect(matched.locale).toBe('ar');
    expect(matched.route).toEqual({ kind: 'project', slug: 'eta-invoicing-exporter' });
  });

  it('rewrites an unprefixed path to the default locale', () => {
    const matched = parsePath('/projects/');
    expect(matched.locale).toBe('en');
    expect(matched.route).toEqual({ kind: 'projects' });
    expect(matched.redirectTo).toBe('/en/projects/');
  });

  it('returns notFound for unknown and over-long routes', () => {
    expect(parsePath('/en/nope/').route.kind).toBe('notFound');
    expect(parsePath('/en/projects/a/b/').route.kind).toBe('notFound');
    expect(parsePath('/en/services/extra/').route.kind).toBe('notFound');
  });

  it('ignores query strings and hashes', () => {
    expect(parsePath('/en/projects/?category=fleet').route).toEqual({ kind: 'projects' });
    expect(parsePath('/en/contact/#form').route).toEqual({ kind: 'contact' });
  });

  it('decodes percent-encoded segments without throwing on malformed input', () => {
    expect(parsePath('/en/projects/weird%20slug/').route).toEqual({
      kind: 'project',
      slug: 'weird slug',
    });
    expect(() => parsePath('/en/projects/%E0%A4%A/')).not.toThrow();
  });
});

describe('routePath', () => {
  it('builds canonical trailing-slash paths', () => {
    expect(routePath('en', { kind: 'home' })).toBe('/en/');
    expect(routePath('ar', { kind: 'projects' })).toBe('/ar/projects/');
    expect(routePath('ar', { kind: 'project', slug: 'card-scanner' })).toBe(
      '/ar/projects/card-scanner/',
    );
  });

  it('round-trips through parsePath', () => {
    const routes = [
      { kind: 'home' as const },
      { kind: 'projects' as const },
      { kind: 'services' as const },
      { kind: 'about' as const },
      { kind: 'contact' as const },
      { kind: 'privacy' as const },
      { kind: 'project' as const, slug: 'windows-sentinel' },
    ];
    for (const locale of ['en', 'ar'] as const) {
      for (const route of routes) {
        const path = routePath(locale, route);
        const matched = parsePath(path);
        expect(matched.locale).toBe(locale);
        expect(matched.route).toEqual(route);
        expect(matched.redirectTo).toBeUndefined();
      }
    }
  });

  it('encodes slugs', () => {
    expect(routePath('en', { kind: 'project', slug: 'a b' })).toBe('/en/projects/a%20b/');
  });
});

describe('switchLocalePath', () => {
  it('preserves the current page when switching language', () => {
    expect(switchLocalePath('/en/projects/card-scanner/', 'ar')).toBe('/ar/projects/card-scanner/');
    expect(switchLocalePath('/ar/services/', 'en')).toBe('/en/services/');
    expect(switchLocalePath('/en/', 'ar')).toBe('/ar/');
  });

  it('keeps a safe query string', () => {
    expect(switchLocalePath('/en/projects/', 'ar', '?category=fleet')).toBe(
      '/ar/projects/?category=fleet',
    );
  });

  it('drops an unsafe query string', () => {
    expect(switchLocalePath('/en/projects/', 'ar', '?x=<script>')).toBe('/ar/projects/');
    expect(switchLocalePath('/en/projects/', 'ar', 'not-a-query')).toBe('/ar/projects/');
  });

  it('sends an unknown path to the target locale home instead of a broken route', () => {
    expect(switchLocalePath('/en/does-not-exist/', 'ar')).toBe('/ar/');
  });
});

describe('isSafeSearch', () => {
  it('accepts simple query strings', () => {
    expect(isSafeSearch('?a=1&b=two')).toBe(true);
    expect((isSafeSearch(''), false)).toBe(false);
    expect(isSafeSearch('?')).toBe(true);
  });

  it('rejects everything else', () => {
    expect(isSafeSearch('?a=<x>')).toBe(false);
    expect(isSafeSearch('?a="x"')).toBe(false);
    expect(isSafeSearch(`?a=${'b'.repeat(300)}`)).toBe(false);
    expect(isSafeSearch('abc')).toBe(false);
  });
});
