/**
 * Google Sheets Integration
 * 
 * This module provides read/write access to the ClockSynk Google Sheets
 * as the single source of truth for all data.
 */

const SPREADSHEET_ID = "1MvIb2iBnX-9WVlq89D6HDzzvaLi4zswdnNML5NEJCL8";

interface SheetRow {
  [key: string]: string | number | boolean | Date | null;
}

/**
 * Fetch data from a specific sheet tab
 */
export async function fetchSheetData(
  sheetName: string,
  range?: string
): Promise<SheetRow[]> {
  try {
    // For public sheets, we can use CSV export
    // Format: https://docs.google.com/spreadsheets/d/{id}/gviz/tq?tqx=out:csv&sheet={sheetName}
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;
    
    console.log(`[Google Sheets] Fetching sheet: ${sheetName}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ClockSynk-Dashboard/1.0',
      },
    });
    
    if (!response.ok) {
      console.error(`[Google Sheets] Failed to fetch sheet "${sheetName}": ${response.status} ${response.statusText}`);
      console.error(`[Google Sheets] Make sure the sheet is publicly accessible (Anyone with link can view)`);
      return [];
    }
    
    const csvText = await response.text();
    const data = parseCSV(csvText);
    console.log(`[Google Sheets] Successfully fetched ${data.length} rows from "${sheetName}"`);
    return data;
  } catch (error) {
    console.error(`[Google Sheets] Error fetching sheet "${sheetName}":`, error);
    console.error(`[Google Sheets] This usually means the sheet is not publicly accessible or the sheet name is incorrect.`);
    return [];
  }
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText: string): SheetRow[] {
  const lines = csvText.split("\n").filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // First line is headers
  const headers = parseCSVLine(lines[0]);
  
  // Parse remaining lines
  const rows: SheetRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: SheetRow = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || "";
      row[header] = value;
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}

/**
 * Get tasks from Sprint sheet
 */
export async function getTasks(): Promise<any[]> {
  const data = await fetchSheetData("Sprint");
  
  return data.map((row, index) => ({
    id: `task-${index}`,
    title: row.Task || "",
    description: "",
    assignedTo: row.Owner || "",
    status: mapStatus(row.Status as string),
    priority: "medium",
    category: row.Workstream || "",
    dueDate: row.Due ? new Date(row.Due as string) : null,
    createdBy: "system",
    createdAt: row.Start ? new Date(row.Start as string) : new Date(),
  }));
}

/**
 * Map Google Sheets status to dashboard status
 */
function mapStatus(sheetStatus: string): string {
  const status = (sheetStatus || "").toLowerCase();
  if (status.includes("done")) return "done";
  if (status.includes("progress")) return "in_progress";
  if (status.includes("blocked")) return "overdue";
  if (status.includes("planned")) return "pending";
  return "pending";
}

/**
 * Get ideas from Idea Dump sheet
 */
export async function getIdeas(): Promise<any[]> {
  const data = await fetchSheetData("Idea Dump");
  
  return data.map((row, index) => ({
    id: `idea-${index}`,
    title: row.Idea || row.Title || "",
    description: row.Description || row.Details || "",
    category: "innovation",
    priority: "medium",
    status: "submitted",
    createdBy: row.Owner || row.Submitter || "system",
    createdAt: new Date(),
  }));
}

/**
 * Get sponsors data
 */
export async function getSponsors(): Promise<any[]> {
  const data = await fetchSheetData("Sponsors");
  
  return data.map((row, index) => ({
    id: `sponsor-${index}`,
    name: row.Sponsor || row.Name || "",
    stage: row.Stage || "",
    nextStep: row["Next Step"] || "",
    owner: row.Owner || "",
  }));
}

/**
 * Get meeting notes
 */
export async function getMeetingNotes(): Promise<any[]> {
  const data = await fetchSheetData("Meeting Notes");
  
  return data.map((row, index) => ({
    id: `meeting-${index}`,
    date: row.Date ? new Date(row.Date as string) : new Date(),
    with: row.With || "",
    purpose: row.Purpose || "",
    decisions: row.Decisions || "",
    actionItems: row["Action Items"] || "",
    owner: row.Owner || "",
    due: row.Due ? new Date(row.Due as string) : null,
  }));
}

/**
 * Write data back to Google Sheets
 * Note: This requires Google Sheets API with authentication
 * For now, we'll provide instructions for manual updates or Apps Script
 */
export async function writeToSheet(
  sheetName: string,
  data: SheetRow[]
): Promise<boolean> {
  // This would require Google Sheets API with OAuth
  // For the MVP, users can edit directly in the embedded sheet
  console.log(`Write to ${sheetName} requested - edit directly in embedded sheet`);
  return false;
}

