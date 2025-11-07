CREATE TABLE `smtp_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host` varchar(255),
	`port` int,
	`secure` int DEFAULT 1,
	`user` varchar(255),
	`pass` varchar(255),
	`from` varchar(255),
	`destinationEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `smtp_config_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `smtpConfig`;