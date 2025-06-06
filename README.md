# Websyte AI Chat Widget

An embeddable AI chat widget with modern glass morphism design that provides intelligent, context-aware conversations using OpenAI integration.

**🚀 Live Demo**: [https://websyte-ai-chat-widget.clementineso.workers.dev](https://websyte-ai-chat-widget.clementineso.workers.dev)

## Features

- 🎨 **Modern Glass Design**: Transparent blur effects with customizable advertiser branding
- 🎯 **Multi-Action Interface**: Summarize, Listen, and Chat capabilities with larger, more prominent buttons
- 🧠 **Enhanced Content Extraction**: Smart filtering removes scripts, ads, and navigation ✅ **NEW**
- 🔗 **Configurable Base URLs**: Connect to any API backend via `data-base-url` ✅ **NEW**
- 🎭 **Shadow DOM Isolation**: Complete style isolation prevents conflicts with host page ✅ **NEW**
- 🎨 **Tailwind CSS v4**: Modern utility-first styling with Shadow DOM compatibility ✅ **NEW**
- 💬 **Smooth Animations**: Slide-out chat panel with persistent action bar
- 📝 **Script Tag Configuration**: Easy customization via data attributes
- ⚡️ **Fast & Lightweight**: Self-contained bundle with minimal impact
- 💾 **Persistent History**: Chat history stored locally
- 🔒 **Secure**: Built on Cloudflare Workers with proper CORS handling

## Quick Start - Embedding the Widget

### Basic Embedding

Add this single line to your website:

```html
<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" async></script>
```

### Advanced Configuration

Customize the widget behavior with data attributes:

```html
<script 
  src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" 
  data-content-target="main, .content, article"
  data-api-endpoint="/api/chat"
  data-base-url=""
  data-advertiser-name="Your Brand"
  data-advertiser-logo="https://example.com/logo.png"
  data-position="bottom-center"
  data-theme="default"
  async
></script>
```

### Configuration Options

- **`data-content-target`**: CSS selector for page content extraction (default: `"article, main, .content, #content"`)
- **`data-api-endpoint`**: Custom API endpoint URL (default: `"/api/chat"`)
- **`data-base-url`**: Base URL for all API endpoints (default: `""`) ✅ **NEW**
- **`data-advertiser-name`**: Custom advertiser/brand name (default: `"Advertiser"`) ✅ **NEW**
- **`data-advertiser-logo`**: Custom advertiser/brand logo URL (optional) ✅ **NEW**
- **`data-position`**: Widget position (default: `"bottom-center"`)
- **`data-theme`**: UI theme selection (default: `"default"`)

The widget will automatically:
- Display a persistent action bar at the top with customizable advertiser branding
- Extract content from your specified target elements
- Provide multiple AI interaction modes (Chat, Summarize, Listen)
- Show a slide-out chat panel when needed
- Display "Powered by Nativo" attribution in the chat welcome message

## Development Setup

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm run dev
```

Your application will be available at `http://localhost:5173`.

### Testing the Widget

Visit these test pages during development:
- `/test` - Component-based test page
- `/script-test` - Production-style script tag test page with configuration examples

## Previewing the Production Build

Preview the production build locally:

```bash
npm run preview
```

## Building for Production

### Build the Widget

Build just the embeddable widget:

```bash
pnpm run build:widget
```

This generates `public/dist/widget.js` - the self-contained widget file.

### Development Widget Build

For development with automatic rebuilding:

```bash
pnpm run dev:widget
```

This watches for changes and rebuilds the widget to `public/dist/widget.js` automatically.

### Build Everything

Build the entire project (includes widget):

```bash
pnpm run build
```

### Widget Architecture

The widget is built from:
- `app/widget-entry.tsx` - Standalone widget entry point with Shadow DOM setup
- `app/components/ChatWidget.tsx` - Main React component
- Built with Vite into a self-contained IIFE bundle
- Shadow DOM isolation for complete style encapsulation
- Tailwind CSS v4 compiled and inlined for Shadow DOM compatibility
- Optimized build process outputs to `public/dist/` directory
- Single command development workflow with `pnpm run dev:widget`

## Deployment

Deployment is done using the Wrangler CLI.

To build and deploy directly to production:

```sh
pnpm run deploy
```

To deploy a preview URL:

```sh
npx wrangler versions upload
```

You can then promote a version to production after verification or roll it out progressively.

```sh
npx wrangler versions deploy
```

## Environment Setup

### Required Environment Variables

Set these in your Cloudflare Workers environment:

```bash
# .dev.vars (for local development)
OPENAI_API_KEY=your_openai_api_key_here
```

### Widget Configuration

The widget supports multiple configuration methods:

#### Script Tag Attributes (Recommended)

```html
<script 
  src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" 
  data-content-target="main, .content"
  data-api-endpoint="/api/chat"
  data-base-url=""
  data-advertiser-name="Your Brand"
  data-advertiser-logo="https://example.com/logo.png"
  data-position="bottom-center"
  data-theme="default"
  async
></script>
```

#### Window Configuration (Alternative)

```javascript
// Optional: Set configuration before loading widget
window.WebsyteChat = {
  config: {
    apiEndpoint: '/api/chat',
    baseUrl: 'https://api.example.com',
    contentTarget: 'article, main, .content',
    advertiserName: 'Your Brand',
    advertiserLogo: 'https://example.com/logo.png',
    position: 'bottom-center',
    theme: 'default'
  }
};
```

**Configuration Priority**: Script attributes > Window config > Defaults

## Architecture

- **Frontend**: React + TypeScript compiled to vanilla JS bundle with glass morphism UI
- **Backend**: Cloudflare Workers with OpenAI integration and context-aware responses
- **Styling**: Tailwind CSS v4 with transparent blur effects (compiled and inlined for Shadow DOM)
- **Isolation**: Shadow DOM for complete style encapsulation and host page protection
- **Configuration**: Script tag data attributes with automatic parsing
- **Content Extraction**: Configurable CSS selectors for page content targeting
- **Storage**: localStorage for chat history and widget state
- **Build**: Vite with custom widget configuration, protected public directory, and stable CSS inlining

## API Endpoints

- `POST /api/chat` - Main chat endpoint with context awareness
- `POST /api/summarize` - Page summarization ✅ **IMPLEMENTED**
- `POST /api/audio` - Text-to-speech conversion (planned)

### Summarize Feature

The widget now includes a fully functional summarize feature:

- **One-click summarization**: Click the "Summarize" button in the action bar
- **Automatic content extraction**: Uses configurable CSS selectors to extract page content
- **AI-powered summaries**: OpenAI generates concise 2-3 paragraph summaries
- **Chat integration**: Summaries appear directly in the chat interface
- **Loading states**: Visual feedback during summarization process
- **Error handling**: Graceful fallbacks if summarization fails

Example usage:
1. Visit any page with content
2. Click the "Summarize" button in the widget action bar
3. The chat panel opens and displays an AI-generated summary
4. Continue chatting about the content or request additional summaries

---

Built with ❤️ using React Router and Cloudflare Workers.
