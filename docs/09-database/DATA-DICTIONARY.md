# Data Dictionary Ã¢â‚¬â€ Portfolio Database

> **Schema version:** Prisma (PostgreSQL) Ã¢â‚¬â€ 34 tables across 8 domains
> **Generated from:** `apps/api/prisma/schema.prisma`
> **Naming convention:** Snake case table names, camelCase model names

---

## 1. User & Auth

### `users` Ã¢â‚¬â€ User accounts with role-based access

| Field                 | Type        | Constraints                | Description                       | FK      | Indexed | Example                 |
| --------------------- | ----------- | -------------------------- | --------------------------------- | ------- | ------- | ----------------------- |
| id                    | UUID        | PK, Required               | Primary identifier                | Ã¢â‚¬â€ | PK      | `"a1b2c3d4-..."`        |
| email                 | VARCHAR     | Required, Unique           | Login email                       | Ã¢â‚¬â€ | Unique  | `"admin@portfolio.dev"` |
| display_name          | VARCHAR     | Required                   | Display name                      | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Jane Doe"`            |
| avatar_url            | VARCHAR     | Optional                   | Profile image URL                 | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`         |
| password_hash         | VARCHAR     | Optional                   | bcrypt hash (null for OAuth-only) | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"$2b$10$..."`          |
| role                  | `UserRole`  | Required, default: `admin` | `admin`, `editor`, `viewer`       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"admin"`               |
| is_active             | BOOLEAN     | Required, default: `true`  | Soft account toggle               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                  |
| failed_login_attempts | INT         | Required, default: `0`     | Brute-force counter               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `0`                     |
| locked_until          | TIMESTAMPTZ | Optional                   | Lockout expiry                    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `null`                  |
| metadata              | JSONB       | Required, default: `{}`    | Extensible profile data           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"timezone":"UTC"}`    |
| created_at            | TIMESTAMPTZ | Required, default: `now()` | Row creation timestamp            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2025-01-01T00:00:00Z`  |
| updated_at            | TIMESTAMPTZ | Required, auto             | Row update timestamp              | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2025-01-01T00:00:00Z`  |

### `sessions` Ã¢â‚¬â€ JWT refresh token sessions

| Field         | Type        | Constraints                | Description             | FK                          | Indexed | Example                |
| ------------- | ----------- | -------------------------- | ----------------------- | --------------------------- | ------- | ---------------------- |
| id            | UUID        | PK, Required               | Primary identifier      | Ã¢â‚¬â€                     | PK      | Ã¢â‚¬â€                |
| user_id       | UUID        | Required                   | Owner of session        | users(id) ON DELETE CASCADE | Yes     | Ã¢â‚¬â€                |
| refresh_token | VARCHAR     | Required, Unique           | Refresh token hash      | Ã¢â‚¬â€                     | Unique  | Ã¢â‚¬â€                |
| user_agent    | VARCHAR     | Optional                   | Client UA string        | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | `"Mozilla/5.0..."`     |
| ip_address    | VARCHAR     | Optional                   | Client IP               | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | `"203.0.113.1"`        |
| is_revoked    | BOOLEAN     | Required, default: `false` | Manual/timed revocation | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | `false`                |
| expires_at    | TIMESTAMPTZ | Required                   | Token lifespan end      | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | `2025-02-01T00:00:00Z` |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                 | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | Ã¢â‚¬â€                |

### `api_keys` Ã¢â‚¬â€ Programmatic access keys

| Field       | Type        | Constraints                 | Description                      | FK      | Indexed | Example                |
| ----------- | ----------- | --------------------------- | -------------------------------- | ------- | ------- | ---------------------- |
| id          | UUID        | PK, Required                | Ã¢â‚¬â€                          | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                |
| name        | VARCHAR     | Required                    | Human-readable label             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"CI/CD Pipeline"`     |
| key_hash    | VARCHAR     | Required, Unique            | SHA-256 of full key              | Ã¢â‚¬â€ | Unique  | `"a1b2c3d4e5..."`      |
| key_prefix  | VARCHAR     | Required                    | First 8 chars for identification | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"pk_port_a1"`         |
| permissions | VARCHAR     | Required, default: `"read"` | `read`, `write`, `admin`         | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"read"`               |
| is_active   | BOOLEAN     | Required, default: `true`   | Soft enable/disable              | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                 |
| expires_at  | TIMESTAMPTZ | Optional                    | Key expiry                       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2026-01-01T00:00:00Z` |
| created_at  | TIMESTAMPTZ | Required, default: `now()`  | Ã¢â‚¬â€                          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |
| revoked_at  | TIMESTAMPTZ | Optional                    | When revoked                     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `null`                 |

---

## 2. Content

### `sections` Ã¢â‚¬â€ Portfolio page sections (hero, about, projects, etc.)

| Field             | Type        | Constraints                    | Description                 | FK      | Indexed         | Example             |
| ----------------- | ----------- | ------------------------------ | --------------------------- | ------- | --------------- | ------------------- |
| id                | UUID        | PK, Required                   | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | PK              | Ã¢â‚¬â€             |
| section_key       | VARCHAR     | Required, Unique               | Machine key, e.g. `"hero"`  | Ã¢â‚¬â€ | Unique          | `"hero"`            |
| section_label     | VARCHAR     | Required                       | Display label               | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"Hero Section"`    |
| section_type      | VARCHAR     | Optional                       | Content type hint           | Ã¢â‚¬â€ | Yes (composite) | `"markdown"`        |
| is_live           | BOOLEAN     | Required, default: `false`     | Published state             | Ã¢â‚¬â€ | Yes             | `true`              |
| style_preset      | VARCHAR     | Required, default: `"default"` | CSS class preset            | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"dark-gradient"`   |
| display_order     | INT         | Required, default: `0`         | Render ordering             | Ã¢â‚¬â€ | Yes             | `1`                 |
| min_items         | INT         | Required, default: `1`         | Min sub-items required      | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `1`                 |
| auto_publish      | BOOLEAN     | Required, default: `false`     | Auto-publish on save        | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `false`             |
| is_always_visible | BOOLEAN     | Required, default: `false`     | Bypass visibility logic     | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `true`              |
| style_config      | JSONB       | Required, default: `{}`        | Per-section style overrides | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `{"bg":"#000"}`     |
| content           | JSONB       | Required, default: `{}`        | Section body content        | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `{"title":"Hello"}` |
| created_at        | TIMESTAMPTZ | Required, default: `now()`     | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | Ã¢â‚¬â€         | Ã¢â‚¬â€             |
| updated_at        | TIMESTAMPTZ | Required, auto                 | Ã¢â‚¬â€                     | Ã¢â‚¬â€ | Ã¢â‚¬â€         | Ã¢â‚¬â€             |

### `projects` Ã¢â‚¬â€ Portfolio projects

