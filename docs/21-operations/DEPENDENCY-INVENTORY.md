# Dependency Inventory

> **Document:** `DependencyInventory.md` | **Version:** 2.0 | **Last Updated:** July 2026  
> **Status:** ✅ Active | **Owner:** Engineering Lead | **Review Cadence:** Monthly  
> **Related:** [InfrastructureAsCode.md](./InfrastructureAsCode.md) | [ReleaseManagement.md](./ReleaseManagement.md)

---

## 1. Overview

Complete inventory of all third-party dependencies across the monorepo, including license, purpose, version, upgrade frequency, and risk classification. This document is the source of truth for dependency health and is checked monthly against `dependabot` alerts.

## 2. Risk Classification

| Level | Meaning | Update Policy |
|-------|---------|---------------|
| **Critical** | Security or stability impact. Update immediately on vulnerable advisory. | Patch within 7 days |
| **Essential** | Core functionality. Keep reasonably up-to-date. | Minor within 30 days |
| **Nice-to-have** | Optional or cosmetic. Update when convenient. | No SLA |

## 3. Root Workspace

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| turbo | ^2.0.0 | MIT | Monorepo orchestration | Minor | 2.4.x | Essential |
| prettier | ^3.3.0 | MIT | Code formatting | Minor | 3.5.x | Nice-to-have |
| husky | ^9.1.7 | MIT | Git hooks | Minor | 9.1.x | Essential |
| lint-staged | ^17.0.8 | MIT | Staged file linting | Minor | 17.1.x | Essential |
| concurrently | ^8.2.2 | MIT | Parallel command runner | Minor | 9.x | Nice-to-have |

## 4. API Workspace (`apps/api`)

### 4.1 Framework & Core

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| @nestjs/common | ^10.4.0 | MIT | NestJS framework core | Minor | 10.4.x | Critical |
| @nestjs/core | ^10.4.0 | MIT | NestJS framework core | Minor | 10.4.x | Critical |
| @nestjs/platform-express | ^10.4.0 | MIT | Express adapter | Minor | 10.4.x | Essential |
| @nestjs/config | ^3.2.0 | MIT | Env var management | Minor | 3.4.x | Essential |
| @nestjs/swagger | ^7.4.0 | MIT | OpenAPI docs generation | Minor | 8.x | Essential |
| @nestjs/jwt | ^10.2.0 | MIT | JWT utilities | Minor | 11.x | Essential |
| @nestjs/passport | ^10.0.3 | MIT | Passport integration | Minor | 10.0.x | Essential |
| @nestjs/throttler | ^6.2.0 | MIT | Rate limiting | Minor | 6.3.x | Essential |
| @nestjs/bullmq | ^11.0.4 | MIT | BullMQ queue integration | Minor | 11.0.x | Essential |
| @nestjs/cache-manager | ^3.1.3 | MIT | Cache integration | Minor | 3.1.x | Nice-to-have |
| nestjs-pino | ^4.6.1 | MIT | Pino logger for NestJS | Minor | 4.7.x | Nice-to-have |

### 4.2 Database & ORM

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| @prisma/client | ^7.8.0 | Apache-2.0 | Prisma ORM client | Minor | 7.8.x | Critical |
| @prisma/adapter-pg | ^7.8.0 | Apache-2.0 | pg driver adapter | Minor | 7.8.x | Critical |
| prisma (dev) | ^7.8.0 | Apache-2.0 | Prisma CLI (migrations) | Minor | 7.8.x | Critical |
| pg | ^8.22.0 | MIT | PostgreSQL driver | Minor | 8.23.x | Essential |

### 4.3 Authentication

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| passport | ^0.7.0 | MIT | Auth middleware | Patch | 0.7.x | Critical |
| passport-jwt | ^4.0.1 | MIT | JWT strategy | Patch | 4.0.x | Critical |
| passport-github2 | ^0.1.12 | MIT | GitHub OAuth strategy | Patch | 0.1.x | Essential |
| passport-google-oauth20 | ^2.0.0 | MIT | Google OAuth strategy | Minor | 2.0.x | Essential |
| bcrypt | ^6.0.0 | MIT | Password hashing | Minor | 6.0.x | Critical |

