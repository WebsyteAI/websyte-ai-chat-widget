import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Globe, RefreshCw, X } from 'lucide-react';
import type { CrawlStatus as CrawlStatusType } from '../types';

interface CrawlStatusProps {
  crawlStatus: CrawlStatusType;
  crawlPageCount: number;
  crawling: boolean;
  crawlStarting: boolean;
  showCrawlDebug: boolean;
  workflowId: string | null;
  isEditing: boolean;
  setShowCrawlDebug: (show: boolean) => void;
  handleRefreshCrawl: () => void;
  handleResetCrawl: () => void;
}

export function CrawlStatus({
  crawlStatus,
  crawlPageCount,
  crawling,
  crawlStarting,
  showCrawlDebug,
  workflowId,
  isEditing,
  setShowCrawlDebug,
  handleRefreshCrawl,
  handleResetCrawl
}: CrawlStatusProps) {
  if (!crawlStatus) return null;

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-600" />
          <h4 className="font-medium">Crawl Status</h4>
        </div>
        {isEditing && (crawlStatus === 'completed' || crawlStatus === 'failed') && (
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefreshCrawl}
              disabled={crawling || crawlStarting}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Refresh Crawl
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetCrawl}
              disabled={crawling}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        {crawlStatus === 'pending' && (
          <p className="text-sm text-gray-600">Preparing to crawl website...</p>
        )}
        
        {(crawlStatus === 'crawling' || crawlStatus === 'processing') && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              {crawlStatus === 'crawling' ? 'Currently crawling website...' : 'Processing crawled pages...'}
            </p>
            <Progress value={33} className="h-2" />
            {crawlPageCount > 0 && (
              <p className="text-xs text-gray-500">Processed {crawlPageCount} pages so far</p>
            )}
          </div>
        )}
        
        {crawlStatus === 'completed' && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-green-700">
              ✓ Crawl completed successfully
            </p>
            <p className="text-sm text-gray-600">
              {crawlPageCount} pages indexed
            </p>
          </div>
        )}
        
        {crawlStatus === 'failed' && (
          <p className="text-sm text-red-600">
            ✗ Crawl failed. Please try again.
          </p>
        )}
      </div>
      
      {/* Debug info */}
      {showCrawlDebug && workflowId && (
        <div className="mt-3 p-2 bg-gray-100 rounded text-xs font-mono">
          <p>Status: {crawlStatus}</p>
          <p>Workflow ID: {workflowId}</p>
          <p>Pages: {crawlPageCount}</p>
        </div>
      )}
      
      {!showCrawlDebug && isEditing && workflowId && (
        <button
          type="button"
          onClick={() => setShowCrawlDebug(true)}
          className="mt-2 text-xs text-gray-500 hover:text-gray-700"
        >
          Show debug info
        </button>
      )}
    </div>
  );
}