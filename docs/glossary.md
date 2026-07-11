# Glossary

## A

### A11y (Accessibility)

The practice of making web applications usable by people with disabilities. The project targets WCAG 2.2 AA compliance. _Context: apps/web, all UI components._ See also: WCAG, ARIA, Skip Link, Focus Trap.

### Access Token

Short-lived JWT credential (typically 15 min) used to authenticate API requests. Attached as `Authorization: Bearer <token>`. _Context: apps/api auth module._ See also: JWT, Refresh Token, Bearer Token.

### Account Lockout

Security mechanism that temporarily disables an account after `failedLoginAttempts` exceed a threshold. Tracked via `lockedUntil` on the User model. _Context: apps/api auth module — User model._ See also: bcrypt, Hash, Salt.

### Achievement

A recognisable accomplishment, certification, or award displayed on the portfolio. Stored in the `Achievement` model. _Context: modules/achievements._

### ADR (Architecture Decision Record)

A document capturing an important architectural decision, including context, options considered, decision rationale, and consequences. Located in `docs/adr/`. See also: RFC.

### Admin Activity

Logged trail of all admin user actions on the platform. Stored in the `AdminActivity` model. _Context: apps/api admin controllers, modules/admin-activities._ See also: Audit Log.

### Admin Controller

NestJS controller serving authenticated CRUD endpoints under `/api/admin/*`. Guarded with `JwtAuthGuard` and `RolesGuard`. _Context: apps/api/src/admin/controllers/._

### Agile

Iterative software development methodology emphasising short cycles (sprints), continuous feedback, and adaptive planning. _Context: project management process._

### AI Engineering Constitution

Governance document defining AI usage principles, guardrails, and ethical boundaries. Located at `docs/governance/32-SKILL.md`. _Context: docs/governance._

### AI Service

The FastAPI microservice (`apps/ai/`) providing LLM-powered features including chat, content generation, and RAG. _Context: apps/ai._ See also: FastAPI, RAG.

### Alert

A notification triggered when a metric exceeds a predefined threshold (e.g., p95 latency > 500ms). _Context: monitoring/Sentry._ See also: Alertmanager, SLO, Error Budget.

### Alertmanager

Component that handles alert deduplication, grouping, routing, and silencing. _Context: monitoring infrastructure._ See also: Alert.

### Alpine

Minimalist Docker base image (~5 MB) based on musl libc. Used to reduce image size. _Context: Docker images._ See also: Docker, Multi-stage Build, Non-root User.

### AnalyticsEvent

Raw event data captured for visitor behaviour tracking. Stored in the `AnalyticsEvent` model. _Context: modules/analytics._ See also: AnalyticsSession, PageView.

### AnalyticsSession

Aggregated session data representing a single visitor's browsing session. Tracks referrer, UTM parameters, device info, page views, and duration. _Context: modules/analytics._ See also: AnalyticsEvent, PageView.

### Anthropic

AI safety and research company; provider of the Claude LLM family used in the AI service. _Context: apps/ai._ See also: Claude, LLM, OpenAI.

### API Envelope

Standard API response format: `{ data, meta? }`. All API responses follow this structure for consistency. _Context: apps/api common response interceptors._ See also: DTO.

### API Key

Pre-shared key used for machine-to-machine API access. Stored as a bcrypt hash in the `ApiKey` model with a `keyPrefix` for identification. _Context: modules/api-keys._ See also: Access Token.

### App Router

Next.js 14 routing paradigm using the `app/` directory, supporting server components, layouts, and ISR. _Context: apps/web/src/app/._ See also: RSC, Layout, Template.

### ARIA (Accessible Rich Internet Applications)

WAI-ARIA specification defining HTML attributes that enhance accessibility for screen readers (e.g., `aria-label`, `role`). _Context: all UI components._ See also: A11y, Screen Reader.

### Artifact

A file or archive produced by a CI/CD pipeline step (e.g., build output, test reports). Can be passed between jobs. _Context: GitHub Actions._ See also: CI/CD, Runner.

### Audit Log

A record of mutations to the system, captured via `@Audit()` decorator. Stored in the `AuditLog` model with old/new values, actor ID, and correlation ID. _Context: apps/api common/decorators._ See also: Correlation ID, Admin Activity.

### AvailabilityStatus

Model tracking whether the portfolio owner is open to new opportunities, with status label and preferred contact method. _Context: modules/availability-status._

## B

### Background Job

Asynchronous task processed via BullMQ queues. Examples: email dispatch, data retention cleanup, embedding generation. _Context: apps/api common/queue._ See also: BullMQ, Job, Worker.

### bcrypt

Password-hashing algorithm designed for slow, salted hashing. Used to hash user passwords and API keys. _Context: apps/api auth module._ See also: Hash, Salt, Salt Rounds.

### Bearer Token

Authentication scheme where the access token is sent in the `Authorization: Bearer <token>` HTTP header. _Context: apps/api auth guards._ See also: JWT, Access Token.

### Bento Grid

CSS layout style combining asymmetric grid cells of varying sizes, creating a visually dynamic bento-box aesthetic. _Context: apps/web section components._ See also: Tailwind CSS, Responsive Design.

### Blue/Green Deployment

Zero-downtime deployment strategy running two identical environments (blue = current, green = new). Traffic is switched after green passes health checks. _Context: docs/operations/deployment-strategy-blue-green.md._ See also: CI/CD.

### Bounded Context

A logical boundary within the domain where a particular model is defined and applicable. Used in DDD. _Context: architecture principle._ See also: DDD.

### Branch Strategy

Git branching convention using trunk-based development with 7 branch types: feature, bugfix, hotfix, release, chore, docs, experimental. _Context: docs/engineering/branch-strategy.md._ See also: Conventional Commits, PR.

### BullMQ

Redis-based job queue library used for background processing in the NestJS API, including the NotificationWorker and EmbeddingWorker. _Context: apps/api common/queue._ See also: Queue, Worker, Job, Redis.

## C

### C4 Model

Architecture documentation approach with 4 levels: Context, Container, Component, Code. _Context: docs/architecture/SystemArchitecture.md._ See also: ADR.

### Cache-Aside

Caching pattern where the application reads from cache first, and on miss fetches from database and populates cache. _Context: apps/api common/cache._ See also: Upstash, Redis.

### Cascade

Database referential action specifying what happens to child records when a parent is deleted. Used extensively in the Prisma schema (e.g., `onDelete: Cascade` on relations). _Context: Prisma schema models._ See also: Foreign Key, Soft Delete.

### CaseStudy

An in-depth project analysis covering challenge, approach, solution, and impact with architecture diagrams and metrics. _Context: modules/case-studies._ See also: Project.

### Change Failure Rate

DORA metric: percentage of deployments causing a failure in production. Target: < 15%. _Context: docs/operations._ See also: DORA Metrics.

### Changelog

A chronologically ordered file documenting notable changes for each release, following the Keep a Changelog format. _Context: project root._ See also: Semantic Versioning, Conventional Commits.

