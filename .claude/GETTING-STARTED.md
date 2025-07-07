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

## 🎯 Common Use Cases

### Customer Support Bot
```javascript
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-position="bottom-right"
  data-primary-color="#0066cc"
  data-welcome-message="Hi! How can I help you today?"
  async>
</script>
```

### Documentation Assistant
```javascript
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-placeholder="Search our docs..."
  data-auto-open="false"
  data-enable-citations="true"
  async>
</script>
```

### Product Guide
```javascript
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-recommendations='["How to get started?", "What are the features?", "Pricing plans"]'
  async>
</script>
```

## 🎨 Widget Customization

### Visual Customization
```html
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-position="bottom-left"
  data-primary-color="oklch(0.52 0.176 142.495)"
  data-logo-url="https://your-site.com/logo.png"
  data-hide-powered-by="true"
  async>
</script>
```

### Behavioral Customization
```html
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-auto-open="true"
  data-save-messages="true"
  data-enable-audio="true"
  data-enable-citations="true"
  data-recommendations='["How do I get started?", "What features are available?", "Show me pricing"]'
  async>
</script>
```

### All Available Attributes
```javascript
data-widget-id="required"           // Your widget ID
data-position="bottom-right"        // Widget position
data-primary-color="#0066cc"        // Brand color (OKLCH format)
data-save-messages="true"           // Persist chat history
data-auto-open="false"              // Open on page load
data-hide-powered-by="false"        // Remove branding
data-placeholder="Ask me anything..." // Input placeholder
data-welcome-message="Welcome!"     // Initial greeting
data-enable-audio="true"            // Text-to-speech
data-enable-citations="true"        // Show sources
data-logo-url="https://..."         // Your logo
data-logo-alt="Company Name"        // Logo alt text
```

## 📊 Analytics Integration

Track widget usage with JavaScript events:

```javascript
// Listen for widget events
window.addEventListener('message', (event) => {
  if (event.data.type === 'websyte-ai-chat-widget') {
    switch (event.data.action) {
      case 'chat-opened':
        analytics.track('Chat Opened');
        break;
      case 'message-sent':
        analytics.track('Message Sent', {
          message: event.data.data.message
        });
        break;
    }
  }
});
```

## 🚨 Troubleshooting

### Widget Not Appearing?
1. Check console for errors
2. Verify widget ID is correct
3. Ensure script is loaded before `</body>`
4. Check if widget is set to public

### Slow Responses?
1. Check your OpenAI API key status
2. Verify content is properly indexed
3. Enable caching in widget settings

### Styling Issues?
1. Widget uses Shadow DOM for isolation
2. Use data attributes for customization
3. Check for CSS conflicts

## 🎯 Best Practices

### Content Preparation
- Keep documents focused and well-structured
- Use clear headings and sections
- Include examples and FAQs
- Update content regularly

### AI Instructions
- Be specific about tone and style
- Include company/product context
- Set clear boundaries
- Test with various questions

### Performance
- Enable caching for faster responses
- Limit document size to < 10MB
- Use website crawling for large sites
- Monitor token usage