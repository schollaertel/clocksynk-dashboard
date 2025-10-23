CREATE TYPE "public"."campaign_status" AS ENUM('active', 'scheduled', 'completed', 'archived');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('pending', 'approved', 'rejected', 'implemented');--> statement-breakpoint
CREATE TYPE "public"."date_type" AS ENUM('deadline', 'launch', 'meeting', 'event');--> statement-breakpoint
CREATE TYPE "public"."idea_category" AS ENUM('innovation', 'process', 'product', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."idea_status" AS ENUM('submitted', 'under_review', 'in_progress', 'implemented', 'archived');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('mention', 'task', 'announcement', 'report', 'system');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planning', 'in_progress', 'review', 'completed');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'overdue', 'done');--> statement-breakpoint
CREATE TYPE "public"."yes_no" AS ENUM('yes', 'no');--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"category" varchar(100),
	"isPinned" "yes_no" DEFAULT 'no' NOT NULL,
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clientProjects" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"clientId" varchar(64) NOT NULL,
	"clientName" varchar(255) NOT NULL,
	"projectName" text NOT NULL,
	"description" text,
	"status" "project_status" DEFAULT 'planning' NOT NULL,
	"startDate" timestamp,
	"dueDate" timestamp,
	"budget" varchar(50),
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contentIdeas" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "content_status" DEFAULT 'pending' NOT NULL,
	"submittedBy" varchar(64) NOT NULL,
	"reviewedBy" varchar(64),
	"reviewedAt" timestamp,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dailyFocus" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"focusText" text NOT NULL,
	"date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "googleTokens" (
	"userId" varchar(64) PRIMARY KEY NOT NULL,
	"accessToken" text NOT NULL,
	"refreshToken" text,
	"expiresAt" timestamp NOT NULL,
	"scope" text,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ideas" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" "idea_category" DEFAULT 'innovation' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"status" "idea_status" DEFAULT 'submitted' NOT NULL,
	"submittedBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "keyDates" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"date" timestamp NOT NULL,
	"type" date_type DEFAULT 'event' NOT NULL,
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"type" "notification_type" DEFAULT 'system' NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"isRead" "yes_no" DEFAULT 'no' NOT NULL,
	"link" varchar(255),
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "projectUpdates" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"projectId" varchar(64) NOT NULL,
	"message" text NOT NULL,
	"author" varchar(64) NOT NULL,
	"isInternal" "yes_no" DEFAULT 'no' NOT NULL,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "socialCampaigns" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" "campaign_status" DEFAULT 'active' NOT NULL,
	"folderUrl" varchar(500),
	"sheetUrl" varchar(500),
	"postsCount" varchar(10) DEFAULT '0',
	"assetsCount" varchar(10) DEFAULT '0',
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "taskRequests" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"requestedBy" varchar(64) NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"status" "request_status" DEFAULT 'pending' NOT NULL,
	"rejectionReason" text,
	"createdAt" timestamp DEFAULT now(),
	"reviewedAt" timestamp,
	"reviewedBy" varchar(64)
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"assignedTo" varchar(64),
	"status" "task_status" DEFAULT 'pending' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"category" varchar(100),
	"dueDate" timestamp,
	"createdBy" varchar(64) NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timeEntries" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"userId" varchar(64) NOT NULL,
	"clockIn" timestamp NOT NULL,
	"clockOut" timestamp,
	"totalHours" varchar(20),
	"notes" text,
	"date" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(64) PRIMARY KEY NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"lastSignedIn" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "googleTokens" ADD CONSTRAINT "googleTokens_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;