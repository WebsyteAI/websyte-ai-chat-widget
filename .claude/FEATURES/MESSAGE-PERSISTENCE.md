# Message Persistence Documentation

## Overview

The message persistence system captures and stores chat conversations from embedded widgets for customer insights, audits, and analytics. The system is designed with privacy, security, and GDPR compliance in mind.

## Architecture

### Core Components

1. **Message Service** (`workers/services/messages.ts`) - CRUD operations for chat messages
2. **Chat Service** (`workers/services/chat.ts`) - Integration with message persistence
3. **Rate Limiter** (`workers/lib/rate-limiter.ts`) - API protection
4. **Database Schema** (`workers/db/schema.ts`) - Chat message table definition
5. **Cleanup Cron** (`workers/cron/cleanup-messages.ts`) - Automatic data retention

### Database Schema

```sql
CREATE TABLE chat_message (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  widget_id UUID NOT NULL REFERENCES widget(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_id TEXT, -- Nullable for anonymous users
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_chat_message_widget_id ON chat_message(widget_id);
CREATE INDEX idx_chat_message_session_id ON chat_message(session_id);
CREATE INDEX idx_chat_message_created_at ON chat_message(created_at);
```

## Smart Message Control

### When Messages Are Saved

Messages are **ONLY** saved when:
- ✅ Request comes from an embedded widget (`isEmbedded: true`)
- ✅ Widget has `saveChatMessages: true` (default for external widgets)
- ✅ Rate limiting checks pass
- ✅ Message passes validation (length, content)

### When Messages Are NOT Saved

Messages are **NOT** saved when:
- ❌ Request comes from test environment (`saveChatMessages: false`)
- ❌ Request comes from widget editor (no `isEmbedded` flag)
- ❌ Rate limiting threshold exceeded
- ❌ Message validation fails

### Configuration Examples

#### External Embedded Widget (Messages Saved)
```html
<script src="https://your-domain.com/dist/widget.js" 
        data-widget-id="your-widget-id"
        data-save-chat-messages="true"
        async></script>
```

#### Test Environment (Messages NOT Saved)
```tsx
<ChatWidget 
  widgetId="test-widget"
  saveChatMessages={false}
/>
```

#### Widget Editor (Messages NOT Saved)
```tsx
<ChatPanel
  config={{
    widgetId: widget.id,
    enabled: true,
    baseUrl: '',
    mode: 'rag',
    // No isEmbedded flag - messages not saved
  }}
/>
```

## Message Metadata

Each saved message includes comprehensive metadata:

```typescript
interface MessageMetadata {
  model?: string;           // AI model used (e.g., 'gpt-4.1-mini')
  sources?: any[];          // RAG sources for assistant responses
  responseTime?: number;    // Response generation time in ms
  userAgent?: string;       // Browser user agent string
  ipAddress?: string;       // User IP (if STORE_IP_ADDRESSES=true)
  error?: string;          // Error message if processing failed
}
```

### Example Message Record
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "widget_id": "123e4567-e89b-12d3-a456-426614174000",
  "session_id": "session_1703123456789_abc123",
  "user_id": "user_987654321",
  "role": "user",
  "content": "What are your business hours?",
  "metadata": {
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "ipAddress": "192.168.1.100",
    "responseTime": null
  },
  "created_at": "2023-12-21T10:30:45.123Z"
}
```

## Security & Privacy

### Rate Limiting
- **Anonymous Users**: 10 requests per minute
- **Authenticated Users**: 30 requests per minute
- **Implementation**: In-memory rate limiting with sliding window
- **Identifier**: User ID for authenticated, IP for anonymous

### GDPR Compliance
- **IP Storage**: Configurable via `STORE_IP_ADDRESSES` environment variable
- **Data Minimization**: Only essential metadata is stored
- **Right to Deletion**: Automatic cleanup based on retention policy
- **Anonymization**: Support for anonymous users

### Session Security
- **Secure Generation**: Cryptographically secure session IDs
- **Format**: `session_{timestamp}_{randomUUID}`
- **Client Storage**: localStorage with 24-hour expiry
- **Server Validation**: Session ownership validation

## Data Retention & Cleanup

### Automatic Cleanup
```typescript
// Environment variable configuration
MESSAGE_RETENTION_DAYS=30  // Default: 30 days

