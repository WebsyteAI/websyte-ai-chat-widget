# Feature Documentation

This directory contains detailed documentation for specific features of the Websyte AI Chat Widget.

## 📚 Feature Documentation

### Core Features
- [**MESSAGE-PERSISTENCE.md**](./MESSAGE-PERSISTENCE.md) - Chat message storage and retrieval system
- [**WEBSITE-CRAWLER.md**](./WEBSITE-CRAWLER.md) - Apify-based website crawling for knowledge base
- [**WIDGET-SHARING.md**](./WIDGET-SHARING.md) - Public widget access and embedding
- [**WORKFLOW-VISUALIZATION.md**](./WORKFLOW-VISUALIZATION.md) - Real-time workflow status tracking
- [**FILE-STORAGE.md**](./FILE-STORAGE.md) - R2 file storage and processing system
- [**ENHANCED-CHAT.md**](./ENHANCED-CHAT.md) ✅ **NEW** - Enhanced chat UI with citations and sources
- [**LINK-EXTRACTION.md**](./LINK-EXTRACTION.md) ✅ **NEW** - AI-powered link extraction from crawled content

### AI & Search Features
- **RAG System** - See [RAG Pipeline](../ARCHITECTURE/RAG-PIPELINE.md)
- **Vector Search** - Semantic search using pgvector with HNSW indexing
- **Content Summarization** - AI-powered page summaries
- **Smart Recommendations** - Contextual chat suggestions with performance tracking
- **Streaming Responses** - Real-time SSE-based response streaming
- **Citation Support** ✅ **NEW** - Automatic source citation in responses
- **Link Extraction** ✅ **NEW** - AI-powered extraction and categorization of important links

### Widget Features
- **Custom Branding** - Logo, colors (OKLCH format), and welcome messages
- **Multi-format Support** - PDF, TXT, MD, DOCX, JSON with OCR support
- **Audio Responses** - Text-to-speech integration with audio player
- **Content Modes** - Short/medium summaries or original
- **Glass Morphism UI** ✅ **NEW** - Modern translucent design with backdrop blur
- **Mobile Responsive** ✅ **NEW** - Optimized for all screen sizes
- **Dark Mode Support** ✅ **NEW** - Automatic theme detection

### Integration Features
- **Embed Script** - One-line integration with shadow DOM isolation
- **iframe API** - Cross-origin communication with security
- **Bearer Token Auth** - Automation API access for programmatic control
- **OAuth Support** - Google authentication via Better Auth
- **TypeScript SDK** ✅ **NEW** - Type-safe widget integration
- **React Components** ✅ **NEW** - Pre-built React integration components

## 🚀 Feature Overview

### Chat Widget
The main chat interface that can be embedded on any website:
- **Standard Mode**: Uses page content for context
- **Custom Mode**: Uses uploaded knowledge base
- **Streaming Responses**: Real-time AI responses
- **Message History**: Persistent conversation storage

### Knowledge Base Management
Upload and manage content for your AI assistant:
- **File Uploads**: Support for multiple formats
- **Web Crawling**: Automatic content extraction
- **OCR Support**: Extract text from images/PDFs
- **Vector Indexing**: Semantic search capabilities

### Customization Options
Make the widget match your brand:
- **Visual Theming**: Colors, fonts, positioning
- **Custom Instructions**: Specific AI behavior
- **Welcome Messages**: Personalized greetings
- **Logo Integration**: Your brand identity

### Analytics & Insights
Track widget usage and performance:
- **Message Analytics**: Volume and patterns
- **User Engagement**: Session tracking
- **Response Quality**: AI performance metrics
- **Error Monitoring**: Issue detection

## 📋 Feature Status

### Production Ready ✅
- Chat widget embedding with Shadow DOM
- RAG-powered responses with citations
- File upload & processing with OCR
- Website crawling with Apify
- Message persistence with PostgreSQL
- Custom branding with OKLCH colors
- Public widget sharing
- Enhanced chat UI components
- Bearer token API authentication
- Content caching with LRU eviction
- Streaming SSE responses
- Mobile responsive design
- AI-powered link extraction with categorization

### In Development 🚧
- Advanced analytics dashboard
- Multi-language support
- Voice input/output enhancements
- Webhook integrations
- Team collaboration features
- Widget analytics API
- Custom workflow builders

### Planned 📅
- Slack/Discord integration
- Advanced workflow automation
- A/B testing framework
- White-label options
- WebSocket real-time updates
- Multi-widget management
- API rate limit customization

## 🔧 Feature Configuration

Most features can be configured through:

1. **Widget Settings** - Dashboard configuration
2. **Environment Variables** - System-level settings
3. **API Parameters** - Runtime configuration
4. **Embed Attributes** - Script tag configuration

Example:
```html
<script 
  src="https://yourdomain.com/dist/widget.js"
  data-widget-id="your-uuid"
  data-save-messages="true"
  data-position="bottom-left"
  data-primary-color="#0066cc"
  async>
</script>
```

## 🔍 Feature Details

For detailed information about specific features:

1. **Message Persistence** - Database schema, retention policies, privacy
2. **Website Crawler** - Crawling process, content extraction, limitations
3. **Widget Sharing** - Public access, security, embedding
4. **Workflow Visualization** - Status tracking, progress updates

## 🐛 Troubleshooting

### Common Issues
- **Widget not appearing**: Check console for errors
- **Slow responses**: Verify API keys and rate limits
- **Crawling failures**: Check URL accessibility
- **Upload errors**: Verify file size and format

### Debug Mode
Enable debug mode for detailed logging:
```javascript
// Add to embed script
window.WEBSYTE_DEBUG = true;
```

## 🔒 Security Considerations

- **Data Privacy**: Messages stored with user consent
- **Access Control**: Role-based permissions
- **API Security**: Bearer token authentication
- **Content Filtering**: Input sanitization

---

For implementation details:
- [API Documentation](../API/)
- [Architecture Overview](../ARCHITECTURE/)
- [Testing Guide](../TESTING/)