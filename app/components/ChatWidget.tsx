import { useState, useRef, useEffect } from "react";
import { Send, Minimize2, FileText, Headphones, Mic, MessageCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  apiEndpoint?: string;
  contentTarget?: string;
}

export function ChatWidget({ apiEndpoint = "/api/chat", contentTarget = "article, main, .content, #content" }: ChatWidgetProps) {
  const [currentView, setCurrentView] = useState<"main" | "chat">("main");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractPageContent = () => {
    try {
      const targetElement = document.querySelector(contentTarget);
      if (targetElement) {
        return {
          title: document.title,
          url: window.location.href,
          content: targetElement.textContent?.replace(/\s+/g, ' ').trim().slice(0, 3000) || ''
        };
      }
      
      // Fallback to basic page info
      return {
        title: document.title,
        url: window.location.href,
        content: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      };
    } catch (error) {
      console.warn('Failed to extract page content:', error);
      return {
        title: document.title,
        url: window.location.href,
        content: ''
      };
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const pageContent = extractPageContent();
      
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          context: pageContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Action Bar - Always Visible */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/20 backdrop-blur rounded-full shadow-lg border border-gray-300 px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img 
              src="/nativo-logo.png" 
              alt="Nativo" 
              className="w-6 h-6"
            />
            <span className="font-semibold text-gray-800 text-sm">AI</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {/* TODO: Implement summarize */}}
              className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Summarize"
            >
              <FileText size={16} className="text-gray-600 group-hover:text-gray-800" />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">Summarize</span>
            </button>
            
            <button
              onClick={() => {/* TODO: Implement listen */}}
              className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Listen to me"
            >
              <Headphones size={16} className="text-gray-600 group-hover:text-gray-800" />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">Listen to me</span>
            </button>
            
            <button
              onClick={() => {/* TODO: Implement speak */}}
              className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Speak with me"
            >
              <Mic size={16} className="text-gray-600 group-hover:text-gray-800" />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">Speak with me</span>
            </button>
            
            <button
              onClick={() => setCurrentView(currentView === "chat" ? "main" : "chat")}
              className={`flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group ${currentView === "chat" ? "bg-gray-100" : ""}`}
              title="Chat with me"
            >
              <MessageCircle size={16} className="text-gray-600 group-hover:text-gray-800" />
              <span className="text-xs text-gray-600 group-hover:text-gray-800">Chat with me</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Panel - Fixed to Right Side of Screen */}
      <div className={`fixed top-4 right-4 bottom-4 w-80 bg-white/30 backdrop-blur border border-gray-300 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-out transform z-40 ${currentView === "chat" ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
          <h3 className="font-semibold">Chat with Nativo AI</h3>
          <button
            onClick={() => setCurrentView("main")}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <Minimize2 size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-8">
              Hi! I'm your AI assistant. Ask me anything about this page or just say hello!
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-100" : "text-gray-500"
                }`}>
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
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

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}