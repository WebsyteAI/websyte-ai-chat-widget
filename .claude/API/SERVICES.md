# Services API

The Services API provides advanced AI-powered features including content recommendations, summaries, link extraction, and content analysis.

## =Ë Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/services/recommendations` | Generate AI recommendations |
| POST | `/api/services/summaries` | Create content summaries |
| POST | `/api/services/analyze-selector` | Analyze CSS selectors |
| GET | `/api/widgets/:id/recommendations` | Get widget recommendations |
| POST | `/api/widgets/:id/links/regenerate` | Extract important links |
| POST | `/api/widgets/:id/embeddings/refresh` | Refresh vector embeddings |

## <¯ Recommendations Service

Generate AI-powered question recommendations based on your content.

### Generate Recommendations

```bash
POST /api/services/recommendations
Content-Type: application/json

{
  "content": "Your documentation or website content here...",
  "count": 5,
  "context": {
    "industry": "SaaS",
    "audience": "developers"
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Content to analyze |
| count | number | No | Number of recommendations (default: 5) |
| context | object | No | Additional context |

### Response

```json
{
  "success": true,
  "data": {
    "recommendations": [
      "How do I integrate the API?",
      "What are the system requirements?",
      "Can I customize the widget appearance?",
      "What's included in the free plan?",
      "How do I migrate from another platform?"
    ],
    "metadata": {
      "contentLength": 15420,
      "processingTime": "2.3s",
      "model": "gpt-4o-mini"
    }
  }
}
```

### Get Widget Recommendations

Retrieve pre-generated recommendations for a widget.

```bash
GET /api/widgets/:id/recommendations
```

### Response

```json
{
  "success": true,
  "data": {
    "recommendations": [
      "How do I get started?",
      "What are your pricing plans?",
      "Do you offer a free trial?",
      "How secure is my data?",
      "Can I export my chat logs?"
    ],
    "generatedAt": "2025-01-11T10:00:00Z",
    "basedOn": {
      "documents": 25,
      "crawledPages": 150
    }
  }
}
```

## =Ý Summary Service

Generate concise summaries of your content.

### Create Summary

```bash
POST /api/services/summaries
Content-Type: application/json

