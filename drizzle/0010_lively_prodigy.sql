CREATE TABLE `brand_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationName` varchar(255) NOT NULL,
	`logoUrl` text,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `brand_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `help_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('file','link','cgu') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`url` text NOT NULL,
	`fileKey` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `help_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slide_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`minSlides` int NOT NULL DEFAULT 2,
	`maxSlides` int NOT NULL DEFAULT 8,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slide_config_id` PRIMARY KEY(`id`)
);
