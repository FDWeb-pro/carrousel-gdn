CREATE TABLE `carrousels` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`titre` text NOT NULL,
	`thematique` text NOT NULL,
	`emailDestination` varchar(320),
	`slides` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carrousels_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slideTypesConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`typeKey` varchar(50) NOT NULL,
	`label` text NOT NULL,
	`charLimit` int NOT NULL,
	`enabled` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slideTypesConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `slideTypesConfig_typeKey_unique` UNIQUE(`typeKey`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('membre','admin','super_admin') NOT NULL DEFAULT 'membre';