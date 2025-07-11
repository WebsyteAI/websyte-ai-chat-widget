# Chat API

The Chat API enables real-time conversations with your AI assistant, including message streaming, session management, and conversation history.

## 📋 Endpoints Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat/:widgetId/message` | Send a message |
| GET | `/api/chat/:widgetId/stream` | Stream responses (SSE) |
| GET | `/api/chat/:widgetId/history` | Get conversation history |
| DELETE | `/api/chat/:widgetId/history` | Clear history |
| GET | `/api/chat/:widgetId/sessions` | List chat sessions |

## 💬 Send Message

Send a message to the AI assistant and receive a response.

```bash
POST /api/chat/:widgetId/message
Content-Type: application/json

{
  "message": "How do I reset my password?",
  "sessionId": "session_123abc",
  "context": {
    "userId": "user_456",
    "page": "/support"
  }
}
```

### Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User's message |
| sessionId | string | No | Session identifier |
| context | object | No | Additional context |
| stream | boolean | No | Enable streaming (default: false) |

### Response (Non-streaming)

```json
{
  "success": true,
  "data": {
    "messageId": "msg_789xyz",
    "response": "To reset your password, follow these steps:\n\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for reset instructions\n5. Follow the link to create a new password",
    "sources": [
      {
        "title": "Password Reset Guide",
        "url": "https://example.com/support/password-reset",
        "relevance": 0.92
      }
    ],
    "sessionId": "session_123abc",
    "timestamp": "2025-01-11T16:00:00Z"
  }
}
```

## 🌊 Stream Responses

For real-time streaming responses using Server-Sent Events (SSE).

```bash
GET /api/chat/:widgetId/stream?sessionId=session_123abc
```

### JavaScript Example

```javascript
const eventSource = new EventSource(
  `https://your-domain.com/api/chat/${widgetId}/stream?sessionId=${sessionId}`,
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_TOKEN'
    }
  }
);

// Send message first
await fetch(`https://your-domain.com/api/chat/${widgetId}/message`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    message: 'Tell me about your pricing',
    sessionId: sessionId,
    stream: true
  })
});

// Listen for streaming response
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'chunk':
      // Append text chunk
      console.log(data.content);
      break;
    case 'sources':
      // Display sources
      console.log('Sources:', data.sources);
      break;
    case 'done':
      // Streaming complete
      eventSource.close();
      break;
    case 'error':
      console.error('Error:', data.message);
      eventSource.close();
      break;
  }
};
```

### Stream Event Types

```json
// Text chunk
{
  "type": "chunk",
  "content": "Our pricing plans start at ",
  "messageId": "msg_123"
}

// Sources
{
  "type": "sources",
  "sources": [
    {
      "title": "Pricing Page",
      "url": "https://example.com/pricing",
      "relevance": 0.95
    }
  ]
}

