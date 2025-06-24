import type { Recommendation } from "../types";
import { Marquee } from "../../ui/marquee";
import { Button } from "~/components/ui/button";

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
            <Button
              key={index}
              onClick={() => onRecommendationClick(rec)}
              disabled={isTransitioning || isLoading}
              variant="ghost"
              size="sm"
              className="h-5 text-gray-500 hover:text-gray-700 whitespace-nowrap px-2"
              title={rec.description}
            >
              {rec.title}
            </Button>
          ))
        )}
      </Marquee>
    </div>
  );
}