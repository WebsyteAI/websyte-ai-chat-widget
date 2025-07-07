import { useRef, useEffect, useState, useCallback } from "react";
import { useChatMessages } from "../ChatWidget/hooks";
import { ChatMessage } from "../ChatWidget/components/ChatMessage";
import { MessageInput } from "../ChatWidget/components/MessageInput";
import { DynamicIslandHeader } from "./DynamicIslandHeader";
import { Marquee } from "../ui/marquee";
import type { Recommendation, Message, WidgetLink } from "../ChatWidget/types";

interface ChatPanelProps {
  widgetId?: string;
  widgetName: string;
  widgetLogo?: string;
  baseUrl?: string;
  hidePoweredBy?: boolean;
  placeholder?: string;
  recommendations?: Recommendation[];
  isEmbed?: boolean;
  className?: string;
  saveChatMessages?: boolean;
  autoFocus?: boolean;
}

export function ChatPanel({
  widgetId,
  widgetName,
  widgetLogo,
  baseUrl = "",
  hidePoweredBy = false,
  placeholder: propPlaceholder,
  recommendations: propRecommendations,
  isEmbed = false,
  className = "",
  saveChatMessages = false,
  autoFocus = false,
}: ChatPanelProps) {
  const { messages, addMessage } = useChatMessages();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] =
    useState<AbortController | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    propRecommendations || []
  );
  const [placeholder, setPlaceholder] = useState(
    propPlaceholder || "Ask me anything..."
  );
  const [widgetLinks, setWidgetLinks] = useState<WidgetLink[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const focusInput = () => {
    if (!autoFocus) return;

    // Find the textarea in the MessageInput component and focus it
    setTimeout(() => {
      const textarea = containerRef.current?.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }, 100); // Small delay to ensure DOM is updated
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages]);

  // Load widget recommendations and links
  useEffect(() => {
    if (widgetId) {
      console.log('[ChatPanel] Fetching widget data for:', widgetId);
      fetch(`${baseUrl}/api/public/widget/${widgetId}`)
        .then((res) => res.json())
        .then((data: any) => {
          if (data.recommendations && data.recommendations.length > 0) {
            setRecommendations(data.recommendations);
            setPlaceholder(`Ask me about ${widgetName}...`);
          }
          // Load links as well
          if (data.links && data.links.length > 0) {
            console.log('[ChatPanel] Setting widget links:', data.links);
            setWidgetLinks(data.links);
          } else {
            console.log('[ChatPanel] No links found in widget data');
          }
        })
        .catch((err) =>
          console.error("Failed to load widget data:", err)
        );
    }
  }, [widgetId, widgetName, baseUrl]);

  // Focus input on mount
  useEffect(() => {
    focusInput();
  }, []);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const messageContent = inputValue.trim();
    const userMessage = addMessage({
      role: "user",
      content: messageContent,
    });

    setInputValue("");
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          ...(widgetId && { widgetId }),
          isEmbedded: saveChatMessages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = (await response.json()) as {
        message?: string;
        sources?: any[];
      };

      addMessage({
        role: "assistant",
        content: data.message || "Sorry, I couldn't process your request.",
        sources: data.sources,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        addMessage({
          role: "assistant",
          content: "Message cancelled.",
        });
      } else {
        addMessage({
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
      // Focus input after message is sent
      focusInput();
    }
  };

  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleRecommendationClick = async (rec: Recommendation) => {
    // Directly send the recommendation without updating input
    if (isLoading) return;

    const userMessage = addMessage({
      role: "user",
      content: rec.title,
    });

    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          ...(widgetId && { widgetId }),
          isEmbedded: saveChatMessages,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = (await response.json()) as {
        message?: string;
        sources?: any[];
      };

      addMessage({
        role: "assistant",
        content: data.message || "Sorry, I couldn't process your request.",
        sources: data.sources,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        addMessage({
          role: "assistant",
          content: "Message cancelled.",
        });
      } else {
        addMessage({
          role: "assistant",
          content:
            "Sorry, I'm having trouble connecting right now. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
      // Focus input after message is sent
      focusInput();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`${isEmbed ? "absolute" : "fixed"} inset-0 flex flex-col bg-background ${className}`}
    >
      {/* Header wrapped in Dynamic Island */}
      <DynamicIslandHeader
        advertiserName={widgetName}
        advertiserLogo={widgetLogo}
        baseUrl={baseUrl}
        hidePoweredBy={hidePoweredBy}
        isEmbed={isEmbed}
      />

      {/* Content wrapper with relative positioning */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Messages area - scrollable with padding for floating header and input */}
        <div className="flex-1 overflow-y-auto min-h-0 pt-24 pb-28 scrollbar-stable z-0">
          {messages.length === 0 && recommendations.length > 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-full max-w-3xl">
                  <p className="text-sm text-gray-500 text-center mb-4">
                    Try asking:
                  </p>
                  <div className="relative">
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

                    <Marquee pauseOnHover className="[--gap:0.75rem]">
                      {recommendations.slice(0, 4).map((rec, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors flex-shrink-0 w-64"
                          onClick={() => handleRecommendationClick(rec)}
                        >
                          <h3 className="font-medium text-sm text-gray-900 mb-1">
                            {rec.title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {rec.description}
                          </p>
                        </div>
                      ))}
                    </Marquee>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-5 md:p-6 flex flex-col gap-3 sm:gap-4 max-w-4xl mx-auto w-full">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  avatarUrl={widgetLogo}
                />
              ))}

              {isLoading && (
                <div className="flex flex-col items-start max-w-[80%]">
                  <div className="mb-2 px-3">
                    <img
                      src={widgetLogo || "https://websyte.ai/websyte-ai-logo.svg"}
                      alt="AI Assistant"
                      className="w-6 h-6 rounded-full"
                    />
                  </div>
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

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Dynamic Island input now floats independently */}
        <MessageInput
          inputValue={inputValue}
          placeholder={placeholder}
          isLoading={isLoading}
          onInputChange={setInputValue}
          onKeyDown={handleKeyDown}
          onSend={sendMessage}
          onCancel={cancelMessage}
          links={widgetLinks}
        />
      </div>
    </div>
  );
}
