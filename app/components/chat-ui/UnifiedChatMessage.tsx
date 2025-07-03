import { useState, useCallback, useRef, useEffect } from "react";
import { User, Bot, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { UnifiedChatMessageProps } from "./types";

export function UnifiedChatMessage({
  message,
  enhanced = false,
  showSources = true,
  showDebug = false,
  showTimestamp = true,
  fullWidth = false,
  componentRegistry,
  enableComponents = false,
  onSourceClick,
}: UnifiedChatMessageProps) {
  const [expandedSources, setExpandedSources] = useState(false);
  const [highlightedSourceId, setHighlightedSourceId] = useState<string | null>(null);
  const sourceRefs = useRef<Record<string, HTMLDivElement>>({});
  
  const isUser = message.role === "user";
  const hasSources = message.sources && message.sources.length > 0;
  
  const handleCitationClick = useCallback((sourceIndex: number) => {
    if (!message.sources) return;
    
    const source = message.sources[sourceIndex];
    if (!source) return;
    
    setExpandedSources(true);
    setHighlightedSourceId(source.id);
    onSourceClick?.(source.id);
    
    setTimeout(() => {
      sourceRefs.current[source.id]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
    
    setTimeout(() => {
      setHighlightedSourceId(null);
    }, 2000);
  }, [message.sources, onSourceClick]);
  
  const processContent = (content: string) => {
    if (!enhanced || !message.sources) return content;
    
    return content.replace(/\[(\d+)\]/g, (match, num) => {
      const index = parseInt(num) - 1;
      if (index >= 0 && index < message.sources!.length) {
        return `<citation data-index="${index}">[${num}]</citation>`;
      }
      return match;
    });
  };
  
  const renderEnhancedContent = () => {
    const processedContent = processContent(message.content);
    
    return (
      <div className="prose prose-base max-w-none">
        <ReactMarkdown
        components={enhanced ? {
          citation: ({ "data-index": dataIndex, children }: any) => {
            const index = parseInt(dataIndex);
            return (
              <button
                onClick={() => handleCitationClick(index)}
                className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors mx-0.5"
              >
                {children}
              </button>
            );
          },
          ...(enableComponents && componentRegistry ? componentRegistry : {}),
        } : (enableComponents && componentRegistry ? componentRegistry : undefined) as any}
        rehypePlugins={enhanced ? [
          [
            () => (tree: any) => {
              const visit = (node: any) => {
                if (node.type === "element" && node.tagName === "citation") {
                  node.tagName = "citation";
                }
                if (node.children) {
                  node.children.forEach(visit);
                }
              };
              visit(tree);
            },
          ],
        ] : []}
      >
          {processedContent}
        </ReactMarkdown>
      </div>
    );
  };
  
  const renderBasicContent = () => {
    if (message.content.includes("```") || message.content.includes("**") || message.content.includes("##")) {
      return (
        <div className="prose prose-base max-w-none">
          <ReactMarkdown>
            {message.content}
          </ReactMarkdown>
        </div>
      );
    }
    
    return (
      <div className="whitespace-pre-wrap">
        {message.content}
      </div>
    );
  };
  
  const avatarClass = cn(
    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
    isUser ? "bg-gray-600" : "bg-blue-500"
  );
  
  const messageClass = cn(
    "flex gap-3",
    fullWidth ? "max-w-none" : "max-w-3xl mx-auto",
    isUser ? "flex-row-reverse" : "flex-row"
  );
  
  const contentClass = cn(
    "flex-1 space-y-2",
    isUser && "flex flex-col items-end"
  );
  
  const bubbleClass = cn(
    "inline-block rounded-lg px-4 py-2",
    isUser 
      ? "bg-gray-100 text-gray-900" 
      : "bg-white border border-gray-200 text-gray-900"
  );
  
  return (
    <div className={messageClass}>
      <div className={avatarClass}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={contentClass}>
        <div className={bubbleClass}>
          {enhanced ? renderEnhancedContent() : renderBasicContent()}
        </div>
        
        {showTimestamp && message.timestamp && (
          <div className={cn("text-xs text-gray-500", isUser && "text-right")}>
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        )}
        
        {showDebug && message.debug && (
          <div className="text-xs text-gray-500 space-y-1 bg-gray-50 rounded p-2 mt-2">
            {message.debug.model && (
              <div>Model: {message.debug.model}</div>
            )}
            {message.debug.ragMode !== undefined && (
              <div>RAG Mode: {message.debug.ragMode ? "Enabled" : "Disabled"}</div>
            )}
            {message.debug.searchResults !== undefined && (
              <div>Search Results: {message.debug.searchResults}</div>
            )}
            {message.debug.processingTime !== undefined && (
              <div>Processing Time: {message.debug.processingTime}ms</div>
            )}
          </div>
        )}
        
        {showSources && hasSources && !isUser && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedSources(!expandedSources)}
              className="h-auto p-1 text-xs text-gray-600 hover:text-gray-800"
            >
              {expandedSources ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
              {message.sources!.length} source{message.sources!.length > 1 ? "s" : ""}
            </Button>
            
            {expandedSources && (
              <div className="mt-2 space-y-2">
                {message.sources!.map((source, index) => (
                  <div
                    key={source.id}
                    ref={(el) => {
                      if (el) sourceRefs.current[source.id] = el;
                    }}
                    className={cn(
                      "p-3 bg-gray-50 rounded-lg text-base transition-all duration-300",
                      highlightedSourceId === source.id && "ring-2 ring-blue-400 bg-blue-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900">
                          [{index + 1}] {source.title}
                        </div>
                        <div className="text-gray-600 text-xs mt-1 truncate">
                          {source.url}
                        </div>
                        {source.chunkIndex !== undefined && (
                          <div className="text-gray-500 text-xs mt-1">
                            Chunk {source.chunkIndex + 1}
                          </div>
                        )}
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="mt-2 text-gray-700 text-xs line-clamp-3">
                      {source.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}