import { useState, useEffect } from 'react';
import { useUIStore, type Widget } from '../../../stores';
import type { 
  WidgetFormState, 
  CrawlStatus, 
  Recommendation, 
  WidgetLink, 
  ExistingFile 
} from '../types';

export function useWidgetForm(widget?: Widget) {
  const {
    widgetFormData,
    updateWidgetFormField,
    addFiles,
    removeFile,
    setDragActive,
    resetWidgetForm
  } = useUIStore();

  const [state, setState] = useState<WidgetFormState>({
    deletingFileId: null,
    existingFiles: widget?.files || [],
    isPublic: false,
    crawlUrl: widget?.crawlUrl || '',
    crawling: false,
    crawlStatus: widget?.crawlStatus as CrawlStatus || null,
    crawlPageCount: widget?.crawlPageCount || 0,
    crawlStarting: false,
    workflowId: widget?.workflowId || null,
    uploadingFiles: new Set(),
    generatingRecommendations: false,
    recommendations: widget?.recommendations || [],
    showCrawlDebug: false,
    links: widget?.links || [],
    generatingLinks: false
  });

  // Update form when widget changes
  useEffect(() => {
    if (widget) {
      updateWidgetFormField('name', widget.name || '');
      updateWidgetFormField('description', widget.description || '');
      updateWidgetFormField('url', widget.url || '');
      updateWidgetFormField('logoUrl', widget.logoUrl || '');
      setState(prev => ({
        ...prev,
        existingFiles: widget.files || [],
        isPublic: widget.isPublic || false,
        crawlUrl: widget.crawlUrl || '',
        crawlStatus: widget.crawlStatus as CrawlStatus || null,
        crawlPageCount: widget.crawlPageCount || 0,
        workflowId: widget.workflowId || null,
        recommendations: widget.recommendations || [],
        links: widget.links || []
      }));
    } else {
      resetWidgetForm();
      setState({
        deletingFileId: null,
        existingFiles: [],
        isPublic: false,
        crawlUrl: '',
        crawling: false,
        crawlStatus: null,
        crawlPageCount: 0,
        crawlStarting: false,
        workflowId: null,
        uploadingFiles: new Set(),
        generatingRecommendations: false,
        recommendations: [],
        showCrawlDebug: false,
        links: [],
        generatingLinks: false
      });
    }
  }, [widget, updateWidgetFormField, resetWidgetForm]);

  const updateState = (updates: Partial<WidgetFormState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setDeletingFileId = (id: string | null) => updateState({ deletingFileId: id });
  const setExistingFiles = (files: ExistingFile[]) => updateState({ existingFiles: files });
  const setIsPublic = (isPublic: boolean) => updateState({ isPublic });
  const setCrawlUrl = (url: string) => updateState({ crawlUrl: url });
  const setCrawling = (crawling: boolean) => updateState({ crawling });
  const setCrawlStatus = (status: CrawlStatus) => updateState({ crawlStatus: status });
  const setCrawlPageCount = (count: number) => updateState({ crawlPageCount: count });
  const setCrawlStarting = (starting: boolean) => updateState({ crawlStarting: starting });
  const setWorkflowId = (id: string | null) => updateState({ workflowId: id });
  const setUploadingFiles = (files: Set<string>) => updateState({ uploadingFiles: files });
  const setGeneratingRecommendations = (generating: boolean) => updateState({ generatingRecommendations: generating });
  const setRecommendations = (recommendations: Recommendation[]) => updateState({ recommendations });
  const setShowCrawlDebug = (show: boolean) => updateState({ showCrawlDebug: show });
  const setLinks = (links: WidgetLink[]) => updateState({ links });
  const setGeneratingLinks = (generating: boolean) => updateState({ generatingLinks: generating });

  return {
    // Form data from store
    ...widgetFormData,
    
    // Local state
    ...state,
    
    // State setters
    setDeletingFileId,
    setExistingFiles,
    setIsPublic,
    setCrawlUrl,
    setCrawling,
    setCrawlStatus,
    setCrawlPageCount,
    setCrawlStarting,
    setWorkflowId,
    setUploadingFiles,
    setGeneratingRecommendations,
    setRecommendations,
    setShowCrawlDebug,
    setLinks,
    setGeneratingLinks,
    
    // Store actions
    updateWidgetFormField,
    addFiles,
    removeFile,
    setDragActive,
    resetWidgetForm,
    
    // Computed values
    isEditing: !!widget
  };
}