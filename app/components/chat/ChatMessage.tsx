import { useState } from "react";
import { marked } from "marked";
import { ChevronDown, ChevronUp, FileText, Search } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessageProps {
  message: ChatMessageType;
  showSources?: boolean;
  showDebug?: boolean;
}

export function ChatMessage({ message, showSources = true, showDebug = false }: ChatMessageProps) {
  const [showSourcesExpanded, setShowSourcesExpanded] = useState(false);
  
  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
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
            <div 
              className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
              dangerouslySetInnerHTML={renderMarkdown(message.content)}
            />
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
          <div className="space-y-2">
            <Button
              onClick={() => setShowSourcesExpanded(!showSourcesExpanded)}
              variant="ghost"
              size="sm"
              className="h-auto py-1 px-2 text-gray-600 hover:text-gray-800"
            >
              <Search className="w-4 h-4" />
              <span>{message.sources.length} source{message.sources.length !== 1 ? 's' : ''} retrieved</span>
              {showSourcesExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            {showSourcesExpanded && (
              <div className="space-y-2">
                {message.sources.map((source, index) => (
                  <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        {source.metadata.source && (
                          <span className="font-medium">{source.metadata.source}</span>
                        )}
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
            )}
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