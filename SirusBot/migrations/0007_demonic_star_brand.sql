ALTER TABLE "tickets" ADD COLUMN "qr_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "utilizado_por" uuid;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_utilizado_por_perfis_id_fk" FOREIGN KEY ("utilizado_por") REFERENCES "public"."perfis"("id") ON DELETE no action ON UPDATE no action;