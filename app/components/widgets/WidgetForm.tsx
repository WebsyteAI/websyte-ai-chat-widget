import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, X, FileText, Trash2, Code, Lock, ArrowLeft, Info, ExternalLink, Copy, Check, Globe, RefreshCw } from 'lucide-react';
import { useUIStore, type Widget } from '../../stores';
import { ScriptCopyBtn } from '../ui/script-copy-btn';
import { toast } from '@/lib/use-toast';


interface WidgetFormProps {
  widget?: Widget;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function WidgetForm({ widget, onSubmit, onCancel, onDelete, loading = false }: WidgetFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null);
  const [existingFiles, setExistingFiles] = useState(widget?.files || []);
  const [isPublic, setIsPublic] = useState(false);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [crawlUrl, setCrawlUrl] = useState(widget?.crawlUrl || '');
  const [crawling, setCrawling] = useState(false);
  const [crawlStatus, setCrawlStatus] = useState(widget?.crawlStatus || null);
  const [crawlPageCount, setCrawlPageCount] = useState(widget?.crawlPageCount || 0);
  const crawlPollInterval = useRef<NodeJS.Timeout | null>(null);
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
    } else {
      resetWidgetForm();
      setExistingFiles([]);
      setIsPublic(false);
      setCrawlUrl('');
      setCrawlStatus(null);
      setCrawlPageCount(0);
    }
  }, [widget, updateWidgetFormField, resetWidgetForm]);
  
  // Poll for crawl status when crawling
  useEffect(() => {
    if (widget?.id && crawlStatus === 'crawling') {
      const pollStatus = async () => {
        try {
          const response = await fetch(`/api/widgets/${widget.id}/crawl/status`, {
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            setCrawlStatus(data.status);
            setCrawlPageCount(data.pageCount || 0);
            
            if (data.status === 'completed' || data.status === 'failed') {
              // Stop polling
              if (crawlPollInterval.current) {
                clearInterval(crawlPollInterval.current);
                crawlPollInterval.current = null;
              }
              
              // Refresh files if completed
              if (data.status === 'completed') {
                // Trigger a refresh of the widget data
                window.location.reload(); // Simple refresh for now
              }
            }
          }
        } catch (error) {
          console.error('Error polling crawl status:', error);
        }
      };
      
      // Poll immediately
      pollStatus();
      
      // Then poll every 5 seconds
      crawlPollInterval.current = setInterval(pollStatus, 5000);
      
      return () => {
        if (crawlPollInterval.current) {
          clearInterval(crawlPollInterval.current);
          crawlPollInterval.current = null;
        }
      };
    }
  }, [widget?.id, crawlStatus]);

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

  const generateEmbedCode = () => {
    if (!widget?.id) return '';
    
    const baseUrl = window.location.origin;
    const attributes = [
      `src="${baseUrl}/dist/widget.js"`,
      widget.id ? `data-widget-id="${widget.id}"` : '',
      'async'
    ].filter(Boolean);
    
    return `<script ${attributes.join(' ')}></script>`;
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

  const generateShareableUrl = () => {
    if (!widget?.id) return '';
    return `${window.location.origin}/share/w/${widget.id}`;
  };

  const copyShareableUrl = async () => {
    const url = generateShareableUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareUrlCopied(true);
      toast.success('Shareable URL copied to clipboard!');
      setTimeout(() => setShareUrlCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast.error('Failed to copy URL. Please try again.');
    }
  };

  const handleRecrawl = async () => {
    if (!widget?.id || !crawlUrl) return;
    
    setCrawling(true);
    try {
      const response = await fetch(`/api/widgets/${widget.id}/crawl`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ crawlUrl })
      });
      
      if (!response.ok) throw new Error('Failed to start crawl');
      
      toast.success('Website crawl started');
      // Could trigger status polling or refresh here
    } catch (error) {
      toast.error('Failed to start crawl');
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

    await onSubmit(formData);

    // For editing mode, handle file uploads separately after the main update
    if (isEditing && files.length > 0 && widget) {
      try {
        for (const file of files) {
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
        toast.success(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
      } catch (error) {
        console.error('Error uploading files:', error);
        toast.error('Some files failed to upload. Please try again.');
      }
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
            ) : (
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
                      <li>Apify will discover and process accessible pages</li>
                      <li>Content will be converted to markdown and indexed</li>
                      <li>One URL per widget allowed</li>
                      <li><strong>Maximum 25 pages per crawl</strong></li>
                      <li>Default depth of 2 levels</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="crawlUrl">Base URL</Label>
                <Input
                  id="crawlUrl"
                  type="url"
                  value={crawlUrl}
                  onChange={(e) => setCrawlUrl(e.target.value)}
                  placeholder="https://example.com"
                  disabled={crawlStatus === 'crawling'}
                />
                <p className="text-sm text-gray-600">
                  Enter only the base domain. Up to 25 pages will be crawled automatically.
                </p>
              </div>
            )}
            
            {/* Crawl Status for existing widgets */}
            {crawlStatus && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Crawl Status: {
                        crawlStatus === 'crawling' ? (
                          <>
                            <span className="text-blue-600">In Progress</span>
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
                  {crawlStatus === 'completed' && (
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
                </div>
              </div>
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
                    Files are chunked into ~2000 word segments for vector search, with descriptive names helping identify relevant content sources.
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
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Embed Widget</h3>
                  <p className="text-sm text-gray-600">
                    Copy the script tag below to embed this widget on your website
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Public</span>
                  <button
                    type="button"
                    onClick={toggleWidgetPublic}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isPublic ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPublic ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {isPublic ? (
                <div className="space-y-4">
                  {/* Widget Configuration */}

                  {/* Generated Embed Code */}
                  <div className="space-y-2">
                    <Label>Embed Code</Label>
                    <ScriptCopyBtn
                      code={generateEmbedCode()}
                      codeLanguage="html"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-600">
                      Paste this code into your website's HTML where you want the widget to appear.
                    </p>
                  </div>

                  {/* Shareable URL */}
                  <div className="space-y-2">
                    <Label>Shareable URL</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm font-mono text-gray-700">
                        {generateShareableUrl()}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={copyShareableUrl}
                        className="flex items-center gap-2"
                      >
                        {shareUrlCopied ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(generateShareableUrl(), '_blank')}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open
                      </Button>
                    </div>
                    <p className="text-xs text-gray-600">
                      Direct link to your widget that can be shared with anyone. Opens in full-screen chat mode.
                    </p>
                  </div>

                  {/* Usage Instructions */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Code className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Usage Instructions</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Widget will use your uploaded files and content as its knowledge base</li>
                          <li>• Visitors can chat with AI trained on your specific content</li>
                          <li>• No authentication required for public widgets</li>
                          <li>• Fully responsive and works on all devices</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2">Widget is currently private</p>
                  <p className="text-sm text-gray-500">
                    Enable public access to generate embed code for your website
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-6">
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
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