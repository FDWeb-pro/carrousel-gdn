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
    updateProfile: protectedProcedure.input(z.object({
      firstName: z.string(),
      lastName: z.string(),
      fonction: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      await db.updateUserProfile(ctx.user.id, input);
      return { success: true };
    }),

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

    block: protectedProcedure.use(({ ctx, next }) => {
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

      // Admins cannot block super_admin
      if (ctx.user.role === 'admin' && targetUser.role === 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Les administrateurs ne peuvent pas bloquer des super administrateurs' });
      }

      // Cannot block yourself
      if (input.userId === ctx.user.id) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Vous ne pouvez pas bloquer votre propre compte' });
      }

      await db.blockUser(input.userId);
      
      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || 'Unknown',
        action: 'block_user',
        entityType: 'user',
        entityId: input.userId,
        details: JSON.stringify({ 
          blockedUserName: targetUser.name || targetUser.email || 'Unknown',
          blockedUserEmail: targetUser.email 
        }),
      });
      
      return { success: true };
    }),

    unblock: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      userId: z.number(),
    })).mutation(async ({ input, ctx }) => {
      const targetUser = await db.getUserById(input.userId);
      await db.unblockUser(input.userId);
      
      // Create audit log
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || ctx.user.email || 'Unknown',
        action: 'unblock_user',
        entityType: 'user',
        entityId: input.userId,
        details: JSON.stringify({ 
          unblockedUserName: targetUser?.name || targetUser?.email || 'Unknown',
          unblockedUserEmail: targetUser?.email 
        }),
      });
      
      return { success: true };
    }),
  }),

  // Carrousel routes
  carrousels: router({
    create: protectedProcedure.input(z.object({
      titre: z.string(),
      thematique: z.string(),
      emailDestination: z.string().email().optional(),
      slides: z.string(), // JSON string
    })).mutation(async ({ ctx, input }) => {
      // Ajouter ou mettre à jour la thématique
      await db.upsertThematique(input.thematique);
      
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
      isActive: z.enum(["true", "false"]),
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
      isActive: z.enum(["true", "false"]),
    })).mutation(async ({ input }) => {
      await db.toggleSlideTypeConfig(input.typeKey, input.isActive);
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
        isActive: "true",
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

    updateImage: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Seuls les super administrateurs peuvent modifier les images' });
      }
      return next({ ctx });
    }).input(z.object({
      typeKey: z.string(),
      imageData: z.string(), // base64 encoded image
      fileName: z.string(),
    })).mutation(async ({ input }) => {
      // Upload image to S3
      const { storagePut } = await import('./storage');
      
      // Extract base64 data and convert to buffer
      const base64Data = input.imageData.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determine content type from file extension
      const ext = input.fileName.split('.').pop()?.toLowerCase();
      const contentType = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
      
      // Generate unique file key
      const fileKey = `slide-images/${input.typeKey}-${Date.now()}.${ext}`;
      
      // Upload to S3
      const { url } = await storagePut(fileKey, buffer, contentType);
      
      // Update database
      await db.updateSlideTypeImage(input.typeKey, url);
      
      return { success: true, imageUrl: url };
    }),
  }),

  // Email sending route
  email: router({
    getLogs: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'super_admin' && ctx.user.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Accès réservé aux administrateurs' });
      }
      const { getEmailLogs } = await import('./emailLogger');
      return getEmailLogs();
    }),

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

      try {
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
      } catch (emailError: any) {
        console.error('[sendCarrousel] Email error:', emailError);
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: `Erreur d'envoi d'email: ${emailError.message || 'Erreur inconnue'}` 
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

    clear: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).mutation(async ({ ctx }) => {
      await db.clearAuditLogs();
      // Log this action
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Utilisateur inconnu',
        action: 'clear_audit_log',
        entityType: 'audit',
        entityId: null,
        details: JSON.stringify({ clearedBy: ctx.user.name }),
      });
      return { success: true };
    }),
  }),

  // Thematiques
  thematiques: router({
    list: publicProcedure.query(async () => {
      return db.getAllThematiques();
    }),

    search: publicProcedure.input(z.object({
      searchTerm: z.string()
    })).query(async ({ input }) => {
      return db.searchThematiques(input.searchTerm);
    }),
  }),

  // AI Configuration (super_admin only)
  ai: router({
    getConfig: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).query(async () => {
      return db.getAiConfig();
    }),

    updateConfig: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      provider: z.enum(["infomaniak", "openai", "mistral", "claude", "gemini"]).optional(),
      apiToken: z.string().optional(),
      productId: z.string().optional(),
      organizationId: z.string().optional(),
      anthropicVersion: z.string().optional(),
      model: z.string().optional(),
      maxTokens: z.number().optional(),
      temperature: z.number().optional(),
      isEnabled: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      await db.upsertAiConfig(input);
      
      // Log this action
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Utilisateur inconnu',
        action: 'update_ai_config',
        entityType: 'ai_config',
        entityId: null,
        details: JSON.stringify({ updatedFields: Object.keys(input) }),
      });
      
      return { success: true };
    }),

    generateImageDescription: protectedProcedure.input(z.object({
      textContent: z.string(),
    })).mutation(async ({ input }) => {
      const config = await db.getAiConfig();
      
      if (!config || !config.isEnabled || !config.apiToken) {
        throw new TRPCError({ 
          code: 'PRECONDITION_FAILED', 
          message: 'La configuration IA n\'est pas activée ou incomplète' 
        });
      }

      const systemPrompt = 'Tu es un expert en génération de prompts pour créer des images. Tu dois créer des descriptions détaillées et visuelles pour un générateur d\'images IA, basées sur le contenu textuel fourni. Réponds uniquement avec la description de l\'image, sans introduction ni explication.';
      const userPrompt = `Crée une description détaillée d'image (prompt) pour illustrer visuellement ce contenu de slide : "${input.textContent}"`;
      const temperature = (config.temperature || 70) / 100;
      const maxTokens = config.maxTokens || 200;

      try {
        let description: string | undefined;

        // Infomaniak
        if (config.provider === 'infomaniak') {
          if (!config.productId) {
            throw new Error('Product ID manquant pour Infomaniak');
          }
          const response = await fetch(
            `https://api.infomaniak.com/1/ai/${config.productId}/openai/chat/completions`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                model: config.model || 'mixtral',
                max_tokens: maxTokens,
                temperature,
                profile_type: 'creative'
              }),
            }
          );
          if (!response.ok) throw new Error(`Infomaniak API error: ${response.status}`);
          const data = await response.json();
          description = data.choices?.[0]?.message?.content;
        }

        // OpenAI
        else if (config.provider === 'openai') {
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${config.apiToken}`,
            'Content-Type': 'application/json',
          };
          if (config.organizationId) {
            headers['OpenAI-Organization'] = config.organizationId;
          }
          const response = await fetch(
            'https://api.openai.com/v1/chat/completions',
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                model: config.model || 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature,
              }),
            }
          );
          if (!response.ok) throw new Error(`OpenAI API error: ${response.status}`);
          const data = await response.json();
          description = data.choices?.[0]?.message?.content;
        }

        // Mistral AI
        else if (config.provider === 'mistral') {
          const response = await fetch(
            'https://api.mistral.ai/v1/chat/completions',
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${config.apiToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: config.model || 'mistral-small-latest',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userPrompt }
                ],
                max_tokens: maxTokens,
                temperature,
              }),
            }
          );
          if (!response.ok) throw new Error(`Mistral API error: ${response.status}`);
          const data = await response.json();
          description = data.choices?.[0]?.message?.content;
        }

        // Claude (Anthropic)
        else if (config.provider === 'claude') {
          const response = await fetch(
            'https://api.anthropic.com/v1/messages',
            {
              method: 'POST',
              headers: {
                'x-api-key': config.apiToken,
                'anthropic-version': config.anthropicVersion || '2023-06-01',
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                model: config.model || 'claude-3-5-haiku-20241022',
                max_tokens: maxTokens,
                temperature,
                system: systemPrompt,
                messages: [
                  { role: 'user', content: userPrompt }
                ],
              }),
            }
          );
          if (!response.ok) throw new Error(`Claude API error: ${response.status}`);
          const data = await response.json();
          description = data.content?.[0]?.text;
        }

        // Gemini (Google)
        else if (config.provider === 'gemini') {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${config.model || 'gemini-2.0-flash-exp'}:generateContent?key=${config.apiToken}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{
                    text: `${systemPrompt}\n\n${userPrompt}`
                  }]
                }],
                generationConfig: {
                  temperature,
                  maxOutputTokens: maxTokens,
                }
              }),
            }
          );
          if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
          const data = await response.json();
          description = data.candidates?.[0]?.content?.parts?.[0]?.text;
        }

        if (!description) {
          throw new Error('No description generated');
        }

        return { description };
      } catch (error: any) {
        console.error(`Error calling ${config.provider} API:`, error);
        throw new TRPCError({ 
          code: 'INTERNAL_SERVER_ERROR', 
          message: `Erreur lors de la génération: ${error.message}` 
        });
      }
    }),
  }),

  // Brand configuration routes (admin/super_admin only)
  brand: router({
    getConfig: publicProcedure.query(async () => {
      const config = await db.getBrandConfig();
      return config || { organizationName: 'Générateur de Carrousels', logoUrl: null, description: null };
    }),

    updateConfig: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      organizationName: z.string().min(1).max(255),
      logoUrl: z.string().optional(),
      description: z.string().max(250).optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.upsertBrandConfig(input);
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unknown',
        action: 'update_brand_config',
        entityType: 'brand_config',
        entityId: result?.id,
        details: JSON.stringify(input),
      });
      return result;
    }),

    uploadLogo: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64
      mimeType: z.string(),
    })).mutation(async ({ input }) => {
      const { storagePut } = await import('./storage');
      const buffer = Buffer.from(input.fileData, 'base64');
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const fileKey = `brand-logos/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      return { url, fileKey };
    }),
  }),

  // Slide configuration routes (admin/super_admin only)
  slideConfigRouter: router({
    getConfig: publicProcedure.query(async () => {
      const config = await db.getSlideConfig();
      return config || { minSlides: 2, maxSlides: 8 };
    }),

    updateConfig: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      minSlides: z.number().min(2).max(100),
      maxSlides: z.number().min(2).max(100),
    })).mutation(async ({ input, ctx }) => {
      if (input.minSlides > input.maxSlides) {
        throw new TRPCError({ 
          code: 'BAD_REQUEST', 
          message: 'Le minimum ne peut pas être supérieur au maximum' 
        });
      }
      const result = await db.upsertSlideConfig(input);
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unknown',
        action: 'update_slide_config',
        entityType: 'slide_config',
        entityId: result?.id,
        details: JSON.stringify(input),
      });
      return result;
    }),
  }),

  // Help resources routes
  help: router({
    list: publicProcedure.query(async () => {
      return db.getAllHelpResources();
    }),

    listAdmin: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).query(async () => {
      return db.getAllHelpResourcesAdmin();
    }),

    create: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      type: z.enum(['file', 'link', 'cgu']),
      title: z.string().min(1).max(255),
      description: z.string().optional(),
      url: z.string(),
      fileKey: z.string().optional(),
      displayOrder: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      const result = await db.createHelpResource(input);
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unknown',
        action: 'create_help_resource',
        entityType: 'help_resource',
        entityId: result[0]?.id,
        details: JSON.stringify(input),
      });
      return result[0];
    }),

    update: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      id: z.number(),
      type: z.enum(['file', 'link', 'cgu']).optional(),
      title: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      url: z.string().optional(),
      fileKey: z.string().optional(),
      displayOrder: z.number().optional(),
      isActive: z.number().optional(),
    })).mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const result = await db.updateHelpResource(id, data);
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unknown',
        action: 'update_help_resource',
        entityType: 'help_resource',
        entityId: id,
        details: JSON.stringify(data),
      });
      return result;
    }),

    delete: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      id: z.number(),
    })).mutation(async ({ input, ctx }) => {
      await db.deleteHelpResource(input.id);
      await db.createAuditLog({
        userId: ctx.user.id,
        userName: ctx.user.name || 'Unknown',
        action: 'delete_help_resource',
        entityType: 'help_resource',
        entityId: input.id,
      });
      return { success: true };
    }),

    uploadFile: protectedProcedure.use(({ ctx, next }) => {
      if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return next({ ctx });
    }).input(z.object({
      fileName: z.string(),
      fileData: z.string(), // base64
      mimeType: z.string(),
    })).mutation(async ({ input }) => {
      const { storagePut } = await import('./storage');
      const buffer = Buffer.from(input.fileData, 'base64');
      const randomSuffix = Math.random().toString(36).substring(2, 15);
      const fileKey = `help-files/${randomSuffix}-${input.fileName}`;
      const { url } = await storagePut(fileKey, buffer, input.mimeType);
      return { url, fileKey };
    }),
  }),
});

export type AppRouter = typeof appRouter;