| Field         | Type        | Constraints                | Description                          | FK      | Indexed         | Example                    |
| ------------- | ----------- | -------------------------- | ------------------------------------ | ------- | --------------- | -------------------------- |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€                              | Ã¢â‚¬â€ | PK              | Ã¢â‚¬â€                    |
| slug          | VARCHAR     | Required, Unique           | URL-safe identifier                  | Ã¢â‚¬â€ | Unique          | `"my-awesome-app"`         |
| title         | VARCHAR     | Required                   | Project name                         | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"My Awesome App"`         |
| description   | VARCHAR     | Optional                   | Short summary                        | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"A full-stack..."`        |
| tech_stack    | VARCHAR[]   | Required, default: `[]`    | Technology tags                      | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `["React","Node"]`         |
| live_url      | VARCHAR     | Optional                   | Deployment URL                       | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"https://..."`            |
| github_url    | VARCHAR     | Optional                   | Source repo                          | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"https://github.com/..."` |
| cover_image   | VARCHAR     | Optional                   | Hero image URL                       | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"https://..."`            |
| thumbnail_url | VARCHAR     | Optional                   | Card thumbnail                       | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"https://..."`            |
| is_featured   | BOOLEAN     | Required, default: `false` | Spotlight project                    | Ã¢â‚¬â€ | Yes             | `true`                     |
| is_private    | BOOLEAN     | Required, default: `false` | NDA-gated project                    | Ã¢â‚¬â€ | Yes (composite) | `false`                    |
| nda_password  | VARCHAR     | Optional                   | Access password for private projects | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `null`                     |
| category      | VARCHAR     | Optional                   | Grouping category                    | Ã¢â‚¬â€ | Yes             | `"fullstack"`              |
| display_order | INT         | Required, default: `0`     | Sort order                           | Ã¢â‚¬â€ | Yes             | `1`                        |
| content       | JSONB       | Required, default: `{}`    | Rich project body                    | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `{"overview":"..."}`       |
| metrics       | JSONB       | Required, default: `{}`    | Performance/impact metrics           | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `{"users":1000}`           |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                              | Ã¢â‚¬â€ | Ã¢â‚¬â€         | Ã¢â‚¬â€                    |
| updated_at    | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€                              | Ã¢â‚¬â€ | Ã¢â‚¬â€         | Ã¢â‚¬â€                    |

### `project_images` Ã¢â‚¬â€ Gallery images per project

| Field         | Type        | Constraints                | Description            | FK                   | Indexed | Example            |
| ------------- | ----------- | -------------------------- | ---------------------- | -------------------- | ------- | ------------------ |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€                | Ã¢â‚¬â€              | PK      | Ã¢â‚¬â€            |
| project_id    | UUID        | Required                   | Parent project         | projects(id) CASCADE | Yes     | Ã¢â‚¬â€            |
| image_url     | VARCHAR     | Required                   | Image URL              | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `"https://..."`    |
| alt_text      | VARCHAR     | Optional                   | Accessibility alt text | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `"Dashboard view"` |
| display_order | INT         | Required, default: `0`     | Gallery sort           | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `1`                |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                | Ã¢â‚¬â€              | Ã¢â‚¬â€ | Ã¢â‚¬â€            |

### `blog_posts` Ã¢â‚¬â€ Blog articles

| Field             | Type        | Constraints                  | Description           | FK      | Indexed | Example                         |
| ----------------- | ----------- | ---------------------------- | --------------------- | ------- | ------- | ------------------------------- |
| id                | UUID        | PK, Required                 | Ã¢â‚¬â€               | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                         |
| slug              | VARCHAR     | Required, Unique             | URL slug              | Ã¢â‚¬â€ | Unique  | `"building-with-nextjs"`        |
| title             | VARCHAR     | Required                     | Post title            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Building with Next.js"`       |
| excerpt           | VARCHAR     | Optional                     | Short teaser          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"How I built..."`              |
| content           | TEXT        | Required, default: `""`      | Markdown/HTML body    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"## Introduction..."`          |
| cover_image       | VARCHAR     | Optional                     | Header image          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`                 |
| category          | VARCHAR     | Optional                     | Blog category         | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"technology"`                  |
| tags              | VARCHAR[]   | Required, default: `[]`      | Tag array             | Ã¢â‚¬â€ | GIN     | `["react","nextjs"]`            |
| author_name       | VARCHAR     | Required, default: `"Admin"` | Display author        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Jane Doe"`                    |
| read_time_minutes | INT         | Required, default: `5`       | Estimated read time   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `8`                             |
| is_published      | BOOLEAN     | Required, default: `false`   | Published state       | Ã¢â‚¬â€ | Yes     | `true`                          |
| is_featured       | BOOLEAN     | Required, default: `false`   | Featured post         | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `false`                         |
| seo_title         | VARCHAR     | Optional                     | Meta title override   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Building with Next.js Guide"` |
| seo_description   | VARCHAR     | Optional                     | Meta description      | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Learn how..."`                |
| published_at      | TIMESTAMPTZ | Optional                     | Publication timestamp | Ã¢â‚¬â€ | Yes     | `2025-06-01T00:00:00Z`          |
| created_at        | TIMESTAMPTZ | Required, default: `now()`   | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                         |
| updated_at        | TIMESTAMPTZ | Required, auto               | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                         |

### `post_tags` Ã¢â‚¬â€ Normalized blog post tags (junction)

| Field      | Type        | Constraints                | Description      | FK                     | Indexed | Example   |
| ---------- | ----------- | -------------------------- | ---------------- | ---------------------- | ------- | --------- |
| id         | UUID        | PK, Required               | Ã¢â‚¬â€          | Ã¢â‚¬â€                | PK      | Ã¢â‚¬â€   |
| post_id    | UUID        | Required                   | Referenced post  | blog_posts(id) CASCADE | Yes     | Ã¢â‚¬â€   |
| tag        | VARCHAR     | Required                   | Tag string       | Ã¢â‚¬â€                | Yes     | `"react"` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€          | Ã¢â‚¬â€                | Ã¢â‚¬â€ | Ã¢â‚¬â€   |
| **Unique** |             |                            | `(post_id, tag)` |                        |         |           |

### `case_studies` Ã¢â‚¬â€ Deep-dive project case studies (1:1 with Project)

| Field                 | Type        | Constraints                | Description            | FK                   | Indexed | Example                   |
| --------------------- | ----------- | -------------------------- | ---------------------- | -------------------- | ------- | ------------------------- |
| id                    | UUID        | PK, Required               | Ã¢â‚¬â€                | Ã¢â‚¬â€              | PK      | Ã¢â‚¬â€                   |
| project_id            | UUID        | Required                   | Parent project         | projects(id) CASCADE | Yes     | Ã¢â‚¬â€                   |
| challenge             | TEXT        | Optional                   | Problem statement      | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `"Needed to scale..."`    |
| approach              | TEXT        | Optional                   | Methodology            | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `"Used microservices..."` |
| solution              | TEXT        | Optional                   | Implemented solution   | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `"Built with..."`         |
| impact                | TEXT        | Optional                   | Results & metrics      | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `"50% perf improvement"`  |
| architecture_diagrams | VARCHAR[]   | Required, default: `[]`    | Diagram image URLs     | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `["https://..."]`         |
| code_snippets         | VARCHAR[]   | Required, default: `[]`    | Code block identifiers | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `["snippet-1"]`           |
| metrics               | JSONB       | Required, default: `{}`    | Impact KPIs            | Ã¢â‚¬â€              | Ã¢â‚¬â€ | `{"latency":"50ms"}`      |
| created_at            | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                | Ã¢â‚¬â€              | Ã¢â‚¬â€ | Ã¢â‚¬â€                   |
| updated_at            | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€                | Ã¢â‚¬â€              | Ã¢â‚¬â€ | Ã¢â‚¬â€                   |

---

## 3. Professional

