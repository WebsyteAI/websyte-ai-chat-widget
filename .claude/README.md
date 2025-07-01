# Websyte AI Chat Widget - Technical Documentation

This directory contains detailed technical documentation for the Websyte AI Chat Widget project.

## 📚 Documentation Index

### Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, component design, and technical stack
- **[PLANNING.md](./PLANNING.md)** - Project planning, future enhancements, and development workflow
- **[CONTEXT.md](./CONTEXT.md)** - Project context, goals, and high-level overview
- **[API-REFERENCE.md](./API-REFERENCE.md)** - Complete API documentation and endpoints

### Testing
- **[TESTING.md](./TESTING.md)** - Unit testing strategy and coverage
- **[TESTING-INTEGRATION.md](./TESTING-INTEGRATION.md)** - Integration testing framework and guidelines

### Feature Documentation
- **[FEATURES/MESSAGE-PERSISTENCE.md](./FEATURES/MESSAGE-PERSISTENCE.md)** - Chat message storage, analytics, and GDPR compliance
- **[FEATURES/WEBSITE-CRAWLER.md](./FEATURES/WEBSITE-CRAWLER.md)** - Apify integration for automated content crawling
- **[FEATURES/WIDGET-SHARING.md](./FEATURES/WIDGET-SHARING.md)** - Direct URL sharing and public widget access
- **[FEATURES/WORKFLOW-VISUALIZATION.md](./FEATURES/WORKFLOW-VISUALIZATION.md)** - Workflow visualization and bot detection

### Embedding & Integration
- **[EMBEDDING/IFRAME-API.md](./EMBEDDING/IFRAME-API.md)** - PostMessage API for iframe communication
- **[EMBEDDING/EMBED-CODE-USAGE.md](./EMBEDDING/EMBED-CODE-USAGE.md)** - Widget embed code generation and best practices

### Development Guidelines
- **[CLAUDE.md](./CLAUDE.md)** - Development notes, coding standards, and Claude-specific instructions

### Future Plans
- **[FUTURE/stripe-payment-integration-plan.md](./FUTURE/stripe-payment-integration-plan.md)** - Payment integration planning

### Historical Archives
- **[ARCHIVE/PLANNING-HISTORY.md](./ARCHIVE/PLANNING-HISTORY.md)** - Historical implementation logs and completed phases

## 🚀 Quick Links

### Latest Features (2025-06-25)
1. **Website Crawler** - Crawl entire websites to build knowledge bases
2. **Widget Sharing** - Share widgets via direct URLs
3. **Message Persistence** - Store conversations for analytics
4. **Smart Prompts** - Dynamic prompt recommendations
5. **Inline Citations** - Source references in responses
6. **Rate Limiting** - API protection and security

### Key Services
- `workers/services/apify-crawler.ts` - Website crawling
- `workers/services/messages.ts` - Message persistence
- `workers/lib/rate-limiter.ts` - Rate limiting
- `app/routes/share.w.$id.tsx` - Widget sharing

### Environment Variables
```bash
# Core
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# Features
APIFY_API_TOKEN=apify_api_xxx
MESSAGE_RETENTION_DAYS=90
STORE_IP_ADDRESSES=false

# Rate Limiting
RATE_LIMIT_ANONYMOUS=10
RATE_LIMIT_AUTHENTICATED=30
```

## 📖 How to Use This Documentation

1. **New to the project?** Start with [CONTEXT.md](./CONTEXT.md) and [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Implementing a feature?** Check the relevant feature documentation
3. **Writing tests?** Follow guidelines in [TESTING.md](./TESTING.md)
4. **Planning work?** Review [PLANNING.md](./PLANNING.md) for future enhancements

## 🔄 Documentation Updates

When implementing new features or making significant changes:

1. Update the relevant documentation files
2. Add new documentation for major features
3. Update this README.md index
4. Keep CHANGELOG.md in project root current

## 📊 Project Status

- **Production URL**: https://websyte.ai
- **Widget Bundle**: ~200KB optimized
- **Test Coverage**: 100% for worker services
- **Features**: 20+ major features implemented
- **API Endpoints**: Full REST API with rate limiting

## 🛠️ Technical Stack

- **Frontend**: React Router 7, Vite, Tailwind CSS v4
- **Backend**: Cloudflare Workers, Hono, PostgreSQL
- **AI**: OpenAI GPT-4o-mini, Mistral AI, pgvector
- **Services**: Apify crawler, Better Auth, Drizzle ORM

For more details, see [ARCHITECTURE.md](./ARCHITECTURE.md).