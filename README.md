# MediHelp Technologies — website

Bilingual (English / Arabic) marketing and product-showcase site for **MediHelp Technologies**,
deployed as a Cloudflare Worker with prerendered static assets.

**Live target:** `https://www.medihelp.top` · **Stack:** Vite 8 · React 19 · TypeScript 5.9 · Tailwind CSS 4 · Hono · Cloudflare Workers

---

## What this is

A static-first site. Every route is rendered to real HTML at build time, so the pages are readable
and crawlable **with JavaScript disabled**; the browser bundle only adds client-side navigation,
filters, the mobile menu and the contact form. A single Worker adds one endpoint,
`POST /api/contact`.

History, in two lines: the previous `medihelp.top` served a provider error page, not a website (no
pages, no contact channel, no analytics — see [the audit](docs/MEDIHELP_WEBSITE_AUDIT.md)). That
build and its Next.js config are kept, untouched, in `legacy-static-export/` for rollback.

---

## Quick start

```bash
npm ci                 # Node 24 / npm 11 recommended; lockfile is package-lock.json
npm run dev            # Vite dev server on :5173, proxies /api to the Worker on :8787
```

To exercise the full stack the way production runs it — static files *and* the contact endpoint:

```bash
npm run build          # builds dist/, then asserts 763 facts against the output
npm run serve          # wrangler dev on 127.0.0.1:8787
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server; `/api/*` is proxied to `http://127.0.0.1:8787` |
| `npm run build` | client bundle → SSR bundle → prerender 34 documents → `verify` |
| `npm run build:client` / `build:ssr` | the two Vite passes on their own |
| `npm run prerender` | writes one HTML file per route, plus `sitemap.xml` and `robots.txt` |
| `npm run verify` | asserts titles, canonicals, `hreflang`, JSON-LD, brand and content policy against `dist/` |
| `npm run serve` | `wrangler dev` on `127.0.0.1:8787` (the real workerd runtime) |
| `npm run deploy` | build, then `wrangler deploy` — read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) first |
| `npm test` / `test:watch` | Vitest (127 tests) |
| `npm run lint` | ESLint flat config |
| `npm run typecheck` | `tsc --noEmit` for the app **and** separately for the Worker |
| `npm run types:worker` | regenerate `worker-configuration.d.ts` from `wrangler.jsonc` |
| `npm run og:image` | regenerate `public/og-image.png` |

---

## Layout

```
index.html                 Vite entry; prerender rewrites it into every route's HTML
src/
  data/projects.ts         the project catalogue — the single source of page + sitemap truth
  i18n/{en,ar,types,index} typed dictionaries; en.ts is the source of truth
  components/              header, footer, project card, locale switcher, reveal, icons
  pages/                   Home, Projects, ProjectDetail, Services, About, Contact, Privacy, NotFound
  hooks/use-document-head  applies per-route metadata on client-side navigation
  lib/head.ts, seo.ts      the one place that builds <head> tags and JSON-LD
  lib/contact-*.ts         contact limits, schema, validation and submission
  router.ts, router-context.tsx   locale-aware router over the History API
  styles/index.css         Tailwind 4 theme tokens and the motion utilities
worker/index.ts            Hono app: POST /api/contact, then ASSETS fallback
scripts/                   prerender.mjs, verify-build.mjs, generate-og-image.mjs
tests/                     Vitest suites
docs/                      audit, portfolio audit, deployment guide, implementation report
legacy-static-export/      the superseded Next.js app and its static export (excluded from checks)
```

## Bilingual routing and RTL

- URLs are locale-prefixed and canonical: `/en/...` and `/ar/...`, always with a trailing slash.
- `/` is a static document that redirects to the visitor's remembered language, defaulting to English.
- `<html lang>` and `dir` are written into the static HTML by the prerender pass, and updated on the
  client by `use-document-head`.
- Every indexable page carries reciprocal `en`, `ar` and `x-default` alternates.
- **RTL is designed, not mirrored**: layouts use logical properties (`start`/`end`, `border-e`), and
  Latin technical terms, URLs and emails sit inside `.ltr-island` (`direction: ltr;
  unicode-bidi: isolate`) so they never reorder inside Arabic text.
- Translation completeness is enforced by `tests/i18n.test.ts`; the two dictionaries must have
  identical key sets.

### Adding or changing a project

Edit `src/data/projects.ts` only. Every claim in that file must trace to repository evidence — see
[docs/PORTFOLIO_PROJECT_AUDIT.md](docs/PORTFOLIO_PROJECT_AUDIT.md). The file drives the catalogue,
the project page, the sitemap and the prerender manifest, so nothing can drift. Optional URLs are
**omitted**, never set to an empty string, and `tests/projects.test.ts` enforces the content policy
(no live-SaaS claims, no prices, no fabricated links).

---

## Contact form

`POST /api/contact` validates on the server with Zod, rejects cross-origin submissions, honeypot
fills and too-fast submissions, rate limits per client IP, and returns a distinguishable outcome.
The UI shows success **only** after the provider accepted the message; otherwise it says so plainly
and keeps the visitor's text.

It needs three variables to work: `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` and `EMAIL_API_KEY` (plus
optional `EMAIL_PROVIDER`, `KNOCK_WORKFLOW`, `APP_ORIGIN`). Local values go in `.dev.vars`;
production values go in `npx wrangler secret put`. Full detail in
[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md#4-how-the-contact-endpoint-is-configured).

**Unconfigured is a supported state**: the endpoint returns 503 and the form reports an honest
failure. No secret is ever sent to the browser.

---

## Testing and verification

```bash
npm test           # 127 unit tests: router, i18n, catalogue policy, SEO, head manager,
                   # contact schema/validation/submission, the Worker endpoint (jsdom + stubbed fetch)
npm run typecheck  # app project and Worker project, separately
npm run lint
npm run build      # ends with 763 assertions against dist/
```

The suites that matter most are the ones written in response to real defects, each of which passes
only because the bug is fixed:

- `tests/document-head.test.ts` — a bad attribute name used to blank the whole page during hydration,
  and a duplicate JSON-LD block used to accumulate on every client-side navigation.
- `tests/locale-switcher.test.ts` — the switcher used to emit a link to the 404 document's own path,
  and dropped active filters when you clicked your own language.

## Deployment

See **[docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)** — includes the required secrets, the pre-production
DNS blocker, post-deploy checks and rollback.

## Documentation

| Document | Contents |
| --- | --- |
| [MEDIHELP_WEBSITE_AUDIT.md](docs/MEDIHELP_WEBSITE_AUDIT.md) | What the domain served before, DNS/TLS findings, risks, and the decisions only the owner can make |
| [PORTFOLIO_PROJECT_AUDIT.md](docs/PORTFOLIO_PROJECT_AUDIT.md) | Repository-by-repository evidence, and which projects were selected and why |
| [DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy, verify, roll back |
| [FINAL_IMPLEMENTATION_REPORT.md](docs/FINAL_IMPLEMENTATION_REPORT.md) | What was built, what was verified, and what still needs you |
| [AGENTS.md](AGENTS.md) | Guidance for coding agents working in this repo |
