# Data Dictionary — Portfolio Database

> **Schema version:** Prisma (PostgreSQL) — 34 tables across 8 domains
> **Generated from:** `apps/api/prisma/schema.prisma`
> **Naming convention:** Snake case table names, camelCase model names

---

## 1. User & Auth

### `users` — User accounts with role-based access

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | Primary identifier | — | PK | `"a1b2c3d4-..."` |
| email | VARCHAR | Required, Unique | Login email | — | Unique | `"admin@portfolio.dev"` |
| display_name | VARCHAR | Required | Display name | — | — | `"Jane Doe"` |
| avatar_url | VARCHAR | Optional | Profile image URL | — | — | `"https://..."` |
| password_hash | VARCHAR | Optional | bcrypt hash (null for OAuth-only) | — | — | `"$2b$10$..."` |
| role | `UserRole` | Required, default: `admin` | `admin`, `editor`, `viewer` | — | — | `"admin"` |
| is_active | BOOLEAN | Required, default: `true` | Soft account toggle | — | — | `true` |
| failed_login_attempts | INT | Required, default: `0` | Brute-force counter | — | — | `0` |
| locked_until | TIMESTAMPTZ | Optional | Lockout expiry | — | — | `null` |
| metadata | JSONB | Required, default: `{}` | Extensible profile data | — | — | `{"timezone":"UTC"}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | Row creation timestamp | — | — | `2025-01-01T00:00:00Z` |
| updated_at | TIMESTAMPTZ | Required, auto | Row update timestamp | — | — | `2025-01-01T00:00:00Z` |

### `sessions` — JWT refresh token sessions

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | Primary identifier | — | PK | — |
| user_id | UUID | Required | Owner of session | users(id) ON DELETE CASCADE | Yes | — |
| refresh_token | VARCHAR | Required, Unique | Refresh token hash | — | Unique | — |
| user_agent | VARCHAR | Optional | Client UA string | — | — | `"Mozilla/5.0..."` |
| ip_address | VARCHAR | Optional | Client IP | — | — | `"203.0.113.1"` |
| is_revoked | BOOLEAN | Required, default: `false` | Manual/timed revocation | — | — | `false` |
| expires_at | TIMESTAMPTZ | Required | Token lifespan end | — | — | `2025-02-01T00:00:00Z` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `api_keys` — Programmatic access keys

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| name | VARCHAR | Required | Human-readable label | — | — | `"CI/CD Pipeline"` |
| key_hash | VARCHAR | Required, Unique | SHA-256 of full key | — | Unique | `"a1b2c3d4e5..."` |
| key_prefix | VARCHAR | Required | First 8 chars for identification | — | — | `"pk_port_a1"` |
| permissions | VARCHAR | Required, default: `"read"` | `read`, `write`, `admin` | — | — | `"read"` |
| is_active | BOOLEAN | Required, default: `true` | Soft enable/disable | — | — | `true` |
| expires_at | TIMESTAMPTZ | Optional | Key expiry | — | — | `2026-01-01T00:00:00Z` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| revoked_at | TIMESTAMPTZ | Optional | When revoked | — | — | `null` |

---

## 2. Content

### `sections` — Portfolio page sections (hero, about, projects, etc.)

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| section_key | VARCHAR | Required, Unique | Machine key, e.g. `"hero"` | — | Unique | `"hero"` |
| section_label | VARCHAR | Required | Display label | — | — | `"Hero Section"` |
| section_type | VARCHAR | Optional | Content type hint | — | Yes (composite) | `"markdown"` |
| is_live | BOOLEAN | Required, default: `false` | Published state | — | Yes | `true` |
| style_preset | VARCHAR | Required, default: `"default"` | CSS class preset | — | — | `"dark-gradient"` |
| display_order | INT | Required, default: `0` | Render ordering | — | Yes | `1` |
| min_items | INT | Required, default: `1` | Min sub-items required | — | — | `1` |
| auto_publish | BOOLEAN | Required, default: `false` | Auto-publish on save | — | — | `false` |
| is_always_visible | BOOLEAN | Required, default: `false` | Bypass visibility logic | — | — | `true` |
| style_config | JSONB | Required, default: `{}` | Per-section style overrides | — | — | `{"bg":"#000"}` |
| content | JSONB | Required, default: `{}` | Section body content | — | — | `{"title":"Hello"}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `projects` — Portfolio projects

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| slug | VARCHAR | Required, Unique | URL-safe identifier | — | Unique | `"my-awesome-app"` |
| title | VARCHAR | Required | Project name | — | — | `"My Awesome App"` |
| description | VARCHAR | Optional | Short summary | — | — | `"A full-stack..."` |
| tech_stack | VARCHAR[] | Required, default: `[]` | Technology tags | — | — | `["React","Node"]` |
| live_url | VARCHAR | Optional | Deployment URL | — | — | `"https://..."` |
| github_url | VARCHAR | Optional | Source repo | — | — | `"https://github.com/..."` |
| cover_image | VARCHAR | Optional | Hero image URL | — | — | `"https://..."` |
| thumbnail_url | VARCHAR | Optional | Card thumbnail | — | — | `"https://..."` |
| is_featured | BOOLEAN | Required, default: `false` | Spotlight project | — | Yes | `true` |
| is_private | BOOLEAN | Required, default: `false` | NDA-gated project | — | Yes (composite) | `false` |
| nda_password | VARCHAR | Optional | Access password for private projects | — | — | `null` |
| category | VARCHAR | Optional | Grouping category | — | Yes | `"fullstack"` |
| display_order | INT | Required, default: `0` | Sort order | — | Yes | `1` |
| content | JSONB | Required, default: `{}` | Rich project body | — | — | `{"overview":"..."}` |
| metrics | JSONB | Required, default: `{}` | Performance/impact metrics | — | — | `{"users":1000}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `project_images` — Gallery images per project

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| project_id | UUID | Required | Parent project | projects(id) CASCADE | Yes | — |
| image_url | VARCHAR | Required | Image URL | — | — | `"https://..."` |
| alt_text | VARCHAR | Optional | Accessibility alt text | — | — | `"Dashboard view"` |
| display_order | INT | Required, default: `0` | Gallery sort | — | — | `1` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `blog_posts` — Blog articles

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| slug | VARCHAR | Required, Unique | URL slug | — | Unique | `"building-with-nextjs"` |
| title | VARCHAR | Required | Post title | — | — | `"Building with Next.js"` |
| excerpt | VARCHAR | Optional | Short teaser | — | — | `"How I built..."` |
| content | TEXT | Required, default: `""` | Markdown/HTML body | — | — | `"## Introduction..."` |
| cover_image | VARCHAR | Optional | Header image | — | — | `"https://..."` |
| category | VARCHAR | Optional | Blog category | — | — | `"technology"` |
| tags | VARCHAR[] | Required, default: `[]` | Tag array | — | GIN | `["react","nextjs"]` |
| author_name | VARCHAR | Required, default: `"Admin"` | Display author | — | — | `"Jane Doe"` |
| read_time_minutes | INT | Required, default: `5` | Estimated read time | — | — | `8` |
| is_published | BOOLEAN | Required, default: `false` | Published state | — | Yes | `true` |
| is_featured | BOOLEAN | Required, default: `false` | Featured post | — | — | `false` |
| seo_title | VARCHAR | Optional | Meta title override | — | — | `"Building with Next.js Guide"` |
| seo_description | VARCHAR | Optional | Meta description | — | — | `"Learn how..."` |
| published_at | TIMESTAMPTZ | Optional | Publication timestamp | — | Yes | `2025-06-01T00:00:00Z` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `post_tags` — Normalized blog post tags (junction)

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| post_id | UUID | Required | Referenced post | blog_posts(id) CASCADE | Yes | — |
| tag | VARCHAR | Required | Tag string | — | Yes | `"react"` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| **Unique** | | | `(post_id, tag)` | | | |

### `case_studies` — Deep-dive project case studies (1:1 with Project)

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| project_id | UUID | Required | Parent project | projects(id) CASCADE | Yes | — |
| challenge | TEXT | Optional | Problem statement | — | — | `"Needed to scale..."` |
| approach | TEXT | Optional | Methodology | — | — | `"Used microservices..."` |
| solution | TEXT | Optional | Implemented solution | — | — | `"Built with..."` |
| impact | TEXT | Optional | Results & metrics | — | — | `"50% perf improvement"` |
| architecture_diagrams | VARCHAR[] | Required, default: `[]` | Diagram image URLs | — | — | `["https://..."]` |
| code_snippets | VARCHAR[] | Required, default: `[]` | Code block identifiers | — | — | `["snippet-1"]` |
| metrics | JSONB | Required, default: `{}` | Impact KPIs | — | — | `{"latency":"50ms"}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

