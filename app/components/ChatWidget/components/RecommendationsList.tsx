import type { Recommendation } from "../types";
import { Marquee } from "../../ui/marquee";

interface RecommendationsListProps {
  recommendations: Recommendation[];
  isLoading: boolean;
  isTransitioning: boolean;
  contentFadeClass: string;
  onRecommendationClick: (recommendation: Recommendation) => Promise<void>;
}

export function RecommendationsList({
  recommendations,
  isLoading,
  isTransitioning,
  contentFadeClass,
  onRecommendationClick,
}: RecommendationsListProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className={`w-full ${contentFadeClass}`}>
      {isLoading ? (
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-fit">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-lg px-3 py-1.5 animate-pulse">
                <div className="h-3 bg-gray-300 rounded w-20"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Marquee pauseOnHover className="[--duration:20s]">
          {recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => onRecommendationClick(rec)}
              disabled={isTransitioning || isLoading}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed mx-1"
              title={rec.description}
            >
              {rec.title}
            </button>
          ))}
        </Marquee>
      )}
    </div>
  );
}