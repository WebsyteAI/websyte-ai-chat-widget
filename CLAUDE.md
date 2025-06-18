# Websyte AI Chat Widget - Claude Documentation

## Project Overview
This is a React-based AI chat widget that can be embedded into websites. It provides content summarization, audio playback, and interactive chat functionality.

## Development Notes

### Package Management
- Always use pnpm for package management and scripts

## Recent Updates

### Custom Widget System with Vector Search Implementation (2025-01-18)
Implemented a comprehensive custom widget system with vector search, file management, and user authentication:

#### Widget System Features
- **User-Scoped Widgets**: All widgets are associated with authenticated users for complete isolation and security
- **File Upload & Storage**: Support for TXT, PDF, DOC, DOCX, MD files stored in Cloudflare R2 with metadata tracking
- **Vector Search**: Content chunking and OpenAI embeddings for semantic search across widget content
- **Content Processing**: Automatic embedding generation for both text content and uploaded files
- **Responsive Dashboard**: Mobile-first UI with intuitive widget management interface

#### Database Schema Extensions
- **`widget` table**: Replaces legacy `widgets` with user association, name, description, and optional URL
- **`widget_embedding` table**: Stores vector embeddings with pgvector support and HNSW indexing
- **`widget_file` table**: Tracks uploaded files in R2 with metadata (filename, type, size)
- **Migration Strategy**: Preserves existing legacy widgets table during transition

#### API Endpoints Added
**Widget Management**:
- **`GET /api/widgets`** - List user's widgets with pagination
- **`POST /api/widgets`** - Create new widget with files and content
- **`GET /api/widgets/:id`** - Get widget details with files and embedding count
- **`PUT /api/widgets/:id`** - Update widget metadata and content
- **`DELETE /api/widgets/:id`** - Delete widget (cleans up R2 files & embeddings)

**Vector Search**:
- **`POST /api/widgets/:id/search`** - Search within specific widget content
- **`POST /api/widgets/search`** - Search across all user's widgets

**File Management**:
- **`POST /api/widgets/:id/files`** - Upload files to widget
- **`GET /api/widgets/:id/files/:fileId/download`** - Download files
- **`DELETE /api/widgets/:id/files/:fileId`** - Remove files from widget

#### Backend Services Implemented
- **VectorSearchService**: OpenAI embeddings generation, text chunking, and cosine similarity search
- **FileStorageService**: R2 file upload/download with automatic cleanup and metadata management
- **WidgetService**: Complete CRUD operations with integrated file and embedding management
- **Enhanced DatabaseService**: Added `getDatabase()` method for new service integration

#### Frontend Components
- **WidgetList**: Grid view with create/edit/delete actions, file counts, and embedding statistics
- **WidgetForm**: Create/edit form with drag-and-drop file upload and validation
- **SearchWidget**: Vector search interface with similarity scores and result highlighting
- **Enhanced Dashboard**: Tabbed interface (My Widgets/Search/Analytics/Settings)

#### Technical Implementation
- **Vector Embeddings**: OpenAI text-embedding-ada-002 with 1536 dimensions
- **Search Algorithm**: Cosine similarity with HNSW indexing for performance
- **File Processing**: Automatic content extraction and embedding generation
- **Authentication**: All widget operations require authenticated user sessions
- **R2 Integration**: Cloudflare R2 bucket (`WIDGET_FILES`) for scalable file storage

#### Infrastructure & Configuration
- **R2 Bucket**: Added `WIDGET_FILES` binding to wrangler.jsonc
- **File Organization**: Hierarchical R2 storage structure for optimal organization and performance
- **Dependencies**: Added OpenAI SDK and Radix UI components
- **Type Safety**: Complete TypeScript definitions for all new services and APIs
- **Database Migration**: Generated and applied schema changes with proper indexing

#### R2 File Storage Structure
Files are organized in a hierarchical structure for efficient management and retrieval:

```
websyte-ai-widget/
└── widgets/
    └── {widgetId}/
        └── {year}/
            └── {month}/
                └── {day}/
                    ├── document_name_2025-01-18T14-30-15.pdf
                    ├── readme_2025-01-18T14-32-10.md
                    └── data_2025-01-18T15-20-45.txt
```

**Benefits of this structure:**
- **Widget Isolation**: Files are organized by widget ID for security
- **Date Organization**: Easy browsing and cleanup by upload date
- **Scalability**: Distributes files across many directories for performance
- **Backup/Migration**: Easy to backup or migrate specific widget data
- **Analytics**: Simple to analyze usage patterns by date/widget
- **Maintenance**: Efficient cleanup of old files using date hierarchy

