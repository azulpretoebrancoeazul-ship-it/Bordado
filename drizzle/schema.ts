import { date, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const embroideryOrders = mysqlTable("embroidery_orders", {
  id: int("id").autoincrement().primaryKey(),
  orderDate: date("orderDate", { mode: "string" }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  origin: mysqlEnum("origin", ["DTEX", "CLIENTE"]).notNull(),
  quantity: int("quantity").notNull(),
  amountCents: int("amountCents").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteBranding = mysqlTable("site_branding", {
  id: int("id").primaryKey(),
  logoKey: varchar("logoKey", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const siteAppearance = mysqlTable("site_appearance", {
  id: int("id").primaryKey(),
  paletteId: varchar("paletteId", { length: 32 }).notNull(),
  themeMode: mysqlEnum("themeMode", ["light", "dark"]).default("light").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type EmbroideryOrder = typeof embroideryOrders.$inferSelect;
export type SiteBranding = typeof siteBranding.$inferSelect;

// TODO: Add your tables here
