import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Globe, Info, Send } from 'lucide-react';
import { getDictionary, type Dictionary } from '../i18n';
import { useRouter } from '../router-context';
import {
  hasErrors,
  validateContactForm,
  type ContactFormValues,
  type FieldErrors,
} from '../lib/contact-validation';
import type { ContactErrorCode, ContactField } from '../lib/contact-limits';
import { submitContact } from '../lib/contact-submit';
import { GithubMark } from '../components/icons';
import { Card, Container, Eyebrow, Ltr, Section, SectionHeading } from '../components/primitives';
import { Reveal } from '../components/Reveal';

const EMPTY_VALUES: ContactFormValues = {
  name: '',
  email: '',
  company: '',
  subject: '',
  message: '',
};

type SubmitErrorCode = ContactErrorCode | 'network';

type SubmitState =
  | { status: 'idle' }
  | { status: 'submitting' }
  | { status: 'success' }
  | { status: 'error'; code: SubmitErrorCode };

/** Map a returned failure code onto the translated message for it. */
function errorMessage(code: SubmitErrorCode, dictionary: Dictionary): string {
  switch (code) {
    case 'validation':
      return dictionary.contact.form.errorValidation;
    case 'rate_limited':
      return dictionary.contact.form.errorRateLimited;
    case 'not_configured':
      return dictionary.contact.form.errorNotConfigured;
    case 'delivery_failed':
    case 'network':
      // Something went wrong and nothing was sent. Saying so plainly is the
      // only honest option — a false success message would be worse than an error.
      return dictionary.contact.form.errorGeneric;
  }
}

/** The localised "this field is required" message for a server-reported field. */
function requiredMessageFor(field: ContactField, dictionary: Dictionary): string {
  const messages = dictionary.contact.validation;
  switch (field) {
    case 'name':
      return messages.nameRequired;
    case 'email':
      return messages.emailRequired;
    case 'subject':
      return messages.subjectRequired;
    case 'message':
      return messages.messageRequired;
    case 'company':
      return messages.companyTooLong;
  }
}