### ChatConversation

Model representing an AI chat session with a visitor, tracking message count, page context, and timestamps. _Context: modules/chat._ See also: ChatMessage.

### ChatMessage

Individual message in a chat conversation, recording role (user/assistant), content, tokens used, and response time. _Context: modules/chat._ See also: ChatConversation.

### Chunk

A segment of text produced by splitting a larger document during the ingestion phase of a RAG pipeline. Stored in the `ContentEmbedding` model. _Context: apps/ai, modules/chat._ See also: RAG, Chunking, Embedding.

### Chunking

The process of splitting documents into smaller, semantically meaningful pieces for embedding and retrieval. _Context: apps/ai RAG pipeline._ See also: Chunk, Embedding, RAG.

### CI/CD (Continuous Integration / Continuous Deployment)

Automated pipeline that builds, tests, and deploys code changes. Implemented via GitHub Actions. _Context: .github/workflows._ See also: GitHub Actions, Workflow, Deployment.

### Class Validator

NestJS library (`class-validator`) providing declarative validation decorators (`@IsString()`, `@IsEmail()`, etc.) on DTOs. _Context: apps/api modules DTOs._ See also: ValidationPipe, DTO.

### Claude

A family of AI models by Anthropic used in the AI service for chat and content generation. _Context: apps/ai._ See also: Anthropic, LLM.

### Clean Architecture

Architecture pattern by Robert C. Martin emphasising dependency inversion, with business rules independent of frameworks, databases, and UI. _Context: architecture principle._ See also: Dependency Injection, Hexagonal Architecture.

### Cleanup Service

Cron-based service (`CleanupService`) that periodically removes soft-deleted or expired records based on data retention policies. _Context: apps/api common/cleanup._ See also: Data Retention, Soft Delete.

### Client Component

React component that runs on the client, enabled by the `'use client'` directive. Used when interactivity is needed. _Context: apps/web._ See also: RSC, Hydration, Client Shell.

### Client Shell

The minimal client-rendered wrapper around server components, providing interactive elements (nav, theme toggle) while the rest of the page is server-rendered. _Context: apps/web layout._ See also: Client Component, Hydration.

### Code Coverage

A metric measuring what percentage of code is exercised by tests. Tracked via Jest/Vitest coverage reports. _Context: testing._ See also: Coverage Threshold, Test Pyramid.

### Code Review

Systematic examination of code changes by one or more peers before merging, with defined SLA tiers for different change types. _Context: docs/engineering/code-review-standards.md._ See also: PR.

### CodeQL

GitHub's semantic code analysis engine for finding security vulnerabilities and code quality issues. Runs as a CI step. _Context: GitHub Actions._ See also: CI/CD, Supply Chain Security.

### Component Library

A collection of reusable UI components. This project uses shadcn/ui (built on Radix + Tailwind) in `packages/ui`. _Context: packages/ui._ See also: shadcn/ui, Design System.

### Connection Pool

A cache of database connections maintained by the `pg.Pool` instance, reducing connection overhead. _Context: apps/api PrismaService, pg adapter._ See also: Prisma Service, PostgreSQL.

### Content Embedding

Vector representation of content stored in the `ContentEmbedding` model using pgvector. _Context: modules/chat, RAG pipeline._ See also: Embedding, pgvector.

### Controller

NestJS component handling HTTP request/response, decorated with `@Controller()`. Business logic is delegated to services. _Context: apps/api controllers._ See also: Service, Module (NestJS).

### Conventional Commits

Standardized commit message format: `type(scope): description`. Types: feat, fix, chore, docs, refactor, test, ci, etc. _Context: git history, branch strategy._ See also: Semantic Versioning, Changelog.

### Correlation ID

Unique identifier propagated across services and logs for tracing requests end-to-end. Stored in `AuditLog.correlationId`. _Context: apps/api common middleware._ See also: Audit Log, Distributed Tracing.

### CORS (Cross-Origin Resource Sharing)

Browser security mechanism controlling which origins can access API resources. Configured via `CORS_ORIGIN` env var. _Context: apps/api main.ts._ See also: Helmet, CSP.

### Cost Controller

AI service component limiting token usage and spend per session/user, with configurable budgets and rate limits. _Context: apps/ai._ See also: Rate Limit (AI), Token.

### Coverage Threshold

Minimum acceptable code coverage percentage enforced in CI. When coverage drops below threshold, the pipeline fails. _Context: Jest/Vitest config._ See also: Code Coverage, CI/CD.

### CSP (Content Security Policy)

HTTP response header that restricts which resources (scripts, styles, images) the browser can load, preventing XSS attacks. _Context: apps/api Helmet config._ See also: Helmet, XSS.

### CQRS (Command Query Responsibility Segregation)

Pattern separating read and write operations into different models. _Not used in this project_ — the API uses a single model per entity. See also: Clean Architecture, Three-Layer Module Pattern.

## D

### Data Retention

Policy governing how long different data types are stored before cleanup. Implemented via the CleanupService with configurable TTLs per entity. _Context: apps/api common/cleanup._ See also: Cleanup Service, Soft Delete.

### DDD (Domain-Driven Design)

Software design approach focusing on modeling the domain and its logic, with tactical patterns (Entity, Value Object, Aggregate) and strategic patterns (Bounded Context, Ubiquitous Language). _Context: architecture principle._ See also: Bounded Context.

### Decorator

TypeScript/NestJS feature enabling annotation of classes, methods, and properties with metadata or behaviour (e.g., `@Get()`, `@Injectable()`, `@Audit()`). _Context: apps/api common/decorators._ See also: Custom Decorator.

### Dependency Injection

Design pattern where dependencies are provided to a class rather than created internally. Core to NestJS's IoC container. _Context: apps/api modules._ See also: Inversion of Control, Provider.

### Dependabot

GitHub's automated dependency update tool that creates PRs when outdated or vulnerable dependencies are detected. _Context: GitHub repository settings._ See also: Supply Chain Security, SBOM.

### Deployment

The process of releasing a new version of the application to an environment (preview, staging, production). _Context: Vercel + GitHub Actions._ See also: CI/CD, Blue/Green Deployment.

### Deployment Frequency

DORA metric: how often the team successfully deploys to production. Target: multiple times per day. _Context: docs/operations._ See also: DORA Metrics.

### Design System

A comprehensive set of design standards, components, and guidelines ensuring visual and behavioural consistency across the application. _Context: packages/ui, docs/design/._ See also: Design Token, Component Library.

### Design Token

A named value that stores design decisions (colors, typography, spacing, shadows). Stored as CSS custom properties in `:root`. _Context: packages/ui/styles._ See also: Design System.

### Docker

Container platform used to package the NestJS API and FastAPI AI service for portable deployment. _Context: Dockerfile in apps/api, apps/ai._ See also: Container, Multi-stage Build, Docker Compose.

### Docker Compose

Tool for defining and running multi-container Docker applications. Used for local development with PostgreSQL, Redis, and the API. _Context: docker-compose.yml._ See also: Docker, Volume, Health Check.

