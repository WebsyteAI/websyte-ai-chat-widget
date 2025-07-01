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

#### GET /api/widgets/:id/crawl/status-check
Check detailed crawl status (includes run details)

#### POST /api/widgets/:id/crawl/reset
Reset stuck crawl

#### POST /api/widgets/:id/recommendations
Generate recommendations

### Document Management

#### POST /api/widgets/:id/documents
Upload documents to widget (supports text files and PDFs)

**Request:**
Form data with file upload

**Response:**
```json
{
  "file": {
    "id": "file-uuid",
    "name": "document.pdf",
    "size": 12345,
    "mimeType": "application/pdf"
  }
}
```

#### GET /api/widgets/:id/documents
List widget documents

**Response:**
```json
{
  "files": [
    {
      "id": "file-uuid",
      "name": "document.pdf",
      "size": 12345,
      "mimeType": "application/pdf"
    }
  ]
}
```

#### DELETE /api/widgets/:id/documents/:documentId
Delete document from widget

#### POST /api/widgets/:id/search
Search widget content

**Request:**
```json
{
  "query": "search query"
}
```

#### POST /api/widgets/:id/embeddings/refresh
Refresh widget embeddings

#### GET /api/widgets/:id/public
Get public widget information (requires auth to check ownership)

### Service Endpoints

#### POST /api/chat
AI chat with streaming support

**Request:**
```json
{
  "message": "User message",
  "widgetId": "widget-uuid",
  "sessionId": "session-id",
  "context": {
    "url": "https://example.com",
    "content": "page content"
  }
}
```

#### POST /api/recommendations
Generate content recommendations

**Request:**
```json
{
  "title": "Content title",
  "content": "Content to analyze"
}
```

#### POST /api/summaries
Generate content summaries

**Request:**
```json
{
  "content": "Content to summarize",
  "url": "https://example.com"
}
```

#### POST /api/analyze-selector
Analyze CSS selector for content extraction

**Request:**
```json
{
  "url": "https://example.com",
  "selector": "article"
}
```

## Automation API Endpoints (Bearer Token Auth)

These endpoints are designed for programmatic access and automation tools like Claude Code.

### GET /api/automation/widgets
List all widgets in the system with pagination support

**Headers:**
```
Authorization: Bearer <your-token>
```

**Query Parameters:**
- `limit` (optional): Number of widgets to return (default: 100, max: 1000)
- `offset` (optional): Number of widgets to skip (default: 0)

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
      "lastCrawlAt": "2024-06-28T12:00:00Z",
      "fileCount": 10,
      "pagesExtracted": 25
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
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

## Admin API Endpoints (Admin Role Required)

These endpoints require session authentication with admin role privileges.

### GET /api/admin/widgets
List widgets (admin view)

**Headers:**
```
Cookie: <session-cookie>
```

**Query Parameters:**
- `limit` (optional): Number of widgets to return (default: 20)
- `offset` (optional): Number of widgets to skip (default: 0)

**Response:**
```json
{
  "widgets": [
    {
      "id": "uuid",
      "name": "Widget Name",
      "description": "Description",
      "userId": "user-uuid",
      "userEmail": "user@example.com",
      "isPublic": true,
      "crawlStatus": "completed",
      "createdAt": "2024-06-28T12:00:00Z"
    }
  ],
  "total": 500
}
```

**Note:** Currently returns only the authenticated user's widgets. Full admin functionality to view all widgets across all users is planned for future implementation.

## Rate Limiting

- Anonymous users: 10 requests per minute
- Authenticated users: 30 requests per minute
- Bearer token requests: No rate limiting (use responsibly)
- Admin requests: No rate limiting

## System Endpoints

### GET /api/health
Health check endpoint

**Response:**
```json
{
  "status": "ok"
}
```

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