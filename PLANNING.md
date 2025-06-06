# Chat Widget Planning Document

## Project Overview
An embeddable AI chat widget for article websites that can ingest page content and provide features like summarization and audio conversion via OpenAI integration.

## Core Requirements

### Widget Features
- Simple text-based chat interface
- Message history (stored in localStorage)
- Real-time interaction with OpenAI
- Page content ingestion for context-aware responses
- Built-in commands: summarize, audio conversion (text-to-speech)

### Embedding Method
- Single `<script>` tag integration
- Self-contained widget with no external dependencies
- Minimal impact on host website performance

### Technical Stack
- **Frontend**: React + TypeScript (compiled to vanilla JS bundle)
- **Backend**: Cloudflare Workers (existing setup)
- **AI**: OpenAI API
- **Storage**: localStorage (client-side message history)
- **Styling**: Tailwind CSS v4 (compiled and inlined for Shadow DOM)
- **Isolation**: Shadow DOM for complete style encapsulation

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

### Phase 3: Special Commands ✅ COMPLETED
- [x] Add "/summarize" command (API endpoint implemented)
- [x] Connect summarize API to chat widget UI
- [x] Implement summarize button functionality with loading states
- [x] Add error handling and user feedback for summarization
- [ ] Add "/audio" command for text-to-speech

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

### Phase 6: Advanced UI & Configuration ✅ COMPLETED
- [x] Implement Nativo branding with logo
- [x] Add transparent glass morphism design with blur effects
- [x] Create persistent action bar with multiple AI features
- [x] Add slide-out chat panel from right side
- [x] Implement script tag attribute configuration system
- [x] Add configurable content target selector for page extraction

### Phase 7: Enhanced Build System & CSS ✅ COMPLETED
- [x] Implement Shadow DOM for complete style isolation
- [x] Upgrade to Tailwind CSS v4 with proper Shadow DOM support
- [x] Fix CSS inlining for widget bundle
- [x] Resolve backdrop-blur and transform utility issues
- [x] Streamline build process to output directly to public directory
- [x] Remove "Speak with me" button (consolidated to "Listen to me")
- [x] Fix action bar centering with proper CSS variable handling
- [x] Simplify CSS injection by removing manual overrides

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
├── widget-entry.tsx        # Standalone widget entry point with Shadow DOM
└── components/
    └── ChatWidget.tsx      # Main widget component

public/
└── widget.js              # Production widget file (built directly)

vite.widget.config.ts       # Vite config for widget build with CSS inlining
tailwind.config.js          # Tailwind CSS v4 configuration
```

### Embedding Code ✅ IMPLEMENTED
```html
<!-- Basic embedding -->
<script src="https://your-domain.workers.dev/widget.js" async></script>

<!-- Advanced embedding with configuration -->
<script 
  src="https://your-domain.workers.dev/widget.js" 
  data-content-target="main, .content, article"
  data-api-endpoint="/api/chat"
  data-base-url="https://api.example.com"
  data-position="bottom-center"
  data-theme="default"
  async
