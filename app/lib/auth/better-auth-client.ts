import { createAuthClient } from "better-auth/client";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : "",
  basePath: "/api/auth",
  plugins: [
    adminClient()
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;