import { ArrowRight, ExternalLink as ExternalLinkIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Maturity } from '../data/projects';
import { getDictionary } from '../i18n';
import { useLocale } from '../router-context';
import { Link } from '../router-context';

/* ------------------------------ layout ------------------------------ */

export function Container({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-6 lg:px-8 ${className}`.trim()}>
      {children}
    </div>
  );
}

export function Section({
  children,
  id,
  className = '',
  as: Tag = 'section',
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  as?: 'section' | 'div' | 'article' | 'aside';
}) {
  return (
    <Tag id={id} className={`py-16 sm:py-20 lg:py-24 ${className}`.trim()}>
      {children}
    </Tag>
  );
}

/* ------------------------------ typography ------------------------------ */

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-accent-400">
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lede,
  align = 'start',
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  align?: 'start' | 'center';
}) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-start';
  return (
    <div className={`max-w-3xl ${alignment}`.trim()}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="text-2xl font-bold text-mist-50 sm:text-3xl lg:text-4xl">{title}</h2>
      {lede ? <p className="mt-4 text-base leading-relaxed text-mist-400 sm:text-lg">{lede}</p> : null}
    </div>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return <p className="text-lg leading-relaxed text-mist-300">{children}</p>;
}

/* ------------------------------ bits ------------------------------ */

/**
 * Renders a machine-readable token (URL, code, version, email) as a
 * direction-locked island so it stays LTR inside RTL prose and never reorders.
 */
export function Ltr({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <span className={`ltr-island ${className}`.trim()}>{children}</span>;
}

export function Tag({ children }: { children: ReactNode }) {
  return <span className="tag">{children}</span>;
}

export function Card({
  children,
  className = '',
  interactive = false,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <div className={`card ${interactive ? 'card-interactive' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}

/* ------------------------------ language-aware bits ------------------------------ */

const MATURITY_STYLES: Record<Maturity, string> = {
  released:
    'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  active: 'border-sky-400/35 bg-sky-400/10 text-sky-200',
  prototype: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
  experiment: 'border-mist-400/30 bg-mist-400/10 text-mist-300',
};

/**
 * Maturity badge.
 *
 * Rendered on every project surface so a prototype can never be mistaken for a
 * shipped product. The label comes from the dictionary, so it is translated.
 */
export function MaturityBadge({ maturity }: { maturity: Maturity }) {
  const dictionary = getDictionary(useLocale());
  const meta = dictionary.maturity[maturity];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${MATURITY_STYLES[maturity]}`}
      title={meta.description}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

/**
 * A link with an arrow.
 *
 * The arrow is a `ArrowRight` icon that is horizontally mirrored in RTL via the
 * `rtl:-scale-x-100` variant, so it always points in the reading direction.
 * Icons that must never flip (logos, media marks) are not rendered through here.
 */
export function ArrowLink({
  to,
  children,
  className = '',
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-accent-400 transition-colors hover:text-accent-300 ${className}`.trim()}
    >
      {children}
      <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
    </Link>
  );
}

export function ButtonLink({
  to,
  children,
  variant = 'primary',
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}) {
  return (
    <Link to={to} className={`btn btn-${variant} ${className}`.trim()}>
      {children}
    </Link>
  );
}

export function ExternalLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const dictionary = getDictionary(useLocale());
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-mist-300 underline decoration-mist-600 underline-offset-4 transition-colors hover:text-accent-300 hover:decoration-accent-400 ${className}`.trim()}
    >
      {children}
      <ExternalLinkIcon aria-hidden="true" className="size-3.5 shrink-0" />
      <span className="sr-only">({dictionary.common.opensInNewTab})</span>
    </a>
  );
}

/* ------------------------------ breadcrumbs ------------------------------ */

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Breadcrumbs.
 *
 * The separator chevron is mirrored in RTL so it points along the reading
 * direction rather than backwards.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const dictionary = getDictionary(useLocale());
  return (
    <nav aria-label={dictionary.nav.breadcrumb} className="mb-6">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-mist-500">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {item.to && !isLast ? (
                <Link to={item.to} className="transition-colors hover:text-accent-300">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-mist-300">
                  {item.label}
                </span>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="rtl:-scale-x-100 text-mist-600">
                  &rsaquo;
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
