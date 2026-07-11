-- ══════════════════════════════════════════════════════════════
-- Migration: 001_initial_schema
-- Description: Creates the complete portfolio database schema
-- Reference: docs/DatabaseArchitecture.md §5-14
-- ══════════════════════════════════════════════════════════════

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- pgvector is typically enabled via Supabase dashboard
-- CREATE EXTENSION IF NOT EXISTS "vector";

-- ── Helper Function: Auto-update updated_at ─────────────────
CREATE OR REPLACE FUNCTION fn_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ══════════════════════════════════════════════════════════════
-- CORE TABLES (Auth & RBAC)
-- ══════════════════════════════════════════════════════════════

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  avatar_url    TEXT,
  password_hash TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource    TEXT NOT NULL,
  action      TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (resource, action)
);

CREATE TABLE user_roles (
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);


-- ══════════════════════════════════════════════════════════════
-- CONTENT TABLES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE sections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key       TEXT NOT NULL UNIQUE,
  section_label     TEXT NOT NULL,
  section_type      TEXT,
  is_live           BOOLEAN NOT NULL DEFAULT FALSE,
  style_preset      TEXT NOT NULL DEFAULT 'default',
  display_order     INTEGER NOT NULL DEFAULT 0,
  min_items         INTEGER NOT NULL DEFAULT 1,
  auto_publish      BOOLEAN NOT NULL DEFAULT FALSE,
  is_always_visible BOOLEAN NOT NULL DEFAULT FALSE,
  style_config      JSONB NOT NULL DEFAULT '{}',
  content           JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_sections_updated_at BEFORE UPDATE ON sections
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_sections_display_order ON sections (display_order);
CREATE INDEX idx_sections_is_live ON sections (is_live);