### DORA Metrics

Four key DevOps metrics: Deployment Frequency, Lead Time for Changes, Mean Time to Recovery (MTTR), Change Failure Rate. _Context: docs/operations._ See also: Deployment Frequency, MTTR.

### DRY (Don't Repeat Yourself)

Principle advocating against code duplication through abstraction and reuse. _Context: coding best practice._ See also: SOLID, Separation of Concerns.

### DTO (Data Transfer Object)

Object defining the shape of data for API requests/responses. Validated automatically by NestJS + class-validator. Located in `modules/<entity>/dto/`. _Context: apps/api modules._ See also: Class Validator, ValidationPipe.

## E

### E2E Test (End-to-End Test)

Test using Playwright that exercises the full system stack from browser through API to database. _Context: apps/web test/e2e._ See also: Playwright, Test Pyramid.

### Embedding

A dense vector representation of text, enabling semantic similarity search via pgvector. _Context: apps/ai, ContentEmbedding model._ See also: pgvector, RAG, Vector Search.

### Enum

A Prisma schema type defining a fixed set of allowed values. Examples: `UserRole` (admin, editor, viewer). _Context: Prisma schema._ See also: Schema, Model.

### Error Boundary

React component that catches JavaScript errors in its child component tree and renders a fallback UI instead of crashing. _Context: apps/web._ See also: Loading UI, Client Component.

### Error Budget

The acceptable amount of unreliability over a period. Calculated as `(1 - SLO) × total time`. _Context: docs/operations._ See also: SLO, SLI, Alert.

### Error Tracking

Monitoring service (Sentry) that captures and aggregates application errors with stack traces, context, and user impact. _Context: apps/api, apps/web._ See also: Sentry.

### Event Bus

BullMQ-based publish/subscribe system for event-driven communication between services. _Context: apps/api common/queue._ See also: BullMQ, Background Job.

### Event-Driven

Architecture style where components communicate through events (messages), enabling loose coupling and asynchronous processing. Implemented via BullMQ. _Context: apps/api architecture._ See also: Event Bus, BullMQ.

### Experience

A professional work experience entry showing company, role, technologies, and duration. Stored in the `Experience` model. _Context: modules/experiences._

## F

### Factory

A testing pattern for creating objects with sensible defaults, reducing test setup boilerplate. _Context: test factories in seed/._ See also: Fixture, Test Pyramid.

### FAQ

Frequently Asked Question entry with question, answer, category, and visibility toggles. Stored in the `FAQ` model. _Context: modules/faqs._

### FastAPI

Python web framework used for the AI microservice (`apps/ai/`), chosen for its async-first design, automatic OpenAPI docs, and Pydantic integration. _Context: apps/ai._ See also: Pydantic, AI Service.

### Feature Flag

Toggleable flag (via PostHog or the `FeatureFlag` model) that controls feature availability without deployment. _Context: modules/feature-flags._ See also: PostHog.

### Filter

NestJS component implementing `ExceptionFilter`, catching exceptions and returning structured error responses. _Context: apps/api common/filters._ See also: Global Exception Filter, Interceptor.

### Fixture

A fixed set of data used to run tests, ensuring a known state before each test execution. _Context: testing._ See also: Factory, Mock.

### Focus Trap

Accessibility technique that traps keyboard focus within a modal or dialog, cycling through focusable elements and preventing focus from leaving. _Context: apps/web UI components._ See also: A11y, Keyboard Navigation.

### Foreign Key

A database field that references the primary key of another table, establishing a relationship. Defined in Prisma via `@relation`. _Context: Prisma schema._ See also: Cascade, Index.

### Framer Motion

React animation library used for declarative, physics-based animations and gesture handling. _Context: apps/web._ See also: GSAP, Client Component.

## G

### gcTime (Garbage Collection Time)

TanStack Query option controlling how long inactive query data is kept in memory (previously `cacheTime`). Default: 5 minutes. _Context: apps/web lib/query-provider._ See also: TanStack Query, staleTime.

### GitHub Actions

CI/CD platform integrated into GitHub, used for automated testing, linting, building, and deployment. _Context: .github/workflows._ See also: CI/CD, Workflow, Runner.

### Glassmorphism

Design style using translucent backgrounds, backdrop blur, and subtle borders to create a frosted-glass effect. _Context: apps/web UI components._ See also: Neumorphism, Tailwind CSS.

### Global Exception Filter

NestJS filter that catches all unhandled exceptions and returns a standardized error response format. _Context: apps/api common/filters._ See also: Filter, Interceptor.

### Global Prefix

The `/api` prefix applied to all routes in the NestJS API, configured in `main.ts` via `app.setGlobalPrefix('api')`. _Context: apps/api main.ts._ See also: Controller.

### GPT-4o

OpenAI's multimodal model capable of processing text, images, and audio. One of the LLM options in the AI service. _Context: apps/ai._ See also: OpenAI, LLM, Claude.

### GSAP (GreenSock Animation Platform)

High-performance JavaScript animation library used for complex timeline-based animations and scroll-triggered effects. _Context: apps/web._ See also: Framer Motion, Lenis, Theatre.js.

### Guard

NestJS component implementing `CanActivate`, controlling route access based on conditions (auth, roles, throttling). _Context: apps/api common/guards._ See also: JwtAuthGuard, RolesGuard.

### GuestAppearance

A podcast, interview, or conference talk entry displayed on the portfolio. Stored in the `GuestAppearance` model. _Context: modules/guest-appearances._

## H

### Hash

The output of a one-way cryptographic function. Passwords and API keys are stored as bcrypt hashes, not plaintext. _Context: apps/api auth module._ See also: bcrypt, Salt, Salt Rounds.

### Health Check

An endpoint (e.g., `/api/health`) that reports application status, used by Docker, load balancers, and monitoring systems to verify service health. _Context: apps/api common._ See also: Docker Compose, Alpine.

### Helmet

Express/ NestJS middleware that sets security-related HTTP headers (CSP, HSTS, X-Frame-Options, etc.) protecting against common web vulnerabilities. _Context: apps/api main.ts._ See also: CSP, HSTS, CORS.

### Hexagonal Architecture

Also known as Ports & Adapters. Places the domain at the centre with adapters handling external interactions (database, HTTP, queues). _Context: architecture principle._ See also: Clean Architecture, Dependency Injection.

### HNSW Index (Hierarchical Navigable Small World)

A graph-based approximate nearest neighbour index used by pgvector for fast vector similarity search. _Context: apps/api database._ See also: pgvector, Vector Search, Embedding.

### HSTS (HTTP Strict Transport Security)

HTTP header instructing browsers to only communicate via HTTPS, preventing downgrade attacks. Set via Helmet. _Context: apps/api Helmet config._ See also: Helmet, CSP.

### Hydration

The process where React attaches event handlers and state to server-rendered HTML on the client, making it interactive. _Context: Next.js App Router._ See also: Client Component, RSC.

## I

### Incident Response

