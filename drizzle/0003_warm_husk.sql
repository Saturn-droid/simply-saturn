CREATE TABLE `workspaceTeamMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerUserId` int NOT NULL,
	`memberUserId` int NOT NULL,
	`status` enum('active','invited') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workspaceTeamMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `workspace_team_members_owner_member_unique` UNIQUE(`ownerUserId`,`memberUserId`)
);
--> statement-breakpoint
ALTER TABLE `workspaceTeamMembers` ADD CONSTRAINT `workspaceTeamMembers_ownerUserId_users_id_fk` FOREIGN KEY (`ownerUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaceTeamMembers` ADD CONSTRAINT `workspaceTeamMembers_memberUserId_users_id_fk` FOREIGN KEY (`memberUserId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `workspace_team_members_owner_status_idx` ON `workspaceTeamMembers` (`ownerUserId`,`status`);