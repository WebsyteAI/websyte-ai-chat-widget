import { useState, useEffect, useCallback } from 'react';
import { ContentExtractor } from '../../../lib/content-extractor';

export interface UseTargetElementManagerProps {
  contentTarget: string;
  isTargetedInjection?: boolean;
}

export interface UseTargetElementManagerReturn {
  targetElement: Element | null;
  mainContentElement: Element | null;
  originalContent: string;
  setTargetElement: (element: Element | null) => void;
  setMainContentElement: (element: Element | null) => void;
  setOriginalContent: (content: string) => void;
  extractPageContent: () => Promise<{ content: string; url: string; title: string }>;
}

export function useTargetElementManager({ 
  contentTarget, 
  isTargetedInjection = false 
}: UseTargetElementManagerProps): UseTargetElementManagerReturn {
  const [targetElement, setTargetElement] = useState<Element | null>(null);
  const [mainContentElement, setMainContentElement] = useState<Element | null>(null);
  const [originalContent, setOriginalContent] = useState<string>("");

  const extractPageContent = useCallback(async (): Promise<{ content: string; url: string; title: string }> => {
    try {
      const pageContent = await ContentExtractor.extractPageContent(contentTarget);
      return pageContent;
    } catch (error) {
      console.warn('Failed to extract page content:', error);
      // Fallback to basic text extraction
      return {
        content: document.body.textContent || '',
        url: window.location.href,
        title: document.title || 'Untitled Page'
      };
    }
  }, [contentTarget]);

  const findTargetElement = useCallback(() => {
    const element = document.querySelector(contentTarget);
    if (element) {
      console.log('Target element found:', contentTarget);
      setTargetElement(element);
      
      if (isTargetedInjection) {
        setMainContentElement(element);
        setOriginalContent(element.innerHTML);
      }
    } else {
      console.warn('Target element not found:', contentTarget);
    }
  }, [contentTarget, isTargetedInjection]);

  const findMainContentElement = useCallback(() => {
    if (!isTargetedInjection) {
      // For non-targeted injection, find main content for summarization
      const mainSelectors = [
        'main',
        '[role="main"]',
        '.main-content',
        '#main-content',
        'article',
        '.content',
        '#content'
      ];
      
      for (const selector of mainSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log('Main content element found with selector:', selector);
          setMainContentElement(element);
          setOriginalContent(element.innerHTML);
          break;
        }
      }
    }
  }, [isTargetedInjection]);

  useEffect(() => {
    // Initial search
    findTargetElement();
    findMainContentElement();

    // Set up observer for dynamic content
    const observer = new MutationObserver(() => {
      if (!targetElement) {
        findTargetElement();
      }
      if (!mainContentElement) {
        findMainContentElement();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [findTargetElement, findMainContentElement, targetElement, mainContentElement]);

  return {
    targetElement,
    mainContentElement,
    originalContent,
    setTargetElement,
    setMainContentElement,
    setOriginalContent,
    extractPageContent,
  };
}