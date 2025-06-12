import { useEffect } from "react";

export default function SummaryTest() {
  // Inject widget after component mounts to avoid hydration issues
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${window.location.origin}/dist/widget.js`;
    script.setAttribute('data-base-url', '');
    script.setAttribute('data-advertiser-name', 'TechCrunch');
    script.setAttribute('data-advertiser-logo', 'https://logo.clearbit.com/techcrunch.com');
    // Note: NOT setting data-content-selector to test summary in chat panel
    script.async = true;
    document.head.appendChild(script);
    
    // Cleanup function to remove script
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", padding: "2rem", backgroundColor: "#f0f2f5" }}>
      <main style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ 
          backgroundColor: "white", 
          padding: "3rem", 
          borderRadius: "12px", 
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)"
        }}>
          <article>
            <header style={{ marginBottom: "2.5rem", borderBottom: "2px solid #e1e5e9", paddingBottom: "1.5rem" }}>
              <h1 style={{ 
                color: "#1a202c", 
                fontSize: "2.75rem", 
                fontWeight: "800", 
                marginBottom: "1rem", 
                lineHeight: "1.1" 
              }}>
                OpenAI Launches GPT-4 Turbo with Vision
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.5rem" }}>
                <p style={{ color: "#4a5568", fontSize: "1rem", fontWeight: "500" }}>
                  By Sarah Chen
                </p>
                <span style={{ color: "#a0aec0", fontSize: "0.9rem" }}>•</span>
                <p style={{ color: "#a0aec0", fontSize: "0.9rem" }}>
                  November 15, 2024
                </p>
              </div>
              <p style={{ 
                color: "#718096", 
                fontSize: "1rem",
                backgroundColor: "#f7fafc",
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                display: "inline-block"
              }}>
                TechCrunch Exclusive
              </p>
            </header>

            <div style={{ color: "#2d3748", lineHeight: "1.7", fontSize: "1.125rem" }}>
              <p style={{ marginBottom: "1.75rem", fontSize: "1.25rem", fontWeight: "500", color: "#1a202c" }}>
                OpenAI today announced GPT-4 Turbo with Vision, a significant upgrade to its flagship language model 
                that can now process and understand images alongside text, marking a major leap forward in multimodal AI capabilities.
              </p>

              <p style={{ marginBottom: "1.75rem" }}>
                The new model, demonstrated at OpenAI's DevDay conference in San Francisco, can analyze photographs, 
                diagrams, charts, and other visual content with remarkable accuracy. CEO Sam Altman showcased the 
                technology by having GPT-4 Turbo describe complex scientific diagrams and even debug code by looking 
                at screenshots of programming interfaces.
              </p>

              <p style={{ marginBottom: "1.75rem" }}>
                "This represents a fundamental shift in how AI can interact with the world," Altman explained during 
                the presentation. "We're moving beyond text-only interactions to a more natural, human-like way of 
                processing information that combines visual and textual understanding."
              </p>

              <div style={{ 
                margin: "2.5rem 0", 
                padding: "2rem", 
                backgroundColor: "#edf2f7", 
                borderLeft: "5px solid #3182ce",
                borderRadius: "8px"
              }}>
                <h3 style={{ color: "#2b6cb0", fontSize: "1.25rem", fontWeight: "600", marginBottom: "1rem" }}>
                  Key Features of GPT-4 Turbo with Vision:
                </h3>
                <ul style={{ listStyle: "none", padding: 0 }}>
                  <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "start" }}>
                    <span style={{ color: "#3182ce", marginRight: "0.5rem", fontWeight: "bold" }}>•</span>
                    Image analysis and description capabilities
                  </li>
                  <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "start" }}>
                    <span style={{ color: "#3182ce", marginRight: "0.5rem", fontWeight: "bold" }}>•</span>
                    Chart and graph interpretation
                  </li>
                  <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "start" }}>
                    <span style={{ color: "#3182ce", marginRight: "0.5rem", fontWeight: "bold" }}>•</span>
                    Document and handwriting recognition
                  </li>
                  <li style={{ marginBottom: "0.75rem", display: "flex", alignItems: "start" }}>
                    <span style={{ color: "#3182ce", marginRight: "0.5rem", fontWeight: "bold" }}>•</span>
                    Code debugging from screenshots
                  </li>
                  <li style={{ display: "flex", alignItems: "start" }}>
                    <span style={{ color: "#3182ce", marginRight: "0.5rem", fontWeight: "bold" }}>•</span>
                    Multimodal reasoning and problem-solving
                  </li>
                </ul>
              </div>

              <p style={{ marginBottom: "1.75rem" }}>
                The vision capabilities are powered by what OpenAI calls "enhanced visual reasoning," which allows 
                the model to understand spatial relationships, identify objects in context, and even make inferences 
                about what might be happening in a scene. Early demonstrations showed the model successfully identifying 
                landmarks, reading street signs, and explaining complex technical diagrams.
              </p>

              <p style={{ marginBottom: "1.75rem" }}>
                Developers can now integrate both text and image inputs into their applications through OpenAI's API, 
                opening up new possibilities for educational tools, accessibility applications, and creative platforms. 
                The pricing model remains competitive, with image processing costs calculated based on image resolution 
                and complexity.
              </p>

              <blockquote style={{ 
                margin: "2.5rem 0", 
                padding: "2rem", 
                backgroundColor: "#f7fafc", 
                borderLeft: "4px solid #4299e1",
                fontStyle: "italic",
                fontSize: "1.2rem",
                color: "#2b6cb0"
              }}>
                "We're moving beyond text-only interactions to a more natural, human-like way of processing 
                information that combines visual and textual understanding."
                <footer style={{ marginTop: "1rem", fontSize: "1rem", fontStyle: "normal", color: "#718096" }}>
                  — Sam Altman, CEO of OpenAI
                </footer>
              </blockquote>

              <p style={{ marginBottom: "1.75rem" }}>
                Industry experts are calling this release a game-changer for AI applications. Dr. Fei-Fei Li, former 
                Chief Scientist at Google Cloud, noted that "the combination of language and vision understanding 
                brings us significantly closer to artificial general intelligence."
              </p>

              <p style={{ marginBottom: "1.75rem" }}>
                However, the release also raises important questions about safety and misuse. OpenAI has implemented 
                safeguards to prevent the model from identifying private individuals in photos and has restricted its 
                ability to analyze certain types of sensitive content.
              </p>

              <p style={{ marginBottom: "1.75rem" }}>
                The company plans to roll out GPT-4 Turbo with Vision to API customers over the coming weeks, with 
                broader availability expected by early 2025. Educational institutions and accessibility organizations 
                will receive priority access to explore the technology's potential for helping visually impaired users 
                and enhancing digital learning experiences.
              </p>

              <p style={{ marginBottom: "1.75rem" }}>
                This announcement comes as competition in the AI space intensifies, with Google, Anthropic, and others 
                racing to develop their own multimodal capabilities. OpenAI's early lead in vision-language models 
                could prove crucial in maintaining its position as the leading AI research company.
              </p>

              <p>
                For developers and businesses, GPT-4 Turbo with Vision represents an opportunity to create more 
                intuitive and powerful applications that can understand and interact with the visual world. As AI 
                continues to evolve, this latest breakthrough suggests we're entering a new era where the boundaries 
                between human and artificial perception continue to blur.
              </p>
            </div>
          </article>
        </div>
        
        <div style={{ 
          marginTop: "3rem", 
          padding: "2rem", 
          backgroundColor: "#fff3cd", 
          border: "1px solid #ffeaa7", 
          borderRadius: "8px",
          textAlign: "center"
        }}>
          <h2 style={{ color: "#856404", fontSize: "1.5rem", fontWeight: "600", marginBottom: "1rem" }}>
            🧪 Testing Summary in Chat Panel
          </h2>
          <p style={{ color: "#856404", fontSize: "1rem", marginBottom: "0.5rem" }}>
            This page does NOT have a content-selector configured.
          </p>
          <p style={{ color: "#856404", fontSize: "0.9rem" }}>
            Open the chat panel and try the "Summarize Content" feature - summaries should appear inside the chat panel instead of replacing page content.
          </p>
        </div>
      </main>

      {/* Script will be injected via useEffect to avoid hydration issues */}
    </div>
  );
}