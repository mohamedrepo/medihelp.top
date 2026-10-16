import type { Dictionary } from '../i18n';
// Imported from the dependency-free module on purpose: importing this from
// `contact-schema` would pull Zod into the browser bundle.
import { CONTACT_LIMITS, EMAIL_PATTERN, type ContactField } from './contact-limits';

/**
 * Client-side field validation.
 *
 * Returns translated messages keyed by field so the form can render errors in the
 * active language, including a language other than the one the page was first
 * loaded in. The Worker re-validates independently — this function is purely for
 * fast, friendly feedback.
 */

export type FieldErrors = Partial<Record<ContactField, string>>;

export interface ContactFormValues {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
}

export function validateContactForm(
  values: ContactFormValues,
  dictionary: Dictionary,
): FieldErrors {
  const messages = dictionary.contact.validation;
  const errors: FieldErrors = {};

  const name = values.name.trim();
  if (!name) errors.name = messages.nameRequired;
  else if (name.length > CONTACT_LIMITS.name) errors.name = messages.nameTooLong;

  const email = values.email.trim();
  if (!email) errors.email = messages.emailRequired;
  else if (email.length > CONTACT_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    errors.email = messages.emailInvalid;
  }

  if (values.company.trim().length > CONTACT_LIMITS.company) {
    errors.company = messages.companyTooLong;
  }

  const subject = values.subject.trim();
  if (!subject) errors.subject = messages.subjectRequired;
  else if (subject.length > CONTACT_LIMITS.subject) errors.subject = messages.subjectTooLong;

  const message = values.message.trim();
  if (!message) errors.message = messages.messageRequired;
  else if (message.length < CONTACT_LIMITS.messageMin) errors.message = messages.messageTooShort;
  else if (message.length > CONTACT_LIMITS.messageMax) errors.message = messages.messageTooLong;

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}
