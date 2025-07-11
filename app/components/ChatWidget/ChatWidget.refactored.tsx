import { useRef } from "react";
import { UmamiTracking } from "../../lib/umami-tracker";
import { 
  useChatMessages,
  useAudioPlayer, 
  useContentSummarization,
  useIframeMessaging,
} from "./hooks";
import {
  useChatLogic,
  useWidgetData,
  useContentExtraction,
  useAudioManagement,
  useWidgetUIState
} from "./hooks/custom";
import {
  ChatPanel,
  RecommendationsList,
} from "./components";
import {
  FullScreenWidget,
  EmbeddedWidget,
  WidgetContainer
} from "./components/views";
import type { ChatWidgetProps } from "./types";

export function ChatWidget({ 
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
  isEmbed = false, 
  recommendations: propRecommendations 
}: ChatWidgetProps) {
  const widgetContainerRef = useRef<HTMLDivElement>(null);

  // UI State Management
  const uiState = useWidgetUIState();
  const {
    currentView,
    setCurrentView,
    isTransitioning,
    showSummaryDropdown,
    setShowSummaryDropdown,
    currentContent,
    setCurrentContent,
    contentFadeClass,
    setContentFadeClass,
    hasRendered,
    placeholder,
    dropdownRef
  } = uiState;

  // Chat and Audio Hooks
  const { messages, addMessage, clearMessages } = useChatMessages();
  const audioPlayer = useAudioPlayer(180);
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
  } = audioPlayer;

  // Content Summarization
  const contentSummarization = useContentSummarization({ 
    baseUrl, 
    extractPageContent: () => "" // Will be set by content extraction
  });
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
  } = contentSummarization;

  // Iframe Messaging
  const iframeMessaging = useIframeMessaging({
    config: {
      enableAutoResize: true,
      resizeDebounceMs: 100,
    },
    onConfigReceived: (config) => {
      // Handle dynamic configuration updates
    },
    onMessageReceived: (message) => {
      // Handle messages from parent
    },
  });
  const {
    isInIframe,
    observeResize,
    notifyChatStarted,
    notifyChatClosed,
    notifyChatResponse,
    notifyError,
  } = iframeMessaging;

  // Widget Data Fetching
  const widgetData = useWidgetData({
    baseUrl,
    widgetId,
    widgetName,
    propRecommendations
  });
  const {
    fetchedWidgetName,
    fetchedLogoUrl,
    widgetLinks,
    recommendations,
    isLoadingRecommendations,
    displayName
  } = widgetData;

  // Content Extraction
  useContentExtraction({
    isTargetedInjection,
    contentSelector,
    enableSmartSelector,
    setOriginalContent,
    setTargetElement,
    setMainContentElement,
    loadSummaries
  });

  // Chat Logic
  const chatLogic = useChatLogic({
    baseUrl,
    widgetId,
    currentContent: originalContent,
    summaries,
    currentContentMode,
    isLoadingSummaries,
    saveChatMessages,
    notifyChatResponse,
    notifyError
  });
  const {
    isLoading,
    handleSendMessage,
    handleStopGeneration,
    handleRecommendationClick
  } = chatLogic;

  // Audio Management
  const audioManagement = useAudioManagement({
    currentContent,
    setContentFadeClass,
    audioProgress,
    setAudioProgress,
    elapsedTime,
    setElapsedTime,
    totalTime,
    setIsPlaying
  });
  const { handleContentChange } = audioManagement;

  // Observe resize in iframe mode
  if (isInIframe && widgetContainerRef.current) {
    observeResize(widgetContainerRef.current);
  }

  // Event Handlers
  const handleChat = () => {
    setCurrentView('chat');
    UmamiTracking.trackEvent('chat_opened', { 
      widgetId, 
      source: currentContent 
    });
    notifyChatStarted();
  };

  const handleAudioToggle = () => {
    const newContent = currentContent === 'action' ? 'audio' : 'action';
    handleContentChange(newContent);
    setTimeout(() => setCurrentContent(newContent), 300);
  };

  const handleContentModeChange = (mode: any) => {
    handleContentModeChangeHook(mode);
    setShowSummaryDropdown(false);
  };

  const handleSendMessageWrapper = (message: string, inputValue: string, setInputValue: (value: string) => void) => {
    handleSendMessage(message, messages, addMessage, setInputValue);
  };

  const handleRecommendationClickWrapper = (text: string, response: string) => {
    handleRecommendationClick(text, response, messages, addMessage, setCurrentView);
  };

  // Render content
  const content = (
    <>
      <WidgetContainer
        currentView={currentView}
        currentContent={currentContent}
        contentFadeClass={contentFadeClass}
        originalContent={originalContent}
        isPlaying={isPlaying}
        audioProgress={audioProgress}
        playbackSpeed={playbackSpeed}
        elapsedTime={elapsedTime}
        totalTime={totalTime}
        handlePlayPause={handlePlayPause}
        handleSpeedChange={handleSpeedChange}
        formatTime={formatTime}
        setAudioProgress={setAudioProgress}
        setElapsedTime={setElapsedTime}
        handleContentModeChange={handleContentModeChange}
        onChat={handleChat}
        onAudioToggle={handleAudioToggle}
      >
        {currentView === 'main' && recommendations.length > 0 && (
          <RecommendationsList
            recommendations={recommendations}
            onSelect={handleRecommendationClickWrapper}
            isLoading={isLoadingRecommendations}
          />
        )}
      </WidgetContainer>

      {currentView === 'chat' && (
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessageWrapper}
          onClose={() => {
            setCurrentView('main');
            notifyChatClosed();
          }}
          onClear={clearMessages}
          onStop={handleStopGeneration}
          placeholder={placeholder}
          advertiserName={displayName || advertiserName}
          advertiserLogo={fetchedLogoUrl || advertiserLogo}
          advertiserUrl={advertiserUrl}
          hidePoweredBy={hidePoweredBy}
          currentContentMode={currentContentMode}
          onContentModeChange={handleContentModeChange}
          showSummaryDropdown={showSummaryDropdown}
          setShowSummaryDropdown={setShowSummaryDropdown}
          dropdownRef={dropdownRef}
          summaries={summaries}
          links={widgetLinks}
        />
      )}
    </>
  );

  // Render based on mode
  if (isFullScreen) {
    return (
      <FullScreenWidget
        currentView={currentView}
        isTransitioning={isTransitioning}
        hasRendered={hasRendered}
      >
        {content}
      </FullScreenWidget>
    );
  }

  if (isEmbed) {
    return (
      <EmbeddedWidget
        currentView={currentView}
        isTransitioning={isTransitioning}
        hasRendered={hasRendered}
        widgetContainerRef={widgetContainerRef}
      >
        {content}
      </EmbeddedWidget>
    );
  }

  // Default inline mode
  return (
    <div className="websyte-chat-widget">
      {content}
    </div>
  );
}