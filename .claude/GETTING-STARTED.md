# Getting Started with Websyte AI Chat Widget

## Prerequisites

- Node.js 18+ and pnpm
- Cloudflare account
- Neon PostgreSQL database
- OpenAI API key
- Mistral AI API key (for OCR)
- Apify API key (for web crawling)

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd websyte-ai-chat-widget
pnpm install
```

### 2. Environment Setup

Create `.env` file with required variables:

```bash
# Database
DATABASE_URL="postgresql://..."

# AI Services
OPENAI_API_KEY="sk-..."
MISTRAL_API_KEY="..."

# External Services
APIFY_API_KEY="..."
RESEND_API_KEY="..."

# Authentication
BETTER_AUTH_SECRET="..."
BETTER_AUTH_URL="http://localhost:5173"

# Storage
CLOUDFLARE_ACCOUNT_ID="..."

# API Security
API_BEARER_TOKEN="..." # Generate with: openssl rand -hex 32
```

See [DEPLOYMENT/ENVIRONMENT.md](./DEPLOYMENT/ENVIRONMENT.md) for complete variable reference.

### 3. Database Setup

```bash
# Generate database schema
pnpm db:generate

# Push schema to database
pnpm db:push

# (Optional) Open database studio
pnpm db:studio
```

### 4. Development

```bash
# Start development server
pnpm dev

# In another terminal, watch widget builds
pnpm dev:widget
```

- Main app: http://localhost:5173
- Widget test: http://localhost:5173/test

### 5. Testing

```bash
# Run unit tests
pnpm test

# Run integration tests
pnpm test:integration

# Run all tests
pnpm test:all
```

## Key Concepts

### Widgets
Embeddable AI chat assistants with custom knowledge bases. Each widget can:
- Store documents and web content
- Answer questions using RAG (Retrieval Augmented Generation)
- Be embedded on any website
- Track conversations and analytics

### Knowledge Base
Content sources for widgets:
- **Documents**: Upload PDFs, images, text files (with OCR support)
- **Web Pages**: Add individual URLs
- **Website Crawling**: Automatically crawl entire websites
- **Manual Content**: Add text directly

### Embedding
Generate embed code for any widget:
1. Create widget in dashboard
2. Add content to knowledge base
3. Copy embed code from widget settings
4. Add to any website's HTML

Example:
```html
<script src="https://your-domain.com/widget.js?id=widget-id"></script>
```

## Next Steps

- [Architecture Overview](./ARCHITECTURE/README.md) - Understand the system design
- [API Documentation](./API/README.md) - Integrate programmatically
- [Feature Guides](./FEATURES/README.md) - Deep dive into capabilities
- [Deployment Guide](./DEPLOYMENT/README.md) - Deploy to production

## Common Tasks

### Create a Widget Programmatically

```bash
curl -X POST https://your-domain.com/api/automation/widgets \
  -H "Authorization: Bearer $API_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Bot",
    "greeting": "How can I help you?",
    "systemPrompt": "You are a helpful support assistant."
  }'
```

### Crawl a Website

```bash
curl -X POST https://your-domain.com/api/automation/widgets/{widgetId}/crawl \
  -H "Authorization: Bearer $API_BEARER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "urls": ["https://example.com"],
    "maxPages": 50
  }'
```

See [API Documentation](./API/README.md) for more examples.