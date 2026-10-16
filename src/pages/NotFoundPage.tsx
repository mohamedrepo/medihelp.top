import { ArrowRight } from 'lucide-react';
import { getDictionary } from '../i18n';
import { useRouter } from '../router-context';
import { ButtonLink, Card, Container, Section } from '../components/primitives';

export function NotFoundPage() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);

  return (
    <Section className="py-24 sm:py-32">
      <Container>
        <Card className="mx-auto max-w-xl p-8 text-center sm:p-12">
          <p aria-hidden="true" className="text-5xl font-extrabold tracking-tight text-accent-400/40">
            {dictionary.notFound.code}
          </p>
          <h1 className="mt-4 text-2xl font-bold text-mist-50 sm:text-3xl">
            {dictionary.notFound.heading}
          </h1>
          <p className="mt-4 text-base leading-relaxed text-mist-400">
            {dictionary.notFound.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink to={`/${locale}/`} variant="primary">
              {dictionary.notFound.ctaHome}
              <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
            </ButtonLink>
            <ButtonLink to={`/${locale}/projects/`} variant="secondary">
              {dictionary.notFound.ctaProjects}
            </ButtonLink>
          </div>
        </Card>
      </Container>
    </Section>
  );
}
