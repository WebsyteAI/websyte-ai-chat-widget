import { useState, useEffect } from "react";
import { useParams } from "react-router";
import type { MetaFunction } from "react-router";
import { ChatWidget } from "../components/ChatWidget";

interface Widget {
  id: string;
  name: string;
  description?: string;
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
export const meta: MetaFunction = ({ params, data }: any) => {
  if (data?.widget) {
    const widget = data.widget;
    const title = `${widget.name} - WebsyteAI`;
    const description = widget.description || `Chat with ${widget.name} AI assistant`;
    const url = `https://websyte.ai/share/w/${widget.id}`;
    
    return [
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
    { title: "Widget - WebsyteAI" },
    { name: "description", content: "AI-powered chat widget" },
  ];
};

export default function ShareWidget() {
  const { id } = useParams();
  const [state, setState] = useState<LoadingState>({ loading: true });

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

        const response = await fetch(`/api/widgets/${id}/public`, {
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
          minHeight: "100vh",
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
        minHeight: "100vh",
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
            margin: "0 0 1.5rem 0"
          }}>
            {state.error}
          </p>
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
        </div>
      </div>
    );
  }

  // Success state - render full-screen widget
  if (state.widget) {
    return (
      <div style={{ 
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        {/* Widget Header with Information */}
        <div style={{
          backgroundColor: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "1rem 2rem"
        }}>
          <div style={{ 
            maxWidth: "1200px", 
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem"
          }}>
            <div>
              <h1 style={{ 
                fontSize: "1.5rem", 
                fontWeight: "600", 
                color: "#1f2937",
                margin: "0 0 0.25rem 0"
              }}>
                {state.widget.name}
              </h1>
              {state.widget.description && (
                <p style={{ 
                  color: "#6b7280", 
                  margin: 0,
                  fontSize: "0.9rem"
                }}>
                  {state.widget.description}
                </p>
              )}
              {(state.widget.fileCount || state.widget.embeddingsCount) && (
                <div style={{ 
                  marginTop: "0.5rem",
                  fontSize: "0.8rem",
                  color: "#9ca3af"
                }}>
                  Knowledge Base: {state.widget.fileCount || 0} files, {state.widget.embeddingsCount || 0} embeddings
                </div>
              )}
            </div>
            <div style={{ 
              fontSize: "0.8rem", 
              color: "#6b7280"
            }}>
              Powered by WebsyteAI
            </div>
          </div>
        </div>
        
        {/* Full-screen ChatWidget */}
        <ChatWidget 
          widgetId={state.widget.id}
          advertiserName={state.widget.name}
          advertiserUrl="https://websyte.ai"
          isFullScreen={true}
          saveChatMessages={true} // Save messages for public shared widgets
          hidePoweredBy={false} // Show "Powered by Websyte.ai" in chat header
        />
      </div>
    );
  }

  return null;
}