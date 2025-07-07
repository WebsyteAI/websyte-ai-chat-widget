# Embed Code Generator Usage Guide

## Overview
The `EmbedCodeGenerator` component provides a comprehensive solution for generating embed codes for widgets, supporting both script-based and iframe-based embedding methods.

## Features

### 1. **Script Embedding (Recommended)**
- Lightweight and fast loading
- Automatically adapts to site styles
- No iframe restrictions
- Best performance and user experience
- Simple one-line embed code

### 2. **iFrame Embedding**
- Complete isolation from host page
- Configurable dimensions (fixed, percentage, or responsive)
- Auto-resize capability with optional script
- Custom CSS class support
- Good for restricted environments where scripts aren't allowed

## Component Props
```typescript
interface EmbedCodeGeneratorProps {
  widgetId: string;           // Unique widget identifier
  isPublic: boolean;          // Whether widget is publicly accessible
  onTogglePublic: () => void; // Callback to toggle public/private state
}
```

## Configuration Options

### Width Options
- **Fixed Width**: Specify exact pixel width (e.g., 400px)
- **Percentage Width**: Set as percentage of container (e.g., 50%)
- **Responsive**: Full width (100%) - adapts to container

### Height Options
- **Fixed Height**: Specify exact pixel height (e.g., 600px)
- **Auto-resize**: Dynamically adjusts to content height (iframe only)

### Additional Options
- **Auto-resize Script**: Include JavaScript for dynamic height adjustment
- **Custom CSS Class**: Add custom styling class to iframe element

## Usage Example

```tsx
import { EmbedCodeGenerator } from './components/widgets/EmbedCodeGenerator';

function WidgetSettings({ widget }) {
  const [isPublic, setIsPublic] = useState(widget.isPublic);

  const handleTogglePublic = async () => {
    // Toggle widget public/private state
    await updateWidgetVisibility(widget.id, !isPublic);
    setIsPublic(!isPublic);
  };

  return (
    <EmbedCodeGenerator
      widgetId={widget.id}
      isPublic={isPublic}
      onTogglePublic={handleTogglePublic}
    />
  );
}
```

## Generated Code Examples

### Script Embed
```html
<script src="https://your-domain.com/dist/widget.js" data-widget-id="widget-123" async></script>
```

### iFrame Embed (Responsive)
```html
<iframe
  src="https://your-domain.com/share/w/widget-123"
  style="width: 100%; height: 600px; border: none;"
  title="AI Chat Widget"
  allow="clipboard-write"
></iframe>
```

### iFrame with Auto-resize
```html
<iframe
  src="https://your-domain.com/share/w/widget-123"
  style="width: 100%; height: 100vh; border: none;"
  class="my-chat-widget"
  title="AI Chat Widget"
  allow="clipboard-write"
></iframe>

<!-- Auto-resize script -->
<script>
(function() {
  const iframe = document.querySelector('iframe[src*="/share/w/widget-123"]');
  if (!iframe) return;
  
  window.addEventListener('message', function(event) {
    if (event.origin !== 'https://your-domain.com') return;
    if (event.data.type === 'resize' && event.data.widgetId === 'widget-123') {
      iframe.style.height = event.data.height + 'px';
    }
  });
  
  iframe.addEventListener('load', function() {
    iframe.contentWindow.postMessage({ type: 'requestHeight' }, 'https://your-domain.com');
  });
})();
</script>
```

## Best Practices

1. **Choose Script Embedding** for most use cases - it provides the best performance and integration
2. **Use iFrame Embedding** when:
   - Complete isolation is required
   - Script tags are not allowed in your CMS
   - You need strict content security policies
3. **Enable Auto-resize** for iframes to prevent scrollbars
4. **Test on your actual website** to ensure proper display across different devices
5. **Use responsive width** to ensure mobile compatibility

## Direct Share URL
The component also provides a shareable URL for direct access to the widget in full-screen mode:
```
https://your-domain.com/share/w/widget-123
```

This URL can be:
- Shared via email or messaging
- Used as a standalone chat interface
- Embedded in documentation or help centers
- Bookmarked for quick access

## Legacy Widget Embedding (Page Content Chat)

For the original page content chat functionality:

### Basic Embedding
```html
<script src="https://websyte.ai/dist/widget.js" async></script>
```

### Advanced Configuration
```html
<script 
  src="https://websyte.ai/dist/widget.js" 
  data-content-target="main, .content, article"
  data-api-endpoint="/api/chat"
  data-base-url="https://api.example.com"
  data-target-element="#my-container"
  data-advertiser-name="My Brand"
  data-advertiser-logo="https://logo.clearbit.com/mybrand.com"
  data-position="bottom-center"
  data-theme="default"
  async
></script>
```

### Script Tag Attributes
- `data-content-target`: CSS selector for page content extraction
- `data-api-endpoint`: Custom API endpoint URL
- `data-base-url`: Base URL for all API endpoints
- `data-target-element`: CSS selector for widget injection target
- `data-advertiser-name`: Custom branding name
- `data-advertiser-logo`: Custom logo URL
- `data-position`: Widget position (bottom-center, bottom-right, etc.)
- `data-theme`: UI theme selection
- `data-save-chat-messages`: Whether to save chat messages (true/false)

### Injection Modes

**Body Injection (Default):**
- Widget appears as fixed overlay
- Action bar at top center of viewport
- Chat panel slides from right side
- Z-index: 9999

**Targeted Injection:**
- Widget appears inline within specified container
- Action bar at top center of container
- Chat panel still fixed right side
- Z-index: 999
- Example: `data-target-element="#chat-container"`