# Websyte AI Chat Widget - Planning Document

## Project Overview
An embeddable AI chat widget for article websites that can ingest page content and provide features like summarization and audio conversion via OpenAI integration.

**🚀 DEPLOYED**: [https://websyte-ai-chat-widget.clementineso.workers.dev](https://websyte-ai-chat-widget.clementineso.workers.dev)

## Project Status: ✅ PRODUCTION READY

The widget is fully functional and deployed to production with all core features implemented.

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
- [x] Add audio player with full UI transformation and controls

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
- [x] Streamline build process with protected public directory and stable file copying
- [x] Remove "Speak with me" button (consolidated to "Listen to me")
- [x] Fix action bar centering with proper CSS variable handling
- [x] Simplify CSS injection by removing manual overrides

### Phase 8: Production Optimization ✅ COMPLETED
- [x] Final action bar height adjustments for improved compactness
- [x] Build process optimization to output directly to public/dist
- [x] Fix widget development workflow to eliminate build loops
- [x] Streamline single-command development experience with `pnpm run dev:widget`
- [x] Performance testing and optimization
- [x] Production deployment to Cloudflare Workers
- [x] Documentation updates (README.md and PLANNING.md)
- [x] Live demo deployment: https://websyte-ai-chat-widget.clementineso.workers.dev

### Phase 9: Targeted Widget Injection ✅ COMPLETED
- [x] Add `data-target-element` attribute support for custom injection targets
- [x] Implement dual positioning modes (fixed overlay vs. relative inline)
- [x] Update ChatWidget component to handle targeted vs. body injection
- [x] Create fallback mechanism when target element is not found
- [x] Fix hydration issues with SSR by using useEffect for script injection
- [x] Add comprehensive test pages for both injection methods
- [x] Maintain backward compatibility with existing implementations

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
├── dist/
│   └── widget.js          # Built widget bundle (with CSS inlined)  
└── nativo-logo.png        # Default logo asset

vite.widget.config.ts       # Vite config for widget build with CSS inlining
tailwind.config.js          # Tailwind CSS v4 configuration
```

### Embedding Code ✅ IMPLEMENTED
```html
<!-- Basic embedding -->
<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" async></script>

<!-- Advanced embedding with configuration -->
<script 
  src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" 
  data-content-target="main, .content, article"
  data-api-endpoint="/api/chat"
  data-base-url="https://api.example.com"
  data-target-element="#my-container"
  data-advertiser-name="My Brand"
  data-advertiser-logo="https://logo.clearbit.com/mybrand.com"
  data-position="bottom-center"
  data-theme="default"
  async
></script>
```

### Script Tag Configuration ✅ IMPLEMENTED
- `data-content-target`: CSS selector for page content extraction
- `data-api-endpoint`: Custom API endpoint URL
- `data-base-url`: Base URL for all API endpoints
- `data-target-element`: CSS selector for widget injection target ✅ NEW
- `data-advertiser-name`: Custom branding name
- `data-advertiser-logo`: Custom logo URL
- `data-position`: Widget position (bottom-center, bottom-right, etc.)
- `data-theme`: UI theme selection

### Build Process ✅ IMPLEMENTED
```bash
# Build widget only (builds to dist/, copies to public/)
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
- **Chat Widget UI**: Modern glass morphism design with advanced features ✅ **UPDATED**
  - **Customizable branding**: Configurable advertiser name and logo via script attributes
  - **Top action bar**: Always-visible top-center interface with larger buttons
  - **Multi-feature buttons**: Summarize, Listen, Chat actions with enhanced text size
  - **Slide-out chat panel**: Smooth animation from right side
  - **Transparent design**: Glass morphism with backdrop blur
  - **Message interface**: Full chat with history, timestamps, loading states
  - **Smart recommendations**: AI-generated questions specific to article content ✅ **NEW**
  - **Nativo attribution**: "Powered by Nativo" subtitle in welcome message
  - **Responsive layout**: Works on desktop and mobile
  - Located in: `app/components/ChatWidget.tsx`

- **Backend API**: Cloudflare Workers endpoints
  - `/api/chat`: Main chat endpoint with OpenAI integration
  - `/api/recommendations`: AI-generated article-specific questions ✅ **NEW**
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

## Final Project Summary

The Websyte AI Chat Widget is now **production-ready** and deployed. Key achievements:

### 🎯 Core Features Delivered
- ✅ **Embeddable Widget**: Single script tag integration
- ✅ **AI Chat**: OpenAI-powered conversations with page context
- ✅ **Summarization**: One-click page summarization
- ✅ **Modern UI**: Glass morphism design with customizable branding
- ✅ **Shadow DOM**: Complete style isolation
- ✅ **Configuration**: Flexible script attribute configuration

### 🚀 Production Deployment
- **Live URL**: https://websyte-ai-chat-widget.clementineso.workers.dev
- **Widget URL**: https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js
- **Test Pages**: `/test` and `/script-test` routes available
- **Performance**: ~200KB widget bundle, optimized for production

### 🛠 Development Workflow
- **Single Command Development**: `pnpm run dev:widget` for auto-rebuilding
- **Clean Build Process**: Outputs to `public/dist/widget.js`
- **No Build Loops**: Optimized Vite configuration
- **Easy Deployment**: `pnpm run deploy` for full production deployment

The project successfully delivers a fully functional, production-ready AI chat widget that can be embedded on any website with minimal integration effort.

### 🚧 Future Enhancements
- **Audio API Integration**: Connect audio player to OpenAI text-to-speech
  - Audio player UI complete with full controls and animations
  - Need to implement /api/audio endpoint for text-to-speech conversion
  - Need to integrate actual audio playback with OpenAI TTS API
  - Current implementation uses mock progress simulation for testing

### 📋 Remaining Tasks
1. ~~**Command Integration**: Connect summarize API to action buttons~~ ✅ **COMPLETED**
2. ~~**Content Extraction Enhancement**: Improve filtering and quality~~ ✅ **COMPLETED**
3. ~~**Base URL Configuration**: Enable configurable API endpoints~~ ✅ **COMPLETED**
4. ~~**Shadow DOM Implementation**: Complete style isolation system~~ ✅ **COMPLETED**
5. ~~**Build System Optimization**: Protected public directory, CSS inlining, infinite loop fixes~~ ✅ **COMPLETED**
6. **Audio API Backend**: Connect audio player UI to OpenAI text-to-speech API
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
9. ~~**Optimize build system, protect public directory, and remove infinite loops**~~ ✅ Done
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
- **Build Process Optimization**: Protected public directory, stable file copying, eliminated infinite loops
- **Infinite Loop Resolution**: Fixed build system issues that caused endless rebuild cycles
- **Manual Override Removal**: Simplified CSS injection by letting Tailwind handle all utility generation
- **Action Bar Fixes**: Resolved centering and positioning issues with proper CSS variable handling
- **UI Cleanup**: Removed "Speak with me" button, consolidated to "Listen to me" for cleaner interface

### Key Technical Achievements
- **Complete Style Isolation**: Widget styles never conflict with or leak to host page
- **Tailwind CSS v4**: Latest version with improved CSS custom properties and Shadow DOM support
- **Stable Build System**: Protected public directory, controlled file copying, no infinite loops
- **Clean CSS Injection**: Pure Tailwind CSS without manual overrides or !important declarations
- **Reliable Builds**: Eliminated infinite loops and race conditions in build process
- **Smaller Bundle**: Reduced from 206KB to 202KB by removing redundant CSS

### Technical Implementation Details
- **Shadow DOM Setup**: `app/widget-entry.tsx:91-99` - Clean CSS injection into shadow root
- **Vite Configuration**: `vite.widget.config.ts` - Dist output with public copy, CSS inlining, watch protection
- **Tailwind Config**: `tailwind.config.js` - v4 configuration for Shadow DOM compatibility
- **Build Process**: `package.json:7` - Widget build with protected public directory and stable copying
- **CSS Processing**: PostCSS with @tailwindcss/postcss for proper compilation

### Problem Solving Approach
- **Identified Root Cause**: Manual CSS overrides indicated Tailwind wasn't working properly
- **Shadow DOM Research**: Understood CSS custom property inheritance in Shadow DOM
- **Build System Analysis**: Found infinite loops caused by file watching and copying
- **Incremental Testing**: Built and deployed each fix to verify improvements
- **CSS Simplification**: Trusted Tailwind to handle utility generation rather than manual overrides

### Performance & Maintenance Benefits
- **Smaller Bundle Size**: Removed 4KB of redundant CSS overrides
- **Stable Builds**: Protected public directory and controlled file operations
- **Better Maintainability**: No manual CSS to maintain, Tailwind handles everything
- **Reliable Deployment**: No more build system race conditions or infinite loops
- **Future-Proof**: Modern Shadow DOM approach ready for complex host page scenarios

## Recent Implementation: Audio Player UI ✅

### What Was Completed
- **Action Bar Transformation**: Complete UI transformation between action bar and audio player modes
- **Smooth Animations**: Container width transitions with fade in/out effects for content switching
- **Audio Player Controls**: Play/pause, progress bar with seeking, speed control (0.5x-2x), and exit functionality
- **Visual Feedback**: Animated border effects during playback with blue-to-green color transitions
- **Progress Tracking**: Real-time elapsed/total time display in MM:SS format with monospace font
- **Centered Layout**: Properly centered action bar contents with consistent container height
- **Mock Simulation**: Progress updates and time tracking for testing UI functionality

### Key Technical Achievements
- **Single Container Approach**: One container smoothly transitions between 42rem (action) and 20rem (audio) widths
- **Fade Transition System**: Content fades out → container resizes → new content fades in
- **Animation Timing**: 200ms fade out + 180ms delay + 200ms fade in for smooth transitions
- **Prevent Text Wrapping**: CSS `white-space: nowrap` and `flex-shrink: 0` for stable button layout
- **Custom CSS Animations**: Dedicated keyframes for audio border effects and fade transitions
- **State Management**: Clean React state for audio mode, playing state, progress, and transition control

### Technical Implementation Details
- **Container Classes**: `.container-action` (42rem) and `.container-audio` (20rem) with smooth width transitions
- **Animation CSS**: Custom fade-in/fade-out keyframes with cubic-bezier easing
- **Progress Simulation**: useEffect hook simulates audio progress for UI testing
- **Time Formatting**: Helper function converts seconds to MM:SS format
- **Border Animation**: Color-shifting glow effect during playback using CSS keyframes
- **Button States**: Proper disabled states during transitions to prevent UI conflicts

### User Experience Features
- **Intuitive Controls**: Standard audio player layout with familiar icons and interactions
- **Visual Continuity**: Container maintains same height (3.5rem) between modes
- **Responsive Feedback**: All interactions provide immediate visual feedback
- **Clean Transitions**: No jarring movements or layout shifts during mode changes
- **Professional Polish**: Monospace time display, proper spacing, and consistent styling

### Development Process Insights
- **Component Architecture**: Built on existing ChatWidget structure for maintainability
- **CSS Strategy**: Used specific pixel values instead of `auto` for smooth width transitions
- **Animation Timing**: Iteratively refined timing delays for optimal user experience
- **State Coordination**: Carefully managed multiple state variables to prevent conflicts
- **Testing Approach**: Mock progress simulation allows full UI testing without backend audio

### Next Steps for Audio Feature
- **Backend Integration**: Implement `/api/audio` endpoint with OpenAI text-to-speech
- **Audio Playback**: Replace mock simulation with actual HTML5 audio element
- **Content Integration**: Connect audio generation to page content or chat messages
- **Error Handling**: Add audio loading and playback error states
- **Real Progress**: Replace simulated progress with actual audio duration tracking

## Recent Implementation: Targeted Widget Injection ✅

### What Was Completed
- **Target Element Support**: Added `data-target-element` attribute to inject widget into specific DOM elements
- **Dual Positioning Modes**: Automatic detection between fixed overlay and inline injection
- **Backward Compatibility**: Maintains existing behavior when no target element is specified
- **Error Handling**: Graceful fallback to body injection if target element not found
- **Hydration Safety**: Fixed SSR hydration issues by using useEffect for script injection
- **Comprehensive Testing**: Created test pages demonstrating both injection methods

### Key Technical Achievements
- **Flexible Injection**: Widget can be injected into any DOM element via CSS selector
- **Smart Positioning**: Automatically switches between fixed and relative positioning based on injection target
- **Shadow DOM Compatibility**: Targeted injection works seamlessly with Shadow DOM isolation
- **Multiple Widget Support**: Allows multiple widgets with different targets on the same page
- **SSR Safety**: Prevents hydration mismatches in server-side rendered environments

### Technical Implementation Details
- **Widget Entry**: Modified `app/widget-entry.tsx` to detect and use target elements
- **Component Updates**: Updated `app/components/ChatWidget.tsx` with positioning logic
- **Configuration**: Added `targetElement` to widget configuration system
- **Test Routes**: Created `/target-test` and updated `/script-test` with hydration fixes
- **Static Test**: Added `public/test-injection.html` for standalone testing

### Usage Examples

**Targeted Injection:**
```html
<script 
  src="./dist/widget.js" 
  data-target-element="#my-container"
  data-content-target="article, main"
  data-advertiser-name="My Brand"
  async>
</script>
```

**Standard Injection (unchanged):**
```html
<script 
  src="./dist/widget.js" 
  data-content-target="article, main"
  data-advertiser-name="My Brand"
  async>
</script>
```

### Behavior Differences

| Feature | Body Injection | Targeted Injection |
|---------|---------------|-------------------|
| Positioning | Fixed overlay | Inline within container |
| Action bar | Top center of viewport | Top center of container |
| Chat panel | Fixed right side | Below action bar in container |
| Z-index | 9999 | 999 |
| Animation | Slide-in from top | Simple opacity fade |

### User Experience Benefits
- **Content Integration**: Widget appears as part of the page content rather than overlay
- **Design Flexibility**: Publishers can place widgets exactly where they want them
- **Responsive Design**: Widgets adapt to container dimensions
- **Multiple Placements**: Support for multiple widgets in different page sections
- **Accessibility**: Better screen reader compatibility with inline positioning

### Development Process Insights
- **Backward Compatibility**: Careful preservation of existing functionality during enhancement
- **SSR Challenges**: Learned importance of client-only script injection for React applications
- **Testing Strategy**: Created comprehensive test cases covering both injection modes
- **Configuration Design**: Extended existing script attribute system rather than creating new APIs
- **Error Handling**: Robust fallback mechanisms ensure widget always works