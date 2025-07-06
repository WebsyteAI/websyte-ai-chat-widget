# Widget Embedding Architecture

## 🎯 Overview

The widget embedding system allows any website to add an AI chat assistant with a single script tag. It uses iframe isolation, Shadow DOM for styling, and postMessage API for secure communication.

## 🚀 Embedding Methods

### Standard Embedding (Page Content Chat)
```html
<!-- Basic embed - uses page content for context -->
<script src="https://yourdomain.com/dist/widget.js" async></script>
```

### Custom Widget Embedding (Knowledge Base)
```html
<!-- Custom widget with specific knowledge base -->
<script 
  src="https://yourdomain.com/dist/widget.js" 
  data-widget-id="your-widget-uuid"
  async>
</script>
```

### Advanced Configuration
```html
<!-- Full configuration options -->
<script 
  src="https://yourdomain.com/dist/widget.js" 
  data-widget-id="your-widget-uuid"
  data-position="bottom-left"
  data-primary-color="#0066cc"
  data-auto-open="true"
  data-save-messages="false"
  async>
</script>
```

## 🏗️ Architecture Components

### 1. Widget Entry Script (`widget-entry.tsx`)
The entry point that initializes the widget on the host page:

```typescript
// Parse configuration from script tag
const script = document.currentScript as HTMLScriptElement;
const config = {
  widgetId: script?.getAttribute('data-widget-id'),
  position: script?.getAttribute('data-position') || 'bottom-right',
  primaryColor: script?.getAttribute('data-primary-color'),
  autoOpen: script?.getAttribute('data-auto-open') === 'true',
  saveMessages: script?.getAttribute('data-save-messages') !== 'false',
};

// Create isolated container
const container = document.createElement('div');
container.id = 'websyte-ai-chat-widget';
container.style.cssText = `
  position: fixed;
  ${config.position.includes('right') ? 'right: 20px' : 'left: 20px'};
  bottom: 20px;
  z-index: 2147483647;
  width: 400px;
  height: 600px;
  pointer-events: none;
`;

// Append to body
document.body.appendChild(container);

// Create shadow root for style isolation
const shadowRoot = container.attachShadow({ mode: 'open' });
```

### 2. Style Isolation Strategy

#### Shadow DOM Implementation
```typescript
// Inject compiled styles into shadow DOM
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* All widget styles are scoped to shadow DOM */
  :host {
    all: initial;
    font-family: system-ui, -apple-system, sans-serif;
  }
  
  /* Tailwind CSS compiled and injected */
  ${compiledTailwindStyles}
  
  /* Component-specific styles */
  .widget-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
  }
`;

shadowRoot.appendChild(styleSheet);
```

#### CSS Reset and Isolation
```css
/* Reset all inherited styles */
:host {
  all: initial;
  display: block;
  position: relative;
}

/* Ensure no style leakage */
:host * {
  box-sizing: border-box;
}

/* Override any global styles */
:host(.widget-open) {
  pointer-events: auto !important;
}
```

### 3. iframe Architecture

#### iframe Creation
```typescript
// Create iframe for additional isolation
const iframe = document.createElement('iframe');
iframe.src = `${config.baseUrl}/widget-frame`;
iframe.style.cssText = `
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
`;
iframe.setAttribute('allow', 'clipboard-write');

// Security attributes
iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');
shadowRoot.appendChild(iframe);
```

#### Cross-Frame Communication
```typescript
// Parent window message handler
window.addEventListener('message', (event) => {
  // Validate origin
  if (!isValidOrigin(event.origin)) return;
  
  switch (event.data.type) {
    case 'WIDGET_READY':
      // Send configuration to iframe
      iframe.contentWindow?.postMessage({
        type: 'INIT_WIDGET',
        config: widgetConfig
      }, '*');
      break;
      
    case 'RESIZE_WIDGET':
      // Adjust container size
      container.style.height = `${event.data.height}px`;
      break;
      
    case 'CLOSE_WIDGET':
      // Hide widget
      container.classList.add('hidden');
      break;
  }
});
```

### 4. Content Extraction System

#### Automatic Content Detection
```typescript
export class ContentExtractor {
  static extractPageContent(selector?: string): ExtractedContent {
    // Use provided selector or auto-detect
    const contentElement = selector 
      ? document.querySelector(selector)
      : this.findMainContent();
    
    if (!contentElement) {
      throw new Error('No content found on page');
    }
    
    // Clean and extract text
    const cleanedContent = this.cleanContent(contentElement);
    
    return {
      content: cleanedContent,
      metadata: {
        title: document.title,
        url: window.location.href,
        extractedAt: new Date().toISOString(),
        selector: selector || 'auto-detected',
      }
    };
  }
  
