import { useState, useRef, useEffect } from "react";
import { marked } from "marked";
import { ContentExtractor } from "../../lib/content-extractor";
import { UmamiTracking } from "../../lib/umami-tracker";
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
import type {
  ChatWidgetProps,
  Recommendation,
  Summaries,
  ContentMode,
  Message,
} from "./types";

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function ChatWidget({ baseUrl = "", advertiserName = "WebsyteAI", advertiserLogo, advertiserUrl = "https://websyte.ai", isTargetedInjection = false, contentSelector, hidePoweredBy = false, enableSmartSelector = false, widgetId }: ChatWidgetProps) {
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
    setAudioProgress,
    setIsPlaying,
    setElapsedTime
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
    extractPageContent: () => ContentExtractor.extractPageContent() 
  });
  
  const dropdownRef = useRef<HTMLDivElement>(null!);

  const handleContentModeChange = (mode: ContentMode) => {
    // Track summary mode change
    UmamiTracking.trackButtonClick('summary-mode', { mode });
    
    handleContentModeChangeHook(mode);
    setShowSummaryDropdown(false);
  };


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
    // Track widget load
    UmamiTracking.trackWidgetLoad(window.location.href);
    
    // Trigger slide-in animation after component mounts
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Warm cache, capture original content, and load all data in parallel
    const loadInitialData = async () => {
      console.log('ChatWidget: loadInitialData started');
      setIsLoadingRecommendations(true);
      
      try {
        // Warm the cache first to ensure subsequent calls are fast
        await ContentExtractor.warmCache();
        
        // Initialize cache key for current URL if it doesn't exist
        const currentUrl = window.location.href;
        console.log(`ChatWidget: About to initialize cache for URL: ${currentUrl}`);
        console.log(`ChatWidget: Using baseUrl: ${baseUrl}`);
        
        const pageContent = await extractPageContent();
        
        // Use the entire document body as the target element
        const targetElement = document.body;
        setTargetElement(targetElement);
        
        const html = targetElement.outerHTML;
        
        // Build API calls array - only include selector analysis if enableSmartSelector is true
        const apiCalls = [];
        
        // Only call analyze-selector if enableSmartSelector is true and no contentSelector is provided
        if (enableSmartSelector && !contentSelector) {
          apiCalls.push(
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
            })
          );
        } else {
          // Push null placeholder to maintain array index consistency
          apiCalls.push(Promise.resolve(null));
        }
        
        apiCalls.push(
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
        );
        
        const [selectorResponse, recommendationsResponse, summariesResponse] = await Promise.all(apiCalls);

        // Handle selector for summary replacement - only if enableSmartSelector is true
        if (enableSmartSelector) {
          if (contentSelector) {
            console.log('Using override selector for summaries:', contentSelector);
            const overrideElement = targetElement.querySelector(contentSelector);
            if (overrideElement) {
              console.log('Override selector found:', overrideElement.tagName, overrideElement.className);
              setMainContentElement(overrideElement);
              setOriginalContent(overrideElement.innerHTML);
            } else {
              console.warn('Override selector failed, content replacement disabled');
              setMainContentElement(null);
              setOriginalContent('');
            }
          } else if (selectorResponse && selectorResponse.ok) {
            // Use AI selector for content replacement
            const analysis = await selectorResponse.json() as { contentSelector: string; reasoning: string };
            console.log('Using AI selector for content replacement:', analysis.contentSelector);
            
            const aiSelectedElement = targetElement.querySelector(analysis.contentSelector);
            if (aiSelectedElement) {
              console.log('AI selector found:', aiSelectedElement.tagName, aiSelectedElement.className);
              setMainContentElement(aiSelectedElement);
              setOriginalContent(aiSelectedElement.innerHTML);
            } else {
              console.warn('AI selector failed, content replacement disabled');
              setMainContentElement(null);
              setOriginalContent('');
            }
          } else {
            console.warn('No selector analysis, content replacement disabled');
            setMainContentElement(null);
            setOriginalContent('');
          }
        } else {
          // When enableSmartSelector is false, don't set up content replacement
          console.log('Smart selector disabled, summaries will show in panel only');
          setMainContentElement(null);
          setOriginalContent('');
        }

        // Handle recommendations response
        if (recommendationsResponse && recommendationsResponse.ok) {
          const data = await recommendationsResponse.json() as { recommendations?: Recommendation[]; placeholder?: string };
          setRecommendations(data.recommendations || []);
          setPlaceholder(data.placeholder || "Ask me about this content");
        } else if (recommendationsResponse) {
          throw new Error(`Recommendations API error: ${recommendationsResponse.status}`);
        }

        // Handle summaries response
        if (summariesResponse && summariesResponse.ok) {
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
  }, []);

  const extractPageContent = async () => {
    // This will use cached content if available, otherwise extract fresh content
    return await ContentExtractor.extractPageContent();
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    const userMessage = addMessage({
      role: "user",
      content: messageContent,
    });
    
    // Track chat message
    UmamiTracking.trackChatMessage(messageContent.length, 'user');
    
    setInputValue("");
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const pageContent = await extractPageContent();
      
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          context: pageContent,
          ...(widgetId && { widgetId }),
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
    
    // Track button click
    UmamiTracking.trackButtonClick('audio-version');
    
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

  const handleRecommendationClick = async (rec: Recommendation) => {
    // Track recommendation click
    UmamiTracking.trackChatMessage(rec.title.length, 'recommendation');
    
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
      
      const response = await fetch(`${baseUrl}/api/chat`, {
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
  };

  return (
    <>
      {/* Action Bar / Audio Player - Single Container */}
      <div className={`${isTargetedInjection ? 'relative top-0 left-0 mx-auto' : 'fixed top-4 left-1/2'} z-50 ${
        hasRendered ? (isTargetedInjection ? 'animate-fade-in' : 'animate-slide-in-from-top') : 'opacity-0 -translate-x-1/2'
      }`}>
        <div className={`bg-white/98 action-bar-blur shadow-lg border border-gray-300 py-2 flex flex-col gap-2 ${
          currentContent === "audio" ? 'container-audio' : 'container-action'
        } ${
          isPlaying ? 'animate-audio-border' : ''
        }`}>
          
          {/* Main Content Container with Fade Animation */}
          <div className={`flex items-center justify-center gap-2 w-full ${contentFadeClass}`}>
            
            {currentContent === "action" ? (
              <ActionBar
                advertiserLogo={advertiserLogo}
                advertiserName={advertiserName}
                advertiserUrl={advertiserUrl}
                baseUrl={baseUrl}
                currentView={currentView}
                showSummaryDropdown={showSummaryDropdown}
                summaries={summaries}
                isLoadingSummaries={isLoadingSummaries}
                currentContentMode={currentContentMode}
                isTransitioning={isTransitioning}
                hidePoweredBy={hidePoweredBy}
                enableSmartSelector={enableSmartSelector}
                onToggleSummaryDropdown={() => {
                  UmamiTracking.trackButtonClick('summary-dropdown', { action: showSummaryDropdown ? 'close' : 'open' });
                  setShowSummaryDropdown(!showSummaryDropdown);
                }}
                onContentModeChange={handleContentModeChange}
                onStartAudio={handleStartAudio}
                onToggleChat={() => {
                  const newView = currentView === "chat" ? "main" : "chat";
                  UmamiTracking.trackButtonClick('chat-toggle', { view: newView });
                  setCurrentView(newView);
                }}
                dropdownRef={dropdownRef}
              />
            ) : (
              <AudioPlayer
                isPlaying={isPlaying}
                audioProgress={audioProgress}
                playbackSpeed={playbackSpeed}
                elapsedTime={elapsedTime}
                totalTime={totalTime}
                isTransitioning={isTransitioning}
                onPlayPause={handlePlayPause}
                onSpeedChange={handleSpeedChange}
                onProgressChange={setAudioProgress}
                onExit={handleExitAudio}
                formatTime={formatTime}
              />
            )}
          </div>
          
          {/* Recommendations Row or Summary - Only show in action mode */}
          {currentContent === "action" && (
            <div className={`w-full ${contentFadeClass}`}>
              {currentContentMode !== "original" && summaries && !mainContentElement ? (
                // Show summary content only if no content-selector is available
                <div className="px-2 sm:px-4 py-1">
                  {currentContentMode === "short" && summaries.short ? (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-800 prose-headings:font-semibold prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2 prose-li:mb-1" 
                      dangerouslySetInnerHTML={{ __html: summaries.short }} 
                    />
                  ) : currentContentMode === "medium" && summaries.medium ? (
                    <div 
                      className="prose prose-sm max-w-none text-gray-700 prose-headings:text-gray-800 prose-headings:font-semibold prose-p:mb-2 prose-ul:mb-2 prose-ol:mb-2 prose-li:mb-1" 
                      dangerouslySetInnerHTML={{ __html: summaries.medium }} 
                    />
                  ) : null}
                </div>
              ) : (
                // Show recommendations
                <RecommendationsList
                  recommendations={recommendations}
                  isLoading={isLoadingRecommendations}
                  isTransitioning={isTransitioning}
                  contentFadeClass=""
                  onRecommendationClick={handleRecommendationClick}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      <ChatPanel
        currentView={currentView}
        messages={messages}
        inputValue={inputValue}
        placeholder={placeholder}
        isLoading={isLoading}
        recommendations={recommendations}
        isLoadingRecommendations={isLoadingRecommendations}
        advertiserName={advertiserName}
        hidePoweredBy={hidePoweredBy}
        advertiserLogo={advertiserLogo}
        baseUrl={baseUrl}
        summaries={summaries}
        currentContentMode={currentContentMode}
        mainContentElement={mainContentElement}
        onClose={() => setCurrentView("main")}
        onInputChange={setInputValue}
        onKeyDown={handleKeyDown}
        onSendMessage={sendMessage}
        onCancelMessage={cancelMessage}
        onRecommendationClick={handleRecommendationClick}
      />
    </>
  );
}
