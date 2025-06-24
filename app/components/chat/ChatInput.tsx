import { ArrowUp, Square } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "~/lib/utils";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onCancel?: () => void;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onCancel,
  placeholder = "Type your message...",
  disabled = false,
  loading = false,
  maxLength = 2000,
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && !loading && value.trim()) {
        onSend();
      }
    }
  };

  const handleSubmit = () => {
    if (!disabled && !loading && value.trim()) {
      onSend();
    }
  };

  const handleCancel = () => {
    if (loading && onCancel) {
      onCancel();
    }
  };

  const canSend = !disabled && !loading && value.trim().length > 0;
  const canCancel = loading && onCancel;

  return (
    <div className="p-4 border-t border-gray-200">
      <div className={`flex items-center bg-gray-100 rounded-lg p-2 ${
        disabled ? 'opacity-50' : ''
      }`}>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Create a widget to enable chat" : placeholder}
          className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-sm placeholder-gray-500 resize-none min-h-[2.5rem] max-h-32 self-end"
          disabled={disabled || loading}
          maxLength={maxLength}
          rows={1}
          style={{
            height: 'auto',
            minHeight: '2.5rem',
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = 'auto';
            target.style.height = target.scrollHeight + 'px';
          }}
        />
        
        <div className="flex items-center gap-2 ml-2 self-center">
          {/* Character count (when approaching limit) */}
          {value.length > maxLength * 0.8 && (
            <span className={`text-xs ${
              value.length > maxLength * 0.95 ? 'text-red-500' : 'text-gray-500'
            }`}>
              {value.length}/{maxLength}
            </span>
          )}
          
          {/* Send/Cancel Button */}
          <Button
            onClick={canCancel ? handleCancel : handleSubmit}
            disabled={!canSend && !canCancel}
            size="icon"
            variant={canCancel ? "destructive" : "default"}
            className={cn(
              "h-9 w-9 shadow-sm flex items-center justify-center",
              canCancel && "hover:bg-red-600",
              !canSend && !canCancel && "bg-gray-200 text-gray-400"
            )}
            title={canCancel ? 'Cancel message' : 'Send message'}
          >
            {canCancel ? (
              <Square size={16} />
            ) : (
              <ArrowUp size={16} />
            )}
          </Button>
        </div>
      </div>
      
      {/* Helper text */}
      {!disabled && (
        <p className="text-xs text-gray-500 mt-2 px-1">
          Press Enter to send, Shift+Enter for new line
        </p>
      )}
    </div>
  );
}