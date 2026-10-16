import { ArrowLeft } from 'lucide-react';
import { getDictionary } from '../i18n';
import { Link, useRouter } from '../router-context';
import { Card, Container, Eyebrow, Section } from '../components/primitives';
import { Reveal } from '../components/Reveal';

/**
 * Data and privacy page.
 *
 * This page describes what the site actually does, so it can only be accurate
 * while that remains true: no analytics, no tracking pixels, no third-party
 * fonts or scripts, and a contact form whose data is used solely to reply.
 */
export function PrivacyPage() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);
  const page = dictionary.privacy;

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{dictionary.brand.name}</Eyebrow>
          <h1 className="text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl lg:text-5xl">
            {page.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-mist-400 sm:text-lg">{page.lede}</p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {page.sections.map((section, index) => (
            <Reveal key={section.heading} delay={index * 50}>
              <Card className="h-full p-6">
                <h2 className="text-base font-bold text-mist-50">{section.heading}</h2>
                <p className="mt-3 text-sm leading-relaxed text-mist-400">{section.body}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link
            to={`/${locale}/contact/`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300"
          >
            <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            {page.backToContact}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
