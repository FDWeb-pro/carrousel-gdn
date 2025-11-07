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
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
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

/**
 * Configuration SMTP pour l'envoi d'emails
 */
export const smtpConfig = mysqlTable("smtp_config", {
  id: int("id").autoincrement().primaryKey(),
  host: varchar("host", { length: 255 }),
  port: int("port"),
  secure: int("secure").default(1),
  user: varchar("user", { length: 255 }),
  pass: varchar("pass", { length: 255 }),
  from: varchar("from", { length: 255 }),
  destinationEmail: varchar("destinationEmail", { length: 320 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SmtpConfig = typeof smtpConfig.$inferSelect;
export type InsertSmtpConfig = typeof smtpConfig.$inferInsert;

/**
 * Notifications pour les administrateurs
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Admin qui doit voir la notification
  type: varchar("type", { length: 50 }).notNull(), // 'user_pending', 'user_approved', etc.
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedUserId: int("relatedUserId"), // ID de l'utilisateur concerné
  isRead: int("isRead").default(0).notNull(), // 0 = non lu, 1 = lu
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Historique d'audit des actions importantes
 */
export const auditLog = mysqlTable("auditLog", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Utilisateur qui a effectué l'action
  userName: varchar("userName", { length: 255 }), // Nom de l'utilisateur (pour historique)
  action: varchar("action", { length: 100 }).notNull(), // 'create_carrousel', 'delete_user', etc.
  entityType: varchar("entityType", { length: 50 }).notNull(), // 'carrousel', 'user', 'slideType', etc.
  entityId: int("entityId"), // ID de l'entité concernée
  details: text("details"), // JSON avec les détails de l'action
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;