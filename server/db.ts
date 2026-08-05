import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  CalendarContact,
  CalendarEvent,
  CalendarEventParticipant,
  CrmContact,
  InsertUser,
  calendarContacts,
  calendarEventParticipants,
  calendarEvents,
  contactActivities,
  crmContacts,
  crmCampaigns,
  crmDeals,
  crmDocuments,
  crmTasks,
  workspaceTeamMembers,
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

    const textFields = ["name", "email", "phone", "loginMethod"] as const;
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

export const contactStatusValues = ["dead", "expired", "dnc", "prospect", "active", "forever_client", "vendor"] as const;
export type ContactStatusValue = (typeof contactStatusValues)[number];
export const contactTypeValues = ["buyer", "seller", "investor", "vendor", "agent", "tenant", "landlord", "other"] as const;
export type ContactTypeValue = (typeof contactTypeValues)[number];
export type ContactActivityChannel = "text" | "call" | "email";
export const dealStageValues = ["lead", "qualification", "active", "offer", "under_contract", "closed", "lost"] as const;
export type DealStageValue = (typeof dealStageValues)[number];
export const taskPriorityValues = ["low", "normal", "high"] as const;
export type TaskPriorityValue = (typeof taskPriorityValues)[number];
export type TaskStatusValue = "open" | "completed";
export const documentTypeValues = ["listing", "offer", "disclosure", "contract", "compliance", "other"] as const;
export type DocumentTypeValue = (typeof documentTypeValues)[number];
export const documentStatusValues = ["requested", "received", "review", "approved", "sent"] as const;
export type DocumentStatusValue = (typeof documentStatusValues)[number];
export const campaignChannelValues = ["email", "text", "mixed"] as const;
export type CampaignChannelValue = (typeof campaignChannelValues)[number];
export const campaignAudienceValues = ["all_contacts", "prospect", "active", "forever_client", "vendor"] as const;
export type CampaignAudienceValue = (typeof campaignAudienceValues)[number];
export const campaignStatusValues = ["draft", "scheduled", "paused", "completed"] as const;
export type CampaignStatusValue = (typeof campaignStatusValues)[number];

function parseContactTypes(typesJson: string): ContactTypeValue[] {
  try {
    const values = JSON.parse(typesJson);
    if (!Array.isArray(values)) return [];
    return values.filter((value): value is ContactTypeValue => typeof value === "string" && contactTypeValues.includes(value as ContactTypeValue));
  } catch {
    return [];
  }
}

function normalizeContact(contact: CrmContact) {
  return { ...contact, types: parseContactTypes(contact.typesJson) };
}

export async function listCrmContacts(input: { ownerUserId: number; query?: string; status?: ContactStatusValue }) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select()
    .from(crmContacts)
    .where(eq(crmContacts.ownerUserId, input.ownerUserId))
    .orderBy(asc(crmContacts.displayName));
  const normalized = rows.map(normalizeContact);
  const query = input.query?.trim().toLocaleLowerCase();

  return normalized.filter((contact) => {
    if (input.status && contact.status !== input.status) return false;
    if (!query) return true;
    return [contact.displayName, contact.email, contact.phone, ...contact.types]
      .filter(Boolean)
      .some((value) => String(value).toLocaleLowerCase().includes(query));
  });
}

export async function getCrmContact(input: { ownerUserId: number; contactId: number }) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select()
    .from(crmContacts)
    .where(and(eq(crmContacts.ownerUserId, input.ownerUserId), eq(crmContacts.id, input.contactId)))
    .limit(1);
  return rows[0] ? normalizeContact(rows[0]) : undefined;
}

