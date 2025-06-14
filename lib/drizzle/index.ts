import { Pool } from "pg"
import { drizzle } from "drizzle-orm/node-postgres"

/**
 * Conexão Drizzle para o banco Postgres fornecido pela Supabase.
 * É seguro usar apenas no lado do servidor (nunca no navegador)
 * pois requer a string de conexão completa.
 */

const connectionString =
  process.env.SUPABASE_DB_URL || // Fornecida pelo painel Supabase → Settings → Database → Connection string URI
  process.env.POSTGRES_URL ||
  process.env.DATABASE_URL

if (!connectionString) {
  throw new Error(
    "DATABASE_URL (ou POSTGRES_URL) não definida. Crie .env.local com DATABASE_URL=postgres://<usuario>:<senha>@<host>:<porta>/<db>"
  )
}

const finalConn = connectionString.trim()

// Pool com SSL habilitado em produção (required pelo Supabase)
const pool = new Pool({
  connectionString: finalConn,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
})

// Cria instância Drizzle sobre o pool
export const db = drizzle(pool)

export type DbClient = typeof db 