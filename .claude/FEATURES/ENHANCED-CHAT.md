# Enhanced Chat UI Components

This document describes the enhanced chat interface components that provide citation support, source tracking, and improved user experience.

## 🎯 Overview

The enhanced chat components extend the basic chat functionality with:
- Source citations in AI responses
- Expandable source references
- Visual indicators for AI processing
- Improved message formatting
- Mobile-optimized interactions

## 🏗️ Component Architecture

### Component Hierarchy
```
ChatWidget
├── ChatPanel
│   ├── ChatHeader
│   ├── EnhancedChatMessages
│   │   ├── EnhancedChatMessage
│   │   │   ├── MessageContent
│   │   │   ├── CitationLinks
│   │   │   └── SourceReferences
│   │   └── MessageSkeleton
│   └── EnhancedChatPanel
│       ├── MessageInput
│       ├── RecommendationBar
│       └── StatusIndicator
└── FloatingButton
```

## 🚀 Implementation

### EnhancedChatMessage Component

```typescript
// app/components/ChatWidget/components/EnhancedChatMessage.tsx
import React, { useState } from 'react';
import { Message, SourceReference } from '../types';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, FileText, Globe } from 'lucide-react';

interface EnhancedChatMessageProps {
  message: Message & {
    sources?: SourceReference[];
  };
  isLastMessage?: boolean;
}

export function EnhancedChatMessage({ 
  message, 
  isLastMessage 
}: EnhancedChatMessageProps) {
  const [showSources, setShowSources] = useState(false);
  const hasSources = message.sources && message.sources.length > 0;
  
  // Extract citations from message content
  const citationRegex = /\[(\d+)\]/g;
  const citations = message.content.match(citationRegex) || [];
  const uniqueCitations = [...new Set(citations)];
  
  return (
    <div className={`chat-message ${message.role}`}>
      <div className="message-content">
        {/* Render message with clickable citations */}
        <MessageWithCitations 
          content={message.content}
          sources={message.sources}
        />
      </div>
      
      {/* Source references section */}
      {hasSources && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSources(!showSources)}
            className="text-xs text-muted-foreground"
          >
            {showSources ? <ChevronUp /> : <ChevronDown />}
            <span className="ml-1">
              {uniqueCitations.length} source{uniqueCitations.length > 1 ? 's' : ''}
            </span>
          </Button>
          
          {showSources && (
            <div className="mt-2 space-y-2">
              {message.sources.map((source, index) => (
                <SourceCard 
                  key={source.id} 
                  source={source} 
                  index={index + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageWithCitations({ 
  content, 
  sources 
}: { 
  content: string; 
  sources?: SourceReference[] 
}) {
  if (!sources || sources.length === 0) {
    return <div dangerouslySetInnerHTML={{ __html: formatMessage(content) }} />;
  }
  
  // Replace citation numbers with interactive links
  const enhancedContent = content.replace(/\[(\d+)\]/g, (match, num) => {
    const index = parseInt(num) - 1;
    const source = sources[index];
    
    if (!source) return match;
    
    return `<a 
      href="#source-${num}" 
      class="citation-link"
      title="${source.fileName}"
      data-source-id="${source.id}"
    >${match}</a>`;
  });
  
  return <div dangerouslySetInnerHTML={{ __html: formatMessage(enhancedContent) }} />;
}

function SourceCard({ 
  source, 
  index 
}: { 
  source: SourceReference; 
  index: number 
}) {
  const isWebSource = source.metadata?.url;
  const Icon = isWebSource ? Globe : FileText;
  
  return (
    <div 
      id={`source-${index}`}
      className="source-card p-3 rounded-lg bg-muted/50 border"
    >
      <div className="flex items-start gap-2">
        <Icon className="w-4 h-4 mt-0.5 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            [{index}] {source.fileName}
          </div>
          {source.content && (
            <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {source.content}
            </div>
          )}
          {isWebSource && (
            <a 
              href={source.metadata.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline mt-1 inline-block"
            >
              View source →
            </a>
          )}
        </div>
        {source.similarity && (
          <div className="text-xs text-muted-foreground">
            {Math.round(source.similarity * 100)}% match
          </div>
        )}
      </div>
    </div>
  );
}
```

### EnhancedChatPanel Component

```typescript
// app/components/ChatWidget/components/EnhancedChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

interface EnhancedChatPanelProps {
  onSendMessage: (message: string) => void;
  onFileUpload?: (file: File) => void;
  isLoading?: boolean;
  placeholder?: string;
  recommendations?: string[];
  onRecommendationClick?: (recommendation: string) => void;
}

export function EnhancedChatPanel({
  onSendMessage,
  onFileUpload,
  isLoading,
  placeholder = "Type your message...",
  recommendations,
  onRecommendationClick
}: EnhancedChatPanelProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startRecording, stopRecording, isSupported } = useAudioRecorder();
  
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleRecommendationClick = (rec: string) => {
    setInput(rec);
    onRecommendationClick?.(rec);
    textareaRef.current?.focus();
  };
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  return (
    <div className="chat-panel">
      {/* Recommendations bar */}
      {recommendations && recommendations.length > 0 && (
        <div className="recommendations-bar">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {recommendations.map((rec, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleRecommendationClick(rec)}
                className="whitespace-nowrap text-xs"
              >
                {rec}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input area */}
      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="relative flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className="min-h-[44px] max-h-[200px] pr-10 resize-none"
              rows={1}
            />
            
            {/* File upload button */}
            {onFileUpload && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute bottom-1 right-1 h-8 w-8"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf,.txt,.md,.docx,.json';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) onFileUpload(file);
                  };
                  input.click();
                }}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          {/* Voice input button */}
          {isSupported && (
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={() => {
                if (isRecording) {
                  const text = stopRecording();
                  setInput(text);
                  setIsRecording(false);
                } else {
                  startRecording();
                  setIsRecording(true);
                }
              }}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
            </Button>
          )}
          
          {/* Send button */}
          <Button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
```

