# ChatWidget Modular Architecture

## Overview

The ChatWidget has been refactored from a monolithic 875-line component into a modular architecture using custom React hooks. This refactoring improves testability, maintainability, and code organization while preserving the exact same user interface and functionality.

## Performance Enhancements

### Parallel API Loading

The widget now implements high-performance parallel API loading for optimal user experience:

- **Simultaneous API Calls**: Three critical APIs (analyze-selector, recommendations, summaries) execute in parallel during widget initialization
- **Reduced Load Time**: Eliminated sequential API bottlenecks for faster widget startup
- **Smart Caching**: Content extraction is warmed once and reused across all API calls
- **Error Resilience**: Individual API failures don't block other operations

```typescript
// Parallel execution implementation
const [selectorResponse, recommendationsResponse, summariesResponse] = await Promise.all([
  fetch(`${baseUrl}/api/analyze-selector`, { /* ... */ }),
  fetch(`${baseUrl}/api/recommendations`, { /* ... */ }),
  fetch(`${baseUrl}/api/summaries`, { /* ... */ })
]);
```

### Enhanced Action Bar

The action bar now features a two-row design for improved user engagement:

**Row 1 - Core Actions**:
- "Summarize Content" - Dropdown with Original/Short/Medium options
- "Audio Version" - Transform to audio player mode
- "Ask Questions" - Open chat panel

**Row 2 - Prompt Recommendations**:
- Up to 4 AI-generated question suggestions
- Directly clickable for immediate chat interaction
- Horizontally scrollable if needed
- Loading states with skeleton placeholders

### Flexible Height Design

The action bar container uses `min-height` instead of fixed height:
- Automatically expands to show both rows when recommendations are available
- Maintains minimum 3.5rem height for consistent audio player mode
- Smooth transitions between single and double-row layouts

## Architecture Goals

- **Zero UI Changes**: Maintain identical user experience
- **Enhanced Testability**: Enable independent testing of business logic
- **Separation of Concerns**: Isolate different responsibilities into focused modules
- **Improved Maintainability**: Reduce component complexity and improve code readability
- **Future Extensibility**: Support easier feature additions and modifications

## Component Structure

```
app/components/ChatWidget/
├── ChatWidget.tsx                    # Main orchestrating component (reduced from 875+ to ~600 lines)
├── hooks/                           # Business logic hooks
│   ├── useChatMessages.ts          # Message state management
│   ├── useAudioPlayer.ts           # Audio playback controls
│   └── useContentSummarization.ts  # Content mode switching
```

## Custom Hooks

### `useChatMessages`

**Purpose**: Manages chat message state and operations

**Responsibilities**:
- Message state management with typed Message interface
- Adding new messages with auto-generated IDs and timestamps
- Clearing message history
- Type-safe message operations

**API**:
```typescript
interface UseChatMessagesReturn {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  clearMessages: () => void;
}
```

**Benefits**:
- Easily testable message operations
- Consistent message ID generation
- Simplified message state management in main component

### `useAudioPlayer`

**Purpose**: Handles audio playback simulation and controls

**Responsibilities**:
- Audio playback state (playing, progress, speed, timing)
- Play/pause functionality
- Speed control with predefined options (0.5x to 2x)
- Progress tracking and time formatting
- Audio simulation with interval-based progress updates

**API**:
```typescript
interface UseAudioPlayerReturn {
  isPlaying: boolean;
  audioProgress: number;
  playbackSpeed: number;
  elapsedTime: number;
  totalTime: number;
  handlePlayPause: () => void;
  handleSpeedChange: () => void;
  formatTime: (seconds: number) => string;
  setAudioProgress: (progress: number) => void;
}
```

**Benefits**:
- Isolated audio logic for independent testing
- Reusable audio controls across components
- Centralized audio state management

### `useContentSummarization`

**Purpose**: Manages content summarization and mode switching

**Responsibilities**:
- Summaries state management (short/medium/original modes)
- Content mode switching with DOM manipulation
- API calls for loading summaries
- DOM content replacement and restoration
- Target element management

**API**:
```typescript
interface UseContentSummarizationReturn {
  summaries: Summaries | null;
  isLoadingSummaries: boolean;
  currentContentMode: ContentMode;
  originalContent: string;
  targetElement: Element | null;
  mainContentElement: Element | null;
  setOriginalContent: (content: string) => void;
  setTargetElement: (element: Element | null) => void;
  setMainContentElement: (element: Element | null) => void;
  handleContentModeChange: (mode: ContentMode) => void;
  loadSummaries: (preloadedSummaries?: Summaries) => Promise<void>;
}
```

**Benefits**:
- Complex DOM manipulation logic isolated and testable
- API integration separated from UI concerns
- Reusable content management functionality
- Supports both API-based and pre-loaded summary data
- Optimized for parallel loading scenarios

## Refactoring Benefits

