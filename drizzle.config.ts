import { defineConfig } from "drizzle-kit"

/**
 * Configuração de migrações Drizzle.
 * - Procura o schema em lib/drizzle/schema.ts
 * - Gera arquivos .sql dentro de ./migrations
 */
export default defineConfig({
  schema: "./lib/drizzle/schema.ts",
  out: "./migrations",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
}) 