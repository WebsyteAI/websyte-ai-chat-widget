import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ChatService } from './chat'
import { OpenAIService } from './openai'
import type { ChatRequest, ChatMessage } from '../types'

// Mock Hono Context
const createMockContext = (method: string = 'POST', body: any = {}) => {
  const mockRequest = {
    method,
    json: vi.fn().mockResolvedValue(body),
    raw: {
      signal: new AbortController().signal
    }
  }

  const mockContext = {
    req: mockRequest,
    json: vi.fn()
  }

  return mockContext as any
}

describe('ChatService', () => {
  let chatService: ChatService
  let mockOpenAI: OpenAIService

  beforeEach(() => {
    mockOpenAI = {
      chatCompletion: vi.fn(),
      generateSummary: vi.fn(),
      generateRecommendations: vi.fn()
    } as any

    chatService = new ChatService(mockOpenAI)
  })

  describe('handleChat', () => {
    it('should return 405 for non-POST methods', async () => {
      const context = createMockContext('GET')
      
      const response = await chatService.handleChat(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
    })

    it('should return 400 for missing message', async () => {
      const requestBody = {
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'Test content'
        }
      }
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Invalid message" },
        400
      )
    })

    it('should return 400 for invalid message type', async () => {
      const requestBody = {
        message: 123, // Should be string
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'Test content'
        }
      }
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Invalid message" },
        400
      )
    })

    it('should return 400 for missing context', async () => {
      const requestBody = {
        message: 'Hello'
      }
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Content context is required" },
        400
      )
    })

    it('should successfully process chat request', async () => {
      const requestBody: ChatRequest = {
        message: 'What is this article about?',
        history: [
          { role: 'user', content: 'Previous question' },
          { role: 'assistant', content: 'Previous answer' }
        ],
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'This is test article content about AI.'
        }
      }
      
      const mockResponse = 'This article is about AI technology.'
      
      ;(mockOpenAI.chatCompletion as any).mockResolvedValue(mockResponse)
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      // Verify OpenAI was called with correct messages
      expect(mockOpenAI.chatCompletion).toHaveBeenCalledWith(
        [
          {
            role: 'system',
            content: expect.stringContaining('You are a helpful AI assistant embedded on the webpage "Test Article" (https://example.com)')
          },
          { role: 'user', content: 'Previous question' },
          { role: 'assistant', content: 'Previous answer' },
          { role: 'user', content: 'What is this article about?' }
        ],
        {
          model: 'gpt-4.1-mini',
          temperature: 0.2,
          signal: expect.any(AbortSignal)
        }
      )
      
      expect(context.json).toHaveBeenCalledWith({
        message: mockResponse
      })
    })

    it('should truncate long content in system prompt', async () => {
      const longContent = 'a'.repeat(75000)
      
      const requestBody: ChatRequest = {
        message: 'Test message',
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: longContent
        }
      }
      
      ;(mockOpenAI.chatCompletion as any).mockResolvedValue('Response')
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      const callArgs = (mockOpenAI.chatCompletion as any).mock.calls[0]
      const systemMessage = callArgs[0][0].content
      
      // Should truncate to 50000 characters
      expect(systemMessage).toContain(longContent.slice(0, 50000))
      expect(systemMessage.length).toBeLessThan(longContent.length + 500) // Allow for system prompt text
    })

    it('should limit history to last 10 messages', async () => {
      const longHistory: ChatMessage[] = Array.from({ length: 15 }, (_, i) => ({
        role: i % 2 === 0 ? 'user' : 'assistant',
        content: `Message ${i}`
      }))
      
      const requestBody: ChatRequest = {
        message: 'New message',
        history: longHistory,
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'Test content'
        }
      }
      
      ;(mockOpenAI.chatCompletion as any).mockResolvedValue('Response')
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      const callArgs = (mockOpenAI.chatCompletion as any).mock.calls[0]
      const messages = callArgs[0]
      
      // Should have system message + last 10 history messages + current user message
      expect(messages).toHaveLength(12)
      expect(messages[0].role).toBe('system')
      expect(messages[messages.length - 1]).toEqual({
        role: 'user',
        content: 'New message'
      })
      
      // Verify it's the last 10 messages from history
      expect(messages[1].content).toBe('Message 5') // Should start from index 5 (last 10)
    })

    it('should handle context without content', async () => {
      const requestBody: ChatRequest = {
        message: 'Hello',
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: ''
        }
      }
      
      ;(mockOpenAI.chatCompletion as any).mockResolvedValue('Response')
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      const callArgs = (mockOpenAI.chatCompletion as any).mock.calls[0]
      const systemMessage = callArgs[0][0].content
      
      expect(systemMessage).toContain('You can help users with questions about this webpage.')
      expect(systemMessage).not.toContain('Page content:')
    })

    it('should handle abort error', async () => {
      const requestBody: ChatRequest = {
        message: 'Test message',
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'Test content'
        }
      }
      
      const abortError = new Error('Request aborted')
      abortError.name = 'AbortError'
      
      ;(mockOpenAI.chatCompletion as any).mockRejectedValue(abortError)
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      expect(context.json).toHaveBeenCalledWith(
        {
          error: "Request cancelled",
          message: "Request was cancelled by the user."
        },
        499
      )
    })

    it('should handle general errors', async () => {
      const requestBody: ChatRequest = {
        message: 'Test message',
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'Test content'
        }
      }
      
      const generalError = new Error('OpenAI API error')
      
      ;(mockOpenAI.chatCompletion as any).mockRejectedValue(generalError)
      
      const context = createMockContext('POST', requestBody)
      
      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await chatService.handleChat(context)
      
      expect(consoleSpy).toHaveBeenCalledWith("Chat API error:", generalError)
      expect(context.json).toHaveBeenCalledWith(
        {
          error: "Internal server error",
          message: "Sorry, I'm having trouble processing your request right now."
        },
        500
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle empty history gracefully', async () => {
      const requestBody: ChatRequest = {
        message: 'Test message',
        history: [],
        context: {
          title: 'Test Article',
          url: 'https://example.com',
          content: 'Test content'
        }
      }
      
      ;(mockOpenAI.chatCompletion as any).mockResolvedValue('Response')
      
      const context = createMockContext('POST', requestBody)
      
      await chatService.handleChat(context)
      
      const callArgs = (mockOpenAI.chatCompletion as any).mock.calls[0]
      const messages = callArgs[0]
      
      // Should have system message + current user message
      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('system')
      expect(messages[1]).toEqual({
        role: 'user',
        content: 'Test message'
      })
    })
  })
})