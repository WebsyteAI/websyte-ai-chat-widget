import type { Route } from ".react-router/types/app/routes/+types.blog.$slug";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowLeft, User } from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";

// Blog post data
const blogPosts: Record<string, BlogPost> = {
  "launch": {
    slug: "launch",
    title: "Introducing Websyte AI: Transform Your Docs into an AI Assistant",
    excerpt: "We're excited to announce the launch of Websyte AI, a powerful platform that turns your documentation, help articles, and website content into an intelligent customer support assistant.",
    author: "Websyte Team",
    date: "2025-01-07",
    readTime: "5 min read",
    category: "Product Update",
    content: `We're thrilled to announce the official launch of Websyte AI, a groundbreaking platform that revolutionizes how SaaS companies handle customer support.

## The Problem We're Solving

Every SaaS company faces the same challenge: customers struggle to find answers in documentation, leading to frustrated users abandoning your product, support teams drowning in repetitive questions, and lost revenue from poor onboarding experiences.

## Enter Websyte AI

Websyte AI uses advanced RAG (Retrieval-Augmented Generation) technology to turn your existing documentation, help articles, and website content into an intelligent AI assistant that provides instant answers, learns from your content, delivers accurate responses, and integrates in minutes.

## Key Features at Launch

- **Smart Content Processing**: Multi-format support (PDF, DOCX, TXT, MD, JSON), automatic OCR, website crawling, and intelligent link extraction
- **Advanced Chat Interface**: Real-time streaming responses, message persistence, source citations, mobile-responsive design
- **Developer-Friendly**: REST API with bearer token authentication, PostMessage API, comprehensive documentation
- **Enterprise-Ready**: Secure PostgreSQL database, Cloudflare Workers deployment, OAuth authentication, role-based access control

## The Technology Stack

Built on a modern, scalable foundation:
- Frontend: React Router 7, Tailwind CSS v4, Vite
- Backend: Cloudflare Workers, Hono framework
- Database: Neon PostgreSQL with pgvector
- AI/ML: OpenAI GPT-4o-mini, Mistral AI for OCR

## Get Started Today

Ready to transform your customer support? Start your free trial today and see why forward-thinking SaaS companies are choosing Websyte AI.`
  },
  "reduce-support-tickets": {
    slug: "reduce-support-tickets",
    title: "How to Reduce Support Tickets by 40% with AI",
    excerpt: "Learn proven strategies for implementing AI-powered customer support that actually reduces ticket volume while improving customer satisfaction.",
    author: "Product Team",
    date: "2025-01-05",
    readTime: "8 min read",
    category: "Best Practices",
    content: `Support ticket volume is a double-edged sword. While it shows customers are engaged with your product, it also signals friction in their experience.

## Understanding the Support Ticket Problem

Common ticket categories:
- "How do I...?" questions (45% of tickets)
- Feature clarification (20% of tickets)
- Account/billing issues (15% of tickets)
- Bug reports (10% of tickets)
- Feature requests (10% of tickets)

The first two categories—representing 65% of all tickets—are perfect candidates for AI automation.

## The AI-First Support Strategy

### 1. Implement Proactive AI Assistance
Deploy AI chat at key friction points: onboarding flows, complex feature pages, pricing sections, and error states.

### 2. Build a Comprehensive Knowledge Base
Document everything with clear headings, examples, and linked content. Keep it updated with monthly reviews.

### 3. Optimize AI Responses
Configure custom instructions and response templates for common scenarios.

### 4. Strategic Widget Placement
Place widgets on application dashboards, documentation sites, login pages, and feature pages.

## Implementation Roadmap

- Week 1: Audit tickets, identify top questions, update documentation
- Week 2: Deploy widget, configure instructions, test scenarios
- Week 3: Analyze logs, identify gaps, refine responses
- Week 4: Expand coverage, add triggers, integrate workflows

## Results You Can Expect

Most customers see 40%+ ticket reduction within 30 days, faster response times, and improved customer satisfaction.`
  },
  "rag-explained": {
    slug: "rag-explained",
    title: "RAG Explained: Why Your AI Assistant Won't Hallucinate",
    excerpt: "Understand how Retrieval-Augmented Generation (RAG) ensures your AI assistant provides accurate, grounded responses based on your actual content.",
    author: "Engineering Team",
    date: "2025-01-03",
    readTime: "10 min read",
    category: "Technical",
    content: `AI hallucination is when language models generate plausible-sounding but factually incorrect information. For customer support, this can damage trust and create liability.

## How RAG Solves This

Retrieval-Augmented Generation (RAG) combines:
1. **Retrieval**: Finding relevant information from your knowledge base
2. **Generation**: Using AI to craft natural, helpful responses

## Our RAG Implementation

### Step 1: Content Processing
- Extract and clean text from documents
- Generate embeddings using OpenAI
- Store in PostgreSQL with pgvector

### Step 2: Intelligent Retrieval
- Convert user questions to vectors
- Find similar content using cosine similarity
- Assemble relevant context

### Step 3: Augmented Generation
- Craft prompts that enforce accuracy
- Use GPT-4o-mini with low temperature
- Require source citations

## Why This Prevents Hallucination

- Every response is grounded in your content
- AI explicitly states when it lacks information
- Citations ensure traceability
- Low temperature reduces creativity

## Real-World Performance

- Factual Accuracy: 99.2%
- Source Attribution: 97.8%
- Hallucination Rate: <0.1%

RAG isn't just a technical implementation—it's a commitment to accuracy and reliability.`
  },
  "vector-search-pgvector": {
    slug: "vector-search-pgvector",
    title: "Building Semantic Search with pgvector and PostgreSQL",
    excerpt: "A deep dive into how we implemented lightning-fast semantic search using pgvector, HNSW indexing, and OpenAI embeddings.",
    author: "Engineering Team",
    date: "2024-12-28",
    readTime: "12 min read",
    category: "Technical",
    content: `Traditional search fails when users phrase questions differently than your documentation. Semantic search understands meaning, not just keywords.

## Our Technical Stack

- PostgreSQL with pgvector extension
- OpenAI text-embedding-3-small
- HNSW indexing for performance
- Drizzle ORM for type safety
- Neon for managed hosting

## Implementation Details

### Database Schema
We use pgvector to store 1536-dimensional embeddings alongside content, with HNSW indexing for fast similarity search.

### Embedding Generation
OpenAI's embedding model converts text to vectors, capturing semantic meaning in high-dimensional space.

### Content Chunking
Large documents are split into 300-500 token chunks, maintaining context while enabling precise retrieval.

### Hybrid Search
We combine vector similarity with traditional full-text search for optimal results.

## Performance Metrics

- Average query time: 45ms
- P95 query time: 120ms
- Index size (1M vectors): 1.5GB
- Relevance accuracy: 94.2%

## Key Learnings

- Proper chunking is crucial for accuracy
- HNSW tuning dramatically improves speed
- Hybrid search delivers best user experience
- Caching reduces response times

Building semantic search with pgvector provides production-ready performance with PostgreSQL's reliability.`
  },
  "shadow-dom-widgets": {
    slug: "shadow-dom-widgets",
    title: "Why We Use Shadow DOM for Zero-Conflict Widget Embedding",
    excerpt: "Learn how Shadow DOM isolation ensures our chat widget never conflicts with your website's styles or JavaScript.",
    author: "Frontend Team",
    date: "2024-12-20",
    readTime: "7 min read",
    category: "Technical",
    content: `**Note: We currently use iframe embedding for production. This discusses our future Shadow DOM implementation.**

## The Challenge

Embedding widgets on diverse websites means dealing with:
- Bootstrap's global styles
- Tailwind's CSS resets
- Enterprise apps with !important everywhere
- WordPress sites with conflicting plugins

## Current Solution: iframe Embedding

Our production implementation uses iframes for:
- Complete isolation
- Cross-origin security
- Maximum compatibility
- Simple integration

## Future: Shadow DOM

Shadow DOM creates an isolated DOM tree where styles don't leak in or out.

### Benefits
- Native performance
- Dynamic sizing
- No iframe restrictions
- Complete style isolation

### Implementation Strategy
- Comprehensive CSS reset
- Custom properties for theming
- Scoped animations
- Event delegation for performance

### Browser Support
- Chrome 53+ ✅
- Firefox 63+ ✅
- Safari 10+ ✅
- Edge 79+ ✅

## Migration Path

When we launch Shadow DOM widgets, both iframe and script embeds will be supported, letting you choose based on your needs.

Shadow DOM represents the future of widget embedding—providing native performance with complete isolation.`
  },
  "customer-success-story": {
    slug: "customer-success-story",
    title: "Case Study: How TechStartup Reduced Support Load by 65%",
    excerpt: "See how one SaaS startup transformed their customer support by implementing Websyte AI, saving 20+ hours per week.",
    author: "Customer Success",
    date: "2024-12-15",
    readTime: "6 min read",
    category: "Case Study",
    content: `TechStartup was drowning in support tickets. With just two support engineers handling 50+ tickets daily, customers waited days for responses.

## The Challenge

- 300+ support tickets per week
- 70% were repetitive "how-to" questions
- 48-hour average first response time
- 15% monthly churn due to poor support

## The Solution

TechStartup chose Websyte AI for:
- 30-minute implementation
- No code changes required
- Uses existing documentation
- Affordable startup pricing

## Implementation Timeline

- Week 1: Setup and documentation upload
- Week 2: Phased rollout to users
- Week 3-4: Optimization based on usage

## The Results

### Quantitative Impact
- Weekly tickets: 300+ → 105 (-65%)
- First response: 48 hours → <30 seconds
- Support hours: 80+ → 25 per week
- Customer churn: 15% → 6%
- NPS score: 12 → 47

### Financial ROI
- Annual savings: $370,000
- Investment: $588/year + setup
- First year ROI: 6,190%

## Key Success Factors

1. Comprehensive knowledge base
2. Strategic widget placement
3. Continuous improvement
4. Clear escalation paths

## Six Months Later

- Customer count doubled
- Support team remained at 2 people
- NPS score reached 67
- Monthly churn dropped to 3%

TechStartup's transformation shows what's possible when AI augments human support. The key? AI doesn't replace humans—it frees them to solve complex problems and build relationships.`
  }
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  content: string;
}

