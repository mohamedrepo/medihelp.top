import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDictionary } from '../i18n';
import { Link, useRouter } from '../router-context';
import type { Route } from '../router';
import { BrandMark } from './BrandMark';
import { Container } from './primitives';
import { LocaleSwitcher } from './LocaleSwitcher';

type NavKey = 'home' | 'projects' | 'services' | 'about' | 'contact';

const NAV: { key: NavKey; route: Route; path: (locale: string) => string }[] = [
  { key: 'home', route: { kind: 'home' }, path: (l) => `/${l}/` },
  { key: 'projects', route: { kind: 'projects' }, path: (l) => `/${l}/projects/` },
  { key: 'services', route: { kind: 'services' }, path: (l) => `/${l}/services/` },
  { key: 'about', route: { kind: 'about' }, path: (l) => `/${l}/about/` },
  { key: 'contact', route: { kind: 'contact' }, path: (l) => `/${l}/contact/` },
];

function isActive(active: Route['kind'], candidate: Route['kind']): boolean {
  if (candidate === 'projects') {
    // A project detail page should keep "Projects" marked as the current section.
    return active === 'projects' || active === 'project';
  }
  return active === candidate;
}

export function SiteHeader() {
  const { locale, href, matched } = useRouter();
  const dictionary = getDictionary(locale);

  /**
   * The panel is open for the route it was opened on, derived from `href` rather
   * than synchronised with it in an effect.
   *
   * Navigation changes `href`, so the menu closes by itself — no effect, no
   * cascading render, and no possibility of the menu staying open over a page the
   * visitor has already left.
   */
  const [openForHref, setOpenForHref] = useState<string | null>(null);
  const menuOpen = openForHref === href;

  const closeMenu = () => setOpenForHref(null);
  const toggleMenu = () => setOpenForHref((current) => (current === href ? null : href));

  // Escape closes the panel; body scroll is locked while it is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenForHref(null);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 header-shell">
      <Container>
        <div className="flex h-16 items-center justify-between gap-4">
          {/*
            The brand block is the only shrinkable item in this row: at very
            narrow widths the wordmark truncates so the language switcher and the
            menu button stay fully inside the viewport. The accessible name comes
            from `aria-label`, so a truncated wordmark is never the only label.
          */}
          <Link
            to={`/${locale}/`}
            className="flex min-w-0 items-center rounded-lg py-1"
            aria-label={dictionary.brand.name}
          >
            <BrandMark name={dictionary.brand.name} />
          </Link>

          <nav aria-label={dictionary.nav.primary} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = isActive(matched.route.kind, item.route.kind);
                return (
                  <li key={item.key}>
                    <Link
                      to={item.path(locale)}
                      aria-current={active ? 'page' : undefined}
                      className={[
                        'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'text-accent-300'
                          : 'text-mist-300 hover:text-mist-50',
                      ].join(' ')}
                    >
                      {dictionary.nav[item.key]}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <LocaleSwitcher />
            <button
              type="button"
              onClick={toggleMenu}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label={menuOpen ? dictionary.nav.closeMenu : dictionary.nav.openMenu}
              className="btn btn-secondary size-11 px-0 md:hidden"
            >
              {menuOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <Menu aria-hidden="true" className="size-5" />
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Backdrop */}
      <div
        hidden={!menuOpen}
        onClick={closeMenu}
        className="fixed inset-0 z-40 bg-night-950/70 backdrop-blur-sm md:hidden"
        aria-hidden="true"
      />

      {/*
        Mobile navigation panel.

        It slides in from the LEADING edge, which is the right edge in Arabic.
        `start-0` and `rtl:translate-x-full` express that logically: the closed
        position is off-screen on the leading side in both reading directions,
        so Arabic is laid out deliberately rather than mirrored from English.
      */}
      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className={[
          'fixed inset-y-0 start-0 z-50 w-[86%] max-w-sm border-e border-mist-400/15',
          'bg-night-900/98 backdrop-blur-xl md:hidden',
          'transition-transform duration-300 ease-out',
          menuOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-mist-400/12 px-5">
          <span className="text-sm font-semibold text-mist-300">{dictionary.nav.menu}</span>
          <button
            type="button"
            onClick={closeMenu}
            aria-label={dictionary.nav.closeMenu}
            className="btn btn-ghost size-10 px-0"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>

        <nav aria-label={dictionary.nav.primary} className="p-5">
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = isActive(matched.route.kind, item.route.kind);
              return (
                <li key={item.key}>
                  <Link
                    to={item.path(locale)}
                    aria-current={active ? 'page' : undefined}
                    className={[
                      'block rounded-xl px-4 py-3 text-base font-medium transition-colors',
                      active
                        ? 'bg-accent-400/10 text-accent-300'
                        : 'text-mist-200 hover:bg-mist-100/5 hover:text-mist-50',
                    ].join(' ')}
                  >
                    {dictionary.nav[item.key]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
