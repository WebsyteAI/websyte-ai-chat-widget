import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and } from "drizzle-orm";
import * as schema from "../db/schema";
import type { Env } from "../types";

export class SimpleAuth {
  private db: ReturnType<typeof drizzle>;

  constructor(env: Env) {
    const sql = neon(env.DATABASE_URL);
    this.db = drizzle(sql, { schema });
  }

  // Generate a random ID
  private generateId(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Hash password using Web Crypto API
  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Generate session token
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Create user
  async createUser(email: string, password: string, name: string) {
    const hashedPassword = await this.hashPassword(password);
    const userId = this.generateId();

    try {
      const user = await this.db.insert(schema.user).values({
        id: userId,
        email,
        name,
        emailVerified: false,
      }).returning();

      // Create account record for email/password
      await this.db.insert(schema.account).values({
        id: this.generateId(),
        accountId: email,
        providerId: 'email',
        userId,
        password: hashedPassword,
      });

      return user[0];
    } catch (error) {
      throw new Error('User creation failed');
    }
  }

  // Authenticate user
  async authenticate(email: string, password: string) {
    const hashedPassword = await this.hashPassword(password);

    const account = await this.db.select()
      .from(schema.account)
      .leftJoin(schema.user, eq(schema.account.userId, schema.user.id))
      .where(
        and(
          eq(schema.account.accountId, email),
          eq(schema.account.providerId, 'email'),
          eq(schema.account.password, hashedPassword)
        )
      )
      .limit(1);

    if (!account[0] || !account[0].user) {
      throw new Error('Invalid credentials');
    }

    return account[0].user;
  }

  // Create session
  async createSession(userId: string, userAgent?: string, ipAddress?: string) {
    const sessionId = this.generateId();
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await this.db.insert(schema.session).values({
      id: sessionId,
      token,
      userId,
      expiresAt,
      userAgent,
      ipAddress,
    }).returning();

    return session[0];
  }

  // Get session
  async getSession(token: string) {
    const result = await this.db.select()
      .from(schema.session)
      .leftJoin(schema.user, eq(schema.session.userId, schema.user.id))
      .where(eq(schema.session.token, token))
      .limit(1);

    if (!result[0] || !result[0].user) {
      return null;
    }

    const session = result[0].session;
    
    // Check if session is expired
    if (session.expiresAt < new Date()) {
      await this.deleteSession(token);
      return null;
    }

    return {
      session: result[0].session,
      user: result[0].user,
    };
  }

  // Delete session
  async deleteSession(token: string) {
    await this.db.delete(schema.session).where(eq(schema.session.token, token));
  }

  // Extract session token from request
  extractSessionToken(request: Request): string | null {
    // Try cookie first
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const cookies = cookieHeader.split(';').map(c => c.trim());
      for (const cookie of cookies) {
        const [name, value] = cookie.split('=');
        if (name === 'session-token') {
          return value;
        }
      }
    }

    // Try Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    return null;
  }
}

export const createAuth = (env: Env) => new SimpleAuth(env);

export type Auth = SimpleAuth;