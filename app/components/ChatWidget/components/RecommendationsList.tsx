import { Recommendation } from '../types';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  onRecommendationClick: (recommendation: string) => void;
}

export function RecommendationsList({ 
  recommendations, 
  isLoading, 
  onRecommendationClick 
}: RecommendationsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">Suggested Questions</h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-700">Suggested Questions</h3>
      <div className="space-y-2">
        {recommendations.map((rec, index) => (
          <button
            key={index}
            onClick={() => onRecommendationClick(rec.title)}
            className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="text-gray-800">{rec.title}</span>
            {rec.description && (
              <span className="block text-xs text-gray-500 mt-1">
                {rec.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}