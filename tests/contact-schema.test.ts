import { describe, expect, it } from 'vitest';
import {
  CONTACT_LIMITS,
  MIN_FILL_TIME_MS,
  contactSchema,
} from '../src/lib/contact-schema';
import { hasErrors, validateContactForm } from '../src/lib/contact-validation';
import { ar } from '../src/i18n/ar';
import { en } from '../src/i18n/en';

const valid = {
  name: 'Amina Hassan',
  email: 'amina@example.com',
  company: 'Example Logistics',
  subject: 'Fleet reporting',
  message: 'We produce a monthly fuel reconciliation by hand and it takes two days.',
  honeypot: '',
  elapsedMs: 8000,
  locale: 'en' as const,
};

describe('contactSchema', () => {
  it('accepts a complete submission', () => {
    const result = contactSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('trims surrounding whitespace', () => {
    const result = contactSchema.safeParse({ ...valid, name: '  Amina  ' });
    expect(result.success && result.data.name).toBe('Amina');
  });

  it('defaults the optional company and honeypot', () => {
    const result = contactSchema.safeParse({
      name: valid.name,
      email: valid.email,
      subject: valid.subject,
      message: valid.message,
      elapsedMs: valid.elapsedMs,
      locale: valid.locale,
    });
    expect(result.success && result.data.company).toBe('');
    expect(result.success && result.data.honeypot).toBe('');
  });

  it('rejects a missing or malformed email', () => {
    for (const email of ['', '   ', 'not-an-email', 'a@b', 'a@.com', 'a b@example.com']) {
      expect(contactSchema.safeParse({ ...valid, email }).success, email).toBe(false);
    }
  });

  it('accepts realistic addresses', () => {
    for (const email of ['a@b.co', 'first.last+tag@sub.example.org', 'x_y-z@example.com']) {
      expect(contactSchema.safeParse({ ...valid, email }).success, email).toBe(true);
    }
  });

  it('enforces the message bounds', () => {
    expect(contactSchema.safeParse({ ...valid, message: 'too short' }).success).toBe(false);
    expect(
      contactSchema.safeParse({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.messageMax + 1) })
        .success,
    ).toBe(false);
    expect(
      contactSchema.safeParse({ ...valid, message: 'x'.repeat(CONTACT_LIMITS.messageMin) }).success,
    ).toBe(true);
  });

  it('enforces the name and subject bounds', () => {
    expect(contactSchema.safeParse({ ...valid, name: '' }).success).toBe(false);
    expect(
      contactSchema.safeParse({ ...valid, name: 'x'.repeat(CONTACT_LIMITS.name + 1) }).success,
    ).toBe(false);
    expect(contactSchema.safeParse({ ...valid, subject: '   ' }).success).toBe(false);
    expect(
      contactSchema.safeParse({ ...valid, subject: 'x'.repeat(CONTACT_LIMITS.subject + 1) }).success,
    ).toBe(false);
  });

  it('rejects a filled honeypot', () => {
    expect(contactSchema.safeParse({ ...valid, honeypot: 'spam' }).success).toBe(false);
  });

  it('requires a non-negative elapsed time', () => {
    expect(contactSchema.safeParse({ ...valid, elapsedMs: -1 }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, elapsedMs: 0 }).success).toBe(true);
  });

  it('only accepts the two supported locales', () => {
    expect(contactSchema.safeParse({ ...valid, locale: 'ar' }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, locale: 'fr' }).success).toBe(false);
  });

  it('uses a fill-time threshold that cannot reject a fast human', () => {
    // Guards against a future change tightening this into a false-positive source.
    expect(MIN_FILL_TIME_MS).toBeLessThanOrEqual(1500);
    expect(MIN_FILL_TIME_MS).toBeGreaterThan(200);
  });
});

describe('validateContactForm', () => {
  it('returns no errors for a complete form', () => {
    expect(hasErrors(validateContactForm(valid, en))).toBe(false);
    expect(hasErrors(validateContactForm(valid, ar))).toBe(false);
  });

  it('returns translated messages in English', () => {
    const errors = validateContactForm({ ...valid, name: '', message: 'short' }, en);
    expect(errors.name).toBe(en.contact.validation.nameRequired);
    expect(errors.message).toBe(en.contact.validation.messageTooShort);
  });

  it('returns translated messages in Arabic', () => {
    const errors = validateContactForm({ ...valid, email: 'bad' }, ar);
    expect(errors.email).toBe(ar.contact.validation.emailInvalid);
    expect(/[\u0600-\u06FF]/.test(errors.email ?? '')).toBe(true);
  });

  it('flags every invalid field at once rather than one at a time', () => {
    const errors = validateContactForm(
      { name: '', email: 'nope', company: 'x'.repeat(200), subject: '', message: '' },
      en,
    );
    expect(Object.keys(errors).sort()).toEqual(['company', 'email', 'message', 'name', 'subject']);
  });

  it('treats an omitted company as valid', () => {
    expect(validateContactForm({ ...valid, company: '' }, en).company).toBeUndefined();
  });
});
