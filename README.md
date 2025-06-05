# Websyte AI Chat Widget

An embeddable AI chat widget for websites that provides intelligent, context-aware conversations using OpenAI integration.

## Features

- 💬 **Smart Chat Interface**: Clean, modern chat UI with message history
- 🧠 **Context-Aware**: Automatically reads and understands page content
- 🎯 **Easy Embedding**: Single script tag integration
- ⚡️ **Fast & Lightweight**: Self-contained bundle with minimal impact
- 🎨 **Responsive Design**: Works on desktop and mobile
- 💾 **Persistent History**: Chat history stored locally
- 🔒 **Secure**: Built on Cloudflare Workers with proper CORS handling

## Quick Start - Embedding the Widget

Add this single line to your website to embed the chat widget:

```html
<script src="https://your-domain.workers.dev/widget.js" async></script>
```

The widget will automatically:
- Extract your page content for context
- Display as a floating chat button in the bottom-right corner
- Provide AI-powered assistance about your page content

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
- `/script-test` - Production-style script tag test page

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

The widget automatically configures itself, but you can customize:

```javascript
// Optional: Set configuration before loading widget
window.WebsyteChat = {
  config: {
    apiEndpoint: '/api/chat',  // Custom API endpoint
    position: 'bottom-right',  // Widget position
    theme: 'default'           // Widget theme
  }
};
```

## Architecture

- **Frontend**: React + TypeScript compiled to vanilla JS bundle
- **Backend**: Cloudflare Workers with OpenAI integration
- **Styling**: Tailwind CSS (compiled and inlined)
- **Storage**: localStorage for chat history
- **Build**: Vite with custom widget configuration

## API Endpoints

- `POST /api/chat` - Main chat endpoint with context awareness
- `POST /api/summarize` - Page summarization (planned)
- `POST /api/audio` - Text-to-speech conversion (planned)

---

Built with ❤️ using React Router and Cloudflare Workers.
