CREATE TABLE "business_reviews" (
	"account_id" uuid PRIMARY KEY NOT NULL,
	"content" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"source" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "learning_completions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"name_key" text NOT NULL,
	"role" text NOT NULL,
	"challenge_id" text NOT NULL,
	"source" text DEFAULT 'live' NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "business_reviews" ADD CONSTRAINT "business_reviews_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_completions" ADD CONSTRAINT "learning_completions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "learning_unique_idx" ON "learning_completions" USING btree ("account_id","name_key","challenge_id");--> statement-breakpoint
CREATE INDEX "learning_account_idx" ON "learning_completions" USING btree ("account_id");