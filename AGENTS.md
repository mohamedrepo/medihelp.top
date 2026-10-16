# AGENTS.md — MEDIHELP TECHNOLOGY (httpmedihelp)

Guidance for ZCode agents working in this repo. Read before editing.

## What this repo is

Marketing/landing site for **MEDIHELP TECHNOLOGY** ("httpmedihelp", canonical URL `https://www.medihelp.top`).
Single-page Next.js 16 App Router site (React 19, TS 5, Tailwind 4, shadcn/ui "new-york") promoting three products:
QNB Fuel Extractor Pro (Chrome ext), Fleet Control (Windows desktop), AI Automation Studio (n8n).

It is **mostly a single landing page** (`src/app/page.tsx`) composed of `<Section>` components, plus a couple of client modals (auth, dashboard). There is also a Prisma/SQLite layer and a WebSocket example, but the public site itself is static-leaning.

## Commands

Package manager is **bun** (`bun.lock` present). From `package.json`:

- `bun dev` — `next dev -p 3000`, tees to `dev.log`.
- `bun run build` — `next build` **then** copies `.next/static` + `public/` into `.next/standalone/` (because `next.config.ts` sets `output: "standalone"`). Don't run a plain `next build` if you need the runnable standalone server.
- `bun run start` — `NODE_ENV=production bun .next/standalone/server.js` (teed to `server.log`).
- `bun run lint` — `eslint .` (flat config in `eslint.config.mjs`).
- `pnpm/bun run db:push` / `db:generate` / `db:migrate` / `db:reset` — Prisma helpers.

There is **no test runner and no dedicated typecheck script**. `tsconfig.json` is `strict: true` but `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so `next build` will NOT fail on type errors — do not treat a green build as proof of type-correctness. Run `tsc --noEmit` manually if you need real type checking.

## Layout

```
src/
  app/            App Router root — layout.tsx (metadata, fonts, ThemeProvider, toasters), page.tsx (page composition), globals.css, api/ (single GET hello route)
  components/     ui/ (shadcn primitives, ~48 files), sections/ (landing-page sections), composite/ (empty), app-level (navbar, footer, modals, theme-provider/toggle, floating-cta, logo)
  hooks/          use-mobile.ts, use-toast.ts
  lib/            db.ts (Prisma singleton), navigation.ts (nav config), utils.ts (cn())
