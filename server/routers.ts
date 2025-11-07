import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { generateExcelBuffer, sendEmail } from "./email";
import { carrousels } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User management routes (admin only)
  users: router({
    list: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).query(async () => {
      return db.getAllUsers();
    }),

    updateRole: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      userId: z.number(),
      role: z.enum(['membre', 'admin', 'super_admin']),
    })).mutation(async ({ input, ctx }) => {
      // Get the target user
      const targetUser = await db.getUserById(input.userId);
      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouvé' });
      }

      // Admins cannot modify super_admin roles
      if (ctx.user.role === 'admin' && targetUser.role === 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Les administrateurs ne peuvent pas modifier le rôle des super administrateurs' });
      }

      // Only super_admin can create other super_admins
      if (input.role === 'super_admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Seuls les super administrateurs peuvent promouvoir des utilisateurs en super administrateur' });
      }

      await db.updateUserRole(input.userId, input.role);
      return { success: true };
    }),

    delete: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      userId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      // Get the target user
      const targetUser = await db.getUserById(input.userId);
      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Utilisateur non trouvé' });
      }

      // Admins cannot delete super_admin
      if (ctx.user.role === 'admin' && targetUser.role === 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Les administrateurs ne peuvent pas supprimer des super administrateurs' });
      }

      // Cannot delete yourself
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Vous ne pouvez pas supprimer votre propre compte' });
      }

      await db.deleteUser(input.userId);
      return { success: true };
    }),

    approve: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      userId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const approvedUser = await db.getUserById(input.userId);
      await db.approveUser(input.userId);
      
      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || 'Unknown',
        action: 'approve_user',
        entityType: 'user',
        entityId: input.userId,
        details: JSON.stringify({ 
          approvedUserName: approvedUser?.name || approvedUser?.email || 'Unknown',
          approvedUserEmail: approvedUser?.email 
        }),
      });
      
      return { success: true };
    }),

    reject: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      userId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const rejectedUser = await db.getUserById(input.userId);
      await db.rejectUser(input.userId);
      
      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || 'Unknown',
        action: 'reject_user',
        entityType: 'user',
        entityId: input.userId,
        details: JSON.stringify({ 
          rejectedUserName: rejectedUser?.name || rejectedUser?.email || 'Unknown',
          rejectedUserEmail: rejectedUser?.email 
        }),
      });
      
      return { success: true };
    }),

    pending: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).query(async () => {
      return db.getPendingUsers();
    }),
  }),

  // Carrousel routes
  carrousels: router({
    create: protectedProcedure.input(z.object({
      titre: z.string(),
      thematique: z.string(),
      emailDestination: z.string().email().optional(),
      slides: z.string(), // JSON string
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createCarrousel({
        ...input,
        userId: ctx.user.id,
      });
      
      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || 'Unknown',
        action: 'create_carrousel',
        entityType: 'carrousel',
        entityId: result[0].insertId,
        details: JSON.stringify({ 
          titre: input.titre,
          thematique: input.thematique 
        }),
      });
      
      return { success: true, id: result[0].insertId };
    }),

    list: protectedProcedure.query(async ({ ctx }) => {
      // Admins can see all carrousels, members only see their own
      if (ctx.user.role === 'admin' || ctx.user.role === 'super_admin') {
        return db.getAllCarrousels();
      }
      return db.getCarrouselsByUser(ctx.user.id);
    }),

    getById: protectedProcedure.input(z.object({
      id: z.number(),
    })).query(async ({ input, ctx }) => {
      const carrousel = await db.getCarrouselById(input.id);
      if (!carrousel) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Carrousel non trouvé' });
      }
      // Check permissions
      if (carrousel.userId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès non autorisé' });
      }
      return carrousel;
    }),

    delete: protectedProcedure.input(z.object({
      id: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const carrousel = await db.getCarrouselById(input.id);
      if (!carrousel) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Carrousel non trouvé' });
      }
      // Check permissions
      if (carrousel.userId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès non autorisé' });
      }
      await db.deleteCarrousel(input.id);
      return { success: true };
    }),

    update: protectedProcedure.input(z.object({
      id: z.number(),
      titre: z.string().optional(),
      thematique: z.string().optional(),
      emailDestination: z.string().email().optional(),
      slides: z.string().optional(),
    })).mutation(async ({ input, ctx }) => {
      const carrousel = await db.getCarrouselById(input.id);
      if (!carrousel) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Carrousel non trouvé' });
      }
      // Check permissions
      if (carrousel.userId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès non autorisé' });
      }
      const db_instance = await db.getDb();
      if (!db_instance) throw new Error('Database not available');
      await db_instance.update(carrousels).set({
        titre: input.titre,
        thematique: input.thematique,
        emailDestination: input.emailDestination,
        slides: input.slides,
      }).where(eq(carrousels.id, input.id));
      return { success: true };
    }),
  }),

  // Slide types configuration (admin only)
  slideTypes: router({
    list: publicProcedure.query(async () => {
      return db.getSlideTypesConfig();
    }),

    upsert: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      typeKey: z.string(),
      label: z.string(),
      charLimit: z.number(),
      enabled: z.number(),
    })).mutation(async ({ input }) => {
      await db.upsertSlideTypeConfig(input);
      return { success: true };
    }),

    toggle: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      typeKey: z.string(),
      enabled: z.number(),
    })).mutation(async ({ input }) => {
      await db.toggleSlideTypeConfig(input.typeKey, input.enabled);
      return { success: true };
    }),

    create: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      typeKey: z.string(),
      label: z.string(),
      charLimit: z.number(),
    })).mutation(async ({ input }) => {
      await db.upsertSlideTypeConfig({
        typeKey: input.typeKey,
        label: input.label,
        charLimit: input.charLimit,
        enabled: 1,
      });
      return { success: true };
    }),

    delete: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      typeKey: z.string(),
    })).mutation(async ({ input }) => {
      const db_instance = await db.getDb();
      if (!db_instance) throw new Error('Database not available');
      const { slideTypesConfig } = await import('../drizzle/schema');
      await db_instance.delete(slideTypesConfig).where(eq(slideTypesConfig.typeKey, input.typeKey));
      return { success: true };
    }),
  }),

  // Email sending route
  email: router({
    sendCarrousel: protectedProcedure.input(z.object({
      carrouselId: z.number(),
      emailTo: z.string().email().optional(),
    })).mutation(async ({ input, ctx }) => {
      const carrousel = await db.getCarrouselById(input.carrouselId);
      if (!carrousel) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Carrousel non trouvé' });
      }
      // Check permissions
      if (carrousel.userId !== ctx.user.id && ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès non autorisé' });
      }

      // Get destination email from SMTP config
      const smtpConfig = await db.getSmtpConfig();
      const destinationEmail = input.emailTo || smtpConfig?.destinationEmail;
      
      if (!destinationEmail) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Aucune adresse email de destination configurée. Veuillez configurer l\'adresse dans les paramètres SMTP.' 
        });
      }

      const slides = JSON.parse(carrousel.slides);
      const excelBuffer = generateExcelBuffer(slides);

      const emailSent = await sendEmail({
        to: destinationEmail,
        subject: `Carrousel GdN - ${carrousel.titre}`,
        text: `Bonjour,\n\nVeuillez trouver ci-joint le fichier Excel du carrousel "${carrousel.titre}".\n\nThématique : ${carrousel.thematique}\n\nCordialement,\nGuichet du Numérique`,
        html: `<p>Bonjour,</p><p>Veuillez trouver ci-joint le fichier Excel du carrousel <strong>${carrousel.titre}</strong>.</p><p>Thématique : ${carrousel.thematique}</p><p>Cordialement,<br>Guichet du Numérique</p>`,
        attachmentBuffer: excelBuffer,
        attachmentFilename: `Carrousel_${carrousel.titre.replace(/[^a-z0-9]/gi, '_')}.xlsx`,
      });

      if (!emailSent) {
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: 'La configuration SMTP n\'est pas disponible. Veuillez contacter l\'administrateur.' 
        });
      }

      return { success: true };
    }),
  }),

  // SMTP Configuration (super_admin only)
  smtp: router({
    get: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Seuls les super administrateurs peuvent accéder à la configuration SMTP' });
      }
      return next({ ctx });
    }).query(async () => {
      return db.getSmtpConfig();
    }),

    update: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Seuls les super administrateurs peuvent modifier la configuration SMTP' });
      }
      return next({ ctx });
    }).input(z.object({
      host: z.string().optional(),
      port: z.number().optional(),
      secure: z.number().optional(),
      user: z.string().optional(),
      pass: z.string().optional(),
      from: z.string().optional(),
      destinationEmail: z.string().email().optional(),
    })).mutation(async ({ input, ctx }) => {
      await db.upsertSmtpConfig(input);
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || 'Unknown',
        action: 'update_smtp_config',
        entityType: 'smtp',
        entityId: null,
        details: JSON.stringify({ message: 'Configuration SMTP mise à jour' }),
      });
      return { success: true };
    }),
  }),

  // Notifications
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotificationsByUser(ctx.user.id);
    }),

    unreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationsCount(ctx.user.id);
    }),

    markAsRead: protectedProcedure.input(z.object({
      notificationId: z.number(),
    })).mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.notificationId);
      return { success: true };
    }),

    markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
      await db.markAllNotificationsAsRead(ctx.user.id);
      return { success: true };
    }),

    delete: protectedProcedure.input(z.object({
      notificationId: z.number(),
    })).mutation(async ({ input }) => {
      await db.deleteNotification(input.notificationId);
      return { success: true };
    }),
  }),

  // Audit Log (admin only)
  audit: router({
    list: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      limit: z.number().optional(),
    })).query(async ({ input }) => {
      return db.getAuditLogs(input.limit || 100);
    }),
  }),
});

export type AppRouter = typeof appRouter;
