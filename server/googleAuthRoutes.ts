/**
 * Google OAuth Routes
 * 
 * Handles Google OAuth authentication flow
 */

import { Router } from 'express';
import { getAuthUrl, getTokensFromCode, getUserInfo } from './googleOAuth';

export const googleAuthRouter = Router();

// Store tokens temporarily (in production, use database)
const userTokens = new Map<string, any>();

/**
 * Initiate Google OAuth flow
 */
googleAuthRouter.get('/google/login', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  const authUrl = getAuthUrl(state);
  res.redirect(authUrl);
});

/**
 * Handle OAuth callback
 */
googleAuthRouter.get('/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).send('Missing authorization code');
    }
    
    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);
    
    // Get user info
    const userInfo = await getUserInfo(tokens.access_token!);
    
    // Store tokens (in production, save to database with user ID)
    if (userInfo.id) {
      userTokens.set(userInfo.id, {
        ...tokens,
        userInfo,
        expiresAt: Date.now() + (tokens.expiry_date || 3600000),
      });
    }
    
    // Redirect to dashboard
    res.redirect('/?google_auth=success');
  } catch (error) {
    console.error('[Google OAuth] Error in callback:', error);
    res.redirect('/?google_auth=error');
  }
});

/**
 * Get current user's Google tokens
 */
export function getUserTokens(userId: string) {
  return userTokens.get(userId);
}

/**
 * Check if user has valid Google tokens
 */
export function hasValidGoogleAuth(userId: string): boolean {
  const tokens = userTokens.get(userId);
  if (!tokens) return false;
  
  // Check if tokens are expired
  if (tokens.expiresAt && tokens.expiresAt < Date.now()) {
    userTokens.delete(userId);
    return false;
  }
  
  return true;
}

