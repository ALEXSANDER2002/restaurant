CREATE TABLE IF NOT EXISTS "cardapio" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dia_semana" varchar(20) NOT NULL,
	"prato_principal" text NOT NULL,
	"acompanhamentos" text NOT NULL,
	"saladas" text NOT NULL,
	"sobremesa" text NOT NULL,
	"bebida" text NOT NULL,
	"opcao_vegetariana" text NOT NULL,
	"observacoes" text,
	"ativo" boolean DEFAULT true,
	"semana_inicio" timestamp with time zone NOT NULL,
	"semana_fim" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "external_payment_id" varchar(100);