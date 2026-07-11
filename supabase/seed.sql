-- ══════════════════════════════════════════════════════════════
-- Seed Data: Initial Portfolio Content
-- ══════════════════════════════════════════════════════════════

-- Ensure extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Clean existing data
TRUNCATE TABLE users, sections, projects, project_images, skills, experiences, testimonials, services CASCADE;

-- ── Admin User ──────────────────────────────────────────────
INSERT INTO users (id, email, display_name, password_hash, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'admin@portfolio.com',
  'Admin',
  -- Password is 'Admin123!' (In production, this would be a proper bcrypt hash)
  crypt('Admin123!', gen_salt('bf')),
  TRUE
);

-- ── Sections ────────────────────────────────────────────────
INSERT INTO sections (section_key, section_label, section_type, display_order, is_always_visible, is_live)
VALUES
  ('hero', 'Hero', 'hero', 1, TRUE, TRUE),
  ('about', 'About Me', 'stats', 2, FALSE, TRUE),
  ('skills', 'Skills', 'grid', 3, FALSE, TRUE),
  ('projects', 'Projects', 'grid', 4, FALSE, TRUE),
  ('experience', 'Experience', 'timeline', 5, FALSE, TRUE),
  ('testimonials', 'Testimonials', 'slider', 6, FALSE, FALSE),
  ('blog', 'Blog', 'list', 7, FALSE, FALSE),
  ('contact', 'Contact', 'split', 8, TRUE, TRUE);

-- ── Projects ────────────────────────────────────────────────
INSERT INTO projects (id, slug, title, description, tech_stack, category, display_order, is_featured)
VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'enterprise-saas',
    'Enterprise SaaS Platform',
    'A multi-tenant SaaS platform built with Next.js and NestJS, featuring real-time collaboration and advanced RBAC.',
    '{"Next.js", "NestJS", "PostgreSQL", "Redis"}',
    'web',
    1,
    TRUE
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'ai-assistant',
    'AI Assistant Integration',
    'A RAG-powered chatbot integrating OpenAI and local embeddings for automated customer support.',
    '{"FastAPI", "Python", "LangChain", "pgvector"}',
    'ai',
    2,
    TRUE
  );

-- ── Skills ──────────────────────────────────────────────────
INSERT INTO skills (name, category, proficiency, display_order, is_featured)
VALUES
  ('TypeScript', 'Language', 95, 1, TRUE),
  ('React', 'Frontend', 90, 2, TRUE),
  ('Next.js', 'Frontend', 85, 3, TRUE),
  ('NestJS', 'Backend', 85, 4, TRUE),
  ('PostgreSQL', 'Database', 80, 5, TRUE),
  ('Python', 'Language', 75, 6, FALSE),
  ('FastAPI', 'Backend', 70, 7, FALSE);

-- ── System Settings ─────────────────────────────────────────
INSERT INTO system_settings (setting_key, setting_value, setting_group, description, data_type)
VALUES
  ('site_name', 'Portfolio Platform', 'general', 'Global site name', 'string'),
  ('maintenance_mode', 'false', 'system', 'Enable maintenance mode', 'boolean'),
  ('contact_email', 'hello@portfolio.com', 'contact', 'Primary contact email', 'string');

-- ── Availability Status ─────────────────────────────────────
INSERT INTO availability_status (is_available, status_label, preferred_contact)
VALUES (TRUE, 'Available for new opportunities', 'email');
