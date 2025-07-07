import type { Route } from "./+types/blog";
import { Link } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Blog - Websyte AI | Customer Support Insights & Updates" },
    { name: "description", content: "Learn about AI-powered customer support, best practices, product updates, and insights from the Websyte AI team." },
    { name: "keywords", content: "AI customer support blog, SaaS support tips, chatbot best practices" },
  ];
}

const blogPosts = [
  {
    slug: "launch",
    title: "Introducing Websyte AI: Transform Your Docs into an AI Assistant",
    excerpt: "We're excited to announce the launch of Websyte AI, a powerful platform that turns your documentation, help articles, and website content into an intelligent customer support assistant.",
    author: "Websyte Team",
    date: "2025-01-07",
    readTime: "5 min read",
    category: "Product Update",
    featured: true
  },
  {
    slug: "reduce-support-tickets",
    title: "How to Reduce Support Tickets by 40% with AI",
    excerpt: "Learn proven strategies for implementing AI-powered customer support that actually reduces ticket volume while improving customer satisfaction.",
    author: "Product Team",
    date: "2025-01-05",
    readTime: "8 min read",
    category: "Best Practices"
  },
  {
    slug: "rag-explained",
    title: "RAG Explained: Why Your AI Assistant Won't Hallucinate",
    excerpt: "Understand how Retrieval-Augmented Generation (RAG) ensures your AI assistant provides accurate, grounded responses based on your actual content.",
    author: "Engineering Team",
    date: "2025-01-03",
    readTime: "10 min read",
    category: "Technical"
  },
  {
    slug: "vector-search-pgvector",
    title: "Building Semantic Search with pgvector and PostgreSQL",
    excerpt: "A deep dive into how we implemented lightning-fast semantic search using pgvector, HNSW indexing, and OpenAI embeddings.",
    author: "Engineering Team",
    date: "2024-12-28",
    readTime: "12 min read",
    category: "Technical"
  },
  {
    slug: "shadow-dom-widgets",
    title: "Why We Use Shadow DOM for Zero-Conflict Widget Embedding",
    excerpt: "Learn how Shadow DOM isolation ensures our chat widget never conflicts with your website's styles or JavaScript.",
    author: "Frontend Team",
    date: "2024-12-20",
    readTime: "7 min read",
    category: "Technical"
  },
  {
    slug: "customer-success-story",
    title: "Case Study: How TechStartup Reduced Support Load by 65%",
    excerpt: "See how one SaaS startup transformed their customer support by implementing Websyte AI, saving 20+ hours per week.",
    author: "Customer Success",
    date: "2024-12-15",
    readTime: "6 min read",
    category: "Case Study"
  }
];

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function Blog() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Blog
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Insights, updates, and best practices for AI-powered customer support. 
            Learn how to delight your customers while reducing support costs.
          </p>
        </div>

        {/* Featured Post */}
        {blogPosts.filter(post => post.featured).map(post => (
          <Card key={post.slug} className="mb-12 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">Featured</span>
                <span>{post.category}</span>
              </div>
              <CardTitle className="text-3xl md:text-4xl">
                <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-lg mb-4">
                {post.excerpt}
              </CardDescription>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-4 w-4" />
                    {formatDate(post.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {post.readTime}
                  </span>
                  <span>by {post.author}</span>
                </div>
                <Link 
                  to={`/blog/${post.slug}`}
                  className="text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                >
                  Read more
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.filter(post => !post.featured).map(post => (
            <Card key={post.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span>{post.category}</span>
                </div>
                <CardTitle className="text-xl line-clamp-2">
                  <Link to={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                    {post.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3 mb-4">
                  {post.excerpt}
                </CardDescription>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(post.date)}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="text-primary hover:text-primary/80"
                  >
                    Read →
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-muted/50 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get the latest insights on AI-powered customer support delivered to your inbox. 
            No spam, just valuable content.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border bg-background"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}