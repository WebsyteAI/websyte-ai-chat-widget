# Chat Widget Planning Document

## Project Overview
An embeddable AI chat widget for article websites that can ingest page content and provide features like summarization and audio conversion via OpenAI integration.

## Core Requirements

### Widget Features
- Simple text-based chat interface
- Message history (stored in localStorage)
- Real-time interaction with OpenAI
- Page content ingestion for context-aware responses
- Built-in commands: summarize, audio conversion

### Embedding Method
- Single `<script>` tag integration
- Self-contained widget with no external dependencies
- Minimal impact on host website performance

### Technical Stack
- **Frontend**: React + TypeScript (compiled to vanilla JS bundle)
- **Backend**: Cloudflare Workers (existing setup)
- **AI**: OpenAI API
- **Storage**: localStorage (client-side message history)
- **Styling**: Embedded CSS (no external stylesheets)

## Architecture

### Frontend Widget
```
┌─────────────────────────────────────┐
│           Host Website              │
│  ┌─────────────────────────────────┐│
│  │      <script> tag loads         ││
│  │    chat-widget.js bundle        ││
│  │                                 ││
│  │  ┌─────────────────────────────┐││
│  │  │     Chat Widget UI          │││
│  │  │  - Message list             │││
│  │  │  - Input field              │││
│  │  │  - Send button              │││
│  │  │  - Minimize/Expand          │││
│  │  └─────────────────────────────┘││
│  └─────────────────────────────────┘│
└─────────────────────────────────────┘
```

### Backend API (Cloudflare Workers)
```
┌─────────────────────────────────────┐
│        Cloudflare Workers           │
│                                     │
│  /api/chat                         │
│  - Receive message + page content   │
│  - Call OpenAI API                  │
│  - Return AI response               │
│                                     │
│  /api/summarize                     │
│  - Extract page content             │
│  - Generate summary via OpenAI      │
│                                     │
│  /api/audio                         │
│  - Text-to-speech via OpenAI        │
│  - Return audio URL/data            │
└─────────────────────────────────────┘
```

## Implementation Phases

### Phase 1: Basic Chat Widget ✅ COMPLETED
- [x] Create embeddable widget structure
- [x] Build basic chat UI (React components)
- [x] Implement message storage (localStorage)
- [x] Create widget mounting system
- [x] Set up Cloudflare Workers API endpoints
- [x] Integrate OpenAI API for basic chat

### Phase 2: Page Content Integration ✅ COMPLETED
- [x] Implement page content extraction
- [x] Send page context with chat messages
- [x] Handle context-aware responses

### Phase 3: Special Commands 🚧 IN PROGRESS
- [x] Add "/summarize" command (API endpoint implemented)
- [ ] Add "/audio" command for text-to-speech
- [ ] Implement command parsing and routing in frontend
- [ ] Connect summarize API to chat widget UI

### Phase 4: Widget Enhancement ✅ COMPLETED
- [x] Add minimize/expand functionality
- [x] Improve UI/UX
- [x] Add loading states
- [x] Error handling and retry logic

### Phase 5: Widget Build System ✅ COMPLETED
- [x] Create standalone widget entry point
- [x] Set up Vite build configuration for widget bundle
- [x] Generate widget.js from React components
- [x] Add build scripts to package.json
- [x] Create production test page with script tag

## Technical Specifications

### Current File Structure
```
app/
├── components/
│   ├── ChatWidget.tsx      # Main chat widget component
│   └── ui/                 # UI component library (shadcn/ui ready)
├── lib/
│   ├── content-extractor.ts # Page content extraction utilities
│   ├── storage.ts          # LocalStorage management
│   └── utils.ts            # General utilities (Tailwind classes)
├── routes/
│   ├── home.tsx            # Landing page
│   └── test.tsx            # Widget testing sandbox
└── app.css                 # Global styles with Tailwind theme

workers/
└── app.ts                  # Cloudflare Workers API endpoints

### Widget Bundle Structure ✅ IMPLEMENTED
```
app/
├── widget-entry.tsx        # Standalone widget entry point
└── components/
    └── ChatWidget.tsx      # Main widget component

dist/
└── widget.js              # Built widget bundle (self-contained)

public/
└── widget.js              # Production widget file (copied from dist)

vite.widget.config.ts       # Vite config for widget build
```

### Embedding Code ✅ IMPLEMENTED
```html
<!-- Simple one-line script tag embedding -->
<script src="https://your-domain.workers.dev/widget.js" async></script>
```

### Build Process ✅ IMPLEMENTED
```bash
# Build widget only
pnpm run build:widget

