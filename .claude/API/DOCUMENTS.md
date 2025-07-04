# Document Management API

Endpoints for managing widget documents, including file uploads, OCR processing, and content search.

## Overview

The Document Management API provides comprehensive file handling capabilities:
- Upload PDFs, images, and text files
- Automatic OCR processing for non-text files
- Content search within documents
- Embedding generation for RAG
- File lifecycle management

## Endpoints

### Upload Documents

```http
POST /api/widgets/:id/documents
Content-Type: multipart/form-data
```

Upload one or more documents to a widget's knowledge base.

**Authentication**: Session required (must be widget owner)

**Parameters**:
- `:id` - Widget ID (UUID)

**Request Body**: Multipart form data with files
```
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf

[Binary PDF data]
------WebKitFormBoundary
Content-Disposition: form-data; name="file"; filename="image.png"
Content-Type: image/png

[Binary image data]
------WebKitFormBoundary--
```

**Response**:
```json
{
  "success": true,
  "count": 2
}
```

**File Processing**:
1. Files uploaded to R2 storage
2. OCR automatically triggered for PDFs/images
3. Text extracted and stored as markdown
4. Embeddings generated for search

**Supported File Types**:
- PDFs (`.pdf`)
- Images (`.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`)
- Text files (`.txt`, `.md`)
- JSON files (`.json`)
- CSV files (`.csv`)

**Limits**:
- Maximum file size: 25MB per file
- Multiple files can be uploaded in one request

### List Documents

```http
GET /api/widgets/:id/documents
```

Get all documents associated with a widget.

**Authentication**: Session required (must be widget owner)

**Response**:
```json
{
  "documents": [
    {
      "id": "file-uuid",
      "name": "user-guide.pdf",
      "size": 2048576,
      "mimeType": "application/pdf",
      "pageCount": 45,
      "createdAt": "2024-01-01T00:00:00Z",
      "hasOCR": true,
      "status": "processed"
    },
    {
      "id": "file-uuid-2",
      "name": "screenshot.png",
      "size": 524288,
      "mimeType": "image/png",
      "pageCount": 1,
      "createdAt": "2024-01-01T00:00:00Z",
      "hasOCR": true,
      "status": "processed"
    }
  ]
}
```

**Document Fields**:
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique document ID |
| name | string | Original filename |
| size | number | File size in bytes |
| mimeType | string | MIME type |
| pageCount | number | Number of pages (for PDFs) |
| createdAt | string | Upload timestamp |
| hasOCR | boolean | Whether OCR was performed |
| status | string | Processing status |

### Delete Document

```http
DELETE /api/widgets/:id/documents/:documentId
```

Remove a document from the widget's knowledge base.

**Authentication**: Session required (must be widget owner)

**Parameters**:
- `:id` - Widget ID
- `:documentId` - Document ID to delete

**Response**:
```json
{
  "success": true
}
```

**Deletion Process**:
1. Original file removed from R2
2. OCR page files deleted
3. Vector embeddings removed
4. Database records cleaned up

### Search Documents

```http
POST /api/widgets/:id/search
```

Search within widget documents using semantic search.

**Authentication**: Session required (must be widget owner)

**Request Body**:
```json
{
  "query": "password reset instructions",
  "limit": 10
}
```

**Parameters**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | Yes | Search query |
| limit | number | No | Max results (default: 10, max: 50) |

**Response**:
```json
{
  "results": [
    {
      "content": "To reset your password, follow these steps:\n1. Go to the login page\n2. Click 'Forgot Password'...",
      "score": 0.92,
      "metadata": {
        "source": "user-guide.pdf",
        "fileId": "file-uuid",
        "pageNumber": 23,
        "type": "file"
      }
    },
    {
      "content": "Password requirements:\n- Minimum 8 characters\n- At least one uppercase letter...",
      "score": 0.87,
      "metadata": {
        "source": "security-policy.pdf",
        "fileId": "file-uuid-2",
        "pageNumber": 5,
        "type": "file"
      }
    }
  ]
}
```

**Search Features**:
- Semantic search using vector embeddings
- Returns relevant snippets with context
- Includes source file and page references
- Sorted by relevance score

### Download Document

```http
GET /api/widgets/:id/documents/:documentId/download
```

Download the original uploaded document.

**Authentication**: Session required (must be widget owner)

**Response**: Binary file stream with appropriate headers
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="document.pdf"
Content-Length: 2048576

