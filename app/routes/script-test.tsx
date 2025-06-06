export default function ScriptTest() {
  return (
    <div style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f5f5f5" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#333", marginBottom: "1rem" }}>Production Script Test Page</h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          This page simulates how the chat widget would be embedded on a production website using a script tag.
        </p>
        
        <div style={{ 
          backgroundColor: "white", 
          padding: "2rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          marginBottom: "2rem"
        }}>
          <h2 style={{ color: "#333", marginBottom: "1rem" }}>Simulated Company Website</h2>
          <nav style={{ marginBottom: "2rem", borderBottom: "1px solid #eee", paddingBottom: "1rem" }}>
            <a href="#" style={{ color: "#007bff", marginRight: "2rem", textDecoration: "none" }}>Home</a>
            <a href="#" style={{ color: "#007bff", marginRight: "2rem", textDecoration: "none" }}>Products</a>
            <a href="#" style={{ color: "#007bff", marginRight: "2rem", textDecoration: "none" }}>Services</a>
            <a href="#" style={{ color: "#007bff", marginRight: "2rem", textDecoration: "none" }}>Contact</a>
          </nav>
          
          <h3 style={{ color: "#333", marginBottom: "1rem" }}>Welcome to Our Company</h3>
          <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "1rem" }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor 
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud 
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <p style={{ color: "#666", lineHeight: "1.6", marginBottom: "1rem" }}>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu 
            fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in 
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <h4 style={{ color: "#333", marginBottom: "1rem" }}>Our Services</h4>
          <ul style={{ color: "#666", lineHeight: "1.6", marginBottom: "2rem" }}>
            <li>Web Development</li>
            <li>Mobile Applications</li>
            <li>Cloud Solutions</li>
            <li>Digital Marketing</li>
          </ul>
        </div>

        <div style={{ 
          backgroundColor: "white", 
          padding: "2rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <h2 style={{ color: "#333", marginBottom: "1rem" }}>Contact Information</h2>
          <p style={{ color: "#666", lineHeight: "1.6" }}>
            <strong>Email:</strong> info@company.com<br/>
            <strong>Phone:</strong> (555) 123-4567<br/>
            <strong>Address:</strong> 123 Business Ave, City, State 12345
          </p>
        </div>
      </main>

      {/* Script tag with data attributes for configuration */}
      <script 
        src={`${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js`} 
        data-content-target="main, .content, article"
        data-api-endpoint="/api/chat"
        async
      ></script>
    </div>
  );
}