### `skills` Ã¢â‚¬â€ Technical skills

| Field         | Type        | Constraints                | Description                    | FK      | Indexed | Example         |
| ------------- | ----------- | -------------------------- | ------------------------------ | ------- | ------- | --------------- |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€         |
| name          | VARCHAR     | Required                   | Skill name                     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"React"`       |
| category      | VARCHAR     | Required                   | e.g. `"frontend"`, `"backend"` | Ã¢â‚¬â€ | Yes     | `"frontend"`    |
| proficiency   | INT         | Required, default: `0`     | 0Ã¢â‚¬â€œ100 scale             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `95`            |
| icon_url      | VARCHAR     | Optional                   | Icon/image                     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."` |
| lottie_url    | VARCHAR     | Optional                   | Lottie animation URL           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."` |
| display_order | INT         | Required, default: `0`     | Sort order                     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`             |
| is_featured   | BOOLEAN     | Required, default: `false` | Show on homepage               | Ã¢â‚¬â€ | Yes     | `true`          |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€         |
| updated_at    | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€         |

### `experiences` Ã¢â‚¬â€ Work history entries

| Field            | Type        | Constraints                | Description               | FK      | Indexed | Example                |
| ---------------- | ----------- | -------------------------- | ------------------------- | ------- | ------- | ---------------------- |
| id               | UUID        | PK, Required               | Ã¢â‚¬â€                   | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                |
| company          | VARCHAR     | Required                   | Employer name             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Acme Corp"`          |
| role             | VARCHAR     | Required                   | Job title                 | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Senior Engineer"`    |
| description      | TEXT        | Optional                   | Responsibilities          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Led..."`             |
| technologies     | VARCHAR[]   | Required, default: `[]`    | Tech stack used           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `["React","Node"]`     |
| company_logo_url | VARCHAR     | Optional                   | Company logo              | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`        |
| company_url      | VARCHAR     | Optional                   | Company website           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://acme.com"`   |
| location         | VARCHAR     | Optional                   | Office location           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"San Francisco, CA"`  |
| start_date       | TIMESTAMPTZ | Required                   | Start date                | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2020-01-01T00:00:00Z` |
| end_date         | TIMESTAMPTZ | Optional                   | End date (null = current) | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2023-06-01T00:00:00Z` |
| is_current       | BOOLEAN     | Required, default: `false` | Currently employed        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `false`                |
| display_order    | INT         | Required, default: `0`     | Sort order                | Ã¢â‚¬â€ | Yes     | `1`                    |
| is_visible       | BOOLEAN     | Required, default: `true`  | Visibility toggle         | Ã¢â‚¬â€ | Yes     | `true`                 |
| created_at       | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |
| updated_at       | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€                   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |

### `achievements` Ã¢â‚¬â€ Awards, certifications, honors

| Field           | Type        | Constraints                | Description       | FK      | Indexed | Example                    |
| --------------- | ----------- | -------------------------- | ----------------- | ------- | ------- | -------------------------- |
| id              | UUID        | PK, Required               | Ã¢â‚¬â€           | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                    |
| title           | VARCHAR     | Required                   | Achievement name  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"AWS Certified"`          |
| issuer          | VARCHAR     | Optional                   | Issuing org       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Amazon"`                 |
| description     | TEXT        | Optional                   | Details           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Passed SAP..."`          |
| badge_image_url | VARCHAR     | Optional                   | Badge/medal image | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`            |
| category        | VARCHAR     | Optional                   | Grouping          | Ã¢â‚¬â€ | Yes     | `"certification"`          |
| achieved_date   | TIMESTAMPTZ | Optional                   | Date achieved     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2024-03-15T00:00:00Z`     |
| credential_url  | VARCHAR     | Optional                   | Verifiable link   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://credly.com/..."` |
| display_order   | INT         | Required, default: `0`     | Sort order        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`                        |
| created_at      | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                    |

### `services` Ã¢â‚¬â€ Offerings / consulting services

| Field         | Type        | Constraints                      | Description           | FK      | Indexed | Example                |
| ------------- | ----------- | -------------------------------- | --------------------- | ------- | ------- | ---------------------- |
| id            | UUID        | PK, Required                     | Ã¢â‚¬â€               | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                |
| title         | VARCHAR     | Required                         | Service name          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Web Development"`    |
| description   | TEXT        | Required                         | Service description   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Full-stack..."`      |
| icon          | VARCHAR     | Required, default: `"Ã°Å¸â€™Â»"` | Emoji/icon identifier | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Ã°Å¸Å¡â‚¬"`          |
| features      | VARCHAR[]   | Required, default: `[]`          | Bullet-point features | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `["Responsive","SEO"]` |
| pricing_tier  | VARCHAR     | Optional                         | Tier label            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Premium"`            |
| price_cents   | INT         | Optional                         | Price in cents        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `50000`                |
| cta_text      | VARCHAR     | Optional                         | Button label          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Get Started"`        |
| cta_url       | VARCHAR     | Optional                         | Button link           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"/contact"`           |
| display_order | INT         | Required, default: `0`           | Sort order            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`                    |
| is_active     | BOOLEAN     | Required, default: `true`        | Active/inactive       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                 |
| created_at    | TIMESTAMPTZ | Required, default: `now()`       | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |
| updated_at    | TIMESTAMPTZ | Required, auto                   | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |

### `faqs` Ã¢â‚¬â€ Frequently asked questions

| Field         | Type        | Constraints                | Description       | FK      | Indexed | Example                   |
| ------------- | ----------- | -------------------------- | ----------------- | ------- | ------- | ------------------------- |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€           | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                   |
| question      | VARCHAR     | Required                   | FAQ question      | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"What tech do you use?"` |
| answer        | TEXT        | Required                   | FAQ answer        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"I use React..."`        |
| category      | VARCHAR     | Optional                   | Grouping category | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"general"`               |
| display_order | INT         | Required, default: `0`     | Sort order        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`                       |
| is_visible    | BOOLEAN     | Required, default: `true`  | Visibility toggle | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                    |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                   |
| updated_at    | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                   |

### `testimonials` Ã¢â‚¬â€ Client/peer endorsements

| Field         | Type        | Constraints                | Description        | FK      | Indexed         | Example             |
| ------------- | ----------- | -------------------------- | ------------------ | ------- | --------------- | ------------------- |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€            | Ã¢â‚¬â€ | PK              | Ã¢â‚¬â€             |
| name          | VARCHAR     | Required                   | Person name        | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"John Smith"`      |
| role          | VARCHAR     | Required                   | Job title          | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"CTO"`             |
| company       | VARCHAR     | Required                   | Organization       | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"Acme Corp"`       |
| avatar_url    | VARCHAR     | Optional                   | Profile photo      | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"https://..."`     |
| content       | TEXT        | Required                   | Testimonial text   | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `"Amazing work..."` |
| rating        | INT         | Required, default: `5`     | 1Ã¢â‚¬â€œ5 stars   | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `5`                 |
| display_order | INT         | Required, default: `0`     | Sort order         | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `1`                 |
| is_verified   | BOOLEAN     | Required, default: `false` | Verification badge | Ã¢â‚¬â€ | Ã¢â‚¬â€         | `true`              |
| is_featured   | BOOLEAN     | Required, default: `false` | Show on homepage   | Ã¢â‚¬â€ | Yes (composite) | `true`              |
| is_visible    | BOOLEAN     | Required, default: `true`  | Visibility toggle  | Ã¢â‚¬â€ | Yes             | `true`              |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€            | Ã¢â‚¬â€ | Ã¢â‚¬â€         | Ã¢â‚¬â€             |
| updated_at    | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€            | Ã¢â‚¬â€ | Ã¢â‚¬â€         | Ã¢â‚¬â€             |

