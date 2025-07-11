# Websyte AI Chat Widget

Embeddable AI chat widget for websites with RAG capabilities and knowledge base management.

## 📚 Documentation

**All detailed documentation is in the `.claude/` directory.** See [.claude/README.md](.claude/README.md) for the complete documentation index.

### Quick Links
- [Getting Started](.claude/GETTING-STARTED.md)
- [API Documentation](.claude/API/README.md)
- [Architecture Overview](.claude/ARCHITECTURE/README.md)
- [Deployment Guide](.claude/DEPLOYMENT/README.md)

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev              # Main app (port 5173)
pnpm dev:widget       # Widget development mode

# Run tests
pnpm test             # Unit tests
pnpm test:integration # Integration tests
pnpm test:all         # All tests

# Deploy
pnpm build            # Build for production
pnpm deploy           # Deploy to Cloudflare
```

## 🛠 Tech Stack

- **Frontend**: React Router 7, Vite, Tailwind CSS v4
- **Backend**: Cloudflare Workers, Hono
- **Database**: Neon PostgreSQL, Drizzle ORM, pgvector
- **AI/ML**: OpenAI (GPT-4o-mini), Mistral AI (OCR)
- **Storage**: Cloudflare R2
- **Auth**: Better Auth with OAuth support

## 📁 Project Structure

```
├── app/                    # React frontend
│   ├── components/        # UI components
│   ├── routes/           # React Router pages
│   └── widget-entry.tsx  # Widget embed entry
├── workers/               # Backend services
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── workflows/        # Cloudflare Workflows
│   └── app.ts           # Main entry point
├── test/                 # Test suites
└── .claude/             # Documentation
```

## 🌟 Key Features

### For End Users
- **AI Chat Assistant**: Powered by your content with GPT-4o-mini
- **Easy Embedding**: Simple iframe integration
- **Knowledge Base**: Upload docs, crawl websites with Apify
- **Smart Search**: Vector-based semantic search with pgvector
- **Custom Branding**: Logo, colors, prompts
- **Marketing Pages**: Blog, features, pricing, contact

### For Developers
- **RESTful API**: Full programmatic access
- **Bearer Auth**: Secure automation (10/min anon, 30/min auth)
- **Modular Architecture**: 12 ChatWidget modules, 6 widget services
- **TypeScript**: Full type safety
- **Code Quality**: ESLint + Prettier configured
- **100% Test Coverage**: 235+ tests

## 🔧 Development Workflow

### Environment Setup
```bash
cp .env.example .env
# Fill in your API keys and database URL
```

### Database Setup
```bash
pnpm db:generate  # Generate migrations
pnpm db:push      # Apply to database
pnpm db:studio    # Visual editor
```

### Common Tasks

**Add a new API endpoint**:
1. Create route in `workers/routes/`
2. Add to `workers/routes/index.ts`
3. Document in `.claude/API/`
4. Write tests

**Update the widget**:
1. Edit components in `app/components/ChatWidget/`
2. Run `pnpm dev:widget` to see changes
3. Test embedding with `/test` route

**Debug production issues**:
```bash
wrangler tail  # Live logs
```

## 📝 Notes for AI Assistants

- **Documentation**: Update `.claude/` directory for docs
- **Package Manager**: Always use `pnpm`, never `npm`
- **Deployment**: Use `pnpm deploy` for production
- **Testing**: Maintain 100% coverage
- **Context**: Use context7 MCP for library docs

## 🔗 References

- **Competitors**: answerhq.co, tawk.to
- **Live Demo**: [Production URL]
- **Issues**: [GitHub Issues]

---

For detailed documentation, see [.claude/README.md](.claude/README.md)

## 🆕 Recent Updates (January 2025)

### Major Refactoring (Jan 7)
- **ChatWidget**: Modularized into 12 components with custom hooks
- **WidgetForm**: Split into 12 focused components  
- **Widget Service**: Reorganized into 6 specialized services
- **Code Quality**: Added ESLint and Prettier configuration

### New Features
- **Marketing Site**: Added blog (6 posts), features, pricing, contact pages
- **iframe Embedding**: Switched from script tag to iframe-only
- **Mobile Responsiveness**: Improved widget editor for mobile
- **Analytics**: Integrated Umami analytics tracking
- **Blog Content**: 
  - Launch announcement
  - How to reduce support tickets by 40%
  - RAG explained
  - Vector search with pgvector
  - Shadow DOM widgets (future)
  - Customer success story

### API Updates
- Standardized crawl API to use 'url' parameter only
- Added widget link extraction feature
- Improved crawl status management

## 🧠 Deployment Memory

Recent deployments:
1. **2025-01-11**: Major documentation update with .claude/ structure
2. **2025-01-07**: Refactored widget components and services
3. **2025-01-06**: Added marketing pages and blog
4. **2025-01-05**: Switched to iframe embedding
5. **2025-01-05**: Added ESLint and Prettier