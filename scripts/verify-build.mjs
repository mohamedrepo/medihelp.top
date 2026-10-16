/**
 * Build verification.
 *
 * Asserts the acceptance criteria against the *generated artefact* rather than
 * against source code — a passing build does not by itself prove the pages are
 * correct. Run after `npm run build`.
 *
 *   node scripts/verify-build.mjs
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(root, 'dist');
const SITE_ORIGIN = 'https://www.medihelp.top';

const failures = [];
const checks = [];

function check(name, condition, detail = '') {
  if (condition) {
    checks.push(name);
  } else {
    failures.push(detail ? `${name} — ${detail}` : name);
  }
}

const read = (relative) => readFile(join(DIST, relative), 'utf8');
const readBinary = (relative) => readFile(join(DIST, relative));

/* ------------------------------ routes ------------------------------ */

const EN_ROUTES = [
  '',
  'projects/',
  'services/',
  'about/',
  'contact/',
  'privacy/',
  'projects/smartfleet-manager/',
  'projects/eta-invoicing-exporter/',
  'projects/windows-sentinel/',
  'projects/card-scanner/',
  'projects/fuel-card-extractor/',
  'projects/windows-iso-build/',
  'projects/windows-deployment/',
  'projects/smart-media-downloader/',
  'projects/ai-insights-automation/',
  'projects/desktop-media-download-manager/',
];

const expected = ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'favicon.svg', 'og-image.png'];
for (const locale of ['en', 'ar']) {
  for (const route of EN_ROUTES) expected.push(`${locale}/${route}index.html`);
}

for (const file of expected) {
  check(`exists: ${file}`, existsSync(join(DIST, file)));
}

/* ------------------------------ documents ------------------------------ */

function inspectDocument(html) {
  const count = (re) => (html.match(re) ?? []).length;
  return {
    htmlTag: html.match(/<html[^>]*>/)?.[0] ?? '',
    title: html.match(/<title>([\s\S]*?)<\/title>/)?.[1],
    titleCount: count(/<title>/g),
    descriptionCount: count(/<meta name="description"/g),
    description: html.match(/<meta name="description" content="([^"]*)"/)?.[1],
    canonical: html.match(/<link rel="canonical" href="([^"]*)"/)?.[1],
    robots: html.match(/<meta name="robots" content="([^"]*)"/)?.[1],
    hreflangs: [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => m[1]),
    hasStructuredData: /application\/ld\+json/.test(html),
    hasMotionGate: /classList\.add\('motion-ok'\)|classList\.add\("motion-ok"\)/.test(html),
    // Vite injects the module script into <head>, so the root element runs to the
    // end of <body>. Matching to </body> also avoids being fooled by the nested
    // </div> elements inside the prerendered tree.
    rootMarkup:
      html.match(/<div id="root">([\s\S]*?)<\/body>/)?.[1]?.replace(/<\/div>\s*$/, '') ?? '',
    hasH1: /<h1[\s>]/.test(html),
  };
}

/**
 * Visible text of the main content region, with tags, attributes and comments
 * removed.
 *
 * Content scanning has to run against rendered text rather than raw HTML:
 * otherwise attribute values like an input's `placeholder` or an SVG `viewBox`
 * are read as if they were prose, producing entirely false findings.
 */
