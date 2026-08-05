CREATE TABLE `crmCampaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(240) NOT NULL,
	`objective` varchar(400),
	`channel` enum('email','text','mixed') NOT NULL DEFAULT 'email',
	`audienceRule` enum('all_contacts','prospect','active','forever_client','vendor') NOT NULL DEFAULT 'all_contacts',
	`status` enum('draft','scheduled','paused','completed') NOT NULL DEFAULT 'draft',
	`scheduledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmCampaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crmCampaigns` ADD CONSTRAINT `crmCampaigns_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `crm_campaigns_owner_status_updated_idx` ON `crmCampaigns` (`ownerUserId`,`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `crm_campaigns_owner_audience_idx` ON `crmCampaigns` (`ownerUserId`,`audienceRule`);