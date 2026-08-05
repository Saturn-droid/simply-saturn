CREATE TABLE `crmDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`contactId` int,
	`dealId` int,
	`name` varchar(240) NOT NULL,
	`documentType` enum('listing','offer','disclosure','contract','compliance','other') NOT NULL DEFAULT 'other',
	`status` enum('requested','received','review','approved','sent') NOT NULL DEFAULT 'requested',
	`dueAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crmDocuments` ADD CONSTRAINT `crmDocuments_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crmDocuments` ADD CONSTRAINT `crmDocuments_contactId_crmContacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `crmContacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crmDocuments` ADD CONSTRAINT `crmDocuments_dealId_crmDeals_id_fk` FOREIGN KEY (`dealId`) REFERENCES `crmDeals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `crm_documents_owner_status_due_idx` ON `crmDocuments` (`ownerUserId`,`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `crm_documents_owner_contact_idx` ON `crmDocuments` (`ownerUserId`,`contactId`);--> statement-breakpoint
CREATE INDEX `crm_documents_owner_deal_idx` ON `crmDocuments` (`ownerUserId`,`dealId`);