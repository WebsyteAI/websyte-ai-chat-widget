import { useState, useRef, useEffect } from "react";
import { ArrowUp, Square, Minimize2, FileText, Headphones, MessageCircle, Play, Pause, X, SkipBack, SkipForward } from "lucide-react";
import { marked } from "marked";
import { ContentExtractor } from "../lib/content-extractor";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatWidgetProps {
  apiEndpoint?: string;
  baseUrl?: string;
  contentTarget?: string;
  advertiserName?: string;
  advertiserLogo?: string;
  isTargetedInjection?: boolean;
}

interface Recommendation {
  title: string;
  description: string;
}

// Configure marked for safe HTML rendering
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function ChatWidget({ apiEndpoint = "/api/chat", baseUrl = "", contentTarget = "article, main, .content, #content", advertiserName = "Nativo", advertiserLogo, isTargetedInjection = false }: ChatWidgetProps) {
  const [currentView, setCurrentView] = useState<"main" | "chat">("main");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [placeholder, setPlaceholder] = useState("Ask me about this content");
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(180); // 3 minutes as example
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentContent, setCurrentContent] = useState<"action" | "audio">("action");
  const [contentFadeClass, setContentFadeClass] = useState("");
  const [hasRendered, setHasRendered] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMarkdown = (content: string) => {
    return { __html: marked(content) };
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Trigger slide-in animation after component mounts
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load recommendations when component mounts
    const loadRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const pageContent = extractPageContent();
        
        const response = await fetch(`${baseUrl}/api/recommendations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: pageContent.content,
            url: pageContent.url,
            title: pageContent.title,
          }),
        });

        if (response.ok) {
          const data = await response.json() as { recommendations?: Recommendation[]; placeholder?: string };
          setRecommendations(data.recommendations || []);
          setPlaceholder(data.placeholder || "Ask me about this content");
        }
      } catch (error) {
        console.error("Failed to load recommendations:", error);
        // Set fallback recommendations
        setRecommendations([
          { title: "What is this about?", description: "Understand the main topic" },
          { title: "How does this work?", description: "Learn the process" },
          { title: "Why is this important?", description: "Explore the significance" },
          { title: "What are the implications?", description: "Consider the impact" },
          { title: "Who is this for?", description: "Identify the target audience" },
          { title: "What happens next?", description: "Explore future steps" }
        ]);
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    loadRecommendations();
  }, []);

  const extractPageContent = () => {
    try {
      const pageContent = ContentExtractor.extractPageContent(contentTarget);
      
      // Validate content quality
      if (!ContentExtractor.isValidContent(pageContent.content)) {
        console.warn('Extracted content failed validation, using meta description fallback');
        
        // Final fallback to meta description
        return {
          title: pageContent.title,
          url: pageContent.url,
          content: pageContent.description || ''
        };
      }
      
      return pageContent;
    } catch (error) {
      console.warn('Failed to extract page content:', error);
      return {
        title: document.title,
        url: window.location.href,
        content: document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
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

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const pageContent = extractPageContent();
      
      const response = await fetch(`${baseUrl}${apiEndpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.slice(-10),
          context: pageContent,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json() as { message?: string };
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message || "Sorry, I couldn't process your request.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const cancelMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Message cancelled.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, cancelMessage]);
      } else {
        console.error("Error sending message:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. Please try again.",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const cancelMessage = () => {
    if (abortController) {
      abortController.abort();
    }
  };

  const handleSummarize = async () => {
    if (isSummarizing) return;

    setIsSummarizing(true);
    setCurrentView("chat");

    try {
      const pageContent = extractPageContent();
      
      const response = await fetch(`${baseUrl}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: pageContent.content,
          url: pageContent.url,
          title: pageContent.title,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate summary");
      }

      const data = await response.json() as { summary?: string };
      
      const summaryMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `${data.summary || "No summary available."}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      console.error("Error generating summary:", error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I couldn't generate a summary right now. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // Simulate audio progress when playing
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
        setElapsedTime(prev => {
          const newTime = prev + (0.5 * totalTime) / 100;
          return newTime >= totalTime ? totalTime : newTime;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, totalTime]);

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.25, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleExitAudio = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsPlaying(false);
    setContentFadeClass("animate-fade-out");
    
    // After fade out, switch content and container size simultaneously
    setTimeout(() => {
      setCurrentContent("action");
      setAudioProgress(0);
      setElapsedTime(0);
      
      // Start fade in slightly after container starts resizing for smoother feel
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 180);
    }, 200);
  };

  const handleStartAudio = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setContentFadeClass("animate-fade-out");
    
    // After fade out, switch content and container size simultaneously
    setTimeout(() => {
      setCurrentContent("audio");
      
      // Start fade in slightly after container starts resizing for smoother feel
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 100);
    }, 200);
  };

  return (
    <>
      {/* Action Bar / Audio Player - Single Container */}
      <div className={`${isTargetedInjection ? 'relative top-0 left-0 mx-auto' : 'fixed top-4 left-1/2'} z-50 ${
        hasRendered ? (isTargetedInjection ? 'animate-fade-in' : 'animate-slide-in-from-top') : 'opacity-0 transform -translate-x-1/2'
      }`}>
        <div className={`bg-white/98 action-bar-blur shadow-lg border border-gray-300 px-4 py-2 flex items-center gap-3 ${
          currentContent === "audio" ? 'container-audio' : 'container-action'
        } ${
          isPlaying ? 'animate-audio-border' : ''
        }`}>
          
          {/* Content Container with Fade Animation */}
          <div className={`flex items-center justify-center gap-3 w-full ${contentFadeClass}`}>
            
            {currentContent === "action" ? (
              <>
                {/* Action Bar Content */}
                <div className="flex items-center gap-3">
                  {advertiserLogo || (advertiserName === "Nativo") ? (
                    <>
                      <img 
                        src={advertiserLogo || `${baseUrl}/nativo-logo.png`} 
                        alt={advertiserName} 
                        className="w-8 h-8 rounded"
                      />
                      <span className="font-bold text-gray-800 text-base">AI</span>
                    </>
                  ) : (
                    <span className="font-bold text-gray-800 text-base">{advertiserName} AI</span>
                  )}
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing || isTransitioning}
                    className="action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title="Summarize this page"
                  >
                    <FileText size={18} className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">
                      {isSummarizing ? "Summarizing..." : "Summarize"}
                    </span>
                  </button>
                  
                  <button
                    onClick={handleStartAudio}
                    disabled={isTransitioning}
                    className="action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50"
                    title="Listen to me"
                  >
                    <Headphones size={18} className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">Listen to me</span>
                  </button>
                  
                  <button
                    onClick={() => setCurrentView(currentView === "chat" ? "main" : "chat")}
                    disabled={isTransitioning}
                    className={`action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50 ${currentView === "chat" ? "bg-gray-100" : ""}`}
                    title="Chat with me"
                  >
                    <MessageCircle size={18} className="text-gray-600 group-hover:text-gray-800" />
                    <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">Chat with me</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Audio Player Content */}
                <button
                  onClick={handlePlayPause}
                  disabled={isTransitioning}
                  className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-sm transition-colors disabled:opacity-50"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} className="text-gray-700" /> : <Play size={20} className="text-gray-700" />}
                </button>

                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono min-w-fit">
                    {formatTime(elapsedTime)}/{formatTime(totalTime)}
                  </span>
                  <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${audioProgress}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={audioProgress}
                      onChange={(e) => setAudioProgress(Number(e.target.value))}
                      disabled={isTransitioning}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSpeedChange}
                  disabled={isTransitioning}
                  className="bg-white hover:bg-gray-50 px-2 py-1 rounded text-sm font-medium text-gray-700 transition-colors shadow-sm disabled:opacity-50"
                  title="Playback speed"
                >
                  {playbackSpeed}x
                </button>

                <button
                  onClick={handleExitAudio}
                  disabled={isTransitioning}
                  className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-sm transition-colors disabled:opacity-50"
                  title="Exit audio player"
                >
                  <X size={18} className="text-gray-700" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Chat Panel */}
      <div className={`fixed top-4 right-4 bottom-4 w-[28rem] bg-white border border-gray-200 rounded-lg shadow-xl flex flex-col transition-all duration-300 ease-out transform z-40 ${
        currentView === "chat" ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        <div className="flex items-center justify-between p-4 rounded-t-lg">
          <h3 className="font-semibold text-gray-900">Chat with {advertiserName} AI</h3>
          <button
            onClick={() => setCurrentView("main")}
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
                          onClick={async () => {
                            setCurrentView("chat");
                            
                            // Send the message directly with the recommendation text
                            if (isLoading) return;

                            const userMessage: Message = {
                              id: Date.now().toString(),
                              role: "user",
                              content: rec.title,
                              timestamp: new Date(),
                            };

                            setMessages(prev => [...prev, userMessage]);
                            setInputValue("");
                            setIsLoading(true);

                            const controller = new AbortController();
                            setAbortController(controller);

                            try {
                              const pageContent = extractPageContent();
                              
                              const response = await fetch(`${baseUrl}${apiEndpoint}`, {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  message: rec.title,
                                  history: messages.slice(-10),
                                  context: pageContent,
                                }),
                                signal: controller.signal,
                              });

                              if (!response.ok) {
                                throw new Error("Failed to send message");
                              }

                              const data = await response.json() as { message?: string };
                              
                              const assistantMessage: Message = {
                                id: (Date.now() + 1).toString(),
                                role: "assistant",
                                content: data.message || "Sorry, I couldn't process your request.",
                                timestamp: new Date(),
                              };

                              setMessages(prev => [...prev, assistantMessage]);
                            } catch (error) {
                              if (error instanceof Error && error.name === 'AbortError') {
                                const cancelMessage: Message = {
                                  id: (Date.now() + 1).toString(),
                                  role: "assistant",
                                  content: "Message cancelled.",
                                  timestamp: new Date(),
                                };
                                setMessages(prev => [...prev, cancelMessage]);
                              } else {
                                console.error("Error sending message:", error);
                                const errorMessage: Message = {
                                  id: (Date.now() + 1).toString(),
                                  role: "assistant",
                                  content: "Sorry, I'm having trouble connecting right now. Please try again.",
                                  timestamp: new Date(),
                                };
                                setMessages(prev => [...prev, errorMessage]);
                              }
                            } finally {
                              setIsLoading(false);
                              setAbortController(null);
                            }
                          }}
                        >
                          <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
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
                {message.role === "assistant" ? (
                  <div 
                    className="text-sm prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0"
                    dangerouslySetInnerHTML={renderMarkdown(message.content)}
                  />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
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

        <div className="p-4">
          <div className="flex items-center bg-gray-100 rounded-lg p-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-sm placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={isLoading ? cancelMessage : sendMessage}
              disabled={!isLoading && !inputValue.trim()}
              className="bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors flex items-center justify-center shadow-sm ml-2"
            >
              {isLoading ? <Square size={16} /> : <ArrowUp size={16} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}