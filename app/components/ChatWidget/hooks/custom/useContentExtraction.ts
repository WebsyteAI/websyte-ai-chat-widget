import { useEffect, useState } from 'react';
import { ContentExtractor } from '../../../lib/content-extractor';
import { createLogger } from '../../../lib/logger';

const logger = createLogger('useContentExtraction');

interface UseContentExtractionProps {
  isTargetedInjection: boolean;
  contentSelector?: string;
  enableSmartSelector?: boolean;
  setOriginalContent: (content: string) => void;
  setTargetElement: (element: Element | null) => void;
  setMainContentElement: (element: Element | null) => void;
  loadSummaries: (content: string) => void;
}

export function useContentExtraction({
  isTargetedInjection,
  contentSelector,
  enableSmartSelector,
  setOriginalContent,
  setTargetElement,
  setMainContentElement,
  loadSummaries
}: UseContentExtractionProps) {
  const [contentLoading, setContentLoading] = useState(false);

  // Load page content on mount
  useEffect(() => {
    const loadPageContent = async () => {
      setContentLoading(true);
      try {
        const { content, targetElement, mainContentElement } = ContentExtractor.extractPageContent({
          contentSelector,
          enableSmartSelector,
          isTargetedInjection
        });
        
        setOriginalContent(content);
        setTargetElement(targetElement);
        setMainContentElement(mainContentElement);
        
        logger.info({ 
          contentLength: content.length,
          hasTarget: !!targetElement,
          hasMain: !!mainContentElement,
          selector: contentSelector
        }, 'Page content extracted');
        
        // Start loading summaries if we have content
        if (content) {
          loadSummaries(content);
        }
      } catch (error) {
        logger.error({ err: error }, 'Failed to extract page content');
        setOriginalContent('');
      } finally {
        setContentLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadPageContent, 100);
    return () => clearTimeout(timer);
  }, [contentSelector, enableSmartSelector, isTargetedInjection, setOriginalContent, setTargetElement, setMainContentElement, loadSummaries]);

  // Handle smart selector button placement
  useEffect(() => {
    if (!enableSmartSelector || isTargetedInjection) return;

    const findAndPlaceButton = () => {
      try {
        const smartElement = ContentExtractor.findSmartButtonLocation();
        if (smartElement) {
          logger.info({ 
            element: smartElement.tagName,
            id: smartElement.id,
            className: smartElement.className 
          }, 'Smart button location found');
          
          // Create and inject button
          const button = document.createElement('div');
          button.id = 'websyte-smart-chat-button';
          button.className = 'websyte-smart-chat-button';
          button.innerHTML = `
            <button class="websyte-chat-trigger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              Ask AI about this content
            </button>
          `;
          
          // Insert after the smart element
          smartElement.parentNode?.insertBefore(button, smartElement.nextSibling);
          
          // Add click handler
          button.addEventListener('click', () => {
            const event = new CustomEvent('websyte-chat-open', { detail: { source: 'smart-button' } });
            window.dispatchEvent(event);
          });
        }
      } catch (error) {
        logger.error({ err: error }, 'Error placing smart button');
      }
    };

    // Try to find button location after a delay
    const timer = setTimeout(findAndPlaceButton, 500);
    return () => {
      clearTimeout(timer);
      // Clean up button on unmount
      const button = document.getElementById('websyte-smart-chat-button');
      if (button) {
        button.remove();
      }
    };
  }, [enableSmartSelector, isTargetedInjection]);

  return {
    contentLoading
  };
}