# Build entire project (includes widget)
pnpm run build
```

### API Endpoints

#### POST /api/chat
```json
{
  "message": "user message",
  "context": {
    "url": "https://example.com/article",
    "title": "Article Title",
    "content": "extracted page content"
  },
  "history": [
    {"role": "user", "content": "previous message"},
    {"role": "assistant", "content": "previous response"}
  ]
}
```

#### POST /api/summarize
```json
{
  "url": "https://example.com/article",
  "content": "full article content"
}
```

#### POST /api/audio
```json
{
  "text": "text to convert to speech",
  "voice": "alloy" // OpenAI voice option
}
```

### Data Flow
1. User loads article page with embedded script
2. Widget initializes and extracts page content
3. User sends message through widget
4. Widget sends message + page context to Cloudflare Workers
5. Workers process request and call OpenAI API
6. Response sent back to widget and displayed
7. Message history stored in localStorage

### Content Extraction Strategy
- Extract main article content using DOM selectors
- Common patterns: `<article>`, `.content`, `[role="main"]`
- Fallback to page title and meta description
- Strip HTML tags and clean whitespace
- Limit content size for API efficiency

### Storage Schema (localStorage)
```json
{
  "chatHistory": [
    {
      "id": "unique-id",
      "timestamp": "2025-01-05T10:30:00Z",
      "role": "user|assistant",
      "content": "message content",
      "pageUrl": "https://example.com/article"
    }
  ],
  "widgetState": {
    "isMinimized": false,
    "position": "bottom-right"
  }
}
```

## Development Setup

### Build Process
1. React components → Bundle with Vite
2. Inline CSS for self-contained widget
3. Generate embed script
4. Deploy to Cloudflare Workers static assets

### Environment Variables
- `OPENAI_API_KEY`: OpenAI API key
- `ALLOWED_ORIGINS`: CORS allowed origins
- `WIDGET_VERSION`: Version for cache busting

## Security Considerations
- CORS configuration for widget domains
- Rate limiting on API endpoints
- Input sanitization for page content
- API key protection in Workers environment
- Content length limits to prevent abuse

## Performance Considerations
- Lazy load widget to minimize impact on host site
- Debounce user input
- Compress page content before sending to API
- Cache common responses
- Minimize bundle size (<50KB gzipped)

## Current Implementation Status

### ✅ Completed Features
- **Chat Widget UI**: Fully functional React component with modern design
  - Collapsible interface (button → full chat window)
  - Message history with timestamps
  - Real-time typing indicators and loading states
  - Responsive design with Tailwind CSS
  - Located in: `app/components/ChatWidget.tsx`

- **Backend API**: Cloudflare Workers endpoints
  - `/api/chat`: Main chat endpoint with OpenAI integration
  - `/api/summarize`: Page summarization endpoint
  - Full CORS support for cross-origin embedding
  - Error handling and rate limiting considerations
  - Located in: `workers/app.ts`

- **Content Extraction**: Smart page content detection
  - Multiple selector strategies for different site structures
  - Content cleaning and size limiting
  - Metadata extraction (title, description, URL)
  - Located in: `app/lib/content-extractor.ts`

- **Local Storage**: Persistent chat history
  - Message history with page URL association
  - Widget state persistence (position, minimized state)
  - Automatic cleanup of old messages (1000 message limit)
  - Located in: `app/lib/storage.ts`

- **Test Environment**: Development sandbox
  - Test page at `/test` route for widget development
  - Sample content for testing extraction
  - Visual test instructions
  - Located in: `app/routes/test.tsx`

### 🚧 Partially Implemented
- **Command System**: Backend ready, frontend integration pending
  - Summarize API endpoint exists but not connected to chat UI
  - Need command parsing in chat input (e.g., "/summarize")
  - Need special handling for command responses

### 📋 Remaining Tasks
1. **Command Integration**: Connect summarize API to chat widget
2. **Audio Feature**: Implement text-to-speech with OpenAI
3. ~~**Embedding System**: Create standalone widget bundle for external sites~~ ✅ Done
4. **Widget Positioning**: Make position configurable
5. **Performance Optimization**: Bundle size optimization and lazy loading

### 🔧 Technical Dependencies Added
- **UI Components**: Lucide React icons, Tailwind CSS utilities
- **Styling**: Class Variance Authority, clsx, tailwind-merge
- **Environment**: OpenAI API key configuration in worker environment

## Next Steps
1. ~~Set up basic widget structure and build process~~ ✅ Done
2. ~~Create Cloudflare Workers API endpoints~~ ✅ Done
3. ~~Implement page content extraction~~ ✅ Done
4. ~~Build and test embedding system~~ ✅ Done (test environment)
5. ~~Add OpenAI integration~~ ✅ Done
6. **Implement special commands (summarize, audio)** 🚧 In Progress
7. ~~**Create production embedding bundle**~~ ✅ Done
8. **Performance testing and optimization** 📋 Next Priority