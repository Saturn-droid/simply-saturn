import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
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