### Before Refactoring
- **875+ lines** in single component
- **25+ state variables** managing different concerns
- **Mixed responsibilities** (chat, audio, content, API calls)
- **Difficult to test** individual features
- **High cognitive load** when making changes

### After Refactoring
- **~600 lines** in main component (30% reduction)
- **3 focused hooks** with clear responsibilities
- **Separated business logic** from UI rendering
- **Independently testable** hooks
- **Cleaner component structure** with better readability

## Testing Strategy

Each hook can now be tested independently:

### Message Management Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useChatMessages } from './useChatMessages';

test('should add message with correct structure', () => {
  const { result } = renderHook(() => useChatMessages());
  
  act(() => {
    result.current.addMessage({
      role: 'user',
      content: 'Test message'
    });
  });
  
  expect(result.current.messages).toHaveLength(1);
  expect(result.current.messages[0]).toMatchObject({
    role: 'user',
    content: 'Test message',
    id: expect.any(String),
    timestamp: expect.any(Date)
  });
});
```

### Audio Player Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useAudioPlayer } from './useAudioPlayer';

test('should handle play/pause correctly', () => {
  const { result } = renderHook(() => useAudioPlayer(180));
  
  expect(result.current.isPlaying).toBe(false);
  
  act(() => {
    result.current.handlePlayPause();
  });
  
  expect(result.current.isPlaying).toBe(true);
});
```

### Content Summarization Testing
```typescript
import { renderHook, act } from '@testing-library/react';
import { useContentSummarization } from './useContentSummarization';

test('should change content mode correctly', () => {
  const mockExtractPageContent = jest.fn();
  const { result } = renderHook(() => 
    useContentSummarization({
      baseUrl: 'http://test.com',
      extractPageContent: mockExtractPageContent
    })
  );
  
  act(() => {
    result.current.handleContentModeChange('short');
  });
  
  expect(result.current.currentContentMode).toBe('short');
});
```

## Migration Guide

### For Developers Working on the Widget

1. **Understanding the Structure**: The main ChatWidget.tsx now imports and uses three custom hooks
2. **Hook Dependencies**: Each hook is self-contained with clear input/output interfaces
3. **State Management**: State is now distributed across hooks based on responsibility
4. **Testing**: Write tests for individual hooks rather than testing the entire component

### For Future Feature Development

1. **New Features**: Consider creating new hooks for complex business logic
2. **Hook Composition**: Hooks can be composed together for complex functionality
3. **Reusability**: Design hooks to be reusable across different components
4. **Testing First**: Write hook tests before implementing features

## Implementation Details

### Hook Integration in Main Component

```typescript
export function ChatWidget(props: ChatWidgetProps) {
  // Custom hooks for business logic
  const { messages, addMessage, clearMessages } = useChatMessages();
  const audioPlayer = useAudioPlayer(180);
  const contentSummarization = useContentSummarization({
    baseUrl: props.baseUrl,
    extractPageContent: () => ContentExtractor.extractPageContent(props.contentTarget)
  });

  // Event handlers now use hook methods
  const handleSendMessage = async (content: string) => {
    const userMessage = addMessage({ role: "user", content });
    // ... rest of send logic
  };

  // UI rendering remains unchanged
  return (
    <>
      {/* Same UI structure as before */}
    </>
  );
}
```

### State Management Patterns

- **Local State**: Each hook manages its own related state
- **Derived State**: Computed values are memoized within hooks
- **State Updates**: Hooks provide clear APIs for state modifications
- **Side Effects**: useEffect hooks are contained within individual hooks

## Performance Considerations

### Memory Usage
- **Reduced re-renders**: Hooks isolate state changes to relevant components
- **Memoization**: Callbacks are memoized within hooks to prevent unnecessary re-renders
- **State isolation**: Unrelated state changes don't trigger full component re-renders

### Bundle Size
- **No size increase**: Hooks are compiled into the same bundle
- **Tree shaking**: Unused hook methods can be tree-shaken in future optimizations
- **Code splitting**: Hooks could be dynamically imported for advanced use cases

## Future Enhancements

### Potential New Hooks
- `useRecommendations` - Extract recommendation loading logic
- `useChatAPI` - Isolate API communication logic
- `useViewManager` - Manage view state and transitions
- `useDropdownManager` - Handle dropdown state and click-outside behavior

### Advanced Patterns
- **Hook composition**: Combine multiple hooks for complex features
- **Context integration**: Use React Context for global state if needed
- **Custom hook libraries**: Create reusable hook collections for different features

## Conclusion

The modular architecture refactoring successfully achieves all goals:
- ✅ **Zero UI changes** while improving code quality
- ✅ **Enhanced testability** with isolated business logic
- ✅ **Better maintainability** with focused responsibilities
- ✅ **Future extensibility** for new features and modifications

This architecture provides a solid foundation for continued development while making the codebase more approachable for new developers and easier to maintain over time.