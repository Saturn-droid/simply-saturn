import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getSmsProviderConfiguration, isE164PhoneNumber, sendTwilioSms, TwilioSmsError } from "./twilioSms";

const calendarParticipantSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("team"),
    displayName: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(320),
    userId: z.number().int().positive(),
  }),
  z.object({
    kind: z.literal("contact"),
    displayName: z.string().trim().min(1).max(160).optional(),
    email: z.string().trim().email().max(320),
  }),
  z.object({
    kind: z.literal("external"),
    displayName: z.string().trim().min(1).max(160).optional(),
    email: z.string().trim().email().max(320),
  }),
]);

const calendarEventPayloadSchema = z.object({
  title: z.string().trim().min(1).max(240),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  location: z.string().trim().max(320).optional(),
  notes: z.string().trim().max(4000).optional(),
  participants: z.array(calendarParticipantSchema).max(50),
});

const contactTypeSchema = z.enum(["buyer", "seller", "investor", "vendor", "agent", "tenant", "landlord", "other"]);
const contactStatusSchema = z.enum(["dead", "expired", "dnc", "prospect", "active", "forever_client", "vendor"]);
const contactPayloadSchema = z.object({
  displayName: z.string().trim().min(1).max(160),
  email: z.string().trim().email().max(320).optional().or(z.literal("")),
  phone: z.string().trim().max(32).optional().or(z.literal("")),
  types: z.array(contactTypeSchema).max(8),
  status: contactStatusSchema.nullable().optional(),
  dealCount: z.number().int().min(0).max(100000),
});

const dealStageSchema = z.enum(["lead", "qualification", "active", "offer", "under_contract", "closed", "lost"]);
const dealPayloadSchema = z.object({
  contactId: z.number().int().positive(),
  title: z.string().trim().min(1).max(240),
  propertyAddress: z.string().trim().max(320).optional(),
  stage: dealStageSchema.default("lead"),
  estimatedValueCents: z.number().int().min(0).max(2_000_000_000).optional(),
  targetCloseAt: z.coerce.date().optional(),
});

const taskPrioritySchema = z.enum(["low", "normal", "high"]);
const taskPayloadSchema = z.object({
  contactId: z.number().int().positive().optional(),
  dealId: z.number().int().positive().optional(),
  title: z.string().trim().min(1).max(240),
  notes: z.string().trim().max(4000).optional(),
  dueAt: z.coerce.date().optional(),
  priority: taskPrioritySchema.default("normal"),
});

const documentTypeSchema = z.enum(["listing", "offer", "disclosure", "contract", "compliance", "other"]);
const documentStatusSchema = z.enum(["requested", "received", "review", "approved", "sent"]);
const documentPayloadSchema = z.object({
  contactId: z.number().int().positive().optional(),
  dealId: z.number().int().positive().optional(),
  name: z.string().trim().min(1).max(240),
  documentType: documentTypeSchema.default("other"),
  status: documentStatusSchema.default("requested"),
  dueAt: z.coerce.date().optional(),
  notes: z.string().trim().max(4000).optional(),
});

