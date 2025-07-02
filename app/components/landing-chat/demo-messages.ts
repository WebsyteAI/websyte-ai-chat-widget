import type { Message } from "@/components/ChatWidget/types";

// Helper to create messages
function createMessage(role: "user" | "assistant", content: string): Omit<Message, "id" | "timestamp"> {
  return { role, content };
}

// Predefined demo messages for various queries
export const demoMessages = {
  welcome: createMessage(
    "assistant",
    `{{component:hero-section}}

{{component:activity-feed}}

**What would you like to explore?**
- 💡 "Show me all features" - See everything we offer
- 🚀 "How do I get started?" - Quick setup guide  
- 📊 "Compare with others" - See how we stack up
- 🎬 "Show me a demo" - Watch it in action
- 💰 "Is it really free?" - Our transparent pricing

{{component:success-stories}}`
  ),

  features: createMessage(
    "assistant",
    `## Explore Our Complete Feature Set 🚀

We've built everything you need for intelligent website engagement:

{{component:full-feature-grid}}

**Want to learn more?**
- 🛠️ Ask "technical details" for our tech stack
- 📝 Ask "how to embed" for setup instructions  
- 🤖 Ask "custom widgets" for knowledge base features
- 🏆 Ask "success stories" to see real results`
  ),

  getStarted: createMessage(
    "assistant",
    `{{component:quick-start-guide}}

### Choose Your Widget Type:

**Option 1: Standard Page Chat** - Perfect for immediate setup
{{component:embed-demo type="standard"}}

**Option 2: Custom AI Widget** {{component:feature-availability feature="customWidgets"}}
{{component:embed-demo type="custom"}}

### Platform-Specific Instructions:
{{component:setup-instructions}}

**Need help?** Tell me your platform and I'll guide you through it!`
  ),

  demo: createMessage(
    "assistant",
    `## See Websyte AI in Action 🎬

Watch how easy it is to add AI-powered conversations to any website:

{{component:video-demo}}

**What you just saw:**
- Real visitor interactions
- Instant, contextual responses
- Zero impact on page design
- Happy, engaged users

Want to try it yourself? Ask me "How do I get started?"`
  ),

  pricing: createMessage(
    "assistant",
    `## Yes, It's Really Free! 🎉

We believe every website should have AI-powered engagement:

{{component:dynamic-pricing highlight="true"}}

**Real user feedback:**

{{component:testimonial-carousel limit="3"}}

**Why free?** We're building the future of web interactions and want everyone to be part of it.

{{component:live-stats type="messages" format="full"}}

No tricks. No trials. Just powerful AI for your website.`
  ),

  technical: createMessage(
    "assistant",
    `## Built for Developers, Loved by Everyone 🛠️

Here's what powers Websyte AI:

{{component:tech-stack}}

### Performance & Security

{{component:performance-stats}}

**Developer-friendly features:**
- RESTful API with bearer token auth
- Cloudflare Workers for edge performance
- PostgreSQL with pgvector for embeddings
- React + Vite for the widget
- Full TypeScript support

Want to see the implementation details? Check out our [GitHub repo](https://github.com/websyte/ai-chat-widget)!`
  ),

  customWidgets: createMessage(
    "assistant",
    `## Custom AI Widgets - Your Knowledge, Your Assistant 🤖

Transform your documents into an intelligent AI assistant:

{{component:workflow-steps}}

**What you can upload:**
- 📄 PDFs and documents
- 🖼️ Images with text (OCR supported)
- 🌐 Entire websites via crawler
- 📚 Multiple files for comprehensive knowledge

**Your AI assistant will:**
- Answer questions from your content
- Provide inline citations [1] [2]
- Offer smart recommendations
- Learn from your specific domain

{{component:cta-button text="Build Your AI Assistant" href="/login?mode=register"}}

It's like having a subject matter expert available 24/7!`
  ),

  howItWorks: createMessage(
    "assistant",
    `## How Websyte AI Works 🔧

### For Page-Based Chat:
1. **Add one script tag** to your HTML
2. **Widget reads your content** automatically
3. **AI provides contextual answers** about your page
4. **Visitors get instant help** without leaving

### For Custom Widgets:
{{component:workflow-steps}}

**The magic behind it:**
- **RAG (Retrieval-Augmented Generation)** ensures accurate answers
- **Vector embeddings** for semantic search
- **Smart chunking** preserves context
- **Citation tracking** for transparency

Ask me about specific features or try it yourself!`
  ),

  embedInstructions: createMessage(
    "assistant",
    `## Embedding Made Simple 📝

### Step 1: Copy the Code
For standard page chat:
\`\`\`html
<script src="https://websyte.ai/dist/widget.js" async></script>
\`\`\`

### Step 2: Add to Your Site
- **WordPress**: Use a plugin like "Insert Headers and Footers"
- **Shopify**: Add to theme.liquid
- **Wix**: Use the HTML embed element
- **Static sites**: Add before closing \`</body>\` tag

### Step 3: That's It! 
The widget appears automatically and starts helping visitors.

**Pro tips:**
- Works with any website or CMS
- No configuration needed
- Doesn't affect page speed
- Mobile responsive

Need platform-specific help? Just ask!`
  ),

  benefits: createMessage(
    "assistant",
    `## Why Your Visitors Will Love This ❤️

### The Problem:
- 😤 Visitors can't find what they need
- 📈 High bounce rates
- 😴 Static, non-interactive content
- ❓ Unanswered questions

### The Solution:
- 🎯 Instant, accurate answers
- 💬 Natural conversations
- 🔍 Smart content discovery
- 😊 Delighted visitors

**Real results from our users:**
- "Reduced support tickets by 40%"
- "Visitors stay 3x longer on pages"
- "Finally, our docs are actually helpful!"

{{component:cta-button text="Join Thousands of Happy Sites" href="/login?mode=register"}}`
  ),

  apiAutomation: createMessage(
    "assistant",
    `## API & Automation 🔌

Websyte AI offers complete programmatic control:

{{component:api-example}}

### Feature Availability:
{{component:feature-availability feature="apiAccess"}}

**Perfect for:**
- 🔧 CI/CD integration
- 📦 Bulk widget management
- 🔄 Automated content updates
- 🏢 Enterprise integrations
- 🚀 Custom workflows

**Rate Limits:**
- Anonymous: 10 requests/min
- Authenticated: 30 requests/min
- Enterprise: Contact us for higher limits`
  ),

  competitors: createMessage(
    "assistant",
    `## See Why We're Different 🏆

{{component:comparison-table}}

**Our advantages:**
- 🚀 **Zero Setup Complexity** - One line, done
- 💰 **Forever Free** - No surprises, no trials
- 🧠 **Latest AI** - GPT-4o with RAG technology
- 🔓 **No Lock-in** - Your data, your control
- 👨‍💻 **Developer First** - Built by devs, for devs

{{component:auth-button action="signup" text="Start Free - See the Difference"}}`
  ),

  help: createMessage(
    "assistant",
    `## How Can I Help You? 🤝

Here are some things you can ask me:

### 🚀 Getting Started
- "How do I get started?"
- "Show me the embed code"
- "How does it work?"

### 💡 Features & Capabilities
- "What features do you have?"
- "Show me a demo"
- "How do custom widgets work?"

### 💰 Pricing & Plans
- "Is it really free?"
- "What's the catch?"
- "Any limitations?"

### 🛠️ Technical Details
- "What's your tech stack?"
- "API documentation?"
- "Performance stats?"

### 🎯 Use Cases
- "Good for blogs?"
- "E-commerce support?"
- "Documentation sites?"

Or just type your question - I'm here to help!`
  ),

  // Contextual responses for specific queries
  wordpress: createMessage(
    "assistant",
    `## Websyte AI + WordPress = ❤️

### Easy WordPress Installation:

1. **Using a Plugin:**
   - Install "Insert Headers and Footers" or similar
   - Add our script to the footer section
   - Save and you're done!

2. **Direct Theme Edit:**
   - Go to Appearance → Theme Editor
   - Open footer.php
   - Add before \`</body>\`:
   \`\`\`html
   <script src="https://websyte.ai/dist/widget.js" async></script>
   \`\`\`

3. **Using Functions.php:**
   \`\`\`php
   function add_websyte_ai() {
     echo '<script src="https://websyte.ai/dist/widget.js" async></script>';
   }
   add_action('wp_footer', 'add_websyte_ai');
   \`\`\`

**Works great with:**
- WooCommerce stores
- Blog posts
- Documentation
- Landing pages

No conflicts with other plugins guaranteed!`
  ),

  security: createMessage(
    "assistant",
    `## Enterprise-Grade Security 🔒

Your data and your visitors' privacy are our top priorities:

### Security Features:
- 🔐 **Encrypted connections** (TLS 1.3)
- 🚫 **Rate limiting** to prevent abuse
- 🛡️ **GDPR compliant** with configurable data retention
- 🧹 **Auto-cleanup** of old messages (90 days)
- 🔍 **No tracking** beyond basic analytics
- 🏢 **SOC2 compliant** infrastructure (Cloudflare)

### Data Handling:
- Messages stored securely in PostgreSQL
- Optional IP anonymization
- You own your data - export anytime
- Delete widgets and all data instantly
- No data sharing with third parties

### For Your Visitors:
- No cookies required
- No personal data collection
- Anonymous by default
- Transparent privacy policy

{{component:cta-button text="Read Security Docs" href="/docs/security"}}`
  ),
};

