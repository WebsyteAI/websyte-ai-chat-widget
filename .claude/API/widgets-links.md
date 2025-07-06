# Important Links API

Extract and retrieve the most important links from crawled website content.

## Overview

When a website is crawled, the system automatically extracts and ranks important links such as:
- Contact/Support pages (critical importance)
- About/Company information (high importance)  
- Pricing/Plans (high importance)
- Documentation (high importance)
- Login/Signup (medium importance)
- Blog/News (medium importance)
- Legal pages (medium importance)

## Endpoints

### Regenerate Important Links

```http
POST /api/widgets/:id/links/regenerate
```

Re-extract and analyze important links from the widget's crawled content. This is useful after crawling new pages or to refresh the link analysis.

#### Headers
```
Authorization: Bearer YOUR_API_KEY
```

#### Response
```json
{
  "success": true,
  "links": [
    {
      "url": "https://example.com/contact",
      "text": "Contact Us",
      "importance": "critical",
      "category": "contact"
    },
    // ... more links
  ]
}
```

### Get Widget Important Links

```http
GET /api/widgets/:id/links
```

Retrieve important links extracted from a widget's crawled content.

#### Headers
```
Authorization: Bearer YOUR_API_KEY
```

#### Response
```json
{
  "widgetId": "wgt_abc123",
  "links": [
    {
      "url": "https://example.com/contact",
      "text": "Contact Us",
      "importance": "critical",
      "category": "contact"
    },
    {
      "url": "https://example.com/about",
      "text": "About Us",
      "importance": "high",
      "category": "company"
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

### Automation API

```http
GET /api/automation/widgets/:id/links
```

Same as above but uses bearer token authentication instead of user session.

## Link Properties

- **url**: The full URL of the link
- **text**: The link text or a descriptive title
- **importance**: Priority level - `critical`, `high`, or `medium`
- **category**: Type of link - `contact`, `company`, `pricing`, `documentation`, `auth`, `content`, `legal`, `support`, `product`, `technical`, or `other`

## How It Works

1. During website crawling, all links are extracted from the crawled pages
2. Links are analyzed using AI (if available) or heuristic patterns
3. Top 15 most important links are selected and categorized
4. Links are stored in the widget's `links` database column (JSON array)

## Public Widget Links

Important links are also included in the public widget endpoint:

```http
GET /api/widgets/:id/public
```

Response includes:
```json
{
  "id": "wgt_abc123",
  "name": "My Widget",
  "importantLinks": [...],
  // ... other widget data
}
```

## Notes

- Links are extracted automatically during the crawling process
- The system prioritizes links that help users contact, understand, or engage with the company
- External links are slightly deprioritized compared to same-domain links
- Duplicate URLs are automatically removed