### `press_features` Ã¢â‚¬â€ Media/press mentions

| Field         | Type        | Constraints                | Description      | FK      | Indexed | Example                        |
| ------------- | ----------- | -------------------------- | ---------------- | ------- | ------- | ------------------------------ |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€          | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                        |
| publication   | VARCHAR     | Required                   | Publisher name   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"TechCrunch"`                 |
| title         | VARCHAR     | Required                   | Article title    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Startup Raises..."`          |
| url           | VARCHAR     | Optional                   | Article link     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://techcrunch.com/..."` |
| logo_url      | VARCHAR     | Optional                   | Publication logo | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`                |
| description   | TEXT        | Optional                   | Summary          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Featured for..."`            |
| featured_date | TIMESTAMPTZ | Optional                   | Publication date | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2025-05-01T00:00:00Z`         |
| display_order | INT         | Required, default: `0`     | Sort order       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`                            |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                        |

### `guest_appearances` Ã¢â‚¬â€ Podcasts, talks, interviews

| Field           | Type        | Constraints                | Description                          | FK      | Indexed | Example                |
| --------------- | ----------- | -------------------------- | ------------------------------------ | ------- | ------- | ---------------------- |
| id              | UUID        | PK, Required               | Ã¢â‚¬â€                              | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                |
| type            | VARCHAR     | Required                   | `"podcast"`, `"talk"`, `"interview"` | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"podcast"`            |
| title           | VARCHAR     | Required                   | Episode/talk title                   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"The Dev Show #42"`   |
| host            | VARCHAR     | Optional                   | Host or event name                   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"John Doe"`           |
| url             | VARCHAR     | Optional                   | Link to appearance                   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`        |
| cover_image_url | VARCHAR     | Optional                   | Episode artwork                      | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`        |
| description     | TEXT        | Optional                   | Summary                              | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Discussed..."`       |
| appearance_date | TIMESTAMPTZ | Optional                   | When it aired                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2025-04-15T00:00:00Z` |
| display_order   | INT         | Required, default: `0`     | Sort order                           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`                    |
| created_at      | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                              | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |

### `reading_list` Ã¢â‚¬â€ Book/article recommendations

| Field           | Type        | Constraints                | Description      | FK      | Indexed | Example              |
| --------------- | ----------- | -------------------------- | ---------------- | ------- | ------- | -------------------- |
| id              | UUID        | PK, Required               | Ã¢â‚¬â€          | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€              |
| title           | VARCHAR     | Required                   | Title            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Atomic Habits"`    |
| author          | VARCHAR     | Optional                   | Author name      | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"James Clear"`      |
| url             | VARCHAR     | Optional                   | Link to resource | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`      |
| cover_image_url | VARCHAR     | Optional                   | Book cover       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://..."`      |
| category        | VARCHAR     | Optional                   | Genre/type       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"self-improvement"` |
| recommendation  | TEXT        | Optional                   | Personal note    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"A must read..."`   |
| display_order   | INT         | Required, default: `0`     | Sort order       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `1`                  |
| created_at      | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€              |

---

## 4. Leads & CRM

### `leads` Ã¢â‚¬â€ Contact form / inbound leads

| Field      | Type        | Constraints                         | Description                   | FK      | Indexed | Example              |
| ---------- | ----------- | ----------------------------------- | ----------------------------- | ------- | ------- | -------------------- |
| id         | UUID        | PK, Required                        | Ã¢â‚¬â€                       | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€              |
| name       | VARCHAR     | Required                            | Contact name                  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Jane Doe"`         |
| email      | VARCHAR     | Required                            | Contact email                 | Ã¢â‚¬â€ | Yes     | `"jane@example.com"` |
| phone      | VARCHAR     | Optional                            | Phone number                  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"+1-555-0123"`      |
| company    | VARCHAR     | Optional                            | Organization                  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Acme Corp"`        |
| subject    | VARCHAR     | Optional                            | Message subject               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Project Inquiry"`  |
| message    | TEXT        | Required                            | Message body                  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"I'd like to..."`   |
| source     | VARCHAR     | Required, default: `"contact_form"` | Origin of lead                | Ã¢â‚¬â€ | Yes     | `"contact_form"`     |
| status     | VARCHAR     | Required, default: `"new"`          | Pipeline stage                | Ã¢â‚¬â€ | Yes     | `"new"`              |
| priority   | VARCHAR     | Required, default: `"normal"`       | `"low"`, `"normal"`, `"high"` | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"high"`             |
| ip_address | VARCHAR     | Optional                            | Submitter IP                  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"203.0.113.1"`      |
| metadata   | JSONB       | Required, default: `{}`             | Extra context                 | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"referrer":"..."}` |
| created_at | TIMESTAMPTZ | Required, default: `now()`          | Ã¢â‚¬â€                       | Ã¢â‚¬â€ | Yes     | Ã¢â‚¬â€              |
| updated_at | TIMESTAMPTZ | Required, auto                      | Ã¢â‚¬â€                       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€              |
| deleted_at | TIMESTAMPTZ | Optional                            | Soft-delete timestamp         | Ã¢â‚¬â€ | Yes     | `null`               |

### `lead_notes` Ã¢â‚¬â€ Internal notes on leads

| Field      | Type        | Constraints                | Description          | FK                 | Indexed | Example              |
| ---------- | ----------- | -------------------------- | -------------------- | ------------------ | ------- | -------------------- |
| id         | UUID        | PK, Required               | Ã¢â‚¬â€              | Ã¢â‚¬â€            | PK      | Ã¢â‚¬â€              |
| lead_id    | UUID        | Required                   | Parent lead          | leads(id) CASCADE  | Yes     | Ã¢â‚¬â€              |
| author_id  | UUID        | Optional                   | Admin who wrote note | users(id) SET NULL | Ã¢â‚¬â€ | Ã¢â‚¬â€              |
| content    | TEXT        | Required                   | Note body            | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"Called client..."` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€              | Ã¢â‚¬â€            | Ã¢â‚¬â€ | Ã¢â‚¬â€              |
| updated_at | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€              | Ã¢â‚¬â€            | Ã¢â‚¬â€ | Ã¢â‚¬â€              |

### `lead_activities` Ã¢â‚¬â€ Lead timeline events

| Field       | Type        | Constraints                | Description            | FK                 | Indexed | Example                           |
| ----------- | ----------- | -------------------------- | ---------------------- | ------------------ | ------- | --------------------------------- |
| id          | UUID        | PK, Required               | Ã¢â‚¬â€                | Ã¢â‚¬â€            | PK      | Ã¢â‚¬â€                           |
| lead_id     | UUID        | Required                   | Parent lead            | leads(id) CASCADE  | Yes     | Ã¢â‚¬â€                           |
| actor_id    | UUID        | Optional                   | Admin who acted        | users(id) SET NULL | Ã¢â‚¬â€ | Ã¢â‚¬â€                           |
| action      | VARCHAR     | Required                   | Activity type          | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"status_changed"`                |
| description | TEXT        | Optional                   | Human-readable summary | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"Status changed to contacted"`   |
| details     | JSONB       | Required, default: `{}`    | Structured data        | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `{"from":"new","to":"contacted"}` |
| ip_address  | VARCHAR     | Optional                   | Actor IP               | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"203.0.113.1"`                   |
| created_at  | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                | Ã¢â‚¬â€            | Ã¢â‚¬â€ | Ã¢â‚¬â€                           |