#### Files Added/Modified
- `workers/services/vector-search.ts` - Vector embedding and search functionality
- `workers/services/file-storage.ts` - R2 file management service
- `workers/services/widget.ts` - Widget CRUD operations with integrated services
- `workers/db/schema.ts` - New widget tables with pgvector support
- `app/components/widgets/` - Complete widget management UI components
- `app/routes/dashboard.tsx` - Enhanced dashboard with widget management
- `wrangler.jsonc` - R2 bucket configuration
- Database migration files in `drizzle/`

#### Key Benefits
1. **Scalable Architecture**: Designed for high-volume file storage and fast vector search
2. **User Isolation**: Complete separation of user data with authentication requirements
3. **Semantic Search**: Intelligent content discovery across uploaded files and text
4. **Mobile-Responsive**: Touch-friendly interface for all device types
5. **Performance Optimized**: Efficient database queries with proper indexing strategies

### Authentication System Implementation (2025-01-18)
Implemented a comprehensive authentication system using a custom SimpleAuth solution compatible with Cloudflare Workers:

#### Authentication Features
- **Custom Auth Implementation**: Built SimpleAuth class using Web Crypto API instead of Better Auth (which had Cloudflare Workers compatibility issues)
- **Database Integration**: Extended database schema with auth tables (user, session, account, verification)
- **Session Management**: HTTP-only cookies with 7-day expiration and automatic cleanup
- **Password Security**: SHA-256 hashing using Web Crypto API for Cloudflare Workers compatibility

#### Routes Added
- **`/login`** - Main authentication page with login/register forms
- **`/login?mode=register`** - Login page in register mode
- **`/register`** - Redirects to login page in register mode
- **`/dashboard`** - Protected user dashboard requiring authentication

#### API Endpoints
- **`POST /api/auth/sign-up`** - User registration
- **`POST /api/auth/sign-in`** - User authentication
- **`POST /api/auth/sign-out`** - Session termination
- **`GET /api/auth/session`** - Current session retrieval

#### Frontend Components
- **AuthContext**: React context for authentication state management
- **LoginForm/RegisterForm**: Authentication forms with validation
- **UserProfile**: Dropdown component with user info and navigation
- **AuthModal**: Modal-based authentication (alternative to page-based)

#### Security Features
- **Route Protection**: Middleware for protected API endpoints
- **Session Validation**: Automatic session expiration and cleanup
- **CSRF Protection**: Secure cookie configuration
- **Optional Authentication**: Backwards compatible with existing anonymous usage

#### Technical Implementation
- **SimpleAuth Class**: Custom authentication using Drizzle ORM and Neon PostgreSQL
- **Web Crypto API**: Cryptographic operations compatible with Cloudflare Workers
- **Environment Configuration**: Added `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` variables
- **Cloudflare Workers Compatible**: Uses `nodejs_compat` flag for enhanced Node.js compatibility

#### Files Added/Modified
- `workers/lib/auth.ts` - Custom SimpleAuth implementation
- `workers/services/auth.ts` - Authentication service layer
- `workers/lib/middleware.ts` - Authentication middleware
- `app/lib/auth/auth-context.tsx` - React authentication context
- `app/components/auth/` - Authentication UI components
- `app/routes/login.tsx` - Login page route
- `app/routes/dashboard.tsx` - Protected dashboard route
- Database schema extended with auth tables

### Database Schema Optimization (2025-01-17)
Removed redundant "recommendations" key from database storage structure to optimize data storage:

#### What Changed
- **Database Schema**: Updated `recommendations` column to store recommendation arrays directly instead of nested wrapper objects
- **Storage Optimization**: Eliminated redundant structure where `{recommendations: [...], placeholder: "..."}` was stored in a column already named "recommendations"
- **API Compatibility**: Maintained full backward compatibility - API responses still include both recommendations array and placeholder string
- **Error Handling**: Fixed abort error status codes (400 → 499) to match test expectations

#### Technical Details
**Before**: Database stored `{recommendations: Array<{title, description}>, placeholder: string}` in `recommendations` column
**After**: Database stores `Array<{title, description}>` directly in `recommendations` column, with placeholder generated at API response level

#### Files Modified
- `workers/db/schema.ts` - Updated recommendations column type definition
- `workers/services/database.ts` - Modified setRecommendations/getRecommendations methods
- `workers/services/common.ts` - Fixed error handler status codes

#### Impact
- **Reduced Data Redundancy**: Cleaner database storage without nested wrapper objects
- **Maintained Compatibility**: All existing API consumers continue to work unchanged
- **Improved Efficiency**: Simplified data structure reduces storage overhead
- **No Breaking Changes**: Frontend and API contracts remain identical

