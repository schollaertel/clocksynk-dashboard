import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Define enums for PostgreSQL
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "overdue", "done"]);
export const priorityEnum = pgEnum("priority", ["low", "medium", "high"]);
export const requestStatusEnum = pgEnum("request_status", ["pending", "approved", "rejected"]);
export const yesNoEnum = pgEnum("yes_no", ["yes", "no"]);
export const ideaCategoryEnum = pgEnum("idea_category", ["innovation", "process", "product", "marketing"]);
export const ideaStatusEnum = pgEnum("idea_status", ["submitted", "under_review", "in_progress", "implemented", "archived"]);
export const dateTypeEnum = pgEnum("date_type", ["deadline", "launch", "meeting", "event"]);
export const projectStatusEnum = pgEnum("project_status", ["planning", "in_progress", "review", "completed"]);
export const notificationTypeEnum = pgEnum("notification_type", ["mention", "task", "announcement", "report", "system"]);
export const contentStatusEnum = pgEnum("content_status", ["pending", "approved", "rejected", "implemented"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["active", "scheduled", "completed", "archived"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ClockSynk Dashboard Tables

// Tasks table for team task management
export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assignedTo", { length: 64 }),
  status: taskStatusEnum("status").default("pending").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  dueDate: timestamp("dueDate"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = Omit<typeof tasks.$inferInsert, 'id'>;

// Task Requests table - team members request tasks, admin approves
export const taskRequests = pgTable("taskRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  requestedBy: varchar("requestedBy", { length: 64 }).notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: requestStatusEnum("status").default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: varchar("reviewedBy", { length: 64 }),
});

export type TaskRequest = typeof taskRequests.$inferSelect;
export type InsertTaskRequest = Omit<typeof taskRequests.$inferInsert, 'id'>;

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  isPinned: yesNoEnum("isPinned").default("no").notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = Omit<typeof announcements.$inferInsert, 'id'>;

// Ideas table for team suggestions
export const ideas = pgTable("ideas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: ideaCategoryEnum("category").default("innovation").notNull(),
  priority: priorityEnum("priority").default("medium").notNull(),
  status: ideaStatusEnum("status").default("submitted").notNull(),
  submittedBy: varchar("submittedBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = Omit<typeof ideas.$inferInsert, 'id'>;

// Daily Focus entries
export const dailyFocus = pgTable("dailyFocus", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  focusText: text("focusText").notNull(),
  date: timestamp("date").defaultNow(),
});

export type DailyFocus = typeof dailyFocus.$inferSelect;
export type InsertDailyFocus = Omit<typeof dailyFocus.$inferInsert, 'id'>;

// Key Dates and Milestones
export const keyDates = pgTable("keyDates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  type: dateTypeEnum("type").default("event").notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type KeyDate = typeof keyDates.$inferSelect;
export type InsertKeyDate = Omit<typeof keyDates.$inferInsert, 'id'>;


// Time Tracking - Clock in/out entries
export const timeEntries = pgTable("timeEntries", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  clockIn: timestamp("clockIn").notNull(),
  clockOut: timestamp("clockOut"),
  totalHours: varchar("totalHours", { length: 20 }),
  notes: text("notes"),
  date: timestamp("date").notNull(),
});

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = Omit<typeof timeEntries.$inferInsert, 'id'>;

// Client Projects for client portal
export const clientProjects = pgTable("clientProjects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  projectName: text("projectName").notNull(),
  description: text("description"),
  status: projectStatusEnum("status").default("planning").notNull(),
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  budget: varchar("budget", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = Omit<typeof clientProjects.$inferInsert, 'id'>;

// Project Updates/Messages for client communication
export const projectUpdates = pgTable("projectUpdates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  author: varchar("author", { length: 64 }).notNull(),
  isInternal: yesNoEnum("isInternal").default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = Omit<typeof projectUpdates.$inferInsert, 'id'>;


// Notifications table for @mentions and team notifications
export const notifications = pgTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  type: notificationTypeEnum("type").default("system").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: yesNoEnum("isRead").default("no").notNull(),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = Omit<typeof notifications.$inferInsert, 'id'>;



// Social Media Content Ideas
export const contentIdeas = pgTable("contentIdeas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: contentStatusEnum("status").default("pending").notNull(),
  submittedBy: varchar("submittedBy", { length: 64 }).notNull(),
  reviewedBy: varchar("reviewedBy", { length: 64 }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = Omit<typeof contentIdeas.$inferInsert, 'id'>;

// Social Media Campaigns
export const socialCampaigns = pgTable("socialCampaigns", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: campaignStatusEnum("status").default("active").notNull(),
  folderUrl: varchar("folderUrl", { length: 500 }),
  sheetUrl: varchar("sheetUrl", { length: 500 }),
  postsCount: varchar("postsCount", { length: 10 }).default("0"),
  assetsCount: varchar("assetsCount", { length: 10 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type SocialCampaign = typeof socialCampaigns.$inferSelect;
export type InsertSocialCampaign = Omit<typeof socialCampaigns.$inferInsert, 'id'>;



// Google OAuth Tokens - for Google Workspace API access
export const googleTokens = pgTable("googleTokens", {
  userId: varchar("userId", { length: 64 }).primaryKey().references(() => users.id),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt").notNull(),
  scope: text("scope"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type GoogleToken = typeof googleTokens.$inferSelect;
export type InsertGoogleToken = typeof googleTokens.$inferInsert;

