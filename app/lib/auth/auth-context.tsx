import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient } from './better-auth-client';

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified?: boolean;
}

export interface Session {
  id: string;
  token: string;
  expiresAt: Date;
  userId: string;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const isAuthenticated = !!user && !!session;

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = await authClient.getSession();
      
      if (sessionData?.data?.user && sessionData?.data?.session) {
        setUser({
          id: sessionData.data.user.id,
          email: sessionData.data.user.email,
          name: sessionData.data.user.name,
          image: sessionData.data.user.image || undefined,
          emailVerified: sessionData.data.user.emailVerified,
        });
        setSession({
          id: sessionData.data.session.id,
          token: sessionData.data.session.token,
          expiresAt: new Date(sessionData.data.session.expiresAt),
          userId: sessionData.data.session.userId,
        });

        // Check admin status from user role
        const userRole = (sessionData.data.user as any).role;
        setIsAdmin(userRole === 'admin');
      }
    } catch (error) {
      console.error('Session check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      console.log('Attempting Google OAuth with Better Auth client...');
      
      // Use Better Auth client for social sign-in
      const { data, error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/dashboard'
      });

      if (error) {
        throw new Error(error.message || 'Google OAuth initiation failed');
      }

      // Better Auth handles the redirect automatically
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };


  const signOut = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated,
    isAdmin,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}