---

## 3. Professional

### `skills` — Technical skills

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| name | VARCHAR | Required | Skill name | — | — | `"React"` |
| category | VARCHAR | Required | e.g. `"frontend"`, `"backend"` | — | Yes | `"frontend"` |
| proficiency | INT | Required, default: `0` | 0–100 scale | — | — | `95` |
| icon_url | VARCHAR | Optional | Icon/image | — | — | `"https://..."` |
| lottie_url | VARCHAR | Optional | Lottie animation URL | — | — | `"https://..."` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| is_featured | BOOLEAN | Required, default: `false` | Show on homepage | — | Yes | `true` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `experiences` — Work history entries

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| company | VARCHAR | Required | Employer name | — | — | `"Acme Corp"` |
| role | VARCHAR | Required | Job title | — | — | `"Senior Engineer"` |
| description | TEXT | Optional | Responsibilities | — | — | `"Led..."` |
| technologies | VARCHAR[] | Required, default: `[]` | Tech stack used | — | — | `["React","Node"]` |
| company_logo_url | VARCHAR | Optional | Company logo | — | — | `"https://..."` |
| company_url | VARCHAR | Optional | Company website | — | — | `"https://acme.com"` |
| location | VARCHAR | Optional | Office location | — | — | `"San Francisco, CA"` |
| start_date | TIMESTAMPTZ | Required | Start date | — | — | `2020-01-01T00:00:00Z` |
| end_date | TIMESTAMPTZ | Optional | End date (null = current) | — | — | `2023-06-01T00:00:00Z` |
| is_current | BOOLEAN | Required, default: `false` | Currently employed | — | — | `false` |
| display_order | INT | Required, default: `0` | Sort order | — | Yes | `1` |
| is_visible | BOOLEAN | Required, default: `true` | Visibility toggle | — | Yes | `true` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `achievements` — Awards, certifications, honors

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| title | VARCHAR | Required | Achievement name | — | — | `"AWS Certified"` |
| issuer | VARCHAR | Optional | Issuing org | — | — | `"Amazon"` |
| description | TEXT | Optional | Details | — | — | `"Passed SAP..."` |
| badge_image_url | VARCHAR | Optional | Badge/medal image | — | — | `"https://..."` |
| category | VARCHAR | Optional | Grouping | — | Yes | `"certification"` |
| achieved_date | TIMESTAMPTZ | Optional | Date achieved | — | — | `2024-03-15T00:00:00Z` |
| credential_url | VARCHAR | Optional | Verifiable link | — | — | `"https://credly.com/..."` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `services` — Offerings / consulting services

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| title | VARCHAR | Required | Service name | — | — | `"Web Development"` |
| description | TEXT | Required | Service description | — | — | `"Full-stack..."` |
| icon | VARCHAR | Required, default: `"💻"` | Emoji/icon identifier | — | — | `"🚀"` |
| features | VARCHAR[] | Required, default: `[]` | Bullet-point features | — | — | `["Responsive","SEO"]` |
| pricing_tier | VARCHAR | Optional | Tier label | — | — | `"Premium"` |
| price_cents | INT | Optional | Price in cents | — | — | `50000` |
| cta_text | VARCHAR | Optional | Button label | — | — | `"Get Started"` |
| cta_url | VARCHAR | Optional | Button link | — | — | `"/contact"` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| is_active | BOOLEAN | Required, default: `true` | Active/inactive | — | — | `true` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `faqs` — Frequently asked questions

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| question | VARCHAR | Required | FAQ question | — | — | `"What tech do you use?"` |
| answer | TEXT | Required | FAQ answer | — | — | `"I use React..."` |
| category | VARCHAR | Optional | Grouping category | — | — | `"general"` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| is_visible | BOOLEAN | Required, default: `true` | Visibility toggle | — | — | `true` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `testimonials` — Client/peer endorsements

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| name | VARCHAR | Required | Person name | — | — | `"John Smith"` |
| role | VARCHAR | Required | Job title | — | — | `"CTO"` |
| company | VARCHAR | Required | Organization | — | — | `"Acme Corp"` |
| avatar_url | VARCHAR | Optional | Profile photo | — | — | `"https://..."` |
| content | TEXT | Required | Testimonial text | — | — | `"Amazing work..."` |
| rating | INT | Required, default: `5` | 1–5 stars | — | — | `5` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| is_verified | BOOLEAN | Required, default: `false` | Verification badge | — | — | `true` |
| is_featured | BOOLEAN | Required, default: `false` | Show on homepage | — | Yes (composite) | `true` |
| is_visible | BOOLEAN | Required, default: `true` | Visibility toggle | — | Yes | `true` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `press_features` — Media/press mentions

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| publication | VARCHAR | Required | Publisher name | — | — | `"TechCrunch"` |
| title | VARCHAR | Required | Article title | — | — | `"Startup Raises..."` |
| url | VARCHAR | Optional | Article link | — | — | `"https://techcrunch.com/..."` |
| logo_url | VARCHAR | Optional | Publication logo | — | — | `"https://..."` |
| description | TEXT | Optional | Summary | — | — | `"Featured for..."` |
| featured_date | TIMESTAMPTZ | Optional | Publication date | — | — | `2025-05-01T00:00:00Z` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `guest_appearances` — Podcasts, talks, interviews

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| type | VARCHAR | Required | `"podcast"`, `"talk"`, `"interview"` | — | — | `"podcast"` |
| title | VARCHAR | Required | Episode/talk title | — | — | `"The Dev Show #42"` |
| host | VARCHAR | Optional | Host or event name | — | — | `"John Doe"` |
| url | VARCHAR | Optional | Link to appearance | — | — | `"https://..."` |
| cover_image_url | VARCHAR | Optional | Episode artwork | — | — | `"https://..."` |
| description | TEXT | Optional | Summary | — | — | `"Discussed..."` |
| appearance_date | TIMESTAMPTZ | Optional | When it aired | — | — | `2025-04-15T00:00:00Z` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `reading_list` — Book/article recommendations

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| title | VARCHAR | Required | Title | — | — | `"Atomic Habits"` |
| author | VARCHAR | Optional | Author name | — | — | `"James Clear"` |
| url | VARCHAR | Optional | Link to resource | — | — | `"https://..."` |
| cover_image_url | VARCHAR | Optional | Book cover | — | — | `"https://..."` |
| category | VARCHAR | Optional | Genre/type | — | — | `"self-improvement"` |
| recommendation | TEXT | Optional | Personal note | — | — | `"A must read..."` |
| display_order | INT | Required, default: `0` | Sort order | — | — | `1` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

