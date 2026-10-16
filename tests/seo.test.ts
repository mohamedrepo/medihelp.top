import { describe, expect, it } from 'vitest';
import { headTags } from '../src/lib/head';
import { absoluteUrl, seoFor, SITE_ORIGIN, structuredDataFor } from '../src/lib/seo';
import { projects } from '../src/data/projects';
import { LOCALES } from '../src/i18n/types';

describe('canonical origin', () => {
  it('uses the www host from the brief, over HTTPS', () => {
    expect(SITE_ORIGIN).toBe('https://www.medihelp.top');
    expect(absoluteUrl('/en/')).toBe('https://www.medihelp.top/en/');
  });
});

describe('seoFor', () => {
  it('builds a locale-specific canonical', () => {
    expect(seoFor('en', { kind: 'projects' }).canonical).toBe(
      'https://www.medihelp.top/en/projects/',
    );
    expect(seoFor('ar', { kind: 'projects' }).canonical).toBe(
      'https://www.medihelp.top/ar/projects/',
    );
  });

  it('emits reciprocal en, ar and x-default alternates on indexable pages', () => {
    const seo = seoFor('en', { kind: 'services' });
    const hreflangs = seo.alternates.map((alternate) => alternate.hreflang).sort();
    expect(hreflangs).toEqual(['ar', 'en', 'x-default']);

    const byHreflang = Object.fromEntries(
      seo.alternates.map((alternate) => [alternate.hreflang, alternate.href]),
    );
    expect(byHreflang.en).toBe('https://www.medihelp.top/en/services/');
    expect(byHreflang.ar).toBe('https://www.medihelp.top/ar/services/');
    expect(byHreflang['x-default']).toBe('https://www.medihelp.top/en/services/');
  });

  it('points x-default at the English edition', () => {
    const seo = seoFor('ar', { kind: 'about' });
    expect(seo.alternates.find((a) => a.hreflang === 'x-default')?.href).toContain('/en/about/');
  });

  it('produces different titles and descriptions per locale', () => {
    for (const route of [
      { kind: 'home' as const },
      { kind: 'projects' as const },
      { kind: 'services' as const },
      { kind: 'about' as const },
      { kind: 'contact' as const },
      { kind: 'privacy' as const },
    ]) {
      const en = seoFor('en', route);
      const ar = seoFor('ar', route);
      expect(en.title).not.toBe(ar.title);
      expect(en.description).not.toBe(ar.description);
      expect(en.description.length).toBeGreaterThan(50);
    }
  });

  it('gives every page in a locale a unique title and description', () => {
    // Uniqueness is asserted per locale, which is the property that matters: two
    // *different* pages in the same language must not share a title. The English
    // and Arabic editions of the same project legitimately share a title when the
    // product name stays in Latin script (the brand is deliberately not
    // transliterated) — they are translations of one page, paired by hreflang,
    // not competing pages.
    for (const locale of LOCALES) {
      const titles: string[] = [];
      const descriptions: string[] = [];

      for (const route of [
        { kind: 'home' as const },
        { kind: 'projects' as const },
        { kind: 'services' as const },
        { kind: 'about' as const },
        { kind: 'contact' as const },
        { kind: 'privacy' as const },
      ]) {
        titles.push(seoFor(locale, route).title);
        descriptions.push(seoFor(locale, route).description);
      }
      for (const project of projects) {
        titles.push(seoFor(locale, { kind: 'project', slug: project.slug }).title);
        descriptions.push(seoFor(locale, { kind: 'project', slug: project.slug }).description);
      }

      const expected = 6 + projects.length;
      expect(titles, `${locale} titles`).toHaveLength(expected);
      expect(new Set(titles).size, `${locale}: duplicate title`).toBe(expected);
      expect(new Set(descriptions).size, `${locale}: duplicate description`).toBe(expected);
    }
  });

  it('names the project in its own page title', () => {
    const seo = seoFor('en', { kind: 'project', slug: 'windows-sentinel' });
    expect(seo.title).toContain('Windows Sentinel');
    expect(seo.canonical).toBe('https://www.medihelp.top/en/projects/windows-sentinel/');
  });

  it('marks the 404 page noindex with no alternates', () => {
    const seo = seoFor('en', { kind: 'notFound', path: '/en/404/' });
    expect(seo.noindex).toBe(true);
    expect(seo.robots).toContain('noindex');
    expect(seo.alternates).toEqual([]);
  });

  it('marks a project route with an unknown slug as not found', () => {
    const seo = seoFor('en', { kind: 'project', slug: 'not-a-real-project' });
    expect(seo.noindex).toBe(true);
  });

  it('keeps titles a reasonable length', () => {
    for (const locale of LOCALES) {
      for (const project of projects) {
        const { title } = seoFor(locale, { kind: 'project', slug: project.slug });
        expect(title.length, `${locale}/${project.slug}`).toBeLessThan(90);
      }
    }
  });
});

describe('structured data', () => {
  it('declares the organisation without invented facts', () => {
    const [organisation] = structuredDataFor('en', { kind: 'home' }) as Record<string, unknown>[];
    expect(organisation?.['@type']).toBe('Organization');
    expect(organisation?.url).toBe(SITE_ORIGIN);
    expect(organisation).not.toHaveProperty('aggregateRating');
  });

  it('never fabricates ratings, reviews, prices or offers', () => {
    for (const locale of LOCALES) {
      for (const project of projects) {
        const payload = JSON.stringify(
          structuredDataFor(locale, { kind: 'project', slug: project.slug }),
        );
        expect(payload).not.toContain('aggregateRating');
        expect(payload).not.toContain('"review"');
        expect(payload).not.toContain('"offers"');
        expect(payload).not.toContain('"price"');
      }
    }
  });

  it('links a project to its repository', () => {
    const data = structuredDataFor('ar', {
      kind: 'project',
      slug: 'eta-invoicing-exporter',
    }) as Record<string, unknown>[];
    const application = data.find((entry) => entry['@type'] === 'SoftwareApplication');
    expect(application?.codeRepository).toBe(
      'https://github.com/mohamedrepo/eta-invoice-exporter',
    );
    expect(application?.inLanguage).toBe('ar');
  });
});

describe('headTags', () => {
  it('escapes page content so it cannot break out of the tag', () => {
    const html = headTags(
      {
        title: 'A "quoted" title & <script>',
        description: 'Desc with </script> inside',
        canonicalPath: '/en/',
        canonical: 'https://www.medihelp.top/en/',
        alternates: [],
        robots: 'index, follow',
        ogType: 'website',
        locale: 'en',
        noindex: false,
      },
      [{ '@type': 'Organization', name: '</script><script>alert(1)</script>' }],
    );

    expect(html).toContain('&quot;');
    expect(html).toContain('&amp;');
    expect(html).toContain('&lt;script&gt;');
    // The JSON-LD block must not be able to terminate its own script element.
    expect(html).not.toContain('</script><script>alert(1)');
  });

  it('emits canonical, hreflang, og and twitter tags', () => {
    const html = headTags(seoFor('ar', { kind: 'home' }), []);
    expect(html).toContain('<link rel="canonical" href="https://www.medihelp.top/ar/" />');
    expect(html).toContain('hreflang="en"');
    expect(html).toContain('hreflang="x-default"');
    expect(html).toContain('property="og:locale" content="ar_EG"');
    expect(html).toContain('property="og:locale:alternate" content="en_US"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('og-image.png');
  });
});
