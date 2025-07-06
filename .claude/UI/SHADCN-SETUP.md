# shadcn/ui Setup and Configuration

Complete guide for setting up and customizing shadcn/ui in the project.

## 🚀 Initial Setup

### Installation
```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Follow prompts:
# ✓ New York style
# ✓ Zinc base color
# ✓ CSS variables for theming
```

### Configuration File
The `components.json` file configures shadcn/ui:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "./tailwind.config.js",
    "css": "./app/app.css",
    "baseColor": "zinc",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "/app/components",
    "utils": "/app/lib/utils",
    "ui": "/app/components/ui",
    "lib": "/app/lib",
    "hooks": "/app/hooks"
  },
  "iconLibrary": "lucide"
}
```

## 📦 Adding Components

### Using the CLI
```bash
# Add a single component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add dialog card badge

# Add all components (not recommended)
npx shadcn@latest add --all
```

### Manual Installation
For custom control over component installation:

```bash
# 1. Copy component file
curl -o app/components/ui/button.tsx \
  https://raw.githubusercontent.com/shadcn/ui/main/apps/www/registry/new-york/ui/button.tsx

# 2. Install dependencies
pnpm add class-variance-authority clsx tailwind-merge

# 3. Update imports
```

## 🎨 Theme Configuration

### CSS Variables
Located in `app/app.css`:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: 0 0% 98%;
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  /* ... dark mode variables */
}
```

### Understanding OKLCH Colors
The project uses OKLCH (Oklab Lightness Chroma Hue) color format instead of HSL:
- **L**: Lightness (0-1, where 0 is black and 1 is white)
- **C**: Chroma (0-0.4, where 0 is gray and higher is more colorful)
- **H**: Hue (0-360 degrees on the color wheel)

Benefits of OKLCH:
- Perceptually uniform color space
- Better color interpolation
- More predictable color adjustments

### Customizing Colors
To change the color scheme:

1. **Use OKLCH color picker**:
   Visit [oklch.com](https://oklch.com) for an interactive picker

2. **Update CSS variables**:
   ```css
   :root {
     /* Example: Blue theme */
     --primary: oklch(0.5 0.2 250);
     --primary-foreground: oklch(0.95 0 0);
   }
   ```

3. **Tailwind automatically uses CSS variables**:
   ```html
   <div class="bg-primary text-primary-foreground">
     <!-- Uses the OKLCH colors defined in CSS -->
   </div>
   ```

## 🛠️ Component Customization

### Modifying Components
After adding a component, you can customize it:

```typescript
// app/components/ui/button.tsx
import { cva } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Add custom variant
        brand: "bg-brand text-white hover:bg-brand/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        // Add custom size
        xl: "h-12 rounded-md px-10 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

### Creating Wrapper Components
For consistent styling across the app:

```typescript
// app/components/ui/primary-button.tsx
import { Button, ButtonProps } from "./button";

export function PrimaryButton({ children, ...props }: ButtonProps) {
  return (
    <Button 
      variant="default" 
      className="shadow-lg hover:shadow-xl transition-shadow"
      {...props}
    >
      {children}
    </Button>
  );
}
```

## 🔧 Utility Functions

### cn() Helper
Merge class names with conflict resolution:

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn(
  "bg-white p-4",
  isDark && "bg-black",
  className
)} />
```

### Custom Utilities
Add project-specific utilities:

```typescript
// lib/ui-utils.ts

// Generate consistent IDs
export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}

// Format component display names
export function getDisplayName(component: React.ComponentType) {
  return component.displayName || component.name || "Component";
}

// Compose event handlers
export function composeEventHandlers<E>(
  originalEventHandler?: (event: E) => void,
  ourEventHandler?: (event: E) => void
) {
  return (event: E) => {
    originalEventHandler?.(event);
    ourEventHandler?.(event);
  };
}
```

## 📱 Responsive Design

### Breakpoint System
shadcn/ui uses Tailwind's breakpoints:

```typescript
// Breakpoints
const breakpoints = {
  sm: "640px",   // Mobile landscape
  md: "768px",   // Tablet
  lg: "1024px",  // Desktop
  xl: "1280px",  // Large desktop
  "2xl": "1536px" // Extra large
};

// Usage in components
<Card className="p-4 sm:p-6 lg:p-8">
  <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Responsive grid */}
  </CardContent>
</Card>
```

### Mobile-First Approach
```typescript
// Component with responsive design
<Button
  className={cn(
    // Mobile styles (default)
    "w-full text-sm",
    // Tablet and up
    "md:w-auto md:text-base",
    // Desktop
    "lg:px-8"
  )}
>
  Responsive Button
</Button>
```

## 🎯 Best Practices

### Component Organization
```
components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── custom/               # Custom components
│   ├── brand-button.tsx
│   └── ...
└── composed/             # Composed components
    ├── contact-form.tsx
    └── ...
```

### Import Organization
```typescript
// Prefer named exports from index
import { Button, Card, Badge } from "@/components/ui";

// Instead of individual imports
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

### Type Safety
```typescript
// Always export component props types
export interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
  icon?: React.ReactNode;
}

// Use proper event types
onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
```

## 🐛 Common Issues

### Style Not Applied
```bash
# Ensure Tailwind configured properly
npx tailwindcss init -p

# Check content paths in tailwind.config.ts
content: [
  "./app/**/*.{js,ts,jsx,tsx,mdx}",
  "./components/**/*.{js,ts,jsx,tsx,mdx}",
]
```

### Component Not Found
```bash
# Re-add component
npx shadcn@latest add [component-name] --overwrite

# Check import paths
```

### Theme Not Working
```typescript
// Ensure CSS variables are loaded
import "@/app/globals.css";

// Check variable names match
console.log(getComputedStyle(document.documentElement)
  .getPropertyValue('--primary'));
```

## 🔄 Updating Components

### Check for Updates
```bash
# See available updates
npx shadcn@latest diff

# Update specific component
npx shadcn@latest add button --overwrite
```

### Migration Guide
When updating major versions:

1. **Backup current components**
2. **Review changelog**
3. **Update one component at a time**
4. **Test thoroughly**
5. **Update custom modifications**

---

For more information:
- [Official Documentation](https://ui.shadcn.com)
- [Component Examples](./COMPONENTS.md)
- [Theming Guide](./THEMING.md)