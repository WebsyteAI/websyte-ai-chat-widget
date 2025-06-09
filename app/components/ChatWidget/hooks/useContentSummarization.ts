import { useState, useCallback } from 'react';

interface Summaries {
  short: string;
  medium: string;
}

type ContentMode = 'original' | 'short' | 'medium';

export interface UseContentSummarizationProps {
  baseUrl: string;
  extractPageContent: () => Promise<{ content: string; url: string; title: string }>;
}

export interface UseContentSummarizationReturn {
  summaries: Summaries | null;
  isLoadingSummaries: boolean;
  currentContentMode: ContentMode;
  originalContent: string;
  targetElement: Element | null;
  mainContentElement: Element | null;
  setOriginalContent: (content: string) => void;
  setTargetElement: (element: Element | null) => void;
  setMainContentElement: (element: Element | null) => void;
  handleContentModeChange: (mode: ContentMode) => void;
  loadSummaries: () => Promise<void>;
}

export function useContentSummarization({ 
  baseUrl, 
  extractPageContent 
}: UseContentSummarizationProps): UseContentSummarizationReturn {
  const [summaries, setSummaries] = useState<Summaries | null>(null);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [currentContentMode, setCurrentContentMode] = useState<ContentMode>('original');
  const [originalContent, setOriginalContent] = useState<string>("");
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [mainContentElement, setMainContentElement] = useState<Element | null>(null);

  const replaceWithSummary = useCallback((summaryContent: string) => {
    console.log('Replacing content with summary:', summaryContent.substring(0, 100) + '...');
    
    if (!mainContentElement) {
      console.error('No main content element available for content replacement');
      return;
    }
    
    // Store current classes and attributes to preserve them
    const currentClasses = mainContentElement.className;
    const currentId = mainContentElement.id;
    const currentStyles = (mainContentElement as HTMLElement).style.cssText;
    
    // Replace innerHTML directly with the summary content
    mainContentElement.innerHTML = summaryContent;
    
    // Restore classes and attributes in case they were lost
    mainContentElement.className = currentClasses;
    mainContentElement.id = currentId;
    (mainContentElement as HTMLElement).style.cssText = currentStyles;
    
    console.log('Main content replaced successfully with summary HTML');
  }, [mainContentElement]);

  const restoreOriginalContent = useCallback(() => {
    if (mainContentElement && originalContent) {
      mainContentElement.innerHTML = originalContent;
      console.log('Original main content restored');
    }
  }, [mainContentElement, originalContent]);

  const handleContentModeChange = useCallback((mode: ContentMode) => {
    console.log('Content mode change requested:', mode);
    console.log('Current mode:', currentContentMode);
    console.log('Available summaries:', summaries);
    
    if (mode === currentContentMode) return;

    setCurrentContentMode(mode);

    switch (mode) {
      case 'original':
        console.log('Restoring original content');
        restoreOriginalContent();
        break;
      case 'short':
        if (summaries?.short) {
          console.log('Replacing with short summary:', summaries.short.substring(0, 100) + '...');
          replaceWithSummary(summaries.short);
        } else {
          console.warn('Short summary not available');
        }
        break;
      case 'medium':
        if (summaries?.medium) {
          console.log('Replacing with medium summary:', summaries.medium.substring(0, 100) + '...');
          replaceWithSummary(summaries.medium);
        } else {
          console.warn('Medium summary not available');
        }
        break;
    }
  }, [currentContentMode, summaries, restoreOriginalContent, replaceWithSummary]);

  const loadSummaries = useCallback(async () => {
    setIsLoadingSummaries(true);
    
    try {
      const pageContent = await extractPageContent();
      
      const response = await fetch(`${baseUrl}/api/summaries`, {
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
        const summariesData = await response.json() as { short?: string; medium?: string };
        console.log('Summaries API response:', summariesData);
        
        if (summariesData.short && summariesData.medium) {
          console.log('Setting summaries:', {
            short: summariesData.short.substring(0, 100) + '...',
            medium: summariesData.medium.substring(0, 100) + '...'
          });
          setSummaries({
            short: summariesData.short,
            medium: summariesData.medium
          });
        } else {
          console.warn('Incomplete summaries data:', summariesData);
        }
      } else {
        console.warn(`Summaries API error: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to load summaries:", error);
    } finally {
      setIsLoadingSummaries(false);
    }
  }, [baseUrl, extractPageContent]);

  return {
    summaries,
    isLoadingSummaries,
    currentContentMode,
    originalContent,
    targetElement,
    mainContentElement,
    setOriginalContent,
    setTargetElement,
    setMainContentElement,
    handleContentModeChange,
    loadSummaries,
  };
}