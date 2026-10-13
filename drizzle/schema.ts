import { date, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/** Core user table backing the existing Manus OAuth flow. */
export const userRole = pgEnum("user_role", ["user", "admin"]);
export const orderOrigin = pgEnum("order_origin", ["DTEX", "CLIENTE"]);
export const themeMode = pgEnum("theme_mode", ["light", "dark"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRole("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const embroideryOrders = pgTable("embroidery_orders", {
  id: serial("id").primaryKey(),
  orderDate: date("orderDate", { mode: "string" }).notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  origin: orderOrigin("origin").notNull(),
  quantity: integer("quantity").notNull(),
  amountCents: integer("amountCents").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const siteBranding = pgTable("site_branding", {
  id: integer("id").primaryKey(),
  logoKey: varchar("logoKey", { length: 255 }).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export const siteAppearance = pgTable("site_appearance", {
  id: integer("id").primaryKey(),
  paletteId: varchar("paletteId", { length: 32 }).notNull(),
  themeMode: themeMode("themeMode").default("light").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type EmbroideryOrder = typeof embroideryOrders.$inferSelect;
export type SiteBranding = typeof siteBranding.$inferSelect;