export async function createCrmContact(input: {
  ownerUserId: number;
  displayName: string;
  email?: string;
  phone?: string;
  types: ContactTypeValue[];
  status?: ContactStatusValue | null;
  dealCount?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for contacts.");

  const [created] = await db.insert(crmContacts).values({
    ownerUserId: input.ownerUserId,
    displayName: input.displayName,
    email: input.email || null,
    phone: input.phone || null,
    typesJson: JSON.stringify(Array.from(new Set(input.types))),
    status: input.status ?? null,
    dealCount: input.dealCount ?? 0,
  }).$returningId();
  const contact = await getCrmContact({ ownerUserId: input.ownerUserId, contactId: created.id });
  if (!contact) throw new Error("Contact was created but could not be loaded.");
  return contact;
}

export async function updateCrmContact(input: {
  ownerUserId: number;
  contactId: number;
  displayName: string;
  email?: string;
  phone?: string;
  types: ContactTypeValue[];
  status?: ContactStatusValue | null;
  dealCount: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for contacts.");

  await db
    .update(crmContacts)
    .set({
      displayName: input.displayName,
      email: input.email || null,
      phone: input.phone || null,
      typesJson: JSON.stringify(Array.from(new Set(input.types))),
      status: input.status ?? null,
      dealCount: input.dealCount,
    })
    .where(and(eq(crmContacts.ownerUserId, input.ownerUserId), eq(crmContacts.id, input.contactId)));
  return getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId });
}

export async function setCrmContactStatus(input: { ownerUserId: number; contactId: number; status: ContactStatusValue | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for contacts.");

  await db
    .update(crmContacts)
    .set({ status: input.status })
    .where(and(eq(crmContacts.ownerUserId, input.ownerUserId), eq(crmContacts.id, input.contactId)));
  return getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId });
}

export async function recordCrmContactActivity(input: {
  ownerUserId: number;
  contactId: number;
  channel: ContactActivityChannel;
  occurredAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for contacts.");
  const contact = await getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId });
  if (!contact) return undefined;

  const occurredAt = input.occurredAt ?? new Date();
  await db.insert(contactActivities).values({
    ownerUserId: input.ownerUserId,
    contactId: input.contactId,
    channel: input.channel,
    occurredAt,
  });

  const summaryField = input.channel === "text" ? { lastTextAt: occurredAt } : input.channel === "call" ? { lastCallAt: occurredAt } : { lastEmailAt: occurredAt };
  await db
    .update(crmContacts)
    .set(summaryField)
    .where(and(eq(crmContacts.ownerUserId, input.ownerUserId), eq(crmContacts.id, input.contactId)));
  return getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId });
}

async function refreshCrmContactDealCount(ownerUserId: number, contactId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const result = await db
    .select({ total: count() })
    .from(crmDeals)
    .where(and(eq(crmDeals.ownerUserId, ownerUserId), eq(crmDeals.contactId, contactId)));
  await db
    .update(crmContacts)
    .set({ dealCount: Number(result[0]?.total ?? 0) })
    .where(and(eq(crmContacts.ownerUserId, ownerUserId), eq(crmContacts.id, contactId)));
}

export type CrmDealWithContact = {
  id: number;
  ownerUserId: number;
  contactId: number;
  contactName: string;
  contactEmail: string | null;
  title: string;
  propertyAddress: string | null;
  stage: DealStageValue;
  estimatedValueCents: number;
  targetCloseAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listCrmDeals(ownerUserId: number): Promise<CrmDealWithContact[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: crmDeals.id,
      ownerUserId: crmDeals.ownerUserId,
      contactId: crmDeals.contactId,
      contactName: crmContacts.displayName,
      contactEmail: crmContacts.email,
      title: crmDeals.title,
      propertyAddress: crmDeals.propertyAddress,
      stage: crmDeals.stage,
      estimatedValueCents: crmDeals.estimatedValueCents,
      targetCloseAt: crmDeals.targetCloseAt,
      createdAt: crmDeals.createdAt,
      updatedAt: crmDeals.updatedAt,
    })
    .from(crmDeals)
    .innerJoin(crmContacts, eq(crmDeals.contactId, crmContacts.id))
    .where(and(eq(crmDeals.ownerUserId, ownerUserId), eq(crmContacts.ownerUserId, ownerUserId)))
    .orderBy(desc(crmDeals.updatedAt));
}