></script>
```

### Script Tag Configuration ✅ IMPLEMENTED
- `data-content-target`: CSS selector for page content extraction
- `data-api-endpoint`: Custom API endpoint URL
- `data-base-url`: Base URL for all API endpoints ✅ NEW
- `data-position`: Widget position (bottom-center, bottom-right, etc.)
- `data-theme`: UI theme selection

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
- **Chat Widget UI**: Modern glass morphism design with advanced features
  - **Nativo branding**: Logo integration with AI badge
  - **Persistent action bar**: Always-visible bottom-center interface
  - **Multi-feature buttons**: Summarize, Listen, Speak, Chat actions
  - **Slide-out chat panel**: Smooth animation from right side
  - **Transparent design**: Glass morphism with backdrop blur
  - **Message interface**: Full chat with history, timestamps, loading states
  - **Responsive layout**: Works on desktop and mobile
  - Located in: `app/components/ChatWidget.tsx`

- **Backend API**: Cloudflare Workers endpoints
  - `/api/chat`: Main chat endpoint with OpenAI integration
  - `/api/summarize`: Page summarization endpoint
  - Full CORS support for cross-origin embedding
  - Error handling and rate limiting considerations
  - Located in: `workers/app.ts`

- **Content Extraction**: Configurable page content detection
  - **Script tag configuration**: `data-content-target` attribute support
  - **Flexible selectors**: Custom CSS selectors for content targeting
  - **Smart fallbacks**: Meta description backup if selector fails
  - **Content processing**: Cleaning, size limiting, metadata extraction
  - **Context integration**: Automatic page context with chat messages
  - Located in: `app/components/ChatWidget.tsx` (extractPageContent function)

- **Local Storage**: Persistent chat history
  - Message history with page URL association
  - Widget state persistence (position, minimized state)
  - Automatic cleanup of old messages (1000 message limit)
  - Located in: `app/lib/storage.ts`

- **Test Environment**: Development sandbox with multiple test scenarios
  - **Component test**: `/test` route for widget development
  - **Production test**: `/script-test` route with realistic script tag embedding
  - **Configuration demo**: Example with data attributes
  - **Sample content**: Structured content for testing extraction
  - Located in: `app/routes/test.tsx` and `app/routes/script-test.tsx`

- **Widget Configuration**: Script tag attribute system
  - **Attribute parsing**: Automatic detection of data-* attributes
  - **Priority system**: Script attributes override window config override defaults
  - **Content targeting**: Configurable CSS selectors for page content
  - **API configuration**: Custom endpoints and positioning
  - Located in: `app/widget-entry.tsx` (getScriptConfig function)

- **Enhanced Content Extraction**: Improved filtering system ✅ **NEW**
  - **Script/Style Removal**: Automatically filters out `<script>` and `<style>` tags
  - **Navigation Filtering**: Removes nav, header, footer, sidebar elements
  - **Ad Filtering**: Removes advertisements and social media widgets
  - **Comment Filtering**: Removes comment sections and forms
  - **Clean Content**: Better quality content extraction for AI processing
  - Located in: `app/lib/content-extractor.ts` (removeScriptAndStyleContent function)

- **Configurable Base URL**: Full endpoint configuration support ✅ **NEW**
  - **Script Attribute**: `data-base-url` attribute for custom API base URLs
  - **All Endpoints**: Applies to `/api/chat`, `/api/recommendations`, `/api/summarize`
  - **Flexible Deployment**: Enables widget to connect to different backend services
  - **Cross-Domain**: Supports cross-origin API calls with custom domains
  - Located in: `app/widget-entry.tsx` and `app/components/ChatWidget.tsx`

- **Shadow DOM Integration**: Complete style isolation ✅ **NEW**
  - **Shadow Root**: Prevents CSS conflicts with host page styles
  - **Style Encapsulation**: Widget styles don't leak to parent page
  - **Tailwind CSS v4**: Full compatibility with Shadow DOM environment
  - **CSS Inlining**: Compiled Tailwind CSS injected directly into Shadow DOM
  - **Build Optimization**: Direct output to public directory, no temp files
  - Located in: `app/widget-entry.tsx` (createWidgetContainer function)

### 🚧 Partially Implemented
- **Audio Feature**: OpenAI text-to-speech API integration pending
  - Need to implement /api/audio endpoint
  - Need to add audio playback controls to UI
  - Need to integrate with "Listen to me" button (Speak button removed)

### 📋 Remaining Tasks
1. ~~**Command Integration**: Connect summarize API to action buttons~~ ✅ **COMPLETED**
2. ~~**Content Extraction Enhancement**: Improve filtering and quality~~ ✅ **COMPLETED**
3. ~~**Base URL Configuration**: Enable configurable API endpoints~~ ✅ **COMPLETED**
4. ~~**Shadow DOM Implementation**: Complete style isolation system~~ ✅ **COMPLETED**
5. ~~**Build System Optimization**: Direct output, CSS inlining, infinite loop fixes~~ ✅ **COMPLETED**
6. **Audio Feature**: Implement text-to-speech with OpenAI
7. ~~**Embedding System**: Create standalone widget bundle for external sites~~ ✅ Done
8. ~~**Widget Configuration**: Script tag attributes and content targeting~~ ✅ Done
9. ~~**Advanced UI**: Glass morphism design and slide animations~~ ✅ Done
10. **Performance Optimization**: Bundle size optimization and lazy loading

### 🔧 Technical Dependencies Added
- **UI Components**: Lucide React icons, Tailwind CSS utilities
- **Styling**: Class Variance Authority, clsx, tailwind-merge, @tailwindcss/postcss
- **Build System**: @tailwindcss/vite for Tailwind CSS v4 integration
- **Environment**: OpenAI API key configuration in worker environment

## Next Steps
1. ~~Set up basic widget structure and build process~~ ✅ Done
2. ~~Create Cloudflare Workers API endpoints~~ ✅ Done
3. ~~Implement page content extraction~~ ✅ Done
4. ~~Build and test embedding system~~ ✅ Done (test environment)
5. ~~Add OpenAI integration~~ ✅ Done
6. ~~**Implement special commands (summarize, audio)**~~ ✅ Summarize Done, Audio Pending
7. ~~**Create production embedding bundle**~~ ✅ Done
8. ~~**Implement Shadow DOM and fix CSS issues**~~ ✅ Done
9. ~~**Optimize build system and remove infinite loops**~~ ✅ Done
10. **Audio Feature Implementation** 🚧 Next Priority
11. **Performance testing and optimization** 📋 Future Priority

## Recent Implementation: Summarize Feature ✅

### What Was Completed
- **Button Integration**: Connected the existing "Summarize" button in the action bar to the `/api/summarize` endpoint
- **State Management**: Added `isSummarizing` state to handle loading and prevent duplicate requests
- **Content Extraction**: Reused existing `extractPageContent()` function to get page title, URL, and content
- **API Integration**: Implemented `handleSummarize()` function that sends content to the summarize endpoint
- **UI Feedback**: Added loading state ("Summarizing...") and disabled button during processing
- **Error Handling**: Graceful error messages if summarization fails
- **Chat Integration**: Summary appears as an assistant message in the chat interface with proper formatting
- **TypeScript Safety**: Added proper type definitions for API responses

### Key Learnings
- **Existing Infrastructure**: The backend API endpoint was already implemented and working
- **UI Integration**: Only needed to connect frontend button to existing API, no new backend work required
- **Content Extraction**: The page content extraction system was already robust and configurable
- **State Management**: React state patterns worked well for managing loading states
- **Error Boundaries**: Proper error handling at both API and UI levels prevents crashes
- **User Experience**: Automatic chat panel opening when summarize is clicked provides intuitive flow

### Technical Implementation Details
- **Location**: Main implementation in `app/components/ChatWidget.tsx:116-163`
- **API Endpoint**: Uses existing `/api/summarize` in `workers/app.ts:101-166`
- **Content Source**: Leverages `extractPageContent()` function for consistent content extraction
- **Response Formatting**: Summary appears with "**Summary of 'Page Title'**" header for clear identification
- **Loading States**: Button shows "Summarizing..." text and is disabled during API call
- **Integration**: Opens chat panel automatically and adds summary as assistant message

### Development Process Insights
- **Incremental Development**: Building on existing infrastructure made implementation fast and reliable
- **TypeScript Benefits**: Type safety caught potential issues early in development
- **Testing Approach**: Used existing development server to test functionality before deployment
- **Deployment**: Standard build and deploy process worked seamlessly with new feature

## Recent Implementation: Shadow DOM & Build System Optimization ✅

### What Was Completed
- **Shadow DOM Integration**: Complete style isolation to prevent conflicts with host page CSS
- **Tailwind CSS v4 Upgrade**: Modern utility-first styling with full Shadow DOM compatibility
- **CSS Inlining System**: Automated injection of compiled Tailwind CSS into Shadow DOM
- **Build Process Optimization**: Direct output to public directory, eliminated temp files and copying
- **Infinite Loop Resolution**: Fixed build system issues that caused endless rebuild cycles
- **Manual Override Removal**: Simplified CSS injection by letting Tailwind handle all utility generation
- **Action Bar Fixes**: Resolved centering and positioning issues with proper CSS variable handling
- **UI Cleanup**: Removed "Speak with me" button, consolidated to "Listen to me" for cleaner interface

### Key Technical Achievements
- **Complete Style Isolation**: Widget styles never conflict with or leak to host page
- **Tailwind CSS v4**: Latest version with improved CSS custom properties and Shadow DOM support
- **Simplified Build**: No more temp directories, copying, or complex file management
- **Clean CSS Injection**: Pure Tailwind CSS without manual overrides or !important declarations
- **Reliable Builds**: Eliminated infinite loops and race conditions in build process
- **Smaller Bundle**: Reduced from 206KB to 202KB by removing redundant CSS

### Technical Implementation Details
- **Shadow DOM Setup**: `app/widget-entry.tsx:91-99` - Clean CSS injection into shadow root
- **Vite Configuration**: `vite.widget.config.ts` - Direct public output, CSS inlining, watch ignored
- **Tailwind Config**: `tailwind.config.js` - v4 configuration for Shadow DOM compatibility
- **Build Process**: `package.json:7` - Simplified widget build without copy operations
- **CSS Processing**: PostCSS with @tailwindcss/postcss for proper compilation

### Problem Solving Approach
- **Identified Root Cause**: Manual CSS overrides indicated Tailwind wasn't working properly
- **Shadow DOM Research**: Understood CSS custom property inheritance in Shadow DOM
- **Build System Analysis**: Found infinite loops caused by file watching and copying
- **Incremental Testing**: Built and deployed each fix to verify improvements
- **CSS Simplification**: Trusted Tailwind to handle utility generation rather than manual overrides

### Performance & Maintenance Benefits
- **Smaller Bundle Size**: Removed 4KB of redundant CSS overrides
- **Faster Builds**: Eliminated file copying and temp directory management
- **Better Maintainability**: No manual CSS to maintain, Tailwind handles everything
- **Reliable Deployment**: No more build system race conditions or infinite loops
- **Future-Proof**: Modern Shadow DOM approach ready for complex host page scenarios