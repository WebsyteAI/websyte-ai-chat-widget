# System Architecture

## Overview

Full-stack chat widget system with modular component architecture, RAG capabilities, and vector search functionality for better testability and maintainability.

## Core Architecture Stack

- **Frontend**: React Router 7 + Vite + Zustand for state management
- **Backend**: Hono on Cloudflare Workers
- **Database**: Neon PostgreSQL + Drizzle ORM with pgvector extension
- **AI Services**: OpenAI GPT-4.1-mini + text-embedding-3-small, Mistral AI support
- **Search**: Vector similarity search with embeddings, full-text search
- **Authentication**: Better Auth for user management
- **Storage**: PostgreSQL for persistent data, localStorage for client state

## Custom Widget Embed Architecture

### Widget Entry Script (`app/widget-entry.tsx`)
The embed script architecture supports both standard and custom widgets:

```typescript
// Standard widget (page content chat)
<script src="/dist/widget.js" async></script>

// Custom widget (RAG-powered with knowledge base)
<script src="/dist/widget.js" data-widget-id="uuid" async></script>
```

**Key Components:**
- **Script Attribute Parsing**: Extracts `data-widget-id` and other configuration
- **Dynamic Widget Loading**: Renders different widget types based on configuration
- **Public Access Support**: Anonymous access for public widgets

### Widget Management Service (`workers/services/widget.ts`)
```typescript
class WidgetService {
  // Standard authenticated widget access
  async getWidget(id: string, userId: string): Promise<WidgetWithFiles | null>
  
  // Public widget access (no authentication required)
  async getPublicWidget(id: string): Promise<WidgetWithFiles | null>
  
  // Public widget content search
  async searchPublicWidgetContent(id: string, query: string, limit: number)
}
```

### Enhanced Chat Service (`workers/services/chat.ts`)
```typescript
class ChatService {
  async handleChat(c: AppContext): Promise<Response> {
    // Support both standard and custom widgets
    if (widgetId && this.ragAgent && this.widgetService) {
      const publicWidget = await this.widgetService.getPublicWidget(widgetId);
      
      if (publicWidget) {
        // Public widget - anonymous access
        const ragResult = await this.ragAgent.generateResponse(body, 'anonymous');
      } else if (auth?.user?.id) {
        // Private widget - authenticated access
        const ragResult = await this.ragAgent.generateResponse(body, auth.user.id);
      }
    }
  }
}
```

## RAG & Vector Search Architecture

### RAG Agent Service (`workers/services/rag-agent.ts`)
```typescript
class RAGAgent {
  // Context retrieval with similarity search
  private async retrieveRelevantContext(query, widgetId, userId, maxChunks, threshold)
  
  // System prompt building with retrieved context
  private buildSystemPrompt(retrievedChunks, webpageContent)
  
  // Response generation with context
  async generateResponse(request, userId, options)
  async streamResponse(request, userId, options)
}
```

### Vector Search Service (`workers/services/vector-search.ts`)
```typescript
class VectorSearchService {
  // Text chunking with overlap for better semantic coherence
  async chunkText(text, maxWords = 2000, overlapWords = 100)
  
  // OpenAI embedding generation
  async generateEmbedding(text): Promise<number[]>
  
  // Batch embedding creation for widgets
  async createEmbeddingsForWidget(widgetId, content, source, fileId)
  
  // Semantic similarity search with PostgreSQL + pgvector
  async searchSimilarContent(query, widgetId?, limit = 10, threshold = 0)
  
  // OCR support for documents
  async createEmbeddingsFromOCRPages(widgetId, fileId, pages)
}
```

### Database Schema Updates
```sql
-- Vector embeddings table with pgvector support
CREATE TABLE widget_embedding (
  id UUID PRIMARY KEY,
  widget_id VARCHAR NOT NULL,
  file_id VARCHAR NOT NULL, 
  content_chunk TEXT NOT NULL,
  embedding vector(1536), -- OpenAI text-embedding-3-small dimensions
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vector similarity index for performance
CREATE INDEX idx_widget_embedding_vector ON widget_embedding 
USING ivfflat (embedding vector_cosine_ops);
```

