-- ══════════════════════════════════════════════════════════════
-- Migration: 002_rls_policies
-- Description: Row Level Security policies for all tables
-- Reference: docs/DatabaseArchitecture.md §21
-- ══════════════════════════════════════════════════════════════

-- ── Enable RLS on all tables ────────────────────────────────

-- Core
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Content
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE press_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_appearances ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_list ENABLE ROW LEVEL SECURITY;

-- Leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

-- Analytics
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- AI & RAG
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE embeddings_cache ENABLE ROW LEVEL SECURITY;

-- System
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- ── Helper Functions ────────────────────────────────────────

-- Function to check if the current user is an admin
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
  -- We assume standard Supabase auth.uid() checks for simplicity
  -- If using custom JWT handling, this would check jwt() ->> 'role'
  RETURN (auth.uid() IS NOT NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ── Public Read Policies (Content Tables) ───────────────────

-- Sections: Anonymous can read live sections
CREATE POLICY "Public can view live sections" ON sections
  FOR SELECT TO anon, authenticated
  USING (is_live = TRUE OR is_always_visible = TRUE);

-- Projects: Anonymous can read non-private projects
CREATE POLICY "Public can view non-private projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (is_private = FALSE);

-- Project Images: Anonymous can read images of non-private projects
CREATE POLICY "Public can view project images" ON project_images
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_images.project_id
      AND projects.is_private = FALSE
    )
  );

-- Blog Posts: Anonymous can read published posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
  FOR SELECT TO anon, authenticated
  USING (is_published = TRUE AND (published_at IS NULL OR published_at <= NOW()));

-- Post Tags: Public can read
CREATE POLICY "Public can view post tags" ON post_tags
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Testimonials: Public can read visible testimonials
CREATE POLICY "Public can view visible testimonials" ON testimonials
  FOR SELECT TO anon, authenticated
  USING (is_visible = TRUE);

-- Skills: Public can read all skills
CREATE POLICY "Public can view skills" ON skills
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Experiences: Public can read visible experiences
CREATE POLICY "Public can view visible experiences" ON experiences
  FOR SELECT TO anon, authenticated
  USING (is_visible = TRUE);

-- Achievements: Public can read all achievements
CREATE POLICY "Public can view achievements" ON achievements
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Services: Public can read active services
CREATE POLICY "Public can view active services" ON services
  FOR SELECT TO anon, authenticated
  USING (is_active = TRUE);

-- Case Studies: Public can read case studies of non-private projects
CREATE POLICY "Public can view case studies" ON case_studies
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = case_studies.project_id
      AND projects.is_private = FALSE
    )
  );

-- Press Features: Public can read
CREATE POLICY "Public can view press features" ON press_features
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Guest Appearances: Public can read
CREATE POLICY "Public can view guest appearances" ON guest_appearances
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Reading List: Public can read
CREATE POLICY "Public can view reading list" ON reading_list
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- FAQs: Public can read visible FAQs
CREATE POLICY "Public can view visible faqs" ON faqs
  FOR SELECT TO anon, authenticated
  USING (is_visible = TRUE);

-- Availability Status: Public can read
CREATE POLICY "Public can view availability status" ON availability_status
  FOR SELECT TO anon, authenticated
  USING (TRUE);

-- Media Assets: Public can read
CREATE POLICY "Public can view media assets" ON media_assets
  FOR SELECT TO anon, authenticated
  USING (TRUE);


-- ── Public Insert Policies ──────────────────────────────────

-- Leads: Public can insert
CREATE POLICY "Public can insert leads" ON leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Analytics: Public can insert events and sessions
CREATE POLICY "Public can insert analytics events" ON analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Public can insert analytics sessions" ON analytics_sessions
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Public can insert page views" ON page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

-- Chat: Public can insert chat conversations and messages
CREATE POLICY "Public can insert chat conversations" ON chat_conversations
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Public can insert chat messages" ON chat_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (TRUE);


-- ── Admin Access (All Tables) ───────────────────────────────

-- Helper block to grant full access to admins for all tables
DO $$
DECLARE
  table_name text;
BEGIN
  FOR table_name IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('
      CREATE POLICY "Admins have full access to %I" ON %I
        FOR ALL TO authenticated
        USING (is_admin())
        WITH CHECK (is_admin());
    ', table_name, table_name);
  END LOOP;
END;
$$;
