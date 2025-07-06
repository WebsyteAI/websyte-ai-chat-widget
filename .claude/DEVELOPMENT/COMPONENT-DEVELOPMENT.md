# Component Development Guide

This guide covers best practices for developing React components in the Websyte AI Chat Widget project.

## 🏗️ Component Architecture

### Component Types

#### 1. Base UI Components (shadcn/ui)
Located in `app/components/ui/`
- Pre-built, customizable components
- Follow shadcn/ui conventions
- Highly reusable across the app

#### 2. Feature Components
Located in `app/components/`
- Business logic components
- Compose base UI components
- Handle specific features

#### 3. Page Components
Located in `app/routes/`
- React Router page components
- Compose feature components
- Handle routing logic

## 📁 Component File Structure

### Single Component
```
components/
└── ChatWidget/
    ├── ChatWidget.tsx          # Main component
    ├── ChatWidget.test.tsx     # Unit tests
    ├── ChatWidget.stories.tsx  # Storybook stories
    ├── types.ts               # TypeScript types
    └── index.ts               # Public exports
```

### Complex Component with Sub-components
```
components/
└── ChatWidget/
    ├── ChatWidget.tsx          # Main component
    ├── components/             # Sub-components
    │   ├── ChatMessage.tsx
    │   ├── MessageInput.tsx
    │   └── index.ts
    ├── hooks/                  # Component-specific hooks
    │   ├── useChatMessages.ts
    │   └── index.ts
    ├── lib/                    # Component utilities
    │   └── messageParser.ts
    ├── types.ts               # Shared types
    └── index.ts               # Public exports
```

## 🎨 Creating a New Component

### Step 1: Plan the Component

Before coding, consider:
- What props does it need?
- What state does it manage?
- What events does it emit?
- Can it be composed from existing components?

### Step 2: Create the Component

```typescript
// components/WidgetCard/WidgetCard.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface WidgetCardProps {
  widget: {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
  };
  onClick?: (id: string) => void;
  className?: string;
}

export function WidgetCard({ widget, onClick, className }: WidgetCardProps) {
  return (
    <Card 
      className={cn('cursor-pointer transition-shadow hover:shadow-lg', className)}
      onClick={() => onClick?.(widget.id)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{widget.name}</CardTitle>
          <Badge variant={widget.status === 'active' ? 'default' : 'secondary'}>
            {widget.status}
          </Badge>
        </div>
      </CardHeader>
      {widget.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground">{widget.description}</p>
        </CardContent>
      )}
    </Card>
  );
}
```

### Step 3: Export the Component

```typescript
// components/WidgetCard/index.ts
export { WidgetCard } from './WidgetCard';
export type { WidgetCardProps } from './WidgetCard';
```

### Step 4: Add Tests

```typescript
// components/WidgetCard/WidgetCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetCard } from './WidgetCard';

describe('WidgetCard', () => {
  const mockWidget = {
    id: '1',
    name: 'Test Widget',
    description: 'Test description',
    status: 'active' as const,
  };

  it('renders widget information', () => {
    render(<WidgetCard widget={mockWidget} />);
    
    expect(screen.getByText('Test Widget')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<WidgetCard widget={mockWidget} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Widget'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

## 🎯 Component Patterns

### Composition Pattern
```typescript
// Compose complex components from simple ones
export function ChatInterface({ widgetId }: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader widgetId={widgetId} />
      <ChatMessages widgetId={widgetId} />
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

### Render Props Pattern
```typescript
interface DataFetcherProps<T> {
  url: string;
  render: (data: T, loading: boolean, error: Error | null) => React.ReactNode;
}

function DataFetcher<T>({ url, render }: DataFetcherProps<T>) {
  const { data, loading, error } = useFetch<T>(url);
  return <>{render(data, loading, error)}</>;
}

// Usage
<DataFetcher
  url="/api/widgets"
  render={(widgets, loading, error) => {
    if (loading) return <Spinner />;
    if (error) return <Error message={error.message} />;
    return <WidgetList widgets={widgets} />;
  }}
/>
```

### Compound Component Pattern
```typescript
// Parent component
export function Tabs({ children, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

// Child components
Tabs.List = function TabsList({ children }: TabsListProps) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Tab = function Tab({ value, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button
      className={cn('tab', activeTab === value && 'active')}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
};

// Usage
<Tabs defaultValue="general">
  <Tabs.List>
    <Tabs.Tab value="general">General</Tabs.Tab>
    <Tabs.Tab value="advanced">Advanced</Tabs.Tab>
  </Tabs.List>
  <Tabs.Panel value="general">General settings</Tabs.Panel>
  <Tabs.Panel value="advanced">Advanced settings</Tabs.Panel>
</Tabs>
```

## 🪝 Custom Hooks in Components

### Creating Component-Specific Hooks
```typescript
// components/ChatWidget/hooks/useChatMessages.ts
export function useChatMessages(widgetId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, [widgetId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/widgets/${widgetId}/messages`);
      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    const newMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send to API
    try {
      const response = await fetch(`/api/chat`, {
        method: 'POST',
        body: JSON.stringify({ message: content, widgetId }),
      });
      const aiMessage = await response.json();
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return { messages, isLoading, sendMessage };
}
```

## 🎨 Styling Components

### Using Tailwind CSS
```typescript
// Prefer Tailwind utilities
<div className="flex items-center justify-between p-4 bg-background rounded-lg border">
  <span className="text-sm font-medium">Widget Name</span>
  <Badge>Active</Badge>