// Cron job runs daily to clean old messages
export async function cleanupOldMessages(env: Env): Promise<void> {
  const retentionDays = parseInt(env.MESSAGE_RETENTION_DAYS || '30');
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
  
  const result = await db.delete(chatMessage)
    .where(lt(chatMessage.createdAt, cutoffDate));
    
  console.log(`Cleaned up ${result.rowCount} old messages`);
}
```

### Retention Policies
- **Default**: 30 days retention
- **Configurable**: Via `MESSAGE_RETENTION_DAYS` environment variable
- **Cascade Delete**: Messages deleted when widget is deleted
- **Bulk Operations**: Efficient cleanup with indexed queries

## API Endpoints

### Save Message (Internal)
```typescript
POST /api/chat
{
  "message": "User question",
  "widgetId": "widget-uuid",
  "sessionId": "session-id",
  "isEmbedded": true  // Controls message saving
}
```

### Get Widget Messages (Future)
```typescript
GET /api/widgets/{widgetId}/messages
Query Parameters:
- limit: number (default: 50)
- offset: number (default: 0)
- sessionId: string (optional)
- startDate: ISO string (optional)
- endDate: ISO string (optional)
```

### Get Session Messages (Future)
```typescript
GET /api/widgets/{widgetId}/sessions/{sessionId}/messages
Response: ChatMessage[]
```

## Development & Testing

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...

# Message Persistence
STORE_IP_ADDRESSES=false          # GDPR compliance (default: false)
MESSAGE_RETENTION_DAYS=30         # Cleanup retention (default: 30)

# Rate Limiting (optional)
RATE_LIMIT_ANONYMOUS=10          # Per minute (default: 10)
RATE_LIMIT_AUTHENTICATED=30      # Per minute (default: 30)
```

### Testing Message Persistence

#### Test Environment (Should NOT save)
```bash
# Visit test page
http://localhost:5173/test

# Check logs - should see:
[CHAT] ⏭️ NOT saving user message (not embedded)
[CHAT] ⏭️ NOT saving assistant message (not embedded)
```

#### External Widget (Should save)
```html
<!-- Create test page with embedded widget -->
<script src="http://localhost:5173/dist/widget.js" 
        data-widget-id="your-widget-id"
        data-save-chat-messages="true"
        async></script>

<!-- Check logs - should see: -->
[CHAT] 💾 Saving user message - widgetId: xxx sessionId: xxx
[CHAT] 💾 Saving assistant message - widgetId: xxx sessionId: xxx
```

### Database Queries for Testing

```sql
-- Check recent messages
SELECT * FROM chat_message 
ORDER BY created_at DESC 
LIMIT 10;

-- Count messages by widget
SELECT widget_id, COUNT(*) as message_count
FROM chat_message 
GROUP BY widget_id;

-- Check session conversation
SELECT role, content, created_at 
FROM chat_message 
WHERE session_id = 'your-session-id'
ORDER BY created_at;

-- Cleanup test
DELETE FROM chat_message 
WHERE created_at < NOW() - INTERVAL '30 days';
```

## Monitoring & Analytics

### Key Metrics
- **Message Volume**: Total messages per widget/day
- **Session Length**: Average messages per session
- **User Engagement**: Unique sessions per widget
- **Response Times**: AI response generation times
- **Error Rates**: Failed message processing

### Logging
```typescript
// Success logs
[CHAT] 💾 Saving user message - widgetId: xxx sessionId: xxx userId: xxx
[CHAT] 💾 Saving assistant message - widgetId: xxx sessionId: xxx userId: xxx

// Skip logs  
[CHAT] ⏭️ NOT saving user message (not embedded) - widgetId: xxx isEmbedded: false
[CHAT] ⏭️ NOT saving assistant message (not embedded) - widgetId: xxx isEmbedded: false

// Error logs
[CHAT] ❌ Rate limit exceeded for user: xxx
[CHAT] ❌ Message validation failed: xxx
[CHAT] ❌ Database error saving message: xxx
```

## Future Enhancements

### Planned Features
- **Message Analytics Dashboard**: Widget performance insights
- **Export Functionality**: CSV/JSON export for data analysis  
- **Advanced Filtering**: Search by content, date ranges, user
- **Conversation Threading**: Link related messages across sessions
- **Real-time Monitoring**: Live message stream for customer support

### API Expansions
- **Message Search**: Full-text search across conversations
- **Aggregation Endpoints**: Summary statistics and trends
- **Webhook Integration**: Real-time message notifications
- **Batch Operations**: Bulk message management

### Privacy Enhancements
- **Data Anonymization**: Remove PII from stored messages
- **Encryption at Rest**: Database-level encryption
- **Access Logging**: Audit trail for message access
- **Consent Management**: User consent tracking and management