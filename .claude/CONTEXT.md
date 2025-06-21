# Development Context & Guidelines

## Project Overview
This is a production-ready AI chat widget for article websites built with React/TypeScript, Cloudflare Workers, and OpenAI integration. The widget can be embedded via a single script tag and provides context-aware chat, summarization, and content analysis features.

## Key Documentation Files
- **PLANNING.md**: Comprehensive project planning document with architecture, implementation phases, technical specifications, and detailed implementation history
- **README.md**: User documentation and setup instructions  
- **test/README.md**: Comprehensive test suite documentation with coverage details and testing patterns

## Current Project Status: ✅ PRODUCTION READY
- **Live Deployment**: https://websyte-ai-chat-widget.clementineso.workers.dev
- **Widget Bundle**: https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js
- **Total Tests**: 235 tests across 9 test files with 100% coverage
- **Bundle Size**: ~200KB optimized for production

## Core Architecture
- **Frontend**: React + TypeScript compiled to standalone widget bundle
- **Backend**: Cloudflare Workers with OpenAI API integration
- **Styling**: Tailwind CSS v4 with Shadow DOM isolation
- **Storage**: localStorage for message history and widget state
- **AI Services**: OpenAI GPT for chat, summarization, and recommendations

## Key Features Implemented
1. **Embeddable Widget**: Single script tag integration with Shadow DOM isolation
2. **Context-Aware Chat**: AI chat with page content context
3. **Content Summarization**: One-click page summarization with smart content replacement
4. **Smart Recommendations**: AI-generated discussion questions specific to article content
5. **Content Caching**: Intelligent caching system with TTL and LRU eviction (70-80% performance improvement)
6. **Targeted Injection**: Flexible widget placement via `data-target-element` attribute
7. **Professional UI**: Glass morphism design with smooth animations and responsive layout

## Recent Major Implementations

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
└── services/
    ├── chat.ts                 # Chat service with context handling
    ├── recommendations.ts      # AI-generated article recommendations  
    ├── summarize.ts           # Page summarization service
    ├── openai.ts              # OpenAI API integration
    ├── common.ts              # Shared utilities and error handling
    └── [comprehensive test files for all services]
```

## API Endpoints
- `POST /api/chat` - Context-aware chat with message history
- `POST /api/recommendations` - AI-generated article discussion questions
- `POST /api/summarize` - Page content summarization
- `POST /api/analyze-selector` - Smart content selector analysis

## Configuration Options
```html
<script 
  src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js"
  data-content-target="main, .content, article"
  data-target-element="#my-container"
  data-advertiser-name="My Brand"
  data-advertiser-logo="https://logo.clearbit.com/mybrand.com"
  data-base-url="https://api.example.com"
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