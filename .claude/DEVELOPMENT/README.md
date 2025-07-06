# Development Guide

This directory contains comprehensive developer guides for working with the Websyte AI Chat Widget codebase.

## 📚 Documentation Index

### Core Guides
- [**SETUP.md**](./SETUP.md) - Development environment setup
- [**WORKFLOW.md**](./WORKFLOW.md) - Development workflow and best practices
- [**COMPONENT-DEVELOPMENT.md**](./COMPONENT-DEVELOPMENT.md) - Creating and modifying components
- [**HOOKS.md**](./HOOKS.md) - Custom hooks development guide
- [**CONVENTIONS.md**](./CONVENTIONS.md) - Code style and naming conventions

### Advanced Topics
- [**DEBUGGING.md**](./DEBUGGING.md) - Debugging techniques and tools
- [**PERFORMANCE.md**](./PERFORMANCE.md) - Performance optimization guide
- [**SECURITY.md**](./SECURITY.md) - Security best practices

## 🚀 Quick Start for Developers

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL with pgvector
- Cloudflare account
- OpenAI API key

### Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd websyte-ai-chat-widget

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Database setup
pnpm db:generate
pnpm db:push

# Start development
pnpm dev
```

## 💻 Development Stack

### Frontend
- **Framework**: React 18 + React Router 7
- **Build**: Vite
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **State**: React Context + Custom Hooks
- **Types**: TypeScript strict mode

### Backend
- **Runtime**: Cloudflare Workers
- **Framework**: Hono
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Storage**: Cloudflare R2
- **AI**: OpenAI API

## 🔧 Common Development Tasks

### Adding a New Component
```bash
# Create component file
touch app/components/MyComponent.tsx

# Add shadcn/ui component
npx shadcn@latest add button

# Run tests
pnpm test
```

### Creating an API Endpoint
1. Add route in `workers/routes/`
2. Implement service in `workers/services/`
3. Add to route registration
4. Write tests
5. Document in API docs

### Database Changes
```bash
# Modify schema
edit workers/db/schema.ts

# Generate migration
pnpm db:generate

# Apply changes
pnpm db:push

# Update types
pnpm db:types
```

## 🧪 Testing Strategy

### Unit Tests
- Test individual functions and components
- Mock external dependencies
- Aim for 100% coverage

### Integration Tests
- Test API endpoints
- Use test database
- Mock external services

### E2E Tests
- Test critical user flows
- Use Playwright
- Run before releases

## 📝 Code Style

### TypeScript
```typescript
// Use explicit types
interface WidgetProps {
  id: string;
  name: string;
  onUpdate: (data: WidgetData) => void;
}

// Prefer const assertions
const ROLES = ['user', 'admin'] as const;
type Role = typeof ROLES[number];
```

### React Components
```typescript
// Function components with explicit return types
export function Widget({ id, name }: WidgetProps): JSX.Element {
  // Component logic
  return <div>{name}</div>;
}
```

### File Organization
```
feature/
├── components/     # UI components
├── hooks/         # Custom hooks
├── lib/           # Utilities
├── types/         # TypeScript types
└── index.ts       # Public exports
```

## 🔒 Security Considerations

1. **Input Validation**: Always validate user input
2. **Authentication**: Use proper auth middleware
3. **Rate Limiting**: Implement for all endpoints
4. **Secrets**: Never commit sensitive data
5. **CORS**: Configure appropriately

## 🚀 Performance Tips

1. **Code Splitting**: Use dynamic imports
2. **Memoization**: Use React.memo and useMemo
3. **Lazy Loading**: Load components on demand
4. **Image Optimization**: Use proper formats
5. **Bundle Size**: Monitor with build analyzer

## 🐛 Debugging

### Frontend
- React DevTools
- Browser DevTools
- Console logging with context

### Backend
- Wrangler tail for logs
- Local development with miniflare
- Breakpoint debugging

### Database
- Drizzle Studio
- SQL query logging
- Performance profiling

## 📦 Deployment Process

### Development
```bash
pnpm dev          # Local development
pnpm dev:widget   # Widget only
```

### Staging
```bash
pnpm build
pnpm preview
```

### Production
```bash
pnpm build
pnpm deploy
```

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch
3. **Commit** with conventional commits
4. **Test** thoroughly
5. **Document** changes
6. **Submit** pull request

## 📖 Resources

- [React Documentation](https://react.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

---

For specific guides, see the individual documentation files in this directory.