---

## 4. Leads & CRM

### `leads` — Contact form / inbound leads

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| name | VARCHAR | Required | Contact name | — | — | `"Jane Doe"` |
| email | VARCHAR | Required | Contact email | — | Yes | `"jane@example.com"` |
| phone | VARCHAR | Optional | Phone number | — | — | `"+1-555-0123"` |
| company | VARCHAR | Optional | Organization | — | — | `"Acme Corp"` |
| subject | VARCHAR | Optional | Message subject | — | — | `"Project Inquiry"` |
| message | TEXT | Required | Message body | — | — | `"I'd like to..."` |
| source | VARCHAR | Required, default: `"contact_form"` | Origin of lead | — | Yes | `"contact_form"` |
| status | VARCHAR | Required, default: `"new"` | Pipeline stage | — | Yes | `"new"` |
| priority | VARCHAR | Required, default: `"normal"` | `"low"`, `"normal"`, `"high"` | — | — | `"high"` |
| ip_address | VARCHAR | Optional | Submitter IP | — | — | `"203.0.113.1"` |
| metadata | JSONB | Required, default: `{}` | Extra context | — | — | `{"referrer":"..."}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | Yes | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |
| deleted_at | TIMESTAMPTZ | Optional | Soft-delete timestamp | — | Yes | `null` |

### `lead_notes` — Internal notes on leads

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| lead_id | UUID | Required | Parent lead | leads(id) CASCADE | Yes | — |
| author_id | UUID | Optional | Admin who wrote note | users(id) SET NULL | — | — |
| content | TEXT | Required | Note body | — | — | `"Called client..."` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `lead_activities` — Lead timeline events

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| lead_id | UUID | Required | Parent lead | leads(id) CASCADE | Yes | — |
| actor_id | UUID | Optional | Admin who acted | users(id) SET NULL | — | — |
| action | VARCHAR | Required | Activity type | — | — | `"status_changed"` |
| description | TEXT | Optional | Human-readable summary | — | — | `"Status changed to contacted"` |
| details | JSONB | Required, default: `{}` | Structured data | — | — | `{"from":"new","to":"contacted"}` |
| ip_address | VARCHAR | Optional | Actor IP | — | — | `"203.0.113.1"` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

---

## 5. AI & Chat

### `chat_conversations` — Visitor chat sessions

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| session_id | VARCHAR | Required, Unique | Browser/storage session | — | Unique | `"sess_abc123"` |
| visitor_id | VARCHAR | Optional | Fingerprinted visitor | — | — | `"vis_xyz"` |
| page_context | VARCHAR | Optional | Starting page URL | — | — | `"/projects"` |
| message_count | INT | Required, default: `0` | Total messages | — | — | `12` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| last_activity_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| deleted_at | TIMESTAMPTZ | Optional | Soft-delete | — | — | `null` |

### `chat_messages` — Individual chat messages

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| conversation_id | UUID | Required | Parent conversation | chat_conversations(id) CASCADE | Yes | — |
| role | VARCHAR | Required | `"user"` or `"assistant"` | — | — | `"user"` |
| content | TEXT | Required | Message text | — | — | `"What projects have you done?"` |
| tokens_used | INT | Required, default: `0` | LLM token count | — | — | `150` |
| response_time_ms | INT | Required, default: `0` | Latency | — | — | `1200` |
| metadata | JSONB | Required, default: `{}` | Model, confidence, etc. | — | — | `{"model":"claude-3"}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `content_embeddings` — Vector embeddings for RAG

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| source_type | VARCHAR | Required | Entity type: `"project"`, `"skill"`, `"blog"`, `"experience"` | — | Yes | `"project"` |
| source_id | VARCHAR | Required | Entity UUID | — | — | `"a1b2c3d4-..."` |
| chunk_index | INT | Required, default: `0` | Position within source | — | — | `0` |
| chunk_text | TEXT | Required | Text segment for embedding | — | — | `"Built with React..."` |
| metadata | JSONB | Required, default: `{}` | Source context | — | — | `{"title":"My App"}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |
| **Unique** | | | `(source_type, source_id, chunk_index)` | | | |
| *embedding* | *vector(1536)* | *Raw SQL (pgvector)* | *Actual vector stored via raw migration* | — | IVFFlat | `[0.001, -0.02, ...]` |

---

## 6. Analytics

### `analytics_events` — Raw analytics events

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| event_name | VARCHAR | Required | Event type | — | Yes | `"page_view"` |
| page_url | VARCHAR | Optional | URL where event fired | — | — | `"/projects"` |
| session_id | VARCHAR | Optional | Browser session | — | Yes | `"sess_abc"` |
| visitor_id | VARCHAR | Optional | Visitor fingerprint | — | — | `"vis_xyz"` |
| user_agent | VARCHAR | Optional | UA string | — | — | `"Mozilla/5.0..."` |
| ip_address | VARCHAR | Optional | Client IP | — | — | `"203.0.113.1"` |
| properties | JSONB | Required, default: `{}` | Arbitrary event data | — | — | `{"duration":3000}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | Yes | — |

