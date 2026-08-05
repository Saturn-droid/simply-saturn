import { index, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

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
  phone: varchar("phone", { length: 32 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * A user-scoped SMS conversation. This is intentionally user-scoped until the
 * organization membership model is introduced; future tenancy work can add an
 * organization foreign key without exposing message data in the browser.
 */
export const smsConversations = mysqlTable(
  "smsConversations",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    contactName: varchar("contactName", { length: 160 }),
    contactPhone: varchar("contactPhone", { length: 32 }).notNull(),
    status: mysqlEnum("status", ["open", "closed"]).default("open").notNull(),
    lastMessagePreview: varchar("lastMessagePreview", { length: 512 }),
    lastMessageAt: timestamp("lastMessageAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("sms_conversations_owner_updated_idx").on(table.ownerUserId, table.updatedAt),
    uniqueIndex("sms_conversations_owner_phone_unique").on(table.ownerUserId, table.contactPhone),
  ],
);

/**
 * Provider-agnostic message audit record. Delivery updates are kept server-side
 * so no Twilio credential or provider response is ever trusted from the client.
 */
export const smsMessages = mysqlTable(
  "smsMessages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull().references(() => smsConversations.id),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
    body: text("body").notNull(),
    deliveryStatus: mysqlEnum("deliveryStatus", ["draft", "queued", "sent", "delivered", "undelivered", "failed"]).default("draft").notNull(),
    clientMessageId: varchar("clientMessageId", { length: 96 }).notNull(),
    providerMessageSid: varchar("providerMessageSid", { length: 64 }),
    errorCode: varchar("errorCode", { length: 32 }),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("sms_messages_conversation_created_idx").on(table.conversationId, table.createdAt),
    uniqueIndex("sms_messages_owner_client_unique").on(table.ownerUserId, table.clientMessageId),
  ],
);

export type SmsConversation = typeof smsConversations.$inferSelect;
export type SmsMessage = typeof smsMessages.$inferSelect;

/**
 * Calendar events are scoped to their creator until the organization model is
 * introduced. The client id makes create requests idempotent.
 */
export const calendarEvents = mysqlTable(
  "calendarEvents",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    clientEventId: varchar("clientEventId", { length: 96 }).notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    startsAt: timestamp("startsAt").notNull(),
    endsAt: timestamp("endsAt").notNull(),
    location: varchar("location", { length: 320 }),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("calendar_events_owner_starts_idx").on(table.ownerUserId, table.startsAt),
    uniqueIndex("calendar_events_owner_client_unique").on(table.ownerUserId, table.clientEventId),
  ],
);

/**
 * A lightweight, owner-scoped directory populated from calendar attendees.
 * It supports contact suggestions without exposing people from other workspaces.
 */
export const calendarContacts = mysqlTable(
  "calendarContacts",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    name: varchar("name", { length: 160 }),
    email: varchar("email", { length: 320 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("calendar_contacts_owner_email_unique").on(table.ownerUserId, table.email),
    index("calendar_contacts_owner_updated_idx").on(table.ownerUserId, table.updatedAt),
  ],
);

/**
 * Event attendees may be a team member, an existing contact, or an external
 * email address. Only their display data is stored with the event.
 */
export const calendarEventParticipants = mysqlTable(
  "calendarEventParticipants",
  {
    id: int("id").autoincrement().primaryKey(),
    eventId: int("eventId").notNull().references(() => calendarEvents.id),
    kind: mysqlEnum("kind", ["team", "contact", "external"]).notNull(),
    displayName: varchar("displayName", { length: 160 }),
    email: varchar("email", { length: 320 }).notNull(),
    userId: int("userId").references(() => users.id),
    contactId: int("contactId").references(() => calendarContacts.id),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("calendar_event_participants_event_idx").on(table.eventId),
  ],
);

/**
 * Owner-scoped workspace membership. The current owner is enrolled on demand,
 * while future invitation and team-management flows can add more members.
 */
export const workspaceTeamMembers = mysqlTable(
  "workspaceTeamMembers",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    memberUserId: int("memberUserId").notNull().references(() => users.id),
    status: mysqlEnum("status", ["active", "invited"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    uniqueIndex("workspace_team_members_owner_member_unique").on(table.ownerUserId, table.memberUserId),
    index("workspace_team_members_owner_status_idx").on(table.ownerUserId, table.status),
  ],
);

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type CalendarContact = typeof calendarContacts.$inferSelect;
export type CalendarEventParticipant = typeof calendarEventParticipants.$inferSelect;
export type WorkspaceTeamMember = typeof workspaceTeamMembers.$inferSelect;

/**
 * Operational contact records are owner-scoped. Contact types are persisted as
 * a compact JSON array so a contact can carry several roles without requiring
 * a relationship filter or a separate relationship record.
 */
export const crmContacts = mysqlTable(
  "crmContacts",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    displayName: varchar("displayName", { length: 160 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 32 }),
    typesJson: text("typesJson").notNull(),
    status: mysqlEnum("status", ["dead", "expired", "dnc", "prospect", "active", "forever_client", "vendor"]),
    dealCount: int("dealCount").default(0).notNull(),
    lastTextAt: timestamp("lastTextAt"),
    lastCallAt: timestamp("lastCallAt"),
    lastEmailAt: timestamp("lastEmailAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("crm_contacts_owner_updated_idx").on(table.ownerUserId, table.updatedAt),
    index("crm_contacts_owner_status_idx").on(table.ownerUserId, table.status),
    index("crm_contacts_owner_name_idx").on(table.ownerUserId, table.displayName),
  ],
);

/**
 * Communication activities support per-channel last-contact values in the
 * contacts list. The summary timestamps above are updated alongside this audit
 * table to keep the list view efficient.
 */
export const contactActivities = mysqlTable(
  "contactActivities",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    contactId: int("contactId").notNull().references(() => crmContacts.id),
    channel: mysqlEnum("channel", ["text", "call", "email"]).notNull(),
    occurredAt: timestamp("occurredAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("contact_activities_owner_contact_channel_idx").on(table.ownerUserId, table.contactId, table.channel, table.occurredAt),
  ],
);

/**
 * Owner-scoped real estate opportunities. Every deal is tied to a saved CRM
 * contact so relationship and pipeline context stay connected.
 */
export const crmDeals = mysqlTable(
  "crmDeals",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    contactId: int("contactId").notNull().references(() => crmContacts.id),
    title: varchar("title", { length: 240 }).notNull(),
    propertyAddress: varchar("propertyAddress", { length: 320 }),
    stage: mysqlEnum("stage", ["lead", "qualification", "active", "offer", "under_contract", "closed", "lost"]).default("lead").notNull(),
    estimatedValueCents: int("estimatedValueCents").default(0).notNull(),
    targetCloseAt: timestamp("targetCloseAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("crm_deals_owner_stage_idx").on(table.ownerUserId, table.stage, table.updatedAt),
    index("crm_deals_owner_contact_idx").on(table.ownerUserId, table.contactId),
  ],
);

/**
 * Owner-scoped work items that can be linked to one CRM contact, one deal, or
 * both. The task record keeps responsibility and follow-up close to the work.
 */
export const crmTasks = mysqlTable(
  "crmTasks",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    contactId: int("contactId").references(() => crmContacts.id),
    dealId: int("dealId").references(() => crmDeals.id),
    title: varchar("title", { length: 240 }).notNull(),
    notes: text("notes"),
    dueAt: timestamp("dueAt"),
    priority: mysqlEnum("priority", ["low", "normal", "high"]).default("normal").notNull(),
    status: mysqlEnum("status", ["open", "completed"]).default("open").notNull(),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("crm_tasks_owner_status_due_idx").on(table.ownerUserId, table.status, table.dueAt),
    index("crm_tasks_owner_contact_idx").on(table.ownerUserId, table.contactId),
    index("crm_tasks_owner_deal_idx").on(table.ownerUserId, table.dealId),
  ],
);

/**
 * Owner-scoped document tracking records. File storage is intentionally
 * separate; this workflow tracks operational document state and context.
 */
export const crmDocuments = mysqlTable(
  "crmDocuments",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    contactId: int("contactId").references(() => crmContacts.id),
    dealId: int("dealId").references(() => crmDeals.id),
    name: varchar("name", { length: 240 }).notNull(),
    documentType: mysqlEnum("documentType", ["listing", "offer", "disclosure", "contract", "compliance", "other"]).default("other").notNull(),
    status: mysqlEnum("status", ["requested", "received", "review", "approved", "sent"]).default("requested").notNull(),
    dueAt: timestamp("dueAt"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("crm_documents_owner_status_due_idx").on(table.ownerUserId, table.status, table.dueAt),
    index("crm_documents_owner_contact_idx").on(table.ownerUserId, table.contactId),
    index("crm_documents_owner_deal_idx").on(table.ownerUserId, table.dealId),
  ],
);

/**
 * Owner-scoped campaign planning records. Campaign delivery is intentionally
 * not enabled here; this model tracks accountable planning and lifecycle state.
 */
export const crmCampaigns = mysqlTable(
  "crmCampaigns",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    name: varchar("name", { length: 240 }).notNull(),
    objective: varchar("objective", { length: 400 }),
    channel: mysqlEnum("channel", ["email", "text", "mixed"]).default("email").notNull(),
    audienceRule: mysqlEnum("audienceRule", ["all_contacts", "prospect", "active", "forever_client", "vendor"]).default("all_contacts").notNull(),
    status: mysqlEnum("status", ["draft", "scheduled", "paused", "completed"]).default("draft").notNull(),
    scheduledAt: timestamp("scheduledAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("crm_campaigns_owner_status_updated_idx").on(table.ownerUserId, table.status, table.updatedAt),
    index("crm_campaigns_owner_audience_idx").on(table.ownerUserId, table.audienceRule),
  ],
);

/**
 * Owner-scoped automation rule definitions. These records are configuration
 * only; no background execution or outbound action is initiated from them.
 */
export const crmAutomationRules = mysqlTable(
  "crmAutomationRules",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull().references(() => users.id),
    name: varchar("name", { length: 240 }).notNull(),
    trigger: mysqlEnum("trigger", ["contact_created", "contact_status_changed", "deal_stage_changed", "task_completed", "document_status_changed"]).notNull(),
    action: mysqlEnum("action", ["create_task", "change_contact_status", "create_document_record", "notify_owner"]).notNull(),
    actionDetail: varchar("actionDetail", { length: 400 }),
    status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("crm_automation_rules_owner_status_updated_idx").on(table.ownerUserId, table.status, table.updatedAt),
    index("crm_automation_rules_owner_trigger_idx").on(table.ownerUserId, table.trigger),
  ],
);

export type CrmContact = typeof crmContacts.$inferSelect;
export type ContactActivity = typeof contactActivities.$inferSelect;
export type CrmDeal = typeof crmDeals.$inferSelect;
export type CrmTask = typeof crmTasks.$inferSelect;
export type CrmDocument = typeof crmDocuments.$inferSelect;
export type CrmCampaign = typeof crmCampaigns.$inferSelect;
export type CrmAutomationRule = typeof crmAutomationRules.$inferSelect;
