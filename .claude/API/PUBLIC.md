# Public API

Endpoints for accessing public widgets without authentication.

## Overview

Public endpoints allow anonymous access to widgets marked as public. This enables embedding chat widgets on any website without requiring authentication tokens.

## Endpoints

### Get Public Widget

```http
GET /api/public/widget/:id
```

Retrieve public widget information and configuration.

#### Parameters
- `id` (required): The widget UUID

#### Response
```json
{
  "id": "widget-uuid",
  "name": "Customer Support",
  "description": "AI assistant for customer inquiries",
  "logoUrl": "https://example.com/logo.png",
  "instructions": "You are a helpful customer support assistant...",
  "isPublic": true,
  "cacheEnabled": true,
  "recommendations": [
    {
      "title": "How can I track my order?",
      "description": "Get real-time updates on your shipment"
    },
    {
      "title": "What is your return policy?",
      "description": "Learn about our 30-day return guarantee"
    }
  ],
  "importantLinks": [
    {
      "url": "https://example.com/contact",
      "text": "Contact Us",
      "importance": "critical",
      "category": "contact"
    },
    {
      "url": "https://example.com/help",
      "text": "Help Center",
      "importance": "high",
      "category": "support"
    }
  ],
  "files": [
    {
      "id": "file-uuid",
      "fileName": "product-guide.pdf",
      "fileSize": 1048576,
      "mimeType": "application/pdf"
    }
  ],
  "embeddings": [
    {
      "id": "embedding-uuid",
      "contentChunk": "Our product offers...",
      "metadata": {
        "source": "product-guide.pdf",
        "page": 1
      }
    }
  ]
}
```

#### Error Responses

**404 Not Found**
```json
{
  "error": "Widget not found or not public"
}
```

**500 Server Error**
```json
{
  "error": "Failed to get widget"
}
```

## Security Considerations

### Public Access Control
- Only widgets with `isPublic: true` are accessible
- No authentication required for public endpoints
- Rate limiting applies (10 requests/minute per IP)

### Data Privacy
- Sensitive widget data is filtered out:
  - User information
  - Private settings
  - Internal metadata
- Only necessary data for chat functionality is exposed

### CORS Policy
Public endpoints have permissive CORS settings to allow embedding:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

## Rate Limiting

Public endpoints are rate-limited to prevent abuse:
- **Limit**: 10 requests per minute
- **Window**: 60 seconds
- **Identifier**: IP address

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1704456789
```

## Example Usage

### JavaScript (Widget Embed)
```javascript
// Fetch public widget data
async function loadWidget(widgetId) {
  try {
    const response = await fetch(
      `https://api.example.com/api/public/widget/${widgetId}`
    );
    
    if (!response.ok) {
      throw new Error('Widget not found');
    }
    
    const widget = await response.json();
    
    // Use widget data to configure chat
    initializeChat({
      name: widget.name,
      instructions: widget.instructions,
      recommendations: widget.recommendations,
      links: widget.importantLinks
    });
    
  } catch (error) {
    console.error('Failed to load widget:', error);
  }
}
```

### HTML Script Tag
```html
<!-- Widget automatically fetches public data -->
<script 
  src="https://example.com/dist/widget.js"
  data-widget-id="your-widget-uuid"
  async>
</script>
```

### cURL
```bash
# Get public widget data
curl https://api.example.com/api/public/widget/your-widget-uuid

# With pretty printing
curl https://api.example.com/api/public/widget/your-widget-uuid | jq .
```

## Public Widget Features

### Available Data
- Widget name and description
- Logo URL for branding
- AI instructions and context
- Pre-generated recommendations
- Important links extracted from content
- File listings (metadata only)
- Embedding summaries

### Limitations
- No file content access (only metadata)
- No user-specific data
- No modification capabilities
- Read-only access

## Best Practices

1. **Cache Responses**: Public widget data changes infrequently
   ```javascript
   const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
   const widgetCache = new Map();
   
   async function getCachedWidget(id) {
     const cached = widgetCache.get(id);
     if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
       return cached.data;
     }
     
     const data = await fetchWidget(id);
     widgetCache.set(id, { data, timestamp: Date.now() });
     return data;
   }
   ```

2. **Handle Errors Gracefully**: Show meaningful messages to users
   ```javascript
   try {
     const widget = await loadWidget(widgetId);
   } catch (error) {
     showErrorMessage('This chat assistant is currently unavailable');
   }
   ```

3. **Respect Rate Limits**: Implement exponential backoff
   ```javascript
   async function fetchWithRetry(url, retries = 3) {
     for (let i = 0; i < retries; i++) {
       const response = await fetch(url);
       
       if (response.status === 429) {
         // Rate limited - wait and retry
         const retryAfter = response.headers.get('X-RateLimit-Reset');
         const delay = retryAfter 
           ? (parseInt(retryAfter) * 1000 - Date.now()) 
           : Math.pow(2, i) * 1000;
         
         await new Promise(resolve => setTimeout(resolve, delay));
         continue;
       }
       
       return response;
     }
     throw new Error('Max retries exceeded');
   }
   ```

## Related Documentation

- [Widget Embedding Guide](../EMBEDDING/EMBED-CODE-USAGE.md)
- [Chat API](./CHAT.md)
- [Widget Management](./WIDGETS.md)