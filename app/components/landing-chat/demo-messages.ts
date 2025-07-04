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

## The Problem Every SaaS Faces 😤

**Your customers can't find answers.**
- 📚 Your docs are comprehensive but overwhelming
- 🔍 Search returns too many irrelevant results  
- 😵 Customers give up and flood your support team
- 💸 Each support ticket costs you $25-50

## The Solution: AI That Knows Your Product 🚀

{{component:saas-features}}

## See the Impact

{{component:roi-calculator}}

---

💬 **I can help you with:**
- 📊 "Show me ROI" - Calculate your savings
- 🚀 "How to implement" - 5-minute setup guide
- 🎯 "Success stories" - SaaS companies like yours
- 🛠️ "Integration options" - Works with your stack`
  ),

  features: createMessage(
    "assistant",
    `## Built for SaaS Companies Like Yours 🎯

{{component:saas-features}}

### Perfect For:
- **📚 Documentation-heavy products** - Make your docs instantly searchable
- **🆘 High support volume** - Deflect 40%+ of tickets automatically
- **🌱 Growing startups** - Scale support without hiring
- **🏢 SMB SaaS** - Enterprise features at startup prices

### Key Capabilities:
- **🧠 Learns from ALL your content** - Docs, FAQs, blog posts, changelogs
- **🎯 Accurate answers** - With citations to your exact documentation
- **🔄 Always up-to-date** - Automatically syncs when you update content
- **📊 Analytics included** - See what customers actually ask about

**Next steps:**
- 💰 Ask "ROI calculator" to see your savings
- 🚀 Ask "quick setup" for implementation
- 📈 Ask "success metrics" for real results`
  ),

  getStarted: createMessage(
    "assistant",
    `## 5-Minute Setup for Your SaaS 🚀

### Step 1: Add Your Content Sources
{{component:content-sources}}

### Step 2: Customize Your Assistant
- **🎨 Brand it** - Your logo, colors, and tone
- **💬 Set greeting** - Welcome message for customers
- **🎯 Add prompts** - Common questions as suggestions
- **🔧 Configure behavior** - Response style and limits

### Step 3: Install on Your Site
{{component:one-line-setup}}

### Step 4: Watch Support Tickets Drop 📉

**Common installation points:**
- 📚 Documentation site
- 🏠 Main marketing site  
- 💡 Knowledge base
- 🎓 Academy/learning portal
- 👤 Customer portal

{{component:integration-examples}}

**Need a demo?** I can show you exactly how it works for SaaS companies!`
  ),

  demo: createMessage(
    "assistant",
    `## See How SaaS Companies Use Websyte AI 🎬

### Real Customer Success Stories:

{{component:saas-case-studies}}

### Live Demo - Try It Yourself:

{{component:interactive-demo}}

**What our SaaS customers report:**
- 📉 **42% reduction** in support tickets
- ⏱️ **3x faster** time to first answer
- 😍 **87% satisfaction** rate
- 💵 **$2,400/month** saved on support costs

{{component:cta-button text="See Demo with Your Content" href="/demo"}}`
  ),

  pricing: createMessage(
    "assistant",
    `## Pricing Built for Growing SaaS 💰

{{component:saas-pricing}}

### ROI Calculator:
{{component:roi-calculator}}

### What's Included FREE:
- ✅ Unlimited customer conversations
- ✅ All your documentation indexed
- ✅ Smart recommendations
- ✅ Basic analytics
- ✅ Standard support

### Enterprise Features (Coming Soon):
- 🏢 Custom AI training on your data
- 📊 Advanced analytics & insights
- 🔐 SSO & advanced security
- 🎯 Priority support
- 🔧 Custom integrations

**No credit card required. No trial period. Just instant value.**

{{component:cta-button text="Start Reducing Support Tickets" href="/login?mode=register"}}`
  ),

  technical: createMessage(
    "assistant",
    `## Enterprise-Grade Tech for Growing SaaS 🏢

