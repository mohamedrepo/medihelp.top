# Deployment and rollback — MediHelp Technologies website

**Target:** `https://www.medihelp.top` · **Runtime:** Cloudflare Worker + static assets
**Status:** the build is complete and locally verified. **Nothing has been deployed, and no DNS
has been changed.** Every production action below is gated on your authorization.

---

## 1. What actually runs in production

```
visitor
  → Cloudflare edge                     (zone medihelp.top)
      → Worker  "medihelp-website"      POST /api/contact   (run_worker_first: /api/*)
      → ASSETS binding                  every other path: prerendered static file
  → 404-page handling for unmatched paths
```

One Worker, one assets binding, no database, no filesystem. The 34 HTML documents in `dist/` are
generated at build time; the Worker only adds the contact endpoint.

Configuration lives in [wrangler.jsonc](../wrangler.jsonc): `compatibility_date` is pinned to the
installed workerd runtime so behaviour cannot drift silently, and `run_worker_first: ["/api/*"]`
keeps static asset serving on the fast path.

---

## 2. Prerequisites

| Need | Why |
| --- | --- |
| Node 24 and npm 11 | Build, tests, and the Wrangler CLI |
| A Cloudflare account with access to the `medihelp.top` zone | To deploy the Worker and attach the domain |
| A transactional email provider account | Only needed for the contact form to actually deliver |
| `npx wrangler login` | Authenticates the CLI, once per machine |

```bash
npm ci            # reproducible install from package-lock.json
npm run build     # client + SSR render + prerender + artifact checks
npm test          # 127 unit tests
npm run typecheck # client and Worker TS projects
npm run lint
```

`npm run build` ends with `node scripts/verify-build.mjs`, which asserts 763 facts against the
**generated** `dist/` — one `<title>`, one description, one canonical, one JSON-LD block and three
`hreflang` alternates per indexable page, plus brand, contact and content-policy checks. A green
build that fails those checks exits non-zero.

---

## 3. Local runtime verification (do this before deploying)

```bash
npm run serve        # wrangler dev on 127.0.0.1:8787, serving dist/
```

Then confirm, in order:

```bash
B=http://127.0.0.1:8787
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' $B/en/           # 200 text/html
curl -s -o /dev/null -w '%{http_code}\n' $B/ar/                            # 200
curl -s -o /dev/null -w '%{http_code}\n' $B/nope/                          # 404
curl -s -X POST -H 'Content-Type: application/json' \
     -H 'Origin: http://127.0.0.1:8787' -H 'CF-Connecting-IP: 198.51.100.1' \
     --data '{"name":"A B","email":"a@b.co","subject":"Test","message":"A message long enough to pass validation.","honeypot":"","elapsedMs":6000,"locale":"en"}' \
     $B/api/contact                                                        # see §5
```

While `wrangler dev` runs, the site is also reachable at `http://127.0.0.1:8787`. Both locales
should render, the language switcher should keep you on the same page, and `/` should redirect to a
locale home.

---

## 4. How the contact endpoint is configured

The Worker reads configuration from its environment. **Nothing is hardcoded, and no secret is ever
committed or sent to the browser.**

| Variable | Required | Purpose |
| --- | --- | --- |
| `CONTACT_TO_EMAIL` | yes | Recipient of contact notifications |
| `CONTACT_FROM_EMAIL` | yes | Verified sender address at the email provider |
| `EMAIL_API_KEY` | yes | Provider API key — **always a secret** |
| `EMAIL_PROVIDER` | no | `resend` (default) or `knock` |
| `KNOCK_WORKFLOW` | only for Knock | Workflow slug to trigger |
| `APP_ORIGIN` | recommended | Canonical origin, used by the cross-origin check |

`wrangler.jsonc` deliberately declares **no `vars` block**: Wrangler would type a literal value
(e.g. `EMAIL_PROVIDER` as the literal `"resend"`), which makes comparisons against other providers
a type error. Supply the values at deploy time instead.

### Local development values

Create `.dev.vars` (gitignored; never commit it):

```ini
CONTACT_TO_EMAIL="you@example.com"
CONTACT_FROM_EMAIL="website@example.com"
EMAIL_PROVIDER="resend"
EMAIL_API_KEY="re_test_key"
APP_ORIGIN="http://127.0.0.1:8787"
```

### Production secrets

```bash
npx wrangler secret put EMAIL_API_KEY          # paste when prompted — never in a file
npx wrangler secret put CONTACT_TO_EMAIL
npx wrangler secret put CONTACT_FROM_EMAIL
npx wrangler secret put APP_ORIGIN             # https://www.medihelp.top
```

**Until `EMAIL_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL` are set, the endpoint returns
HTTP 503 `{"ok":false,"error":"not_configured"}` and the form shows an honest failure. It never
reports success for a message that was not sent.** This is covered by
`tests/worker-contact.test.ts`.

---

## 5. Deploying

### Step 1 — preview on `workers.dev` (no domain risk)

```bash
npm run build
npx wrangler deploy
```

This publishes to `https://medihelp-website.<your-subdomain>.workers.dev`. The custom domain is
**not** touched: `wrangler.jsonc` declares no `routes`, so production DNS keeps pointing wherever it
points today. Verify the preview there before going further.

