import type { Route } from "./+types/docs";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Code, Rocket, Settings, Shield, Zap, FileText, MessageSquare, Database, Globe } from "lucide-react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Documentation - Websyte AI | Complete Developer Guide" },
    { name: "description", content: "Comprehensive documentation for Websyte AI. Quick start guides, API reference, integration examples, and best practices." },
    { name: "keywords", content: "Websyte AI docs, API documentation, integration guide, developer documentation" },
  ];
}

const docSections = [
  {
    icon: Rocket,
    title: "Getting Started",
    description: "Set up your first widget in under 5 minutes",
    links: [
      { title: "Quick Start Guide", href: "#quick-start" },
      { title: "Installation", href: "#installation" },
      { title: "Your First Widget", href: "#first-widget" },
      { title: "Basic Configuration", href: "#configuration" }
    ]
  },
  {
    icon: Code,
    title: "API Reference",
    description: "Complete API documentation with examples",
    links: [
      { title: "Authentication", href: "#auth" },
      { title: "Widget Management", href: "#widget-api" },
      { title: "Chat Endpoints", href: "#chat-api" },
      { title: "Automation API", href: "#automation" }
    ]
  },
  {
    icon: Globe,
    title: "Integration Guide",
    description: "Embed widgets on any platform",
    links: [
      { title: "Basic iframe Integration", href: "#iframe-embed" },
      { title: "Responsive iframe", href: "#responsive" },
      { title: "PostMessage API", href: "#postmessage" },
      { title: "Security Best Practices", href: "#iframe-security" }
    ]
  },
  {
    icon: Database,
    title: "Knowledge Base",
    description: "Build and manage your AI's knowledge",
    links: [
      { title: "Uploading Documents", href: "#upload-docs" },
      { title: "Website Crawling", href: "#crawling" },
      { title: "Content Management", href: "#content" },
      { title: "Vector Search", href: "#search" }
    ]
  },
  {
    icon: Settings,
    title: "Customization",
    description: "Make the widget match your brand",
    links: [
      { title: "Theming & Styling", href: "#theming" },
      { title: "Custom Prompts", href: "#prompts" },
      { title: "Widget Position", href: "#position" },
      { title: "Advanced Options", href: "#advanced" }
    ]
  },
  {
    icon: Shield,
    title: "Security & Privacy",
    description: "Keep your data safe and compliant",
    links: [
      { title: "Authentication", href: "#security-auth" },
      { title: "Data Privacy", href: "#privacy" },
      { title: "GDPR Compliance", href: "#gdpr" },
      { title: "Best Practices", href: "#best-practices" }
    ]
  }
];

const quickStartCode = `<iframe
  src="https://websyte-ai.com/share/w/YOUR_WIDGET_ID"
  style="width: 100%; height: 600px; border: none;"
  title="AI Chat Widget"
  allow="clipboard-write">
</iframe>`;

const responsiveCode = `<!-- Responsive container -->
<div style="position: relative; height: 600px; max-width: 800px; margin: 0 auto;">
  <iframe
    src="https://websyte-ai.com/share/w/YOUR_WIDGET_ID"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    title="AI Chat Widget"
    allow="clipboard-write">
  </iframe>
</div>`;

const apiExample = `// Create a new widget
const response = await fetch('https://api.websyte-ai.com/api/automation/widgets', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Support Bot',
    greeting: 'How can I help you today?',
    systemPrompt: 'You are a helpful support assistant.'
  })
});

const widget = await response.json();`;

const postMessageExample = `// Listen for messages from the widget
window.addEventListener('message', (event) => {
  // Verify origin for security
  if (event.origin !== 'https://websyte-ai.com') return;
  
  if (event.data.type === 'chat-started') {
    console.log('User started chatting');
  } else if (event.data.type === 'chat-response') {
    console.log('Assistant response:', event.data.payload.message);
  }
});

// Send messages to the widget
const iframe = document.querySelector('iframe');
iframe.contentWindow.postMessage({
  type: 'send-message',
  payload: { message: 'Hello, how can I help?' }
}, 'https://websyte-ai.com');`;

export default function Docs() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Documentation
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to integrate Websyte AI into your application. 
            From quick start guides to advanced API documentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {docSections.map((section) => (
            <Card key={section.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <section.icon className="h-8 w-8 mb-3 text-primary" />
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link 
                        to={link.href}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.title} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-16">
          <section id="quick-start">
            <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">1. Embed the widget iframe</h3>
              <p className="text-muted-foreground mb-4">
                Add this iframe code to your website where you want the chat widget to appear:
              </p>
              <pre className="bg-background rounded-lg p-4 overflow-x-auto">
                <code className="text-sm">{quickStartCode}</code>
              </pre>
            </div>
            <div className="bg-muted/50 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-semibold mb-4">2. Responsive iframe (Recommended)</h3>
              <p className="text-muted-foreground mb-4">
                For a responsive layout that works on all screen sizes, use a container:
              </p>
              <pre className="bg-background rounded-lg p-4 overflow-x-auto">
                <code className="text-sm">{responsiveCode}</code>
              </pre>
            </div>
            <div className="bg-muted/50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">3. Get your Widget ID</h3>
              <p className="text-muted-foreground">
                Find your Widget ID in the dashboard after creating a widget. Replace YOUR_WIDGET_ID 
                in the iframe URL with your actual widget ID.
              </p>
            </div>
          </section>

          <section id="api-example">
            <h2 className="text-3xl font-bold mb-6">API Example</h2>
            <p className="text-lg text-muted-foreground mb-6">
              Use our REST API to programmatically manage widgets and chat conversations:
            </p>
            <pre className="bg-muted/50 rounded-xl p-6 overflow-x-auto">
              <code className="text-sm">{apiExample}</code>
            </pre>
          </section>

          <section id="iframe-features">
            <h2 className="text-3xl font-bold mb-6">iframe Features</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">PostMessage API</h3>
                <p className="text-muted-foreground mb-4">
                  Communicate with the widget using secure cross-origin messaging:
                </p>
                <pre className="bg-background rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm">{postMessageExample}</code>
                </pre>
              </div>
              <div className="bg-muted/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4">Auto-resize Support</h3>
                <p className="text-muted-foreground mb-4">
                  The widget automatically sends resize events to fit content:
                </p>
                <pre className="bg-background rounded-lg p-4 overflow-x-auto text-sm">
                  <code>{`window.addEventListener('message', (e) => {
  if (e.data.type === 'resize') {
    iframe.style.height = e.data.payload.height + 'px';
  }
});`}</code>
                </pre>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-6">Popular Guides</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Upload Your Knowledge Base
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Upload PDFs, Word docs, markdown files, and more. Our AI will extract 
                    and index the content for instant search.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="#upload-docs">Read Guide</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Customize Chat Behavior
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Configure custom prompts, personality, and response styles to match 
                    your brand voice perfectly.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="#prompts">Read Guide</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Crawl Your Website
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Automatically crawl and index your entire website. Keep your AI's 
                    knowledge up-to-date with scheduled crawls.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="#crawling">Read Guide</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Automation API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Use bearer token authentication to automate widget creation, content 
                    updates, and chat management.
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="#automation">Read Guide</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Need Help?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/contact">
                Contact Support
              </Link>
            </Button>
            <Button asChild variant="outline">
              <a href="https://github.com/websyte-ai/docs" target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}