# Changelog

All notable changes to the Websyte AI Chat Widget project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation reorganization with new structure in `.claude/` directory
- Detailed API documentation for all endpoints including automation API
- File storage and OCR processing documentation
- Cloudflare Workflows integration documentation
- Environment variables reference guide
- Deployment and operations guide

### Changed
- Documentation moved from single files to organized directory structure
- Consolidated duplicate information across documentation files

## [0.5.0] - 2025-01-04

### Added
- Interactive landing page with live chat demo
- Framer Motion animations for enhanced UX
- Dynamic island chat input component
- Custom logo support for AI avatars
- Full-width markdown content support

### Changed
- Unified chat components across the application
- Consolidated ChatPanel and ChatMessage components
- Updated to shadcn UI styling system
- Improved chat UI with better message formatting
- Enhanced widget editor with live preview

### Fixed
- Dynamic island input containment within chat boundaries
- Markdown prose styling for proper content formatting
- Widget list UI display issues
- Landing page responsive design

## [0.4.0] - 2024-12-28

### Added
- File storage system with R2 integration
- OCR processing using Mistral AI
- Document management API endpoints
- Page-by-page content extraction
- Cloudflare Workflows for content pipeline
- Automated embeddings generation from documents

### Changed
- Enhanced vector search with document support
- Improved widget content pipeline with workflow orchestration
- Better error handling for file uploads

## [0.3.0] - 2024-12-20

### Added
- Bearer token authentication for automation API
- Public widget API endpoints
- Widget sharing via direct URLs
- Message persistence with GDPR compliance
- Scheduled cleanup for old messages
- Integration testing framework

### Changed
- Modularized backend routes structure
- Improved rate limiting implementation
- Enhanced security with bearer token middleware

### Fixed
- Widget creation duplicate on Enter key
- Public share page access issues
- Route configuration for React Router 7

## [0.2.0] - 2024-12-15

### Added
- RAG (Retrieval Augmented Generation) chat agent
- Vector search with pgvector
- Inline citations in chat responses
- Smart prompt recommendations
- Website crawler integration with Apify
- Session management for conversations

### Changed
- Migrated to React Router 7
- Updated to Tailwind CSS v4
- Improved chat widget performance
- Enhanced embedding generation

### Fixed
- Chat scrolling behavior with sources
- Widget card showing incorrect page counts
- Test environment detection

## [0.1.0] - 2024-12-01

### Added
- Initial widget creation and management
- Basic chat functionality with OpenAI
- User authentication with Better Auth
- Google OAuth integration
- Dashboard with widget management
- Embed code generation
- PostgreSQL database with Drizzle ORM
- Cloudflare Workers deployment

### Infrastructure
- React + Vite frontend
- Hono backend on Cloudflare Workers
- Neon PostgreSQL database
- Better Auth for authentication
- Vitest for testing

## Development Guidelines

When adding entries to this changelog:

1. **Group changes** by type: Added, Changed, Deprecated, Removed, Fixed, Security
2. **Be specific** about what changed and why
3. **Include PR/issue numbers** when applicable
4. **Note breaking changes** prominently
5. **Update version numbers** following semantic versioning

### Version Numbering

- **Major (X.0.0)**: Breaking changes, major architectural shifts
- **Minor (0.X.0)**: New features, non-breaking changes
- **Patch (0.0.X)**: Bug fixes, minor improvements

### Release Process

1. Update changelog with release date
2. Tag release in git: `git tag -a v0.5.0 -m "Release version 0.5.0"`
3. Push tags: `git push origin --tags`
4. Deploy to production: `pnpm deploy`
5. Create GitHub release with changelog excerpt