### `analytics_sessions` — Aggregated session data

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| session_id | VARCHAR | Required, Unique | Browser session ID | — | Unique | `"sess_abc123"` |
| visitor_id | VARCHAR | Optional | Fingerprinted visitor | — | — | `"vis_xyz"` |
| referrer | VARCHAR | Optional | HTTP referrer | — | — | `"https://google.com"` |
| utm_source | VARCHAR | Optional | UTM param | — | — | `"google"` |
| utm_medium | VARCHAR | Optional | UTM param | — | — | `"cpc"` |
| utm_campaign | VARCHAR | Optional | UTM param | — | — | `"spring_sale"` |
| device_type | VARCHAR | Optional | `"mobile"`, `"desktop"`, `"tablet"` | — | — | `"desktop"` |
| browser | VARCHAR | Optional | Browser name | — | — | `"Chrome"` |
| country | VARCHAR | Optional | GeoIP country | — | — | `"US"` |
| city | VARCHAR | Optional | GeoIP city | — | — | `"San Francisco"` |
| page_views | INT | Required, default: `0` | Page count | — | — | `5` |
| duration_seconds | INT | Required, default: `0` | Session length | — | — | `240` |
| started_at | TIMESTAMPTZ | Required, default: `now()` | Session start | — | Yes | — |
| last_activity_at | TIMESTAMPTZ | Required, default: `now()` | Last ping | — | — | — |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

