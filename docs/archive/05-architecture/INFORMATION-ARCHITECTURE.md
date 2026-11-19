# Information Architecture

Defines the site structure, navigation hierarchy, URL patterns, content organization, breadcrumb strategy, and search strategy for the Ultimate Portfolio. Two distinct zones: the public portfolio (recruiter-facing) and the admin dashboard (owner-facing).

---

## 1. Target Audiences

| Audience                     | Goals                                            | Entry Point               |
| ---------------------------- | ------------------------------------------------ | ------------------------- |
| Recruiters / Hiring Managers | Assess skills, see projects, evaluate fit        | Homepage (`/`)            |
| Peer Developers              | Read blog, explore technical depth, inspect code | Blog (`/blog`)            |
| Potential Clients            | View services, see case studies, contact         | Services / Contact        |
| Portfolio Owner (Admin)      | Manage content, view analytics, moderate leads   | Admin (`/admin/login`)    |
| Content Editors              | Write blog posts, update projects                | Admin (`/admin/projects`) |

---

## 2. Public Portfolio Site Map

### 2.1 Navigation Structure

```
Home â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”œâ”€â”€ About (static page)                                                    â”‚
â”‚   â”œâ”€â”€ Biography                                                          â”‚
â”‚   â”œâ”€â”€ Skills (filterable grid by category)                               â”‚
â”‚   â””â”€â”€ Experience Timeline                                                â”‚
â”œâ”€â”€ Projects â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 60s, generateStaticParams]
│   └── [slug] — Case study with 3D gallery, tech stack, live demo links  │
â”œâ”€â”€ Blog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 300s, generateStaticParams]
â”‚   â”œâ”€â”€ Category filter                                                    â”‚
│   └── [slug] — Article with ToC sidebar, reading time, related posts     │
â”œâ”€â”€ Achievements â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 300s]                  â”‚
â”‚   â”œâ”€â”€ Certifications                                                     â”‚
â”‚   â”œâ”€â”€ Awards                                                             â”‚
â”‚   â””â”€â”€ Open Source Contributions                                          â”‚
â”œâ”€â”€ Case Studies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 300s]                  â”‚
│   └── [slug] — Deep-dive technical case study                            │
â”œâ”€â”€ Guest Appearances â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 300s]                  â”‚
â”‚   â””â”€â”€ Podcasts, interviews, conference talks                             â”‚
â”œâ”€â”€ Press Features â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 300s]                  â”‚
â”œâ”€â”€ Reading List â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [ISR 300s]                 â”‚
â”‚   â””â”€â”€ Book/article recommendations with notes                            â”‚
â”œâ”€â”€ AI Assistant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [Dynamic, client-rendered]
â”‚   â””â”€â”€ Chat interface, RAG over portfolio content                         â”‚
â””â”€â”€ Contact â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [Dynamic, client-rendered]
    â”œâ”€â”€ Contact form (name, email, message, captcha)                       â”‚
    â””â”€â”€ AI Chat fallback                                                    â”‚
```

### 2.2 URL Structure

| Pattern              | Example                         | Strategy                   | Cache TTL |
| -------------------- | ------------------------------- | -------------------------- | --------- |
| `/`                  | Homepage                        | ISR                        | 60s       |
| `/about`             | About page                      | ISR                        | 60s       |
| `/projects`          | Project listing                 | ISR                        | 60s       |
| `/projects/[slug]`   | `/projects/e-commerce-platform` | ISR + generateStaticParams | 60s       |
| `/blog`              | Blog listing                    | ISR                        | 300s      |
| `/blog/[slug]`       | `/blog/nestjs-patterns`         | ISR + generateStaticParams | 300s      |
| `/achievements`      | Achievements                    | ISR                        | 300s      |
| `/case-studies`      | Case studies                    | ISR                        | 300s      |
| `/guest-appearances` | Guest appearances               | ISR                        | 300s      |
| `/press`             | Press features                  | ISR                        | 300s      |
| `/reading-list`      | Reading list                    | ISR                        | 300s      |
| `/ai-assistant`      | AI chat                         | Dynamic                    | None      |
| `/contact`           | Contact form                    | Dynamic                    | None      |

### 2.3 Public Navigation Elements

