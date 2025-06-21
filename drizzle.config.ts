import { defineConfig } from "drizzle-kit"

/**
 * Configuração de migrações Drizzle.
 * - Procura o schema em lib/drizzle/schema.ts
 * - Gera arquivos .sql dentro de ./migrations
 */
export default defineConfig({
  schema: "./lib/drizzle/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
}) 