// Response matcher to find the best response for a user query
export function findBestResponse(query: string): typeof demoMessages[keyof typeof demoMessages] | null {
  const q = query.toLowerCase();
  
  // Direct matches
  if (q.includes("feature") || q.includes("what can") || q.includes("capabilities")) {
    return demoMessages.features;
  }
  if (q.includes("start") || q.includes("begin") || q.includes("embed") || q.includes("install")) {
    return demoMessages.getStarted;
  }
  if (q.includes("demo") || q.includes("video") || q.includes("see it") || q.includes("watch")) {
    return demoMessages.demo;
  }
  if (q.includes("free") || q.includes("cost") || q.includes("price") || q.includes("pricing")) {
    return demoMessages.pricing;
  }
  if (q.includes("tech") || q.includes("stack") || q.includes("performance") || q.includes("api")) {
    return demoMessages.technical;
  }
  if (q.includes("custom") || q.includes("widget") || q.includes("knowledge")) {
    return demoMessages.customWidgets;
  }
  if (q.includes("work") || q.includes("how does") || q.includes("function")) {
    return demoMessages.howItWorks;
  }
  if (q.includes("wordpress") || q.includes("wp")) {
    return demoMessages.wordpress;
  }
  if (q.includes("security") || q.includes("privacy") || q.includes("gdpr") || q.includes("safe")) {
    return demoMessages.security;
  }
  if (q.includes("help") || q.includes("what can i ask") || q.includes("?")) {
    return demoMessages.help;
  }
  if (q.includes("compar") || q.includes("competitor") || q.includes("vs") || q.includes("better") || q.includes("different")) {
    return demoMessages.competitors;
  }
  if (q.includes("benefit") || q.includes("why") || q.includes("value")) {
    return demoMessages.benefits;
  }
  
  // Default to help if no match
  return demoMessages.help;
}

// Demo recommendations that appear in the chat
export const demoRecommendations = [
  {
    title: "Show me the features",
    description: "Explore our powerful AI capabilities"
  },
  {
    title: "How do I get started?",
    description: "Get your embed code in seconds"
  },
  {
    title: "Is it really free?",
    description: "Learn about our forever-free pricing"
  },
  {
    title: "Show me a demo",
    description: "Watch Websyte AI in action"
  },
  {
    title: "How do custom widgets work?",
    description: "Build AI assistants with your content"
  },
  {
    title: "What's your tech stack?",
    description: "See what powers our platform"
  }
];