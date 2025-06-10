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
  if (recommendations.length === 0 && !isLoading) return null;

  return (
    <div className={`w-full ${contentFadeClass}`}>
      <Marquee pauseOnHover className="[--duration:20s]">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 animate-pulse mx-1 w-[260px] h-[34px] flex items-center">
              <div className="h-3 bg-gray-300 rounded flex-1"></div>
            </div>
          ))
        ) : (
          recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => onRecommendationClick(rec)}
              disabled={isTransitioning || isLoading}
              className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed mx-1"
              title={rec.description}
            >
              {rec.title}
            </button>
          ))
        )}
      </Marquee>
    </div>
  );
}