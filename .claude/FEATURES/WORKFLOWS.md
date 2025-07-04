# Cloudflare Workflows Integration

## Overview

The widget content pipeline uses Cloudflare Workflows to orchestrate the complex, multi-step process of crawling websites, processing content, and generating embeddings. This provides reliable, scalable, and fault-tolerant content ingestion.

## Architecture

### Workflow Definition

**Name**: `widget-content-pipeline`  
**Binding**: `WIDGET_CONTENT_WORKFLOW`  
**Location**: `workers/workflows/widget-content-pipeline.ts`

### Key Features

- **Durable Execution**: Survives worker restarts and failures
- **Step-based Processing**: Each step can be retried independently
- **Time Management**: Respects Cloudflare's 10-minute workflow limit
- **State Persistence**: Tracks progress through database updates
- **Error Recovery**: Graceful handling of failures at any stage

## Workflow Steps

### 1. Update Widget Status
Sets the widget status to "crawling" and records the start time.

### 2. Start Apify Crawl
- Cleans the URL to ensure consistency
- Deletes existing files if recrawling
- Initiates Apify crawler with configured limits
- Stores the crawl run ID for tracking

### 3. Poll for Completion
- Checks crawl status every 10 seconds
- Maximum 50 attempts (8.3 minutes)
- Monitors workflow time to prevent timeout
- Processes results when crawl completes

### 4. Process Crawl Results
- Downloads crawled content from Apify
- Stores pages as individual markdown files
- Updates widget metadata with page count

### 5. Generate Embeddings
- Processes pages in batches of 3
- Creates vector embeddings for each chunk
- Tracks total embeddings created
- Respects time limits to prevent timeout

### 6. Update Final Status
- Sets crawl status to "completed"
- Records page count and statistics
- Clears workflow ID

### 7. Generate Recommendations (Optional)
- Uses AI to create content recommendations
- Based on crawled content summaries
- Non-blocking - failures don't affect workflow

## Workflow Parameters

```typescript
interface WidgetContentPipelineParams {
  widgetId: string;      // Widget to process
  crawlUrl: string;      // URL to crawl
  maxPages?: number;     // Max pages to crawl (default: 25)
  isRecrawl?: boolean;   // Delete existing content first
}
```

## Starting a Workflow

### From Widget Routes

```typescript
// Start workflow when creating/updating widget
const workflowId = crypto.randomUUID();
const workflowParams: WidgetContentPipelineParams = {
  widgetId: widget.id,
  crawlUrl: widget.crawlUrl,
  maxPages: 50,
  isRecrawl: false
};

const instance = await c.env.WIDGET_CONTENT_WORKFLOW.create({
  id: workflowId,
  params: workflowParams
});

// Store workflow ID on widget
await db.update(widgetTable)
  .set({ workflowId })
  .where(eq(widgetTable.id, widget.id));
```

### From Automation API

```typescript
// POST /api/automation/widgets/:id/crawl
const instance = await env.WIDGET_CONTENT_WORKFLOW.create({
  id: crypto.randomUUID(),
  params: {
    widgetId,
    crawlUrl: widget.crawlUrl,
    maxPages: body.maxPages || 100,
    isRecrawl: true
  }
});
```

## Workflow Status Tracking

### Database Fields

```sql
-- Widget table columns
workflowId TEXT                -- Active workflow instance ID
crawlStatus TEXT               -- idle, crawling, completed, failed
crawlRunId TEXT                -- Apify run ID
lastCrawlAt TIMESTAMP          -- Last crawl start time
crawlPageCount INTEGER         -- Pages successfully crawled
```

### Status Transitions

```
idle → crawling → completed
     ↘         ↗
       failed
```

### Checking Workflow Status

```typescript
// Get workflow instance
const instance = await env.WIDGET_CONTENT_WORKFLOW.get(workflowId);

// Check status
const status = await instance.status();
// Returns: 'running', 'complete', 'failed', 'unknown'

// Get workflow metadata
const details = await instance.details();
// Includes: id, status, startTime, endTime, etc.
```

## Time Management

The workflow implements careful time management to respect Cloudflare's 10-minute limit:

1. **Workflow Start Time**: Tracked from the beginning
2. **Time Checks**: Before major operations
3. **Early Exit**: Stops processing if approaching limit
4. **Buffer Time**: Leaves 1 minute safety margin

