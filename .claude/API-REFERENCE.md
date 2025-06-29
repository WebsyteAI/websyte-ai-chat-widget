# API Reference

## Authentication

The API supports two authentication methods:

### 1. Session-based Authentication (Better Auth)
Used for user-facing endpoints. Requires login through the web interface.

### 2. Bearer Token Authentication
Used for automation and programmatic access. Requires `API_BEARER_TOKEN` environment variable.

**Headers:**
```
Authorization: Bearer <your-token>
```

## Public Endpoints

### GET /api/public/widget/:id
Get public widget information (no auth required)

**Response:**
```json
{
  "id": "uuid",
  "name": "Widget Name",
  "description": "Widget description",
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Recommendation description"
    }
  ]
}
```

### POST /api/public/chat
Public chat endpoint for widget interactions

**Request:**
```json
{
  "message": "User message",
  "widgetId": "widget-uuid",
  "sessionId": "session-id",
  "isEmbedded": true
}
```

**Response:**
```json
{
  "message": "AI response",
  "sources": [
    {
      "id": "source-id",
      "content": "Source content",
      "metadata": {}
    }
  ],
  "sessionId": "session-id"
}
```

## Authenticated Endpoints (Session Auth)

### Widget Management

#### GET /api/widgets
List user's widgets

#### POST /api/widgets
Create a new widget

**Request:**
```json
{
  "name": "Widget Name",
  "description": "Description",
  "url": "https://example.com",
  "crawlUrl": "https://example.com",
  "isPublic": false
}
```

#### GET /api/widgets/:id
Get widget details

#### PUT /api/widgets/:id
Update widget

#### DELETE /api/widgets/:id
Delete widget

### Widget Operations

#### POST /api/widgets/:id/crawl
Start website crawling

**Request:**
```json
{
  "crawlUrl": "https://example.com"
}
```

#### GET /api/widgets/:id/crawl/status
Check crawl status

#### POST /api/widgets/:id/crawl/reset
Reset stuck crawl

#### POST /api/widgets/:id/recommendations
Generate recommendations

### File Management

#### POST /api/widgets/:id/files
Upload files to widget

#### DELETE /api/widgets/:id/files/:fileId
Delete file from widget

## Automation API Endpoints (Bearer Token Auth)

These endpoints are designed for programmatic access and automation tools like Claude Code.

### GET /api/automation/widgets
List all widgets in the system

**Headers:**
```
Authorization: Bearer <your-token>
```

**Response:**
```json
{
  "widgets": [
    {
      "id": "uuid",
      "name": "Widget Name",
      "description": "Description",
      "url": "https://example.com",
      "crawlUrl": "https://example.com",
      "isPublic": true,
      "crawlStatus": "completed",
      "lastCrawlAt": "2024-06-28T12:00:00Z"
    }
  ]
}
```

### POST /api/automation/widgets
Create a new widget programmatically

**Request:**
```json
{
  "name": "Widget Name",
  "description": "Description",
  "url": "https://example.com",
  "crawlUrl": "https://example.com",
  "isPublic": false
}
```

**Response:**
```json
{
  "widget": {
    "id": "uuid",
    "name": "Widget Name",
    "description": "Description",
    "url": "https://example.com",
    "crawlUrl": "https://example.com",
    "isPublic": false,
    "createdAt": "2024-06-28T12:00:00Z"
  }
}
```

### POST /api/automation/widgets/:id/crawl
Start crawling for a widget

**Response:**
```json
{
  "success": true,
  "crawlRunId": "apify-run-id",
  "message": "Crawl started successfully"
}
```

### POST /api/automation/widgets/:id/recommendations
Generate recommendations for a widget

**Response:**
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Recommendation description"
    }
  ]
}
```

## Rate Limiting

- Anonymous users: 10 requests per minute
- Authenticated users: 30 requests per minute
- Bearer token requests: No rate limiting (use responsibly)

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message"
}
```

Common HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error