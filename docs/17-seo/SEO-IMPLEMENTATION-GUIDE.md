# SEO Implementation Guide

> **Document:** `SEO-IMPLEMENTATION-GUIDE.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Parent Document:** `SEO-ARCHITECTURE.md` — this is the hands-on companion guide

---

## 1. Technical SEO Foundation

### 1.1 Rendering & Caching

| Page Type | Strategy | ISR Revalidation | Cache Headers |
|-----------|----------|-----------------|---------------|
| Public (home, projects, blog, about, contact) | ISR (pre-rendered at build + revalidated) | 60s via `revalidate: 60` in `fetch` or page config | CDN: `s-maxage=60`, `stale-while-revalidate=60` |
| Admin (`/admin/*`) | SSR (dynamic, per-request) | N/A — never cached | `no-cache, no-store, must-revalidate` |
| Static assets (images, fonts, `/_next/static`) | Static | N/A | `public, max-age=31536000, immutable` |

**Implementation:** Public page data fetches use `{ cache: 'force-cache', next: { revalidate: 60 } }` or page-level `export const revalidate = 60`. See `docs/07-frontend/RENDERING-STRATEGY.md`.

### 1.2 Meta Tags Per Page

Root layout (`apps/web/src/app/layout.tsx`) sets defaults; each page extends via `generateMetadata()`:

```typescript
// Pattern — apps/web/src/app/layout.tsx (roots)
export const metadata: Metadata = {
  metadataBase: new URL('https://portfolioowner.com'),
  title: { default: 'Portfolio Owner — Full Stack Developer', template: '%s | Portfolio' },
  description: 'Full Stack Developer specializing in React, TypeScript, and Node.js.',
};

// Pattern — per-page (e.g. apps/web/src/app/(portfolio)/projects/[slug]/page.tsx)
export async function generateMetadata({ params }): Promise<Metadata> {
  const project = await getProject(params.slug);
  return {
    title: project.title,
    description: project.excerpt?.slice(0, 158),
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${project.title} | Portfolio`, images: [{ url: `/og/projects/${project.slug}`, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title: `${project.title} | Portfolio` },
  };
}
```

### 1.3 Semantic HTML Structure

```
<header role="banner"> → <nav aria-label="Main navigation">
<main id="main-content">
  <h1> — exactly one per page
  <section aria-labelledby="section-heading">
    <h2 id="section-heading"> — logical hierarchy, no skipped levels
    <h3>, <h4> as needed
  </section>
</main>
<footer role="contentinfo">
<nav aria-label="Breadcrumb"> with aria-current="page"
```

### 1.4 Structured Data / JSON-LD

All schemas are injected via the `JsonLd` component (`apps/web/src/components/JsonLd.tsx`) using `next/script` with `strategy="afterInteractive"`:

| Page | Schema Types | Source File |
|------|-------------|-------------|
| Homepage | `Person`, `WebSite`, `SiteNavigationElement` | `lib/schema.ts` → `personSchema()`, `websiteSchema()` |
| Projects | `CreativeWork`, `BreadcrumbList` | `projectSchema()`, `breadcrumbSchema()` |
| Blog | `BlogPosting`, `BreadcrumbList` | `blogPostSchema()`, `breadcrumbSchema()` |
| FAQ | `FAQPage` | `faqSchema()` |
| All pages | `BreadcrumbList` (breadcrumbs component) | `breadcrumbSchema()` |

### 1.5 Sitemap & Robots

- **Sitemap:** Dynamic via `apps/web/src/app/sitemap.ts` (App Router). Includes all public content routes. Priority: home=1.0, projects listing=0.9, project detail=0.8, blog listing=0.7, blog posts=0.6, contact=0.5.
- **Robots.txt:** Dynamic via `apps/web/src/app/robots.ts`. Disallows `/admin/`, `/api/`, `/_next/`, `/404`, `/500`. Blocks AI crawlers (GPTBot, CCBot, anthropic-ai). Sitemap URL declared.
- **Canonical URLs:** Every public page has a self-referencing canonical via `alternates: { canonical: path }` in `generateMetadata()`.

---

## 2. On-Page SEO

| Element | Standard | Example |
|---------|----------|---------|
| Title tag | `"Page Name | Portfolio"`, 50-60 chars | `"E-Commerce Dashboard | Portfolio"` |
| Meta description | 150-160 chars, includes primary keyword | `"A full-stack e-commerce dashboard built with React, Node.js, and PostgreSQL featuring real-time analytics."` |
| H1 | One per page, matches title intent | `"E-Commerce Dashboard"` |
| H2-H3 | Logical sub-topics, no gaps | H2: "Architecture", H3: "Frontend", H3: "Backend" |
| Image alt text | Descriptive, includes context | `"Screenshot of sales analytics chart showing monthly revenue trends"` |
| URL structure | kebab-case, descriptive | `/projects/e-commerce-dashboard`, `/blog/nextjs-isr-guide` |

---

## 3. Content SEO

| Content Type | Requirements |
|-------------|-------------|
| Blog posts | Min 800 words, primary keyword in first 100 words, H2/H3 for section breaks, internal links to related posts/projects |
| Projects | Tech stack list, problem description, key features, external repo/demo links, screenshots with alt text |
| Case studies | Problem → Solution → Results format, include measurable metrics (performance gains, traffic increases) |

---

## 4. Performance SEO (Core Web Vitals)

| Metric | Target | How We Achieve It |
|--------|--------|-------------------|
| LCP | < 2.5s | ISR serves pre-rendered HTML; `next/image` with AVIF/WebP, lazy loading, proper sizing; preconnect to CDN origins |
| FID / INP | < 100ms / < 200ms | Minimal JS via Server Components; client components only at leaf level; code splitting via `optimizePackageImports` |
| CLS | < 0.1 | Fixed aspect ratio containers for images; font-display: swap; reserved space for dynamic elements |

**Image config** (from `next.config.js`):
- Formats: `['image/avif', 'image/webp']`
- Device sizes: `[640, 750, 828, 1080, 1200, 1920, 2048, 3840]`
- Remote origins: `images.unsplash.com`, `images.squiz.cloud`, `**.supabase.co`, `**.cloudinary.com`

---

## 5. Monitoring & Maintenance

| Activity | Tool | Frequency |
|----------|------|-----------|
| Index coverage monitoring | Google Search Console | Weekly |
| Lighthouse score regression | Lighthouse CI (blocking on PR) | Every PR |
| Broken link scan | `next-sitemap` post-build + Screaming Frog | Weekly |
| Core Web Vitals | Vercel Analytics + PageSpeed Insights | Continuous |
| Structured data validation | Google Rich Results Test | Per deploy |
| Full SEO audit | Screaming Frog + Ahrefs/SEMrush | Monthly |

### Monthly SEO Audit Checklist
1. Check Search Console for new crawl errors, index coverage drops
2. Run Lighthouse CI and compare scores against baseline
3. Scan for broken internal and external links
4. Verify all public pages have unique title and meta description
5. Re-validate structured data on all page types
6. Check Core Web Vitals in CrUX report
7. Review keyword rankings and identify content gaps
8. Update sitemap if new content types were added
9. Verify robots.txt is not blocking important pages
10. Check for duplicate content issues via canonical tags

---

## 6. Related Documentation

- `docs/17-seo/SEO-ARCHITECTURE.md` — Full enterprise SEO strategy & vision
- `docs/17-seo/SEO-CHECKLIST.md` — Quick-reference SEO checklist
- `docs/07-frontend/RENDERING-STRATEGY.md` — ISR/SSR/SSG rendering patterns
- `docs/13-testing/VISUAL-REGRESSION.md` — Visual regression testing for UI changes
- `apps/web/next.config.js` — Image optimization, caching headers