</div>
```

### Using CSS Variables
```typescript
// For dynamic theming
<div
  className="widget-container"
  style={{
    '--widget-primary': settings.primaryColor,
    '--widget-radius': `${settings.borderRadius}px`,
  } as React.CSSProperties}
>
  <style jsx>{`
    .widget-container {
      color: var(--widget-primary);
      border-radius: var(--widget-radius);
    }
  `}</style>
</div>
```

### Component Variants with cva
```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input hover:bg-accent',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant, size, children, onClick }: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size })}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
```

## 📱 Responsive Components

### Mobile-First Design
```typescript
export function ResponsiveWidget() {
  return (
    <div className="
      w-full
      md:w-96
      lg:w-[400px]
      p-4
      md:p-6
      lg:p-8
    ">
      <h2 className="
        text-lg
        md:text-xl
        lg:text-2xl
        font-semibold
      ">
        Widget Title
      </h2>
    </div>
  );
}
```

### Conditional Rendering for Mobile
```typescript
export function AdaptiveLayout() {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  if (isMobile) {
    return <MobileLayout />;
  }
  
  return <DesktopLayout />;
}
```

## 🚀 Performance Optimization

### Memoization
```typescript
// Memoize expensive components
export const ExpensiveList = React.memo(({ items }: { items: Item[] }) => {
  return (
    <ul>
      {items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
});

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  dispatch({ type: 'SELECT_ITEM', payload: id });
}, [dispatch]);

// Memoize computed values
const sortedItems = useMemo(
  () => items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
);
```

### Code Splitting
```typescript
// Lazy load heavy components
const WidgetEditor = lazy(() => import('./WidgetEditor'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <WidgetEditor />
    </Suspense>
  );
}
```

## 🐛 Common Pitfalls

### 1. Unnecessary Re-renders
```typescript
// ❌ Bad: Creates new object every render
<Widget config={{ theme: 'dark' }} />

// ✅ Good: Stable reference
const config = useMemo(() => ({ theme: 'dark' }), []);
<Widget config={config} />
```

### 2. Missing Keys in Lists
```typescript
// ❌ Bad: Using index as key
{items.map((item, index) => (
  <Item key={index} {...item} />
))}

// ✅ Good: Using stable unique ID
{items.map((item) => (
  <Item key={item.id} {...item} />
))}
```

### 3. Direct State Mutations
```typescript
// ❌ Bad: Mutating state directly
const handleAdd = (item: Item) => {
  items.push(item); // Don't do this!
  setItems(items);
};

// ✅ Good: Creating new array
const handleAdd = (item: Item) => {
  setItems([...items, item]);
};
```

## 📋 Component Checklist

Before considering a component complete:

- [ ] Props are properly typed with TypeScript
- [ ] Component is exported from index.ts
- [ ] Unit tests cover main functionality
- [ ] Component is responsive
- [ ] Accessibility attributes are included
- [ ] Error states are handled
- [ ] Loading states are shown
- [ ] Documentation/comments for complex logic
- [ ] Performance optimizations applied
- [ ] Follows project conventions

---

For more information:
- [UI Component Catalog](../UI/COMPONENTS.md)
- [Testing Guide](../TESTING/README.md)
- [Code Conventions](./CONVENTIONS.md)