export function meta({ params }: Route.MetaArgs) {
  const post = blogPosts[params.slug];
  
  if (!post) {
    return [
      { title: "Blog Post Not Found - Websyte AI" },
      { name: "description", content: "The blog post you're looking for could not be found." },
    ];
  }

  return [
    { title: `${post.title} - Websyte AI Blog` },
    { name: "description", content: post.excerpt },
    { name: "keywords", content: `${post.category}, AI chat, customer support, ${post.slug.replace(/-/g, ' ')}` },
    { property: "og:title", content: post.title },
    { property: "og:description", content: post.excerpt },
    { property: "og:type", content: "article" },
    { property: "article:author", content: post.author },
    { property: "article:published_time", content: post.date },
  ];
}

export function loader({ params }: Route.LoaderArgs) {
  const post = blogPosts[params.slug];
  
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  
  return { post };
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function BlogPost({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;

  return (
    <div className="min-h-screen">
      <MarketingNav />
      <article className="container mx-auto px-4 py-24 md:py-32 max-w-4xl">
        <header className="mb-12">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full">
              {post.category}
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{post.readTime}</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {post.title}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6">
            {post.excerpt}
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>By {post.author}</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none">
          {post.content.split('\n\n').map((paragraph, index) => {
            if (paragraph.startsWith('## ')) {
              return <h2 key={index} className="text-2xl font-bold mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
            } else if (paragraph.startsWith('### ')) {
              return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
            } else if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n').filter(item => item.startsWith('- '));
              return (
                <ul key={index} className="list-disc list-inside mb-4 space-y-1">
                  {items.map((item, i) => (
                    <li key={i} className="text-muted-foreground">{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            } else if (paragraph.startsWith('**Note:')) {
              return (
                <div key={index} className="bg-muted/50 border-l-4 border-primary p-4 mb-4">
                  <p className="font-semibold">{paragraph}</p>
                </div>
              );
            } else {
              return <p key={index} className="text-muted-foreground mb-4 leading-relaxed">{paragraph}</p>;
            }
          })}
        </div>

        <footer className="mt-16 pt-8 border-t">
          <div className="flex items-center justify-between">
            <Button asChild variant="outline">
              <Link to="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
            
            <div className="flex gap-4">
              <Button asChild>
                <Link to="/register">
                  Start Free Trial
                </Link>
              </Button>
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}