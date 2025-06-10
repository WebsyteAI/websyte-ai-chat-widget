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

## Recent Implementation Updates

### ✅ Recommendations Loading State Improvements (Latest)
- **What Changed**: Enhanced recommendations loading state in action bar to prevent layout shifts
- **Technical Details**: 
  - Modified `app/components/ChatWidget/components/RecommendationsList.tsx` to show loading placeholders within marquee component
  - Fixed render condition to display loading state even when recommendations array is empty
  - Set loading placeholder dimensions to exactly match recommendation buttons (260px width, 34px height)
  - Updated loading count from 3 to 6 items to match backend generation
- **User Impact**: Seamless loading experience with no height jumping or layout shifts during recommendations loading
- **Testing**: Widget build validation, visual consistency testing
- **Benefits**: Better user experience with smooth transitions and consistent action bar behavior

### ✅ Widget Build Configuration Updates
- **What Changed**: Fixed widget build configuration and import path resolution
- **Technical Details**:
  - Added `vite-tsconfig-paths` plugin to `vite.widget.config.ts` for proper "@/lib/utils" import resolution
  - Removed non-existent `tw-animate-css` import from `app.css` that was causing build failures
  - Fixed `setIsPlaying` and `setElapsedTime` function access in ChatWidget audio controls
- **User Impact**: Stable widget builds and properly functioning audio controls
- **Testing**: Build process validation, widget functionality testing
- **Benefits**: Reliable build process and improved widget stability