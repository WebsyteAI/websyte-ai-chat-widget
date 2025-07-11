import { useEffect, useRef } from 'react';
import { toast } from '../../../lib/use-toast';
import type { Widget, CrawlStatus } from '../types';

export function useCrawlManagement(
  widget: Widget | undefined,
  crawlUrl: string,
  setCrawlUrl: (url: string) => void,
  crawlStatus: CrawlStatus,
  setCrawlStatus: (status: CrawlStatus) => void,
  crawlPageCount: number,
  setCrawlPageCount: (count: number) => void,
  crawlStarting: boolean,
  setCrawlStarting: (starting: boolean) => void,
  workflowId: string | null,
  setWorkflowId: (id: string | null) => void,
  setCrawling: (crawling: boolean) => void,
  onWidgetUpdated?: (widget: Widget) => void
) {
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Poll for crawl status if workflow is active
  useEffect(() => {
    if (!widget?.id || !workflowId || crawlStatus === 'completed' || crawlStatus === 'failed') {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/widgets/${widget.id}/crawl/status`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to check crawl status');
        }

        const result = await response.json() as { widget: Widget };
        if (result.widget) {
          setCrawlStatus(result.widget.crawlStatus as CrawlStatus);
          setCrawlPageCount(result.widget.crawlPageCount || 0);
          
          if (result.widget.crawlStatus === 'completed' || result.widget.crawlStatus === 'failed') {
            setWorkflowId(null);
            setCrawling(false);
            
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            if (result.widget.crawlStatus === 'completed') {
              toast.success(`Crawl completed! Processed ${result.widget.crawlPageCount} pages.`);
            } else {
              toast.error('Crawl failed. Please try again.');
            }
            
            onWidgetUpdated?.(result.widget);
          }
        }
      } catch (error) {
        console.error('Error checking crawl status:', error);
      }
    };

    // Check immediately
    checkStatus();

    // Then poll every 2 seconds
    pollIntervalRef.current = setInterval(checkStatus, 2000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [widget?.id, workflowId, crawlStatus, setCrawlStatus, setCrawlPageCount, setWorkflowId, setCrawling, onWidgetUpdated]);

  const handleStartCrawl = async () => {
    if (!crawlUrl || !widget?.id) {
      toast.error('Please enter a URL to crawl');
      return;
    }

    setCrawlStarting(true);
    setCrawling(true);
    setCrawlStatus('pending');
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ crawlUrl })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to start crawl');
      }

      const result = await response.json() as { success: boolean; workflowId?: string };
      if (result.workflowId) {
        setWorkflowId(result.workflowId);
        setCrawlStatus('crawling');
        toast.success('Crawl started successfully!');
      }
    } catch (error) {
      console.error('Error starting crawl:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start crawl');
      setCrawling(false);
      setCrawlStatus(null);
    } finally {
      setCrawlStarting(false);
    }
  };

  const handleRefreshCrawl = () => {
    setCrawlStatus(null);
    setCrawlPageCount(0);
    setWorkflowId(null);
    handleStartCrawl();
  };

  const handleResetCrawl = async () => {
    if (!widget?.id) return;

    try {
      const response = await fetch(`/api/widgets/${widget.id}/crawl/reset`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to reset crawl');
      }

      setCrawlStatus(null);
      setCrawlPageCount(0);
      setWorkflowId(null);
      setCrawlUrl('');
      toast.success('Crawl reset successfully');
    } catch (error) {
      console.error('Error resetting crawl:', error);
      toast.error('Failed to reset crawl');
    }
  };

  return {
    handleStartCrawl,
    handleRefreshCrawl,
    handleResetCrawl
  };
}