```typescript
const MAX_WORKFLOW_DURATION_MS = 9 * 60 * 1000; // 9 minutes
const elapsedTime = Date.now() - workflowStartTime;

if (elapsedTime >= MAX_WORKFLOW_DURATION_MS) {
  // Stop processing and mark as timeout
}
```

## Error Handling

### Failure Scenarios

1. **Crawl Failures**
   - Apify errors (rate limits, network issues)
   - Invalid URLs or inaccessible sites
   - Timeout after 8.3 minutes of polling

2. **Processing Failures**
   - R2 storage errors
   - Database connection issues
   - Memory limits exceeded

3. **Embedding Failures**
   - OpenAI API errors
   - Rate limiting
   - Invalid content format

### Recovery Mechanisms

- **Step Isolation**: Failures in one step don't affect completed steps
- **Status Updates**: Widget status always reflects current state
- **Cleanup**: Failed workflows clear their workflowId
- **Logging**: Detailed error logs for debugging

## Performance Optimization

### Batch Processing
- Embeddings processed in batches of 3 pages
- Prevents memory exhaustion
- Allows progress tracking

### Parallel Operations
- Multiple workflows can run concurrently
- No locking between widgets
- Resource isolation per workflow

### Early Termination
- Stops processing if time limit approached
- Partial results are preserved
- Can be resumed with new workflow

## Monitoring and Debugging

### Structured Logging

```
[WORKFLOW] Starting widget content pipeline for widget: abc-123
[WORKFLOW] Crawl started with run ID: apify-run-456
[WORKFLOW] Checking crawl status (attempt 5/50)
[WORKFLOW] Processing 25 pages for embeddings
[WORKFLOW] Approaching 10-minute limit (540s elapsed), stopping
[WORKFLOW] Completed: 25 pages crawled, 150 embeddings created
```

### Key Metrics

- Workflow duration
- Pages crawled vs requested
- Embeddings created
- Failure reasons
- Timeout occurrences

### Debugging Tools

```typescript
// List all workflows for a worker
const workflows = await env.WIDGET_CONTENT_WORKFLOW.list();

// Get specific workflow details
const instance = await env.WIDGET_CONTENT_WORKFLOW.get(workflowId);
const details = await instance.details();
console.log(details);
```

## Best Practices

### 1. Workflow Design
- Keep individual steps small and focused
- Use descriptive step names for debugging
- Handle timeouts gracefully

### 2. Resource Management
- Process large datasets in batches
- Monitor memory usage
- Clean up temporary data

### 3. Error Recovery
- Always update widget status on failure
- Log detailed error information
- Clear workflowId to allow retry

### 4. Testing
- Test with small page counts first
- Monitor workflow duration
- Verify cleanup on failure

## Configuration

### Environment Variables

```env
# Required for workflows
WIDGET_CONTENT_WORKFLOW=<binding>
DATABASE_URL=<neon-connection>
OPENAI_API_KEY=<api-key>
APIFY_API_TOKEN=<api-token>
WIDGET_FILES=<r2-bucket>
```

### Wrangler Configuration

```json
{
  "workflows": [
    {
      "name": "widget-content-pipeline",
      "binding": "WIDGET_CONTENT_WORKFLOW",
      "class_name": "WidgetContentPipeline",
      "script_name": "websyte-ai-chat-widget"
    }
  ]
}
```

## Limitations

1. **Time Limit**: 10 minutes maximum per workflow
2. **Memory**: Standard worker memory limits apply
3. **Concurrency**: Limited by worker resources
4. **Step Size**: Individual steps should complete quickly

## Future Enhancements

### Planned Improvements

1. **Incremental Crawling**
   - Process new/changed pages only
   - Track content hashes
   - Reduce redundant processing

2. **Priority Queues**
   - High-priority widgets first
   - Rate limiting per user
   - Fair resource allocation

3. **Progress Notifications**
   - Webhook on completion
   - Email notifications
   - Real-time progress updates

4. **Advanced Orchestration**
   - Parallel page processing
   - Dynamic batch sizing
   - Adaptive timeout handling

### Workflow Composition

Future workflows could include:
- Document processing pipeline
- Scheduled content refresh
- Multi-source aggregation
- Content validation pipeline