### Admin UI Removal (2025-01-17)
Removed all admin UI components and related functionality from the codebase to simplify the architecture:

#### What Was Removed
- **Admin Routes**: All `/admin/cache/*` routes and route files
- **Admin Components**: Cache management UI components  
- **Admin API Endpoints**: `/api/admin/cache/*` API routes
- **Admin Services**: `CacheAdminService` and related functionality
- **Build Artifacts**: Admin-related compiled assets

#### Files Removed
- `app/routes/admin.cache.$url.tsx` - Admin cache detail page
- Admin route configurations from `app/routes.ts`
- Admin API endpoints from `workers/app.ts`
- `CacheAdminService` imports and references

#### Impact
- Simplified codebase architecture
- Removed unused admin functionality
- Cache data is still stored and managed automatically
- No user-facing functionality affected

### Cache System Simplification (2025-01-17)
With admin UI removed, cache system now operates automatically:

**Cache Behavior**:
- **Data Storage**: All generated summaries/recommendations are stored automatically
- **Cache Serving**: Data is served from cache when available
- **URL Tracking**: URLs are tracked automatically when accessed
- **No Manual Control**: Cache operates transparently without admin interface

### Responsive Design Implementation (2025-01-16)
Implemented comprehensive mobile responsiveness across the chat widget components:

#### ActionBar Component (`app/components/ChatWidget/components/ActionBar.tsx`)
- **Layout Structure**: Two-container approach with logo/AI text on left and buttons taking remaining space
- **Mobile Behavior**: 
  - Logo and "AI" text use smaller sizes (`w-6 h-6`, `text-sm`)
  - Buttons take equal width (33% each) using `flex-1`
  - Icon-only buttons with `hidden sm:inline` text labels
  - Content centered with `justify-center`
- **Desktop Behavior**:
  - Standard logo size (`w-8 h-8`, `text-base`)
  - Buttons still take equal width but show text labels
  - Icons + text visible with proper spacing
- **Key CSS Classes**:
  - Main container: `flex items-center justify-between w-full sm:justify-start sm:gap-4`
  - Buttons container: `flex flex-1`
  - Individual buttons: `flex-1` for equal distribution

#### ChatPanel Component (`app/components/ChatWidget/components/ChatPanel.tsx`)
- **Mobile Responsive**: Updated fixed width to responsive layout
- **CSS Changes**: `w-full max-w-[28rem] sm:w-[28rem] sm:min-w-[400px]`
- **Mobile Margins**: Added `mx-4 sm:mx-0` for proper mobile spacing

#### CSS Updates (`app/app.css`)
- **Container Width**: Updated `.container-action` and `.container-audio` to use fluid widths
- **Mobile Constraints**: `width: 640px` with `max-width: calc(100vw - 2rem)` fallback
- **Removed Animations**: Eliminated width transition animations that conflicted with responsive behavior

#### Animation Fix
- **Transform Conflict**: Fixed slide-in animation that included `translateX(-50%)` conflicting with centering
- **Solution**: Applied `-translate-x-1/2` only in initial state, let animation handle centering during transition

## Widget System Usage

### Development Setup
1. **Environment Variables**: Ensure `.dev.vars` includes all required variables:
   ```
   OPENAI_API_KEY="your-openai-api-key"
   DATABASE_URL="postgresql://user:password@host/database"
   BETTER_AUTH_URL="http://localhost:5173"
   BETTER_AUTH_SECRET="your-secret-key-generate-a-secure-one-in-production"
   ```

2. **R2 Bucket Setup**: Create Cloudflare R2 bucket for file storage:
   ```bash
   # Create R2 bucket (via Cloudflare dashboard or CLI)
   # Bucket name: "websyte-ai-widget"
   ```

3. **Database Migration**: Widget tables are automatically created via Drizzle migrations
   ```bash
   pnpm run db:generate  # Generate migration files for widget tables
   pnpm run db:push      # Apply to database including pgvector support
   ```

### Using Widget System

#### Creating Widgets
```typescript
// Frontend - Create widget with files
const formData = new FormData();
formData.append('name', 'My Knowledge Base');
formData.append('description', 'Company documentation');
formData.append('content', 'Text content for vector search');
formData.append('file_0', file); // File uploads

const response = await fetch('/api/widgets', {
  method: 'POST',
  credentials: 'include',
  body: formData
});
```

#### Vector Search
```typescript
// Search within specific widget
const response = await fetch(`/api/widgets/${widgetId}/search`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ 
    query: 'search terms',
    limit: 10 
  })
});

// Search across all widgets
const response = await fetch('/api/widgets/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ 
    query: 'search terms',
    limit: 20 
  })
});
```