  private static findMainContent(): Element | null {
    // Priority order for content detection
    const selectors = [
      'main',
      'article',
      '[role="main"]',
      '#main-content',
      '.main-content',
      '#content',
      '.content',
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.isValidContent(element)) {
        return element;
      }
    }
    
    // Fallback to largest text block
    return this.findLargestTextBlock();
  }
}
```

#### Content Cleaning
```typescript
private static cleanContent(element: Element): string {
  // Clone to avoid modifying DOM
  const clone = element.cloneNode(true) as Element;
  
  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer',
    '.advertisement', '.sidebar', '.comments',
    '[role="navigation"]', '[role="banner"]'
  ];
  
  unwantedSelectors.forEach(selector => {
    clone.querySelectorAll(selector).forEach(el => el.remove());
  });
  
  // Extract and clean text
  const text = clone.textContent || '';
  return text
    .replace(/\s+/g, ' ')  // Normalize whitespace
    .trim()
    .slice(0, 10000);      // Limit size
}
```

## 🔒 Security Architecture

### Content Security Policy
```typescript
// Set CSP headers for iframe
app.get('/widget-frame', (c) => {
  c.header('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https://api.openai.com",
    "frame-ancestors *",
  ].join('; '));
  
  return c.html(widgetHTML);
});
```

### Origin Validation
```typescript
// Validate message origins
const ALLOWED_ORIGINS = [
  process.env.WIDGET_ORIGIN,
  'https://yourdomain.com',
];

function isValidOrigin(origin: string): boolean {
  // Allow same origin always
  if (origin === window.location.origin) return true;
  
  // Check against whitelist
  return ALLOWED_ORIGINS.includes(origin);
}
```

### Data Sanitization
```typescript
// Sanitize all data from parent window
import DOMPurify from 'isomorphic-dompurify';

function sanitizeMessage(data: any): any {
  if (typeof data === 'string') {
    return DOMPurify.sanitize(data, {
      ALLOWED_TAGS: [],  // Text only
      ALLOWED_ATTR: []
    });
  }
  
  if (typeof data === 'object') {
    return Object.entries(data).reduce((acc, [key, value]) => ({
      ...acc,
      [key]: sanitizeMessage(value)
    }), {});
  }
  
  return data;
}
```

## 📡 Communication Protocol

### Message Types
```typescript
// Widget -> Parent messages
interface WidgetMessage {
  type: 'WIDGET_READY' | 'RESIZE_WIDGET' | 'CLOSE_WIDGET' | 'ANALYTICS_EVENT';
  payload?: any;
}

// Parent -> Widget messages  
interface ParentMessage {
  type: 'INIT_WIDGET' | 'UPDATE_CONFIG' | 'TRIGGER_ACTION';
  payload?: any;
}
```

### Bidirectional Communication
```typescript
// Widget side
export class WidgetMessenger {
  private targetOrigin: string;
  
  constructor(targetOrigin = '*') {
    this.targetOrigin = targetOrigin;
    this.setupListeners();
  }
  
  send(message: WidgetMessage) {
    window.parent.postMessage(message, this.targetOrigin);
  }
  
  private setupListeners() {
    window.addEventListener('message', (event) => {
      const message = event.data as ParentMessage;
      
      switch (message.type) {
        case 'INIT_WIDGET':
          this.handleInit(message.payload);
          break;
        case 'UPDATE_CONFIG':
          this.handleConfigUpdate(message.payload);
          break;
      }
    });
  }
}
```

## 🎨 Responsive Design

### Mobile Optimization
```typescript
// Responsive container styles
const mobileStyles = `
  @media (max-width: 640px) {
    .widget-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      border-radius: 0;
    }
  }
`;