### `page_views` — Individual page view records

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| session_id | VARCHAR | Optional | Browser session | — | — | `"sess_abc"` |
| page_url | VARCHAR | Required | URL visited | — | Yes | `"/projects"` |
| page_title | VARCHAR | Optional | Document title | — | — | `"Projects"` |
| referrer | VARCHAR | Optional | Page referrer | — | — | `"/home"` |
| scroll_depth_percent | INT | Required, default: `0` | Max scroll % | — | — | `75` |
| time_on_page_seconds | INT | Required, default: `0` | Duration | — | — | `30` |
| engagement | JSONB | Required, default: `{}` | Interaction data | — | — | `{"clicks":3}` |
| viewed_at | TIMESTAMPTZ | Required, default: `now()` | Timestamp | — | Yes | — |

---

## 7. Media & Notifications

### `media_assets` — Uploaded file metadata

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| file_name | VARCHAR | Required | Original filename | — | — | `"hero.png"` |
| file_path | VARCHAR | Required | Storage path/key | — | — | `"uploads/2025/hero.png"` |
| bucket_name | VARCHAR | Required, default: `"assets"` | Storage bucket | — | — | `"assets"` |
| mime_type | VARCHAR | Required | MIME type | — | Yes (composite) | `"image/png"` |
| file_size_bytes | INT | Required, default: `0` | File size | — | — | `204800` |
| width | INT | Optional | Image width | — | — | `1920` |
| height | INT | Optional | Image height | — | — | `1080` |
| alt_text | VARCHAR | Optional | Accessibility text | — | — | `"Hero banner"` |
| uploaded_by | UUID | Optional | Uploader | users(id) SET NULL | — | — |
| variants | JSONB | Required, default: `{}` | Thumbnail/webp variants | — | — | `{"thumb":"..."}` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| deleted_at | TIMESTAMPTZ | Optional | Soft-delete | — | — | `null` |

