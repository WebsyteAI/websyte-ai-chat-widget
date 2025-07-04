# Chat API

RAG-powered chat endpoints with streaming support and inline citations.

## Main Chat Endpoint

### Chat with Widget

```http
POST /api/chat
```

Send a message to a widget and receive an AI-generated response with relevant context from the knowledge base.

**Authentication**: Optional (rate limits apply for anonymous users)

**Request Body**:
```json
{
  "message": "How do I reset my password?",
  "widgetId": "widget-uuid",
  "sessionId": "session-uuid",
  "context": {
    "url": "https://example.com/current-page",
    "content": "Current page content for additional context"
  },
  "stream": true,
  "saveToHistory": true
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's message |
| widgetId | string | Yes | Widget ID to chat with |
| sessionId | string | No | Session ID for conversation continuity |
| context | object | No | Additional context from current page |
| stream | boolean | No | Enable streaming responses (default: true) |
| saveToHistory | boolean | No | Save messages to database (default: true for embedded widgets) |

### Response Format

#### Streaming Response (SSE)

When `stream: true`, the response is sent as Server-Sent Events:

```
event: start
data: {"sessionId": "generated-session-id"}

event: token
data: {"content": "I can help you reset"}

event: token
data: {"content": " your password. Here's how:\n\n"}

event: source
data: {"sources": [{"title": "Password Reset Guide", "url": "https://example.com/reset", "snippet": "To reset your password..."}]}

event: done
data: {"finished": true}
```

#### Non-Streaming Response

When `stream: false`:

```json
{
  "response": "I can help you reset your password. Here's how:\n\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for reset instructions\n\nYou'll receive an email within 5 minutes with a secure link to create a new password[1].",
  "sources": [
    {
      "title": "Password Reset Guide",
      "url": "https://example.com/help/password-reset",
      "snippet": "To reset your password, click the 'Forgot Password' link on the login page..."
    }
  ],
  "sessionId": "generated-session-id"
}
```

## Features

### Inline Citations

The chat API automatically adds inline citations in markdown format:

```markdown
You can reset your password by clicking the 'Forgot Password' link[1]. 
The reset email will arrive within 5 minutes[2].

[1]: https://example.com/help/password-reset
[2]: https://example.com/faq#reset-time
```

### Context-Aware Responses

The AI considers:
1. **Widget Knowledge Base**: All indexed content from documents and web pages
2. **Current Page Context**: Optional context from where the widget is embedded
3. **Conversation History**: Previous messages in the same session
4. **System Prompt**: Widget-specific instructions for the AI

### Session Management

- **Session IDs**: Automatically generated server-side if not provided
- **Persistence**: Sessions maintained for conversation continuity
- **Security**: Session IDs validated to prevent hijacking
- **Expiry**: Sessions expire after 24 hours of inactivity

### Message Persistence

Messages are saved when:
- Widget is embedded on a website (not test environment)
- `saveToHistory` is explicitly set to `true`
- User has appropriate permissions

Saved data includes:
- Message content and response
- Session ID and widget ID
- Timestamps
- IP address (optional, GDPR compliant)
- User agent and referrer

## Error Handling

### Common Errors

```json
{
  "error": "Widget not found",
  "code": "WIDGET_NOT_FOUND"
}
```

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

```json
{
  "error": "Invalid session",
  "code": "INVALID_SESSION"
}
```

## Rate Limiting

| User Type | Rate Limit | Window |
|-----------|------------|---------|
| Anonymous | 10 messages | 1 minute |
| Authenticated | 30 messages | 1 minute |
| Bearer Token | Unlimited | - |

## Examples

### Basic Chat Request

```bash
curl -X POST https://your-domain.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are your business hours?",
    "widgetId": "widget-123"
  }'
```

### Streaming Chat with Context

```javascript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: "Tell me more about this feature",
    widgetId: "widget-123",
    sessionId: "session-456",
    context: {
      url: window.location.href,
      content: document.querySelector('main').innerText
    },
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      // Handle different event types
      if (data.content) {
        // Append to response
      } else if (data.sources) {
        // Display sources
      }
    }
  }
}
```

### Chat with Python

```python
import requests
import json

response = requests.post(
    'https://your-domain.com/api/chat',
    json={
        'message': 'How do I integrate your API?',
        'widgetId': 'widget-123',
        'stream': False
    }
)

data = response.json()
print(f"Response: {data['response']}")
print(f"Sources: {data['sources']}")
```

## Advanced Features

### Custom System Prompts

Configure widget behavior through system prompts:

```json
{
  "systemPrompt": "You are a technical support specialist. Always include code examples when relevant. Cite sources using [n] notation."
}
```

### Conversation History

The chat API automatically maintains conversation context within a session:

```
User: "What's your pricing?"
AI: "We offer three pricing tiers... [details]"
User: "Tell me more about the Pro plan"  
AI: "The Pro plan includes... [builds on previous context]"
```

### Source Ranking

Sources are ranked by:
1. Semantic similarity to the query
2. Recency of content
3. Page authority (based on crawl depth)
4. Content type (documentation preferred over blog posts)

## Best Practices

1. **Always provide a session ID** for multi-turn conversations
2. **Include page context** when the widget is embedded for better responses
3. **Handle streaming responses** for better UX
4. **Implement retry logic** for network failures
5. **Cache session IDs** client-side for conversation continuity
6. **Display sources** to build trust and allow verification