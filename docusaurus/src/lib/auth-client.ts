import { createAuthClient } from "better-auth/react";

// Dynamically determine base URL for auth
const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // In browser, use current origin (works for both local and Vercel)
    return window.location.origin;
  }
  // SSR fallback
  return process.env.FRONTEND_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  fetchOptions: {
    credentials: "include",
  }
});

export const { useSession, signIn, signOut } = authClient;