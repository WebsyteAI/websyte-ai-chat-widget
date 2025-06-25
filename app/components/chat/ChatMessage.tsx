import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { FileText, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessageProps {
  message: ChatMessageType;
  showSources?: boolean;
  showDebug?: boolean;
}

export function ChatMessage({ message, showSources = true, showDebug = false }: ChatMessageProps) {
  const sourcesRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<string>("");
  
  // Process content to convert [n] citations to clickable elements
  useEffect(() => {
    if (message.role === "assistant" && message.sources && message.sources.length > 0) {
      // Replace [n] patterns with markdown links that will be handled by our custom renderer
      const processed = message.content.replace(/\[(\d+(?:,\d+)*)\]/g, (match, nums) => {
        return `[${nums}](#cite-${nums})`;
      });
      setProcessedContent(processed);
    } else {
      setProcessedContent(message.content);
    }
  }, [message.content, message.role, message.sources]);
  
  // Handle citation clicks - scroll to sources
  const handleCitationClick = (citation: string) => {
    if (sourcesRef.current) {
      sourcesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };
  

  const formatSimilarity = (similarity: number): string => {
    return `${Math.round(similarity * 100)}%`;
  };

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[85%] ${message.role === "user" ? "" : "space-y-3"}`}>
        {/* Message Content */}
        <div
          className={`p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {message.role === "assistant" ? (
            <div className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  a: ({ href, children }) => {
                    // Handle citation links
                    if (href?.startsWith('#cite-')) {
                      const citation = href.replace('#cite-', '');
                      return (
                        <sup>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCitationClick(citation);
                            }}
                            className="text-blue-600 hover:text-blue-800 no-underline font-normal"
                            title="Click to view source"
                          >
                            [{children}]
                          </a>
                        </sup>
                      );
                    }
                    // Regular links
                    return (
                      <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                        {children}
                      </a>
                    );
                  },
                }}
              >
                {processedContent}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
          
          {/* Timestamp and metadata */}
          <div className={`flex items-center justify-between mt-2 text-xs ${
            message.role === "user" ? "text-blue-100" : "text-gray-500"
          }`}>
            <span>{formatTimestamp(message.timestamp)}</span>
            {message.metadata?.responseTime && (
              <span>
                {message.metadata.responseTime}ms
              </span>
            )}
          </div>
        </div>

        {/* Sources Section */}
        {message.role === "assistant" && message.sources && message.sources.length > 0 && showSources && (
          <div className="space-y-2" ref={sourcesRef}>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Search className="w-4 h-4" />
              <span className="font-medium">Sources</span>
            </div>
            
            <div className="space-y-2">
              {message.sources.map((source, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        {source.metadata.source && (
                          <span className="font-medium">{source.metadata.source}</span>
                        )}
                        <span className="font-semibold text-blue-600">[{index + 1}]</span>
                        <span>Chunk #{source.metadata.chunkIndex + 1}</span>
                      </div>
                      <Badge 
                        variant={source.similarity > 0.8 ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {formatSimilarity(source.similarity)} match
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {source.chunk.length > 200 
                        ? `${source.chunk.substring(0, 200)}...` 
                        : source.chunk
                      }
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Debug Information */}
        {message.role === "assistant" && message.metadata?.debug && showDebug && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
            <div className="text-xs text-yellow-800 space-y-1">
              <div>Similarity threshold: {message.metadata.debug.similarityThreshold}</div>
              <div>Max chunks: {message.metadata.debug.maxChunks}</div>
              <div>Retrieved chunks: {message.metadata.debug.actualChunks}</div>
              {message.metadata.tokenCount && (
                <div>Tokens: {message.metadata.tokenCount}</div>
              )}
              {message.metadata.model && (
                <div>Model: {message.metadata.model}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}