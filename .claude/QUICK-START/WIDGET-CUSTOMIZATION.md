# Widget Customization Guide

Make the Websyte AI Chat Widget match your brand perfectly with these customization options.

## 🎨 Visual Customization

### Color Schemes

The widget uses OKLCH color format for better color consistency across devices.

```html
<!-- Blue theme (default) -->
<script 
  data-primary-color="oklch(0.37 0.123 285.885)"
  ...>
</script>

<!-- Green theme -->
<script 
  data-primary-color="oklch(0.52 0.176 142.495)"
  ...>
</script>

<!-- Orange theme -->
<script 
  data-primary-color="oklch(0.49 0.21 29.234)"
  ...>
</script>

<!-- Purple theme -->
<script 
  data-primary-color="oklch(0.44 0.16 310.5)"
  ...>
</script>

<!-- Custom color -->
<script 
  data-primary-color="oklch(0.6 0.2 150)"
  ...>
</script>
```

### Color Converter
```javascript
// Convert HEX to OKLCH
function hexToOklch(hex) {
  // Use an online converter or this approximation
  // https://oklch.com/
  return `oklch(0.5 0.15 ${Math.random() * 360})`;
}

// Example
const brandColor = "#0066cc";
const oklchColor = hexToOklch(brandColor);
```

### Position Options

```html
<!-- Bottom right (default) -->
<script 
  data-position="bottom-right"
  ...>
</script>

<!-- Bottom left -->
<script 
  data-position="bottom-left"
  ...>
</script>

<!-- Custom position with CSS -->
<style>
  /* Override widget position */
  #websyte-widget-container {
    bottom: 100px !important;
    right: 50px !important;
  }
</style>
```

### Size Customization

```html
<!-- Embedded mode with custom size -->
<div id="chat-container" style="width: 400px; height: 600px;">
  <script 
    data-widget-id="YOUR_WIDGET_ID"
    data-display-mode="embedded"
    data-container-id="chat-container"
    ...>
  </script>
</div>

<!-- Fullscreen mode -->
<script 
  data-display-mode="fullscreen"
  ...>
</script>
```

## 🏷️ Branding Options

### Add Your Logo

```html
<script 
  data-logo-url="https://your-site.com/logo.png"
  data-logo-alt="ACME Corp"
  data-logo-height="32"
  ...>
</script>
```

### Custom Header

```javascript
// Via API
await updateWidget({
  headerConfig: {
    title: "ACME Support",
    subtitle: "We're here to help!",
    showStatus: true,
    statusMessage: "Typically replies in seconds"
  }
});
```

### Remove Powered By

```html
<!-- Hide attribution (Pro plan) -->
<script 
  data-hide-powered-by="true"
  ...>
</script>
```

## 💬 Content Customization

### Welcome Experience

```html
<script 
  data-welcome-message="👋 Welcome to ACME Support! How can I help you today?"
  data-placeholder="Ask me anything about our products..."
  data-initial-messages='[
    "Hi! I'm your AI assistant.",
    "I can help you with:",
    "• Product information",
    "• Technical support", 
    "• Billing questions"
  ]'
  ...>
</script>
```

### Suggested Questions

```html
<script 
  data-recommendations='[
    "What products do you offer?",
    "How do I get started?",
    "What are your pricing plans?",
    "Can I see a demo?",
    "How do I contact support?"
  ]'
  data-recommendations-title="Popular Questions"
  ...>
</script>
```

### Custom Prompts

```javascript
// Set via dashboard or API
const customInstructions = `
You are ACME Corp's friendly support assistant.

Personality:
- Professional but approachable
- Use emojis sparingly
- Be concise but thorough

Knowledge:
- Our products: CodeEditor Pro, DebugMaster
- Pricing: Starter $29/mo, Pro $99/mo, Enterprise custom
- Support hours: 24/7 for Pro and Enterprise

Guidelines:
- Always greet users warmly
- Ask clarifying questions when needed
- Offer to escalate to human support for complex issues
- End with "Is there anything else I can help with?"
`;
```

## 🎯 Behavioral Customization

### Auto-Open Settings