{
  "content": "Long form content to summarize...",
  "type": "medium",
  "maxLength": 500,
  "focus": "key features"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Content to summarize |
| type | string | No | short, medium, or long |
| maxLength | number | No | Maximum characters |
| focus | string | No | Summary focus area |

### Response

```json
{
  "success": true,
  "data": {
    "summary": {
      "short": "Websyte AI transforms documentation into an intelligent chat assistant.",
      "medium": "Websyte AI is a powerful platform that converts your documentation, help articles, and website content into an AI-powered chat assistant. It uses advanced RAG technology to provide accurate, contextual answers to customer questions, reducing support tickets by up to 65%.",
      "long": "Websyte AI revolutionizes customer support by transforming static documentation into dynamic, intelligent conversations. Using state-of-the-art Retrieval-Augmented Generation (RAG) technology, it creates a knowledgeable AI assistant that understands your content deeply. The platform supports multiple content formats, offers real-time website crawling, and provides enterprise-grade security. Companies using Websyte AI report significant reductions in support tickets, improved customer satisfaction, and faster resolution times."
    },
    "stats": {
      "originalLength": 15420,
      "compressionRatio": 0.03
    }
  }
}
```

## = Link Extraction Service

Extract and categorize important links from your content.

### Extract Links

```bash
POST /api/widgets/:id/links/regenerate
Content-Type: application/json

{
  "analyzeContent": true,
  "categories": ["documentation", "support", "pricing", "features"],
  "maxLinks": 20
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| analyzeContent | boolean | No | Deep content analysis |
| categories | array | No | Link categories to extract |
| maxLinks | number | No | Maximum links to return |

### Response

```json
{
  "success": true,
  "data": {
    "links": [
      {
        "title": "Getting Started Guide",
        "url": "https://example.com/docs/getting-started",
        "category": "documentation",
        "description": "Step-by-step guide for new users",
        "importance": "high",
        "relevanceScore": 0.95
      },
      {
        "title": "API Reference",
        "url": "https://example.com/api",
        "category": "documentation",
        "description": "Complete API documentation",
        "importance": "high",
        "relevanceScore": 0.92
      },
      {
        "title": "Pricing Plans",
        "url": "https://example.com/pricing",
        "category": "pricing",
        "description": "Compare our pricing options",
        "importance": "high",
        "relevanceScore": 0.90
      }
    ],
    "stats": {
      "totalLinksFound": 87,
      "categorized": 20,
      "processingTime": "4.2s"
    }
  }
}
```

## >ê CSS Selector Analysis

Analyze CSS selectors for web scraping and content extraction.

### Analyze Selector

```bash
POST /api/services/analyze-selector
Content-Type: application/json

{
  "url": "https://example.com/docs",
  "selector": ".content-wrapper article",
  "testExtraction": true
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | URL to analyze |
| selector | string | Yes | CSS selector to test |
| testExtraction | boolean | No | Test content extraction |

### Response

```json
{
  "success": true,
  "data": {
    "selector": ".content-wrapper article",
    "matches": 24,
    "sample": {
      "html": "<article>Sample content...</article>",
      "text": "Sample content extracted from the page",
      "attributes": {
        "class": "content-wrapper",
        "id": "main-content"
      }
    },
    "recommendations": [
      {
        "selector": "article.documentation",
        "specificity": "higher",
        "matches": 18
      },
      {
        "selector": ".content-wrapper > article",
        "specificity": "more precise",
        "matches": 24
      }
    ]
  }
}
```

## = Embeddings Service

Manage vector embeddings for semantic search.

### Refresh Embeddings

```bash
POST /api/widgets/:id/embeddings/refresh
Content-Type: application/json

{
  "regenerate": true,
  "chunkSize": 500,
  "model": "text-embedding-3-small"
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| regenerate | boolean | No | Regenerate all embeddings |
| chunkSize | number | No | Text chunk size (default: 500) |
| model | string | No | Embedding model to use |

### Response

```json
{
  "success": true,
  "data": {
    "status": "completed",
    "embeddings": {
      "total": 412,
      "created": 412,
      "updated": 0,
      "failed": 0
    },
    "performance": {
      "duration": "45.3s",
      "tokensProcessed": 125000,
      "averageChunkSize": 303
    }
  }
}
```

## > Advanced AI Analysis

### Content Quality Analysis

```bash
POST /api/services/analyze-content
Content-Type: application/json

{
  "widgetId": "widget_123",
  "checks": ["completeness", "clarity", "gaps", "duplicates"]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "quality": {
      "score": 8.5,
      "completeness": 0.9,
      "clarity": 0.85,
      "uniqueness": 0.95
    },
    "issues": [
      {
        "type": "gap",
        "severity": "medium",
        "description": "Missing information about API rate limits",
        "suggestion": "Add documentation about rate limiting and quotas"
      },
      {
        "type": "duplicate",
        "severity": "low",
        "description": "Similar content in 'Getting Started' and 'Quick Start'",
        "suggestion": "Consider consolidating these sections"
      }
    ],
    "recommendations": [
      "Add more code examples for common use cases",
      "Include troubleshooting section",
      "Expand API error documentation"
    ]
  }
}
```

## =Ê Batch Processing

Process multiple operations in a single request.

### Batch Services Request

```bash
POST /api/services/batch
Content-Type: application/json

{
  "operations": [
    {
      "service": "recommendations",
      "params": {
        "widgetId": "widget_123",
        "count": 5
      }
    },
    {
      "service": "summaries",
      "params": {
        "widgetId": "widget_123",
        "type": "short"
      }
    },
    {
      "service": "links",
      "params": {
        "widgetId": "widget_123",
        "maxLinks": 10
      }
    }
  ]
}
```

### Response

```json
{
  "success": true,
  "data": {
    "results": [
      {
        "service": "recommendations",
        "status": "success",
        "data": {
          "recommendations": ["How do I...", "What is..."]
        }
      },
      {
        "service": "summaries",
        "status": "success",
        "data": {
          "summary": "Your product description..."
        }
      },
      {
        "service": "links",
        "status": "success",
        "data": {
          "links": [...]
        }
      }
    ],
    "stats": {
      "totalTime": "6.8s",
      "successCount": 3,
      "failureCount": 0
    }
  }
}
```

## =¨ Error Handling

### Insufficient Content

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_CONTENT",
    "message": "Not enough content to generate recommendations",
    "minimumRequired": 100,
    "provided": 45
  }
}
```

### Model Error

```json
{
  "success": false,
  "error": {
    "code": "AI_MODEL_ERROR",
    "message": "Failed to process with AI model",
    "details": "Rate limit exceeded for model",
    "retryAfter": 60
  }
}
```

## =¡ Best Practices

### 1. Caching Results
```javascript
// Cache recommendations for performance
const cacheKey = `recommendations_${widgetId}`;
let recommendations = cache.get(cacheKey);

if (!recommendations) {
  recommendations = await generateRecommendations(widgetId);
  cache.set(cacheKey, recommendations, 3600); // 1 hour
}
```

### 2. Batch Processing
```javascript
// Process multiple widgets efficiently
const widgets = ['widget_1', 'widget_2', 'widget_3'];
const operations = widgets.map(id => ({
  service: 'recommendations',
  params: { widgetId: id }
}));

const results = await processBatch(operations);
```

### 3. Progressive Enhancement
```javascript
// Start with basic features, enhance with AI
async function enhanceWidget(widgetId) {
  // Basic setup
  const widget = await createWidget(widgetId);
  
  // Progressive enhancement
  Promise.all([
    generateRecommendations(widgetId),
    createSummaries(widgetId),
    extractLinks(widgetId)
  ]).then(([recs, summaries, links]) => {
    updateWidget(widgetId, { recs, summaries, links });
  });
}
```

## =Ú Code Examples

### Complete Service Integration

```typescript
class AIServices {
  constructor(private apiKey: string) {}

  async generateRecommendations(content: string, count = 5) {
    const response = await fetch('/api/services/recommendations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, count })
    });
    
    return response.json();
  }

  async createSummary(content: string, type: 'short' | 'medium' | 'long') {
    const response = await fetch('/api/services/summaries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, type })
    });
    
    return response.json();
  }

  async analyzeContent(widgetId: string) {
    const response = await fetch('/api/services/analyze-content', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        widgetId,
        checks: ['completeness', 'clarity', 'gaps']
      })
    });
    
    return response.json();
  }
}

// Usage
const ai = new AIServices('YOUR_API_TOKEN');
const recommendations = await ai.generateRecommendations(content, 10);
const summary = await ai.createSummary(content, 'medium');
```

## =Ö Next Steps

- [Manage widgets](./WIDGETS.md)
- [Set up automation](./AUTOMATION.md)
- [Integrate chat](./CHAT.md)