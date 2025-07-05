import React, { useState, useCallback } from 'react';
import { HeroSection1 } from './blocks/hero-section-1';
import { EnhancedChatPanel } from '@/components/ChatWidget/components';
import { demoMessages, findBestResponse } from './landing-chat/demo-messages';
import { defaultComponentRegistry } from './landing-chat/component-registry';
import { DemoDataProvider } from './landing-chat/DemoDataContext';
import type { Message } from '@/components/ChatWidget/types';
import { v4 as uuidv4 } from 'uuid';

export function LandingPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: "assistant",
      content: demoMessages.welcome.content,
      timestamp: new Date(),
    }
  ]);

  const handleMessage = useCallback(async (content: string): Promise<Message> => {
    // Find the best matching response
    const response = findBestResponse(content);
    
    if (response) {
      return {
        id: uuidv4(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };
    }

    // Default response if no match found
    return {
      id: uuidv4(),
      role: "assistant",
      content: "I'm here to demonstrate how Websyte AI can help your customers find answers instantly. Try asking about features, pricing, or how to get started!",
      timestamp: new Date(),
    };
  }, []);

  return (
    <DemoDataProvider>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* Hero Section */}
        <HeroSection1 />
        
        {/* Chat Section */}
        <section className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Try It Now
              </h2>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Experience how Websyte AI instantly answers questions about your product
              </p>
            </div>
            
            {/* Chat Container */}
            <div className="mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <div className="h-[600px]">
                  <EnhancedChatPanel
                    sessionId="landing-demo"
                    chatbotId="demo"
                    chatbotName="Websyte AI Assistant"
                    chatbotAvatar="/logo.png"
                    primaryColor="#3B82F6"
                    chatbotInstructions="You are a helpful AI assistant demonstrating the capabilities of Websyte AI."
                    messages={messages}
                    onSendMessage={handleMessage}
                    setMessages={setMessages}
                    isDemoMode={true}
                    persistMessages={false}
                    showAvatar={true}
                    hideWatermark={false}
                    componentRegistry={defaultComponentRegistry}
                  />
                </div>
              </div>
            </div>
            
            {/* Additional CTA */}
            <div className="mt-12 text-center">
              <p className="text-base text-gray-600 dark:text-gray-400">
                Ready to reduce your support tickets?
              </p>
              <a
                href="/register"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                Start Your Free Trial
              </a>
            </div>
          </div>
        </section>
      </div>
    </DemoDataProvider>
  );
}