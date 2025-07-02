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