export async function createCrmDeal(input: {
  ownerUserId: number;
  contactId: number;
  title: string;
  propertyAddress?: string;
  stage: DealStageValue;
  estimatedValueCents?: number;
  targetCloseAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for deals.");
  const contact = await getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId });
  if (!contact) return undefined;
  const [created] = await db.insert(crmDeals).values({
    ownerUserId: input.ownerUserId,
    contactId: input.contactId,
    title: input.title,
    propertyAddress: input.propertyAddress || null,
    stage: input.stage,
    estimatedValueCents: input.estimatedValueCents ?? 0,
    targetCloseAt: input.targetCloseAt ?? null,
  }).$returningId();
  await refreshCrmContactDealCount(input.ownerUserId, input.contactId);
  const deals = await listCrmDeals(input.ownerUserId);
  return deals.find((deal) => deal.id === created.id);
}

export async function updateCrmDealStage(input: { ownerUserId: number; dealId: number; stage: DealStageValue }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for deals.");
  const result = await db
    .update(crmDeals)
    .set({ stage: input.stage })
    .where(and(eq(crmDeals.ownerUserId, input.ownerUserId), eq(crmDeals.id, input.dealId)));
  if (!result[0]?.affectedRows) return undefined;
  const deals = await listCrmDeals(input.ownerUserId);
  return deals.find((deal) => deal.id === input.dealId);
}

export type CrmTaskWithContext = {
  id: number;
  ownerUserId: number;
  contactId: number | null;
  contactName: string | null;
  dealId: number | null;
  dealTitle: string | null;
  title: string;
  notes: string | null;
  dueAt: Date | null;
  priority: TaskPriorityValue;
  status: TaskStatusValue;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listCrmTasks(ownerUserId: number): Promise<CrmTaskWithContext[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: crmTasks.id,
      ownerUserId: crmTasks.ownerUserId,
      contactId: crmTasks.contactId,
      contactName: crmContacts.displayName,
      dealId: crmTasks.dealId,
      dealTitle: crmDeals.title,
      title: crmTasks.title,
      notes: crmTasks.notes,
      dueAt: crmTasks.dueAt,
      priority: crmTasks.priority,
      status: crmTasks.status,
      completedAt: crmTasks.completedAt,
      createdAt: crmTasks.createdAt,
      updatedAt: crmTasks.updatedAt,
    })
    .from(crmTasks)
    .leftJoin(crmContacts, eq(crmTasks.contactId, crmContacts.id))
    .leftJoin(crmDeals, eq(crmTasks.dealId, crmDeals.id))
    .where(eq(crmTasks.ownerUserId, ownerUserId))
    .orderBy(asc(crmTasks.status), asc(crmTasks.dueAt), desc(crmTasks.updatedAt));
}

export async function createCrmTask(input: {
  ownerUserId: number;
  contactId?: number;
  dealId?: number;
  title: string;
  notes?: string;
  dueAt?: Date;
  priority: TaskPriorityValue;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for tasks.");
  if (input.contactId) {
    const contact = await getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId });
    if (!contact) return undefined;
  }
  if (input.dealId) {
    const deal = (await listCrmDeals(input.ownerUserId)).find((item) => item.id === input.dealId);
    if (!deal) return undefined;
  }
  const [created] = await db.insert(crmTasks).values({
    ownerUserId: input.ownerUserId,
    contactId: input.contactId ?? null,
    dealId: input.dealId ?? null,
    title: input.title,
    notes: input.notes || null,
    dueAt: input.dueAt ?? null,
    priority: input.priority,
  }).$returningId();
  const tasks = await listCrmTasks(input.ownerUserId);
  return tasks.find((task) => task.id === created.id);
}

export async function setCrmTaskStatus(input: { ownerUserId: number; taskId: number; status: TaskStatusValue }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for tasks.");
  const result = await db
    .update(crmTasks)
    .set({ status: input.status, completedAt: input.status === "completed" ? new Date() : null })
    .where(and(eq(crmTasks.ownerUserId, input.ownerUserId), eq(crmTasks.id, input.taskId)));
  if (!result[0]?.affectedRows) return undefined;
  const tasks = await listCrmTasks(input.ownerUserId);
  return tasks.find((task) => task.id === input.taskId);
}

