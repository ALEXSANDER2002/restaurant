CREATE TABLE "qr_login_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "qr_login_tokens" ADD CONSTRAINT "qr_login_tokens_user_id_perfis_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."perfis"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "qr_login_tokens_token_unique" ON "qr_login_tokens" USING btree ("token");