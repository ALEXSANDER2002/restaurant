import { pgTable, uuid, varchar, text, timestamp, numeric, boolean, uniqueIndex } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const perfis = pgTable(
  "perfis",
  {
    id: uuid("id").primaryKey(),
    nome: text("nome").notNull(),
    email: text("email").notNull(),
    password_hash: text("password_hash").notNull(),
    tipo_usuario: varchar("tipo_usuario", { length: 20 }).default("usuario"),
    status: varchar("status", { length: 20 }).default("ativo"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => {
    return {
      emailUnique: uniqueIndex("perfis_email_unique").on(table.email),
    }
  }
)

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuario_id: uuid("usuario_id").notNull().references(() => perfis.id),
  data: timestamp("data", { withTimezone: true }).notNull(),
  quantidade: numeric("quantidade").notNull(),
  valor_total: numeric("valor_total", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).default("pendente"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  subsidiado: boolean("subsidiado").default(false),
  utilizado: boolean("utilizado").default(false),
  data_utilizacao: timestamp("data_utilizacao", { withTimezone: true }),
})

// Relations (optional for later joins)
export const perfisRelations = relations(perfis, ({ many }) => ({
  tickets: many(tickets),
}))

export const ticketsRelations = relations(tickets, ({ one }) => ({
  usuario: one(perfis, {
    fields: [tickets.usuario_id],
    references: [perfis.id],
  }),
})) 