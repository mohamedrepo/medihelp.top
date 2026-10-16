import { useMemo } from 'react';
import { getProject } from './data/projects';
import { getDictionary } from './i18n';
import { seoFor, structuredDataFor } from './lib/seo';
import { useDocumentHead } from './hooks/use-document-head';
import { useRouter } from './router-context';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ServicesPage } from './pages/ServicesPage';

/**
 * Application shell.
 *
 * Renders the header, the page body for the current route, and the footer — in
 * that order in the DOM regardless of reading direction. The visual order of the
 * header's own contents is handled with logical properties inside SiteHeader, so
 * Arabic is laid out deliberately rather than mirrored.
 */
export function App() {
  const { locale, matched } = useRouter();
  const dictionary = getDictionary(locale);

  const seo = useMemo(() => seoFor(locale, matched.route), [locale, matched.route]);
  const structuredData = useMemo(
    () => structuredDataFor(locale, matched.route),
    [locale, matched.route],
  );

  useDocumentHead(seo, structuredData);

  const body = (() => {
    switch (matched.route.kind) {
      case 'home':
        return <HomePage />;
      case 'projects':
        return <ProjectsPage />;
      case 'project': {
        const project = getProject(matched.route.slug);
        return project ? <ProjectDetailPage project={project} /> : <NotFoundPage />;
      }
      case 'services':
        return <ServicesPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'privacy':
        return <PrivacyPage />;
      case 'notFound':
        return <NotFoundPage />;
    }
  })();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only rounded-lg bg-accent-400 px-4 py-2 font-semibold text-night-950 focus:not-sr-only focus:absolute focus:top-3 focus:start-3 focus:z-50"
      >
        {dictionary.common.skipToContent}
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {body}
      </main>
      <SiteFooter />
    </div>
  );
}
