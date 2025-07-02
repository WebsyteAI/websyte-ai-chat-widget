import type { Route } from "./+types/home";
import { LandingPageChat } from "../components/landing-chat";
import { useAuth } from "@/lib/auth/auth-context";
import { UserProfile } from "@/components/auth/UserProfile";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Websyte AI Chat Widget - Embed Intelligent AI Chat on Any Website" },
    { name: "description", content: "Add context-aware AI conversations to your articles and web pages. One script tag, zero conflicts, infinite possibilities." },
    { name: "keywords", content: "AI chat widget, website chat, OpenAI integration, context-aware AI, website embedding" },
    { property: "og:title", content: "Websyte AI Chat Widget" },
    { property: "og:description", content: "Embed intelligent AI chat on any website with one script tag" },
    { property: "og:type", content: "website" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return { message: 'Welcome to Websyte AI' };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const { isAuthenticated, isLoading } = useAuth();
  
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-50 border-b">
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
      
      {/* Full-screen chat demo */}
      <div className="flex-1 overflow-hidden">
        <LandingPageChat />
      </div>
    </div>
  );
}
