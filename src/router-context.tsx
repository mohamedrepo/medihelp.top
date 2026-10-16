import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type AnchorHTMLAttributes,
  type ReactNode,
} from 'react';
import { parsePath, type MatchedRoute } from './router';
import { DEFAULT_LOCALE, dirFor, toLocale, type Locale } from './i18n/types';

/* ------------------------------------------------------------------ *
 * A minimal external store over the History API.
 *
 * `pushState`/`replaceState` do not emit `popstate`, so programmatic
 * navigation notifies listeners explicitly. The snapshot is a primitive
 * string, so `useSyncExternalStore` can compare it by value.
 * ------------------------------------------------------------------ */

type Listener = () => void;
const listeners = new Set<Listener>();

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

function readHref(): string {
  if (typeof window === 'undefined') return `/${DEFAULT_LOCALE}/`;
  return `${window.location.pathname}${window.location.search}`;
}

let initialHrefForServer = `/${DEFAULT_LOCALE}/`;

/** Set the href used for the prerender pass and for hydration. */
export function setInitialHref(href: string): void {
  initialHrefForServer = href;
}

interface RouterValue {
  /** Current `pathname + search`. */
  href: string;
  pathname: string;
  search: string;
  matched: MatchedRoute;
  locale: Locale;
  dir: 'ltr' | 'rtl';
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterValue | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const href = useSyncExternalStore(
    subscribe,
    readHref,
    () => initialHrefForServer,
  );

  const [pathname, search] = useMemo(() => {
    const index = href.indexOf('?');
    return index === -1 ? [href, ''] : [href.slice(0, index), href.slice(index)];
  }, [href]);

  const matched = useMemo(() => parsePath(pathname), [pathname]);
  const locale = toLocale(matched.locale);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (typeof window === 'undefined') return;
    const url = new URL(to, window.location.origin);
    if (url.origin !== window.location.origin) {
      window.location.href = url.href;
      return;
    }
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (options?.replace) window.history.replaceState(null, '', next);
    else window.history.pushState(null, '', next);
    emit();
  }, []);

  // Keep the document element in sync even before the head hook runs.
  useEffect(() => {
    const root = document.documentElement;
    root.lang = locale;
    root.dir = dirFor(locale);
  }, [locale]);

  // Normalize non-canonical URLs (`/` and paths missing a locale segment).
  useEffect(() => {
    if (!matched.redirectTo) return;
    window.history.replaceState(null, '', matched.redirectTo);
    emit();
  }, [matched.redirectTo]);

  // Reset scroll on route change, preserving in-page anchors.
  //
  // Keyed on `pathname` rather than `href` on purpose: the project catalogue
  // writes its filter state into the query string, and scrolling to the top on
  // every keystroke of the search box would be hostile.
  useEffect(() => {
    const { hash } = window.location;
    if (hash) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => emit();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const value = useMemo<RouterValue>(
    () => ({
      href,
      pathname,
      search,
      matched,
      locale,
      dir: dirFor(locale),
      navigate,
    }),
    [href, pathname, search, matched, locale, navigate],
  );

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterValue {
  const value = useContext(RouterContext);
  if (!value) throw new Error('useRouter must be used inside <RouterProvider>.');
  return value;
}

export function useLocale(): Locale {
  return useRouter().locale;
}

/** Should this anchor be handled by the client router? */
function isClientRoutable(event: React.MouseEvent<HTMLAnchorElement>, href: string): boolean {
  if (event.defaultPrevented) return false;
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (href.startsWith('#')) return false;
  if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return false;
  return true;
}

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  replace?: boolean;
}

/**
 * Internal navigation link.
 *
 * External links, `target="_blank"` links, downloads, in-page anchors and
 * modifier-clicks all fall through to the browser's default behaviour, which
 * keeps keyboard and "open in new tab" semantics intact.
 */
export function Link({ to, replace, onClick, children, ...rest }: LinkProps) {
  const { navigate } = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (rest.target && rest.target !== '_self') return;
    if (rest.download !== undefined) return;
    if (!isClientRoutable(event, to)) return;
    event.preventDefault();
    navigate(to, { replace });
  };

  return (
    <a href={to} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