The process of detecting, responding to, and recovering from production incidents. Documented in playbooks and incident communication templates. _Context: docs/playbooks, docs/operations._ See also: Postmortem, Runbook.

### Incremental Static Regeneration (ISR)

Next.js rendering strategy that regenerates static pages in the background after a configurable timeout (60s default). _Context: apps/web._ See also: SSR, SSG, App Router.

### Index

A database structure that speeds up query execution at the cost of write performance. Defined in Prisma via `@@index`. _Context: Prisma schema._ See also: Foreign Key, Unique Constraint.

### Input Sanitization

The practice of cleaning user input to remove or neutralize potentially malicious content before storage or rendering. _Context: security._ See also: XSS, ValidationPipe.

### Integration Test

Tests verifying that multiple units or modules work together correctly, often involving a real database or API. _Context: testing._ See also: Unit Test, E2E Test, Test Pyramid.

### Interceptor

NestJS component implementing `NestInterceptor`, wrapping request/response processing for cross-cutting concerns like logging, caching, and transformation. _Context: apps/api common/interceptors._ See also: Filter, Middleware.

### Inversion of Control (IoC)

Principle where the framework controls the flow of the program and calls into user code. NestJS's IoC container manages dependency resolution. _Context: NestJS fundamentals._ See also: Dependency Injection.

### ioredis

A robust Redis client for Node.js used by BullMQ and the caching layer. _Context: apps/api common/queue._ See also: Redis, BullMQ.

### ISR (Incremental Static Regeneration)

See Incremental Static Regeneration.

## J

### Job

A unit of work enqueued in BullMQ for background processing. Each job has data, options (retries, delay), and lifecycle events. _Context: apps/api queue._ See also: BullMQ, Worker, Queue.

### Json Field

A Prisma column type storing unstructured JSON data. Used for flexible metadata, style config, and analytics properties. _Context: Prisma schema (e.g., `metadata Json` on most models)._ See also: Schema, Model.

### JWT (JSON Web Token)

Stateless authentication token format used for admin API access. Signed using RS256. Contains claims: user ID, role, issued-at, expiration. _Context: apps/api auth module._ See also: Access Token, Bearer Token, Refresh Token.

### JwtAuthGuard

NestJS guard that validates JWT access tokens on admin routes. Returns 401 on invalid/expired tokens. _Context: apps/api auth module, admin controllers._ See also: Guard, JWT, RolesGuard.

## K

### k6

Load testing tool for performance and stress testing API endpoints. _Context: testing._ See also: Load Test, Performance Test.

### KEEP

A retrospection technique category: practices the team should continue doing. _Context: project process._ See also: Retrospective.

### Keep a Changelog

A convention for maintaining changelogs with sections by release version and change types (Added, Changed, Deprecated, Removed, Fixed, Security). _Context: project root._ See also: Changelog, Semantic Versioning.

### Keyboard Navigation

The ability to navigate and operate all interactive elements using only the keyboard (Tab, Enter, Escape, arrow keys). _Context: apps/web UI components._ See also: A11y, Focus Trap.

### KISS (Keep It Simple, Stupid)

Design principle advocating simplicity over complexity. Prefer straightforward solutions over clever ones. _Context: coding best practice._ See also: YAGNI, DRY.

### KPI (Key Performance Indicator)

Measurable value tracking the effectiveness of a process or objective. Examples: deployment frequency, p95 latency. _Context: project management._ See also: OKR, DORA Metrics.

## L

### Layout

Next.js App Router file (`layout.tsx`) that wraps child pages with shared UI (header, footer, sidebar). Persists across navigations. _Context: apps/web/src/app/layout.tsx._ See also: App Router, Template.

### Lead

A contact form submission or inquiry, tracked with status, priority, source, and notes. Stored in the `Lead` model with soft delete. _Context: modules/leads._ See also: LeadNote, LeadActivity.

### Lead Time for Changes

DORA metric: the time from code commit to deployment in production. Target: < 1 hour. _Context: docs/operations._ See also: DORA Metrics.

### LeadActivity

A chronological log of actions taken on a lead (status change, follow-up, note added). _Context: modules/leads._ See also: Lead.

### LeadNote

An internal note attached to a lead by an admin user. _Context: modules/leads._ See also: Lead.

### Lenis

A smooth scroll library providing performant, customizable scroll behaviour and scroll-linked animations. _Context: apps/web._ See also: GSAP, Framer Motion.

### LLM (Large Language Model)

A deep learning model trained on vast text corpora capable of generating human-like text. Used in the AI service for chat and content. _Context: apps/ai._ See also: Claude, GPT-4o, OpenAI.

### Load Test

Performance test simulating expected traffic volume to measure system behaviour under load. _Context: testing with k6._ See also: Performance Test, Stress Test.

### Loading UI

Next.js file (`loading.tsx`) showing a loading state while a route segment and its children are loading. Uses React Suspense. _Context: apps/web._ See also: Suspense, Streaming.

### Logging

The practice of recording application events for debugging, monitoring, and auditing. Uses Pino for structured JSON logging. _Context: apps/api common._ See also: Structured Logging, Pino.

## M

### Mean Time to Recovery (MTTR)

DORA metric: average time to recover from a production failure. Target: < 1 hour. _Context: docs/operations._ See also: DORA Metrics, Incident Response.

### MediaAsset

An uploaded image or file stored in Supabase Storage. Tracks dimensions, MIME type, variants, and supports soft delete. _Context: modules/media._ See also: Supabase.

### Microservices

Architecture style where an application is composed of small, independently deployable services. _Not the architecture here_ — this project uses a monorepo with three tightly integrated apps. See also: Monorepo, Clean Architecture.

### Middleware

NestJS function executed before the route handler. Used for CORS, Helmet, compression, and correlation ID propagation. _Context: apps/api common/middleware._ See also: Interceptor, Filter.

### Migration

A version-controlled change to the database schema, managed via Prisma Migrate. _Context: apps/api prisma/migrations._ See also: Prisma Migrate, Schema.

### Mock

A test double that simulates a real object with pre-programmed behaviour. Used to isolate the unit under test. _Context: testing (Jest/Vitest)._ See also: Stub, Fixture.

### Model

A Prisma schema definition representing a database table. Defines fields, types, relations, indexes, and constraints. _Context: Prisma schema._ See also: Schema, Migration.

### Model Router

AI service component that selects which LLM model to use based on the task type, cost budget, latency requirements, and model availability. _Context: apps/ai._ See also: Cost Controller, LLM.

### Module (NestJS)

A NestJS module encapsulating a domain concept: `src/modules/<entity>/`. Contains service, DTOs, and exports its providers. _Context: apps/api modules._ See also: Service, Controller, Provider.

### Monaco Editor

The code editor that powers VS Code, used in the Sandbox IDE feature via `@monaco-editor/react`. _Context: apps/web admin/sandbox._ See also: WebContainer.

### Monitoring

Continuous observation of system health, performance, and behaviour through metrics, logs, and traces. _Context: Sentry, Vercel Analytics._ See also: Observability, Telemetry.

