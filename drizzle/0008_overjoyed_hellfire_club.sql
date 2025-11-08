ALTER TABLE `ai_config` ADD `provider` enum('infomaniak','openai','mistral','claude','gemini') DEFAULT 'infomaniak' NOT NULL;--> statement-breakpoint
ALTER TABLE `ai_config` ADD `organizationId` varchar(100);--> statement-breakpoint
ALTER TABLE `ai_config` ADD `anthropicVersion` varchar(50);