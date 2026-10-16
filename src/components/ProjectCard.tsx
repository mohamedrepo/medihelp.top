import { Download, FileText, Info } from 'lucide-react';
import type { Project } from '../data/projects';
import { getDictionary } from '../i18n';
import { Link, useLocale } from '../router-context';
import { GithubMark } from './icons';
import { Ltr, MaturityBadge, Tag } from './primitives';
import { ProjectVisual } from './ProjectVisual';

/**
 * Project card.
 *
 * Deliberately shows only what can be verified:
 *   - the maturity badge, so a prototype is never mistaken for a product
 *   - the repository link, which every project has
 *   - documentation and download links ONLY when those artefacts exist
 *   - technologies taken from the project's actual manifests
 */
export function ProjectCard({ project, headingLevel = 3 }: { project: Project; headingLevel?: 2 | 3 }) {
  const locale = useLocale();
  const dictionary = getDictionary(locale);
  const text = project.text[locale];
  const Heading = headingLevel === 2 ? 'h2' : 'h3';

  const visibleTechnologies = project.technologies.slice(0, 4);
  const extraTechnologies = project.technologies.length - visibleTechnologies.length;

  return (
    <article className="card card-interactive flex h-full flex-col overflow-hidden">
      <div className="relative border-b border-mist-400/10">
        <ProjectVisual
          slug={project.slug}
          category={project.category}
          accent={project.accent}
          className="block h-32 w-full sm:h-36"
        />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <MaturityBadge maturity={project.maturity} />
          <Tag>{dictionary.categoryLabels[project.category]}</Tag>
        </div>

        <div className="flex-1">
          <Heading className="text-lg font-bold text-mist-50 sm:text-xl">
            <Link to={`/${locale}/projects/${project.slug}/`} className="transition-colors hover:text-accent-300">
              {text.name}
            </Link>
          </Heading>
          <p className="mt-2 text-sm leading-relaxed text-mist-400">{text.summary}</p>
        </div>

        {project.sensitiveData ? (
          <p className="flex items-start gap-2 rounded-lg border border-mist-400/12 bg-night-950/40 p-3 text-xs leading-relaxed text-mist-500">
            <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>{dictionary.common.illustrationNote}</span>
          </p>
        ) : null}

        <ul className="flex flex-wrap gap-1.5">
          {visibleTechnologies.map((technology) => (
            <li key={technology}>
              <Tag>
                <Ltr>{technology}</Ltr>
              </Tag>
            </li>
          ))}
          {extraTechnologies > 0 ? (
            <li>
              <Tag>
                <Ltr>+{extraTechnologies}</Ltr>
              </Tag>
            </li>
          ) : null}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-mist-400/10 pt-4">
          <Link
            to={`/${locale}/projects/${project.slug}/`}
            className="text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
          >
            {dictionary.common.viewProject}
          </Link>

          <a
            href={project.repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-mist-400 transition-colors hover:text-mist-100"
          >
            <GithubMark className="size-3.5" />
            {dictionary.common.repository}
            <span className="sr-only">({dictionary.common.opensInNewTab})</span>
          </a>

          {project.documentationUrl ? (
            <a
              href={project.documentationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-mist-400 transition-colors hover:text-mist-100"
            >
              <FileText aria-hidden="true" className="size-3.5" />
              {dictionary.common.documentation}
              <span className="sr-only">({dictionary.common.opensInNewTab})</span>
            </a>
          ) : null}

          {project.releaseUrl ? (
            <a
              href={project.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-mist-400 transition-colors hover:text-mist-100"
            >
              <Download aria-hidden="true" className="size-3.5" />
              {dictionary.common.release}
              <span className="sr-only">({dictionary.common.opensInNewTab})</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
