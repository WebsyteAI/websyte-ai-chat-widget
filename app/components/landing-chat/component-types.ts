// Type definitions for component props
export interface ComponentPropsMap {
  'feature-showcase': {
    filter?: 'all' | 'popular' | 'new';
    limit?: number;
  };
  'embed-demo': {
    type: 'standard' | 'custom';
  };
  'tech-stack': Record<string, never>; // No props
  'cta-button': {
    text: string;
    href?: string;
    variant?: 'default' | 'outline';
  };
  'video-demo': Record<string, never>;
  'pricing-info': {
    highlight?: boolean;
  };
  'performance-stats': Record<string, never>;
  'workflow-steps': Record<string, never>;
  'badge-list': Record<string, never>;
  'live-stats': {
    type: 'widgets' | 'messages' | 'users' | 'today';
    format?: 'number' | 'compact' | 'full';
  };
  'testimonial-carousel': {
    limit?: number;
    category?: string;
  };
  'auth-button': {
    action: 'signin' | 'signup';
    text?: string;
  };
  'feature-availability': {
    feature: keyof FeatureFlags;
  };
  'hero-section': Record<string, never>;
  'full-feature-grid': Record<string, never>;
  'comparison-table': Record<string, never>;
  'setup-instructions': Record<string, never>;
  'success-stories': Record<string, never>;
  'quick-start-guide': Record<string, never>;
  'api-example': Record<string, never>;
}

// Feature flags type
export interface FeatureFlags {
  customWidgets: boolean;
  apiAccess: boolean;
  teamFeatures: boolean;
}

// Helper type for getting component props
export type ComponentProps<T extends keyof ComponentPropsMap> = ComponentPropsMap[T];

// Type guard for checking if a component name is valid
export function isValidComponentName(name: string): name is keyof ComponentPropsMap {
  return name in ({
    'feature-showcase': true,
    'embed-demo': true,
    'tech-stack': true,
    'cta-button': true,
    'video-demo': true,
    'pricing-info': true,
    'performance-stats': true,
    'workflow-steps': true,
    'badge-list': true,
    'live-stats': true,
    'testimonial-carousel': true,
    'auth-button': true,
    'feature-availability': true,
    'hero-section': true,
    'full-feature-grid': true,
    'comparison-table': true,
    'setup-instructions': true,
    'success-stories': true,
    'quick-start-guide': true,
    'api-example': true,
  } as const);
}