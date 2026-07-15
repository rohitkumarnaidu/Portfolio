# Domain Architecture

Defines the bounded contexts, ubiquitous language, and DDD patterns for the Ultimate Portfolio. The system is decomposed into four bounded contexts, each with its own internal consistency and explicit relationships to the others.

---

## Bounded Context Overview

```
Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
Ã¢â€â€š              Portfolio Context               Ã¢â€â€š
Ã¢â€â€š  Public read-only content delivery           Ã¢â€â€š
Ã¢â€â€š  Controllers: portfolio/controllers/         Ã¢â€â€š
Ã¢â€â€š  Caching: @CacheTTL(60-120s)                Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
              Ã¢â€â€š depends on
              Ã¢â€“Â¼
Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
Ã¢â€â€š              Admin Context                   Ã¢â€â€š
Ã¢â€â€š  Authenticated CRUD operations               Ã¢â€â€š
Ã¢â€â€š  Controllers: admin/controllers/            Ã¢â€â€š
Ã¢â€â€š  Guards: JwtAuthGuard + RolesGuard           Ã¢â€â€š
Ã¢â€â€š  Audit: @Audit() decorator                   Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
              Ã¢â€â€š imports
              Ã¢â€“Â¼
Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
Ã¢â€â€š         Shared Modules Context               Ã¢â€â€š
Ã¢â€â€š  Business logic: modules/<entity>/           Ã¢â€â€š
Ã¢â€â€š  Cross-cutting: common/                      Ã¢â€â€š
Ã¢â€â€š  Shared types: @portfolio/shared             Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
              Ã¢â€â€š orchestrates
              Ã¢â€“Â¼
Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â
Ã¢â€â€š              AI Context                      Ã¢â€â€š
Ã¢â€â€š  LLM chat, RAG, embedding generation         Ã¢â€â€š
Ã¢â€â€š  Service: apps/ai/ (FastAPI)                Ã¢â€â€š
Ã¢â€â€š  Vector DB: pgvector in Supabase             Ã¢â€â€š
Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ
```

---

## 1. Portfolio Context (Public Content Delivery)

**Purpose:** Serve read-only portfolio content to visitors at high throughput with low latency. No authentication.

**Entities:**

- **Section** Ã¢â‚¬â€ Homepage sections (Hero, About, Skills, Experience, Featured Projects, Testimonials, Blog Preview, Services, FAQ, Contact). Has `type`, `is_live`, `sort_order`. Controlled by `SectionsService`.
- **Project** Ã¢â‚¬â€ Portfolio piece with rich metadata, 3D asset references, Markdown content, tech stack tags, categories. Exposed at `/api/portfolio/projects`.
- **Experience** Ã¢â‚¬â€ Work history timeline entries with `company`, `role`, `start_date`, `end_date`, `description`.
- **Skill** Ã¢â‚¬â€ Technical/soft skills with `name`, `category`, `proficiency`. Linked to Projects and Experiences.
- **BlogPost** Ã¢â‚¬â€ Technical articles with `title`, `slug`, `content`, `published_at`, `tags`.
- **Lead** Ã¢â‚¬â€ Contact form submissions (write-only from this context).

**Ubiquitous Language:**
| Term | Meaning |
|------|---------|
| Section | A named block on the homepage with a specific type and content |
| Live | A section or entity that is publicly visible (is_live flag) |
| Slug | URL-friendly identifier derived from a title |
| Featured | A project flagged for priority display on the homepage |

**Key Files:**

- Controllers: `apps/api/src/portfolio/controllers/*.ts` (18 controllers)
- Module: `apps/api/src/portfolio/portfolio.module.ts`

---

## 2. Admin Context (Authenticated Management)

**Purpose:** Enable the portfolio owner and editors to manage all content through a dashboard UI. Full CRUD with audit trail and role-based access.

**Entities (Portfolio entities + Admin-specific):**

- **User** Ã¢â‚¬â€ Admin user with `email`, `display_name`, `role` (`admin`/`editor`/`viewer`).
- **Activity** Ã¢â‚¬â€ Audit log entry recording who did what to which resource. Managed via `@Audit()` decorator at `apps/api/src/common/decorators/audit.decorator.ts`.
- **Media** Ã¢â‚¬â€ Uploaded files (images, 3D models) stored in Supabase Storage.
- **SystemSetting** Ã¢â‚¬â€ Key-value configuration store for site settings and AI system prompts.
- **ApiKey** Ã¢â‚¬â€ Programmatic access keys for external integrations.
- **Notification** Ã¢â‚¬â€ Admin-facing notifications (new leads, errors, system events).
- **Sandbox** Ã¢â‚¬â€ WebContainer-based in-browser IDE session metadata.