### Monorepo

A single repository containing multiple distinct projects (apps and packages). Managed via npm workspaces and Turborepo. _Context: project root._ See also: Turborepo, Workspace.

### Motion

Framer Motion's sibling library providing animation primitives for React. Used alongside Framer Motion for animations. _Context: apps/web._ See also: Framer Motion.

### Multi-stage Build

Docker optimisation technique using multiple `FROM` statements. Build artifacts are copied from earlier stages to the final slim image, reducing size. _Context: Dockerfile._ See also: Docker, Alpine.

### Mutation

A TanStack Query operation that creates, updates, or deletes data on the server. Triggers cache invalidation on success. _Context: apps/web lib/data._ See also: TanStack Query, Query Invalidation, Optimistic Update.

## N

### NestJS

A progressive Node.js framework for building server-side applications, using TypeScript, decorators, and a modular architecture inspired by Angular. _Context: apps/api._ See also: Controller, Service, Module (NestJS), Guard.

### Neumorphism

Design style using soft shadows and subtle tonal contrasts to create UI elements that appear extruded from or inset into the background. _Context: apps/web UI components._ See also: Glassmorphism, Tailwind CSS.

### Next.js

React framework providing server-side rendering, static generation, routing, and more. Version 14 with App Router. _Context: apps/web._ See also: App Router, RSC, ISR.

### Non-root User

Docker security best practice: running the application process as a non-privileged user (e.g., `node`) rather than root, limiting blast radius. _Context: Dockerfile._ See also: Docker, Alpine.

### not-found

Next.js file (`not-found.tsx`) rendering a custom 404 page when a route or resource is not found. _Context: apps/web._ See also: App Router, Error Boundary.

### Notification

System-generated alert sent via configured channels (Telegram, email). Stored in the `Notification` model. _Context: modules/notifications, common/notifications._ See also: Background Job.

## O

### OAuth 2.0

Open standard for token-based authorization, enabling third-party apps to access user data without exposing credentials. _Context: apps/api auth module._ See also: Google OAuth, GitHub OAuth, Passport.js.

### Observability

The ability to understand a system's internal state from its external outputs (logs, metrics, traces). _Context: docs/architecture._ See also: Monitoring, Telemetry, Distributed Tracing.

### OKR (Objectives and Key Results)

Goal-setting framework pairing an ambitious objective with 3-5 measurable key results. _Context: project management._ See also: KPI.

### On-Call Schedule

Rotated responsibility assignment for responding to production incidents, with defined roles, handoff process, and escalation paths. _Context: docs/operations/on-call-schedule.md._ See also: Incident Response.

### OpenAPI 3.1

API specification format. The project's spec is at `docs/api/openapi.json` with 111 endpoints and 35 schemas. Generated automatically by NestJS Swagger module. _Context: docs/api._ See also: Swagger.

### OpenAI

AI research and deployment company; provider of the GPT-4o model used in the AI service. _Context: apps/ai._ See also: GPT-4o, LLM, Anthropic.

### Optimistic Update

TanStack Query pattern where the UI immediately reflects a mutation's expected result before the server confirms it, then rolls back on error. _Context: apps/web lib/data._ See also: Mutation, TanStack Query.

## P

### PageView

A recorded visit to a specific page URL, tracking scroll depth, time on page, and engagement data. _Context: modules/analytics._ See also: AnalyticsEvent, AnalyticsSession.

### Passport.js

Authentication middleware for Node.js with a strategy-based plugin architecture. Used by NestJS's `@nestjs/passport` module. _Context: apps/api auth module._ See also: Strategy, JWT, OAuth 2.0.

### Performance Monitoring

Tracking application runtime performance metrics (response times, throughput, error rates) to identify regressions and bottlenecks. _Context: Sentry Performance._ See also: Sentry, Monitoring.

### Performance Test

Test measuring system responsiveness and stability under a specific workload. _Context: testing._ See also: Load Test, k6.

### pgvector

PostgreSQL extension for vector similarity search. Used for semantic search in the RAG pipeline. Supports HNSW and IVFFlat indexes. _Context: apps/api database + apps/ai._ See also: Embedding, HNSW Index, Vector Search.

### Pino

Low-overhead Node.js logger producing structured JSON logs. Used throughout the NestJS API. _Context: apps/api common._ See also: Logging, Structured Logging.

### Pipe

NestJS component implementing `PipeTransform`, used for input validation and transformation. The global `ValidationPipe` is the primary example. _Context: apps/api common/pipes._ See also: ValidationPipe, DTO.

### Playwright

Microsoft's browser automation framework used for E2E and visual regression testing of the web app. _Context: apps/web._ See also: E2E Test, Visual Regression Test.

### Portfolio Controller

NestJS controller serving public read-only endpoints under `/api/portfolio/*`. Response-cached, no auth required. _Context: apps/api portfolio/controllers._ See also: Controller, Admin Controller.

### PostCSS

A CSS postprocessor tool that transforms CSS with JavaScript plugins. Used in the Tailwind CSS build pipeline. _Context: apps/web._ See also: Tailwind CSS.

### PostHog

Analytics and feature flag platform. Tracks events, sessions, page views, and controls feature rollout. _Context: apps/web, modules/analytics._ See also: Feature Flag.

### PostgreSQL

Advanced open-source relational database. Hosted via Supabase, using pgvector extension, connection pooling, and Row-Level Security. _Context: apps/api database._ See also: Supabase, RLS, Prisma ORM.

### Postmortem

A written analysis of an incident documenting timeline, root cause, impact, action items, and lessons learned. _Context: docs/operations/postmortem-tracker.md._ See also: Incident Response, Runbook.

### PR (Pull Request)

A proposed code change with description, linked issues, and review workflow. Merged via squash merge with Conventional Commits. _Context: GitHub workflow._ See also: Code Review, Squash Merge.

### Prisma Client

Type-safe database client generated from the Prisma schema. Provides auto-completion and compile-time error checking for queries. _Context: apps/api common/database._ See also: Prisma ORM, Prisma Migrate.

### Prisma Migrate

Prisma's migration tool for creating, applying, and managing database schema changes over time. _Context: apps/api prisma/migrations._ See also: Migration, Schema, Seed.

### Prisma ORM

TypeScript ORM combining a declarative schema, auto-generated client, and migration system. Used across all API modules. _Context: apps/api._ See also: Prisma Client, Prisma Migrate.

### Prisma Service

The application's database access layer (`PrismaService`). Wraps PrismaClient with pg adapter, providing connection pool management. _Context: apps/api common/database._ See also: Connection Pool, PostgreSQL.

### Prisma Studio

GUI database browser that connects to the database for visual data exploration. Accessed via `npm run prisma:studio`. _Context: apps/api._ See also: Prisma ORM.

### Prompt

The input text sent to an LLM, comprising system instructions and user messages. Its quality directly affects output quality. _Context: apps/ai._ See also: System Prompt, LLM.

