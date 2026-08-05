CREATE TABLE `calendarContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(160),
	`email` varchar(320) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendarContacts_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendar_contacts_owner_email_unique` UNIQUE(`ownerUserId`,`email`)
);
--> statement-breakpoint
CREATE TABLE `calendarEventParticipants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` int NOT NULL,
	`kind` enum('team','contact','external') NOT NULL,
	`displayName` varchar(160),
	`email` varchar(320) NOT NULL,
	`userId` int,
	`contactId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `calendarEventParticipants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `calendarEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`clientEventId` varchar(96) NOT NULL,
	`title` varchar(240) NOT NULL,
	`startsAt` timestamp NOT NULL,
	`endsAt` timestamp NOT NULL,
	`location` varchar(320),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `calendarEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `calendar_events_owner_client_unique` UNIQUE(`ownerUserId`,`clientEventId`)
);
--> statement-breakpoint
ALTER TABLE `calendarContacts` ADD CONSTRAINT `calendarContacts_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEventParticipants` ADD CONSTRAINT `calendarEventParticipants_eventId_calendarEvents_id_fk` FOREIGN KEY (`eventId`) REFERENCES `calendarEvents`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEventParticipants` ADD CONSTRAINT `calendarEventParticipants_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEventParticipants` ADD CONSTRAINT `calendarEventParticipants_contactId_calendarContacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `calendarContacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `calendarEvents` ADD CONSTRAINT `calendarEvents_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `calendar_contacts_owner_updated_idx` ON `calendarContacts` (`ownerUserId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `calendar_event_participants_event_idx` ON `calendarEventParticipants` (`eventId`);--> statement-breakpoint
CREATE INDEX `calendar_events_owner_starts_idx` ON `calendarEvents` (`ownerUserId`,`startsAt`);