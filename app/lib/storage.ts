interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  pageUrl?: string;
}

interface WidgetState {
  isMinimized: boolean;
  position: "bottom-right" | "bottom-left";
}

interface ChatStorage {
  chatHistory: Message[];
  widgetState: WidgetState;
}

const STORAGE_KEY = "websyte-chat-widget";

export class ChatStorageManager {
  private storage: Storage;

  constructor(storage: Storage = localStorage) {
    this.storage = storage;
  }

  getMessages(pageUrl?: string): Message[] {
    try {
      const data = this.getChatData();
      let messages = data.chatHistory || [];
      
      if (pageUrl) {
        messages = messages.filter(msg => msg.pageUrl === pageUrl);
      }
      
      return messages.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error("Error loading messages:", error);
      return [];
    }
  }

  saveMessage(message: Message): void {
    try {
      const data = this.getChatData();
      data.chatHistory = data.chatHistory || [];
      
      const messageToSave = {
        ...message,
        pageUrl: message.pageUrl || window.location.href,
      };
      
      data.chatHistory.push(messageToSave);
      
      if (data.chatHistory.length > 1000) {
        data.chatHistory = data.chatHistory.slice(-500);
      }
      
      this.setChatData(data);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }

  getWidgetState(): WidgetState {
    try {
      const data = this.getChatData();
      return data.widgetState || {
        isMinimized: false,
        position: "bottom-right",
      };
    } catch (error) {
      console.error("Error loading widget state:", error);
      return {
        isMinimized: false,
        position: "bottom-right",
      };
    }
  }

  saveWidgetState(state: Partial<WidgetState>): void {
    try {
      const data = this.getChatData();
      data.widgetState = {
        ...this.getWidgetState(),
        ...state,
      };
      this.setChatData(data);
    } catch (error) {
      console.error("Error saving widget state:", error);
    }
  }

  clearHistory(): void {
    try {
      const data = this.getChatData();
      data.chatHistory = [];
      this.setChatData(data);
    } catch (error) {
      console.error("Error clearing history:", error);
    }
  }

  private getChatData(): ChatStorage {
    const stored = this.storage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        chatHistory: [],
        widgetState: {
          isMinimized: false,
          position: "bottom-right",
        },
      };
    }
    return JSON.parse(stored);
  }

  private setChatData(data: ChatStorage): void {
    this.storage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

export const chatStorage = new ChatStorageManager();