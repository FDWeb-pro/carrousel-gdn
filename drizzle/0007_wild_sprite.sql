CREATE TABLE `ai_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiToken` varchar(500),
	`productId` varchar(100),
	`model` varchar(50) DEFAULT 'mixtral',
	`maxTokens` int DEFAULT 200,
	`temperature` int DEFAULT 70,
	`isEnabled` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_config_id` PRIMARY KEY(`id`)
);
