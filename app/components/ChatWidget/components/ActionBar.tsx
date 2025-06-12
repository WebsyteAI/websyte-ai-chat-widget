import { FileText, Headphones, MessageCircle, ChevronDown } from "lucide-react";
import type { ContentMode, Summaries } from "../types";

interface ActionBarProps {
  advertiserLogo?: string;
  advertiserName: string;
  baseUrl: string;
  currentView: "main" | "chat";
  showSummaryDropdown: boolean;
  summaries: Summaries | null;
  isLoadingSummaries: boolean;
  currentContentMode: ContentMode;
  isTransitioning: boolean;
  hidePoweredBy?: boolean;
  onToggleSummaryDropdown: () => void;
  onContentModeChange: (mode: ContentMode) => void;
  onStartAudio: () => void;
  onToggleChat: () => void;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

export function ActionBar({
  advertiserLogo,
  advertiserName,
  baseUrl,
  currentView,
  showSummaryDropdown,
  summaries,
  isLoadingSummaries,
  currentContentMode,
  isTransitioning,
  hidePoweredBy,
  onToggleSummaryDropdown,
  onContentModeChange,
  onStartAudio,
  onToggleChat,
  dropdownRef,
}: ActionBarProps) {
  return (
    <>
      {/* Action Bar Content */}
      <div className="flex items-center gap-1 whitespace-nowrap overflow-hidden flex-shrink-0">
        <img
          src={advertiserLogo || `${baseUrl}/websyte-ai-logo.svg`}
          alt={advertiserName}
          className="w-8 h-8 rounded flex-shrink-0"
        />
        <span className="font-bold text-gray-800 text-base">AI</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Summarization Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSummaryDropdown();
            }}
            disabled={isLoadingSummaries || isTransitioning}
            className="action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title="Content display options"
          >
            <FileText
              size={18}
              className="text-gray-600 group-hover:text-gray-800"
            />
            <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">
              Summarize Content
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
          className="action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50"
          title="Audio Version"
        >
          <Headphones
            size={18}
            className="text-gray-600 group-hover:text-gray-800"
          />
          <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">
            Audio Version
          </span>
        </button>

        <button
          onClick={onToggleChat}
          disabled={isTransitioning}
          className={`action-button flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors group cursor-pointer disabled:opacity-50 ${
            currentView === "chat" ? "bg-gray-100" : ""
          }`}
          title="Ask Questions"
        >
          <MessageCircle
            size={18}
            className="text-gray-600 group-hover:text-gray-800"
          />
          <span className="text-base text-gray-600 group-hover:text-gray-800 font-medium">
            Ask Questions
          </span>
        </button>
      </div>
    </>
  );
}
