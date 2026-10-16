# Final implementation report — MediHelp Technologies website

**Date:** 16 October 2026
**Deliverable:** a complete, bilingual, prerendered marketing and product-showcase site for
`https://www.medihelp.top`, verified locally against the real Workers runtime.
**Production status:** **not deployed.** No DNS or hosting change was made. See §12.

---

## 1. Status at a glance

| Item | State |
| --- | --- |
| Build | passes — 34 HTML documents, 763 artifact assertions |
| Unit tests | 127 passing across 9 suites |
| Type check | clean — app project and Worker project, separately |
| Lint | clean |
| Local runtime (workerd) | verified — HTTP matrix, abuse controls, 404, sitemap |
| Browser verification | every route, both locales, RTL, keyboard, no-JS, reduced motion |
| Contact form | works end to end **except delivery** — needs provider credentials (§12) |
| Dev workflow | `npm ci`, `npm run dev` (with `/api` reaching the Worker) and `npm run serve` all verified |
| Production deployment | **not performed** — needs authorization (§12) |

**Commands verified:** `npm ci` (manifest and lockfile agree), `npm run dev` (`:5173` serves the app,
resolves modules and CSS, and its `/api` proxy reaches the Worker), `npm run build`, `npm test`,
`npm run typecheck`, `npm run lint`, `npm run serve`, `npm run verify`.

---

## 2. What was discovered in the existing website

Established before any code was written, with the evidence recorded in
[MEDIHELP_WEBSITE_AUDIT.md](MEDIHELP_WEBSITE_AUDIT.md).

- **The domain was not serving the brand's website at all.** `https://www.medihelp.top` returned a
  third-party provider error page. There were no pages, no routes, no contact channel, no forms, no
  authentication, no database, no analytics, and no CI/CD — so there was no production feature to
  preserve.
- **DNS:** the zone uses Cloudflare nameservers (`sahanvi`/`ashton.ns.cloudflare.com`). The apex and
  `www` resolve to the same Cloudflare anycast addresses and **both serve identical content with no
  redirect between them** — a duplicate-content configuration.
- **The proxy→origin leg is broken:** the zone is proxied onto a Freehosting.com origin with HTTPS
  disabled on that account. Any deployment uploaded to that origin would still fail. This is a
  production blocker that needs your action, not a code change.
- **`robots.txt` was Cloudflare's managed content-signals file**, not a MediHelp-authored one, and no
  sitemap existed.
- **No licence file exists in any own-work repository**, so no project may be described as open
  source.
- **`SmartFleet-Manager/upload/` contains real financial data.** Nothing from that directory appears
  anywhere on the website, and the repository-archaeology needed to remove it from git history was
  deliberately not performed (§12).

### The superseded stack

The checkout also contained a previous **Next.js 16** landing-page app plus a static export of it
(`index.html`, 548 KB, inlined CSS). That build is not what serves the domain. It has been **moved,
not deleted**, to [`legacy-static-export/`](../legacy-static-export/), including its
`next.config.ts`, `tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `bun.lock`,
`.htaccess`, `404.html` and `README-FREEHOSTING.txt`. Nothing outside that directory references it,
and it is excluded from lint and type-checking. It is there so you can compare, or restore, and can
be deleted once you are satisfied.

One finding worth repeating: that old export published `sales@medihelp.top` and a `+974` telephone
number in its structured data. Neither was verifiable, so **neither is republished** (§10).

---

## 3. Repositories reviewed

Fetched from `https://github.com/mohamedrepo` via the GitHub API (with pagination), then read
file-by-file — README, manifests, source tree, docs, tests, CI, release metadata. Evidence is
recorded in [PORTFOLIO_PROJECT_AUDIT.md](PORTFOLIO_PROJECT_AUDIT.md).

**Own work examined (11):** `SmartFleet-Manager`, `eta-invoice-exporter`, `WinVuln`,
`VisaCardScanner`, `smart-media-downloader`, `WinISOBuild`, `QNB_Fuel_Extractor`,
`YouTube-Downloader`, `PostWindowsAppDeploy`, `ai-automation-daily-insights`,
`ai-developer-bootcamp-2026`.

