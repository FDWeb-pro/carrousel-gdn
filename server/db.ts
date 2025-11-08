import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { carrousels, InsertCarrousel, InsertSlideTypeConfig, InsertUser, slideTypesConfig, users, smtpConfig, InsertSmtpConfig, notifications, InsertNotification, auditLog, InsertAuditLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    // Check if this is a new user (not an update)
    const existingUser = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    const isNewUser = existingUser.length === 0;

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'super_admin';
      updateSet.role = 'super_admin';
      values.status = 'approved';
      updateSet.status = 'approved';
    } else if (isNewUser) {
      // New users start as 'membre' with 'pending' status
      values.role = 'membre';
      values.status = 'pending';
    }

    // Set status for new users if not already set
    if (user.status !== undefined) {
      values.status = user.status;
      updateSet.status = user.status;
    } else if (isNewUser && user.openId !== ENV.ownerOpenId) {
      values.status = 'pending';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });

    // If this is a new user with pending status, notify all admins
    if (isNewUser && values.status === 'pending') {
      const admins = await getAllAdmins();
      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          type: 'user_pending',
          title: 'Nouvelle demande d\'accès',
          message: `${values.name || values.email || 'Un utilisateur'} demande l'accès à l'application`,
          relatedUserId: null, // We don't have the new user ID yet
          isRead: 0,
        });
      }
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User management queries
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateUserRole(userId: number, role: 'membre' | 'admin' | 'super_admin') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function updateUserStatus(userId: number, status: 'pending' | 'approved' | 'rejected') {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ status }).where(eq(users.id, userId));
}

export async function approveUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ status: 'approved' }).where(eq(users.id, userId));
}

export async function rejectUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(users).set({ status: 'rejected' }).where(eq(users.id, userId));
}

export async function getPendingUsers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.status, 'pending')).orderBy(desc(users.createdAt));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(users).where(eq(users.id, userId));
}

// Carrousel queries
export async function createCarrousel(data: InsertCarrousel) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(carrousels).values(data);
  return result;
}

export async function getCarrouselsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(carrousels).where(eq(carrousels.userId, userId)).orderBy(desc(carrousels.createdAt));
}

export async function getAllCarrousels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(carrousels).orderBy(desc(carrousels.createdAt));
}

export async function getCarrouselById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(carrousels).where(eq(carrousels.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteCarrousel(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(carrousels).where(eq(carrousels.id, id));
}

// Slide types configuration queries
export async function getSlideTypesConfig() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(slideTypesConfig).orderBy(slideTypesConfig.typeKey);
}

export async function upsertSlideTypeConfig(data: InsertSlideTypeConfig) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(slideTypesConfig).values(data).onDuplicateKeyUpdate({
    set: {
      label: data.label,
      charLimit: data.charLimit,
      isActive: data.isActive,
    },
  });
}

export async function toggleSlideTypeConfig(typeKey: string, isActive: "true" | "false") {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(slideTypesConfig).set({ isActive }).where(eq(slideTypesConfig.typeKey, typeKey));
}

// SMTP Configuration
export async function getSmtpConfig() {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(smtpConfig).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertSmtpConfig(config: Partial<InsertSmtpConfig>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const existing = await getSmtpConfig();
  if (existing) {
    await db.update(smtpConfig).set(config).where(eq(smtpConfig.id, existing.id));
  } else {
    await db.insert(smtpConfig).values(config as InsertSmtpConfig);
  }
}

// Notifications
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(notifications).values(notification);
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsCount(userId: number) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select().from(notifications).where(
    and(eq(notifications.userId, userId), eq(notifications.isRead, 0))
  );
  return result.length;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
}

export async function markAllNotificationsAsRead(userId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.userId, userId));
}

export async function deleteNotification(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(notifications).where(eq(notifications.id, notificationId));
}

// Audit Log
export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(auditLog).values(log);
}

export async function getAuditLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit);
}

export async function getAuditLogsByUser(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(auditLog).where(eq(auditLog.userId, userId)).orderBy(desc(auditLog.createdAt)).limit(limit);
}

// Helper: Get all admins for notifications
export async function getAllAdmins() {
  const db = await getDb();
  if (!db) return [];
  const allUsers = await db.select().from(users).where(eq(users.status, 'approved'));
  return allUsers.filter(u => u.role === 'admin' || u.role === 'super_admin');
}