export type CrmDocumentWithContext = {
  id: number;
  ownerUserId: number;
  contactId: number | null;
  contactName: string | null;
  dealId: number | null;
  dealTitle: string | null;
  name: string;
  documentType: DocumentTypeValue;
  status: DocumentStatusValue;
  dueAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listCrmDocuments(ownerUserId: number): Promise<CrmDocumentWithContext[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      id: crmDocuments.id,
      ownerUserId: crmDocuments.ownerUserId,
      contactId: crmDocuments.contactId,
      contactName: crmContacts.displayName,
      dealId: crmDocuments.dealId,
      dealTitle: crmDeals.title,
      name: crmDocuments.name,
      documentType: crmDocuments.documentType,
      status: crmDocuments.status,
      dueAt: crmDocuments.dueAt,
      notes: crmDocuments.notes,
      createdAt: crmDocuments.createdAt,
      updatedAt: crmDocuments.updatedAt,
    })
    .from(crmDocuments)
    .leftJoin(crmContacts, eq(crmDocuments.contactId, crmContacts.id))
    .leftJoin(crmDeals, eq(crmDocuments.dealId, crmDeals.id))
    .where(eq(crmDocuments.ownerUserId, ownerUserId))
    .orderBy(asc(crmDocuments.status), asc(crmDocuments.dueAt), desc(crmDocuments.updatedAt));
}

