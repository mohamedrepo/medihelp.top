import { getDictionary } from '../i18n';
import { LOCALES, LOCALE_HREFLANG, LOCALE_SHORT, LOCALE_LABELS } from '../i18n/types';
import { switchLocalePath } from '../router';
import { Link, useRouter } from '../router-context';

/**
 * Language switcher.
 *
 * Implemented as real `<a href>` links rather than a JavaScript toggle, for three
 * reasons: it works without JavaScript, crawlers can follow the alternate
 * language edition, and the `hreflang` attribute on each link states the
 * relationship explicitly.
 *
 * `switchLocalePath` keeps the current page. Project slugs are language-neutral,
 * so a project page switches to the equivalent project page rather than dumping
 * the visitor on a homepage.
 */
export function LocaleSwitcher({ className = '' }: { className?: string }) {
  const { locale, pathname, search } = useRouter();
  const dictionary = getDictionary(locale);

  /**
   * Remember the choice for one purpose only: so the root redirect at `/` sends
   * a returning visitor to the language they picked instead of resetting them to
   * English. It is a single value, it is not an identifier, and it is disclosed
   * on the data and privacy page. Storage failures are ignored deliberately.
   */
  const remember = (next: string) => {
    try {
      window.localStorage.setItem('medihelp.locale', next);
    } catch {
      /* Private mode or storage disabled: navigation still works. */
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border border-mist-400/20 bg-night-950/50 p-0.5 ${className}`.trim()}
      role="group"
      aria-label={dictionary.language.switcherLabel}
    >
      {LOCALES.map((candidate) => {
        const isCurrent = candidate === locale;
        // Both links go through `switchLocalePath`, including the one for the
        // current locale. Using the raw `pathname` there would emit a link to the
        // 404 document's own path on a not-found page — a dead route — and would
        // also preserve a non-canonical path on first render.
        const href = switchLocalePath(pathname, candidate, search);

        return (
          <Link
            key={candidate}
            to={href}
            hrefLang={LOCALE_HREFLANG[candidate]}
            aria-current={isCurrent ? 'true' : undefined}
            lang={candidate}
            onClick={() => remember(candidate)}
            title={isCurrent ? dictionary.language.current : `${dictionary.language.switchTo} ${LOCALE_LABELS[candidate]}`}
            className={[
              'rounded-full px-2.5 py-1 text-xs font-bold transition-colors',
              isCurrent
                ? 'bg-accent-400 text-night-950'
                : 'text-mist-400 hover:text-mist-50',
            ].join(' ')}
          >
            {LOCALE_SHORT[candidate]}
            <span className="sr-only"> — {LOCALE_LABELS[candidate]}</span>
          </Link>
        );
      })}
    </div>
  );
}
