import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
  role: mysqlEnum("role", ["membre", "admin", "super_admin"]).default("membre").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Carrousels table - stores carousel data created by users
 */
export const carrousels = mysqlTable("carrousels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  titre: text("titre").notNull(),
  thematique: text("thematique").notNull(),
  emailDestination: varchar("emailDestination", { length: 320 }),
  slides: text("slides").notNull(), // JSON string of slides data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Carrousel = typeof carrousels.$inferSelect;
export type InsertCarrousel = typeof carrousels.$inferInsert;

/**
 * Slide types configuration table - allows admins to configure available slide types
 */
export const slideTypesConfig = mysqlTable("slideTypesConfig", {
  id: int("id").autoincrement().primaryKey(),
  typeKey: varchar("typeKey", { length: 50 }).notNull().unique(),
  label: text("label").notNull(),
  charLimit: int("charLimit").notNull(),
  enabled: int("enabled").default(1).notNull(), // 1 = enabled, 0 = disabled
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SlideTypeConfig = typeof slideTypesConfig.$inferSelect;
export type InsertSlideTypeConfig = typeof slideTypesConfig.$inferInsert;