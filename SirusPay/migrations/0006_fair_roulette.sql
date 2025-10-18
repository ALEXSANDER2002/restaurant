ALTER TABLE "cardapio" ALTER COLUMN "bebida" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "campus" varchar(1) DEFAULT '1' NOT NULL;