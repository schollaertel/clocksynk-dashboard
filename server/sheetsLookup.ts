/**
 * Google Sheets Lookup Integration
 * 
 * This module provides functionality to fetch data from Google Sheets
 * and use it as lookup tables in the dashboard.
 */

interface SheetRow {
  [key: string]: string | number | boolean;
}

/**
 * Fetch data from a Google Sheets spreadsheet
 * @param spreadsheetId - The ID of the Google Spreadsheet
 * @param range - The range to fetch (e.g., "Sheet1!A1:D10")
 * @returns Array of row objects
 */
export async function fetchSheetData(
  spreadsheetId: string,
  range: string
): Promise<SheetRow[]> {
  try {
    // Construct the public CSV export URL
    // This works for publicly accessible sheets
    const gid = extractGidFromRange(range);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
    }
    
    const csvText = await response.text();
    return parseCSV(csvText);
  } catch (error) {
    console.error("Error fetching sheet data:", error);
    return [];
  }
}

/**
 * Extract GID from range string
 * If range includes sheet name, try to match it
 */
function extractGidFromRange(range: string): string {
  // Default to first sheet
  return "0";
}

/**
 * Parse CSV text into array of objects
 */
function parseCSV(csvText: string): SheetRow[] {
  const lines = csvText.split("\n").filter(line => line.trim());
  if (lines.length === 0) return [];
  
  // First line is headers
  const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""));
  
  // Parse remaining lines
  const rows: SheetRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map(v => v.trim().replace(/"/g, ""));
    const row: SheetRow = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Lookup a value in sheet data
 * @param data - Array of sheet rows
 * @param lookupColumn - Column name to search in
 * @param lookupValue - Value to search for
 * @param returnColumn - Column name to return
 */
export function lookupValue(
  data: SheetRow[],
  lookupColumn: string,
  lookupValue: string | number,
  returnColumn: string
): string | number | boolean | null {
  const row = data.find(r => r[lookupColumn] === lookupValue);
  return row ? row[returnColumn] : null;
}

/**
 * Filter sheet data by criteria
 */
export function filterSheetData(
  data: SheetRow[],
  criteria: Record<string, string | number | boolean>
): SheetRow[] {
  return data.filter(row => {
    return Object.entries(criteria).every(([key, value]) => {
      return row[key] === value;
    });
  });
}

/**
 * Get unique values from a column
 */
export function getUniqueValues(
  data: SheetRow[],
  columnName: string
): (string | number | boolean)[] {
  const values = data.map(row => row[columnName]);
  return Array.from(new Set(values));
}