### Provider

In NestJS, a class decorated with `@Injectable()` that can be injected as a dependency. Services, repositories, and factories are providers. _Context: apps/api modules._ See also: Dependency Injection, Service.

### Pydantic

Python library for data validation and settings management using type annotations. Used in the FastAPI service for request/response models. _Context: apps/ai._ See also: FastAPI.

## Q

### Query Invalidation

The process of marking TanStack Query cache entries as stale, triggering refetch on next usage. Called after mutations to update the UI. _Context: apps/web lib/data._ See also: TanStack Query, Mutation.

### Queue

BullMQ queue: an ordered list of jobs waiting to be processed. Each queue has a name, configuration, and one or more workers. _Context: apps/api common/queue._ See also: BullMQ, Job, Worker.

## R

### RAG (Retrieval-Augmented Generation)

AI pattern where relevant content is retrieved from a vector knowledge base and provided to the LLM as context for answer generation. _Context: apps/ai._ See also: Embedding, Chunking, Vector Search.

### Rate Limiting

The practice of controlling the rate of incoming requests to prevent abuse. Implemented via `@nestjs/throttler` with global and per-route limits. _Context: apps/api common._ See also: Throttler.

### Rate Limit (AI)

Per-user or per-session limit on AI service requests to control costs and prevent abuse. Enforced by the Cost Controller. _Context: apps/ai._ See also: Cost Controller, Token.

### Raw Query

A SQL query executed directly via Prisma's `$queryRaw` method, used when Prisma's generated API cannot express the needed operation (e.g., vector similarity queries). _Context: apps/api common/database._ See also: Prisma Client.

### RBAC (Role-Based Access Control)

Access control model with roles: `admin`, `editor`, `viewer`. Enforced via `RolesGuard` and `@Roles()` decorator on admin controllers. _Context: apps/api auth module._ See also: Guard, RolesGuard.

### React Query

See TanStack Query.

### react-three-fiber (R3F)

React renderer for Three.js, enabling declarative 3D scene composition with React components. _Context: apps/web components/3d._ See also: Three.js, Theatre.js.

### Redis

In-memory data store used by BullMQ for job queues and by the cache layer for API response caching. Hosted via Upstash. _Context: apps/api common._ See also: BullMQ, Upstash, ioredis.

### Refresh Token

Long-lived JWT credential used to obtain new access tokens without re-authentication. Stored securely in the `Session` model with revocation support. _Context: apps/api auth module._ See also: Access Token, JWT, Token Rotation.

### Regression Test

A test ensuring previously working functionality hasn't broken after changes. Runs as part of CI. _Context: testing._ See also: Visual Regression Test, CI/CD.

### Relation

A Prisma-defined association between two models (one-to-many, many-to-many, one-to-one). Example: `User → Session` with `onDelete: Cascade`. _Context: Prisma schema._ See also: Foreign Key, Cascade.

### Reranking

A second-stage retrieval process that scores and reorders candidate documents from an initial vector search for improved relevance. _Context: apps/ai RAG pipeline._ See also: RAG, Retrieval.

### Repository Pattern

A data access abstraction layer mediating between the domain and data mapping layers. In this project, Prisma Service serves as the data access layer. _Context: apps/api common/database._ See also: Prisma Service, Prisma Client.

### Resiliency

The ability of a system to handle failures gracefully and recover quickly. Addressed through retry policies, circuit breakers, and graceful degradation. _Context: architecture principle._ See also: Incident Response, MTTR.

### Responsive Design

Design approach ensuring the application renders well on devices of all sizes using CSS media queries, flexible grids, and relative units. _Context: apps/web._ See also: Tailwind CSS, Mobile-First.

### Retrieval

The process of fetching relevant documents from a knowledge base given a query, typically via vector similarity search. _Context: apps/ai RAG pipeline._ See also: RAG, Embedding, Reranking.

### Retrospective

A recurring team meeting to reflect on what went well, what went wrong, and what to improve. _Context: project process._ See also: KEEP, Agile.

### RFC (Request for Comments)

A formal proposal document for significant technical decisions, inviting discussion before implementation. _Context: docs/engineering/RFC-_.md.\* See also: ADR.

### RLS (Row-Level Security)

PostgreSQL security feature that restricts which rows a user can access based on a policy expression. _Context: apps/api database._ See also: PostgreSQL, Supabase.

### Role

An access control level (admin, editor, viewer) determining what actions a user can perform. Defined in the `UserRole` enum. _Context: apps/api auth module._ See also: RBAC, RolesGuard.

### RolesGuard

NestJS guard that checks the authenticated user's role against required roles set by `@Roles()` decorator on routes. _Context: apps/api admin controllers._ See also: Guard, RBAC, Role.

### Route Handler

Next.js API endpoint defined as a route.ts file in the App Router, handling HTTP methods directly. _Context: apps/web._ See also: App Router, Server Action.

### RSC (React Server Component)

React component that runs on the server, reducing client-side JavaScript. Default in Next.js App Router. See Server Component.

### Runbook

A documented procedure for handling specific operational tasks or incidents. The project maintains 20+ runbooks in `docs/runbooks/`. _Context: docs/runbooks._ See also: Incident Response, On-Call Schedule.

### Runner

A GitHub Actions runner that executes CI/CD jobs. Can be GitHub-hosted or self-hosted. _Context: GitHub Actions._ See also: CI/CD, Workflow, Job.

## S

### Salt

A random value added to a password before hashing, ensuring identical passwords produce different hashes. _Context: apps/api auth module._ See also: bcrypt, Hash, Salt Rounds.

### Salt Rounds

The cost factor for bcrypt hashing, determining how computationally expensive the operation is. Higher = more secure but slower. _Context: apps/api auth module._ See also: bcrypt, Hash, Salt.

### Sandbox IDE

A WebContainer-powered in-browser code editor allowing visitors to write and run code. Located at `/admin/sandbox`, requiring strict COOP/COEP isolation. _Context: apps/web admin/sandbox._ See also: WebContainer, Monaco Editor.

### SBOM (Software Bill of Materials)

A formal inventory of all open-source components and dependencies used in the project, including versions and licenses. _Context: supply chain security._ See also: Dependabot, CodeQL, SLSA.

### Schema

In Prisma, the declarative file (`schema.prisma`) defining all models, enums, relations, and database configuration. Also refers to database structure. _Context: apps/api prisma/schema.prisma._ See also: Model, Migration.

### Screen Reader

Assistive technology (e.g., JAWS, NVDA, VoiceOver) that reads digital content aloud for visually impaired users. _Context: A11y compliance._ See also: A11y, ARIA.

### Seed

A script that populates the database with initial or test data. Run via `npm run prisma:seed`. _Context: apps/api prisma/seed.ts._ See also: Prisma Migrate, Factory.

### Semantic Versioning (SemVer)

Versioning scheme: `MAJOR.MINOR.PATCH` (e.g., 2.1.0). Major = breaking changes, Minor = features, Patch = bug fixes. _Context: project versioning._ See also: Conventional Commits, Changelog.

