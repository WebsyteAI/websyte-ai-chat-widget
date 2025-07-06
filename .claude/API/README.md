# API Documentation

## Overview

The Websyte AI Chat Widget API provides comprehensive endpoints for widget management, chat functionality, and content processing. The API supports multiple authentication methods and is designed for both web applications and programmatic access.

## Base URL

- Development: `http://localhost:5173`
- Production: `https://your-domain.workers.dev`

## Authentication Methods

### 1. Session-based Authentication (Better Auth)

Used for web application access. Requires user login through the authentication flow.

- **Usage**: Web dashboard, user-facing features
- **Implementation**: Cookie-based sessions with CSRF protection
- **Rate Limits**: 30 requests per minute for authenticated users

### 2. Bearer Token Authentication

Used for programmatic access and automation tools.

- **Usage**: CI/CD, automation scripts, API integrations
- **Implementation**: Static bearer token in Authorization header
- **Rate Limits**: No rate limiting (use responsibly)

#### Setup

1. Generate a secure token:
   ```bash
   openssl rand -hex 32
   ```

2. Add to environment variables:
   ```env
   API_BEARER_TOKEN=your-generated-token
   ```

3. Use in requests:
   ```bash
   curl -H "Authorization: Bearer your-token" \
        https://your-domain.com/api/automation/widgets
   ```

### 3. Public Access

Select endpoints allow anonymous access for embedded widgets.

## API Documentation Files

### Core APIs
- **[Widgets API](./WIDGETS.md)** - Widget CRUD operations
- **[Widget Links API](./widgets-links.md)** - Important links extraction
- **[Widget Crawl API](./widget-crawl.md)** - Website crawling endpoints
- **[Chat API](./CHAT.md)** - Chat conversation endpoints
- **[Documents API](./DOCUMENTS.md)** - File upload and management

### Service APIs
- **[Search API](./SEARCH.md)** - Vector search functionality
- **[Services API](./SERVICES.md)** - General service endpoints

### Access Control APIs
- **[Automation API](./AUTOMATION.md)** - Bearer token authenticated endpoints
- **[Public API](./PUBLIC.md)** - Public widget access
- **[Admin API](./admin.md)** - System administration

## API Categories

### Core APIs

- **[Widget Management](./WIDGETS.md)** - Create, update, delete widgets
- **[Chat API](./CHAT.md)** - RAG-powered chat with streaming
- **[Document Management](./DOCUMENTS.md)** - File uploads, OCR, content management
- **[Public Access](./PUBLIC.md)** - Anonymous widget access
- **[Automation API](./AUTOMATION.md)** - Programmatic widget control

### Service APIs

- **Content Analysis** - Selector analysis, summarization
- **Search** - Vector search within widget content
- **Recommendations** - AI-generated content suggestions

## Response Format

### Success Response

```json
{
  "data": {
    // Response data
  },
  "success": true
}
```

### Error Response

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    // Additional error context
  }
}
```

## Rate Limiting

| Authentication Type | Rate Limit | Window |
|-------------------|------------|---------|
| Anonymous | 10 requests | 1 minute |
| Authenticated User | 30 requests | 1 minute |
| Bearer Token | Unlimited | - |
| Admin Role | Unlimited | - |

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp

## Common Headers

### Request Headers

```http
Content-Type: application/json
Authorization: Bearer <token>  # For automation API
Cookie: <session>             # For web app
```

### Response Headers

```http
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-*: <rate-limit-info>
```

## Error Codes

See [Error Codes Reference](./ERROR-CODES.md) for detailed error handling.

## Quick Start Examples

### Create a Widget

```bash
curl -X POST https://your-domain.com/api/automation/widgets \
  -H "Authorization: Bearer $API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support Bot",
    "greeting": "How can I help you today?",
    "systemPrompt": "You are a helpful support assistant."
  }'
```

### Chat with Widget

```bash
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What services do you offer?",
    "widgetId": "widget-uuid",
    "sessionId": "session-uuid"
  }'
```

### Upload Document

```bash
curl -X POST https://your-domain.com/api/widgets/{widgetId}/documents \
  -H "Authorization: Bearer $API_TOKEN" \
  -F "file=@document.pdf"
```

## SDK and Tools

- JavaScript SDK: Coming soon
- Python SDK: Coming soon
- CLI Tool: Coming soon

## Support

- GitHub Issues: [Report bugs and feature requests](https://github.com/your-repo/issues)
- Documentation: This API reference
- Email: support@your-domain.com