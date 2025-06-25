# Widget Sharing Documentation

## Overview

The widget sharing feature allows users to share their AI chat widgets via direct URLs, providing a full-screen chat interface without requiring embed codes. This feature is perfect for sharing knowledge bases, customer support bots, or specialized AI assistants with others.

## Architecture

### Core Components

1. **Share Route** (`app/routes/share.w.$id.tsx`) - Full-screen widget display
2. **Public Widget API** (`/api/public/widget/:id`) - Anonymous widget access
3. **Widget Service** (`workers/services/widget.ts`) - Public widget retrieval
4. **SEO Optimization** - Meta tags and social sharing support

### URL Structure

```
https://websyte.ai/share/w/{widgetId}
```

Example: `https://websyte.ai/share/w/550e8400-e29b-41d4-a716-446655440000`

## Implementation Details

### Share Route Component

```tsx
export default function ShareWidget() {
  const { id } = useParams();
  const [widget, setWidget] = useState<WidgetWithFiles | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWidget() {
      try {
        const response = await fetch(`/api/public/widget/${id}`);
        if (!response.ok) throw new Error('Widget not found');
        
        const data = await response.json();
        setWidget(data.widget);
      } catch (error) {
        console.error('Failed to load widget:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadWidget();
  }, [id]);

  if (loading) return <LoadingScreen />;
  if (!widget) return <NotFoundScreen />;

  return (
    <div className="h-screen flex flex-col">
      <WidgetHeader widget={widget} />
      <ChatPanel
        config={{
          widgetId: widget.id,
          enabled: true,
          mode: 'rag',
          isEmbedded: true,
          saveChatMessages: true
        }}
      />
    </div>
  );
}
```

### Public Widget API

```typescript
// GET /api/public/widget/:id
export async function getPublicWidget(c: Context) {
  const widgetId = c.req.param('id');
  
  // Check if widget is public
  const widget = await widgetService.getPublicWidget(widgetId);
  
  if (!widget || !widget.isPublic) {
    return c.json({ error: 'Widget not found or not public' }, 404);
  }
  
  // Return widget data with files
  return c.json({
    widget: {
      id: widget.id,
      name: widget.name,
      description: widget.description,
      instructions: widget.instructions,
      isPublic: widget.isPublic,
      files: widget.files,
      _count: {
        files: widget.files.length,
        embeddings: widget.embeddingsCount
      }
    }
  });
}
```

### Widget Service Updates

```typescript
class WidgetService {
  async getPublicWidget(id: string): Promise<WidgetWithFiles | null> {
    const widget = await db.query.widget.findFirst({
      where: and(
        eq(widgetTable.id, id),
        eq(widgetTable.isPublic, true) // Only public widgets
      ),
      with: {
        files: true
      }
    });
    
    return widget;
  }
}
```

## Features

### Full-Screen Chat Interface
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Fixed Layout**: Header stays in place, chat scrolls independently
- **Widget Info Display**: Shows widget name, description, and stats
- **Loading States**: Skeleton UI during widget loading
- **Error Handling**: Graceful handling of missing or private widgets

### SEO Optimization
```tsx
export const meta: MetaFunction = ({ data }) => {
  const widget = data?.widget;
  
  return [
    { title: widget?.name || 'AI Chat Widget' },
    { 
      name: 'description', 
      content: widget?.description || 'Interactive AI chat assistant' 
    },
    { property: 'og:title', content: widget?.name },
    { property: 'og:description', content: widget?.description },
    { property: 'og:type', content: 'website' },
    { property: 'og:image', content: '/og-image.png' },
    { name: 'twitter:card', content: 'summary_large_image' }
  ];
};
```

### Widget Header Component
```tsx
function WidgetHeader({ widget }: { widget: WidgetWithFiles }) {
  return (
    <div className="border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{widget.name}</h1>
            <p className="text-muted-foreground">{widget.description}</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{widget._count.files} files</span>
            <span>{widget._count.embeddings} embeddings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## User Experience

### Sharing Workflow

1. **Create/Edit Widget**: User creates a widget and marks it as public
2. **Get Share Link**: System generates share URL automatically
3. **Copy Link**: User copies the share link from widget settings
4. **Share**: User shares the link via email, social media, etc.
5. **Access**: Recipients can immediately start chatting without sign-up

### Share Link UI
```tsx
<div className="flex items-center gap-2">
  <Input
    value={`${window.location.origin}/share/w/${widget.id}`}
    readOnly
    className="font-mono text-sm"
  />
  <Button
    size="sm"
    variant="outline"
    onClick={() => {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Share link copied!');
    }}
  >
    <Copy className="h-4 w-4" />
  </Button>
</div>
```

### Access Control
- **Public Widgets**: Accessible to anyone with the link
- **Private Widgets**: Return 404 error for unauthorized access
- **Toggle Control**: Easy public/private toggle in widget settings
- **Analytics**: Track views and usage of shared widgets

## Security Considerations

### Public Access
```typescript
// Only expose necessary widget data
const publicWidgetData = {
  id: widget.id,
  name: widget.name,
  description: widget.description,
  instructions: widget.instructions,
  // Exclude: apiKeys, userId, createdAt, etc.
};
```

### Rate Limiting
- Public widget access is rate-limited to prevent abuse
- Same limits as anonymous chat requests (10/minute per IP)

### Data Privacy
- Chat messages from shared widgets are saved for analytics
- IP addresses stored based on GDPR settings
- No user authentication required for public widgets

## Configuration

### Widget Settings
```typescript
interface WidgetSettings {
  isPublic: boolean;              // Enable public sharing
  allowAnonymousChat: boolean;    // Allow chat without auth
  saveChatMessages: boolean;      // Store chat history
  showStats: boolean;             // Display file/embedding counts
}
```

### Environment Variables
```bash
# Public widget settings
PUBLIC_WIDGET_RATE_LIMIT=10     # Requests per minute
ALLOW_PUBLIC_WIDGETS=true        # Global toggle
PUBLIC_WIDGET_CACHE_TTL=300      # Cache duration in seconds
```

## Examples

### Basic Share Link
```
https://websyte.ai/share/w/my-product-docs
```

### Share with UTM Parameters
```
https://websyte.ai/share/w/my-product-docs?utm_source=twitter&utm_campaign=launch
```

### Embed in iframe
```html
<iframe 
  src="https://websyte.ai/share/w/my-product-docs"
  width="100%"
  height="600"
  frameborder="0"
></iframe>
```

## Analytics & Tracking

### Widget Analytics
```typescript
interface WidgetAnalytics {
  widgetId: string;
  totalViews: number;
  uniqueVisitors: number;
  totalMessages: number;
  avgSessionDuration: number;
  topQuestions: string[];
  referrers: Record<string, number>;
}
```

### Tracking Implementation
```typescript
// Track widget view
await trackEvent('widget_view', {
  widgetId: widget.id,
  referrer: request.headers.get('referer'),
  userAgent: request.headers.get('user-agent'),
  timestamp: new Date().toISOString()
});

// Track chat interaction
await trackEvent('widget_chat', {
  widgetId: widget.id,
  sessionId: session.id,
  messageCount: messages.length
});
```

## Future Enhancements

1. **Custom Domains**: Allow custom domains for share links
2. **Embed Customization**: Theme and layout options
3. **Access Passwords**: Optional password protection
4. **Time-Limited Sharing**: Expiring share links
5. **Collaborative Features**: Multiple users in same chat
6. **Analytics Dashboard**: Detailed usage statistics
7. **Social Previews**: Dynamic OG images per widget
8. **Widget Templates**: Pre-configured widget types