export async function createCrmDocument(input: {
  ownerUserId: number;
  contactId?: number;
  dealId?: number;
  name: string;
  documentType: DocumentTypeValue;
  status: DocumentStatusValue;
  dueAt?: Date;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for documents.");
  if (input.contactId && !(await getCrmContact({ ownerUserId: input.ownerUserId, contactId: input.contactId }))) return undefined;
  if (input.dealId && !(await listCrmDeals(input.ownerUserId)).some((deal) => deal.id === input.dealId)) return undefined;
  const [created] = await db.insert(crmDocuments).values({
    ownerUserId: input.ownerUserId,
    contactId: input.contactId ?? null,
    dealId: input.dealId ?? null,
    name: input.name,
    documentType: input.documentType,
    status: input.status,
    dueAt: input.dueAt ?? null,
    notes: input.notes || null,
  }).$returningId();
  const documents = await listCrmDocuments(input.ownerUserId);
  return documents.find((document) => document.id === created.id);
}

export async function setCrmDocumentStatus(input: { ownerUserId: number; documentId: number; status: DocumentStatusValue }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for documents.");
  const result = await db
    .update(crmDocuments)
    .set({ status: input.status })
    .where(and(eq(crmDocuments.ownerUserId, input.ownerUserId), eq(crmDocuments.id, input.documentId)));
  if (!result[0]?.affectedRows) return undefined;
  const documents = await listCrmDocuments(input.ownerUserId);
  return documents.find((document) => document.id === input.documentId);
}

export type CrmCampaignRecord = {
  id: number;
  ownerUserId: number;
  name: string;
  objective: string | null;
  channel: CampaignChannelValue;
  audienceRule: CampaignAudienceValue;
  status: CampaignStatusValue;
  scheduledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function listCrmCampaigns(ownerUserId: number): Promise<CrmCampaignRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(crmCampaigns).where(eq(crmCampaigns.ownerUserId, ownerUserId)).orderBy(desc(crmCampaigns.updatedAt));
}

export async function createCrmCampaign(input: {
  ownerUserId: number;
  name: string;
  objective?: string;
  channel: CampaignChannelValue;
  audienceRule: CampaignAudienceValue;
  status: CampaignStatusValue;
  scheduledAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for campaigns.");
  const [created] = await db.insert(crmCampaigns).values({
    ownerUserId: input.ownerUserId,
    name: input.name,
    objective: input.objective || null,
    channel: input.channel,
    audienceRule: input.audienceRule,
    status: input.status,
    scheduledAt: input.scheduledAt ?? null,
  }).$returningId();
  const campaigns = await listCrmCampaigns(input.ownerUserId);
  return campaigns.find((campaign) => campaign.id === created.id);
}

export async function setCrmCampaignStatus(input: { ownerUserId: number; campaignId: number; status: CampaignStatusValue }) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for campaigns.");
  const result = await db.update(crmCampaigns).set({ status: input.status }).where(and(eq(crmCampaigns.ownerUserId, input.ownerUserId), eq(crmCampaigns.id, input.campaignId)));
  if (!result[0]?.affectedRows) return undefined;
  const campaigns = await listCrmCampaigns(input.ownerUserId);
  return campaigns.find((campaign) => campaign.id === input.campaignId);
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

export type CalendarEventWithParticipants = CalendarEvent & {
  participants: CalendarEventParticipant[];
};

export type CalendarParticipantSuggestion = {
  id: number;
  kind: "team" | "contact";
  displayName: string;
  email: string;
  userId?: number;
};

export type WorkspaceTeamDirectoryMember = CalendarParticipantSuggestion & {
  kind: "team";
  userId: number;
  isOwner: boolean;
  role: "admin" | "user";
  phone: string | null;
};

export async function ensureWorkspaceOwnerTeamMembership(ownerUserId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(workspaceTeamMembers).values({
    ownerUserId,
    memberUserId: ownerUserId,
    status: "active",
  }).onDuplicateKeyUpdate({ set: { status: "active" } });
}

export async function isWorkspaceTeamMember(input: {
  ownerUserId: number;
  memberUserId: number;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  await ensureWorkspaceOwnerTeamMembership(input.ownerUserId);
  const rows = await db
    .select({ id: workspaceTeamMembers.id })
    .from(workspaceTeamMembers)
    .where(and(
      eq(workspaceTeamMembers.ownerUserId, input.ownerUserId),
      eq(workspaceTeamMembers.memberUserId, input.memberUserId),
      eq(workspaceTeamMembers.status, "active"),
    ))
    .limit(1);
  return Boolean(rows[0]);
}

export async function resolveWorkspaceOwnerUserId(memberUserId: number): Promise<number> {
  const db = await getDb();
  if (!db) return memberUserId;

  const memberships = await db
    .select({ ownerUserId: workspaceTeamMembers.ownerUserId })
    .from(workspaceTeamMembers)
    .where(and(
      eq(workspaceTeamMembers.memberUserId, memberUserId),
      eq(workspaceTeamMembers.status, "active"),
    ))
    .orderBy(desc(workspaceTeamMembers.updatedAt))
    .limit(1);

  return memberships[0]?.ownerUserId ?? memberUserId;
}

export async function listWorkspaceTeamMembers(ownerUserId: number): Promise<WorkspaceTeamDirectoryMember[]> {
  const db = await getDb();
  if (!db) return [];

  await ensureWorkspaceOwnerTeamMembership(ownerUserId);
  const rows = await db
    .select({ userId: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone })
    .from(workspaceTeamMembers)
    .innerJoin(users, eq(workspaceTeamMembers.memberUserId, users.id))
    .where(and(
      eq(workspaceTeamMembers.ownerUserId, ownerUserId),
      eq(workspaceTeamMembers.status, "active"),
    ))
    .orderBy(asc(users.name), asc(users.email));

  return rows
    .filter((member) => Boolean(member.email))
    .map((member) => ({
      id: member.userId,
      kind: "team" as const,
      displayName: member.name?.trim() || member.email!,
      email: member.email!,
      userId: member.userId,
      isOwner: member.userId === ownerUserId,
      role: member.role,
      phone: member.phone,
    }));
}

export async function addWorkspaceTeamMemberByEmail(input: {
  ownerUserId: number;
  email: string;
}): Promise<WorkspaceTeamDirectoryMember | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for workspace team membership.");

  const normalizedEmail = input.email.trim().toLocaleLowerCase();
  const usersWithEmail = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);
  const member = usersWithEmail[0];
  if (!member?.email) return undefined;

  await ensureWorkspaceOwnerTeamMembership(input.ownerUserId);
  await db.insert(workspaceTeamMembers).values({
    ownerUserId: input.ownerUserId,
    memberUserId: member.id,
    status: "active",
  }).onDuplicateKeyUpdate({ set: { status: "active" } });

  const directory = await listWorkspaceTeamMembers(input.ownerUserId);
  return directory.find((entry) => entry.userId === member.id);
}

export async function removeWorkspaceTeamMember(input: {
  ownerUserId: number;
  memberUserId: number;
}): Promise<boolean> {
  if (input.ownerUserId === input.memberUserId) return false;

  const db = await getDb();
  if (!db) throw new Error("Database is not available for workspace team membership.");

  const member = await db
    .select({ id: workspaceTeamMembers.id })
    .from(workspaceTeamMembers)
    .where(and(
      eq(workspaceTeamMembers.ownerUserId, input.ownerUserId),
      eq(workspaceTeamMembers.memberUserId, input.memberUserId),
      eq(workspaceTeamMembers.status, "active"),
    ))
    .limit(1);

  if (!member[0]) return false;

  await db.delete(workspaceTeamMembers).where(eq(workspaceTeamMembers.id, member[0].id));
  return true;
}

export async function updateWorkspaceMemberPhone(input: {
  memberUserId: number;
  phone: string | null;
}): Promise<WorkspaceTeamDirectoryMember | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for workspace member details.");

  await db.update(users).set({ phone: input.phone }).where(eq(users.id, input.memberUserId));
  const ownerUserId = await resolveWorkspaceOwnerUserId(input.memberUserId);
  const directory = await listWorkspaceTeamMembers(ownerUserId);
  return directory.find((member) => member.userId === input.memberUserId);
}

