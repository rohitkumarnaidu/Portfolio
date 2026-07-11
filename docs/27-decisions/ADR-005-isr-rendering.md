# ADR-005: ISR over SSR for Public Pages

> **Status:** Accepted | **Date:** 2026-06-17 | **Author:** Architecture Board  
> **Deciders:** Staff Frontend Architect, Principal Platform Engineer  
> **Reference:** [SystemArchitecture.md §2.2](../architecture/SystemArchitecture.md) | [PerformanceArchitecture.md](../quality/PerformanceArchitecture.md)

## Context

Public portfolio pages (homepage, projects, blog) need fast load times and good SEO. Content changes infrequently (admin updates sections/projects at most daily). We need to choose between: Static Site Generation (SSG), Server-Side Rendering (SSR), Incremental Static Regeneration (ISR), or Client-Side Rendering (CSR).

## Decision

We adopt **Incremental Static Regeneration (ISR)** with a **60-second revalidation** interval for public pages, and **SSR** only for admin pages.

## Options Considered

| Option                        | Pros                                                                                                      | Cons                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **ISR (60s revalidation)** ✅ | CDN-cached globally, sub-100ms TTFB, automatic background regeneration, SEO-friendly, minimal server cost | 60s staleness window, first request after revalidation is stale-while-revalidate |
| **SSG (build-time)**          | Fastest possible (fully static), zero runtime cost                                                        | Requires full rebuild on content change, slow builds with many pages             |
| **SSR (per-request)**         | Always fresh data, dynamic content                                                                        | Higher TTFB (~200-500ms), more serverless function invocations, higher cost      |
| **CSR (client-side)**         | Simplest implementation, no server                                                                        | Poor SEO, loading spinners, larger JS bundle, slower perceived performance       |

## Consequences

### Positive

- CDN-cached pages load in < 100ms globally (Vercel Edge Network)
- Content updates visible within 60 seconds without manual deployment
- Zero serverless function cost for cached pages (CDN serves static HTML)
- Full SEO: complete HTML in initial response, proper meta tags, structured data

### Negative

- 60-second staleness window: admin publishes change → visible in ≤ 60s
- First visitor after revalidation gets stale page (subsequent visitors get fresh)
- `revalidatePath()` / `revalidateTag()` for on-demand ISR adds implementation complexity

## Compliance

- Aligns with Constitution §2.2: "Edge-first delivery, sub-100ms page loads"
- Aligns with Constitution §1.1: "Cost-optimized — minimize serverless invocations"
