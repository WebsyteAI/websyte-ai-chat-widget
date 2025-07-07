import { TrendingDown, Clock, Zap, Users } from "lucide-react";

const benefits = [
  {
    icon: TrendingDown,
    title: "Reduce Support Tickets by 70%",
    description:
      "Let AI handle repetitive questions while your team focuses on complex issues that need human touch.",
  },
  {
    icon: Clock,
    title: "Available 24/7, Never Miss a Customer",
    description:
      "Your AI assistant never sleeps. Provide instant support across all time zones, weekends, and holidays.",
  },
  {
    icon: Zap,
    title: "Instant Accurate Answers",
    description:
      "No more waiting on hold. Customers get immediate responses based on your actual documentation and content.",
  },
  {
    icon: Users,
    title: "Free Up Your Team for Complex Issues",
    description:
      "Stop answering the same questions. Let your team work on what matters - building relationships and solving unique problems.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Transform Your Customer Support
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of businesses delivering exceptional customer experiences with AI-powered support.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {benefits.map((benefit) => (
            <div key={benefit.title} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                  <benefit.icon className="h-6 w-6 text-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-muted/30 rounded-2xl p-8 border shadow-lg shadow-zinc-950/5 dark:shadow-zinc-950/15">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">95%</div>
              <p className="text-muted-foreground">Customer Satisfaction</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">3 sec</div>
              <p className="text-muted-foreground">Average Response Time</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">10k+</div>
              <p className="text-muted-foreground">Active Installations</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}