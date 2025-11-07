CREATE TABLE `auditLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userName` varchar(255),
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLog_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`relatedUserId` int,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `smtpConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host` varchar(255),
	`port` int DEFAULT 587,
	`secure` int DEFAULT 0,
	`user` varchar(255),
	`pass` text,
	`from` varchar(255),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smtpConfig_id` PRIMARY KEY(`id`)
);
