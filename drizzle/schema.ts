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
  firstName: varchar("firstName", { length: 100 }),
  lastName: varchar("lastName", { length: 100 }),
  fonction: varchar("fonction", { length: 255 }),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["membre", "admin", "super_admin"]).default("membre").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "blocked"]).default("pending").notNull(),
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
export const slideTypesConfig = mysqlTable("slideTypes", {
  id: int("id").autoincrement().primaryKey(),
  typeKey: varchar("typeKey", { length: 50 }).notNull().unique(),
  label: varchar("label", { length: 255 }).notNull(),
  charLimit: int("charLimit").notNull(),
  isActive: mysqlEnum("isActive", ["true", "false"]).default("true").notNull(),
  imageUrl: text("imageUrl"),
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

/**
 * Configuration IA pour la génération de descriptions d'images
 */
export const aiConfig = mysqlTable("ai_config", {
  id: int("id").autoincrement().primaryKey(),
  provider: mysqlEnum("provider", ["infomaniak", "openai", "mistral", "claude", "gemini"]).default("infomaniak").notNull(),
  
  // Champs communs
  apiToken: varchar("apiToken", { length: 500 }),
  model: varchar("model", { length: 50 }).default("mixtral"),
  maxTokens: int("maxTokens").default(200),
  temperature: int("temperature").default(70), // Stored as integer (0.7 * 100)
  
  // Champs spécifiques Infomaniak
  productId: varchar("productId", { length: 100 }), // Infomaniak uniquement
  
  // Champs spécifiques OpenAI
  organizationId: varchar("organizationId", { length: 100 }), // OpenAI uniquement
  
  // Champs spécifiques Anthropic (Claude)
  anthropicVersion: varchar("anthropicVersion", { length: 50 }), // Claude uniquement
  
  isEnabled: int("isEnabled").default(0).notNull(), // 0 = désactivé, 1 = activé
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AiConfig = typeof aiConfig.$inferSelect;
export type InsertAiConfig = typeof aiConfig.$inferInsert;

/**
 * Thématiques partagées - liste unique de thématiques utilisées dans les carrousels
 */
export const thematiques = mysqlTable("thematiques", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  usageCount: int("usageCount").default(0).notNull(), // Nombre de fois utilisée
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Thematique = typeof thematiques.$inferSelect;
export type InsertThematique = typeof thematiques.$inferInsert;

/**
 * Configuration de marque - paramètres de personnalisation de l'application
 */
export const brandConfig = mysqlTable("brand_config", {
  id: int("id").autoincrement().primaryKey(),
  organizationName: varchar("organizationName", { length: 255 }).notNull(),
  logoUrl: text("logoUrl"), // URL du logo carré stocké dans S3
  description: text("description"), // Description courte (max 250 caractères)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BrandConfig = typeof brandConfig.$inferSelect;
export type InsertBrandConfig = typeof brandConfig.$inferInsert;

/**
 * Configuration des slides - paramètres min/max du nombre de slides
 */
export const slideConfig = mysqlTable("slide_config", {
  id: int("id").autoincrement().primaryKey(),
  minSlides: int("minSlides").default(2).notNull(), // Minimum 2
  maxSlides: int("maxSlides").default(8).notNull(), // Maximum 100
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SlideConfig = typeof slideConfig.$inferSelect;
export type InsertSlideConfig = typeof slideConfig.$inferInsert;

/**
 * Ressources d'aide - fichiers et liens pour la page d'aide
 */
export const helpResources = mysqlTable("help_resources", {
  id: int("id").autoincrement().primaryKey(),
  type: mysqlEnum("type", ["file", "link", "cgu"]).notNull(), // file = fichier téléchargeable, link = lien externe, cgu = lien CGU
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  url: text("url").notNull(), // URL du fichier S3 ou lien externe
  fileKey: text("fileKey"), // Clé S3 pour les fichiers uploadés
  displayOrder: int("displayOrder").default(0).notNull(), // Ordre d'affichage
  isActive: int("isActive").default(1).notNull(), // 0 = masqué, 1 = visible
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HelpResource = typeof helpResources.$inferSelect;
export type InsertHelpResource = typeof helpResources.$inferInsert;
