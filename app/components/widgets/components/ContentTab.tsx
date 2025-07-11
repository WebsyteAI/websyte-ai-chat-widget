import { TabsContent } from '../../ui/tabs';
import { Label } from '../../ui/label';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Upload, Globe, RefreshCw, Info } from 'lucide-react';
import { CHUNK_CONFIG } from '../../../constants/chunking';
import { FileList } from './FileList';
import { CrawlStatus } from './CrawlStatus';
import type { ExistingFile, CrawlStatus as CrawlStatusType } from '../types';

interface ContentTabProps {
  // File management
  files: File[];
  existingFiles: ExistingFile[];
  deletingFileId: string | null;
  uploadingFiles: Set<string>;
  dragActive: boolean;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formatFileSize: (bytes: number) => string;
  deleteExistingFile: (fileId: string) => void;
  downloadFile: (file: ExistingFile) => void;
  removeFile: (index: number) => void;
  
  // Crawl management
  crawlUrl: string;
  setCrawlUrl: (url: string) => void;
  crawlStatus: CrawlStatusType;
  crawlPageCount: number;
  crawling: boolean;
  crawlStarting: boolean;
  showCrawlDebug: boolean;
  workflowId: string | null;
  isEditing: boolean;
  setShowCrawlDebug: (show: boolean) => void;
  handleStartCrawl: () => void;
  handleRefreshCrawl: () => void;
  handleResetCrawl: () => void;
  handleRefreshEmbeddings: () => void;
}

export function ContentTab({
  files,
  existingFiles,
  deletingFileId,
  uploadingFiles,
  dragActive,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleFileSelect,
  formatFileSize,
  deleteExistingFile,
  downloadFile,
  removeFile,
  crawlUrl,
  setCrawlUrl,
  crawlStatus,
  crawlPageCount,
  crawling,
  crawlStarting,
  showCrawlDebug,
  workflowId,
  isEditing,
  setShowCrawlDebug,
  handleStartCrawl,
  handleRefreshCrawl,
  handleResetCrawl,
  handleRefreshEmbeddings
}: ContentTabProps) {
  return (
    <TabsContent value="content">
      <div className="space-y-6">
        {/* File Upload Section */}
        <div>
          <Label>Upload Documents</Label>
          <div
            className={`mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 mx-auto mb-4 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supported: PDF, DOC, DOCX, TXT, PNG, JPG, JPEG (Max {CHUNK_CONFIG.MAX_FILE_SIZE_MB}MB each, {CHUNK_CONFIG.MAX_FILES_PER_UPLOAD} files)
            </p>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </Button>
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              onChange={handleFileSelect}
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            />
          </div>
        </div>

        <FileList
          existingFiles={existingFiles}
          newFiles={files}
          deletingFileId={deletingFileId}
          uploadingFiles={uploadingFiles}
          formatFileSize={formatFileSize}
          deleteExistingFile={deleteExistingFile}
          downloadFile={downloadFile}
          removeFile={removeFile}
        />

        {/* Website Crawl Section */}
        <div className="border-t pt-6">
          <Label htmlFor="crawlUrl" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Crawl Website
          </Label>
          <p className="text-sm text-muted-foreground mb-3">
            Automatically extract content from your website to train the AI
          </p>
          <div className="flex gap-2">
            <Input
              id="crawlUrl"
              type="url"
              value={crawlUrl}
              onChange={(e) => setCrawlUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              disabled={crawling}
            />
            {isEditing && (
              <Button
                type="button"
                onClick={handleStartCrawl}
                disabled={!crawlUrl || crawling || crawlStarting}
              >
                {crawlStarting ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Starting...
                  </>
                ) : crawling ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Crawling...
                  </>
                ) : (
                  'Start Crawl'
                )}
              </Button>
            )}
          </div>

          <CrawlStatus
            crawlStatus={crawlStatus}
            crawlPageCount={crawlPageCount}
            crawling={crawling}
            crawlStarting={crawlStarting}
            showCrawlDebug={showCrawlDebug}
            workflowId={workflowId}
            isEditing={isEditing}
            setShowCrawlDebug={setShowCrawlDebug}
            handleRefreshCrawl={handleRefreshCrawl}
            handleResetCrawl={handleResetCrawl}
          />
        </div>

        {/* Embeddings Refresh */}
        {isEditing && (existingFiles.length > 0 || crawlStatus === 'completed') && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium mb-1">Refresh Embeddings</h4>
                <p className="text-sm text-muted-foreground">
                  Regenerate AI embeddings for all content to improve search quality
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRefreshEmbeddings}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Content Processing</p>
              <p>
                Upload documents or crawl your website to provide knowledge for the AI assistant. 
                The content will be processed and indexed automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}