# Automation API

Bearer token authenticated endpoints for programmatic widget management and automation.

## Authentication

All automation endpoints require Bearer token authentication:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Configure your token in the environment variable `API_BEARER_TOKEN`.

### Example: Authentication with cURL
```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
  https://your-domain.com/api/automation/widgets
```

### Example: Authentication with JavaScript
```javascript
const response = await fetch('https://your-domain.com/api/automation/widgets', {
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  }
});
```

### Example: Authentication with Python
```python
import requests

headers = {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://your-domain.com/api/automation/widgets',
    headers=headers
)

## Endpoints

### List All Widgets

```http
GET /api/automation/widgets
```

Retrieve all widgets in the system (no user filtering).

#### Response
```json
{
  "widgets": [
    {
      "id": "widget-uuid",
      "name": "Customer Support Bot",
      "description": "Helps customers with common questions",
      "userId": "user-id",
      "isPublic": true,
      "cacheEnabled": false,
      "crawlStatus": "completed",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Create Widget

```http
POST /api/automation/widgets
```

Create a new widget programmatically.

#### Request Body
```json
{
  "name": "Product Documentation Bot",
  "description": "Answers questions about our product",
  "userId": "user-id",
  "url": "https://docs.example.com",
  "contentSelector": "article, main",
  "isPublic": true,
  "instructions": "You are a helpful documentation assistant...",
  "additionalContext": "Our product is a SaaS platform..."
}
```

#### Response
```json
{
  "success": true,
  "widget": {
    "id": "new-widget-uuid",
    "name": "Product Documentation Bot",
    "description": "Answers questions about our product",
    "userId": "user-id",
    "isPublic": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Complete Example: Create and Configure Widget
```javascript
// 1. Create widget
const createResponse = await fetch('https://your-domain.com/api/automation/widgets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Documentation Assistant',
    description: 'Helps users navigate our docs',
    userId: 'user-123',
    isPublic: true,
    instructions: 'You are a helpful documentation assistant. Be concise and accurate.'
  })
});

const { widget } = await createResponse.json();

// 2. Start crawling documentation site
const crawlResponse = await fetch(`https://your-domain.com/api/automation/widgets/${widget.id}/crawl`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startUrl: 'https://docs.example.com',
    maxPages: 100,
    selector: 'main, article'
  })
});

// 3. Generate recommendations after crawl completes
setTimeout(async () => {
  await fetch(`https://your-domain.com/api/automation/widgets/${widget.id}/recommendations`, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN',
      'Content-Type': 'application/json'
    }
  });
}, 300000); // Wait 5 minutes for crawl to complete
```

### Start Website Crawl

```http
POST /api/automation/widgets/:id/crawl
```

Initiate website crawling for a widget.

#### Request Body
```json
{
  "startUrl": "https://docs.example.com",
  "maxPages": 50,
  "selector": "main, article, .content"
}
```

#### Response
```json
{
  "success": true,
  "workflowId": "workflow-uuid",
  "message": "Crawl started successfully"
}
```

### Generate Recommendations

```http
POST /api/automation/widgets/:id/recommendations
```

Generate AI-powered recommendations for common questions.

#### Request Body
```json
{
  "regenerate": true  // Optional: force regeneration
}
```

#### Response
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "How do I get started?",
      "description": "Learn the basics of setting up your account"
    },
    {
      "title": "What are the pricing plans?",
      "description": "Compare our different subscription options"
    },
    {
      "title": "How do I integrate the API?",
      "description": "Step-by-step guide for API integration"
    }
  ]
}
```

### Get Important Links

```http
GET /api/automation/widgets/:id/links
```

Retrieve important links extracted from the widget's content.

#### Response
```json
{
  "widgetId": "widget-uuid",
  "links": [
    {
      "url": "https://example.com/contact",
      "text": "Contact Us",
      "importance": "critical",
      "category": "contact"
    },
    {
      "url": "https://example.com/pricing",
      "text": "Pricing",
      "importance": "high",
      "category": "pricing"
    }
  ],
  "extractedAt": "2024-01-15T10:30:00Z",
  "totalLinks": 15
}
```

## Rate Limits

Bearer token authenticated requests bypass normal rate limits but should still be used responsibly.

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Missing or invalid Authorization header"
}
```

### 404 Not Found
```json
{
  "error": "Widget not found"
}
```

### 500 Server Error
```json
{
  "error": "Failed to process request",
  "details": "Error message"
}
```

## Example Usage

### cURL
```bash
# List all widgets
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://your-domain.com/api/automation/widgets

# Create a widget
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Bot","userId":"user-123"}' \
  https://your-domain.com/api/automation/widgets

# Start crawling
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"startUrl":"https://example.com"}' \
  https://your-domain.com/api/automation/widgets/widget-id/crawl
```

### JavaScript
```javascript
const API_TOKEN = 'your-bearer-token';
const API_BASE = 'https://your-domain.com/api/automation';

// Create widget
const response = await fetch(`${API_BASE}/widgets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Support Bot',
    userId: 'user-123',
    url: 'https://help.example.com'
  })
});

const { widget } = await response.json();
console.log('Created widget:', widget.id);

// Start crawl
await fetch(`${API_BASE}/widgets/${widget.id}/crawl`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    startUrl: 'https://help.example.com'
  })
});
```

## Use Cases

1. **Automated Widget Provisioning**: Create widgets for new customers via your backend
2. **Bulk Content Updates**: Trigger crawls across multiple widgets
3. **Analytics Integration**: Fetch widget data for reporting
4. **CI/CD Integration**: Update widget content as part of deployment

## Best Practices

1. **Store tokens securely** - Never expose tokens in client-side code
2. **Use HTTPS** - Always use encrypted connections
3. **Handle errors gracefully** - Implement retry logic for transient failures
4. **Monitor usage** - Track API calls for debugging and optimization
5. **Cache responses** - Reduce API calls by caching widget data

## Related Documentation

- **[Public API](./PUBLIC.md)** - Public widget access endpoints
- **[Admin API](./ADMIN.md)** - Administrative endpoints
- **[Authentication](./README.md#authentication)** - Authentication overview
- **[Website Crawler](../FEATURES/WEBSITE-CRAWLER.md)** - Crawling implementation details
- **[Workflows](../WORKFLOWS/CONTENT-PIPELINE.md)** - Content processing workflows
- **[Widget Architecture](../ARCHITECTURE/WIDGET-EMBED.md)** - Widget system architecture