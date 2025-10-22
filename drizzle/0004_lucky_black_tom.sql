CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`type` enum('mention','task','announcement','report','system') NOT NULL DEFAULT 'system',
	`title` text NOT NULL,
	`message` text NOT NULL,
	`isRead` enum('yes','no') NOT NULL DEFAULT 'no',
	`link` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
