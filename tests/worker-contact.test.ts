import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import worker from '../worker/index';

/**
 * Worker endpoint tests.
 *
 * `fetch` is stubbed so no email is ever actually sent. The rate limiter is
 * keyed on `CF-Connecting-IP`, so each test uses its own address to stay
 * independent of module-level state.
 */

const ASSET_BODY = 'static asset';

function makeEnv(overrides: Record<string, unknown> = {}) {
  return {
    ASSETS: { fetch: async () => new Response(ASSET_BODY, { status: 200 }) },
    CONTACT_TO_EMAIL: 'owner@example.com',
    CONTACT_FROM_EMAIL: 'website@example.com',
    EMAIL_PROVIDER: 'resend',
    EMAIL_API_KEY: 'test-key',
    APP_ORIGIN: 'https://www.medihelp.top',
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

function submission(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Amina Hassan',
    email: 'amina@example.com',
    company: 'Example Logistics',
    subject: 'Fleet reporting',
    message: 'We produce a monthly fuel reconciliation by hand and it takes two days.',
    honeypot: '',
    elapsedMs: 6000,
    locale: 'en',
    ...overrides,
  };
}

function post(body: unknown, ip: string, init: RequestInit = {}) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'CF-Connecting-IP': ip,
      Origin: 'http://localhost',
      ...(init.headers ?? {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  } satisfies RequestInit;
}

/**
 * `Response.json()` is typed `unknown`, so reading a named field from it is a
 * type error even though the value is known at runtime. This narrows it once so
 * the assertions below stay readable.
 */
async function bodyOf(response: Response): Promise<Record<string, unknown>> {
  return (await response.json()) as Record<string, unknown>;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify({ id: 'ok' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('POST /api/contact — success path', () => {
  it('delivers a valid submission and reports success', async () => {
    const response = await worker.request('/api/contact', post(submission(), '10.0.0.1'), makeEnv());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    const payload = JSON.parse(String(init.body));
    expect(payload.to).toEqual(['owner@example.com']);
    expect(payload.from).toBe('website@example.com');
    // Reply-To must be the submitter, so replying works without copy-paste.
    expect(payload.reply_to).toBe('amina@example.com');
    expect(payload.subject).toContain('Fleet reporting');
    expect(payload.text).toContain('Amina Hassan');
  });

  it('never caches a contact response', async () => {
    const response = await worker.request('/api/contact', post(submission(), '10.0.0.2'), makeEnv());
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });

  it('escapes submitted content so it cannot inject markup into the email', async () => {
    const response = await worker.request(
      '/api/contact',
      post(
        submission({
          message: '<script>alert(1)</script> plus enough text to pass the minimum length.',
          name: 'Bob <b>bold</b>',
        }),
        '10.0.0.3',
      ),
      makeEnv(),
    );

    expect(response.status).toBe(200);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const payload = JSON.parse(String(init.body));

    expect(payload.html).not.toContain('<script>');
    expect(payload.html).toContain('&lt;script&gt;');
    expect(payload.html).not.toContain('<b>bold</b>');
    expect(payload.html).toContain('&lt;b&gt;');
  });
});

describe('POST /api/contact — configuration gaps fail honestly', () => {
  it('returns not_configured when credentials are missing, and sends nothing', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission(), '10.0.1.1'),
      makeEnv({ EMAIL_API_KEY: undefined }),
    );

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ ok: false, error: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('returns not_configured when the recipient is missing', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission(), '10.0.1.2'),
      makeEnv({ CONTACT_TO_EMAIL: '  ' }),
    );
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('reports delivery_failed when the provider rejects the message', async () => {
    fetchMock.mockResolvedValueOnce(new Response('nope', { status: 422 }));
    const response = await worker.request('/api/contact', post(submission(), '10.0.1.3'), makeEnv());

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ ok: false, error: 'delivery_failed' });
  });

  it('reports delivery_failed when the provider is unreachable', async () => {
    fetchMock.mockRejectedValueOnce(new Error('network down'));
    const response = await worker.request('/api/contact', post(submission(), '10.0.1.4'), makeEnv());
    expect(response.status).toBe(502);
  });

  it('requires a Knock workflow slug when Knock is selected', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission(), '10.0.1.5'),
      makeEnv({ EMAIL_PROVIDER: 'knock', KNOCK_WORKFLOW: undefined }),
    );
    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('routes to the Knock API when configured', async () => {
    await worker.request(
      '/api/contact',
      post(submission(), '10.0.1.6'),
      makeEnv({ EMAIL_PROVIDER: 'knock', KNOCK_WORKFLOW: 'contact-form' }),
    );
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toBe('https://api.knock.app/v1/workflows/contact-form/trigger');
  });
});

