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
            Zero Setup Conflicts Guaranteed
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
            Stop Losing Visitors Who Can't Find What They Need
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Turn every article into an interactive conversation. Your readers get instant answers, you get better engagement, all with one line of code that won't break your design.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a 
              href="https://websyte-ai-chat-widget.clementineso.workers.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-black bg-white text-black text-base font-medium hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer"
            >
              See It Work in 30 Seconds
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            <button className="px-6 py-3 rounded-md border border-black bg-black text-white text-base font-medium hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer">
              Fix My Website's Engagement
            </button>
          </div>
          
          {/* Video Demo in Hero */}
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 aspect-video flex items-center justify-center">
                  {/* Placeholder for video - replace with actual video component */}
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-white text-xl font-semibold">See the Transformation</h3>
                      <p className="text-white/70 text-sm max-w-md mx-auto">
                        Watch confused visitors become engaged users in real-time
                      </p>
                    </div>
                    <button className="px-6 py-3 rounded-md border border-white bg-white text-black text-base font-medium hover:shadow-[4px_4px_0px_0px_rgba(255,255,255)] transition duration-200 cursor-pointer">
                      Watch Demo (2:30)
                    </button>
                  </div>
                  
                  {/* Video overlay elements */}
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-black/20 text-white border-white/20">
                      Live Demo
                    </Badge>
                  </div>
                  
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center gap-2 text-white/70 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      Recording
                    </div>
                  </div>
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
              Stop watching analytics show high bounce rates. Give visitors the smart, instant help they're desperately looking for.
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
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Get Started? It's This Simple
            </h2>
            <p className="text-xl text-muted-foreground">
              Copy this one line of code and paste it anywhere on your website
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                One Line Setup
              </CardTitle>
              <CardDescription>
                Paste this anywhere in your HTML and you're done
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-green-400">
                    {`<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" async></script>`}
                  </code>
                </div>
                <button 
                  className="absolute top-2 right-2 px-3 py-2 rounded-md border border-black bg-white text-black text-sm hover:shadow-[2px_2px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer"
                  onClick={async () => {
                    await navigator.clipboard.writeText(`<script src="https://websyte-ai-chat-widget.clementineso.workers.dev/dist/widget.js" async></script>`);
                  }}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                      Need custom configuration?
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Add data attributes for branding, targeting, and positioning. 
                      <Button variant="link" className="p-0 h-auto text-blue-600 dark:text-blue-400">
                        View documentation →
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
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
            Stop Losing Visitors. Start Converting Them.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Every day you wait is another day of missed opportunities. Your competitors are already keeping visitors engaged longer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://websyte-ai-chat-widget.clementineso.workers.dev" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-md border border-black bg-white text-black text-base font-medium hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer"
            >
              See the Results Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
            <button className="px-6 py-3 rounded-md border border-black bg-black text-white text-base font-medium hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-200 cursor-pointer">
              Get Started in 5 Minutes
            </button>
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