# Widget Content Pipeline Workflow Visualization

## Overview
The Widget Content Pipeline is a Cloudflare Workflow that handles the complete process of crawling websites, storing content, and generating embeddings for AI-powered chat widgets.

## Workflow Architecture

```mermaid
graph TB
    subgraph "API Endpoints"
        A1["/api/widgets/:id/crawl<br/>(User API)"]
        A2["/api/automation/widgets/:id/crawl<br/>(Automation API)"]
    end
    
    subgraph "Workflow Trigger"
        B[Create Workflow Instance<br/>WIDGET_CONTENT_WORKFLOW]
        B1[Set workflowId in DB]
        B2[10-minute Workflow Timeout]
    end
    
    subgraph "Widget Content Pipeline Workflow"
        C[Step 1: Update Status to 'crawling']
        D[Step 2: Start Apify Crawl<br/>Max 25 pages]
        E[Step 3: Poll Crawl Status<br/>(max 50 attempts × 10s = 8.3 min)<br/>Using step.sleep]
        F{Crawl<br/>Succeeded?}
        G[Process Crawl Results<br/>Batch size: 5 pages]
        H[Step 4: Get Crawled Files<br/>Store in R2]
        I[Step 5: Process Embeddings<br/>Batch size: 3 pages<br/>Monitor time limit]
        J[Step 6: Update Status to 'completed']
        K[Step 7: Generate Recommendations<br/>(Optional)]
        L[Update Status to 'failed']
    end
    
    A1 --> B
    A2 --> B
    B --> B1
    B1 --> B2
    B2 --> C
    C --> D
    D --> E
    E --> F
    F -->|Yes| G
    F -->|No| L
    G --> H
    H --> I
    I --> J
    J --> K
    L --> |Clear workflowId| End1[End]
    K --> |Clear workflowId| End2[End]
    
    style E fill:#e1f5e1,stroke:#4caf50,stroke-width:2px
    style B2 fill:#ffe0e0,stroke:#f44336,stroke-width:2px
```

## Detailed Step Breakdown

### 1. **Workflow Initiation**
Two endpoints can trigger the workflow:
- **User API**: `/api/widgets/:id/crawl` - Requires authentication
- **Automation API**: `/api/automation/widgets/:id/crawl` - Uses bearer token

Both endpoints:
1. Check if widget exists
2. Verify not already crawling
3. Create workflow instance
4. **Save `workflowId` to database**
5. Return workflow ID to caller

### 2. **Step 1: Update Widget Status**
```typescript
await step.do('update-widget-status-crawling', async () => {
  // Update widget:
  // - crawlStatus: 'crawling'
  // - lastCrawlAt: new Date()
});
```

### 3. **Step 2: Start Apify Crawl**
```typescript
const crawlRunId = await step.do<string>('start-crawl', async () => {
  // 1. Clean URL
  // 2. Delete existing crawl files if recrawling
  // 3. Start Apify crawler
  // 4. Update widget with crawlRunId
  return runId;
});
```

### 4. **Step 3: Poll for Completion** ✅ **FIXED**
```typescript
// Fixed in commit f3d3e60: Now uses step.sleep instead of setTimeout
for (let attempt = 0; attempt < 50; attempt++) {  // Reduced from 120 to 50
  const result = await step.do(`check-crawl-status-${attempt}`, async () => {
    // Check Apify crawl status
    if (status === 'SUCCEEDED') {
      // Process results
      return { status: 'success', pageCount };
    } else if (status === 'FAILED' || status === 'ABORTED') {
      return { status: 'failed', error };
    }
    return null; // Continue polling
  });
  
  if (!result) {
    // IMPORTANT: Using step.sleep for proper async handling in Cloudflare Workers
    await step.sleep(`wait-crawl-${attempt}`, '10 seconds');  // Changed from 5s to 10s
  }
}
```

**Key Changes:**
- ✅ Replaced `setTimeout` with `step.sleep` for proper Cloudflare Workers compatibility
- ✅ Reduced polling attempts from 120 to 50 (still 8.3 minutes total)
- ✅ Increased polling interval from 5s to 10s for efficiency
- ✅ Added ABORTED status check