---

## 5. AI & Chat

### `chat_conversations` Ã¢â‚¬â€ Visitor chat sessions

| Field            | Type        | Constraints                | Description             | FK      | Indexed | Example         |
| ---------------- | ----------- | -------------------------- | ----------------------- | ------- | ------- | --------------- |
| id               | UUID        | PK, Required               | Ã¢â‚¬â€                 | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€         |
| session_id       | VARCHAR     | Required, Unique           | Browser/storage session | Ã¢â‚¬â€ | Unique  | `"sess_abc123"` |
| visitor_id       | VARCHAR     | Optional                   | Fingerprinted visitor   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"vis_xyz"`     |
| page_context     | VARCHAR     | Optional                   | Starting page URL       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"/projects"`   |
| message_count    | INT         | Required, default: `0`     | Total messages          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `12`            |
| created_at       | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                 | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€         |
| last_activity_at | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                 | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€         |
| deleted_at       | TIMESTAMPTZ | Optional                   | Soft-delete             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `null`          |

### `chat_messages` Ã¢â‚¬â€ Individual chat messages

| Field            | Type        | Constraints                | Description               | FK                             | Indexed | Example                          |
| ---------------- | ----------- | -------------------------- | ------------------------- | ------------------------------ | ------- | -------------------------------- |
| id               | UUID        | PK, Required               | Ã¢â‚¬â€                   | Ã¢â‚¬â€                        | PK      | Ã¢â‚¬â€                          |
| conversation_id  | UUID        | Required                   | Parent conversation       | chat_conversations(id) CASCADE | Yes     | Ã¢â‚¬â€                          |
| role             | VARCHAR     | Required                   | `"user"` or `"assistant"` | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | `"user"`                         |
| content          | TEXT        | Required                   | Message text              | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | `"What projects have you done?"` |
| tokens_used      | INT         | Required, default: `0`     | LLM token count           | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | `150`                            |
| response_time_ms | INT         | Required, default: `0`     | Latency                   | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | `1200`                           |
| metadata         | JSONB       | Required, default: `{}`    | Model, confidence, etc.   | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | `{"model":"claude-3"}`           |
| created_at       | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                   | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | Ã¢â‚¬â€                          |

### `content_embeddings` Ã¢â‚¬â€ Vector embeddings for RAG

| Field       | Type           | Constraints                | Description                                                   | FK      | Indexed | Example                 |
| ----------- | -------------- | -------------------------- | ------------------------------------------------------------- | ------- | ------- | ----------------------- |
| id          | UUID           | PK, Required               | Ã¢â‚¬â€                                                       | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                 |
| source_type | VARCHAR        | Required                   | Entity type: `"project"`, `"skill"`, `"blog"`, `"experience"` | Ã¢â‚¬â€ | Yes     | `"project"`             |
| source_id   | VARCHAR        | Required                   | Entity UUID                                                   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"a1b2c3d4-..."`        |
| chunk_index | INT            | Required, default: `0`     | Position within source                                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `0`                     |
| chunk_text  | TEXT           | Required                   | Text segment for embedding                                    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Built with React..."` |
| metadata    | JSONB          | Required, default: `{}`    | Source context                                                | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"title":"My App"}`    |
| created_at  | TIMESTAMPTZ    | Required, default: `now()` | Ã¢â‚¬â€                                                       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                 |
| updated_at  | TIMESTAMPTZ    | Required, auto             | Ã¢â‚¬â€                                                       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                 |
| **Unique**  |                |                            | `(source_type, source_id, chunk_index)`                       |         |         |                         |
| _embedding_ | _vector(1536)_ | _Raw SQL (pgvector)_       | _Actual vector stored via raw migration_                      | Ã¢â‚¬â€ | IVFFlat | `[0.001, -0.02, ...]`   |

---

## 6. Analytics

### `analytics_events` Ã¢â‚¬â€ Raw analytics events

| Field      | Type        | Constraints                | Description           | FK      | Indexed | Example             |
| ---------- | ----------- | -------------------------- | --------------------- | ------- | ------- | ------------------- |
| id         | UUID        | PK, Required               | Ã¢â‚¬â€               | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€             |
| event_name | VARCHAR     | Required                   | Event type            | Ã¢â‚¬â€ | Yes     | `"page_view"`       |
| page_url   | VARCHAR     | Optional                   | URL where event fired | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"/projects"`       |
| session_id | VARCHAR     | Optional                   | Browser session       | Ã¢â‚¬â€ | Yes     | `"sess_abc"`        |
| visitor_id | VARCHAR     | Optional                   | Visitor fingerprint   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"vis_xyz"`         |
| user_agent | VARCHAR     | Optional                   | UA string             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Mozilla/5.0..."`  |
| ip_address | VARCHAR     | Optional                   | Client IP             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"203.0.113.1"`     |
| properties | JSONB       | Required, default: `{}`    | Arbitrary event data  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"duration":3000}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Yes     | Ã¢â‚¬â€             |

### `analytics_sessions` Ã¢â‚¬â€ Aggregated session data

| Field            | Type        | Constraints                | Description                         | FK      | Indexed | Example                |
| ---------------- | ----------- | -------------------------- | ----------------------------------- | ------- | ------- | ---------------------- |
| id               | UUID        | PK, Required               | Ã¢â‚¬â€                             | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                |
| session_id       | VARCHAR     | Required, Unique           | Browser session ID                  | Ã¢â‚¬â€ | Unique  | `"sess_abc123"`        |
| visitor_id       | VARCHAR     | Optional                   | Fingerprinted visitor               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"vis_xyz"`            |
| referrer         | VARCHAR     | Optional                   | HTTP referrer                       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"https://google.com"` |
| utm_source       | VARCHAR     | Optional                   | UTM param                           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"google"`             |
| utm_medium       | VARCHAR     | Optional                   | UTM param                           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"cpc"`                |
| utm_campaign     | VARCHAR     | Optional                   | UTM param                           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"spring_sale"`        |
| device_type      | VARCHAR     | Optional                   | `"mobile"`, `"desktop"`, `"tablet"` | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"desktop"`            |
| browser          | VARCHAR     | Optional                   | Browser name                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Chrome"`             |
| country          | VARCHAR     | Optional                   | GeoIP country                       | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"US"`                 |
| city             | VARCHAR     | Optional                   | GeoIP city                          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"San Francisco"`      |
| page_views       | INT         | Required, default: `0`     | Page count                          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `5`                    |
| duration_seconds | INT         | Required, default: `0`     | Session length                      | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `240`                  |
| started_at       | TIMESTAMPTZ | Required, default: `now()` | Session start                       | Ã¢â‚¬â€ | Yes     | Ã¢â‚¬â€                |
| last_activity_at | TIMESTAMPTZ | Required, default: `now()` | Last ping                           | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |
| created_at       | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |

### `page_views` Ã¢â‚¬â€ Individual page view records

