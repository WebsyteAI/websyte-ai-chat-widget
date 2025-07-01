import { useEffect } from 'react';
import { Link } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  ExternalLink,
  Globe 
} from 'lucide-react';
import { useWidgetStore, type Widget } from '../../stores';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination';


interface WidgetListProps {
  onCreateWidget: () => void;
  onEditWidget: (widget: Widget) => void;
  onDeleteWidget: (widget: Widget) => void;
}

export function WidgetList({ onCreateWidget, onEditWidget, onDeleteWidget }: WidgetListProps) {
  const { 
    widgets, 
    loading, 
    error, 
    fetchWidgets, 
    clearError,
    currentPage,
    pageSize,
    totalWidgets,
    getTotalPages,
    setPage 
  } = useWidgetStore();


  useEffect(() => {
    fetchWidgets(currentPage, pageSize);
  }, [fetchWidgets, currentPage, pageSize]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => { clearError(); fetchWidgets(); }} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Widgets</h2>
          <p className="text-gray-600">
            Create and manage your custom AI widgets with vector search
          </p>
        </div>
        <Button onClick={onCreateWidget} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Widget
        </Button>
      </div>

      {/* Widget Grid */}
      {widgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No widgets yet
            </h3>
            <p className="text-gray-600 mb-4">
              Create your first widget to get started with custom AI content and vector search.
            </p>
            <Button onClick={onCreateWidget}>
              Create Your First Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((widget) => (
            <Card key={widget.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">
                      {widget.name}
                    </CardTitle>
                    {widget.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {widget.description}
                      </CardDescription>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditWidget(widget)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteWidget(widget)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* URL if present */}
                {widget.url && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <ExternalLink className="w-4 h-4" />
                    <span className="truncate">{widget.url}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{widget.files.length} files</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Search className="w-4 h-4" />
                    <span>{widget.embeddingsCount} chunks</span>
                  </div>
                </div>

                {/* Files */}
                {widget.files.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Content:</h4>
                    <div className="space-y-1">
                      {(() => {
                        // Separate crawled files from uploaded files
                        const crawledFiles = widget.files.filter(f => f.filename.includes('.crawl.'));
                        const pageFiles = widget.files.filter(f => f.filename.startsWith('page-') && f.filename.endsWith('.md'));
                        const uploadedFiles = widget.files.filter(f => !f.filename.includes('.crawl.') && !(f.filename.startsWith('page-') && f.filename.endsWith('.md')));
                        
                        // Group crawled pages
                        if (crawledFiles.length > 0 || pageFiles.length > 0) {
                          const totalCrawledSize = [...crawledFiles, ...pageFiles].reduce((sum, f) => sum + f.fileSize, 0);
                          const pageCount = pageFiles.length;
                          
                          return (
                            <>
                              <div className="flex items-center justify-between text-xs bg-blue-50 rounded p-2">
                                <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-blue-500" />
                                  <span className="font-medium">Website Crawl</span>
                                </div>
                                <span className="text-gray-600">
                                  {pageCount} pages • {formatFileSize(totalCrawledSize)}
                                </span>
                              </div>
                              
                              {/* Show uploaded files separately */}
                              {uploadedFiles.slice(0, 2).map((file) => (
                                <div key={file.id} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span className="truncate flex-1">{file.filename}</span>
                                  </div>
                                  <span className="text-gray-500">
                                    {formatFileSize(file.fileSize)}
                                  </span>
                                </div>
                              ))}
                              {uploadedFiles.length > 2 && (
                                <p className="text-xs text-gray-500">
                                  +{uploadedFiles.length - 2} more files
                                </p>
                              )}
                            </>
                          );
                        }
                        
                        // No crawled files, show regular files
                        return (
                          <>
                            {widget.files.slice(0, 3).map((file) => (
                              <div key={file.id} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="truncate flex-1">{file.filename}</span>
                                </div>
                                <span className="text-gray-500">
                                  {formatFileSize(file.fileSize)}
                                </span>
                              </div>
                            ))}
                            {widget.files.length > 3 && (
                              <p className="text-xs text-gray-500">
                                +{widget.files.length - 3} more files
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* Cache Status */}
                <div className="flex items-center justify-between">
                  <Badge variant={widget.cacheEnabled ? "default" : "secondary"}>
                    {widget.cacheEnabled ? "Cache Enabled" : "Cache Disabled"}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(widget.updatedAt)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalWidgets > pageSize && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 || 
                  page === getTotalPages() || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setPage(page)}
                        isActive={page === currentPage}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                
                // Show ellipsis
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <PaginationItem key={page}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                
                return null;
              })}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setPage(Math.min(getTotalPages(), currentPage + 1))}
                  className={currentPage === getTotalPages() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
          <div className="text-center mt-4 text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalWidgets)} of {totalWidgets} widgets
          </div>
        </div>
      )}
    </div>
  );
}