### 4.4 Queue, Cache & Messaging

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| bullmq | ^5.79.0 | MIT | Background job queue | Minor | 5.120.x | Essential |
| ioredis | ^5.10.1 | MIT | Redis client | Minor | 5.10.x | Essential |
| cache-manager | ^7.2.8 | MIT | Cache abstraction | Minor | 7.4.x | Nice-to-have |
| cache-manager-redis-yet | ^5.1.5 | MIT | Redis store for cache-manager | Minor | 5.1.x | Nice-to-have |

### 4.5 Validation & Serialization

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| class-validator | ^0.14.1 | MIT | Decorator-based validation | Patch | 0.14.x | Essential |
| class-transformer | ^0.5.1 | MIT | Object serialization | Patch | 0.5.x | Essential |
| zod | ^3.24.0 | MIT | Schema validation | Minor | 3.25.x | Essential |

### 4.6 Error Tracking & Monitoring

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| @sentry/node | ^10.59.0 | MIT | Error & performance tracking | Minor | 10.59.x | Essential |
| @sentry/profiling-node | ^10.59.0 | MIT | CPU profiling | Minor | 10.59.x | Nice-to-have |

### 4.7 Utilities

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| helmet | ^8.2.0 | MIT | Security headers | Minor | 8.3.x | Essential |
| compression | ^1.8.1 | MIT | Response compression | Minor | 1.8.x | Nice-to-have |
| sanitize-html | ^2.17.5 | MIT | HTML sanitization | Minor | 2.17.x | Essential |
| resend | ^6.14.0 | MIT | Email sending | Minor | 6.14.x | Essential |
| @octokit/rest | ^22.0.1 | MIT | GitHub API client | Minor | 22.x | Nice-to-have |
| uuid | ^9.0.0 | MIT | UUID generation | Minor | 11.x | Nice-to-have |
| rxjs | ^7.8.1 | Apache-2.0 | Reactive extensions | Patch | 7.8.x | Essential |
| reflect-metadata | ^0.2.2 | Apache-2.0 | TypeScript decorators | Patch | 0.2.x | Essential |
| dotenv | ^16.4.5 | MIT | Env file loading | Minor | 16.4.x | Nice-to-have |

### 4.8 Dev Dependencies (API)

| Dependency | Version | License | Purpose |
|-----------|---------|---------|---------|
| @nestjs/cli | ^10.4.0 | MIT | NestJS CLI (code gen, build) |
| @nestjs/schematics | ^10.1.0 | MIT | Code generation schematics |
| @nestjs/testing | ^11.1.27 | MIT | Test utilities |
| jest | ^30.4.2 | MIT | Test runner |
| ts-jest | ^29.4.11 | MIT | TypeScript Jest transformer |
| supertest | ^7.2.2 | MIT | HTTP test assertions |
| typescript | ^5.5.0 | Apache-2.0 | TypeScript compiler |
| eslint | ^8.57.0 | MIT | Linter |

## 5. Web Workspace (`apps/web`)

### 5.1 Framework

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| next | ^14.2.0 | MIT | React framework (App Router) | Minor | 14.2.x | Critical |
| react | ^18.3.0 | MIT | UI library | Patch | 18.3.x | Critical |
| react-dom | ^18.3.0 | MIT | React DOM renderer | Patch | 18.3.x | Critical |

### 5.2 3D & Animation

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| three | ^0.184.0 | MIT | 3D rendering engine | Minor | 0.184.x | Essential |
| @react-three/fiber | ^8.18.0 | MIT | React renderer for Three.js | Minor | 8.18.x | Essential |
| @react-three/drei | ^9.122.0 | MIT | R3F utilities & helpers | Minor | 9.122.x | Essential |
| @react-three/postprocessing | ^2.19.1 | MIT | R3F post-processing | Minor | 2.19.x | Nice-to-have |
| @theatre/core | ^0.7.2 | Apache-2.0 | Animation system | Minor | 0.7.x | Nice-to-have |
| @theatre/r3f | ^0.7.2 | Apache-2.0 | Theatre.js + R3F bridge | Minor | 0.7.x | Nice-to-have |
| framer-motion | ^12.42.2 | MIT | UI animations | Minor | 12.42.x | Essential |
| gsap | ^3.15.0 | Standard | High-performance animations | Minor | 3.15.x | Nice-to-have |
| lenis | ^1.3.23 | MIT | Smooth scrolling | Minor | 1.3.x | Nice-to-have |

