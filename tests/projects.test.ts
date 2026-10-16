import { describe, expect, it } from 'vitest';
import {
  activeCategories,
  activeMaturities,
  CATEGORY_ORDER,
  featuredProjects,
  getProject,
  MATURITY_ORDER,
  projects,
  relatedProjects,
} from '../src/data/projects';
import { LOCALES } from '../src/i18n/types';

const textBlocks = (project: (typeof projects)[number]) =>
  LOCALES.map((locale) => ({ locale, text: project.text[locale] }));

describe('catalogue integrity', () => {
  it('has a unique, URL-safe slug for every project', () => {
    const slugs = projects.map((project) => project.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('points every repository URL at the expected GitHub account', () => {
    for (const project of projects) {
      expect(project.repositoryUrl).toBe(`https://github.com/mohamedrepo/${project.repo}`);
    }
  });

  it('omits optional URLs rather than setting them to empty strings', () => {
    for (const project of projects) {
      for (const key of ['releaseUrl', 'documentationUrl'] as const) {
        const value = project[key];
        if (value !== undefined) {
          expect(value.startsWith('https://github.com/mohamedrepo/')).toBe(true);
          expect(value.length).toBeGreaterThan(40);
        }
      }
    }
  });

  it('uses only declared categories and maturity levels', () => {
    for (const project of projects) {
      expect(CATEGORY_ORDER).toContain(project.category);
      expect(MATURITY_ORDER).toContain(project.maturity);
    }
  });

  it('records a valid review date', () => {
    for (const project of projects) {
      expect(project.reviewedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(Number.isNaN(Date.parse(project.reviewedOn))).toBe(false);
    }
  });

  it('has at least one technology, feature and limitation per project', () => {
    for (const project of projects) {
      expect(project.technologies.length).toBeGreaterThan(2);
      for (const { locale, text } of textBlocks(project)) {
        expect(text.name.length, `${project.slug}/${locale}`).toBeGreaterThan(0);
        expect(text.summary.length, `${project.slug}/${locale}`).toBeGreaterThan(40);
        expect(text.problem.length, `${project.slug}/${locale}`).toBeGreaterThan(80);
        expect(text.solution.length, `${project.slug}/${locale}`).toBeGreaterThan(80);
        expect(text.verifiedFeatures.length, `${project.slug}/${locale}`).toBeGreaterThan(3);
        // A project with no stated limitations would be the dishonest case.
        expect(text.limitations.length, `${project.slug}/${locale}`).toBeGreaterThan(1);
      }
    }
  });

  it('describes each feature list differently in each locale', () => {
    for (const project of projects) {
      expect(project.text.ar.verifiedFeatures).not.toEqual(project.text.en.verifiedFeatures);
      expect(project.text.ar.limitations).not.toEqual(project.text.en.limitations);
      expect(project.text.ar.summary).not.toBe(project.text.en.summary);
    }
  });
});

describe('honesty constraints from the audit', () => {
  it('only advertises a download for projects whose releases carry assets', () => {
    // Verified during the audit: these three repositories publish release assets.
    const withAssets = ['eta-invoicing-exporter', 'card-scanner', 'smart-media-downloader'];
    const withRelease = projects.filter((p) => p.releaseUrl).map((p) => p.slug);
    expect(withRelease.sort()).toEqual([...withAssets].sort());

    for (const project of projects) {
      if (project.releaseUrl) expect(project.maturity).toBe('released');
    }
  });

  it('never claims a project is a live hosted service', () => {
    const banned = [/\blive SaaS\b/i, /\bhosted service\b/i, /\bsign up free\b/i, /\btry it now\b/i];
    for (const project of projects) {
      for (const { text } of textBlocks(project)) {
        const blob = [text.summary, text.problem, text.solution, ...text.verifiedFeatures].join(' ');
        for (const pattern of banned) {
          expect(pattern.test(blob), `${project.slug}: ${pattern}`).toBe(false);
        }
      }
    }
  });

  it('never states a price, trial or benchmark figure', () => {
    const banned = [/\$\d/, /\bper month\b/i, /\bfree trial\b/i, /\b\d+%\s+(faster|saving)/i];
    for (const project of projects) {
      for (const { text } of textBlocks(project)) {
        const blob = [text.summary, text.problem, text.solution, ...text.verifiedFeatures].join(' ');
        for (const pattern of banned) {
          expect(pattern.test(blob), `${project.slug}: ${pattern}`).toBe(false);
        }
      }
    }
  });

  it('never claims a licence that was not published', () => {
    const affirmative = [
      /\blicensed under\b/i,
      /\breleased under\b/i,
      /\bMIT licen[cs]e\b/i,
      /\bApache licen[cs]e\b/i,
      /\bGPL\b/,
    ];
    for (const project of projects) {
      for (const { text } of textBlocks(project)) {
        const blob = JSON.stringify(text);
        for (const pattern of affirmative) {
          expect(pattern.test(blob), `${project.slug}: ${pattern}`).toBe(false);
        }
      }
    }
    // No project data carries a licence field, because no licence exists.
    for (const project of projects) {
      expect(project).not.toHaveProperty('license');
    }
  });

  it('only mentions open source to state that it is NOT claimed', () => {
    // The n8n repository describes itself as open source without publishing a
    // licence. The site is allowed to say that — but only in the negative.
    const mentions = /open[- ]source|مفتوح المصدر/i;
    const negations = /\bnot\b|does not|no licen[cs]e|لا يصف|لا يوجد|غير مرخ/;

    let checked = 0;
    for (const project of projects) {
      for (const { text } of textBlocks(project)) {
        for (const value of Object.values(text)) {
          const strings = Array.isArray(value) ? value : [value];
          for (const entry of strings) {
            if (!mentions.test(entry)) continue;
            checked += 1;
            expect(negations.test(entry), `${project.slug}: ${entry}`).toBe(true);
          }
        }
      }
    }
    // Guard against the rule silently becoming vacuous.
    expect(checked).toBeGreaterThan(0);
  });

  it('never names a bank or card network in project copy', () => {
    const banned = [/\bQNB\b/, /\bQatar National Bank\b/, /\bVisa\b/, /\bMastercard\b/];
    for (const project of projects) {
      for (const { locale, text } of textBlocks(project)) {
        const blob = [text.name, text.summary, text.problem, text.solution, ...text.verifiedFeatures].join(' ');
        for (const pattern of banned) {
          expect(pattern.test(blob), `${project.slug}/${locale}: ${pattern}`).toBe(false);
        }
      }
    }
  });

  it('flags every project that handles financial or card data', () => {
    const expected = new Set([
      'smartfleet-manager',
      'eta-invoicing-exporter',
      'fuel-card-extractor',
      'card-scanner',
    ]);
    for (const project of projects) {
      expect(project.sensitiveData, project.slug).toBe(expected.has(project.slug));
    }
  });

  it('says explicitly when no download exists', () => {
    for (const project of projects) {
      if (project.releaseUrl) continue;
      const combined = [...project.text.en.limitations, ...project.text.ar.limitations].join(' ');
      expect(/no (published )?(packaged )?(release|build|download)|No downloadable build|لا يوجد إصدار|لا توجد نسخة قابلة للتنزيل|لا توجد نسخة قابلة للتنزيل/i.test(combined), project.slug).toBe(true);
    }
  });
});

describe('derived helpers', () => {
  it('features exactly four projects', () => {
    expect(featuredProjects()).toHaveLength(4);
  });

  it('lists only categories that have projects, in declared order', () => {
    const categories = activeCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories).toEqual(CATEGORY_ORDER.filter((c) => categories.includes(c)));
    for (const category of categories) {
      expect(projects.some((project) => project.category === category)).toBe(true);
    }
  });

  it('lists only maturity levels that occur, in declared order', () => {
    const maturities = activeMaturities();
    expect(maturities).toEqual(MATURITY_ORDER.filter((m) => maturities.includes(m)));
  });

  it('resolves projects by slug and returns undefined otherwise', () => {
    expect(getProject('card-scanner')?.repo).toBe('VisaCardScanner');
    expect(getProject('nope')).toBeUndefined();
  });

  it('never returns the project itself as related work', () => {
    for (const project of projects) {
      const related = relatedProjects(project);
      expect(related.length).toBeLessThanOrEqual(3);
      expect(related.map((item) => item.slug)).not.toContain(project.slug);
    }
  });

  it('prefers same-category siblings when selecting related work', () => {
    const eta = getProject('eta-invoicing-exporter');
    expect(eta).toBeDefined();
    const related = relatedProjects(eta!);
    expect(related[0]?.category).toBe('financial');
  });
});