| Field                | Type        | Constraints                | Description      | FK      | Indexed | Example        |
| -------------------- | ----------- | -------------------------- | ---------------- | ------- | ------- | -------------- |
| id                   | UUID        | PK, Required               | Ã¢â‚¬â€          | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€        |
| session_id           | VARCHAR     | Optional                   | Browser session  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"sess_abc"`   |
| page_url             | VARCHAR     | Required                   | URL visited      | Ã¢â‚¬â€ | Yes     | `"/projects"`  |
| page_title           | VARCHAR     | Optional                   | Document title   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Projects"`   |
| referrer             | VARCHAR     | Optional                   | Page referrer    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"/home"`      |
| scroll_depth_percent | INT         | Required, default: `0`     | Max scroll %     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `75`           |
| time_on_page_seconds | INT         | Required, default: `0`     | Duration         | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `30`           |
| engagement           | JSONB       | Required, default: `{}`    | Interaction data | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"clicks":3}` |
| viewed_at            | TIMESTAMPTZ | Required, default: `now()` | Timestamp        | Ã¢â‚¬â€ | Yes     | Ã¢â‚¬â€        |

---

## 7. Media & Notifications

### `media_assets` Ã¢â‚¬â€ Uploaded file metadata

| Field           | Type        | Constraints                   | Description             | FK                 | Indexed         | Example                   |
| --------------- | ----------- | ----------------------------- | ----------------------- | ------------------ | --------------- | ------------------------- |
| id              | UUID        | PK, Required                  | Ã¢â‚¬â€                 | Ã¢â‚¬â€            | PK              | Ã¢â‚¬â€                   |
| file_name       | VARCHAR     | Required                      | Original filename       | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `"hero.png"`              |
| file_path       | VARCHAR     | Required                      | Storage path/key        | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `"uploads/2025/hero.png"` |
| bucket_name     | VARCHAR     | Required, default: `"assets"` | Storage bucket          | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `"assets"`                |
| mime_type       | VARCHAR     | Required                      | MIME type               | Ã¢â‚¬â€            | Yes (composite) | `"image/png"`             |
| file_size_bytes | INT         | Required, default: `0`        | File size               | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `204800`                  |
| width           | INT         | Optional                      | Image width             | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `1920`                    |
| height          | INT         | Optional                      | Image height            | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `1080`                    |
| alt_text        | VARCHAR     | Optional                      | Accessibility text      | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `"Hero banner"`           |
| uploaded_by     | UUID        | Optional                      | Uploader                | users(id) SET NULL | Ã¢â‚¬â€         | Ã¢â‚¬â€                   |
| variants        | JSONB       | Required, default: `{}`       | Thumbnail/webp variants | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `{"thumb":"..."}`         |
| created_at      | TIMESTAMPTZ | Required, default: `now()`    | Ã¢â‚¬â€                 | Ã¢â‚¬â€            | Ã¢â‚¬â€         | Ã¢â‚¬â€                   |
| deleted_at      | TIMESTAMPTZ | Optional                      | Soft-delete             | Ã¢â‚¬â€            | Ã¢â‚¬â€         | `null`                    |

### `notifications` Ã¢â‚¬â€ System notifications (Telegram, etc.)

| Field      | Type        | Constraints                     | Description        | FK      | Indexed | Example                |
| ---------- | ----------- | ------------------------------- | ------------------ | ------- | ------- | ---------------------- |
| id         | UUID        | PK, Required                    | Ã¢â‚¬â€            | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                |
| type       | VARCHAR     | Required                        | Notification type  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"new_lead"`           |
| title      | VARCHAR     | Required                        | Notification title | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"New Lead Received"`  |
| body       | TEXT        | Optional                        | Notification body  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Jane Doe sent..."`   |
| channel    | VARCHAR     | Required, default: `"telegram"` | Delivery channel   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"telegram"`           |
| payload    | JSONB       | Required, default: `{}`         | Structured data    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"leadId":"..."}`     |
| is_read    | BOOLEAN     | Required, default: `false`      | Read status        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `false`                |
| is_sent    | BOOLEAN     | Required, default: `false`      | Delivery status    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                 |
| sent_at    | TIMESTAMPTZ | Optional                        | When sent          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `2025-01-01T00:00:00Z` |
| read_at    | TIMESTAMPTZ | Optional                        | When read          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `null`                 |
| created_at | TIMESTAMPTZ | Required, default: `now()`      | Ã¢â‚¬â€            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                |

---

## 8. System

### `system_settings` Ã¢â‚¬â€ Key-value configuration store

| Field         | Type        | Constraints                    | Description           | FK      | Indexed | Example               |
| ------------- | ----------- | ------------------------------ | --------------------- | ------- | ------- | --------------------- |
| id            | UUID        | PK, Required                   | Ã¢â‚¬â€               | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€               |
| setting_key   | VARCHAR     | Required, Unique               | Config key            | Ã¢â‚¬â€ | Unique  | `"site_name"`         |
| setting_value | TEXT        | Required, default: `""`        | Config value          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"My Portfolio"`      |
| setting_group | VARCHAR     | Required, default: `"general"` | Group for UI          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"general"`           |
| description   | TEXT        | Optional                       | Human-readable help   | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Site display name"` |
| data_type     | VARCHAR     | Required, default: `"string"`  | Type hint for parsing | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"string"`            |
| is_encrypted  | BOOLEAN     | Required, default: `false`     | Encrypted at rest     | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `false`               |
| created_at    | TIMESTAMPTZ | Required, default: `now()`     | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€               |
| updated_at    | TIMESTAMPTZ | Required, auto                 | Ã¢â‚¬â€               | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€               |

### `audit_logs` Ã¢â‚¬â€ Row-level data change audit

| Field          | Type        | Constraints                | Description                        | FK                 | Indexed | Example           |
| -------------- | ----------- | -------------------------- | ---------------------------------- | ------------------ | ------- | ----------------- |
| id             | UUID        | PK, Required               | Ã¢â‚¬â€                            | Ã¢â‚¬â€            | PK      | Ã¢â‚¬â€           |
| table_name     | VARCHAR     | Required                   | Affected table                     | Ã¢â‚¬â€            | Yes     | `"projects"`      |
| record_id      | VARCHAR     | Required                   | Affected row ID                    | Ã¢â‚¬â€            | Yes     | `"a1b2c3d4-..."`  |
| action         | VARCHAR     | Required                   | `"CREATE"`, `"UPDATE"`, `"DELETE"` | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"UPDATE"`        |
| actor_id       | UUID        | Optional                   | Acting user                        | users(id) SET NULL | Ã¢â‚¬â€ | Ã¢â‚¬â€           |
| ip_address     | VARCHAR     | Optional                   | Actor IP                           | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"203.0.113.1"`   |
| old_values     | JSONB       | Optional                   | Previous state                     | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `{"title":"Old"}` |
| new_values     | JSONB       | Optional                   | New state                          | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `{"title":"New"}` |
| correlation_id | VARCHAR     | Optional                   | Request tracing ID                 | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"req_abc"`       |
| created_at     | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                            | Ã¢â‚¬â€            | Yes     | Ã¢â‚¬â€           |

### `admin_activities` Ã¢â‚¬â€ Admin dashboard action log

