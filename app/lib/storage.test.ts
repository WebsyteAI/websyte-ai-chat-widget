import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ChatStorageManager } from './storage';

// Mock localStorage
const createMockStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    length: 0,
    key: vi.fn(),
  };
};

// Mock console
const mockConsole = {
  error: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
};

Object.defineProperty(global, 'console', {
  value: mockConsole,
  writable: true,
});

// Mock window.location
Object.defineProperty(global, 'window', {
  value: {
    location: {
      href: 'https://example.com/test-page',
    },
  },
  writable: true,
});

describe('ChatStorageManager', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let storageManager: ChatStorageManager;

  const sampleMessage = {
    id: '123',
    role: 'user' as const,
    content: 'Test message',
    timestamp: new Date('2025-01-01T10:00:00Z'),
  };

  const sampleMessage2 = {
    id: '124',
    role: 'assistant' as const,
    content: 'Test response',
    timestamp: new Date('2025-01-01T10:01:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage = createMockStorage();
    storageManager = new ChatStorageManager(mockStorage as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use provided storage', () => {
      const customStorage = createMockStorage();
      const manager = new ChatStorageManager(customStorage as any);
      
      manager.getMessages();
      
      expect(customStorage.getItem).toHaveBeenCalled();
    });

    it('should use localStorage by default', () => {
      // Can't easily test localStorage directly, but we can test that it doesn't crash
      expect(() => new ChatStorageManager()).not.toThrow();
    });
  });

  describe('getMessages', () => {
    it('should return empty array when no data exists', () => {
      const messages = storageManager.getMessages();
      
      expect(messages).toEqual([]);
      expect(mockStorage.getItem).toHaveBeenCalledWith('websyte-chat-widget');
    });

    it('should return all messages when no pageUrl filter', () => {
      const chatData = {
        chatHistory: [sampleMessage, sampleMessage2],
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(chatData));

      const messages = storageManager.getMessages();

      expect(messages).toHaveLength(2);
      expect(messages[0]).toMatchObject({
        id: '123',
        role: 'user',
        content: 'Test message',
      });
      expect(messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should filter messages by pageUrl', () => {
      const messageWithUrl = { ...sampleMessage, pageUrl: 'https://example.com/page1' };
      const messageWithDifferentUrl = { ...sampleMessage2, pageUrl: 'https://example.com/page2' };
      
      const chatData = {
        chatHistory: [messageWithUrl, messageWithDifferentUrl],
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(chatData));

      const messages = storageManager.getMessages('https://example.com/page1');

      expect(messages).toHaveLength(1);
      expect(messages[0].id).toBe('123');
    });

    it('should handle corrupted JSON gracefully', () => {
      mockStorage.getItem.mockReturnValue('invalid json');

      const messages = storageManager.getMessages();

      expect(messages).toEqual([]);
      expect(mockConsole.error).toHaveBeenCalledWith('Error loading messages:', expect.any(Error));
    });

    it('should convert timestamp strings to Date objects', () => {
      const messageWithStringTimestamp = {
        ...sampleMessage,
        timestamp: '2025-01-01T10:00:00Z', // String instead of Date
      };
      const chatData = {
        chatHistory: [messageWithStringTimestamp],
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(chatData));

      const messages = storageManager.getMessages();

      expect(messages[0].timestamp).toBeInstanceOf(Date);
      expect(messages[0].timestamp.toISOString()).toBe('2025-01-01T10:00:00.000Z');
    });
  });

  describe('saveMessage', () => {
    it('should save message with current URL when no pageUrl provided', () => {
      storageManager.saveMessage(sampleMessage);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'websyte-chat-widget',
        expect.stringContaining('"pageUrl":"https://example.com/test-page"')
      );

      // Verify the saved data structure
      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.chatHistory).toHaveLength(1);
      expect(savedData.chatHistory[0].pageUrl).toBe('https://example.com/test-page');
    });

    it('should preserve provided pageUrl', () => {
      const messageWithUrl = { ...sampleMessage, pageUrl: 'https://custom.com/page' };
      
      storageManager.saveMessage(messageWithUrl);

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.chatHistory[0].pageUrl).toBe('https://custom.com/page');
    });

    it('should append to existing messages', () => {
      const existingData = {
        chatHistory: [sampleMessage],
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      storageManager.saveMessage(sampleMessage2);

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.chatHistory).toHaveLength(2);
      expect(savedData.chatHistory[1].id).toBe('124');
    });

    it('should truncate history when exceeding 1000 messages', () => {
      // Create 1000 existing messages
      const manyMessages = Array.from({ length: 1000 }, (_, i) => ({
        ...sampleMessage,
        id: `msg-${i}`,
      }));
      const existingData = {
        chatHistory: manyMessages,
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      storageManager.saveMessage(sampleMessage2);

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.chatHistory).toHaveLength(500);
      // Should keep the last 500 messages plus the new one (total 501, then truncated to 500)
      expect(savedData.chatHistory[499].id).toBe('124'); // New message should be last
      expect(savedData.chatHistory[0].id).toBe('msg-501'); // First kept message (501-999 + new message = 500 total)
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });

      expect(() => storageManager.saveMessage(sampleMessage)).not.toThrow();
      expect(mockConsole.error).toHaveBeenCalledWith('Error saving message:', expect.any(Error));
    });

    it('should initialize empty chatHistory when none exists', () => {
      mockStorage.getItem.mockReturnValue(null);

      storageManager.saveMessage(sampleMessage);

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.chatHistory).toHaveLength(1);
      expect(savedData.chatHistory[0].id).toBe('123');
    });
  });

  describe('getWidgetState', () => {
    it('should return default state when no data exists', () => {
      const state = storageManager.getWidgetState();

      expect(state).toEqual({
        isMinimized: false,
        position: 'bottom-right',
      });
    });

    it('should return stored widget state', () => {
      const chatData = {
        chatHistory: [],
        widgetState: { isMinimized: true, position: 'bottom-left' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(chatData));

      const state = storageManager.getWidgetState();

      expect(state).toEqual({
        isMinimized: true,
        position: 'bottom-left',
      });
    });

    it('should handle corrupted data gracefully', () => {
      mockStorage.getItem.mockReturnValue('invalid json');

      const state = storageManager.getWidgetState();

      expect(state).toEqual({
        isMinimized: false,
        position: 'bottom-right',
      });
      expect(mockConsole.error).toHaveBeenCalledWith('Error loading widget state:', expect.any(Error));
    });

    it('should return default when widgetState is missing', () => {
      const chatData = {
        chatHistory: [],
        // widgetState missing
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(chatData));

      const state = storageManager.getWidgetState();

      expect(state).toEqual({
        isMinimized: false,
        position: 'bottom-right',
      });
    });
  });

  describe('saveWidgetState', () => {
    it('should save partial widget state updates', () => {
      const existingData = {
        chatHistory: [sampleMessage],
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      storageManager.saveWidgetState({ isMinimized: true });

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.widgetState).toEqual({
        isMinimized: true,
        position: 'bottom-right', // Should preserve existing position
      });
      expect(savedData.chatHistory).toHaveLength(1); // Should preserve messages
    });

    it('should create widget state when none exists', () => {
      mockStorage.getItem.mockReturnValue(null);

      storageManager.saveWidgetState({ position: 'bottom-left' });

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.widgetState).toEqual({
        isMinimized: false, // Default value
        position: 'bottom-left', // Updated value
      });
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => storageManager.saveWidgetState({ isMinimized: true })).not.toThrow();
      expect(mockConsole.error).toHaveBeenCalledWith('Error saving widget state:', expect.any(Error));
    });
  });

  describe('clearHistory', () => {
    it('should clear chat history while preserving widget state', () => {
      const existingData = {
        chatHistory: [sampleMessage, sampleMessage2],
        widgetState: { isMinimized: true, position: 'bottom-left' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(existingData));

      storageManager.clearHistory();

      const savedData = JSON.parse(mockStorage.setItem.mock.calls[0][1]);
      expect(savedData.chatHistory).toEqual([]);
      expect(savedData.widgetState).toEqual({
        isMinimized: true,
        position: 'bottom-left',
      });
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => storageManager.clearHistory()).not.toThrow();
      expect(mockConsole.error).toHaveBeenCalledWith('Error clearing history:', expect.any(Error));
    });
  });

  describe('private methods via public interface', () => {
    it('should handle getChatData with null storage', () => {
      mockStorage.getItem.mockReturnValue(null);

      const messages = storageManager.getMessages();

      expect(messages).toEqual([]);
      // Verify it uses default structure when storage is null
    });

    it('should handle setChatData operations', () => {
      storageManager.saveMessage(sampleMessage);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'websyte-chat-widget',
        expect.stringMatching(/^{.*}$/) // Valid JSON string
      );
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle storage quota exceeded', () => {
      mockStorage.setItem.mockImplementation(() => {
        const error = new Error('QuotaExceededError');
        error.name = 'QuotaExceededError';
        throw error;
      });

      expect(() => storageManager.saveMessage(sampleMessage)).not.toThrow();
      expect(mockConsole.error).toHaveBeenCalledWith('Error saving message:', expect.any(Error));
    });

    it('should handle concurrent access scenarios', () => {
      // Simulate storage changing between get and set
      let callCount = 0;
      mockStorage.getItem.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return JSON.stringify({ chatHistory: [], widgetState: { isMinimized: false, position: 'bottom-right' } });
        }
        // Return different data on subsequent calls to simulate concurrent access
        return JSON.stringify({ chatHistory: [sampleMessage], widgetState: { isMinimized: false, position: 'bottom-right' } });
      });

      storageManager.saveMessage(sampleMessage2);

      // Should still work without throwing
      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it('should handle messages with missing timestamp', () => {
      const messageWithoutTimestamp = {
        id: '125',
        role: 'user' as const,
        content: 'Test message',
        // timestamp missing
      };
      const chatData = {
        chatHistory: [messageWithoutTimestamp],
        widgetState: { isMinimized: false, position: 'bottom-right' as const },
      };
      mockStorage.getItem.mockReturnValue(JSON.stringify(chatData));

      const messages = storageManager.getMessages();

      expect(messages).toHaveLength(1);
      // Should handle invalid date gracefully
      expect(messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle very large message content', () => {
      const largeMessage = {
        ...sampleMessage,
        content: 'A'.repeat(100000), // Very large content
      };

      expect(() => storageManager.saveMessage(largeMessage)).not.toThrow();
    });
  });
});