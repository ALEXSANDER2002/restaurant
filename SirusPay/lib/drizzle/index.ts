import pg from "pg"
const { Pool } = pg
import { drizzle } from "drizzle-orm/node-postgres"

/**
 * Conexão Drizzle para o banco Postgres fornecido pela Supabase.
 * É seguro usar apenas no lado do servidor (nunca no navegador)
 * pois requer a string de conexão completa.
 */

let _db: ReturnType<typeof drizzle> | null = null

function getConnectionString() {
  const connectionString =
    process.env.SUPABASE_DB_URL || // Fornecida pelo painel Supabase → Settings → Database → Connection string URI
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL (ou POSTGRES_URL) não definida. Crie .env.local com DATABASE_URL=postgres://<usuario>:<senha>@<host>:<porta>/<db>"
    )
  }

  return connectionString.trim()
}

function createDb() {
  if (_db) return _db

  const finalConn = getConnectionString()
  
  // Pool com SSL desabilitado para desenvolvimento local
  const pool = new Pool({
    connectionString: finalConn,
    ssl: false, // Forçar SSL desabilitado para desenvolvimento
  })

  // Cria instância Drizzle sobre o pool
  _db = drizzle(pool)
  return _db
}

// Getter lazy para a conexão
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    const dbInstance = createDb()
    return dbInstance[prop as keyof typeof dbInstance]
  }
})

export type DbClient = typeof db 