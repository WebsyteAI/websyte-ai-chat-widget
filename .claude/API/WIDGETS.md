# Widget Management API

Endpoints for creating, managing, and configuring AI chat widgets.

## Endpoints

### List Widgets

```http
GET /api/widgets
```

List all widgets for the authenticated user.

**Authentication**: Session required

**Query Parameters**:
- `limit` (number, optional): Results per page (default: 20, max: 100)
- `offset` (number, optional): Skip N results (default: 0)

**Response**:
```json
{
  "widgets": [
    {
      "id": "uuid",
      "name": "Support Bot",
      "description": "Customer support assistant",
      "url": "https://example.com",
      "crawlUrl": "https://example.com/docs",
      "isPublic": true,
      "crawlStatus": "completed",
      "lastCrawlAt": "2024-01-01T00:00:00Z",
      "greeting": "How can I help you?",
      "systemPrompt": "You are a helpful assistant...",
      "logoUrl": "https://example.com/logo.png",
      "primaryColor": "#0066cc",
      "recommendations": [...],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42
}
```

### Get Widget

```http
GET /api/widgets/:id
```

Get detailed information about a specific widget.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "id": "uuid",
  "name": "Support Bot",
  "description": "Customer support assistant",
  "url": "https://example.com",
  "crawlUrl": "https://example.com/docs",
  "isPublic": true,
  "crawlStatus": "completed",
  "lastCrawlAt": "2024-01-01T00:00:00Z",
  "greeting": "How can I help you?",
  "systemPrompt": "You are a helpful assistant...",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#0066cc",
  "recommendations": [
    {
      "title": "How do I reset my password?",
      "description": "Learn how to reset your account password"
    }
  ],
  "stats": {
    "documentCount": 25,
    "pageCount": 150,
    "embeddingCount": 1500,
    "messageCount": 250
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### Create Widget

```http
POST /api/widgets
```

Create a new widget.

**Authentication**: Session required

**Request Body**:
```json
{
  "name": "Support Bot",
  "description": "Customer support assistant",
  "url": "https://example.com",
  "crawlUrl": "https://example.com/docs",
  "isPublic": false,
  "greeting": "How can I help you today?",
  "systemPrompt": "You are a helpful customer support assistant...",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#0066cc"
}
```

**Response**:
```json
{
  "id": "uuid",
  "name": "Support Bot",
  // ... full widget object
}
```

### Update Widget

```http
PUT /api/widgets/:id
```

Update widget configuration.

**Authentication**: Session required (must be owner)

**Request Body**: Same as create, all fields optional

**Response**: Updated widget object

### Delete Widget

```http
DELETE /api/widgets/:id
```

Delete a widget and all associated data.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "success": true,
  "message": "Widget deleted successfully"
}
```

## Widget Operations

### Start Website Crawl

```http
POST /api/widgets/:id/crawl
```

Start crawling a website to build the widget's knowledge base.

**Authentication**: Session required (must be owner)

**Request Body**:
```json
{
  "crawlUrl": "https://example.com/docs",
  "maxPages": 100,
  "includePatterns": ["*/docs/*"],
  "excludePatterns": ["*/api/*"]
}
```

**Response**:
```json
{
  "success": true,
  "crawlRunId": "apify-run-id",
  "message": "Crawl started successfully"
}
```

### Check Crawl Status

```http
GET /api/widgets/:id/crawl/status
```

Get the current crawl status.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "status": "running",
  "crawlRunId": "apify-run-id",
  "startedAt": "2024-01-01T00:00:00Z",
  "pagesProcessed": 45,
  "totalPages": 100,
  "errors": []
}
```

### Get Detailed Crawl Status

```http
GET /api/widgets/:id/crawl/status-check
```

Get detailed crawl information including Apify run details.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "status": "completed",
  "crawlRunId": "apify-run-id",
  "runDetails": {
    "status": "SUCCEEDED",
    "startedAt": "2024-01-01T00:00:00Z",
    "finishedAt": "2024-01-01T01:00:00Z",
    "stats": {
      "pagesProcessed": 100,
      "pagesFailed": 2,
      "requestsFinished": 102
    }
  }
}
```

### Reset Stuck Crawl

```http
POST /api/widgets/:id/crawl/reset
```

Reset a stuck crawl to allow starting a new one.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "success": true,
  "message": "Crawl reset successfully"
}
```

### Generate Recommendations

```http
POST /api/widgets/:id/recommendations
```

Generate AI-powered prompt recommendations based on widget content.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "success": true,
  "recommendations": [
    {
      "title": "How do I get started?",
      "description": "Learn the basics of using our platform"
    },
    {
      "title": "What are the pricing plans?",
      "description": "Explore our different pricing options"
    }
    // ... up to 10 recommendations
  ]
}
```

### Get Public Widget Info

```http
GET /api/widgets/:id/public
```

Get public information about a widget (for embed verification).

**Authentication**: Session required

**Response**:
```json
{
  "isPublic": true,
  "embedCode": "<script src=\"...\"></script>"
}
```

### Refresh Embeddings

```http
POST /api/widgets/:id/embeddings/refresh
```

Regenerate all embeddings for widget content.

**Authentication**: Session required (must be owner)

**Response**:
```json
{
  "success": true,
  "message": "Embeddings refresh started",
  "totalDocuments": 150
}
```

## Widget Configuration

### Widget Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Display name (max 100 chars) |
| description | string | No | Widget description (max 500 chars) |
| url | string | No | Associated website URL |
| crawlUrl | string | No | URL to crawl for content |
| isPublic | boolean | No | Allow public access (default: false) |
| greeting | string | No | Initial greeting message |
| systemPrompt | string | No | AI system prompt (max 1000 chars) |
| logoUrl | string | No | Logo image URL |
| primaryColor | string | No | Brand color (hex format) |

### Widget States

| Status | Description |
|--------|-------------|
| idle | No crawl has been started |
| running | Crawl is in progress |
| completed | Crawl finished successfully |
| failed | Crawl encountered errors |

## Examples

### Create a Support Widget

```bash
curl -X POST http://localhost:5173/api/widgets \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d '{
    "name": "Customer Support",
    "description": "AI assistant for customer inquiries",
    "url": "https://mycompany.com",
    "crawlUrl": "https://mycompany.com/help",
    "greeting": "Hello! How can I assist you today?",
    "systemPrompt": "You are a friendly customer support agent...",
    "primaryColor": "#0066cc"
  }'
```

### Start Full Website Crawl

```bash
curl -X POST http://localhost:5173/api/widgets/{widgetId}/crawl \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d '{
    "crawlUrl": "https://docs.example.com",
    "maxPages": 200
  }'
```

### Make Widget Public

```bash
curl -X PUT http://localhost:5173/api/widgets/{widgetId} \
  -H "Content-Type: application/json" \
  -H "Cookie: $SESSION_COOKIE" \
  -d '{
    "isPublic": true
  }'
```