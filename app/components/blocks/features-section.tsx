import {
  BrainCircuit,
  Code2,
  Database,
  Palette,
  BarChart3,
  FileText,
} from "lucide-react";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Responses",
    description:
      "Advanced AI understands your content and provides accurate, contextual answers to customer questions.",
  },
  {
    icon: Code2,
    title: "One-Line Installation",
    description:
      "Add to any website with a single script tag. No complex setup or technical expertise required.",
  },
  {
    icon: Database,
    title: "Knowledge Base Management",
    description:
      "Upload documents, crawl websites, or add custom content. Your AI learns from all your sources.",
  },
  {
    icon: Palette,
    title: "Custom Branding",
    description:
      "Match your brand with customizable colors, logos, and chat behavior. Make it truly yours.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Track conversations, popular questions, and customer satisfaction. Data-driven insights at your fingertips.",
  },
  {
    icon: FileText,
    title: "Multi-source Training",
    description:
      "Train your AI on PDFs, websites, FAQs, and more. Comprehensive knowledge from all your content.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything You Need to Delight Customers
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features that make customer support effortless, intelligent, and available 24/7.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-background rounded-2xl p-8 border shadow-lg shadow-zinc-950/5 hover:shadow-xl hover:shadow-zinc-950/10 transition-all duration-300 dark:shadow-zinc-950/15"
            >
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}