**Desktop Top Nav (sticky):** Logo (home) | Projects | Blog | About | AI Assistant toggle | Theme toggle

**Mobile Nav:** Hamburger menu (Radix UI Dialog) with all top-level links + bottom tab bar with Home and AI Chat shortcut

**Breadcrumbs:** `Home > Projects > [Project Name]` — applied on all detail pages (`apps/web/src/app/projects/[slug]`, `apps/web/src/app/blog/[slug]`)

---

## 3. Admin Dashboard Site Map

### 3.1 Navigation Structure

```
Admin Login â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [No auth]
â””â”€â”€ Admin Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ [Auth: admin/editor/viewer]
    â”œâ”€â”€ Overview â”€â”€â”€ Analytics summary, recent leads, recent activity      â”‚
    â”œâ”€â”€ Content Management                                                  â”‚
    â”‚   â”œâ”€â”€ Sections â”€â”€â”€â”€ Homepage sections editor (visibility, order)      â”‚
    â”‚   â”œâ”€â”€ Projects â”€â”€â”€â”€ CRUD + bulk operations                            â”‚
    â”‚   â”œâ”€â”€ Blog â”€â”€â”€â”€â”€â”€â”€â”€â”€ CRUD + publish/unpublish + bulk                  â”‚
    â”‚   â”œâ”€â”€ Skills â”€â”€â”€â”€â”€â”€â”€ CRUD + category management                      â”‚
    â”‚   â”œâ”€â”€ Experiences â”€â”€ CRUD + sort order                                â”‚
    â”‚   â”œâ”€â”€ Services â”€â”€â”€â”€â”€ CRUD + pricing                                  â”‚
    â”‚   â”œâ”€â”€ Testimonials â”€ CRUD                                             â”‚
    â”‚   â”œâ”€â”€ FAQs â”€â”€â”€â”€â”€â”€â”€â”€â”€ CRUD + ordering                                  â”‚
    â”‚   â”œâ”€â”€ Case Studies â”€â”€ CRUD + featured toggle                          â”‚
    â”‚   â”œâ”€â”€ Achievements â”€â”€ CRUD + categories                               â”‚
    â”‚   â”œâ”€â”€ Press Features â”€ CRUD                                           â”‚
    â”‚   â”œâ”€â”€ Guest Appearances â”€ CRUD                                        â”‚
    â”‚   â””â”€â”€ Reading List â”€â”€â”€ CRUD                                           â”‚
    â”œâ”€â”€ Communications                                                      â”‚
    â”‚   â”œâ”€â”€ Leads â”€â”€â”€â”€â”€â”€â”€â”€â”€ Inbox, export CSV, mark as read                 â”‚
    â”‚   â”œâ”€â”€ Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ View conversations, delete                     â”‚
    â”‚   â””â”€â”€ Notifications â”€â”€ Admin alerts (new leads, errors)               â”‚
    â”œâ”€â”€ System                                                              â”‚
    â”‚   â”œâ”€â”€ Media â”€â”€â”€â”€â”€â”€â”€â”€â”€ Uploaded files, images, 3D assets               â”‚
    â”‚   â”œâ”€â”€ Settings â”€â”€â”€â”€â”€â”€ Site configuration, AI prompts                  â”‚
    â”‚   â”œâ”€â”€ API Keys â”€â”€â”€â”€â”€â”€ Manage programmatic access                      â”‚
    â”‚   â”œâ”€â”€ Activity Log â”€â”€ Full audit trail with filters                   â”‚
    â”‚   â”œâ”€â”€ Feature Flags â”€ Toggle features on/off                          â”‚
    â”‚   â”œâ”€â”€ Availability â”€â”€ Set online/offline/busy status                  â”‚
    â”‚   â”œâ”€â”€ Users â”€â”€â”€â”€â”€â”€â”€â”€â”€ Manage admin users and roles                    â”‚
    â”‚   â””â”€â”€ Sandbox â”€â”€â”€â”€â”€â”€â”€ WebContainer-based in-browser IDE               â”‚
    â””â”€â”€ Admin Actions                                                        â”‚
        â”œâ”€â”€ CSV Export â”€â”€â”€â”€ Leads, analytics data                           â”‚
        â”œâ”€â”€ Cache Cleanup â”€â”€ Purge/invalidate caches                        â”‚
        â””â”€â”€ Data Cleanup â”€â”€ Hard-delete soft-deleted records                â”‚
```

