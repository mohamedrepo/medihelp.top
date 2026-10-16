import { useId, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import {
  activeCategories,
  activeMaturities,
  projects,
  type CategoryId,
  type Maturity,
} from '../data/projects';
import { getDictionary, pluralize } from '../i18n';
import { useRouter } from '../router-context';
import { ProjectCard } from '../components/ProjectCard';
import { Card, Container, Eyebrow, Section } from '../components/primitives';

/**
 * Project catalogue.
 *
 * The filter state lives in the URL query string, which makes a filtered view
 * shareable and keeps a single source of truth. Because the page is prerendered
 * with every project already present, filtering is a progressive enhancement:
 * with JavaScript disabled a visitor still sees the complete catalogue.
 */

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function ProjectsPage() {
  const { locale, pathname, search, navigate } = useRouter();
  const dictionary = getDictionary(locale);
  const searchId = useId();
  const categoryId = useId();
  const maturityId = useId();

  const params = useMemo(() => new URLSearchParams(search), [search]);
  const query = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const maturity = params.get('maturity') ?? '';

  const categories = activeCategories();
  const maturities = activeMaturities();

  const update = (patch: Record<string, string>) => {
    const next = new URLSearchParams(search);
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    const qs = next.toString();
    navigate(`${pathname}${qs ? `?${qs}` : ''}`, { replace: true });
  };

  const clear = () => navigate(pathname, { replace: true });

  const filtered = useMemo(() => {
    const needle = normalize(query);
    return projects.filter((project) => {
      if (category && project.category !== category) return false;
      if (maturity && project.maturity !== maturity) return false;
      if (!needle) return true;

      const text = project.text[locale];
      const haystack = [
        text.name,
        text.summary,
        text.problem,
        project.slug,
        project.repo,
        ...project.technologies,
        dictionary.categoryLabels[project.category],
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(needle);
    });
  }, [query, category, maturity, locale, dictionary]);

  const hasFilters = Boolean(query || category || maturity);

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{dictionary.brand.name}</Eyebrow>
          <h1 className="text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl lg:text-5xl">
            {dictionary.projects.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-mist-400 sm:text-lg">
            {dictionary.projects.lede}
          </p>
        </div>

        {/* ------------------------------ filters ------------------------------ */}
        <Card className="mt-10 p-5 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr_1fr]">
            <div>
              <label htmlFor={searchId} className="field-label">
                {dictionary.projects.filters.searchLabel}
              </label>
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-mist-500"
                />
                <input
                  id={searchId}
                  type="search"
                  value={query}
                  onChange={(event) => update({ q: event.target.value })}
                  placeholder={dictionary.projects.filters.searchPlaceholder}
                  className="field-input ps-9"
                  // The query is free text and may mix scripts; inheriting the
                  // document direction is correct, and the value is not a
                  // machine identifier.
                />
              </div>
            </div>

            <div>
              <label htmlFor={categoryId} className="field-label">
                {dictionary.projects.filters.categoryLabel}
              </label>
              <select
                id={categoryId}
                value={category}
                onChange={(event) => update({ category: event.target.value })}
                className="field-input"
              >
                <option value="">{dictionary.projects.filters.allCategories}</option>
                {categories.map((value: CategoryId) => (
                  <option key={value} value={value}>
                    {dictionary.categoryLabels[value]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={maturityId} className="field-label">
                {dictionary.projects.filters.maturityLabel}
              </label>
              <select
                id={maturityId}
                value={maturity}
                onChange={(event) => update({ maturity: event.target.value })}
                className="field-input"
              >
                <option value="">{dictionary.projects.filters.allMaturity}</option>
                {maturities.map((value: Maturity) => (
                  <option key={value} value={value}>
                    {dictionary.maturity[value].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-mist-400/10 pt-4">
            {/* Announce the result count to assistive technology as it changes. */}
            <p aria-live="polite" className="text-sm text-mist-400">
              {hasFilters
                ? dictionary.projects.results.filtered
                    .replace('{shown}', String(filtered.length))
                    .replace('{total}', String(projects.length))
                : pluralize(dictionary.projects.results, filtered.length)}
            </p>

            {hasFilters ? (
              <button type="button" onClick={clear} className="btn btn-ghost -mx-2 text-sm">
                <X aria-hidden="true" className="size-3.5" />
                {dictionary.projects.filters.clear}
              </button>
            ) : null}
          </div>
        </Card>

        {/* ------------------------------ results ------------------------------ */}
        {filtered.length === 0 ? (
          <Card className="mt-8 p-10 text-center">
            <h2 className="text-lg font-bold text-mist-50">
              {dictionary.projects.results.empty}
            </h2>
            <p className="mt-3 text-sm text-mist-400">
              {dictionary.projects.results.emptyHint}
            </p>
            <button type="button" onClick={clear} className="btn btn-secondary mt-6">
              {dictionary.projects.filters.clear}
            </button>
          </Card>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}
