import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, X, FileText, Trash2, Lock, ArrowLeft, Info, Globe, RefreshCw, Sparkles } from 'lucide-react';
import { useUIStore, type Widget } from '../../stores';
import { toast } from '@/lib/use-toast';
import { EmbedCodeGenerator } from './EmbedCodeGenerator';
import { CHUNK_CONFIG } from '../../constants/chunking';


interface WidgetFormProps {
  widget?: Widget;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  onWidgetUpdated?: (widget: Widget) => void;
  loading?: boolean;
}

export function WidgetForm({ widget, onSubmit, onCancel, onDelete, onWidgetUpdated, loading = false }: WidgetFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [existingFiles, setExistingFiles] = useState(widget?.files || []);
  const [isPublic, setIsPublic] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState(widget?.crawlUrl || '');
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState<'pending' | 'crawling' | 'completed' | 'failed' | 'processing' | null>(widget?.crawlStatus || null);
  const [crawlPageCount, setCrawlPageCount] = useState(widget?.crawlPageCount || 0);
  const [crawlStarting, setCrawlStarting] = useState(false);
  const [workflowId, setWorkflowId] = useState<string | null>(widget?.workflowId || null);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const [generatingRecommendations, setGeneratingRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState(widget?.recommendations || []);
  const [showCrawlDebug, setShowCrawlDebug] = useState(false);
  const {
    widgetFormData,
    updateWidgetFormField,
    addFiles,
    removeFile,
    setDragActive,
    resetWidgetForm
  } = useUIStore();
  
  const { name, description, url, content, files, dragActive } = widgetFormData;

  const isEditing = !!widget;
  
  // Update form when widget changes
  useEffect(() => {
    if (widget) {
      updateWidgetFormField('name', widget.name || '');
      updateWidgetFormField('description', widget.description || '');
      updateWidgetFormField('url', widget.url || '');
      setExistingFiles(widget.files || []);
      setIsPublic(widget.isPublic || false);
      setCrawlUrl(widget.crawlUrl || '');
      setCrawlStatus(widget.crawlStatus || null);
      setCrawlPageCount(widget.crawlPageCount || 0);
      setWorkflowId(widget.workflowId || null);
      setRecommendations(widget.recommendations || []);
    } else {
      resetWidgetForm();
      setExistingFiles([]);
      setIsPublic(false);
      setCrawlUrl('');
      setCrawlStatus(null);
      setCrawlPageCount(0);
      setWorkflowId(null);
      setRecommendations([]);
    }
  }, [widget, updateWidgetFormField, resetWidgetForm]);
  

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
  };

  const handleDeleteExistingFile = async (fileId: string) => {
    if (!widget) return;
    
    const file = existingFiles.find(f => f.id === fileId);
    if (!file) return;
    
    if (!confirm(`Are you sure you want to delete "${file.filename}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingFileId(fileId);
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/files/${fileId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      // Remove the file from the existing files list
      setExistingFiles(prev => prev.filter(f => f.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file. Please try again.');
    } finally {
      setDeletingFileId(null);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  const toggleWidgetPublic = async () => {
    if (!widget?.id) return;
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          isPublic: !isPublic
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update widget visibility');
      }

      setIsPublic(!isPublic);
      toast.success(`Widget is now ${!isPublic ? 'public' : 'private'}`);
    } catch (error) {
      console.error('Error updating widget visibility:', error);
      toast.error('Failed to update widget visibility. Please try again.');
    }
  };


  const handleRecrawl = async () => {
    if (!widget?.id || !crawlUrl) return;
    
    // Prevent re-crawling if already in progress
    if (crawlStatus === 'crawling' || crawlStatus === 'processing') {
      toast.error('A crawl is already in progress');
      return;
    }
    
    setCrawling(true);
    setCrawlStatus('crawling');
    setCrawlPageCount(0);
    
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
      
      const result = await response.json() as { workflowId?: string; status: string; message: string };
      if (result.workflowId) {
        setWorkflowId(result.workflowId);
      }
      
      toast.success('Website crawl started. Click "Refresh Status" to check progress.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start crawl');
      setCrawlStatus('failed');
    } finally {
      setCrawling(false);
    }
  };

  const handleRefreshCrawlStatus = async () => {
    if (!widget?.id) return;
    
    try {
      // Check workflow status if we have a workflowId
      if (workflowId) {
        const workflowResponse = await fetch(`/api/widgets/${widget.id}/workflow/status?workflowId=${workflowId}`, {
          credentials: 'include'
        });
        
        if (workflowResponse.ok) {
          const workflowData = await workflowResponse.json() as { 
            status: string; 
            output?: { 
              embeddingsCreated: number; 
              pagesCrawled: number; 
            }; 
          };
          console.log('[Workflow Status]', workflowData);
          
          // Map workflow status to crawl status
          if (workflowData.status === 'RUNNING') {
            setCrawlStatus('crawling');
          } else if (workflowData.status === 'COMPLETED') {
            setCrawlStatus('completed');
            if (workflowData.output?.embeddingsCreated) {
              setCrawlPageCount(workflowData.output.pagesCrawled || 0);
            }
          } else if (workflowData.status === 'FAILED') {
            setCrawlStatus('failed');
          }
        }
      }
      
      // Always check widget status as well
      const statusUrl = workflowId 
        ? `/api/widgets/${widget.id}/crawl/status?workflowId=${workflowId}`
        : `/api/widgets/${widget.id}/crawl/status`;
      const response = await fetch(statusUrl, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json() as { 
          status: 'crawling' | 'pending' | 'completed' | 'failed' | 'processing' | 'idle'; 
          crawlPageCount?: number;
          pageCount?: number; // legacy field name
          workflowStatus?: string;
          error?: string;
        };
        setCrawlStatus(data.status === 'idle' ? null : data.status);
        setCrawlPageCount(data.crawlPageCount || data.pageCount || 0);
        
        // If we got an updated status from workflow check, clear workflowId if completed/failed
        if (data.workflowStatus && (data.workflowStatus === 'complete' || data.workflowStatus === 'failed')) {
          setWorkflowId(null);
        }
        
        // Refresh widget data if completed
        if (data.status === 'completed' && widget?.id) {
          try {
            const widgetResponse = await fetch(`/api/widgets/${widget.id}`, {
              credentials: 'include'
            });
            
            if (widgetResponse.ok) {
              const { widget: updatedWidget } = await widgetResponse.json() as { widget: Widget };
              // Update existing files with the new crawled files
              setExistingFiles(updatedWidget.files || []);
              // Update workflowId from the fetched widget data
              setWorkflowId(updatedWidget.workflowId || null);
              // Notify parent component about the update
              onWidgetUpdated?.(updatedWidget);
              toast.success('Crawl completed successfully!');
            }
          } catch (error) {
            console.error('Error fetching updated widget:', error);
          }
        } else if (data.status === 'failed') {
          toast.error('Crawl failed. Please try again.');
        } else if (data.status === 'crawling' || data.status === 'processing') {
          toast.info(`Still ${data.status === 'processing' ? 'processing' : 'crawling'}... ${data.pageCount || 0} pages found so far.`);
        }
      } else {
        console.error('Error response from crawl status endpoint:', response.status);
        toast.error('Failed to check crawl status. Please try again.');
      }
    } catch (error) {
      console.error('Error checking crawl status:', error);
      toast.error('Failed to check crawl status. Please try again.');
    }
  };

  const handleResetCrawl = async () => {
    if (!widget?.id) return;
    
    if (!confirm('Are you sure you want to reset this crawl? This will mark it as failed.')) {
      return;
    }
    
    setCrawling(true);
    try {
      const response = await fetch(`/api/widgets/${widget.id}/crawl/reset`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to reset crawl');
      
      setCrawlStatus('failed');
      setWorkflowId(null); // Clear workflow ID when resetting
      toast.success('Crawl status reset. You can try crawling again.');
    } catch (error) {
      toast.error('Failed to reset crawl status');
    } finally {
      setCrawling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // First handle the main widget update
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (url) formData.append('url', url);
    if (content) formData.append('content', content);
    if (crawlUrl) formData.append('crawlUrl', crawlUrl);
    
    // For creation mode, include files in the main form data
    if (!isEditing) {
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });
    }

    // Show a notification if crawl URL is being added/changed
    const isNewCrawlUrl = crawlUrl && crawlUrl !== widget?.crawlUrl;
    if (isNewCrawlUrl && isEditing) {
      toast.info('Starting website crawl... Click "Refresh Status" to check progress.');
      setCrawlStarting(true);
    }

    try {
      await onSubmit(formData);
      
      // If crawl was started, update the status
      if (isNewCrawlUrl && isEditing) {
        setCrawlStatus('crawling');
        setCrawlStarting(false);
      }
    } catch (error) {
      // Reset crawl starting state on error
      setCrawlStarting(false);
      throw error; // Re-throw to be handled by parent
    }

    // For editing mode, handle file uploads separately after the main update
    if (isEditing && files.length > 0 && widget) {
      try {
        const filesToUpload = files.filter(file => !uploadingFiles.has(file.name));
        
        if (filesToUpload.length === 0) {
          toast.info('Files are already being uploaded');
          return;
        }
        
        // Mark files as uploading
        setUploadingFiles(prev => {
          const newSet = new Set(prev);
          filesToUpload.forEach(file => newSet.add(file.name));
          return newSet;
        });
        
        for (const file of filesToUpload) {
          const fileFormData = new FormData();
          fileFormData.append('file', file);
          
          const response = await fetch(`/api/widgets/${widget.id}/files`, {
            method: 'POST',
            credentials: 'include',
            body: fileFormData
          });

          if (!response.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const result: any = await response.json();
          // Add the new file to existing files list
          setExistingFiles(prev => [...prev, result.file]);
        }

        // Clear the new files after successful upload
        for (let i = files.length - 1; i >= 0; i--) {
          removeFile(i);
        }
        toast.success(`${filesToUpload.length} file${filesToUpload.length > 1 ? 's' : ''} uploaded successfully`);
        
        // Clear uploading state
        setUploadingFiles(new Set());
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Some files failed to upload. Please try again.');
        // Clear uploading state on error
        setUploadingFiles(new Set());
      }
    }
  };

  const handleRefreshEmbeddings = async () => {
    if (!widget?.id) return;
    
    if (!confirm('This will regenerate all embeddings from existing files. Continue?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/embeddings/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh embeddings');
      }
      
      const result = await response.json();
      toast.success(`Embeddings refreshed: ${result.embeddingsCreated} embeddings created`);
      
      // Refresh widget data
      if (onWidgetUpdated && widget) {
        onWidgetUpdated({ ...widget });
      }
    } catch (error) {
      console.error('Error refreshing embeddings:', error);
      toast.error('Failed to refresh embeddings. Please try again.');
    }
  };

  const handleRegenerateRecommendations = async () => {
    if (!widget?.id) return;
    
    setGeneratingRecommendations(true);
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/recommendations`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const result = await response.json() as { success: boolean; recommendations: Array<{ title: string; description: string }> };
      
      if (result.recommendations) {
        setRecommendations(result.recommendations);
        toast.success('Recommendations regenerated successfully');
        
        // Fetch the updated widget to ensure we have all the latest data
        try {
          const widgetResponse = await fetch(`/api/widgets/${widget.id}`, {
            credentials: 'include'
          });
          
          if (widgetResponse.ok) {
            const { widget: updatedWidget } = await widgetResponse.json() as { widget: Widget };
            console.log('[WidgetForm] Updated widget with recommendations:', updatedWidget);
            // Notify parent component about the update with full widget data
            onWidgetUpdated?.(updatedWidget);
          }
        } catch (error) {
          console.error('Error fetching updated widget:', error);
          // Fallback to updating with just recommendations
          if (onWidgetUpdated) {
            onWidgetUpdated({
              ...widget,
              recommendations: result.recommendations
            });
          }
        }
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate recommendations. Please ensure your widget has content.');
    } finally {
      setGeneratingRecommendations(false);
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Widgets
          </Button>
          
          {isEditing && onDelete && (
            <Button 
              type="button"
              variant="outline" 
              size="sm" 
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              Delete Widget
            </Button>
          )}
        </div>
        
        <CardTitle>
          {isEditing ? 'Edit Widget' : 'Create New Widget'}
        </CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your widget settings and content'
            : 'Create a custom AI widget with your content and files for vector search'
          }
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Widget Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => updateWidgetFormField('name', e.target.value)}
                placeholder="My Custom Widget"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Website URL (optional)</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => updateWidgetFormField('url', e.target.value)}
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => updateWidgetFormField('description', e.target.value)}
              placeholder="Brief description of your widget's purpose..."
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Text Content (optional)</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => updateWidgetFormField('content', e.target.value)}
              placeholder="Add any text content you want to include in the widget's knowledge base..."
              rows={6}
            />
            <p className="text-sm text-gray-600">
              This content will be processed and made searchable via vector embeddings.
            </p>
          </div>

          {/* Website Crawling Section */}
          <div className="space-y-4">
            <Label>Website Crawling (optional)</Label>
            
            {!isEditing ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Save Widget to Enable Crawling</h4>
                    <p className="text-sm text-gray-600">
                      Website crawling will be available after creating the widget.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
            
            {isEditing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="crawlUrl">Base URL</Label>
                  <Input
                    id="crawlUrl"
                    type="url"
                    value={crawlUrl}
                    onChange={(e) => setCrawlUrl(e.target.value)}
                    placeholder="https://example.com"
                    disabled={crawlStatus === 'crawling' || crawlStarting}
                  />
                  <p className="text-sm text-gray-600">
                    Enter only the base domain. Up to 25 pages will be crawled automatically.
                  </p>
                  
                  {/* Crawl Status */}
                  {(crawlStatus || crawlStarting) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Crawl Status: {
                              crawlStarting ? (
                                <>
                                  <span className="text-blue-600">Starting...</span>
                                  <span className="ml-2 inline-block animate-spin">⟳</span>
                                </>
                              ) : crawlStatus === 'crawling' ? (
                                <>
                                  <span className="text-blue-600">In Progress</span>
                                  <span className="ml-2 inline-block animate-spin">⟳</span>
                                </>
                              ) : crawlStatus === 'processing' ? (
                                <>
                                  <span className="text-blue-600">Processing Results</span>
                                  <span className="ml-2 inline-block animate-spin">⟳</span>
                                </>
                              ) : crawlStatus === 'completed' ? (
                                <span className="text-green-600">Completed</span>
                              ) : crawlStatus === 'failed' ? (
                                <span className="text-red-600">Failed</span>
                              ) : (
                                crawlStatus
                              )
                            }
                          </p>
                          {widget?.lastCrawlAt && (
                            <p className="text-xs text-gray-500">
                              Last crawled: {new Date(widget.lastCrawlAt).toLocaleString()}
                            </p>
                          )}
                          {crawlPageCount > 0 && (
                            <p className="text-xs text-gray-500">
                              Pages indexed: {crawlPageCount} / 25 max
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {(crawlStatus === 'completed' || crawlStatus === 'failed') && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleRecrawl}
                              disabled={crawling || !crawlUrl}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              Re-crawl
                            </Button>
                          )}
                          {(crawlStatus === 'crawling' || crawlStatus === 'processing') && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRefreshCrawlStatus}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh Status
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleResetCrawl}
                                disabled={crawling}
                                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reset
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Debug View for Crawled Files */}
                  {crawlStatus === 'completed' && (
                    <div className="mt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCrawlDebug(!showCrawlDebug)}
                        className="text-gray-600 hover:text-gray-800"
                      >
                        <Info className="w-4 h-4 mr-1" />
                        {showCrawlDebug ? 'Hide' : 'Show'} Debug Info
                      </Button>
                      
                      {showCrawlDebug && (
                        <div className="mt-4 space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Crawled Files in R2</h4>
                            <div className="space-y-2">
                              {existingFiles
                                .filter(f => f.filename.endsWith('.crawl.md'))
                                .map(file => (
                                  <div key={file.id} className="text-sm text-gray-600">
                                    <div className="font-mono">{file.filename}</div>
                                    <div className="text-xs text-gray-500">
                                      Size: {formatFileSize(file.fileSize)} | Created: {new Date(file.createdAt).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                            </div>
                            
                            <div className="mt-4">
                              <h5 className="text-sm font-medium text-gray-700 mb-1">Page Files</h5>
                              <p className="text-xs text-gray-500 mb-2">
                                Individual pages are stored as separate files but not shown in the main file list.
                              </p>
                              <p className="text-sm text-gray-600">
                                Total pages crawled: {crawlPageCount}
                              </p>
                            </div>
                            
                            <div className="mt-4 flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleRefreshEmbeddings}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <RefreshCw className="w-4 h-4 mr-1" />
                                Refresh Embeddings
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex gap-3">
                              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-yellow-900">Debug Information</h4>
                                <p className="text-sm text-yellow-800">
                                  Crawled content is chunked into ~{CHUNK_CONFIG.DEFAULT_CHUNK_SIZE} word segments with {CHUNK_CONFIG.OVERLAP_SIZE} word overlap.
                                </p>
                                <p className="text-sm text-yellow-800">
                                  Widget ID: <code className="font-mono text-xs bg-yellow-100 px-1 py-0.5 rounded">{widget?.id}</code>
                                </p>
                                <p className="text-sm text-yellow-800">
                                  Embeddings count: {widget?.embeddingsCount || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-blue-900">Crawl Website Content</h4>
                      <p className="text-sm text-blue-800">
                        Enter a base URL to automatically crawl and index pages from that website.
                      </p>
                      <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-2">
                        <li>Only the base domain will be crawled (e.g., websyte.ai)</li>
                        <li>Crawler will discover and process accessible pages</li>
                        <li>Content will be converted to markdown and indexed</li>
                        <li>One URL per widget allowed</li>
                        <li><strong>Maximum 25 pages per crawl</strong></li>
                        <li>Default depth of 2 levels</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Upload Files (optional)</Label>
            
            {!isEditing ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Save Widget to Enable File Uploads</h4>
                    <p className="text-sm text-gray-600">
                      File upload will be available after creating the widget.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Supported: TXT, PDF, DOC, DOCX, MD
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.pdf,.doc,.docx,.md,text/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* File Naming Tips */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">File Naming Best Practices</h4>
                  <p className="text-sm text-blue-800">
                    For optimal search results, use descriptive file names that indicate content:
                  </p>
                  <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-2">
                    <li>Use descriptive names (e.g., "product-specifications-2024.pdf" instead of "doc1.pdf")</li>
                    <li>Include dates for time-sensitive content (e.g., "pricing-guide-jan-2024.pdf")</li>
                    <li>Group related content with prefixes (e.g., "faq-billing.txt", "faq-shipping.txt")</li>
                    <li>Use hyphens or underscores for readability instead of spaces</li>
                    <li>Avoid special characters that may be stripped during processing</li>
                  </ul>
                  <p className="text-xs text-blue-700 italic">
                    Files are chunked into ~{CHUNK_CONFIG.DEFAULT_CHUNK_SIZE} word segments for vector search, with descriptive names helping identify relevant content sources.
                  </p>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">New Files to Upload:</h4>
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {/* Existing Files (for editing) */}
          {isEditing && existingFiles.length > 0 && (
            <div className="space-y-4">
              <Label>Existing Files</Label>
              <div className="space-y-2">
                {existingFiles.map((file) => {
                  // Check if this is a crawl file
                  const isCrawlFile = file.filename.includes('.crawl.');
                  const isCrawlPlaceholder = file.filename.endsWith('.crawl.md');
                  
                  return (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {isCrawlFile ? (
                          <Globe className="w-4 h-4 text-blue-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-gray-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {isCrawlPlaceholder ? (
                              <>Website Crawl Summary</>
                            ) : isCrawlFile ? (
                              <>Crawled Page: {file.filename.replace(/^[^.]+\.crawl\.page-\d+\./, '').replace('.md', '')}</>
                            ) : (
                              file.filename
                            )}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.fileSize)} • {isCrawlFile ? 'Web Page' : file.fileType}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-gray-500">
                          {new Date(file.createdAt).toLocaleDateString()}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExistingFile(file.id)}
                          disabled={deletingFileId === file.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingFileId === file.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Embed Code Section - Only show for existing widgets */}
          {widget?.id && (
            <div className="pt-6 border-t border-gray-200">
              <EmbedCodeGenerator
                widgetId={widget.id}
                isPublic={isPublic}
                onTogglePublic={toggleWidgetPublic}
              />
            </div>
          )}

          {/* Recommendations Section - Only show for existing widgets with content */}
          {widget?.id && ((widget.embeddingsCount > 0) || (widget.crawlPageCount > 0)) && (
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Smart Recommendations</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    AI-generated conversation starters based on your widget content
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateRecommendations}
                  disabled={generatingRecommendations}
                >
                  {generatingRecommendations ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Regenerate
                    </>
                  )}
                </Button>
              </div>

              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                    >
                      <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-yellow-900">No Recommendations Yet</h4>
                      <p className="text-sm text-yellow-800">
                        Click "Regenerate" to create AI-powered conversation starters based on your widget content.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-6">
            <Button type="submit" disabled={loading || !name.trim() || uploadingFiles.size > 0}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : uploadingFiles.size > 0 ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading files...
                </>
              ) : (
                isEditing ? 'Update Widget' : 'Create Widget'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}