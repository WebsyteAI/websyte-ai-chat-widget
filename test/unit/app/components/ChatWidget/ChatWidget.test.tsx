import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../../../../../app/test-utils';
import userEvent from '@testing-library/user-event';
import { ChatWidget } from '../../../../../app/components/ChatWidget/ChatWidget';
import { ContentExtractor } from '../../../../../app/lib/content-extractor';
import { UmamiTracking } from '../../../../../app/lib/umami-tracker';
import type { ChatWidgetProps, Recommendation, WidgetLink } from '../../../../../app/components/ChatWidget/types';

// Mock dependencies
vi.mock('../../../../../app/lib/content-extractor');
vi.mock('../../../../../app/lib/umami-tracker');
vi.mock('../../../../../app/lib/logger', () => ({
  createLogger: () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  })
}));

// Mock hooks
vi.mock('../../../../../app/components/ChatWidget/hooks', () => ({
  useChatMessages: () => ({
    messages: [],
    addMessage: vi.fn(),
    clearMessages: vi.fn()
  }),
  useAudioPlayer: () => ({
    isPlaying: false,
    audioProgress: 0,
    playbackSpeed: 1,
    elapsedTime: 0,
    totalTime: 180,
    handlePlayPause: vi.fn(),
    handleSpeedChange: vi.fn(),
    formatTime: (time: number) => `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`,
    setAudioProgress: vi.fn(),
    setIsPlaying: vi.fn(),
    setElapsedTime: vi.fn()
  }),
  useContentSummarization: () => ({
    summaries: { long: '', medium: '', short: '' },
    isLoadingSummaries: false,
    currentContentMode: 'full',
    originalContent: 'Original page content',
    targetElement: null,
    mainContentElement: null,
    setOriginalContent: vi.fn(),
    setTargetElement: vi.fn(),
    setMainContentElement: vi.fn(),
    handleContentModeChange: vi.fn(),
    loadSummaries: vi.fn()
  }),
  useIframeMessaging: () => ({
    isInIframe: false,
    observeResize: vi.fn(),
    notifyChatStarted: vi.fn(),
    notifyChatClosed: vi.fn(),
    notifyChatResponse: vi.fn(),
    notifyError: vi.fn()
  })
}));

// Mock components
vi.mock('../../../../../app/components/ChatWidget/components', () => ({
  ActionBar: ({ onChat, hasContent }: any) => (
    <div data-testid="action-bar">
      <button onClick={onChat} disabled={!hasContent}>Start Chat</button>
    </div>
  ),
  AudioPlayer: ({ isPlaying, onPlayPause }: any) => (
    <div data-testid="audio-player">
      <button onClick={onPlayPause}>{isPlaying ? 'Pause' : 'Play'}</button>
    </div>
  ),
  ChatPanel: ({ messages, onSendMessage, isLoading }: any) => (
    <div data-testid="chat-panel">
      <div>Messages: {messages.length}</div>
      <button onClick={() => onSendMessage('Test message')} disabled={isLoading}>
        Send
      </button>
    </div>
  ),
  RecommendationsList: ({ recommendations, onSelect }: any) => (
    <div data-testid="recommendations-list">
      {recommendations.map((rec: Recommendation, idx: number) => (
        <button key={idx} onClick={() => onSelect(rec.text)}>
          {rec.text}
        </button>
      ))}
    </div>
  )
}));

const mockRecommendations: Recommendation[] = [
  { text: 'How to get started?', response: 'Follow these steps...' },
  { text: 'What are the features?', response: 'Our features include...' }
];

const mockLinks: WidgetLink[] = [
  { url: 'https://example.com/docs', text: 'Documentation', importance: 'high', category: 'docs' },
  { url: 'https://example.com/api', text: 'API Reference', importance: 'medium', category: 'api' }
];

