/**
 * QuickBooks Online API Integration
 * 
 * This module provides read-only access to QuickBooks financial data.
 * Requires QuickBooks Online API credentials (OAuth 2.0).
 * 
 * Setup Instructions:
 * 1. Create an Intuit Developer account at https://developer.intuit.com
 * 2. Create an app and get Client ID and Client Secret
 * 3. Set up OAuth 2.0 redirect URI
 * 4. Add credentials to environment variables:
 *    - QUICKBOOKS_CLIENT_ID
 *    - QUICKBOOKS_CLIENT_SECRET
 *    - QUICKBOOKS_REDIRECT_URI
 *    - QUICKBOOKS_REALM_ID (Company ID)
 *    - QUICKBOOKS_ACCESS_TOKEN
 *    - QUICKBOOKS_REFRESH_TOKEN
 */

const QUICKBOOKS_API_BASE = "https://quickbooks.api.intuit.com/v3/company";
const QUICKBOOKS_SANDBOX_BASE = "https://sandbox-quickbooks.api.intuit.com/v3/company";

// Use sandbox for development, production for live data
const USE_SANDBOX = process.env.QUICKBOOKS_USE_SANDBOX === "true";
const API_BASE = USE_SANDBOX ? QUICKBOOKS_SANDBOX_BASE : QUICKBOOKS_API_BASE;

interface QuickBooksConfig {
  clientId: string;
  clientSecret: string;
  realmId: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Get QuickBooks configuration from environment
 */
function getQuickBooksConfig(): QuickBooksConfig | null {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
  const realmId = process.env.QUICKBOOKS_REALM_ID;
  const accessToken = process.env.QUICKBOOKS_ACCESS_TOKEN;
  const refreshToken = process.env.QUICKBOOKS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !realmId || !accessToken || !refreshToken) {
    console.warn("[QuickBooks] Missing configuration. Please set environment variables.");
    return null;
  }

  return {
    clientId,
    clientSecret,
    realmId,
    accessToken,
    refreshToken,
  };
}

/**
 * Make authenticated request to QuickBooks API
 */
