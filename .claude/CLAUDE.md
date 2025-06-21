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

### Testing Requirements
- **Always create tests for new features**
- Maintain 100% test coverage for worker services
- Use Vitest framework with comprehensive mocking
- See `.claude/TESTING.md` for detailed testing guidelines

### File Access Guidelines
**NEVER read these generated directories**:
- `dist/`, `build/`, `node_modules/`, `coverage/`

**Work with source files in**: `app/`, `workers/`, `test/`, and root config files.

## Documentation Maintenance
**IMPORTANT**: When adding new features or making significant changes, always update documentation:

### Required Documentation Updates
1. **README.md** - Update the following sections when applicable:
   - Features list (add new features with ✅ **NEW** flag)
   - Architecture section (note significant architectural changes)
   - API Endpoints (document new endpoints)
   - Recent Updates section (add new entry at top with latest changes)
   - Configuration options (if new script attributes added)

2. **PLANNING.md** - Update the following sections when applicable:
   - Project Status (if completion status changes)
   - Implementation Phases (mark completed phases as ✅ COMPLETED)
   - Recent Implementation sections (add detailed technical implementation notes)
   - File Structure (if new files or directories added)
   - API Endpoints (document new endpoint specifications)

3. **CLAUDE.md** (this file) - Update when applicable:
   - Architecture notes (for significant architectural changes)
   - New development patterns or requirements
   - Testing requirements (if test strategy changes)
   - Build process changes

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
- **OpenAI API** integration for chat and AI features
- **Content caching** with TTL and LRU eviction
- **Comprehensive error handling** and validation

## Current Project Status

### Production Deployment ✅
- **Live URL**: https://websyte-ai-chat-widget.clementineso.workers.dev
- **Widget Bundle**: https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js
- **Bundle Size**: ~200KB optimized for production
- **Test Coverage**: 235 tests with 100% coverage

### Latest Improvements
- **Content Caching**: Intelligent caching with TTL and LRU eviction for 70-80% performance improvement
- **Component Architecture**: Modular hooks and components for better maintainability
- **Zero Configuration**: Automatic content extraction without selector requirements
- **Professional UI**: Glass morphism design with smooth animations

