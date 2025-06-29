import { useRef, useEffect } from "react";
import { Minimize2 } from "lucide-react";
import type { Message, Recommendation, Summaries, ContentMode } from "../types";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { Marquee } from "../../ui/marquee";

interface ChatPanelProps {
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
}

export function ChatPanel({
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
}: ChatPanelProps) {
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
      <div className={`fixed inset-0 flex flex-col bg-gray-50 border border-gray-200 ${isEmbed ? 'websyte-embed-chat-panel' : ''}`}>
        {/* Full-screen header - fixed */}
        <div className={`flex-shrink-0 flex flex-col items-center justify-center p-4 border-b border-gray-200 bg-white ${isEmbed ? 'websyte-embed-header' : ''}`}>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {advertiserName}
            {(advertiserLogo || advertiserName === "Nativo") && (
              <img 
                src={advertiserLogo || `${baseUrl}/nativo-logo.png`} 
                alt={advertiserName} 
                className="w-6 h-6 rounded"
              />
            )}
          </h1>
          {!hidePoweredBy && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
              Powered by 
              <img 
                src={`${baseUrl}/websyte-ai-logo.svg`} 
                alt="Websyte.ai" 
                className="w-4 h-4"
              />
              Websyte.ai
            </p>
          )}
        </div>

        {/* Messages area - scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className={`p-6 flex flex-col gap-4 max-w-4xl mx-auto w-full ${isEmbed ? 'websyte-embed-messages' : ''}`}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
                    Welcome to {advertiserName}
                    {advertiserLogo && (
                      <img 
                        src={advertiserLogo} 
                        alt={advertiserName} 
                        className="w-10 h-10 rounded"
                      />
                    )}
                  </h2>
                  {!hidePoweredBy && (
                    <p className="text-lg text-gray-500 flex items-center justify-center gap-2">
                      Powered by 
                      <img 
                        src={`${baseUrl}/websyte-ai-logo.svg`} 
                        alt="Websyte.ai" 
                        className="w-5 h-5"
                      />
                      Websyte.ai
                    </p>
                  )}
                </div>
                
                
                {/* Recommendations only */}
                <div className="w-full max-w-3xl">
                  <p className="text-sm text-gray-500 text-center mb-4">Try asking:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isLoadingRecommendations ? (
                      Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse">
                          <div className="h-5 bg-gray-300 rounded mb-3"></div>
                          <div className="h-4 bg-gray-200 rounded"></div>
                        </div>
                      ))
                    ) : (
                      recommendations.slice(0, 4).map((rec, index) => (
                        <div 
                          key={index} 
                          className="bg-gray-50 border border-gray-200 rounded-lg p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => onRecommendationClick(rec)}
                        >
                          <h3 className="font-semibold text-gray-900 mb-2">{rec.title}</h3>
                          <p className="text-gray-600">{rec.description}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 p-4 rounded-lg">
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
          <div className={`p-4 max-w-4xl mx-auto w-full ${isEmbed ? 'websyte-embed-input' : ''}`}>
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

  return (
    <div className={`fixed left-4 right-4 top-24 bottom-4 sm:top-4 sm:right-4 sm:left-auto sm:bottom-4 w-auto sm:w-[28rem] sm:min-w-[400px] sm:max-w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-out transform z-40 ${
      currentView === "chat" 
        ? 'translate-y-0 sm:translate-y-0 sm:translate-x-0 opacity-100' 
        : '-translate-y-full sm:translate-y-0 sm:translate-x-full opacity-0'
    }`}>
      <div className="flex items-center justify-end p-4 rounded-t-lg">
        <button
          onClick={onClose}
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
              {!hidePoweredBy && (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
                  Powered by 
                  <img 
                    src={`${baseUrl}/websyte-ai-logo.svg`} 
                    alt="Websyte.ai" 
                    className="w-4 h-4"
                  />
                  Websyte.ai
                </p>
              )}
            </div>
            
            
            <div className="w-full relative">
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
        )}
        
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
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
