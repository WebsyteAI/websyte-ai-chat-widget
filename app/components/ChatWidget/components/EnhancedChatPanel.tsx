import { useRef, useEffect } from "react";
import type { Message, Recommendation, Summaries, ContentMode } from "../types";
import { EnhancedChatMessage } from "./EnhancedChatMessage";
import { MessageInput } from "./MessageInput";
import { DynamicIslandHeader } from "../../chat-panel/DynamicIslandHeader";
import { Marquee } from "../../ui/marquee";
import type { ComponentRegistry } from "../component-registry";

interface EnhancedChatPanelProps {
  currentView: "main" | "chat";
  messages: Message[];
  inputValue: string;
  placeholder: string;
  isLoading: boolean;
  recommendations: Recommendation[];
  isLoadingRecommendations: boolean;
  advertiserName: string;
  advertiserLogo?: string;
  baseUrl: string;
  hidePoweredBy?: boolean;
  summaries: Summaries | null;
  currentContentMode: ContentMode;
  mainContentElement: Element | null;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onCancelMessage: () => void;
  onRecommendationClick: (recommendation: Recommendation) => Promise<void>;
  isFullScreen?: boolean;
  isEmbed?: boolean;
  componentRegistry?: ComponentRegistry;
  enableComponents?: boolean;
  welcomeContent?: React.ReactNode;
  fullWidthMessages?: boolean;
  showEmptyState?: boolean;
  autoScroll?: boolean;
}

export function EnhancedChatPanel({
  currentView,
  messages,
  inputValue,
  placeholder,
  isLoading,
  recommendations,
  isLoadingRecommendations,
  advertiserName,
  advertiserLogo,
  baseUrl,
  hidePoweredBy,
  summaries,
  currentContentMode,
  mainContentElement,
  onClose,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onCancelMessage,
  onRecommendationClick,
  isFullScreen = false,
  isEmbed = false,
  componentRegistry,
  enableComponents = false,
  welcomeContent,
  fullWidthMessages = false,
  showEmptyState = true,
  autoScroll = false,
}: EnhancedChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [messages, autoScroll]);

  // Full-screen mode styling
  if (isFullScreen) {
    return (
      <div className={`${isEmbed ? 'absolute' : 'fixed'} inset-0 flex flex-col bg-background border border-border text-lg`}>
        {/* Header wrapped in Dynamic Island */}
        <DynamicIslandHeader
          advertiserName={advertiserName}
          advertiserLogo={advertiserLogo}
          baseUrl={baseUrl}
          hidePoweredBy={hidePoweredBy}
          isEmbed={isEmbed}
        />

        {/* Messages area - scrollable with padding for floating header and input */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-24 pb-28 scrollbar-stable z-0">
          <div className={`p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 ${fullWidthMessages ? 'max-w-[1024px]' : 'max-w-4xl'} mx-auto w-full`}>
            {messages.length === 0 && showEmptyState && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                {welcomeContent || (
                  <>
                    <div className="text-center mb-4">
                      <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        <div>Welcome to</div>
                        <div className="flex items-center justify-center gap-3 mt-2">
                          {advertiserLogo && (
                            <img 
                              src={advertiserLogo} 
                              alt={advertiserName} 
                              className="w-10 h-10 rounded"
                            />
                          )}
                          {advertiserName}
                        </div>
                      </h2>
                    </div>
                    
                    {/* Recommendations with marquee */}
                    <div className="w-full max-w-3xl">
                      <p className="text-base text-gray-500 text-center mb-4">Try asking:</p>
                      <div className="relative">
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>
                        
                        <Marquee pauseOnHover className="[--gap:0.75rem]">
                          {isLoadingRecommendations ? (
                            // Loading state
                            Array.from({ length: 4 }).map((_, index) => (
                              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex-shrink-0 w-64 animate-pulse">
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded"></div>
                              </div>
                            ))
                          ) : (
                            recommendations.slice(0, 4).map((rec, index) => (
                              <div 
                                key={index} 
                                className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0 w-64"
                                onClick={() => onRecommendationClick(rec)}
                              >
                                <h3 className="font-medium text-sm text-gray-900 mb-1">{rec.title}</h3>
                                <p className="text-gray-600 text-sm">{rec.description}</p>
                              </div>
                            ))
                          )}
                        </Marquee>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <EnhancedChatMessage 
                key={message.id} 
                message={message} 
                avatarUrl={advertiserLogo}
                componentRegistry={componentRegistry}
                enableComponents={enableComponents}
                fullWidth={fullWidthMessages}
              />
            ))}
            
            {isLoading && (
              <div className="flex flex-col items-start max-w-[80%]">
                <div className="mb-2 px-3">
                  <img 
                    src={advertiserLogo || 'https://websyte.ai/websyte-ai-logo.svg'} 
                    alt="AI Assistant"
                    className="w-6 h-6 rounded-full"
                  />
                </div>
                <div className="text-gray-800 p-3 rounded-lg">
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
        </div>

        {/* Dynamic Island input now floats independently */}
        <MessageInput
          inputValue={inputValue}
          placeholder={placeholder}
          isLoading={isLoading}
          onInputChange={onInputChange}
          onKeyDown={onKeyDown}
          onSend={onSendMessage}
          onCancel={onCancelMessage}
        />
      </div>
    );
  }

  // Regular chat panel (not implemented in this enhanced version for brevity)
  return null;
}