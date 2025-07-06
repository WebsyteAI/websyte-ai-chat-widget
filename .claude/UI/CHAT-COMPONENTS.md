# Chat Widget Components

Detailed documentation for the chat widget component system, including standard and enhanced versions.

## 📋 Component Overview

The chat widget uses a modular component architecture with two sets of components:
- **Standard Components**: Basic chat functionality
- **Enhanced Components**: Advanced features with citations and sources

## 🧩 Core Components

### ChatWidget
Main orchestrating component that brings everything together.

```typescript
import { ChatWidget } from '@/components/ChatWidget';

<ChatWidget
  widgetId="uuid"
  baseUrl="https://api.example.com"
  contentTarget="article, main"
  position="bottom-right"
  isEmbedded={true}
  saveChatMessages={true}
/>
```

**Props:**
- `widgetId`: Unique widget identifier
- `baseUrl`: API base URL
- `contentTarget`: CSS selector for content extraction
- `position`: Widget position on screen
- `isEmbedded`: Whether widget is embedded
- `saveChatMessages`: Enable message persistence

**Features:**
- Content extraction from page
- Message persistence
- Audio playback support
- Content summarization
- Recommendation system

## 💬 Message Components

### ChatMessage (Standard)
Basic message display component.

```typescript
import { ChatMessage } from '@/components/ChatWidget/components/ChatMessage';

<ChatMessage
  message={{
    id: '1',
    role: 'user',
    content: 'Hello!',
    timestamp: new Date(),
  }}
  isLastMessage={true}
/>
```

**Features:**
- Markdown rendering
- User/assistant styling
- Timestamp display
- Copy to clipboard
- Text-to-speech

### EnhancedChatMessage
Advanced message component with citations and sources.

```typescript
import { EnhancedChatMessage } from '@/components/ChatWidget/components/EnhancedChatMessage';

<EnhancedChatMessage
  message={{
    id: '1',
    role: 'assistant',
    content: 'Based on the documentation[1], the answer is...',
    timestamp: new Date(),
    metadata: {
      sources: [
        {
          title: 'Documentation Page',
          url: 'https://docs.example.com',
          relevance: 0.95
        }
      ]
    }
  }}
  isLastMessage={true}
  onCopyMessage={(content) => console.log('Copied:', content)}
/>
```

**Enhanced Features:**
- **Citation Parsing**: Automatically detects [1], [2] style citations
- **Source Attribution**: Shows sources with relevance scores
- **Link Previews**: Hoverable source information
- **Improved Formatting**: Better handling of code blocks and lists
- **Metadata Display**: Shows model and response time

## 📝 Input Components

### MessageInput
Unified input component for typing messages.

```typescript
import { MessageInput } from '@/components/ChatWidget/components/MessageInput';

<MessageInput
  onSendMessage={(message) => handleSend(message)}
  onCancel={() => handleCancel()}
  disabled={isLoading}
  placeholder="Ask a question..."
/>
```

**Features:**
- Auto-resize textarea
- Send on Enter (Shift+Enter for new line)
- Cancel button when typing
- Loading state
- Character limit indicator

## 🎯 Chat Panel Components

### ChatPanel (Standard)
Basic chat interface container.

```typescript
import { ChatPanel } from '@/components/ChatWidget/components/ChatPanel';

<ChatPanel
  messages={messages}
  isLoading={isLoading}
  onSendMessage={handleSendMessage}
  recommendations={recommendations}
  onRecommendationClick={handleRecommendationClick}
  advertiserName="Support Bot"
  logoUrl="/logo.png"
/>
```

### EnhancedChatPanel
Advanced chat panel with better message handling.

```typescript
import { EnhancedChatPanel } from '@/components/ChatWidget/components/EnhancedChatPanel';

<EnhancedChatPanel
  messages={messages}
  isLoading={isLoading}
  onSendMessage={handleSendMessage}
  recommendations={recommendations}
  onRecommendationClick={handleRecommendationClick}
  advertiserName="AI Assistant"
  logoUrl="/logo.png"
  showSources={true}
  enableCitations={true}
/>
```

**Enhanced Features:**
- Uses EnhancedChatMessage for better formatting
- Source panel integration
- Citation highlighting
- Improved scroll behavior
- Message grouping

## 🎨 UI Components

### ActionBar
Top bar with action buttons and controls.

```typescript
import { ActionBar } from '@/components/ChatWidget/components/ActionBar';

<ActionBar
  advertiserName="Company Bot"
  baseUrl="https://api.example.com"
  currentView="main"
  showSummaryDropdown={true}
  summaries={summaries}
  isLoadingSummaries={false}
  currentContentMode="original"
  isTransitioning={false}
  onToggleChat={() => setShowChat(true)}
  onStartAudio={() => startAudioPlayback()}
  onContentModeChange={(mode) => changeContentMode(mode)}
  onViewChange={(view) => setCurrentView(view)}
/>
```

