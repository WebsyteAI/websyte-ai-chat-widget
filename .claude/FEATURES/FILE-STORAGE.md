# File Storage and OCR Processing

## Overview

The file storage system provides comprehensive document management capabilities for widgets, including:
- Cloudflare R2 storage for files
- Automatic OCR processing for PDFs and images
- Page-by-page content extraction
- Seamless integration with vector search
- Support for multiple file types

## Architecture

### Storage Structure

Files are organized in R2 with the following hierarchy:
```
widgets/
├── {widgetId}/
│   ├── {fileId}/
│   │   ├── original_file.pdf     # Original uploaded file
│   │   ├── page_1.md            # OCR extracted content
│   │   ├── page_2.md            # OCR extracted content
│   │   └── page_N.md            # OCR extracted content
```

### Components

1. **FileStorageService** (`workers/services/file-storage.ts`)
   - Handles R2 storage operations
   - Manages file metadata in database
   - Coordinates with OCR service
   - Provides file lifecycle management

2. **OCRService** (`workers/services/ocr-service.ts`)
   - Processes documents using Mistral AI
   - Extracts text and images from PDFs
   - Stores page-by-page markdown content
   - Creates embeddings for search

3. **Database Schema** (`workers/db/schema.ts`)
   ```typescript
   widgetFile {
     id: string (UUID)
     widgetId: string
     r2Key: string (unique)
     filename: string
     fileType: string
     fileSize: number
     createdAt: Date
   }
   ```

## File Upload Flow

1. **Upload Initiation**
   - Client sends file via multipart form data
   - Server validates file size and type
   - Creates database record with temporary R2 key

2. **R2 Storage**
   - File streamed directly to R2 bucket
   - Proper content type and disposition headers set
   - Database updated with final R2 key

3. **OCR Processing** (if applicable)
   - Triggered automatically for PDFs and images
   - Skipped for text files (txt, md, json, csv)
   - Processes asynchronously without blocking upload

4. **Embedding Generation**
   - OCR content chunked into segments
   - Vector embeddings created for each chunk
   - Stored with page references for citations

## OCR Processing

### Supported File Types

**Processed with OCR:**
- PDF documents
- Images (PNG, JPG, JPEG, GIF, BMP)
- Office documents (when converted to PDF)

**Direct text extraction (no OCR):**
- Text files (.txt)
- Markdown files (.md)
- JSON files (.json)
- CSV files (.csv)

### Mistral AI Integration

The OCR service uses Mistral AI's latest OCR model:
- Model: `mistral-ocr-latest`
- Extracts both text and images
- Preserves document structure
- Returns markdown-formatted content

### Page Processing

Each page is processed individually:
1. Text extracted as markdown
2. Images extracted with bounding boxes
3. Page dimensions preserved
4. Content stored as separate files

Example page metadata:
```json
{
  "pageNumber": 1,
  "markdown": "# Document Title\n\nContent here...",
  "images": [{
    "id": "img-123",
    "boundingBox": {
      "topLeftX": 100,
      "topLeftY": 200,
      "bottomRightX": 400,
      "bottomRightY": 600
    }
  }],
  "dimensions": {
    "width": 612,
    "height": 792,
    "dpi": 72
  }
}
```

## API Endpoints

### Upload Document
```http
POST /api/widgets/:id/documents
Content-Type: multipart/form-data

file: <binary>
```

Response:
```json
{
  "file": {
    "id": "file-uuid",
    "name": "document.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### List Documents
```http
GET /api/widgets/:id/documents
```

Response:
```json
{
  "files": [{
    "id": "file-uuid",
    "name": "document.pdf",
    "size": 1048576,
    "mimeType": "application/pdf",
    "pageCount": 10,
    "createdAt": "2024-01-01T00:00:00Z"
  }]
}
```

### Delete Document
```http
DELETE /api/widgets/:id/documents/:documentId
```

### Download Document
```http
GET /api/widgets/:id/documents/:documentId/download
```

## File Management

### Storage Limits
- Maximum file size: 25MB per file
- Supported formats: PDF, images, text files
- Files stored indefinitely until deleted

### Cleanup Operations

When a file is deleted:
1. Original file removed from R2
2. All page files deleted
3. Vector embeddings removed
4. Database records cleaned up

When a widget is deleted:
1. All associated files removed
2. Complete R2 directory cleared
3. Cascading deletion of embeddings

### Error Handling

Failed uploads are automatically cleaned up:
- Partial R2 uploads deleted
- Database records removed
- Clear error messages returned

OCR failures don't block uploads:
- File still stored successfully
- Error logged for diagnostics
- Manual retry available

## Integration with Vector Search

### Embedding Creation

After OCR processing:
1. Content chunked by paragraphs
2. Each chunk gets vector embedding
3. Metadata preserved:
   - Source file ID
   - Page number
   - Position in document

### Search Integration

When searching widget content:
1. File content included in results
2. Page-level citations provided
3. Relevant snippets extracted

Example search result:
```json
{
  "content": "Password reset instructions...",
  "source": {
    "type": "file",
    "fileId": "file-123",
    "filename": "user-guide.pdf",
    "pageNumber": 42
  }
}
```

## Security Considerations

### Access Control
- Files scoped to widget ownership
- Authentication required for all operations
- No direct R2 URLs exposed

### Data Privacy
- Files encrypted at rest in R2
- HTTPS for all transfers
- No public file access by default

### Input Validation
- File type verification
- Size limits enforced
- Malware scanning (planned)

## Performance Optimization

### Streaming Uploads
- Direct streaming to R2
- No server-side buffering
- Progress tracking available

### Async Processing
- OCR runs in background
- Non-blocking file operations
- Parallel page processing

### Caching
- Page content cached after OCR
- Embedding results cached
- R2 CDN for fast delivery

## Monitoring and Debugging

### Logging

Structured logs for tracking:
```
[FILE_UPLOAD] widget_id=123 file_id=456 starting_ocr=true
[OCR_START] widget_id=123 file_id=456 buffer_size=1048576
[OCR_API_PROGRESS] pages_processed=10
[OCR_SUCCESS] total_pages=10 text_length=50000
[OCR_EMBEDDINGS] embeddings_created=true
```

### Metrics

Track key metrics:
- Upload success rate
- OCR processing time
- Storage utilization
- Error rates by type

## Best Practices

### For Developers

1. **Handle Large Files**: Stream uploads for better performance
2. **Error Recovery**: Implement retry logic for OCR failures
3. **Progress Feedback**: Show upload/processing status to users
4. **Batch Operations**: Process multiple files concurrently

### For Users

1. **File Preparation**: Ensure PDFs are text-selectable when possible
2. **Image Quality**: Higher resolution images yield better OCR results
3. **Organization**: Use descriptive filenames for easy management
4. **Regular Cleanup**: Remove obsolete documents to save storage

## Future Enhancements

### Planned Features
- Office document support (Word, Excel)
- Automatic document categorization
- Smart chunking based on document structure
- OCR language detection
- Batch upload interface

### Performance Improvements
- Incremental page processing
- OCR result caching
- Parallel file uploads
- Compression for text files

### Advanced Features
- Document versioning
- Change detection
- Collaborative annotations
- Full-text search within files