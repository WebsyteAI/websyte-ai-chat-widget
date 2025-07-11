import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { toast } from '../../lib/use-toast';
import { 
  useWidgetForm, 
  useFileManagement, 
  useCrawlManagement, 
  useWidgetAPI 
} from './hooks';
import { BasicInfoTab, ContentTab, SettingsTab } from './components';
import type { WidgetFormProps } from './types';

export function WidgetForm({ 
  widget, 
  onSubmit, 
  onCancel, 
  onDelete, 
  onWidgetUpdated, 
  loading = false 
}: WidgetFormProps) {
  // Form state management
  const formState = useWidgetForm(widget);
  const {
    name,
    description,
    url,
    logoUrl,
    files,
    dragActive,
    isEditing,
    existingFiles,
    isPublic,
    crawlUrl,
    crawling,
    crawlStatus,
    crawlPageCount,
    crawlStarting,
    workflowId,
    uploadingFiles,
    generatingRecommendations,
    recommendations,
    showCrawlDebug,
    links,
    generatingLinks,
    deletingFileId,
    updateWidgetFormField,
    addFiles,
    removeFile,
    setDragActive,
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
    setGeneratingLinks
  } = formState;

  // File management
  const fileManagement = useFileManagement(
    widget,
    existingFiles,
    setExistingFiles,
    setDeletingFileId,
    uploadingFiles,
    setUploadingFiles,
    addFiles,
    removeFile,
    setDragActive
  );

  // Crawl management
  const crawlManagement = useCrawlManagement(
    widget,
    crawlUrl,
    setCrawlUrl,
    crawlStatus,
    setCrawlStatus,
    crawlPageCount,
    setCrawlPageCount,
    crawlStarting,
    setCrawlStarting,
    workflowId,
    setWorkflowId,
    setCrawling,
    onWidgetUpdated
  );

  // API operations
  const api = useWidgetAPI(widget, onWidgetUpdated);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a widget name');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('url', url);
    formData.append('logoUrl', logoUrl);
    
    // Append files
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save widget. Please try again.');
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
          Configure your AI chat widget with knowledge base and appearance settings
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <BasicInfoTab
              name={name}
              description={description}
              url={url}
              logoUrl={logoUrl}
              updateField={updateWidgetFormField}
            />
            
            <ContentTab
              files={files}
              existingFiles={existingFiles}
              deletingFileId={deletingFileId}
              uploadingFiles={uploadingFiles}
              dragActive={dragActive}
              fileInputRef={fileManagement.fileInputRef}
              handleDrag={fileManagement.handleDrag}
              handleDrop={fileManagement.handleDrop}
              handleFileSelect={fileManagement.handleFileSelect}
              formatFileSize={fileManagement.formatFileSize}
              deleteExistingFile={fileManagement.deleteExistingFile}
              downloadFile={fileManagement.downloadFile}
              removeFile={removeFile}
              crawlUrl={crawlUrl}
              setCrawlUrl={setCrawlUrl}
              crawlStatus={crawlStatus}
              crawlPageCount={crawlPageCount}
              crawling={crawling}
              crawlStarting={crawlStarting}
              showCrawlDebug={showCrawlDebug}
              workflowId={workflowId}
              isEditing={isEditing}
              setShowCrawlDebug={setShowCrawlDebug}
              handleStartCrawl={crawlManagement.handleStartCrawl}
              handleRefreshCrawl={crawlManagement.handleRefreshCrawl}
              handleResetCrawl={crawlManagement.handleResetCrawl}
              handleRefreshEmbeddings={api.handleRefreshEmbeddings}
            />
            
            <SettingsTab
              widget={widget}
              isPublic={isPublic}
              setIsPublic={setIsPublic}
              recommendations={recommendations}
              links={links}
              generatingRecommendations={generatingRecommendations}
              generatingLinks={generatingLinks}
              isEditing={isEditing}
              handleToggleVisibility={api.handleToggleVisibility}
              generateRecommendations={() => api.generateRecommendations(setGeneratingRecommendations, setRecommendations)}
              regenerateLinks={() => api.regenerateLinks(setGeneratingLinks, setLinks)}
            />
          </Tabs>
          
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || crawling}
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Widget'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}