-- Align the database with schema.prisma.
--
-- The original 20260101000000_initial_schema migration predates the RBAC
-- join tables and declared several enum-backed columns as plain TEXT. This
-- migration converts those columns in place so existing rows survive, and
-- backfills user_roles from the legacy users.role column before dropping it.

-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('web', 'mobile', 'ai', 'devops', 'design', 'other');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('contact_form', 'ai_chat', 'referral', 'direct');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'read', 'replied', 'converted', 'archived');

-- CreateEnum
CREATE TYPE "LeadPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('user', 'assistant', 'system');

-- CreateEnum
CREATE TYPE "AppearanceType" AS ENUM ('podcast', 'conference', 'webinar', 'workshop', 'other');

-- CreateEnum
CREATE TYPE "SettingDataType" AS ENUM ('string', 'number', 'boolean', 'json');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('telegram', 'email', 'push');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- Required by the role backfill below.
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id","role_id")
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "chunk_index" INTEGER NOT NULL DEFAULT 0,
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "embeddings_cache" (
    "id" TEXT NOT NULL,
    "input_hash" TEXT NOT NULL,
    "input_text" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "token_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "embeddings_cache_pkey" PRIMARY KEY ("id")
);

-- Backfill the RBAC tables from the legacy users.role enum before the column
-- is dropped. The three canonical roles always exist after this block.
INSERT INTO "roles" ("id", "name", "description")
VALUES
    (gen_random_uuid()::text, 'admin', 'Full administrative access'),
    (gen_random_uuid()::text, 'editor', 'Can manage portfolio content'),
    (gen_random_uuid()::text, 'viewer', 'Read-only access')
ON CONFLICT ("name") DO NOTHING;

INSERT INTO "user_roles" ("user_id", "role_id")
SELECT u."id", r."id"
FROM "users" u
JOIN "roles" r ON r."name" = u."role"::text
ON CONFLICT ("user_id", "role_id") DO NOTHING;

-- Normalize legacy values that predate the enum constraints so the type
-- conversions below cannot fail on existing rows.
UPDATE "projects"
SET "category" = 'other'
WHERE "category" IS NOT NULL
  AND "category" NOT IN ('web', 'mobile', 'ai', 'devops', 'design', 'other');

UPDATE "leads" SET "source" = 'direct'
WHERE "source" NOT IN ('contact_form', 'ai_chat', 'referral', 'direct');

UPDATE "leads" SET "status" = 'new'
WHERE "status" NOT IN ('new', 'read', 'replied', 'converted', 'archived');

UPDATE "leads" SET "priority" = 'normal'
WHERE "priority" NOT IN ('low', 'normal', 'high', 'urgent');

UPDATE "notifications" SET "channel" = 'email'
WHERE "channel" NOT IN ('telegram', 'email', 'push');

UPDATE "guest_appearances" SET "type" = 'other'
WHERE "type" NOT IN ('podcast', 'conference', 'webinar', 'workshop', 'other');

UPDATE "chat_messages" SET "role" = 'user'
WHERE "role" NOT IN ('user', 'assistant', 'system');

UPDATE "audit_logs" SET "action" = 'UPDATE'
WHERE "action" NOT IN ('INSERT', 'UPDATE', 'DELETE');

UPDATE "system_settings" SET "data_type" = 'string'
WHERE "data_type" NOT IN ('string', 'number', 'boolean', 'json');

-- AlterTable
ALTER TABLE "leads"
    ALTER COLUMN "source" DROP DEFAULT,
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "priority" DROP DEFAULT;

ALTER TABLE "leads"
    ALTER COLUMN "source" TYPE "LeadSource" USING ("source"::"LeadSource"),
    ALTER COLUMN "status" TYPE "LeadStatus" USING ("status"::"LeadStatus"),
    ALTER COLUMN "priority" TYPE "LeadPriority" USING ("priority"::"LeadPriority");

ALTER TABLE "leads"
    ALTER COLUMN "source" SET DEFAULT 'contact_form',
    ALTER COLUMN "status" SET DEFAULT 'new',
    ALTER COLUMN "priority" SET DEFAULT 'normal';

-- AlterTable
ALTER TABLE "notifications" ALTER COLUMN "channel" DROP DEFAULT;
ALTER TABLE "notifications"
    ALTER COLUMN "channel" TYPE "NotificationChannel" USING ("channel"::"NotificationChannel");
ALTER TABLE "notifications" ALTER COLUMN "channel" SET DEFAULT 'email';

-- AlterTable
ALTER TABLE "audit_logs"
    ALTER COLUMN "action" TYPE "AuditAction" USING ("action"::"AuditAction");

-- AlterTable
ALTER TABLE "chat_messages"
    ALTER COLUMN "role" TYPE "MessageRole" USING ("role"::"MessageRole");

-- AlterTable
ALTER TABLE "guest_appearances"
    ALTER COLUMN "type" TYPE "AppearanceType" USING ("type"::"AppearanceType");

-- AlterTable
ALTER TABLE "projects"
    ALTER COLUMN "category" TYPE "ProjectCategory" USING ("category"::"ProjectCategory");

-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "data_type" DROP DEFAULT;
ALTER TABLE "system_settings"
    ALTER COLUMN "data_type" TYPE "SettingDataType" USING ("data_type"::"SettingDataType");
ALTER TABLE "system_settings" ALTER COLUMN "data_type" SET DEFAULT 'string';

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "icon" SET DEFAULT 'code';

-- AlterTable
ALTER TABLE "users"
    DROP COLUMN "failed_login_attempts",
    DROP COLUMN "locked_until",
    DROP COLUMN "role";

-- DropEnum
DROP TYPE "UserRole";

-- DropIndex
DROP INDEX "achievements_category_display_order_idx";

-- DropIndex
DROP INDEX "analytics_events_event_name_created_at_idx";

-- DropIndex
DROP INDEX "blog_posts_is_published_published_at_idx";

-- DropIndex
DROP INDEX "experiences_is_visible_display_order_idx";

-- DropIndex
DROP INDEX "leads_status_created_at_idx";

-- DropIndex
DROP INDEX "media_assets_mime_type_created_at_idx";

-- DropIndex
DROP INDEX "projects_category_is_private_idx";

-- DropIndex
DROP INDEX "projects_is_featured_is_private_idx";

-- DropIndex
DROP INDEX "sections_is_live_section_type_idx";

-- DropIndex
DROP INDEX "skills_category_is_featured_idx";

-- DropIndex
DROP INDEX "testimonials_is_visible_is_featured_idx";

-- CreateIndex
CREATE UNIQUE INDEX "permissions_resource_action_key" ON "permissions"("resource", "action");

-- CreateIndex
CREATE INDEX "document_chunks_document_id_idx" ON "document_chunks"("document_id");

-- CreateIndex
CREATE INDEX "document_chunks_document_id_chunk_index_idx" ON "document_chunks"("document_id", "chunk_index");

-- CreateIndex
CREATE UNIQUE INDEX "embeddings_cache_input_hash_key" ON "embeddings_cache"("input_hash");

-- CreateIndex
CREATE INDEX "embeddings_cache_input_hash_idx" ON "embeddings_cache"("input_hash");

-- CreateIndex
CREATE INDEX "guest_appearances_type_idx" ON "guest_appearances"("type");

-- CreateIndex
CREATE INDEX "media_assets_mime_type_idx" ON "media_assets"("mime_type");

-- CreateIndex
CREATE INDEX "sessions_refresh_token_idx" ON "sessions"("refresh_token");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
