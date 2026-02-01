-- Migration: v2.0 Data Model Depth (Phase 9)
-- Created: 2026-01-25
-- Description: Add enhanced use cases, database schema, tech stack, and user stories

-- ============================================================
-- 1. Add new columns to project_data table
-- ============================================================

ALTER TABLE "project_data" ADD COLUMN IF NOT EXISTS "database_schema" jsonb;
ALTER TABLE "project_data" ADD COLUMN IF NOT EXISTS "tech_stack" jsonb;
ALTER TABLE "project_data" ADD COLUMN IF NOT EXISTS "api_specification" jsonb;
ALTER TABLE "project_data" ADD COLUMN IF NOT EXISTS "infrastructure_spec" jsonb;
ALTER TABLE "project_data" ADD COLUMN IF NOT EXISTS "coding_guidelines" jsonb;

-- Add comment for documentation
COMMENT ON COLUMN "project_data"."database_schema" IS 'DatabaseSchemaModel: entities with fields, relationships, indexes';
COMMENT ON COLUMN "project_data"."tech_stack" IS 'TechStackModel: technology choices with rationale';
COMMENT ON COLUMN "project_data"."api_specification" IS 'APISpecification: endpoint contracts (Phase 10)';
COMMENT ON COLUMN "project_data"."infrastructure_spec" IS 'InfrastructureSpec: deployment config (Phase 10)';
COMMENT ON COLUMN "project_data"."coding_guidelines" IS 'CodingGuidelines: code standards (Phase 10)';

-- ============================================================
-- 2. Create user_stories table
-- ============================================================

CREATE TABLE IF NOT EXISTS "user_stories" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "use_case_id" varchar(50),

  -- Story content
  "title" text NOT NULL,
  "description" text NOT NULL,
  "actor" varchar(100) NOT NULL,
  "epic" varchar(100),

  -- Acceptance criteria as JSONB array
  "acceptance_criteria" jsonb NOT NULL DEFAULT '[]'::jsonb,

  -- Tracking
  "status" varchar(20) NOT NULL DEFAULT 'backlog',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "estimated_effort" varchar(20) NOT NULL DEFAULT 'medium',

  -- Ordering for backlog/kanban
  "order" integer NOT NULL DEFAULT 0,

  -- Optional fields
  "assignee" varchar(100),
  "labels" jsonb DEFAULT '[]'::jsonb,
  "blocked_by" jsonb DEFAULT '[]'::jsonb,

  -- Timestamps
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),

  -- Constraints
  CONSTRAINT "user_stories_status_check" CHECK (
    "status" IN ('backlog', 'todo', 'in-progress', 'review', 'done', 'blocked')
  ),
  CONSTRAINT "user_stories_priority_check" CHECK (
    "priority" IN ('critical', 'high', 'medium', 'low')
  ),
  CONSTRAINT "user_stories_effort_check" CHECK (
    "estimated_effort" IN ('xs', 'small', 'medium', 'large', 'xl')
  )
);

-- Create indexes for user_stories
CREATE INDEX IF NOT EXISTS "user_stories_project_id_idx" ON "user_stories" ("project_id");
CREATE INDEX IF NOT EXISTS "user_stories_status_idx" ON "user_stories" ("status");
CREATE INDEX IF NOT EXISTS "user_stories_priority_idx" ON "user_stories" ("priority");
CREATE INDEX IF NOT EXISTS "user_stories_epic_idx" ON "user_stories" ("epic");
CREATE INDEX IF NOT EXISTS "user_stories_order_idx" ON "user_stories" ("project_id", "order");

-- Add comments
COMMENT ON TABLE "user_stories" IS 'User stories derived from use cases with kanban-style tracking';
COMMENT ON COLUMN "user_stories"."use_case_id" IS 'Optional link to originating use case ID';
COMMENT ON COLUMN "user_stories"."description" IS 'Format: As a [actor], I want [goal], so that [benefit]';
COMMENT ON COLUMN "user_stories"."acceptance_criteria" IS 'JSON array of acceptance criteria strings';
COMMENT ON COLUMN "user_stories"."blocked_by" IS 'JSON array of story IDs that block this story';

-- ============================================================
-- 3. Create api_keys table (Phase 11 preparation)
-- ============================================================

CREATE TABLE IF NOT EXISTS "api_keys" (
  "id" serial PRIMARY KEY,
  "project_id" integer NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,

  -- Key info
  "key_hash" text NOT NULL,
  "key_prefix" varchar(8) NOT NULL,
  "name" varchar(100) NOT NULL,

  -- Usage tracking
  "last_used_at" timestamp,
  "usage_count" integer NOT NULL DEFAULT 0,

  -- Expiration and revocation
  "expires_at" timestamp,
  "revoked_at" timestamp,

  -- Scopes as JSONB array
  "scopes" jsonb NOT NULL DEFAULT '["read:prd"]'::jsonb,

  -- Timestamps
  "created_at" timestamp NOT NULL DEFAULT now()
);

-- Create indexes for api_keys
CREATE INDEX IF NOT EXISTS "api_keys_project_id_idx" ON "api_keys" ("project_id");
CREATE UNIQUE INDEX IF NOT EXISTS "api_keys_key_hash_idx" ON "api_keys" ("key_hash");
CREATE INDEX IF NOT EXISTS "api_keys_key_prefix_idx" ON "api_keys" ("key_prefix");

-- Add comments
COMMENT ON TABLE "api_keys" IS 'API keys for MCP server access (Phase 11)';
COMMENT ON COLUMN "api_keys"."key_hash" IS 'SHA-256 hash of the API key (never store plain text)';
COMMENT ON COLUMN "api_keys"."key_prefix" IS 'First 8 characters for identification (e.g., ph_abc12...)';
COMMENT ON COLUMN "api_keys"."scopes" IS 'JSON array of allowed scopes';

-- ============================================================
-- 4. Create updated_at trigger function (if not exists)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to user_stories
DROP TRIGGER IF EXISTS update_user_stories_updated_at ON "user_stories";
CREATE TRIGGER update_user_stories_updated_at
  BEFORE UPDATE ON "user_stories"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to project_data (if not already present)
DROP TRIGGER IF EXISTS update_project_data_updated_at ON "project_data";
CREATE TRIGGER update_project_data_updated_at
  BEFORE UPDATE ON "project_data"
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
