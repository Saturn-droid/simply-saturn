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
