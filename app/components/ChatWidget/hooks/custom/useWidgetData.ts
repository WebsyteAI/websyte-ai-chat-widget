import { useEffect, useState } from 'react';
import { createLogger } from '../../../lib/logger';
import type { Recommendation, WidgetLink } from '../../types';

const logger = createLogger('useWidgetData');

interface UseWidgetDataProps {
  baseUrl: string;
  widgetId?: string;
  widgetName?: string;
  propRecommendations?: Recommendation[];
}

export function useWidgetData({
  baseUrl,
  widgetId,
  widgetName,
  propRecommendations
}: UseWidgetDataProps) {
  const [fetchedWidgetName, setFetchedWidgetName] = useState<string | null>(null);
  const [fetchedLogoUrl, setFetchedLogoUrl] = useState<string | null>(null);
  const [widgetLinks, setWidgetLinks] = useState<WidgetLink[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(propRecommendations || []);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  // Fetch widget info if widgetId is provided
  useEffect(() => {
    if (!widgetId) return;

    const fetchWidgetInfo = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/widgets/${widgetId}/public`);
        if (response.ok) {
          const data = await response.json();
          const widget = data.widget;
          
          setFetchedWidgetName(widget.name || null);
          setFetchedLogoUrl(widget.logoUrl || null);
          setWidgetLinks(widget.links || []);
          
          logger.info({ 
            widgetId, 
            name: widget.name,
            linksCount: widget.links?.length || 0 
          }, 'Widget info fetched');
        }
      } catch (error) {
        logger.error({ err: error, widgetId }, 'Failed to fetch widget info');
      }
    };

    fetchWidgetInfo();
  }, [widgetId, baseUrl]);

  // Fetch recommendations if not provided and widgetId exists
  useEffect(() => {
    if (!widgetId || propRecommendations) return;

    const fetchRecommendations = async () => {
      setIsLoadingRecommendations(true);
      try {
        const response = await fetch(`${baseUrl}/api/widgets/${widgetId}/recommendations`);
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
          logger.info({ 
            widgetId, 
            count: data.recommendations?.length || 0 
          }, 'Recommendations fetched');
        }
      } catch (error) {
        logger.error({ err: error, widgetId }, 'Failed to fetch recommendations');
      } finally {
        setIsLoadingRecommendations(false);
      }
    };

    fetchRecommendations();
  }, [widgetId, baseUrl, propRecommendations]);

  return {
    fetchedWidgetName,
    fetchedLogoUrl,
    widgetLinks,
    recommendations,
    isLoadingRecommendations,
    displayName: fetchedWidgetName || widgetName
  };
}