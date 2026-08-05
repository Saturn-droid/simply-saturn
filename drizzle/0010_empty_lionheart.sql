CREATE TABLE `crmAutomationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`name` varchar(240) NOT NULL,
	`trigger` enum('contact_created','contact_status_changed','deal_stage_changed','task_completed','document_status_changed') NOT NULL,
	`action` enum('create_task','change_contact_status','create_document_record','notify_owner') NOT NULL,
	`actionDetail` varchar(400),
	`status` enum('draft','active','paused') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `crmAutomationRules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `crmAutomationRules` ADD CONSTRAINT `crmAutomationRules_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `crm_automation_rules_owner_status_updated_idx` ON `crmAutomationRules` (`ownerUserId`,`status`,`updatedAt`);--> statement-breakpoint
CREATE INDEX `crm_automation_rules_owner_trigger_idx` ON `crmAutomationRules` (`ownerUserId`,`trigger`);