## 🎨 Styling

### Enhanced Chat Styles

```css
/* Enhanced message styles */
.chat-message {
  @apply p-4 rounded-lg;
}

.chat-message.user {
  @apply bg-primary text-primary-foreground ml-auto max-w-[80%];
}

.chat-message.assistant {
  @apply bg-muted mr-auto max-w-[90%];
}

/* Citation links */
.citation-link {
  @apply text-primary hover:underline cursor-pointer font-medium;
  @apply inline-flex items-center gap-0.5;
}

.citation-link:hover {
  @apply text-primary/80;
}

/* Source cards */
.source-card {
  @apply transition-all duration-200;
}

.source-card:hover {
  @apply bg-muted/70 shadow-sm;
}

/* Recommendations bar */
.recommendations-bar {
  @apply border-t p-3 bg-background/50 backdrop-blur-sm;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Loading skeleton */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.skeleton {
  @apply animate-pulse bg-muted rounded;
}
```

## 🔧 Configuration

### Widget Configuration for Enhanced Features

```typescript
interface EnhancedWidgetConfig {
  // Enable enhanced chat features
  enableCitations?: boolean;
  enableSources?: boolean;
  enableRecommendations?: boolean;
  enableVoiceInput?: boolean;
  enableFileUpload?: boolean;
  
  // Citation display
  citationStyle?: 'inline' | 'superscript' | 'brackets';
  citationColor?: string;
  
  // Source display
  sourcePosition?: 'inline' | 'bottom' | 'sidebar';
  sourcePreviewLength?: number;
  
  // Recommendations
  recommendationCount?: number;
  recommendationRefreshInterval?: number;
  
  // Performance
  messageChunkSize?: number;
  streamingEnabled?: boolean;
}

// Default configuration
const defaultConfig: EnhancedWidgetConfig = {
  enableCitations: true,
  enableSources: true,
  enableRecommendations: true,
  enableVoiceInput: true,
  enableFileUpload: false,
  
  citationStyle: 'brackets',
  citationColor: 'oklch(var(--primary))',
  
  sourcePosition: 'inline',
  sourcePreviewLength: 150,
  
  recommendationCount: 3,
  recommendationRefreshInterval: 300000, // 5 minutes
  
  messageChunkSize: 100,
  streamingEnabled: true
};
```

## 📱 Mobile Optimization

### Responsive Design Considerations

```typescript
// Mobile-specific chat panel adjustments
const MobileChatPanel = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');
  
  return (
    <div className={cn(
      "chat-panel",
      isMobile && "fixed inset-x-0 bottom-0 p-2 bg-background/95 backdrop-blur-lg"
    )}>
      {/* Simplified mobile UI */}
      {isMobile ? (
        <MobileOptimizedInput />
      ) : (
        <EnhancedChatPanel />
      )}
    </div>
  );
};

// Touch-optimized interactions
const TouchOptimizedMessage = ({ message }: { message: Message }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <div
      className="chat-message"
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
    >
      <div className={cn(
        "message-content",
        !expanded && "line-clamp-3"
      )}>
        {message.content}
      </div>
      
      {message.sources && expanded && (
        <SourceList sources={message.sources} />
      )}
    </div>
  );
};
```

## 🔍 Search Integration

### Source-Aware Search

```typescript
export function useSourceSearch(widgetId: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  
  const search = useCallback(async (term: string) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }
    
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgetId,
        query: term,
        includeMetadata: true
      })
    });
    
    const data = await response.json();
    setResults(data.results);
  }, [widgetId]);
  
  useEffect(() => {
    const debounced = debounce(search, 300);
    debounced(searchTerm);
  }, [searchTerm, search]);
  
  return { searchTerm, setSearchTerm, results };
}
```

## 🎭 Animation & Transitions

### Smooth Message Animations

```typescript
import { motion, AnimatePresence } from 'framer-motion';

export function AnimatedMessageList({ messages }: { messages: Message[] }) {
  return (
    <AnimatePresence initial={false}>
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.05
          }}
        >
          <EnhancedChatMessage 
            message={message}
            isLastMessage={index === messages.length - 1}
          />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
```

## 🚀 Performance Optimizations

### Message Virtualization

```typescript
import { FixedSizeList as List } from 'react-window';

export function VirtualizedMessageList({ 
  messages,
  height 
}: { 
  messages: Message[];
  height: number;
}) {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <EnhancedChatMessage message={messages[index]} />
    </div>
  );
  
  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={100} // Estimated average height
      width="100%"
      overscanCount={5}
    >
      {Row}
    </List>
  );
}
```

## 🔒 Security Considerations

### Content Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeMessageContent(content: string): string {
  // Configure DOMPurify
  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false
  };
  
  // Sanitize content
  const clean = DOMPurify.sanitize(content, config);
  
  // Additional safety for citations
  return clean.replace(/\[(\d+)\]/g, (match, num) => {
    const safeNum = parseInt(num);
    if (safeNum > 0 && safeNum <= 100) {
      return match;
    }
    return '';
  });
}
```

---

For more information:
- [Chat Components Documentation](../UI/CHAT-COMPONENTS.md)
- [Message Persistence](./MESSAGE-PERSISTENCE.md)
- [RAG Pipeline](../ARCHITECTURE/RAG-PIPELINE.md)