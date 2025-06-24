import { FileText, Headphones, MessageCircle, ChevronDown } from "lucide-react";
import type { ContentMode, Summaries } from "../types";

interface ActionBarProps {
  advertiserLogo?: string;
  advertiserName: string;
  advertiserUrl?: string;
  baseUrl: string;
  currentView: "main" | "chat";
  showSummaryDropdown: boolean;
  summaries: Summaries | null;
  isLoadingSummaries: boolean;
  currentContentMode: ContentMode;
  isTransitioning: boolean;
  hidePoweredBy?: boolean;
  enableSmartSelector?: boolean;
  onToggleSummaryDropdown: () => void;
  onContentModeChange: (mode: ContentMode) => void;
  onStartAudio: () => void;
  onToggleChat: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export function ActionBar({
  advertiserLogo,
  advertiserName,
  advertiserUrl = "https://websyte.ai",
  baseUrl,
  currentView,
  showSummaryDropdown,
  summaries,
  isLoadingSummaries,
  currentContentMode,
  isTransitioning,
  hidePoweredBy,
  enableSmartSelector = false,
  onToggleSummaryDropdown,
  onContentModeChange,
  onStartAudio,
  onToggleChat,
  dropdownRef,
}: ActionBarProps) {
  return (
    <div className="flex items-center justify-between w-full sm:justify-start sm:gap-4 px-2 sm:px-4">
      {/* Logo and AI text */}
      <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden flex-shrink-0">
        <a
          href={advertiserUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <img
            src={advertiserLogo || `${baseUrl}/websyte-ai-logo.svg`}
            alt={advertiserName}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
          />
        </a>
        <span className="font-bold text-gray-800 text-sm sm:text-base">AI</span>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-1">
        {/* Summarization Dropdown */}
        <div className="flex-1 relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSummaryDropdown();
            }}
            disabled={isLoadingSummaries || isTransitioning}
            className="action-button flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-1 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-base w-full"
            title="Content display options"
          >
            <FileText
              size={18}
              className="text-gray-600 group-hover:text-gray-800"
            />
            <span className="hidden sm:inline text-sm text-gray-600 group-hover:text-gray-800 font-medium">
              Summarize
            </span>
            <ChevronDown
              size={16}
              className={`text-gray-600 group-hover:text-gray-800 transition-transform ${
                showSummaryDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {showSummaryDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[120px]">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Original button clicked");
                  onContentModeChange("original");
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  currentContentMode === "original"
                    ? "bg-gray-50 font-medium"
                    : ""
                }`}
              >
                Original
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Short button clicked, summaries:", summaries);
                  onContentModeChange("short");
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  !summaries?.short ? "opacity-50" : ""
                } ${
                  currentContentMode === "short" ? "bg-gray-50 font-medium" : ""
                }`}
              >
                Short {!summaries?.short && "(no summary)"}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Medium button clicked, summaries:", summaries);
                  onContentModeChange("medium");
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
                  !summaries?.medium ? "opacity-50" : ""
                } ${
                  currentContentMode === "medium"
                    ? "bg-gray-50 font-medium"
                    : ""
                }`}
              >
                Medium {!summaries?.medium && "(no summary)"}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={onStartAudio}
          disabled={isTransitioning}
          className="action-button flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-1 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50 text-xs sm:text-base flex-1"
          title="Audio Version"
        >
          <Headphones
            size={18}
            className="text-gray-600 group-hover:text-gray-800"
          />
          <span className="hidden sm:inline text-sm text-gray-600 group-hover:text-gray-800 font-medium">
            Listen
          </span>
        </button>

        <button
          onClick={onToggleChat}
          disabled={isTransitioning}
          className={`action-button flex items-center justify-center gap-1 sm:gap-2 px-1 sm:px-3 py-1 sm:py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50 text-xs sm:text-base flex-1 ${
            currentView === "chat" ? "bg-gray-100" : ""
          }`}
          title="Ask Questions"
        >
          <MessageCircle
            size={18}
            className="text-gray-600 group-hover:text-gray-800"
          />
          <span className="hidden sm:inline text-sm text-gray-600 group-hover:text-gray-800 font-medium">
            Ask
          </span>
        </button>
      </div>
    </div>
  );
}
