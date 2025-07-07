import type { Route } from ".react-router/types/app/routes/+types.contact";
import { Link } from "react-router";
import { Mail, Twitter } from "lucide-react";
import { MarketingNav } from "@/components/layout/MarketingNav";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact - Websyte AI Chat Widget" },
    { name: "description", content: "Get in touch with Websyte AI. Contact us via email or connect on Twitter." },
  ];
}

export default function Contact() {
  return (
    <>
      <MarketingNav />
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-32 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-xl text-gray-600">
              We'd love to hear from you. Reach out to us through any of the channels below.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="space-y-8">
              <a
                href="mailto:manuel@websyte.ai"
                className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Email Us
                  </h3>
                  <p className="text-gray-600 mt-1">manuel@websyte.ai</p>
                </div>
              </a>

              <a
                href="https://x.com/WebsyteAI"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-6 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Follow on Twitter
                  </h3>
                  <p className="text-gray-600 mt-1">@WebsyteAI</p>
                </div>
              </a>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  Have questions about our AI chat widget? Check out our{" "}
                  <Link to="/docs" className="text-blue-600 hover:text-blue-700 font-medium">
                    documentation
                  </Link>
                  {" "}or{" "}
                  <Link to="/pricing" className="text-blue-600 hover:text-blue-700 font-medium">
                    pricing
                  </Link>
                  .
                </p>
                <p>
                  We typically respond within 24 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}