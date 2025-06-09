import { Play, Pause, X } from "lucide-react";

interface AudioPlayerProps {
  isPlaying: boolean;
  audioProgress: number;
  playbackSpeed: number;
  elapsedTime: number;
  totalTime: number;
  isTransitioning: boolean;
  onPlayPause: () => void;
  onSpeedChange: () => void;
  onProgressChange: (progress: number) => void;
  onExit: () => void;
  formatTime: (seconds: number) => string;
}

export function AudioPlayer({
  isPlaying,
  audioProgress,
  playbackSpeed,
  elapsedTime,
  totalTime,
  isTransitioning,
  onPlayPause,
  onSpeedChange,
  onProgressChange,
  onExit,
  formatTime,
}: AudioPlayerProps) {
  return (
    <>
      {/* Audio Player Content */}
      <button
        onClick={onPlayPause}
        disabled={isTransitioning}
        className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-sm transition-colors disabled:opacity-50"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={20} className="text-gray-700" /> : <Play size={20} className="text-gray-700" />}
      </button>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-600 font-mono min-w-fit">
          {formatTime(elapsedTime)}/{formatTime(totalTime)}
        </span>
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${audioProgress}%` }}
          />
          <input
            type="range"
            min="0"
            max="100"
            value={audioProgress}
            onChange={(e) => onProgressChange(Number(e.target.value))}
            disabled={isTransitioning}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <button
        onClick={onSpeedChange}
        disabled={isTransitioning}
        className="bg-white hover:bg-gray-50 px-2 py-1 rounded text-sm font-medium text-gray-700 transition-colors shadow-sm disabled:opacity-50"
        title="Playback speed"
      >
        {playbackSpeed}x
      </button>

      <button
        onClick={onExit}
        disabled={isTransitioning}
        className="bg-white hover:bg-gray-50 p-2 rounded-full shadow-sm transition-colors disabled:opacity-50"
        title="Exit audio player"
      >
        <X size={18} className="text-gray-700" />
      </button>
    </>
  );
}