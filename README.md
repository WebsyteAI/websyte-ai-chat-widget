# Nativo AI Chat Widget

An embeddable AI chat widget with modern glass morphism design that provides intelligent, context-aware conversations using OpenAI integration.

## Features

- 🎨 **Modern Glass Design**: Transparent blur effects with Nativo branding
- 🎯 **Multi-Action Interface**: Summarize, Listen, Speak, and Chat capabilities
- 🧠 **Configurable Content Extraction**: Target specific page elements with CSS selectors
- 💬 **Smooth Animations**: Slide-out chat panel with persistent action bar
- 📝 **Script Tag Configuration**: Easy customization via data attributes
- ⚡️ **Fast & Lightweight**: Self-contained bundle with minimal impact
- 💾 **Persistent History**: Chat history stored locally
- 🔒 **Secure**: Built on Cloudflare Workers with proper CORS handling

## Quick Start - Embedding the Widget

### Basic Embedding

Add this single line to your website:

```html
<script src="https://your-domain.workers.dev/widget.js" async></script>
```

### Advanced Configuration

Customize the widget behavior with data attributes:

```html
<script 
  src="https://your-domain.workers.dev/widget.js" 
  data-content-target="main, .content, article"
  data-api-endpoint="/api/chat"
  data-position="bottom-center"
  data-theme="default"
  async
></script>
```

### Configuration Options

- **`data-content-target`**: CSS selector for page content extraction (default: `"article, main, .content, #content"`)
- **`data-api-endpoint`**: Custom API endpoint URL (default: `"/api/chat"`)
- **`data-position`**: Widget position (default: `"bottom-center"`)
- **`data-theme`**: UI theme selection (default: `"default"`)

The widget will automatically:
- Display a persistent action bar with Nativo branding
- Extract content from your specified target elements
- Provide multiple AI interaction modes (Chat, Summarize, Listen, Speak)
- Show a slide-out chat panel when needed

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

This generates `public/widget.js` - the self-contained widget file.

### Build Everything

Build the entire project (includes widget):

```bash
pnpm run build
```

### Widget Architecture

The widget is built from:
- `app/widget-entry.tsx` - Standalone widget entry point
- `app/components/ChatWidget.tsx` - Main React component
- Built with Vite into a self-contained IIFE bundle
- Includes all styles and dependencies inline

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
  src="/widget.js" 
  data-content-target="main, .content"
  data-api-endpoint="/api/chat"
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
    contentTarget: 'article, main, .content',
    position: 'bottom-center',
    theme: 'default'
  }
};
```

**Configuration Priority**: Script attributes > Window config > Defaults

## Architecture

- **Frontend**: React + TypeScript compiled to vanilla JS bundle with glass morphism UI
- **Backend**: Cloudflare Workers with OpenAI integration and context-aware responses
- **Styling**: Tailwind CSS with transparent blur effects (compiled and inlined)
- **Configuration**: Script tag data attributes with automatic parsing
- **Content Extraction**: Configurable CSS selectors for page content targeting
- **Storage**: localStorage for chat history and widget state
- **Build**: Vite with custom widget configuration and asset optimization

## API Endpoints

- `POST /api/chat` - Main chat endpoint with context awareness
- `POST /api/summarize` - Page summarization (planned)
- `POST /api/audio` - Text-to-speech conversion (planned)

---

Built with ❤️ using React Router and Cloudflare Workers.
