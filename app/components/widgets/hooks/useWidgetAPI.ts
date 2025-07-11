import { toast } from '../../../lib/use-toast';
import type { Widget, Recommendation, WidgetLink } from '../types';

export function useWidgetAPI(
  widget: Widget | undefined,
  onWidgetUpdated?: (widget: Widget) => void
) {
  const handleToggleVisibility = async (isPublic: boolean) => {
    if (!widget?.id) return;

    try {
      const response = await fetch(`/api/widgets/${widget.id}/visibility`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isPublic })
      });

      if (!response.ok) {
        throw new Error('Failed to update widget visibility');
      }

      const { widget: updatedWidget } = await response.json() as { widget: Widget };
      
      toast.success(`Widget is now ${isPublic ? 'public' : 'private'}`);
      onWidgetUpdated?.(updatedWidget);
    } catch (error) {
      console.error('Error updating widget visibility:', error);
      toast.error('Failed to update widget visibility');
    }
  };

  const handleRefreshEmbeddings = async () => {
    if (!widget?.id) return null;
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/embeddings/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to refresh embeddings');
      }

      const result = await response.json() as { embeddingsCreated: number };
      
      toast.success(`Embeddings refreshed successfully! Created ${result.embeddingsCreated} embeddings.`);
      
      // Fetch the updated widget
      const widgetResponse = await fetch(`/api/widgets/${widget.id}`, {
        credentials: 'include'
      });
      
      if (widgetResponse.ok) {
        const { widget: updatedWidget } = await widgetResponse.json() as { widget: Widget };
        onWidgetUpdated?.(updatedWidget);
      }
      
      return result;
    } catch (error) {
      console.error('Error refreshing embeddings:', error);
      toast.error('Failed to refresh embeddings');
      return null;
    }
  };

  const generateRecommendations = async (
    setGeneratingRecommendations: (generating: boolean) => void,
    setRecommendations: (recommendations: Recommendation[]) => void
  ) => {
    if (!widget?.id) return;
    
    setGeneratingRecommendations(true);
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/recommendations/generate`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const result = await response.json() as { success: boolean; recommendations: Recommendation[] };
      
      if (result.recommendations) {
        setRecommendations(result.recommendations);
        toast.success('Recommendations generated successfully');
        
        // Fetch the updated widget
        try {
          const widgetResponse = await fetch(`/api/widgets/${widget.id}`, {
            credentials: 'include'
          });
          
          if (widgetResponse.ok) {
            const { widget: updatedWidget } = await widgetResponse.json() as { widget: Widget };
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

  const regenerateLinks = async (
    setGeneratingLinks: (generating: boolean) => void,
    setLinks: (links: WidgetLink[]) => void
  ) => {
    if (!widget?.id) return;
    
    setGeneratingLinks(true);
    
    try {
      const response = await fetch(`/api/widgets/${widget.id}/links/regenerate`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate links');
      }

      const result = await response.json() as { success: boolean; links: WidgetLink[] };
      
      if (result.links) {
        setLinks(result.links);
        toast.success('Important links regenerated successfully');
        
        // Fetch the updated widget
        try {
          const widgetResponse = await fetch(`/api/widgets/${widget.id}`, {
            credentials: 'include'
          });
          
          if (widgetResponse.ok) {
            const { widget: updatedWidget } = await widgetResponse.json() as { widget: Widget };
            onWidgetUpdated?.(updatedWidget);
          }
        } catch (error) {
          console.error('Error fetching updated widget:', error);
          // Fallback to updating with just links
          if (onWidgetUpdated) {
            onWidgetUpdated({
              ...widget,
              links: result.links
            });
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating links:', error);
      toast.error('Failed to regenerate links. Please ensure your widget has crawled content.');
    } finally {
      setGeneratingLinks(false);
    }
  };

  return {
    handleToggleVisibility,
    handleRefreshEmbeddings,
    generateRecommendations,
    regenerateLinks
  };
}