| Field         | Type        | Constraints                | Description        | FK                 | Indexed | Example               |
| ------------- | ----------- | -------------------------- | ------------------ | ------------------ | ------- | --------------------- |
| id            | UUID        | PK, Required               | Ã¢â‚¬â€            | Ã¢â‚¬â€            | PK      | Ã¢â‚¬â€               |
| admin_id      | UUID        | Optional                   | Admin who acted    | users(id) SET NULL | Yes     | Ã¢â‚¬â€               |
| action        | VARCHAR     | Required                   | Performed action   | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"login"`             |
| resource_type | VARCHAR     | Optional                   | Target entity type | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"project"`           |
| resource_id   | VARCHAR     | Optional                   | Target entity ID   | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"a1b2c3d4-..."`      |
| description   | TEXT        | Optional                   | Summary            | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"Admin logged in"`   |
| details       | JSONB       | Required, default: `{}`    | Extra context      | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `{"method":"google"}` |
| ip_address    | VARCHAR     | Optional                   | Actor IP           | Ã¢â‚¬â€            | Ã¢â‚¬â€ | `"203.0.113.1"`       |
| created_at    | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€            | Ã¢â‚¬â€            | Yes     | Ã¢â‚¬â€               |

### `availability_status` Ã¢â‚¬â€ Singleton availability indicator

| Field             | Type        | Constraints                                            | Description                | FK      | Indexed | Example                             |
| ----------------- | ----------- | ------------------------------------------------------ | -------------------------- | ------- | ------- | ----------------------------------- |
| id                | UUID        | PK, Required                                           | Ã¢â‚¬â€                    | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                             |
| is_available      | BOOLEAN     | Required, default: `true`                              | Available for hire         | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                              |
| status_label      | VARCHAR     | Required, default: `"Available for new opportunities"` | Custom message             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Available for new opportunities"` |
| available_until   | VARCHAR     | Optional                                               | Date string or `"ongoing"` | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"2025-12-31"`                      |
| preferred_contact | VARCHAR     | Required, default: `"email"`                           | Preferred channel          | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"email"`                           |
| updated_at        | TIMESTAMPTZ | Required, auto                                         | Ã¢â‚¬â€                    | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                             |

### `feature_flags` Ã¢â‚¬â€ Toggleable feature switches

| Field              | Type        | Constraints                | Description                    | FK      | Indexed | Example                        |
| ------------------ | ----------- | -------------------------- | ------------------------------ | ------- | ------- | ------------------------------ |
| id                 | UUID        | PK, Required               | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | PK      | Ã¢â‚¬â€                        |
| flag_key           | VARCHAR     | Required, Unique           | Feature identifier             | Ã¢â‚¬â€ | Unique  | `"new_chat_ui"`                |
| description        | TEXT        | Optional                   | What this controls             | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `"Enables new chat interface"` |
| is_enabled         | BOOLEAN     | Required, default: `false` | Master toggle                  | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `true`                         |
| targeting_rules    | JSONB       | Required, default: `{}`    | User/role targeting            | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `{"roles":["admin"]}`          |
| rollout_percentage | INT         | Required, default: `0`     | Gradual rollout (0Ã¢â‚¬â€œ100) | Ã¢â‚¬â€ | Ã¢â‚¬â€ | `50`                           |
| created_at         | TIMESTAMPTZ | Required, default: `now()` | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                        |
| updated_at         | TIMESTAMPTZ | Required, auto             | Ã¢â‚¬â€                        | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€                        |

---

## 9. Enums

| Enum       | Values                      | Used By      |
| ---------- | --------------------------- | ------------ |
| `UserRole` | `admin`, `editor`, `viewer` | `users.role` |

---

## Index Summary

### Unique Indexes (Primary keys omitted)

| Table                | Columns                                 | Type           |
| -------------------- | --------------------------------------- | -------------- |
| `users`              | `email`                                 | Unique (BTREE) |
| `sessions`           | `refresh_token`                         | Unique (BTREE) |
| `sessions`           | `(user_id, id)`                         | PK (BTREE)     |
| `sections`           | `section_key`                           | Unique (BTREE) |
| `projects`           | `slug`                                  | Unique (BTREE) |
| `blog_posts`         | `slug`                                  | Unique (BTREE) |
| `post_tags`          | `(post_id, tag)`                        | Unique (BTREE) |
| `leads`              | `(id, deleted_at)`                      | PK (BTREE)     |
| `analytics_sessions` | `session_id`                            | Unique (BTREE) |
| `chat_conversations` | `session_id`                            | Unique (BTREE) |
| `system_settings`    | `setting_key`                           | Unique (BTREE) |
| `feature_flags`      | `flag_key`                              | Unique (BTREE) |
| `content_embeddings` | `(source_type, source_id, chunk_index)` | Unique (BTREE) |
| `api_keys`           | `key_hash`                              | Unique (BTREE) |

### Regular Indexes

| Table                | Columns                                      | Type            |
| -------------------- | -------------------------------------------- | --------------- |
| `sessions`           | `user_id`                                    | BTREE           |
| `sections`           | `display_order`                              | BTREE           |
| `sections`           | `is_live`                                    | BTREE           |
| `sections`           | `is_live, section_type`                      | BTREE           |
| `projects`           | `slug`                                       | BTREE           |
| `projects`           | `category`                                   | BTREE           |
| `projects`           | `is_featured`                                | BTREE           |
| `projects`           | `is_featured, is_private`                    | BTREE           |
| `projects`           | `category, is_private`                       | BTREE           |
| `projects`           | `display_order`                              | BTREE           |
| `project_images`     | `project_id`                                 | BTREE           |
| `blog_posts`         | `slug`                                       | BTREE           |
| `blog_posts`         | `is_published`                               | BTREE           |
| `blog_posts`         | `is_published, published_at DESC NULLS LAST` | BTREE           |
| `blog_posts`         | `published_at DESC NULLS LAST`               | BTREE           |
| `blog_posts`         | `tags`                                       | **GIN** (array) |
| `post_tags`          | `post_id`                                    | BTREE           |
| `post_tags`          | `tag`                                        | BTREE           |
| `testimonials`       | `is_visible`                                 | BTREE           |
| `testimonials`       | `is_visible, is_featured`                    | BTREE           |
| `skills`             | `category`                                   | BTREE           |
| `skills`             | `is_featured`                                | BTREE           |
| `skills`             | `category, is_featured`                      | BTREE           |
| `experiences`        | `display_order`                              | BTREE           |
| `experiences`        | `is_visible, display_order`                  | BTREE           |
| `achievements`       | `category, display_order`                    | BTREE           |
| `leads`              | `status`                                     | BTREE           |
| `leads`              | `status, created_at DESC`                    | BTREE           |
| `leads`              | `source`                                     | BTREE           |
| `leads`              | `email`                                      | BTREE           |
| `leads`              | `created_at DESC`                            | BTREE           |
| `leads`              | `deleted_at`                                 | BTREE           |
| `lead_notes`         | `lead_id`                                    | BTREE           |
| `lead_activities`    | `lead_id`                                    | BTREE           |
| `analytics_events`   | `event_name`                                 | BTREE           |
| `analytics_events`   | `event_name, created_at DESC`                | BTREE           |
| `analytics_events`   | `session_id`                                 | BTREE           |
| `analytics_events`   | `created_at DESC`                            | BTREE           |
| `analytics_sessions` | `started_at DESC`                            | BTREE           |
| `page_views`         | `page_url`                                   | BTREE           |
| `page_views`         | `viewed_at DESC`                             | BTREE           |
| `chat_conversations` | `session_id`                                 | BTREE           |
| `chat_messages`      | `conversation_id`                            | BTREE           |
| `media_assets`       | `mime_type, created_at DESC`                 | BTREE           |
| `audit_logs`         | `table_name`                                 | BTREE           |
| `audit_logs`         | `record_id`                                  | BTREE           |
| `audit_logs`         | `created_at DESC`                            | BTREE           |
| `admin_activities`   | `admin_id`                                   | BTREE           |
| `admin_activities`   | `created_at DESC`                            | BTREE           |
| `case_studies`       | `project_id`                                 | BTREE           |
| `content_embeddings` | `source_type`                                | BTREE           |