```html
<!-- Open immediately on page load -->
<script 
  data-auto-open="true"
  data-auto-open-delay="0"
  ...>
</script>

<!-- Open after delay -->
<script 
  data-auto-open="true"
  data-auto-open-delay="5000"
  ...>
</script>

<!-- Open based on user behavior -->
<script>
// Open when user scrolls 50% down
let opened = false;
window.addEventListener('scroll', () => {
  if (!opened && window.scrollY > document.body.scrollHeight * 0.5) {
    window.postMessage({
      type: 'websyte-ai-chat-widget',
      action: 'open'
    }, '*');
    opened = true;
  }
});
</script>
```

### Message Persistence

```html
<!-- Save chat history -->
<script 
  data-save-messages="true"
  data-message-retention-days="30"
  ...>
</script>

<!-- Session-only messages -->
<script 
  data-save-messages="false"
  ...>
</script>
```

### Sound Settings

```html
<!-- Enable all sounds -->
<script 
  data-enable-sounds="true"
  data-notification-sound="true"
  data-send-sound="true"
  ...>
</script>

<!-- Custom notification sound -->
<script 
  data-notification-sound-url="https://your-site.com/notification.mp3"
  ...>
</script>
```

## 🔧 Advanced Customization

### Custom CSS Injection

```javascript
// After widget loads
window.addEventListener('websyte-widget-ready', () => {
  const widgetRoot = document.querySelector('#websyte-widget-container')
    ?.shadowRoot;
  
  if (widgetRoot) {
    const style = document.createElement('style');
    style.textContent = `
      /* Custom styles */
      .chat-message.user {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      
      .chat-input {
        border-radius: 25px;
      }
      
      .widget-header {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
      }
    `;
    widgetRoot.appendChild(style);
  }
});
```

### Custom Components

```html
<!-- Replace default components -->
<script>
const widgetConfig = {
  components: {
    // Custom welcome screen
    WelcomeScreen: () => {
      return {
        render: (container) => {
          container.innerHTML = `
            <div class="custom-welcome">
              <img src="/mascot.png" alt="Mascot">
              <h2>Need Help?</h2>
              <p>I'm here 24/7 to answer your questions!</p>
              <button onclick="startChat()">Start Chat</button>
            </div>
          `;
        }
      };
    },
    
    // Custom message renderer
    MessageRenderer: (message) => {
      if (message.metadata?.type === 'product') {
        return `
          <div class="product-card">
            <img src="${message.metadata.image}">
            <h3>${message.metadata.title}</h3>
            <p>${message.content}</p>
            <a href="${message.metadata.link}">Learn More</a>
          </div>
        `;
      }
      return null; // Use default renderer
    }
  }
};
</script>
```

### Event Handling

```javascript
// Listen for widget events
window.addEventListener('message', (event) => {
  if (event.data.type === 'websyte-ai-chat-widget') {
    switch (event.data.action) {
      case 'ready':
        console.log('Widget loaded');
        initializeCustomFeatures();
        break;
        
      case 'chat-opened':
        analytics.track('Chat Opened');
        pauseVideoPlayer();
        break;
        
      case 'chat-closed':
        analytics.track('Chat Closed');
        resumeVideoPlayer();
        break;
        
      case 'message-sent':
        analytics.track('Message Sent', {
          message: event.data.data.message,
          timestamp: new Date()
        });
        break;
        
      case 'response-received':
        const { response, sources } = event.data.data;
        if (sources?.length > 0) {
          console.log('AI used these sources:', sources);
        }
        break;
    }
  }
});

// Send custom events to widget
function sendToWidget(action, data) {
  const iframe = document.querySelector('#websyte-widget-container iframe');
  iframe?.contentWindow.postMessage({
    type: 'websyte-ai-chat-widget',
    action,
    data
  }, '*');
}

// Examples
sendToWidget('configure', {
  config: { primaryColor: 'oklch(0.5 0.2 150)' }
});

sendToWidget('send-message', {
  message: 'What are your business hours?'
});
```

## 🌍 Localization

### Multi-language Support

```html
<!-- Spanish -->
<script 
  data-language="es"
  data-welcome-message="¡Hola! ¿En qué puedo ayudarte?"
  data-placeholder="Escribe tu pregunta..."
  ...>
</script>

<!-- French -->
<script 
  data-language="fr"
  data-welcome-message="Bonjour! Comment puis-je vous aider?"
  data-placeholder="Tapez votre question..."
  ...>
</script>

<!-- Custom translations -->
<script>
const translations = {
  de: {
    welcomeMessage: "Hallo! Wie kann ich Ihnen helfen?",
    placeholder: "Geben Sie Ihre Frage ein...",
    sendButton: "Senden",
    typingIndicator: "tippt...",
    errorMessage: "Entschuldigung, etwas ist schief gelaufen."
  }
};

// Apply translations
sendToWidget('set-translations', { translations: translations.de });
</script>
```

## 📱 Mobile Optimization

### Responsive Behavior

```html
<!-- Mobile-specific settings -->
<script 
  data-mobile-position="bottom"
  data-mobile-full-screen="true"
  data-mobile-hide-launcher="false"
  ...>
</script>

<!-- Detect mobile and adjust -->
<script>
const isMobile = window.innerWidth <= 768;

if (isMobile) {
  // Use fullscreen mode on mobile
  sendToWidget('configure', {
    config: {
      displayMode: 'fullscreen',
      mobileOptimized: true
    }
  });
}
</script>
```

## 🎭 Theme Presets

### Dark Mode

```javascript
const darkTheme = {
  primaryColor: 'oklch(0.37 0.123 285.885)',
  backgroundColor: '#1a1a1a',
  textColor: '#ffffff',
  messageUserBg: '#2a2a2a',
  messageAssistantBg: '#333333',
  inputBg: '#2a2a2a',
  inputBorder: '#444444'
};

sendToWidget('set-theme', { theme: darkTheme });
```

### High Contrast

```javascript
const highContrastTheme = {
  primaryColor: 'oklch(0.3 0 0)',
  backgroundColor: '#ffffff',
  textColor: '#000000',
  messageUserBg: '#000000',
  messageUserText: '#ffffff',
  messageAssistantBg: '#f0f0f0',
  messageAssistantText: '#000000',
  focusOutline: '3px solid #0000ff'
};
```

## 🚀 Performance Optimization

### Lazy Loading

```html
<!-- Load widget only when needed -->
<button onclick="loadChatWidget()">Need Help?</button>

<script>
function loadChatWidget() {
  if (!document.querySelector('#websyte-widget-script')) {
    const script = document.createElement('script');
    script.id = 'websyte-widget-script';
    script.src = 'https://your-domain.com/dist/widget.js';
    script.dataset.widgetId = 'YOUR_WIDGET_ID';
    script.dataset.autoOpen = 'true';
    script.async = true;
    document.body.appendChild(script);
  }
}
</script>
```

### Conditional Loading

```javascript
// Load widget only for certain users
if (user.isPremium || user.needsSupport) {
  loadChatWidget();
}

// Load widget on specific pages
if (window.location.pathname.includes('/support')) {
  loadChatWidget();
}
```

## 📋 Configuration Reference

Complete list of all customization options:

```html
<script 
  src="https://your-domain.com/dist/widget.js"
  
  <!-- Required -->
  data-widget-id="YOUR_WIDGET_ID"
  
  <!-- Appearance -->
  data-position="bottom-right|bottom-left"
  data-primary-color="oklch(...)"
  data-theme="light|dark|auto"
  data-display-mode="standard|embedded|fullscreen"
  data-container-id="element-id"
  data-z-index="9999"
  
  <!-- Branding -->
  data-logo-url="https://..."
  data-logo-alt="Company Name"
  data-logo-height="32"
  data-hide-powered-by="true|false"
  
  <!-- Content -->
  data-welcome-message="Welcome!"
  data-placeholder="Type here..."
  data-initial-messages='["msg1", "msg2"]'
  data-recommendations='["q1", "q2", "q3"]'
  data-recommendations-title="Suggested"
  data-empty-state-message="No messages yet"
  
  <!-- Behavior -->
  data-auto-open="true|false"
  data-auto-open-delay="5000"
  data-save-messages="true|false"
  data-message-retention-days="30"
  data-enable-sounds="true|false"
  data-notification-sound="true|false"
  data-enable-audio="true|false"
  data-enable-citations="true|false"
  
  <!-- Advanced -->
  data-language="en|es|fr|de|..."
  data-mobile-position="bottom|fullscreen"
  data-mobile-full-screen="true|false"
  data-api-endpoint="https://custom-api.com"
  data-debug="true|false"
  
  async>
</script>
```

---

Next: [Content Management](./CONTENT-MANAGEMENT.md) - Learn how to manage your widget's knowledge base →