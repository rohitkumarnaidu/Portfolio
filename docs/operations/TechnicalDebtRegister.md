# Technical Debt Register

This register tracks known technical debts, compromises, and temporary workarounds within the Ultimate Portfolio project. 

| ID | Date Added | Component | Description | Impact | Mitigation Plan | Status |
|----|------------|-----------|-------------|--------|-----------------|--------|
| TD-01 | 2026-07-09 | AI Service | AI service (`apps/ai`) is currently a placeholder (empty FastAPI stub) without LangChain integration. | High | Blocks AI-native features (RAG, Chat). | Implement LangChain pipeline and pgvector queries in FastAPI. | Open |
| TD-02 | 2026-07-09 | API (Prisma) | Prisma schema generated types are tightly coupled to backend services; potential leakage into frontend. | Medium | If Prisma changes, DTOs must manually sync or we risk breaking the shared contract. | Map Prisma models to strictly typed Zod schemas in `packages/shared`. | Open |
| TD-03 | 2026-07-09 | Web | React Three Fiber (R3F) bundle size is large, impacting initial load time of the public portfolio. | Medium | Slower Time to Interactive (TTI) on low-end devices. | Implement lazy loading for 3D components and separate bundles. | Open |
| TD-04 | 2026-07-09 | Auth | Relying on simple JWT tokens stored in `localStorage` for the admin dashboard. | High | Vulnerable to XSS attacks. | Move to HttpOnly secure cookies for token storage. | Open |
| TD-05 | 2026-07-09 | CI/CD | Missing comprehensive E2E tests for the Next.js and NestJS integration. | Medium | Risk of regressions across API boundaries. | Introduce Playwright E2E tests covering core user flows. | Open |

## Managing Debt
Technical debt should be reviewed at the start of every iteration. High-impact items blocking critical paths must be prioritized.