### Special Index Types

| Table                | Columns     | Type                  | Purpose                                     |
| -------------------- | ----------- | --------------------- | ------------------------------------------- |
| `blog_posts`         | `tags`      | **GIN**               | Efficient array containment/overlap queries |
| `content_embeddings` | `embedding` | **IVFFlat** (raw SQL) | Approximate nearest-neighbor vector search  |

---

## RLS Policy Summary

Row-Level Security is **not defined in the Prisma schema**. However, recommended RLS policies by domain:

| Table(s)                                                                                                                                                                                 | Recommended RLS                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `users`, `sessions`, `api_keys`                                                                                                                                                          | Admins only Ã¢â‚¬â€ self via `user_id`                                  |
| `sections`, `projects`, `blog_posts`, `skills`, `experiences`, `achievements`, `services`, `faqs`, `testimonials`, `case_studies`, `press_features`, `guest_appearances`, `reading_list` | Public read for `is_published`/`is_visible`/`is_live = true`; admin CUD |
| `leads`, `lead_notes`, `lead_activities`                                                                                                                                                 | Admins only (full access)                                               |
| `chat_conversations`, `chat_messages`                                                                                                                                                    | Self via `session_id` for visitors; admin for full access               |
| `analytics_events`, `analytics_sessions`, `page_views`                                                                                                                                   | Admin-only read; insert-only for public                                 |
| `media_assets`                                                                                                                                                                           | Public read; admin CUD                                                  |
| `system_settings`, `audit_logs`, `admin_activities`, `availability_status`, `feature_flags`                                                                                              | Admin-only                                                              |
| `notifications`                                                                                                                                                                          | Admin-only read; system insert                                          |
| `content_embeddings`                                                                                                                                                                     | Public read; system insert/update                                       |

---

## Storage Estimates

| Table                 | Est. Rows  | Est. Size | Growth Rate | Notes                 |
| --------------------- | ---------- | --------- | ----------- | --------------------- |
| `users`               | < 10       | ~16 KB    | None        | Personal portfolio    |
| `sessions`            | < 50       | ~32 KB    | Low         | Per-user sessions     |
| `api_keys`            | < 5        | ~8 KB     | None        | CI/CD keys            |
| `sections`            | ~15        | ~128 KB   | Very low    | Fixed set of sections |
| `projects`            | ~20        | ~512 KB   | Low         | Portfolio projects    |
| `project_images`      | ~60        | ~32 KB    | Low         | ~3 per project        |
| `blog_posts`          | ~30        | ~1 MB     | Low         | Blog articles         |
| `post_tags`           | ~120       | ~16 KB    | Low         | ~4 per post           |
| `case_studies`        | ~10        | ~256 KB   | Very low    | ~1 per project        |
| `skills`              | ~40        | ~32 KB    | Very low    | Skill catalog         |
| `experiences`         | ~10        | ~64 KB    | Very low    | Work history          |
| `achievements`        | ~15        | ~32 KB    | None        | Static                |
| `services`            | ~8         | ~16 KB    | None        | Service offerings     |
| `faqs`                | ~15        | ~32 KB    | None        | Static                |
| `testimonials`        | ~20        | ~64 KB    | Low         | Endorsements          |
| `press_features`      | ~10        | ~16 KB    | Low         | Press mentions        |
| `guest_appearances`   | ~10        | ~16 KB    | Low         | Podcasts/talks        |
| `reading_list`        | ~20        | ~16 KB    | Low         | Book recs             |
| `leads`               | ~200/yr    | ~512 KB   | Medium      | Contact form          |
| `lead_notes`          | ~100/yr    | ~128 KB   | Medium      | Internal notes        |
| `lead_activities`     | ~400/yr    | ~256 KB   | Medium      | Timeline events       |
| `chat_conversations`  | ~500/yr    | ~128 KB   | Medium      | Visitor chat          |
| `chat_messages`       | ~5,000/yr  | ~2 MB     | Medium      | ~10 per conversation  |
| `content_embeddings`  | ~1,000     | ~4 MB     | Low         | RAG chunks            |
| `analytics_events`    | ~50,000/yr | ~8 MB     | High        | Raw events            |
| `analytics_sessions`  | ~5,000/yr  | ~1 MB     | High        | Aggregated sessions   |
| `page_views`          | ~50,000/yr | ~4 MB     | High        | Per-page views        |
| `media_assets`        | ~100       | ~64 KB    | Low         | Upload metadata       |
| `notifications`       | ~500/yr    | ~128 KB   | Medium      | System alerts         |
| `system_settings`     | ~50        | ~16 KB    | Very low    | Config store          |
| `audit_logs`          | ~5,000/yr  | ~2 MB     | Medium      | Change audit          |
| `admin_activities`    | ~1,000/yr  | ~512 KB   | Medium      | Admin log             |
| `availability_status` | 1          | ~4 KB     | None        | Singleton             |
| `feature_flags`       | ~20        | ~16 KB    | Very low    | Feature toggles       |

**Total estimated footprint:** ~25Ã¢â‚¬â€œ30 MB (excluding uploads/media files stored in blob storage)

---

## Relationship Diagram

```
users Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬ sessions          (1:N Ã¢â‚¬â€ user owns many sessions)
         Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ lead_notes        (1:N Ã¢â‚¬â€ optional author)
         Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ lead_activities   (1:N Ã¢â‚¬â€ optional actor)
         Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ media_assets      (1:N Ã¢â‚¬â€ uploader)
         Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ audit_logs        (1:N Ã¢â‚¬â€ optional actor)
         Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ admin_activities  (1:N Ã¢â‚¬â€ optional admin)

projects Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬ project_images  (1:N Ã¢â‚¬â€ cascade delete)
           Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ case_studies    (1:N Ã¢â‚¬â€ cascade delete, effectively 1:1)

blog_posts Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬ post_tags     (1:N Ã¢â‚¬â€ cascade delete)

leads Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬ lead_notes         (1:N Ã¢â‚¬â€ cascade delete)
        Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ lead_activities    (1:N Ã¢â‚¬â€ cascade delete)

chat_conversations Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬ chat_messages  (1:N Ã¢â‚¬â€ cascade delete)

NO cross-table FK references on these standalone tables:
  Section, Testimonial, Skill, Experience, Achievement, Service, FAQ,
  AnalyticsEvent, AnalyticsSession, PageView, PressFeature,
  GuestAppearance, ReadingListItem, AvailabilityStatus,
  ApiKey, FeatureFlag, ContentEmbedding, Notification, SystemSetting
```

---

_Generated from `apps/api/prisma/schema.prisma` Ã¢â‚¬â€ 34 models (tables) across 8 domains + 1 enum._

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
