/**
 * Pure, dependency-free URL parsing for the locale-prefixed router.
 *
 * Kept separate from the React integration so the path logic — the part that is
 * easy to get subtly wrong, and the part that decides `lang`/`dir` — can be
 * unit-tested in plain Node with no DOM.
 *
 * URL shape:
 *   /                       -> redirects to /en/
 *   /{locale}/              -> home
 *   /{locale}/projects/     -> catalogue
 *   /{locale}/projects/{slug}/ -> project detail
 *   /{locale}/services|about|contact|privacy/
 *
 * Every canonical URL uses a trailing slash so it maps 1:1 onto a static
 * `index.html` and stays consistent for `hreflang`.
 */

import { DEFAULT_LOCALE, isLocale, type Locale } from './i18n/types';

export type Route =
  | { kind: 'home' }
  | { kind: 'projects' }
  | { kind: 'project'; slug: string }
  | { kind: 'services' }
  | { kind: 'about' }
  | { kind: 'contact' }
  | { kind: 'privacy' }
  | { kind: 'notFound'; path: string };

export interface MatchedRoute {
  locale: Locale;
  route: Route;
  /**
   * Set when the requested path is not canonical and the client should replace
   * the history entry. Either the root (`/`) or a path missing its locale
   * segment. The rendered content is already correct for `locale`/`route`.
   */
  redirectTo?: string;
}

/** Collapse a pathname into decoded, non-empty segments. */
function segmentsOf(pathname: string): string[] {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? '';
  return withoutQuery
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      try {
        return decodeURIComponent(segment);
      } catch {
        return segment;
      }
    });
}

function parseRouteSegments(segments: string[], rawPath: string): Route {
  const [head, second, ...rest] = segments;

  switch (head) {
    case undefined:
      return { kind: 'home' };
    case 'projects':
      if (second === undefined) return { kind: 'projects' };
      if (rest.length === 0 && second.length > 0) return { kind: 'project', slug: second };
      return { kind: 'notFound', path: rawPath };
    case 'services':
      return segments.length === 1 ? { kind: 'services' } : { kind: 'notFound', path: rawPath };
    case 'about':
      return segments.length === 1 ? { kind: 'about' } : { kind: 'notFound', path: rawPath };
    case 'contact':
      return segments.length === 1 ? { kind: 'contact' } : { kind: 'notFound', path: rawPath };
    case 'privacy':
      return segments.length === 1 ? { kind: 'privacy' } : { kind: 'notFound', path: rawPath };
    default:
      return { kind: 'notFound', path: rawPath };
  }
}

/** Resolve a pathname into the locale + route it represents. */
export function parsePath(pathname: string): MatchedRoute {
  const segments = segmentsOf(pathname);

  if (segments.length === 0) {
    return { locale: DEFAULT_LOCALE, route: { kind: 'home' }, redirectTo: `/${DEFAULT_LOCALE}/` };
  }

  const [first, ...rest] = segments;

  if (!isLocale(first)) {
    // No locale prefix: resolve as the default locale and tell the caller to
    // rewrite the URL, so `/projects/` becomes `/en/projects/`.
    const restSegments = segments;
    const route = parseRouteSegments(restSegments, pathname);
    const target = `/${DEFAULT_LOCALE}/${restSegments.join('/')}${restSegments.length ? '/' : ''}`;
    return { locale: DEFAULT_LOCALE, route, redirectTo: target };
  }

  return { locale: first, route: parseRouteSegments(rest, pathname) };
}

/** Build the canonical, locale-prefixed path for a route. */
export function routePath(locale: Locale, route: Route): string {
  const base = `/${locale}/`;
  switch (route.kind) {
    case 'home':
      return base;
    case 'projects':
      return `${base}projects/`;
    case 'project':
      return `${base}projects/${encodeURIComponent(route.slug)}/`;
    case 'services':
      return `${base}services/`;
    case 'about':
      return `${base}about/`;
    case 'contact':
      return `${base}contact/`;
    case 'privacy':
      return `${base}privacy/`;
    case 'notFound':
      return route.path;
  }
}

/**
 * Switch locale while preserving the current page.
 *
 * Slugs are language-neutral, so a project page has a translated equivalent at
 * the same slug in the other locale — meaning the language switcher never ejects
 * a visitor from the page they were reading. Unknown paths keep the default
 * locale home rather than pointing at a route that does not exist.
 */
export function switchLocalePath(currentPath: string, next: Locale, search = ''): string {
  const matched = parsePath(currentPath);
  if (matched.route.kind === 'notFound') {
    return `/${next}/${search}`;
  }
  const path = routePath(next, matched.route);
  return isSafeSearch(search) ? `${path}${search}` : path;
}

/** Only allow a simple `?a=b&c=d` query string through; otherwise drop it. */
export function isSafeSearch(search: string): boolean {
  if (!search || !search.startsWith('?')) return false;
  if (search.length > 256) return false;
  return /^\?[A-Za-z0-9_%&=.+-]*$/.test(search);
}