describe('POST /api/contact — spam and validation', () => {
  it('rejects a filled honeypot without contacting the provider', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission({ honeypot: 'http://spam.example' }), '10.0.2.1'),
      makeEnv(),
    );
    expect(response.status).toBe(400);
    expect((await bodyOf(response)).error).toBe('validation');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a submission filled faster than a human could type', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission({ elapsedMs: 40 }), '10.0.2.2'),
      makeEnv(),
    );
    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects malformed fields', async () => {
    for (const patch of [
      { email: 'not-an-email' },
      { name: '' },
      { subject: '' },
      { message: 'too short' },
      { locale: 'fr' },
    ]) {
      const response = await worker.request(
        '/api/contact',
        post(submission(patch), `10.0.2.${10 + Object.keys(patch).length}`),
        makeEnv(),
      );
      expect(response.status, JSON.stringify(patch)).toBe(400);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a body that is not JSON', async () => {
    const response = await worker.request(
      '/api/contact',
      post('not json at all', '10.0.2.30'),
      makeEnv(),
    );
    expect(response.status).toBe(400);
  });
});

describe('POST /api/contact — origin and abuse controls', () => {
  it('rejects a cross-origin submission', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission(), '10.0.3.1', { headers: { Origin: 'https://evil.example' } }),
      makeEnv(),
    );
    expect(response.status).toBe(403);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('accepts the configured production origin', async () => {
    const response = await worker.request(
      '/api/contact',
      post(submission(), '10.0.3.2', { headers: { Origin: 'https://www.medihelp.top' } }),
      makeEnv(),
    );
    expect(response.status).toBe(200);
  });

  it('rate limits a connection after five submissions', async () => {
    const env = makeEnv();
    const ip = '10.0.4.1';

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await worker.request('/api/contact', post(submission(), ip), env);
      expect(response.status, `attempt ${attempt + 1}`).toBe(200);
    }

    const blocked = await worker.request('/api/contact', post(submission(), ip), env);
    expect(blocked.status).toBe(429);
    const body = await bodyOf(blocked);
    expect(body.error).toBe('rate_limited');
    expect(body.retryAfterSeconds).toBeGreaterThan(0);
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('keeps rate limit buckets independent per connection', async () => {
    const env = makeEnv();
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await worker.request('/api/contact', post(submission(), '10.0.5.1'), env);
    }
    const otherClient = await worker.request('/api/contact', post(submission(), '10.0.5.2'), env);
    expect(otherClient.status).toBe(200);
  });
});

describe('non-API routes', () => {
  it('serves static assets through the ASSETS binding', async () => {
    const response = await worker.request('/en/projects/', undefined, makeEnv());
    expect(response.status).toBe(200);
    expect(await response.text()).toBe(ASSET_BODY);
  });

  it('returns JSON 404 for unknown API paths instead of the site', async () => {
    const response = await worker.request('/api/unknown', { method: 'POST' }, makeEnv());
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ ok: false, error: 'validation' });
  });

  it('returns a 404 for a GET on the contact endpoint', async () => {
    const response = await worker.request('/api/contact', { method: 'GET' }, makeEnv());
    expect(response.status).toBe(404);
  });
});
