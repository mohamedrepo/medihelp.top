import { getProject, type Project } from '../data/projects';
import { getDictionary, type Dictionary } from '../i18n';
import { LOCALES, LOCALE_HREFLANG, type Locale } from '../i18n/types';
import { routePath, type Route } from '../router';

/**
 * Canonical production origin.
 *
 * `www` is treated as canonical because the target domain given in the brief is
 * `https://www.medihelp.top`. The audit found that the apex and `www` hosts
 * currently serve identical content with no redirect between them, so both
 * hosts are listed as `hreflang` alternates at build time; collapsing the
 * duplication needs a DNS/redirect change that requires owner authorisation and
 * is therefore documented rather than applied.
 */
export const SITE_ORIGIN = 'https://www.medihelp.top';

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}

export interface HreflangAlternate {
  hreflang: string;
  href: string;
}

export interface PageSeo {
  title: string;
  description: string;
  /** Path only, e.g. `/en/projects/`. Resolved against SITE_ORIGIN. */
  canonicalPath: string;
  canonical: string;
  alternates: HreflangAlternate[];
  robots: string;
  ogType: 'website' | 'article';
  locale: Locale;
  /** True for pages that should not be indexed (404). */
  noindex: boolean;
}

function titleFor(locale: Locale, route: Route, dict: Dictionary, project?: Project): string {
  switch (route.kind) {
    case 'home':
      return dict.home.metaTitle;
    case 'projects':
      return dict.projects.metaTitle;
    case 'project':
      return project
        ? `${project.text[locale].name} — ${dict.brand.name}`
        : dict.notFound.metaTitle;
    case 'services':
      return dict.services.metaTitle;
    case 'about':
      return dict.about.metaTitle;
    case 'contact':
      return dict.contact.metaTitle;
    case 'privacy':
      return dict.privacy.metaTitle;
    case 'notFound':
      return dict.notFound.metaTitle;
  }
}

function descriptionFor(
  locale: Locale,
  route: Route,
  dict: Dictionary,
  project?: Project,
): string {
  switch (route.kind) {
    case 'home':
      return dict.home.metaDescription;
    case 'projects':
      return dict.projects.metaDescription;
    case 'project':
      return project ? project.text[locale].summary : dict.notFound.metaDescription;
    case 'services':
      return dict.services.metaDescription;
    case 'about':
      return dict.about.metaDescription;
    case 'contact':
      return dict.contact.metaDescription;
    case 'privacy':
      return dict.privacy.metaDescription;
    case 'notFound':
      return dict.notFound.metaDescription;
  }
}

/**
 * Build the complete metadata for one page in one locale.
 *
 * Every indexable page gets reciprocal `en`, `ar` and `x-default` alternates so
 * search engines can pair the two language editions. The 404 page is the only
 * non-indexable route.
 */
export function seoFor(locale: Locale, route: Route): PageSeo {
  const dict = getDictionary(locale);
  const project = route.kind === 'project' ? getProject(route.slug) : undefined;
  const resolvedRoute: Route =
    route.kind === 'project' && !project ? { kind: 'notFound', path: '/404/' } : route;

  const canonicalPath = routePath(locale, resolvedRoute);
  const noindex = resolvedRoute.kind === 'notFound';

  const alternates: HreflangAlternate[] = noindex
    ? []
    : [
        ...LOCALES.map((altLocale) => ({
          hreflang: LOCALE_HREFLANG[altLocale],
          href: absoluteUrl(routePath(altLocale, resolvedRoute)),
        })),
        // x-default points search engines at the English edition for unmatched
        // languages.
        { hreflang: 'x-default', href: absoluteUrl(routePath('en', resolvedRoute)) },
      ];

  return {
    title: titleFor(locale, resolvedRoute, dict, project),
    description: descriptionFor(locale, resolvedRoute, dict, project),
    canonicalPath,
    canonical: absoluteUrl(canonicalPath),
    alternates,
    robots: noindex ? 'noindex, follow' : 'index, follow',
    ogType: resolvedRoute.kind === 'project' ? 'article' : 'website',
    locale,
    noindex,
  };
}

/**
 * JSON-LD structured data.
 *
 * Deliberately limited to facts that are verifiable from the source material:
 * an organisation name and URL, the website, and — on project pages — an
 * application entry with a repository link and the technologies actually used.
 *
 * There is no `aggregateRating`, no `review`, no `offers` and no `price`: none
 * of those can be substantiated, and inventing them would be both a search-policy
 * violation and a lie.
 */
export function structuredDataFor(locale: Locale, route: Route): Record<string, unknown>[] {
  const dict = getDictionary(locale);
  const graph: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: dict.brand.name,
      url: SITE_ORIGIN,
      description: dict.brand.description,
      sameAs: ['https://github.com/mohamedrepo'],
    },
  ];

  if (route.kind === 'project') {
    const project = getProject(route.slug);
    if (project) {
      graph.push({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: project.text[locale].name,
        description: project.text[locale].summary,
        applicationCategory: 'BusinessApplication',
        codeRepository: project.repositoryUrl,
        url: absoluteUrl(routePath(locale, route)),
        inLanguage: locale,
        isAccessibleForFree: true,
      });
    }
  }

  return graph;
}
