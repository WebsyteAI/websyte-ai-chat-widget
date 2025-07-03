import { useRef, useEffect } from "react";
import { MessageCircle, Bot, Settings, Minimize2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { UnifiedChatMessage } from "./UnifiedChatMessage";
import { UnifiedMessageInput } from "./UnifiedMessageInput";
import { RecommendationsList } from "../ChatWidget/components/RecommendationsList";
import { useUnifiedChat } from "./hooks/useUnifiedChat";
import { cn } from "../../lib/utils";
import type { UnifiedChatPanelProps, Message } from "./types";

export function UnifiedChatPanel({ 
  config, 
  layout = "panel",
  className = "",
  title,
  onClose,
  welcomeContent,
  emptyStateContent,
}: UnifiedChatPanelProps) {
  const chat = useUnifiedChat(config);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);
  
  const handleSend = () => {
    if (chat.inputValue.trim()) {
      chat.sendMessage(chat.inputValue.trim());
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleRecommendationClick = async (recommendation: { title: string }) => {
    chat.setInputValue(recommendation.title);
    await chat.sendMessage(recommendation.title);
  };
  
  const getHeaderTitle = () => {
    if (title) return title;
    if (config.widgetName) return config.widgetName;
    if (config.mode === 'rag') {
      return config.widgetId ? 'RAG Chat' : 'Chat (No Widget Selected)';
    }
    return 'Chat';
  };
  
  const getEmptyState = () => {
    if (emptyStateContent) return emptyStateContent;
    
    if (!config.enabled) {
      return (
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chat Not Available
            </h3>
            <p className="text-gray-600 text-sm">
              Create a widget to enable chat testing
            </p>
          </div>
        </div>
      );
    }
    
    if (welcomeContent) return welcomeContent;
    
    return (
      <div className="text-center space-y-4 p-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {config.advertiserName ? `Welcome to ${config.advertiserName}` : 'Start Chatting'}
          </h3>
          <p className="text-gray-600 text-sm">
            {config.mode === 'rag' 
              ? "Ask questions about your widget's content and documents"
              : "Ask me anything about this content"
            }
          </p>
        </div>
      </div>
    );
  };
  
  const isFullScreen = layout === "fullscreen" || config.fullScreen;
  const isEmbedded = layout === "embedded";
  
  const containerClass = cn(
    "flex flex-col h-full bg-white",
    {
      "rounded-lg": !isFullScreen,
      "shadow-lg": config.showDropShadow && isEmbedded,
      "border": !isFullScreen && !config.showDropShadow,
    },
    className
  );
  
  const contentClass = cn(
    "flex-1 flex flex-col overflow-hidden",
    {
      "p-0": isFullScreen || isEmbedded,
      "p-4": layout === "panel" && !config.showHeader,
    }
  );
  
  return (
    <div className={containerClass}>
      {config.showHeader !== false && (
        <div className={cn(
          "flex items-center justify-between border-b bg-white",
          isFullScreen || isEmbedded ? "px-4 py-3" : "p-4"
        )}>
          <div className="flex items-center gap-2">
            {config.advertiserLogo && (
              <img 
                src={config.advertiserLogo} 
                alt={config.advertiserName} 
                className="w-6 h-6 rounded"
              />
            )}
            <h2 className="text-lg font-semibold flex items-center gap-2">
              {!config.advertiserLogo && <MessageCircle className="w-5 h-5" />}
              {getHeaderTitle()}
            </h2>
            
            {config.mode === 'rag' && (
              <Badge variant="secondary" className="text-xs">
                RAG
              </Badge>
            )}
            
            {!config.enabled && (
              <Badge variant="outline" className="text-xs">
                Disabled
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {config.showDebug && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {/* TODO: Handle debug toggle */}}
                className="p-1"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            
            {onClose && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
                className="p-1"
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
      
      {chat.error && (
        <div className="mx-4 mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{chat.error}</p>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={chat.clearError}
            className="mt-1 h-auto p-1 text-xs text-red-600 hover:text-red-800"
          >
            Dismiss
          </Button>
        </div>
      )}
      
      <div className={contentClass}>
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto"
        >
          {chat.messages.length === 0 ? (
            getEmptyState()
          ) : (
            <div className="space-y-4 p-4">
              {chat.messages.map((message) => (
                <UnifiedChatMessage
                  key={message.id}
                  message={message}
                  enhanced={config.enhancedMessages}
                  showSources={config.showSources}
                  showDebug={config.showDebug}
                  fullWidth={config.fullWidthMessages}
                  componentRegistry={config.componentRegistry}
                  enableComponents={config.enableComponents}
                />
              ))}
              
              {chat.loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                    AI
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {config.showRecommendations && chat.recommendations.length > 0 && (
          <div className="border-t">
            <RecommendationsList
              recommendations={chat.recommendations}
              isLoading={chat.loadingRecommendations}
              isTransitioning={false}
              contentFadeClass=""
              onRecommendationClick={handleRecommendationClick}
            />
          </div>
        )}
        
        <div className="flex-shrink-0 border-t">
          <UnifiedMessageInput
            value={chat.inputValue}
            onChange={chat.setInputValue}
            onSend={handleSend}
            onCancel={chat.cancelMessage}
            onKeyDown={handleKeyDown}
            disabled={!config.enabled}
            loading={chat.loading}
            placeholder={config.placeholder || (
              !config.enabled 
                ? "Create a widget to enable chat"
                : config.mode === 'rag'
                ? "Ask about your documents..."
                : "Type your message..."
            )}
            useDynamicIsland={config.useDynamicIsland}
            className={isFullScreen || isEmbedded ? "m-4" : ""}
          />
        </div>
        
        {!config.showPoweredBy === false && (
          <div className="text-center py-2 text-xs text-gray-500">
            {config.advertiserUrl ? (
              <a 
                href={config.advertiserUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-700"
              >
                Powered by {config.advertiserName || 'WebsyteAI'}
              </a>
            ) : (
              <span>Powered by {config.advertiserName || 'WebsyteAI'}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}