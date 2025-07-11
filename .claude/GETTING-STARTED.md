# Getting Started with Websyte AI

This guide will help you get Websyte AI up and running on your website in just a few minutes.

## 🚀 Quick Start (For Website Owners)

### Step 1: Create Your Account
1. Visit [websyte.ai](https://websyte.ai)
2. Click "Create Your Knowledge Base"
3. Sign in with Google or GitHub

### Step 2: Create Your First Widget
1. Click "Create New Widget" in your dashboard
2. Give your widget a name (e.g., "Customer Support Bot")
3. Customize the greeting message
4. Choose your brand colors and upload a logo (optional)

### Step 3: Add Your Content
You have three options to build your knowledge base:

#### Option A: Crawl Your Website
1. Go to the "Content" tab
2. Enter your website URL
3. Click "Start Crawling"
4. The system will automatically index your site (usually takes 5-10 minutes)

#### Option B: Upload Documents
1. Go to the "Content" tab
2. Click "Upload Documents"
3. Select files (supports PDF, Word, TXT, MD, JSON)
4. Files with images will be processed with OCR automatically

#### Option C: Manual Entry
1. Use the content editor to write custom responses
2. Perfect for FAQs or specific information

### Step 4: Embed the Widget
1. Go to the "Embed" tab
2. Copy the iframe code:
```html
<iframe 
  src="https://websyte.ai/embed/YOUR_WIDGET_ID" 
  width="400" 
  height="600"
  style="border: none; position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
</iframe>
```
3. Paste it into your website's HTML before the closing `</body>` tag

That's it! Your AI assistant is now live on your website.

## 💻 For Developers

### Prerequisites
- Node.js 18+ and pnpm
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- Cloudflare account
- OpenAI API key
- Mistral AI API key (for OCR)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/websyte/websyte-ai-chat-widget.git
cd websyte-ai-chat-widget
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Database
DATABASE_URL=postgresql://...

# OpenAI
OPENAI_API_KEY=sk-...

# Mistral AI (for OCR)
MISTRAL_API_KEY=...

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=...
CLOUDFLARE_API_TOKEN=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...

# OAuth (Better Auth)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

# App
BETTER_AUTH_SECRET=... # Generate with: openssl rand -base64 32
APP_URL=http://localhost:5173
```

4. **Set up the database**
```bash
# Generate database schema
pnpm db:generate

# Apply migrations
pnpm db:push

# (Optional) Open database studio
pnpm db:studio
```

5. **Start development servers**
```bash
# Start the main app (http://localhost:5173)
pnpm dev

# In another terminal, start the widget dev server
pnpm dev:widget
```

6. **Run tests**
```bash
# Unit tests
pnpm test

# Integration tests
pnpm test:integration

# All tests with coverage
pnpm test:all
```

### Testing the Widget

1. Create a widget in your local dashboard
2. Visit `http://localhost:5173/test` to see the widget in action
3. Use the test pages:
   - `/test` - Basic widget test
   - `/test/iframe` - iframe embedding test
   - `/summary-test` - Test summary generation

### Building for Production

```bash
# Build all assets
pnpm build

# Deploy to Cloudflare
pnpm deploy
```

## 🎯 Common Use Cases

### Customer Support Bot
```javascript
// Widget configuration
{
  name: "Support Assistant",
  greeting: "Hi! How can I help you today?",
  systemPrompt: "You are a helpful customer support agent...",
  primaryColor: "#0066cc"
}
```

### Documentation Helper
```javascript
// Perfect for technical docs
{
  name: "Docs Assistant",
  greeting: "Ask me anything about our documentation!",
  systemPrompt: "Help users find information in our docs...",
  showSources: true
}
```

### Sales Assistant
```javascript
// For e-commerce sites
{
  name: "Shopping Assistant",
  greeting: "Looking for something specific?",
  systemPrompt: "Help customers find products and make purchasing decisions...",
  suggestedQuestions: [
    "What's on sale?",
    "Help me find a gift",
    "Compare products"
  ]
}
```

## 🔧 Configuration Options

### Widget Customization
- **Appearance**: Colors, logo, position, size
- **Behavior**: Greeting, prompts, suggested questions
- **Features**: Source citations, chat history, file uploads

### API Integration
- Use bearer tokens for programmatic access
- Automate content updates
- Export chat logs and analytics
- See [API Documentation](./API/README.md)

## 📚 Next Steps

- [Explore the API](./API/README.md) for advanced integration
- [Learn about the architecture](./ARCHITECTURE/README.md)
- [Customize the widget](./FEATURES/CHAT-WIDGET.md)
- [Set up analytics](./FEATURES/ANALYTICS.md)

## 🆘 Getting Help

- **Documentation**: You're here!
- **Email**: support@websyte.ai
- **Twitter**: [@websyte_ai](https://twitter.com/websyte_ai)
- **GitHub Issues**: [Report bugs or request features](https://github.com/websyte/websyte-ai-chat-widget/issues)

---

Ready to transform your customer support? [Create your first widget →](https://websyte.ai)