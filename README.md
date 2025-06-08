# Websyte AI Chat Widget

An embeddable AI chat widget with modern glass morphism design that provides intelligent, context-aware conversations using OpenAI integration.

**🚀 Live Demo**: [https://websyte-ai-chat-widget.clementineso.workers.dev](https://websyte-ai-chat-widget.clementineso.workers.dev)

## Features

- 🎨 **Modern Glass Design**: Transparent blur effects with customizable advertiser branding
- 🎯 **Multi-Action Interface**: Summarize, Listen (with audio player), and Chat capabilities with smooth animations
- 🧠 **Enhanced Content Extraction**: Smart filtering removes scripts, ads, and navigation
- 🔗 **Configurable Base URLs**: Connect to any API backend via `data-base-url`
- 🎭 **Shadow DOM Isolation**: Complete style isolation prevents conflicts with host page
- 🎨 **Tailwind CSS v4**: Modern utility-first styling with Shadow DOM compatibility
- 🎯 **Flexible Injection**: Inject widget into any DOM element or use as fixed overlay ✅ **NEW**
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
  data-target-element="#my-container"
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
- **`data-base-url`**: Base URL for all API endpoints (default: `""`)
- **`data-target-element`**: CSS selector for widget injection target (default: none - uses fixed overlay) ✅ **NEW**
- **`data-advertiser-name`**: Custom advertiser/brand name (default: `"Nativo"`)
- **`data-advertiser-logo`**: Custom advertiser/brand logo URL (optional)
- **`data-position`**: Widget position (default: `"bottom-center"`)
- **`data-theme`**: UI theme selection (default: `"default"`)

The widget will automatically:
- Display a persistent action bar (top center of viewport or within target container)
- Extract content from your specified target elements
- Generate AI-powered question recommendations specific to the article content
- Provide multiple AI interaction modes (Chat, Summarize, Listen)
- Show a slide-out chat panel when needed (or below action bar for targeted injection)
- Display "Powered by Nativo" attribution in the chat welcome message
- Use either fixed overlay positioning or inline injection based on configuration

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
- `/target-test` - Targeted injection demonstration showing both fixed and inline modes ✅ **NEW**

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
  data-target-element="#widget-container"
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
    targetElement: '#widget-container',
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
- `POST /api/recommendations` - AI-generated questions about article content ✅ **IMPLEMENTED**
- `POST /api/summarize` - Page summarization ✅ **IMPLEMENTED**
- `POST /api/audio` - Text-to-speech conversion with audio player ✅ **IMPLEMENTED**

### Audio Player Feature

The widget includes an advanced audio player that transforms from the action bar:

- **Action bar transformation**: "Listen to me" button transforms the entire action bar into an audio player
- **Smooth animations**: Container smoothly expands/contracts with fade transitions between modes
- **Full audio controls**: Play/pause, progress seeking, speed control (0.5x to 2x), and exit functionality
- **Visual feedback**: Animated border effects during playback with color transitions
- **Progress tracking**: Real-time elapsed/total time display (MM:SS format)
- **Centered layout**: Properly centered controls with consistent height between modes

### Smart Recommendations Feature

The widget generates intelligent question recommendations:

- **AI-powered questions**: OpenAI analyzes article content to generate specific, relevant questions
- **Article-specific**: Questions like "What causes this problem?" or "How does this work?" based on actual content
- **Interactive carousel**: Scrollable recommendations that users can click to start conversations
- **Fallback questions**: Graceful defaults if content analysis fails
- **Context-aware**: Questions adapt to the type and topic of the article

### Summarize Feature

The widget includes a fully functional summarize feature:

- **One-click summarization**: Click the "Summarize" button in the action bar
- **Automatic content extraction**: Uses configurable CSS selectors to extract page content
- **AI-powered summaries**: OpenAI generates concise 2-3 paragraph summaries
- **Chat integration**: Summaries appear directly in the chat interface
- **Loading states**: Visual feedback during summarization process
- **Error handling**: Graceful fallbacks if summarization fails

## Widget Injection Options

### Fixed Overlay Mode (Default)

By default, the widget appears as a fixed overlay on the page:

```html
<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" async></script>
```

- Action bar appears at top center of viewport
- Chat panel slides out from right side
- Uses high z-index (9999) to appear above page content
- Smooth slide-in animation on page load

### Targeted Injection Mode ✅ NEW

Inject the widget into a specific DOM element:

```html
<div id="widget-container"></div>
<script 
  src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" 
  data-target-element="#widget-container"
  async>
</script>
```

- Widget appears inline within the target container
- Action bar centers within container width
- Chat panel appears below action bar
- Uses relative positioning for seamless page integration
- Supports multiple widgets with different targets on same page

### Injection Behavior Comparison

| Feature | Fixed Overlay | Targeted Injection |
|---------|---------------|-------------------|
| **Positioning** | Fixed overlay | Inline within container |
| **Action bar** | Top center of viewport | Top center of container |
| **Chat panel** | Slide from right side | Below action bar |
| **Z-index** | 9999 | 999 |
| **Animation** | Slide-in from top | Simple opacity fade |
| **Use case** | Blog overlays | Content integration |

### Error Handling

- If target element is not found, automatically falls back to fixed overlay mode
- Console warning logged when fallback occurs
- Ensures widget always appears even with incorrect configuration

---

Built with ❤️ using React Router and Cloudflare Workers.

## Recent Updates

### ✅ Targeted Widget Injection (Latest)
- Added flexible injection into any DOM element via `data-target-element`
- Dual positioning modes with automatic detection
- Complete backward compatibility maintained
- Enhanced test pages and documentation
- Fixed SSR hydration issues for React applications
