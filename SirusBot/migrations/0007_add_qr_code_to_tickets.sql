-- Adicionar campos qr_code e utilizado_por na tabela tickets
ALTER TABLE "tickets" ADD COLUMN "qr_code" text NOT NULL DEFAULT '';
ALTER TABLE "tickets" ADD COLUMN "utilizado_por" uuid;

-- Adicionar foreign key para utilizado_por
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_utilizado_por_perfis_id_fk" FOREIGN KEY ("utilizado_por") REFERENCES "perfis"("id") ON DELETE no action ON UPDATE no action;

-- Gerar QR codes únicos para tickets existentes
UPDATE "tickets" SET "qr_code" = 'TICKET_' || "id" || '_' || EXTRACT(EPOCH FROM NOW()) WHERE "qr_code" = '';

-- Remover o default depois de popular os dados existentes
ALTER TABLE "tickets" ALTER COLUMN "qr_code" DROP DEFAULT; 