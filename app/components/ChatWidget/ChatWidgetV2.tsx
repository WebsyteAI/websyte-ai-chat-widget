import { useState, useRef, useEffect } from "react";
import { ContentExtractor } from "../../lib/content-extractor";
import { UmamiTracking } from "../../lib/umami-tracker";
import { createLogger } from "../../lib/logger";
import { 
  useAudioPlayer, 
  useContentSummarization,
  useIframeMessaging,
} from "./hooks";
import {
  ActionBar,
  AudioPlayer,
  RecommendationsList,
} from "./components";
import { UnifiedChatPanel } from "../chat-ui";
import type {
  ChatWidgetProps,
  Recommendation,
  ContentMode,
  Summaries,
} from "./types";
import type { UnifiedChatConfig, Message } from "../chat-ui/types";
import type { Message as ChatWidgetMessage } from "./types";

const logger = createLogger('ChatWidgetV2');

export function ChatWidgetV2({ 
  baseUrl = "", 
  advertiserName = "WebsyteAI", 
  advertiserLogo, 
  advertiserUrl = "https://websyte.ai", 
  isTargetedInjection = false, 
  contentSelector, 
  hidePoweredBy = false, 
  enableSmartSelector = false, 
  widgetId, 
  widgetName, 
  saveChatMessages = false, 
  isFullScreen = false, 
  isEmbed = false 
}: ChatWidgetProps) {
  const [currentView, setCurrentView] = useState<"main" | "chat">("main");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [placeholder, setPlaceholder] = useState("Ask me about this content");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentContent, setCurrentContent] = useState<"action" | "audio">("action");
  const [contentFadeClass, setContentFadeClass] = useState("");
  const [hasRendered, setHasRendered] = useState(false);
  const [showSummaryDropdown, setShowSummaryDropdown] = useState(false);
  const [fetchedWidgetName, setFetchedWidgetName] = useState<string | null>(null);
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState<string | null>(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const dropdownRef = useRef<HTMLDivElement>(null!);
  const widgetContainerRef = useRef<HTMLDivElement>(null);
  
  // Audio player hook
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
  
  // Content summarization hook
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
  
  // Configure unified chat
  const chatConfig: UnifiedChatConfig = {
    // API Configuration
    baseUrl,
    widgetId,
    widgetName: fetchedWidgetName || widgetName,
    sessionId,
    
    // Display Options
    showRecommendations: true,
    showDropShadow: isEmbed && !isFullScreen,
    fullScreen: isFullScreen,
    showHeader: true,
    showPoweredBy: !hidePoweredBy,
    
    // Branding
    advertiserName: fetchedWidgetName || widgetName || advertiserName,
    advertiserLogo: fetchedLogoUrl || advertiserLogo,
    advertiserUrl,
    
    // Input Options
    useDynamicIsland: true,
    placeholder,
    
    // Message Options
    enhancedMessages: true,
    showSources: true,
    showDebug: false,
    fullWidthMessages: isFullScreen,
    
    // Behavior Options
    saveChatMessages,
    enableComponents: false,
    
    // Chat Mode
    mode: widgetId ? "rag" : "standard",
    enabled: true,
    
    // Content Configuration
    contentSelector,
    enableSmartSelector,
  };
  
  // Iframe messaging integration
  const {
    isInIframe,
    observeResize,
    notifyChatStarted,
    notifyChatClosed,
    notifyChatResponse,
    notifyError,
  } = useIframeMessaging({
    config: {
      enableAutoResize: true,
      resizeDebounceMs: 100,
    },
    onConfigReceived: (config) => {
      logger.info('Received config update:', config);
    },
    onMessageReceived: (message) => {
      // This will be handled by the UnifiedChatPanel
      logger.info('Received message from parent:', message);
    },
    onClearChat: () => {
      // This will be handled by the UnifiedChatPanel
      logger.info('Clear chat requested');
    },
    onSetPlaceholder: (newPlaceholder) => {
      setPlaceholder(newPlaceholder);
    },
  });
  
  // Chat event handlers
  const handleChatStarted = () => {
    UmamiTracking.trackChatMessage(0, 'user');
    if (isInIframe) {
      notifyChatStarted();
    }
  };
  
  const handleChatClosed = () => {
    setCurrentView("main");
    if (isInIframe) {
      notifyChatClosed();
    }
  };
  
  const handleMessageReceived = (message: Message) => {
    if (isInIframe) {
      // Convert from unified Message type to ChatWidget Message type
      const chatWidgetMessage = {
        id: message.id,
        role: message.role as "user" | "assistant",
        content: message.content,
        timestamp: message.timestamp || new Date(),
        sources: message.sources,
      };
      notifyChatResponse(chatWidgetMessage as ChatWidgetMessage);
    }
  };
  
  const handleError = (error: string) => {
    if (isInIframe) {
      notifyError(error);
    }
  };
  
  // Extract page content function
  const extractPageContent = async () => {
    logger.info('Extracting page content');
    return await ContentExtractor.extractPageContent();
  };
  
  // Handle content mode change
  const handleContentModeChange = (mode: ContentMode) => {
    UmamiTracking.trackButtonClick('summary-mode', { mode });
    handleContentModeChangeHook(mode);
    setShowSummaryDropdown(false);
  };
  
  // Handle audio exit
  const handleExitAudio = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsPlaying(false);
    setContentFadeClass("animate-fade-out");
    
    setTimeout(() => {
      setCurrentContent("action");
      setAudioProgress(0);
      setElapsedTime(0);
      
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 180);
    }, 200);
  };
  
  // Handle audio start
  const handleStartAudio = () => {
    if (isTransitioning) return;
    
    UmamiTracking.trackButtonClick('audio-version');
    
    setIsTransitioning(true);
    setContentFadeClass("animate-fade-out");
    
    setTimeout(() => {
      setCurrentContent("audio");
      
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 100);
    }, 200);
  };
  
  // Effects
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSummaryDropdown && dropdownRef.current) {
        const target = event.target as Element;
        if (!dropdownRef.current.contains(target)) {
          logger.info('Clicking outside dropdown, closing');
          setShowSummaryDropdown(false);
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showSummaryDropdown]);
  
  useEffect(() => {
    UmamiTracking.trackWidgetLoad(window.location.href);
    
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (isInIframe && widgetContainerRef.current) {
      observeResize(widgetContainerRef.current);
    }
  }, [isInIframe, observeResize]);
  
  // Fetch widget info for full-screen mode
  useEffect(() => {
    if (isFullScreen && widgetId && !widgetName) {
      const fetchWidgetInfo = async () => {
        try {
          const response = await fetch(`${baseUrl}/api/public/widget/${widgetId}`);
          if (response.ok) {
            const data = await response.json() as {
              name: string;
              logoUrl?: string;
              recommendations?: Array<{ title: string; description: string }>;
            };
            setFetchedWidgetName(data.name);
            
            if (data.logoUrl) {
              setFetchedLogoUrl(data.logoUrl);
            }
            
            if (data.recommendations && data.recommendations.length > 0) {
              setRecommendations(data.recommendations as Recommendation[]);
              setPlaceholder(`Ask me about ${data.name}...`);
            }
          }
        } catch (error) {
          logger.error('Failed to fetch widget info:', error);
        }
      };
      fetchWidgetInfo();
    }
  }, [isFullScreen, widgetId, widgetName, baseUrl]);
  
  // Load initial data
  useEffect(() => {
    if (isFullScreen) {
      setIsLoadingRecommendations(false);
      return;
    }

    const loadInitialData = async () => {
      logger.info('ChatWidgetV2: loadInitialData started');
      setIsLoadingRecommendations(true);
      
      try {
        await ContentExtractor.warmCache();
        
        const currentUrl = window.location.href;
        logger.info(`ChatWidgetV2: About to initialize cache for URL: ${currentUrl}`);
        
        const pageContent = await extractPageContent();
        const targetElement = document.body;
        setTargetElement(targetElement);
        
        const html = targetElement.outerHTML;
        const apiCalls = [];
        
        if (enableSmartSelector && !contentSelector) {
          apiCalls.push(
            fetch(`${baseUrl}/api/analyze-selector`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                html,
                title: pageContent.title,
                url: pageContent.url
              }),
            })
          );
        } else {
          apiCalls.push(Promise.resolve(null));
        }
        
        apiCalls.push(
          fetch(`${baseUrl}/api/recommendations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              context: pageContent,
              ...(widgetId && { widgetId })
            }),
          })
        );
        
        apiCalls.push(
          fetch(`${baseUrl}/api/summaries`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              content: pageContent.content,
              url: pageContent.url,
              title: pageContent.title,
            }),
          })
        );
        
        const [analyzeResponse, recsResponse, summariesResponse] = await Promise.all(apiCalls);
        
        if (analyzeResponse && analyzeResponse.ok) {
          const { selector, element } = await analyzeResponse.json() as { selector: string; element: string };
          if (selector && element) {
            logger.info(`ChatWidgetV2: Smart selector found: ${selector}`);
            const mainElement = document.querySelector(selector);
            if (mainElement) {
              setMainContentElement(mainElement);
            }
          }
        }
        
        if (recsResponse && recsResponse.ok) {
          const data = await recsResponse.json() as { recommendations?: Recommendation[] };
          if (data.recommendations) {
            setRecommendations(data.recommendations);
            logger.info(`ChatWidgetV2: Loaded ${data.recommendations.length} recommendations`);
          }
        }
        
        if (summariesResponse && summariesResponse.ok) {
          const summariesData = await summariesResponse.json() as Summaries;
          loadSummaries(summariesData);
        }
        
        setOriginalContent(pageContent.content);
      } catch (error) {
        logger.error('Error loading initial data:', error);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    loadInitialData();
  }, [baseUrl, contentSelector, enableSmartSelector, widgetId, loadSummaries, setOriginalContent, setTargetElement, setMainContentElement, isFullScreen]);
  
  // Update chat config with callbacks
  const enhancedChatConfig: UnifiedChatConfig = {
    ...chatConfig,
    onChatStarted: handleChatStarted,
    onChatClosed: handleChatClosed,
    onMessageReceived: handleMessageReceived,
    onError: handleError,
  };
  
  // Full-screen mode render
  if (isFullScreen) {
    const displayName = fetchedWidgetName || widgetName || advertiserName;
    
    return (
      <div className="w-full h-full text-base antialiased">
        <UnifiedChatPanel
          config={{
            ...enhancedChatConfig,
            advertiserName: displayName,
            advertiserLogo: fetchedLogoUrl || advertiserLogo,
          }}
          layout="fullscreen"
          welcomeContent={recommendations.length > 0 ? undefined : (
            <div className="text-center space-y-4 p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome to {displayName}
                </h3>
                <p className="text-gray-600 text-sm">
                  {placeholder}
                </p>
              </div>
            </div>
          )}
        />
      </div>
    );
  }
  
  // Regular widget mode render
  return (
    <div ref={widgetContainerRef} className="w-full h-full text-base antialiased">
      {/* Action Bar / Audio Player */}
      <div className={`${isTargetedInjection ? 'relative top-0 left-0 mx-auto' : 'fixed top-4 left-1/2'} z-50 ${
        hasRendered ? (isTargetedInjection ? 'animate-fade-in' : 'animate-slide-in-from-top') : 'opacity-0 -translate-x-1/2'
      }`}>
        <div className={`bg-white/98 action-bar-blur shadow-lg border border-gray-300 py-2 flex flex-col gap-2 ${
          currentContent === "audio" ? 'container-audio' : 'container-action'
        } ${
          isPlaying ? 'animate-audio-border' : ''
        }`}>
          
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
                  
                  if (isInIframe) {
                    if (newView === "chat") {
                      notifyChatStarted();
                    } else {
                      notifyChatClosed();
                    }
                  }
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
          
          {currentContent === "action" && (
            <div className={`w-full ${contentFadeClass}`}>
              {currentContentMode !== "original" && summaries && !mainContentElement ? (
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
                <RecommendationsList
                  recommendations={recommendations}
                  isLoading={isLoadingRecommendations}
                  isTransitioning={isTransitioning}
                  contentFadeClass=""
                  onRecommendationClick={async (rec) => {
                    UmamiTracking.trackChatMessage(rec.title.length, 'recommendation');
                    setCurrentView("chat");
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat Panel */}
      {currentView === "chat" && (
        <div className={`fixed top-24 right-4 z-50 w-96 max-w-[calc(100vw-2rem)] ${
          hasRendered ? 'animate-slide-in-from-right' : 'opacity-0'
        }`}>
          <UnifiedChatPanel
            config={enhancedChatConfig}
            layout="embedded"
            onClose={handleChatClosed}
          />
        </div>
      )}
    </div>
  );
}