### `notifications` — System notifications (Telegram, etc.)

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| type | VARCHAR | Required | Notification type | — | — | `"new_lead"` |
| title | VARCHAR | Required | Notification title | — | — | `"New Lead Received"` |
| body | TEXT | Optional | Notification body | — | — | `"Jane Doe sent..."` |
| channel | VARCHAR | Required, default: `"telegram"` | Delivery channel | — | — | `"telegram"` |
| payload | JSONB | Required, default: `{}` | Structured data | — | — | `{"leadId":"..."}` |
| is_read | BOOLEAN | Required, default: `false` | Read status | — | — | `false` |
| is_sent | BOOLEAN | Required, default: `false` | Delivery status | — | — | `true` |
| sent_at | TIMESTAMPTZ | Optional | When sent | — | — | `2025-01-01T00:00:00Z` |
| read_at | TIMESTAMPTZ | Optional | When read | — | — | `null` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |

---

## 8. System

### `system_settings` — Key-value configuration store

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| setting_key | VARCHAR | Required, Unique | Config key | — | Unique | `"site_name"` |
| setting_value | TEXT | Required, default: `""` | Config value | — | — | `"My Portfolio"` |
| setting_group | VARCHAR | Required, default: `"general"` | Group for UI | — | — | `"general"` |
| description | TEXT | Optional | Human-readable help | — | — | `"Site display name"` |
| data_type | VARCHAR | Required, default: `"string"` | Type hint for parsing | — | — | `"string"` |
| is_encrypted | BOOLEAN | Required, default: `false` | Encrypted at rest | — | — | `false` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `audit_logs` — Row-level data change audit

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| table_name | VARCHAR | Required | Affected table | — | Yes | `"projects"` |
| record_id | VARCHAR | Required | Affected row ID | — | Yes | `"a1b2c3d4-..."` |
| action | VARCHAR | Required | `"CREATE"`, `"UPDATE"`, `"DELETE"` | — | — | `"UPDATE"` |
| actor_id | UUID | Optional | Acting user | users(id) SET NULL | — | — |
| ip_address | VARCHAR | Optional | Actor IP | — | — | `"203.0.113.1"` |
| old_values | JSONB | Optional | Previous state | — | — | `{"title":"Old"}` |
| new_values | JSONB | Optional | New state | — | — | `{"title":"New"}` |
| correlation_id | VARCHAR | Optional | Request tracing ID | — | — | `"req_abc"` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | Yes | — |

### `admin_activities` — Admin dashboard action log

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| admin_id | UUID | Optional | Admin who acted | users(id) SET NULL | Yes | — |
| action | VARCHAR | Required | Performed action | — | — | `"login"` |
| resource_type | VARCHAR | Optional | Target entity type | — | — | `"project"` |
| resource_id | VARCHAR | Optional | Target entity ID | — | — | `"a1b2c3d4-..."` |
| description | TEXT | Optional | Summary | — | — | `"Admin logged in"` |
| details | JSONB | Required, default: `{}` | Extra context | — | — | `{"method":"google"}` |
| ip_address | VARCHAR | Optional | Actor IP | — | — | `"203.0.113.1"` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | Yes | — |

### `availability_status` — Singleton availability indicator

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| is_available | BOOLEAN | Required, default: `true` | Available for hire | — | — | `true` |
| status_label | VARCHAR | Required, default: `"Available for new opportunities"` | Custom message | — | — | `"Available for new opportunities"` |
| available_until | VARCHAR | Optional | Date string or `"ongoing"` | — | — | `"2025-12-31"` |
| preferred_contact | VARCHAR | Required, default: `"email"` | Preferred channel | — | — | `"email"` |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

### `feature_flags` — Toggleable feature switches

| Field | Type | Constraints | Description | FK | Indexed | Example |
|---|---|---|---|---|---|---|
| id | UUID | PK, Required | — | — | PK | — |
| flag_key | VARCHAR | Required, Unique | Feature identifier | — | Unique | `"new_chat_ui"` |
| description | TEXT | Optional | What this controls | — | — | `"Enables new chat interface"` |
| is_enabled | BOOLEAN | Required, default: `false` | Master toggle | — | — | `true` |
| targeting_rules | JSONB | Required, default: `{}` | User/role targeting | — | — | `{"roles":["admin"]}` |
| rollout_percentage | INT | Required, default: `0` | Gradual rollout (0–100) | — | — | `50` |
| created_at | TIMESTAMPTZ | Required, default: `now()` | — | — | — | — |
| updated_at | TIMESTAMPTZ | Required, auto | — | — | — | — |

---

## 9. Enums

