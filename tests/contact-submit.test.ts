import { describe, expect, it, vi } from 'vitest';
import { submitContact } from '../src/lib/contact-submit';

const values = {
  name: 'Amina Hassan',
  email: 'amina@example.com',
  company: 'Example Logistics',
  subject: 'Fleet reporting',
  message: 'We produce a monthly fuel reconciliation by hand and it takes two days.',
};

function responder(body: unknown, status = 200) {
  return vi.fn(async () => new Response(JSON.stringify(body), { status }));
}

describe('submitContact', () => {
  it('reports success only when the server confirms delivery', async () => {
    const fetchImpl = responder({ ok: true }) as unknown as typeof fetch;
    const outcome = await submitContact({
      values,
      honeypot: '',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome).toEqual({ ok: true });
  });

  it('posts to the contact endpoint with the expected payload', async () => {
    const fetchImpl = responder({ ok: true }) as unknown as typeof fetch;
    const startedAt = Date.now() - 4000;

    await submitContact({ values, honeypot: '', startedAt, locale: 'ar', fetchImpl });

    const call = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(call[0]).toBe('/api/contact');
    expect(call[1].method).toBe('POST');

    const payload = JSON.parse(String(call[1].body));
    expect(payload.subject).toBe('Fleet reporting');
    expect(payload.locale).toBe('ar');
    expect(payload.honeypot).toBe('');
    // Elapsed time must be measured from the render timestamp, not hard-coded.
    expect(payload.elapsedMs).toBeGreaterThanOrEqual(3900);
    expect(payload.elapsedMs).toBeLessThan(15000);
  });

  it('sends zero elapsed time when the render timestamp is unknown', async () => {
    const fetchImpl = responder({ ok: true }) as unknown as typeof fetch;
    await submitContact({ values, honeypot: '', startedAt: null, locale: 'en', fetchImpl });

    const call = (fetchImpl as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
      string,
      RequestInit,
    ];
    expect(JSON.parse(String(call[1].body)).elapsedMs).toBe(0);
  });

  it('passes the honeypot value through for the server to reject', async () => {
    const fetchImpl = responder({ ok: false, error: 'validation' }, 400) as unknown as typeof fetch;
    const outcome = await submitContact({
      values,
      honeypot: 'filled-by-a-bot',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome).toEqual({ ok: false, code: 'validation', fields: [] });
  });

  it.each([
    ['not_configured', 503],
    ['delivery_failed', 502],
    ['rate_limited', 429],
    ['validation', 400],
  ] as const)('maps a %s failure to an error outcome', async (error, status) => {
    const fetchImpl = responder({ ok: false, error }, status) as unknown as typeof fetch;
    const outcome = await submitContact({
      values,
      honeypot: '',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome.ok).toBe(false);
    expect(outcome.ok === false && outcome.code).toBe(error);
  });

  it('carries server-reported fields back to the form', async () => {
    const fetchImpl = responder(
      { ok: false, error: 'validation', fields: ['email'] },
      400,
    ) as unknown as typeof fetch;
    const outcome = await submitContact({
      values,
      honeypot: '',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome.ok === false && outcome.fields).toEqual(['email']);
  });

  it('treats a network failure as a failure, never a success', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;

    const outcome = await submitContact({
      values,
      honeypot: '',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome).toEqual({ ok: false, code: 'network', fields: [] });
  });

  it('treats an unparseable response as a failure', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('<html>gateway error</html>', { status: 502 }),
    ) as unknown as typeof fetch;

    const outcome = await submitContact({
      values,
      honeypot: '',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome).toEqual({ ok: false, code: 'network', fields: [] });
  });

  it('treats an unexpected success-shaped body as a failure', async () => {
    const fetchImpl = responder({ something: 'else' }) as unknown as typeof fetch;
    const outcome = await submitContact({
      values,
      honeypot: '',
      startedAt: Date.now() - 5000,
      locale: 'en',
      fetchImpl,
    });
    expect(outcome.ok).toBe(false);
  });
});
