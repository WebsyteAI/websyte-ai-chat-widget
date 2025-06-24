import { MessageCircle, Bot, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChat } from "./hooks/useChat";
import type { ChatConfig, ChatLayout } from "./types";

interface ChatPanelProps {
  config: ChatConfig;
  layout?: ChatLayout;
  className?: string;
  title?: string;
  showHeader?: boolean;
  showDebugToggle?: boolean;
  onDebugToggle?: (enabled: boolean) => void;
}

export function ChatPanel({ 
  config, 
  layout = "panel",
  className = "",
  title,
  showHeader = true,
  showDebugToggle = false,
  onDebugToggle,
}: ChatPanelProps) {
  const chat = useChat(config);
  
  const handleSend = () => {
    if (chat.inputValue.trim()) {
      chat.sendMessage(chat.inputValue.trim());
    }
  };

  const getHeaderTitle = () => {
    if (title) return title;
    if (config.mode === 'rag') {
      return config.widgetId ? 'RAG Chat' : 'Chat (No Widget Selected)';
    }
    return 'Chat';
  };

  const getEmptyStateContent = () => {
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

    if (config.mode === 'rag' && !config.widgetId) {
      return (
        <div className="text-center space-y-4 p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ready to Chat
            </h3>
            <p className="text-gray-600 text-sm">
              Ask questions about your widget's content and uploaded documents
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center space-y-4 p-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <MessageCircle className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Start Chatting
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

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageCircle className="w-5 h-5" />
              {getHeaderTitle()}
            </CardTitle>
            
            <div className="flex items-center gap-2">
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
              
              {showDebugToggle && onDebugToggle && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDebugToggle(!config.enableDebug)}
                  className="p-1"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          
          {config.mode === 'rag' && config.widgetId && (
            <p className="text-sm text-gray-600">
              Searching widget: {config.widgetId}
            </p>
          )}
          
          {chat.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
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
        </CardHeader>
      )}
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ChatMessages
          messages={chat.messages}
          loading={chat.loading}
          showSources={config.enableSources}
          showDebug={config.enableDebug}
          emptyStateContent={getEmptyStateContent()}
        />
        
        <div className="flex-shrink-0">
          <ChatInput
            value={chat.inputValue}
            onChange={chat.setInputValue}
            onSend={handleSend}
            onCancel={chat.cancelMessage}
            disabled={!config.enabled}
            loading={chat.loading}
            placeholder={
              !config.enabled 
                ? "Create a widget to enable chat"
                : config.mode === 'rag'
                ? "Ask about your documents..."
                : "Type your message..."
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}