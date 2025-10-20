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
