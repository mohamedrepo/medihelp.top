/**
 * Static site generation.
 *
 * Runs after both Vite builds:
 *   1. `vite build`            -> dist/        (client bundle + index.html template)
 *   2. `vite build --ssr ...`  -> dist-server/ (renderable React tree)
 *   3. this script             -> one real HTML file per route, plus sitemap.xml
 *                                 and robots.txt
 *
 * Producing genuine static HTML per route (rather than an empty SPA shell) is
 * what makes the bilingual pages independently crawlable and gives each locale
 * its own title, description, canonical and hreflang set.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const SITE_ORIGIN = 'https://www.medihelp.top';

// `pathToFileURL` is required on Windows: a bare absolute path like `D:\...` is
// rejected by the ESM loader, which only accepts file:, data: and node: URLs.
const { render, prerenderManifest, indexablePaths } = await import(
  pathToFileURL(join(root, 'dist-server', 'entry-server.js')).href
);

const template = await readFile(join(DIST, 'index.html'), 'utf8');

/** Escape a value for use in XML text or an attribute. */
function escapeXml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Rewrite the shared client template for one route.
 *
 * The template's default `<title>` and description are removed and replaced with
 * the route's own, so no page ever ships two titles or two descriptions.
 */
function buildDocument({ html, head, seo }) {
  let document = template
    .replace(/<title>[\s\S]*?<\/title>\s*/, '')
    .replace(/<meta\s+name="description"[^>]*>\s*/, '');

  document = document.replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  document = document.replace('</head>', `${head}\n  </head>`);
  document = document.replace(
    '<html lang="en" dir="ltr">',
    `<html lang="${seo.locale}" dir="${seo.locale === 'ar' ? 'rtl' : 'ltr'}">`,
  );

  return document;
}

/**
 * The root document.
 *
 * `/` is not a page: the locale-prefixed URLs are canonical. This static
 * redirect honours a previously chosen language so a returning Arabic visitor is
 * not silently reset to English, and falls back to English — the documented
 * default — for everyone else.
 */
function buildRedirectDocument() {
  return `<!doctype html>
<html lang="en" dir="ltr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>MediHelp Technologies</title>
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${SITE_ORIGIN}/en/" />
    <link rel="alternate" hreflang="en" href="${SITE_ORIGIN}/en/" />
    <link rel="alternate" hreflang="ar" href="${SITE_ORIGIN}/ar/" />
    <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/en/" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta http-equiv="refresh" content="0; url=/en/" />
    <script>
      (function () {
        var target = '/en/';
        try {
          var stored = window.localStorage.getItem('medihelp.locale');
          if (stored === 'ar' || stored === 'en') target = '/' + stored + '/';
        } catch (error) {
          /* Storage unavailable (private mode, blocked): fall back to English. */
        }
        location.replace(target + location.search + location.hash);
      })();
    </script>
  </head>
  <body>
    <p>Redirecting to <a href="/en/">/en/</a>…</p>
  </body>
</html>
`;
}

function buildSitemap(paths) {
  const urls = paths
    .map(({ pathname, lastModified }) => {
      const alternates = ['en', 'ar']
        .map((locale) => {
          const localized = pathname.replace(/^\/(en|ar)\//, `/${locale}/`);
          return `    <xhtml:link rel="alternate" hreflang="${locale}" href="${SITE_ORIGIN}${localized}" />`;
        })
        .join('\n');
      const defaultAlternate = `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}${pathname.replace(/^\/(en|ar)\//, '/en/')}" />`;

      return `  <url>
    <loc>${escapeXml(SITE_ORIGIN + pathname)}</loc>
    <lastmod>${lastModified}</lastmod>
${alternates}
${defaultAlternate}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

function buildRobots() {
  return `# MediHelp Technologies — https://www.medihelp.top
#
# Everything is public and crawlable except the 404 document. There is no
# analytics, no tracking and no private area on this site.

User-agent: *
Allow: /
Disallow: /404.html

Sitemap: ${SITE_ORIGIN}/sitemap.xml
`;
}

/* ------------------------------- run ------------------------------- */

const manifest = prerenderManifest();
let written = 0;

for (const entry of manifest) {
  const outPath = join(DIST, entry.outFile);
  await mkdir(dirname(outPath), { recursive: true });

  if (entry.redirectTo) {
    await writeFile(outPath, buildRedirectDocument(), 'utf8');
    written += 1;
    continue;
  }

  await writeFile(outPath, buildDocument(render(entry.pathname)), 'utf8');
  written += 1;
}

const sitemapPaths = indexablePaths();
await writeFile(join(DIST, 'sitemap.xml'), buildSitemap(sitemapPaths), 'utf8');
await writeFile(join(DIST, 'robots.txt'), buildRobots(), 'utf8');

console.log(
  `prerender: wrote ${written} HTML documents, ${sitemapPaths.length} sitemap entries, robots.txt`,
);
