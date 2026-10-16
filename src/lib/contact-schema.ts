import { z } from 'zod';
import { CONTACT_LIMITS, EMAIL_PATTERN } from './contact-limits';

/**
 * Contact form validation schema — SERVER SIDE.
 *
 * This module imports Zod, so it must never be reachable from a client bundle.
 * The browser imports the dependency-free constants and types from
 * `contact-limits.ts` instead, and the Worker imports the schema from here.
 * Types are re-exported for convenience because `import type` is erased at build
 * time and therefore does not pull Zod in.
 */

export * from './contact-limits';

/**
 * The form contract.
 *
 * The Worker is the authority: client-side validation is a convenience that
 * improves the experience, never a security boundary. Both sides share these
 * limits so the two can never drift apart.
 *
 * Deliberately collected: name, email, optional company, subject, message.
 * Deliberately NOT collected: phone numbers, addresses, attachments, or anything
 * else not needed to reply.
 */
export const contactSchema = z.object({
  name: z.string().trim().min(1).max(CONTACT_LIMITS.name),
  email: z.string().trim().min(1).max(CONTACT_LIMITS.email).regex(EMAIL_PATTERN),
  company: z.string().trim().max(CONTACT_LIMITS.company).default(''),
  subject: z.string().trim().min(1).max(CONTACT_LIMITS.subject),
  message: z.string().trim().min(CONTACT_LIMITS.messageMin).max(CONTACT_LIMITS.messageMax),
  /**
   * Honeypot. Rendered off-screen, hidden from assistive technology and removed
   * from the tab order, so only automated submissions fill it. Must be empty.
   *
   * The field deliberately does NOT use an autofill-friendly name such as
   * `website` or `url`: browsers and password managers happily fill those, and a
   * false positive here would silently discard a real customer's message.
   */
  honeypot: z.string().max(0).default(''),
  /**
   * Milliseconds since the form was rendered. A submission that arrives faster
   * than a human could plausibly fill five fields is rejected.
   */
  elapsedMs: z.number().int().nonnegative(),
  locale: z.enum(['en', 'ar']),
});

export type ContactInput = z.infer<typeof contactSchema>;
