/**
 * Google OAuth Integration
 * 
 * Handles Google Workspace authentication and API access
 */

import { google } from 'googleapis';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'https://dashboard.clocksynk.com/api/oauth/google/callback';

/**
 * Create OAuth2 client
 */
export function createOAuth2Client() {
  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );
}

/**
 * Get authorization URL for user login
 */
export function getAuthUrl(state?: string) {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/chat.spaces.readonly',
      'https://www.googleapis.com/auth/chat.messages.readonly',
    ],
    state,
  });
}

/**
 * Exchange authorization code for tokens
 */
export async function getTokensFromCode(code: string) {
  const oauth2Client = createOAuth2Client();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

/**
 * Get user info from Google
 */
export async function getUserInfo(accessToken: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  
  return data;
}

/**
 * List files from Google Drive
 */
export async function listDriveFiles(accessToken: string, query?: string) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  
  const response = await drive.files.list({
    pageSize: 50,
    fields: 'files(id, name, mimeType, modifiedTime, iconLink, webViewLink, thumbnailLink, size)',
    q: query,
    orderBy: 'modifiedTime desc',
  });
  
  return response.data.files || [];
}

/**
 * Get calendar events
 */
export async function listCalendarEvents(accessToken: string, calendarId = 'primary') {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  const response = await calendar.events.list({
    calendarId,
    timeMin: new Date().toISOString(),
    maxResults: 50,
    singleEvents: true,
    orderBy: 'startTime',
  });
  
  return response.data.items || [];
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    start: string; // ISO date string
    end?: string; // ISO date string
    attendees?: string[]; // email addresses
  },
  calendarId = 'primary'
) {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({ access_token: accessToken });
  
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  
  // If no end time provided, make it an all-day event
  const startDate = new Date(event.start);
  const endDate = event.end ? new Date(event.end) : new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
  
  const response = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.summary,
      description: event.description,
      start: {
        date: startDate.toISOString().split('T')[0], // All-day event
      },
      end: {
        date: endDate.toISOString().split('T')[0], // All-day event
      },
      attendees: event.attendees?.map(email => ({ email })),
      reminders: {
        useDefault: true,
      },
    },
  });
  
  return response.data;
}

/**
 * List Chat spaces (requires Chat API - may need additional setup)
 */
export async function listChatSpaces(accessToken: string) {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const chat = google.chat({ version: 'v1', auth: oauth2Client });
    
    const response = await chat.spaces.list({});
    return response.data.spaces || [];
  } catch (error) {
    console.error('[Google Chat] Error listing spaces:', error);
    return [];
  }
}

