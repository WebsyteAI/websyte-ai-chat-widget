import { useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useUIStore, type Widget } from '../../stores';


interface WidgetFormProps {
  widget?: Widget;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export function WidgetForm({ widget, onSubmit, onCancel, loading = false }: WidgetFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    } else {
      resetWidgetForm();
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



  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', name);
    if (description) formData.append('description', description);
    if (url) formData.append('url', url);
    if (content) formData.append('content', content);
    
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    await onSubmit(formData);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
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
          {!isEditing && (
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
                  <h4 className="font-medium text-gray-700">Selected Files:</h4>
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
          )}

          {/* Existing Files (for editing) */}
          {isEditing && widget && widget.files.length > 0 && (
            <div className="space-y-4">
              <Label>Existing Files</Label>
              <div className="space-y-2">
                {widget.files.map((file) => (
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
                    <div className="text-xs text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  To add or remove files, please create a new widget or contact support.
                </p>
              </div>
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