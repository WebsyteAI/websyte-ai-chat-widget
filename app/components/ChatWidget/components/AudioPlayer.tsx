import { AudioState } from '../types';

interface AudioPlayerProps {
  audioState: AudioState;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
  onExitAudio: () => void;
}

export function AudioPlayer({
  audioState,
  onPlayPause,
  onSpeedChange,
  onProgressChange,
  onExitAudio,
}: AudioPlayerProps) {
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const progress = (clickX / width) * 100;
    onProgressChange(Math.max(0, Math.min(100, progress)));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Audio Summary</h3>
        <button
          onClick={onExitAudio}
          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
          aria-label="Exit audio mode"
        >
          ×
        </button>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div 
          className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
          onClick={handleProgressClick}
        >
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${audioState.audioProgress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>{formatTime(audioState.elapsedTime)}</span>
          <span>{formatTime(audioState.totalTime)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onPlayPause}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={audioState.isPlaying ? 'Pause' : 'Play'}
        >
          {audioState.isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
      </div>

      {/* Speed Control */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Playback Speed: {audioState.playbackSpeed}x
        </label>
        <div className="flex flex-wrap gap-2">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                audioState.playbackSpeed === speed
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}