**Features:**
- Ask Questions button
- Listen to Page audio control
- Content summarization dropdown
- View mode switcher

### AudioPlayer
Audio playback controls for text-to-speech.

```typescript
import { AudioPlayer } from '@/components/ChatWidget/components/AudioPlayer';

<AudioPlayer
  isPlaying={isPlaying}
  audioProgress={progress}
  playbackSpeed={speed}
  elapsedTime={elapsed}
  totalTime={total}
  advertiserName="Bot Name"
  onPlayPause={() => togglePlayback()}
  onSpeedChange={() => cycleSpeed()}
  onProgressChange={(value) => seekTo(value)}
  onClose={() => closeAudio()}
/>
```

### RecommendationsList
Horizontal scrollable list of suggested questions.

```typescript
import { RecommendationsList } from '@/components/ChatWidget/components/RecommendationsList';

<RecommendationsList
  recommendations={[
    { id: '1', title: 'How do I get started?' },
    { id: '2', title: 'What are the key features?' },
    { id: '3', title: 'How much does it cost?' }
  ]}
  onRecommendationClick={(rec) => handleClick(rec)}
/>
```

## 🪝 Custom Hooks

### useChatMessages
Manages chat message state.

```typescript
const { messages, addMessage, clearMessages } = useChatMessages();

// Add a message
const newMessage = addMessage({
  role: 'user',
  content: 'Hello!'
});

// Clear all messages
clearMessages();
```

### useAudioPlayer
Controls audio playback functionality.

```typescript
const audioPlayer = useAudioPlayer(180); // 180 seconds duration

// Access state
console.log(audioPlayer.isPlaying);
console.log(audioPlayer.playbackSpeed);
console.log(audioPlayer.formatTime(audioPlayer.elapsedTime));

// Control playback
audioPlayer.handlePlayPause();
audioPlayer.handleSpeedChange();
```

### useContentSummarization
Manages content summarization features.

```typescript
const summarization = useContentSummarization({
  baseUrl: 'https://api.example.com',
  extractPageContent: () => ContentExtractor.extractPageContent()
});

// Load summaries
await summarization.loadSummaries();

// Change content mode
summarization.handleContentModeChange('short');
```

### useIframeMessaging
Handles cross-frame communication.

```typescript
const messaging = useIframeMessaging();

// Send message to parent
messaging.sendMessage({
  type: 'WIDGET_READY',
  widgetId: 'uuid'
});

// Listen for messages
messaging.onMessage((event) => {
  if (event.data.type === 'CONFIG_UPDATE') {
    updateConfig(event.data.config);
  }
});
```

## 🎯 Component Selection Guide

### When to Use Standard Components
- Basic chat functionality
- Simple Q&A interactions
- Minimal UI requirements
- No source attribution needed

### When to Use Enhanced Components
- RAG-powered responses with sources
- Academic or research contexts
- Need citation tracking
- Require source verification
- Professional documentation bots

## 💡 Best Practices

### Message Formatting
```typescript
// Good: Clear role separation
const userMessage = {
  role: 'user' as const,
  content: 'What is your return policy?'
};

const assistantMessage = {
  role: 'assistant' as const,
  content: 'Our return policy allows returns within 30 days[1].',
  metadata: {
    sources: [{ title: 'Return Policy', url: '/returns' }]
  }
};
```

### Error Handling
```typescript
try {
  await sendMessage(content);
} catch (error) {
  addMessage({
    role: 'assistant',
    content: 'Sorry, I encountered an error. Please try again.',
    metadata: { error: error.message }
  });
}
```

### Performance Optimization
```typescript
// Memoize expensive computations
const memoizedRecommendations = useMemo(
  () => processRecommendations(rawData),
  [rawData]
);

// Debounce user input
const debouncedSearch = useMemo(
  () => debounce(searchFunction, 300),
  [searchFunction]
);
```

## 🔧 Customization

### Theming
```css
/* Custom widget theme */
.chat-widget {
  --widget-primary: oklch(0.5 0.2 250);
  --widget-background: oklch(0.98 0 0);
  --widget-text: oklch(0.2 0 0);
  --widget-border-radius: 0.75rem;
}
```

### Component Extension
```typescript
// Extend existing component
import { ChatMessage } from '@/components/ChatWidget/components/ChatMessage';

export function CustomChatMessage(props) {
  return (
    <ChatMessage
      {...props}
      className="custom-message-styles"
      renderContent={(content) => (
        <div className="custom-content">
          {processCustomContent(content)}
        </div>
      )}
    />
  );
}
```

---

For more information:
- [Component Catalog](./COMPONENTS.md)
- [Frontend Architecture](../ARCHITECTURE/FRONTEND.md)
- [Widget Embedding](../ARCHITECTURE/WIDGET-EMBED.md)