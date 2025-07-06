# Link Extraction Feature

## Overview

The link extraction feature automatically identifies and extracts important links from crawled website content using AI-powered semantic search and categorization.

## 🚀 Key Features

### Vector Search-Based Link Discovery
- **Semantic Queries**: Uses multiple search queries to find content containing links
- **Content Analysis**: Searches through embedded content chunks for link patterns
- **Intelligent Filtering**: Removes duplicate and low-quality links
- **Performance Optimized**: Searches existing vector embeddings without additional file processing

### AI-Powered Link Categorization
- **Automatic Classification**: Categorizes links by type (navigation, contact, resources, etc.)
- **Importance Ranking**: Uses AI to rank links by relevance and importance
- **Context-Aware**: Considers surrounding content for better categorization
- **Quality Scoring**: Filters out irrelevant or broken links

### One-Click Regeneration
- **Instant Updates**: Regenerate links without re-crawling the website
- **Smart Caching**: Leverages existing embeddings for fast processing
- **Progress Tracking**: Real-time updates during generation process
- **Error Handling**: Graceful degradation with detailed error messages

## 🔧 Technical Implementation

### Backend Service (`workers/services/widget.ts`)

```typescript
async extractImportantLinks(widgetId: string): Promise<void> {
  // Use semantic search queries to find content containing links
  const searchQueries = [
    'links navigation menu',
    'http https www url website',
    'contact us email phone address',
    'pricing plans cost subscription',
    'about company team mission',
    'documentation docs guide help',
    'privacy policy terms legal',
    'social media twitter facebook linkedin github',
    'resources downloads support'
  ];

  const allLinks: Array<{ url: string; text: string; pageUrl: string }> = [];
  const seenUrls = new Set<string>();

  for (const query of searchQueries) {
    const searchResults = await this.vectorSearch.searchSimilarContent(query, widgetId, 20);
    
    for (const result of searchResults) {
      const content = result.chunk || result.content || result.contentChunk || '';
      // Extract links using regex patterns and add to collection
    }
  }

  // Rank links by importance using AI
  const rankedLinks = await this.rankLinksByImportance(allLinks);
  
  // Save to database
  await this.db.getDatabase()
    .update(widget)
    .set({ links: rankedLinks })
    .where(eq(widget.id, widgetId));
}
```

### API Endpoint (`workers/routes/widget-docs.routes.ts`)

```typescript
// POST /api/widgets/:id/docs/regenerate-links
widgetDocsRouter.post('/:id/docs/regenerate-links', async (c) => {
  const widgetId = c.req.param('id');
  const { userId } = c.get('user');
  
  await widgetService.extractImportantLinks(widgetId);
  
  return c.json({ success: true });
});
```

### Frontend UI (`app/components/widgets/WidgetForm.tsx`)

```typescript
const handleRegenerateLinks = async () => {
  setIsRegeneratingLinks(true);
  try {
    await fetch(`/api/widgets/${widget.id}/docs/regenerate-links`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Refresh widget data
    await refetch();
  } catch (error) {
    console.error('Failed to regenerate links:', error);
  } finally {
    setIsRegeneratingLinks(false);
  }
};
```

## 📊 Search Strategy

### Semantic Search Queries
The system uses targeted search queries to find different types of links:

1. **Navigation Links**: `'links navigation menu'`
2. **Web Resources**: `'http https www url website'`
3. **Contact Information**: `'contact us email phone address'`
4. **Business Links**: `'pricing plans cost subscription'`
5. **Company Information**: `'about company team mission'`
6. **Documentation**: `'documentation docs guide help'`
7. **Legal Pages**: `'privacy policy terms legal'`
8. **Social Media**: `'social media twitter facebook linkedin github'`
9. **Support Resources**: `'resources downloads support'`

### Link Extraction Patterns
Multiple regex patterns capture different link formats:

```typescript
const linkPatterns = [
  /https?:\/\/[^\s<>"']+/g,           // Standard URLs
  /www\.[^\s<>"']+/g,                 // www. links
  /\[([^\]]+)\]\(([^)]+)\)/g,         // Markdown links
  /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi  // HTML links
];
```

## 🎯 Link Categorization

### Categories
- **Navigation**: Main menu, site navigation
- **Contact**: Contact forms, email, phone
- **Business**: Pricing, products, services
- **Company**: About, team, mission
- **Legal**: Privacy, terms, compliance
- **Social**: Social media profiles
- **Resources**: Documentation, downloads, support
- **External**: Third-party links

### Importance Scoring
Links are scored based on:
- **Frequency**: How often they appear
- **Context**: Surrounding content relevance
- **Position**: Location in page hierarchy
- **Type**: Category-based importance weights
- **Quality**: URL structure and domain reputation

## 🔍 Error Handling

### Common Issues
- **No Content Found**: Handled gracefully with helpful error messages
- **Vector Search Failures**: Retry logic with exponential backoff
- **AI Ranking Errors**: Fallback to heuristic ranking
- **Database Errors**: Transaction rollback and error logging

