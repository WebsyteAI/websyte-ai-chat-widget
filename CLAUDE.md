# Websyte AI Chat Widget

## Project Overview
React-based AI chat widget that can be embedded into websites. Provides content summarization, audio playback, and interactive chat functionality.

## Architecture
- **Frontend**: React Router 7 with Vite
- **Backend**: Hono on Cloudflare Workers
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Auth**: Better Auth
- **Storage**: Cloudflare R2 for files
- **AI**: OpenAI API for embeddings and chat

## Development Commands
```bash
pnpm dev              # Start development server (port 5173)
pnpm dev:widget       # Build widget in watch mode
pnpm build            # Build for production
pnpm typecheck        # Run TypeScript checks
pnpm test             # Run tests
pnpm db:generate      # Generate database migrations
pnpm db:push          # Push schema changes to database
pnpm db:studio        # Open Drizzle Studio
pnpm deploy           # Deploy to Cloudflare
```

## Key Files
- `workers/db/schema.ts` - Database schema definitions
- `workers/app.ts` - Main Hono application
- `app/` - React Router frontend
- `vite.widget.config.ts` - Widget build configuration

## Important Notes
- Always use `pnpm` for package management
- Development server runs on port 5173
- Check `.claude/` directory for additional documentation and context
- Widget uses UUID for all primary keys
- Vector embeddings use OpenAI text-embedding-3-small (1536 dimensions)