// Touch gesture support
let touchStartY = 0;

container.addEventListener('touchstart', (e) => {
  touchStartY = e.touches[0].clientY;
});

container.addEventListener('touchend', (e) => {
  const touchEndY = e.changedTouches[0].clientY;
  const swipeDistance = touchEndY - touchStartY;
  
  // Swipe down to minimize
  if (swipeDistance > 100) {
    minimizeWidget();
  }
});
```

### Adaptive Layouts
```typescript
// Detect viewport and adjust
function adjustWidgetSize() {
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
  
  if (viewport.width < 640) {
    // Full screen on mobile
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 2147483647;
    `;
  } else {
    // Floating widget on desktop
    container.style.cssText = `
      position: fixed;
      right: 20px;
      bottom: 20px;
      width: 400px;
      height: 600px;
      max-height: calc(100vh - 40px);
      z-index: 2147483647;
    `;
  }
}

// Listen for resize
window.addEventListener('resize', debounce(adjustWidgetSize, 300));
```

## 🚀 Performance Optimization

### Lazy Loading
```typescript
// Load widget on demand
let widgetLoaded = false;

function loadWidget() {
  if (widgetLoaded) return;
  
  const script = document.createElement('script');
  script.src = '/dist/widget-bundle.js';
  script.async = true;
  script.onload = () => {
    widgetLoaded = true;
    initializeWidget();
  };
  
  document.head.appendChild(script);
}

// Load on user interaction
document.addEventListener('click', loadWidget, { once: true });
document.addEventListener('scroll', loadWidget, { once: true });
```

### Resource Optimization
```typescript
// Preload critical resources
const preloadLink = document.createElement('link');
preloadLink.rel = 'preload';
preloadLink.as = 'script';
preloadLink.href = '/dist/widget-bundle.js';
document.head.appendChild(preloadLink);

// Prefetch API endpoints
const prefetchLink = document.createElement('link');
prefetchLink.rel = 'prefetch';
prefetchLink.href = '/api/chat';
document.head.appendChild(prefetchLink);
```

## 📊 Analytics Integration

### Event Tracking
```typescript
export class WidgetAnalytics {
  static track(event: string, properties?: any) {
    // Send to parent window
    window.parent.postMessage({
      type: 'ANALYTICS_EVENT',
      payload: {
        event,
        properties,
        timestamp: Date.now(),
        sessionId: this.getSessionId(),
      }
    }, '*');
    
    // Also send to our API
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        widgetId: config.widgetId,
        event,
        properties,
      }),
    });
  }
  
  // Track key events
  static trackWidgetOpen() {
    this.track('widget_opened');
  }
  
  static trackMessageSent(messageLength: number) {
    this.track('message_sent', { messageLength });
  }
  
  static trackResponseReceived(responseTime: number) {
    this.track('response_received', { responseTime });
  }
}
```

## 🔧 Debugging Tools

### Debug Mode
```typescript
// Enable debug mode via query parameter
const urlParams = new URLSearchParams(window.location.search);
const debugMode = urlParams.get('websyte_debug') === 'true';

if (debugMode) {
  // Add debug panel
  const debugPanel = document.createElement('div');
  debugPanel.className = 'debug-panel';
  debugPanel.innerHTML = `
    <h3>Widget Debug Info</h3>
    <pre>${JSON.stringify(config, null, 2)}</pre>
  `;
  shadowRoot.appendChild(debugPanel);
  
  // Log all messages
  window.addEventListener('message', (event) => {
    console.log('[Widget Message]', event.data);
  });
}
```

### Error Reporting
```typescript
// Global error handler
window.addEventListener('error', (event) => {
  console.error('[Widget Error]', event.error);
  
  // Report to monitoring service
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({
      message: event.message,
      stack: event.error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }),
  });
});
```

---

For related documentation:
- [Frontend Architecture](./FRONTEND.md)
- [Embedding Guide](../EMBEDDING/EMBED-CODE-USAGE.md)
- [API Reference](../API/README.md)