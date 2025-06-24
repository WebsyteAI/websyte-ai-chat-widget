# Websyte AI Chat Widget

Embeddable React-based AI chat widget for websites with content summarization and interactive chat.

## 🚨 IMPORTANT - MUST READ FIRST
**For detailed documentation, architecture details, API references, and development guides, refer to the `.claude/` directory.** This file provides only high-level overview.

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
- `workers/db/schema.ts` - Database schema with public widgets
- `workers/services/rag-agent.ts` - RAG chat agent
- `workers/services/vector-search.ts` - Vector search & embeddings
- `workers/services/widget.ts` - Widget management and public access
- `app/components/widgets/WidgetForm.tsx` - Embed code generation UI
- `app/widget-entry.tsx` - Custom widget embed script entry
- `app/routes/test.tsx` - Widget testing playground
- `app/` - Frontend code
- `.claude/` - **Detailed documentation**

## New Features
- **Custom Widget Embed Scripts**: Generate embeddable AI assistants with custom knowledge bases
- **RAG Chat Agent**: Context-aware chat with knowledge base retrieval
- **Vector Search**: Semantic search with embeddings and similarity matching
- **Embed Code Generation**: One-click script generation with public/private controls
- **Public Widget API**: Anonymous access to public widgets for embedding
- **OCR Support**: Extract text from images and PDFs for knowledge bases
- **Multi-AI Support**: OpenAI GPT-4.1-mini and Mistral AI integration
- **Testing Playground**: Comprehensive widget testing environment at `/test`

## Workflow Memories
- When asked to update docs, update @CLAUDE.md and .claude/ directory
- Use context7 mcp if you need up to date documentation on tools and libraries
- Always use pnpm run deploy for deploying