// Completion
{
  "type": "done",
  "messageId": "msg_123",
  "usage": {
    "promptTokens": 245,
    "completionTokens": 156,
    "totalTokens": 401
  }
}
```

## 📜 Conversation History

### Get History

Retrieve conversation history for a session.

```bash
GET /api/chat/:widgetId/history?sessionId=session_123abc&limit=50
```

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| sessionId | string | - | Session to retrieve |
| limit | number | 20 | Messages to return |
| offset | number | 0 | Pagination offset |
| order | string | desc | Sort order (asc/desc) |

### Response

```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "msg_123",
        "role": "user",
        "content": "What are your business hours?",
        "timestamp": "2025-01-11T15:30:00Z"
      },
      {
        "id": "msg_124",
        "role": "assistant",
        "content": "Our business hours are Monday to Friday, 9 AM to 6 PM EST.",
        "sources": [
          {
            "title": "Contact Us",
            "url": "https://example.com/contact"
          }
        ],
        "timestamp": "2025-01-11T15:30:02Z"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 20,
      "offset": 0
    }
  }
}
```

### Clear History

Delete conversation history for a session.

```bash
DELETE /api/chat/:widgetId/history?sessionId=session_123abc
```

## 🔄 Session Management

### List Sessions

Get all chat sessions for a widget.

```bash
GET /api/chat/:widgetId/sessions?days=7
```

### Response

```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_123abc",
        "startedAt": "2025-01-11T10:00:00Z",
        "lastMessageAt": "2025-01-11T10:15:00Z",
        "messageCount": 8,
        "metadata": {
          "userId": "user_456",
          "userAgent": "Mozilla/5.0...",
          "ip": "192.168.1.1"
        }
      }
    ],
    "stats": {
      "totalSessions": 156,
      "averageMessages": 5.4,
      "totalMessages": 842
    }
  }
}
```

## 🤖 Advanced Features

### Context Management

Provide additional context for better responses:

```json
{
  "message": "What's the status of my order?",
  "context": {
    "userId": "user_123",
    "orderId": "order_456",
    "customerTier": "premium",
    "previousPage": "/orders"
  }
}
```

### Custom System Prompts

Override the widget's default system prompt:

```json
{
  "message": "Help me choose a plan",
  "systemPromptOverride": "You are a sales assistant. Focus on premium features and benefits.",
  "temperature": 0.8
}
```

### Message Metadata

Include metadata with messages:

```json
{
  "message": "I need technical support",
  "metadata": {
    "source": "mobile_app",
    "version": "2.1.0",
    "priority": "high"
  }
}
```

## 📊 Analytics

### Get Chat Analytics

```bash
GET /api/chat/:widgetId/analytics?period=last_30_days
```

### Response

```json
{
  "success": true,
  "data": {
    "period": "last_30_days",
    "conversations": {
      "total": 1523,
      "completed": 1456,
      "abandoned": 67
    },
    "messages": {
      "total": 7845,
      "averagePerConversation": 5.2,
      "averageResponseTime": "1.3s"
    },
    "satisfaction": {
      "positive": 1234,
      "neutral": 189,
      "negative": 33,
      "score": 4.7
    },
    "topQuestions": [
      {
        "question": "How do I get started?",
        "count": 234,
        "avgSatisfaction": 4.8
      }
    ]
  }
}
```

## 🚨 Error Handling

### Message Too Long

```json
{
  "success": false,
  "error": {
    "code": "MESSAGE_TOO_LONG",
    "message": "Message exceeds maximum length of 1000 characters",
    "maxLength": 1000,
    "currentLength": 1523
  }
}
```

### Rate Limited

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many messages. Please wait before sending another.",
    "retryAfter": 30
  }
}
```

### No Content Available

```json
{
  "success": false,
  "error": {
    "code": "NO_CONTENT",
    "message": "No relevant content found. Please add content to your knowledge base."
  }
}
```

## 💡 Best Practices

### 1. Session Management
- Reuse session IDs for continuous conversations
- Clear old sessions periodically
- Store session IDs securely

### 2. Error Recovery
```javascript
async function sendMessageWithRetry(message, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendMessage(message);
    } catch (error) {
      if (error.code === 'RATE_LIMITED') {
        await sleep(error.retryAfter * 1000);
      } else if (i === maxRetries - 1) {
        throw error;
      }
    }
  }
}
```

### 3. Streaming Best Practices
- Handle connection drops gracefully
- Implement reconnection logic
- Buffer chunks for smooth display

## 🔗 WebSocket Alternative

For bidirectional communication:

```javascript
const ws = new WebSocket('wss://your-domain.com/api/chat/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'YOUR_API_TOKEN',
    widgetId: 'widget_123'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle messages
};
```

## 📚 Code Examples

### Complete Chat Integration

```typescript
class ChatClient {
  constructor(private apiKey: string, private widgetId: string) {}

  async sendMessage(message: string, sessionId?: string) {
    const response = await fetch(
      `https://your-domain.com/api/chat/${this.widgetId}/message`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          sessionId,
          stream: false
        })
      }
    );

    return response.json();
  }

  streamMessage(message: string, sessionId: string, onChunk: (chunk: string) => void) {
    const eventSource = new EventSource(
      `https://your-domain.com/api/chat/${this.widgetId}/stream?sessionId=${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    // Send message to trigger streaming
    this.sendMessage(message, sessionId);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chunk') {
        onChunk(data.content);
      } else if (data.type === 'done') {
        eventSource.close();
      }
    };

    return eventSource;
  }

  async getHistory(sessionId: string) {
    const response = await fetch(
      `https://your-domain.com/api/chat/${this.widgetId}/history?sessionId=${sessionId}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    return response.json();
  }
}

// Usage
const chat = new ChatClient('YOUR_API_TOKEN', 'widget_123');
const response = await chat.sendMessage('Hello!', 'session_456');
```

## 📖 Next Steps

- [Explore automation options](./AUTOMATION.md)
- [Use AI services](./SERVICES.md)
- [Manage widgets](./WIDGETS.md)