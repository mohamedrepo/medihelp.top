import { ArrowRight, ShieldCheck } from 'lucide-react';
import { activeCategories, featuredProjects, MATURITY_ORDER } from '../data/projects';
import { getDictionary } from '../i18n';
import { Link, useRouter } from '../router-context';
import { GithubMark } from '../components/icons';
import { ProjectCard } from '../components/ProjectCard';
import { MaturityBadge } from '../components/primitives';
import { ButtonLink, Card, Container, Eyebrow, Section, SectionHeading } from '../components/primitives';
import { Reveal } from '../components/Reveal';

export function HomePage() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);
  const featured = featuredProjects();
  const categories = activeCategories();

  return (
    <>
      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-accent-400/40 to-transparent"
        />
        <Container>
          {/*
            The staggered entrance is pure CSS (`.hero-stagger` in index.css):
            one keyframe rule plus per-child delays. It is scoped to `.motion-ok`,
            so it never runs without JavaScript and never runs for a visitor who
            has asked for reduced motion — the content is simply present.
          */}
          <div className="hero-stagger max-w-3xl">
            <div>
              <Eyebrow>{dictionary.home.hero.eyebrow}</Eyebrow>
            </div>

            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-mist-50 sm:text-5xl lg:text-6xl">
              {dictionary.home.hero.title}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-mist-300 sm:text-lg">
              {dictionary.home.hero.lede}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <ButtonLink to={`/${locale}/projects/`} variant="primary">
                {dictionary.home.hero.ctaPrimary}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </ButtonLink>
              <ButtonLink to={`/${locale}/services/`} variant="secondary">
                {dictionary.home.hero.ctaSecondary}
              </ButtonLink>
              <ButtonLink to={`/${locale}/contact/`} variant="ghost">
                {dictionary.home.hero.ctaTertiary}
              </ButtonLink>
            </div>

            <p className="mt-8 flex max-w-2xl items-start gap-2.5 rounded-xl border border-mist-400/12 bg-night-900/50 p-4 text-sm leading-relaxed text-mist-400">
              <ShieldCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-400" />
              <span>{dictionary.home.hero.honestyNote}</span>
            </p>
          </div>
        </Container>
      </section>

      {/* --------------------------- how we work --------------------------- */}
      <Section className="border-y border-mist-400/10 bg-night-900/40">
        <Container>
          <Reveal>
            <SectionHeading title={dictionary.home.trust.heading} />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dictionary.home.trust.items.map((item, index) => (
              <Reveal key={item.title} delay={index * 70}>
                <Card className="h-full p-6">
                  <h3 className="text-base font-bold text-mist-50">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist-400">{item.body}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------- featured projects ------------------------- */}
      <Section id="featured">
        <Container>
          <Reveal>
            <SectionHeading
              eyebrow={dictionary.nav.projects}
              title={dictionary.home.featured.heading}
              lede={dictionary.home.featured.lede}
            />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {featured.map((project, index) => (
              <Reveal key={project.slug} delay={index * 70}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="mt-10">
              <ButtonLink to={`/${locale}/projects/`} variant="secondary">
                {dictionary.home.featured.cta}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ---------------------------- categories ---------------------------- */}
      <Section className="border-y border-mist-400/10 bg-night-900/40">
        <Container>
          <Reveal>
            <SectionHeading
              title={dictionary.home.categories.heading}
              lede={dictionary.home.categories.lede}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Reveal key={category} delay={index * 50}>
                <Link
                  to={`/${locale}/projects/?category=${category}`}
                  className="card card-interactive flex h-full flex-col p-5"
                >
                  <h3 className="text-base font-bold text-mist-50">
                    {dictionary.categoryLabels[category]}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist-400">
                    {dictionary.categoryDescriptions[category]}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* --------------------------- maturity scale --------------------------- */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              title={dictionary.home.maturitySection.heading}
              lede={dictionary.home.maturitySection.lede}
            />
          </Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {MATURITY_ORDER.map((maturity, index) => (
              <Reveal key={maturity} delay={index * 60}>
                <Card className="flex h-full flex-col gap-3 p-5">
                  <MaturityBadge maturity={maturity} />
                  <p className="text-sm leading-relaxed text-mist-400">
                    {dictionary.maturity[maturity].description}
                  </p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* -------------------------- technical focus -------------------------- */}
      <Section className="border-y border-mist-400/10 bg-night-900/40">
        <Container>
          <Reveal>
            <SectionHeading
              title={dictionary.home.capabilities.heading}
              lede={dictionary.home.capabilities.lede}
            />
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dictionary.home.capabilities.groups.map((group, index) => (
              <Reveal key={group.title} delay={index * 60}>
                <Card className="h-full p-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.1em] text-accent-400">
                    {group.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {group.items.map((item) => (
                      <li key={item} className="text-sm leading-relaxed text-mist-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* ----------------------------- services ----------------------------- */}
      <Section>
        <Container>
          <Reveal>
            <SectionHeading
              title={dictionary.home.servicesSection.heading}
              lede={dictionary.home.servicesSection.lede}
            />
          </Reveal>
          <Reveal>
            <div className="mt-8">
              <ButtonLink to={`/${locale}/services/`} variant="secondary">
                {dictionary.home.servicesSection.cta}
                <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* ------------------------------ contact ------------------------------ */}
      <Section className="border-t border-mist-400/10">
        <Container>
          <Reveal>
            <Card className="relative overflow-hidden p-8 sm:p-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-400/50 to-transparent"
              />
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold text-mist-50 sm:text-3xl">
                  {dictionary.home.contactSection.heading}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-mist-400">
                  {dictionary.home.contactSection.lede}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink to={`/${locale}/contact/`} variant="primary">
                    {dictionary.home.contactSection.cta}
                    <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                  </ButtonLink>
                  <a
                    href="https://github.com/mohamedrepo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    <GithubMark className="size-4" />
                    {dictionary.contact.channels.github}
                  </a>
                </div>
              </div>
            </Card>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}
