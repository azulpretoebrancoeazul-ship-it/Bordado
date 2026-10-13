import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { EmbroideryOrder, InsertUser, embroideryOrders, siteAppearance, siteBranding, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

// Lazily create the Drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, { max: 5, prepare: false });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) throw new Error("Database is not available");

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    for (const field of textFields) {
      const value = user[field];
      if (value !== undefined) {
        const normalized = value ?? null;
        values[field] = normalized;
        updateSet[field] = normalized;
      }
    }
    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEmbroideryOrders() {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  return db.select().from(embroideryOrders).orderBy(desc(embroideryOrders.orderDate), desc(embroideryOrders.id));
}

export async function createEmbroideryOrder(order: Pick<EmbroideryOrder, "orderDate" | "name" | "origin" | "quantity" | "amountCents">) {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  return db.insert(embroideryOrders).values(order);
}

export async function getSiteLogoKey(): Promise<string | null> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  const result = await db.select({ logoKey: siteBranding.logoKey }).from(siteBranding).where(eq(siteBranding.id, 1)).limit(1);
  return result[0]?.logoKey ?? null;
}

export async function setSiteLogoKey(logoKey: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  await db.insert(siteBranding).values({ id: 1, logoKey }).onConflictDoUpdate({ target: siteBranding.id, set: { logoKey, updatedAt: new Date() } });
}

export async function clearSiteLogoKey(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  await db.delete(siteBranding).where(eq(siteBranding.id, 1));
}

export async function getSiteAppearance(): Promise<{ paletteId: string | null; themeMode: "light" | "dark" }> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  const result = await db.select({ paletteId: siteAppearance.paletteId, themeMode: siteAppearance.themeMode }).from(siteAppearance).where(eq(siteAppearance.id, 1)).limit(1);
  return result[0] ?? { paletteId: null, themeMode: "light" };
}

export async function setSiteAppearance(paletteId: string, themeMode: "light" | "dark"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  await db.insert(siteAppearance).values({ id: 1, paletteId, themeMode }).onConflictDoUpdate({ target: siteAppearance.id, set: { paletteId, themeMode, updatedAt: new Date() } });
}

export async function clearSiteAppearance(): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("O banco de dados não está disponível.");
  await db.delete(siteAppearance).where(eq(siteAppearance.id, 1));
}
