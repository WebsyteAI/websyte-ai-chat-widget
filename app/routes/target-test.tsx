import { useEffect } from "react";

export default function TargetTest() {
  // Inject widgets after component mounts to avoid hydration issues
  useEffect(() => {
    // Inject targeted widget
    const targetedScript = document.createElement('script');
    targetedScript.src = `${window.location.origin}/dist/widget.js`;
    targetedScript.setAttribute('data-target-element', '#widget-target');
    targetedScript.setAttribute('data-content-target', 'main, .content, article');
    targetedScript.setAttribute('data-api-endpoint', '/api/chat');
    targetedScript.setAttribute('data-base-url', '');
    targetedScript.setAttribute('data-advertiser-name', 'Targeted Widget');
    targetedScript.setAttribute('data-advertiser-logo', 'https://logo.clearbit.com/example.com');
    targetedScript.async = true;
    document.head.appendChild(targetedScript);
    
    // Inject standard widget
    const standardScript = document.createElement('script');
    standardScript.src = `${window.location.origin}/dist/widget.js`;
    standardScript.setAttribute('data-content-target', 'article');
    standardScript.setAttribute('data-api-endpoint', '/api/chat');
    standardScript.setAttribute('data-base-url', '');
    standardScript.setAttribute('data-advertiser-name', 'Standard Widget');
    standardScript.setAttribute('data-advertiser-logo', 'https://logo.clearbit.com/standard.com');
    standardScript.async = true;
    document.head.appendChild(standardScript);
    
    // Cleanup function to remove scripts
    return () => {
      targetedScript.remove();
      standardScript.remove();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f5f5f5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#333", fontSize: "2rem", marginBottom: "2rem" }}>
          Widget Injection Test
        </h1>
        
        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#666", fontSize: "1.5rem", marginBottom: "1rem" }}>
            1. Targeted Injection (in specific element)
          </h2>
          <div 
            id="widget-target" 
            style={{ 
              backgroundColor: "white", 
              padding: "2rem", 
              borderRadius: "8px", 
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
              border: "2px dashed #ccc",
              minHeight: "200px"
            }}
          >
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              This is a targeted container. The widget should appear inline within this element.
            </p>
            <p style={{ color: "#999", fontSize: "0.9rem" }}>
              Widget will be injected here using data-target-element="#widget-target"
            </p>
            
            {/* Widget will be injected here via useEffect */}
          </div>
        </div>

        <div style={{ marginBottom: "3rem" }}>
          <h2 style={{ color: "#666", fontSize: "1.5rem", marginBottom: "1rem" }}>
            2. Standard Injection (fixed positioning)
          </h2>
          <div style={{ 
            backgroundColor: "white", 
            padding: "2rem", 
            borderRadius: "8px", 
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
          }}>
            <article>
              <h3 style={{ color: "#333", marginBottom: "1rem" }}>Sample Article Content</h3>
              <p style={{ color: "#444", lineHeight: "1.6", marginBottom: "1rem" }}>
                This demonstrates the standard widget behavior where it appears as a fixed overlay 
                on the page. The widget should appear in the bottom-right corner with fixed positioning.
              </p>
              <p style={{ color: "#444", lineHeight: "1.6", marginBottom: "1rem" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
                exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p style={{ color: "#444", lineHeight: "1.6" }}>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
                fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
                culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </article>
            
            {/* Widget will be injected here via useEffect */}
          </div>
        </div>

        <div style={{ 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          padding: "1rem", 
          borderRadius: "4px" 
        }}>
          <p style={{ color: "#856404", margin: 0 }}>
            <strong>Note:</strong> The second widget (standard injection) should appear as a fixed overlay 
            in the bottom-right corner, while the first widget should appear inline within its target container.
          </p>
        </div>
      </div>
    </div>
  );
}