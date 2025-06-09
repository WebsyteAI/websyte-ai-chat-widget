import { ContentMode } from '../types';

interface ContentModeSelectorProps {
  currentMode: ContentMode;
  summaries: { short?: string; medium?: string } | null;
  isLoadingSummaries: boolean;
  onModeChange: (mode: ContentMode) => void;
  onLoadSummaries: () => void;
}

export function ContentModeSelector({
  currentMode,
  summaries,
  isLoadingSummaries,
  onModeChange,
  onLoadSummaries,
}: ContentModeSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Content View</h3>
        {!summaries && !isLoadingSummaries && (
          <button
            onClick={onLoadSummaries}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Load Summaries
          </button>
        )}
      </div>
      
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onModeChange('original')}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors ${
            currentMode === 'original'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Original
        </button>
        
        <button
          onClick={() => onModeChange('short')}
          disabled={!summaries?.short || isLoadingSummaries}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            currentMode === 'short'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {isLoadingSummaries ? 'Loading...' : 'Short'}
        </button>
        
        <button
          onClick={() => onModeChange('medium')}
          disabled={!summaries?.medium || isLoadingSummaries}
          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            currentMode === 'medium'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {isLoadingSummaries ? 'Loading...' : 'Medium'}
        </button>
      </div>
    </div>
  );
}