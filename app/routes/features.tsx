import type { Route } from "./+types/features";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Bot, Zap, Globe, Shield, BarChart, Code, FileText, Brain, Search, Sparkles, Share2 } from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Features - Websyte AI | AI-Powered Customer Support for SaaS" },
    { name: "description", content: "Transform your docs and help content into an intelligent assistant. Features include RAG-powered chat, website crawling, semantic search, and one-line integration." },
    { name: "keywords", content: "AI chat features, semantic search, knowledge base AI, customer support automation, SaaS help desk features" },
  ];
}

const features = [
  {
    icon: Bot,
    title: "RAG-Powered Responses",
    description: "Uses GPT-4o-mini with vector search to provide accurate, contextual answers with automatic source citations."
  },
  {
    icon: Globe,
    title: "Website Crawling",
    description: "Automatically crawl and index your entire website using Apify. Extract content, links, and build a comprehensive knowledge base."
  },
  {
    icon: Zap,
    title: "Simple iframe Integration",
    description: "Embed AI chat on your site with a simple iframe. Complete isolation ensures zero conflicts with your existing styles and scripts."
  },
  {
    icon: Brain,
    title: "Semantic Search",
    description: "pgvector with HNSW indexing enables lightning-fast semantic search across your entire knowledge base."
  },
  {
    icon: FileText,
    title: "Multi-Format Support",
    description: "Upload PDF, TXT, MD, DOCX, JSON files. Built-in OCR with Mistral AI extracts text from images and scanned documents."
  },
  {
    icon: MessageSquare,
    title: "Message Persistence",
    description: "PostgreSQL stores chat history with intelligent caching. 70-80% performance improvement with LRU cache."
  },
  {
    icon: Code,
    title: "Developer API",
    description: "Full REST API with bearer token authentication. Automate widget creation, content management, and chat interactions."
  },
  {
    icon: Share2,
    title: "Public Sharing",
    description: "Share widgets publicly with customizable access. Perfect for demos, support portals, or embedded help."
  },
  {
    icon: Search,
    title: "AI Link Extraction",
    description: "Automatically extract and categorize important links from your content using vector search and AI analysis."
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Better Auth with OAuth support, role-based access control, and secure API tokens for automation."
  },
  {
    icon: Sparkles,
    title: "Glass Morphism UI",
    description: "Modern translucent design with backdrop blur, dark mode support, and fully responsive mobile experience."
  },
  {
    icon: BarChart,
    title: "Workflow Visualization",
    description: "Real-time status tracking for content processing workflows with detailed progress updates."
  }
];

export default function Features() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Production-Ready Features for Modern SaaS
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Built with React Router 7, Cloudflare Workers, and PostgreSQL. Every feature is tested, 
            documented, and ready for production use.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
              <CardHeader>
                <feature.icon className="h-10 w-10 mb-4 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              How It Works
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Build Your Knowledge Base</h3>
                  <p className="text-muted-foreground">
                    Upload documents or crawl your website with Apify. We'll process content with OCR, 
                    extract text, and create vector embeddings for semantic search.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Embed the Widget</h3>
                  <p className="text-muted-foreground">
                    Add our iframe to your site. The widget runs in complete isolation, ensuring 
                    zero conflicts with your existing styles and JavaScript. Supports responsive sizing and PostMessage API.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI Handles Support</h3>
                  <p className="text-muted-foreground">
                    Your customers get instant, accurate answers with source citations. RAG ensures 
                    responses are grounded in your actual content, not AI hallucinations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">Tech Stack</h3>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Frontend:</strong> React Router 7, Vite, Tailwind CSS v4</p>
              <p><strong>Backend:</strong> Cloudflare Workers, Hono framework</p>
              <p><strong>Database:</strong> Neon PostgreSQL, Drizzle ORM, pgvector</p>
              <p><strong>AI/ML:</strong> OpenAI GPT-4o-mini, Mistral AI (OCR)</p>
              <p><strong>Storage:</strong> Cloudflare R2 for file storage</p>
              <p><strong>Auth:</strong> Better Auth with OAuth providers</p>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-2xl font-bold mb-4">Performance</h3>
            <div className="space-y-2 text-muted-foreground">
              <p><strong>Widget Bundle:</strong> ~200KB optimized</p>
              <p><strong>Cache Hit Rate:</strong> 70-80% with LRU eviction</p>
              <p><strong>Test Coverage:</strong> 235 tests, 100% coverage</p>
              <p><strong>Response Time:</strong> SSE streaming for instant feedback</p>
              <p><strong>Vector Search:</strong> HNSW indexing for fast queries</p>
              <p><strong>Zero Downtime:</strong> Cloudflare Workers global edge</p>
            </div>
          </Card>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Customer Support?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join forward-thinking SaaS companies using Websyte AI to deliver instant, 
            accurate customer support 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/register">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/docs">
                View Documentation
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}