### Step 2 — point the domain at the Worker (needs your authorization)

Two separate things must both be true for `www.medihelp.top` to serve this site. Neither is a code
change, and neither has been applied.

**a. The zone→origin leg is currently broken.** The audit found the zone is Cloudflare-proxied onto a
Freehosting.com origin with HTTPS disabled on that account, which is why the domain today returns a
provider error page rather than a site (see
[MEDIHELP_WEBSITE_AUDIT.md](./MEDIHELP_WEBSITE_AUDIT.md) §4.3 and §8.2 R1). Any deployment — this one
included — fails until that leg is fixed: either enable HTTPS on the origin account, or set the
record to *DNS only*, **or** move the record off that origin entirely by attaching the Worker.

**b. Then attach the Worker to the hostname.** Add to `wrangler.jsonc` and re-deploy:

```jsonc
"routes": [
  { "pattern": "www.medihelp.top", "custom_domain": true },
  { "pattern": "medihelp.top", "custom_domain": true }
]
```

Attaching `www` to the Worker replaces the proxied origin for that hostname, which also fixes (a) for
`www` because Cloudflare now serves it directly.

### Step 3 — resolve the apex/www duplicate

The audit found that `medihelp.top` and `www.medihelp.top` currently serve identical content with **no
redirect between them** (§1.4, risk R4). The build treats `www` as canonical: every canonical URL,
`hreflang` alternate, OG URL and sitemap entry uses `https://www.medihelp.top`. To make that match
reality, add a Cloudflare Redirect Rule sending the apex to `www` with a 301. Choosing and applying
that redirect is your decision; the code already assumes the outcome.

### Step 4 — DNS-only fallback

If you would rather not attach the Worker, the same `dist/` output is a plain static site: upload it
to any static host, keep `www` canonical, and note that **the contact form will not work** — a static
host cannot run `/api/contact`, and the form will fail honestly rather than pretend.

---

## 6. Post-deploy verification

Run against the deployed origin, not just locally.

```bash
H=https://www.medihelp.top
for p in / /en/ /ar/ /en/projects/ /ar/projects/ /en/services/ /ar/services/ \
         /en/about/ /ar/about/ /en/contact/ /ar/contact/ /en/privacy/ /ar/privacy/ \
         /en/projects/smartfleet-manager/ /ar/projects/smartfleet-manager/ \
         /sitemap.xml /robots.txt /favicon.svg /og-image.png; do
  printf '%-46s %s\n' "$p" "$(curl -s -o /dev/null -w '%{http_code} %{content_type}' "$H$p")"
done
curl -s -o /dev/null -w 'unknown path -> %{http_code}\n' "$H/nope/"
```

Then check by hand:

- [ ] `/` lands on `/en/` for a new visitor and on the stored language for a returning one.
- [ ] The language switcher keeps you on the same page (`/en/projects/card-scanner/` ⇄ `/ar/projects/card-scanner/`).
- [ ] Arabic pages are `dir="rtl"`, English `dir="ltr"`, and no page scrolls sideways at 320 px.
- [ ] `view-source:` on one page shows real content inside `<div id="root">` — the site must be readable with JavaScript disabled.
- [ ] The contact form refuses an empty submit, then **sends a real message to your inbox**. If it reports "not fully configured", §4 is not finished.
- [ ] `curl -I` on an asset shows a cache header and `content-type: text/css` / `application/javascript`.
- [ ] `hreflang="en"`/`"ar"`/`"x-default"` present on canonical pages, absent on the 404.

---

## 7. Rollback

Nothing here is destructive, and there is no database to restore.

| Situation | Action |
| --- | --- |
| Bad Worker release | `npx wrangler rollback` (previous version), or re-deploy a known-good git tag |
| Domain should stop serving the new site | Remove the `routes` entries from `wrangler.jsonc` and re-deploy; the hostname returns to the previous origin record |
| Zone/DNS needs to go back | Restore the DNS records exported **before** any change (§8 below) |
| Worker should stop entirely | `npx wrangler delete medihelp-website` — this removes the Worker; the zone and any other DNS records are unaffected |

**Before touching DNS or the zone**, export the current records (dashboard → DNS → Export, or
`npx wrangler dns-records export`), screenshot the Cloudflare settings, and keep the previous
`index.html` from `legacy-static-export/` as the known-good artefact.

---

## 8. Cleanup before the first production deploy

1. **Root `.env` is a leftover** from the superseded Next.js/Prisma setup. Wrangler reads `.env`
   automatically, so `DATABASE_URL` is currently being injected into the Worker environment (visible
   in `wrangler dev` output) even though nothing reads it. Move it into `legacy-static-export/` or
   delete it once you have confirmed the Prisma layer is not needed.
2. **`legacy-static-export/`** holds the previous site's rendered output and its Next.js/PostCSS
   config. It is excluded from lint and type-checking. Keep it for rollback, then delete it when you
   are satisfied — no file outside that directory references it.
3. **Confirm the compatibility date** in `wrangler.jsonc` is not older than your Wrangler version
   suggests; it is intentionally pinned to the local workerd runtime.
