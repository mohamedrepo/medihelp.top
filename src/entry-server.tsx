import { renderToString } from 'react-dom/server';
import { App } from './App';
import { projects } from './data/projects';
import { headTags } from './lib/head';
import { seoFor, structuredDataFor, type PageSeo } from './lib/seo';
import { RouterProvider, setInitialHref } from './router-context';
import { parsePath } from './router';
import { LOCALES } from './i18n/types';

/**
 * Prerender entry.
 *
 * Builds the static HTML for every route. This module is bundled separately
 * (`vite build --ssr`) and consumed by `scripts/prerender.mjs`, so the route list
 * is derived from the same data module that renders the pages — the sitemap and
 * the pages can never drift apart.
 */

export interface RenderResult {
  html: string;
  head: string;
  seo: PageSeo;
}

/** Render one pathname to HTML plus its head tags. */
export function render(pathname: string): RenderResult {
  setInitialHref(pathname);
  const matched = parsePath(pathname);
  const seo = seoFor(matched.locale, matched.route);
  const structuredData = structuredDataFor(matched.locale, matched.route);

  const html = renderToString(
    <RouterProvider>
      <App />
    </RouterProvider>,
  );

  return { html, head: headTags(seo, structuredData), seo };
}

export interface PrerenderEntry {
  /** The URL path this page answers on. */
  pathname: string;
  /** Where to write it, relative to the build output directory. */
  outFile: string;
  /** When set, emit a static redirect document instead of rendering a page. */
  redirectTo?: string;
}

/**
 * The complete route list.
 *
 * `/` is a static redirect document rather than a page: the locale-prefixed URLs
 * are canonical, and a static host needs an actual file at the root.
 * The 404 page is emitted at the path Cloudflare's `404-page` handling expects.
 */
export function prerenderManifest(): PrerenderEntry[] {
  const entries: PrerenderEntry[] = [
    { pathname: '/', outFile: 'index.html', redirectTo: '/en/' },
  ];

  for (const locale of LOCALES) {
    const staticRoutes = ['', 'projects', 'services', 'about', 'contact', 'privacy'];
    for (const segment of staticRoutes) {
      entries.push({
        pathname: `/${locale}/${segment}`.replace(/\/$/, '') + '/',
        outFile: `${locale}${segment ? `/${segment}` : ''}/index.html`,
      });
    }
    for (const project of projects) {
      entries.push({
        pathname: `/${locale}/projects/${project.slug}/`,
        outFile: `${locale}/projects/${project.slug}/index.html`,
      });
    }
  }

  // Served by the host's 404 handling for any unmatched path.
  entries.push({ pathname: '/en/404/', outFile: '404.html' });

  return entries;
}

/** All indexable page paths, for the sitemap and for tests. */
export function indexablePaths(): { pathname: string; lastModified: string }[] {
  const paths: { pathname: string; lastModified: string }[] = [];
  const today = new Date().toISOString().slice(0, 10);

  for (const locale of LOCALES) {
    for (const segment of ['', 'projects', 'services', 'about', 'contact', 'privacy']) {
      paths.push({
        pathname: `/${locale}/${segment}`.replace(/\/$/, '') + '/',
        lastModified: today,
      });
    }
    for (const project of projects) {
      paths.push({
        pathname: `/${locale}/projects/${project.slug}/`,
        lastModified: project.reviewedOn,
      });
    }
  }

  return paths;
}