#### Backend Services
```typescript
// Widget service example
import { WidgetService } from './services/widget';
import { VectorSearchService } from './services/vector-search';
import { FileStorageService } from './services/file-storage';

const vectorSearch = new VectorSearchService(apiKey, databaseService);
const fileStorage = new FileStorageService(r2Bucket, databaseService);
const widgetService = new WidgetService(databaseService, vectorSearch, fileStorage);

// Create widget with content processing
const widget = await widgetService.createWidget(userId, {
  name: 'Documentation Hub',
  description: 'Company knowledge base',
  content: 'Initial text content',
  files: [uploadedFile]
});
```

## Authentication Usage

### Using Authentication in Components
```tsx
import { useAuth } from '@/lib/auth/auth-context';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  if (isAuthenticated) {
    return <div>Welcome, {user?.name}!</div>;
  }
  
  return <LoginForm />;
}
```

### Protecting Routes
- **Page-level protection**: Use `useAuth()` hook in route components
- **API-level protection**: Authentication middleware automatically applied to API routes
- **Optional authentication**: Existing routes remain accessible to anonymous users

### Authentication Flow
1. **Registration**: `/login?mode=register` → Creates user account → Auto sign-in
2. **Login**: `/login` → Validates credentials → Sets session cookie
3. **Session Management**: Automatic session validation on page load
4. **Logout**: Clears session cookie and redirects to home page

## Component Architecture

### Core Chat Widget Components
- **ChatWidget**: Main container component managing state and layout
- **ActionBar**: Responsive button bar with logo and action buttons
- **ChatPanel**: Sliding chat interface with message history
- **AudioPlayer**: Audio playback controls with progress tracking
- **MessageInput**: Text input with send/cancel functionality

### Widget Management Components
- **WidgetList**: Grid view displaying user's widgets with actions
  - File count and embedding statistics
  - Create/edit/delete functionality
  - Responsive card layout with metadata
- **WidgetForm**: Create/edit form with comprehensive validation
  - Drag-and-drop file upload interface
  - Text content input for vector processing
  - Support for TXT, PDF, DOC, DOCX, MD files
- **SearchWidget**: Vector search interface across widgets
  - Similarity score display
  - Result highlighting and metadata
  - Cross-widget and widget-specific search modes

### Dashboard Components
- **Enhanced Dashboard**: Tabbed interface with four main sections:
  - **My Widgets**: Widget management and creation
  - **Search**: Cross-widget vector search functionality
  - **Analytics**: Usage statistics and performance metrics
  - **Settings**: User profile and preferences management

### Authentication Components
- **AuthContext**: React context for authentication state management
- **LoginForm/RegisterForm**: Authentication forms with validation
- **UserProfile**: Dropdown component with user info and navigation
- **AuthModal**: Modal-based authentication (alternative to page-based)

### Key Features
- **Content Summarization**: Three modes (Original, Short, Medium)
- **Audio Playback**: Text-to-speech with speed controls
- **Interactive Chat**: Q&A interface with message history
- **Vector Search**: Semantic content discovery across uploaded files
- **File Management**: Upload, download, and delete files with metadata
- **User Authentication**: Secure user sessions with route protection
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Smart Animations**: Smooth transitions between modes without conflicts

## Development Notes

### Widget Development Best Practices

#### Vector Search Optimization
1. **Text Chunking**: Keep chunks between 500-1500 characters for optimal embedding quality
2. **Overlap Strategy**: Use 100-200 character overlap between chunks to maintain context
3. **Similarity Thresholds**: Default threshold of 0.7 for relevance, adjust based on use case
4. **Embedding Dimensions**: Using OpenAI text-embedding-ada-002 (1536 dimensions) for consistency

#### File Processing Guidelines
1. **Supported Formats**: TXT, PDF, DOC, DOCX, MD files for optimal content extraction
2. **File Size Limits**: Recommend max 10MB per file for performance
3. **Content Extraction**: Plain text extraction for embedding generation
4. **Metadata Tracking**: Store original filename, type, size for user reference
5. **File Organization**: R2 storage uses hierarchical structure: `widgets/{widgetId}/{year}/{month}/{day}/{filename}_{timestamp}.ext`

#### Database Performance
1. **Vector Indexing**: HNSW index with cosine similarity for fast search
2. **Query Optimization**: Use pagination for widget lists, limit search results
3. **Cleanup Strategy**: Automatic cascade deletion for embeddings and files
4. **Index Maintenance**: Regular VACUUM and ANALYZE for vector performance

