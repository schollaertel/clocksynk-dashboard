/**
 * Admin Middleware
 * 
 * Checks if the current user is the admin (erin@clocksynk.com)
 */

export const ADMIN_EMAIL = "erin@clocksynk.com";

export function isAdmin(userEmail: string | null | undefined): boolean {
  if (!userEmail) return false;
  return userEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

export function requireAdmin(userEmail: string | null | undefined) {
  if (!isAdmin(userEmail)) {
    throw new Error("Unauthorized: Admin access required");
  }
}

