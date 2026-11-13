# Portfolio

<p align="center">
  <a href="https://github.com/rohitkumarnaidu/Portfolio/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/rohitkumarnaidu/Portfolio/ci.yml?branch=main&label=CI&logo=github&style=flat-square" alt="CI Status" />
  </a>
  <a href="https://nodejs.org/">
    <img src="https://img.shields.io/badge/node-%3E%3D22.12-brightgreen?style=flat-square&logo=node.js&logoColor=white" alt="Node Version" />
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15-000000?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19-087ea4?style=flat-square&logo=react&logoColor=white" alt="React" />
  </a>
</p>

A static portfolio site: one Next.js app, no backend, no database. The content
lives in the repository, the site is generated from it, and it deploys to Vercel.

## Stack

| Concern        | Choice                                           |
| -------------- | ------------------------------------------------ |
| Framework      | Next.js 15 (App Router), React 19, TypeScript 5  |
| Styling        | Tailwind CSS 3.4, design tokens in `packages/ui` |
| 3D             | Three.js 0.184, React Three Fiber 9, Drei 10     |
| Animation      | GSAP, Lenis (smooth scroll)                      |
| Error tracking | Sentry (APM + profiling)                         |
| Testing        | Vitest, React Testing Library, Playwright        |
| Delivery       | GitHub Actions, Vercel                           |

## Architecture

```
apps/
└── web/            Next.js — the portfolio
packages/
├── ui/             Shared React component library (design system)
└── config/         Shared ESLint and TypeScript configs
config/             Environment variable templates
docs/               Architecture, design, testing, and process docs
```

Content is plain TypeScript in `apps/web/src/lib/public-content.ts`: the work
index, the essays, the copy for each page. Editing that file and deploying is
the whole publish flow — there is no CMS and no publish step.

## Quick Start

```bash
git clone https://github.com/rohitkumarnaidu/Portfolio.git
cd Portfolio
npm install
npm run dev
```

The site runs at http://localhost:3000. There is nothing else to configure: the
content is in the repository and the build needs no secrets. Optional
integrations (Sentry, PostHog) read from `config/.env` — copy
`.env.example` to `config/.env` if you want them.

### Toolchain

The repository pins npm in `packageManager`:

```bash
corepack enable   # honours the pinned npm version
```

npm 10 cannot resolve this dependency tree from scratch (an upstream arborist
bug, npm/cli#9787). The pin is npm 11.21.2, which has the fix and writes
lockfiles that install correctly on Linux. If you regenerate
`package-lock.json`, delete `node_modules` as well — npm rebuilds the tree from
whatever is on disk and drops the platform-specific optional packages
(npm/cli#4828), which breaks Linux CI installs.

## Scripts

| Command             | Description                                   |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Start the site                                |
| `npm run build`     | Production build                              |
| `npm run lint`      | Lint all workspaces                           |
| `npm run typecheck` | Type-check all workspaces                     |
| `npm test`          | Tests (per workspace: `npm test -w apps/web`) |

## Documentation

| Document                                      | Description                            |
| --------------------------------------------- | -------------------------------------- |
| `docs/MASTER-INDEX.md`                        | Index of every document                |
| `docs/05-architecture/TECHSTACK.md`           | The stack and the trade-offs behind it |
| `docs/04-design/DESIGN-SYSTEM.md`             | Design tokens, typography, components  |
| `docs/07-frontend/FRONTEND-ARCHITECTURE.md`   | App structure, rendering, state        |
| `docs/13-testing/TESTING-ARCHITECTURE.md`     | Test strategy and what is covered      |
| `docs/24-development/DEVELOPER-ONBOARDING.md` | Getting set up                         |

## License

MIT
