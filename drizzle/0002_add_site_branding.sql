CREATE TABLE `site_branding` (
	`id` int NOT NULL,
	`logoKey` varchar(255) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_branding_id` PRIMARY KEY(`id`)
);