### 5.3 Data & State

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| @tanstack/react-query | ^5.101.0 | MIT | Server state management | Minor | 5.101.x | Essential |
| @tanstack/react-query-devtools | ^5.101.0 | MIT | Query devtools | Minor | 5.101.x | Nice-to-have |
| @supabase/supabase-js | ^2.108.2 | Apache-2.0 | Supabase client | Minor | 2.108.x | Essential |
| react-hook-form | ^7.80.0 | MIT | Form management | Minor | 7.80.x | Essential |
| @hookform/resolvers | ^5.4.0 | MIT | Form validation resolvers | Minor | 5.4.x | Essential |

### 5.4 Rich Text & Content

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| @tiptap/react | ^3.27.1 | MIT | Rich text editor (React) | Minor | 3.27.x | Essential |
| @tiptap/starter-kit | ^3.27.1 | MIT | Tiptap starter extensions | Minor | 3.27.x | Essential |
| @tiptap/pm | ^3.27.1 | MIT | ProseMirror core | Minor | 3.27.x | Essential |
| @tiptap/extension-image | ^3.27.1 | MIT | Image extension | Minor | 3.27.x | Nice-to-have |
| @tiptap/extension-link | ^3.27.1 | MIT | Link extension | Minor | 3.27.x | Nice-to-have |
| @tiptap/extension-placeholder | ^3.27.1 | MIT | Placeholder extension | Minor | 3.27.x | Nice-to-have |
| react-markdown | ^10.1.0 | MIT | Markdown rendering | Minor | 10.1.x | Nice-to-have |

### 5.5 Monitoring & Analytics

| Dependency | Version | License | Purpose | Upgrade Freq. | Latest | Risk |
|-----------|---------|---------|---------|---------------|--------|------|
| @sentry/nextjs | ^10.59.0 | MIT | Error & performance monitoring | Minor | 10.59.x | Essential |
| @sentry/profiling-node | ^10.59.0 | MIT | CPU profiling | Minor | 10.59.x | Nice-to-have |

### 5.6 Sandbox IDE

| Dependency | Version | License | Purpose |
|-----------|---------|---------|---------|
| @webcontainer/api | ^1.6.4 | Apache-2.0 | In-browser Node.js runtime |
| @monaco-editor/react | ^4.7.0 | MIT | Code editor component |

### 5.7 UI & Styling

| Dependency | Version | License | Purpose |
|-----------|---------|---------|---------|
| lucide-react | ^1.24.0 | ISC | Icon library |
| next-themes | ^0.3.0 | MIT | Theme switching |
| @splinetool/runtime | ^1.12.97 | MIT | Spline 3D runtime |

### 5.8 Dev Dependencies (Web)

| Dependency | Version | License | Purpose |
|-----------|---------|---------|---------|
| vitest | ^4.1.9 | MIT | Test runner |
| @testing-library/react | ^16.3.2 | MIT | React component testing |
| @testing-library/jest-dom | ^6.9.1 | MIT | DOM matchers |
| tailwindcss | ^3.4.4 | MIT | CSS framework |
| typescript | ^5.5.0 | Apache-2.0 | TypeScript compiler |
| @next/bundle-analyzer | ^16.2.9 | MIT | Bundle size analysis |

## 6. AI Workspace (`apps/ai`)

