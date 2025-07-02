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
} from "lucide-react";

// Hero Section Component
export function HeroSection() {
  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-wrap justify-center gap-2">
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
      
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">
          Turn Every Page Into an Interactive Conversation
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Your readers get instant answers, you get better engagement, all
          with one line of code that won't break your design.
        </p>
      </div>
      
      <Alert className="max-w-2xl mx-auto border-green-200 bg-green-50/50 dark:bg-green-950/20">
        <AlertCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>Completely Free Forever</AlertTitle>
        <AlertDescription>
          No credit card required, no hidden fees, no trial periods
        </AlertDescription>
      </Alert>
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