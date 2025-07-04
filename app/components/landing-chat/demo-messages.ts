import type { Message } from "@/components/ChatWidget/types";

// Helper to create messages
function createMessage(role: "user" | "assistant", content: string): Omit<Message, "id" | "timestamp"> {
  return { role, content };
}

// Predefined demo messages for various queries
export const demoMessages = {
  welcome: createMessage(
    "assistant",
    `# Turn Every Page Into an Interactive Conversation

Your readers get instant answers, you get better engagement, all with one line of code that won't break your design.

✨ **Free to install** instantly — no signup required

## Why Your Visitors Will Actually Stay and Engage

Stop watching analytics show high bounce rates. Give visitors the smart, instant help they're desperately looking for.

### Key Features:
- **Context-Aware AI** - Understands page content and provides intelligent, relevant responses based on your article or webpage
- **One-Click Summarization** - Instantly generate concise summaries of any page content with AI-powered analysis
- **Flexible Injection** - Choose between fixed overlay or inject into specific DOM elements for seamless integration
- **Shadow DOM Isolation** - Complete style isolation prevents conflicts with your existing website design and CSS
- **Easy Integration** - Single script tag implementation with no external dependencies or complex setup required
- **Customizable Branding** - Configure advertiser name, logo, positioning, and theme to match your brand identity

## Ready to Get Started? It's This Simple

Copy this one line of code and paste it anywhere on your website:

\`\`\`html
<script src="https://websyte.ai/dist/widget.js" async></script>
\`\`\`

✨ **Free to install** instantly — no signup required

## Built for Performance & Security

Enterprise-grade infrastructure with modern web standards:

- **Lightning Fast**: ~200KB bundle size, <100ms load time
- **Secure & Reliable**: Cloudflare Workers, CORS Protection, API Key Security, Rate Limiting
- **Universal Compatibility**: Works with any CMS, mobile responsive, Shadow DOM isolation

---

💬 **Have questions?** I can help you with:
- 🚀 "How do I get started?" - Installation instructions
- 🛠️ "Tell me about features" - Explore our capabilities
- 📊 "Show me examples" - See it in action
- 🤔 "How does it work?" - Technical details`
  ),

  features: createMessage(
    "assistant",
    `## Why Your Visitors Will Actually Stay and Engage

Stop watching analytics show high bounce rates. Give visitors the smart, instant help they're desperately looking for.

### Core Features:

**Context-Aware AI** 🧠
Understands page content and provides intelligent, relevant responses based on your article or webpage.

**One-Click Summarization** ⚡
Instantly generate concise summaries of any page content with AI-powered analysis.

**Flexible Injection** 🎯
Choose between fixed overlay or inject into specific DOM elements for seamless integration.

**Shadow DOM Isolation** 🛡️
Complete style isolation prevents conflicts with your existing website design and CSS.

**Easy Integration** 💻
Single script tag implementation with no external dependencies or complex setup required.

**Customizable Branding** 🎨
Configure advertiser name, logo, positioning, and theme to match your brand identity.

**Want to learn more?**
- 🚀 Ask "how to get started" for installation
- 🛠️ Ask "technical details" for performance specs
- 📊 Ask "pricing" to confirm it's free
- 🤔 Ask "how it works" for the technical explanation`
  ),

  getStarted: createMessage(
    "assistant",
    `## Ready to Get Started? It's This Simple

Copy this one line of code and paste it anywhere on your website:

\`\`\`html
<script src="https://websyte.ai/dist/widget.js" async></script>
\`\`\`

✨ **Free to install** instantly — no signup required

### One Line Setup
Paste this anywhere in your HTML and you're done!

**That's it!** Your AI assistant will:
- Automatically read your page content
- Provide instant, contextual answers to visitors
- Work perfectly with your existing design
- Never conflict with your CSS or JavaScript

### Platform-Specific Instructions:

**WordPress**: Install 'Insert Headers and Footers' plugin → Add script to footer → Save
**Shopify**: Online Store → Themes → Edit code → Add before </body> in theme.liquid
**Wix**: Open Wix Editor → Add HTML embed → Paste script
**Static Sites**: Add script before closing </body> tag → Deploy

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

### Websyte AI is completely free forever:
- ✅ **No credit card required**
- ✅ **No trial periods**
- ✅ **No hidden fees**
- ✅ **No user limits**
- ✅ **No page view limits**
- ✅ **Full features included**

### Why Free?
We believe every website should have AI-powered engagement. Our mission is to democratize AI chat for the web.

### How We Stay Free:
- Built on efficient edge computing (Cloudflare Workers)
- Optimized AI usage with caching
- Open source community contributions
- Optional enterprise support (coming soon)

### No Catch, Just Great AI:
- Instant setup with one line of code
- Works on unlimited websites
- No branding or "Powered by" badges
- Your data stays yours

**Ready to join thousands of sites using Websyte AI?**
\`\`\`html
<script src="https://websyte.ai/dist/widget.js" async></script>
\`\`\`

✨ Copy, paste, done - forever free!`
  ),

  technical: createMessage(
    "assistant",
    `## Built for Performance & Security

Enterprise-grade infrastructure with modern web standards.

### Lightning Fast ⚡
- **~200KB** Bundle size
- **<100ms** Load time
- Async loading doesn't block your page
- Optimized for Core Web Vitals

### Secure & Reliable 🛡️
- **Cloudflare Workers** for edge computing
- **CORS Protection** built-in
- **API Key Security** for your data
- **Rate Limiting** (10 req/min anonymous, 30 req/min authenticated)

### Universal Compatibility 🌍
- Works with **any CMS** (WordPress, Shopify, Wix, etc.)
- **Mobile responsive** design
- **Shadow DOM isolation** - zero CSS conflicts
- **All modern browsers** supported

### Technical Stack:
- **Frontend**: React with Shadow DOM encapsulation
- **Backend**: Cloudflare Workers (edge computing)
- **Database**: PostgreSQL with pgvector
- **AI**: OpenAI GPT-4o-mini + embeddings
- **Security**: GDPR compliant with auto data cleanup

Want to know more? Ask about specific technical aspects!`
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

  embedConfig: createMessage(
    "assistant",
    `## Advanced Embed Configuration 🛠️

Customize your widget with data attributes:

### Basic Embed
\`\`\`html
<script src="https://websyte.ai/dist/widget.js" async></script>
\`\`\`

### With Custom Options
\`\`\`html
<script 
  src="https://websyte.ai/dist/widget.js" 
  data-content-target="article, main, .content"
  data-advertiser-name="Your Brand"
  data-advertiser-logo="https://your-logo.png"
  data-target-element="#custom-container"
  data-base-url="https://your-api.com"
  async>
</script>
\`\`\`

### Available Options:
- **data-content-target** - CSS selector for content to analyze
- **data-advertiser-name** - Your brand name in the chat
- **data-advertiser-logo** - URL to your logo
- **data-target-element** - Where to inject the widget
- **data-base-url** - Custom API endpoint
- **data-widget-id** - For custom knowledge base widgets

All options are optional - the widget works great with defaults!`
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

  // Missing sections from original landing page
  whyEngage: createMessage(
    "assistant",
    `## Why Your Visitors Will Actually Stay and Engage 🎯

Stop watching analytics show high bounce rates. Give visitors the smart, instant help they're desperately looking for.

{{component:full-feature-grid}}

**The difference is clear:**
- ❌ Without AI: Visitors leave frustrated, can't find answers
- ✅ With Websyte AI: Instant help, happy visitors, longer sessions

Ask me about specific features or see how to get started!`
  ),

  performanceSecurity: createMessage(
    "assistant",
    `## Built for Performance & Security 🚀🔒

Enterprise-grade infrastructure with modern web standards:

{{component:performance-stats}}

**Technical highlights:**
- ⚡ **~200KB bundle** - Smaller than most images
- 🏃 **<100ms load time** - Instant widget appearance  
- 🛡️ **Cloudflare Workers** - Global edge computing
- 🔐 **Rate limiting** - 10/min anonymous, 30/min authenticated
- 📋 **GDPR compliant** - Privacy by design
- 🧹 **90-day auto cleanup** - Automatic data retention

**Infrastructure:**
- 🌍 Any website or CMS
- 📱 Mobile responsive
- 🌐 Cross-browser compatible
- 🔄 Zero conflicts guaranteed

Built with ❤️ using React Router and Cloudflare Workers.`
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

  aboutUs: createMessage(
    "assistant",
    `## About Websyte AI Chat Widget 💬

**Built with ❤️ using:**
- ⚛️ React Router 7 + Vite
- ☁️ Cloudflare Workers
- 🐘 PostgreSQL + Drizzle ORM
- 🤖 OpenAI GPT-4o-mini
- 🔐 Better Auth
- 🎨 Tailwind CSS + shadcn/ui

**Open Source & Community:**
- 📖 MIT License
- 🐙 GitHub: [websyte/ai-chat-widget](https://github.com/websyte/ai-chat-widget)
- 🐛 Report issues: [GitHub Issues](https://github.com/websyte/ai-chat-widget/issues)
- 💡 Feature requests welcome!

**Powered by:**
- OpenAI for intelligent responses
- Cloudflare Workers for global edge computing
- Neon PostgreSQL for reliable data storage

Join our community and help shape the future of web engagement!`
  ),

  // Widget workflow message
  widgetWorkflow: createMessage(
    "assistant",
    `## From Documents to Deployed AI in Minutes 🚀

Upload your knowledge base, generate embed codes, and deploy intelligent AI assistants that answer questions from your specific content.

{{component:workflow-steps}}

{{component:tech-stack}}

Ready to build your custom AI assistant? 
{{component:auth-button action="signup" text="Get Started Free"}}`
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
  if (q.includes("config") || q.includes("customize") || q.includes("options")) {
    return demoMessages.embedConfig;
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
  if (q.includes("benefit") || q.includes("why use") || q.includes("value")) {
    return demoMessages.benefits;
  }
  if (q.includes("why") && (q.includes("stay") || q.includes("engage"))) {
    return demoMessages.whyEngage;
  }
  if (q.includes("performance") || q.includes("security") || q.includes("infrastructure")) {
    return demoMessages.performanceSecurity;
  }
  if (q.includes("about") || q.includes("who") || q.includes("built") || q.includes("footer")) {
    return demoMessages.aboutUs;
  }
  if (q.includes("workflow") || q.includes("process") || q.includes("document") || q.includes("deploy")) {
    return demoMessages.widgetWorkflow;
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