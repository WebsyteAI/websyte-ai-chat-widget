import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SummarizeService } from './summarize'
import { OpenAIService } from './openai'
import type { SummarizeRequest } from '../types'

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

describe('SummarizeService', () => {
  let summarizeService: SummarizeService
  let mockOpenAI: OpenAIService

  beforeEach(() => {
    mockOpenAI = {
      chatCompletion: vi.fn(),
      generateSummary: vi.fn(),
      generateRecommendations: vi.fn()
    } as any

    summarizeService = new SummarizeService(mockOpenAI)
  })

  describe('handleSummarize', () => {
    it('should return 405 for non-POST methods', async () => {
      const context = createMockContext('GET')
      
      await summarizeService.handleSummarize(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
    })

    it('should return 400 for missing content', async () => {
      const requestBody: SummarizeRequest = {
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Invalid content" },
        400
      )
    })

    it('should return 400 for non-string content', async () => {
      const requestBody = {
        content: 123, // Should be string
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Invalid content" },
        400
      )
    })

    it('should return 400 for empty string content', async () => {
      const requestBody: SummarizeRequest = {
        content: '',
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Invalid content" },
        400
      )
    })

    it('should successfully generate summary', async () => {
      const requestBody: SummarizeRequest = {
        content: 'This is a long article about artificial intelligence and its applications in modern technology. It covers machine learning, deep learning, and neural networks.',
        url: 'https://example.com/ai-article',
        title: 'AI in Modern Technology'
      }
      
      const mockSummary = 'This article discusses AI technology, covering machine learning and its applications.'
      
      ;(mockOpenAI.generateSummary as any).mockResolvedValue(mockSummary)
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(mockOpenAI.generateSummary).toHaveBeenCalledWith(
        requestBody.content,
        'AI in Modern Technology',
        'https://example.com/ai-article',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith({
        summary: mockSummary
      })
    })

    it('should handle optional url and title', async () => {
      const requestBody: SummarizeRequest = {
        content: 'Article content without metadata'
      }
      
      const mockSummary = 'Summary of the content'
      
      ;(mockOpenAI.generateSummary as any).mockResolvedValue(mockSummary)
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(mockOpenAI.generateSummary).toHaveBeenCalledWith(
        'Article content without metadata',
        '',
        '',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith({
        summary: mockSummary
      })
    })

    it('should handle undefined url and title', async () => {
      const requestBody: SummarizeRequest = {
        content: 'Article content',
        url: undefined,
        title: undefined
      }
      
      const mockSummary = 'Summary'
      
      ;(mockOpenAI.generateSummary as any).mockResolvedValue(mockSummary)
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(mockOpenAI.generateSummary).toHaveBeenCalledWith(
        'Article content',
        '',
        '',
        expect.any(AbortSignal)
      )
    })

    it('should handle very long content', async () => {
      const longContent = 'This is a very long article. '.repeat(1000)
      
      const requestBody: SummarizeRequest = {
        content: longContent,
        url: 'https://example.com/long-article',
        title: 'Very Long Article'
      }
      
      const mockSummary = 'This is a summary of the very long article.'
      
      ;(mockOpenAI.generateSummary as any).mockResolvedValue(mockSummary)
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(mockOpenAI.generateSummary).toHaveBeenCalledWith(
        longContent,
        'Very Long Article',
        'https://example.com/long-article',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith({
        summary: mockSummary
      })
    })

    it('should handle OpenAI API errors', async () => {
      const requestBody: SummarizeRequest = {
        content: 'Article content',
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const apiError = new Error('OpenAI API rate limit exceeded')
      
      ;(mockOpenAI.generateSummary as any).mockRejectedValue(apiError)
      
      const context = createMockContext('POST', requestBody)
      
      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await summarizeService.handleSummarize(context)
      
      expect(consoleSpy).toHaveBeenCalledWith("Summarize API error:", apiError)
      
      expect(context.json).toHaveBeenCalledWith(
        {
          error: "Internal server error",
          summary: "Sorry, I couldn't generate a summary right now."
        },
        500
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      const requestBody: SummarizeRequest = {
        content: 'Article content',
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const networkError = new Error('Network error')
      
      ;(mockOpenAI.generateSummary as any).mockRejectedValue(networkError)
      
      const context = createMockContext('POST', requestBody)
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await summarizeService.handleSummarize(context)
      
      expect(consoleSpy).toHaveBeenCalledWith("Summarize API error:", networkError)
      
      expect(context.json).toHaveBeenCalledWith(
        {
          error: "Internal server error",
          summary: "Sorry, I couldn't generate a summary right now."
        },
        500
      )
      
      consoleSpy.mockRestore()
    })

    it('should use abort signal from request', async () => {
      const abortController = new AbortController()
      const requestBody: SummarizeRequest = {
        content: 'Article content'
      }
      
      const mockRequest = {
        method: 'POST',
        json: vi.fn().mockResolvedValue(requestBody),
        raw: {
          signal: abortController.signal
        }
      }

      const mockContext = {
        req: mockRequest,
        json: vi.fn()
      }
      
      const mockSummary = 'Test summary'
      
      ;(mockOpenAI.generateSummary as any).mockResolvedValue(mockSummary)
      
      await summarizeService.handleSummarize(mockContext as any)
      
      expect(mockOpenAI.generateSummary).toHaveBeenCalledWith(
        'Article content',
        '',
        '',
        abortController.signal
      )
    })

    it('should handle malformed JSON request', async () => {
      const context = createMockContext('POST', {})
      
      // Mock request.json() to throw an error
      context.req.json.mockRejectedValue(new Error('Invalid JSON'))
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await summarizeService.handleSummarize(context)
      
      expect(consoleSpy).toHaveBeenCalledWith("Summarize API error:", expect.any(Error))
      
      expect(context.json).toHaveBeenCalledWith(
        {
          error: "Internal server error",
          summary: "Sorry, I couldn't generate a summary right now."
        },
        500
      )
      
      consoleSpy.mockRestore()
    })

    it('should handle content with special characters', async () => {
      const requestBody: SummarizeRequest = {
        content: 'Article with émojis 🚀 and spéciál chàracters & symbols like @#$%',
        url: 'https://example.com/special',
        title: 'Special Characters Article'
      }
      
      const mockSummary = 'Summary with special content'
      
      ;(mockOpenAI.generateSummary as any).mockResolvedValue(mockSummary)
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(mockOpenAI.generateSummary).toHaveBeenCalledWith(
        'Article with émojis 🚀 and spéciál chàracters & symbols like @#$%',
        'Special Characters Article',
        'https://example.com/special',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith({
        summary: mockSummary
      })
    })

    it('should handle whitespace-only content as invalid', async () => {
      const requestBody: SummarizeRequest = {
        content: '   \n\t  \r\n  ', // Only whitespace
        url: 'https://example.com',
        title: 'Test Article'
      }
      
      const context = createMockContext('POST', requestBody)
      
      await summarizeService.handleSummarize(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Invalid content" },
        400
      )
    })
  })
})