**Also found and assessed:** two empty repositories (`www.medihelp.top`, `my-n8n-automation`) and
three third-party forks (`NIPHf_Feet`, `generative-ai-for-beginners`, `ai-agents-for-beginners`).
The forks are excluded from every marketing surface — they are not your work.

---

## 4. Projects selected, and why

**Featured on the homepage (4)** — chosen for evidence strength, differentiation and honest
marketability:

| Project | Repository | Public name | Maturity | Why |
| --- | --- | --- | --- | --- |
| Fleet platform | `SmartFleet-Manager` | SmartFleet Manager | Active | Largest, most complete artefact: Next.js + Prisma + Electron, 8 domain models, 4 test suites |
| ETA exporter | `eta-invoice-exporter` | ETA eInvoicing Bulk Exporter | **Released** | Best packaged: 12 releases with assets, 6-file docs, real statutory-compliance use case, already used in Arabic |
| Windows toolkit | `WinVuln` | Windows Sentinel | Prototype | Strongest differentiator: evidence-based, three-tier safety gating that refuses to weaken security |
| Android app | `VisaCardScanner` | Card Scanner | **Released** | A **structural** privacy guarantee — no `INTERNET` permission at all |

**Full catalogue (10)** adds `QNB_Fuel_Extractor` → Fuel-Card Transaction Extractor, `WinISOBuild` →
Windows ISO Build Toolchain, `PostWindowsAppDeploy` → Windows Workstation Deployment,
`smart-media-downloader` → Smart Media Downloader, `ai-automation-daily-insights` → Scheduled
Research Automation, and `YouTube-Downloader` → Desktop Download Manager.

**Excluded, deliberately:** the learning-log repo (no product), the two empty repos, all forks, and
anything from `SmartFleet-Manager/upload/`. Release links are shown **only** where a release actually
carries a downloadable asset — `WinISOBuild`, `WinVuln` and `YouTube-Downloader` have release pages
with no assets, so those are linked to the repository instead rather than to a dead end.

**Naming:** `QNB_Fuel_Extractor` and `VisaCardScanner` carry third-party trademarks, so the site uses
neutral public names ("Fuel-Card Transaction Extractor", "Card Scanner") and never puts a bank or
card-network name in a headline. A non-affiliation statement appears in the footer of every page.

---

## 5. Architecture

A **static-first frontend with one small edge Worker**.

| Layer | Choice | Why |
| --- | --- | --- |
| Build | Vite 8 + TypeScript 5.9 | Node 24 is present; small, fast output; the whole site is static |
| UI | React 19 | Consistent with your existing React/Vite and React/Next projects |
| Styling | Tailwind CSS 4 | Semantic tokens in CSS, no hardcoded hex values in components |
| Routing | A ~150-line locale-aware router over the History API | No framework needed for 32 static routes |
| Prerender | A custom SSR pass (`dist-server/`) + `scripts/prerender.mjs` | One real HTML file per route, derived from the same data module that renders the pages |
| Server | Cloudflare Worker + Hono | Only for `POST /api/contact`; the domain is already on Cloudflare |
| Animation | CSS only | No animation library is shipped — the earlier `motion` dependency was removed |

**Why not Next.js**, despite the brief suggesting it: the realistic target is Cloudflare's edge, and
Next.js SSR needs a verified Workers adapter whose output is not available here. Because the
frontend is fully static, Next.js would add build weight and a fragile deploy step without buying
anything for SEO or UX. This was recorded as a recommendation in the audit, and the frontend design
carries over unchanged if you prefer Next.js for the build layer.

**The route/SEO pipeline** is what keeps the two languages honest:

```
src/data/projects.ts  ─┬─→ pages (React)
                      ├─→ prerender manifest   (34 documents)
                      ├─→ sitemap.xml          (32 URLs, each with hreflang + x-default)
                      └─→ tests
src/lib/seo.ts + lib/head.ts → one <head> for static HTML *and* client navigation
```

Because the same module produces the pages and the sitemap, they cannot drift apart.

### The catalogue's field mapping, and three deliberate deviations

