CREATE TABLE IF NOT EXISTS "perfis" (
	"id" uuid PRIMARY KEY NOT NULL,
	"nome" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"tipo_usuario" varchar(20) DEFAULT 'usuario',
	"status" varchar(20) DEFAULT 'ativo',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"data" timestamp with time zone NOT NULL,
	"quantidade" numeric NOT NULL,
	"valor_total" numeric(10, 2) NOT NULL,
	"status" varchar(20) DEFAULT 'pendente',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"subsidiado" boolean DEFAULT false,
	"utilizado" boolean DEFAULT false,
	"data_utilizacao" timestamp with time zone
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tickets" ADD CONSTRAINT "tickets_usuario_id_perfis_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "perfis"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