### 5. **Process Crawl Results**
When crawl succeeds:
1. **Create placeholder file** (`hostname.crawl.md`)
2. **Process pages in batches** (5 pages at a time)
3. **For each page**:
   - Create markdown with metadata header
   - Store as page file in R2
   - **Create database record** for page file
   - Filename: `page-{number}.md`

### 6. **Step 5: Generate Embeddings**
```typescript
await step.do<number>('process-all-embeddings', async () => {
  // For each page file:
  // 1. Get content from R2
  // 2. Delete old embeddings if recrawling
  // 3. Create new embeddings via OpenAI
  // 4. Store in vector database
  return totalEmbeddings;
});
```

### 7. **Step 6 & 7: Finalize**
- Update widget status to 'completed'
- Store crawl metrics (runId, pageCount)
- **Clear `workflowId`** from database
- Generate AI recommendations (optional)

## Data Flow

```mermaid
graph LR
    subgraph "Storage Systems"
        DB[(PostgreSQL<br/>Database)]
        R2[R2 Object<br/>Storage]
        Vec[(Vector DB<br/>pgvector)]
    end
    
    subgraph "External Services"
        Apify[Apify<br/>Crawler]
        OpenAI[OpenAI<br/>API]
    end
    
    subgraph "Data Types"
        W[Widget Record]
        F[File Records]
        P[Page Files]
        E[Embeddings]
        R[Recommendations]
    end
    
    Apify -->|Crawl Results| P
    P -->|Store| R2
    P -->|Record| DB
    P -->|Generate| E
    OpenAI -->|Create| E
    E -->|Store| Vec
    W -->|Update Status| DB
    F -->|Track Files| DB
    OpenAI -->|Generate| R
    R -->|Store| DB
```

## File Storage Structure

### R2 Object Keys
```
widgets/{widgetId}/{fileId}/{filename}           # Main files
widgets/{widgetId}/{fileId}/page_{number}.md     # Page files
```

### Database Records
- **Main crawl file**: `{hostname}.crawl.md`
- **Page files**: `page-{number}.md` (filtered from UI by default)

## Status Flow

```mermaid
stateDiagram-v2
    [*] --> idle
    idle --> crawling: Start Crawl<br/>(set workflowId)
    crawling --> processing: Crawl Success
    crawling --> failed: Crawl Failed<br/>(clear workflowId)
    processing --> completed: All Steps Done<br/>(clear workflowId)
    processing --> failed: Error<br/>(clear workflowId)
    completed --> idle: New Crawl
    failed --> idle: Retry
```

## Key Features

1. **Workflow ID Tracking**: `workflowId` is set when workflow starts, cleared when it ends
2. **Page File Management**: Each crawled page stored as separate file with DB record
3. **Batch Processing**: Pages processed in batches of 5 to avoid memory issues
4. **Recrawl Support**: Deletes existing files before new crawl
5. **Error Recovery**: Updates status to 'failed' and clears workflowId on any error
6. **UI Filtering**: Page files hidden from UI by default (getWidgetFiles filters them)

## Error Handling

- **Timeout**: After 10 minutes (120 attempts × 5 seconds)
- **Failed Crawl**: Updates status and clears workflowId
- **Workflow Crash**: Catch block ensures status update
- **Partial Failures**: Embeddings/recommendations failures don't fail entire workflow

## Recent Updates

1. **Fixed stuck crawling workflow** (commit f3d3e60): Replaced `setTimeout` with `step.sleep` for proper async handling
2. **Improved polling efficiency**: Reduced attempts to 50 × 10s (from 120 × 5s) while maintaining same timeout
3. **Enhanced chunking**: Improved configuration and content processing for better embedding quality
4. **Fixed workflowId tracking**: Both API endpoints now properly set workflowId
5. **Page files in database**: Each page file gets a database record for accurate counting
6. **UI filtering**: Page files filtered out by default to keep UI clean
7. **Proper cleanup**: Delete operations remove both R2 objects and database records

