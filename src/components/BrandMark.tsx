/**
 * MediHelp Technologies brand mark.
 *
 * The glyph is an abstract flow of three connected nodes — one input, one
 * process, one output — which is what most of the work actually is. It is a
 * geometric mark rather than a letterform, so it reads identically in LTR and
 * RTL and never needs mirroring.
 *
 * The wordmark is rendered as text (not an image) so it stays selectable,
 * translatable and searchable, and so the Arabic name renders in the Arabic face.
 */
export function BrandGlyph({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" className={className}>
      <defs>
        <linearGradient id="brand-glyph" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#brand-glyph)" />
      <g
        fill="none"
        stroke="#04070e"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 21.5V12l7 5.5 7-5.5v9.5" />
        <circle cx="9" cy="10.5" r="1.6" fill="#04070e" stroke="none" />
        <circle cx="23" cy="10.5" r="1.6" fill="#04070e" stroke="none" />
      </g>
    </svg>
  );
}

export function BrandMark({ name, className = '' }: { name: string; className?: string }) {
  return (
    // `min-w-0` on both flex levels is what lets the wordmark truncate instead of
    // pushing the header's controls past the viewport. Without it the wordmark's
    // min-content width wins, and a 320px screen scrolls sideways.
    <span className={`flex min-w-0 items-center gap-2.5 ${className}`.trim()}>
      <BrandGlyph className="size-8 shrink-0" />
      <span className="truncate text-[0.95rem] font-bold leading-tight tracking-tight text-mist-50">
        {name}
      </span>
    </span>
  );
}
