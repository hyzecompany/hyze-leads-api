import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable(
  "leads",
  {
    id: text("id").primaryKey(),
    brand: text("brand").notNull(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    service: text("service"),
    message: text("message"),
    page: text("page"),
    status: text("status", { enum: ["novo", "em-contato", "fechado", "perdido"] })
      .notNull()
      .default("novo"),
    /** Momento do consentimento LGPD (ISO 8601). */
    consentAt: text("consent_at").notNull(),
    country: text("country"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .notNull()
      .default(sql`(unixepoch('subsec') * 1000)`),
  },
  (t) => [index("leads_brand_created_idx").on(t.brand, t.createdAt)],
);

export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
