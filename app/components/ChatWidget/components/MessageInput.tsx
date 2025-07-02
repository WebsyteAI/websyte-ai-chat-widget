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
  const [islandSize, setIslandSize] = useState<DynamicIslandSize>("long");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout>();

  // Update island size based on state
  useEffect(() => {
    if (isLoading) {
      setIslandSize("medium");
    } else if (isFocused) {
      setIslandSize("large");
    } else {
      setIslandSize("long");
    }
  }, [isLoading, isFocused]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow shift+enter for new lines
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onKeyDown(e);
    }
  };

  const inputContent = (
    <div className="flex items-center w-full gap-2">
      <textarea
        ref={inputRef as any}
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
        className="flex-1 w-full bg-transparent border-0 focus:outline-none text-base text-gray-900 placeholder-gray-500 dark:text-white dark:placeholder-gray-400 resize-none min-h-[24px] max-h-[120px] py-1 px-2"
        disabled={isLoading}
        rows={1}
        style={{
          height: 'auto',
          overflowY: inputValue.split('\n').length > 3 ? 'auto' : 'hidden'
        }}
      />
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
        className="h-8 w-8 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-300 dark:disabled:bg-gray-900 disabled:opacity-50 flex-shrink-0 self-end"
      >
        {isLoading ? <Square size={18} /> : <ArrowUp size={18} />}
      </Button>
    </div>
  );

  if (!useIsland) {
    // Fallback to original design when island is disabled
    return (
      <div className="p-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-2">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onKeyDown(e);
              }
            }}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-lg placeholder-gray-500 resize-none min-h-[28px] max-h-[120px]"
            disabled={isLoading}
            rows={1}
          />
          <Button
            onClick={isLoading ? onCancel : onSend}
            disabled={!isLoading && !inputValue.trim()}
            variant={isLoading ? "destructive" : "secondary"}
            size="icon"
            className="h-8 w-8 bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 shadow-sm ml-2 flex items-center justify-center self-end"
          >
            {isLoading ? <Square size={16} /> : <ArrowUp size={16} />}
          </Button>
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
    >
      <DynamicIsland className="w-full px-2 py-2">
        {inputContent}
      </DynamicIsland>
    </DynamicIslandProvider>
  );
}