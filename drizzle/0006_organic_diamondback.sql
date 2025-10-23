CREATE TABLE `googleTokens` (
	`userId` varchar(64) NOT NULL,
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp NOT NULL,
	`scope` text,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `googleTokens_userId` PRIMARY KEY(`userId`)
);
--> statement-breakpoint
ALTER TABLE `googleTokens` ADD CONSTRAINT `googleTokens_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;