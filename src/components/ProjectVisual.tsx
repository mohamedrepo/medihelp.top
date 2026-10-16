import type { Accent, CategoryId } from '../data/projects';

/**
 * Abstract project illustrations.
 *
 * IMPORTANT — why these are abstract rather than screenshots:
 * the audit found that no publishable screenshot exists anywhere in the
 * portfolio. The only real UI screenshots are in a directory that contains real
 * financial data and must never be published, and several projects handle
 * taxpayer or payment-card data by nature. Presenting a mockup as an application
 * screenshot would be a fabrication.
 *
 * So each project gets a purpose-built geometric motif derived from what the
 * software actually does. They are decorative (`aria-hidden`), because the
 * adjacent card text already names the project and describes it — a screen
 * reader announcing the illustration would only add noise.
 */

const ACCENT_HEX: Record<Accent, string> = {
  cyan: '#22d3ee',
  blue: '#60a5fa',
  violet: '#a78bfa',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
};

/** Deterministic, unique-enough gradient id per project slug. */
function gradientId(slug: string): string {
  return `visual-${slug.replace(/[^a-z0-9-]/gi, '')}`;
}

function Motif({ category, accent }: { category: CategoryId; accent: string }) {
  const stroke = accent;
  const faint = 'rgba(148,163,184,0.35)';

  switch (category) {
    // Fleet: a schedule/telemetry table with a gauge sweep.
    case 'fleet':
      return (
        <g fill="none" strokeWidth="1.4">
          <path d="M28 34h56M28 46h44M28 58h50M28 70h36" stroke={faint} strokeLinecap="round" />
          <circle cx="116" cy="52" r="24" stroke={stroke} opacity="0.55" />
          <path d="M116 52V36M116 52l13 8" stroke={stroke} strokeLinecap="round" />
          <path d="M96 78h40" stroke={stroke} opacity="0.3" strokeLinecap="round" />
        </g>
      );

    // Financial: spreadsheet grid plus a trend line.
    case 'financial':
      return (
        <g fill="none" strokeWidth="1.4">
          <rect x="26" y="30" width="58" height="48" rx="4" stroke={faint} />
          <path d="M26 44h58M26 58h58M45 30v48" stroke={faint} opacity="0.7" />
          <path
            d="M96 74l14-16 12 9 18-27"
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="140" cy="40" r="3" fill={stroke} />
        </g>
      );

    // Security: shield with an evidence check and scan lines.
    case 'security':
      return (
        <g fill="none" strokeWidth="1.4">
          <path
            d="M76 28l26 10v22c0 17-11 27-26 34-15-7-26-17-26-34V38z"
            stroke={stroke}
            opacity="0.7"
          />
          <path d="M66 58l8 8 16-18" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 44h22M26 62h18M112 44h22M116 62h18" stroke={faint} strokeLinecap="round" />
        </g>
      );

    // Windows: a pane layout with servicing arrows.
    case 'windows':
      return (
        <g fill="none" strokeWidth="1.4">
          <rect x="28" y="30" width="48" height="44" rx="4" stroke={faint} />
          <rect x="84" y="30" width="48" height="44" rx="4" stroke={faint} />
          <path d="M52 52l10-8v16z" fill={stroke} />
          <path d="M84 52h48M84 74h30" stroke={stroke} opacity="0.35" strokeLinecap="round" />
        </g>
      );

    // Extension: browser chrome with a puzzle notch.
    case 'extensions':
      return (
        <g fill="none" strokeWidth="1.4">
          <rect x="26" y="30" width="108" height="48" rx="6" stroke={faint} />
          <path d="M26 44h108" stroke={faint} />
          <circle cx="36" cy="37" r="2.4" fill={faint} />
          <circle cx="45" cy="37" r="2.4" fill={faint} />
          <path
            d="M70 56h14v-8a5 5 0 0110 0v8h6v12h-8a5 5 0 000 10h8"
            stroke={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );

    // Mobile: a handset outline holding a masked card.
    case 'mobile':
      return (
        <g fill="none" strokeWidth="1.4">
          <rect x="60" y="26" width="44" height="76" rx="8" stroke={faint} />
          <rect x="70" y="46" width="24" height="16" rx="3" stroke={stroke} />
          <path d="M74 54h8" stroke={stroke} strokeLinecap="round" />
          <path d="M78 92h8" stroke={faint} strokeLinecap="round" />
          <path d="M28 44h20M28 74h20M116 44h20M116 74h20" stroke={faint} strokeLinecap="round" />
        </g>
      );

    // Workflow: trigger -> service -> output nodes.
    case 'workflow':
      return (
        <g fill="none" strokeWidth="1.4">
          <circle cx="38" cy="52" r="12" stroke={faint} />
          <rect x="72" y="38" width="34" height="28" rx="5" stroke={stroke} />
          <circle cx="140" cy="52" r="12" stroke={faint} />
          <path
            d="M50 52h22M106 52h22"
            stroke={stroke}
            opacity="0.6"
            strokeLinecap="round"
            strokeDasharray="4 4"
          />
        </g>
      );

    // Desktop: a download stream with progress bars.
    case 'desktop':
      return (
        <g fill="none" strokeWidth="1.4">
          <path d="M82 28v34" stroke={stroke} strokeLinecap="round" />
          <path d="M70 52l12 12 12-12" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M52 84h60a6 6 0 006-6v-6H46v6a6 6 0 006 6z" stroke={faint} />
          <path d="M26 40h16M26 52h12M26 64h16M140 40h16M144 52h12M140 64h16" stroke={faint} strokeLinecap="round" />
        </g>
      );
  }
}

export function ProjectVisual({
  slug,
  category,
  accent,
  className = '',
}: {
  slug: string;
  category: CategoryId;
  accent: Accent;
  className?: string;
}) {
  const hex = ACCENT_HEX[accent];
  const id = gradientId(slug);

  return (
    <svg
      viewBox="0 0 192 116"
      role="presentation"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={hex} stopOpacity="0.22" />
          <stop offset="55%" stopColor={hex} stopOpacity="0.06" />
          <stop offset="100%" stopColor="#0a1120" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect width="192" height="116" fill={`url(#${id})`} />
      <Motif category={category} accent={hex} />
    </svg>
  );
}
