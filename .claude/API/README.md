# API Reference

Websyte AI provides a comprehensive REST API for programmatic control of widgets, content, and chat interactions.

## 🔑 Base URL

```
https://your-domain.com/api
```

## 📋 API Overview

### Authentication
All API requests require authentication. See [Authentication Guide](./AUTHENTICATION.md) for details.

### Available APIs

1. **[Widgets API](./WIDGETS.md)** - Create, update, and manage widgets
2. **[Automation API](./AUTOMATION.md)** - Bearer token authentication for programmatic access
3. **[Chat API](./CHAT.md)** - Chat endpoints and message streaming
4. **[Services API](./SERVICES.md)** - Advanced AI services (recommendations, summaries)

### Rate Limiting

- **Anonymous users**: 10 requests/minute
- **Authenticated users**: 30 requests/minute
- **Enterprise**: Custom limits available

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 28
X-RateLimit-Reset: 1704067200
```

### Response Format

All API responses follow this format:

**Success Response**
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

**Error Response**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      // Additional error details
    }
  }
}
```

### Common Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## 🚀 Quick Start

### 1. Get Your API Token

```bash
# Login to your dashboard
# Navigate to Settings > API Tokens
# Generate a new token
```

### 2. Make Your First Request

```bash
curl -X GET \
  https://your-domain.com/api/automation/widgets \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

### 3. Create a Widget

```bash
curl -X POST \
  https://your-domain.com/api/automation/widgets \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Support Bot",
    "greeting": "How can I help you today?",
    "primaryColor": "#0066cc"
  }'
```

## 📚 API Sections

### Widget Management
- Create, read, update, delete widgets
- Manage widget settings and appearance
- Control access and permissions

### Content Management
- Upload documents
- Crawl websites
- Manage knowledge base
- Refresh embeddings

### Chat Operations
- Send messages
- Stream responses
- Export chat history
- Manage sessions

### Advanced Services
- Generate recommendations
- Create summaries
- Extract important links
- Analyze content

## 🔧 SDKs and Libraries

### JavaScript/TypeScript
```typescript
import { WebsyteClient } from '@websyte/sdk';

const client = new WebsyteClient({
  apiKey: 'YOUR_API_TOKEN',
  baseUrl: 'https://your-domain.com'
});

// List widgets
const widgets = await client.widgets.list();

// Create a widget
const widget = await client.widgets.create({
  name: 'Support Bot',
  greeting: 'How can I help?'
});
```

### Python
```python
from websyte import WebsyteClient

client = WebsyteClient(
    api_key='YOUR_API_TOKEN',
    base_url='https://your-domain.com'
)

# List widgets
widgets = client.widgets.list()

# Create a widget
widget = client.widgets.create(
    name='Support Bot',
    greeting='How can I help?'
)
```

*Note: Official SDKs are coming soon. For now, use standard HTTP libraries.*

## 🛡️ Security Best Practices

1. **Never expose API tokens in client-side code**
2. **Use environment variables for tokens**
3. **Rotate tokens regularly**
4. **Use least-privilege principle**
5. **Monitor API usage for anomalies**

## 📖 Next Steps

- [Set up authentication](./AUTHENTICATION.md)
- [Explore the Widgets API](./WIDGETS.md)
- [Learn about automation](./AUTOMATION.md)
- [Integrate chat functionality](./CHAT.md)

## 🆘 Need Help?

- Email: support@websyte.ai
- Twitter: [@websyte_ai](https://twitter.com/websyte_ai)
- GitHub: [Open an issue](https://github.com/websyte/websyte-ai-chat-widget/issues)