`src/data/projects.ts` carries every field the brief names — `slug`, `name`, `summary`, `category`,
`technologies`, `status`, `repositoryUrl`, `documentationUrl`, `releaseUrl`, `featured`,
`verifiedFeatures`, `limitations` — plus `repo`, `maturity`, `sensitiveData`, `accent` and
`reviewedOn`. Three fields differ from the literal list, each for a reason the brief itself imposes:

| Brief | Here | Why |
| --- | --- | --- |
| `description` | split into `problem` and `solution` | A case study has to answer both "what hurts" and "what we did"; one field cannot carry both in each language without becoming padding |
| `demoUrl` | **absent** | No project has a verified live demo — the audit found no hosted instance of anything. The brief requires omitting unavailable optional fields rather than emptying them, so there is no `demoUrl` key at all and the pages never render a demo link |
| `image` | generated `ProjectVisual`, keyed on slug and accent | No publishable screenshot exists (the only real UI captures sit inside `SmartFleet-Manager/upload/`, which holds real financial data). Rather than imply a screenshot, the artwork is drawn in SVG and the page states "Illustration — not a screenshot of the application" wherever the data is sensitive |

`name` and the human-readable text live under `text: Record<Locale, ProjectText>`, so both languages
are required by the type system — a new project cannot be added in English only.

No optional URL is ever set to an empty string; a grep for `repositoryUrl: ''` and friends returns
nothing, and `tests/projects.test.ts` enforces the same rule along with the content policy.

---

## 6. What was implemented

**Pages (32 indexable + 2 support documents, each in both languages):** Home, Projects catalogue, 10
project case studies, Services, About, Contact, Data & privacy, plus a 404 document and a root
redirect document.

**Bilingual routing.** `/en/…` and `/ar/…` are canonical, always with a trailing slash. `/` is a
static document that redirects to the visitor's remembered language, defaulting to English. Metadata
is written into the static HTML at build time and updated on the client by `use-document-head`, so
every page has exactly one title, one description, one canonical matching its own locale, one
JSON-LD block, and three `hreflang` alternates (`en`, `ar`, `x-default`).

**RTL.** Arabic is designed, not mirrored:

- `<html lang="ar" dir="rtl">` is written into the static HTML, before any JavaScript.
- Layout uses logical properties throughout (`ms-`/`me-`, `start`/`end`, `border-e`, `rtl:` variants),
  so the mobile panel slides in from the *leading* edge — the right one in Arabic.
- Long technical identifiers, URLs and email addresses are wrapped in `.ltr-island`
  (`direction: ltr; unicode-bidi: isolate`) so they cannot reorder inside Arabic text.
- Arabic typography uses IBM Plex Sans Arabic; English uses Inter. Both are self-hosted — no
  third-party font CDN, so no visitor data leaves the page.
- The brand glyph is geometric, so it never needs mirroring.

**Catalogue.** Server-rendered cards with a search box, a category filter and a maturity filter, all
driven by the URL (`?q=`, `?category=`, `?maturity=`) so results are shareable and survive a language
switch. A live count ("Showing 2 of 10 projects") and a real empty state are included. Filters work
in Arabic.

**Maturity labelling.** Every card and case study carries one of four labels — Released, Active
development, Prototype, Experiment — each with a tooltip explaining exactly what it means. No project
is described as a hosted service, because none exists.

**Case studies.** Each has the problem and audience, verified implemented features, technology stack,
access instructions, current status and known limitations, and links to the repository and any
in-repo documentation. Where a real, publishable screenshot does not exist, the page shows
purpose-built abstract artwork **labelled "Illustration — not a screenshot of the application"**.

**Contact.** A bilingual, accessible form (six fields, all labelled, with `autocomplete` hints and a
`tabindex="-1"` honeypot) posting to a Worker endpoint that validates with Zod on the server, checks
same-origin, rejects honeypot fills and sub-human submission times, and rate limits per client IP.
Client validation marks fields, moves focus to the first error, and associates each message via
`aria-describedby`.

**The site is readable with JavaScript disabled.** The dark theme is CSS; every route is real HTML;
and the entrance animations are gated behind a class that the inline head script adds only when
JavaScript runs *and* reduced motion was not requested. With JS off, or with reduced motion, nothing
is hidden.

