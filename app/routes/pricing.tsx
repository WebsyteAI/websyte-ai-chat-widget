import type { Route } from "./+types/pricing";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarketingNav } from "@/components/layout/MarketingNav";
import { UmamiTracking } from "@/lib/umami-tracker";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Pricing - Websyte AI | Transparent Pricing for Every SaaS" },
    { name: "description", content: "Simple, transparent pricing for Websyte AI. Start free, scale as you grow. No hidden fees, no surprises." },
    { name: "keywords", content: "AI chat pricing, SaaS pricing, customer support pricing, chatbot costs" },
  ];
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out Websyte AI",
    features: [
      "1 widget",
      "100 messages/month",
      "Basic chat features",
      "Community support",
      '"Powered by Websyte AI" branding'
    ],
    notIncluded: [
      "Custom branding",
      "API access",
      "Priority support",
      "Advanced analytics"
    ],
    cta: "Start Free",
    ctaLink: "/login",
    popular: false
  },
  {
    name: "Starter",
    price: "$19",
    period: "/month",
    description: "For small businesses and startups",
    features: [
      "3 widgets",
      "1,000 messages/month included",
      "$0.02 per additional message",
      "Remove branding",
      "Basic analytics",
      "Email support",
      "All file upload formats",
      "Website crawling"
    ],
    notIncluded: [
      "API access",
      "White-label option",
      "Dedicated support"
    ],
    cta: "Create Your Knowledge Base",
    ctaLink: "/login",
    popular: false
  },
  {
    name: "Pro",
    price: "$49",
    period: "/month",
    description: "For growing companies",
    features: [
      "10 widgets",
      "5,000 messages/month included",
      "$0.015 per additional message",
      "Advanced analytics",
      "Priority support",
      "Custom branding",
      "Bearer token API access",
      "Webhook notifications",
      "Team collaboration (coming soon)"
    ],
    notIncluded: [
      "White-label option",
      "Dedicated support"
    ],
    cta: "Create Your Knowledge Base",
    ctaLink: "/login",
    popular: true
  },
  {
    name: "Business",
    price: "$149",
    period: "/month",
    description: "For enterprises and agencies",
    features: [
      "Unlimited widgets",
      "20,000 messages/month included",
      "$0.01 per additional message",
      "Full API access",
      "White-label option",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Advanced security features",
      "Usage analytics API"
    ],
    notIncluded: [],
    cta: "Contact Sales",
    ctaLink: "/contact",
    popular: false
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen">
      <MarketingNav />
      <div className="container mx-auto px-4 py-24 md:py-32">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Start free and scale as you grow. No setup fees, no hidden costs. 
            Cancel anytime with no questions asked.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={cn(
                "relative flex flex-col",
                plan.popular && "border-primary shadow-lg scale-105"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 opacity-50">
                      <X className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  asChild 
                  className="w-full" 
                  variant={plan.popular ? "default" : "outline"}
                >
                  <Link 
                    to={plan.ctaLink}
                    onClick={() => {
                      UmamiTracking.trackButtonClick(`pricing-${plan.name.toLowerCase().replace(/\s+/g, '-')}`, {
                        plan: plan.name,
                        price: plan.price,
                        cta: plan.cta,
                        destination: plan.ctaLink
                      });
                    }}
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="bg-muted/50 rounded-2xl p-8 md:p-12 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Fair Usage-Based Pricing
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">How message counting works</h3>
              <p className="text-muted-foreground">
                Each interaction with your AI assistant counts as one message. This includes both 
                user questions and AI responses. Our efficient caching means repeat questions cost 
                less to process.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No surprise bills</h3>
              <p className="text-muted-foreground">
                Set spending limits and get notified when you reach 80% of your monthly allowance. 
                Upgrade, downgrade, or cancel anytime – no contracts, no penalties.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Volume discounts available</h3>
              <p className="text-muted-foreground">
                Need more than 20,000 messages per month? Contact our sales team for custom 
                pricing and enterprise features.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes take 
                effect immediately, and we'll prorate any differences.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">What happens if I exceed my message limit?</h3>
              <p className="text-muted-foreground">
                On paid plans, additional messages are charged at your plan's overage rate. 
                Free plans stop working after reaching the limit until the next month.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-muted-foreground">
                We offer a 14-day money-back guarantee on all paid plans. If you're not 
                satisfied, contact support for a full refund.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Is there a setup fee?</h3>
              <p className="text-muted-foreground">
                No! There are no setup fees, no hidden costs, and no long-term contracts. 
                Just simple, transparent monthly pricing.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of SaaS companies reducing support tickets with AI. 
            Start your free trial today – no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/login">
                Create Your Knowledge Base
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo">
                See Live Demo
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}