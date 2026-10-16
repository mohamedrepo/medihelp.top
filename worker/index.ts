import { Hono } from 'hono';
import {
  MIN_FILL_TIME_MS,
  type ContactErrorResponse,
  type ContactField,
  type ContactSuccessResponse,
} from '../src/lib/contact-limits';
import { contactSchema } from '../src/lib/contact-schema';

/**
 * Cloudflare Worker.
 *
 * Responsibilities:
 *   1. `POST /api/contact` — validate and deliver contact submissions.
 *   2. Everything else — serve the prerendered static site through the ASSETS
 *      binding.
 *
 * Security posture:
 *   - The server is the validation authority. Client-side validation is a
 *     convenience only.
 *   - `EMAIL_API_KEY` is read from the Worker environment and never leaves the
 *     server. Nothing secret is ever sent to the browser.
 *   - Cross-origin POSTs are rejected.
 *   - Submissions are rate limited per connection and screened with a honeypot
 *     plus a fill-time check.
 *   - User input is HTML-escaped before it is placed into the notification email,
 *     so a submission cannot inject markup into the recipient's inbox.
 *   - Nothing is persisted. No analytics, no logging of message content.
 */

/**
 * The static-assets binding.
 *
 * Declared structurally rather than as the runtime's global `Fetcher` type, for
 * one practical reason: the Worker's own test imports this module, which pulls it
 * into the client TypeScript program as well. That program is configured with the
 * DOM library and without the workerd globals, so referencing `Fetcher` there
 * would fail. Only `fetch` is ever used, so the narrow contract is also the
 * accurate one.
 */
interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetsBinding;
  /** Recipient of contact notifications. Must be configured. */
  CONTACT_TO_EMAIL?: string;
  /** Verified sender. Must be configured. */
  CONTACT_FROM_EMAIL?: string;
  /** `resend` or `knock`. Defaults to `resend`. */
  EMAIL_PROVIDER?: string;
  /** Provider API key. Must be configured. Set as a secret, never in code. */
  EMAIL_API_KEY?: string;
  /** Optional Knock workflow slug when EMAIL_PROVIDER=knock. */
  KNOCK_WORKFLOW?: string;
  /** Canonical origin, used for the cross-origin check. */
  APP_ORIGIN?: string;
}

/* ------------------------------------------------------------------ *
 * Rate limiting
 *
 * In-memory, per isolate. Cloudflare runs many isolates and recycles them, so
 * this is a best-effort speed bump rather than a global guarantee: a determined
 * attacker spreading requests across isolates gets more attempts than the limit
 * suggests. It is deliberately NOT presented as a hard guarantee.
 * For a hard limit, bind Cloudflare's Rate Limiting product and check it here.
 * ------------------------------------------------------------------ */

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_TRACKED_CLIENTS = 5000;

const hits = new Map<string, number[]>();

function checkRateLimit(key: string, now: number): { allowed: boolean; retryAfterSeconds: number } {
  const recent = (hits.get(key) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    const oldest = recent[0] ?? now;
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000),
    );
    hits.set(key, recent);
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(key, recent);

  // Bounded growth: drop the oldest entry when the map gets large.
  if (hits.size > MAX_TRACKED_CLIENTS) {
    const firstKey = hits.keys().next().value;
    if (firstKey !== undefined) hits.delete(firstKey);
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/* ------------------------------------------------------------------ *
 * Email delivery
 * ------------------------------------------------------------------ */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

interface Submission {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  locale: 'en' | 'ar';
}

function buildNotification(submission: Submission): { subject: string; text: string; html: string } {
  const subject = `[Website enquiry] ${submission.subject}`;

  const text = [
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    submission.company ? `Company: ${submission.company}` : null,
    `Locale: ${submission.locale}`,
    '',
    submission.message,
  ]
    .filter((line): line is string => line !== null)
    .join('\n');

  const rows: [string, string][] = [
    ['Name', submission.name],
    ['Email', submission.email],
    ...(submission.company ? ([['Company', submission.company]] as [string, string][]) : []),
    ['Language', submission.locale === 'ar' ? 'Arabic' : 'English'],
  ];

  const html = `<h2>Website enquiry</h2>
<table cellpadding="6" style="border-collapse:collapse">
${rows
  .map(
    ([label, value]) =>
      `<tr><th align="left" style="border-bottom:1px solid #ddd">${escapeHtml(label)}</th><td style="border-bottom:1px solid #ddd">${escapeHtml(value)}</td></tr>`,
  )
  .join('\n')}
</table>
<p style="white-space:pre-wrap;margin-top:16px">${escapeHtml(submission.message)}</p>`;

  return { subject, text, html };
}

type DeliveryOutcome =
  | { ok: true }
  | { ok: false; reason: 'not_configured' | 'delivery_failed' };

async function deliver(env: Env, submission: Submission): Promise<DeliveryOutcome> {
  const to = env.CONTACT_TO_EMAIL?.trim();
  const from = env.CONTACT_FROM_EMAIL?.trim();
  const apiKey = env.EMAIL_API_KEY?.trim();

  // Without a recipient, a verified sender and an API key there is no way to
  // deliver. Report that honestly instead of pretending the message was sent.
  if (!to || !from || !apiKey) {
    return { ok: false, reason: 'not_configured' };
  }

  const { subject, text, html } = buildNotification(submission);
  const provider = (env.EMAIL_PROVIDER ?? 'resend').toLowerCase();

  try {
    if (provider === 'knock') {
      // Knock is a notification orchestrator: the email itself is delivered by a
      // provider connected in the Knock dashboard, selected by workflow slug.
      const workflow = env.KNOCK_WORKFLOW?.trim();
      if (!workflow) return { ok: false, reason: 'not_configured' };

      const response = await fetch(
        `https://api.knock.app/v1/workflows/${encodeURIComponent(workflow)}/trigger`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipients: [{ id: 'medihelp-owner', email: to }],
            data: { ...submission, notificationSubject: subject, notificationHtml: html },
          }),
        },
      );
      return response.ok ? { ok: true } : { ok: false, reason: 'delivery_failed' };
    }

    // Default: a direct transactional email API.
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        // Reply-To is the submitter, so the owner can reply directly.
        reply_to: submission.email,
        subject,
        text,
        html,
      }),
    });

    return response.ok ? { ok: true } : { ok: false, reason: 'delivery_failed' };
  } catch {
    // Network failure talking to the provider: nothing was delivered.
    return { ok: false, reason: 'delivery_failed' };
  }
}

