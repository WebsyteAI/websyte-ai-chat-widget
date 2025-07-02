import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router";
import { useDemoData, useLiveStats, useAuthState, useFeatureFlags } from "./DemoDataContext";
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Rocket,
  Lock,
  CheckCircle
} from "lucide-react";

// Live statistics component
export function LiveStats({ 
  type = 'widgets', 
  format = 'compact' 
}: { 
  type?: 'widgets' | 'messages' | 'users' | 'today';
  format?: 'number' | 'compact' | 'full';
}) {
  const { stats } = useLiveStats();
  
  const getValue = () => {
    switch (type) {
      case 'widgets':
        return stats.widgetCount;
      case 'messages':
        return stats.messageCount;
      case 'users':
        return stats.userCount;
      case 'today':
        return stats.todayMessages;
      default:
        return 0;
    }
  };
  
  const formatValue = (value: number) => {
    if (format === 'number') return value.toString();
    if (format === 'compact') {
      if (value > 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value > 1000) return `${(value / 1000).toFixed(1)}K`;
      return value.toString();
    }
    return value.toLocaleString();
  };
  
  const value = getValue();
  const formattedValue = formatValue(value);
  
  if (format === 'full') {
    return (
      <Card className="inline-block">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {type === 'widgets' && 'Total Widgets Created'}
            {type === 'messages' && 'Messages Processed'}
            {type === 'users' && 'Happy Users'}
            {type === 'today' && "Today's Activity"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedValue}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <TrendingUp className="inline w-3 h-3 mr-1" />
            Live counter
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return <span className="font-bold text-primary">{formattedValue}</span>;
}

// Testimonial carousel component
export function TestimonialCarousel({ 
  limit = 3,
  category 
}: { 
  limit?: number;
  category?: string;
}) {
  const { testimonials } = useDemoData();
  
  const displayTestimonials = testimonials.slice(0, limit);
  
  return (
    <div className="grid md:grid-cols-3 gap-4 my-4">
      {displayTestimonials.map((testimonial, index) => (
        <Card key={index} className="border-muted">
          <CardContent className="pt-6">
            <p className="text-sm italic mb-4">"{testimonial.content}"</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{testimonial.name}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Auth-aware button component
export function AuthButton({ 
  action = 'signup',
  text 
}: { 
  action?: 'signin' | 'signup';
  text?: string;
}) {
  const { isAuthenticated } = useAuthState();
  
  if (isAuthenticated) {
    return (
      <Link to="/dashboard">
        <Button size="lg" className="w-full sm:w-auto">
          <Rocket className="w-4 h-4 mr-2" />
          Go to Dashboard
        </Button>
      </Link>
    );
  }
  
  const defaultText = action === 'signin' ? 'Sign In' : 'Get Started Free';
  const href = action === 'signin' ? '/login' : '/login?mode=register';
  
  return (
    <Link to={href}>
      <Button size="lg" className="w-full sm:w-auto">
        {text || defaultText}
      </Button>
    </Link>
  );
}

// Feature availability component
export function FeatureAvailability({ 
  feature 
}: { 
  feature: 'customWidgets' | 'apiAccess' | 'teamFeatures';
}) {
  const features = useFeatureFlags();
  const { isAuthenticated } = useAuthState();
  
  const isAvailable = features[feature];
  
  const featureInfo = {
    customWidgets: {
      name: 'Custom Widgets',
      description: 'Create AI assistants with your own knowledge base',
      requirement: 'Free account',
    },
    apiAccess: {
      name: 'API Access',
      description: 'Programmatic widget management',
      requirement: 'Sign in required',
    },
    teamFeatures: {
      name: 'Team Features',
      description: 'Collaborate with your team',
      requirement: 'Pro plan',
    },
  };
  
  const info = featureInfo[feature];
  
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted">
      {isAvailable ? (
        <>
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Available</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{info.requirement}</span>
        </>
      )}
    </div>
  );
}

// Dynamic pricing component
export function DynamicPricing({ 
  highlight = false 
}: { 
  highlight?: boolean;
}) {
  const { waitlistCount } = useDemoData();
  const { isAuthenticated } = useAuthState();
  
  return (
    <Card className={highlight ? "border-primary shadow-lg" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Forever Free Plan</CardTitle>
          <Badge variant="secondary" className="text-lg">
            $0/month
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Everything included:</p>
          <ul className="space-y-1 text-sm">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Unlimited widgets
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Unlimited messages
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              All AI features
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              API access
            </li>
          </ul>
        </div>
        
        <div className="pt-4 space-y-3">
          <AuthButton action="signup" text="Start Free Now" />
          
          <p className="text-xs text-center text-muted-foreground">
            Join <LiveStats type="users" format="compact" /> happy users
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity feed component
export function ActivityFeed() {
  const { stats } = useLiveStats();
  
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm">
        <LiveStats type="today" format="number" /> messages sent in the last hour
      </span>
    </div>
  );
}