### Built for Scale:

{{component:saas-tech-specs}}

### Performance That Matters:
- ⚡ **<100ms response time** - Instant answers
- 🌐 **Global CDN** - Fast everywhere
- 📦 **~200KB widget** - Smaller than one image
- 🚀 **99.9% uptime** - Always available

### Security First:
- 🔒 **TLS 1.3 encryption**
- 🚫 **Rate limiting** per customer
- 🔐 **API key authentication**
- 🗜️ **Data isolation** per widget

### Integrations:
{{component:saas-integrations}}

### API Access:
\`\`\`bash
# List all widgets
curl -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.websyte.ai/automation/widgets

# Update knowledge base
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \\
  https://api.websyte.ai/widgets/WIDGET_ID/crawl
\`\`\`

**Questions about integration?** I can help with your specific stack!`
  ),

  customWidgets: createMessage(
    "assistant",
    `## Turn Your SaaS Knowledge Base into an AI Expert 🤖

### The Problem with Traditional Docs:
- 😕 Customers can't find what they need
- 🔍 Search returns 100+ results for simple questions
- 🙄 They give up and contact support
- 💸 Each ticket costs you time and money

### The Websyte AI Solution:

{{component:knowledge-base-transformation}}

### Content Sources We Support:
- 📚 **Documentation sites** - GitBook, Docusaurus, ReadMe
- 🔗 **Help centers** - Intercom, Zendesk, HelpScout
- 📝 **Blog posts** - Product updates, tutorials
- 📊 **PDFs** - Manuals, guides, whitepapers
- 🌐 **Any public URL** - Crawl entire sites

### Your Custom AI Will:
- 🎯 Answer with YOUR product knowledge
- 🔗 Cite exact documentation pages
- 💡 Suggest related features
- 📊 Learn what customers struggle with

{{component:cta-button text="Transform Your Docs Now" href="/login?mode=register"}}`
  ),

  howItWorks: createMessage(
    "assistant",
    `## How Websyte AI Works for SaaS 🔧

### The Smart Process:

1️⃣ **Content Ingestion**
   - Crawl your docs, help center, blog
   - Extract and understand your content
   - Create semantic search index

2️⃣ **AI Training**  
   - Learn your product terminology
   - Understand feature relationships
   - Map common customer questions

3️⃣ **Smart Responses**
   - Customer asks a question
   - AI searches your knowledge base
   - Generates accurate answer with sources

4️⃣ **Continuous Learning**
   - Track what customers ask
   - Identify documentation gaps
   - Improve over time

### The Technology:
{{component:tech-architecture}}

### Security & Privacy:
- 🔒 Your data stays yours
- 🌐 Hosted on secure edge network
- 🔐 SOC2 compliant infrastructure
- 🇪🇺 GDPR ready

**Want the technical details?** Ask about our architecture!`
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
    `## How Can I Help Your SaaS? 🤝

I'm here to show you how Websyte AI can transform your customer support. Ask me:

### 📈 Business Impact
- "Calculate my ROI" - See your potential savings
- "Show me SaaS examples" - Real success stories
- "How to reduce tickets" - Our proven approach

### 🚀 Implementation
- "How does setup work?" - 5-minute guide
- "What content can it learn?" - Docs, FAQs, more
- "Integration options" - Your existing tools

### 💰 Pricing & Value
- "Is it really free?" - Yes, here's how
- "ROI calculator" - Your specific savings
- "vs competitors" - Compare to Intercom/Zendesk

### 🔧 Technical
- "How does it work?" - RAG architecture
- "Security & privacy" - Enterprise-grade
- "API access" - Automation options

### 🎯 Your Use Case
- "SaaS documentation" - Perfect fit
- "Customer portal" - In-app help
- "Support deflection" - Reduce load

What's your biggest support challenge? Let's solve it together!`
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

  // SaaS-specific messages
  roiCalculator: createMessage(
    "assistant",
    `## ROI Calculator for Your SaaS 📊

### Let's Calculate Your Savings:

{{component:roi-calculator}}

### Industry Averages:
- 🎫 **Average support ticket cost**: $25-50
- 📉 **Ticket reduction with AI**: 35-45%
- ⏱️ **Average handle time saved**: 8 minutes/ticket
- 💰 **Monthly savings**: $2,000-10,000

### Real SaaS Examples:

**B2B Project Management SaaS**
- Before: 850 tickets/month
- After: 490 tickets/month (42% reduction)
- Savings: $9,000/month

**Developer Tools Startup**
- Before: 320 tickets/month  
- After: 195 tickets/month (39% reduction)
- Savings: $3,125/month

**Marketing Automation Platform**
- Before: 1,200 tickets/month
- After: 720 tickets/month (40% reduction)
- Savings: $12,000/month

{{component:cta-button text="Start Saving Today" href="/login?mode=register"}}`
  ),

  saasExamples: createMessage(
    "assistant",
    `## Success Stories from SaaS Companies 🏆

{{component:saas-case-studies}}

### Common Use Cases:

**1️⃣ Documentation Site**
- Embed on docs.yourproduct.com
- Answer "how-to" questions instantly
- Reduce "where is X feature" tickets

**2️⃣ Main Marketing Site**
- Help prospects understand features
- Answer pricing questions
- Guide to right plan/demo

**3️⃣ Customer Portal**
- In-app help without leaving
- Feature discovery
- Reduce churn from confusion

**4️⃣ Knowledge Base**
- Make articles instantly searchable
- Connect related content
- Track what's missing

### Results You Can Expect:
- 🔥 **Week 1**: 20% ticket reduction
- 📊 **Month 1**: 35% reduction
- 🚀 **Month 3**: 40%+ reduction
- 🎯 **Ongoing**: Better docs from insights

{{component:testimonials}}`
  ),

  integrations: createMessage(
    "assistant",
    `## Seamless Integration with Your SaaS Stack 🔗

{{component:saas-integrations}}

### Documentation Platforms:
- 📘 **GitBook** - Auto-sync content
- 🤖 **Docusaurus** - Direct crawling
- 📚 **ReadMe** - API integration
- 📝 **Notion** - Export & sync
- 🌐 **Any public docs** - URL crawler

### Help Desk Integration:
- 📧 **Intercom** - Articles & FAQs
- 🎫 **Zendesk** - Knowledge base sync
- 💙 **HelpScout** - Docs integration
- 📨 **Front** - Help center content

### Analytics & Tracking:
- 📊 **Google Analytics** - Event tracking
- 📋 **Segment** - Customer insights
- 🎯 **Mixpanel** - Behavior analytics
- 🔍 **Heap** - Auto-capture events

### Developer Tools:
- 🔧 **REST API** - Full control
- 💙 **Webhooks** - Real-time events
- 🧑‍💻 **SDKs** - Coming soon
- 🚀 **CI/CD** - Automation ready

**Your stack not listed?** We can integrate with any tool that has docs or an API!`
  ),

  supportReduction: createMessage(
    "assistant",
    `## How We Reduce Support Tickets by 40% 📉

### The Support Ticket Problem:

**Before Websyte AI:**
- 😩 Customer can't find answer in docs
- 🔍 Searches return too many results
- 😤 Gets frustrated, contacts support
- ⏱️ Agent spends 15 mins on basic question
- 💸 Costs you $25-50 per ticket

**With Websyte AI:**
- 😊 Customer asks question naturally
- 🤖 Gets instant, accurate answer
- 🔗 Sees source documentation
- ✅ Problem solved in seconds
- 💰 No ticket created!

### Top Deflected Ticket Types:
1. **"How do I..."** questions (setup, configuration)
2. **"Where is..."** feature location questions  
3. **"What does..."** feature explanation
4. **"Why can't I..."** troubleshooting
5. **"Is it possible to..."** capability questions

### The Compound Effect:
- 🌱 Fewer tickets = happier support team
- 🚀 Faster responses = happier customers
- 📊 More time for complex issues
- 💡 Insights into documentation gaps

{{component:support-metrics}}`
  ),

  competitorComparison: createMessage(
    "assistant",
    `## Why SaaS Companies Choose Websyte AI 🏆

{{component:saas-comparison-table}}

### Vs. Traditional Support Tools:

**🤖 Intercom Fin ($$$)**
- Pros: Great UI, team features
- Cons: Expensive, complex setup, overkill for SMBs
- Price: $0.99 per resolution 😱

**💬 Zendesk Answer Bot ($$)**  
- Pros: Integrated with Zendesk
- Cons: Requires Zendesk, limited AI
- Price: $50+/agent/month

**🎯 Drift ($$$)**
- Pros: Sales-focused features
- Cons: Not for support, very expensive
- Price: $2,500+/month

**✨ Websyte AI**
- Pros: Free, easy setup, powerful AI
- Cons: Less sales features (by design)
- Price: $0 forever for core features

### Why We Win for SaaS:
1. **🚀 5-minute setup** vs hours/days
2. **💰 Free** vs $500-5000/month
3. **🤖 Latest AI** (GPT-4) vs basic bots
4. **🎯 Built for support** not sales
5. **🔒 Your data stays yours**

{{component:comparison-cta}}`
  ),
};