/* ------------------------------------------------------------------ *
 * App
 * ------------------------------------------------------------------ */

const app = new Hono<{ Bindings: Env }>();

function failure(
  status: 400 | 403 | 429 | 500 | 502 | 503,
  body: ContactErrorResponse,
  headers: Record<string, string> = {},
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  });
}

app.post('/api/contact', async (context) => {
  const env = context.env;
  const request = context.req.raw;

  // ---- cross-origin rejection -------------------------------------------------
  // A same-origin browser POST always sends Origin. If it is present and belongs
  // to someone else, refuse: this stops other sites driving the form.
  const origin = request.headers.get('Origin');
  const requestUrl = new URL(request.url);
  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host;
    } catch {
      return failure(403, { ok: false, error: 'validation' });
    }
    const allowed = new Set([requestUrl.host, env.APP_ORIGIN ? new URL(env.APP_ORIGIN).host : '']);
    if (!allowed.has(originHost)) {
      return failure(403, { ok: false, error: 'validation' });
    }
  }

  // ---- rate limit -------------------------------------------------------------
  const clientKey = request.headers.get('CF-Connecting-IP') ?? 'unknown';
  const now = Date.now();
  const limit = checkRateLimit(clientKey, now);
  if (!limit.allowed) {
    return failure(
      429,
      { ok: false, error: 'rate_limited', retryAfterSeconds: limit.retryAfterSeconds },
      { 'Retry-After': String(limit.retryAfterSeconds) },
    );
  }

  // ---- parse ------------------------------------------------------------------
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return failure(400, { ok: false, error: 'validation' });
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return failure(400, {
      ok: false,
      error: 'validation',
    });
  }

  const input = parsed.data;

  // ---- spam screening ---------------------------------------------------------
  // Both signals produce an explicit validation failure rather than a fake
  // success, so no legitimate sender is ever told their message was delivered
  // when it was not.
  const spamSignals: string[] = [];
  if (input.honeypot.length > 0) spamSignals.push('honeypot');
  if (input.elapsedMs < MIN_FILL_TIME_MS) spamSignals.push('too_fast');

  if (spamSignals.length > 0) {
    const fields: ContactField[] = [];
    return failure(400, { ok: false, error: 'validation', fields });
  }

  // ---- deliver ----------------------------------------------------------------
  const outcome = await deliver(env, {
    name: input.name,
    email: input.email,
    company: input.company,
    subject: input.subject,
    message: input.message,
    locale: input.locale,
  });

  if (!outcome.ok) {
    // No PII in the log line — just which failure occurred.
    console.warn(`contact: delivery outcome=${outcome.reason}`);
    return failure(outcome.reason === 'not_configured' ? 503 : 502, {
      ok: false,
      error: outcome.reason === 'not_configured' ? 'not_configured' : 'delivery_failed',
    });
  }

  const success: ContactSuccessResponse = { ok: true };
  return new Response(JSON.stringify(success), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
});

// Anything else under /api is a 404 rather than falling through to the site.
app.all('/api/*', () =>
  new Response(JSON.stringify({ ok: false, error: 'validation' } satisfies ContactErrorResponse), {
    status: 404,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  }),
);

// Static assets for every other path.
app.all('*', (context) => context.env.ASSETS.fetch(context.req.raw));

export default app;