describe('ChatWidget', () => {
  const defaultProps: ChatWidgetProps = {
    baseUrl: 'https://api.example.com',
    advertiserName: 'Test Company',
    advertiserLogo: 'https://example.com/logo.png',
    advertiserUrl: 'https://example.com',
    widgetId: 'widget-1',
    widgetName: 'Test Widget',
    recommendations: mockRecommendations
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    (ContentExtractor.extractPageContent as any).mockReturnValue('Page content');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<ChatWidget {...defaultProps} />);
      
      expect(screen.getByTestId('action-bar')).toBeInTheDocument();
      expect(screen.getByText('Start Chat')).toBeInTheDocument();
    });

    it('should render in full screen mode', () => {
      render(<ChatWidget {...defaultProps} isFullScreen={true} />);
      
      const container = screen.getByTestId('action-bar').closest('div');
      expect(container).toHaveClass('fixed');
    });

    it('should render in embed mode', () => {
      render(<ChatWidget {...defaultProps} isEmbed={true} />);
      
      const container = screen.getByTestId('action-bar').closest('div');
      expect(container).toHaveClass('relative');
    });

    it('should hide powered by when specified', () => {
      render(<ChatWidget {...defaultProps} hidePoweredBy={true} />);
      
      // Powered by should not be visible
      expect(screen.queryByText(/Powered by/i)).not.toBeInTheDocument();
    });
  });

  describe('Content Extraction', () => {
    it('should extract page content on mount', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      await waitFor(() => {
        expect(ContentExtractor.extractPageContent).toHaveBeenCalled();
      });
    });

    it('should use custom content selector if provided', async () => {
      const contentSelector = '.main-content';
      render(<ChatWidget {...defaultProps} contentSelector={contentSelector} />);
      
      await waitFor(() => {
        expect(ContentExtractor.extractPageContent).toHaveBeenCalledWith(
          expect.objectContaining({
            contentSelector
          })
        );
      });
    });

    it('should handle content extraction errors', async () => {
      (ContentExtractor.extractPageContent as any).mockImplementation(() => {
        throw new Error('Extraction failed');
      });
      
      render(<ChatWidget {...defaultProps} />);
      
      // Should still render without crashing
      expect(screen.getByTestId('action-bar')).toBeInTheDocument();
    });
  });

  describe('Widget Data Loading', () => {
    it('should fetch widget info on mount if widgetId provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          widget: {
            name: 'Fetched Widget',
            logoUrl: 'https://example.com/fetched-logo.png',
            links: mockLinks
          }
        })
      });
      
      render(<ChatWidget {...defaultProps} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${defaultProps.baseUrl}/api/widgets/${defaultProps.widgetId}/public`,
          expect.any(Object)
        );
      });
    });

    it('should handle widget fetch errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Fetch failed'));
      
      render(<ChatWidget {...defaultProps} />);
      
      // Should still render with default data
      expect(screen.getByTestId('action-bar')).toBeInTheDocument();
    });
  });

  describe('Chat Functionality', () => {
    it('should switch to chat view when chat button clicked', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      const chatButton = screen.getByText('Start Chat');
      await userEvent.click(chatButton);
      
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('should send message when send button clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => ({
            read: vi.fn()
              .mockResolvedValueOnce({ 
                done: false, 
                value: new TextEncoder().encode('data: {"text": "Response"}\n\n') 
              })
              .mockResolvedValueOnce({ done: true })
          })
        }
      });
      
      render(<ChatWidget {...defaultProps} />);
      
      // Switch to chat view
      await userEvent.click(screen.getByText('Start Chat'));
      
      // Send message
      const sendButton = screen.getByText('Send');
      await userEvent.click(sendButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/chat'),
          expect.objectContaining({
            method: 'POST'
          })
        );
      });
    });

    it('should handle streaming responses', async () => {
      const mockReader = {
        read: vi.fn()
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode('data: {"text": "Part 1"}\n\n') 
          })
          .mockResolvedValueOnce({ 
            done: false, 
            value: new TextEncoder().encode('data: {"text": " Part 2"}\n\n') 
          })
          .mockResolvedValueOnce({ done: true })
      };
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      });
      
      render(<ChatWidget {...defaultProps} />);
      
      await userEvent.click(screen.getByText('Start Chat'));
      await userEvent.click(screen.getByText('Send'));
      
      await waitFor(() => {
        expect(mockReader.read).toHaveBeenCalled();
      });
    });

    it('should handle chat errors', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Chat failed'));
      
      render(<ChatWidget {...defaultProps} />);
      
      await userEvent.click(screen.getByText('Start Chat'));
      await userEvent.click(screen.getByText('Send'));
      
      // Should handle error gracefully
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });
  });

  describe('Recommendations', () => {
    it('should display recommendations', () => {
      render(<ChatWidget {...defaultProps} />);
      
      expect(screen.getByTestId('recommendations-list')).toBeInTheDocument();
      mockRecommendations.forEach(rec => {
        expect(screen.getByText(rec.text)).toBeInTheDocument();
      });
    });

    it('should handle recommendation selection', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      const firstRecommendation = screen.getByText(mockRecommendations[0].text);
      await userEvent.click(firstRecommendation);
      
      // Should switch to chat view
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
    });

    it('should fetch recommendations if not provided', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: mockRecommendations
        })
      });
      
      render(<ChatWidget {...defaultProps} recommendations={undefined} />);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/recommendations'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Audio Player', () => {
    it('should toggle between action bar and audio player', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      // Initially should show action bar
      expect(screen.getByTestId('action-bar')).toBeInTheDocument();
      expect(screen.queryByTestId('audio-player')).not.toBeInTheDocument();
      
      // TODO: Add audio toggle functionality test when implemented
    });
  });

  describe('Content Mode', () => {
    it('should handle content mode changes', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      // TODO: Add content mode change tests when dropdown is visible
    });
  });

  describe('Iframe Communication', () => {
    it('should send resize events when in iframe', async () => {
      const mockObserveResize = vi.fn();
      vi.mocked(useIframeMessaging).mockReturnValue({
        isInIframe: true,
        observeResize: mockObserveResize,
        notifyChatStarted: vi.fn(),
        notifyChatClosed: vi.fn(),
        notifyChatResponse: vi.fn(),
        notifyError: vi.fn()
      });
      
      render(<ChatWidget {...defaultProps} />);
      
      expect(mockObserveResize).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('should handle Escape key to close chat', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      // Open chat
      await userEvent.click(screen.getByText('Start Chat'));
      expect(screen.getByTestId('chat-panel')).toBeInTheDocument();
      
      // Press Escape
      fireEvent.keyDown(document, { key: 'Escape' });
      
      // Should return to main view
      expect(screen.queryByTestId('chat-panel')).not.toBeInTheDocument();
      expect(screen.getByTestId('action-bar')).toBeInTheDocument();
    });

    it('should handle keyboard navigation in chat', async () => {
      render(<ChatWidget {...defaultProps} />);
      
      await userEvent.click(screen.getByText('Start Chat'));
      
      // TODO: Add more keyboard navigation tests
    });
  });

  describe('Analytics', () => {
    it('should track chat opened event', async () => {
      const mockTrackEvent = vi.fn();
      (UmamiTracking as any).mockReturnValue({
        trackEvent: mockTrackEvent
      });
      
      render(<ChatWidget {...defaultProps} />);
      
      await userEvent.click(screen.getByText('Start Chat'));
      
      expect(mockTrackEvent).toHaveBeenCalledWith(
        expect.stringContaining('chat_opened')
      );
    });
  });

  describe('Error Boundaries', () => {
    it('should handle component errors gracefully', () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Force an error in a child component
      vi.mocked(ActionBar).mockImplementation(() => {
        throw new Error('Component error');
      });
      
      // Should not crash the entire widget
      expect(() => render(<ChatWidget {...defaultProps} />)).not.toThrow();
      
      consoleSpy.mockRestore();
    });
  });
});