| Dependency | Version | License | Purpose | Risk |
|-----------|---------|---------|---------|------|
| fastapi | 0.115.0 | MIT | Python web framework | Critical |
| uvicorn | 0.32.0 | BSD-3-Clause | ASGI server | Critical |
| pydantic | 2.9.2 | MIT | Data validation | Essential |
| pydantic-settings | 2.6.1 | MIT | Settings management | Essential |
| langchain | 0.3.7 | MIT | LLM orchestration | Essential |
| langchain-openai | 0.2.10 | MIT | OpenAI integration | Essential |
| langchain-anthropic | 0.2.4 | MIT | Anthropic integration | Nice-to-have |
| sqlalchemy | 2.0.36 | MIT | SQL ORM | Essential |
| asyncpg | 0.30.0 | Apache-2.0 | Async PostgreSQL driver | Essential |
| httpx | 0.27.2 | BSD-3-Clause | Async HTTP client | Essential |
| transformers | 4.46.2 | Apache-2.0 | HuggingFace models | Nice-to-have |
| sentence-transformers | 3.3.1 | Apache-2.0 | Embedding models | Nice-to-have |
| redis | 5.2.0 | MIT | Redis client | Essential |
| tiktoken | 0.8.0 | MIT | Token counting | Essential |
| supabase | 2.9.0 | MIT | Supabase client library | Essential |
| structlog | 24.4.0 | Apache-2.0 | Structured logging | Nice-to-have |
| numpy | 1.26.4 | BSD-3-Clause | Numerical computing | Essential |
| python-jose | 3.3.0 | MIT | JWT encoding/decoding | Essential |
| passlib | 1.7.4 | BSD-3-Clause | Password hashing | Essential |

## 7. Shared Packages

### 7.1 `@portfolio/shared`

| Dependency | Version | License | Purpose | Risk |
|-----------|---------|---------|---------|------|
| zod | ^3.23.8 | MIT | Shared schema validation | Essential |
| typescript (dev) | ^5.5.0 | Apache-2.0 | TypeScript compiler | Essential |

### 7.2 `@portfolio/ui`

| Dependency | Version | License | Purpose | Risk |
|-----------|---------|---------|---------|------|
| clsx | ^2.1.1 | MIT | Conditional classnames | Nice-to-have |
| tailwind-merge | ^2.5.0 | MIT | Tailwind class merging | Nice-to-have |
| react (peer) | ^18.0.0 | MIT | UI component library | Essential |

## 8. Dependabot Configuration

**File:** `.github/dependabot.yml` (if exists — if not, create per below)

| Ecosystem | Directory | Schedule | Reviewers |
|-----------|-----------|----------|-----------|
| npm | `/` | weekly | @engineering-lead |
| npm | `/apps/api` | weekly | @engineering-lead |
| npm | `/apps/web` | weekly | @engineering-lead |
| pip | `/apps/ai` | weekly | @ai-lead |

**Merge rules:**
- Patch updates: Auto-merge if CI passes
- Minor updates: Manual review required
- Major updates: Manual review + QA on staging

## 9. Deprecation & End-of-Life Tracking

| Dependency | Current Version | EOL Date | Risk if Unmaintained | Upgrade Deadline |
|-----------|-----------------|----------|---------------------|------------------|
| Next.js 14 | 14.2.x | ~Sep 2025 (Next 15 GA) | Security vulns, missing features | Q1 2026 |
| React 18 | 18.3.x | ~2025 (React 19 GA) | Stale ecosystem | Q2 2026 |
| NestJS 10 | 10.4.x | ~2025 (NestJS 11) | Security vulns | Q1 2026 |
| @nestjs/testing (dev) | 11.1.27 | N/A (NestJS 11) | Version mismatch with runtime (10.x) | Next major sync |

**Note:** `@nestjs/testing` is at version 11.x while the runtime is at 10.x. This mismatch should be resolved in a future upgrade cycle to align versions.

## 10. License Compliance Summary

| License | Count | Notes |
|---------|-------|-------|
| MIT | ~60 | Permissive, no restrictions |
| Apache-2.0 | ~12 | Permissive, includes patent grant |
| BSD-3-Clause | 3 | Permissive |
| ISC | 1 | Permissive (lucide-react) |
| Standard | 1 | GSAP — requires paid license for commercial use |

**License risks:**
- **GSAP (Standard License):** Free for personal/non-commercial use. If portfolio generates revenue, a GSAP Business license (~$299/year) is required. Evaluate replacing with Framer Motion-only animations.
- **All other licenses** are permissive open-source and compatible with commercial use.

## 11. Upgrade Procedures

| Upgrade Type | Process | Timeline |
|-------------|---------|----------|
| **Security patch** | Dependabot PR → CI must pass → merge | < 7 days |
| **Minor version** | Manual branch → staging deploy → QA → merge | < 30 days |
| **Major version** | Migration branch → staging QA for 1 week → scheduled release | Per roadmap |

**Major upgrade always requires:** read migration guide, test all affected functionality in staging, update this inventory document post-migration.
