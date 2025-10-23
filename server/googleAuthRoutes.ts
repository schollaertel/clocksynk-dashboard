/**
 * Google OAuth Routes for Workspace API Access
 * 
 * This handles Google OAuth ONLY for accessing Google Workspace APIs
 * (Sheets, Calendar, Drive, Chat). User login is handled by Manus Auth.
 */

import { Router } from 'express';
import { getAuthUrl, getTokensFromCode, getUserInfo } from './googleOAuth';
import * as db from './db';

export const googleAuthRouter = Router();

/**
 * Initiate Google Workspace OAuth flow
 * User must be logged in via Manus Auth first
 */
googleAuthRouter.get('/google/login', (req, res) => {
  // Check if user is logged in via Manus Auth
  const user = (req as any).user;
  if (!user) {
    return res.redirect('/?error=not_logged_in');
  }
  
  const state = JSON.stringify({
    userId: user.id,
    timestamp: Date.now(),
  });
  
  const authUrl = getAuthUrl(state);
  res.redirect(authUrl);
});

/**
 * Handle OAuth callback from Google
 * Save tokens to database linked to user account
 */
googleAuthRouter.get('/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.redirect('/?google_auth=error&reason=missing_code');
    }
    
    // Parse state to get user ID
    let userId: string;
    try {
      const stateData = JSON.parse(state as string);
      userId = stateData.userId;
    } catch {
      return res.redirect('/?google_auth=error&reason=invalid_state');
    }
    
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    if (!tokens.access_token) {
      return res.redirect('/?google_auth=error&reason=no_access_token');
    }
    
    // Calculate expiration time
    const expiresAt = new Date(Date.now() + (tokens.expiry_date || 3600000));
    
    // Save tokens to database
    await db.saveGoogleTokens(userId, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scope: tokens.scope,
    });
    
    // Redirect to dashboard with success message
    res.redirect('/?google_auth=success');
  } catch (error) {
    console.error('[Google OAuth] Error in callback:', error);
    res.redirect('/?google_auth=error&reason=server_error');
  }
});

/**
 * Disconnect Google Workspace
 */
googleAuthRouter.post('/google/disconnect', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    
    await db.deleteGoogleTokens(user.id);
    res.json({ success: true });
  } catch (error) {
    console.error('[Google OAuth] Error disconnecting:', error);
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

/**
 * Check Google connection status
 */
googleAuthRouter.get('/google/status', async (req, res) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.json({ connected: false });
    }
    
    const hasTokens = await db.hasValidGoogleTokens(user.id);
    res.json({ connected: hasTokens });
  } catch (error) {
    console.error('[Google OAuth] Error checking status:', error);
    res.json({ connected: false });
  }
});

/**
 * Get current user's Google tokens (for internal use)
 */
export async function getUserGoogleTokens(userId: string) {
  return await db.getGoogleTokens(userId);
}

/**
 * Check if user has valid Google authentication
 */
export async function hasValidGoogleAuth(userId: string): Promise<boolean> {
  return await db.hasValidGoogleTokens(userId);
}

