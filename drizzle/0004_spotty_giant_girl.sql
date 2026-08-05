CREATE TABLE `contactActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`contactId` int NOT NULL,
	`channel` enum('text','call','email') NOT NULL,
	`occurredAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contactActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `crmContacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`displayName` varchar(160) NOT NULL,
	`email` varchar(320),
	`phone` varchar(32),
	`typesJson` text NOT NULL,
	`status` enum('dead','expired','dnc','prospect','active','forever_client','vendor'),
	`dealCount` int NOT NULL DEFAULT 0,
	`lastTextAt` timestamp,
	`lastCallAt` timestamp,
	`lastEmailAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmContacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `contactActivities` ADD CONSTRAINT `contactActivities_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `contactActivities` ADD CONSTRAINT `contactActivities_contactId_crmContacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `crmContacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crmContacts` ADD CONSTRAINT `crmContacts_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `contact_activities_owner_contact_channel_idx` ON `contactActivities` (`ownerUserId`,`contactId`,`channel`,`occurredAt`);--> statement-breakpoint
CREATE INDEX `crm_contacts_owner_updated_idx` ON `crmContacts` (`ownerUserId`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `crm_contacts_owner_status_idx` ON `crmContacts` (`ownerUserId`,`status`);--> statement-breakpoint
CREATE INDEX `crm_contacts_owner_name_idx` ON `crmContacts` (`ownerUserId`,`displayName`);