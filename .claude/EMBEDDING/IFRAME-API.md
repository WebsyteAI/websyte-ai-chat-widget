# ChatWidget Iframe PostMessage API

This document describes the PostMessage API for communicating between a parent page and the ChatWidget when embedded in an iframe.

## Overview

The ChatWidget automatically detects when it's running inside an iframe and enables bi-directional communication with the parent page using the browser's PostMessage API.

## Message Format

All messages follow this structure:

```typescript
{
  type: 'websyte-ai-chat-widget',
  action: string,
  data?: any
}
```

## Parent → Widget Messages

### Configure Widget
```javascript
// Send configuration updates to the widget
window.frames[0].postMessage({
  type: 'websyte-ai-chat-widget',
  action: 'configure',
  data: {
    config: {
      hidePoweredBy: true,
      // Other ChatWidgetProps...
    }
  }
}, '*');
```

### Send Message
```javascript
// Programmatically send a message to the chat
window.frames[0].postMessage({
  type: 'websyte-ai-chat-widget',
  action: 'send-message',
  data: {
    message: 'What is the pricing for enterprise plans?'
  }
}, '*');
```

### Clear Chat
```javascript
// Clear all chat messages
window.frames[0].postMessage({
  type: 'websyte-ai-chat-widget',
  action: 'clear-chat'
}, '*');
```

### Set Placeholder
```javascript
// Update the input placeholder text
window.frames[0].postMessage({
  type: 'websyte-ai-chat-widget',
  action: 'set-placeholder',
  data: {
    placeholder: 'Ask me about our products...'
  }
}, '*');
```

## Widget → Parent Messages

### Widget Ready
```javascript
// Sent when the widget is fully loaded
{
  type: 'websyte-ai-chat-widget',
  action: 'ready',
  data: {}
}
```

### Resize Event
```javascript
// Sent when widget dimensions change (auto-resize enabled by default)
{
  type: 'websyte-ai-chat-widget',
  action: 'resize',
  data: {
    height: 500,
    width: 400
  }
}
```

### Chat Started
```javascript
// Sent when user opens the chat panel
{
  type: 'websyte-ai-chat-widget',
  action: 'chat-started',
  data: {}
}
```

### Chat Closed
```javascript
// Sent when user closes the chat panel
{
  type: 'websyte-ai-chat-widget',
  action: 'chat-closed',
  data: {}
}
```

### Chat Response
```javascript
// Sent when the assistant responds
{
  type: 'websyte-ai-chat-widget',
  action: 'chat-response',
  data: {
    message: {
      id: '1234567890',
      role: 'assistant',
      content: 'Here is the information about our pricing...',
      timestamp: '2024-01-01T00:00:00.000Z',
      sources: [...]
    }
  }
}
```

### Error
```javascript
// Sent when an error occurs
{
  type: 'websyte-ai-chat-widget',
  action: 'error',
  data: {
    error: 'Connection error'
  }
}
```

## Example Implementation

### Parent Page
```html
<!DOCTYPE html>
<html>
<head>
  <title>ChatWidget Iframe Example</title>
  <style>
    #chat-iframe {
      width: 100%;
      border: none;
      transition: height 0.3s ease;
    }
  </style>
</head>
<body>
  <iframe 
    id="chat-iframe" 
    src="https://your-widget-url.com/embed/widget-id"
    width="100%"
    height="100"
  ></iframe>

  <script>
    const chatIframe = document.getElementById('chat-iframe');
    
    // Listen for messages from the widget
    window.addEventListener('message', (event) => {
      // Validate message origin if needed
      // if (event.origin !== 'https://your-widget-url.com') return;
      
      // Check message type
      if (event.data?.type !== 'websyte-ai-chat-widget') return;
      
      switch (event.data.action) {
        case 'ready':
          console.log('Widget is ready');
          // Optionally send initial configuration
          chatIframe.contentWindow.postMessage({
            type: 'websyte-ai-chat-widget',
            action: 'configure',
            data: {
              config: {
                hidePoweredBy: true
              }
            }
          }, '*');
          break;
          
        case 'resize':
          // Auto-resize iframe to fit content
          if (event.data.data?.height) {
            chatIframe.style.height = `${event.data.data.height}px`;
          }
          break;
          
        case 'chat-started':
          console.log('User opened chat');
          // Track analytics, etc.
          break;
          
        case 'chat-response':
          console.log('Assistant response:', event.data.data?.message);
          // Log responses, update UI, etc.
          break;
          
        case 'error':
          console.error('Widget error:', event.data.data?.error);
          break;
      }
    });
    
    // Example: Send a message after 5 seconds
    setTimeout(() => {
      chatIframe.contentWindow.postMessage({
        type: 'websyte-ai-chat-widget',
        action: 'send-message',
        data: {
          message: 'Hello, I need help with pricing'
        }
      }, '*');
    }, 5000);
  </script>
</body>
</html>
```

## Security Considerations

1. **Origin Validation**: Always validate the origin of incoming messages in production:
   ```javascript
   if (event.origin !== 'https://trusted-domain.com') return;
   ```

2. **Allowed Origins**: Configure the widget with specific allowed origins:
   ```javascript
   const widget = new ChatWidget({
     iframeMessagingConfig: {
       allowedOrigins: ['https://parent-site.com', 'https://other-site.com']
     }
   });
   ```

3. **Message Validation**: Always validate message structure and content before processing.

## Auto-Resize Feature

The widget automatically observes its own size changes and sends resize events to the parent. This is enabled by default but can be configured:

```javascript
// In the widget configuration
iframeMessagingConfig: {
  enableAutoResize: true,     // Default: true
  resizeDebounceMs: 100      // Default: 100ms
}
```

The parent should handle resize events to adjust the iframe dimensions accordingly for a seamless user experience.