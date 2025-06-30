import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { FileText, ChevronDown, ChevronUp, Globe, Maximize2, Minimize2 } from "lucide-react";
import type { Message } from "../types";

interface ChatMessageProps {
  message: Message;
  avatarUrl?: string;
  onSourceClick?: () => void;
}

export function ChatMessage({ message, avatarUrl, onSourceClick }: ChatMessageProps) {
  const sourcesRef = useRef<HTMLDivElement>(null);
  const [processedContent, setProcessedContent] = useState<string>("");
  const [showSources, setShowSources] = useState(false);
  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [referencedSources, setReferencedSources] = useState<Set<number>>(new Set());
  const [expandedSources, setExpandedSources] = useState<Set<number>>(new Set());
  const sourceRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  // Process content to convert [n] citations to clickable elements and track referenced sources
  useEffect(() => {
    if (message.role === "assistant" && message.sources && message.sources.length > 0) {
      const referenced = new Set<number>();
      
      // Replace [n] patterns with markdown links and track which sources are referenced
      const processed = message.content.replace(/\[(\d+(?:,\d+)*)\]/g, (match, nums) => {
        // Split comma-separated numbers and add to referenced set
        nums.split(',').forEach((num: string) => {
          const sourceIndex = parseInt(num.trim()) - 1; // Convert to 0-based index
          if (sourceIndex >= 0 && sourceIndex < message.sources!.length) {
            referenced.add(sourceIndex);
          }
        });
        return `[${nums}](#cite-${nums})`;
      });
      
      setProcessedContent(processed);
      setReferencedSources(referenced);
      
      // Debug log
      console.log('[ChatMessage] Message content:', message.content);
      console.log('[ChatMessage] Citation matches found:', message.content.match(/\[(\d+(?:,\d+)*)\]/g));
      console.log('[ChatMessage] Referenced sources:', Array.from(referenced), 'Total sources:', message.sources.length);
      
      // If no citations found but sources exist, log a warning
      if (referenced.size === 0 && message.sources.length > 0) {
        console.warn('[ChatMessage] No citations found in message but sources exist! Message may not contain [n] format citations.');
      }
    } else {
      setProcessedContent(message.content);
      setReferencedSources(new Set());
    }
  }, [message.content, message.role, message.sources]);
  
  // Handle citation clicks - show sources, highlight, and scroll to them
  const handleCitationClick = (citation: string) => {
    setShowSources(true);
    
    // Get the first number from the citation (in case of comma-separated)
    const firstNum = citation.split(',')[0];
    const sourceIndex = parseInt(firstNum) - 1; // Convert to 0-based index
    
    if (sourceIndex >= 0 && sourceIndex < (message.sources?.length || 0)) {
      setHighlightedSource(sourceIndex);
      
      // Scroll to the specific source
      setTimeout(() => {
        const sourceEl = sourceRefs.current[sourceIndex];
        if (sourceEl) {
          sourceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      // Remove highlight after 2 seconds
      setTimeout(() => {
        setHighlightedSource(null);
      }, 2000);
    }
    
    if (onSourceClick) {
      onSourceClick();
    }
  };

  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} gap-2`}>
      {/* Assistant Avatar */}
      {message.role === "assistant" && (
        <div className="flex-shrink-0">
          <img 
            src={avatarUrl || '/websyte-ai-logo.svg'} 
            alt="AI Assistant"
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
      
      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}>
        <div
          className={`max-w-[80%] p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-600 text-white"
              : "text-gray-800"
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
            <span>Sources ({referencedSources.size} of {message.sources.length} referenced)</span>
            {showSources ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          
          {/* Collapsible sources list */}
          {showSources && (
            <div className="space-y-2">
              {referencedSources.size === 0 ? (
                <div className="text-xs text-gray-500 italic p-2 bg-yellow-50 border border-yellow-200 rounded">
                  Note: This message contains sources but no citations. All {message.sources.length} sources are shown below.
                </div>
              ) : null}
              {message.sources
                .map((source, index) => ({ source, originalIndex: index }))
                .filter(({ originalIndex }) => referencedSources.size === 0 || referencedSources.has(originalIndex))
                .map(({ source, originalIndex }) => {
                  const isHighlighted = highlightedSource === originalIndex;
                  const isExpanded = expandedSources.has(originalIndex);
                  
                  return (
                    <div 
                      key={originalIndex} 
                      ref={el => {
                        sourceRefs.current[originalIndex] = el;
                      }}
                      className={`border rounded-lg p-2 text-xs transition-all duration-300 ${
                        isHighlighted 
                          ? 'bg-blue-100 border-blue-400 shadow-md' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                  <div className={`flex items-center justify-between gap-2 ${isExpanded ? 'mb-1' : ''}`}>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="font-semibold text-blue-600">[{originalIndex + 1}]</span>
                      {(source.metadata.url || source.metadata.crawledFrom) ? (
                        <a
                          href={source.metadata.url || source.metadata.crawledFrom}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors truncate"
                          title={source.metadata.url || source.metadata.crawledFrom}
                        >
                          <Globe className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {(() => {
                              const url = source.metadata.url || source.metadata.crawledFrom || '';
                              try {
                                const urlObj = new URL(url);
                                return urlObj.hostname + (urlObj.pathname !== '/' ? urlObj.pathname : '');
                              } catch {
                                return url;
                              }
                            })()}
                          </span>
                        </a>
                      ) : (
                        <>
                          <FileText className="w-3 h-3" />
                          {source.metadata.title ? (
                            <span className="text-gray-600 font-medium truncate">{source.metadata.title}</span>
                          ) : source.metadata.source ? (
                            <span className="text-gray-600 truncate">{source.metadata.source}</span>
                          ) : null}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Chunk #{source.metadata.chunkIndex + 1}</span>
                      <button
                        onClick={() => {
                          setExpandedSources(prev => {
                            const newSet = new Set(prev);
                            if (newSet.has(originalIndex)) {
                              newSet.delete(originalIndex);
                            } else {
                              newSet.add(originalIndex);
                            }
                            return newSet;
                          });
                        }}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <Minimize2 className="w-3 h-3" />
                        ) : (
                          <Maximize2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="text-gray-700 leading-relaxed max-h-[300px] overflow-y-auto whitespace-pre-wrap mt-2">
                      {source.chunk}
                    </div>
                  )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}