// Response matcher to find the best response for a user query
export function findBestResponse(query: string): typeof demoMessages[keyof typeof demoMessages] | null {
  const q = query.toLowerCase();
  
  // SaaS-specific matches
  if (q.includes("roi") || q.includes("calculat") || q.includes("save") || q.includes("savings")) {
    return demoMessages.roiCalculator;
  }
  if (q.includes("example") || q.includes("case") || q.includes("success") || q.includes("stories")) {
    return demoMessages.saasExamples;
  }
  if (q.includes("integrat") || q.includes("connect") || q.includes("tool") || q.includes("stack")) {
    return demoMessages.integrations;
  }
  if (q.includes("support") || q.includes("ticket") || q.includes("reduc")) {
    return demoMessages.supportReduction;
  }
  if (q.includes("compar") || q.includes("competitor") || q.includes("vs") || q.includes("intercom") || q.includes("zendesk")) {
    return demoMessages.competitorComparison;
  }
  
  // Original matches
  if (q.includes("feature") || q.includes("what can") || q.includes("capabilities")) {
    return demoMessages.features;
  }
  if (q.includes("start") || q.includes("begin") || q.includes("setup") || q.includes("implement")) {
    return demoMessages.getStarted;
  }
  if (q.includes("demo") || q.includes("video") || q.includes("see it") || q.includes("action")) {
    return demoMessages.demo;
  }
  if (q.includes("free") || q.includes("cost") || q.includes("price") || q.includes("pricing")) {
    return demoMessages.pricing;
  }
  if (q.includes("tech") || q.includes("stack") || q.includes("performance") || q.includes("api")) {
    return demoMessages.technical;
  }
  if (q.includes("custom") || q.includes("widget") || q.includes("knowledge") || q.includes("docs")) {
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
    title: "Calculate my ROI",
    description: "See how much you'll save on support"
  },
  {
    title: "Show me SaaS examples",
    description: "Success stories from companies like yours"
  },
  {
    title: "How does setup work?",
    description: "5-minute implementation guide"
  },
  {
    title: "What content can it learn?",
    description: "Docs, FAQs, blogs, and more"
  },
  {
    title: "Integration options",
    description: "Works with your existing tools"
  },
  {
    title: "See it in action",
    description: "Live demo for SaaS companies"
  }
];