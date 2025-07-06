# Quick Start Guide

Get up and running with Websyte AI Chat Widget in minutes!

## 🚀 5-Minute Setup

### 1. Create Your Widget

```bash
# Using the Dashboard (Recommended)
1. Go to https://your-domain.com
2. Sign up/Login with Google
3. Click "Create Widget"
4. Configure your widget settings
5. Get your widget ID
```

### 2. Add to Your Website

```html
<!-- Add this before </body> -->
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  async>
</script>
```

That's it! Your AI chat widget is now live on your website.

## 📚 Quick Start Guides

- **[Getting Started](./GETTING-STARTED.md)** - Complete setup walkthrough
- **[Widget Customization](./WIDGET-CUSTOMIZATION.md)** - Style and behavior options
- **[Content Management](./CONTENT-MANAGEMENT.md)** - Upload docs and crawl websites
- **[API Quick Start](./API-QUICKSTART.md)** - Programmatic widget management
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🎯 Common Use Cases

### Customer Support Bot
```javascript
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-position="bottom-right"
  data-primary-color="#0066cc"
  data-welcome-message="Hi! How can I help you today?"
  async>
</script>
```

### Documentation Assistant
```javascript
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-placeholder="Search our docs..."
  data-auto-open="false"
  data-enable-citations="true"
  async>
</script>
```

### Product Guide
```javascript
<script 
  src="https://your-domain.com/dist/widget.js"
  data-widget-id="YOUR_WIDGET_ID"
  data-recommendations='["How to get started?", "What are the features?", "Pricing plans"]'
  async>
</script>
```

## 🔧 Essential Configuration

### Widget Types

1. **Standard Widget** - Uses current page content
   - No setup required
   - Automatically extracts page content
   - Great for blogs and documentation

2. **Custom Widget** - Uses uploaded knowledge base
   - Upload PDFs, docs, markdown files
   - Crawl your website
   - Perfect for support and FAQs

### Key Settings

```javascript
// All available data attributes
data-widget-id="required"           // Your widget ID
data-position="bottom-right"        // Widget position
data-primary-color="#0066cc"        // Brand color (OKLCH format)
data-save-messages="true"           // Persist chat history
data-auto-open="false"              // Open on page load
data-hide-powered-by="false"        // Remove branding
data-placeholder="Ask me anything..." // Input placeholder
data-welcome-message="Welcome!"     // Initial greeting
data-enable-audio="true"            // Text-to-speech
data-enable-citations="true"        // Show sources
```

## 🎨 Quick Customization

### Change Colors
```javascript
// Use OKLCH color format
data-primary-color="oklch(0.37 0.123 285.885)"  // Blue
data-primary-color="oklch(0.52 0.176 142.495)"  // Green
data-primary-color="oklch(0.49 0.21 29.234)"    // Orange
```

### Add Your Logo
```javascript
data-logo-url="https://your-site.com/logo.png"
data-logo-alt="Company Name"
```

### Custom Welcome Flow
```javascript
data-welcome-message="👋 Welcome to our support!"
data-recommendations='["FAQ", "Contact Sales", "View Docs"]'
data-auto-open="true"
```

## 📊 Quick Analytics

Track widget usage:

```javascript
// Listen for widget events
window.addEventListener('message', (event) => {
  if (event.data.type === 'websyte-ai-chat-widget') {
    switch (event.data.action) {
      case 'chat-opened':
        analytics.track('Chat Opened');
        break;
      case 'message-sent':
        analytics.track('Message Sent', {
          message: event.data.data.message
        });
        break;
    }
  }
});
```

## 🚨 Quick Troubleshooting

### Widget Not Appearing?
1. Check console for errors
2. Verify widget ID is correct
3. Ensure script is loaded before `</body>`
4. Check if widget is set to public

### Slow Responses?
1. Check your OpenAI API key status
2. Verify content is properly indexed
3. Enable caching in widget settings

### Styling Issues?
1. Widget uses Shadow DOM for isolation
2. Use data attributes for customization
3. Check for CSS conflicts

## 🎯 Next Steps

1. **Upload Content** - Add your knowledge base
2. **Customize Appearance** - Match your brand
3. **Configure Behavior** - Set up AI instructions
4. **Monitor Usage** - Track performance
5. **Iterate** - Improve based on user feedback

## 🔗 Resources

- [Full Documentation](..)
- [API Reference](../API/)
- [Examples](../EXAMPLES/)
- [GitHub Repository](https://github.com/your-org/websyte-ai-chat-widget)

---

Need help? Contact support@websyte.ai or check our [documentation](../).