import { ArrowRight, ShieldOff } from 'lucide-react';
import { getDictionary } from '../i18n';
import { useRouter } from '../router-context';
import { ButtonLink, Card, Container, Eyebrow, Section, SectionHeading } from '../components/primitives';
import { Reveal } from '../components/Reveal';

/**
 * About page.
 *
 * Contains no biography, no credentials, no certifications, no client names, no
 * employment claims and no awards — none of those can be verified, and the brief
 * forbids inventing them. What remains is what the code and repositories
 * actually evidence.
 */
export function AboutPage() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);
  const about = dictionary.about;

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{dictionary.brand.name}</Eyebrow>
          <h1 className="text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl lg:text-5xl">
            {about.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-mist-300 sm:text-lg">{about.lede}</p>
        </div>

        {/* ------------------------------ mission ------------------------------ */}
        <Reveal>
          <div className="mt-14 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
            <div>
              <h2 className="text-xl font-bold text-mist-50 sm:text-2xl">
                {about.mission.heading}
              </h2>
              <div className="mt-5 flex flex-col gap-5">
                {about.mission.body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-relaxed text-mist-300">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <Card className="p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-accent-400">
                {dictionary.brand.positioning}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-mist-300">
                {dictionary.brand.description}
              </p>
            </Card>
          </div>
        </Reveal>

        {/* ------------------------------ focus ------------------------------ */}
        <div className="mt-20">
          <Reveal>
            <SectionHeading
              title={about.focus.heading}
              lede={about.focus.lede}
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
        </div>

        {/* ------------------------------ approach ------------------------------ */}
        <div className="mt-20">
          <Reveal>
            <SectionHeading title={about.approach.heading} />
          </Reveal>
          <ol className="mt-10 flex flex-col gap-4">
            {about.approach.steps.map((step, index) => (
              <li key={step.title}>
                <Reveal delay={index * 50}>
                  <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:gap-6">
                    <span
                      aria-hidden="true"
                      className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent-400/12 text-sm font-bold text-accent-300"
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-mist-50">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-mist-400">{step.body}</p>
                    </div>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>

        {/* ------------------------------ principles ------------------------------ */}
        <div className="mt-20">
          <Reveal>
            <SectionHeading title={about.principles.heading} />
          </Reveal>
          <Reveal>
            <Card className="mt-8 p-6 sm:p-8">
              <ul className="grid gap-4 sm:grid-cols-2">
                {about.principles.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <ShieldOff
                      aria-hidden="true"
                      className="mt-0.5 size-4 shrink-0 text-amber-400"
                    />
                    <span className="text-sm leading-relaxed text-mist-300">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>

        {/* ------------------------------ working with us ------------------------------ */}
        <div className="mt-20">
          <Reveal>
            <Card className="p-8 sm:p-10">
              <div className="max-w-2xl">
                <h2 className="text-xl font-bold text-mist-50 sm:text-2xl">
                  {about.working.heading}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-mist-400">
                  {about.working.body}
                </p>
                <p className="mt-4 text-sm text-mist-500">
                  {dictionary.contact.channels.location}: {dictionary.contact.channels.locationValue}
                </p>
              </div>
            </Card>
          </Reveal>
        </div>

        {/* ------------------------------ CTA ------------------------------ */}
        <Reveal>
          <Card className="mt-12 p-8 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="text-xl font-bold text-mist-50 sm:text-2xl">
                {about.contactCta.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-mist-400">
                {about.contactCta.body}
              </p>
              <div className="mt-7">
                <ButtonLink to={`/${locale}/contact/`} variant="primary">
                  {about.contactCta.button}
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
