/**
 * Contact form constants and wire types — deliberately dependency-free.
 *
 * This module exists for one reason: the browser must be able to share the form's
 * limits, field names and response types WITHOUT pulling a validation library
 * into the client bundle. The Zod schema lives in `contact-schema.ts`, which
 * imports from here; nothing here imports Zod.
 *
 * (Before this split, the client bundle included Zod — 431 references — purely
 * because the page imported a single length constant.)
 */

export const CONTACT_LIMITS = {
  name: 120,
  email: 254,
  company: 160,
  subject: 160,
  messageMin: 20,
  messageMax: 5000,
} as const;

/**
 * Practical email pattern.
 *
 * Intentionally conservative: it rejects obviously malformed input without
 * pretending to implement RFC 5322. The real check is whether the reply address
 * works, and over-strict validation is a worse failure than under-strict.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/** Fields that map to a translated error message on the client. */
export const CONTACT_FIELDS = ['name', 'email', 'company', 'subject', 'message'] as const;

export type ContactField = (typeof CONTACT_FIELDS)[number];

export const CONTACT_ERROR_CODES = [
  'validation',
  'rate_limited',
  'not_configured',
  'delivery_failed',
] as const;

export type ContactErrorCode = (typeof CONTACT_ERROR_CODES)[number];

export interface ContactSuccessResponse {
  ok: true;
}

export interface ContactErrorResponse {
  ok: false;
  error: ContactErrorCode;
  /** Which fields failed, so the client can mark them without leaking detail. */
  fields?: ContactField[];
  /** Seconds until a rate-limited client may retry. */
  retryAfterSeconds?: number;
}

export type ContactResponse = ContactSuccessResponse | ContactErrorResponse;

/**
 * Minimum plausible fill time.
 *
 * Set deliberately low (rather than at a realistic ~20 seconds) so that a fast
 * human pasting a prepared message is never rejected. The check exists to stop
 * bulk automated submissions, not to police typing speed — blocking a real
 * enquiry is a far worse outcome than letting some spam through.
 */
export const MIN_FILL_TIME_MS = 1200;
