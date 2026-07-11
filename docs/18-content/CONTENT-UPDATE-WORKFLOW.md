# Content Update Workflow

> **Document:** `18-content/CONTENT-UPDATE-WORKFLOW.md` | **Version:** 1.0 | **Last Updated:** July 2026
> **Status:** ✅ Active | **Owner:** Product Owner | **Related:** ContentArchitecture.md

---

## 1. Who Can Update Content

| Role | Permissions | Authentication |
|------|-------------|---------------|
| **admin** | Full CRUD on all content types, user management, settings | JWT + OAuth (Google/GitHub) |
| **editor** | CRUD on projects, blog posts, testimonials; no user management | JWT + OAuth (Google/GitHub) |
| **viewer** | Read-only access to admin dashboard | JWT + OAuth (Google/GitHub) |

## 2. Content Types & Update Methods

### Sections (Hero, About, Skills, Experience, Stats, FAQ, Clients, Services)

- **Method:** Real-time via admin CMS form
- **Effect:** Immediate on save — `PATCH /api/admin/sections/:id`
- **Cache:** ISR revalidation triggered automatically (60s max delay)
- **Validation:** Zod schema on shared DTO, required fields enforced

### Projects

- **Method:** Admin form with markdown-rich content, image upload, tech stack tags
- **Effect:** Immediate on save with image processing pipeline (auto WebP/AVIF conversion, thumbnail generation)
- **Private projects:** Optional NDA password-gated access
- **Validation:** Slug uniqueness, required title, at least one image recommended

### Blog Posts

- **Method:** Rich text editor (TipTap) with image embedding, category tags, SEO fields
- **Options:** Save as draft, schedule for future publish, or publish immediately
- **Validation:** Title required, content minimum length enforced, slug auto-generated

### All Portfolio Content (ISR Revalidation)

```
Admin saves content → API updates database → Admin controller triggers ISR revalidation
→ Next.js regenerates stale page(s) → New content visible within 60 seconds
```

## 3. Image Optimization Pipeline

1. Upload to Supabase Storage via admin form
2. Server resizes to predefined variants (thumbnail 800×600, full 1920×1080)
3. Auto-converts to WebP (AVIF when browser supports it)
4. Stores original + variants in `media_assets` table
5. `next/image` applies client-side optimization (lazy loading, blur placeholder)

## 4. Content Review Process

| Content Type | Reviewer | Required? | Notes |
|-------------|----------|-----------|-------|
| Sections | Self-review | No | Preview before save |
| Projects | Self-review | No | Preview on desktop + mobile |
| Blog posts | Peer review | Recommended | Fact-check, tone check |
| Testimonials | Source person | Yes | Must have permission to publish |
| Case studies | Peer review | Recommended | Accuracy check |

## 5. Content Backup

- **Database:** Daily automated Supabase backups (7-day retention); Pro plan adds PITR
- **Media:** Supabase Storage with versioning; media remains if DB restored
- **No separate content backup needed** — database backups cover all structured content; media is stored separately with its own retention

## 6. Content Update Checklist

Before publishing any content change, verify:

- [ ] Preview on desktop + mobile viewports
- [ ] All images load and display correctly
- [ ] Accessibility — alt text present, headings semantic, links descriptive
- [ ] SEO — title tag (50-60 chars), meta description (150-160 chars), slug correct
- [ ] Links — internal and external links work
- [ ] Content accuracy — dates, names, metrics correct
- [ ] Spelling and grammar — no typos
- [ ] No placeholder or lorem-ipsum content

## 7. Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Content not updating on portfolio | ISR cache not revalidated | Wait 60s or trigger manual revalidation via admin panel |
| Image upload fails | File too large or wrong format | Max 5MB, supported: PNG, JPG, GIF, WebP, SVG |
| Slug conflict | Duplicate slug | Auto-generate from title with suffix or manual override |
| Dark mode content not visible | Color contrast issue | Check against design token palette, verify contrast ≥ 4.5:1 |
| Rich text formatting lost | HTML stripped by sanitizer | Use allowed tags only (h2-h4, p, ul, ol, li, a, code, pre, blockquote) |

---

*Document Version: 1.0 | Last Updated: July 2026*
