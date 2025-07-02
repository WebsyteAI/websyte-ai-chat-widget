import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScriptCopyBtn } from "@/components/ui/script-copy-btn";
import { Link } from "react-router";
import {
  Brain,
  Zap,
  Shield,
  Code,
  MessageCircle,
  Globe,
  Database,
  Search,
  FileText,
  Bot,
  Layers,
  Sparkles,
  History,
  ShieldCheck,
  Timer,
  GlobeLock,
  Share2,
  MessageSquareQuote,
} from "lucide-react";

// Feature showcase component
export function FeatureShowcase() {
  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "Custom AI Widgets",
      description: "Create personalized AI assistants with your own knowledge base, documents, and content for specialized conversations.",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "RAG-Powered Responses",
      description: "Retrieval-Augmented Generation with inline citations provides accurate, sourced answers from your content.",
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Vector Search",
      description: "Advanced semantic search across your documents using OpenAI embeddings for precise content retrieval.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "OCR Document Processing",
      description: "Extract and search text from PDFs, images, and documents automatically with AI-powered OCR technology.",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Context-Aware AI",
      description: "Understands page content and provides intelligent, relevant responses based on your article or webpage.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "One-Click Summarization",
      description: "Instantly generate concise summaries of any page content with AI-powered analysis.",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4 my-4">
      {features.map((feature, index) => (
        <Card key={index} className="h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {feature.icon}
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-base">
              {feature.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Embed code demo component
export function EmbedCodeDemo({ type = "standard" }: { type?: "standard" | "custom" }) {
  const standardCode = `<script src="https://websyte.ai/dist/widget.js" async></script>`;
  const customCode = `<script src="https://websyte.ai/dist/widget.js" data-widget-id="your-widget-id" async></script>`;
  
  return (
    <div className="my-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {type === "standard" ? (
              <>
                <MessageCircle className="h-5 w-5" />
                Standard Page Chat
              </>
            ) : (
              <>
                <Bot className="h-5 w-5" />
                Custom AI Widget
              </>
            )}
          </CardTitle>
          <CardDescription>
            {type === "standard" 
              ? "AI that understands your webpage content instantly" 
              : "Your own knowledge base with uploaded documents and files"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScriptCopyBtn
            code={type === "standard" ? standardCode : customCode}
            codeLanguage="html"
          />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {type === "standard" ? "Perfect for:" : "Features:"}
            </p>
            <ul className="text-sm space-y-1 ml-4">
              {type === "standard" ? (
                <>
                  <li>• Blog posts and articles</li>
                  <li>• Product pages</li>
                  <li>• News and content sites</li>
                  <li>• Quick setup with zero configuration</li>
                </>
              ) : (
                <>
                  <li>• Upload PDFs, docs, and images</li>
                  <li>• OCR text extraction</li>
                  <li>• Vector search with RAG</li>
                  <li>• One-click embed generation</li>
                </>
              )}
            </ul>
          </div>
          {type === "standard" && (
            <p className="text-xs text-muted-foreground">
              ✨ <span className="font-semibold text-primary">Free to install</span> — No signup required
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Tech stack display component
export function TechStackDisplay() {
  return (
    <div className="my-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-4">Powered by Advanced AI Technology</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our RAG (Retrieval-Augmented Generation) system combines the latest in AI and search technology 
          to provide accurate, contextual responses from your specific content.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-3 w-fit mx-auto">
            <Brain className="h-6 w-6 text-blue-600" />
          </div>
          <h4 className="font-semibold mb-1">OpenAI GPT-4o</h4>
          <p className="text-sm text-muted-foreground">Latest language model</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-3 w-fit mx-auto">
            <Search className="h-6 w-6 text-green-600" />
          </div>
          <h4 className="font-semibold mb-1">Vector Search</h4>
          <p className="text-sm text-muted-foreground">Semantic similarity matching</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-3 w-fit mx-auto">
            <Database className="h-6 w-6 text-purple-600" />
          </div>
          <h4 className="font-semibold mb-1">PostgreSQL</h4>
          <p className="text-sm text-muted-foreground">pgvector embeddings</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-3 w-fit mx-auto">
            <Layers className="h-6 w-6 text-orange-600" />
          </div>
          <h4 className="font-semibold mb-1">Multi-AI</h4>
          <p className="text-sm text-muted-foreground">OpenAI + Mistral support</p>
        </div>
      </div>
    </div>
  );
}

// CTA Button component
export function CTAButton({ text, href, variant = "default" }: { text: string; href?: string; variant?: "default" | "outline" }) {
  if (href) {
    return (
      <div className="my-4">
        <Link to={href}>
          <Button variant={variant} size="lg" className="w-full sm:w-auto">
            {text}
          </Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="my-4">
      <Button 
        variant={variant} 
        size="lg" 
        className="w-full sm:w-auto"
        onClick={() => {
          const getStartedSection = document.getElementById("get-started");
          getStartedSection?.scrollIntoView({ behavior: "smooth" });
        }}
      >
        {text}
      </Button>
    </div>
  );
}

// Video demo component
export function VideoDemo() {
  return (
    <div className="my-4 max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <video
              className="w-full h-full object-cover"
              controls
              preload="metadata"
            >
              <source src="/wai-chat-widget-demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium text-sm">Real User Interaction</h4>
          <p className="text-xs text-muted-foreground">
            Watch visitors get instant answers instead of bouncing
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium text-sm">30-Second Setup</h4>
          <p className="text-xs text-muted-foreground">
            From zero to fully functional in under half a minute
          </p>
        </div>
        <div className="text-center space-y-2">
          <div className="w-8 h-8 mx-auto bg-primary/10 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <h4 className="font-medium text-sm">Zero Conflicts</h4>
          <p className="text-xs text-muted-foreground">
            Your design stays perfect, no matter what
          </p>
        </div>
      </div>
    </div>
  );
}

// Pricing info component
export function PricingInfo() {
  return (
    <div className="my-4">
      <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            🎉 Completely Free Forever
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg">
            No credit card required. No hidden fees. No trial periods.
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div>
              <h4 className="font-semibold mb-2">✓ Unlimited Widgets</h4>
              <p className="text-sm text-muted-foreground">Create as many AI assistants as you need</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✓ Unlimited Messages</h4>
              <p className="text-sm text-muted-foreground">No caps on conversations or API calls</p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">✓ All Features</h4>
              <p className="text-sm text-muted-foreground">RAG, OCR, crawling - everything included</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Performance stats component
export function PerformanceStats() {
  return (
    <div className="my-4 grid md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mb-4">
            <Zap className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Lightning Fast</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <div className="text-2xl font-bold">~200KB</div>
          <div className="text-sm text-muted-foreground">Bundle size</div>
          <div className="text-2xl font-bold">&lt;100ms</div>
          <div className="text-sm text-muted-foreground">Load time</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mb-4">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Secure & Reliable</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Cloudflare Workers</div>
          <div className="text-sm text-muted-foreground">Rate Limiting</div>
          <div className="text-sm text-muted-foreground">GDPR Compliant</div>
          <div className="text-sm text-muted-foreground">90-Day Auto Cleanup</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mb-4">
            <Globe className="h-6 w-6 text-purple-600" />
          </div>
          <CardTitle>Universal Compatibility</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Any Website</div>
          <div className="text-sm text-muted-foreground">All CMSs</div>
          <div className="text-sm text-muted-foreground">Mobile Responsive</div>
          <div className="text-sm text-muted-foreground">Cross-Browser</div>
        </CardContent>
      </Card>
    </div>
  );
}

// Workflow steps component
export function WorkflowSteps() {
  return (
    <div className="my-4">
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle>1. Upload Content</CardTitle>
            <CardDescription>
              Add PDFs, documents, images, or crawl entire websites to build your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">• Website crawler with Apify</p>
            <p className="text-sm text-muted-foreground">• PDF and document processing</p>
            <p className="text-sm text-muted-foreground">• OCR for images</p>
            <p className="text-sm text-muted-foreground">• Automatic vectorization</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mb-4">
              <Code className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>2. Generate & Share</CardTitle>
            <CardDescription>
              One-click embed code generation or share via direct URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">• Direct widget sharing URLs</p>
            <p className="text-sm text-muted-foreground">• Public/private controls</p>
            <p className="text-sm text-muted-foreground">• Custom branding</p>
            <p className="text-sm text-muted-foreground">• Copy-paste ready</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-purple-100 dark:bg-purple-900/20 rounded-full w-fit mb-4">
              <Bot className="h-6 w-6 text-purple-600" />
            </div>
            <CardTitle>3. Deploy AI Assistant</CardTitle>
            <CardDescription>
              Embed anywhere and provide instant answers from your knowledge base
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">• RAG with citations</p>
            <p className="text-sm text-muted-foreground">• Smart recommendations</p>
            <p className="text-sm text-muted-foreground">• Conversation history</p>
            <p className="text-sm text-muted-foreground">• Multi-AI support</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Badge list component
export function BadgeList() {
  return (
    <div className="flex flex-wrap justify-center gap-2 my-4">
      <Badge variant="secondary" className="flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        NEW: Website Crawler & Widget Sharing
      </Badge>
      <Badge variant="outline" className="flex items-center gap-1">
        <MessageSquareQuote className="h-3 w-3" />
        Inline Citations
      </Badge>
      <Badge variant="outline">GDPR Compliant</Badge>
    </div>
  );
}