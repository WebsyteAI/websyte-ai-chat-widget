import { useEffect } from "react";

export default function ScriptTest() {
  // Inject widget after component mounts to avoid hydration issues
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${window.location.origin}/dist/widget.js`;
    script.setAttribute('data-base-url', '');
    script.async = true;
    document.head.appendChild(script);
    
    // Cleanup function to remove script
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f5f5f5" }}>
      <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "3rem", 
          borderRadius: "8px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}>
          <article id="main-article">
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
      </main>

      {/* Script will be injected via useEffect to avoid hydration issues */}
    </div>
  );
}