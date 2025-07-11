import { useState, useEffect, useRef } from 'react';

interface UseWidgetUIStateProps {
  notifyChatStarted?: () => void;
  notifyChatClosed?: () => void;
}

export function useWidgetUIState({
  notifyChatStarted,
  notifyChatClosed
}: UseWidgetUIStateProps = {}) {
  const [currentView, setCurrentView] = useState<"main" | "chat">("main");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showSummaryDropdown, setShowSummaryDropdown] = useState(false);
  const [currentContent, setCurrentContent] = useState<"action" | "audio">("action");
  const [contentFadeClass, setContentFadeClass] = useState("");
  const [hasRendered, setHasRendered] = useState(false);
  const [placeholder, setPlaceholder] = useState("Ask me about this content");
  
  const dropdownRef = useRef<HTMLDivElement>(null!);

  // Handle view transitions
  const handleViewChange = (newView: "main" | "chat") => {
    if (newView === currentView) return;
    
    setIsTransitioning(true);
    
    if (newView === "chat") {
      notifyChatStarted?.();
    } else {
      notifyChatClosed?.();
    }
    
    setTimeout(() => {
      setCurrentView(newView);
      setIsTransitioning(false);
    }, 300);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentView === 'chat') {
        handleViewChange('main');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // Handle dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSummaryDropdown(false);
      }
    };

    if (showSummaryDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSummaryDropdown]);

  // Set rendered flag
  useEffect(() => {
    setHasRendered(true);
  }, []);

  // Update placeholder based on content
  useEffect(() => {
    if (currentContent === 'audio') {
      setPlaceholder("Ask about the audio content");
    } else {
      setPlaceholder("Ask me about this content");
    }
  }, [currentContent]);

  return {
    currentView,
    setCurrentView: handleViewChange,
    isTransitioning,
    setIsTransitioning,
    showSummaryDropdown,
    setShowSummaryDropdown,
    currentContent,
    setCurrentContent,
    contentFadeClass,
    setContentFadeClass,
    hasRendered,
    placeholder,
    dropdownRef
  };
}