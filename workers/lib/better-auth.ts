import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";
import type { Env } from "../types";

export const createAuth = (env: Env) => {
  try {
    const sql = neon(env.DATABASE_URL);
    const db = drizzle(sql, { schema });

    return betterAuth({
      database: drizzleAdapter(db, { 
        provider: "pg"
      }),
      baseURL: env.BETTER_AUTH_URL,
      secret: env.BETTER_AUTH_SECRET,
      socialProviders: {
        google: {
          clientId: env.GOOGLE_CLIENT_ID as string,
          clientSecret: env.GOOGLE_CLIENT_SECRET as string,
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // 1 day
      },
    });
  } catch (error) {
    console.error('Error creating Better Auth:', error);
    throw error;
  }
};

export type Auth = ReturnType<typeof createAuth>;