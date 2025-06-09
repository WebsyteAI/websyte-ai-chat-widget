import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  ExternalLink,
  MessageCircle,
  FileText,
  Headphones,
  Globe
} from "lucide-react";

interface EmbedConfig {
  contentTarget: string;
  advertiserName: string;
  advertiserLogo: string;
  targetElement: string;
  baseUrl: string;
}

export function LandingPage() {
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic");
  const [embedConfig, setEmbedConfig] = useState<EmbedConfig>({
    contentTarget: "article, main, .content",
    advertiserName: "Your Brand",
    advertiserLogo: "",
    targetElement: "",
    baseUrl: ""
  });

  const generateEmbedCode = () => {
    const baseScript = `<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js"`;
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
    
    const attributeString = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
    return `${baseScript}${attributeString} async></script>`;
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateEmbedCode());
  };

  const features = [
    {
      icon: <Brain className="h-6 w-6" />,
      title: "Context-Aware AI",
      description: "Understands page content and provides intelligent, relevant responses based on your article or webpage."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "One-Click Summarization",
      description: "Instantly generate concise summaries of any page content with AI-powered analysis."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Flexible Injection",
      description: "Choose between fixed overlay or inject into specific DOM elements for seamless integration."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Shadow DOM Isolation",
      description: "Complete style isolation prevents conflicts with your existing website design and CSS."
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Easy Integration",
      description: "Single script tag implementation with no external dependencies or complex setup required."
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Customizable Branding",
      description: "Configure advertiser name, logo, positioning, and theme to match your brand identity."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            🚀 Production Ready
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Embed Intelligent AI Chat on Any Website
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Add context-aware AI conversations to your articles and web pages. One script tag, zero conflicts, infinite possibilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild>
              <a href="https://websyte-ai-chat-widget.clementineso.workers.dev" target="_blank" rel="noopener noreferrer">
                View Live Demo
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              Get Started Free
            </Button>
          </div>
          
          {/* Quick Preview */}
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Live Widget Preview
              </CardTitle>
              <CardDescription>
                See how the AI chat widget appears on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-8 min-h-[200px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 bg-background rounded-full px-6 py-3 shadow-sm border">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Summarize</span>
                    <Separator orientation="vertical" className="h-4" />
                    <Headphones className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Listen</span>
                    <Separator orientation="vertical" className="h-4" />
                    <MessageCircle className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Chat</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Interactive AI widget with summarization, audio, and chat features
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need for Intelligent Web Experiences
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful AI features designed for seamless integration and maximum user engagement.
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

      {/* Integration Demo Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Integration, Powerful Results
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes with our flexible embedding options and interactive configuration.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Code Examples */}
            <div>
              <div className="w-full">
                <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px] grid grid-cols-2">
                  <Button
                    variant={activeTab === "basic" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("basic")}
                    className="h-7"
                  >
                    Basic Setup
                  </Button>
                  <Button
                    variant={activeTab === "advanced" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("advanced")}
                    className="h-7"
                  >
                    Advanced Config
                  </Button>
                </div>
                
                {activeTab === "basic" && (
                  <div className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Start</CardTitle>
                        <CardDescription>
                          Add this single line to your website
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto">
                          <code>
                            {`<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" async></script>`}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                {activeTab === "advanced" && (
                  <div className="space-y-4 mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Custom Configuration</CardTitle>
                        <CardDescription>
                          Full control over widget behavior and appearance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto">
                          <code className="whitespace-pre-wrap">
{`<script 
  src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" 
  data-content-target="main, .content, article"
  data-advertiser-name="Your Brand"
  data-advertiser-logo="https://example.com/logo.png"
  data-target-element="#widget-container"
  async>
</script>`}
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Configuration */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Embed Code Generator</CardTitle>
                  <CardDescription>
                    Customize your widget configuration and generate the embed code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Content Target Selector</label>
                      <Input
                        value={embedConfig.contentTarget}
                        onChange={(e) => setEmbedConfig(prev => ({ ...prev, contentTarget: e.target.value }))}
                        placeholder="article, main, .content"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Advertiser Name</label>
                      <Input
                        value={embedConfig.advertiserName}
                        onChange={(e) => setEmbedConfig(prev => ({ ...prev, advertiserName: e.target.value }))}
                        placeholder="Your Brand"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Logo URL (Optional)</label>
                      <Input
                        value={embedConfig.advertiserLogo}
                        onChange={(e) => setEmbedConfig(prev => ({ ...prev, advertiserLogo: e.target.value }))}
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target Element (Optional)</label>
                      <Input
                        value={embedConfig.targetElement}
                        onChange={(e) => setEmbedConfig(prev => ({ ...prev, targetElement: e.target.value }))}
                        placeholder="#widget-container"
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">Generated Embed Code</label>
                      <Button size="sm" variant="outline" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-muted rounded-md p-3 font-mono text-xs overflow-x-auto border">
                      <code className="whitespace-pre-wrap break-all">
                        {generateEmbedCode()}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
                <div className="text-sm text-muted-foreground">Cloudflare Workers</div>
                <div className="text-sm text-muted-foreground">CORS Protection</div>
                <div className="text-sm text-muted-foreground">API Key Security</div>
                <div className="text-sm text-muted-foreground">Rate Limiting</div>
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
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Website?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of websites already using intelligent AI chat to engage their visitors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="https://websyte-ai-chat-widget.clementineso.workers.dev" target="_blank" rel="noopener noreferrer">
                Try Live Demo
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline">
              View Documentation
            </Button>
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
            <div className="flex gap-6">
              <Button variant="link" asChild>
                <a href="https://websyte-ai-chat-widget.clementineso.workers.dev" target="_blank" rel="noopener noreferrer">
                  Documentation
                </a>
              </Button>
              <Button variant="link" asChild>
                <a href="https://websyte-ai-chat-widget.clementineso.workers.dev/test" target="_blank" rel="noopener noreferrer">
                  API Reference
                </a>
              </Button>
              <Button variant="link" asChild>
                <a href="https://websyte-ai-chat-widget.clementineso.workers.dev" target="_blank" rel="noopener noreferrer">
                  Live Demo
                </a>
              </Button>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground">
            <p>Powered by OpenAI • Hosted on Cloudflare Workers • MIT License</p>
          </div>
        </div>
      </footer>
    </div>
  );
}