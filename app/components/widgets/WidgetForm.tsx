import { useRef, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, X, FileText, Trash2, Copy, Check, Code, Lock, ArrowLeft } from 'lucide-react';
import { useUIStore, type Widget } from '../../stores';


interface WidgetFormProps {
  widget?: Widget;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

export function WidgetForm({ widget, onSubmit, onCancel, onDelete, loading = false }: WidgetFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  const [existingFiles, setExistingFiles] = useState(widget?.files || []);
  const [isPublic, setIsPublic] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
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
    } else {
      resetWidgetForm();
      setExistingFiles([]);
      setIsPublic(false);
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

  const handleDeleteExistingFile = async (fileId: number) => {
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
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
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

  const copyEmbedCode = async () => {
    const embedCode = generateEmbedCode();
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } catch (err) {
      console.error('Failed to copy embed code:', err);
    }
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
    } catch (error) {
      console.error('Error updating widget visibility:', error);
      alert('Failed to update widget visibility. Please try again.');
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
      } catch (error) {
        console.error('Error uploading files:', error);
        alert('Some files failed to upload. Please try again.');
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

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Upload Files (optional)</Label>
            
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
          </div>

          {/* Existing Files (for editing) */}
          {isEditing && existingFiles.length > 0 && (
            <div className="space-y-4">
              <Label>Existing Files</Label>
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.filename}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.fileSize)} • {file.fileType}
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
                ))}
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
                    <div className="flex items-center justify-between">
                      <Label>Embed Code</Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={copyEmbedCode}
                        className="flex items-center gap-2"
                      >
                        {copiedEmbed ? (
                          <>
                            <Check className="w-4 h-4 text-green-600" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-sm overflow-x-auto">
                      <code>{generateEmbedCode()}</code>
                    </pre>
                    <p className="text-xs text-gray-600">
                      Paste this code into your website's HTML where you want the widget to appear.
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