export function ContactPage() {
  const { locale } = useRouter();
  const dictionary = getDictionary(locale);

  const fieldIds = {
    name: useId(),
    email: useId(),
    company: useId(),
    subject: useId(),
    message: useId(),
    website: useId(),
  };

  const [values, setValues] = useState<ContactFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>({ status: 'idle' });

  // Used for the timing check. Set on the client only, so the prerendered markup
  // and the hydrated markup agree.
  const renderedAt = useRef<number>(0);
  useEffect(() => {
    renderedAt.current = Date.now();
  }, []);

  const update = (field: keyof ContactFormValues, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitState.status === 'submitting') return;

    const form = event.currentTarget;
    const honeypot = (form.elements.namedItem('confirm_ref') as HTMLInputElement | null)?.value ?? '';

    const localErrors = validateContactForm(values, dictionary);
    if (hasErrors(localErrors)) {
      setErrors(localErrors);
      setSubmitState({ status: 'idle' });
      // Move focus to the first invalid control so keyboard and screen-reader
      // users are taken straight to the problem.
      const firstField = (Object.keys(localErrors) as ContactField[])[0];
      if (firstField) document.getElementById(fieldIds[firstField])?.focus();
      return;
    }

    setErrors({});
    setSubmitState({ status: 'submitting' });

    const outcome = await submitContact({
      values,
      honeypot,
      startedAt: renderedAt.current > 0 ? renderedAt.current : null,
      locale,
    });

    if (outcome.ok) {
      // Only ever reached after the Worker confirmed real delivery.
      setSubmitState({ status: 'success' });
      setValues(EMPTY_VALUES);
      return;
    }

    // Re-attach server-reported field errors to the form using local messages,
    // so the Worker never has to return user-facing prose.
    if (outcome.fields.length > 0) {
      const serverErrors: FieldErrors = {};
      for (const field of outcome.fields) {
        serverErrors[field] = requiredMessageFor(field, dictionary);
      }
      setErrors(serverErrors);
    }

    setSubmitState({ status: 'error', code: outcome.code });
  };

  const sending = submitState.status === 'submitting';

  return (
    <Section className="pt-12 sm:pt-16">
      <Container>
        <div className="max-w-3xl">
          <Eyebrow>{dictionary.brand.name}</Eyebrow>
          <h1 className="text-3xl font-extrabold tracking-tight text-mist-50 sm:text-4xl lg:text-5xl">
            {dictionary.contact.heading}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-mist-400 sm:text-lg">
            {dictionary.contact.lede}
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          {/* ------------------------------ form ------------------------------ */}
          <Card className="p-6 sm:p-8">
            <h2 className="text-lg font-bold text-mist-50">{dictionary.contact.form.heading}</h2>

            {submitState.status === 'success' ? (
              <div
                role="status"
                aria-live="polite"
                className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-400/8 p-5"
              >
                <p className="flex items-center gap-2 text-base font-bold text-emerald-200">
                  <CheckCircle2 aria-hidden="true" className="size-5 shrink-0" />
                  {dictionary.contact.form.successHeading}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/90">
                  {dictionary.contact.form.successBody}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitState({ status: 'idle' })}
                  className="btn btn-secondary mt-5"
                >
                  {dictionary.contact.form.sendAnother}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-5">
                {submitState.status === 'error' ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-400/30 bg-red-400/8 p-4"
                  >
                    <p className="flex items-center gap-2 text-sm font-bold text-red-200">
                      <AlertTriangle aria-hidden="true" className="size-4 shrink-0" />
                      {dictionary.contact.form.errorHeading}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-red-100/90">
                      {errorMessage(submitState.code, dictionary)}
                    </p>
                  </div>
                ) : null}

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id={fieldIds.name}
                    label={dictionary.contact.form.name}
                    requiredLabel={dictionary.contact.form.required}
                    error={errors.name}
                    value={values.name}
                    onChange={(value) => update('name', value)}
                    placeholder={dictionary.contact.form.namePlaceholder}
                    autoComplete="name"
                    disabled={sending}
                  />
                  <Field
                    id={fieldIds.email}
                    label={dictionary.contact.form.email}
                    requiredLabel={dictionary.contact.form.required}
                    error={errors.email}
                    value={values.email}
                    onChange={(value) => update('email', value)}
                    placeholder={dictionary.contact.form.emailPlaceholder}
                    type="email"
                    autoComplete="email"
                    disabled={sending}
                    dir="ltr"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id={fieldIds.company}
                    label={dictionary.contact.form.company}
                    optionalLabel={dictionary.contact.form.optional}
                    error={errors.company}
                    value={values.company}
                    onChange={(value) => update('company', value)}
                    placeholder={dictionary.contact.form.companyPlaceholder}
                    autoComplete="organization"
                    disabled={sending}
                  />
                  <Field
                    id={fieldIds.subject}
                    label={dictionary.contact.form.subject}
                    requiredLabel={dictionary.contact.form.required}
                    error={errors.subject}
                    value={values.subject}
                    onChange={(value) => update('subject', value)}
                    placeholder={dictionary.contact.form.subjectPlaceholder}
                    disabled={sending}
                  />
                </div>

                <div>
                  <label htmlFor={fieldIds.message} className="field-label">
                    {dictionary.contact.form.message}
                    <span className="ms-2 text-xs font-normal text-mist-500">
                      ({dictionary.contact.form.required})
                    </span>
                  </label>
                  <textarea
                    id={fieldIds.message}
                    name="message"
                    rows={7}
                    value={values.message}
                    onChange={(event) => update('message', event.target.value)}
                    placeholder={dictionary.contact.form.messagePlaceholder}
                    disabled={sending}
                    aria-invalid={errors.message ? 'true' : undefined}
                    aria-describedby={errors.message ? `${fieldIds.message}-error` : undefined}
                    className="field-input resize-y"
                  />
                  {errors.message ? (
                    <p id={`${fieldIds.message}-error`} className="field-error">
                      {errors.message}
                    </p>
                  ) : null}
                </div>

                {/*
                  Honeypot.

                  Off-screen rather than `display: none` (some bots skip hidden
                  inputs), hidden from assistive technology, and removed from the
                  tab order so a keyboard user cannot reach it.

                  The field name is deliberately NOT autofill-friendly. Names such
                  as `website`, `url` or `company` get filled by browsers and
                  password managers, and a false positive here would silently
                  discard a real customer's message.
                */}
                <div
                  aria-hidden="true"
                  style={{ position: 'absolute', insetInlineStart: '-9999px', opacity: 0 }}
                >
                  <label htmlFor={fieldIds.website}>{dictionary.contact.form.honeypotLabel}</label>
                  <input
                    id={fieldIds.website}
                    name="confirm_ref"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    defaultValue=""
                  />
                </div>

                <p className="flex items-start gap-2 text-xs leading-relaxed text-mist-500">
                  <Info aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                  <span>{dictionary.contact.form.privacyNote}</span>
                </p>

                <div>
                  <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={sending}>
                    <Send aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                    {sending ? dictionary.contact.form.submitting : dictionary.contact.form.submit}
                  </button>
                </div>
              </form>
            )}
          </Card>

          {/* ------------------------------ channels ------------------------------ */}
          <div className="flex flex-col gap-6">
            <Reveal>
              <Card className="p-6">
                <h2 className="text-base font-bold text-mist-50">
                  {dictionary.contact.channels.heading}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-mist-500">
                  {dictionary.contact.channels.lede}
                </p>

                <ul className="mt-5 flex flex-col gap-4">
                  <li>
                    <span className="flex items-center gap-2 text-sm font-semibold text-mist-200">
                      <GithubMark className="size-4 shrink-0" />
                      {dictionary.contact.channels.github}
                    </span>
                    <a
                      href="https://github.com/mohamedrepo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block text-sm text-accent-400 underline decoration-accent-400/40 underline-offset-4 transition-colors hover:text-accent-300"
                    >
                      <Ltr>github.com/mohamedrepo</Ltr>
                    </a>
                  </li>
                  <li>
                    <span className="flex items-center gap-2 text-sm font-semibold text-mist-200">
                      <Globe aria-hidden="true" className="size-4 shrink-0" />
                      {dictionary.contact.channels.website}
                    </span>
                    <span className="mt-1 block text-sm text-mist-400">
                      <Ltr>www.medihelp.top</Ltr>
                    </span>
                  </li>
                  <li>
                    <span className="text-sm font-semibold text-mist-200">
                      {dictionary.contact.channels.location}
                    </span>
                    <span className="mt-1 block text-sm text-mist-400">
                      {dictionary.contact.channels.locationValue}
                    </span>
                  </li>
                </ul>

                <p className="mt-5 border-t border-mist-400/10 pt-5 text-xs leading-relaxed text-mist-500">
                  {dictionary.contact.channels.noEmail}
                </p>
                <p className="mt-3 text-xs text-mist-500">
                  {dictionary.contact.channels.responseNote}
                </p>
              </Card>
            </Reveal>

            <Reveal delay={60}>
              <Card className="p-6">
                <SectionHeading title={dictionary.contact.alternatives.heading} />
                <ul className="mt-5 flex flex-col gap-4">
                  {dictionary.contact.alternatives.items.map((item) => (
                    <li key={item} className="text-sm leading-relaxed text-mist-400">
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------------ */

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  requiredLabel?: string;
  optionalLabel?: string;
  type?: 'text' | 'email';
  autoComplete?: string;
  disabled?: boolean;
  /** Force LTR for machine-readable values such as email addresses. */
  dir?: 'ltr';
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  requiredLabel,
  optionalLabel,
  type = 'text',
  autoComplete,
  disabled,
  dir,
}: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}
        {requiredLabel ? (
          <span className="ms-2 text-xs font-normal text-mist-500">({requiredLabel})</span>
        ) : null}
        {optionalLabel ? (
          <span className="ms-2 text-xs font-normal text-mist-500">({optionalLabel})</span>
        ) : null}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        dir={dir}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        // Email addresses and similar machine values must stay LTR and
        // start-aligned even when the interface is Arabic.
        className={`field-input${dir === 'ltr' ? ' field-input-ltr' : ''}`}
      />
      {error ? (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
