# UI Component Library Documentation

This directory documents the UI component system, including shadcn/ui integration, custom components, and design patterns.

## 📚 Documentation Index

### Component Library
- [**SHADCN-SETUP.md**](./SHADCN-SETUP.md) - shadcn/ui configuration and customization
- [**COMPONENTS.md**](./COMPONENTS.md) - Complete component catalog with examples
- [**THEMING.md**](./THEMING.md) - Theme system, CSS variables, and customization
- [**PATTERNS.md**](./PATTERNS.md) - UI patterns and best practices

### Specialized Topics
- [**CHAT-COMPONENTS.md**](./CHAT-COMPONENTS.md) - Chat widget component architecture
- [**LANDING-COMPONENTS.md**](./LANDING-COMPONENTS.md) - Landing page component system
- [**ANIMATIONS.md**](./ANIMATIONS.md) - Animation patterns and utilities

## 🎨 UI Stack Overview

### Core Technologies
- **Component Library**: shadcn/ui (New York style)
- **Styling**: Tailwind CSS v4 with CSS variables
- **Color Format**: OKLCH color space
- **Base Theme**: Zinc color palette
- **Build System**: Vite with PostCSS
- **Type Safety**: Full TypeScript support

### Design System
- **Color Scheme**: OKLCH-based zinc palette
- **Typography**: System font stack
- **Spacing**: Tailwind's spacing scale
- **Borders**: Consistent radius system (0.625rem)
- **Shadows**: Layered elevation system

## 🧩 Component Categories

### Base Components (shadcn/ui)
- **Layout**: Card, Separator, ScrollArea
- **Form**: Input, Button, Select, Checkbox
- **Feedback**: Alert, Toast, Badge, Progress
- **Overlay**: Dialog, Sheet, Popover, Tooltip
- **Navigation**: Tabs, NavigationMenu
- **Data**: Table, Avatar

### Custom Components
- **DynamicIsland**: Animated notification component
- **UnifiedChatPanel**: Integrated chat interface
- **Marquee**: Smooth scrolling announcements
- **AnimatedGroup**: Staggered entry animations
- **ScriptCopyBtn**: Code snippet with copy

### Chat Widget Components
- **ChatWidget**: Main container
- **ChatMessage**: Standard message display
- **EnhancedChatMessage**: Advanced message with citations
- **ChatPanel**: Standard chat interface
- **EnhancedChatPanel**: Advanced chat with sources
- **MessageInput**: Input with actions
- **ActionBar**: Quick actions toolbar
- **AudioPlayer**: Voice message player
- **RecommendationsList**: AI suggestions

### Landing Page Components
- **Component Registry**: Dynamic component loader
- **DemoComponents**: Interactive demos
- **SmartComponents**: Data-driven sections
- **LandingComponents**: Full page sections

## 🎯 Component Architecture

### Design Principles
1. **Composability**: Build complex UIs from simple parts
2. **Accessibility**: WCAG AA compliance
3. **Performance**: Optimized rendering
4. **Flexibility**: Customizable via props
5. **Consistency**: Unified design language

### Component Structure
```typescript
// Example component structure
export interface ComponentProps {
  // Required props
  children: React.ReactNode;
  
  // Optional props with defaults
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  
  // Style overrides
  className?: string;
  style?: React.CSSProperties;
  
  // Event handlers
  onClick?: (event: React.MouseEvent) => void;
}

export const Component = React.forwardRef<
  HTMLDivElement,
  ComponentProps
>(({ children, variant = 'default', ...props }, ref) => {
  return (
    <div ref={ref} className={cn(variants[variant])} {...props}>
      {children}
    </div>
  );
});
```

## 🎨 Theming System

### CSS Variables
```css
@theme {
  /* Colors */
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
  --color-primary: 240 5.9% 10%;
  --color-primary-foreground: 0 0% 98%;
  
  /* Spacing */
  --radius: 0.5rem;
  
  /* Typography */
  --font-sans: system-ui, -apple-system, sans-serif;
  --font-mono: 'Fira Code', monospace;
}
```

### Dark Mode Support
```css
.dark {
  --color-background: 240 10% 3.9%;
  --color-foreground: 0 0% 98%;
  /* ... other dark mode variables */
}
```

## 🚀 Quick Start

### Using shadcn/ui Components
```bash
# Add a new component
npx shadcn-ui@latest add button

# Add multiple components
npx shadcn-ui@latest add card badge alert
```

### Creating Custom Components
```typescript
// 1. Create component file
// app/components/ui/custom-component.tsx

// 2. Define props interface
interface CustomComponentProps {
  // ...
}

// 3. Implement component
export function CustomComponent(props: CustomComponentProps) {
  // ...
}

// 4. Export from index
// app/components/ui/index.ts
export * from './custom-component';
```

## 📋 Best Practices

### Component Guidelines
- ✅ Use TypeScript interfaces for props
- ✅ Support ref forwarding when needed
- ✅ Include proper ARIA attributes
- ✅ Use semantic HTML elements
- ✅ Handle loading and error states
- ✅ Memoize expensive computations

### Styling Guidelines
- ✅ Use Tailwind utilities first
- ✅ Extract repeated patterns to components
- ✅ Use CSS variables for theming
- ✅ Avoid inline styles
- ✅ Use cn() utility for conditional classes
- ✅ Keep specificity low

### Performance Guidelines
- ✅ Use React.memo for pure components
- ✅ Lazy load heavy components
- ✅ Optimize re-renders
- ✅ Use virtual scrolling for lists
- ✅ Debounce user inputs
- ✅ Profile with React DevTools

## 🔧 Customization

### Extending Components
```typescript
// Extend existing component
import { Button } from '@/components/ui/button';

export function PrimaryButton(props) {
  return (
    <Button 
      variant="default" 
      className="bg-primary hover:bg-primary/90"
      {...props}
    />
  );
}
```

### Creating Variants
```typescript
// Using class-variance-authority
const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        outline: "border border-input",
        ghost: "hover:bg-accent",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
```

## 🐛 Troubleshooting

### Common Issues
- **Styling conflicts**: Check CSS specificity
- **Missing styles**: Ensure Tailwind configured
- **Type errors**: Update TypeScript definitions
- **Performance**: Check for unnecessary re-renders

### Debug Tools
- React DevTools for component inspection
- Tailwind CSS IntelliSense for classes
- Chrome DevTools for style debugging
- Performance profiler for optimization

---

For implementation details:
- [Component Catalog](./COMPONENTS.md)
- [Theme Configuration](./THEMING.md)
- [Architecture Guide](../ARCHITECTURE/FRONTEND.md)