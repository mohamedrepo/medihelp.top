import { ArrowRight, Check, Users } from 'lucide-react';
import { getDictionary } from '../i18n';
import { Link, useRouter } from '../router-context';
import { ButtonLink, Card, Container, Eyebrow, Section } from '../components/primitives';
import { Reveal } from '../components/Reveal';

/**
 * Services page.
 *
 * Every service listed here is backed by a project in the catalogue that a
 * visitor can inspect. No service is offered that has no working code behind it,
 * and no delivery time, price, warranty or certification is stated — none of
 * those can be substantiated before a scope is understood.
 */
export function ServicesPage() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);
  const items = Object.values(dictionary.services.items);

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{dictionary.brand.name}</Eyebrow>
          <h1 className="text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl lg:text-5xl">
            {dictionary.services.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-mist-400 sm:text-lg">
            {dictionary.services.lede}
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {items.map((service, index) => (
            <Reveal key={service.title} delay={index * 50}>
              <Card className="flex h-full flex-col p-6 sm:p-7">
                <h2 className="text-lg font-bold text-mist-50">{service.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-mist-400">{service.summary}</p>

                <div className="mt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-accent-400">
                    {dictionary.services.labels.deliverables}
                  </h3>
                  <ul className="mt-3 flex flex-col gap-2">
                    {service.deliverables.map((deliverable) => (
                      <li key={deliverable} className="flex items-start gap-2.5">
                        <Check
                          aria-hidden="true"
                          className="mt-0.5 size-3.5 shrink-0 text-emerald-400"
                        />
                        <span className="text-sm leading-relaxed text-mist-300">
                          {deliverable}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-mist-400/10 pt-5">
                  <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-accent-400">
                    <Users aria-hidden="true" className="size-3.5" />
                    {dictionary.services.labels.suitableFor}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-mist-300">
                    {service.suitableFor}
                  </p>
                </div>

                <div className="mt-auto pt-6">
                  <Link
                    to={`/${locale}/contact/`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
                  >
                    {dictionary.services.labels.enquire}
                    <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                  </Link>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <Card className="mt-16 p-8 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-mist-50 sm:text-2xl">
                {dictionary.services.cta.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-mist-400">
                {dictionary.services.cta.body}
              </p>
              <div className="mt-7">
                <ButtonLink to={`/${locale}/contact/`} variant="primary">
                  {dictionary.services.cta.button}
                  <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                </ButtonLink>
              </div>
            </div>
          </Card>
        </Reveal>
      </Container>
    </Section>
  );
}
