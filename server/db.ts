import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.id) {
    throw new Error("User ID is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      id: user.id,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role === undefined) {
      if (user.id === ENV.ownerId) {
        user.role = 'admin';
        values.role = 'admin';
        updateSet.role = 'admin';
      }
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(id: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ClockSynk Dashboard Query Helpers

import {
  tasks,
  Task,
  InsertTask,
  taskRequests,
  TaskRequest,
  InsertTaskRequest,
  announcements,
  Announcement,
  InsertAnnouncement,
  ideas,
  Idea,
  InsertIdea,
  dailyFocus,
  DailyFocus,
  InsertDailyFocus,
  keyDates,
  KeyDate,
  InsertKeyDate,
} from "../drizzle/schema";
import { desc, and, gte, lte } from "drizzle-orm";

// Task helpers
export async function createTask(task: InsertTask): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(tasks).values({ ...task, id });
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

export async function getTasks(): Promise<Task[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).orderBy(desc(tasks.createdAt));
}

export async function getTaskById(id: string): Promise<Task | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result[0];
}

export async function updateTask(id: string, updates: Partial<InsertTask>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(tasks).set({ ...updates, updatedAt: new Date() }).where(eq(tasks.id, id));
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(tasks).where(eq(tasks.id, id));
}

// Announcement helpers
export async function createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `announcement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(announcements).values({ ...announcement, id });
  const result = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
  return result[0];
}

export async function getAnnouncements(): Promise<Announcement[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(announcements).orderBy(desc(announcements.createdAt));
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(announcements).where(eq(announcements.id, id));
}

// Idea helpers
export async function createIdea(idea: InsertIdea): Promise<Idea> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(ideas).values({ ...idea, id });
  const result = await db.select().from(ideas).where(eq(ideas.id, id)).limit(1);
  return result[0];
}

export async function getIdeas(): Promise<Idea[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ideas).orderBy(desc(ideas.createdAt));
}

export async function updateIdeaStatus(id: string, status: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ideas).set({ status: status as any }).where(eq(ideas.id, id));
}

// Daily Focus helpers
export async function createDailyFocus(focus: InsertDailyFocus): Promise<DailyFocus> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `focus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(dailyFocus).values({ ...focus, id });
  const result = await db.select().from(dailyFocus).where(eq(dailyFocus.id, id)).limit(1);
  return result[0];
}

export async function getTodaysFocus(): Promise<DailyFocus[]> {
  const db = await getDb();
  if (!db) return [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return db.select().from(dailyFocus)
    .where(and(
      gte(dailyFocus.date, today),
      lte(dailyFocus.date, tomorrow)
    ));
}

// Key Dates helpers
export async function createKeyDate(keyDate: InsertKeyDate): Promise<KeyDate> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `keydate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(keyDates).values({ ...keyDate, id });
  const result = await db.select().from(keyDates).where(eq(keyDates.id, id)).limit(1);
  return result[0];
}

export async function getKeyDates(): Promise<KeyDate[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(keyDates).orderBy(keyDates.date);
}

export async function deleteKeyDate(id: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(keyDates).where(eq(keyDates.id, id));
}


// Task Request helpers
export async function createTaskRequest(taskRequest: InsertTaskRequest): Promise<TaskRequest> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const id = `taskreq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  await db.insert(taskRequests).values({ ...taskRequest, id });
  const result = await db.select().from(taskRequests).where(eq(taskRequests.id, id)).limit(1);
  return result[0];
}

export async function getTaskRequests(userId?: string): Promise<TaskRequest[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (userId) {
    // Return only requests from this user
    return db.select().from(taskRequests)
      .where(eq(taskRequests.requestedBy, userId))
      .orderBy(taskRequests.createdAt);
  }
  
  // Return all requests (for admin)
  return db.select().from(taskRequests).orderBy(taskRequests.createdAt);
}

export async function approveTaskRequest(id: string, reviewerId: string, assignTo?: string): Promise<Task> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the request
  const requests = await db.select().from(taskRequests).where(eq(taskRequests.id, id)).limit(1);
  if (requests.length === 0) throw new Error("Task request not found");
  
  const request = requests[0];
  
  // Create the actual task
  const task = await createTask({
    title: request.title,
    description: request.description || "",
    assignedTo: assignTo || request.requestedBy,
    priority: request.priority,
    createdBy: reviewerId,
  });
  
  // Update request status
  await db.update(taskRequests)
    .set({ 
      status: "approved",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    })
    .where(eq(taskRequests.id, id));
  
  return task;
}

export async function rejectTaskRequest(id: string, reviewerId: string, reason?: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(taskRequests)
    .set({ 
      status: "rejected",
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: reason,
    })
    .where(eq(taskRequests.id, id));
}

