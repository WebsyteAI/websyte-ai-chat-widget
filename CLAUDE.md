# Websyte AI Chat Widget

Embeddable React-based AI chat widget for websites with content summarization and interactive chat.

## 🚨 IMPORTANT - MUST READ FIRST
**For detailed documentation, architecture details, API references, and development guides, refer to the `.claude/` directory.** This file provides only high-level overview.

## 📚 Documentation Table of Contents

### Core Documentation
- **[.claude/ARCHITECTURE.md](.claude/ARCHITECTURE.md)** - System architecture, component design, and technical stack
- **[.claude/PLANNING.md](.claude/PLANNING.md)** - Project planning, phases, and implementation roadmap
- **[.claude/TESTING.md](.claude/TESTING.md)** - Testing strategy, guidelines, and coverage requirements
- **[.claude/CONTEXT.md](.claude/CONTEXT.md)** - Project context, goals, and high-level overview
- **[.claude/API-REFERENCE.md](.claude/API-REFERENCE.md)** - Complete API documentation and endpoints

### Feature Documentation
- **[.claude/MESSAGE-PERSISTENCE.md](.claude/MESSAGE-PERSISTENCE.md)** - Chat message storage, analytics, and GDPR compliance
- **[.claude/WEBSITE-CRAWLER.md](.claude/WEBSITE-CRAWLER.md)** - Apify integration for automated content crawling
- **[.claude/WIDGET-SHARING.md](.claude/WIDGET-SHARING.md)** - Direct URL sharing and public widget access
- **[.claude/stripe-payment-integration-plan.md](.claude/stripe-payment-integration-plan.md)** - Payment integration planning

### Embedding & Integration
- **[.claude/IFRAME-API.md](.claude/IFRAME-API.md)** - PostMessage API for iframe communication
- **[.claude/EMBED-CODE-USAGE.md](.claude/EMBED-CODE-USAGE.md)** - Widget embed code generation and best practices

### Development Guidelines
- **[.claude/CLAUDE.md](.claude/CLAUDE.md)** - Development notes, coding standards, and Claude-specific instructions
- **[.claude/README.md](.claude/README.md)** - Documentation index and quick links

## Quick Start
```bash
pnpm dev              # Development server (port 5173)
pnpm dev:widget       # Build widget in watch mode
pnpm build            # Production build
pnpm typecheck        # TypeScript checks
pnpm deploy           # Deploy to Cloudflare
```

## Tech Stack
- React Router 7 + Vite
- Hono on Cloudflare Workers
- Neon PostgreSQL + Drizzle ORM
- Better Auth
- OpenAI API (GPT-4.1-mini + text-embedding-3-small)
- Vector Search with pgvector
- OCR capabilities

## Essential Files
- `workers/app.ts` - Main backend with widget APIs
- `workers/db/schema.ts` - Database schema with public widgets & chat messages
- `workers/services/rag-agent.ts` - RAG chat agent with inline citations
- `workers/services/vector-search.ts` - Vector search & embeddings
- `workers/services/widget.ts` - Widget management and public access
- `workers/services/messages.ts` - Chat message persistence and session management
- `workers/services/chat.ts` - Chat API with message persistence controls
- `workers/services/apify-crawler.ts` - Website crawler integration
- `workers/lib/rate-limiter.ts` - Rate limiting middleware for API protection
- `workers/cron/cleanup-messages.ts` - Scheduled cleanup of old messages
- `app/components/widgets/WidgetForm.tsx` - Embed code generation UI
- `app/components/widgets/WidgetEditor.tsx` - Full-screen widget editor with live preview
- `app/components/ChatWidget/components/RecommendationsList.tsx` - Smart prompt recommendations
- `app/widget-entry.tsx` - Custom widget embed script entry
- `app/routes/test.tsx` - Widget testing playground
- `app/routes/share.w.$id.tsx` - Direct widget sharing page
- `app/routes/dashboard.tsx` - Dashboard layout with nested routing
- `app/routes/dashboard.widgets.*.tsx` - Widget management routes
- `app/routes.ts` - React Router 7 route configuration
- `app/` - Frontend code
- `.claude/` - **Detailed documentation**

## New Features
- **Custom Widget Embed Scripts**: Generate embeddable AI assistants with custom knowledge bases
- **RAG Chat Agent**: Context-aware chat with knowledge base retrieval and inline citations
- **Vector Search**: Semantic search with embeddings and similarity matching
- **Website Crawler**: Apify integration to crawl entire websites for knowledge base building
- **Direct Widget Sharing**: Share widgets via direct URLs with full-screen chat interface
- **Chat Message Persistence**: Secure storage of conversations for insights and audits
- **Smart Message Controls**: Only save messages from embedded widgets, not test environments
- **Session Management**: Secure session tracking with server-side ID generation
- **Rate Limiting**: API protection with configurable limits (10/min anonymous, 30/min authenticated)
- **Smart Prompt Recommendations**: Dynamic prompt suggestions with animated marquee display
- **Embed Code Generation**: One-click script generation with public/private controls
- **Public Widget API**: Anonymous access to public widgets for embedding
- **OCR Support**: Extract text from images and PDFs for knowledge bases
- **Multi-AI Support**: OpenAI GPT-4.1-mini and Mistral AI integration
- **Testing Playground**: Comprehensive widget testing environment at `/test`
- **Nested Dashboard Routes**: File-based routing with explicit route configuration
- **Full-Screen Widget Editor**: Split-screen editor with form on left, chat preview on right
- **GDPR Compliance**: Configurable IP storage and automatic data cleanup
- **Inline Citations**: Markdown-formatted citations in chat responses with source references
- **Auto Data Cleanup**: Scheduled cron jobs for automatic message retention management
- **Toast Notifications**: User feedback for widget operations
- **Enhanced Chat UX**: Fixed scrolling behavior when sources are displayed
- **Full-Screen Chat UI**: Improved layout with fixed positioning and better responsive design
- **API Automation**: Bearer token authentication for programmatic access via `/api/automation/*` routes

## API Automation
Use bearer token authentication for programmatic access:
- Generate token: `openssl rand -hex 32`
- Add to environment: `API_BEARER_TOKEN=your-token`
- Use header: `Authorization: Bearer your-token`
- Available routes:
  - `GET /api/automation/widgets` - List all widgets
  - `POST /api/automation/widgets` - Create widgets
  - `POST /api/automation/widgets/:id/crawl` - Start crawling
  - `POST /api/automation/widgets/:id/recommendations` - Generate recommendations

## Workflow Memories
- When asked to update docs, update @CLAUDE.md and .claude/ directory
- Use context7 mcp if you need up to date documentation on tools and libraries
- Always use pnpm run deploy for deploying

## Competitors
- Save https://answerhq.co/ as a reference competitor