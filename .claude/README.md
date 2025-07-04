# Websyte AI Chat Widget Documentation

Welcome to the comprehensive documentation for Websyte AI Chat Widget - an embeddable AI assistant platform with RAG capabilities.

## 📚 Documentation Index

### Getting Started
- **[GETTING-STARTED.md](./GETTING-STARTED.md)** - Quick start guide, installation, and setup
- **[../CLAUDE.md](../CLAUDE.md)** - Development workflow and commands reference

### Architecture & Design
- **[ARCHITECTURE/README.md](./ARCHITECTURE/README.md)** - System architecture overview
- **[ARCHITECTURE/FRONTEND.md](./ARCHITECTURE/FRONTEND.md)** - React Router 7 app structure
- **[ARCHITECTURE/BACKEND.md](./ARCHITECTURE/BACKEND.md)** - Cloudflare Workers and services
- **[ARCHITECTURE/DATABASE.md](./ARCHITECTURE/DATABASE.md)** - Database schema and design
- **[ARCHITECTURE/NAMING-CONVENTIONS.md](./ARCHITECTURE/NAMING-CONVENTIONS.md)** - Code standards and patterns

### API Reference
- **[API/README.md](./API/README.md)** - API overview and authentication
- **[API/WIDGETS.md](./API/WIDGETS.md)** - Widget management endpoints
- **[API/CHAT.md](./API/CHAT.md)** - Chat and RAG endpoints
- **[API/DOCUMENTS.md](./API/DOCUMENTS.md)** - Document management and OCR
- **[API/PUBLIC.md](./API/PUBLIC.md)** - Public widget access
- **[API/AUTOMATION.md](./API/AUTOMATION.md)** - Bearer token automation API
- **[API/ERROR-CODES.md](./API/ERROR-CODES.md)** - Error handling reference

### Features
- **[FEATURES/README.md](./FEATURES/README.md)** - Feature overview
- **[FEATURES/RAG-SEARCH.md](./FEATURES/RAG-SEARCH.md)** - RAG agent and vector search
- **[FEATURES/FILE-STORAGE.md](./FEATURES/FILE-STORAGE.md)** - R2 storage and OCR processing
- **[FEATURES/MESSAGE-PERSISTENCE.md](./FEATURES/MESSAGE-PERSISTENCE.md)** - Chat conversation storage
- **[FEATURES/WEBSITE-CRAWLER.md](./FEATURES/WEBSITE-CRAWLER.md)** - Apify web crawling
- **[FEATURES/WIDGET-SHARING.md](./FEATURES/WIDGET-SHARING.md)** - Public widget sharing
- **[FEATURES/WORKFLOWS.md](./FEATURES/WORKFLOWS.md)** - Cloudflare Workflows integration

### Embedding & Integration
- **[EMBEDDING/EMBED-CODE-USAGE.md](./EMBEDDING/EMBED-CODE-USAGE.md)** - Widget embedding guide
- **[EMBEDDING/IFRAME-API.md](./EMBEDDING/IFRAME-API.md)** - PostMessage API for iframe communication

### Deployment & Operations
- **[DEPLOYMENT/README.md](./DEPLOYMENT/README.md)** - Deployment overview
- **[DEPLOYMENT/ENVIRONMENT.md](./DEPLOYMENT/ENVIRONMENT.md)** - Environment variables reference
- **[DEPLOYMENT/SECURITY.md](./DEPLOYMENT/SECURITY.md)** - Security and authentication
- **[DEPLOYMENT/MIGRATIONS.md](./DEPLOYMENT/MIGRATIONS.md)** - Database migration procedures
- **[DEPLOYMENT/MONITORING.md](./DEPLOYMENT/MONITORING.md)** - Logging and monitoring

### Testing
- **[TESTING/README.md](./TESTING/README.md)** - Testing overview
- **[TESTING/UNIT-TESTS.md](./TESTING/UNIT-TESTS.md)** - Unit testing guide
- **[TESTING/INTEGRATION-TESTS.md](./TESTING/INTEGRATION-TESTS.md)** - Integration testing
- **[TESTING-INTEGRATION.md](./TESTING-INTEGRATION.md)** - Legacy integration test docs

### Planning & Future
- **[PLANNING.md](./PLANNING.md)** - Project roadmap and future enhancements
- **[FUTURE/stripe-payment-integration-plan.md](./FUTURE/stripe-payment-integration-plan.md)** - Payment integration plans

### Project Context
- **[CONTEXT.md](./CONTEXT.md)** - Project background and goals
- **[CLAUDE.md](./CLAUDE.md)** - Development notes and AI assistant instructions
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history and updates

## 🚀 Quick Links

### For Developers
1. Start here: [Getting Started](./GETTING-STARTED.md)
2. Understand the system: [Architecture Overview](./ARCHITECTURE/README.md)
3. Build integrations: [API Documentation](./API/README.md)
4. Run tests: [Testing Guide](./TESTING/README.md)

### For DevOps
1. Deploy to production: [Deployment Guide](./DEPLOYMENT/README.md)
2. Configure environment: [Environment Variables](./DEPLOYMENT/ENVIRONMENT.md)
3. Monitor the system: [Monitoring Guide](./DEPLOYMENT/MONITORING.md)

### For Product Teams
1. Feature overview: [Features Documentation](./FEATURES/README.md)
2. Embedding guide: [Widget Embedding](./EMBEDDING/EMBED-CODE-USAGE.md)
3. Future roadmap: [Planning Document](./PLANNING.md)

## 📋 Documentation Standards

- All documentation uses Markdown format
- Code examples include language hints for syntax highlighting
- API examples show both request and response
- Each document includes a clear table of contents for longer content
- Cross-references use relative links

## 🔄 Keeping Documentation Updated

When making changes:
1. Update relevant documentation immediately
2. Add entries to [CHANGELOG.md](./CHANGELOG.md)
3. Update API docs when adding/modifying endpoints
4. Keep examples working and tested
5. Remove outdated information

## 🤝 Contributing

See [CLAUDE.md](./CLAUDE.md) for development workflow and standards.