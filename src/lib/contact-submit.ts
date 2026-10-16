import type { Locale } from '../i18n/types';
import type { ContactErrorCode, ContactField, ContactResponse } from './contact-limits';
import type { ContactFormValues } from './contact-validation';

/**
 * Contact transport.
 *
 * Extracted from the page component so the submission can be unit tested without
 * a DOM, and so the form component stays concerned only with presentation and
 * state transitions.
 *
 * The outcome is deliberately a discriminated result rather than a thrown error:
 * every failure mode has to be shown to the visitor, because the one thing this
 * form must never do is claim a message was delivered when it was not.
 */

export type SubmitOutcome =
  | { ok: true }
  | { ok: false; code: ContactErrorCode | 'network'; fields: ContactField[] };

export interface SubmitArgs {
  values: ContactFormValues;
  /** Honeypot value; must be empty for a genuine submission. */
  honeypot: string;
  /** Timestamp captured when the form was rendered, or null if unknown. */
  startedAt: number | null;
  locale: Locale;
  endpoint?: string;
  fetchImpl?: typeof fetch;
}

export async function submitContact({
  values,
  honeypot,
  startedAt,
  locale,
  endpoint = '/api/contact',
  fetchImpl,
}: SubmitArgs): Promise<SubmitOutcome> {
  // Reading the clock here is correct: this function runs from a submit handler,
  // never during render. The elapsed time is the anti-automation signal the
  // Worker checks, so it has to be measured at the moment of submission.
  const elapsedMs = startedAt === null ? 0 : Math.max(0, Date.now() - startedAt);

  const send = fetchImpl ?? fetch;

  try {
    const response = await send(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        honeypot,
        elapsedMs,
        locale,
      }),
    });

    const payload = (await response.json().catch(() => null)) as ContactResponse | null;

    if (payload?.ok) return { ok: true };

    if (payload && payload.ok === false) {
      return { ok: false, code: payload.error, fields: payload.fields ?? [] };
    }

    // A response we cannot interpret is a failure, not a success.
    return { ok: false, code: 'network', fields: [] };
  } catch {
    // Network failure, CORS rejection, or an aborted request: nothing arrived.
    return { ok: false, code: 'network', fields: [] };
  }
}
