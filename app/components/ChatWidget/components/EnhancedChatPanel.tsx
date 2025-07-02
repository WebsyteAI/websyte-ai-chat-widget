import { useRef, useEffect } from "react";
import { Minimize2 } from "lucide-react";
import type { Message, Recommendation, Summaries, ContentMode } from "../types";
import { EnhancedChatMessage } from "./EnhancedChatMessage";
import { MessageInput } from "./MessageInput";
import { Marquee } from "../../ui/marquee";
import type { ComponentRegistry } from "../../landing-chat/component-registry";

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
}: EnhancedChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Full-screen mode styling
  if (isFullScreen) {
    return (
      <div className={`fixed inset-0 flex flex-col bg-gray-50 border border-gray-200 text-lg ${isEmbed ? 'websyte-embed-chat-panel' : ''}`}>
        {/* Full-screen header - fixed */}
        <div className={`flex-shrink-0 flex flex-col items-center justify-center p-4 border-b border-gray-200 bg-white ${isEmbed ? 'websyte-embed-header' : ''}`}>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <img 
              src={advertiserLogo || 'https://websyte.ai/websyte-ai-logo.svg'} 
              alt={advertiserName} 
              className="w-8 h-8 rounded"
            />
            {advertiserName}
          </h1>
          {!hidePoweredBy && (
            <p className="text-base text-gray-500 mt-1 flex items-center gap-1">
              Powered by 
              <a 
                href="https://websyte.ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <img 
                  src={`${baseUrl}/websyte-ai-logo.svg`} 
                  alt="Websyte.ai" 
                  className="w-4 h-4"
                />
                Websyte.ai
              </a>
            </p>
          )}
        </div>

        {/* Messages area - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className={`p-6 flex flex-col gap-4 ${fullWidthMessages ? 'max-w-[1024px]' : 'max-w-4xl'} mx-auto w-full ${isEmbed ? 'websyte-embed-messages' : ''}`}>
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
                    
                    {/* Recommendations only */}
                    <div className="w-full max-w-3xl">
                      <p className="text-base text-gray-500 text-center mb-4">Try asking:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoadingRecommendations ? (
                          Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse">
                              <div className="h-6 bg-gray-300 rounded mb-3"></div>
                              <div className="h-5 bg-gray-200 rounded"></div>
                            </div>
                          ))
                        ) : (
                          recommendations.slice(0, 4).map((rec, index) => (
                            <div 
                              key={index} 
                              className="bg-gray-50 border border-gray-200 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => onRecommendationClick(rec)}
                            >
                              <h3 className="font-semibold text-gray-900 mb-2 text-lg">{rec.title}</h3>
                              <p className="text-gray-600 text-base">{rec.description}</p>
                            </div>
                          ))
                        )}
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

        {/* Input area - fixed */}
        <div className="flex-shrink-0 border-t border-gray-200 bg-white">
          <div className={`p-4 ${fullWidthMessages ? 'max-w-[1024px]' : 'max-w-4xl'} mx-auto w-full ${isEmbed ? 'websyte-embed-input' : ''}`}>
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
        </div>
      </div>
    );
  }

  // Regular chat panel (not implemented in this enhanced version for brevity)
  return null;
}