prisma/schema.prisma   SQLite — User, Post models. datasource url = env DATABASE_URL.
db/custom.db           SQLite file (committed). NOTE: .env currently points at /home/z/my-project/db/custom.db, an absolute Linux path that does NOT match this Windows workspace.
examples/websocket/    Standalone socket.io demo (server.ts on :3003, frontend.tsx). Reference only — not wired into the app.
mini-services/         empty (.gitkeep), reserved.
public/                logo.svg, robots.txt only.
404/, _not-found/, 404.html, index.html, .htaccess, README-FREEHOSTING.txt  — outputs of the static-export track (see below).
Caddyfile              reverse proxy on :81 → localhost:3000, plus an `XTransformPort` query-based proxy.
```

## Architecture boundaries & rules

- **Path alias:** `@/*` → `./src/*` (tsconfig + components.json). Always import via `@/...`, not relative paths across `src/`.
- **App Router + Server Components by default.** Only add `'use client'` when you need hooks/state/events/browser APIs (`page.tsx`, modals, theme-provider, most sections already do). Don't push `'use client'` onto `layout.tsx` or leaf utility libs.
- **shadcn/ui primitives live in `src/components/ui/` and are managed by the shadcn CLI** (`components.json`: style `new-york`, baseColor `neutral`, cssVariables true, aliases `@/components`, `@/components/ui`, `@/lib`, `@/hooks`, icon lib `lucide-react`). Don't hand-edit generated UI primitives unless fixing a bug; regenerate or copy the official source instead. UI CSS variable tokens are defined in `src/app/globals.css`.
- **Landing-page sections** go in `src/components/sections/` and are composed in `src/app/page.tsx` in a fixed order. CTAs open the auth or dashboard modals via callbacks (`onOpenAuth` / `onOpenDashboard`) owned in `page.tsx` — follow that pattern instead of routing.
- **Theming:** `next-themes` `attribute="class"`, `defaultTheme="dark"`, Radix + Tailwind `darkMode: "class"`. Tailwind config uses `hsl(var(--token))` semantic colors (`background`, `foreground`, `primary`, `card`, `popover`, `muted`, `accent`, `destructive`, `chart-1..5`, `border`, `input`, `ring`) and a `--radius` token. Don't hardcode hex colors — use the tokens.
- **Fonts:** Geist (`--font-geist-sans`), Geist Mono (`--font-geist-mono`), Plus Jakarta Sans (`--font-display-sans`) loaded via `next/font/google` in `layout.tsx`.
- **Prisma:** `src/lib/db.ts` caches a single `PrismaClient` on `globalThis` outside production and logs `['query']`. Re-export `db` from there; don't construct `new PrismaClient()` elsewhere in dev. Schema is SQLite.
- **API:** only `src/app/api/route.ts` (a `GET` hello). Any new endpoints go under `src/app/api/<...>/route.ts`.

## Conventions

- `cn()` from `@/lib/utils` (clsx + tailwind-merge) for className composition.
- ESLint flat config is **heavily relaxed** (no-explicit-any, no-unused-vars, exhaustive-deps, no-console, etc. all off). Don't add code "to satisfy lint"; lint will not catch these. Still aim for correctness.
- Ignore patterns in `eslint.config.mjs`: `node_modules/**`, `.next/**`, `out/**`, `build/**`, `next-env.d.ts`, `examples/**`, `skills`.
- `.gitignore` also excludes `/skills/`, `.claude`, `.z-ai-config`, `*.log`, `dev.log`, `server.log`, `test`, `prompt`, `local-*`.
- Logging: no policy enforced (`no-console` off). `bun dev` / `bun start` already tee output to `dev.log` / `server.log`.

## Gotchas

- **`next.config.ts` ignores TS build errors** (`typescript.ignoreBuildErrors: true`) and `reactStrictMode: false`. A successful `next build` ≠ type-safe code. Type-check manually with `tsc --noEmit` when it matters.
- **`output: "standalone"` build step is non-trivial.** `bun run build` copies `.next/static` and `public/` into `.next/standalone/`. If you change static assets or public files, re-run the *script*, not bare `next build`.
- **`.env` DATABASE_URL is wrong for this Windows workspace** — it points at `/home/z/my-project/db/custom.db` (a Linux path from the host env). The committed SQLite DB is `db/custom.db`. To use Prisma locally, set `DATABASE_URL="file:./db/custom.db"` (or absolute) before running `db:push`/`db:migrate`. Do not commit a corrected `.env` blindly — `.env*` is gitignored.
- **Static-export / FreeHosting track.** `index.html` (548 KB, inlined CSS), `404.html`, `404/`, `_not-found/`, `assets/` (a renamed `_next/` to avoid the shared-host underscore-folder bug), `.htaccess`, and `README-FREEHOSTING.txt` are artifacts of a no-JS fallback build meant for FreeHosting.com/cPanel where JS may not load. See `README-FREEHOSTING.txt` for the upload procedure and the no-JS fallback techniques (anchor links, CSS `:hover` mega menu, `:target` modals, `<details>` accordion, hidden-checkbox mobile menu). Keep the **HTML-readable-without-JS** property when editing the marketing page: do NOT add `opacity:0` Framer Motion initial states directly to the server-rendered HTML, and prefer `href="#section"` nav links.
- **Forms submit to Formspree** and require JS — they will NOT work on the no-JS FreeHosting target unless JS loads (e.g. Netlify). Any placeholder Formspree IDs (referenced as `src/lib/formspree.ts` in README) must be replaced before a static rebuild.
- **WebSocket example** (`examples/websocket`) runs on port **3003** and is **not** wired into the Next.js app. Connection uses `io('/?XTransformPort=3003', …)` — never put the raw port in the client URL; always go through Caddy's `XTransformPort` query param (the `Caddyfile` :81 listener rewrites the port). Do **not** change the socket.io `path: '/'` — Caddy relies on it. (This example is ignored by ESLint and is reference/demo only.)
- **Caddyfile** proxies `:81` → `localhost:3000` (the Next app) and supports `?XTransformPort=<port>` to reach other local services. If you run the websocket demo behind Caddy, it goes through `:81` with `XTransformPort=3003`.
- **`skills/` directory and `/skills/` are gitignored** and excluded from lint — don't depend on them.

## Docs to read before touching sensitive areas

- **Static-hosting build / upload flow and no-JS fallbacks:** `README-FREEHOSTING.txt` (read before changing any landing-page section, `.htaccess`, or `index.html`).
- **Prisma schema & migrations:** `prisma/schema.prisma`, then run the `db:*` scripts.
- **Routing/proxy for local services:** `Caddyfile`.
