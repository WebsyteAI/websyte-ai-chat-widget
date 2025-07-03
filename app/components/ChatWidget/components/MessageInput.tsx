import { ArrowUp, Square } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
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
  const [islandSize, setIslandSize] = useState<DynamicIslandSize>("long");
  const [isFocused, setIsFocused] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState<number>(80);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout>();

  // Update island size based on state
  useEffect(() => {
    // Always use "large" size for consistent width
    // Height is controlled dynamically
    setIslandSize("large");
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Calculate textarea height based on content
  useEffect(() => {
    if (inputRef.current) {
      // Reset height to recalculate
      inputRef.current.style.height = 'auto';
      const scrollHeight = inputRef.current.scrollHeight;
      const newHeight = Math.min(scrollHeight, 200); // Max height of 200px
      inputRef.current.style.height = `${newHeight}px`;
      
      // Calculate dynamic island height (textarea height + toolbar height + padding)
      const toolbarHeight = 40; // Height of the actions toolbar
      const islandHeight = Math.max(80, newHeight + toolbarHeight + 16); // 16px for top and bottom padding (py-2 = 8px * 2)
      setTextareaHeight(islandHeight);
    }
  }, [inputValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow shift+enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onKeyDown(e);
    }
  };

  const inputContent = (
    <div className="flex flex-col w-full">
      {/* Top row: Textarea */}
      <div className="flex-1">
        <Textarea
          ref={inputRef}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            setIsFocused(true);
          }}
          onBlur={() => {
            // Delay blur to allow button clicks to register
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
            }, 150);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-400 resize-none min-h-[40px] max-h-[160px] py-2 px-3 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-opacity-50 hover:[&::-webkit-scrollbar-thumb]:bg-opacity-70 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600"
          disabled={isLoading}
          rows={2}
          style={{
            overflowY: 'auto'
          }}
        />
      </div>
      
      {/* Bottom row: Actions toolbar */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2">
          {/* Placeholder for future toolbar actions */}
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {inputValue.length > 0 && `${inputValue.length} characters`}
          </span>
        </div>
        <Button
          onMouseDown={(e) => {
            // Prevent blur when clicking button
            e.preventDefault();
          }}
          onClick={() => {
            if (isLoading) {
              onCancel();
            } else {
              onSend();
            }
          }}
          disabled={!isLoading && !inputValue.trim()}
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:disabled:bg-gray-900 disabled:opacity-50"
        >
          {isLoading ? <Square size={18} /> : <ArrowUp size={18} />}
        </Button>
      </div>
    </div>
  );

  if (!useIsland) {
    // Fallback to original design when island is disabled
    return (
      <div className="p-4">
        <div className="bg-gray-100 rounded-lg p-2">
          <div className="flex flex-col">
            <Textarea
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onKeyDown(e);
                }
              }}
              placeholder={placeholder}
              className="w-full px-3 py-2 bg-transparent border-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-lg placeholder-gray-500 resize-none min-h-[40px] max-h-[200px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-opacity-50 hover:[&::-webkit-scrollbar-thumb]:bg-opacity-70"
              disabled={isLoading}
              rows={2}
            />
            <div className="flex items-center justify-end pt-2">
              <Button
                onClick={isLoading ? onCancel : onSend}
                disabled={!isLoading && !inputValue.trim()}
                variant={isLoading ? "destructive" : "secondary"}
                size="icon"
                className="h-8 w-8 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 shadow-sm"
              >
                {isLoading ? <Square size={16} /> : <ArrowUp size={16} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DynamicIslandProvider 
      size={islandSize} 
      setSize={setIslandSize} 
      position="bottom"
      className="!absolute !bottom-4 !left-1/2 !-translate-x-1/2 !z-50 !w-[calc(100%-2rem)] !max-w-[600px]"
      dynamicHeight={textareaHeight}
    >
      <DynamicIsland className="w-full py-2" style={{ height: `${textareaHeight}px` }}>
        {inputContent}
      </DynamicIsland>
    </DynamicIslandProvider>
  );
}