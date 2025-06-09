import { ArrowUp, Square } from "lucide-react";

interface MessageInputProps {
  inputValue: string;
  placeholder: string;
  isLoading: boolean;
  onInputChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onCancel: () => void;
}

export function MessageInput({
  inputValue,
  placeholder,
  isLoading,
  onInputChange,
  onKeyDown,
  onSend,
  onCancel,
}: MessageInputProps) {
  return (
    <div className="p-4">
      <div className="flex items-center bg-gray-100 rounded-lg p-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 bg-transparent border-0 focus:outline-none text-sm placeholder-gray-500"
          disabled={isLoading}
        />
        <button
          onClick={isLoading ? onCancel : onSend}
          disabled={!isLoading && !inputValue.trim()}
          className="bg-white hover:bg-gray-50 disabled:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors flex items-center justify-center shadow-sm ml-2"
        >
          {isLoading ? <Square size={16} /> : <ArrowUp size={16} />}
        </button>
      </div>
    </div>
  );
}