### 3.2 Admin URL Structure

| Pattern                    | Auth Role             |
| -------------------------- | --------------------- |
| `/admin/login`             | None                  |
| `/admin`                   | admin, editor, viewer |
| `/admin/sections`          | admin, editor, viewer |
| `/admin/projects`          | admin, editor, viewer |
| `/admin/blog`              | admin, editor, viewer |
| `/admin/skills`            | admin, editor, viewer |
| `/admin/experiences`       | admin, editor, viewer |
| `/admin/services`          | admin, editor, viewer |
| `/admin/testimonials`      | admin, editor, viewer |
| `/admin/faqs`              | admin, editor, viewer |
| `/admin/case-studies`      | admin, editor, viewer |
| `/admin/achievements`      | admin, editor, viewer |
| `/admin/press-features`    | admin, editor, viewer |
| `/admin/guest-appearances` | admin, editor, viewer |
| `/admin/reading-list`      | admin, editor, viewer |
| `/admin/leads`             | admin, editor, viewer |
| `/admin/chat`              | admin, editor, viewer |
| `/admin/notifications`     | admin, editor, viewer |
| `/admin/media`             | admin, editor         |
| `/admin/settings`          | admin, editor         |
| `/admin/api-keys`          | admin, editor, viewer |
| `/admin/activities`        | admin, editor, viewer |
| `/admin/feature-flags`     | admin, editor         |
| `/admin/availability`      | admin, editor         |
| `/admin/users`             | admin                 |
| `/admin/sandbox`           | admin, editor         |

---

## 4. Breadcrumb Strategy

| Page               | Breadcrumb Trail                       |
| ------------------ | -------------------------------------- |
| Public homepage    | Home                                   |
| Project listing    | Home > Projects                        |
| Project detail     | Home > Projects > [Project Title]      |
| Blog listing       | Home > Blog                            |
| Blog detail        | Home > Blog > [Post Title]             |
| Admin dashboard    | Dashboard                              |
| Admin project list | Dashboard > Projects                   |
| Admin project edit | Dashboard > Projects > [Project Title] |

Breadcrumbs are server-side rendered using `generateMetadata` and path segment parsing. The last segment is the current page (not linked).

---

## 5. Search Strategy

### 5.1 Public Search (AI-Powered)

The public search is not a traditional keyword search. It uses the AI Assistant:

- **Trigger:** `Cmd+K` omnibox modal on any public page
- **Mechanism:** User query is sent to `POST /api/ai/chat` (FastAPI). The AI performs RAG over DocumentChunks (vectorized portfolio content) and returns relevant content links.
- **Fallback:** If AI service is unavailable, the omnibox shows a "Search not available" message with direct navigation links.

### 5.2 Admin Search (Client-Side)

Admin tables (projects, blog, leads, etc.) use client-side filtering:

- **Filter-based:** TanStack Query refetches with query parameters (`search`, `category`, `sort`, `order`) as seen in `apps/web/src/lib/hooks/useProjects.ts:13-26`
- **Pagination:** Page-based pagination via `page` and `per_page` parameters. Returned with `{ data, meta }` where meta includes `total`, `page`, `per_page`, `total_pages`.
- **No AI in admin:** Admin search is deterministic, fast, and server-side filtered via Prisma `where` clauses.

---

## 6. Content Organization & Taxonomy

### 6.1 Tag System

Tags are hierarchical and descriptive:

- **Tech Tags:** React, Next.js, NestJS, TypeScript, Python, FastAPI, Three.js, PostgreSQL, Docker, AWS
- **Category Tags:** Web App, CLI Tool, Machine Learning, Open Source, Design System
- **Status Tags:** Featured, Draft, Published, Archived

### 6.2 SEO Metadata

Every public page includes:

- `<title>` and `<meta name="description">`
- OpenGraph (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Cards (`twitter:card`, `twitter:title`, `twitter:description`)
- `schema.org/Article` or `schema.org/CreativeWork` JSON-LD on detail pages

Metadata is generated in `generateMetadata` functions per page using the API data for dynamic content.

## Cross-References

- [../MASTER-INDEX.md](../../MASTER-INDEX.md) — Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) — Cross-reference system
