export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Get environment variables from window object injected by server
const getEnv = (key: string, defaultValue: string = ""): string => {
  if (typeof window !== "undefined" && (window as any).__ENV__) {
    return (window as any).__ENV__[key] || defaultValue;
  }
  return defaultValue;
};

export const APP_TITLE = getEnv("VITE_APP_TITLE", "App");
export const APP_LOGO =
  getEnv("VITE_APP_LOGO", "https://placehold.co/128x128/E1E7EF/1F2937?text=App");

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = getEnv("VITE_OAUTH_PORTAL_URL");
  const appId = getEnv("VITE_APP_ID");
  
  if (!oauthPortalUrl || !appId) {
    console.error("Missing OAuth configuration:", { oauthPortalUrl, appId });
  }
  
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);
  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");
  return url.toString();
};
