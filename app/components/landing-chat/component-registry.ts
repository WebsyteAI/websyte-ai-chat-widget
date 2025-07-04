import { createElement } from "react";
import type { ComponentType, ReactElement } from "react";
import * as DemoComponents from "./DemoComponents";
import * as SmartComponents from "./SmartComponents";
import * as LandingComponents from "./LandingComponents";
import type { ComponentPropsMap } from "./component-types";

// Enhanced component config
export interface ComponentConfig<T extends keyof ComponentPropsMap = keyof ComponentPropsMap> {
  component: ComponentType<ComponentPropsMap[T]>;
  dataHook?: () => Partial<ComponentPropsMap[T]>;
  defaultProps?: Partial<ComponentPropsMap[T]>;
}

// Component registry type - now supports both simple components and configs
export type ComponentRegistry = {
  [K in keyof ComponentPropsMap]?: ComponentType<ComponentPropsMap[K]> | ComponentConfig<K>;
} & {
  [key: string]: ComponentType<any> | ComponentConfig<any>;
};

// Default component registry for landing page demo
export const defaultComponentRegistry: ComponentRegistry = {
  // Static components
  "feature-showcase": DemoComponents.FeatureShowcase,
  "cta-button": DemoComponents.CTAButton,
  "pricing-info": DemoComponents.PricingInfo,
  "badge-list": DemoComponents.BadgeList,
  
  // Smart components with data hooks
  "live-stats": SmartComponents.LiveStats,
  "testimonial-carousel": SmartComponents.TestimonialCarousel,
  "auth-button": SmartComponents.AuthButton,
  "feature-availability": SmartComponents.FeatureAvailability,
  "dynamic-pricing": SmartComponents.DynamicPricing,
  "activity-feed": SmartComponents.ActivityFeed,
  
  // Landing page components
  "hero-section": LandingComponents.HeroSection,
  "full-feature-grid": LandingComponents.FullFeatureGrid,
  "comparison-table": LandingComponents.ComparisonTable,
  "setup-instructions": LandingComponents.SetupInstructions,
  "success-stories": LandingComponents.SuccessStories,
  "quick-start-guide": LandingComponents.QuickStartGuide,
  "api-example": LandingComponents.APIExample,
  "video-demo": LandingComponents.VideoDemo,
  "workflow-steps": LandingComponents.WorkflowSteps,
  "tech-stack": LandingComponents.TechStack,
  "performance-stats": LandingComponents.PerformanceStats,
  "embed-demo": LandingComponents.EmbedDemo,
  "original-features": LandingComponents.OriginalFeatures,
  "one-line-setup": LandingComponents.OneLineSetup,
  "free-forever": LandingComponents.FreeForever,
  
  // SaaS-specific components
  "saas-features": LandingComponents.SaasFeatures,
  "roi-calculator": LandingComponents.RoiCalculator,
  "content-sources": LandingComponents.ContentSources,
  "saas-case-studies": LandingComponents.SaasCaseStudies,
  "saas-pricing": LandingComponents.SaasPricing,
  "saas-integrations": LandingComponents.SaasIntegrations,
  "saas-comparison-table": LandingComponents.SaasComparisonTable,
  "support-metrics": LandingComponents.SupportMetrics,
  "knowledge-base-transformation": LandingComponents.KnowledgeBaseTransformation,
  "tech-architecture": LandingComponents.TechArchitecture,
  "saas-tech-specs": LandingComponents.SaasTechSpecs,
  "interactive-demo": LandingComponents.InteractiveDemo,
  "integration-examples": LandingComponents.IntegrationExamples,
  "testimonials": LandingComponents.Testimonials,
  "comparison-cta": LandingComponents.ComparisonCta,
};

// Parser for component syntax: {{component:name prop1="value1" prop2="value2"}}
export function parseComponentSyntax(text: string): {
  componentName: string;
  props: Record<string, any>;
} | null {
  const match = text.match(/^\{\{component:(\S+)(?:\s+(.+?))?\}\}$/);
  if (!match) return null;

  const componentName = match[1];
  const propsString = match[2] || "";

  // Simple prop parser - handles prop="value" syntax
  const props: Record<string, any> = {};
  const propRegex = /(\w+)="([^"]*)"/g;
  let propMatch;
  
  while ((propMatch = propRegex.exec(propsString)) !== null) {
    const [, key, value] = propMatch;
    // Try to parse as JSON for complex values, fallback to string
    try {
      props[key] = JSON.parse(value);
    } catch {
      props[key] = value;
    }
  }

  return { componentName, props };
}

// Helper to create a component registry with additional components
export function createComponentRegistry(
  additionalComponents: ComponentRegistry = {}
): ComponentRegistry {
  return {
    ...defaultComponentRegistry,
    ...additionalComponents,
  };
}

// Check if entry is a component config
function isComponentConfig(entry: any): entry is ComponentConfig {
  return entry && typeof entry === 'object' && 'component' in entry;
}

// Type-safe component renderer with data hook support
export function renderComponent(
  componentName: string,
  props: Record<string, any>,
  registry: ComponentRegistry = defaultComponentRegistry
): ReactElement | null {
  const entry = registry[componentName];
  if (!entry) {
    console.warn(`Component "${componentName}" not found in registry`);
    return null;
  }
  
  if (isComponentConfig(entry)) {
    // Handle component config with data hooks
    const { component: Component, dataHook, defaultProps = {} } = entry;
    
    // Merge props: defaultProps < dataHook < explicit props
    let finalProps = { ...defaultProps };
    
    if (dataHook) {
      const hookData = dataHook();
      finalProps = { ...finalProps, ...hookData };
    }
    
    finalProps = { ...finalProps, ...props };
    
    return createElement(Component, finalProps);
  } else {
    // Simple component
    return createElement(entry, props);
  }
}