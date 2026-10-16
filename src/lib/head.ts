import { getDictionary } from '../i18n';
import type { PageSeo } from './seo';
import { absoluteUrl } from './seo';

/**
 * Builds the full set of `<head>` tags for a prerendered page.
 *
 * Kept in one module so the static HTML and the client-side head hook can never
 * disagree about which tags exist. Everything is escaped: page titles and
 * descriptions include project names and Arabic text, and none of it should ever
 * be interpretable as markup.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const OG_LOCALE: Record<string, string> = { en: 'en_US', ar: 'ar_EG' };
const OG_ALT_LOCALE: Record<string, string> = { en: 'ar_EG', ar: 'en_US' };

export function headTags(seo: PageSeo, structuredData: Record<string, unknown>[]): string {
  const dictionary = getDictionary(seo.locale);
  const imageUrl = absoluteUrl('/og-image.png');
  const imageAlt = `${dictionary.brand.name} — ${dictionary.brand.positioning}`;

  const tags: string[] = [
    `<title>${escapeHtml(seo.title)}</title>`,
    `<meta name="description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="robots" content="${escapeHtml(seo.robots)}" />`,
    `<link rel="canonical" href="${escapeHtml(seo.canonical)}" />`,
  ];

  for (const alternate of seo.alternates) {
    tags.push(
      `<link rel="alternate" hreflang="${escapeHtml(alternate.hreflang)}" href="${escapeHtml(alternate.href)}" />`,
    );
  }

  tags.push(
    `<meta property="og:type" content="${seo.ogType}" />`,
    `<meta property="og:site_name" content="${escapeHtml(dictionary.brand.name)}" />`,
    `<meta property="og:title" content="${escapeHtml(seo.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(seo.description)}" />`,
    `<meta property="og:url" content="${escapeHtml(seo.canonical)}" />`,
    `<meta property="og:locale" content="${OG_LOCALE[seo.locale] ?? 'en_US'}" />`,
    `<meta property="og:locale:alternate" content="${OG_ALT_LOCALE[seo.locale] ?? 'ar_EG'}" />`,
    `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${escapeHtml(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(seo.title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(seo.description)}" />`,
    `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
  );

  if (structuredData.length > 0) {
    const payload = structuredData.length === 1 ? structuredData[0] : structuredData;
    // JSON is embedded in a script block; escaping `<` prevents a `</script>`
    // sequence inside a string value from breaking out of the element.
    // `id="structured-data"` is what lets the client-side head manager find and
    // update this block in place instead of appending a second one after a
    // client-side navigation. Both sides are covered by tests.
    tags.push(
      `<script type="application/ld+json" id="structured-data">${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`,
    );
  }

  return tags.map((tag) => `    ${tag}`).join('\n');
}