CREATE TABLE projects (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  tech_stack     TEXT[] NOT NULL DEFAULT '{}',
  live_url       TEXT,
  github_url     TEXT,
  cover_image    TEXT,
  thumbnail_url  TEXT,
  is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
  is_private     BOOLEAN NOT NULL DEFAULT FALSE,
  nda_password   TEXT,
  category       TEXT CHECK (category IN ('web', 'mobile', 'ai', 'devops', 'design', 'other')),
  display_order  INTEGER NOT NULL DEFAULT 0,
  content        JSONB NOT NULL DEFAULT '{}',
  metrics        JSONB NOT NULL DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_projects_slug ON projects (slug);
CREATE INDEX idx_projects_category ON projects (category);
CREATE INDEX idx_projects_is_featured ON projects (is_featured);
CREATE INDEX idx_projects_display_order ON projects (display_order);

CREATE TABLE project_images (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url     TEXT NOT NULL,
  alt_text      TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_project_images_project_id ON project_images (project_id);

CREATE TABLE blog_posts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             TEXT NOT NULL UNIQUE,
  title            TEXT NOT NULL,
  excerpt          TEXT,
  content          TEXT NOT NULL DEFAULT '',
  cover_image      TEXT,
  category         TEXT,
  tags             TEXT[] NOT NULL DEFAULT '{}',
  author_name      TEXT NOT NULL DEFAULT 'Admin',
  read_time_minutes INTEGER NOT NULL DEFAULT 5,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured      BOOLEAN NOT NULL DEFAULT FALSE,
  seo_title        TEXT,
  seo_description  TEXT,
  published_at     TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_blog_posts_updated_at BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_blog_posts_slug ON blog_posts (slug);
CREATE INDEX idx_blog_posts_is_published ON blog_posts (is_published);
CREATE INDEX idx_blog_posts_published_at ON blog_posts (published_at DESC NULLS LAST);
CREATE INDEX idx_blog_posts_tags ON blog_posts USING GIN (tags);

CREATE TABLE post_tags (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id    UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag        TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, tag)
);
CREATE INDEX idx_post_tags_post_id ON post_tags (post_id);
CREATE INDEX idx_post_tags_tag ON post_tags (tag);

CREATE TABLE testimonials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  company       TEXT NOT NULL,
  avatar_url    TEXT,
  content       TEXT NOT NULL,
  rating        SMALLINT NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_testimonials_updated_at BEFORE UPDATE ON testimonials
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_testimonials_is_visible ON testimonials (is_visible);

CREATE TABLE skills (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  proficiency   SMALLINT NOT NULL DEFAULT 0 CHECK (proficiency >= 0 AND proficiency <= 100),
  icon_url      TEXT,
  lottie_url    TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_featured   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_skills_updated_at BEFORE UPDATE ON skills
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_skills_category ON skills (category);
CREATE INDEX idx_skills_is_featured ON skills (is_featured);

CREATE TABLE experiences (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company          TEXT NOT NULL,
  role             TEXT NOT NULL,
  description      TEXT,
  technologies     TEXT[] NOT NULL DEFAULT '{}',
  company_logo_url TEXT,
  company_url      TEXT,
  location         TEXT,
  start_date       DATE NOT NULL,
  end_date         DATE,
  is_current       BOOLEAN NOT NULL DEFAULT FALSE,
  display_order    INTEGER NOT NULL DEFAULT 0,
  is_visible       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_experiences_updated_at BEFORE UPDATE ON experiences
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_experiences_display_order ON experiences (display_order);

CREATE TABLE achievements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  issuer          TEXT,
  description     TEXT,
  badge_image_url TEXT,
  category        TEXT,
  achieved_date   DATE,
  credential_url  TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  icon          TEXT NOT NULL DEFAULT '💻',
  features      TEXT[] NOT NULL DEFAULT '{}',
  pricing_tier  TEXT,
  price_cents   INTEGER,
  cta_text      TEXT,
  cta_url       TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE case_studies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id            UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  challenge             TEXT,
  approach              TEXT,
  solution              TEXT,
  impact                TEXT,
  architecture_diagrams TEXT[] NOT NULL DEFAULT '{}',
  code_snippets         TEXT[] NOT NULL DEFAULT '{}',
  metrics               JSONB NOT NULL DEFAULT '{}',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_case_studies_updated_at BEFORE UPDATE ON case_studies
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_case_studies_project_id ON case_studies (project_id);

CREATE TABLE press_features (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publication   TEXT NOT NULL,
  title         TEXT NOT NULL,
  url           TEXT,
  logo_url      TEXT,
  description   TEXT,
  featured_date DATE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE guest_appearances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL CHECK (type IN ('podcast', 'conference', 'webinar', 'workshop', 'other')),
  title           TEXT NOT NULL,
  host            TEXT,
  url             TEXT,
  cover_image_url TEXT,
  description     TEXT,
  appearance_date DATE,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reading_list (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  author          TEXT,
  url             TEXT,
  cover_image_url TEXT,
  category        TEXT,
  recommendation  TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ══════════════════════════════════════════════════════════════
-- LEAD MANAGEMENT TABLES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE leads (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone      TEXT,
  company    TEXT,
  subject    TEXT,
  message    TEXT NOT NULL,
  source     TEXT NOT NULL DEFAULT 'contact_form' CHECK (source IN ('contact_form', 'ai_chat', 'referral', 'direct')),
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'converted', 'archived')),
  priority   TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ip_address INET,
  metadata   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_source ON leads (source);
CREATE INDEX idx_leads_email ON leads (email);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX idx_leads_deleted_at ON leads (deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE lead_notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id    UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id  UUID REFERENCES users(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_lead_notes_updated_at BEFORE UPDATE ON lead_notes
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
CREATE INDEX idx_lead_notes_lead_id ON lead_notes (lead_id);

CREATE TABLE lead_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  description TEXT,
  details     JSONB NOT NULL DEFAULT '{}',
  ip_address  INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities (lead_id);


-- ══════════════════════════════════════════════════════════════
-- ANALYTICS TABLES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE analytics_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name  TEXT NOT NULL,
  page_url    TEXT,
  session_id  TEXT,
  visitor_id  TEXT,
  user_agent  TEXT,
  ip_address  INET,
  properties  JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_analytics_events_name ON analytics_events (event_name);
CREATE INDEX idx_analytics_events_session ON analytics_events (session_id);
CREATE INDEX idx_analytics_events_created ON analytics_events (created_at DESC);

CREATE TABLE analytics_sessions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT NOT NULL UNIQUE,
  visitor_id       TEXT,
  referrer         TEXT,
  utm_source       TEXT,
  utm_medium       TEXT,
  utm_campaign     TEXT,
  device_type      TEXT,
  browser          TEXT,
  country          TEXT,
  city             TEXT,
  page_views       INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_analytics_sessions_started ON analytics_sessions (started_at DESC);

CREATE TABLE page_views (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            TEXT,
  page_url              TEXT NOT NULL,
  page_title            TEXT,
  referrer              TEXT,
  scroll_depth_percent  INTEGER DEFAULT 0,
  time_on_page_seconds  INTEGER DEFAULT 0,
  engagement            JSONB NOT NULL DEFAULT '{}',
  viewed_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_page_views_url ON page_views (page_url);
CREATE INDEX idx_page_views_viewed ON page_views (viewed_at DESC);


-- ══════════════════════════════════════════════════════════════
-- AI & RAG TABLES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE chat_conversations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id       TEXT NOT NULL UNIQUE,
  visitor_id       TEXT,
  page_context     TEXT,
  message_count    INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ
);
CREATE INDEX idx_chat_conversations_session ON chat_conversations (session_id);

CREATE TABLE chat_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content          TEXT NOT NULL,
  tokens_used      INTEGER DEFAULT 0,
  response_time_ms INTEGER DEFAULT 0,
  metadata         JSONB NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_chat_messages_conversation ON chat_messages (conversation_id);

CREATE TABLE document_chunks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  content     TEXT NOT NULL,
  -- embedding   VECTOR(1536),  -- Enable after pgvector extension is active
  chunk_index INTEGER NOT NULL DEFAULT 0,
  token_count INTEGER NOT NULL DEFAULT 0,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_document_chunks_doc ON document_chunks (document_id);

CREATE TABLE embeddings_cache (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  input_hash  TEXT NOT NULL UNIQUE,
  input_text  TEXT NOT NULL,
  -- embedding   VECTOR(1536),  -- Enable after pgvector extension is active
  model       TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  token_count INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ
);
CREATE INDEX idx_embeddings_cache_hash ON embeddings_cache (input_hash);


-- ══════════════════════════════════════════════════════════════
-- SYSTEM TABLES
-- ══════════════════════════════════════════════════════════════

CREATE TABLE media_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name       TEXT NOT NULL,
  file_path       TEXT NOT NULL,
  bucket_name     TEXT NOT NULL DEFAULT 'assets',
  mime_type       TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  width           INTEGER,
  height          INTEGER,
  alt_text        TEXT,
  uploaded_by     UUID REFERENCES users(id) ON DELETE SET NULL,
  variants        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ
);

CREATE TABLE availability_status (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_available      BOOLEAN NOT NULL DEFAULT TRUE,
  status_label      TEXT NOT NULL DEFAULT 'Available for new opportunities',
  available_until   TEXT,
  preferred_contact TEXT NOT NULL DEFAULT 'email',
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE system_settings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key   TEXT NOT NULL UNIQUE,
  setting_value TEXT NOT NULL DEFAULT '',
  setting_group TEXT NOT NULL DEFAULT 'general',
  description   TEXT,
  data_type     TEXT NOT NULL DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  is_encrypted  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT,
  channel    TEXT NOT NULL DEFAULT 'telegram' CHECK (channel IN ('telegram', 'email', 'push')),
  payload    JSONB NOT NULL DEFAULT '{}',
  is_read    BOOLEAN NOT NULL DEFAULT FALSE,
  is_sent    BOOLEAN NOT NULL DEFAULT FALSE,
  sent_at    TIMESTAMPTZ,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name     TEXT NOT NULL,
  record_id      TEXT NOT NULL,
  action         TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  actor_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address     INET,
  old_values     JSONB,
  new_values     JSONB,
  correlation_id TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_table ON audit_logs (table_name);
CREATE INDEX idx_audit_logs_record ON audit_logs (record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs (created_at DESC);

CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL UNIQUE,
  user_agent    TEXT,
  ip_address    INET,
  is_revoked    BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (refresh_token);

CREATE TABLE api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE,
  key_prefix  TEXT NOT NULL,
  permissions TEXT NOT NULL DEFAULT 'read',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at  TIMESTAMPTZ
);

CREATE TABLE feature_flags (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key            TEXT NOT NULL UNIQUE,
  description         TEXT,
  is_enabled          BOOLEAN NOT NULL DEFAULT FALSE,
  targeting_rules     JSONB NOT NULL DEFAULT '{}',
  rollout_percentage  INTEGER NOT NULL DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_feature_flags_updated_at BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();

CREATE TABLE admin_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID REFERENCES users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  resource_type TEXT,
  resource_id   TEXT,
  description   TEXT,
  details       JSONB NOT NULL DEFAULT '{}',
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_admin_activities_admin ON admin_activities (admin_id);
CREATE INDEX idx_admin_activities_created ON admin_activities (created_at DESC);

-- ── FAQ table (referenced in shared types but missing from schema) ──
CREATE TABLE faqs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question      TEXT NOT NULL,
  answer        TEXT NOT NULL,
  category      TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER trg_faqs_updated_at BEFORE UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION fn_update_updated_at();
