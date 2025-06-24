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
      <Marquee pauseOnHover className="[--duration:25s] [--gap:0.5rem]">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-200 rounded animate-pulse w-[260px] h-5"></div>
          ))
        ) : (
          recommendations.map((rec, index) => (
            <button
              key={index}
              onClick={() => onRecommendationClick(rec)}
              disabled={isTransitioning || isLoading}
              className="hover:bg-gray-50 rounded-lg px-2 py-0.5 text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
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