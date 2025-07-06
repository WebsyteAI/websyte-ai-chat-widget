# Code Conventions and Standards

This document outlines the coding standards and conventions used in the Websyte AI Chat Widget project.

## 📝 General Principles

1. **Clarity over Cleverness**: Write code that is easy to understand
2. **Consistency**: Follow established patterns throughout the codebase
3. **Documentation**: Document complex logic and public APIs
4. **Type Safety**: Leverage TypeScript for compile-time safety
5. **Testability**: Write code that is easy to test

## 🏗️ Project Structure

### Directory Organization
```
websyte-ai-chat-widget/
├── app/                    # Frontend React application
│   ├── components/        # Reusable UI components
│   ├── routes/           # React Router pages
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   └── styles/           # Global styles
├── workers/              # Backend Cloudflare Workers
│   ├── routes/          # API route handlers
│   ├── services/        # Business logic
│   ├── lib/             # Shared utilities
│   └── db/              # Database schemas
└── test/                # Test files
```

## 📛 Naming Conventions

### Files and Directories
```typescript
// React Components - PascalCase
ChatWidget.tsx
MessageInput.tsx
EnhancedChatPanel.tsx

// Hooks - camelCase with 'use' prefix
useChatMessages.ts
useAudioPlayer.ts

// Services - camelCase with descriptive names
widget.service.ts
chat.service.ts
rag-agent.service.ts

// Routes - kebab-case with .routes suffix
widget.routes.ts
widget-crawl.routes.ts

// Types/Interfaces - PascalCase
types/Widget.ts
types/ChatMessage.ts

// Utils/Helpers - camelCase
formatDate.ts
validateEmail.ts
```

### Variables and Functions
```typescript
// Constants - UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const API_TIMEOUT = 30000;

// Variables - camelCase
const userName = 'John';
const isLoading = false;

// Functions - camelCase, verb prefixes
function getUserById(id: string) {}
function createWidget(data: WidgetData) {}
function handleSubmit(event: FormEvent) {}

// Boolean variables - is/has/should prefixes
const isAuthenticated = true;
const hasPermission = false;
const shouldUpdate = true;

// Event handlers - handle prefix
const handleClick = () => {};
const handleChange = () => {};
```

### TypeScript Interfaces and Types
```typescript
// Interfaces - PascalCase with 'I' prefix (optional)
interface Widget {
  id: string;
  name: string;
}

// Type aliases - PascalCase
type WidgetStatus = 'active' | 'inactive' | 'pending';

// Enums - PascalCase with UPPER_CASE values
enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  GUEST = 'GUEST'
}

// Generic type parameters - single uppercase letters
function getValue<T>(key: string): T {}
```

## 🎨 React Component Conventions

### Component Structure
```typescript
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 2. Types/Interfaces
interface WidgetProps {
  id: string;
  name: string;
  onUpdate?: (data: WidgetData) => void;
}

// 3. Component definition
export function Widget({ id, name, onUpdate }: WidgetProps) {
  // 4. State declarations
  const [isLoading, setIsLoading] = useState(false);
  
  // 5. Hooks
  const { data, error } = useWidgetData(id);
  
  // 6. Event handlers
  const handleUpdate = async () => {
    setIsLoading(true);
    await onUpdate?.(data);
    setIsLoading(false);
  };
  
  // 7. Effects
  useEffect(() => {
    // Side effects
  }, [dependency]);
  
  // 8. Render
  return (
    <div className={cn('widget', isLoading && 'loading')}>
      <h2>{name}</h2>
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
}
```

### Props Interface
```typescript
// Always define props interface
interface ComponentProps {
  // Required props first
  id: string;
  name: string;
  
  // Optional props with ?
  description?: string;
  
  // Callbacks with clear names
  onUpdate?: (data: UpdateData) => void;
  onDelete?: (id: string) => Promise<void>;
  
  // Children if needed
  children?: React.ReactNode;
  
  // Style overrides last
  className?: string;
  style?: React.CSSProperties;
}
```

## 🔧 API Conventions

### Route Structure
```typescript
// workers/routes/widget.routes.ts
export function registerWidgetRoutes(app: AppType) {
  // GET endpoints
  app.get('/api/widgets', authMiddleware, listWidgets);
  app.get('/api/widgets/:id', authMiddleware, getWidget);
  
  // POST endpoints
  app.post('/api/widgets', authMiddleware, createWidget);
  
  // PUT endpoints
  app.put('/api/widgets/:id', authMiddleware, updateWidget);
  
  // DELETE endpoints
  app.delete('/api/widgets/:id', authMiddleware, deleteWidget);
}
```

