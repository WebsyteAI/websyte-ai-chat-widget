import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import type { MetaFunction } from "react-router";
import { ChatPanel } from "../components/chat-panel";

interface Widget {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isPublic: boolean;
  createdAt: string;
  fileCount?: number;
  embeddingsCount?: number;
}

interface LoadingState {
  loading: boolean;
  error?: string;
  widget?: Widget;
}

// Meta function for SEO
export const meta: MetaFunction = ({ params, data, location }: any) => {
  const searchParams = new URLSearchParams(location.search);
  const isEmbed = searchParams.get('embed') === 'true';
  
  // Prevent search engine indexing for embed URLs
  const baseMetaTags = isEmbed ? [
    { name: "robots", content: "noindex, nofollow" },
    { name: "googlebot", content: "noindex, nofollow" },
  ] : [];
  
  if (data?.widget) {
    const widget = data.widget;
    const title = `${widget.name} - WebsyteAI`;
    const description = widget.description || `Chat with ${widget.name} AI assistant`;
    const url = `https://websyte.ai/share/w/${widget.id}`;
    
    return [
      ...baseMetaTags,
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "WebsyteAI" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ];
  }
  
  return [
    ...baseMetaTags,
    { title: "Widget - WebsyteAI" },
    { name: "description", content: "AI-powered chat widget" },
  ];
};

export default function ShareWidget() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<LoadingState>({ loading: true });
  
  // Detect embed mode from URL params or iframe context
  const isEmbedParam = searchParams.get('embed') === 'true' || searchParams.get('embedded') === 'true';
  const [isInIframe, setIsInIframe] = useState(false);
  
  useEffect(() => {
    // Check if we're running in an iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      // If we can't access window.top due to cross-origin, we're likely in an iframe
      setIsInIframe(true);
    }
  }, []);
  
  const isEmbed = isEmbedParam || isInIframe;

  useEffect(() => {
    if (!id) {
      setState({ 
        loading: false, 
        error: "Widget ID is required" 
      });
      return;
    }

    const loadWidget = async () => {
      try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        const response = await fetch(`/api/public/widget/${id}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status === 404) {
            setState({ 
              loading: false, 
              error: "Widget not found" 
            });
          } else if (response.status === 403) {
            setState({ 
              loading: false, 
              error: "This widget is not publicly accessible" 
            });
          } else {
            setState({ 
              loading: false, 
              error: "Failed to load widget" 
            });
          }
          return;
        }

        const result = await response.json();
        const widget = result.widget as Widget;
        setState({ 
          loading: false, 
          widget 
        });
      } catch (error) {
        console.error('Error loading widget:', error);
        
        let errorMessage = "Failed to connect to server";
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            errorMessage = "Request timed out. Please check your connection and try again.";
          } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
            errorMessage = "Network error. Please check your internet connection.";
          }
        }
        
        setState({ 
          loading: false, 
          error: errorMessage 
        });
      }
    };

    loadWidget();
  }, [id]);

  // Add iframe-specific styles and PostMessage support if in embed mode
  useEffect(() => {
    if (isEmbed) {
      // Add styles to make the iframe content fill the container
      const style = document.createElement('style');
      style.textContent = `
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden;
        }
        #root {
          height: 100%;
        }
      `;
      document.head.appendChild(style);
      
      // Send ready message to parent
      if (window.parent !== window) {
        window.parent.postMessage({ 
          type: 'widget-ready', 
          widgetId: id,
          timestamp: Date.now() 
        }, '*');
      }
      
      // Listen for messages from parent
      const handleMessage = (event: MessageEvent) => {
        // In production, verify origin
        console.log('Widget received message:', event.data);
        
        // Handle different message types
        switch (event.data.type) {
          case 'ping':
            event.source?.postMessage({ 
              type: 'pong', 
              timestamp: Date.now() 
            }, event.origin as any);
            break;
          case 'resize':
            // Handle resize request if needed
            if (event.data.data?.height) {
              // Widget could adjust its internal layout
              console.log('Resize request:', event.data.data.height);
            }
            break;
          case 'theme':
            // Handle theme changes if supported
            console.log('Theme change:', event.data.data);
            break;
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Send initial height
      const sendHeight = () => {
        const height = document.documentElement.scrollHeight;
        if (window.parent !== window) {
          window.parent.postMessage({ 
            type: 'resize', 
            height,
            timestamp: Date.now() 
          }, '*');
        }
      };
      
      // Send height on load and resize
      setTimeout(sendHeight, 100);
      const resizeObserver = new ResizeObserver(sendHeight);
      resizeObserver.observe(document.body);
      
      return () => {
        document.head.removeChild(style);
        window.removeEventListener('message', handleMessage);
        resizeObserver.disconnect();
      };
    }
  }, [isEmbed, id]);

  // Loading state
  if (state.loading) {
    return (
      <>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          minHeight: isEmbed ? "100%" : "100vh",
          height: isEmbed ? "100%" : "auto",
          backgroundColor: "#f8fafc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e2e8f0",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem"
            }}></div>
            <p style={{ 
              fontSize: "1.1rem", 
              color: "#64748b",
              margin: 0
            }}>
              Loading widget...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: isEmbed ? "100%" : "100vh",
        height: isEmbed ? "100%" : "auto",
        backgroundColor: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{ 
          textAlign: "center",
          maxWidth: "400px",
          padding: "2rem"
        }}>
          <div style={{
            width: "48px",
            height: "48px",
            backgroundColor: "#fef2f2",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem"
          }}>
            <span style={{ fontSize: "24px" }}>⚠️</span>
          </div>
          <h1 style={{ 
            fontSize: "1.5rem", 
            color: "#374151",
            marginBottom: "0.5rem",
            fontWeight: "600"
          }}>
            Widget Unavailable
          </h1>
          <p style={{ 
            fontSize: "1rem", 
            color: "#64748b",
            margin: isEmbed ? "0" : "0 0 1.5rem 0"
          }}>
            {state.error}
          </p>
          {!isEmbed && (
            <a 
              href="/" 
              style={{
                display: "inline-block",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                textDecoration: "none",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "background-color 0.2s"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2563eb"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#3b82f6"}
            >
              Go to WebsyteAI
            </a>
          )}
        </div>
      </div>
    );
  }

  // Success state - render full-screen widget
  if (state.widget) {
    // Minimal layout for embed mode
    if (isEmbed) {
      return (
        <div style={{ 
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f8fafc",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        }}>
          <ChatPanel 
            widgetId={state.widget.id}
            widgetName={state.widget.name}
            widgetLogo={state.widget.logoUrl}
            baseUrl=""
            saveChatMessages={true} // Save messages for public shared widgets
            hidePoweredBy={false} // Show "Powered by Websyte.ai" in chat header
            isEmbed={true} // Pass embed mode to ChatPanel
          />
        </div>
      );
    }
    
    // Regular layout - render full-screen ChatPanel directly
    return (
      <ChatPanel 
        widgetId={state.widget.id}
        widgetName={state.widget.name}
        widgetLogo={state.widget.logoUrl}
        baseUrl=""
        saveChatMessages={true} // Save messages for public shared widgets
        hidePoweredBy={false} // Show "Powered by Websyte.ai" in chat header
      />
    );
  }

  return null;
}