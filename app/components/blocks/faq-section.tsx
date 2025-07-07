import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";

const faqs = [
  {
    question: "How does the AI learn from my content?",
    answer:
      "Our AI uses advanced natural language processing to analyze your uploaded documents, crawled websites, and custom content. It creates a knowledge base that understands context and relationships, allowing it to provide accurate, relevant answers based on your specific information.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. We use enterprise-grade encryption for all data in transit and at rest. Your content is stored in isolated environments with SOC 2 compliance. We never share your data with third parties, and you maintain full ownership of all your content.",
  },
  {
    question: "Can I customize the appearance?",
    answer:
      "Yes! You can fully customize the chat widget to match your brand. Change colors, add your logo, adjust the position, customize messages, and even modify the AI's personality and tone to align with your brand voice.",
  },
  {
    question: "What languages are supported?",
    answer:
      "We currently support over 50 languages including English, Spanish, French, German, Portuguese, Italian, Dutch, Russian, Chinese, Japanese, and more. The AI can automatically detect and respond in your customer's language.",
  },
  {
    question: "How accurate are the responses?",
    answer:
      "Our AI achieves over 95% accuracy for questions within your knowledge base. It only answers based on your provided content, never making up information. If it doesn't know an answer, it will politely say so and can escalate to human support.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about our AI chat widget
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-background rounded-2xl border shadow-lg shadow-zinc-950/5 overflow-hidden dark:shadow-zinc-950/15"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold text-foreground">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Still have questions?</p>
          <Button asChild>
            <Link to="/contact">
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}