# Architecture Documentation

This directory contains detailed technical architecture documentation for the Websyte AI Chat Widget system.

## 📚 Documentation Index

### Core Architecture
- [**OVERVIEW.md**](./OVERVIEW.md) - High-level system architecture and tech stack
- [**FRONTEND.md**](./FRONTEND.md) - React Router 7 app structure and component architecture
- [**BACKEND.md**](./BACKEND.md) - Cloudflare Workers, services, and API architecture
- [**DATABASE.md**](./DATABASE.md) - PostgreSQL schema, vector search, and migrations
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) - Infrastructure, deployment, and scaling

### Specialized Architecture
- [**WIDGET-EMBED.md**](./WIDGET-EMBED.md) - Widget embedding system and iframe architecture
- [**RAG-PIPELINE.md**](./RAG-PIPELINE.md) - RAG agent and vector search implementation
- [**AUTHENTICATION.md**](./AUTHENTICATION.md) - Better Auth and Bearer token authentication
- [**MESSAGE-PERSISTENCE.md**](./MESSAGE-PERSISTENCE.md) - Chat message storage and management
- [**PERFORMANCE.md**](./PERFORMANCE.md) - Caching, optimization, and performance features

## 🔍 Quick Navigation

### By Technology
- **React/Frontend**: [FRONTEND.md](./FRONTEND.md), [WIDGET-EMBED.md](./WIDGET-EMBED.md)
- **Cloudflare Workers**: [BACKEND.md](./BACKEND.md), [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Database/Vector Search**: [DATABASE.md](./DATABASE.md), [RAG-PIPELINE.md](./RAG-PIPELINE.md)
- **Authentication**: [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Performance**: [PERFORMANCE.md](./PERFORMANCE.md)

### By Feature Area
- **Chat Widget**: [WIDGET-EMBED.md](./WIDGET-EMBED.md), [FRONTEND.md](./FRONTEND.md)
- **AI/RAG**: [RAG-PIPELINE.md](./RAG-PIPELINE.md), [DATABASE.md](./DATABASE.md)
- **API**: [BACKEND.md](./BACKEND.md), [AUTHENTICATION.md](./AUTHENTICATION.md)
- **Data Storage**: [DATABASE.md](./DATABASE.md), [MESSAGE-PERSISTENCE.md](./MESSAGE-PERSISTENCE.md)

## 📋 Architecture Principles

### Design Principles
1. **Separation of Concerns** - UI, business logic, and data layers are clearly separated
2. **Modularity** - Components and services are self-contained and reusable
3. **Type Safety** - Full TypeScript coverage with strict typing
4. **Performance First** - Caching, lazy loading, and optimization built-in
5. **Security by Design** - Authentication, rate limiting, and validation at every layer

### Key Architectural Decisions
- **Monorepo Structure** - Frontend and backend in single repository for easier development
- **Edge Computing** - Cloudflare Workers for low latency and global distribution
- **Vector Database** - pgvector for semantic search capabilities
- **Component Architecture** - Small, focused components for maintainability
- **Service-Based Backend** - Clear service boundaries for different domains

## 🚀 Getting Started

For developers new to the architecture:
1. Start with [OVERVIEW.md](./OVERVIEW.md) for high-level understanding
2. Read [FRONTEND.md](./FRONTEND.md) or [BACKEND.md](./BACKEND.md) based on your focus area
3. Review [DATABASE.md](./DATABASE.md) to understand data flow
4. Check [DEPLOYMENT.md](./DEPLOYMENT.md) for infrastructure details

## 🔄 Recent Updates

- **2025-01-06**: Split monolithic ARCHITECTURE.md into focused documentation files
- **2025-01-03**: Added route modularization documentation
- **2025-01-01**: Documented new component architecture and hooks
- **2024-12-28**: Added performance optimization documentation
- **2024-12-25**: Documented authentication architecture

---

For implementation details and code examples, see the [API Documentation](../API/) and [Feature Documentation](../FEATURES/).