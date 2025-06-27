import { useEffect, useRef, useCallback, useState } from 'react';
import type { 
  WidgetToParentMessage, 
  ParentToWidgetMessage, 
  IframeMessagingConfig,
  Message,
  ChatWidgetProps 
} from '../types';

interface UseIframeMessagingProps {
  config?: IframeMessagingConfig;
  onConfigReceived?: (config: Partial<ChatWidgetProps>) => void;
  onMessageReceived?: (message: string) => void;
  onClearChat?: () => void;
  onSetPlaceholder?: (placeholder: string) => void;
}

export function useIframeMessaging({
  config = {},
  onConfigReceived,
  onMessageReceived,
  onClearChat,
  onSetPlaceholder,
}: UseIframeMessagingProps) {
  const [isInIframe, setIsInIframe] = useState(false);
  const parentOrigin = useRef<string>('*');
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const resizeTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastHeight = useRef<number>(0);
  const lastWidth = useRef<number>(0);

  const {
    allowedOrigins,
    enableAutoResize = true,
    resizeDebounceMs = 100,
  } = config;

  // Detect if we're in an iframe
  useEffect(() => {
    try {
      const inIframe = window.self !== window.top;
      setIsInIframe(inIframe);
      
      if (inIframe) {
        // Get parent origin from document.referrer if available
        if (document.referrer) {
          try {
            const referrerUrl = new URL(document.referrer);
            parentOrigin.current = referrerUrl.origin;
          } catch (e) {
            console.warn('Failed to parse referrer URL:', e);
          }
        }
      }
    } catch (e) {
      // Cross-origin access denied, we're definitely in an iframe
      setIsInIframe(true);
    }
  }, []);

  // Send message to parent
  const sendToParent = useCallback((message: Omit<WidgetToParentMessage, 'type'>) => {
    if (!isInIframe) return;

    const fullMessage: WidgetToParentMessage = {
      type: 'websyte-ai-chat-widget',
      ...message,
    };

    try {
      window.parent.postMessage(fullMessage, parentOrigin.current);
    } catch (error) {
      console.error('Failed to send message to parent:', error);
    }
  }, [isInIframe]);

  // Validate message origin
  const isOriginAllowed = useCallback((origin: string): boolean => {
    if (!allowedOrigins || allowedOrigins.length === 0) {
      return true; // Accept from any origin if not specified
    }
    return allowedOrigins.includes(origin);
  }, [allowedOrigins]);

  // Handle messages from parent
  const handleMessage = useCallback((event: MessageEvent) => {
    // Validate message structure
    if (!event.data || typeof event.data !== 'object' || event.data.type !== 'websyte-ai-chat-widget') {
      return;
    }

    // Validate origin
    if (!isOriginAllowed(event.origin)) {
      console.warn(`Rejected message from unauthorized origin: ${event.origin}`);
      return;
    }

    const message = event.data as ParentToWidgetMessage;

    switch (message.action) {
      case 'configure':
        if (message.data?.config && onConfigReceived) {
          onConfigReceived(message.data.config);
        }
        break;

      case 'send-message':
        if (message.data?.message && onMessageReceived) {
          onMessageReceived(message.data.message);
        }
        break;

      case 'clear-chat':
        if (onClearChat) {
          onClearChat();
        }
        break;

      case 'set-placeholder':
        if (message.data?.placeholder && onSetPlaceholder) {
          onSetPlaceholder(message.data.placeholder);
        }
        break;

      default:
        console.warn(`Unknown action received: ${message.action}`);
    }
  }, [isOriginAllowed, onConfigReceived, onMessageReceived, onClearChat, onSetPlaceholder]);

  // Set up message listener
  useEffect(() => {
    if (!isInIframe) return;

    window.addEventListener('message', handleMessage);
    
    // Send ready message to parent
    sendToParent({
      action: 'ready',
      data: {},
    });

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isInIframe, handleMessage, sendToParent]);

  // Handle resize observer for auto-resize
  const observeResize = useCallback((element: HTMLElement | null) => {
    if (!isInIframe || !enableAutoResize || !element) return;

    // Clean up existing observer
    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
      resizeObserver.current = null;
    }

    // Create new observer
    resizeObserver.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        
        // Only send if dimensions actually changed
        if (Math.abs(height - lastHeight.current) < 1 && 
            Math.abs(width - lastWidth.current) < 1) {
          return;
        }

        lastHeight.current = height;
        lastWidth.current = width;

        // Debounce resize events
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }

        resizeTimeout.current = setTimeout(() => {
          sendToParent({
            action: 'resize',
            data: { 
              height: Math.ceil(height),
              width: Math.ceil(width)
            },
          });
        }, resizeDebounceMs);
      }
    });

    resizeObserver.current.observe(element);
  }, [isInIframe, enableAutoResize, resizeDebounceMs, sendToParent]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }
      if (resizeTimeout.current) {
        clearTimeout(resizeTimeout.current);
      }
    };
  }, []);

  // API methods
  const notifyChatStarted = useCallback(() => {
    sendToParent({ action: 'chat-started' });
  }, [sendToParent]);

  const notifyChatClosed = useCallback(() => {
    sendToParent({ action: 'chat-closed' });
  }, [sendToParent]);

  const notifyChatResponse = useCallback((message: Message) => {
    sendToParent({
      action: 'chat-response',
      data: { message },
    });
  }, [sendToParent]);

  const notifyError = useCallback((error: string) => {
    sendToParent({
      action: 'error',
      data: { error },
    });
  }, [sendToParent]);

  return {
    isInIframe,
    observeResize,
    notifyChatStarted,
    notifyChatClosed,
    notifyChatResponse,
    notifyError,
  };
}