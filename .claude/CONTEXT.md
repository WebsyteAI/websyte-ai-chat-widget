# Development Context & Guidelines

## Project Overview
This is a production-ready AI chat widget for article websites built with React/TypeScript, Cloudflare Workers, and OpenAI integration. The widget can be embedded via a single script tag and provides context-aware chat, summarization, and content analysis features.

## Key Documentation Files
- **PLANNING.md**: Comprehensive project planning document with architecture, implementation phases, technical specifications, and detailed implementation history
- **README.md**: User documentation and setup instructions  
- **test/README.md**: Comprehensive test suite documentation with coverage details and testing patterns

## Current Project Status: ✅ PRODUCTION READY
- **Live Deployment**: https://websyte.ai
- **Widget Bundle**: https://websyte.ai/dist/widget.js
- **Total Tests**: 235 tests across 9 test files with 100% coverage
- **Bundle Size**: ~200KB optimized for production

## Core Architecture
- **Frontend**: React + TypeScript compiled to standalone widget bundle
- **Backend**: Cloudflare Workers with AI integrations
- **Database**: Neon PostgreSQL + Drizzle ORM with pgvector extension
- **Styling**: Tailwind CSS v4 with Shadow DOM isolation
- **Storage**: PostgreSQL for embeddings/data, localStorage for client state  
- **AI Services**: OpenAI GPT-4.1-mini + text-embedding-3-small, Mistral AI
- **Search**: Vector similarity search with embeddings, full-text search

## Key Features Implemented
1. **Custom Widget Embed Scripts**: Generate personalized AI assistants with custom knowledge bases
2. **Embeddable Widget**: Single script tag integration with Shadow DOM isolation
3. **RAG Chat Agent**: Retrieval-Augmented Generation with knowledge base integration
4. **Vector Search**: Semantic search using OpenAI embeddings and pgvector
5. **Chat Message Persistence**: Secure storage of conversations for insights and audits
6. **Smart Message Controls**: Only save messages from embedded widgets, not test environments
7. **Session Management**: Secure session tracking with automatic cleanup
8. **Rate Limiting**: API protection with configurable limits (10/min anonymous, 30/min authenticated)
9. **Embed Code Generation**: One-click script generation with public/private controls
10. **Public Widget API**: Anonymous access to public widgets for embedding
11. **Context-Aware Chat**: AI chat with page content context
12. **Content Summarization**: One-click page summarization with smart content replacement
13. **OCR Support**: Extract and search text from images and PDF documents
14. **Multi-AI Support**: OpenAI GPT-4.1-mini and Mistral AI integration
15. **Content Caching**: Intelligent caching system with TTL and LRU eviction (70-80% performance improvement)
16. **Testing Playground**: Comprehensive widget testing environment at `/test`
17. **GDPR Compliance**: Configurable IP storage and automatic data cleanup

## Recent Major Implementations

### Chat Message Persistence System ✅ (Latest)
- **Secure Message Storage**: Complete chat message persistence with metadata tracking
- **Smart Controls**: Messages only saved from embedded widgets, not test environments
- **Session Management**: Cryptographically secure session IDs with localStorage integration
- **Rate Limiting**: API protection with 10/min anonymous, 30/min authenticated limits
- **GDPR Compliance**: Configurable IP storage and automatic data cleanup
- **Database Schema**: Comprehensive chat_message table with proper indexing
- **Security Features**: Input validation, rate limiting, and session ownership validation
- **Automatic Cleanup**: Cron job for message retention (configurable, default 30 days)
- **Comprehensive Logging**: Debug-friendly logging for message save/skip operations
- **Privacy by Design**: Anonymous user support and minimal data collection

### Dashboard Refactoring & Widget Editor ✅
- **Nested Routes**: Converted dashboard tabs to proper nested routes using React Router 7
- **Route Configuration**: Explicit route configuration in `app/routes.ts` with nested structure
- **Full-Screen Widget Editor**: Split-screen layout with form (50%) and chat preview (50%)
- **OpenAI GPT Editor Style**: Mimics OpenAI's custom GPT editor interface
- **Dynamic Layouts**: Dashboard conditionally applies max-width based on route
- **Removed Search Tab**: Simplified navigation by removing global search functionality
- **Analytics Coming Soon**: All analytics sections now show "Coming Soon" placeholder
- **Chat Panel Scrolling Fix**: Fixed overflow handling to keep input always visible when sources are expanded

### Custom Widget Embed Script Support ✅
- **Widget Embed Generation**: One-click embed code generation in WidgetForm.tsx
- **Public/Private Controls**: Toggle widget visibility with `isPublic` database field
- **Custom Widget ID Support**: `data-widget-id` attribute in embed scripts for RAG functionality
- **Public Widget API**: Anonymous access endpoint `/api/widgets/:id/public`
- **Enhanced ChatWidget**: Support for custom widget IDs and RAG-powered responses
- **Testing Playground**: Comprehensive `/test` route for widget experimentation
- **Updated Landing Page**: Showcases custom widget workflow and capabilities

