import { Recommendation, ContentMode } from '../types';
import { RecommendationsList } from './RecommendationsList';
import { ContentModeSelector } from './ContentModeSelector';

interface ActionBarProps {
  recommendations: Recommendation[];
  isLoadingRecommendations: boolean;
  currentContentMode: ContentMode;
  summaries: { short?: string; medium?: string } | null;
  isLoadingSummaries: boolean;
  onRecommendationClick: (recommendation: string) => void;
  onContentModeChange: (mode: ContentMode) => void;
  onStartAudio: () => void;
  onStartChat: () => void;
  onLoadSummaries: () => void;
}

export function ActionBar({
  recommendations,
  isLoadingRecommendations,
  currentContentMode,
  summaries,
  isLoadingSummaries,
  onRecommendationClick,
  onContentModeChange,
  onStartAudio,
  onStartChat,
  onLoadSummaries,
}: ActionBarProps) {
  return (
    <div className="p-4 space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-col space-y-3">
        <button
          onClick={onStartChat}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          💬 Start Chat
        </button>
        
        <button
          onClick={onStartAudio}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          🎧 Listen to Audio Summary
        </button>
      </div>

      {/* Content Mode Selector */}
      <ContentModeSelector
        currentMode={currentContentMode}
        summaries={summaries}
        isLoadingSummaries={isLoadingSummaries}
        onModeChange={onContentModeChange}
        onLoadSummaries={onLoadSummaries}
      />

      {/* Recommendations */}
      <RecommendationsList
        recommendations={recommendations}
        isLoading={isLoadingRecommendations}
        onRecommendationClick={onRecommendationClick}
      />
    </div>
  );
}