**SEO and sharing.** Per-route titles and descriptions in both languages, canonicals on
`https://www.medihelp.top`, reciprocal `hreflang`, a sitemap with `x-default`, a hand-written
`robots.txt`, Open Graph and Twitter cards with a **generated 1200×630 PNG** (there is no rasteriser
here, so the image is produced as raw PNG by `scripts/generate-og-image.mjs`), a hand-built SVG
favicon, and JSON-LD limited to facts that can be substantiated — an `Organization` node, plus a
`SoftwareApplication` node on project pages. There is **no** `aggregateRating`, `review`, `offers` or
`price`, because none of those could be honest.

**No analytics, no pixels, no third-party requests.** The only external hosts referenced anywhere in
the built output are `github.com` (project links) and the site's own origin.

---

## 7. Defects found during verification, and fixed

These were found **by testing the running site**, not by reading the code. Each has a test that fails
without the fix — I reverted each fix and re-ran the suite to confirm that.

1. **Duplicate JSON-LD on every client-side navigation.** The prerendered structured-data block had
   no `id`, so the client head manager could not find it and appended a second block instead. Every
   SPA navigation left the previous route's organisation data behind. Fixed on both sides: the
   prerender now labels the block, and the hook removes any block it does not own. Three new tests in
   `tests/document-head.test.ts`; the existing suite passed because it began from an **empty** head
   rather than the prerendered one.
2. **Language switcher emitted a dead link on the 404 page,** and **dropped the active filters when
   you clicked your own language** (because it used the raw pathname instead of the shared route
   helper). One-line fix in `src/components/LocaleSwitcher.tsx`; six new tests in
   `tests/locale-switcher.test.ts`.
3. **The English header overflowed the viewport by 2 px at 320 px.** The brand block could not
   shrink, so it pushed the language switcher and menu button past the right edge and caused a
   horizontal scrollbar. Fixed by making the brand block shrinkable with a truncating wordmark, and
   the controls group `shrink-0`. Verified in the browser at 320 px across both locales.
4. **The root `package.json` and `index.html` had been reverted** to the superseded Next.js versions
   between work sessions (see §11), which broke the build. Both were reconstructed — the manifest
   from `package-lock.json`, the entry template from the last good build output — and re-verified.
5. **Two `unknown`-type errors** in `tests/worker-contact.test.ts` (`Response.json()` is typed
   `unknown`). Fixed with a narrow helper rather than a cast.
6. **The legacy Next scaffold broke lint and type-checking** — it referenced packages that are no
   longer dependencies (`next`, `tailwindcss-animate`, `eslint-config-next`). Moved out of the way
   (§2), and the two TypeScript projects now cover the app and the Worker separately.
7. **Every contact submission made from the dev server was rejected with 403.** The Vite dev proxy
   had `changeOrigin: true`, which rewrites the Host header to the proxy target, while the Worker
   compares the request host against the `Origin` header to reject cross-site posts. Host and
   origin could never match, so the documented local workflow was broken. Fixed by preserving the
   Host (`changeOrigin: false`), which keeps the check consistent with production. Re-verified: a
   same-origin dev submission now reaches the Worker (503 `not_configured`), while a foreign
   `Origin` is still refused with 403.

A note on one earlier claim: `verify-build.mjs` reporting "all checks passed" was **not** sufficient
to catch defect 1, because it only inspects static HTML, and not defect 3, because it does not
render. Both needed a real browser.

---

## 8. Checks run, and their results

### Build and static analysis

| Check | Command | Result |
| --- | --- | --- |
| Clean install | `npm ci` | from `package-lock.json` |
| Production build | `npm run build` | 34 documents, 32 sitemap entries; **763/763 artifact checks pass** |
| Unit tests | `npm test` | **127 passed / 9 files** |
| Type check (app) | `tsc --noEmit -p tsconfig.json` | clean |
| Type check (Worker) | `tsc --noEmit -p tsconfig.worker.json` | clean |
| Lint | `eslint .` | clean |

### Runtime, in workerd (`wrangler dev`, not a Node shim)

