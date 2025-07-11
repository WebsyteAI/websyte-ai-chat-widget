import { useEffect } from 'react';

interface UseAudioManagementProps {
  currentContent: 'action' | 'audio';
  setContentFadeClass: (className: string) => void;
  audioProgress: number;
  setAudioProgress: (progress: number) => void;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  totalTime: number;
  setIsPlaying: (playing: boolean) => void;
}

export function useAudioManagement({
  currentContent,
  setContentFadeClass,
  audioProgress,
  setAudioProgress,
  elapsedTime,
  setElapsedTime,
  totalTime,
  setIsPlaying
}: UseAudioManagementProps) {
  // Handle content transition animations
  const handleContentChange = (newContent: 'action' | 'audio') => {
    if (newContent === currentContent) return;
    
    // Start fade out
    setContentFadeClass('opacity-0');
    
    // After fade out, switch content and fade in
    setTimeout(() => {
      // Content switch happens in parent component
      setContentFadeClass('opacity-100');
    }, 300);
  };

  // Update audio progress based on elapsed time
  useEffect(() => {
    if (totalTime > 0) {
      const progress = (elapsedTime / totalTime) * 100;
      setAudioProgress(Math.min(progress, 100));
    }
  }, [elapsedTime, totalTime, setAudioProgress]);

  // Reset audio state when switching away from audio
  useEffect(() => {
    if (currentContent !== 'audio') {
      setIsPlaying(false);
      setElapsedTime(0);
      setAudioProgress(0);
    }
  }, [currentContent, setIsPlaying, setElapsedTime, setAudioProgress]);

  return {
    handleContentChange
  };
}