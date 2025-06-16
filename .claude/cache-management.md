# Cache Management System

## Overview

The cache management system provides per-URL control over KV caching for the websyte-ai-chat-widget. By default, caching is disabled for all URLs and must be explicitly enabled per URL.

## Architecture

### Backend Components

#### 1. UICacheService (`workers/services/ui-cache.ts`)
Core caching service that manages KV storage operations.

**Key Methods:**
- `getCacheEnabled(url: string): boolean` - Check if caching is enabled for a URL
- `setCacheEnabled(url: string, enabled: boolean)` - Enable/disable caching for a URL  
- `get(url: string): UICacheData | null` - Retrieve cached data
- `set(url: string, data: Partial<UICacheData>)` - Store cache data
- `listCachedUrls(): string[]` - List all cached URLs
- `getCacheStats()` - Get cache statistics
- `clearAll()` - Clear all cache data

**Cache Keys:**
- `ui:${url}` - Stores cached UI data (summaries, recommendations)
- `cache_enabled:${url}` - Stores boolean flag for cache enabled state

#### 2. CacheAdminService (`workers/services/cache-admin.ts`)
Admin service providing management endpoints for the cache system.

**API Endpoints:**
- `GET /api/admin/cache/stats` - Get cache statistics
- `GET /api/admin/cache/list` - List all cached URLs with data
- `POST /api/admin/cache/toggle/:url` - Toggle cache enabled/disabled for URL
- `DELETE /api/admin/cache/:url` - Clear cache for specific URL
- `DELETE /api/admin/cache/all` - Clear all cache

#### 3. Updated Services
**SummariesService & RecommendationsService:**
Now check `cache.getCacheEnabled(url)` before reading/writing cache data.

```typescript
// Only cache if URL provided, cache service exists, AND caching enabled for URL
if (url && this.cache && await this.cache.getCacheEnabled(url)) {
  const cached = await this.cache.getSummaries(url);
  if (cached) return c.json(cached);
}
```

### Frontend Components

#### 1. Cache Dashboard (`/admin/cache`)
Main management interface showing:
- **Statistics Cards:** Total cached URLs, enabled count, disabled count
- **Search/Filter:** Find specific URLs
- **Tabbed View:** All URLs, Enabled only, Disabled only
- **Bulk Actions:** Clear all cache
- **URL Cards:** Each showing URL, status badge, last updated, data types

#### 2. URL Detail Page (`/admin/cache/:url`)
Detailed view for specific URLs showing:
- **Cache Controls:** Enable/disable toggle, clear cache button
- **Cached Data Display:** Shows actual summaries and recommendations
- **Status Management:** Visual badges and real-time feedback

## Configuration

### KV Namespace
Configured in `wrangler.jsonc`:
```json
{
  "kv_namespaces": [
    {
      "binding": "WIDGET_CACHE",
      "id": "widget_cache", 
      "preview_id": "widget_cache_preview"
    }
  ]
}
```

### Environment Types
Updated in `workers/types.ts`:
```typescript
export interface Env {
  OPENAI_API_KEY: string;
  WIDGET_CACHE: KVNamespace;
}
```

## Usage

### Enabling Cache for a URL
1. Visit `/admin/cache`
2. Find the URL in the list (or use search)
3. Click "View Details" on the URL card
4. Click "Enable Cache" button

### API Usage
```typescript
// Enable caching for a URL
await fetch('/api/admin/cache/toggle/' + encodeURIComponent(url), {
  method: 'POST'
});

// Get cache statistics
const stats = await fetch('/api/admin/cache/stats').then(r => r.json());

// Clear all cache
await fetch('/api/admin/cache/all', { method: 'DELETE' });
```

## Data Flow

1. **First Request (Cache Disabled):**
   - Service checks `getCacheEnabled(url)` → returns `false`
   - Skips cache lookup, calls OpenAI API
   - Does not store result in cache
   - Returns fresh data

2. **After Enabling Cache:**
   - Service checks `getCacheEnabled(url)` → returns `true`
   - Checks cache for existing data
   - If found, returns cached data
   - If not found, calls OpenAI API and stores result

3. **Cache Management:**
   - Admin can view all cached URLs
   - Toggle cache enabled/disabled per URL
   - Clear specific URL cache or all cache
   - View cached data contents

## Security & Access

- Admin routes are currently **not protected** - consider adding authentication
- All cache operations are logged to console for debugging
- KV operations include error handling and fallbacks

## Testing

Test routes available:
- `/admin/cache/test` - Basic connectivity test
- Test individual API endpoints:
  - `/api/health`
  - `/api/admin/cache/stats` 
  - `/api/admin/cache/list`

## Default Behavior

**Important:** Caching is **disabled by default** for all URLs. This means:
- New URLs will not be cached until explicitly enabled
- Existing functionality remains unchanged
- No performance impact until caching is enabled
- Backward compatible with existing deployments