| Check | Result |
| --- | --- |
| `POST /api/contact` with no credentials configured | `503 {"ok":false,"error":"not_configured"}` |
| Cross-origin submission | `403` |
| Honeypot filled | `400` |
| Invalid email / non-JSON body | `400` / `400` |
| Rate limit | 5 accepted, 6th → `429` with `Retry-After` |
| `/`, `/en/`, `/ar/`, `/en/projects/` | `200 text/html` |
| `/favicon.svg`, `/og-image.png`, `/sitemap.xml`, `/robots.txt` | `200` with correct content types |
| Unknown path | `404` |

### Browser (real Chromium against workerd)

| Check | Result |
| --- | --- |
| All 34 routes: HTTP, `lang`, `dir`, exactly one title/description/canonical/JSON-LD, 3 `hreflang`, prerendered content present | 34/34 — and all 16 titles unique per locale |
| Layout sweep, all 32 routes at desktop width | **0 px overflow**, 0 offending elements |
| Arabic sweep — all 16 routes | 0 px overflow, `dir="rtl"`, correct canonicals |
| 320 px viewport, both locales, 8 representative pages | 0 px overflow |
| Client-side navigation | no full reload (sentinel survived), head stays singular |
| Language switch on a project page | `/en/projects/eta-invoice-exporter/` ⇄ `/ar/projects/eta-invoice-exporter/`, locale persisted |
| Mobile menu | opens with focus on the close control, body scroll locked, correct RTL edge, **Escape closes and restores focus** |
| Search / category / maturity / combined / empty state / Arabic search | all correct, URL-driven and shareable |
| Empty form submit | 4 fields marked invalid, focus moved to the first, **no request sent** |
| Valid submit with no credentials | endpoint called, `role="alert"` failure shown, **no success message**, visitor's text preserved |
| Content with the animation gate removed (the no-JS / reduced-motion state) | all 33 sections at `opacity: 1`, no transforms |
| Scroll reveals, gate on | 33/33 revealed after scrolling |
| Root `/` | → `/en/` by default, → `/ar/` after choosing Arabic |
| 404 page | renders, `noindex, follow`, no alternates, ways back to home and projects |
| Console errors | **none** |

### Link and content audit over the built HTML

| Check | Result |
| --- | --- |
| Internal links resolve to a generated file | 34/34 documents clean (one dangling `/en/404/` was found and fixed — defect 2) |
| `target="_blank"` without `rel="noopener"` | none |
| `mailto:` / `tel:` / `wa.me` anywhere | **none** |
| Formspree or other placeholder endpoints | none |
| External hosts referenced | `github.com` and the site's own origin only |
| Sitemap | 32 URLs, all on the canonical origin, each with `x-default` |

### Payload

| Asset | Raw | Gzip |
| --- | --- | --- |
| JavaScript (whole app) | 398.6 kB | **120.2 kB** |
| CSS | 150.9 kB | **32.1 kB** |
| Per-page HTML (fully prerendered) | 33–59 kB | — |

An earlier iteration shipped a 192 kB gzip bundle; removing `zod` from the browser bundle and the
`motion` library brought it to 120 kB. No animation library is loaded at all — the entrance effects
are plain CSS.

---

## 9. What was **not** verified

Reported as limitations, not as passes.

1. **Email delivery was never confirmed end to end.** There are no provider credentials, so the only
   states exercised are `not_configured` (503) and the provider-rejection path (mocked in tests).
   A real message has not been sent to a real inbox. This is the one functional gap.
2. **Nothing is deployed.** Production, DNS and the Cloudflare zone are untouched.
3. **No Lighthouse or Core Web Vitals measurement.** There is no headless Lighthouse available here.
   The bundle sizes above are real measurements; LCP/CLS/INP are not.
4. **No real application screenshots are published**, because none of the existing screenshots may be
   published (the only real UI captures live inside `SmartFleet-Manager/upload/`, which contains real
   financial data). The abstract artwork is labelled as illustration on the page itself.
5. **Rate limiting is best-effort.** It is in-memory and per isolate, so an attacker spreading
   requests across isolates gets more attempts than the limit suggests. This is stated in the code
   and would need Cloudflare's Rate Limiting binding for a hard guarantee.
