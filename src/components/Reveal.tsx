import { useEffect, useRef, type ElementType, type ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  /** Stagger offset in milliseconds. Capped so nothing ever feels slow. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Scroll-triggered entrance.
 *
 * Why this mutation approach rather than React state:
 *
 * The hidden state is CSS-only and scoped to `.motion-ok`, a class an inline
 * head script adds before first paint — and only when JavaScript runs AND the
 * visitor has not asked for reduced motion. The element is therefore already
 * hidden by the stylesheet in the normal case, so revealing it is just a matter
 * of setting one attribute. No `setState` in an effect, and crucially no flash of
 * visible-then-hidden content, which a state-based version cannot avoid without
 * risking a hydration mismatch.
 *
 * Resilience, all deliberate:
 *   - JS disabled  -> `motion-ok` is absent -> the element is never hidden.
 *   - reduced motion -> same, plus a `!important` override in the stylesheet.
 *   - no IntersectionObserver -> the element is revealed immediately.
 *   - the observer disconnects as soon as it fires, so nothing keeps running.
 */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // If the stylesheet is not hiding this element, there is nothing to reveal.
    if (!document.documentElement.classList.contains('motion-ok')) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.setAttribute('data-revealed', 'true');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.setAttribute('data-revealed', 'true');
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const cappedDelay = Math.min(delay, 400);

  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`.trim()}
      style={cappedDelay ? { transitionDelay: `${cappedDelay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
