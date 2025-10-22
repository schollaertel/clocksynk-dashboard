CREATE TABLE `clientProjects` (
	`id` varchar(64) NOT NULL,
	`clientId` varchar(64) NOT NULL,
	`clientName` varchar(255) NOT NULL,
	`projectName` text NOT NULL,
	`description` text,
	`status` enum('planning','in_progress','review','completed') NOT NULL DEFAULT 'planning',
	`startDate` timestamp,
	`dueDate` timestamp,
	`budget` varchar(50),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `clientProjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projectUpdates` (
	`id` varchar(64) NOT NULL,
	`projectId` varchar(64) NOT NULL,
	`message` text NOT NULL,
	`author` varchar(64) NOT NULL,
	`isInternal` enum('yes','no') NOT NULL DEFAULT 'no',
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `projectUpdates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timeEntries` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`clockIn` timestamp NOT NULL,
	`clockOut` timestamp,
	`totalHours` varchar(20),
	`notes` text,
	`date` timestamp NOT NULL,
	CONSTRAINT `timeEntries_id` PRIMARY KEY(`id`)
);