6. **The 404 document carries a self-referencing canonical.** Harmless — the page is `noindex` — but
   noted for completeness.
7. **Contact form field `name` attributes are React-generated ids** (`_r_0_`, `_r_1_`, …) rather
   than semantic names. The JS submission path builds its JSON from component state, so nothing is
   broken; it only affects autofill heuristics and a hypothetical no-JS native POST.
8. **The deploy path through the *current* hosting is unverified**, because the zone→origin leg is
   broken and that cannot be fixed from here.
9. **Google Search Console / indexing was not submitted** — that needs your account.

---

## 10. Contact details: what was verified, and what was refused

Publishing a contact detail that does not work is worse than publishing none, so only the following
appeared, each traceable to an official public source:

| Channel | Value | Source |
| --- | --- | --- |
| GitHub | `https://github.com/mohamedrepo` | The GitHub API confirms this account exists and owns the reviewed repositories |
| Website | `www.medihelp.top` | The domain in the brief |
| Location | Egypt | The brief's business-location context |
| Contact form | `/en/contact/`, `/ar/contact/` | Built and verified in this project |

**Deliberately not published, because none could be verified:**

- **No email address.** Neither `sales@medihelp.top` nor any other address is verifiable — no MX
  record check could confirm `@medihelp.top` mail exists. The superseded static export *did* publish
  `sales@medihelp.top` in its structured data; that is **not** carried over. The contact page states
  plainly that there is no published address because none has been verified.
- **No telephone number**, including the `+974-4000-1234` value that appeared in the old export's
  JSON-LD, which is a Qatari number for a business stated to be in Egypt and looks like a placeholder.
- **No WhatsApp, LinkedIn, Twitter/X or physical address.**
- **No legal entity name, registration number or VAT number.**

The contact page says all of this out loud, in both languages, rather than dressing up an empty
section: *"There is no published email address: none has been verified, and we will not invent one."*

---

## 11. A note on the workspace state

Two things worth knowing about the checkout, since they explain some of this session's work:

- Between work sessions, **`package.json` and `index.html` were reverted to the superseded Next.js
  versions** by something outside this session (the same process left `bun.lock`, `next.config.ts`,
  `tailwind.config.ts`, `postcss.config.mjs` and `eslint.config.mjs` in place). The result was a
  build that failed on an old PostCSS config and a missing Vite entry. Both files were reconstructed
  and re-verified; `package.json` is now consistent with the installed `package-lock.json`, and
  `index.html` is a correct Vite entry. **If you have another agent or tool working in this
  directory, that is the most likely source.**
- There is **no git repository** in this directory (`git status` reports "not a git repository"), so
  nothing here is committed, and there is no history to fall back on. Before you make further
  changes, initialising one would be worthwhile.

---

## 12. What still needs you

### Credentials and configuration

| # | Item | Effect until it is done |
| --- | --- | --- |
| 1 | `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `EMAIL_API_KEY` as Worker secrets | The form validates, rate limits and fails **honestly**; no message is delivered |
| 2 | Optional: `EMAIL_PROVIDER` (`resend` default, or `knock`), `KNOCK_WORKFLOW`, `APP_ORIGIN` | Defaults are sane; `APP_ORIGIN` tightens the cross-origin check |

### Authorization required before any production change

| # | Item | Why it cannot be done from here |
| --- | --- | --- |
| 3 | **Fix or bypass the broken zone→origin leg** (enable HTTPS on the Freehosting origin, or set the record to DNS only, or attach the Worker to the hostname) | A hosting-account or DNS change. **Nothing serves correctly at `www.medihelp.top` until this is resolved.** |
| 4 | **Attach the Worker to `www.medihelp.top`** (`routes` in `wrangler.jsonc`, then deploy) | Changes what the domain serves |
| 5 | **Add a 301 from the apex to `www`** | The build already assumes `www` is canonical; the redirect makes reality match |
| 6 | **Deploy** (`npm run deploy`) | Publishing |

### Decisions only you can make

These come from the audit's §10 list; the implementation proceeded on the stated safe default.

| # | Decision | Current default in the build |
| --- | --- | --- |
| 7 | Confirm the static + Worker stack, or mandate Next.js | Static + Worker |
| 8 | Whether the site may name a bank in marketing copy | Neutral category names; the bank name appears nowhere |
| 9 | Whether form submissions should be retained in D1 | Email-only, no retention, no database |
| 10 | Legal entity name, address, registration, VAT for the footer | Omitted entirely |
| 11 | Whether to add a `LICENSE` to the repositories | No project is described as open source |
| 12 | Whether to change the GitHub profile name/bio (currently *"Self-Portrait with Death Playing the Fiddle"*) | Not referenced anywhere on the site |
| 13 | Remediation of the public data exposure in `SmartFleet-Manager/upload/`, including any history rewrite | Reported only; nothing was changed, and no data from it is used |
| 14 | Whether the empty `www.medihelp.top` repository should host this source | Left untouched |
| 15 | Founder information for the About section | The About page covers mission, focus and approach — no biography, credentials, client list or employment claims |

---

## 13. Running it locally

```bash
npm ci            # Node 24 / npm 11; the lockfile is package-lock.json
npm run dev       # Vite on :5173 (proxies /api to the Worker)
npm test          # 127 tests
npm run typecheck
npm run lint

