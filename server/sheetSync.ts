/**
 * Sheet Sync System - Syncs data from private Google Sheet to dashboard database
 * 
 * This allows the Google Sheet to remain private while the dashboard displays the data.
 * Only the admin (Erin) needs access to the sheet.
 * 
 * How it works:
 * 1. Admin provides sheet URL or makes it public temporarily
 * 2. System fetches data from sheet
 * 3. Data is stored in dashboard database
 * 4. Sheet can be made private again
 * 5. Dashboard displays data from database
 * 6. Admin can manually sync or set up automatic sync
 */

import { fetchSheetData } from "./googleSheets";
import { getDb } from "./db";
import { tasks, announcements, ideas, keyDates } from "../drizzle/schema";
import { nanoid } from "nanoid";

/**
 * Sync tasks from Google Sheet to database
 */
export async function syncTasksFromSheet(tabName: string = "Sprint") {
  try {
    const rows = await fetchSheetData(tabName);
    const db = await getDb();
    
    if (!db) {
      throw new Error("Database not available");
    }

    // Clear existing tasks (or implement upsert logic)
    await db.delete(tasks);

    // Insert tasks from sheet
    for (const row of rows) {
      const title = String(row.task || row.Task || "").trim();
      if (!title) continue; // Skip empty rows

      await db.insert(tasks).values({
        id: nanoid(),
        title,
        description: String(row.notes || row.Notes || ""),
        assignedTo: String(row.assignee || row.Assignee || "Unassigned"),
        status: normalizeStatus(String(row.status || row.Status || "")),
        priority: normalizePriority(String(row.priority || row.Priority || "")),
        dueDate: parseDateString(String(row.dueDate || row["Due Date"] || "")),
        createdBy: "system",
      });
    }

    return { success: true, count: rows.length };
  } catch (error) {
    console.error("[Sheet Sync] Error syncing tasks:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Parse date string from sheet
 */
function parseDateString(dateStr: string): Date | null {
  if (!dateStr || dateStr.trim() === "") return null;
  
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

/**
 * Normalize status from sheet to database enum
 */
function normalizeStatus(status?: string): "pending" | "in_progress" | "done" | "overdue" {
  if (!status) return "pending";
  
  const lower = status.toLowerCase().trim();
  
  if (lower.includes("progress") || lower.includes("working")) return "in_progress";
  if (lower.includes("done") || lower.includes("complete")) return "done";
  if (lower.includes("overdue") || lower.includes("late")) return "overdue";
  
  return "pending";
}

/**
 * Normalize priority from sheet to database enum
 */
function normalizePriority(priority?: string): "low" | "medium" | "high" {
  if (!priority) return "medium";
  
  const lower = priority.toLowerCase().trim();
  
  if (lower.includes("high") || lower.includes("urgent")) return "high";
  if (lower.includes("low")) return "low";
  
  return "medium";
}

/**
 * Get sync status
 */
export async function getSyncStatus() {
  const db = await getDb();
  
  if (!db) {
    return { lastSync: null, taskCount: 0 };
  }

  const taskCount = await db.select().from(tasks);
  
  return {
    lastSync: new Date(), // TODO: Store this in a settings table
    taskCount: taskCount.length,
  };
}

