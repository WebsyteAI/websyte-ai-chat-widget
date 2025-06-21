# Claude Development Notes

## Quick Reference

### Package Manager
**ALWAYS use pnpm commands, never npm**:
- `pnpm install` - Install dependencies
- `pnpm build` - Build the application
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm dev` - Start development server
- `pnpm test` - Run tests

### Key Commands
- Widget development: `pnpm run dev:widget`
- Build widget only: `pnpm run build:widget`
- Test with coverage: `pnpm test:coverage`

### Testing Requirements
- **Always create tests for new features**
- Maintain 100% test coverage for worker services
- Use Vitest framework with comprehensive mocking
- See `.claude/TESTING.md` for detailed testing guidelines

### File Access Guidelines
**NEVER read these generated directories**:
- `dist/`, `build/`, `node_modules/`, `coverage/`

**Work with source files in**: `app/`, `workers/`, `test/`, and root config files.

## Documentation Maintenance
**IMPORTANT**: When adding new features or making significant changes, always update documentation:

### Required Documentation Updates
1. **README.md** - Update the following sections when applicable:
   - Features list (add new features with ✅ **NEW** flag)
   - Architecture section (note significant architectural changes)
   - API Endpoints (document new endpoints)
   - Recent Updates section (add new entry at top with latest changes)
   - Configuration options (if new script attributes added)

2. **PLANNING.md** - Update the following sections when applicable:
   - Project Status (if completion status changes)
   - Implementation Phases (mark completed phases as ✅ COMPLETED)
   - Recent Implementation sections (add detailed technical implementation notes)
   - File Structure (if new files or directories added)
   - API Endpoints (document new endpoint specifications)

3. **CLAUDE.md** (this file) - Update when applicable:
   - Architecture notes (for significant architectural changes)
   - New development patterns or requirements
   - Testing requirements (if test strategy changes)
   - Build process changes

### Documentation Standards
- Use ✅ **NEW** for brand new features
- Use ✅ **UPDATED** for significant enhancements to existing features  
- Use ✅ **ENHANCED** for improvements to existing functionality
- Include specific file locations when documenting technical implementations
- Always maintain the "Recent Updates" sections in chronological order (newest first)
- Document both the "what" and "why" of significant changes
- Include testing impact and coverage maintenance notes

### When to Update Documentation
- Adding new API endpoints or services
- Creating new UI components or major UI changes
- Implementing new configuration options
- Refactoring significant portions of code
- Adding new dependencies or changing build process
- Fixing bugs that affect user-facing functionality
- Performance optimizations or architectural improvements
- Removing features or functionality (document what was removed and why)

### Example Documentation Entry Format
```markdown
### ✅ Feature Name (Latest)
- **What Changed**: Brief description of the change
- **Technical Details**: Key implementation details and file locations
- **User Impact**: How this affects end users or developers
- **Testing**: Test coverage impact and validation approach
- **Benefits**: Why this change was made and its advantages
```

## Architecture Documentation

### OCR Document Processing Pipeline

The system features a comprehensive OCR processing pipeline for widget file uploads that automatically processes non-text documents and creates searchable embeddings.

```
File Upload Flow:
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Upload   │───►│  File Storage   │───►│ OCR Processing  │
│  (API Request)  │    │   (R2 Bucket)   │    │ (Mistral AI)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│Vector Embeddings│◄───│   Text Content  │◄───│  Page Markdown  │
│   (OpenAI)      │    │   Processing    │    │   Extraction    │
└─────────────────┘    └─────────────────┘    └─────────────────┘

Storage Structure: widgets/{widgetId}/{fileId}/
├── original_file.pdf          # Original uploaded file  
├── page_1.md                  # OCR extracted page 1
├── page_2.md                  # OCR extracted page 2
└── page_N.md                  # OCR extracted page N
```

#### Key Components:

1. **FileStorageService** (`workers/services/file-storage.ts`)
   - Manages R2 storage with UUID-based file structure
   - Automatically triggers OCR for non-text files
   - Handles file metadata and database records

2. **OCRService** (`workers/services/ocr-service.ts`)
   - Processes documents using Mistral AI OCR API
   - Extracts text as markdown per page
   - Stores individual page files in R2
   - Automatically creates embeddings via VectorSearchService

3. **VectorSearchService** (`workers/services/vector-search.ts`)
   - Creates embeddings using OpenAI text-embedding-3-small
   - Word-based chunking with 2000 word limit and 100 word overlap
   - Conservative token estimation (8192 token limit)
   - Batch embedding creation for efficiency

#### Processing Rules:
- **OCR Processed**: PDFs, images, Office docs, etc.
- **Direct Processing**: .md, .txt, .json, .csv files (skip OCR)
- **Cost Efficiency**: Re-chunking possible without re-OCR
- **Error Handling**: OCR failures don't break file upload

#### Integration Points:
- Widget creation with files: Automatic OCR processing
- File addition to existing widgets: Seamless OCR integration
- Search functionality: Searches across all OCR-extracted content
- File deletion: Cleans up all associated page files and embeddings

## Recent Implementation Updates

### ✅ OCR Document Processing System (Latest)
- **What Changed**: Implemented comprehensive OCR processing pipeline using Mistral AI for automatic document parsing and content extraction
- **Technical Details**:
  - **OCR Service**: Created `workers/services/ocr-service.ts` for Mistral AI integration with automatic page-by-page markdown extraction
  - **File Storage**: Updated `workers/services/file-storage.ts` with UUID-based paths (`widgets/{widgetId}/{fileId}/`) and automatic OCR triggering
  - **Vector Embeddings**: Enhanced `workers/services/vector-search.ts` with word-based chunking (2000 words, 100 overlap) and OCR-specific embedding creation
  - **API Integration**: Updated all widget endpoints in `workers/app.ts` to use string UUIDs instead of integer IDs
  - **Automatic Processing**: Files uploaded through any endpoint automatically trigger OCR for non-text files
  - **Storage Structure**: Original files plus individual page markdown files (page_1.md, page_2.md, etc.)
- **User Impact**: Zero-configuration document processing with automatic text extraction, chunking, and search capability for uploaded files
- **Testing**: Comprehensive error handling, token limit management, and cleanup procedures implemented
- **Benefits**: Cost-efficient processing (re-chunking without re-OCR), automatic embeddings creation, seamless integration with existing upload workflows

### ✅ Umami Analytics Integration
- **What Changed**: Implemented comprehensive Umami tracking using API-based approach with centralized configuration
- **Technical Details**: 
  - **API-based tracking**: Created `app/lib/umami-tracker.ts` using Umami Cloud API (`https://cloud.umami.is/api/send`) instead of client-side scripts
  - **Centralized configuration**: Shared website ID and script URL constants used by both widget and landing page
  - **Comprehensive event tracking**: Added tracking for widget load, button clicks, chat messages, and landing page actions
  - **Automatic browser data**: Programmatically generates hostname, language, referrer, screen resolution, title, and URL using browser APIs
  - **Widget integration**: `app/components/ChatWidget/ChatWidget.tsx` tracks all user interactions with detailed context
  - **Landing page integration**: `app/components/LandingPage.tsx` tracks demo clicks, code copying, and CTA interactions
  - **Root layout update**: `app/root.tsx` uses shared configuration for script tag
