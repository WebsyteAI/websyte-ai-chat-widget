# Custom Hooks Development Guide

This guide covers creating and using custom React hooks in the Websyte AI Chat Widget project.

## 🎯 What Are Custom Hooks?

Custom hooks are JavaScript functions that:
- Start with "use" (e.g., `useWidget`, `useChatMessages`)
- Can call other hooks (built-in or custom)
- Extract and reuse stateful logic
- Share logic between components

## 📁 Hook Organization

### Directory Structure
```
app/
├── hooks/                  # Global hooks
│   ├── useAuth.ts         # Authentication
│   ├── useWidget.ts       # Widget operations
│   └── index.ts           # Exports
└── components/
    └── ChatWidget/
        └── hooks/          # Component-specific hooks
            ├── useChatMessages.ts
            └── useAudioPlayer.ts
```

## 🏗️ Creating Custom Hooks

### Basic State Hook
```typescript
// hooks/useToggle.ts
import { useState, useCallback } from 'react';

export function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(v => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return {
    value,
    toggle,
    setTrue,
    setFalse,
  } as const;
}

// Usage
function Component() {
  const { value: isOpen, toggle, setFalse } = useToggle();
  
  return (
    <Dialog open={isOpen} onOpenChange={setFalse}>
      <Button onClick={toggle}>Toggle Dialog</Button>
    </Dialog>
  );
}
```

### Data Fetching Hook
```typescript
// hooks/useWidget.ts
import { useState, useEffect } from 'react';

interface UseWidgetOptions {
  onSuccess?: (widget: Widget) => void;
  onError?: (error: Error) => void;
}

export function useWidget(widgetId: string, options?: UseWidgetOptions) {
  const [widget, setWidget] = useState<Widget | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWidget() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/widgets/${widgetId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch widget: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!cancelled) {
          setWidget(data);
          options?.onSuccess?.(data);
        }
      } catch (err) {
        if (!cancelled) {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          options?.onError?.(error);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchWidget();

    return () => {
      cancelled = true;
    };
  }, [widgetId]);

  return { widget, isLoading, error, refetch: fetchWidget };
}
```

### Local Storage Hook
```typescript
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Get from local storage then parse stored json or return initialValue
  const readValue = (): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to local state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, []);

  return [storedValue, setValue];
}
```

### WebSocket Hook
```typescript
// hooks/useWebSocket.ts
import { useEffect, useRef, useState } from 'react';

interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (data: any) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  reconnect?: boolean;
  reconnectInterval?: number;
}

export function useWebSocket(url: string, options?: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      ws.current = new WebSocket(url);

      ws.current.onopen = (event) => {
        setIsConnected(true);
        options?.onOpen?.(event);
      };

      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        options?.onMessage?.(data);
      };

      ws.current.onerror = (event) => {
        options?.onError?.(event);
      };

      ws.current.onclose = (event) => {
        setIsConnected(false);
        options?.onClose?.(event);

        if (options?.reconnect) {
          reconnectTimeout.current = setTimeout(() => {
            connect();
          }, options.reconnectInterval || 5000);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
    }
  };

  const sendMessage = (data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    }
  };

  const disconnect = () => {
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
    }
    ws.current?.close();
  };

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [url]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    disconnect,
    reconnect: connect,
  };
}
```

## 🎨 Advanced Hook Patterns

### Reducer Hook with Actions
```typescript
// hooks/useChatState.ts
import { useReducer, useCallback } from 'react';

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_MESSAGES' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_MESSAGES':
      return { ...state, messages: [] };
    default:
      return state;
  }
}

export function useChatState() {
  const [state, dispatch] = useReducer(chatReducer, {
    messages: [],
    isLoading: false,
    error: null,
  });

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  return {
    ...state,
    addMessage,
    setLoading,
    setError,
    clearMessages,
  };
}
```