## Component Architecture

## Component Structure

**New Project Structure:**
```
app/components/ChatWidget/
├── ChatWidget.tsx              # Main orchestrating component (~400 lines)
├── index.ts                   # Main exports
├── types.ts                   # TypeScript definitions
├── hooks/
│   ├── index.ts              # Hook exports
│   ├── useChatMessages.ts    # Message state management
│   ├── useAudioPlayer.ts     # Audio playback controls
│   └── useContentSummarization.ts # Content mode switching
└── components/
    ├── index.ts              # Component exports
    ├── ActionBar.tsx         # Action buttons and dropdown
    ├── AudioPlayer.tsx       # Audio player controls
    ├── ChatMessage.tsx       # Individual message rendering
    ├── ChatPanel.tsx         # Complete chat interface
    ├── MessageInput.tsx      # Message input component
    └── RecommendationsList.tsx # Recommendations display
```

### Benefits of Component Architecture
- **Better Testing**: Each component can be tested independently
- **Improved Reusability**: Components can be reused in different contexts
- **Cleaner Separation**: UI components separated from business logic hooks
- **Easier Maintenance**: Smaller, focused files easier to understand and modify
- **Type Safety**: Proper TypeScript interfaces for all component props

## Design Principles

- **Separation of Concerns**: UI components separated from business logic
- **Enhanced Testability**: Independent testing of components and hooks
- **Maintainability**: Focused, single-responsibility modules
- **Reusability**: Components designed for reuse across features

## Component Structure

The new architecture separates concerns into distinct layers:

### Main Component
- **ChatWidget.tsx**: Main orchestrating component (~400 lines, reduced from 875+)
  - Imports and composes hooks and sub-components
  - Handles main event coordination and state management
  - Maintains the same public API and UI behavior

### Business Logic Hooks
- **useChatMessages.ts**: Message state management
- **useAudioPlayer.ts**: Audio playback controls  
- **useContentSummarization.ts**: Content mode switching

### UI Components
- **ActionBar.tsx**: Main action buttons and summarization dropdown
- **AudioPlayer.tsx**: Audio player controls and progress display
- **ChatMessage.tsx**: Individual chat message rendering with markdown support
- **ChatPanel.tsx**: Complete chat interface with message list and input
- **MessageInput.tsx**: Message input field with send/cancel functionality
- **RecommendationsList.tsx**: Horizontal scrollable recommendations display

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
- **Duplicate code** across similar UI patterns

### After Refactoring
- **~400 lines** in main component (55% reduction)
- **6 focused UI components** with single responsibilities
- **3 custom hooks** for business logic
- **Type-safe interfaces** for all component props
- **Separated business logic** from UI rendering
- **Independently testable** components and hooks
- **Reusable components** for future features
- **Cleaner component structure** with better readability

## Testing Strategy

The modular architecture enables comprehensive testing at multiple levels:

### Component Testing
Each UI component can be tested independently with focused test cases:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionBar } from './ActionBar';

