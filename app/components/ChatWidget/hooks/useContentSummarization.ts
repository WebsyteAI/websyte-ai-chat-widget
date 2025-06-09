import { useState } from "react";
import type { Summaries, ContentMode } from "../types";

interface UseContentSummarizationProps {
  baseUrl: string;
  extractPageContent: () => Promise<any>;
}

export function useContentSummarization({ baseUrl, extractPageContent }: UseContentSummarizationProps) {
  const [summaries, setSummaries] = useState<Summaries | null>(null);
  const [isLoadingSummaries, setIsLoadingSummaries] = useState(false);
  const [currentContentMode, setCurrentContentMode] = useState<ContentMode>('original');
  const [originalContent, setOriginalContent] = useState<string>("");
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [mainContentElement, setMainContentElement] = useState<Element | null>(null);

  const replaceWithSummary = (summaryContent: string) => {
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
  };

  const restoreOriginalContent = () => {
    if (mainContentElement && originalContent) {
      mainContentElement.innerHTML = originalContent;
      console.log('Original main content restored');
    }
  };

  const handleContentModeChange = (mode: ContentMode) => {
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
  };

  const loadSummaries = (summariesData: Summaries) => {
    setSummaries(summariesData);
  };

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
    setIsLoadingSummaries,
  };
}