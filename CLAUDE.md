# Websyte AI Chat Widget - Claude Documentation

## Project Overview
This is a React-based AI chat widget that can be embedded into websites. It provides content summarization, audio playback, and interactive chat functionality.

## Recent Updates

### Cache Initialization Fix (2025-01-16)
Fixed production caching issue where initial URLs weren't being stored in cache when the widget loaded:

#### Problem
- URLs were not appearing in cache admin panel after widget loads
- Cache service only stored data when caching was explicitly enabled
- New URLs defaulted to caching disabled, preventing any data storage
- Admin panel remained empty until caching was manually enabled per URL

#### Root Cause
- `getCacheEnabled()` returned `false` for new URLs (no `:enabled` key existed)
- Summaries and recommendations services only stored data if `getCacheEnabled()` was `true`
- No cache entries created for disabled URLs, making them invisible in listings

#### Solution Implemented
**UICacheService** (`workers/services/ui-cache.ts`):
- Added `ensureUrlTracked(url)` method to guarantee URL visibility
- Creates `:enabled` key (defaulting to `false`) and `:data` key for new URLs
- Ensures all accessed URLs appear in cache admin panel

**Summaries Service** (`workers/services/summaries.ts`):
- Always calls `ensureUrlTracked(url)` when URL is accessed
- **Always stores data** in cache when new summaries are generated (removed cache enabled check)
- Still only serves from cache when caching is enabled for the URL

**Recommendations Service** (`workers/services/recommendations.ts`):
- Always calls `ensureUrlTracked(url)` when URL is accessed  
- **Always stores data** in cache when new recommendations are generated (removed cache enabled check)
- Still only serves from cache when caching is enabled for the URL

#### Cache Behavior After Fix
- **URL Tracking**: All accessed URLs appear in cache admin panel immediately
- **Data Storage**: All generated summaries/recommendations are stored regardless of enabled status
- **Cache Serving**: Data is only served from cache when caching is enabled for the URL
- **Admin Control**: URLs default to caching disabled but can be enabled via admin panel

#### Key Changes
```typescript
// Before: Only stored if caching enabled
if (url && this.cache && await this.cache.getCacheEnabled(url)) {
  await this.cache.setSummaries(url, response);
}

// After: Always store for tracking
if (url && this.cache) {
  await this.cache.setSummaries(url, response);
}
```

### Responsive Design Implementation (2025-01-16)
Implemented comprehensive mobile responsiveness across the chat widget components:

#### ActionBar Component (`app/components/ChatWidget/components/ActionBar.tsx`)
- **Layout Structure**: Two-container approach with logo/AI text on left and buttons taking remaining space
- **Mobile Behavior**: 
  - Logo and "AI" text use smaller sizes (`w-6 h-6`, `text-sm`)
  - Buttons take equal width (33% each) using `flex-1`
  - Icon-only buttons with `hidden sm:inline` text labels
  - Content centered with `justify-center`
- **Desktop Behavior**:
  - Standard logo size (`w-8 h-8`, `text-base`)
  - Buttons still take equal width but show text labels
  - Icons + text visible with proper spacing
- **Key CSS Classes**:
  - Main container: `flex items-center justify-between w-full sm:justify-start sm:gap-4`
  - Buttons container: `flex flex-1`
  - Individual buttons: `flex-1` for equal distribution

#### ChatPanel Component (`app/components/ChatWidget/components/ChatPanel.tsx`)
- **Mobile Responsive**: Updated fixed width to responsive layout
- **CSS Changes**: `w-full max-w-[28rem] sm:w-[28rem] sm:min-w-[400px]`
- **Mobile Margins**: Added `mx-4 sm:mx-0` for proper mobile spacing

#### CSS Updates (`app/app.css`)
- **Container Width**: Updated `.container-action` and `.container-audio` to use fluid widths
- **Mobile Constraints**: `width: 640px` with `max-width: calc(100vw - 2rem)` fallback
- **Removed Animations**: Eliminated width transition animations that conflicted with responsive behavior

#### Animation Fix
- **Transform Conflict**: Fixed slide-in animation that included `translateX(-50%)` conflicting with centering
- **Solution**: Applied `-translate-x-1/2` only in initial state, let animation handle centering during transition

## Component Architecture

### Core Components
- **ChatWidget**: Main container component managing state and layout
- **ActionBar**: Responsive button bar with logo and action buttons
- **ChatPanel**: Sliding chat interface with message history
- **AudioPlayer**: Audio playback controls with progress tracking
- **MessageInput**: Text input with send/cancel functionality

### Key Features
- **Content Summarization**: Three modes (Original, Short, Medium)
- **Audio Playback**: Text-to-speech with speed controls
- **Interactive Chat**: Q&A interface with message history
- **Responsive Design**: Mobile-first approach with desktop enhancements
- **Smart Animations**: Smooth transitions between modes without conflicts

## Development Notes

### Responsive Design Principles
1. **Mobile-First**: Start with mobile constraints, enhance for desktop
2. **Equal Distribution**: Buttons take equal space using `flex-1`
3. **Content Centering**: Use `justify-center` for consistent alignment
4. **Text Visibility**: Hide text on mobile (`hidden sm:inline`), show on desktop
5. **Size Scaling**: Smaller elements on mobile, standard sizes on desktop

### CSS Best Practices
- Use `calc(100vw - 2rem)` for viewport-aware width constraints
- Avoid conflicting transform animations
- Prefer flex-based layouts over absolute positioning for responsive design
- Use semantic breakpoint prefixes (`sm:`) for desktop enhancements

### Common Issues & Solutions
- **Transform Conflicts**: Animation transforms can conflict with layout transforms
- **Width Overflow**: Use `max-width` with viewport calculations for mobile safety
- **Button Distribution**: Use `flex-1` on buttons and `flex` container for equal spacing
- **Text Overflow**: Hide text on mobile, show on desktop for better UX

## Testing
- Test on multiple screen sizes (mobile, tablet, desktop)
- Verify button equal distribution and centering
- Check animation smoothness without layout conflicts
- Validate text visibility across breakpoints

## Build Commands
```bash
# Development
npm run dev

# Build
npm run build

# Test
npm run test
```