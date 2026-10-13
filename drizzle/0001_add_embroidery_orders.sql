CREATE TABLE `embroidery_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderDate` date NOT NULL,
	`name` varchar(180) NOT NULL,
	`origin` enum('DTEX','CLIENTE') NOT NULL,
	`quantity` int NOT NULL,
	`amountCents` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `embroidery_orders_id` PRIMARY KEY(`id`)
);
