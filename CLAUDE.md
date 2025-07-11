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
- **AI Chat Assistant**: Powered by your content
- **Easy Embedding**: One-line script tag
- **Knowledge Base**: Upload docs, crawl websites
- **Smart Search**: Vector-based semantic search
- **Custom Branding**: Logo, colors, prompts

### For Developers
- **RESTful API**: Full programmatic access
- **Bearer Auth**: Secure automation
- **Webhooks**: Real-time events (planned)
- **TypeScript**: Full type safety
- **100% Test Coverage**: Reliable codebase

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

## 🧠 Deployment Memory

- Will track the 5 most recent changes/deployments to the project