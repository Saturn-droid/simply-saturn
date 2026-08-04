import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  SmsConversation,
  SmsMessage,
  smsConversations,
  smsMessages,
  users,
} from "../drizzle/schema";
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
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
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

export async function listSmsConversations(ownerUserId: number): Promise<SmsConversation[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(smsConversations)
    .where(eq(smsConversations.ownerUserId, ownerUserId))
    .orderBy(desc(smsConversations.updatedAt));
}

export async function getSmsConversation(ownerUserId: number, conversationId: number): Promise<SmsConversation | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select()
    .from(smsConversations)
    .where(and(eq(smsConversations.ownerUserId, ownerUserId), eq(smsConversations.id, conversationId)))
    .limit(1);

  return rows[0];
}

export async function listSmsMessages(ownerUserId: number, conversationId: number): Promise<SmsMessage[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(smsMessages)
    .where(and(eq(smsMessages.ownerUserId, ownerUserId), eq(smsMessages.conversationId, conversationId)))
    .orderBy(smsMessages.createdAt);
}

export async function findSmsMessageByClientId(ownerUserId: number, clientMessageId: string): Promise<SmsMessage | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select()
    .from(smsMessages)
    .where(and(eq(smsMessages.ownerUserId, ownerUserId), eq(smsMessages.clientMessageId, clientMessageId)))
    .limit(1);

  return rows[0];
}

export async function findOrCreateSmsConversation(input: {
  ownerUserId: number;
  contactPhone: string;
  contactName?: string;
}): Promise<SmsConversation> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for SMS conversations.");

  const existing = await db
    .select()
    .from(smsConversations)
    .where(and(eq(smsConversations.ownerUserId, input.ownerUserId), eq(smsConversations.contactPhone, input.contactPhone)))
    .limit(1);

  if (existing[0]) return existing[0];

  await db.insert(smsConversations).values({
    ownerUserId: input.ownerUserId,
    contactName: input.contactName?.trim() || null,
    contactPhone: input.contactPhone,
    lastMessageAt: new Date(),
  });

  const created = await db
    .select()
    .from(smsConversations)
    .where(and(eq(smsConversations.ownerUserId, input.ownerUserId), eq(smsConversations.contactPhone, input.contactPhone)))
    .limit(1);

  if (!created[0]) throw new Error("SMS conversation could not be created.");
  return created[0];
}

export async function createOutboundSmsMessage(input: {
  ownerUserId: number;
  conversationId: number;
  body: string;
  clientMessageId: string;
}): Promise<SmsMessage> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for SMS messages.");

  await db.insert(smsMessages).values({
    ownerUserId: input.ownerUserId,
    conversationId: input.conversationId,
    body: input.body,
    direction: "outbound",
    deliveryStatus: "queued",
    clientMessageId: input.clientMessageId,
  });

  const created = await findSmsMessageByClientId(input.ownerUserId, input.clientMessageId);
  if (!created) throw new Error("SMS message could not be created.");
  return created;
}

export async function updateSmsMessageDelivery(input: {
  messageId: number;
  deliveryStatus: "queued" | "sent" | "delivered" | "undelivered" | "failed";
  providerMessageSid?: string;
  errorCode?: string;
  errorMessage?: string;
}): Promise<SmsMessage | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  await db
    .update(smsMessages)
    .set({
      deliveryStatus: input.deliveryStatus,
      providerMessageSid: input.providerMessageSid ?? null,
      errorCode: input.errorCode ?? null,
      errorMessage: input.errorMessage ?? null,
    })
    .where(eq(smsMessages.id, input.messageId));

  const rows = await db.select().from(smsMessages).where(eq(smsMessages.id, input.messageId)).limit(1);
  return rows[0];
}

export async function touchSmsConversation(input: {
  conversationId: number;
  body: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db
    .update(smsConversations)
    .set({
      lastMessagePreview: input.body.slice(0, 512),
      lastMessageAt: new Date(),
    })
    .where(eq(smsConversations.id, input.conversationId));
}