### Debounced Value Hook
```typescript
// hooks/useDebounce.ts
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // Perform search
      performSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### Media Query Hook
```typescript
// hooks/useMediaQuery.ts
import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    // Set initial value
    setMatches(media.matches);

    // Define listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    if (media.addEventListener) {
      media.addEventListener('change', listener);
    } else {
      // Fallback for older browsers
      media.addListener(listener);
    }

    // Cleanup
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener('change', listener);
      } else {
        media.removeListener(listener);
      }
    };
  }, [query]);

  return matches;
}

// Preset media queries
export const useIsMobile = () => useMediaQuery('(max-width: 640px)');
export const useIsTablet = () => useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
```

### Event Listener Hook
```typescript
// hooks/useEventListener.ts
import { useRef, useEffect } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: HTMLElement | Window | null,
  options?: boolean | AddEventListenerOptions
) {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const targetElement = element ?? window;
    if (!targetElement?.addEventListener) return;

    const eventListener = (event: WindowEventMap[K]) => {
      savedHandler.current(event);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

// Usage
function Component() {
  useEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });
}
```

## 🧪 Testing Custom Hooks

### Basic Hook Test
```typescript
// hooks/__tests__/useToggle.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useToggle } from '../useToggle';

describe('useToggle', () => {
  it('should initialize with default value', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current.value).toBe(false);
  });

  it('should initialize with provided value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current.value).toBe(true);
  });

  it('should toggle value', () => {
    const { result } = renderHook(() => useToggle());
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.value).toBe(true);
    
    act(() => {
      result.current.toggle();
    });
    
    expect(result.current.value).toBe(false);
  });
});
```

### Async Hook Test
```typescript
// hooks/__tests__/useWidget.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useWidget } from '../useWidget';

// Mock fetch
global.fetch = jest.fn();

describe('useWidget', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch widget successfully', async () => {
    const mockWidget = { id: '1', name: 'Test Widget' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockWidget,
    });

    const { result } = renderHook(() => useWidget('1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.widget).toEqual(mockWidget);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    const { result } = renderHook(() => useWidget('1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.widget).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

## 📋 Hook Best Practices

### 1. Keep Hooks Pure
```typescript
// ❌ Bad: Side effects during render
function useBadExample() {
  // Don't do this!
  localStorage.setItem('rendered', 'true');
  return useState(0);
}

// ✅ Good: Side effects in useEffect
function useGoodExample() {
  useEffect(() => {
    localStorage.setItem('rendered', 'true');
  }, []);
  return useState(0);
}
```

### 2. Consistent Return Values
```typescript
// ❌ Bad: Inconsistent returns
function useBadApi(id: string) {
  if (!id) return null;
  return useFetch(`/api/items/${id}`);
}

// ✅ Good: Always return same shape
function useGoodApi(id: string) {
  const enabled = Boolean(id);
  const result = useFetch(`/api/items/${id}`, { enabled });
  return {
    data: result.data ?? null,
    isLoading: enabled ? result.isLoading : false,
    error: result.error ?? null,
  };
}
```

### 3. Memoize Callbacks
```typescript
// ✅ Good: Stable function references
export function useCounter(initialValue = 0) {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(c => c - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return { count, increment, decrement, reset };
}
```

### 4. Handle Cleanup
```typescript
// ✅ Good: Proper cleanup
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
```

## 🚀 Performance Considerations

### Avoid Unnecessary Re-renders
```typescript
// Use useMemo for expensive computations
export function useExpensiveSearch(items: Item[], query: string) {
  return useMemo(() => {
    if (!query) return items;
    
    return items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [items, query]);
}
```

### Batch State Updates
```typescript
// Multiple state updates are batched automatically in React 18+
export function useMultiState() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  const updateBoth = () => {
    // These will be batched
    setCount(c => c + 1);
    setText('Updated');
  };

  return { count, text, updateBoth };
}
```

---

For more information:
- [React Hooks Documentation](https://react.dev/reference/react)
- [Testing Hooks](../TESTING/README.md)
- [Component Development](./COMPONENT-DEVELOPMENT.md)