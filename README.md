# Websyte AI Chat Widget

<p align="center">
  <a href="https://websyte.ai">
    <img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live Demo" />
  </a>
  <a href="https://github.com/websyte/websyte-ai-chat-widget/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
  </a>
  <a href="https://github.com/websyte/websyte-ai-chat-widget/actions">
    <img src="https://img.shields.io/badge/tests-100%25-success" alt="Tests" />
  </a>
  <a href="https://github.com/websyte/websyte-ai-chat-widget">
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
  </a>
</p>

<p align="center">
  <b>Transform your website into an AI-powered knowledge base with a single line of code</b>
</p>

<p align="center">
  <a href="https://websyte.ai">Live Demo</a> •
  <a href="./CLAUDE.md">Documentation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#features">Features</a> •
  <a href="#api">API</a>
</p>

---

## 🚀 Quick Start

Add AI chat to your website in 30 seconds:

```html
<iframe 
  src="https://websyte.ai/embed/YOUR_WIDGET_ID" 
  width="400" 
  height="600"
  style="border: none; position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
</iframe>
```

That's it! Your visitors can now chat with an AI assistant that understands your content.

## ✨ Features

### 🤖 **Intelligent AI Assistant**
- Powered by OpenAI GPT-4o-mini
- Context-aware responses based on your content
- Multi-turn conversations with memory
- Smart citation and source attribution

### 📚 **Knowledge Base Management**
- **Auto-crawl websites** - Index entire sites automatically
- **Document upload** - Support for PDF, Word, images (with OCR)
- **Vector search** - Semantic search with pgvector
- **Real-time updates** - Content changes reflect immediately

### 🎨 **Beautiful, Customizable UI**
- Modern glass-morphism design
- iframe isolation (zero conflicts)
- Fully responsive on all devices
- Custom branding and theming
- Mobile-optimized widget editor

### 🔧 **Developer Friendly**
- **RESTful API** - Full programmatic control
- **TypeScript** - 100% type-safe
- **Well tested** - 235+ tests with 100% coverage
- **Code quality** - ESLint + Prettier configured
- **Open source** - MIT licensed

### 🔒 **Enterprise Ready**
- OAuth authentication (Google, GitHub)
- Bearer token API access
- Rate limiting and quotas
- GDPR compliant

## 📸 Screenshots

<table>
  <tr>
    <td align="center">
      <img src="https://github.com/websyte/websyte-ai-chat-widget/assets/demo/chat.png" width="300" alt="Chat Interface" />
      <br />
      <sub><b>Chat Interface</b></sub>
    </td>
    <td align="center">
      <img src="https://github.com/websyte/websyte-ai-chat-widget/assets/demo/dashboard.png" width="300" alt="Dashboard" />
      <br />
      <sub><b>Management Dashboard</b></sub>
    </td>
    <td align="center">
      <img src="https://github.com/websyte/websyte-ai-chat-widget/assets/demo/mobile.png" width="300" alt="Mobile View" />
      <br />
      <sub><b>Mobile Responsive</b></sub>
    </td>
  </tr>
</table>

## 🛠 Installation

### For Website Owners

1. **Create a widget** at [websyte.ai](https://websyte.ai)
2. **Add your content** - Upload docs or crawl your site
3. **Embed the widget** - Copy the script tag to your site

### For Developers

```bash
# Clone the repository
git clone https://github.com/websyte/websyte-ai-chat-widget.git
cd websyte-ai-chat-widget

# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Add your API keys

# Start development
pnpm dev
```

See [full documentation](./CLAUDE.md) for detailed setup instructions.

## 🔌 API

Programmatically manage widgets and content:

```javascript
// Create a widget
const response = await fetch('https://your-domain.com/api/automation/widgets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Support Bot',
    greeting: 'How can I help you today?'
  })
});

// Crawl a website
await fetch(`https://your-domain.com/api/automation/widgets/${widgetId}/crawl`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    url: 'https://docs.example.com',
    maxPages: 100
  })
});
```

[View full API documentation →](./.claude/API/README.md)

## 📰 Recent Updates

- **Marketing Pages**: New blog with 6 articles, features showcase, pricing plans
- **Component Refactoring**: Modularized ChatWidget (12 components) and WidgetForm
- **Code Quality**: Added ESLint and Prettier for consistent code style
- **iframe Embedding**: Switched from script tag to iframe for better isolation
- **Analytics**: Integrated Umami for usage tracking
- **Mobile UX**: Enhanced mobile responsiveness in widget editor

## 🎯 Use Cases

- **📖 Documentation Sites** - Let users ask questions about your docs
- **🛍️ E-commerce** - Product recommendations and support
- **🎓 Education** - Interactive learning assistant
- **💼 SaaS** - Onboarding and feature discovery
- **📰 Publishing** - Content discovery and engagement
- **🏢 Corporate** - Internal knowledge base

## 🏗 Tech Stack

- **Frontend**: React Router 7, Vite, Tailwind CSS v4
- **Backend**: Cloudflare Workers, Hono
- **Database**: Neon PostgreSQL with pgvector
- **AI/ML**: OpenAI, Mistral AI (OCR)
- **Storage**: Cloudflare R2
- **Auth**: Better Auth

## 🤝 Contributing

We love contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Build project
pnpm build
```

## 📄 License

MIT © [Websyte](https://github.com/websyte)

## 🙏 Acknowledgments

Built with amazing open source projects:
- [React Router](https://reactrouter.com)
- [Cloudflare Workers](https://workers.cloudflare.com)
- [Hono](https://hono.dev)
- [shadcn/ui](https://ui.shadcn.com)
- [Drizzle ORM](https://orm.drizzle.team)

---

<p align="center">
  Made with ❤️ by the Websyte team
</p>

<p align="center">
  <a href="https://github.com/websyte/websyte-ai-chat-widget/stargazers">⭐ Star us on GitHub</a>
</p>