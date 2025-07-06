import { useState, useRef, useEffect, Fragment } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { FileText, ChevronDown, ChevronUp, Globe, Maximize2, Minimize2 } from "lucide-react";
import type { Message } from "../types";
import { parseComponentSyntax, renderComponent } from "../component-registry";
import type { ComponentRegistry } from "../component-registry";

interface EnhancedChatMessageProps {
  message: Message;
  avatarUrl?: string;
  onSourceClick?: () => void;
  componentRegistry?: ComponentRegistry;
  enableComponents?: boolean;
  fullWidth?: boolean;
}

export function EnhancedChatMessage({ 
  message, 
  avatarUrl, 
  onSourceClick,
  componentRegistry,
  enableComponents = false,
  fullWidth = false
}: EnhancedChatMessageProps) {
  const sourcesRef = useRef<HTMLDivElement>(null);
  // Initialize with message content to prevent empty flash
  const [processedContent, setProcessedContent] = useState<string>(message.content);
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
    } else {
      setProcessedContent(message.content);
      setReferencedSources(new Set());
    }
  }, [message.content, message.role, message.sources]);
  
  // Handle citation clicks
  const handleCitationClick = (citation: string) => {
    setShowSources(true);
    
    const firstNum = citation.split(',')[0];
    const sourceIndex = parseInt(firstNum) - 1;
    
    if (sourceIndex >= 0 && sourceIndex < (message.sources?.length || 0)) {
      setHighlightedSource(sourceIndex);
      
      setTimeout(() => {
        const sourceEl = sourceRefs.current[sourceIndex];
        if (sourceEl) {
          sourceEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      setTimeout(() => {
        setHighlightedSource(null);
      }, 2000);
    }
    
    if (onSourceClick) {
      onSourceClick();
    }
  };

  // Custom component renderer for markdown
  const MarkdownComponents = {
    p: ({ children }: any) => {
      // Check if this paragraph contains only a component syntax
      if (typeof children === 'string' && enableComponents && componentRegistry) {
        const parsed = parseComponentSyntax(children);
        if (parsed) {
          const component = renderComponent(parsed.componentName, parsed.props, componentRegistry);
          if (component) {
            return <Fragment>{component}</Fragment>;
          }
        }
      }
      return <p>{children}</p>;
    },
    a: ({ href, children }: any) => {
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
  };

  return (
    <div className={`${message.role === "user" ? "flex justify-end" : ""}`}>
      <div className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"} ${fullWidth ? "w-full" : "max-w-[80%]"}`}>
        {/* Assistant Avatar */}
        {message.role === "assistant" && (
          <div className="mb-2 px-3">
            <img 
              src={avatarUrl || 'https://websyte.ai/websyte-ai-logo.svg'} 
              alt="AI Assistant"
              className="w-6 h-6 rounded-full"
            />
          </div>
        )}
        
        <div
          className={`p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-600 text-white"
              : "text-gray-800"
          } ${fullWidth && message.role === "assistant" ? "w-full" : ""}`}
        >
        {message.role === "assistant" ? (
          <div className="text-base prose prose-base max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-p:leading-relaxed">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={MarkdownComponents}
            >
              {processedContent}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-base whitespace-pre-wrap">{message.content}</p>
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
        
        {/* Sources Section */}
        {message.role === "assistant" && message.sources && message.sources.length > 0 && (
          <div className="mt-2 px-3" ref={sourcesRef}>
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
          
          {showSources && (
            <div className="space-y-2">
              {referencedSources.size === 0 && (
                <div className="text-xs text-gray-500 italic p-2 bg-yellow-50 border border-yellow-200 rounded">
                  Note: This message contains sources but no citations. All {message.sources.length} sources are shown below.
                </div>
              )}
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
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-semibold text-blue-600 flex-shrink-0">[{originalIndex + 1}]</span>
                      {(source.metadata.url || source.metadata.crawledFrom) ? (
                        <a
                          href={source.metadata.url || source.metadata.crawledFrom}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors min-w-0"
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
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          {source.metadata.title ? (
                            <span className="text-gray-600 font-medium truncate">{source.metadata.title}</span>
                          ) : source.metadata.source ? (
                            <span className="text-gray-600 truncate">{source.metadata.source}</span>
                          ) : null}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-500 whitespace-nowrap">Chunk #{source.metadata.chunkIndex + 1}</span>
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