import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth/auth-context";
import { Navigate } from "react-router";
import { ChatWidget } from "../components/ChatWidget";

interface Widget {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  userId?: string;
}

export default function Test() {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const [widgetId, setWidgetId] = useState("");
  const [testMode, setTestMode] = useState<"standard" | "custom">("standard");
  const [advertiserName, setAdvertiserName] = useState("Test Company");
  const [advertiserLogo, setAdvertiserLogo] = useState("");
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loadingWidgets, setLoadingWidgets] = useState(false);
  const [renderMode, setRenderMode] = useState<"floating" | "target">("floating");
  const [loadMode, setLoadMode] = useState<"import" | "script">("import");

  // Load all widgets for admin testing
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const loadWidgets = async () => {
        setLoadingWidgets(true);
        try {
          const response = await fetch('/api/admin/widgets');
          if (response.ok) {
            const data = await response.json() as { widgets: Widget[] };
            setWidgets(data.widgets || []);
          } else {
            console.error('Failed to load widgets:', response.statusText);
          }
        } catch (error) {
          console.error('Error loading widgets:', error);
        } finally {
          setLoadingWidgets(false);
        }
      };

      loadWidgets();
    }
  }, [isAuthenticated, isAdmin]);

  // Handle script tag loading/unloading
  useEffect(() => {
    if (loadMode === "script") {
      // Remove any existing widget script
      const existingScript = document.getElementById("websyte-widget-script");
      if (existingScript) {
        existingScript.remove();
      }

      // Remove any existing widget container
      const existingContainer = document.querySelector('[data-websyte-widget-container]');
      if (existingContainer) {
        existingContainer.remove();
      }

      // Create and append script
      const script = document.createElement("script");
      script.id = "websyte-widget-script";
      script.src = "/dist/widget.js";
      script.async = true;
      
      // Set data attributes
      script.dataset.advertiserName = advertiserName;
      if (advertiserLogo) {
        script.dataset.advertiserLogo = advertiserLogo;
      }
      if (testMode === "custom" && widgetId) {
        script.dataset.widgetId = widgetId;
      }
      if (renderMode === "target") {
        script.dataset.targetElement = "#chat-widget-target";
      }

      document.body.appendChild(script);

      // Cleanup on unmount or when dependencies change
      return () => {
        const scriptToRemove = document.getElementById("websyte-widget-script");
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
        const containerToRemove = document.querySelector('[data-websyte-widget-container]');
        if (containerToRemove) {
          containerToRemove.remove();
        }
      };
    }
  }, [loadMode, advertiserName, advertiserLogo, testMode, widgetId, renderMode]);

  // Check if user is admin
  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        minHeight: "100vh",
        fontSize: "1.2rem"
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <div style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f5f5f5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Admin Notice */}
        <div style={{ 
          backgroundColor: "#f0f9ff", 
          border: "1px solid #0ea5e9",
          padding: "1rem", 
          borderRadius: "8px", 
          marginBottom: "2rem"
        }}>
          <h4 style={{ color: "#0369a1", margin: "0 0 0.5rem 0" }}>🔧 Admin Testing Environment</h4>
          <p style={{ color: "#0369a1", margin: 0, fontSize: "0.9rem" }}>
            Welcome, {user?.name}! You have admin access to test all widgets in the system.
          </p>
        </div>

        {/* Control Panel */}
        <div style={{ 
          backgroundColor: "white", 
          padding: "2rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Chat Widget Testing Playground</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            {/* Test Mode Selection */}
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#555" }}>Test Mode</h3>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    value="standard"
                    checked={testMode === "standard"}
                    onChange={(e) => setTestMode(e.target.value as "standard" | "custom")}
                  />
                  Standard Chat (Page Content)
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <input
                    type="radio"
                    value="custom"
                    checked={testMode === "custom"}
                    onChange={(e) => setTestMode(e.target.value as "standard" | "custom")}
                  />
                  Custom Widget (RAG)
                </label>
              </div>
              
              {testMode === "custom" && (
                <div>
                  <label style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}>
                    Select Widget:
                  </label>
                  {loadingWidgets ? (
                    <div style={{ padding: "0.5rem", color: "#666" }}>Loading widgets...</div>
                  ) : (
                    <>
                      <select
                        value={widgetId}
                        onChange={(e) => setWidgetId(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          fontSize: "0.9rem",
                          backgroundColor: "white"
                        }}
                      >
                        <option value="">-- Select a widget --</option>
                        {widgets.map((widget) => (
                          <option key={widget.id} value={widget.id}>
                            {widget.name} ({widget.isPublic ? 'Public' : 'Private'}) 
                            {widget.userId && ` - ${widget.userId.substring(0, 8)}...`}
                          </option>
                        ))}
                      </select>
                      <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
                        {widgets.length} widgets available • All widgets shown for admin testing
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
            
            {/* Widget Configuration */}
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#555" }}>Widget Configuration</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}>
                  Advertiser Name:
                </label>
                <input
                  type="text"
                  value={advertiserName}
                  onChange={(e) => setAdvertiserName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}>
                  Advertiser Logo URL:
                </label>
                <input
                  type="text"
                  value={advertiserLogo}
                  onChange={(e) => setAdvertiserLogo(e.target.value)}
                  placeholder="https://logo.clearbit.com/example.com"
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem"
                  }}
                />
              </div>
            </div>
            
            {/* Rendering Options */}
            <div>
              <h3 style={{ marginBottom: "1rem", color: "#555" }}>Rendering Options</h3>
              
              {/* Render Mode */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}>
                  Display Mode:
                </label>
                <select
                  value={renderMode}
                  onChange={(e) => setRenderMode(e.target.value as "floating" | "target")}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    backgroundColor: "white"
                  }}
                >
                  <option value="floating">Floating Widget (bottom-right)</option>
                  <option value="target">Target Element (embedded in page)</option>
                </select>
              </div>
              
              {/* Load Mode */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#666" }}>
                  Load Method:
                </label>
                <select
                  value={loadMode}
                  onChange={(e) => setLoadMode(e.target.value as "import" | "script")}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    backgroundColor: "white"
                  }}
                >
                  <option value="import">Direct Import (React Component)</option>
                  <option value="script">Script Tag (Production Mode)</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Current Configuration Display */}
          <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
            <h4 style={{ marginBottom: "0.5rem", color: "#333" }}>Current Configuration:</h4>
            <code style={{ fontSize: "0.8rem", color: "#666", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {(() => {
                let scriptTag = '<script src="/dist/widget.js"';
                scriptTag += ` data-advertiser-name="${advertiserName}"`;
                if (advertiserLogo) {
                  scriptTag += ` data-advertiser-logo="${advertiserLogo}"`;
                }
                if (testMode === "custom" && widgetId) {
                  scriptTag += ` data-widget-id="${widgetId}"`;
                }
                if (renderMode === "target") {
                  scriptTag += ` data-target-element="#chat-widget-target"`;
                }
                scriptTag += ' async></script>';
                return scriptTag;
              })()}
            </code>
            
            {/* Display mode-specific notes */}
            {loadMode === "import" && renderMode === "target" && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#e74c3c" }}>
                ⚠️ Target element rendering is only supported with script tag mode. Switch to "Script Tag" load method to test target element rendering.
              </p>
            )}
            
            {loadMode === "script" && (
              <p style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "#27ae60" }}>
                ✓ Widget loaded via script tag. The widget will appear {renderMode === "floating" ? "in the bottom-right corner" : "in the target element below"}.
              </p>
            )}
          </div>
        </div>

        {/* Sample Article Content */}
        <div style={{ 
          backgroundColor: "white", 
          padding: "3rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <article>
            <header style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
              <h1 style={{ color: "#333", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem", lineHeight: "1.2" }}>
                The Orb Will See You Now
              </h1>
              <p style={{ color: "#666", fontSize: "1rem", marginBottom: "0.5rem" }}>
                By Billy Perrigo/San Francisco and Seoul
              </p>
              <p style={{ color: "#999", fontSize: "0.9rem" }}>
                Published in TIME Magazine
              </p>
            </header>

            <div style={{ color: "#444", lineHeight: "1.8", fontSize: "1.1rem" }}>
              {/* Target element for inline widget placement */}
              <div id="chat-widget-target" style={{
                border: renderMode === "target" ? "2px dashed #ddd" : "none",
                borderRadius: renderMode === "target" ? "8px" : "0",
                minHeight: renderMode === "target" ? "400px" : "0",
                backgroundColor: renderMode === "target" ? "#fafafa" : "transparent",
                marginBottom: "1.5rem",
                padding: renderMode === "target" ? "1rem" : "0"
              }}></div>

              <p style={{ marginBottom: "1.5rem" }}>
                Sam Altman's latest venture looks like something out of science fiction: a white, basketball-sized 
                sphere that peers into your eyes with an array of cameras and sensors. The Orb, as it's called, 
                is designed to solve what Altman believes is one of the most pressing challenges of our time—proving 
                you're human in an age of artificial intelligence.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                The device works by scanning your iris, mapping its unique pattern, and generating what the company 
                calls an "iris code"—a 12,800-digit binary sequence that serves as your digital fingerprint. In 
                exchange for this biometric data, users receive approximately $42 worth of cryptocurrency called 
                Worldcoin, part of Altman's ambitious plan to create a global "proof-of-humanity" network.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                "We needed some way for identifying, authenticating humans in the age of AGI," Altman explains, 
                referring to artificial general intelligence. "We wanted a way to make sure that humans stayed 
                special and central." The project, which launched publicly in July 2023, has already scanned 
                millions of irises across 35 countries, with the goal of reaching 50 million verifications by 2025.
              </p>

              <blockquote style={{ 
                margin: "2rem 0", 
                padding: "1.5rem", 
                backgroundColor: "#f9f9f9", 
                borderLeft: "4px solid #007acc",
                fontStyle: "italic",
                fontSize: "1.2rem"
              }}>
                "We needed some way for identifying, authenticating humans in the age of AGI. We wanted a way to 
                make sure that humans stayed special and central."
              </blockquote>

              <p style={{ marginBottom: "1.5rem" }}>
                The technology behind Worldcoin represents a convergence of several cutting-edge fields: biometric 
                identification, blockchain technology, and cryptocurrency. Users who verify their humanity through 
                the Orb receive a cryptographic "World ID" that can theoretically be used across the internet to 
                prove they're not a bot or AI system.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                But the project has faced significant skepticism and regulatory challenges. Privacy advocates worry 
                about the implications of a centralized database of biometric data, even though Worldcoin claims 
                the iris codes are anonymized and the original scan data is deleted. Governments in several countries 
                have suspended or banned the Orb scanning operations, citing data protection concerns.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                The rollout has been particularly aggressive in developing countries, where the $42 cryptocurrency 
                reward represents a more significant sum relative to local wages. Critics argue this creates an 
                exploitative dynamic, potentially coercing people into trading their biometric data for immediate 
                financial gain without fully understanding the long-term implications.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                Altman argues that such a system will become necessary as AI becomes more sophisticated. "In a world 
                where AI can generate increasingly convincing text, images, and videos, how do we distinguish between 
                human-created and AI-generated content?" he asks. "How do we ensure that humans retain agency and 
                control in digital spaces?"
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                The Worldcoin project also includes plans for universal basic income distribution through cryptocurrency, 
                funded by the growing value of the Worldcoin token. The idea is that as AI automation displaces human 
                jobs, verified humans could receive regular cryptocurrency payments to support themselves.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                Technical experts have raised questions about the system's scalability and security. Storing and 
                managing biometric data for billions of people presents enormous technical challenges, and any 
                security breach could have catastrophic consequences. There are also concerns about the centralization 
                of such a system under the control of a single organization.
              </p>

              <p style={{ marginBottom: "1.5rem" }}>
                Despite the controversies, Altman remains optimistic about the project's potential. He envisions 
                a future where World ID becomes the standard for human verification online, integrated into social 
                media platforms, financial services, and government systems. The goal is to create a more trustworthy 
                internet where users can verify their humanity without revealing their identity.
              </p>

              <p>
                As AI continues to advance and the line between human and artificial intelligence blurs, projects 
                like Worldcoin represent one possible path forward. Whether Altman's vision of iris-scanned identity 
                verification becomes reality or remains a curious footnote in tech history may depend on society's 
                willingness to trade privacy for authenticity in the digital age.
              </p>
            </div>
          </article>
        </div>

      </div>

      {/* Only render ChatWidget component when using import mode */}
      {loadMode === "import" && renderMode === "floating" && (
        <ChatWidget 
          advertiserName={advertiserName}
          advertiserLogo={advertiserLogo || undefined}
          widgetId={testMode === "custom" && widgetId ? widgetId : undefined}
        />
      )}
      
      {/* For target mode with import, we need to render it inside a portal or handle differently */}
      {loadMode === "import" && renderMode === "target" && (
        <div style={{ display: "none" }}>
          {/* Note: Target element rendering with direct import is not supported yet */}
          {/* The script tag method should be used for target element rendering */}
        </div>
      )}
    </div>
  );
}