### Debug Information
```typescript
console.log(`[LINK-EXTRACTION] Processing ${searchResults.length} search results`);
console.log(`[LINK-EXTRACTION] Found ${allLinks.length} unique links`);
console.log(`[LINK-EXTRACTION] Ranked ${rankedLinks.length} important links`);
```

## 🚀 Performance Optimizations

### Efficiency Features
- **Batch Processing**: Process multiple search queries in parallel
- **Deduplication**: Remove duplicate URLs using Set data structure
- **Caching**: Leverage existing vector embeddings
- **Lazy Loading**: Only process links when requested

### Scalability Considerations
- **Rate Limiting**: Prevent abuse of regeneration endpoint
- **Background Processing**: Consider moving to workflow for large sites
- **Memory Management**: Process links in batches to avoid memory issues
- **Database Optimization**: Use efficient update queries

## 🔒 Security Features

### Input Validation
- **URL Sanitization**: Clean and validate extracted URLs
- **Content Filtering**: Remove malicious or inappropriate links
- **Rate Limiting**: Prevent spam and abuse
- **Authentication**: Require proper authorization for regeneration

### Privacy Protection
- **Data Minimization**: Only store essential link information
- **User Consent**: Respect user privacy preferences
- **Secure Storage**: Encrypt sensitive link data
- **Access Control**: Limit access to widget owners

## 📱 User Experience

### UI/UX Features
- **Visual Feedback**: Loading states during regeneration
- **Progress Indicators**: Show processing status
- **Error Messages**: Clear, actionable error information
- **Link Preview**: Display extracted links with categories
- **Batch Operations**: Regenerate multiple widgets efficiently

### Responsive Design
- **Mobile Optimized**: Works well on all device sizes
- **Touch-Friendly**: Easy to use on mobile devices
- **Accessibility**: Screen reader and keyboard navigation support
- **Performance**: Fast loading and smooth interactions

## 🧪 Testing Strategy

### Unit Tests
- **Link Extraction Logic**: Test regex patterns and extraction
- **AI Ranking**: Mock AI responses and test ranking algorithms
- **Error Handling**: Test failure scenarios and recovery
- **Data Validation**: Test input sanitization and validation

### Integration Tests
- **API Endpoints**: Test complete regeneration workflow
- **Database Operations**: Test data persistence and retrieval
- **Vector Search**: Test search query results and processing
- **UI Components**: Test user interactions and feedback

### Performance Tests
- **Large Content**: Test with extensive crawled content
- **Many Links**: Test with high link density pages
- **Concurrent Users**: Test multiple simultaneous regenerations
- **Memory Usage**: Monitor memory consumption during processing

## 📈 Analytics & Monitoring

### Key Metrics
- **Regeneration Success Rate**: Track successful link extractions
- **Processing Time**: Monitor performance and optimization opportunities
- **Link Quality**: Measure accuracy of extracted links
- **User Engagement**: Track feature usage and adoption

### Monitoring Points
- **API Response Times**: Monitor endpoint performance
- **Error Rates**: Track and alert on failures
- **Database Performance**: Monitor query execution times
- **Vector Search Latency**: Track search performance

## 🔄 Future Enhancements

### Planned Features
- **Real-time Updates**: Automatically update links when content changes
- **Link Validation**: Check link accessibility and health
- **Custom Categories**: Allow users to define custom link categories
- **Bulk Operations**: Process multiple widgets simultaneously
- **API Access**: Expose link extraction via public API

### Performance Improvements
- **Parallel Processing**: Implement concurrent search queries
- **Caching Layer**: Add Redis for frequently accessed links
- **Incremental Updates**: Only process changed content
- **Background Jobs**: Move heavy processing to background workflows

## 🔧 Configuration Options

### Environment Variables
```bash
# Link extraction settings
LINK_EXTRACTION_ENABLED=true
LINK_EXTRACTION_MAX_LINKS=100
LINK_EXTRACTION_BATCH_SIZE=20
LINK_EXTRACTION_TIMEOUT=30000
```

### Widget Settings
```typescript
interface LinkExtractionConfig {
  enabled: boolean;
  maxLinks: number;
  categories: string[];
  autoRegenerate: boolean;
  includeExternal: boolean;
}
```

## 📚 Related Documentation

- [Vector Search Implementation](../ARCHITECTURE/DATABASE.md#vector-search)
- [Widget Service API](../API/widget-management.md)
- [Website Crawler](./WEBSITE-CRAWLER.md)
- [Content Processing](../WORKFLOWS/content-processing.md)

## 🐛 Troubleshooting

### Common Issues

1. **No Links Found**
   - Check if content has been crawled and embedded
   - Verify search queries are returning results
   - Ensure content contains actual links

2. **Slow Regeneration**
   - Monitor vector search performance
   - Check database query execution times
   - Consider reducing batch size or timeout

3. **Poor Link Quality**
   - Review and adjust search queries
   - Improve link extraction regex patterns
   - Enhance AI ranking prompts

### Debug Mode
Enable detailed logging by setting:
```javascript
window.WEBSYTE_DEBUG = true;
```

---

Last updated: 2025-01-06