### RAG & Vector Search System ✅
- **RAG Agent**: Context-aware chat with knowledge base retrieval using similarity search
- **Vector Embeddings**: OpenAI text-embedding-3-small with 1536 dimensions
- **pgvector Integration**: PostgreSQL vector similarity search with cosine distance
- **Text Chunking**: Intelligent chunking with overlap for better semantic coherence
- **OCR Support**: Extract and embed text from images and PDF documents
- **Multi-AI Support**: Integrated Mistral AI alongside OpenAI models
- **Full-text Search**: Enhanced Drizzle ORM queries for comprehensive search

### Content Caching System ✅ 
- Implemented intelligent content caching with TTL (5 minutes) and LRU eviction
- Cache-first architecture with URL + contentTarget composite keying
- Cache warming on widget initialization for instant subsequent access
- 70-80% performance improvement by eliminating redundant DOM processing
- Comprehensive test coverage (41 tests) for all caching functionality

### Comprehensive Test Suite ✅
- **Total**: 235 tests across 9 files (93 worker services + 121 app library tests + 21 integration tests)
- **Coverage**: 100% statements, 100% functions, 100% lines, 98% branches
- **Libraries Tested**: All app/lib utilities (content-extractor, content-cache, storage, utils)
- **Worker Services**: Complete coverage of chat, recommendations, summarize, openai, common services
- **Test Framework**: Vitest with jsdom environment and comprehensive mocking infrastructure

### Smart Content Detection ✅
- AI-powered content structure analysis for intelligent summarization
- Selective content replacement that preserves headers, navigation, and metadata
- Semantic selector system for identifying article components
- Maintains publisher branding while replacing only main content areas

## File Structure
```
app/
├── components/
│   ├── ChatWidget.tsx           # Main widget component with all features
│   ├── LandingPage.tsx         # Professional marketing landing page
│   └── ui/                     # shadcn/ui component library
├── lib/
│   ├── content-cache.ts        # Intelligent caching system with TTL/LRU
│   ├── content-extractor.ts    # Enhanced content extraction with caching
│   ├── storage.ts              # localStorage management utilities
│   └── utils.ts                # Tailwind class merging utilities
├── widget-entry.tsx            # Standalone widget entry point with Shadow DOM
└── [test files for all lib utilities]

workers/
├── app.ts                      # Main Cloudflare Workers API endpoints
├── db/schema.ts               # Database schema with vector embeddings & chat messages
├── lib/
│   └── rate-limiter.ts        # Rate limiting middleware for API protection
├── cron/
│   └── cleanup-messages.ts    # Automatic message cleanup job
└── services/
    ├── chat.ts                 # Chat service with message persistence controls
    ├── messages.ts             # Chat message persistence and session management
    ├── recommendations.ts      # AI-generated article recommendations  
    ├── summarize.ts           # Page summarization service
    ├── openai.ts              # OpenAI API integration
    ├── common.ts              # Shared utilities and error handling
    ├── rag-agent.ts           # RAG chat agent with knowledge retrieval
    ├── vector-search.ts       # Vector search and embeddings service
    ├── database.ts            # Database service layer
    └── [comprehensive test files for all services]
```

## API Endpoints
- `POST /api/chat` - Context-aware chat with message persistence (supports widgetId for RAG)
- `POST /api/recommendations` - AI-generated article discussion questions
- `POST /api/summarize` - Page content summarization
- `POST /api/analyze-selector` - Smart content selector analysis
- `GET /api/widgets/:id/public` - Public widget access (no auth required)
- `POST /api/rag-chat` - RAG-powered chat with knowledge base retrieval
- `POST /api/search` - Vector similarity search across widget content
- `POST /api/embeddings` - Create embeddings for documents and content
- `POST /api/ocr` - Extract text from images and PDFs for embedding
- `GET /api/widgets/:id/messages` - Retrieve chat messages for a widget (future)
- `GET /api/widgets/:id/sessions/:sessionId/messages` - Get session messages (future)

## Configuration Options

### Standard Widget (Page Content Chat)
```html
<script 
  src="https://websyte.ai/dist/widget.js"
  data-content-target="main, .content, article"
  data-target-element="#my-container"
  data-advertiser-name="My Brand"
  data-advertiser-logo="https://logo.clearbit.com/mybrand.com"
  data-base-url="https://api.example.com"
  async>
</script>
```

### Custom Widget (RAG-Powered with Knowledge Base & Message Persistence)
```html
<script 
  src="https://websyte.ai/dist/widget.js"
  data-widget-id="your-widget-uuid-here"
  data-save-chat-messages="true"
  data-advertiser-name="My Company"
  data-advertiser-logo="https://logo.clearbit.com/mycompany.com"
  async>
</script>
```

## Development Commands
- `pnpm run dev:widget` - Development with auto-rebuilding
- `pnpm run build:widget` - Build widget bundle
- `pnpm test:run` - Run all tests
- `pnpm test:coverage` - Test coverage report
- `pnpm run deploy` - Deploy to Cloudflare Workers

