import { useState, useEffect, useCallback } from 'react';
import { Recommendation } from '../types';

export interface UseRecommendationsProps {
  baseUrl: string;
  contentTarget: string;
  extractPageContent: () => Promise<{ content: string; url: string; title: string }>;
}

export interface UseRecommendationsReturn {
  recommendations: Recommendation[];
  isLoadingRecommendations: boolean;
  placeholder: string;
  loadRecommendations: () => Promise<void>;
}

export function useRecommendations({ 
  baseUrl, 
  contentTarget, 
  extractPageContent 
}: UseRecommendationsProps): UseRecommendationsReturn {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [placeholder, setPlaceholder] = useState("Ask me about this content");

  const loadRecommendations = useCallback(async () => {
    setIsLoadingRecommendations(true);
    
    try {
      const pageContent = await extractPageContent();
      
      const response = await fetch(`${baseUrl}/api/recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: pageContent.content,
          url: pageContent.url,
          title: pageContent.title,
        }),
      });

      if (response.ok) {
        const data = await response.json() as { 
          recommendations?: Recommendation[]; 
          placeholder?: string; 
        };
        setRecommendations(data.recommendations || []);
        setPlaceholder(data.placeholder || "Ask me about this content");
      } else {
        throw new Error(`Recommendations API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      // Leave empty if content extraction fails
      setRecommendations([]);
    } finally {
      setIsLoadingRecommendations(false);
    }
  }, [baseUrl, extractPageContent]);

  // Auto-load recommendations when dependencies change
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  return {
    recommendations,
    isLoadingRecommendations,
    placeholder,
    loadRecommendations,
  };
}