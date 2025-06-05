import { ChatWidget } from "../components/ChatWidget";

export default function Test() {
  return (
    <div style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f5f5f5" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#333", marginBottom: "1rem" }}>Chat Widget Test Page</h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          This is a sandbox environment to test the chat widget functionality.
          The widget should appear as a floating button in the bottom-right corner.
        </p>
        
        <div style={{ 
          backgroundColor: "white", 
          padding: "2rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ color: "#333", marginBottom: "1rem" }}>Test Instructions</h2>
          <ul style={{ color: "#666", lineHeight: "1.6" }}>
            <li>Look for the chat widget button in the bottom-right corner</li>
            <li>Click the button to open/close the chat interface</li>
            <li>Type messages to test the input functionality</li>
            <li>Send messages to test API integration</li>
            <li>Check message history and scrolling behavior</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: "white", 
          padding: "2rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#333", marginBottom: "1rem" }}>Sample Content</h2>
          <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "1rem" }}>
            This is sample content to simulate a real page where the chat widget would be embedded.
            You can use this content to test how the widget behaves on pages with existing content.
          </p>
          <p style={{ color: "#666", lineHeight: "1.6" }}>
            The chat widget should float above this content and not interfere with the page layout.
            Try scrolling to see how the widget maintains its position.
          </p>
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}