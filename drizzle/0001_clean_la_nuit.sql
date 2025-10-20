CREATE TABLE `announcements` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`category` varchar(100),
	`isPinned` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `announcements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dailyFocus` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`focusText` text NOT NULL,
	`date` timestamp DEFAULT (now()),
	CONSTRAINT `dailyFocus_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` enum('innovation','process','product','marketing') NOT NULL DEFAULT 'innovation',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`status` enum('submitted','under_review','in_progress','implemented','archived') NOT NULL DEFAULT 'submitted',
	`submittedBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `ideas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keyDates` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`type` enum('deadline','launch','meeting','event') NOT NULL DEFAULT 'event',
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `keyDates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`assignedTo` varchar(64),
	`status` enum('pending','in_progress','overdue','done') NOT NULL DEFAULT 'pending',
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`category` varchar(100),
	`dueDate` timestamp,
	`createdBy` varchar(64) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `tasks_id` PRIMARY KEY(`id`)
);
