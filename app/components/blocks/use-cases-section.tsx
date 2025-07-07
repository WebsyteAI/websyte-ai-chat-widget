import {
  Headphones,
  BookOpen,
  TrendingUp,
  Users2,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const useCases = [
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Answer common questions instantly, handle order inquiries, and provide 24/7 assistance to reduce ticket volume.",
    features: ["FAQ automation", "Order tracking", "Product information"],
  },
  {
    icon: BookOpen,
    title: "Documentation Assistant",
    description:
      "Help users navigate complex documentation, find specific information, and understand technical concepts quickly.",
    features: ["Code examples", "API guidance", "Tutorial navigation"],
  },
  {
    icon: TrendingUp,
    title: "Sales Enablement",
    description:
      "Qualify leads, answer product questions, and guide prospects through your offerings to boost conversions.",
    features: ["Lead qualification", "Product recommendations", "Pricing info"],
  },
  {
    icon: Users2,
    title: "Employee Onboarding",
    description:
      "Streamline internal processes by helping new team members find company policies, procedures, and resources.",
    features: ["Policy lookup", "Process guidance", "Resource discovery"],
  },
  {
    icon: ShoppingBag,
    title: "Product Discovery",
    description:
      "Help customers find the right products, compare features, and make informed purchasing decisions.",
    features: ["Product search", "Feature comparison", "Recommendations"],
  },
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Built for Every Use Case
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From customer service to internal knowledge management, our AI chat widget adapts to your needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {useCases.map((useCase) => (
            <div
              key={useCase.title}
              className="bg-background rounded-2xl p-6 border shadow-lg shadow-zinc-950/5 hover:shadow-xl hover:shadow-zinc-950/10 transition-all duration-300 dark:shadow-zinc-950/15"
            >
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center mb-4">
                <useCase.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {useCase.title}
              </h3>
              <p className="text-muted-foreground mb-4">{useCase.description}</p>
              <ul className="space-y-2">
                {useCase.features.map((feature) => (
                  <li key={feature} className="flex items-center text-sm text-muted-foreground">
                    <svg
                      className="w-4 h-4 text-muted-foreground mr-2 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">
            Not sure which use case fits your needs?
          </p>
          <Button asChild variant="ghost" className="font-semibold">
            <Link to="/contact">
              Talk to our team →
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}