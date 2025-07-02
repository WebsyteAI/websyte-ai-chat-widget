import { ArrowUp, Square } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DynamicIslandProvider, DynamicIsland, type DynamicIslandSize } from "~/components/ui/dynamic-island";
import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  inputValue: string;
  placeholder: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onCancel: () => void;
  useIsland?: boolean;
}

export function MessageInput({
  inputValue,
  placeholder,
  isLoading,
  onInputChange,
  onKeyDown,
  onSend,
  onCancel,
  useIsland = true,
}: MessageInputProps) {
  const [islandSize, setIslandSize] = useState<DynamicIslandSize>("default");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update island size based on state
  useEffect(() => {
    if (isLoading) {
      setIslandSize("medium");
    } else if (isFocused && inputValue) {
      setIslandSize("long");
    } else if (isFocused) {
      setIslandSize("large");
    } else {
      setIslandSize("default");
    }
  }, [isLoading, isFocused, inputValue]);

  const inputContent = (
    <div className="flex items-center w-full gap-2">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-0 focus:outline-none text-sm text-white placeholder-gray-400"
        disabled={isLoading}
      />
      <Button
        onClick={isLoading ? onCancel : onSend}
        disabled={!isLoading && !inputValue.trim()}
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-50"
      >
        {isLoading ? <Square size={14} /> : <ArrowUp size={14} />}
      </Button>
    </div>
  );

  if (!useIsland) {
    // Fallback to original design when island is disabled
    return (
      <div className="p-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-lg placeholder-gray-500"
            disabled={isLoading}
          />
          <Button
            onClick={isLoading ? onCancel : onSend}
            disabled={!isLoading && !inputValue.trim()}
            variant={isLoading ? "destructive" : "secondary"}
            size="icon"
            className="h-8 w-8 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 shadow-sm ml-2 flex items-center justify-center"
          >
            {isLoading ? <Square size={16} /> : <ArrowUp size={16} />}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-20">
      <DynamicIslandProvider size={islandSize} setSize={setIslandSize} position="center">
        <DynamicIsland className="px-4">
          {inputContent}
        </DynamicIsland>
      </DynamicIslandProvider>
    </div>
  );
}