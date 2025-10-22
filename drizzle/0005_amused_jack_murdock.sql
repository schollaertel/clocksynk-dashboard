CREATE TABLE `contentIdeas` (
	`id` varchar(64) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` enum('pending','approved','rejected','implemented') NOT NULL DEFAULT 'pending',
	`submittedBy` varchar(64) NOT NULL,
	`reviewedBy` varchar(64),
	`reviewedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `contentIdeas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `socialCampaigns` (
	`id` varchar(64) NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`status` enum('active','scheduled','completed','archived') NOT NULL DEFAULT 'active',
	`folderUrl` varchar(500),
	`sheetUrl` varchar(500),
	`postsCount` varchar(10) DEFAULT '0',
	`assetsCount` varchar(10) DEFAULT '0',
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `socialCampaigns_id` PRIMARY KEY(`id`)
);