export async function listCalendarEvents(ownerUserId: number): Promise<CalendarEventWithParticipants[]> {
  const db = await getDb();
  if (!db) return [];

  const events = await db
    .select()
    .from(calendarEvents)
    .where(eq(calendarEvents.ownerUserId, ownerUserId))
    .orderBy(asc(calendarEvents.startsAt));

  if (events.length === 0) return [];

  const participants = await db
    .select()
    .from(calendarEventParticipants)
    .where(inArray(calendarEventParticipants.eventId, events.map((event) => event.id)));

  return events.map((event) => ({
    ...event,
    participants: participants.filter((participant) => participant.eventId === event.id),
  }));
}

export async function listCalendarParticipantSuggestions(input: {
  ownerUserId: number;
  query: string;
}): Promise<{ teamMembers: CalendarParticipantSuggestion[]; contacts: CalendarParticipantSuggestion[] }> {
  const db = await getDb();
  if (!db) return { teamMembers: [], contacts: [] };

  const normalizedQuery = input.query.trim().toLocaleLowerCase();
  const matches = (value?: string | null) => !normalizedQuery || value?.toLocaleLowerCase().includes(normalizedQuery);

  const teamMembers = (await listWorkspaceTeamMembers(input.ownerUserId))
    .filter((member) => matches(member.displayName) || matches(member.email))
    .slice(0, 8);

  const contactRows = await db
    .select()
    .from(calendarContacts)
    .where(eq(calendarContacts.ownerUserId, input.ownerUserId))
    .orderBy(desc(calendarContacts.updatedAt))
    .limit(25);
  const contacts = contactRows
    .filter((contact) => matches(contact.name) || matches(contact.email))
    .slice(0, 8)
    .map((contact) => ({
      id: contact.id,
      kind: "contact" as const,
      displayName: contact.name?.trim() || contact.email,
      email: contact.email,
    }));

  return { teamMembers, contacts };
}

