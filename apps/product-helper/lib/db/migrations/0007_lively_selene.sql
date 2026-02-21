ALTER TABLE "api_keys" ALTER COLUMN "key_prefix" SET DATA TYPE varchar(12);--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "last_extracted_message_index" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_type" varchar(30);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "project_stage" varchar(30);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "user_role" varchar(30);--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "budget" varchar(30);--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "credits_used" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "credit_limit" integer DEFAULT 2500 NOT NULL;--> statement-breakpoint
ALTER TABLE "teams" ADD COLUMN "team_member_limit" integer DEFAULT 2 NOT NULL;--> statement-breakpoint
UPDATE "teams" SET "team_member_limit" = CASE
  WHEN "plan_name" = 'Plus' THEN 999999
  WHEN "plan_name" = 'Base' THEN 2
  ELSE 2
END;