test('should call onToggleChat when chat button is clicked', () => {
  const mockToggleChat = jest.fn();
  render(
    <ActionBar
      advertiserName="Test"
      baseUrl=""
      currentView="main"
      showSummaryDropdown={false}
      summaries={null}
      isLoadingSummaries={false}
      currentContentMode="original"
      isTransitioning={false}
      onToggleChat={mockToggleChat}
      // ... other props
    />
  );
  
  fireEvent.click(screen.getByText('Ask Questions'));
  expect(mockToggleChat).toHaveBeenCalled();
});
```

### Testing Strategy

The modular architecture enables comprehensive testing:

- **Component Testing**: Each UI component tested independently
- **Hook Testing**: Business logic hooks tested in isolation
- **Integration Testing**: Component and hook integration verified
- **Error Handling**: Comprehensive error scenario coverage

## Migration Guide

### For Developers Working on the Widget

1. **Understanding the Structure**: The main ChatWidget.tsx imports and composes hooks and components
2. **Component Architecture**: UI logic is separated into focused components with clear interfaces
3. **Hook Dependencies**: Each hook is self-contained with clear input/output interfaces
4. **State Management**: State is distributed across hooks based on responsibility
5. **Import Paths**: Use the index files for clean imports (`from './components'` or `from './hooks'`)
6. **Testing**: Write tests for individual components and hooks, not just the main component

### For Future Feature Development

1. **New UI Features**: Create new components in the `components/` directory
2. **New Business Logic**: Consider creating new hooks for complex state management
3. **Component Composition**: Components can be composed together for complex UI features
4. **Hook Composition**: Hooks can be composed together for complex functionality
5. **Reusability**: Design both components and hooks to be reusable
6. **Testing First**: Write component and hook tests before implementing features
7. **Type Safety**: Always define proper TypeScript interfaces for component props and hook returns

## Implementation Details

### Component and Hook Integration

```typescript
export function ChatWidget(props: ChatWidgetProps) {
  // Import components and hooks from organized directories
  import { 
    useChatMessages, 
    useAudioPlayer, 
    useContentSummarization,
  } from "./hooks";
  import {
    ActionBar,
    AudioPlayer,
    ChatPanel,
    RecommendationsList,
  } from "./components";

  // Custom hooks for business logic
  const { messages, addMessage, clearMessages } = useChatMessages();
  const audioPlayer = useAudioPlayer(180);
  const contentSummarization = useContentSummarization({
    baseUrl: props.baseUrl,
    extractPageContent: () => ContentExtractor.extractPageContent(props.contentTarget)
  });

  // Event handlers coordinate between hooks and components
  const handleRecommendationClick = async (rec: Recommendation) => {
    // Uses hook methods and component props
    const userMessage = addMessage({ role: "user", content: rec.title });
    // ... rest of send logic
  };

  // UI rendering now uses composed components
  return (
    <>
      <div className="action-bar-container">
        {currentContent === "action" ? (
          <ActionBar
            advertiserName={advertiserName}
            onToggleChat={() => setCurrentView("chat")}
            onStartAudio={handleStartAudio}
            // ... other props
          />
        ) : (
          <AudioPlayer
            isPlaying={audioPlayer.isPlaying}
            onPlayPause={audioPlayer.handlePlayPause}
            // ... other props
          />
        )}
        
        <RecommendationsList
          recommendations={recommendations}
          onRecommendationClick={handleRecommendationClick}
        />
      </div>

      <ChatPanel
        messages={messages}
        onSendMessage={sendMessage}
        onRecommendationClick={handleRecommendationClick}
        // ... other props
      />
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

### Potential New Components
- `ContentModeSelector` - Extract content mode dropdown logic
- `LoadingSpinner` - Reusable loading indicator component
- `ErrorBoundary` - Error handling for component failures
- `Tooltip` - Reusable tooltip component for action buttons

### Potential New Hooks
- `useRecommendations` - Extract recommendation loading logic
- `useChatAPI` - Isolate API communication logic
- `useViewManager` - Manage view state and transitions
- `useDropdownManager` - Handle dropdown state and click-outside behavior
- `useKeyboardShortcuts` - Add keyboard navigation support

### Advanced Patterns
- **Hook composition**: Combine multiple hooks for complex features
- **Context integration**: Use React Context for global state if needed
- **Custom hook libraries**: Create reusable hook collections for different features

## Performance Features

### Content Caching System
- **Intelligent Caching**: TTL and LRU eviction for 70-80% performance improvement
- **Cache-First Architecture**: Content extraction warmed once and reused
- **Smart Key Management**: URL-based composite keying for cache entries

### Parallel API Loading
- **Simultaneous Calls**: Critical APIs execute in parallel during initialization
- **Error Resilience**: Individual API failures don't block other operations
- **Reduced Load Time**: Eliminated sequential bottlenecks

## Architecture Benefits

### Development Experience
- **55% code reduction** in main component (875+ → ~400 lines)
- **6 focused UI components** with single responsibilities
- **3 custom hooks** for business logic separation
- **Enhanced testability** with isolated components

### Code Quality
- **Type safety** with comprehensive TypeScript interfaces
- **Clean imports** with organized directory structure
- **Future extensibility** for new features and modifications
- **Better maintainability** with focused responsibilities
