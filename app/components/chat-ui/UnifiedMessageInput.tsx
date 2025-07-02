import { useRef, useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { DynamicIslandProvider, DynamicIsland, type DynamicIslandSize } from "../ui/dynamic-island";
import { cn } from "../../lib/utils";
import type { UnifiedMessageInputProps } from "./types";

export function UnifiedMessageInput({
  value,
  onChange,
  onSend,
  onCancel,
  onKeyDown,
  disabled = false,
  loading = false,
  placeholder = "Type your message...",
  useDynamicIsland = false,
  className = "",
  autoFocus = false,
}: UnifiedMessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [islandSize, setIslandSize] = useState<DynamicIslandSize>("default");
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    if (textareaRef.current && autoFocus) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);
  
  useEffect(() => {
    if (useDynamicIsland) {
      if (loading) {
        setIslandSize("long");
      } else if (isFocused || value.length > 0) {
        const lineCount = value.split('\n').length;
        const charCount = value.length;
        
        if (lineCount > 3 || charCount > 150) {
          setIslandSize("large");
        } else if (lineCount > 2 || charCount > 100) {
          setIslandSize("medium");
        } else if (charCount > 50) {
          setIslandSize("long");
        } else {
          setIslandSize("default");
        }
      } else {
        setIslandSize("compact");
      }
    }
  }, [value, loading, isFocused, useDynamicIsland]);
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };
  
  useEffect(() => {
    adjustTextareaHeight();
  }, [value]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
    onKeyDown?.(e);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
  };
  
  const handleBlur = () => {
    setIsFocused(false);
  };
  
  const inputContent = (
    <div className={cn("relative flex items-end gap-2", !useDynamicIsland && "p-4", className)}>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled || loading}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent border-0 focus:ring-0 p-2",
          "placeholder:text-gray-400 text-gray-900",
          "min-h-[40px] max-h-[200px]",
          !useDynamicIsland && "border border-gray-200 rounded-lg px-3 py-2 focus:border-gray-300"
        )}
        style={{ height: "auto" }}
      />
      
      <div className="flex gap-1 pb-2">
        {loading && onCancel && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <Button
          type="button"
          size="sm"
          disabled={disabled || loading || !value.trim()}
          onClick={onSend}
          className={cn(
            "h-8 w-8 p-0",
            useDynamicIsland ? "bg-white text-black hover:bg-gray-100" : ""
          )}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {!useDynamicIsland && value.length > 0 && (
        <div className="absolute bottom-1 left-4 text-xs text-gray-400">
          {value.length} / 4000
        </div>
      )}
    </div>
  );
  
  if (useDynamicIsland) {
    return (
      <DynamicIslandProvider
        size={islandSize}
        position="bottom"
        className={cn(
          "w-[calc(100%-2rem)] mx-auto mb-4",
          loading && "animate-pulse"
        )}
      >
        <DynamicIsland>
          {inputContent}
        </DynamicIsland>
      </DynamicIslandProvider>
    );
  }
  
  return inputContent;
}