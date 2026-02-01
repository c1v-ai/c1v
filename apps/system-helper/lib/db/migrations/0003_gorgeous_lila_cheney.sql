CREATE TABLE "graph_checkpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"thread_id" text NOT NULL,
	"checkpoint_ns" text DEFAULT '',
	"checkpoint_id" text NOT NULL,
	"parent_checkpoint_id" text,
	"channel_values" jsonb NOT NULL,
	"channel_versions" jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "graph_checkpoints_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "project_data" ADD COLUMN "intake_state" jsonb;--> statement-breakpoint
ALTER TABLE "graph_checkpoints" ADD CONSTRAINT "graph_checkpoints_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "graph_checkpoints_project_idx" ON "graph_checkpoints" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "graph_checkpoints_thread_idx" ON "graph_checkpoints" USING btree ("project_id","thread_id");--> statement-breakpoint
CREATE UNIQUE INDEX "graph_checkpoints_unique" ON "graph_checkpoints" USING btree ("project_id","thread_id","checkpoint_ns","checkpoint_id");