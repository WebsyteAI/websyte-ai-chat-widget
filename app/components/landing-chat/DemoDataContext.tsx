import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/lib/auth/auth-context";

// Demo data types
interface DemoStats {
  widgetCount: number;
  messageCount: number;
  userCount: number;
  todayWidgets: number;
  todayMessages: number;
}

interface DemoDataContextValue {
  // Auth state
  isAuthenticated: boolean;
  user: any | null;
  
  // Live statistics
  stats: DemoStats;
  
  // Feature flags
  features: {
    customWidgets: boolean;
    apiAccess: boolean;
    teamFeatures: boolean;
  };
  
  // Dynamic content
  waitlistCount: number;
  testimonials: Array<{
    name: string;
    role: string;
    content: string;
    avatar?: string;
  }>;
  
  // Methods
  refreshStats: () => Promise<void>;
}

// Default values
const defaultStats: DemoStats = {
  widgetCount: 3247,
  messageCount: 128459,
  userCount: 1893,
  todayWidgets: 47,
  todayMessages: 2341,
};

const defaultContext: DemoDataContextValue = {
  isAuthenticated: false,
  user: null,
  stats: defaultStats,
  features: {
    customWidgets: true,
    apiAccess: true,
    teamFeatures: false,
  },
  waitlistCount: 842,
  testimonials: [
    {
      name: "Sarah Chen",
      role: "Content Manager",
      content: "Reduced support tickets by 40% in the first week!",
    },
    {
      name: "Mike Rodriguez",
      role: "Developer",
      content: "Finally, an AI widget that doesn't break our design.",
    },
    {
      name: "Emma Wilson",
      role: "Founder",
      content: "Our docs are actually helpful now. Game changer!",
    },
  ],
  refreshStats: async () => {},
};

// Create context
const DemoDataContext = createContext<DemoDataContextValue>(defaultContext);

// Provider component
export function DemoDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState<DemoStats>(defaultStats);
  const [waitlistCount, setWaitlistCount] = useState(842);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        messageCount: prev.messageCount + Math.floor(Math.random() * 5),
        todayMessages: prev.todayMessages + Math.floor(Math.random() * 3),
      }));
      
      // Occasionally update other stats
      if (Math.random() > 0.9) {
        setStats(prev => ({
          ...prev,
          widgetCount: prev.widgetCount + 1,
          todayWidgets: prev.todayWidgets + 1,
          userCount: prev.userCount + 1,
        }));
        setWaitlistCount(prev => prev + Math.floor(Math.random() * 3));
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Fetch real stats (if implemented)
  const refreshStats = async () => {
    try {
      // In a real implementation, this would fetch from your API
      // const response = await fetch('/api/stats');
      // const data = await response.json();
      // setStats(data);
      
      // For demo, just simulate a refresh
      setStats(prev => ({
        ...prev,
        messageCount: prev.messageCount + Math.floor(Math.random() * 100),
      }));
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const value: DemoDataContextValue = {
    isAuthenticated,
    user,
    stats,
    features: {
      customWidgets: true,
      apiAccess: isAuthenticated,
      teamFeatures: user?.plan === 'pro',
    },
    waitlistCount,
    testimonials: defaultContext.testimonials,
    refreshStats,
  };

  return (
    <DemoDataContext.Provider value={value}>
      {children}
    </DemoDataContext.Provider>
  );
}

// Custom hook for using demo data
export function useDemoData() {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider');
  }
  return context;
}

// Specific hooks for common use cases
export function useLiveStats() {
  const { stats, refreshStats } = useDemoData();
  return { stats, refreshStats };
}

export function useAuthState() {
  const { isAuthenticated, user } = useDemoData();
  return { isAuthenticated, user };
}

export function useFeatureFlags() {
  const { features } = useDemoData();
  return features;
}