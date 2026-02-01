CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"key_hash" text NOT NULL,
	"key_prefix" varchar(8) NOT NULL,
	"name" varchar(100) NOT NULL,
	"last_used_at" timestamp,
	"usage_count" integer DEFAULT 0 NOT NULL,
	"expires_at" timestamp,
	"revoked_at" timestamp,
	"scopes" jsonb DEFAULT '["read:prd"]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_stories" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"use_case_id" varchar(50),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"actor" varchar(100) NOT NULL,
	"epic" varchar(100),
	"acceptance_criteria" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(20) DEFAULT 'backlog' NOT NULL,
	"priority" varchar(20) DEFAULT 'medium' NOT NULL,
	"estimated_effort" varchar(20) DEFAULT 'medium' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"assignee" varchar(100),
	"labels" jsonb DEFAULT '[]'::jsonb,
	"blocked_by" jsonb DEFAULT '[]'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "problem_statement" jsonb;--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "database_schema" jsonb;--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "tech_stack" jsonb;--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "api_specification" jsonb;--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "infrastructure_spec" jsonb;--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "coding_guidelines" jsonb;--> statement-breakpoint
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stories" ADD CONSTRAINT "user_stories_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_project_id_idx" ON "api_keys" USING btree ("project_id");--> statement-breakpoint
CREATE UNIQUE INDEX "api_keys_key_hash_idx" ON "api_keys" USING btree ("key_hash");--> statement-breakpoint
CREATE INDEX "api_keys_key_prefix_idx" ON "api_keys" USING btree ("key_prefix");--> statement-breakpoint
CREATE INDEX "user_stories_project_id_idx" ON "user_stories" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "user_stories_status_idx" ON "user_stories" USING btree ("status");--> statement-breakpoint
CREATE INDEX "user_stories_priority_idx" ON "user_stories" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "user_stories_epic_idx" ON "user_stories" USING btree ("epic");--> statement-breakpoint
CREATE INDEX "user_stories_order_idx" ON "user_stories" USING btree ("project_id","order");