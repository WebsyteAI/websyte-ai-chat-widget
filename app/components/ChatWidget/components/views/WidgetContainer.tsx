import { ReactNode } from 'react';
import { ActionBar, AudioPlayer } from '../index';
import type { ContentMode } from '../../types';

interface WidgetContainerProps {
  children: ReactNode;
  currentView: 'main' | 'chat';
  currentContent: 'action' | 'audio';
  contentFadeClass: string;
  originalContent: string;
  isPlaying: boolean;
  audioProgress: number;
  playbackSpeed: number;
  elapsedTime: number;
  totalTime: number;
  handlePlayPause: () => void;
  handleSpeedChange: (speed: number) => void;
  formatTime: (time: number) => string;
  setAudioProgress: (progress: number) => void;
  setElapsedTime: (time: number) => void;
  handleContentModeChange: (mode: ContentMode) => void;
  onChat: () => void;
  onAudioToggle: () => void;
}

export function WidgetContainer({
  children,
  currentView,
  currentContent,
  contentFadeClass,
  originalContent,
  isPlaying,
  audioProgress,
  playbackSpeed,
  elapsedTime,
  totalTime,
  handlePlayPause,
  handleSpeedChange,
  formatTime,
  setAudioProgress,
  setElapsedTime,
  handleContentModeChange,
  onChat,
  onAudioToggle
}: WidgetContainerProps) {
  return (
    <>
      {currentView === 'main' && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6">
            <div className={`transition-opacity duration-300 ${contentFadeClass}`}>
              {currentContent === 'action' ? (
                <ActionBar 
                  onChat={onChat}
                  onAudio={onAudioToggle}
                  hasContent={!!originalContent}
                />
              ) : (
                <AudioPlayer
                  isPlaying={isPlaying}
                  progress={audioProgress}
                  speed={playbackSpeed}
                  currentTime={elapsedTime}
                  duration={totalTime}
                  onPlayPause={handlePlayPause}
                  onSpeedChange={handleSpeedChange}
                  onProgressChange={(value) => {
                    const newTime = (value / 100) * totalTime;
                    setElapsedTime(newTime);
                    setAudioProgress(value);
                  }}
                  formatTime={formatTime}
                  onBack={onAudioToggle}
                  onContentModeChange={handleContentModeChange}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}