## Sequence Diagram - Complete Crawl Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant DB[(Database)]
    participant Workflow
    participant Apify
    participant R2[R2 Storage]
    participant Vector[Vector DB]
    participant OpenAI
    
    User->>Frontend: Enter URL & Click "Crawl Website"
    Frontend->>API: POST /api/widgets/:id/crawl
    API->>DB: Check widget ownership & status
    API->>API: Validate not already crawling
    API->>Workflow: Create workflow instance
    API->>DB: Save workflowId
    API-->>Frontend: Return workflowId
    
    Note over Workflow: 10-minute timeout starts
    
    Workflow->>DB: Update status to 'crawling'
    Workflow->>Apify: Start crawl (max 25 pages)
    Apify-->>Workflow: Return crawlRunId
    
    loop Poll every 10 seconds (max 50 times)
        Workflow->>Apify: Check crawl status
        alt Crawl succeeded
            Apify-->>Workflow: Status: SUCCEEDED
            Workflow->>Workflow: Exit loop
        else Crawl failed/aborted
            Apify-->>Workflow: Status: FAILED/ABORTED
            Workflow->>DB: Update status to 'failed'
            Workflow->>DB: Clear workflowId
            Workflow-->>Frontend: Error response
        else Still running
            Workflow->>Workflow: step.sleep(10s)
        end
    end
    
    Workflow->>Apify: Fetch crawl results
    Apify-->>Workflow: Return pages data
    
    loop Process pages (batch of 5)
        Workflow->>R2: Store page-N.md files
        Workflow->>DB: Create file records
    end
    
    loop Generate embeddings (batch of 3)
        Workflow->>R2: Read page content
        Workflow->>OpenAI: Generate embeddings
        OpenAI-->>Workflow: Return vectors
        Workflow->>Vector: Store embeddings
        Workflow->>Workflow: Check time limit
    end
    
    Workflow->>DB: Update status to 'completed'
    opt Generate recommendations
        Workflow->>OpenAI: Generate recommendations
        Workflow->>DB: Store recommendations
    end
    
    Workflow->>DB: Clear workflowId
    
    loop Frontend polls status
        Frontend->>API: GET /api/widgets/:id/crawl/status
        API->>DB: Check widget status
        API-->>Frontend: Return status & progress
    end
```

## Component Interaction Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[WidgetForm Component]
        Status[Status Polling]
    end
    
    subgraph "API Layer"
        REST[REST API<br/>Hono Framework]
        Auth[Authentication<br/>Middleware]
        Rate[Rate Limiter<br/>10/min anon, 30/min auth]
    end
    
    subgraph "Workflow Layer"
        WF[Cloudflare Workflow<br/>10-min timeout]
        Steps[Pipeline Steps<br/>1-7]
    end
    
    subgraph "Service Layer"
        Crawler[ApifyCrawlerService]
        Widget[WidgetService]
        Message[MessageService]
        VectorSearch[VectorSearchService]
    end
    
    subgraph "External Services"
        ApifyAPI[Apify API]
        OpenAIAPI[OpenAI API]
    end
    
    subgraph "Storage Layer"
        PG[(PostgreSQL<br/>Neon)]
        R2S[R2 Storage<br/>Page Files]
        VDB[(pgvector<br/>Embeddings)]
    end
    
    UI --> REST
    Status --> REST
    REST --> Auth
    Auth --> Rate
    Rate --> WF
    WF --> Steps
    Steps --> Crawler
    Steps --> Widget
    Steps --> VectorSearch
    Crawler --> ApifyAPI
    VectorSearch --> OpenAIAPI
    Widget --> PG
    Crawler --> R2S
    VectorSearch --> VDB
    
    style WF fill:#ffe0e0,stroke:#f44336,stroke-width:2px
    style Steps fill:#e1f5e1,stroke:#4caf50,stroke-width:2px
```

## Timing and Performance

### Workflow Timing
- **Total Workflow Timeout**: 10 minutes (hard limit)
- **Polling Interval**: 10 seconds (using `step.sleep`)
- **Maximum Poll Attempts**: 50 (= 8.3 minutes)
- **Safety Buffer**: 1.7 minutes for processing after crawl

### Processing Limits
- **Max Pages per Crawl**: 25 pages
- **Page Processing Batch**: 5 pages at a time
- **Embedding Batch Size**: 3 pages at a time
- **Chunk Size**: ~1000 tokens per chunk

### Performance Optimizations
- **Domain-restricted crawling**: Only crawls within specified domain
- **Media blocking**: Blocks images/videos for faster crawling
- **Parallel processing**: Batched operations for efficiency
- **Time monitoring**: Tracks elapsed time to avoid timeout
- **Error recovery**: Graceful handling with status updates