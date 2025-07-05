import type { Route } from "./+types/home";
import { LandingPage } from "../components/LandingPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Websyte AI - Help Your Customers Find Answers Instantly | AI Chat for SaaS" },
    { name: "description", content: "Stop losing customers who can't find answers. Websyte AI instantly answers questions about your SaaS product using your docs, help articles, and website content. One-line setup." },
    { name: "keywords", content: "SaaS customer support, AI chat for SaaS, customer self-service, reduce support tickets, AI knowledge base, SaaS help desk alternative" },
    { property: "og:title", content: "Websyte AI - Instant Answers for Your SaaS Customers" },
    { property: "og:description", content: "Transform your docs and help content into an AI assistant that answers customer questions instantly. Reduce support tickets by 40%." },
    { property: "og:type", content: "website" },
  ];
}

export function loader() {
  return { message: 'Welcome to Websyte AI' };
}

export default function Home() {
  return <LandingPage />;
}
