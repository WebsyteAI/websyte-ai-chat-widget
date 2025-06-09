import { useState } from "react";
import type { Message } from "../types";

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = (message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      ...message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return { messages, addMessage, clearMessages };
}