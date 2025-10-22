CREATE TABLE `taskRequests` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`requestedBy` varchar(64) NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`rejectionReason` text,
	`createdAt` timestamp DEFAULT (now()),
	`reviewedAt` timestamp,
	`reviewedBy` varchar(64),
	CONSTRAINT `taskRequests_id` PRIMARY KEY(`id`)
);
