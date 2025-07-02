import { useState, useEffect, useCallback } from "react";
import { demoMessages, demoRecommendations, findBestResponse } from "./demo-messages";
import { defaultComponentRegistry } from "./component-registry";
import { DemoDataProvider } from "./DemoDataContext";
import { EnhancedChatPanel } from "@/components/ChatWidget/components";
import type { Message, Recommendation } from "@/components/ChatWidget/types";
import { v4 as uuidv4 } from "uuid";

export function LandingPageChat() {
  // Initialize with welcome message to prevent empty state flash
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: "assistant",
      content: demoMessages.welcome.content,
      timestamp: new Date(),
    }
  ]);

  // Handle incoming messages
  const handleMessage = useCallback(async (content: string): Promise<Message> => {
    // Find the best matching response
    const response = findBestResponse(content);
    
    if (response) {
      return {
        id: uuidv4(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };
    }

    // Fallback response
    return {
      id: uuidv4(),
      role: "assistant",
      content: `I understand you're asking about "${content}". Let me help you explore Websyte AI's features. You can ask me about:

- Our features and capabilities
- How to get started
- Pricing (spoiler: it's free!)
- Technical details
- See a demo

What would you like to know more about?`,
      timestamp: new Date(),
    };
  }, []);

  // Custom chat handler that intercepts messages
  const handleChatMessage = useCallback(async (userMessage: string) => {
    // Add user message
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    // Generate and add assistant response
    const assistantMsg = await handleMessage(userMessage);
    setMessages(prev => [...prev, assistantMsg]);

    return assistantMsg;
  }, [handleMessage]);

  // Handle recommendation clicks
  const handleRecommendationClick = useCallback(async (recommendation: Recommendation) => {
    await handleChatMessage(recommendation.title);
  }, [handleChatMessage]);

  return (
    <DemoDataProvider>
      <div className="h-screen flex flex-col">
        <LandingChatWidget
          messages={messages}
          onSendMessage={handleChatMessage}
          recommendations={demoRecommendations}
          onRecommendationClick={handleRecommendationClick}
          componentRegistry={defaultComponentRegistry}
        />
      </div>
    </DemoDataProvider>
  );
}

// Wrapper component that integrates with ChatWidget
interface LandingChatWidgetProps {
  messages: Message[];
  onSendMessage: (message: string) => Promise<Message>;
  recommendations: Recommendation[];
  onRecommendationClick: (recommendation: Recommendation) => Promise<void>;
  componentRegistry: any;
}

function LandingChatWidget({ 
  messages, 
  onSendMessage, 
  recommendations,
  onRecommendationClick,
  componentRegistry 
}: LandingChatWidgetProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue;
    setInputValue("");
    setIsLoading(true);
    
    try {
      await onSendMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <EnhancedChatPanel
      currentView="chat"
      messages={messages}
      inputValue={inputValue}
      placeholder="Ask me about Websyte AI..."
      isLoading={isLoading}
      recommendations={recommendations}
      isLoadingRecommendations={false}
      advertiserName="Websyte AI"
      advertiserLogo="/websyte-ai-logo.svg"
      baseUrl=""
      hidePoweredBy={true}
      summaries={null}
      currentContentMode="original"
      mainContentElement={null}
      onClose={() => {}}
      onInputChange={setInputValue}
      onKeyDown={handleKeyDown}
      onSendMessage={handleSend}
      onCancelMessage={() => setIsLoading(false)}
      onRecommendationClick={onRecommendationClick}
      isFullScreen={true}
      isEmbed={false}
      componentRegistry={componentRegistry}
      enableComponents={true}
      fullWidthMessages={true}
      showEmptyState={false}
    />
  );
}