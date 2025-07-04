import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScriptCopyBtn } from "@/components/ui/script-copy-btn";
import { cn } from "@/lib/utils";
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
  CheckCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  Users,
  Star,
  AlertCircle,
  Target,
  Palette,
  Calculator,
} from "lucide-react";

// Hero Section Component
export function HeroSection() {
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-4xl font-bold">
        Stop Losing Customers Who Can't Find Answers
      </h1>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Your SaaS has great docs, but customers can't find what they need. 
        Websyte AI instantly answers their questions, reducing support tickets by 40%.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <Badge variant="outline" className="py-1 px-3">
          <TrendingUp className="w-4 h-4 mr-1" />
          40% Fewer Tickets
        </Badge>
        <Badge variant="outline" className="py-1 px-3">
          <Timer className="w-4 h-4 mr-1" />
          5-Minute Setup
        </Badge>
        <Badge variant="outline" className="py-1 px-3">
          <Brain className="w-4 h-4 mr-1" />
          Learns Your Product
        </Badge>
      </div>
    </div>
  );
}

// Enhanced Feature Grid with all 15 features
export function FullFeatureGrid() {
  const allFeatures = [
    {
      icon: <Bot className="h-5 w-5" />,
      title: "Custom AI Widgets",
      description: "Create personalized AI assistants with your own knowledge base",
      category: "core",
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "RAG-Powered Responses",
      description: "Retrieval-Augmented Generation with inline citations",
      category: "core",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: "Vector Search",
      description: "Advanced semantic search using OpenAI embeddings",
      category: "core",
    },
    {
      icon: <FileText className="h-5 w-5" />,
      title: "OCR Document Processing",
      description: "Extract text from PDFs, images, and documents automatically",
      category: "advanced",
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "Context-Aware AI",
      description: "Understands page content for intelligent responses",
      category: "core",
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "One-Click Summarization",
      description: "Instantly generate concise summaries of any page",
      category: "core",
    },
    {
      icon: <Code className="h-5 w-5" />,
      title: "Easy Embed Generation",
      description: "Generate custom embed scripts with one click",
      category: "developer",
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Public & Private Widgets",
      description: "Control widget visibility and access",
      category: "security",
    },
    {
      icon: <Layers className="h-5 w-5" />,
      title: "Multi-AI Support",
      description: "Powered by OpenAI GPT-4o-mini and Mistral AI",
      category: "advanced",
    },
    {
      icon: <History className="h-5 w-5" />,
      title: "Conversation History",
      description: "Secure message persistence with session tracking",
      category: "core",
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: "Rate Limiting & Security",
      description: "Built-in API protection with configurable limits",
      category: "security",
    },
    {
      icon: <Timer className="h-5 w-5" />,
      title: "Auto Data Cleanup",
      description: "Automatic retention policies for privacy compliance",
      category: "security",
    },
    {
      icon: <GlobeLock className="h-5 w-5" />,
      title: "Website Crawler",
      description: "Crawl entire websites with Apify integration",
      category: "advanced",
    },
    {
      icon: <Share2 className="h-5 w-5" />,
      title: "Direct Widget Sharing",
      description: "Share widgets via direct URLs with full-screen chat",
      category: "core",
    },
    {
      icon: <MessageSquareQuote className="h-5 w-5" />,
      title: "Smart Prompts",
      description: "Dynamic recommendations to guide user interactions",
      category: "core",
    },
  ];

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="core">Core</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all" className="mt-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allFeatures.map((feature, index) => (
            <Card key={index} className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
      
      {['core', 'advanced', 'developer', 'security'].map(category => (
        <TabsContent key={category} value={category} className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            {allFeatures
              .filter(f => f.category === category)
              .map((feature, index) => (
                <Card key={index} className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-base">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}

// Comparison Table Component
export function ComparisonTable() {
  const comparisons = [
    { feature: "Price", websyte: "Free forever", others: "$99-499/mo" },
    { feature: "Setup", websyte: "1 line of code", others: "Complex integration" },
    { feature: "AI Quality", websyte: "GPT-4o + RAG", others: "Basic chatbots" },
    { feature: "Custom Knowledge", websyte: "✅ Unlimited", others: "❌ Limited" },
    { feature: "Citations", websyte: "✅ Inline sources", others: "❌ No sources" },
    { feature: "Page Understanding", websyte: "✅ Automatic", others: "❌ Manual setup" },
    { feature: "GDPR Compliant", websyte: "✅ Built-in", others: "⚠️ Extra cost" },
    { feature: "API Access", websyte: "✅ Included", others: "⚠️ Higher tiers only" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">How We Compare</CardTitle>
        <CardDescription className="text-center">
          See why thousands choose Websyte AI over expensive alternatives
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead className="text-center">Websyte AI</TableHead>
              <TableHead className="text-center">Others</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisons.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.feature}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={row.websyte.includes("✅") ? "default" : "secondary"}>
                    {row.websyte}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={row.others.includes("❌") ? "destructive" : "outline"}>
                    {row.others}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          * Based on popular competitors as of {new Date().toLocaleDateString()}
        </p>
      </CardFooter>
    </Card>
  );
}

// Platform-specific setup instructions
export function SetupInstructions() {
  const platforms = [
    {
      name: "WordPress",
      icon: <Globe className="h-4 w-4" />,
      instructions: [
        "Install 'Insert Headers and Footers' plugin",
        "Add our script to the footer section",
        "Save and you're done!",
      ],
    },
    {
      name: "Shopify",
      icon: <Globe className="h-4 w-4" />,
      instructions: [
        "Go to Online Store → Themes",
        "Click 'Edit code' on your theme",
        "Add script before </body> in theme.liquid",
      ],
    },
    {
      name: "Wix",
      icon: <Globe className="h-4 w-4" />,
      instructions: [
        "Open your site in the Wix Editor",
        "Add an HTML embed element",
        "Paste our script code",
      ],
    },
    {
      name: "Static Sites",
      icon: <Code className="h-4 w-4" />,
      instructions: [
        "Open your HTML file",
        "Add script before closing </body> tag",
        "Deploy your changes",
      ],
    },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      {platforms.map((platform, index) => (
        <AccordionItem key={index} value={`platform-${index}`}>
          <AccordionTrigger>
            <div className="flex items-center gap-2">
              {platform.icon}
              {platform.name}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              {platform.instructions.map((instruction, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-1">
                    {idx + 1}
                  </Badge>
                  <p className="text-sm">{instruction}</p>
                </div>
              ))}
              <div className="mt-4">
                <ScriptCopyBtn
                  code={`<script src="https://websyte.ai/dist/widget.js" async></script>`}
                  codeLanguage="html"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

// Success Stories Component
export function SuccessStories() {
  const stories = [
    {
      metric: "40%",
      description: "Reduction in support tickets",
      source: "SaaS documentation site",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      metric: "3x",
      description: "Increase in page engagement",
      source: "E-commerce blog",
      icon: <Users className="h-4 w-4" />,
    },
    {
      metric: "2.5x",
      description: "Longer session duration",
      source: "Technical documentation",
      icon: <Timer className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {stories.map((story, index) => (
        <Card key={index} className="text-center">
          <CardHeader>
            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
              {story.icon}
            </div>
            <CardTitle className="text-3xl">{story.metric}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{story.description}</p>
            <p className="text-sm text-muted-foreground mt-2">{story.source}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Quick Start Guide Component
export function QuickStartGuide() {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          30-Second Quick Start
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Copy the Script</h4>
              <ScriptCopyBtn
                code={`<script src="https://websyte.ai/dist/widget.js" async></script>`}
                codeLanguage="html"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Add to Your Site</h4>
              <p className="text-sm text-muted-foreground">
                Paste before the closing &lt;/body&gt; tag
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">That's It!</h4>
              <p className="text-sm text-muted-foreground">
                Your AI assistant is now live and helping visitors
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>No Configuration Required</AlertTitle>
          <AlertDescription>
            The widget automatically understands your page content
          </AlertDescription>
        </Alert>
      </CardFooter>
    </Card>
  );
}

// API Example Component
export function APIExample() {
  const codeExample = `# Create a widget
curl -X POST https://websyte.ai/api/automation/widgets \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Support Bot",
    "description": "Customer support assistant",
    "isPublic": true
  }'

# Upload content
curl -X POST https://websyte.ai/api/widgets/WIDGET_ID/files \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -F "file=@docs.pdf"

# Start crawling
curl -X POST https://websyte.ai/api/automation/widgets/WIDGET_ID/crawl \\
  -H "Authorization: Bearer YOUR_TOKEN"`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Integration</CardTitle>
        <CardDescription>
          Automate widget management with our RESTful API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScriptCopyBtn code={codeExample} codeLanguage="bash" />
      </CardContent>
    </Card>
  );
}

// Video Demo Component
export function VideoDemo() {
  return (
    <Card className="overflow-hidden my-6">
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
  );
}

// Workflow Steps Component (3-step process)
export function WorkflowSteps() {
  const steps = [
    {
      number: "1",
      title: "Upload Content",
      description: "Add PDFs, documents, images, or crawl entire websites to build your knowledge base",
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      details: [
        "Website crawler with Apify integration",
        "PDF and document processing",
        "OCR for images and scanned files",
        "Automatic text chunking and vectorization"
      ]
    },
    {
      number: "2", 
      title: "Generate & Share",
      description: "One-click embed code generation or share via direct URL",
      icon: <Code className="h-6 w-6 text-green-600" />,
      bgColor: "bg-green-100 dark:bg-green-900/20",
      details: [
        "Direct widget sharing URLs",
        "Public/private widget controls", 
        "Custom advertiser name and logo",
        "Copy-paste ready script tags"
      ]
    },
    {
      number: "3",
      title: "Deploy AI Assistant",
      description: "Embed anywhere and provide instant answers from your knowledge base",
      icon: <Bot className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      details: [
        "RAG responses with inline citations",
        "Smart prompt recommendations",
        "Conversation history & analytics",
        "Multi-AI model support"
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8 my-8">
      {steps.map((step, index) => (
        <Card key={index} className="text-center">
          <CardHeader>
            <div className={cn("mx-auto p-3 rounded-full w-fit mb-4", step.bgColor)}>
              {step.icon}
            </div>
            <CardTitle>{step.number}. {step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {step.details.map((detail, i) => (
              <p key={i} className="text-sm text-muted-foreground">• {detail}</p>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Tech Stack Component
export function TechStack() {
  const technologies = [
    {
      name: "OpenAI GPT-4o-mini",
      description: "Latest language model",
      icon: <Brain className="h-6 w-6 text-blue-600" />,
      bgColor: "bg-white dark:bg-gray-800"
    },
    {
      name: "Vector Search", 
      description: "Semantic similarity matching",
      icon: <Search className="h-6 w-6 text-green-600" />,
      bgColor: "bg-white dark:bg-gray-800"
    },
    {
      name: "PostgreSQL",
      description: "pgvector embeddings", 
      icon: <Database className="h-6 w-6 text-purple-600" />,
      bgColor: "bg-white dark:bg-gray-800"
    },
    {
      name: "Multi-AI",
      description: "OpenAI + Mistral support",
      icon: <Layers className="h-6 w-6 text-orange-600" />,
      bgColor: "bg-white dark:bg-gray-800"
    }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-2xl p-8 my-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-4">Powered by Advanced AI Technology</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our RAG (Retrieval-Augmented Generation) system combines the latest in AI and search technology 
          to provide accurate, contextual responses from your specific content.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {technologies.map((tech, index) => (
          <div key={index} className="text-center">
            <div className={cn("p-3 rounded-lg mb-3 w-fit mx-auto", tech.bgColor)}>
              {tech.icon}
            </div>
            <h4 className="font-semibold mb-1">{tech.name}</h4>
            <p className="text-sm text-muted-foreground">{tech.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Embed Demo Component - for showing different widget types
export function EmbedDemo({ type = "standard" }: { type?: "standard" | "custom" }) {
  const isStandard = type === "standard";
  
  return (
    <Card className={!isStandard ? "border-primary/50 bg-primary/5" : ""}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isStandard ? (
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
          {!isStandard && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              NEW
            </Badge>
          )}
        </div>
        <CardDescription>
          {isStandard ? "AI that understands your webpage content instantly" : "Your own knowledge base with uploaded documents and files"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ScriptCopyBtn
          code={isStandard ? 
            `<script src="https://websyte.ai/dist/widget.js" async></script>` :
            `<script src="https://websyte.ai/dist/widget.js" data-widget-id="your-widget-id" async></script>`
          }
          codeLanguage="html"
        />
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {isStandard ? "Perfect for:" : "Features:"}
          </p>
          <ul className="text-sm space-y-1 ml-4">
            {isStandard ? (
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
        {isStandard && (
          <p className="text-xs text-muted-foreground">
            ✨ <span className="font-semibold text-primary">Free to install</span> — No signup required
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Performance Stats Component
export function PerformanceStats() {
  const stats = [
    {
      icon: <Zap className="h-6 w-6 text-green-600" />,
      title: "Lightning Fast",
      metrics: [
        { value: "~200KB", label: "Bundle size" },
        { value: "<100ms", label: "Load time" }
      ]
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Secure & Reliable",
      metrics: [
        { value: "Cloudflare", label: "Edge computing" },
        { value: "10/30", label: "Req/min limits" },
        { value: "GDPR", label: "Compliant" },
        { value: "90 days", label: "Auto cleanup" }
      ]
    },
    {
      icon: <Globe className="h-6 w-6 text-purple-600" />,
      title: "Universal Compatibility",
      metrics: [
        { value: "Any site", label: "Works everywhere" },
        { value: "All CMSs", label: "Platform agnostic" },
        { value: "Mobile", label: "Responsive" },
        { value: "Cross-browser", label: "Compatible" }
      ]
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="text-center">
            <div className={cn("mx-auto p-3 rounded-full w-fit mb-4", 
              stat.title.includes("Fast") ? "bg-green-100 dark:bg-green-900/20" :
              stat.title.includes("Secure") ? "bg-blue-100 dark:bg-blue-900/20" :
              "bg-purple-100 dark:bg-purple-900/20"
            )}>
              {stat.icon}
            </div>
            <CardTitle>{stat.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2">
            {stat.metrics.map((metric, i) => (
              <div key={i}>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Original Features Grid Component (6 features from original landing page)
export function OriginalFeatures() {
  const features = [
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
      icon: <Target className="h-6 w-6" />,
      title: "Flexible Injection",
      description:
        "Choose between fixed overlay or inject into specific DOM elements for seamless integration.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Shadow DOM Isolation",
      description:
        "Complete style isolation prevents conflicts with your existing website design and CSS.",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Easy Integration",
      description:
        "Single script tag implementation with no external dependencies or complex setup required.",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Customizable Branding",
      description:
        "Configure advertiser name, logo, positioning, and theme to match your brand identity.",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">
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
  );
}

// Simple One-Line Setup Component
export function OneLineSetup() {
  return (
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
        <ScriptCopyBtn
          code={`<script src="https://websyte.ai/dist/widget.js" async></script>`}
          codeLanguage="html"
        />
      </CardContent>
    </Card>
  );
}

// Free Forever Component
export function FreeForever() {
  return (
    <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Yes, It's Really Free! 🎉</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              No credit card required
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              No trial periods
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              No hidden fees
            </p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              No user limits
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              No page view limits
            </p>
            <p className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Full features included
            </p>
          </div>
        </div>
        <Separator />
        <p className="text-center text-muted-foreground">
          We believe every website should have AI-powered engagement.
        </p>
      </CardContent>
    </Card>
  );
}

// SaaS-specific components

// SaaS Features Component
export function SaasFeatures() {
  const features = [
    {
      icon: TrendingUp,
      title: "40% Fewer Support Tickets",
      description: "Customers find answers instantly instead of creating tickets"
    },
    {
      icon: Timer,
      title: "24/7 Instant Answers",
      description: "Your AI never sleeps, always ready with accurate responses"
    },
    {
      icon: Brain,
      title: "Learns Your Product",
      description: "Trained on your docs, FAQs, and help articles"
    },
    {
      icon: Search,
      title: "Better Than Search",
      description: "Understands questions, not just keywords"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {features.map((feature, i) => (
        <Card key={i} className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <feature.icon className="h-5 w-5 text-primary" />
              {feature.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{feature.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ROI Calculator Component
export function RoiCalculator() {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Your Monthly Savings Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Support tickets/month</p>
            <p className="text-2xl font-bold">500</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Avg cost per ticket</p>
            <p className="text-2xl font-bold">$25</p>
          </div>
        </div>
        <Separator />
        <div>
          <p className="text-sm text-muted-foreground">With 40% reduction</p>
          <p className="text-3xl font-bold text-green-600">Save $5,000/month</p>
          <p className="text-sm text-muted-foreground mt-1">200 fewer tickets × $25 = $5,000 saved</p>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Most SaaS companies see 35-45% ticket reduction in the first month
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Content Sources Component
export function ContentSources() {
  const sources = [
    { icon: FileText, label: "Documentation", examples: "GitBook, Docusaurus, Notion" },
    { icon: MessageCircle, label: "Help Articles", examples: "Zendesk, Intercom, HelpScout" },
    { icon: Globe, label: "Website Pages", examples: "Features, Pricing, Blog posts" },
    { icon: Database, label: "Knowledge Base", examples: "FAQs, Guides, Tutorials" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sources.map((source, i) => (
        <div key={i} className="flex items-start gap-3 p-4 border rounded-lg">
          <source.icon className="h-5 w-5 text-primary mt-0.5" />
          <div>
            <p className="font-medium">{source.label}</p>
            <p className="text-sm text-muted-foreground">{source.examples}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// SaaS Case Studies Component
export function SaasCaseStudies() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Project Management SaaS</CardTitle>
              <CardDescription>850 support tickets/month → 490 tickets/month</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">42% reduction</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            "Our customers were constantly asking about features that were clearly documented. 
            Now they get instant answers and we can focus on real product issues."
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Saves $9,000/month
            </span>
            <span className="flex items-center gap-1">
              <Timer className="h-4 w-4 text-blue-600" />
              8 hours/week saved
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Developer Tools Startup</CardTitle>
              <CardDescription>320 tickets/month → 195 tickets/month</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">39% reduction</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            "Our docs are technical and comprehensive. Websyte AI helps developers find exactly 
            what they need without digging through 100+ pages."
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Saves $3,125/month
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4 text-blue-600" />
              NPS increased 15 points
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// SaaS Pricing Component
export function SaasPricing() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="border-2">
        <CardHeader>
          <CardTitle>Free Forever</CardTitle>
          <CardDescription>Perfect for growing SaaS</CardDescription>
          <div className="text-3xl font-bold">$0</div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Unlimited conversations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              All your docs indexed
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Basic analytics
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Email support
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full">Get Started Free</Button>
        </CardFooter>
      </Card>

      <Card className="border-2 border-primary relative">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge>Most Popular</Badge>
        </div>
        <CardHeader>
          <CardTitle>Pro</CardTitle>
          <CardDescription>For scaling SaaS</CardDescription>
          <div className="text-3xl font-bold">Coming Soon</div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Everything in Free
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Advanced analytics
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Custom AI training
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Priority support
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="secondary">Join Waitlist</Button>
        </CardFooter>
      </Card>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>For large teams</CardDescription>
          <div className="text-3xl font-bold">Custom</div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Everything in Pro
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              SSO & Security
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Custom integrations
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Dedicated support
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="outline">Contact Sales</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// SaaS Integrations Component
export function SaasIntegrations() {
  const integrations = [
    { name: "GitBook", category: "Docs", icon: "📚" },
    { name: "Docusaurus", category: "Docs", icon: "🦖" },
    { name: "Zendesk", category: "Support", icon: "🎫" },
    { name: "Intercom", category: "Support", icon: "💬" },
    { name: "Notion", category: "Knowledge", icon: "📝" },
    { name: "HelpScout", category: "Support", icon: "💙" },
    { name: "Google Analytics", category: "Analytics", icon: "📊" },
    { name: "Segment", category: "Analytics", icon: "📈" }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {integrations.map((integration, i) => (
        <div key={i} className="flex flex-col items-center gap-2 p-4 border rounded-lg hover:border-primary transition-colors">
          <span className="text-2xl">{integration.icon}</span>
          <p className="font-medium text-sm">{integration.name}</p>
          <p className="text-xs text-muted-foreground">{integration.category}</p>
        </div>
      ))}
    </div>
  );
}

// SaaS Comparison Table Component  
export function SaasComparisonTable() {
  return (
    <Table>
      <TableCaption>Compare Websyte AI with expensive alternatives</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead className="text-center">Websyte AI</TableHead>
          <TableHead className="text-center">Intercom</TableHead>
          <TableHead className="text-center">Zendesk</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">Setup Time</TableCell>
          <TableCell className="text-center">✅ 5 minutes</TableCell>
          <TableCell className="text-center">❌ Days/Weeks</TableCell>
          <TableCell className="text-center">❌ Days/Weeks</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Pricing</TableCell>
          <TableCell className="text-center">✅ Free</TableCell>
          <TableCell className="text-center">❌ $499+/mo</TableCell>
          <TableCell className="text-center">❌ $55+/agent</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">AI Quality</TableCell>
          <TableCell className="text-center">✅ GPT-4</TableCell>
          <TableCell className="text-center">⚠️ Basic</TableCell>
          <TableCell className="text-center">⚠️ Basic</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">Learn from Docs</TableCell>
          <TableCell className="text-center">✅ Automatic</TableCell>
          <TableCell className="text-center">⚠️ Manual</TableCell>
          <TableCell className="text-center">⚠️ Manual</TableCell>
        </TableRow>
        <TableRow>
          <TableCell className="font-medium">No Lock-in</TableCell>
          <TableCell className="text-center">✅ Yes</TableCell>
          <TableCell className="text-center">❌ Contract</TableCell>
          <TableCell className="text-center">❌ Contract</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

// Support Metrics Component
export function SupportMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-green-600">42%</CardTitle>
          <CardDescription>Average ticket reduction</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-blue-600">3x</CardTitle>
          <CardDescription>Faster response time</CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-bold text-purple-600">87%</CardTitle>
          <CardDescription>Customer satisfaction</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

// Knowledge Base Transformation Component
export function KnowledgeBaseTransformation() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-2xl">📚</span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">1. Add Your Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Point us to your docs, help center, or upload files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🤖</span>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg">2. AI Learns</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We index and understand your entire knowledge base
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <span className="text-2xl">✨</span>
            <CardTitle className="text-lg">3. Customers Get Answers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Instant, accurate responses with source citations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Tech Architecture Component
export function TechArchitecture() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How It Works Under the Hood</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Badge variant="outline">1</Badge>
            <div>
              <p className="font-medium">Content Processing</p>
              <p className="text-sm text-muted-foreground">
                Your docs are chunked, embedded, and indexed for semantic search
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">2</Badge>
            <div>
              <p className="font-medium">RAG Pipeline</p>
              <p className="text-sm text-muted-foreground">
                Questions trigger retrieval of relevant content chunks
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">3</Badge>
            <div>
              <p className="font-medium">AI Generation</p>
              <p className="text-sm text-muted-foreground">
                GPT-4 generates accurate answers using retrieved context
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">4</Badge>
            <div>
              <p className="font-medium">Citation Tracking</p>
              <p className="text-sm text-muted-foreground">
                Every answer includes links to source documentation
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// SaaS Tech Specs Component
export function SaasTechSpecs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Infrastructure</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• Cloudflare Workers (150+ locations)</li>
            <li>• PostgreSQL with pgvector</li>
            <li>• R2 object storage</li>
            <li>• Global CDN delivery</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI & Processing</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>• OpenAI GPT-4o-mini</li>
            <li>• text-embedding-3-small</li>
            <li>• Mistral AI for OCR</li>
            <li>• RAG with citations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Interactive Demo Component
export function InteractiveDemo() {
  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <CardTitle>Try It With Your Own Question!</CardTitle>
        <CardDescription>
          This chat is powered by Websyte AI. Ask anything about our product!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            <strong>Try asking:</strong> "How can Websyte AI help reduce my support tickets?"
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

// Integration Examples Component
export function IntegrationExamples() {
  return (
    <Tabs defaultValue="docs" className="w-full">
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="docs">Documentation</TabsTrigger>
        <TabsTrigger value="app">In-App Help</TabsTrigger>
        <TabsTrigger value="portal">Customer Portal</TabsTrigger>
      </TabsList>
      <TabsContent value="docs">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">docs.yourproduct.com</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add to your documentation site to help users find specific answers
            </p>
            <ScriptCopyBtn
              code={`<!-- Add before </body> -->
<script src="https://websyte.ai/dist/widget.js" 
  data-widget-id="YOUR_WIDGET_ID" 
  async>
</script>`}
              codeLanguage="html"
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="app">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">app.yourproduct.com</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Embed in your SaaS app for contextual help
            </p>
            <ScriptCopyBtn
              code={`// React/Next.js component
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://websyte.ai/dist/widget.js';
  script.setAttribute('data-widget-id', 'YOUR_WIDGET_ID');
  script.async = true;
  document.body.appendChild(script);
}, []);`}
              codeLanguage="javascript"
            />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="portal">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">portal.yourproduct.com</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Add to customer portal for self-service support
            </p>
            <ScriptCopyBtn
              code={`<!-- Customer portal integration -->
<script>
  window.websyteConfig = {
    widgetId: 'YOUR_WIDGET_ID',
    userId: currentUser.id, // Optional user tracking
    metadata: {
      plan: currentUser.plan,
      accountType: currentUser.type
    }
  };
</script>
<script src="https://websyte.ai/dist/widget.js" async></script>`}
              codeLanguage="html"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

// Testimonials Component
export function Testimonials() {
  const testimonials = [
    {
      quote: "Cut our support tickets by 42% in the first month. Best ROI we've seen.",
      author: "Sarah Chen",
      role: "Head of Support",
      company: "ProjectHub"
    },
    {
      quote: "Our docs are complex. Websyte AI makes them instantly accessible.",
      author: "Marcus Rodriguez", 
      role: "CTO",
      company: "DevTools Pro"
    },
    {
      quote: "Setup took 5 minutes. Savings started immediately. No brainer.",
      author: "Emily Watson",
      role: "Customer Success Lead",
      company: "MarketingOS"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {testimonials.map((testimonial, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="text-sm mb-4 italic">"{testimonial.quote}"</p>
            <div>
              <p className="font-medium text-sm">{testimonial.author}</p>
              <p className="text-xs text-muted-foreground">
                {testimonial.role}, {testimonial.company}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Comparison CTA Component
export function ComparisonCta() {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="pt-6 text-center">
        <h3 className="text-2xl font-bold mb-4">
          Stop Overpaying for Basic Chatbots
        </h3>
        <p className="mb-6">
          Get better AI, easier setup, and zero monthly fees.
        </p>
        <Button size="lg" variant="secondary">
          Start Free - No Credit Card
        </Button>
      </CardContent>
    </Card>
  );
}