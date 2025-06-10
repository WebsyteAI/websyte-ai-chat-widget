import { useRef, useEffect } from "react";
import { Minimize2 } from "lucide-react";
import type { Message, Recommendation } from "../types";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";

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
  onClose: () => void;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSendMessage: () => void;
  onCancelMessage: () => void;
  onRecommendationClick: (recommendation: Recommendation) => Promise<void>;
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
  onClose,
  onInputChange,
  onKeyDown,
  onSendMessage,
  onCancelMessage,
  onRecommendationClick,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`fixed top-4 right-4 bottom-4 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-out transform z-40 ${
      currentView === "chat" ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
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
                        onClick={() => onRecommendationClick(rec)}
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