# Websyte AI Chat Widget - Planning Document

## Project Overview
An embeddable AI chat widget for article websites that can ingest page content and provide features like summarization and audio conversion via OpenAI integration.

**🚀 DEPLOYED**: [https://websyte.ai](https://websyte.ai)

## Core Requirements

### Widget Features
- Simple text-based chat interface
- Message history (stored in localStorage)
- Real-time interaction with OpenAI
- Page content ingestion for context-aware responses
- Built-in commands: summarize, audio conversion (text-to-speech)

### Embedding Method
- Single `<script>` tag integration
- Self-contained widget with no external dependencies
- Minimal impact on host website performance

### Technical Stack
- **Frontend**: React + TypeScript (compiled to vanilla JS bundle)
- **Backend**: Cloudflare Workers (existing setup)
- **AI**: OpenAI API
- **Storage**: localStorage (client-side message history)
- **Styling**: Tailwind CSS v4 (compiled and inlined for Shadow DOM)
- **Isolation**: Shadow DOM for complete style encapsulation

## Environment Variables
- `OPENAI_API_KEY`: OpenAI API key
- `ALLOWED_ORIGINS`: CORS allowed origins
- `WIDGET_VERSION`: Version for cache busting
- `API_BEARER_TOKEN`: Bearer token for automation API access
- `MESSAGE_RETENTION_DAYS`: Days to retain chat messages (default: 30)
- `STORE_IP_ADDRESSES`: Whether to store IP addresses (GDPR compliance)

## Security Considerations
- CORS configuration for widget domains
- Rate limiting on API endpoints
- Input sanitization for page content
- API key protection in Workers environment
- Content length limits to prevent abuse

## Performance Considerations
- Lazy load widget to minimize impact on host site
- Debounce user input
- Compress page content before sending to API
- Cache common responses
- Minimize bundle size (<50KB gzipped)

## Current Status
The widget is fully functional and deployed to production with all core features implemented:

- ✅ **Embeddable Widget**: Single script tag integration
- ✅ **AI Chat**: OpenAI-powered conversations with page context
- ✅ **Summarization**: One-click page summarization
- ✅ **Modern UI**: Glass morphism design with customizable branding
- ✅ **Shadow DOM**: Complete style isolation
- ✅ **Configuration**: Flexible script attribute configuration
- ✅ **RAG Support**: Knowledge base and vector search capabilities
- ✅ **Message Persistence**: Chat message storage with analytics
- ✅ **Public Widgets**: Direct URL sharing and embedding
- ✅ **API Automation**: Bearer token auth for programmatic access

## Future Enhancements

### Audio API Integration
- **Audio Player UI**: Complete with full controls and animations ✅
- **Backend Integration**: Implement `/api/audio` endpoint for text-to-speech conversion
- **OpenAI TTS**: Connect to OpenAI text-to-speech API
- **Content Integration**: Generate audio from page content or chat messages
- **Error Handling**: Add audio loading and playback error states
- **Real Progress**: Replace simulated progress with actual audio duration tracking

### Performance Optimization
- Bundle size optimization and lazy loading
- Advanced caching strategies
- WebSocket support for real-time features

### Additional Features Under Consideration
- Multi-language support
- Custom AI model selection
- Analytics dashboard for widget owners
- A/B testing capabilities
- Advanced embedding options (popup, sidebar, etc.)

## Technical Dependencies
- **UI Components**: Lucide React icons, Tailwind CSS utilities, shadcn/ui component library
- **Styling**: Class Variance Authority, clsx, tailwind-merge, @tailwindcss/postcss
- **Build System**: @tailwindcss/vite for Tailwind CSS v4 integration
- **Environment**: OpenAI API key configuration in worker environment
- **Component Library**: shadcn/ui Button, Card, Badge, Input, Separator components
- **Testing**: Vitest with 100% coverage across services and utilities

## Development Workflow
- **Single Command Development**: `pnpm run dev:widget` for auto-rebuilding
- **Clean Build Process**: Outputs to `public/dist/widget.js`
- **No Build Loops**: Optimized Vite configuration
- **Easy Deployment**: `pnpm run deploy` for full production deployment

## Production URLs
- **Live URL**: https://websyte.ai
- **Widget URL**: https://websyte.ai/dist/widget.js
- **Test Pages**: `/test` and `/script-test` routes available
- **Performance**: ~200KB widget bundle, optimized for production