### Sentry

Error tracking and performance monitoring platform. Captures exceptions, traces, and session replays for both API and web app. _Context: apps/api, apps/web._ See also: Error Tracking, Performance Monitoring, Session Replay.

### Separation of Concerns

Design principle separating a system into distinct sections, each addressing a separate concern. The Three-Layer Module Pattern embodies this. _Context: architecture principle._ See also: Three-Layer Module Pattern, DRY, SOLID.

### Server Action

Next.js feature enabling server-side form handling and mutations from Client Components without building a dedicated API endpoint. _Context: apps/web._ See also: Route Handler, Client Component.

### Server Component

React component that runs exclusively on the server. Default in Next.js App Router. No client-side JavaScript. See also: RSC, Client Component.

### Server-Side Rendering (SSR)

Rendering pages on the server for each request, producing fully populated HTML. Used where ISR or static generation isn't appropriate. _Context: Next.js._ See also: ISR, SSG, RSC.

### Service

NestJS provider containing business logic, decorated with `@Injectable()`. Modules export services for injection into controllers. _Context: apps/api modules._ See also: Module (NestJS), Controller.

### Service Container

A Docker Compose service providing infrastructure dependencies (PostgreSQL, Redis) for local development or CI. _Context: docker-compose.yml._ See also: Docker Compose, Docker.

### Session

An authenticated user session storing refresh tokens, user agent, IP address, and revocation status. _Context: apps/api auth module._ See also: Refresh Token, User.

### Session Replay

Sentry feature recording user interactions (clicks, scrolls, navigation) as a video-like replay for debugging user-reported issues. _Context: Sentry._ See also: Sentry, Error Tracking.

### shadcn/ui

A collection of beautifully designed, accessible React components built on Radix UI and styled with Tailwind CSS. The project's primary UI component foundation. _Context: packages/ui._ See also: Tailwind CSS, Component Library, Design System.

### Skip Link

A hidden keyboard-navigable link at the top of a page that jumps directly to the main content, bypassing navigation. _Context: apps/web layout._ See also: A11y, Keyboard Navigation.

### SLI (Service Level Indicator)

A quantifiable metric measuring a specific aspect of service performance (e.g., request latency, error rate). _Context: docs/operations._ See also: SLO, Error Budget.

### SLO (Service Level Objective)

A target value for an SLI, defining the desired level of service reliability. Example: 99.9% uptime. _Context: docs/operations._ See also: SLI, Error Budget, Alert.

### SLSA (Supply-chain Levels for Software Artifacts)

A security framework for establishing integrity across the software supply chain. _Context: supply chain security._ See also: SBOM, Dependabot, CodeQL.

### Smoke Test

Minimal test verifying that the most critical paths of the application work after a deployment. Runs immediately after deploy. _Context: testing._ See also: Regression Test, E2E Test.

### Soft Delete

A pattern where records are marked as deleted (`deletedAt` timestamp) rather than physically removed, enabling recovery and audit. Used on Lead, MediaAsset, ChatConversation models. _Context: Prisma schema._ See also: Cleanup Service, Data Retention, Cascade.

### SOLID

Five design principles: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. _Context: architecture principle._ See also: DRY, KISS.

### Span

A named, timed operation in a distributed trace representing a unit of work. Sentry captures spans for each database query, HTTP request, and AI call. _Context: Sentry Tracing._ See also: Distributed Tracing, Sentry.

### Sprint

A time-boxed iteration (typically 1-2 weeks) in Agile development, ending with a potentially shippable increment. _Context: project process._ See also: Agile, Standup, Retrospective.

### SQL Injection

A code injection attack where malicious SQL statements are inserted into application queries. Prevented by Prisma's parameterized queries. _Context: security._ See also: Input Sanitization, XSS.

### Squash Merge

A merge strategy that combines all commits from a feature branch into a single commit on the target branch, keeping history clean. _Context: GitHub workflow._ See also: PR, Conventional Commits.

### SSG (Static Site Generation)

Generating HTML pages at build time, serving the same pre-built content to all users. _Context: Next.js._ See also: ISR, SSR.

### SSE (Server-Sent Events)

A standard allowing servers to push real-time events to clients over HTTP. Used by the AI chat for streaming responses. _Context: apps/ai._ See also: Streaming, AI Service.

### staleTime

TanStack Query option controlling how long query data is considered fresh before automatic refetch. Default: 0 (refetch on mount). _Context: apps/web lib/query-provider._ See also: TanStack Query, gcTime.

### Standup

A daily team synchronization meeting where each member shares what they did yesterday, what they'll do today, and any blockers. _Context: project process._ See also: Agile, Sprint.

### Static Site Generation (SSG)

See SSG.

### Step

A single unit of work in a GitHub Actions job (e.g., `actions/checkout`, `npm run build`). _Context: GitHub Actions._ See also: CI/CD, Job, Runner.

### Strategy

Passport.js authentication strategy (e.g., `JwtStrategy`, `GoogleStrategy`, `GitHubStrategy`) implementing a specific authentication mechanism. _Context: apps/api auth module._ See also: Passport.js, OAuth 2.0.

### Streaming

A rendering technique where the server sends HTML in chunks as it's generated, allowing the browser to progressively render content. Used with Suspense boundaries. _Context: Next.js App Router._ See also: Suspense, Loading UI.

### Structured Logging

Logging format where each entry is a structured object (JSON) with consistent fields, enabling machine parsing and querying. _Context: Pino logger._ See also: Logging, Pino.

### Stub

A test double providing fixed responses to calls made during the test. _Context: testing._ See also: Mock, Fixture.

### Supabase

Backend-as-a-service providing PostgreSQL, authentication, object storage, and real-time subscriptions. _Context: apps/api database._ See also: PostgreSQL, RLS.

### Supply Chain Security

Practices ensuring the integrity of dependencies and build artifacts: automated updates (Dependabot), vulnerability scanning (CodeQL), SBOM generation. _Context: docs/security/_.md.\* See also: Dependabot, CodeQL, SBOM.

### Suspense

React feature that allows components to suspend rendering while waiting for asynchronous data or code, displaying a fallback UI. _Context: apps/web._ See also: Streaming, Loading UI.

### Swagger

API documentation UI automatically generated from NestJS decorators. Available at `/api/docs` when the NestJS API is running. _Context: apps/api._ See also: OpenAPI 3.1.

### System Prompt

The initial instruction provided to an LLM defining its behaviour, persona, constraints, and output format. _Context: apps/ai._ See also: Prompt, LLM.

### SystemSetting

A key-value store for application configuration managed at runtime. Stores site name, social links, SEO defaults, and feature toggles. _Context: modules/system-settings._

## T

### Table

In Prisma, maps to a PostgreSQL table. Custom table names are set via `@@map("table_name")`. _Context: Prisma schema._ See also: Model, Schema.

### Tailwind CSS

A utility-first CSS framework using atomic classes for rapid UI development. Combined with shadcn/ui for component styling. _Context: apps/web, packages/ui._ See also: shadcn/ui, PostCSS.

