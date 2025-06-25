import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import type { Message } from "../types";

interface ChatMessageProps {
  message: Message;
  onSourceClick?: () => void;
}

export function ChatMessage({ message, onSourceClick }: ChatMessageProps) {
  const sourcesRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [showSources, setShowSources] = useState(false);
  
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
  
  // Handle citation clicks - show sources and scroll to them
  const handleCitationClick = (citation: string) => {
    setShowSources(true);
    setTimeout(() => {
      if (sourcesRef.current) {
        sourcesRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
    if (onSourceClick) {
      onSourceClick();
    }
  };

  return (
    <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
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
                          className="text-blue-600 hover:text-blue-800 no-underline font-normal cursor-pointer"
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
        <p className={`text-xs mt-1 ${
          message.role === "user" ? "text-blue-100" : "text-gray-500"
        }`}>
          {message.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </p>
      </div>
      
      {/* Sources Section - Now positioned under the message */}
      {message.role === "assistant" && message.sources && message.sources.length > 0 && (
        <div className="mt-2 max-w-[80%] w-full" ref={sourcesRef}>
          {/* Toggle button */}
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-800 transition-colors font-medium mb-2"
          >
            <FileText className="w-3 h-3" />
            <span>Sources ({message.sources.length})</span>
            {showSources ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          
          {/* Collapsible sources list */}
          {showSources && (
            <div className="space-y-2">
              {message.sources.map((source, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-blue-600">[{index + 1}]</span>
                    {source.metadata.source && (
                      <span className="text-gray-600">{source.metadata.source}</span>
                    )}
                  </div>
                  <div className="text-gray-700 leading-relaxed">
                    {source.chunk.length > 150 
                      ? `${source.chunk.substring(0, 150)}...` 
                      : source.chunk
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}