**Ubiquitous Language:**
| Term | Meaning |
|------|---------|
| Role | Access level (admin=full, editor=write, viewer=read-only) |
| Audit | Immutable record of who performed what action on which resource |
| Soft-delete | Marking a record as deleted without removing it from the database |
| Hard-delete | Permanently removing a record from the database |

**Key Files:**

- Controllers: `apps/api/src/admin/controllers/*.ts` (28 controllers)
- Module: `apps/api/src/admin/admin.module.ts`
- Guards: `apps/api/src/modules/auth/`

---

## 3. AI Context (Intelligent Assistant)

**Purpose:** Provide LLM-powered chat, content analysis, and suggestion features. This context is physically separated from the NestJS API (FastAPI microservice at `apps/ai/`).

**Entities:**

- **Conversation** Ã¢â‚¬â€ A chat session between a user and the AI assistant.
- **Message** Ã¢â‚¬â€ Individual message within a conversation (user or assistant).
- **DocumentChunk** Ã¢â‚¬â€ Vectorized text chunk from Projects, Experiences, and BlogPosts for RAG retrieval.
- **Interaction** Ã¢â‚¬â€ User interaction metadata for analytics and improvement.

**Ubiquitous Language:**
| Term | Meaning |
|------|---------|
| RAG | Retrieval-Augmented Generation: fetching relevant context before LLM response |
| Embedding | 1536-dimensional vector representation of text (OpenAI text-embedding-ada-002) |
| Chunk | A fixed-size segment of content that gets embedded for vector search |
| SSE | Server-Sent Events Ã¢â‚¬â€ used to stream AI responses to the browser |

**Key Files:**

- FastAPI routes: `apps/ai/app/main.py`
- Chat module (NestJS side): `apps/api/src/modules/chat/`

---

## 4. Analytics Context (Usage Tracking)

**Purpose:** Capture and report usage events from both public and admin surfaces.

**Entities:**

- **AnalyticsEvent** Ã¢â‚¬â€ A tracked event with `event_type`, `payload`, `timestamp`, `session_id`.
- **Aggregate** Ã¢â‚¬â€ Pre-computed summary metrics for dashboard display.

**Ubiquitous Language:**
| Term | Meaning |
|------|---------|
| Event | A single tracked user action (page view, click, lead submit) |
| Session | A continuous user visit, identified by a client-generated session ID |
| Page view | An event recording that a page was loaded |

**Key Files:**

- Controllers: `apps/api/src/portfolio/controllers/analytics.controller.ts`, `apps/api/src/admin/controllers/analytics.controller.ts`
- Service: `apps/api/src/modules/analytics/analytics.service.ts`

---

## Context Map & Relationships

| Source Context | Target Context                 | Relationship Type  | Mechanism                       |
| -------------- | ------------------------------ | ------------------ | ------------------------------- |
| Portfolio      | Shared Modules                 | Strong dependency  | Imports service, calls methods  |
| Admin          | Shared Modules                 | Strong dependency  | Imports service, calls methods  |
| Shared Modules | Database (Supabase/PostgreSQL) | Infrastructure     | PrismaService via PrismaClient  |
| AI (FastAPI)   | Shared Modules                 | REST communication | NestJS calls FastAPI endpoints  |
| AI (FastAPI)   | Database (pgvector)            | Infrastructure     | Direct pgvector queries         |
| Analytics      | Database                       | Infrastructure     | Writes events via PrismaService |

## Domain Events

The system uses NestJS event emitters for key domain events:

| Event               | Emitter         | Subscribers                                                                      |
| ------------------- | --------------- | -------------------------------------------------------------------------------- |
| `lead.created`      | LeadsService    | NotificationsModule (creates admin notification), Queue (sends auto-reply email) |
| `project.published` | ProjectsService | BlogModule (cross-link), AI service (re-index chunks)                            |
| `blog.published`    | BlogService     | Sitemap regeneration trigger                                                     |

Events are emitted synchronously within the NestJS request lifecycle using `@nestjs/event-emitter`. Heavy side effects (email sending, AI re-indexing) are enqueued in BullMQ for async processing.

## Cross-References

- [../MASTER-INDEX.md](../MASTER-INDEX.md) â€” Documentation master index
- [../26-reference/CROSS-REFERENCE-INDEX.md](../26-reference/CROSS-REFERENCE-INDEX.md) â€” Cross-reference system
