# Changelog

All notable changes to the Websyte AI Chat Widget will be documented in this file.

## [Latest] - 2025-06-25

### ✅ NEW Features

#### Website Crawler Integration
- **Apify Integration**: Crawl entire websites up to 25 pages
- **Domain Boundaries**: Respects same-hostname restrictions
- **Markdown Extraction**: Converts HTML to clean markdown content
- **Media Blocking**: Skips images/videos for faster crawling
- **Sitemap Support**: Uses sitemaps when available for efficient crawling

#### Direct Widget Sharing
- **Share URLs**: Direct access via `/share/w/{widgetId}` routes
- **Full-Screen Interface**: Dedicated chat interface for shared widgets
- **SEO Optimization**: Meta tags and descriptions for better discovery
- **Public Access**: No authentication required for public widgets
- **Widget Stats**: Display knowledge base info and file counts

#### Smart Prompt Recommendations
- **Dynamic Suggestions**: Animated marquee of helpful prompts
- **Click to Use**: One-click to populate message input
- **Loading States**: Skeleton UI during recommendation loading
- **Hover to Pause**: Interactive scrolling control

#### Message Persistence & Analytics
- **Conversation History**: Secure storage of all chat messages for insights and analytics
- **Session Tracking**: Server-side session generation with cryptographic security
- **Smart Message Controls**: Messages only saved from embedded widgets, not test environments
- **Configurable Retention**: Automatic cleanup of messages older than retention period (default: 90 days)
- **GDPR Compliance**: Optional IP address storage with environment variable control

#### Security & Rate Limiting
- **API Rate Limiting**: Protection against abuse with configurable limits
  - Anonymous users: 10 requests per minute
  - Authenticated users: 30 requests per minute
- **In-Memory Rate Limiter**: Fast, efficient rate limiting without database overhead
- **User Identification**: Intelligent identification using user ID or IP address

#### Data Management
- **Automatic Cleanup**: Scheduled cron job runs daily at 2 AM to remove old messages
- **Cascade Deletion**: Messages automatically deleted when widget is removed
- **Indexed Queries**: Optimized database indexes for fast message retrieval

#### Enhanced Chat Experience
- **Inline Citations**: Markdown-formatted citations with source references in RAG responses
- **Toast Notifications**: User feedback for widget operations
- **Improved Scrolling**: Fixed chat panel scrolling behavior when sources are displayed
- **Full-Screen Chat UI**: Enhanced layout with fixed positioning and responsive design

### ✅ UPDATED Features

#### Landing Page
- Added 3 new features: Website Crawler, Direct Widget Sharing, Smart Prompts
- Updated workflow steps to include website crawling and sharing options
- Enhanced hero badges to highlight latest capabilities
- Expanded feature grid from 12 to 15 features

#### Documentation
- Comprehensive MESSAGE-PERSISTENCE.md with implementation details
- Updated ARCHITECTURE.md with message persistence system
- Enhanced CLAUDE.md with new features and essential files
- Added new service files documentation

### Technical Details

#### New Database Schema
```sql
-- Chat message persistence
CREATE TABLE chat_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widget(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### New Services
- `workers/services/messages.ts` - Message CRUD operations
- `workers/lib/rate-limiter.ts` - Rate limiting middleware
- `workers/cron/cleanup-messages.ts` - Scheduled cleanup job

#### Configuration
- `MESSAGE_RETENTION_DAYS` - Message retention period (default: 30)
- `STORE_IP_ADDRESSES` - GDPR-compliant IP storage (default: false)
- `RATE_LIMIT_ANONYMOUS` - Anonymous user rate limit (default: 10)
- `RATE_LIMIT_AUTHENTICATED` - Authenticated user rate limit (default: 30)

## [Previous] - 2025-06-24

### ✅ NEW Features
- Custom AI widgets with knowledge base upload
- RAG-powered chat with vector search
- Public widget API for anonymous access
- OCR support for PDFs and images
- Multi-AI support (OpenAI + Mistral)
- Full-screen widget editor
- Testing playground at `/test`