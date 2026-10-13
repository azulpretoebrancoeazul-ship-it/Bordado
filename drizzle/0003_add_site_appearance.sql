CREATE TABLE `site_appearance` (
	`id` int NOT NULL,
	`paletteId` varchar(32) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `site_appearance_id` PRIMARY KEY(`id`)
);