async function findOrCreateCalendarContact(input: {
  ownerUserId: number;
  displayName?: string;
  email: string;
}): Promise<CalendarContact> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for calendar contacts.");

  const existing = await db
    .select()
    .from(calendarContacts)
    .where(and(eq(calendarContacts.ownerUserId, input.ownerUserId), eq(calendarContacts.email, input.email)))
    .limit(1);
  if (existing[0]) return existing[0];

  await db.insert(calendarContacts).values({
    ownerUserId: input.ownerUserId,
    name: input.displayName?.trim() || null,
    email: input.email,
  });

  const created = await db
    .select()
    .from(calendarContacts)
    .where(and(eq(calendarContacts.ownerUserId, input.ownerUserId), eq(calendarContacts.email, input.email)))
    .limit(1);
  if (!created[0]) throw new Error("Calendar contact could not be created.");
  return created[0];
}

export async function createCalendarEvent(input: {
  ownerUserId: number;
  clientEventId: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location?: string;
  notes?: string;
  participants: Array<{
    kind: "team" | "contact" | "external";
    displayName?: string;
    email: string;
    userId?: number;
  }>;
}): Promise<CalendarEvent> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for calendar events.");

  const existing = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.ownerUserId, input.ownerUserId), eq(calendarEvents.clientEventId, input.clientEventId)))
    .limit(1);
  if (existing[0]) return existing[0];

  await db.insert(calendarEvents).values({
    ownerUserId: input.ownerUserId,
    clientEventId: input.clientEventId,
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    location: input.location?.trim() || null,
    notes: input.notes?.trim() || null,
  });

  const created = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.ownerUserId, input.ownerUserId), eq(calendarEvents.clientEventId, input.clientEventId)))
    .limit(1);
  const event = created[0];
  if (!event) throw new Error("Calendar event could not be created.");

  if (input.participants.length > 0) {
    const participantRows = await Promise.all(input.participants.map(async (participant) => {
      const contact = participant.kind === "team"
        ? undefined
        : await findOrCreateCalendarContact({
          ownerUserId: input.ownerUserId,
          displayName: participant.displayName,
          email: participant.email,
        });
      return {
        eventId: event.id,
        kind: participant.kind,
        displayName: participant.displayName?.trim() || null,
        email: participant.email,
        userId: participant.kind === "team" ? participant.userId ?? null : null,
        contactId: contact?.id ?? null,
      };
    }));
    await db.insert(calendarEventParticipants).values(participantRows);
  }

  return event;
}

export async function updateCalendarEvent(input: {
  ownerUserId: number;
  eventId: number;
  title: string;
  startsAt: Date;
  endsAt: Date;
  location?: string;
  notes?: string;
  participants: Array<{
    kind: "team" | "contact" | "external";
    displayName?: string;
    email: string;
    userId?: number;
  }>;
}): Promise<CalendarEvent | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database is not available for calendar events.");

  const existing = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, input.eventId), eq(calendarEvents.ownerUserId, input.ownerUserId)))
    .limit(1);
  if (!existing[0]) return undefined;

  await db
    .update(calendarEvents)
    .set({
      title: input.title,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      location: input.location?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .where(and(eq(calendarEvents.id, input.eventId), eq(calendarEvents.ownerUserId, input.ownerUserId)));

  await db.delete(calendarEventParticipants).where(eq(calendarEventParticipants.eventId, input.eventId));
  if (input.participants.length > 0) {
    const participantRows = await Promise.all(input.participants.map(async (participant) => {
      const contact = participant.kind === "team"
        ? undefined
        : await findOrCreateCalendarContact({
          ownerUserId: input.ownerUserId,
          displayName: participant.displayName,
          email: participant.email,
        });
      return {
        eventId: input.eventId,
        kind: participant.kind,
        displayName: participant.displayName?.trim() || null,
        email: participant.email,
        userId: participant.kind === "team" ? participant.userId ?? null : null,
        contactId: contact?.id ?? null,
      };
    }));
    await db.insert(calendarEventParticipants).values(participantRows);
  }

  const updated = await db
    .select()
    .from(calendarEvents)
    .where(and(eq(calendarEvents.id, input.eventId), eq(calendarEvents.ownerUserId, input.ownerUserId)))
    .limit(1);
  return updated[0];
}
