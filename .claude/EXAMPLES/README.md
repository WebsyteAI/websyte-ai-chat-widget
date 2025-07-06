# Code Examples

This directory contains working examples of Websyte AI Chat Widget integrations.

## 📚 Example Categories

### Basic Integration
- **[basic-embed.html](./basic-embed.html)** - Simple script tag integration
- **[custom-colors.html](./custom-colors.html)** - Brand color customization
- **[mobile-responsive.html](./mobile-responsive.html)** - Mobile-optimized setup

### Advanced Features
- **[iframe-integration.html](./iframe-integration.html)** - iframe with PostMessage API
- **[react-component.tsx](./react-component.tsx)** - React integration
- **[vue-component.vue](./vue-component.vue)** - Vue.js integration
- **[analytics-tracking.html](./analytics-tracking.html)** - Event tracking setup

### Use Cases
- **[customer-support.html](./customer-support.html)** - Support bot configuration
- **[documentation-assistant.html](./documentation-assistant.html)** - Docs helper setup
- **[sales-assistant.html](./sales-assistant.html)** - Sales enablement bot
- **[educational-tutor.html](./educational-tutor.html)** - Learning assistant

### API Examples
- **[api-widget-creation.js](./api-widget-creation.js)** - Create widgets via API
- **[api-content-management.js](./api-content-management.js)** - Upload and manage content
- **[api-analytics.js](./api-analytics.js)** - Fetch usage analytics
- **[webhook-integration.js](./webhook-integration.js)** - Webhook handlers

## 🚀 Quick Start Examples

### Minimal Setup
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Site</h1>
    
    <!-- Websyte AI Chat Widget -->
    <script 
        src="https://your-domain.com/dist/widget.js"
        data-widget-id="YOUR_WIDGET_ID"
        async>
    </script>
</body>
</html>
```

### Customized Widget
```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <h1>Welcome to My Site</h1>
    
    <!-- Customized Websyte AI Chat Widget -->
    <script 
        src="https://your-domain.com/dist/widget.js"
        data-widget-id="YOUR_WIDGET_ID"
        data-position="bottom-left"
        data-primary-color="oklch(0.52 0.176 142.495)"
        data-welcome-message="Hi! How can I help you today?"
        data-placeholder="Ask me anything..."
        data-recommendations='["What is pricing?", "How do I get started?", "Contact support"]'
        data-logo-url="https://mysite.com/logo.png"
        data-auto-open="false"
        data-save-messages="true"
        data-enable-audio="true"
        async>
    </script>
</body>
</html>
```

### React Integration
```tsx
import React, { useEffect } from 'react';

declare global {
  interface Window {
    WEBSYTE_DEBUG?: boolean;
  }
}

export function ChatWidget() {
  useEffect(() => {
    // Create and append script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/dist/widget.js';
    script.dataset.widgetId = 'YOUR_WIDGET_ID';
    script.dataset.primaryColor = 'oklch(0.37 0.123 285.885)';
    script.async = true;
    
    document.body.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      document.body.removeChild(script);
      // Remove widget container if exists
      const container = document.getElementById('websyte-widget-container');
      if (container) {
        container.remove();
      }
    };
  }, []);
  
  return null;
}
```

### API Automation
```javascript
const API_TOKEN = 'your-bearer-token';
const API_BASE = 'https://your-domain.com/api/automation';

async function createAndConfigureWidget() {
  // 1. Create widget
  const createResponse = await fetch(`${API_BASE}/widgets`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Auto-Generated Widget',
      description: 'Created via API',
      userId: 'user-123',
      isPublic: true
    })
  });
  
  const { widget } = await createResponse.json();
  console.log('Created widget:', widget.id);
  
  // 2. Upload content
  const content = `
# Frequently Asked Questions

## What is our product?
Our product is an amazing solution that helps you...

## How much does it cost?
We offer flexible pricing starting at $29/month...

## How do I get started?
Getting started is easy! Just follow these steps...
  `;
  
  const uploadResponse = await fetch(`${API_BASE}/widgets/${widget.id}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fileName: 'faq.md',
      content: content,
      mimeType: 'text/markdown'
    })
  });
  
  // 3. Generate recommendations
  await fetch(`${API_BASE}/widgets/${widget.id}/recommendations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_TOKEN}`
    }
  });
  
  return widget.id;
}
```

## 🔧 Running the Examples

1. Clone the repository
2. Replace `YOUR_WIDGET_ID` with your actual widget ID
3. Update the domain URLs to match your deployment
4. Open HTML files in a web browser
5. For Node.js examples, run with: `node example.js`

## 📝 Contributing Examples

To add your own examples:

1. Create a descriptive filename
2. Include comments explaining the code
3. Test thoroughly
4. Submit a pull request

## 🔗 Resources

- [Quick Start Guide](../QUICK-START/)
- [API Documentation](../API/)
- [Feature Documentation](../FEATURES/)
- [Widget Customization](../QUICK-START/WIDGET-CUSTOMIZATION.md)

---

Need help? Check our [documentation](../) or contact support@websyte.ai