# Database Implementation - Enterprise Execution Guide

> **File:** DatabaseImplementation.md | **Version:** 1.1 | **Last Updated:** June 2026
> **Status:** Active | **Database:** Supabase PostgreSQL 15 + pgvector 0.7
> **Migration Tool:** Supabase CLI | **ORM:** @supabase/supabase-js | **Validation:** Zod 3.23
> **Total Tables:** 37 | **Schema Groups:** 6 | **Storage Buckets:** 3

---

## Executive Summary

DATABASE-IMPLEMENTATION.md is the tactical execution guide for provisioning and managing the portfolio's Supabase PostgreSQL 15 database — covering 37 tables across 6 schema groups (CMS content, portfolio core, admin operations, AI/RAG, analytics/events, system configuration), 3 storage buckets, a 12-step migration plan, comprehensive RLS policies with 4-tier access model (anon, authenticated, service_role, admin), backup strategy (daily pg_dump + WAL streaming with 7-day PITR), Zod schema validation with nullable vs optional conventions, audit logging via PostgreSQL triggers on 4 critical tables (leads, projects, blog_posts, system_settings), seed data for development environments, automated CI/CD migration pipeline via Supabase CLI, disaster recovery procedures (RTO < 1 hour, RPO < 5 minutes), and a 10-phase production rollout plan with post-launch monitoring for 48 hours.

---

## Table of Contents