| Enum | Values | Used By |
|---|---|---|
| `UserRole` | `admin`, `editor`, `viewer` | `users.role` |

---

## Index Summary

### Unique Indexes (Primary keys omitted)

| Table | Columns | Type |
|---|---|---|
| `users` | `email` | Unique (BTREE) |
| `sessions` | `refresh_token` | Unique (BTREE) |
| `sessions` | `(user_id, id)` | PK (BTREE) |
| `sections` | `section_key` | Unique (BTREE) |
| `projects` | `slug` | Unique (BTREE) |
| `blog_posts` | `slug` | Unique (BTREE) |
| `post_tags` | `(post_id, tag)` | Unique (BTREE) |
| `leads` | `(id, deleted_at)` | PK (BTREE) |
| `analytics_sessions` | `session_id` | Unique (BTREE) |
| `chat_conversations` | `session_id` | Unique (BTREE) |
| `system_settings` | `setting_key` | Unique (BTREE) |
| `feature_flags` | `flag_key` | Unique (BTREE) |
| `content_embeddings` | `(source_type, source_id, chunk_index)` | Unique (BTREE) |
| `api_keys` | `key_hash` | Unique (BTREE) |

### Regular Indexes

| Table | Columns | Type |
|---|---|---|
| `sessions` | `user_id` | BTREE |
| `sections` | `display_order` | BTREE |
| `sections` | `is_live` | BTREE |
| `sections` | `is_live, section_type` | BTREE |
| `projects` | `slug` | BTREE |
| `projects` | `category` | BTREE |
| `projects` | `is_featured` | BTREE |
| `projects` | `is_featured, is_private` | BTREE |
| `projects` | `category, is_private` | BTREE |
| `projects` | `display_order` | BTREE |
| `project_images` | `project_id` | BTREE |
| `blog_posts` | `slug` | BTREE |
| `blog_posts` | `is_published` | BTREE |
| `blog_posts` | `is_published, published_at DESC NULLS LAST` | BTREE |
| `blog_posts` | `published_at DESC NULLS LAST` | BTREE |
| `blog_posts` | `tags` | **GIN** (array) |
| `post_tags` | `post_id` | BTREE |
| `post_tags` | `tag` | BTREE |
| `testimonials` | `is_visible` | BTREE |
| `testimonials` | `is_visible, is_featured` | BTREE |
| `skills` | `category` | BTREE |
| `skills` | `is_featured` | BTREE |
| `skills` | `category, is_featured` | BTREE |
| `experiences` | `display_order` | BTREE |
| `experiences` | `is_visible, display_order` | BTREE |
| `achievements` | `category, display_order` | BTREE |
| `leads` | `status` | BTREE |
| `leads` | `status, created_at DESC` | BTREE |
| `leads` | `source` | BTREE |
| `leads` | `email` | BTREE |
| `leads` | `created_at DESC` | BTREE |
| `leads` | `deleted_at` | BTREE |
| `lead_notes` | `lead_id` | BTREE |
| `lead_activities` | `lead_id` | BTREE |
| `analytics_events` | `event_name` | BTREE |
| `analytics_events` | `event_name, created_at DESC` | BTREE |
| `analytics_events` | `session_id` | BTREE |
| `analytics_events` | `created_at DESC` | BTREE |
| `analytics_sessions` | `started_at DESC` | BTREE |
| `page_views` | `page_url` | BTREE |
| `page_views` | `viewed_at DESC` | BTREE |
| `chat_conversations` | `session_id` | BTREE |
| `chat_messages` | `conversation_id` | BTREE |
| `media_assets` | `mime_type, created_at DESC` | BTREE |
| `audit_logs` | `table_name` | BTREE |
| `audit_logs` | `record_id` | BTREE |
| `audit_logs` | `created_at DESC` | BTREE |
| `admin_activities` | `admin_id` | BTREE |
| `admin_activities` | `created_at DESC` | BTREE |
| `case_studies` | `project_id` | BTREE |
| `content_embeddings` | `source_type` | BTREE |

### Special Index Types

| Table | Columns | Type | Purpose |
|---|---|---|---|
| `blog_posts` | `tags` | **GIN** | Efficient array containment/overlap queries |
| `content_embeddings` | `embedding` | **IVFFlat** (raw SQL) | Approximate nearest-neighbor vector search |

---

## RLS Policy Summary

Row-Level Security is **not defined in the Prisma schema**. However, recommended RLS policies by domain:

| Table(s) | Recommended RLS |
|---|---|
| `users`, `sessions`, `api_keys` | Admins only — self via `user_id` |
| `sections`, `projects`, `blog_posts`, `skills`, `experiences`, `achievements`, `services`, `faqs`, `testimonials`, `case_studies`, `press_features`, `guest_appearances`, `reading_list` | Public read for `is_published`/`is_visible`/`is_live = true`; admin CUD |
| `leads`, `lead_notes`, `lead_activities` | Admins only (full access) |
| `chat_conversations`, `chat_messages` | Self via `session_id` for visitors; admin for full access |
| `analytics_events`, `analytics_sessions`, `page_views` | Admin-only read; insert-only for public |
| `media_assets` | Public read; admin CUD |
| `system_settings`, `audit_logs`, `admin_activities`, `availability_status`, `feature_flags` | Admin-only |
| `notifications` | Admin-only read; system insert |
| `content_embeddings` | Public read; system insert/update |

---

## Storage Estimates

| Table | Est. Rows | Est. Size | Growth Rate | Notes |
|---|---|---|---|---|
| `users` | < 10 | ~16 KB | None | Personal portfolio |
| `sessions` | < 50 | ~32 KB | Low | Per-user sessions |
| `api_keys` | < 5 | ~8 KB | None | CI/CD keys |
| `sections` | ~15 | ~128 KB | Very low | Fixed set of sections |
| `projects` | ~20 | ~512 KB | Low | Portfolio projects |
| `project_images` | ~60 | ~32 KB | Low | ~3 per project |
| `blog_posts` | ~30 | ~1 MB | Low | Blog articles |
| `post_tags` | ~120 | ~16 KB | Low | ~4 per post |
| `case_studies` | ~10 | ~256 KB | Very low | ~1 per project |
| `skills` | ~40 | ~32 KB | Very low | Skill catalog |
| `experiences` | ~10 | ~64 KB | Very low | Work history |
| `achievements` | ~15 | ~32 KB | None | Static |
| `services` | ~8 | ~16 KB | None | Service offerings |
| `faqs` | ~15 | ~32 KB | None | Static |
| `testimonials` | ~20 | ~64 KB | Low | Endorsements |
| `press_features` | ~10 | ~16 KB | Low | Press mentions |
| `guest_appearances` | ~10 | ~16 KB | Low | Podcasts/talks |
| `reading_list` | ~20 | ~16 KB | Low | Book recs |
| `leads` | ~200/yr | ~512 KB | Medium | Contact form |
| `lead_notes` | ~100/yr | ~128 KB | Medium | Internal notes |
| `lead_activities` | ~400/yr | ~256 KB | Medium | Timeline events |
| `chat_conversations` | ~500/yr | ~128 KB | Medium | Visitor chat |
| `chat_messages` | ~5,000/yr | ~2 MB | Medium | ~10 per conversation |
| `content_embeddings` | ~1,000 | ~4 MB | Low | RAG chunks |
| `analytics_events` | ~50,000/yr | ~8 MB | High | Raw events |
| `analytics_sessions` | ~5,000/yr | ~1 MB | High | Aggregated sessions |
| `page_views` | ~50,000/yr | ~4 MB | High | Per-page views |
| `media_assets` | ~100 | ~64 KB | Low | Upload metadata |
| `notifications` | ~500/yr | ~128 KB | Medium | System alerts |
| `system_settings` | ~50 | ~16 KB | Very low | Config store |
| `audit_logs` | ~5,000/yr | ~2 MB | Medium | Change audit |
| `admin_activities` | ~1,000/yr | ~512 KB | Medium | Admin log |
| `availability_status` | 1 | ~4 KB | None | Singleton |
| `feature_flags` | ~20 | ~16 KB | Very low | Feature toggles |

**Total estimated footprint:** ~25–30 MB (excluding uploads/media files stored in blob storage)

---

## Relationship Diagram

```
users ──┬── sessions          (1:N — user owns many sessions)
         ├── lead_notes        (1:N — optional author)
         ├── lead_activities   (1:N — optional actor)
         ├── media_assets      (1:N — uploader)
         ├── audit_logs        (1:N — optional actor)
         └── admin_activities  (1:N — optional admin)

projects ──┬── project_images  (1:N — cascade delete)
           └── case_studies    (1:N — cascade delete, effectively 1:1)

blog_posts ──┬── post_tags     (1:N — cascade delete)

leads ──┬── lead_notes         (1:N — cascade delete)
        └── lead_activities    (1:N — cascade delete)

chat_conversations ──┬── chat_messages  (1:N — cascade delete)

NO cross-table FK references on these standalone tables:
  Section, Testimonial, Skill, Experience, Achievement, Service, FAQ,
  AnalyticsEvent, AnalyticsSession, PageView, PressFeature,
  GuestAppearance, ReadingListItem, AvailabilityStatus,
  ApiKey, FeatureFlag, ContentEmbedding, Notification, SystemSetting
```

---

*Generated from `apps/api/prisma/schema.prisma` — 34 models (tables) across 8 domains + 1 enum.*