function mainText(html) {
  const main = html.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '';
  return main
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

let documentCount = 0;

for (const locale of ['en', 'ar']) {
  for (const route of EN_ROUTES) {
    const file = `${locale}/${route}index.html`;
    if (!existsSync(join(DIST, file))) continue;
    documentCount += 1;

    const html = await read(file);
    const doc = inspectDocument(html);
    const label = `${file}`;

    check(`${label}: lang=${locale}`, doc.htmlTag.includes(`lang="${locale}"`), doc.htmlTag);
    check(
      `${label}: dir=${locale === 'ar' ? 'rtl' : 'ltr'}`,
      doc.htmlTag.includes(`dir="${locale === 'ar' ? 'rtl' : 'ltr'}"`),
      doc.htmlTag,
    );
    check(`${label}: exactly one title`, doc.titleCount === 1, `${doc.titleCount} titles`);
    check(`${label}: exactly one description`, doc.descriptionCount === 1);
    check(`${label}: has a title`, Boolean(doc.title && doc.title.trim().length > 0));
    check(`${label}: has a description`, Boolean(doc.description && doc.description.length > 40));
    check(
      `${label}: canonical on the canonical origin`,
      doc.canonical === `${SITE_ORIGIN}/${locale}/${route}`,
      doc.canonical,
    );
    check(
      `${label}: canonical is locale-specific`,
      Boolean(doc.canonical?.includes(`/${locale}/`)),
      doc.canonical,
    );

    // hreflang must be reciprocal and complete on every indexable page.
    for (const needed of ['en', 'ar', 'x-default']) {
      check(`${label}: hreflang ${needed}`, doc.hreflangs.includes(needed), doc.hreflangs.join(','));
    }
    check(`${label}: hreflang has no duplicates`, new Set(doc.hreflangs).size === doc.hreflangs.length);

    check(`${label}: indexable`, doc.robots === 'index, follow', doc.robots);
    check(`${label}: has structured data`, doc.hasStructuredData);
    check(`${label}: has the reduced-motion gate`, doc.hasMotionGate);
    check(`${label}: prerendered markup is present`, doc.rootMarkup.length > 2000, `${doc.rootMarkup.length} chars`);
    check(`${label}: prerendered markup has a heading`, doc.hasH1);
  }
}

/*
 * Arabic pages must actually be Arabic, and English pages must not be — but the
 * check is scoped to <main>, because the language switcher in the header names"
 * each language in its own script on every page. That is correct behaviour (an
 * Arabic speaker looking for Arabic should see "العربية"), not a translation leak.
 */
for (const route of ['', 'projects/', 'contact/']) {
  const arHtml = await read(`ar/${route}index.html`);
  const enHtml = await read(`en/${route}index.html`);

  const countArabic = (text) => (text.match(/[\u0600-\u06FF]/g) ?? []).length;

  check(`ar/${route}: main content is in Arabic`, countArabic(mainText(arHtml)) > 400, `${countArabic(mainText(arHtml))} chars`);
  check(`en/${route}: main content is in English`, countArabic(mainText(enHtml)) === 0, `${countArabic(mainText(enHtml))} chars`);
  check(
    `ar/${route}: title differs from the English edition`,
    inspectDocument(arHtml).title !== inspectDocument(enHtml).title,
  );

  // The header must still offer Arabic in Arabic, in both editions.
  check(`ar/${route}: language switcher names Arabic`, arHtml.includes('العربية'));

  // Hostnames and other machine-readable tokens must be wrapped as LTR islands
  // inside RTL prose, so they render left-to-right instead of being reordered by
  // the bidirectional algorithm.
  const arMain = arHtml.match(/<main[^>]*>([\s\S]*)<\/main>/)?.[1] ?? '';
  const hostSpans = [...arMain.matchAll(/<span([^>]*)>([^<]*)<\/span>/g)];
  const bareHostnames = hostSpans
    .filter(([, attrs, text]) => /\.(com|top|org)\b/.test(text) && !attrs.includes('ltr-island'))
    .map(([, , text]) => text);
  const islandHostnames = hostSpans.filter(([, attrs, text]) => /\.(com|top|org)\b/.test(text) && attrs.includes('ltr-island'));

  check(`ar/${route}: no bare LTR hostnames`, bareHostnames.length === 0, bareHostnames.join(', '));
  // Only assert this where the page actually contains a hostname.
  if (hostSpans.some(([, , text]) => /\.(com|top|org)\b/.test(text))) {
    check(`ar/${route}: hostnames are LTR islands`, islandHostnames.length > 0);
  }
}

/* ------------------------------ 404 ------------------------------ */

{
  const html = await read('404.html');
  const doc = inspectDocument(html);
  check('404: is noindex', doc.robots?.includes('noindex'), doc.robots);
  check('404: has a title', Boolean(doc.title));
}

/* ------------------------------ root redirect ------------------------------ */

{
  const html = await read('index.html');
  check('root: redirects to /en/', /location\.replace\(/.test(html) && /'\/en\/'/.test(html));
  check('root: is noindex', /noindex/.test(html));
  check('root: declares canonical for the English home', html.includes(`${SITE_ORIGIN}/en/`));
  check('root: honours a stored language preference', /medihelp\.locale/.test(html));
}

/* ------------------------------ sitemap + robots ------------------------------ */

{
  const sitemap = await read('sitemap.xml');
  const urlCount = (sitemap.match(/<url>/g) ?? []).length;
  check('sitemap: has 32 entries', urlCount === 32, `${urlCount} entries`);
  check('sitemap: declares the xhtml namespace', sitemap.includes('xmlns:xhtml='));
  check('sitemap: uses the canonical origin', sitemap.includes(`${SITE_ORIGIN}/`));
  check('sitemap: no non-www apex URLs', !/https:\/\/medihelp\.top/.test(sitemap));
  check('sitemap: alternates present', (sitemap.match(/hreflang="x-default"/g) ?? []).length === 32);
  check('sitemap: lastmod present', (sitemap.match(/<lastmod>/g) ?? []).length === 32);

  const robots = await read('robots.txt');
  check('robots: allows crawling', /User-agent: \*/.test(robots) && /Allow: \//.test(robots));
  check('robots: disallows the 404 document', /Disallow: \/404\.html/.test(robots));
  check('robots: references the sitemap', robots.includes(`${SITE_ORIGIN}/sitemap.xml`));
}

/* ------------------------------ og image ------------------------------ */

{
  const png = await readBinary('og-image.png');
  const signature = png.subarray(0, 8).toString('hex');
  check('og-image: is a PNG', signature === '89504e470d0a1a0a', signature);
  check('og-image: is 1200x630', png.readUInt32BE(16) === 1200 && png.readUInt32BE(20) === 630);
  check('og-image: is under 300 kB', png.length < 300_000, `${png.length} bytes`);
  check('og-image: referenced by the head', (await read('en/index.html')).includes('/og-image.png'));
}

/* ------------------------------ content safety ------------------------------ */

{
  // Patterns that must not appear anywhere in a generated document.
  const forbiddenAnywhere = [
    ['a bank name', /\bQNB\b|Qatar National Bank/],
    ['a card network name', /\bVisa\b|Mastercard/],
    ['an open-source claim', /\bis open[- ]source\b/i],
    ['a hard-coded price', /\$\s?\d/],
    ['a placeholder', /YOUR_|TODO|FIXME|Lorem ipsum|your-domain\.com/i],
    ['an analytics tag', /googletagmanager|google-analytics|gtag\(|plausible|posthog|hotjar|segment\.io/i],
    ['a third-party script or font host', /cdn\.tailwindcss\.com|cdn\.jsdelivr\.net|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/i],
    ['a mailto link', /mailto:/i],
  ];

  // Patterns that are only prohibited in visible text. Attribute values are
  // excluded deliberately: an input placeholder legitimately reads
  // `you@company.com`, and an SVG viewBox is not prose.
  const forbiddenInProse = [
    ['a published email address', /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i],
    ['a phone number', /\+?\d[\d\s()-]{8,}\d/],
    ['a card-number-like sequence', /\b\d{13,19}\b/],
    ['a confidential dataset reference', /01072020|30062026|QNB_Fuel/],
  ];

  for (const locale of ['en', 'ar']) {
    for (const route of ['', 'projects/', 'contact/', 'privacy/', 'about/', 'services/']) {
      const html = await read(`${locale}/${route}index.html`);
      for (const [label, pattern] of forbiddenAnywhere) {
        check(
          `${locale}/${route}: no ${label}`,
          !pattern.test(html),
          (html.match(pattern) ?? [])[0],
        );
      }
      const prose = mainText(html);
      for (const [label, pattern] of forbiddenInProse) {
        check(
          `${locale}/${route}: no ${label} in prose`,
          !pattern.test(prose),
          (prose.match(pattern) ?? [])[0],
        );
      }
    }
  }

  // Forms may only offer contact routes that are actually known.
  const contact = await read('en/contact/index.html');
  const hrefs = [...contact.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const externalTargets = hrefs.filter((href) => /^https?:\/\//.test(href));
  check(
    'contact: external links are limited to the curated set',
    externalTargets.every(
      (href) => href.startsWith('https://github.com/mohamedrepo') || href.startsWith(SITE_ORIGIN),
    ),
    externalTargets.join(', '),
  );

  // The site must not depend on any external network resource.
  const home = await read('en/index.html');
  const externalResources = [...home.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((url) => !url.startsWith(SITE_ORIGIN) && !url.startsWith('https://github.com/'));
  check('home: loads no external resources', externalResources.length === 0, externalResources.join(', '));
}

/* ------------------------------ report ------------------------------ */

console.log(`verify-build: ${checks.length} checks passed over ${documentCount} prerendered documents`);

if (failures.length > 0) {
  console.error(`\nverify-build: ${failures.length} FAILED\n`);
  for (const failure of failures) console.error(`  ✗ ${failure}`);
  process.exit(1);
}

console.log('verify-build: all checks passed');
