# SEO Checklist

> **Document:** `SEO-CHECKLIST.md` | **Version:** 1.0 | **Last Updated:** July 2026
> Use this as a quick-reference when launching pages or running audits.

---

## Pre-Launch

- [ ] XML sitemap submitted to Google Search Console and Bing Webmaster Tools
- [ ] `robots.txt` configured: disallow `/admin/`, `/api/`, `/_next/`; allow public pages
- [ ] Google Search Console verified (DNS TXT record)
- [ ] Google Analytics 4 configured with `next/script`
- [ ] Structured data validated via Google Rich Results Test for all page types
- [ ] `metadataBase` set in root layout to production URL
- [ ] `sitemap.ts` includes all public routes with correct priority/changefreq

## Per-Page

- [ ] Title tag: `"Page Name | Portfolio"`, 50-60 characters, unique
- [ ] Meta description: 150-160 characters, includes primary keyword, unique per page
- [ ] Exactly one `<h1>` matching page intent
- [ ] Heading hierarchy: no skipped levels (`h1 → h2 → h3`, never `h1 → h3`)
- [ ] All images have descriptive `alt` text (decorative images use `alt=""`)
- [ ] Self-referencing canonical URL via `alternates.canonical`
- [ ] Open Graph tags: `og:title`, `og:description`, `og:image` (1200x630), `og:url`
- [ ] Twitter Card: `summary_large_image` with title, description, image
- [ ] No broken internal links
- [ ] Semantic HTML landmarks: `<header>`, `<nav>`, `<main>`, `<footer>`

## Content

- [ ] Blog posts ≥ 800 words, keyword in first 100 words
- [ ] Internal links to related projects/blog posts
- [ ] Readable scannable structure: short paragraphs, H2 section breaks, bullet lists
- [ ] All images optimized: WebP/AVIF, lazy loaded, correct dimensions
- [ ] JSON-LD schema injected for the page type (Person, CreativeWork, BlogPosting, FAQ, etc.)

## Technical

- [ ] ISR with 60s revalidation for public pages (or page-level `revalidate: 60`)
- [ ] LCP < 2.5s, INP < 200ms, CLS < 0.1
- [ ] Mobile-friendly: responsive layout, touch targets ≥ 48px, font ≥ 16px
- [ ] HTTPS enforced (Vercel + Cloudflare auto-redirect)
- [ ] CDN caching: immutable cache headers on static assets, `s-maxage=60` on ISR pages
- [ ] No render-blocking resources above the fold

## Monitoring

- [ ] Google Search Console alerts configured (crawl errors, index coverage)
- [ ] Lighthouse CI block on SEO score drop (threshold ≥ 90)
- [ ] Monthly broken link scan via Screaming Frog or automated crawler
- [ ] Quarterly keyword ranking review
- [ ] Monthly Core Web Vitals check via PageSpeed Insights or CrUX

---

## Related

| Resource | Location |
|----------|----------|
| Implementation details | `docs/17-seo/SEO-IMPLEMENTATION-GUIDE.md` |
| Full architecture | `docs/17-seo/SEO-ARCHITECTURE.md` |
| Rendering patterns | `docs/07-frontend/RENDERING-STRATEGY.md` |

## Cross-References
- [MASTER-INDEX.md](../MASTER-INDEX.md) — Documentation master index
- [CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
