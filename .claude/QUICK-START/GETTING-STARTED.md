# Getting Started with Websyte AI Chat Widget

This guide walks you through setting up your first AI-powered chat widget from start to finish.

## 📋 Prerequisites

Before you begin, you'll need:
- A website where you can add JavaScript
- An OpenAI API key (for AI responses)
- A Google account (for authentication)

## 🚀 Step-by-Step Setup

### Step 1: Create Your Account

1. Navigate to https://your-domain.com
2. Click "Sign in with Google"
3. Authorize the application
4. You'll be redirected to the dashboard

### Step 2: Create Your First Widget

1. Click the "Create New Widget" button
2. Fill in the widget details:
   ```
   Name: My First Widget
   Description: AI assistant for my website
   Widget Type: Standard (for page content) or Custom (for uploaded docs)
   ```
3. Click "Create Widget"
4. Copy your widget ID (looks like: `550e8400-e29b-41d4-a716-446655440000`)

### Step 3: Configure Your Widget

#### Basic Settings
```javascript
// Navigate to Widget Settings
{
  "name": "Customer Support Bot",
  "welcomeMessage": "Hi! I'm here to help. What can I assist you with?",
  "placeholder": "Type your question...",
  "position": "bottom-right",
  "primaryColor": "oklch(0.37 0.123 285.885)"
}
```

#### AI Instructions
```javascript
// Custom system prompt
{
  "instructions": "You are a helpful customer support assistant for ACME Corp. Be friendly, concise, and always try to solve the customer's problem. If you can't help, offer to connect them with a human agent.",
  "additionalContext": "ACME Corp sells software development tools. Our main products are CodeEditor Pro and DebugMaster."
}
```

### Step 4: Add Content (For Custom Widgets)

#### Option A: Upload Documents
```javascript
// Supported formats: PDF, TXT, MD, DOCX, JSON
1. Go to "Content" tab
2. Click "Upload Files"
3. Select your documents
4. Wait for processing to complete
```

#### Option B: Crawl Your Website
```javascript
// Automatically extract content from your site
1. Go to "Content" tab
2. Click "Crawl Website"
3. Enter your website URL: https://docs.example.com
4. Configure crawl settings:
   - Max pages: 100
   - Include paths: /docs/, /guides/
   - Exclude paths: /api/, /changelog/
5. Start crawling
```

### Step 5: Embed on Your Website

Add this code just before the closing `</body>` tag:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
</head>
<body>
  <!-- Your website content -->
  
  <!-- Websyte AI Chat Widget -->
  <script 
    src="https://your-domain.com/dist/widget.js"
    data-widget-id="550e8400-e29b-41d4-a716-446655440000"
    async>
  </script>
</body>
</html>
```

### Step 6: Test Your Widget

1. Open your website
2. Look for the chat bubble in the bottom-right corner
3. Click to open the chat
4. Try asking a question
5. Verify the AI responds appropriately

## 🎨 Customization Options

### Visual Customization

```html
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-position="bottom-left"
  data-primary-color="oklch(0.52 0.176 142.495)"
  data-logo-url="https://your-site.com/logo.png"
  data-hide-powered-by="true"
  async>
</script>
```

### Behavioral Customization

```html
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-auto-open="true"
  data-save-messages="true"
  data-enable-audio="true"
  data-enable-citations="true"
  data-recommendations='["How do I get started?", "What features are available?", "Show me pricing"]'
  async>
</script>
```

## 🔧 Advanced Configuration

### Using the API

```javascript
// Get your API token from Settings > API
const API_TOKEN = 'your-bearer-token';

// Update widget settings programmatically
fetch('https://your-domain.com/api/automation/widgets/YOUR_WIDGET_ID', {
  method: 'PATCH',
  headers: {
    'Authorization': `Bearer ${API_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    welcomeMessage: 'Updated welcome message!',
    primaryColor: 'oklch(0.49 0.21 29.234)'
  })
});
```

### iframe Integration

```html
<!-- Embed as iframe for more control -->
<iframe
  src="https://your-domain.com/embed/YOUR_WIDGET_ID"
  width="400"
  height="600"
  frameborder="0"
  allow="microphone">
</iframe>

<script>
// Communicate with iframe
const iframe = document.querySelector('iframe');

// Listen for widget events
window.addEventListener('message', (event) => {
  if (event.data.type === 'websyte-ai-chat-widget') {
    console.log('Widget event:', event.data.action);
  }
});

// Send configuration
iframe.contentWindow.postMessage({
  type: 'websyte-ai-chat-widget',
  action: 'configure',
  data: {
    config: {
      primaryColor: 'oklch(0.37 0.123 285.885)'
    }
  }
}, '*');
</script>
```

## 📊 Monitoring Your Widget

### View Analytics

1. Go to Dashboard > Your Widget > Analytics
2. Monitor:
   - Total conversations
   - Messages per day
   - Average response time
   - User satisfaction

### Check Logs

```javascript
// Enable debug mode for troubleshooting
window.WEBSYTE_DEBUG = true;

// View console logs
// - Widget initialization
// - API calls
// - Error messages
```

## 🚨 Common Issues

### Widget Not Loading
```javascript
// Check these common causes:
1. Incorrect widget ID
2. Widget not set to public
3. JavaScript errors on page
4. Script blocked by ad blocker

// Debug with:
console.log('Widget script loaded:', 
  document.querySelector('script[data-widget-id]'));
```

### No AI Responses
```javascript
// Verify:
1. OpenAI API key is valid
2. Widget has content (for custom widgets)
3. Rate limits not exceeded
4. Check browser console for errors
```

### Styling Conflicts
```javascript
// Widget uses Shadow DOM, but if issues persist:
1. Check z-index conflicts
2. Verify position absolute/fixed containers
3. Test in isolation
4. Use !important sparingly
```

## 🎯 Best Practices

### Content Preparation
- Keep documents focused and well-structured
- Use clear headings and sections
- Include examples and FAQs
- Update content regularly

### AI Instructions
- Be specific about tone and style
- Include company/product context
- Set clear boundaries
- Test with various questions

### Performance
- Enable caching for faster responses
- Limit document size to < 10MB
- Use website crawling for large sites
- Monitor token usage

## 📚 Next Steps

1. **[Widget Customization](./WIDGET-CUSTOMIZATION.md)** - Advanced styling options
2. **[Content Management](./CONTENT-MANAGEMENT.md)** - Managing your knowledge base
3. **[API Integration](./API-QUICKSTART.md)** - Automate widget management
4. **[Advanced Features](../FEATURES/)** - Explore all capabilities

## 🆘 Getting Help

- **Documentation**: Check our [full documentation](../)
- **Examples**: See [working examples](../EXAMPLES/)
- **Support**: Email support@websyte.ai
- **Community**: Join our [Discord server](https://discord.gg/websyte)

---

Ready to customize your widget? Continue to [Widget Customization](./WIDGET-CUSTOMIZATION.md) →