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
Home Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ About (static page)                                                    Ã¢â€â€š
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Biography                                                          Ã¢â€â€š
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Skills (filterable grid by category)                               Ã¢â€â€š
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Experience Timeline                                                Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Projects Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 60s, generateStaticParams]
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ [slug] Ã¢â‚¬â€ Case study with 3D gallery, tech stack, live demo links  Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Blog Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 300s, generateStaticParams]
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Category filter                                                    Ã¢â€â€š
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ [slug] Ã¢â‚¬â€ Article with ToC sidebar, reading time, related posts     Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Achievements Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 300s]                  Ã¢â€â€š
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Certifications                                                     Ã¢â€â€š
Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Awards                                                             Ã¢â€â€š
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Open Source Contributions                                          Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Case Studies Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 300s]                  Ã¢â€â€š
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ [slug] Ã¢â‚¬â€ Deep-dive technical case study                            Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Guest Appearances Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 300s]                  Ã¢â€â€š
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Podcasts, interviews, conference talks                             Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Press Features Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 300s]                  Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Reading List Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [ISR 300s]                 Ã¢â€â€š
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Book/article recommendations with notes                            Ã¢â€â€š
Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ AI Assistant Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [Dynamic, client-rendered]
Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Chat interface, RAG over portfolio content                         Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Contact Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [Dynamic, client-rendered]
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Contact form (name, email, message, captcha)                       Ã¢â€â€š
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ AI Chat fallback                                                    Ã¢â€â€š
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

**Breadcrumbs:** `Home > Projects > [Project Name]` Ã¢â‚¬â€ applied on all detail pages (`apps/web/src/app/projects/[slug]`, `apps/web/src/app/blog/[slug]`)

---

## 3. Admin Dashboard Site Map

### 3.1 Navigation Structure

```
Admin Login Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [No auth]
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Admin Dashboard Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ [Auth: admin/editor/viewer]
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Overview Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Analytics summary, recent leads, recent activity      Ã¢â€â€š
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Content Management                                                  Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Sections Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Homepage sections editor (visibility, order)      Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Projects Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + bulk operations                            Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Blog Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + publish/unpublish + bulk                  Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Skills Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + category management                      Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Experiences Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + sort order                                Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Services Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + pricing                                  Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Testimonials Ã¢â€â‚¬ CRUD                                             Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ FAQs Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + ordering                                  Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Case Studies Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + featured toggle                          Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Achievements Ã¢â€â‚¬Ã¢â€â‚¬ CRUD + categories                               Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Press Features Ã¢â€â‚¬ CRUD                                           Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Guest Appearances Ã¢â€â‚¬ CRUD                                        Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Reading List Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ CRUD                                           Ã¢â€â€š
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Communications                                                      Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Leads Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Inbox, export CSV, mark as read                 Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Chat Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ View conversations, delete                     Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Notifications Ã¢â€â‚¬Ã¢â€â‚¬ Admin alerts (new leads, errors)               Ã¢â€â€š
    Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ System                                                              Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Media Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Uploaded files, images, 3D assets               Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Settings Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Site configuration, AI prompts                  Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ API Keys Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Manage programmatic access                      Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Activity Log Ã¢â€â‚¬Ã¢â€â‚¬ Full audit trail with filters                   Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Feature Flags Ã¢â€â‚¬ Toggle features on/off                          Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Availability Ã¢â€â‚¬Ã¢â€â‚¬ Set online/offline/busy status                  Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Users Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Manage admin users and roles                    Ã¢â€â€š
    Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Sandbox Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ WebContainer-based in-browser IDE               Ã¢â€â€š
    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Admin Actions                                                        Ã¢â€â€š
        Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ CSV Export Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ Leads, analytics data                           Ã¢â€â€š
        Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ Cache Cleanup Ã¢â€â‚¬Ã¢â€â‚¬ Purge/invalidate caches                        Ã¢â€â€š
        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ Data Cleanup Ã¢â€â‚¬Ã¢â€â‚¬ Hard-delete soft-deleted records                Ã¢â€â€š
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

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
