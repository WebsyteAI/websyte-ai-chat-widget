# Claude Development Notes

## Quick Reference

### Package Manager
**ALWAYS use pnpm commands, never npm**:
- `pnpm install` - Install dependencies
- `pnpm build` - Build the application
- `pnpm deploy` - Deploy to Cloudflare Workers
- `pnpm dev` - Start development server
- `pnpm test` - Run tests

### Key Commands
- Widget development: `pnpm run dev:widget`
- Build widget only: `pnpm run build:widget`
- Test with coverage: `pnpm test:coverage`
- Run unit tests: `pnpm test`
- Run integration tests: `pnpm test:integration`

### Testing Requirements
- **Always create tests for new features**
- Maintain 100% test coverage for worker services
- Use Vitest framework with comprehensive mocking
- See `.claude/TESTING.md` for unit testing guidelines
- See `.claude/TESTING-INTEGRATION.md` for integration testing framework

### File Access Guidelines
**NEVER read these generated directories**:
- `dist/`, `build/`, `node_modules/`, `coverage/`

**Work with source files in**: `app/`, `workers/`, `test/`, and root config files.

## Documentation Structure

### Directory Organization (Updated 2025-01-01)
Documentation is now organized into subdirectories for better maintainability:
```
.claude/
├── Core Documentation
│   ├── ARCHITECTURE.md - System architecture with route modularization
│   ├── API-REFERENCE.md - Complete API docs with automation endpoints
│   ├── CONTEXT.md - Project overview and goals
│   └── PLANNING.md - Future enhancements and development workflow
├── FEATURES/ - Feature-specific documentation
│   ├── MESSAGE-PERSISTENCE.md
│   ├── WEBSITE-CRAWLER.md
│   ├── WIDGET-SHARING.md
│   └── WORKFLOW-VISUALIZATION.md
├── EMBEDDING/ - Embedding and integration docs
│   ├── IFRAME-API.md
│   └── EMBED-CODE-USAGE.md
├── Testing Documentation
│   ├── TESTING.md - Unit testing guidelines
│   └── TESTING-INTEGRATION.md - Integration testing framework
├── FUTURE/ - Future plans and proposals
│   └── stripe-payment-integration-plan.md
└── ARCHIVE/ - Historical documentation
    └── PLANNING-HISTORY.md
```

## Documentation Maintenance
**IMPORTANT**: When adding new features or making significant changes, always update documentation:

### Required Documentation Updates
1. **Root CLAUDE.md** - Update the following sections when applicable:
   - Features list (add new features with ✅ **NEW** flag)
   - Essential Files section (for new route files or services)
   - Quick Start commands (for new scripts)
   - API Automation section (for new automation endpoints)

2. **API-REFERENCE.md** - Update when adding:
   - New API endpoints (public, authenticated, automation, or admin)
   - Changes to authentication methods
   - Rate limiting changes
   - Request/response formats

3. **ARCHITECTURE.md** - Update when:
   - Adding new route modules to `workers/routes/`
   - Changing system architecture
   - Modifying authentication flow
   - Adding new services or components

4. **Feature-specific docs** - Create new docs in `.claude/FEATURES/` for major features

### Documentation Standards
- Use ✅ **NEW** for brand new features
- Use ✅ **UPDATED** for significant enhancements to existing features  
- Use ✅ **ENHANCED** for improvements to existing functionality
- Include specific file locations when documenting technical implementations
- Always maintain the "Recent Updates" sections in chronological order (newest first)
- Document both the "what" and "why" of significant changes
- Include testing impact and coverage maintenance notes

### When to Update Documentation
- Adding new API endpoints or services
- Creating new UI components or major UI changes
- Implementing new configuration options
- Refactoring significant portions of code
- Adding new dependencies or changing build process
- Fixing bugs that affect user-facing functionality
- Performance optimizations or architectural improvements
- Removing features or functionality (document what was removed and why)

### Example Documentation Entry Format
```markdown
### ✅ Feature Name (Latest)
- **What Changed**: Brief description of the change
- **Technical Details**: Key implementation details and file locations
- **User Impact**: How this affects end users or developers
- **Testing**: Test coverage impact and validation approach
- **Benefits**: Why this change was made and its advantages
```

## Core Architecture Overview

### Frontend Widget Architecture
- **React Router 7** with standalone widget bundle
- **Shadow DOM** for complete style isolation
- **Tailwind CSS v4** compiled and inlined
- **Vite** build system with optimized bundling

### Backend Services
- **Cloudflare Workers** with Hono framework
- **Modular Route Architecture** in `workers/routes/` directory
- **OpenAI API** integration for chat and AI features
- **Content caching** with TTL and LRU eviction
- **Comprehensive error handling** and validation
- **Integration Testing** with real services or mocks

## Current Project Status

### Production Deployment ✅
- **Live URL**: https://websyte-ai-chat-widget.clementineso.workers.dev
- **Widget Bundle**: https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js
- **Bundle Size**: ~200KB optimized for production
- **Test Coverage**: 235 tests with 100% coverage

### Latest Improvements
- **Documentation Reorganization** (2025-01-01): Restructured docs into subdirectories for better maintainability
- **Route Modularization**: Backend routes split into separate files in `workers/routes/`
- **Integration Testing**: New test framework with mocking support for CI/CD
- **API Automation**: Bearer token auth endpoints for programmatic access
- **Content Caching**: Intelligent caching with TTL and LRU eviction for 70-80% performance improvement
- **Component Architecture**: Modular hooks and components for better maintainability
- **Zero Configuration**: Automatic content extraction without selector requirements
- **Professional UI**: Glass morphism design with smooth animations