### TanStack Query

Library for server state management in React. Handles caching, refetching, optimistic updates, and query invalidation. Previously known as React Query. _Context: apps/web lib/query-provider._ See also: Mutation, staleTime, gcTime.

### TDD (Test-Driven Development)

Development cycle: write a failing test, write minimal code to pass it, refactor. _Context: testing practice._ See also: Unit Test, Test Pyramid.

### Technical Debt

The implied cost of additional rework caused by choosing an easy short-term solution instead of a better long-term approach. _Context: code quality._ See also: Code Review, Refactoring.

### Telemetry

Automated collection and transmission of data about system behaviour, performance, and usage. _Context: monitoring._ See also: Monitoring, Observability, Sentry.

### Template

Next.js App Router file (`template.tsx`) similar to Layout but re-mounts on each navigation, losing state. _Context: apps/web._ See also: Layout, App Router.

### Test Pyramid

Testing strategy with many unit tests at the base, fewer integration tests in the middle, and few E2E tests at the top. _Context: testing strategy._ See also: Unit Test, Integration Test, E2E Test.

### Testimonial

A client or colleague endorsement with name, role, company, content, rating, and visibility toggle. _Context: modules/testimonials._

### Theatre.js

A motion design tool for the web, enabling declarative animation of 3D scenes (via R3F) and 2D DOM elements with a timeline-based interface. _Context: apps/web components/3d._ See also: Three.js, R3F, GSAP.

### Throttler

NestJS guard (`@nestjs/throttler`) implementing rate limiting to protect against abuse and DoS attacks. _Context: apps/api common._ See also: Rate Limiting.

### Three-Layer Module Pattern

The architecture convention where business logic lives in `modules/`, public delivery in `portfolio/controllers/`, and admin CRUD in `admin/controllers/`. _Context: apps/api structure._ See also: Separation of Concerns, Controller.

### Three.js

A cross-browser JavaScript library for creating 3D graphics in the browser using WebGL. _Context: apps/web components/3d._ See also: R3F, Theatre.js.

### TipTap

A headless, framework-agnostic rich-text editor built on ProseMirror. Used in admin content management. _Context: apps/web components/admin/editor._ See also: Monaco Editor.

### Token (AI)

The basic unit of text processed by an LLM. A token is roughly 0.75 words. Used for billing and context window calculation. _Context: apps/ai._ See also: LLM, Context Window, Cost Controller.

### Token (Auth)

See Access Token, Refresh Token, JWT.

### Token Rotation

A security practice that invalidates refresh tokens after use, issuing a new token pair on each refresh, limiting exposure if a token is stolen. _Context: apps/api auth module._ See also: Refresh Token, Access Token.

### Trivy

A comprehensive vulnerability scanner for containers, filesystems, and repositories. Used in CI for supply chain security scanning. _Context: security scanning._ See also: SBOM, CodeQL.

### Turborepo

Vercel's high-performance monorepo build system. Handles task orchestration, caching, and dependency ordering across workspaces. _Context: project root turbo.json._ See also: Monorepo, Workspace.

## U

### UI Component

A reusable visual element (button, card, modal, input) encapsulating structure, style, and behaviour. _Context: packages/ui._ See also: Component Library, shadcn/ui.

### Unique Constraint

A database constraint ensuring all values in a column or combination of columns are distinct. Defined in Prisma via `@unique` or `@@unique`. _Context: Prisma schema._ See also: Index, Foreign Key.

### Unit Test

A test that verifies a single unit of code (function, method, class) in isolation, mocking external dependencies. _Context: testing._ See also: Test Pyramid, Integration Test, Mock.

### Upstash

Managed Redis service used for caching and BullMQ queues. Provides serverless Redis with REST API and global replication. _Context: apps/api common._ See also: Redis, BullMQ.

### User

The admin user model with email, password hash, role, account lockout fields, and relations to sessions, audit logs, and activities. _Context: modules/users, Prisma schema._ See also: Session, Audit Log.

## V

### ValidationPipe

NestJS built-in pipe that validates incoming request bodies against DTO class-validator decorators. Configured globally with `whitelist`, `forbidNonWhitelisted`, and `transform` options. _Context: apps/api main.ts._ See also: Class Validator, DTO, whitelist.

### Vector Search

The process of finding items in a vector space whose embeddings are closest to a query embedding, typically using cosine similarity or L2 distance. _Context: apps/ai RAG pipeline._ See also: pgvector, HNSW Index, Embedding.

### Vercel

Cloud platform for frontend and serverless deployment. Hosts the Next.js web app and NestJS API. Provides ISR, analytics, and edge functions. _Context: deployment._ See also: Deployment, ISR.

### Visual Regression Test

An automated test that compares screenshots of UI components against baseline images to detect unintended visual changes. _Context: Playwright._ See also: Playwright, E2E Test.

### Volume (Docker)

A persistent data storage mechanism for Docker containers, used to maintain database data across restarts. _Context: docker-compose.yml._ See also: Docker Compose, Container.

## W

### WCAG 2.2 AA (Web Content Accessibility Guidelines)

The project's accessibility compliance target, ensuring content is perceivable, operable, understandable, and robust. _Context: all UI development._ See also: A11y, ARIA, Screen Reader.

### WebContainer

A WebAssembly-based runtime by StackBlitz that runs Node.js in the browser. Powers the Sandbox IDE feature. _Context: apps/web admin/sandbox._ See also: Sandbox IDE, Monaco Editor.

### whitelist

ValidationPipe option that strips unrecognized properties from DTOs, preventing unexpected data from reaching controllers. _Context: apps/api main.ts._ See also: ValidationPipe, forbidNonWhitelisted.

### Worker

A BullMQ worker that processes jobs from a queue, executing the defined handler for each job type. _Context: apps/api common/queue._ See also: BullMQ, Job, Queue.

### Workflow (GitHub Actions)

An automated process defined in YAML triggered by events (push, PR, schedule). Contains jobs that run on runners. _Context: .github/workflows._ See also: CI/CD, Job, Runner.

### Workspace

An npm workspaces term for a package within the monorepo. Five workspaces: `apps/web`, `apps/api`, `apps/ai`, `packages/shared`, `packages/ui`, `packages/config`. _Context: project root package.json._ See also: Monorepo, Turborepo.

## X

### XSS (Cross-Site Scripting)

A vulnerability where attackers inject malicious scripts into web pages. Mitigated via CSP headers, input sanitization, and React's automatic escaping. _Context: security._ See also: CSP, Input Sanitization, SQL Injection.

## Y

### YAGNI (You Aren't Gonna Need It)

Principle discouraging the addition of functionality until it is actually needed. Avoid speculative generality. _Context: coding best practice._ See also: KISS, DRY.

## Z

### Zod

TypeScript-first schema validation library. Used for shared type definitions in `@portfolio/shared`, providing runtime validation + type inference. _Context: packages/shared._ See also: DTO.
