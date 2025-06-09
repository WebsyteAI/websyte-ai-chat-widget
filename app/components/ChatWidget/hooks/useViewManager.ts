import { useState, useEffect, useCallback } from 'react';

export type ViewType = "main" | "chat";
export type ContentType = "action" | "audio";

export interface UseViewManagerReturn {
  currentView: ViewType;
  hasRendered: boolean;
  isTransitioning: boolean;
  currentContent: ContentType;
  contentFadeClass: string;
  setCurrentView: (view: ViewType) => void;
  setHasRendered: (rendered: boolean) => void;
  startAudioMode: () => void;
  exitAudioMode: () => void;
}

export function useViewManager(): UseViewManagerReturn {
  const [currentView, setCurrentView] = useState<ViewType>("main");
  const [hasRendered, setHasRendered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentContent, setCurrentContent] = useState<ContentType>("action");
  const [contentFadeClass, setContentFadeClass] = useState("");

  // Trigger slide-in animation after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasRendered(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const startAudioMode = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setContentFadeClass("animate-fade-out");
    
    // After fade out, switch content and container size simultaneously
    setTimeout(() => {
      setCurrentContent("audio");
      
      // Start fade in slightly after container starts resizing for smoother feel
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 100);
    }, 200);
  }, [isTransitioning]);

  const exitAudioMode = useCallback(() => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setContentFadeClass("animate-fade-out");
    
    // After fade out, switch content and container size simultaneously
    setTimeout(() => {
      setCurrentContent("action");
      
      // Start fade in slightly after container starts resizing for smoother feel
      setTimeout(() => {
        setContentFadeClass("animate-fade-in");
        
        setTimeout(() => {
          setIsTransitioning(false);
          setContentFadeClass("");
        }, 200);
      }, 180);
    }, 200);
  }, [isTransitioning]);

  return {
    currentView,
    hasRendered,
    isTransitioning,
    currentContent,
    contentFadeClass,
    setCurrentView,
    setHasRendered,
    startAudioMode,
    exitAudioMode,
  };
}