1. [Migration Plan](#1-migration-plan)
2. [Schema Plan](#2-schema-plan)
3. [Indexes](#3-indexes)
4. [RLS Policies](#4-rls-policies)
5. [Backups](#5-backups)
6. [Data Validation](#6-data-validation)
7. [Audit Logging](#7-audit-logging)
8. [Seed Data](#8-seed-data)
9. [Testing Plan](#9-testing-plan)
10. [Disaster Recovery](#10-disaster-recovery)
11. [Production Rollout](#11-production-rollout)

---

## Decision Log

| ID | Decision | Rationale | Alternatives Considered | Date | Approver |
|----|----------|-----------|------------------------|------|----------|
| DB-001 | Supabase PostgreSQL 15 with pgvector 0.7 over self-hosted or managed alternatives | Supabase provides managed PostgreSQL + pgvector + storage + auth + realtime in a single service; eliminates multi-provider integration overhead | AWS RDS (no pgvector, separate auth), Neon (serverless but no pgvector), self-hosted Postgres (operational overhead) | 2026-06-01 | Tech Lead |
| DB-002 | Zod over raw TypeScript types or Prisma for schema validation | Zod provides runtime validation + type inference from a single source; nullable vs optional conventions catch null/undefined bugs at the API boundary | Prisma (heavy ORM, migration lock-in, less flexible validation), raw TypeScript types (no runtime validation), Joi/Yup (no TypeScript inference) | 2026-06-01 | Tech Lead |
| DB-003 | 37 tables in 6 schema groups over flat table structure | Schema groups separate concerns (CMS, portfolio, admin, AI, analytics, system); enables independent migration streams and clearer access patterns | Single schema (name collisions, mixed permissions), microservice per schema (overhead for small project), document store (no relational integrity) | 2026-06-01 | Tech Lead |
| DB-004 | pg_dump nightly + WAL archiving with 7-day PITR over application-level backups | Database-level backup captures all data, indexes, sequences, and functions atomically; PITR allows recovery to any point within 7 days | Application-level backup (misses schema, indexes; inconsistent across tables), EBS snapshots (platform-specific, not portable) | 2026-06-01 | Tech Lead |
| DB-005 | Trigger-based audit logging over application-level logging | Trigger-based audit cannot be bypassed by the application — every mutation is captured regardless of how the data changes (direct SQL, admin panel, API, migration) | Application-level (bypassable via direct DB access, migration scripts), PostgreSQL audit extension (additional extension, configuration overhead) | 2026-06-01 | Tech Lead |

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation |
|----|------|------------|--------|------------|
| DB-R01 | Migration conflicts when multiple developers work on schema changes | Medium | High | Supabase CLI with versioned migration files; CI pipeline runs `supabase db push --dry-run` on every PR; lock file prevents concurrent migrations |
| DB-R02 | pgvector index rebuild takes too long on large document_chunks table (>10K rows) | Low | Medium | IVFFlat index with 100 lists (faster build than HNSW); schedule REINDEX during off-peak; monitor index build time |
| DB-R03 | RLS policy misconfiguration exposes sensitive data | Low | Critical | RLS must be enabled on all 37 tables (verified by CI); penetration testing before production; regular policy audit |
| DB-R04 | Database connection pool exhaustion under load spikes | Medium | Medium | Supabase pooler handles connection management; NestJS connection pool of 10 + max overflow of 5; monitor connection count via Supabase dashboard |
| DB-R05 | Storage bucket public access misconfigured exposes user-uploaded files | Low | High | All buckets default to private; signed URLs for authenticated access; RLS policies on storage objects; quarterly storage access audit |

## Architecture Overview

### Database Infrastructure

```mermaid
graph TB
    subgraph Env[Database Environments]
        E1[Local: Docker Supabase]
        E2[Staging: portfolio-staging]
        E3[Production: portfolio-prod]
    end
    subgraph Tools[Tooling]
        T1[Supabase CLI: migrations]
        T2[pg_dump: backups]
        T3[psql: ad-hoc queries]
        T4[Supabase Dashboard]
    end
    subgraph CI[CI/CD Pipeline]
        C1[GitHub Actions]
        C2[supabase db push]
        C3[Migration Verify]
        C4[Seed Load]
    end
    subgraph Services[Connected Services]
        S1[NestJS API] S2[FastAPI AI] S3[Next.js FE]
    end
    Development --> E1; Staging --> E2; Production --> E3
    E1 & E2 & E3 --> T1 & T2 & T3 & T4
    C1 --> C2 --> C3 --> C4
    E2 & E3 --> S1 & S2 & S3
```

### Implementation Principles

| Principle | Description | Enforcement |
|-----------|-------------|-------------|
| Migrations as Code | All schema changes version-controlled SQL | Supabase CLI in supabase/migrations/ |
| Idempotent Deployments | Same result every run | IF NOT EXISTS / IF EXISTS on all DDL |
| Least Privilege | Minimum necessary access | RLS on every table, anon vs service_role |
| Defense in Depth | Validation at DB + API + Client | 3-layer validation matrix |
| Audit by Default | Every mutation traceable | created_at + updated_at triggers + audit |
| Free-Tier Conscious | Respect 500MB / 15 connections | Index budget, data lifecycle, query optimization |

### Environment Strategy

| Env | Database Host | Connection | Used By |
|-----|--------------|------------|---------|
| Dev | localhost:54322 | Docker Supabase | Local dev, unit tests |
| Staging | db.xxx.supabase.co | Supabase staging | Integration tests |
| Prod | db.xxx.supabase.co | Supabase production | Live site, admin |

### Connection Pooling

| Setting | Dev | Staging | Prod |
|---------|-----|---------|------|
| Pooler | None | PgBouncer | PgBouncer |
| Max Connections | 10 | 15 | 15 |
| Statement Timeout | 30s | 10s | 10s |
| SSL Mode | prefer | require | require |

---
## 1. Migration Plan

### 1.1 Migration Philosophy

All schema changes managed as version-controlled SQL via Supabase CLI. Every migration is reversible, idempotent, and CI-verified.

### 1.2 Directory Structure

```
supabase/
  config.toml
  migrations/
    001_core_tables.sql           -- users, roles, permissions, user_roles, sessions
    002_content_tables.sql        -- sections, projects, project_images, blog_posts
    003_content_tables_2.sql      -- testimonials, skills, experiences, achievements
    004_content_tables_3.sql      -- services, case_studies, press_features
    005_content_tables_4.sql      -- guest_appearances, reading_list, post_tags
    006_lead_tables.sql           -- leads, lead_notes, lead_activities
    007_analytics_tables.sql      -- analytics_events, analytics_sessions, page_views
    008_ai_rag_tables.sql         -- chat_conversations, chat_messages, document_chunks
    009_system_tables.sql         -- media_assets, system_settings, notifications
    010_audit_tables.sql          -- audit_logs, admin_activities
    011_security_tables.sql       -- api_keys, feature_flags, availability_status
    012_extensions.sql            -- pgvector, pgcrypto, pg_trgm, moddatetime
    013_indexes.sql               -- All indexes
    014_rls_enable.sql            -- Enable RLS on all tables
    015_rls_policies.sql          -- All RLS policies
    016_triggers.sql              -- updated_at + audit triggers
    017_seed_data.sql             -- Default seed
    999_verify.sql                -- Verification queries
```

### 1.3 Migration Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Git as GitHub
    participant CI as GitHub Actions
    participant Stg as Supabase Staging
    participant Prod as Supabase Production
    Dev->>Git: Create migration
    Dev->>Git: Push to feature branch
    Git->>CI: Trigger CI
    CI->>Stg: supabase db push --db-url=staging
    CI->>CI: Run 999_verify.sql
    CI-->>Git: Pass/fail
    Dev->>Git: PR to main
    CI->>Stg: supabase db push --dry-run
    CI-->>Git: Dry-run result
    Dev->>Git: Merge PR
    CI->>Prod: supabase db push
    Prod-->>CI: Done
    CI->>Prod: Run verification
    Prod-->>CI: Verified
```

### 1.4 CLI Commands

```bash
supabase init
supabase link --project-ref xxxxxx
supabase migration new name
supabase db push
supabase db push --db-url "$DATABASE_URL"
supabase db push --version 016
supabase migration list
supabase gen types typescript --local > types.ts
```

### 1.5 CI/CD Integration

```yaml
name: Database CI/CD
on:
  push:
    paths: ["supabase/migrations/**"]
    branches: [main, develop]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: supabase/setup-cli@v1
      - run: supabase start
      - run: supabase db push
      - run: psql localhost -f supabase/migrations/999_verify.sql
  deploy-staging:
    needs: [validate]
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - run: supabase db push --db-url $STAGING_DATABASE_URL
  deploy-production:
    needs: [validate]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - run: supabase db push --db-url $PRODUCTION_DATABASE_URL
```

### 1.6 Verification Queries

```sql
-- 999_verify.sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT extname FROM pg_extension
WHERE extname IN ('vector', 'pgcrypto', 'pg_trgm', 'moddatetime');
SELECT relname, relrowsecurity FROM pg_class
WHERE relkind = 'r' AND relnamespace = 'public'::regnamespace;
SELECT trigger_name, event_object_table FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 2. Schema Plan

### 2.1 Core Tables DDL

```sql
-- 001_core_tables.sql

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT email_format CHECK (email ~*
        '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_role_name CHECK (name IN ('admin', 'superadmin'))
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    conditions JSONB,
    UNIQUE (resource, action)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 Content Tables: Sections, Projects, Blog

```sql
-- 002_content_tables.sql

CREATE TABLE IF NOT EXISTS sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT NOT NULL UNIQUE,
    section_label TEXT NOT NULL,
    is_live BOOLEAN NOT NULL DEFAULT false,
    style_preset TEXT NOT NULL DEFAULT 'grid',
    display_order INTEGER NOT NULL DEFAULT 0,
    min_items INTEGER NOT NULL DEFAULT 0,
    auto_publish BOOLEAN NOT NULL DEFAULT false,
    is_always_visible BOOLEAN NOT NULL DEFAULT false,
    style_config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    live_url TEXT,
    github_url TEXT,
    cover_image TEXT,
    thumbnail_url TEXT,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    is_private BOOLEAN NOT NULL DEFAULT false,
    category TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    content TEXT,
    metrics JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    width INTEGER,
    height INTEGER,
    display_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    cover_image TEXT,
    published_at TIMESTAMPTZ,
    is_published BOOLEAN NOT NULL DEFAULT false,
    reading_time_minutes INTEGER,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.3 Content Tables: Testimonials, Skills, Experiences, Achievements

```sql
-- 003_content_tables_2.sql

CREATE TABLE IF NOT EXISTS testimonials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT,
    company TEXT,
    avatar_url TEXT,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    proficiency INTEGER CHECK (proficiency >= 0 AND proficiency <= 100),
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS experiences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT false,
    technologies TEXT[] DEFAULT '{}',
    logo_url TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    date_achieved DATE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.4 Content Tables: Services, Case Studies, Press

```sql
-- 004_content_tables_3.sql

CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    features JSONB DEFAULT '[]',
    price_range TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS case_studies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    client TEXT NOT NULL,
    industry TEXT,
    challenge TEXT,
    approach TEXT,
    solution TEXT,
    results JSONB DEFAULT '{}',
    technologies TEXT[] DEFAULT '{}',
    cover_image TEXT,
    is_published BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS press_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    publication TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    logo_url TEXT,
    excerpt TEXT,
    published_date DATE NOT NULL,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.5 Content Tables: Guest Appearances, Reading List, Post Tags

```sql
-- 005_content_tables_4.sql

CREATE TABLE IF NOT EXISTS guest_appearances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    host TEXT,
    url TEXT,
    date DATE NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_list (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    url TEXT,
    type TEXT CHECK (type IN ('book', 'article', 'paper', 'course', 'video')),
    tags TEXT[] DEFAULT '{}',
    notes TEXT,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT 'general' CHECK (type IN ('general', 'tech', 'design', 'career', 'tutorial')),
    color TEXT,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.6 Lead Tables

```sql
-- 006_lead_tables.sql

CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    service_interest TEXT,
    budget_range TEXT,
    message TEXT,
    source TEXT DEFAULT 'website',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost', 'archived')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    assigned_to UUID REFERENCES users(id),
    score INTEGER DEFAULT 0,
    converted_to_client BOOLEAN NOT NULL DEFAULT false,
    conversion_value DECIMAL(10,2),
    contacted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE TABLE IF NOT EXISTS lead_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    activity_type TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.7 Analytics Tables

```sql
-- 007_analytics_tables.sql

CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    session_id TEXT,
    page TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    page_views INTEGER DEFAULT 0,
    referrer TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    device_type TEXT,
    browser TEXT,
    country TEXT
);

CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    page TEXT NOT NULL,
    duration_seconds INTEGER,
    scroll_depth_percent INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.8 AI/RAG Tables

```sql
-- 008_ai_rag_tables.sql

CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL UNIQUE,
    user_id UUID REFERENCES users(id),
    title TEXT,
    context JSONB DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    message_count INTEGER NOT NULL DEFAULT 0,
    token_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    tool_calls JSONB,
    tool_results JSONB,
    tokens_used INTEGER DEFAULT 0,
    latency_ms INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536),
    metadata JSONB DEFAULT '{}',
    token_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.9 System Tables

```sql
-- 009_system_tables.sql

CREATE TABLE IF NOT EXISTS media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text TEXT,
    width INTEGER,
    height INTEGER,
    storage_provider TEXT DEFAULT 'supabase',
    storage_path TEXT,
    uploaded_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    description TEXT,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN NOT NULL DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.10 Audit Tables

```sql
-- 010_audit_tables.sql

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    changes JSONB DEFAULT '{}',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.11 Security Tables

```sql
-- 011_security_tables.sql

CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions JSONB NOT NULL DEFAULT '[]',
    rate_limit INTEGER DEFAULT 100,
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    enabled BOOLEAN NOT NULL DEFAULT false,
    description TEXT,
    rollout_percent INTEGER DEFAULT 100,
    user_segments JSONB DEFAULT '[]',
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS availability_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    status TEXT NOT NULL CHECK (status IN ('available', 'busy', 'limited', 'unavailable')),
    label TEXT,
    start_date DATE,
    end_date DATE,
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 3. Indexes

### 3.1 Primary Indexes (via PK)

All 37 tables use UUID primary keys auto-indexed by PostgreSQL. No additional PK indexes needed.

### 3.2 Unique Constraint Indexes

Unique constraints (UNIQUE) auto-create B-tree indexes:

| Column | Table | Type |
|--------|-------|------|
| email | users | TEXT |
| name | roles | TEXT |
| (resource, action) | permissions | COMPOSITE |
| slug | projects | TEXT |
| slug | blog_posts | TEXT |
| slug | case_studies | TEXT |
| section_key | sections | TEXT |
| key | system_settings | TEXT |
| key | feature_flags | TEXT |
| name | post_tags | TEXT |
| slug | post_tags | TEXT |
| slug | experiences | TEXT |

### 3.3 Foreign Key Indexes

```sql
-- 013_indexes.sql -- Foreign Key Indexes

-- User joins
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Content joins
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_author_id ON lead_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id ON lead_activities(lead_id);

-- Analytics joins
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);

-- Chat joins
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- Notification joins
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Admin joins
CREATE INDEX IF NOT EXISTS idx_admin_activities_user_id ON admin_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Media joins
CREATE INDEX IF NOT EXISTS idx_media_assets_uploaded_by ON media_assets(uploaded_by);

-- API key joins
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
```

### 3.4 Query Performance Indexes

```sql
-- Filter indexes
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_priority ON leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_sections_live ON sections(is_live) WHERE is_live = true;
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = true;

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_projects_search ON projects USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### 3.5 Index Maintenance

| Frequency | Task | Command |
|-----------|------|---------|
| Weekly | Reindex bloated indexes | REINDEX INDEX CONCURRENTLY name; |
| Monthly | Analyze table statistics | ANALYZE table_name; |
| Quarterly | Full vacuum | VACUUM FULL ANALYZE; |
| On release | Rebuild after bulk import | REINDEX DATABASE CONCURRENTLY; |

### 3.6 Index Size Estimates

| Index | Est. Size (10K rows) | Est. Size (100K rows) | Criticality |
|-------|---------------------|----------------------|-------------|
| idx_projects_search | 2 MB | 20 MB | Medium |
| idx_blog_posts_search | 1.5 MB | 15 MB | Medium |
| idx_document_chunks_embedding | 10 MB | 100 MB | High |
| Simple B-tree indexes | 0.3 MB each | 3 MB each | Low |

---

## 4. RLS Policies

### 4.1 RLS Enable

```sql
-- 014_rls_enable.sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_status ENABLE ROW LEVEL SECURITY;
```

### 4.2 Public Access (anon) Policies

Tables exposed to unauthenticated visitors:
- sections (SELECT only where is_live = true)
- projects (SELECT only where is_private = false)
- project_images (SELECT via public projects)
- blog_posts (SELECT only where is_published = true)
- testimonials (SELECT only)
- skills (SELECT only)
- experiences (SELECT only)
- achievements (SELECT only)
- services (SELECT only, is_active = true)
- case_studies (SELECT only, is_published = true)
- press_features (SELECT only)
- post_tags (SELECT only)
- leads (INSERT only)
- availability_status (SELECT only)
- reading_list (SELECT only)
- guest_appearances (SELECT only)

### 4.3 Admin Policies

All tables get full CRUD for admin role. Role check via custom function:

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER AS
'SELECT EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = auth.uid()
    AND r.name IN (''admin'', ''superadmin'')
);';
```

### 4.4 Example Policy SQL

```sql
-- 015_rls_policies.sql

-- Public: read visible sections
CREATE POLICY sections_public_select ON sections
    FOR SELECT USING (is_live = true OR is_always_visible = true);

-- Public: read public projects
CREATE POLICY projects_public_select ON projects
    FOR SELECT USING (is_private = false);

-- Public: read published blog posts
CREATE POLICY blog_posts_public_select ON blog_posts
    FOR SELECT USING (is_published = true);

-- Public: insert leads
CREATE POLICY leads_public_insert ON leads
    FOR INSERT WITH CHECK (true);

-- Admin: full CRUD on all content tables
CREATE POLICY content_admin_all ON projects
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Admin: manage users
CREATE POLICY users_admin_all ON users
    FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- User: own profile
CREATE POLICY users_self_update ON users
    FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- User: own sessions
CREATE POLICY sessions_self_select ON sessions
    FOR SELECT USING (user_id = auth.uid());

-- User: own chat conversations
CREATE POLICY chat_own_select ON chat_conversations
    FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

-- User: own notifications
CREATE POLICY notifications_self_select ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Admin: read audit logs
CREATE POLICY audit_admin_select ON audit_logs
    FOR SELECT USING (is_admin());
```

---

## 5. Extensions

```sql
-- 012_extensions.sql
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;   -- pgvector for RAG embeddings
CREATE EXTENSION IF NOT EXISTS pgcrypto;                        -- gen_random_uuid(), pgp_sym_encrypt()
CREATE EXTENSION IF NOT EXISTS pg_trgm;                         -- Trigram fuzzy text search
CREATE EXTENSION IF NOT EXISTS moddatetime;                     -- Auto-update updated_at columns
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;             -- Query performance monitoring
```

| Extension | Version | Purpose | Schema | Notes |
|-----------|---------|---------|--------|-------|
| vector | 0.8+ | Embedding storage | extensions | 1536-dim OpenAI, ivfflat index |
| pgcrypto | 1.3 | UUID gen + hashing | public | Built-in, no install needed for gen_random_uuid |
| pg_trgm | 1.6 | Fuzzy text search | public | GIN/GIST index support |
| moddatetime | 1.0 | Auto-updated_at | public | Trigger function |
| pg_stat_statements | 1.10 | Query monitoring | pg_catalog | Track slow queries |

---

## 6. Triggers

### 6.1 Automatic updated_at Triggers

Tables with updated_at columns use moddatetime:
- users, sections, projects, blog_posts, services, case_studies, leads, system_settings, api_keys, feature_flags, availability_status, chat_conversations

```sql
-- 016_triggers.sql

-- Grant usage on moddatetime function
GRANT EXECUTE ON FUNCTION moddatetime() TO PUBLIC;

-- Users trigger
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Sections trigger
CREATE TRIGGER sections_updated_at BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Projects trigger
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Blog posts trigger
CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Services trigger
CREATE TRIGGER services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Case studies trigger
CREATE TRIGGER case_studies_updated_at BEFORE UPDATE ON case_studies
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Leads trigger
CREATE TRIGGER leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- System settings trigger
CREATE TRIGGER system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- API keys trigger
CREATE TRIGGER api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Feature flags trigger
CREATE TRIGGER feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Availability status trigger
CREATE TRIGGER availability_status_updated_at BEFORE UPDATE ON availability_status
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- Chat conversations trigger
CREATE TRIGGER chat_conversations_updated_at BEFORE UPDATE ON chat_conversations
    FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
```

### 6.2 Audit Triggers

Critical tables (leads, projects, blog_posts, services, system_settings) get audit triggers:

```sql
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS
'BEGIN
    IF TG_OP = ''UPDATE'' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW), inet_client_addr());
    ELSIF TG_OP = ''DELETE'' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, ip_address)
        VALUES (auth.uid(), TG_OP, TG_TABLE_NAME, OLD.id, row_to_json(OLD), inet_client_addr());
    END IF;
    RETURN NEW;
END;
' LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers
CREATE TRIGGER leads_audit AFTER UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER projects_audit AFTER UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER blog_posts_audit AFTER UPDATE OR DELETE ON blog_posts
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
CREATE TRIGGER system_settings_audit AFTER UPDATE OR DELETE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
```

### 6.3 Trigger Maintenance

| Trigger | Table | Event | Purpose | Performance Impact |
|---------|-------|-------|---------|-------------------|
| moddatetime (12x) | Various | BEFORE UPDATE | Updated_at timestamps | Negligible |
| audit (4x) | leads, projects, blog_posts, system_settings | AFTER UPDATE/DELETE | Change logging | ~2ms per write |

---

## 7. Seed Data

### 7.1 Seed Strategy

| File | Scope | Environment | Freshness |
|------|-------|-------------|-----------|
| supabase/seed.sql | Full demo data | Development | Every supabase db reset |
| supabase/migrations/017_seed_data.sql | Minimal defaults | All envs | Once on migration |

### 7.2 Minimal Seed (Migration 017)

```sql
-- Insert default roles
INSERT INTO roles (name, description, permissions)
VALUES
    ('admin', 'Administrator with full access', '["*"]'::jsonb),
    ('superadmin', 'Super administrator', '["*"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Insert default sections
INSERT INTO sections (section_key, section_label, is_live, style_preset, display_order)
VALUES
    ('hero', 'Hero', true, 'center', 1),
    ('projects', 'Projects', true, 'grid', 2),
    ('skills', 'Skills', true, 'icon-grid', 3),
    ('experience', 'Experience', true, 'timeline', 4),
    ('testimonials', 'Testimonials', true, 'carousel', 5)
ON CONFLICT (section_key) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (key, enabled, description)
VALUES
    ('ai_chat', false, 'AI-powered chat assistant'),
    ('blog', true, 'Blog section enabled'),
    ('analytics', true, 'Analytics tracking enabled'),
    ('maintenance_mode', false, 'Site maintenance mode')
ON CONFLICT (key) DO NOTHING;

-- Insert availability status
INSERT INTO availability_status (status, label)
VALUES ('available', 'Available for new projects')
ON CONFLICT DO NOTHING;
```

### 7.3 Dev Seed (supabase/seed.sql)

The dev seed file (12KB) adds:
- 2 demo admin users (bcrypt-hashed)
- 8 demo projects with cover images and tech stacks
- 12 skills across 4 categories with proficiency levels
- 4 experience entries with date ranges
- 3 testimonials with ratings
- 6 blog posts with varied tags
- 5 services with feature lists
- 4 case studies with results
- 3 sample leads (new, contacted, qualified)
- Seed verification query

### 7.4 Seed Execution

```bash
# Apply minimal seed with migrations
supabase db push

# Reset with full dev seed
supabase db reset

# Run seed separately
psql $DATABASE_URL -f supabase/seed.sql
```

---
## 8. Backup and Disaster Recovery

### 8.1 Supabase Backup Capabilities

| Tier | Daily Backups | Retention | PITR Window | Storage |
|------|--------------|-----------|-------------|---------|
| Free | Yes | 7 days | None | 500 MB |
| Pro | Yes | 7 days | None | 8 GB |
| Team | Yes | 14 days | 1 hour | 16 GB |
| Enterprise | Yes | 30 days | 1 min | Custom |

### 8.2 Manual Backup Commands

```bash
# Full database dump
pg_dump --no-owner --no-acl -Fc $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).dump

# Schema-only dump
pg_dump --no-owner --no-acl --schema-only $DATABASE_URL > schema_$(date +%Y%m%d).sql

# Data-only dump (exclude migrations)
pg_dump --no-owner --no-acl --data-only --exclude-table=schema_migrations $DATABASE_URL > data_$(date +%Y%m%d).sql

# Restore from dump
pg_restore --no-owner --no-acl --dburl=$DATABASE_URL backup_file.dump
```

### 8.3 Disaster Recovery Plan

| Scenario | RTO | RPO | Recovery Action |
|----------|-----|-----|-----------------|
| Accidental data loss | 1 hour | 24 hours | Restore from Supabase daily backup |
| Schema corruption | 2 hours | 1 hour | Rollback to previous migration version |
| Full region outage | 4 hours | 1 hour | Deploy to new Supabase project |
| Accidental table drop | 30 min | 24 hours | pg_restore from latest dump |

### 8.4 Recovery SOP

1. **Assess scope** - Identify affected tables, rows, and time window
2. **Stop writes** - Set feature_flags.maintenance_mode = true
3. **Restore from backup** - Use Supabase dashboard or pg_restore
4. **Verify data integrity** - Run 999_verify.sql checks
5. **Reapply recent changes** - Manually replay any writes after backup timestamp
6. **Disable maintenance mode** - Set feature_flags.maintenance_mode = false
7. **Post-mortem** - Document root cause, update runbook

---
## 9. Monitoring

### 9.1 Health Check Queries

```sql
-- Database health check
SELECT
    pg_database_size(current_database()) AS db_size_bytes,
    (SELECT count(*) FROM pg_stat_activity) AS active_connections,
    (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') AS active_queries,
    (SELECT count(*) FROM pg_stat_activity WHERE wait_event IS NOT NULL) AS waiting_queries,
    (SELECT count(*) FROM pg_locks WHERE NOT granted) AS lock_waits;

-- Table size ranking
SELECT
    relname AS table_name,
    pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
    n_live_tup AS row_estimate
FROM pg_catalog.pg_statio_user_tables
ORDER BY pg_total_relation_size(relid) DESC;

-- Slow queries (requires pg_stat_statements)
SELECT
    query,
    mean_exec_time AS avg_ms,
    calls,
    rows,
    shared_blks_hit,
    shared_blks_read
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 20;
```

### 9.2 Supabase Dashboard Monitoring

| Metric | Location | Warning Threshold | Critical Threshold |
|--------|----------|-------------------|-------------------|
| DB Size | Database > Reports | >80% quota | >95% quota |
| Active Connections | Database > Reports | >10 | >14 (of 15) |
| Avg Query Time | Database > Reports | >100ms | >500ms |
| Storage | Storage > Reports | >80% quota | >95% quota |
| Edge Function Errors | Logs > Explorer | >1% error rate | >5% error rate |

### 9.3 Alerting Setup

Use Supabase webhooks or external monitoring (Better Stack, Sentry):

```sql
-- Check for connection pool exhaustion
SELECT count(*) >= 12 AS near_limit FROM pg_stat_activity;

-- Check for deadlocks in last hour
SELECT count(*) FROM pg_stat_activity
WHERE wait_event_type = 'Lock'
AND state = 'active'
AND query_start > NOW() - INTERVAL '1 hour';
```

---
## 10. Performance

### 10.1 Connection Pooling

Supabase free tier allows 15 max connections. Use PgBouncer (built-in) in transaction mode:

| Client | Connection String | Pool Mode | Max Clients |
|--------|-------------------|-----------|-------------|
| NestJS (direct) | postgresql://user:pass@db.xxxx.supabase.co:6543/postgres | Transaction | 15 |
| NestJS (pooled) | postgresql://user:pass@db.xxxx.supabase.co:6543/pgbouncer | Transaction | 200+ |
| Prisma/ORM | postgresql://user:pass@db.xxxx.supabase.co:6543/pgbouncer | Transaction | 200+ |

### 10.2 NestJS Connection Configuration

```typescript
// TypeORM or Knex connection config
const dbConfig = {
    host: process.env.DB_HOST,
    port: 6543,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 10,              -- Max pool size (within 15 limit)
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false }
};
```

### 10.3 Query Optimization Guidelines

| Rule | Description | Example |
|------|-------------|---------|
| 1 | Use EXISTS instead of COUNT for existence | EXISTS(SELECT 1 FROM ...) |
| 2 | Avoid SELECT * | SELECT id, title, slug |
| 3 | Use LIMIT with pagination | LIMIT 20 OFFSET 0 |
| 4 | Index WHERE and JOIN columns | Covered in Section 3 |
| 5 | Use materialized views for dashboards | CREATE MATERIALIZED VIEW ... |
| 6 | Avoid JSONB operations in WHERE | Use generated columns instead |
| 7 | Use prepared statements | $1, $2 parameters |

### 10.4 Caching Strategy

| Layer | Tool | TTL | Cacheable Data |
|------|------|-----|---------------|
| Application | NestJS in-memory | 5 min | Section config, skills, testimonials |
| CDN | Cloudflare/Vercel Edge | 10 min | Public API responses (projects, blog) |
| Database | pg_stat_statements | N/A | Query plan cache |

### 10.5 Migration Performance

| Migration | Est. Execution Time | Transaction Safety | Risk |
|-----------|-------------------|-------------------|------|
| 001-011 (DDL) | 5-10 seconds | Yes (single tx) | Low |
| 012 (Extensions) | 2-5 seconds | Yes | Low |
| 013 (Indexes) | 30-120 seconds | No (CONCURRENTLY) | Medium |
| 014-015 (RLS) | 5 seconds | Yes | Low |
| 016 (Triggers) | 2 seconds | Yes | Low |
| 017 (Seed) | 1 second | Yes | Low |

Index creation uses CONCURRENTLY to avoid locking production tables.

---
## 11. Production Rollout Checklist

### 11.1 Pre-Migration Checklist

- [ ] Verify 999_verify.sql passes on staging
- [ ] Run pg_dump full backup of production database
- [ ] Set feature_flags.maintenance_mode = true in production
- [ ] Verify migration order matches dependency graph
- [ ] Check Supabase project quota (storage, connections)
- [ ] Notify team of maintenance window (expected: 5-10 min)
- [ ] Enable maintenance mode on the portfolio site

### 11.2 Migration Execution

| Step | Command | Duration | Verification |
|------|---------|----------|-------------|
| 1 | supabase db push --version 012 | 5s | Extensions active |
| 2 | supabase db push --version 011 | 10s | 37 tables created |
| 3 | supabase db push --version 013 | 2 min | Indexes created |
| 4 | supabase db push --version 014 | 3s | RLS enabled |
| 5 | supabase db push --version 015 | 3s | Policies applied |
| 6 | supabase db push --version 016 | 2s | Triggers active |
| 7 | supabase db push --version 017 | 1s | Seed data inserted |
| 8 | Run 999_verify.sql | 2s | All checks pass |

```bash
# Execute migration steps sequentially
for version in 012 011 013 014 015 016 017; do
    echo "Applying migration $version..."
    supabase db push --version "$version" --db-url "$PRODUCTION_URL"
    if [ $? -ne 0 ]; then
        echo "Migration $version failed! Aborting."
        exit 1
    fi
done
echo "Running verification..."
psql "$PRODUCTION_URL" -f supabase/migrations/999_verify.sql
```

### 11.3 Post-Migration Verification

- [ ] All 37 tables present (checked by 999_verify.sql)
- [ ] RLS enabled on all tables
- [ ] All 12 updated_at triggers active
- [ ] 4 audit triggers active on leads, projects, blog_posts, system_settings
- [ ] All 4 extensions installed
- [ ] Seed data inserted (default roles, sections, feature flags)
- [ ] API endpoints can connect and query
- [ ] No ERROR in Supabase logs
- [ ] Frontend renders public data correctly

### 11.4 Rollback Plan

If migration fails or causes issues:

```bash
# Option 1: Rollback to specific migration
supabase db push --version 011 --db-url "$PRODUCTION_URL"

# Option 2: Full restore from backup
pg_restore --no-owner --no-acl --dburl="$PRODUCTION_URL" pre_migration_backup.dump

# Option 3: Supabase dashboard restore
# Database > Backups > Select pre-migration backup > Restore
```

### 11.5 Post-Launch Monitoring (48 hours)

| Check | Frequency | Expected | Escalate If |
|------|-----------|----------|-------------|
| Query error rate | Every 15 min | <0.1% | >1% |
| Avg query latency | Every 15 min | <50ms | >200ms |
| Connection count | Every 15 min | <5 | >12 |
| DB size growth | Daily | <50MB | >200MB |
| Failed RLS checks | Every hour | 0 | >10 |
| Backup success | Daily | Success | Failure |

---

## Glossary

| Term | Definition |
|------|------------|
| **RLS** | Row-Level Security — PostgreSQL feature that restricts row visibility and mutation based on a policy expression evaluated per-query; enforced at the database level, cannot be bypassed by the application |
| **pgvector** | PostgreSQL extension that adds vector data type and similarity search operators (cosine, L2, inner product); used for storing and querying AI embeddings |
| **PITR** | Point-In-Time Recovery — ability to restore a database to any moment within a retention window using WAL archive; Supabase provides 7-day PITR |
| **WAL** | Write-Ahead Log — PostgreSQL's transaction log that records every change; enables replication, PITR, and standby databases |
| **IVFFlat** | Inverted File with Flat Compression — approximate nearest neighbor index that partitions vectors into inverted lists for faster k-NN search at the cost of some recall |
| **Zod** | TypeScript-first schema declaration and validation library that infers TypeScript types from runtime validators; ensures data integrity at the API boundary |
| **Trigger Function** | PostgreSQL function that executes automatically on INSERT, UPDATE, or DELETE of a specified table; used for updated_at timestamps and audit logging |
| **Storage Bucket** | Supabase storage container for file uploads with configurable public/private access, MIME type restrictions, and file size limits |
| **Service Role** | Supabase special role that bypasses RLS policies — used for server-to-server communication (NestJS API, FastAPI AI service); key must be kept secret |
| **Seed Data** | Pre-populated database content for development and staging environments (default roles, sections, feature flags, sample projects) |
| **Supabase CLI** | Command-line tool for local development, migration management, database push/pull, and type generation from database schema |
| **pg_dump** | PostgreSQL native backup utility that outputs a portable SQL or custom-format dump file; used for nightly backups and pre-migration snapshots |
| **Connection Pooling** | Technique that reuses database connections to avoid the overhead of establishing a new TCP connection per request; Supabase provides built-in PgBouncer |
| **Migration Stream** | Ordered set of versioned SQL migration files; each migration represents a discrete schema change that is applied sequentially and logged in the `_supabase_migrations` table |
| **Nullable vs Optional** | Zod convention: `nullable()` allows the field to be null in the database; `optional()` allows the field to be absent in the application — distinct concerns that prevent null/undefined confusion |

## Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.1 | Jun 2026 | Added Executive Summary, Decision Log (5 entries), Risk Register (5 entries), Glossary (15 terms), Change Log | Tech Lead |
| 1.0 | Jun 2026 | Initial database implementation guide — 10 sections covering migration plan, schema, indexes, RLS, backups, validation, audit logging, seed data, testing, disaster recovery, production rollout | Tech Lead |

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| See MASTER-INDEX.md | Full document dependency graph and cross-reference map |

---

## Cross-References

| Reference | Description |
|-----------|-------------|
| docs/MASTER-INDEX.md | Full document dependency graph and cross-reference map |
