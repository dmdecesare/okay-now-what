CREATE TABLE "account_profiles" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"industry" text NOT NULL,
	"employees" integer,
	"seats" integer NOT NULL,
	"stage" text NOT NULL,
	"stage_start_date" date NOT NULL,
	"pilot_length_days" integer,
	"renewal_date" date,
	"customer_token" text NOT NULL,
	"champion_last_visit_at" timestamp with time zone,
	"deal_notes" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_slug_unique" UNIQUE("slug"),
	CONSTRAINT "accounts_customer_token_unique" UNIQUE("customer_token")
);
--> statement-breakpoint
CREATE TABLE "customer_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"topic" text NOT NULL,
	"asked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generated_materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"content" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "milestones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"due_date" date NOT NULL,
	"status" text DEFAULT 'todo' NOT NULL,
	"completed_at" timestamp with time zone,
	"completed_by" text,
	"sort_order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "spend_months" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"month" date NOT NULL,
	"seat_spend" integer NOT NULL,
	"premium_request_spend" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"date" date NOT NULL,
	"active_seats" integer NOT NULL,
	"teams" jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_profiles" ADD CONSTRAINT "account_profiles_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customer_questions" ADD CONSTRAINT "customer_questions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_materials" ADD CONSTRAINT "generated_materials_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "spend_months" ADD CONSTRAINT "spend_months_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_snapshots" ADD CONSTRAINT "usage_snapshots_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "questions_account_idx" ON "customer_questions" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "materials_account_kind_idx" ON "generated_materials" USING btree ("account_id","kind");--> statement-breakpoint
CREATE INDEX "milestones_account_idx" ON "milestones" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "spend_account_idx" ON "spend_months" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "usage_account_idx" ON "usage_snapshots" USING btree ("account_id");