async function quickBooksRequest(endpoint: string, config: QuickBooksConfig): Promise<any> {
  const url = `${API_BASE}/${config.realmId}/${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${config.accessToken}`,
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("QuickBooks access token expired. Please refresh the token.");
      }
      throw new Error(`QuickBooks API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("[QuickBooks] API request failed:", error);
    throw error;
  }
}

/**
 * Get company information
 */
export async function getCompanyInfo() {
  const config = getQuickBooksConfig();
  if (!config) {
    return {
      configured: false,
      message: "QuickBooks integration not configured",
    };
  }

  try {
    const data = await quickBooksRequest("companyinfo/1", config);
    return {
      configured: true,
      company: data.CompanyInfo,
    };
  } catch (error) {
    return {
      configured: true,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get profit and loss report
 */
export async function getProfitAndLoss(startDate?: string, endDate?: string) {
  const config = getQuickBooksConfig();
  if (!config) {
    return null;
  }

  try {
    // Default to current month if dates not provided
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const endpoint = `reports/ProfitAndLoss?start_date=${start}&end_date=${end}&accounting_method=Accrual`;
    const data = await quickBooksRequest(endpoint, config);
    
    return data;
  } catch (error) {
    console.error("[QuickBooks] Failed to get P&L report:", error);
    return null;
  }
}

/**
 * Get balance sheet
 */
export async function getBalanceSheet(asOfDate?: string) {
  const config = getQuickBooksConfig();
  if (!config) {
    return null;
  }

  try {
    const date = asOfDate || new Date().toISOString().split('T')[0];
    const endpoint = `reports/BalanceSheet?date=${date}`;
    const data = await quickBooksRequest(endpoint, config);
    
    return data;
  } catch (error) {
    console.error("[QuickBooks] Failed to get balance sheet:", error);
    return null;
  }
}

/**
 * Get invoices
 */
export async function getInvoices(maxResults: number = 100) {
  const config = getQuickBooksConfig();
  if (!config) {
    return [];
  }

  try {
    const endpoint = `query?query=SELECT * FROM Invoice MAXRESULTS ${maxResults}`;
    const data = await quickBooksRequest(endpoint, config);
    
    return data.QueryResponse?.Invoice || [];
  } catch (error) {
    console.error("[QuickBooks] Failed to get invoices:", error);
    return [];
  }
}

/**
 * Get expenses
 */
export async function getExpenses(maxResults: number = 100) {
  const config = getQuickBooksConfig();
  if (!config) {
    return [];
  }

  try {
    const endpoint = `query?query=SELECT * FROM Purchase WHERE PaymentType = 'Cash' MAXRESULTS ${maxResults}`;
    const data = await quickBooksRequest(endpoint, config);
    
    return data.QueryResponse?.Purchase || [];
  } catch (error) {
    console.error("[QuickBooks] Failed to get expenses:", error);
    return [];
  }
}

/**
 * Calculate financial metrics from QuickBooks data
 */
export async function getFinancialMetrics() {
  const config = getQuickBooksConfig();
  
  if (!config) {
    return {
      configured: false,
      revenue: 0,
      expenses: 0,
      profit: 0,
      burnRate: 0,
      runway: 0,
      message: "QuickBooks integration not configured. Please add credentials.",
    };
  }

  try {
    // Get current month P&L
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    const profitLoss = await getProfitAndLoss(monthStart, today);
    const balanceSheet = await getBalanceSheet();

    // Parse P&L data
    let revenue = 0;
    let expenses = 0;
    
    if (profitLoss?.Rows?.Row) {
      // QuickBooks P&L has a specific structure
      // This is a simplified parser - actual implementation may need adjustment
      const rows = profitLoss.Rows.Row;
      
      for (const row of rows) {
        if (row.Header?.ColData) {
          const header = row.Header.ColData[0]?.value || "";
          
          if (header.toLowerCase().includes("income") || header.toLowerCase().includes("revenue")) {
            const amount = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
            revenue += amount;
          }
          
          if (header.toLowerCase().includes("expense") || header.toLowerCase().includes("cost")) {
            const amount = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
            expenses += amount;
          }
        }
      }
    }

    const profit = revenue - expenses;
    const burnRate = expenses; // Monthly burn rate
    
    // Calculate runway from balance sheet cash
    let cash = 0;
    if (balanceSheet?.Rows?.Row) {
      // Find cash/bank accounts
      const rows = balanceSheet.Rows.Row;
      for (const row of rows) {
        if (row.Header?.ColData) {
          const header = row.Header.ColData[0]?.value || "";
          if (header.toLowerCase().includes("cash") || header.toLowerCase().includes("bank")) {
            cash = parseFloat(row.Summary?.ColData?.[1]?.value || "0");
          }
        }
      }
    }
    
    const runway = burnRate > 0 ? Math.floor(cash / burnRate) : 999;

    return {
      configured: true,
      revenue: Math.round(revenue),
      expenses: Math.round(expenses),
      profit: Math.round(profit),
      burnRate: Math.round(burnRate),
      runway,
      cash: Math.round(cash),
    };
  } catch (error) {
    console.error("[QuickBooks] Failed to calculate financial metrics:", error);
    return {
      configured: true,
      error: error instanceof Error ? error.message : "Failed to fetch financial data",
      revenue: 0,
      expenses: 0,
      profit: 0,
      burnRate: 0,
      runway: 0,
    };
  }
}

/**
 * Check if QuickBooks is configured
 */
export function isQuickBooksConfigured(): boolean {
  return getQuickBooksConfig() !== null;
}

/**
 * Get QuickBooks OAuth URL for initial setup
 */
export function getQuickBooksAuthUrl(): string {
  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI || "http://localhost:3000/api/quickbooks/callback";
  const scope = "com.intuit.quickbooks.accounting";
  const state = Math.random().toString(36).substring(7);

  if (!clientId) {
    throw new Error("QUICKBOOKS_CLIENT_ID not configured");
  }

  return `https://appcenter.intuit.com/connect/oauth2?client_id=${clientId}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;
}