### Service Methods
```typescript
// workers/services/widget.service.ts
export class WidgetService {
  // CRUD methods
  async create(data: CreateWidgetDto): Promise<Widget> {}
  async findById(id: string): Promise<Widget | null> {}
  async update(id: string, data: UpdateWidgetDto): Promise<Widget> {}
  async delete(id: string): Promise<void> {}
  
  // Business logic methods
  async generateRecommendations(widgetId: string): Promise<Recommendation[]> {}
  async startCrawl(widgetId: string, url: string): Promise<CrawlResult> {}
}
```

### Error Handling
```typescript
// Use specific error classes
class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}

// Handle errors consistently
try {
  const widget = await widgetService.findById(id);
  if (!widget) {
    throw new NotFoundError('Widget', id);
  }
  return c.json({ widget });
} catch (error) {
  if (error instanceof NotFoundError) {
    return c.json({ error: error.message }, 404);
  }
  console.error('Unexpected error:', error);
  return c.json({ error: 'Internal server error' }, 500);
}
```

## 💾 Database Conventions

### Schema Definition
```typescript
// Use singular table names
export const widget = pgTable('widget', {
  // UUID for primary keys
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Consistent field naming (snake_case in DB)
  userId: text('user_id').references(() => user.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Use appropriate types
  isPublic: boolean('is_public').default(false).notNull(),
  metadata: json('metadata').$type<WidgetMetadata>(),
});
```

### Query Patterns
```typescript
// Use type-safe queries
const widgets = await db
  .select()
  .from(widget)
  .where(eq(widget.userId, userId))
  .orderBy(desc(widget.createdAt))
  .limit(10);

// Use transactions for multiple operations
await db.transaction(async (tx) => {
  const newWidget = await tx.insert(widget).values(data).returning();
  await tx.insert(widgetFile).values({ widgetId: newWidget.id, ...fileData });
});
```

## 🧪 Testing Conventions

### Test File Naming
```typescript
// Unit tests - same name with .test.ts
widget.service.ts
widget.service.test.ts

// Integration tests - .integration.test.ts
widget.routes.integration.test.ts

// E2E tests - .e2e.test.ts
chat-flow.e2e.test.ts
```

### Test Structure
```typescript
// Use descriptive test names
describe('WidgetService', () => {
  describe('create', () => {
    it('should create a new widget with valid data', async () => {
      // Arrange
      const data = { name: 'Test Widget' };
      
      // Act
      const widget = await service.create(data);
      
      // Assert
      expect(widget).toHaveProperty('id');
      expect(widget.name).toBe('Test Widget');
    });
    
    it('should throw error with invalid data', async () => {
      // Test error cases
    });
  });
});
```

## 📝 Documentation

### JSDoc Comments
```typescript
/**
 * Creates a new widget for the user
 * @param data - Widget creation data
 * @param userId - ID of the user creating the widget
 * @returns The created widget
 * @throws {ValidationError} If data is invalid
 * @throws {QuotaExceededError} If user exceeds widget limit
 */
async function createWidget(
  data: CreateWidgetDto,
  userId: string
): Promise<Widget> {
  // Implementation
}
```

### Inline Comments
```typescript
// Use comments for complex logic
function calculateRelevanceScore(query: string, content: string): number {
  // Tokenize both strings for comparison
  const queryTokens = tokenize(query);
  const contentTokens = tokenize(content);
  
  // Calculate TF-IDF score
  // Note: This is a simplified implementation
  const score = calculateTfIdf(queryTokens, contentTokens);
  
  // Normalize score to 0-1 range
  return Math.min(1, Math.max(0, score));
}
```

## 🎯 Best Practices

### Imports
```typescript
// Order: external, internal, relative
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/ui/button';
import { Widget } from '@/types/widget';

import { formatDate } from './utils';
```

### Async/Await
```typescript
// Always use try-catch with async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

### Type Guards
```typescript
// Define type guards for runtime checks
function isWidget(obj: any): obj is Widget {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string'
  );
}

// Use in code
if (isWidget(data)) {
  // TypeScript knows data is Widget here
  console.log(data.name);
}
```

## 🚫 Anti-Patterns to Avoid

1. **Avoid any type** - Use proper types or unknown
2. **Avoid magic numbers** - Use named constants
3. **Avoid deep nesting** - Extract to functions
4. **Avoid side effects in components** - Use hooks
5. **Avoid direct DOM manipulation** - Use React refs
6. **Avoid mutable operations** - Use immutable updates
7. **Avoid console.log in production** - Use proper logging

---

These conventions ensure consistency and maintainability across the codebase. When in doubt, follow existing patterns in the codebase.