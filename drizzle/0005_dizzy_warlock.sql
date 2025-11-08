CREATE TABLE `slideTypes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`typeKey` varchar(50) NOT NULL,
	`label` varchar(255) NOT NULL,
	`charLimit` int NOT NULL,
	`isActive` enum('true','false') NOT NULL DEFAULT 'true',
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `slideTypes_id` PRIMARY KEY(`id`),
	CONSTRAINT `slideTypes_typeKey_unique` UNIQUE(`typeKey`)
);
--> statement-breakpoint
DROP TABLE `slideTypesConfig`;