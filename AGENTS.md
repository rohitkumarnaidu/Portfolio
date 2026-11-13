# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Run from the repo root. This is an npm-workspaces + Turborepo monorepo with a single app.

| Command             | What it does                                                     |
| ------------------- | ---------------------------------------------------------------- |
| `npm run dev`       | Start the site via Turbo (Next.js, port 3000)                    |
| `npm run dev:web`   | Web only                                                         |
| `npm run build`     | Build all workspaces (Turbo, respects `^build` dependency order) |
| `npm run lint`      | Lint all workspaces                                              |
| `npm run typecheck` | Type-check all workspaces (`tsc --noEmit`)                       |
| `npm run format`    | Prettier write across the repo                                   |

Tests run per workspace:

- **Web (Vitest + Playwright):** from `apps/web`: `npm test` (Vitest run), `npm run test:watch`, `npm run test:coverage`, single file `npm test -- src/test/__tests__/foo.test.tsx`, e2e `npm run test:e2e`.

### npm version

The repo pins npm in `packageManager` (currently `npm@11.21.2`). Use `corepack enable`
so the pinned version is used. npm 10 cannot resolve this dependency tree from
scratch — an upstream arborist bug (npm/cli#9787). When regenerating
`package-lock.json`, delete `node_modules` too: npm rebuilds the tree from
whatever is on disk and drops the platform-specific optional packages
(npm/cli#4828), which breaks the Linux CI install.

## Architecture

One app, two shared packages:

- **`apps/web`** — Next.js 15 App Router. The public portfolio. Heavy 3D/motion stack (Three.js / React Three Fiber, GSAP, Lenis). Content is static and lives in `src/lib/public-content.ts`.
- **`packages/ui`** (`@portfolio/ui`) — React component library, the design system.
- **`packages/config`** — shared ESLint and TypeScript base configs.

### Content model

There is no backend, no database, and no CMS. Everything the site renders comes
from plain data in `apps/web/src/lib/public-content.ts`:

- `SITE` — identity, description, links.
- `WORK` / `getWork(slug)` — the project index; each entry renders through `components/public/CaseStudy.tsx`.
- `POSTS` / `getPost(slug)` — essays; each renders through `app/(public)/blog/[slug]/page.tsx`.
- `CAPABILITIES`, `PRINCIPLES`, `TOOLKIT`, `ABOUT_PARAGRAPHS`, `FACTS` — page copy.

Adding a project or an essay means adding an entry to that file. Do not
introduce a database, an API route, or a content service to do it.

### Routes

- `app/(public)/` — the site: home, work, work detail, about, writing, writing detail, contact.
- `app/health/route.ts` — liveness probe at `/health`.
- `app/rss.xml/route.ts` — feed, built from `POSTS`.
- `app/sitemap.ts`, `app/robots.ts` — built from `WORK` and `POSTS`.
- `src/middleware.ts` — security headers on every request.

The contact form composes a `mailto:` link; there is no submission endpoint.

## Conventions

- **Content in the repository.** If a page needs new copy or a new entry, it
  belongs in `public-content.ts` with a matching type.
- **Server components by default.** Add `'use client'` only for interaction.
- **The design system is `packages/ui`.** Do not re-create a component that
  already exists there, and do not style around it.
- **Metadata is explicit.** Public pages export `metadata` via
  `pageMetadata()` in `src/lib/seo.ts`; dynamic pages implement
  `generateMetadata`.
- **Tests live next to what they test** in `src/test/__tests__`, using Vitest.

## Docs

`docs/` is large and mostly forward-looking. Treat the code as ground truth
over the docs when they disagree.