[Binary data]
```

## OCR Processing

### Automatic Processing

When supported files are uploaded, OCR processing begins automatically:

1. **File Analysis**: Determine if OCR is needed
2. **Page Extraction**: Split multi-page documents
3. **Text Extraction**: Use Mistral AI for OCR
4. **Markdown Storage**: Save as structured text
5. **Embedding Creation**: Generate vectors for search

### OCR Status

Track OCR processing through document status:

| Status | Description |
|--------|-------------|
| `uploading` | File upload in progress |
| `processing` | OCR extraction running |
| `processed` | Successfully completed |
| `failed` | OCR processing failed |
| `skipped` | Text file, no OCR needed |

### Page Files

OCR results are stored as individual page files:
```
widgets/{widgetId}/{fileId}/
├── original.pdf          # Original upload
├── page_1.md            # Page 1 content
├── page_2.md            # Page 2 content
└── page_N.md            # Page N content
```

## Embedding Management

### Refresh Embeddings

```http
POST /api/widgets/:id/embeddings/refresh
```

Regenerate all embeddings for widget documents.

**Authentication**: Session required (must be widget owner)

**Use Cases**:
- After bulk document updates
- To apply new embedding models
- To fix corrupted embeddings

**Response**:
```json
{
  "success": true,
  "embeddingsCreated": 150,
  "filesProcessed": 5
}
```

**Process**:
1. Delete existing embeddings
2. Re-read all document content
3. Chunk content appropriately
4. Generate new embeddings
5. Update search index

## Error Handling

### Common Errors

**File Too Large**
```json
{
  "error": "File size exceeds maximum limit of 25MB",
  "code": "FILE_TOO_LARGE"
}
```

**Unsupported File Type**
```json
{
  "error": "File type not supported",
  "code": "UNSUPPORTED_FILE_TYPE",
  "supportedTypes": ["pdf", "png", "jpg", "txt", "md"]
}
```

**OCR Processing Failed**
```json
{
  "error": "Failed to process document",
  "code": "OCR_FAILED",
  "details": "OCR service temporarily unavailable"
}
```

**Document Not Found**
```json
{
  "error": "Document not found",
  "code": "DOCUMENT_NOT_FOUND"
}
```

## Best Practices

### For File Uploads

1. **Validate Before Upload**: Check file size/type client-side
2. **Show Progress**: Implement upload progress indicators
3. **Handle Failures**: Retry failed uploads automatically
4. **Batch Uploads**: Upload multiple files together

### For OCR Content

1. **Quality Matters**: Higher resolution images yield better results
2. **Text PDFs**: Use text-selectable PDFs when possible
3. **Page Limits**: Be aware of processing time for large documents
4. **Language**: Currently optimized for English content

### For Search

1. **Specific Queries**: More specific queries yield better results
2. **Use Context**: Include relevant context in queries
3. **Check Sources**: Verify results against original documents
4. **Limit Results**: Request only needed results to improve performance

## Examples

### Upload Multiple Documents

```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('file', imageFile);

const response = await fetch(`/api/widgets/${widgetId}/documents`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log(`Uploaded ${result.count} files`);
```

### Search with Python

```python
import requests

response = requests.post(
    f'https://api.example.com/widgets/{widget_id}/search',
    json={
        'query': 'installation guide',
        'limit': 5
    },
    headers={'Authorization': f'Bearer {token}'}
)

results = response.json()['results']
for result in results:
    print(f"Found in {result['metadata']['source']} "
          f"(page {result['metadata']['pageNumber']}): "
          f"{result['content'][:100]}...")
```

### Monitor OCR Progress

```javascript
// Poll for document status
async function checkOCRStatus(widgetId, documentId) {
  const response = await fetch(`/api/widgets/${widgetId}/documents`);
  const { documents } = await response.json();
  
  const doc = documents.find(d => d.id === documentId);
  return doc?.status;
}

// Wait for processing
let status;
do {
  status = await checkOCRStatus(widgetId, documentId);
  if (status === 'processing') {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
} while (status === 'processing');
```

## Performance Considerations

### Upload Optimization
- Stream large files instead of buffering
- Use multipart uploads for multiple files
- Implement client-side compression for text

### Search Performance
- Limit search scope with specific queries
- Use pagination for large result sets
- Cache frequent searches client-side

### OCR Processing
- Processing time scales with document size
- Typical PDF: 1-2 seconds per page
- Images process faster than PDFs
- Batch processing available for multiple files