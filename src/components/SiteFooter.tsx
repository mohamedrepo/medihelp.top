import { getDictionary } from '../i18n';
import { featuredProjects } from '../data/projects';
import { Link, useRouter } from '../router-context';
import { BrandMark } from './BrandMark';
import { Container } from './primitives';

export function SiteFooter() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);
  const featured = featuredProjects();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-8 border-t border-mist-400/12 bg-night-950/60">
      <Container className="py-14">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <BrandMark name={dictionary.brand.name} />
            <p className="mt-4 text-sm leading-relaxed text-mist-400">
              {dictionary.footer.tagline}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-mist-500">
              {dictionary.footer.buildNote}
            </p>
          </div>

          <nav aria-label={dictionary.nav.footer}>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              {dictionary.footer.exploreHeading}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {(
                [
                  ['home', `/${locale}/`],
                  ['projects', `/${locale}/projects/`],
                  ['services', `/${locale}/services/`],
                  ['about', `/${locale}/about/`],
                  ['contact', `/${locale}/contact/`],
                ] as const
              ).map(([key, to]) => (
                <li key={key}>
                  <Link to={to} className="text-mist-400 transition-colors hover:text-accent-300">
                    {dictionary.nav[key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              {dictionary.footer.projectsHeading}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              {featured.map((project) => (
                <li key={project.slug}>
                  <Link
                    to={`/${locale}/projects/${project.slug}/`}
                    className="text-mist-400 transition-colors hover:text-accent-300"
                  >
                    {project.text[locale].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-mist-500">
              {dictionary.footer.legalHeading}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <Link to={`/${locale}/privacy/`} className="text-mist-400 transition-colors hover:text-accent-300">
                  {dictionary.footer.privacy}
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com/mohamedrepo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist-400 transition-colors hover:text-accent-300"
                >
                  {dictionary.contact.channels.github}
                  <span className="sr-only"> ({dictionary.common.opensInNewTab})</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <hr className="section-divider my-10" />

        <div className="flex flex-col gap-4">
          <p className="text-xs leading-relaxed text-mist-500">{dictionary.footer.trademarkNote}</p>
          <p className="text-xs text-mist-600">
            &copy; {year} {dictionary.brand.name}. {dictionary.footer.rights}
          </p>
        </div>
      </Container>
    </footer>
  );
}
