CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`service` text,
	`message` text,
	`page` text,
	`status` text DEFAULT 'novo' NOT NULL,
	`consent_at` text NOT NULL,
	`country` text,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leads_brand_created_idx` ON `leads` (`brand`,`created_at`);