async function validateCalendarEventPayload(ownerUserId: number, input: z.infer<typeof calendarEventPayloadSchema>) {
  if (input.endsAt.getTime() <= input.startsAt.getTime()) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "End time must be later than the start time." });
  }
  const teamMembershipChecks = await Promise.all(input.participants
    .filter((participant) => participant.kind === "team")
    .map((participant) => db.isWorkspaceTeamMember({ ownerUserId, memberUserId: participant.userId })));
  if (teamMembershipChecks.some((isMember) => !isMember)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "That team member is not available in this workspace." });
  }
  const normalizedEmails = input.participants.map((participant) => participant.email.toLocaleLowerCase());
  if (new Set(normalizedEmails).size !== normalizedEmails.length) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Each participant can only be added once." });
  }
}

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

  sms: router({
    configuration: protectedProcedure.query(() => getSmsProviderConfiguration()),
    list: protectedProcedure.query(({ ctx }) => db.listSmsConversations(ctx.user.id)),
    thread: protectedProcedure
      .input(z.object({ conversationId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const conversation = await db.getSmsConversation(ctx.user.id, input.conversationId);
        if (!conversation) {
          throw new TRPCError({ code: "NOT_FOUND", message: "That text conversation is unavailable." });
        }

        const messages = await db.listSmsMessages(ctx.user.id, input.conversationId);
        return { conversation, messages };
      }),
    send: protectedProcedure
      .input(
        z.object({
          to: z.string().trim().min(8).max(16),
          contactName: z.string().trim().max(160).optional(),
          contactId: z.number().int().positive().optional(),
          body: z.string().trim().min(1).max(1600),
          clientMessageId: z.string().trim().min(12).max(96),
          confirmLiveSend: z.literal(true),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        if (!isE164PhoneNumber(input.to)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Use an E.164 recipient number, for example +15551234567.",
          });
        }

        const existing = await db.findSmsMessageByClientId(ctx.user.id, input.clientMessageId);
        if (existing) return { message: existing, idempotent: true };

        const configuration = getSmsProviderConfiguration();
        if (!configuration.configured) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "SMS is not configured. Add server-side Twilio credentials and an approved sender first.",
          });
        }

        if (!configuration.dispatchEnabled) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: configuration.restrictionReason || "Custom SMS delivery is temporarily deferred.",
          });
        }

        if (input.contactId) {
          const contact = await db.getCrmContact({ ownerUserId: ctx.user.id, contactId: input.contactId });
          if (!contact) {
            throw new TRPCError({ code: "NOT_FOUND", message: "That contact is unavailable for this text conversation." });
          }
        }

        const conversation = await db.findOrCreateSmsConversation({
          ownerUserId: ctx.user.id,
          contactPhone: input.to,
          contactName: input.contactName,
        });
        const message = await db.createOutboundSmsMessage({
          ownerUserId: ctx.user.id,
          conversationId: conversation.id,
          body: input.body,
          clientMessageId: input.clientMessageId,
        });

        try {
          const providerResult = await sendTwilioSms({ to: input.to, body: input.body });
          const updated = await db.updateSmsMessageDelivery({
            messageId: message.id,
            deliveryStatus: providerResult.status,
            providerMessageSid: providerResult.sid,
            errorCode: providerResult.errorCode,
            errorMessage: providerResult.errorMessage,
          });
          await db.touchSmsConversation({ conversationId: conversation.id, body: input.body });
          if (input.contactId) {
            await db.recordCrmContactActivity({ ownerUserId: ctx.user.id, contactId: input.contactId, channel: "text" });
          }
          return { message: updated ?? message, idempotent: false };
        } catch (error) {
          const providerError = error instanceof TwilioSmsError ? error : null;
          await db.updateSmsMessageDelivery({
            messageId: message.id,
            deliveryStatus: "failed",
            errorCode: providerError?.code,
            errorMessage: providerError?.message || "The provider could not accept the message.",
          });
          throw new TRPCError({
            code: providerError?.statusCode && providerError.statusCode < 500 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
            message: providerError?.message || "The text message could not be sent.",
          });
        }
      }),
  }),

  contacts: router({
    list: protectedProcedure
      .input(z.object({ query: z.string().trim().max(160).optional(), status: contactStatusSchema.optional() }).optional())
      .query(({ ctx, input }) => db.listCrmContacts({ ownerUserId: ctx.user.id, query: input?.query, status: input?.status })),
    get: protectedProcedure
      .input(z.object({ contactId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const contact = await db.getCrmContact({ ownerUserId: ctx.user.id, contactId: input.contactId });
        if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "That contact is unavailable." });
        return contact;
      }),
    create: protectedProcedure
      .input(contactPayloadSchema)
      .mutation(({ ctx, input }) => db.createCrmContact({
        ownerUserId: ctx.user.id,
        displayName: input.displayName,
        email: input.email || undefined,
        phone: input.phone || undefined,
        types: input.types,
        status: input.status ?? null,
        dealCount: input.dealCount,
      })),
    update: protectedProcedure
      .input(contactPayloadSchema.extend({ contactId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const contact = await db.updateCrmContact({
          ownerUserId: ctx.user.id,
          contactId: input.contactId,
          displayName: input.displayName,
          email: input.email || undefined,
          phone: input.phone || undefined,
          types: input.types,
          status: input.status ?? null,
          dealCount: input.dealCount,
        });
        if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "That contact is unavailable." });
        return contact;
      }),
    setStatus: protectedProcedure
      .input(z.object({ contactId: z.number().int().positive(), status: contactStatusSchema.nullable() }))
      .mutation(async ({ ctx, input }) => {
        const contact = await db.setCrmContactStatus({ ownerUserId: ctx.user.id, contactId: input.contactId, status: input.status });
        if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "That contact is unavailable." });
        return contact;
      }),
    recordActivity: protectedProcedure
      .input(z.object({ contactId: z.number().int().positive(), channel: z.enum(["text", "call", "email"]) }))
      .mutation(async ({ ctx, input }) => {
        const contact = await db.recordCrmContactActivity({ ownerUserId: ctx.user.id, contactId: input.contactId, channel: input.channel });
        if (!contact) throw new TRPCError({ code: "NOT_FOUND", message: "That contact is unavailable." });
        return contact;
      }),
  }),

  deals: router({
    list: protectedProcedure.query(({ ctx }) => db.listCrmDeals(ctx.user.id)),
    create: protectedProcedure
      .input(dealPayloadSchema)
      .mutation(async ({ ctx, input }) => {
        const deal = await db.createCrmDeal({ ownerUserId: ctx.user.id, ...input });
        if (!deal) throw new TRPCError({ code: "NOT_FOUND", message: "Choose a contact that belongs to this workspace." });
        return deal;
      }),
    updateStage: protectedProcedure
      .input(z.object({ dealId: z.number().int().positive(), stage: dealStageSchema }))
      .mutation(async ({ ctx, input }) => {
        const deal = await db.updateCrmDealStage({ ownerUserId: ctx.user.id, ...input });
        if (!deal) throw new TRPCError({ code: "NOT_FOUND", message: "That deal is unavailable." });
        return deal;
      }),
  }),

  tasks: router({
    list: protectedProcedure.query(({ ctx }) => db.listCrmTasks(ctx.user.id)),
    create: protectedProcedure
      .input(taskPayloadSchema)
      .mutation(async ({ ctx, input }) => {
        const task = await db.createCrmTask({ ownerUserId: ctx.user.id, ...input });
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Choose a contact or deal that belongs to this workspace." });
        return task;
      }),
    setStatus: protectedProcedure
      .input(z.object({ taskId: z.number().int().positive(), status: z.enum(["open", "completed"]) }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.setCrmTaskStatus({ ownerUserId: ctx.user.id, ...input });
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "That task is unavailable." });
        return task;
      }),
  }),

  documents: router({
    list: protectedProcedure.query(({ ctx }) => db.listCrmDocuments(ctx.user.id)),
    create: protectedProcedure
      .input(documentPayloadSchema)
      .mutation(async ({ ctx, input }) => {
        const document = await db.createCrmDocument({ ownerUserId: ctx.user.id, ...input });
        if (!document) throw new TRPCError({ code: "NOT_FOUND", message: "Choose a contact or deal that belongs to this workspace." });
        return document;
      }),
    setStatus: protectedProcedure
      .input(z.object({ documentId: z.number().int().positive(), status: documentStatusSchema }))
      .mutation(async ({ ctx, input }) => {
        const document = await db.setCrmDocumentStatus({ ownerUserId: ctx.user.id, ...input });
        if (!document) throw new TRPCError({ code: "NOT_FOUND", message: "That document is unavailable." });
        return document;
      }),
  }),

  team: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const workspaceOwnerId = await db.resolveWorkspaceOwnerUserId(ctx.user.id);
      return db.listWorkspaceTeamMembers(workspaceOwnerId);
    }),
    updateMyPhone: protectedProcedure
      .input(z.object({ phone: z.string().trim().min(7).max(32).nullable() }))
      .mutation(async ({ ctx, input }) => {
        const member = await db.updateWorkspaceMemberPhone({ memberUserId: ctx.user.id, phone: input.phone || null });
        if (!member) throw new TRPCError({ code: "NOT_FOUND", message: "Your workspace member record is unavailable." });
        return member;
      }),
    enroll: adminProcedure
      .input(z.object({ email: z.string().trim().email().max(320) }))
      .mutation(async ({ ctx, input }) => {
        const member = await db.addWorkspaceTeamMemberByEmail({
          ownerUserId: ctx.user.id,
          email: input.email,
        });
        if (!member) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "That person needs to sign in to Simply Saturn before they can be enrolled on this team.",
          });
        }
        return member;
      }),
    remove: adminProcedure
      .input(z.object({ memberUserId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const removed = await db.removeWorkspaceTeamMember({ ownerUserId: ctx.user.id, memberUserId: input.memberUserId });
        if (!removed) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "The workspace owner cannot be removed from the team directory." });
        }
        return { success: true } as const;
      }),
  }),

  calendar: router({
    list: protectedProcedure.query(({ ctx }) => db.listCalendarEvents(ctx.user.id)),
    teamDirectory: protectedProcedure.query(({ ctx }) => db.listWorkspaceTeamMembers(ctx.user.id)),
    addTeamMember: protectedProcedure
      .input(z.object({ email: z.string().trim().email().max(320) }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Only workspace leaders can add team members." });
        }
        const member = await db.addWorkspaceTeamMemberByEmail({
          ownerUserId: ctx.user.id,
          email: input.email,
        });
        if (!member) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "That person needs to sign in to Simply Saturn before they can be added to this team directory.",
          });
        }
        return member;
      }),
    participantSuggestions: protectedProcedure
      .input(z.object({ query: z.string().trim().max(160) }))
      .query(({ ctx, input }) => db.listCalendarParticipantSuggestions({ ownerUserId: ctx.user.id, query: input.query })),
    create: protectedProcedure
      .input(calendarEventPayloadSchema.extend({ clientEventId: z.string().trim().min(12).max(96) }))
      .mutation(async ({ ctx, input }) => {
        await validateCalendarEventPayload(ctx.user.id, input);
        return db.createCalendarEvent({
          ownerUserId: ctx.user.id,
          clientEventId: input.clientEventId,
          title: input.title,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          location: input.location,
          notes: input.notes,
          participants: input.participants,
        });
      }),
    update: protectedProcedure
      .input(calendarEventPayloadSchema.extend({ eventId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        await validateCalendarEventPayload(ctx.user.id, input);
        const updated = await db.updateCalendarEvent({
          ownerUserId: ctx.user.id,
          eventId: input.eventId,
          title: input.title,
          startsAt: input.startsAt,
          endsAt: input.endsAt,
          location: input.location,
          notes: input.notes,
          participants: input.participants,
        });
        if (!updated) {
          throw new TRPCError({ code: "NOT_FOUND", message: "That calendar event is unavailable." });
        }
        return updated;
      }),
  }),

});

export type AppRouter = typeof appRouter;