npm run build     # dist/ + 763 artifact assertions
npm run serve     # wrangler dev on 127.0.0.1:8787 — the real workerd runtime
```

Add **`node scripts/prerender.mjs`** to your mental model of the build: `npm run build` is
`vite build` → `vite build --ssr` → `prerender` → `verify`. `npm run verify` on its own re-checks an
existing `dist/`.

For the contact form locally, create `.dev.vars` (gitignored) with the variables from §12 item 1.

---

## 14. Deploying safely

Full procedure, verification checklist and rollback steps: **[DEPLOYMENT.md](DEPLOYMENT.md)**.
The short version:

1. `npm ci && npm test && npm run build` — all green.
2. `npx wrangler secret put` for the three contact variables.
3. `npx wrangler deploy` — publishes to `*.workers.dev`, **touching no DNS**.
4. Verify there, using the §6 checklist in the deployment guide.
5. Export the current DNS records and screenshot the zone settings **before** any change.
6. Only then attach `www.medihelp.top` in `wrangler.jsonc` and add the apex→www 301.
7. Rollback: `npx wrangler rollback`; or remove the `routes` entries and re-deploy to return the
   hostname to its previous origin.

The old static export in `legacy-static-export/` is your known-good artefact if you need to put the
previous state back temporarily — though note that the domain was serving a provider error page, not
the old site, so there is very little to regress to.

---

## 15. Files created or modified in this session

**Created:** [README.md](../README.md), [docs/DEPLOYMENT.md](DEPLOYMENT.md),
[docs/FINAL_IMPLEMENTATION_REPORT.md](FINAL_IMPLEMENTATION_REPORT.md),
[tests/locale-switcher.test.ts](../tests/locale-switcher.test.ts), [index.html](../index.html)
(reconstructed Vite entry), `legacy-static-export/` (8 superseded files moved in).

**Modified:** [package.json](../package.json) (reconstructed), [tsconfig.json](../tsconfig.json),
[eslint.config.js](../eslint.config.js), [src/lib/head.ts](../src/lib/head.ts),
[src/hooks/use-document-head.ts](../src/hooks/use-document-head.ts),
[src/components/LocaleSwitcher.tsx](../src/components/LocaleSwitcher.tsx),
[src/components/BrandMark.tsx](../src/components/BrandMark.tsx),
[src/components/SiteHeader.tsx](../src/components/SiteHeader.tsx),
[tests/document-head.test.ts](../tests/document-head.test.ts),
[tests/worker-contact.test.ts](../tests/worker-contact.test.ts),
[docs/PORTFOLIO_PROJECT_AUDIT.md](PORTFOLIO_PROJECT_AUDIT.md) (corrected a stale catalogue count).

The site itself — pages, router, i18n dictionaries, catalogue, Worker, prerender and verification
scripts, tests, favicon and OG image — was built earlier in this project; the four audit, deployment
and report documents and the test suite are the durable record of it.