#### Authentication & Security
1. **Route Protection**: All widget endpoints require authentication
2. **User Isolation**: Widgets are completely isolated by user ID
3. **File Access**: Secure R2 URLs with user verification
4. **Input Validation**: Sanitize all user inputs before processing

### Responsive Design Principles
1. **Mobile-First**: Start with mobile constraints, enhance for desktop
2. **Equal Distribution**: Buttons take equal space using `flex-1`
3. **Content Centering**: Use `justify-center` for consistent alignment
4. **Text Visibility**: Hide text on mobile (`hidden sm:inline`), show on desktop
5. **Size Scaling**: Smaller elements on mobile, standard sizes on desktop

### CSS Best Practices
- Use `calc(100vw - 2rem)` for viewport-aware width constraints
- Avoid conflicting transform animations
- Prefer flex-based layouts over absolute positioning for responsive design
- Use semantic breakpoint prefixes (`sm:`) for desktop enhancements

### Common Issues & Solutions
- **Transform Conflicts**: Animation transforms can conflict with layout transforms
- **Width Overflow**: Use `max-width` with viewport calculations for mobile safety
- **Button Distribution**: Use `flex-1` on buttons and `flex` container for equal spacing
- **Text Overflow**: Hide text on mobile, show on desktop for better UX
- **Vector Search Latency**: Implement caching for frequently searched terms
- **R2 Upload Errors**: Handle network timeouts with retry mechanisms
- **Embedding Generation**: Queue large files for background processing

## Testing

### UI Component Testing
- Test on multiple screen sizes (mobile, tablet, desktop)
- Verify button equal distribution and centering
- Check animation smoothness without layout conflicts
- Validate text visibility across breakpoints

### Widget System Testing
- **Authentication**: Verify all widget routes require login
- **File Upload**: Test drag-and-drop and click upload flows
- **Vector Search**: Validate search results and similarity scores
- **CRUD Operations**: Test create, read, update, delete widget flows
- **Error Handling**: Test network failures, large files, invalid formats
- **Performance**: Test with multiple files and large content chunks
- **R2 Integration**: Verify file upload, download, and deletion
- **Database**: Test migration and vector index performance

## Build Commands
```bash
# Development
pnpm dev                    # Start development server with auth support

# Database
pnpm run db:generate        # Generate database migration files
pnpm run db:push           # Apply migrations to database  
pnpm run db:studio         # Open Drizzle Studio for database management

# Build & Deploy
pnpm run build             # Build for production
pnpm run deploy            # Deploy to Cloudflare Workers

# Testing
pnpm test                  # Run test suite including auth tests
pnpm run test:coverage     # Run tests with coverage report

# Type Checking
pnpm typecheck            # Validate TypeScript types
```

## Environment Configuration

### Required Environment Variables
```bash
# OpenAI Integration
OPENAI_API_KEY="your-openai-api-key"

# Database
DATABASE_URL="postgresql://user:password@host/database"

# Authentication (added in v2025-01-18)
BETTER_AUTH_URL="http://localhost:5173"  # Dev: localhost, Prod: your domain
BETTER_AUTH_SECRET="your-secure-secret-key"  # Generate a secure random string
```

### Cloudflare Workers Configuration
- **Compatibility Date**: `2025-04-04` (ensures latest features)
- **Compatibility Flags**: `["nodejs_compat"]` (enables Node.js APIs like crypto)
- **Main Entry**: `./workers/app.ts` (Hono application with auth and widget routes)
- **R2 Bindings**: `WIDGET_FILES` bucket for file storage

### Database Requirements
- **PostgreSQL**: Neon PostgreSQL with pgvector extension enabled
- **Vector Support**: Ensure pgvector extension is installed for embeddings
- **Indexes**: HNSW indexes for efficient vector similarity search
- **Connection**: Database must be accessible from Cloudflare Workers

### Production Deployment Notes
1. **Secrets Management**: Use `wrangler secret put` for production secrets
   ```bash
   wrangler secret put OPENAI_API_KEY
   wrangler secret put DATABASE_URL
   wrangler secret put BETTER_AUTH_SECRET
   ```
2. **R2 Bucket**: Create and configure `websyte-ai-widget` bucket
3. **Domain Configuration**: Update `BETTER_AUTH_URL` to production domain
4. **Database**: Ensure Neon PostgreSQL database is accessible from Workers
5. **Vector Extension**: Verify pgvector extension is enabled in production
6. **CORS**: Authentication and widget endpoints properly configured for cross-origin requests
7. **File Size Limits**: Configure appropriate upload limits for your use case
8. **Performance**: Monitor vector search performance and adjust indexes as needed