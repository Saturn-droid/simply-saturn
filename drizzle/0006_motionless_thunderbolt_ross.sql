CREATE TABLE `crmDeals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`contactId` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`propertyAddress` varchar(320),
	`stage` enum('lead','qualification','active','offer','under_contract','closed','lost') NOT NULL DEFAULT 'lead',
	`estimatedValueCents` int NOT NULL DEFAULT 0,
	`targetCloseAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmDeals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crmDeals` ADD CONSTRAINT `crmDeals_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crmDeals` ADD CONSTRAINT `crmDeals_contactId_crmContacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `crmContacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `crm_deals_owner_stage_idx` ON `crmDeals` (`ownerUserId`,`stage`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `crm_deals_owner_contact_idx` ON `crmDeals` (`ownerUserId`,`contactId`);