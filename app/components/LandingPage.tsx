import { useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/lib/auth/auth-context";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Zap,
  Target,
  Shield,
  Code,
  Palette,
  Copy,
  MessageCircle,
  Globe,
  ArrowUp,
  Database,
  Search,
  FileText,
  Bot,
  Layers,
  Sparkles,
} from "lucide-react";

interface EmbedConfig {
  contentTarget: string;
  advertiserName: string;
  advertiserLogo: string;
  targetElement: string;
  baseUrl: string;
}

export function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig>({
    contentTarget: "article, main, .content",
    advertiserName: "Your Brand",
    advertiserLogo: "",
    targetElement: "",
    baseUrl: "",
  });

  const generateEmbedCode = () => {
    const baseScript = `<script src="https://websyte.ai/dist/widget.js"`;
    const attributes = [];

    if (embedConfig.contentTarget !== "article, main, .content") {
      attributes.push(`data-content-target="${embedConfig.contentTarget}"`);
    }
    if (embedConfig.advertiserName !== "Your Brand") {
      attributes.push(`data-advertiser-name="${embedConfig.advertiserName}"`);
    }
    if (embedConfig.advertiserLogo) {
      attributes.push(`data-advertiser-logo="${embedConfig.advertiserLogo}"`);
    }
    if (embedConfig.targetElement) {
      attributes.push(`data-target-element="${embedConfig.targetElement}"`);
    }
    if (embedConfig.baseUrl) {
      attributes.push(`data-base-url="${embedConfig.baseUrl}"`);
    }

    const attributeString =
      attributes.length > 0 ? ` ${attributes.join(" ")}` : "";
    return `${baseScript}${attributeString} async></script>`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateEmbedCode());
  };

  const features = [
    {
      icon: <Bot className="h-6 w-6" />,
      title: "Custom AI Widgets",
      description:
        "Create personalized AI assistants with your own knowledge base, documents, and content for specialized conversations.",
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "RAG-Powered Responses",
      description:
        "Retrieval-Augmented Generation uses vector search to provide accurate answers from your uploaded content.",
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: "Vector Search",
      description:
        "Advanced semantic search across your documents using OpenAI embeddings for precise content retrieval.",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "OCR Document Processing",
      description:
        "Extract and search text from PDFs, images, and documents automatically with AI-powered OCR technology.",
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Context-Aware AI",
      description:
        "Understands page content and provides intelligent, relevant responses based on your article or webpage.",
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "One-Click Summarization",
      description:
        "Instantly generate concise summaries of any page content with AI-powered analysis.",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Easy Embed Generation",
      description:
        "Generate custom embed scripts with one click. Copy and paste to deploy your AI widget anywhere.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Public & Private Widgets",
      description:
        "Control widget visibility with public embedding for websites or private access for internal use.",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Multi-AI Support", 
      description:
        "Powered by OpenAI GPT-4.1-mini and Mistral AI with intelligent fallback and model selection.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/websyte-ai-logo.svg"
                alt="Websyte AI"
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-foreground">
                websyte.ai
              </span>
            </div>
            
            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {!isLoading && (
                isAuthenticated ? (
                  <UserProfile />
                ) : (
                  <div className="flex items-center gap-2">
                    <Link to="/login">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/login?mode=register">
                      <Button size="sm">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              NEW: Custom AI Widgets
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <ArrowUp className="h-3 w-3 animate-bounce" />
              Try it above!
            </Badge>
            <Badge variant="outline">Zero Setup Conflicts Guaranteed</Badge>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Turn Every Page Into an Interactive Conversation
          </h1>
          <p className="text-xl text-muted-foreground mb-4 max-w-3xl mx-auto">
            Your readers get instant answers, you get better engagement, all
            with one line of code that won't break your design.
          </p>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto font-medium">
            🎉 <span className="text-primary">Completely free</span> — No credit
            card required, no hidden fees
          </p>
          <div className="flex justify-center mb-12">
            <button
              onClick={() => {
                const getStartedSection =
                  document.getElementById("get-started");
                getStartedSection?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-6 py-3 rounded-md border border-black bg-black text-white text-base font-medium hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer"
            >
              Increase My Website's Engagement
            </button>
          </div>

          {/* Video Demo in Hero */}
          <div className="max-w-4xl mx-auto">
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

            {/* Video highlights below hero video */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Your Visitors Will Actually Stay and Engage
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stop watching analytics show high bounce rates. Give visitors the
              smart, instant help they're desperately looking for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </section>

      {/* Quick Setup Section */}
      <section id="get-started" className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your AI Widget Experience
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              Start with page-based chat or create a custom knowledge base
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Standard Widget */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Standard Page Chat
                </CardTitle>
                <CardDescription>
                  AI that understands your webpage content instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <code className="text-green-400">
                      {`<script src="https://websyte.ai/dist/widget.js" async></script>`}
                    </code>
                  </div>
                  <button
                    className="absolute top-2 right-2 px-3 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `<script src="https://websyte.ai/dist/widget.js" async></script>`
                      );
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Perfect for:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Blog posts and articles</li>
                    <li>• Product pages</li>
                    <li>• News and content sites</li>
                    <li>• Quick setup with zero configuration</li>
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  ✨ <span className="font-semibold text-primary">Free to install</span> — No signup required
                </p>
              </CardContent>
            </Card>

            {/* Custom Widget */}
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Custom AI Widget
                  </CardTitle>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    NEW
                  </Badge>
                </div>
                <CardDescription>
                  Your own knowledge base with uploaded documents and files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                    <code className="text-green-400">
                      {`<script src="https://websyte.ai/dist/widget.js" data-widget-id="your-widget-id" async></script>`}
                    </code>
                  </div>
                  <button
                    className="absolute top-2 right-2 px-3 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer"
                    onClick={async () => {
                      await navigator.clipboard.writeText(
                        `<script src="https://websyte.ai/dist/widget.js" data-widget-id="your-widget-id" async></script>`
                      );
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Features:</p>
                  <ul className="text-sm space-y-1 ml-4">
                    <li>• Upload PDFs, docs, and images</li>
                    <li>• OCR text extraction</li>
                    <li>• Vector search with RAG</li>
                    <li>• One-click embed generation</li>
                  </ul>
                </div>
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <Link to="/dashboard">
                      <Button size="sm" className="w-full">
                        Create Custom Widget
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/login?mode=register">
                      <Button size="sm" className="w-full">
                        Sign Up to Create
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Custom Widget Workflow */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              From Documents to Deployed AI in Minutes
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Upload your knowledge base, generate embed codes, and deploy intelligent AI assistants 
              that answer questions from your specific content.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full w-fit mb-4">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>1. Upload Content</CardTitle>
                <CardDescription>
                  Add PDFs, documents, images, or text content to build your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • PDF and document processing
                </p>
                <p className="text-sm text-muted-foreground">
                  • OCR for images and scanned files
                </p>
                <p className="text-sm text-muted-foreground">
                  • Automatic text chunking and vectorization
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 bg-green-100 dark:bg-green-900/20 rounded-full w-fit mb-4">
                  <Code className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>2. Generate Embed</CardTitle>
                <CardDescription>
                  One-click embed code generation with customizable branding options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  • Public/private widget controls
                </p>
                <p className="text-sm text-muted-foreground">
                  • Custom advertiser name and logo
                </p>
                <p className="text-sm text-muted-foreground">
                  • Copy-paste ready script tags
                </p>
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
                <p className="text-sm text-muted-foreground">
                  • RAG-powered responses
                </p>
                <p className="text-sm text-muted-foreground">
                  • Vector similarity search
                </p>
                <p className="text-sm text-muted-foreground">
                  • Multi-AI model support
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-4">Powered by Advanced AI Technology</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our RAG (Retrieval-Augmented Generation) system combines the latest in AI and search technology 
                to provide accurate, contextual responses from your specific content.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg mb-3 w-fit mx-auto">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold mb-1">OpenAI GPT-4.1</h4>
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
        </div>
      </section>

      {/* Technical Highlights */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for Performance & Security
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Enterprise-grade infrastructure with modern web standards.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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
                <div className="text-sm text-muted-foreground">
                  Cloudflare Workers
                </div>
                <div className="text-sm text-muted-foreground">
                  CORS Protection
                </div>
                <div className="text-sm text-muted-foreground">
                  API Key Security
                </div>
                <div className="text-sm text-muted-foreground">
                  Rate Limiting
                </div>
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
                <div className="text-sm text-muted-foreground">
                  Mobile Responsive
                </div>
                <div className="text-sm text-muted-foreground">
                  Cross-Browser
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg mb-2">Websyte AI Chat Widget</h3>
              <p className="text-muted-foreground">
                Built with ❤️ using React Router and Cloudflare Workers
              </p>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground">
            <p>
              Powered by OpenAI • Hosted on Cloudflare Workers • MIT License
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
