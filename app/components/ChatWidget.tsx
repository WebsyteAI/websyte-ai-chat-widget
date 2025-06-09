import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Minimize2, FileText, Headphones, MessageCircle, Play, Pause, X, SkipBack, SkipForward, ChevronDown } from "lucide-react";
import { marked } from "marked";
import { ContentExtractor } from "../lib/content-extractor";
import { useChatMessages } from "./ChatWidget/hooks/useChatMessages";
import { useAudioPlayer } from "./ChatWidget/hooks/useAudioPlayer";
import { useContentSummarization } from "./ChatWidget/hooks/useContentSummarization";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  apiEndpoint?: string;
  baseUrl?: string;
  contentTarget: string;
  advertiserName?: string;
  advertiserLogo?: string;
  isTargetedInjection?: boolean;
}

interface Recommendation {
  title: string;
  description: string;
}

interface Summaries {
  short: string;
  medium: string;
}

type ContentMode = 'original' | 'short' | 'medium';

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function ChatWidget({ apiEndpoint = "/api/chat", baseUrl = "", contentTarget, advertiserName = "Nativo", advertiserLogo, isTargetedInjection = false }: ChatWidgetProps) {
  const [currentView, setCurrentView] = useState<"main" | "chat">("main");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [placeholder, setPlaceholder] = useState("Ask me about this content");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentContent, setCurrentContent] = useState<"action" | "audio">("action");
  const [contentFadeClass, setContentFadeClass] = useState("");
  const [hasRendered, setHasRendered] = useState(false);
  const [showSummaryDropdown, setShowSummaryDropdown] = useState(false);
  
  // Extracted hooks for business logic
  const { messages, addMessage, clearMessages } = useChatMessages();
  const {
    isPlaying,
    audioProgress,
    playbackSpeed,
    elapsedTime,
    totalTime,
    handlePlayPause,
    handleSpeedChange,
    formatTime,
    setAudioProgress
  } = useAudioPlayer(180);
  const {
    summaries,
    isLoadingSummaries,
    currentContentMode,
    originalContent,
    targetElement,
    mainContentElement,
    setOriginalContent,
    setTargetElement,
    setMainContentElement,
    handleContentModeChange: handleContentModeChangeHook,
    loadSummaries
  } = useContentSummarization({ 
    baseUrl, 
    extractPageContent: () => ContentExtractor.extractPageContent(contentTarget) 
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

  const handleContentModeChange = (mode: ContentMode) => {
    handleContentModeChangeHook(mode);
    setShowSummaryDropdown(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSummaryDropdown && dropdownRef.current) {
        const target = event.target as Element;
        if (!dropdownRef.current.contains(target)) {
          console.log('Clicking outside dropdown, closing');
          setShowSummaryDropdown(false);
        }
      }
    };

    // Use click instead of mousedown to allow onClick handlers to fire first
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSummaryDropdown]);

  useEffect(() => {
    // Trigger slide-in animation after component mounts
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Warm cache, capture original content, and load all data in parallel
    const loadInitialData = async () => {
      setIsLoadingRecommendations(true);
      
      try {
        // Warm the cache first to ensure subsequent calls are fast
        await ContentExtractor.warmCache(contentTarget);
        
        const pageContent = await extractPageContent();
        
        // Find target element for selector analysis
        const selectors = contentTarget.split(',').map(s => s.trim());
        let targetElement: Element | null = null;
        
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            targetElement = element;
            setTargetElement(element);
            break;
          }
        }
        
        if (!targetElement) {
          console.warn('No content element found with any of the selectors:', selectors);
          return;
        }
        
        const html = targetElement.outerHTML;
        
        // Run selector analysis, recommendations, and summaries in parallel
        const [selectorResponse, recommendationsResponse, summariesResponse] = await Promise.all([
          fetch(`${baseUrl}/api/analyze-selector`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              html,
              title: pageContent.title,
              url: pageContent.url
            }),
          }),
          fetch(`${baseUrl}/api/recommendations`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: pageContent.content,
              url: pageContent.url,
              title: pageContent.title,
            }),
          }),
          fetch(`${baseUrl}/api/summaries`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: pageContent.content,
              url: pageContent.url,
              title: pageContent.title,
            }),
          })
        ]);

        // Handle selector analysis response
        if (selectorResponse.ok) {
          const analysis = await selectorResponse.json() as { contentSelector: string; reasoning: string };
          console.log('AI analysis result:', analysis);
          
          // Try to find element with AI-generated selector
          const aiSelectedElement = targetElement.querySelector(analysis.contentSelector);
          if (aiSelectedElement) {
            console.log('AI-generated selector found element:', aiSelectedElement);
            setMainContentElement(aiSelectedElement);
            setOriginalContent(aiSelectedElement.innerHTML);
          } else {
            console.log('AI-generated selector failed, falling back to full element');
            setMainContentElement(targetElement);
            setOriginalContent(targetElement.innerHTML);
          }
        } else {
          console.warn('AI selector analysis failed, using fallback');
          setMainContentElement(targetElement);
          setOriginalContent(targetElement.innerHTML);
        }

        // Handle recommendations response
        if (recommendationsResponse.ok) {
          const data = await recommendationsResponse.json() as { recommendations?: Recommendation[]; placeholder?: string };
          setRecommendations(data.recommendations || []);
          setPlaceholder(data.placeholder || "Ask me about this content");
        } else {
          throw new Error(`Recommendations API error: ${recommendationsResponse.status}`);
        }

        // Handle summaries response
        if (summariesResponse.ok) {
          const summariesData = await summariesResponse.json() as { short?: string; medium?: string };
          if (summariesData.short && summariesData.medium) {
            // Update the hook with the fetched summaries
            loadSummaries({
              short: summariesData.short,
              medium: summariesData.medium
            });
          }
        } else {
          console.warn('Summaries API failed, but continuing without summaries');
        }

      } catch (error) {
        console.error("Failed to load initial data:", error);
        // No fallback recommendations - leave empty if content extraction fails
        setRecommendations([]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    loadInitialData();
  }, [contentTarget]);

  const extractPageContent = async () => {
    // This will use cached content if available, otherwise extract fresh content
    return await ContentExtractor.extractPageContent(contentTarget);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = addMessage({
      role: "user",
      content: inputValue.trim(),
    });
    setInputValue("");
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const pageContent = await extractPageContent();
      
      const response = await fetch(`${baseUrl}${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          context: pageContent,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json() as { message?: string };
      
      addMessage({
        role: "assistant",
        content: data.message || "Sorry, I couldn't process your request.",
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        addMessage({
          role: "assistant",
          content: "Message cancelled.",
        });
      } else {
        console.error("Error sending message:", error);
        addMessage({
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const handleExitAudio = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsPlaying(false);
    setContentFadeClass("animate-fade-out");
    
    // After fade out, switch content and container size simultaneously
    setTimeout(() => {
      setCurrentContent("action");
      setAudioProgress(0);
      setElapsedTime(0);
      
      // Start fade in slightly after container starts resizing for smoother feel
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 180);
    }, 200);
  };

  const handleStartAudio = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setContentFadeClass("animate-fade-out");
    
    // After fade out, switch content and container size simultaneously
    setTimeout(() => {
      setCurrentContent("audio");
      
      // Start fade in slightly after container starts resizing for smoother feel
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 100);
    }, 200);
  };

  return (
    <>
      {/* Action Bar / Audio Player - Single Container */}
      <div className={`${isTargetedInjection ? 'relative top-0 left-0 mx-auto' : 'fixed top-4 left-1/2'} z-50 ${
        hasRendered ? (isTargetedInjection ? 'animate-fade-in' : 'animate-slide-in-from-top') : 'opacity-0 transform -translate-x-1/2'
      }`}>
        <div className={`bg-white/98 action-bar-blur shadow-lg border border-gray-300 px-4 py-2 flex flex-col gap-2 ${
          currentContent === "audio" ? 'container-audio' : 'container-action'
        } ${
          isPlaying ? 'animate-audio-border' : ''
        }`}>
          
          {/* Main Content Container with Fade Animation */}
          <div className={`flex items-center justify-center gap-3 w-full ${contentFadeClass}`}>
            
            {currentContent === "action" ? (
              <>
                {/* Action Bar Content */}
                <div className="flex items-center gap-3">
                  {advertiserLogo || (advertiserName === "Nativo") ? (
                    <>
                      <img 
                        src={advertiserLogo || `${baseUrl}/nativo-logo.png`} 
                        alt={advertiserName} 
                        className="w-8 h-8 rounded"
                      />
                      <span className="font-bold text-gray-800 text-base">AI</span>
                    </>
                  ) : (
                    <span className="font-bold text-gray-800 text-base">{advertiserName} AI</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Summarization Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Dropdown toggled, current state:', showSummaryDropdown, 'summaries:', summaries);
                        setShowSummaryDropdown(!showSummaryDropdown);
                      }}
                      disabled={isLoadingSummaries || isTransitioning}
                      className="action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      title="Content display options"
                    >
                      <FileText size={18} className="text-gray-600 group-hover:text-gray-800" />
                      <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">
                        Summarize Content
                      </span>
                      <ChevronDown size={16} className={`text-gray-600 group-hover:text-gray-800 transition-transform ${showSummaryDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {/* Dropdown Menu */}
                    {showSummaryDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Original button clicked');
                            handleContentModeChange('original');
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${currentContentMode === 'original' ? 'bg-gray-50 font-medium' : ''}`}
                        >
                          Original
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Short button clicked, summaries:', summaries);
                            handleContentModeChange('short');
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${!summaries?.short ? 'opacity-50' : ''} ${currentContentMode === 'short' ? 'bg-gray-50 font-medium' : ''}`}
                        >
                          Short {!summaries?.short && '(no summary)'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Medium button clicked, summaries:', summaries);
                            handleContentModeChange('medium');
                          }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${!summaries?.medium ? 'opacity-50' : ''} ${currentContentMode === 'medium' ? 'bg-gray-50 font-medium' : ''}`}
                        >
                          Medium {!summaries?.medium && '(no summary)'}
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleStartAudio}
                    disabled={isTransitioning}
                    className="action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50"
                    title="Audio Version"
                  >
                    <Headphones size={18} className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">Audio Version</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentView(currentView === "chat" ? "main" : "chat")}
                    disabled={isTransitioning}
                    className={`action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50 ${currentView === "chat" ? "bg-gray-100" : ""}`}
                    title="Ask Questions"
                  >
                    <MessageCircle size={18} className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">Ask Questions</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Audio Player Content */}
                <button
                  onClick={handlePlayPause}
                  disabled={isTransitioning}
                  className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-sm transition-colors disabled:opacity-50"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} className="text-gray-700" /> : <Play size={20} className="text-gray-700" />}
                </button>

                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono min-w-fit">
                    {formatTime(elapsedTime)}/{formatTime(totalTime)}
                  </span>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioProgress}
                      onChange={(e) => setAudioProgress(Number(e.target.value))}
                      disabled={isTransitioning}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSpeedChange}
                  disabled={isTransitioning}
                  className="bg-white hover:bg-gray-50 px-2 py-1 rounded text-sm font-medium text-gray-700 transition-colors shadow-sm disabled:opacity-50"
                  title="Playback speed"
                >
                  {playbackSpeed}x
                </button>

                <button
                  onClick={handleExitAudio}
                  disabled={isTransitioning}
                  className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-sm transition-colors disabled:opacity-50"
                  title="Exit audio player"
                >
                  <X size={18} className="text-gray-700" />
                </button>
              </>
            )}
          </div>
          
          {/* Recommendations Row - Only show in action mode and when recommendations are available */}
          {currentContent === "action" && recommendations.length > 0 && (
            <div className={`flex items-center gap-2 w-full overflow-x-auto ${contentFadeClass}`}>
              <div className="flex items-center gap-2 min-w-fit">
                {isLoadingRecommendations ? (
                  // Loading state for recommendations
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-gray-100 rounded-lg px-3 py-1.5 animate-pulse">
                      <div className="h-3 bg-gray-300 rounded w-20"></div>
                    </div>
                  ))
                ) : (
                  recommendations.slice(0, 4).map((rec, index) => (
                    <button
                      key={index}
                      onClick={async () => {
                        setCurrentView("chat");
                        
                        // Send the message directly with the recommendation text
                        if (isLoading) return;

                        addMessage({
                          role: "user",
                          content: rec.title,
                        });
                        setInputValue("");
                        setIsLoading(true);

                        const controller = new AbortController();
                        setAbortController(controller);

                        try {
                          const pageContent = await extractPageContent();
                          
                          const response = await fetch(`${baseUrl}${apiEndpoint}`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              message: rec.title,
                              history: messages.slice(-10),
                              context: pageContent,
                            }),
                            signal: controller.signal,
                          });

                          if (!response.ok) {
                            throw new Error("Failed to send message");
                          }

                          const data = await response.json() as { message?: string };
                          
                          addMessage({
                            role: "assistant",
                            content: data.message || "Sorry, I couldn't process your request.",
                          });
                        } catch (error) {
                          if (error instanceof Error && error.name === 'AbortError') {
                            addMessage({
                              role: "assistant",
                              content: "Message cancelled.",
                            });
                          } else {
                            console.error("Error sending message:", error);
                            addMessage({
                              role: "assistant",
                              content: "Sorry, I'm having trouble connecting right now. Please try again.",
                            });
                          }
                        } finally {
                          setIsLoading(false);
                          setAbortController(null);
                        }
                      }}
                      disabled={isTransitioning || isLoading}
                      className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                      title={rec.description}
                    >
                      {rec.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`fixed top-4 right-4 bottom-4 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-out transform z-40 ${
        currentView === "chat" ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4 rounded-t-lg">
          <span className="font-medium text-sm text-gray-900">Chat with {advertiserName} AI</span>
          <button
            onClick={() => setCurrentView("main")}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Minimize2 size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                  Welcome to {advertiserName}
                  {(advertiserLogo || advertiserName === "Nativo") && (
                    <img 
                      src={advertiserLogo || `${baseUrl}/nativo-logo.png`} 
                      alt={advertiserName} 
                      className="w-8 h-8 rounded"
                    />
                  )}
                  AI
                </h1>
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  Powered by 
                  <img 
                    src={`${baseUrl}/nativo-logo.png`} 
                    alt="Nativo" 
                    className="w-4 h-4"
                  />
                  Nativo
                </p>
              </div>
              
              <div className="w-full relative group">
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 group-hover:opacity-50 transition-opacity"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 group-hover:opacity-50 transition-opacity"></div>
                
                <div className="overflow-hidden group-hover:overflow-x-auto group-hover:scrollbar-thin group-hover:scrollbar-thumb-gray-300 group-hover:scrollbar-track-transparent">
                  <div className="flex space-x-3 animate-marquee-infinite group-hover:animate-none">
                    {isLoadingRecommendations ? (
                      // Loading state
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0 w-64 animate-pulse">
                          <div className="h-4 bg-gray-300 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                      ))
                    ) : (
                      recommendations.map((rec, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0 w-64"
                          onClick={async () => {
                            setCurrentView("chat");
                            
                            // Send the message directly with the recommendation text
                            if (isLoading) return;

                            addMessage({
                              role: "user",
                              content: rec.title,
                            });
                            setInputValue("");
                            setIsLoading(true);

                            const controller = new AbortController();
                            setAbortController(controller);

                            try {
                              const pageContent = await extractPageContent();
                              
                              const response = await fetch(`${baseUrl}${apiEndpoint}`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  message: rec.title,
                                  history: messages.slice(-10),
                                  context: pageContent,
                                }),
                                signal: controller.signal,
                              });

                              if (!response.ok) {
                                throw new Error("Failed to send message");
                              }

                              const data = await response.json() as { message?: string };
                              
                              addMessage({
                                role: "assistant",
                                content: data.message || "Sorry, I couldn't process your request.",
                              });
                            } catch (error) {
                              if (error instanceof Error && error.name === 'AbortError') {
                                addMessage({
                                  role: "assistant",
                                  content: "Message cancelled.",
                                });
                              } else {
                                console.error("Error sending message:", error);
                                addMessage({
                                  role: "assistant",
                                  content: "Sorry, I'm having trouble connecting right now. Please try again.",
                                });
                              }
                            } finally {
                              setIsLoading(false);
                              setAbortController(null);
                            }
                          }}
                        >
                          <h3 className="font-medium text-sm text-gray-900 mb-1">{rec.title}</h3>
                          <p className="text-gray-600 text-sm">{rec.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
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
                <p className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-100" : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-sm placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={isLoading ? cancelMessage : sendMessage}
              disabled={!isLoading && !inputValue.trim()}
              className="bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors flex items-center justify-center shadow-sm ml-2"
            >
              {isLoading ? <Square size={16} /> : <ArrowUp size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}