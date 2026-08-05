CREATE TABLE `crmTasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`contactId` int,
	`dealId` int,
	`title` varchar(240) NOT NULL,
	`notes` text,
	`dueAt` timestamp,
	`priority` enum('low','normal','high') NOT NULL DEFAULT 'normal',
	`status` enum('open','completed') NOT NULL DEFAULT 'open',
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmTasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crmTasks` ADD CONSTRAINT `crmTasks_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crmTasks` ADD CONSTRAINT `crmTasks_contactId_crmContacts_id_fk` FOREIGN KEY (`contactId`) REFERENCES `crmContacts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `crmTasks` ADD CONSTRAINT `crmTasks_dealId_crmDeals_id_fk` FOREIGN KEY (`dealId`) REFERENCES `crmDeals`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `crm_tasks_owner_status_due_idx` ON `crmTasks` (`ownerUserId`,`status`,`dueAt`);--> statement-breakpoint
CREATE INDEX `crm_tasks_owner_contact_idx` ON `crmTasks` (`ownerUserId`,`contactId`);--> statement-breakpoint
CREATE INDEX `crm_tasks_owner_deal_idx` ON `crmTasks` (`ownerUserId`,`dealId`);