- **User Impact**: Comprehensive analytics tracking with no performance impact on user interactions
- **Testing**: All tracking events implemented and tested, proper error handling with graceful fallbacks
- **Benefits**: Reliable tracking via direct API calls, comprehensive user interaction data, privacy-friendly analytics, consistent tracking across components

### ✅ Zero-Configuration Content Extraction
- **What Changed**: Completely redesigned content ingestion to automatically process entire HTML pages without requiring content selectors
- **Technical Details**: 
  - **Removed content selector requirement**: Eliminated `data-content-target` attribute and related configuration from `app/widget-entry.tsx`
  - **Full page processing**: Updated `app/lib/content-extractor.ts` to process `document.documentElement` instead of targeted elements
  - **Enhanced content filtering**: Added comprehensive filtering to remove `<head>`, `<script>`, `<style>`, navigation, ads, and other noise elements
  - **HTML-to-markdown conversion**: Integrated structured markdown conversion for cleaner AI processing
  - **Updated integration points**: Modified `app/components/ChatWidget/ChatWidget.tsx` and type definitions to remove contentTarget dependencies
  - **Smart caching**: Updated cache system to use 'full-page' keys instead of selector-specific keys
- **User Impact**: Zero-configuration content extraction that automatically captures all relevant page content while filtering out noise
- **Testing**: Widget builds successfully, core functionality working, worker service tests passing
- **Benefits**: Effortless setup, complete page coverage, cleaner content for AI processing, better recommendations and summaries

### ✅ Modular Hooks Architecture
- **What Changed**: Extracted business logic from ChatWidget into custom hooks for better testability and maintainability
- **Technical Details**:
  - **useChatMessages**: Message state management with add/clear operations and localStorage persistence
  - **useAudioPlayer**: Audio playback simulation with controls, timing, and speed adjustment (0.5x to 2x)
  - **useContentSummarization**: Content mode switching, DOM manipulation, and API integration for summarization
  - **Component separation**: 6 focused UI components (ActionBar, AudioPlayer, ChatMessage, ChatPanel, MessageInput, RecommendationsList)
  - **Type safety**: Comprehensive TypeScript interfaces for all component props and hook returns
- **User Impact**: Zero UI changes while improving code quality and developer experience
- **Testing**: Enhanced testability with isolated components and business logic hooks
- **Benefits**: 55% code reduction in main component, better maintainability, easier feature development

### ✅ Recommendations Loading State Improvements
- **What Changed**: Enhanced recommendations loading state in action bar to prevent layout shifts
- **Technical Details**: 
  - Modified `app/components/ChatWidget/components/RecommendationsList.tsx` to show loading placeholders within marquee component
  - Fixed render condition to display loading state even when recommendations array is empty
  - Set loading placeholder dimensions to exactly match recommendation buttons (260px width, 34px height)
  - Updated loading count from 3 to 6 items to match backend generation
- **User Impact**: Seamless loading experience with no height jumping or layout shifts during recommendations loading
- **Testing**: Widget build validation, visual consistency testing
- **Benefits**: Better user experience with smooth transitions and consistent action bar behavior

### ✅ Widget Build Configuration Updates
- **What Changed**: Fixed widget build configuration and import path resolution
- **Technical Details**:
  - Added `vite-tsconfig-paths` plugin to `vite.widget.config.ts` for proper "@/lib/utils" import resolution
  - Removed non-existent `tw-animate-css` import from `app.css` that was causing build failures
  - Fixed `setIsPlaying` and `setElapsedTime` function access in ChatWidget audio controls
- **User Impact**: Stable widget builds and properly functioning audio controls
- **Testing**: Build process validation, widget functionality testing
- **Benefits**: Reliable build process and improved widget stability
