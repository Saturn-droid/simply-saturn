import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getSmsProviderConfiguration, isE164PhoneNumber, sendTwilioSms, TwilioSmsError } from "./twilioSms";

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

});

export type AppRouter = typeof appRouter;
