import { AlertTriangle, ArrowLeft, Check, Download, FileText, Info } from 'lucide-react';
import type { Project } from '../data/projects';
import { relatedProjects } from '../data/projects';
import { getDictionary } from '../i18n';
import { Link, useRouter } from '../router-context';
import { GithubMark } from '../components/icons';
import { ProjectVisual } from '../components/ProjectVisual';
import {
  ArrowLink,
  Breadcrumbs,
  ButtonLink,
  Card,
  Container,
  Ltr,
  MaturityBadge,
  Section,
  Tag,
} from '../components/primitives';
import { Reveal } from '../components/Reveal';

/** One labelled block of long-form copy. */
function Block({
  title,
  children,
  delay = 0,
}: {
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="border-t border-mist-400/12 pt-8">
        <h2 className="text-lg font-bold text-mist-50 sm:text-xl">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </Reveal>
  );
}

export function ProjectDetailPage({ project }: { project: Project }) {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);
  const text = project.text[locale];
  const related = relatedProjects(project);

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <Breadcrumbs
          items={[
            { label: dictionary.nav.home, to: `/${locale}/` },
            { label: dictionary.nav.projects, to: `/${locale}/projects/` },
            { label: text.name },
          ]}
        />

        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          {/* ------------------------------ main column ------------------------------ */}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <MaturityBadge maturity={project.maturity} />
              <Tag>{dictionary.categoryLabels[project.category]}</Tag>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl">
              {text.name}
            </h1>

            <p className="mt-5 text-base leading-relaxed text-mist-300 sm:text-lg">
              {text.summary}
            </p>

            {project.sensitiveData ? (
              <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/8 p-4 text-sm leading-relaxed text-amber-100/90">
                <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{dictionary.project.screenshotNotice}</span>
              </p>
            ) : null}

            {project.releaseUrl ? (
              <p className="mt-6 flex items-start gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/8 p-4 text-sm leading-relaxed text-emerald-100/90">
                <Download aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <span>{dictionary.project.releasedNotice}</span>
              </p>
            ) : (
              <p className="mt-6 rounded-xl border border-mist-400/15 bg-night-900/60 p-4 text-sm leading-relaxed text-mist-400">
                {dictionary.project.noDownloadNotice}
              </p>
            )}

            <div className="mt-10 flex flex-col gap-8">
              <Block title={dictionary.project.problem}>
                <p className="text-base leading-relaxed text-mist-300">{text.problem}</p>
              </Block>

              <Block title={dictionary.project.solution} delay={40}>
                <p className="text-base leading-relaxed text-mist-300">{text.solution}</p>
              </Block>

              <Block title={dictionary.project.features} delay={80}>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {text.verifiedFeatures.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-emerald-400"
                      />
                      <span className="text-sm leading-relaxed text-mist-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title={dictionary.project.limitations} delay={120}>
                <ul className="flex flex-col gap-3">
                  {text.limitations.map((limitation) => (
                    <li key={limitation} className="flex items-start gap-2.5">
                      <AlertTriangle
                        aria-hidden="true"
                        className="mt-0.5 size-4 shrink-0 text-amber-400"
                      />
                      <span className="text-sm leading-relaxed text-mist-300">
                        {limitation}
                      </span>
                    </li>
                  ))}
                </ul>
              </Block>

              <Block title={dictionary.project.technologies} delay={160}>
                <ul className="flex flex-wrap gap-2">
                  {project.technologies.map((technology) => (
                    <li key={technology}>
                      <Tag>
                        <Ltr>{technology}</Ltr>
                      </Tag>
                    </li>
                  ))}
                </ul>
              </Block>
            </div>
          </div>

          {/* ------------------------------ sidebar ------------------------------ */}
          <Reveal delay={60}>
            <div className="lg:sticky lg:top-24">
              <Card className="overflow-hidden">
                <ProjectVisual
                  slug={project.slug}
                  category={project.category}
                  accent={project.accent}
                  className="block h-36 w-full border-b border-mist-400/12"
                />
                <div className="p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
                    {dictionary.project.links}
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    <li>
                      <a
                        href={project.repositoryUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-medium text-mist-200 transition-colors hover:text-accent-300"
                      >
                        <GithubMark className="size-4 shrink-0" />
                        {dictionary.common.repository}
                        <span className="sr-only">({dictionary.common.opensInNewTab})</span>
                      </a>
                      <p className="mt-1 ps-6 text-xs text-mist-500">
                        <Ltr>{project.repositoryUrl.replace('https://', '')}</Ltr>
                      </p>
                    </li>

                    {project.documentationUrl ? (
                      <li>
                        <a
                          href={project.documentationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-mist-200 transition-colors hover:text-accent-300"
                        >
                          <FileText aria-hidden="true" className="size-4 shrink-0" />
                          {dictionary.common.documentation}
                          <span className="sr-only">({dictionary.common.opensInNewTab})</span>
                        </a>
                      </li>
                    ) : null}

                    {project.releaseUrl ? (
                      <li>
                        <a
                          href={project.releaseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm font-medium text-mist-200 transition-colors hover:text-accent-300"
                        >
                          <Download aria-hidden="true" className="size-4 shrink-0" />
                          {dictionary.common.release}
                          <span className="sr-only">({dictionary.common.opensInNewTab})</span>
                        </a>
                      </li>
                    ) : null}
                  </ul>

                  <hr className="section-divider my-5" />

                  <dl className="flex flex-col gap-3 text-sm">
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-mist-500">{dictionary.project.status}</dt>
                      <dd className="text-mist-300">
                        {dictionary.maturity[project.maturity].label}
                      </dd>
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <dt className="text-mist-500">{dictionary.common.lastReviewed}</dt>
                      <dd className="text-mist-300">
                        <Ltr>{project.reviewedOn}</Ltr>
                      </dd>
                    </div>
                  </dl>
                </div>
              </Card>
            </div>
          </Reveal>
        </div>

        {/* ------------------------------ related ------------------------------ */}
        {related.length > 0 ? (
          <div className="mt-20 border-t border-mist-400/12 pt-10">
            <Reveal>
              <h2 className="text-lg font-bold text-mist-50 sm:text-xl">
                {dictionary.project.related}
              </h2>
            </Reveal>
            <ul className="mt-6 grid gap-4 sm:grid-cols-3">
              {related.map((item, index) => (
                <li key={item.slug}>
                  <Reveal delay={index * 60}>
                    <Link
                      to={`/${locale}/projects/${item.slug}/`}
                      className="card card-interactive flex h-full flex-col gap-3 p-5"
                    >
                      <MaturityBadge maturity={item.maturity} />
                      <h3 className="text-sm font-bold text-mist-50">
                        {item.text[locale].name}
                      </h3>
                      <p className="text-xs leading-relaxed text-mist-400">
                        {item.text[locale].summary}
                      </p>
                    </Link>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* ------------------------------ CTA ------------------------------ */}
        <Reveal>
          <Card className="mt-16 p-8 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-mist-50 sm:text-2xl">
                {dictionary.project.ctaHeading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-mist-400">
                {dictionary.project.ctaBody}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <ButtonLink to={`/${locale}/contact/`} variant="primary">
                  {dictionary.project.ctaButton}
                </ButtonLink>
                <Link
                  to={`/${locale}/projects/`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-mist-300 transition-colors hover:text-accent-300"
                >
                  <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                  {dictionary.common.backToProjects}
                </Link>
              </div>
            </div>
          </Card>
        </Reveal>

        <div className="mt-8">
          <ArrowLink to={`/${locale}/services/`}>{dictionary.nav.services}</ArrowLink>
        </div>
      </Container>
    </Section>
  );
}
