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
- `workers/app.ts` - Main backend
- `workers/db/schema.ts` - Database schema
- `workers/services/rag-agent.ts` - RAG chat agent
- `workers/services/vector-search.ts` - Vector search & embeddings
- `app/` - Frontend code
- `.claude/` - **Detailed documentation**

## New Features
- **RAG Chat Agent**: Context-aware chat with knowledge base retrieval
- **Vector Search**: Semantic search with embeddings and similarity matching
- **Full-text Search**: Enhanced search capabilities with Drizzle ORM
- **OCR Support**: Extract text from images and PDFs
- **Mistral AI**: Alternative AI provider support