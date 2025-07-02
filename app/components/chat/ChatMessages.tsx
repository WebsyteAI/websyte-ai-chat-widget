import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import type { ChatMessage as ChatMessageType } from "./types";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  loading?: boolean;
  showSources?: boolean;
  showDebug?: boolean;
  emptyStateContent?: React.ReactNode;
  fullWidth?: boolean;
}

export function ChatMessages({ 
  messages, 
  loading = false, 
  showSources = true, 
  showDebug = false,
  emptyStateContent,
  fullWidth = false 
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-1 min-h-0">
      {/* Empty State */}
      {messages.length === 0 && !loading && emptyStateContent && (
        <div className="flex items-center justify-center h-full">
          {emptyStateContent}
        </div>
      )}

      {/* Messages */}
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          showSources={showSources}
          showDebug={showDebug}
          fullWidth={fullWidth}
        />
      ))}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-start mb-4">
          <div className="text-gray-800 p-3 rounded-lg">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div 
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
                style={{ animationDelay: "0.2s" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} />
    </div>
  );
}