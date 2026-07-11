# ADR-002: Next.js 14 App Router for Frontend

> **Status:** Accepted | **Date:** 2026-06-17 | **Author:** Architecture Board  
> **Deciders:** Staff Frontend Architect, Principal UX Architect  
> **Reference:** [10-TECHSTACK.md](../architecture/10-TECHSTACK.md) | [SystemArchitecture.md §2](../architecture/SystemArchitecture.md)

## Context

The portfolio frontend needs to support: ISR for public pages (SEO + performance), client-side interactivity for admin dashboard, server components for data-heavy pages, streaming for AI chat, and deployment on Vercel's edge network. The choice of frontend framework directly impacts rendering strategy, bundle size, SEO capability, and developer experience.

## Decision

We adopt **Next.js 14** with the **App Router** (React Server Components) as the frontend framework.

## Options Considered

| Option                       | Pros                                                                                                                     | Cons                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **Next.js 14 App Router** ✅ | ISR built-in, RSC for zero-JS pages, streaming SSR, Vercel deployment synergy, massive ecosystem, TypeScript first-class | App Router still maturing, some RSC edge cases, Vercel lock-in risk     |
| **Remix**                    | Excellent data loading patterns, nested routes, progressive enhancement                                                  | Weaker ISR support, smaller ecosystem, less Vercel optimization         |
| **Astro**                    | Best static performance, island architecture, framework-agnostic                                                         | Weak for interactive admin SPA, no native SSR streaming                 |
| **SvelteKit**                | Smallest bundle, great DX, fast runtime                                                                                  | Smaller ecosystem, fewer UI component libraries, team unfamiliarity     |
| **Gatsby**                   | Static-first, plugin ecosystem, GraphQL data layer                                                                       | Slow builds, declining community, overkill data layer for this use case |

## Consequences

### Positive

- ISR with 60s revalidation delivers sub-100ms CDN-cached page loads globally
- React Server Components eliminate client JS for public pages (< 100KB initial bundle)
- App Router's layout system provides clean route groups: `(public)`, `(auth)`, `admin`
- Streaming SSR enables progressive loading for AI chat responses
- Vercel auto-detects Next.js for optimized deployment (edge functions, ISR cache)

### Negative

- App Router patterns differ from Pages Router — existing Next.js knowledge partially transfers
- RSC + Client Component boundary requires careful `'use client'` placement
- Vercel deployment creates soft lock-in (mitigated by Docker + `next start` portability)

## Compliance

- Aligns with Constitution §2.2: "Edge-first delivery, sub-100ms page loads"
- Aligns with Constitution §4.1: "React ecosystem for component library availability"
