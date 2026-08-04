CREATE TABLE `smsConversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`contactName` varchar(160),
	`contactPhone` varchar(32) NOT NULL,
	`status` enum('open','closed') NOT NULL DEFAULT 'open',
	`lastMessagePreview` varchar(512),
	`lastMessageAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smsConversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `sms_conversations_owner_phone_unique` UNIQUE(`ownerUserId`,`contactPhone`)
);
--> statement-breakpoint
CREATE TABLE `smsMessages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`ownerUserId` int NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL,
	`body` text NOT NULL,
	`deliveryStatus` enum('draft','queued','sent','delivered','undelivered','failed') NOT NULL DEFAULT 'draft',
	`clientMessageId` varchar(96) NOT NULL,
	`providerMessageSid` varchar(64),
	`errorCode` varchar(32),
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smsMessages_id` PRIMARY KEY(`id`),
	CONSTRAINT `sms_messages_owner_client_unique` UNIQUE(`ownerUserId`,`clientMessageId`)
);
--> statement-breakpoint
ALTER TABLE `smsConversations` ADD CONSTRAINT `smsConversations_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smsMessages` ADD CONSTRAINT `smsMessages_conversationId_smsConversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `smsConversations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `smsMessages` ADD CONSTRAINT `smsMessages_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sms_conversations_owner_updated_idx` ON `smsConversations` (`ownerUserId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `sms_messages_conversation_created_idx` ON `smsMessages` (`conversationId`,`createdAt`);