## Technical Implementation

### Content Processing
- Automatic content extraction and filtering
- Advanced noise removal (scripts, styles, navigation)
- Content validation with quality requirements
- 10,000 character limit for optimal performance

### Caching System
- Intelligent TTL and LRU eviction strategies
- URL-based composite keying
- Statistics tracking and monitoring
- Graceful fallback mechanisms

### Testing Framework
- Vitest with comprehensive mocking infrastructure
- 100% coverage requirements
- Error scenario and edge case testing
- Performance validation

## Future Development Guidelines

### When Adding New Features
1. **Refer to PLANNING.md** for architectural decisions and implementation history
2. **Check test/README.md** for testing patterns and coverage requirements
3. **Implement comprehensive tests** with 100% coverage expectation
4. **Use content caching** for any content extraction operations
5. **Follow Shadow DOM patterns** for UI components
6. **Update documentation** in both PLANNING.md and relevant README files

### Testing Requirements
- All new services require comprehensive test suites
- Use existing mock patterns from test files
- Cover all error scenarios (HTTP errors, validation failures, API errors)
- Maintain 100% statement/function/line coverage
- Update test/README.md with new test descriptions

### Performance Focus
- Content caching for all DOM operations
- Bundle size optimization (<50KB additions)
- API rate limiting and content size management
- Large content and concurrent request testing

## Common Patterns and Utilities

### RAG Chat Integration
```typescript
// Initialize RAG agent
const ragAgent = new RAGAgent(openaiApiKey, widgetService);

// Generate context-aware response
const result = await ragAgent.generateResponse({
  message: userQuery,
  widgetId: widgetId,
  history: chatHistory
}, userId, {
  maxRetrievedChunks: 5,
  similarityThreshold: 0.3
});

// Stream response for real-time chat
const stream = await ragAgent.streamResponse(request, userId, options);
```

### Vector Search Usage
```typescript
// Initialize vector search service
const vectorSearch = new VectorSearchService(openaiApiKey, databaseService);

// Create embeddings for content
await vectorSearch.createEmbeddingsForWidget(
  widgetId, 
  textContent, 
  'document',
  fileId
);

// Search similar content
const results = await vectorSearch.searchSimilarContent(
  query, 
  widgetId, 
  limit: 10,
  threshold: 0.7
);

// Process OCR pages and create embeddings
await vectorSearch.createEmbeddingsFromOCRPages(
  widgetId,
  fileId, 
  ocrPages
);
```

### Content Extraction
```typescript
// Use cache-first extraction
const pageContent = await ContentExtractor.extractPageContent(contentTarget);

// Warm cache on initialization
await ContentExtractor.warmCache(contentTarget);

// Get cache statistics
const stats = ContentExtractor.getCacheStats();
```

### Error Handling (Services)
```typescript
// Use shared error handling utilities
return ErrorHandler.handleAbortError(error, fallbackResponse);
return ErrorHandler.handleGeneralError(error, message, status);
```

### Custom Widget Embed Code Generation
```typescript
// Generate embed script in WidgetForm
const generateEmbedCode = () => {
  if (!widget?.id) return '';
  
  const baseUrl = window.location.origin;
  const attributes = [
    `src="${baseUrl}/dist/widget.js"`,
    widget.id ? `data-widget-id="${widget.id}"` : '',
    advertiserName ? `data-advertiser-name="${advertiserName}"` : '',
    advertiserLogo ? `data-advertiser-logo="${advertiserLogo}"` : '',
    'async'
  ].filter(Boolean);
  
  return `<script ${attributes.join(' ')}></script>`;
};

// Copy embed code to clipboard
const copyEmbedCode = async () => {
  const embedCode = generateEmbedCode();
  await navigator.clipboard.writeText(embedCode);
};
```

### Public Widget Access Pattern
```typescript
// Check if widget is public in chat service
const publicWidget = await this.widgetService.getPublicWidget(widgetId);

if (publicWidget) {
  // Public widget - no auth required, use anonymous user ID
  const ragResult = await this.ragAgent.generateResponse(body, 'anonymous');
} else if (auth?.user?.id) {
  // Private widget - requires auth
  const ragResult = await this.ragAgent.generateResponse(body, auth.user.id);
}
```

### Widget Entry Script Pattern
```typescript
// Parse data-widget-id from script tag
const widgetId = scriptTag.getAttribute('data-widget-id');
if (widgetId) scriptConfig.widgetId = widgetId;

// Pass to ChatWidget component
<ChatWidget 
  widgetId={config.widgetId}
  advertiserName={config.advertiserName}
  // ... other props
/>
```

### Testing Patterns
```typescript
// Mock Hono context
const mockContext = createMockContext('POST', { message: 'test' });

// Mock content cache
vi.mocked(contentCache.get).mockReturnValue(mockContent);

// Test error scenarios
const abortController = new AbortController();
abortController.abort();
```

This memory document should be referenced for architectural decisions, testing requirements, and understanding the current implementation state of the Websyte AI Chat Widget project.