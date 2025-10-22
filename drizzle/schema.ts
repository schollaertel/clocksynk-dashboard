import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ClockSynk Dashboard Tables

// Tasks table for team task management
export const tasks = mysqlTable("tasks", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: varchar("assignedTo", { length: 64 }),
  status: mysqlEnum("status", ["pending", "in_progress", "overdue", "done"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  dueDate: timestamp("dueDate"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = Omit<typeof tasks.$inferInsert, 'id'>;

// Task Requests table - team members request tasks, admin approves
export const taskRequests = mysqlTable("taskRequests", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  requestedBy: varchar("requestedBy", { length: 64 }).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: varchar("reviewedBy", { length: 64 }),
});

export type TaskRequest = typeof taskRequests.$inferSelect;
export type InsertTaskRequest = Omit<typeof taskRequests.$inferInsert, 'id'>;

// Announcements table
export const announcements = mysqlTable("announcements", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  category: varchar("category", { length: 100 }),
  isPinned: mysqlEnum("isPinned", ["yes", "no"]).default("no").notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = Omit<typeof announcements.$inferInsert, 'id'>;

// Ideas table for team suggestions
export const ideas = mysqlTable("ideas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["innovation", "process", "product", "marketing"]).default("innovation").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high"]).default("medium").notNull(),
  status: mysqlEnum("status", ["submitted", "under_review", "in_progress", "implemented", "archived"]).default("submitted").notNull(),
  submittedBy: varchar("submittedBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = Omit<typeof ideas.$inferInsert, 'id'>;

// Daily Focus entries
export const dailyFocus = mysqlTable("dailyFocus", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  focusText: text("focusText").notNull(),
  date: timestamp("date").defaultNow(),
});

export type DailyFocus = typeof dailyFocus.$inferSelect;
export type InsertDailyFocus = Omit<typeof dailyFocus.$inferInsert, 'id'>;

// Key Dates and Milestones
export const keyDates = mysqlTable("keyDates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  type: mysqlEnum("type", ["deadline", "launch", "meeting", "event"]).default("event").notNull(),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type KeyDate = typeof keyDates.$inferSelect;
export type InsertKeyDate = Omit<typeof keyDates.$inferInsert, 'id'>;


// Time Tracking - Clock in/out entries
export const timeEntries = mysqlTable("timeEntries", {
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
export const clientProjects = mysqlTable("clientProjects", {
  id: varchar("id", { length: 64 }).primaryKey(),
  clientId: varchar("clientId", { length: 64 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  projectName: text("projectName").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["planning", "in_progress", "review", "completed"]).default("planning").notNull(),
  startDate: timestamp("startDate"),
  dueDate: timestamp("dueDate"),
  budget: varchar("budget", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type ClientProject = typeof clientProjects.$inferSelect;
export type InsertClientProject = Omit<typeof clientProjects.$inferInsert, 'id'>;

// Project Updates/Messages for client communication
export const projectUpdates = mysqlTable("projectUpdates", {
  id: varchar("id", { length: 64 }).primaryKey(),
  projectId: varchar("projectId", { length: 64 }).notNull(),
  message: text("message").notNull(),
  author: varchar("author", { length: 64 }).notNull(),
  isInternal: mysqlEnum("isInternal", ["yes", "no"]).default("no").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = Omit<typeof projectUpdates.$inferInsert, 'id'>;


// Notifications table for @mentions and team notifications
export const notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 64 }).primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["mention", "task", "announcement", "report", "system"]).default("system").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: mysqlEnum("isRead", ["yes", "no"]).default("no").notNull(),
  link: varchar("link", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = Omit<typeof notifications.$inferInsert, 'id'>;



// Social Media Content Ideas
export const contentIdeas = mysqlTable("contentIdeas", {
  id: varchar("id", { length: 64 }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "implemented"]).default("pending").notNull(),
  submittedBy: varchar("submittedBy", { length: 64 }).notNull(),
  reviewedBy: varchar("reviewedBy", { length: 64 }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export type ContentIdea = typeof contentIdeas.$inferSelect;
export type InsertContentIdea = Omit<typeof contentIdeas.$inferInsert, 'id'>;

// Social Media Campaigns
export const socialCampaigns = mysqlTable("socialCampaigns", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "scheduled", "completed", "archived"]).default("active").notNull(),
  folderUrl: varchar("folderUrl", { length: 500 }),
  sheetUrl: varchar("sheetUrl", { length: 500 }),
  postsCount: varchar("postsCount", { length: 10 }).default("0"),
  assetsCount: varchar("assetsCount", { length: 10 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type SocialCampaign = typeof socialCampaigns.$inferSelect;
export type InsertSocialCampaign = Omit<typeof socialCampaigns.$inferInsert, 'id'>;

