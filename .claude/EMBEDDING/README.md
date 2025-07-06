# Embedding Documentation

This directory contains documentation for widget embedding and integration methods.

## 📚 Documentation Index

- [**IFRAME-API.md**](./IFRAME-API.md) - iframe communication API and postMessage protocol
- [**EMBED-CODE-USAGE.md**](./EMBED-CODE-USAGE.md) - Script tag embedding guide and configuration

## 🚀 Quick Start

### Basic Embedding
```html
<!-- Add this script to your website -->
<script src="https://yourdomain.com/dist/widget.js" async></script>
```

### Custom Widget Embedding
```html
<!-- Embed a specific knowledge base widget -->
<script 
  src="https://yourdomain.com/dist/widget.js" 
  data-widget-id="your-widget-uuid"
  async>
</script>
```

## 🎯 Embedding Methods

### 1. Script Tag Embedding
The simplest and most common method:
- **Pros**: Easy to implement, automatic updates
- **Cons**: Less control over initialization
- **Best for**: Most websites

### 2. iframe Direct Embedding
For advanced use cases:
- **Pros**: Complete isolation, full control
- **Cons**: More complex setup
- **Best for**: Apps with strict CSP

### 3. NPM Package (Coming Soon)
For React/Vue/Angular apps:
- **Pros**: Type safety, tree shaking
- **Cons**: Manual updates needed
- **Best for**: Modern web apps

## ⚙️ Configuration Options

### Script Attributes
```html
<script 
  src="https://yourdomain.com/dist/widget.js"
  data-widget-id="uuid"           <!-- Custom widget ID -->
  data-position="bottom-left"      <!-- Widget position -->
  data-primary-color="#0066cc"     <!-- Brand color -->
  data-auto-open="false"           <!-- Auto open on load -->
  data-save-messages="true"        <!-- Save chat history -->
  data-language="en"               <!-- Interface language -->
  async>
</script>
```

### Programmatic Configuration
```javascript
window.WebsyteConfig = {
  widgetId: 'your-uuid',
  position: 'bottom-right',
  theme: {
    primaryColor: '#0066cc',
    fontFamily: 'Inter, sans-serif'
  },
  behavior: {
    autoOpen: false,
    saveMessages: true,
    showOnMobile: true
  }
};
```

## 🔌 Integration Patterns

### 1. Static Websites
Simple script tag in HTML:
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <!-- Your content -->
  
  <!-- Add before closing body tag -->
  <script src="https://yourdomain.com/dist/widget.js" async></script>
</body>
</html>
```

### 2. Single Page Applications
Dynamic loading on route change:
```javascript
// React example
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://yourdomain.com/dist/widget.js';
  script.async = true;
  script.setAttribute('data-widget-id', widgetId);
  document.body.appendChild(script);
  
  return () => {
    // Cleanup on unmount
    document.body.removeChild(script);
    window.WebsyteWidget?.destroy();
  };
}, [widgetId]);
```

### 3. WordPress Integration
Add to theme or use plugin:
```php
function add_websyte_widget() {
  echo '<script src="https://yourdomain.com/dist/widget.js" 
         data-widget-id="' . get_option('websyte_widget_id') . '" 
         async></script>';
}
add_action('wp_footer', 'add_websyte_widget');
```

## 🎨 Customization

### CSS Overrides
```css
/* Custom widget styles */
#websyte-ai-chat-widget {
  --websyte-primary: #0066cc;
  --websyte-font-family: 'Custom Font', sans-serif;
  --websyte-border-radius: 12px;
}
```

### JavaScript Hooks
```javascript
// Listen for widget events
window.addEventListener('websyte:ready', (event) => {
  console.log('Widget loaded:', event.detail);
});

window.addEventListener('websyte:message', (event) => {
  console.log('Message sent:', event.detail);
});
```

## 🔒 Security

### Content Security Policy
Add to your CSP headers:
```
script-src 'self' https://yourdomain.com;
frame-src 'self' https://yourdomain.com;
connect-src 'self' https://yourdomain.com https://api.openai.com;
```

### Origin Validation
The widget validates message origins:
- Only accepts messages from trusted origins
- Sanitizes all user input
- Uses secure communication protocols

## 📊 Analytics Integration

### Google Analytics
Track widget interactions:
```javascript
window.addEventListener('websyte:opened', () => {
  gtag('event', 'chat_widget_opened', {
    event_category: 'engagement'
  });
});
```

### Custom Analytics
Send events to your backend:
```javascript
window.addEventListener('websyte:analytics', (event) => {
  fetch('/api/analytics', {
    method: 'POST',
    body: JSON.stringify(event.detail)
  });
});
```

## 🐛 Troubleshooting

### Widget Not Appearing
1. Check browser console for errors
2. Verify script URL is correct
3. Ensure no CSP violations
4. Check widget ID is valid

### Styling Issues
1. Check for CSS conflicts
2. Increase specificity if needed
3. Use Shadow DOM isolation
4. Verify theme variables

### Performance Issues
1. Enable lazy loading
2. Use production bundle
3. Check network latency
4. Monitor API rate limits

## 📱 Mobile Considerations

### Responsive Behavior
- Full screen on mobile devices
- Touch-optimized interactions
- Swipe gestures for minimize/close
- Reduced animations on low-end devices

### Mobile-Specific Config
```javascript
window.WebsyteConfig = {
  mobile: {
    position: 'fullscreen',
    showCloseButton: true,
    enableSwipeGestures: true
  }
};
```

---

For detailed implementation:
- [iframe API Documentation](./IFRAME-API.md)
- [Embed Code Usage Guide](./EMBED-CODE-USAGE.md)
- [API Reference](../API/)