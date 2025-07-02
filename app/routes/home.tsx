import type { Route } from "./+types/home";
import { LandingPageChat } from "../components/landing-chat";

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

export function loader() {
  return { message: 'Welcome to Websyte AI' };
}

export default function Home() {
  return <LandingPageChat />;
}
