import { Play, Pause, X } from "lucide-react";
import { Button } from "~/components/ui/button";

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
    <div className="w-full flex flex-col gap-2 px-4 sm:px-6 min-h-[78px] justify-center">
      {/* Top Row: Progress bar with time elapsed on left and total time on right */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600 font-mono min-w-fit">
          {formatTime(elapsedTime)}
        </span>
        <div className="relative flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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
        <span className="text-xs text-gray-600 font-mono min-w-fit">
          {formatTime(totalTime)}
        </span>
      </div>

      {/* Bottom Row: Audio control buttons */}
      <div className="flex items-center justify-center gap-2">
        <Button
          onClick={onSpeedChange}
          disabled={isTransitioning}
          variant="outline"
          size="sm"
          className="bg-white hover:bg-gray-50 text-gray-700 shadow-sm h-7 px-2"
          title="Playback speed"
        >
          {playbackSpeed}x
        </Button>

        <Button
          onClick={onPlayPause}
          disabled={isTransitioning}
          variant="outline"
          size="icon"
          className="bg-white hover:bg-gray-50 shadow-sm h-9 w-9 rounded-full"
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} className="text-gray-700" /> : <Play size={20} className="text-gray-700" />}
        </Button>

        <Button
          onClick={onExit}
          disabled={isTransitioning}
          variant="outline"
          size="icon"
          className="bg-white hover:bg-gray-50 shadow-sm h-9 w-9 rounded-full"
          title="Exit audio player"
        >
          <X size={18} className="text-gray-700" />
        </Button>
      </div>
    </div>
  );
}