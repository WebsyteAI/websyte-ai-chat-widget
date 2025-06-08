import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RecommendationsService } from './recommendations'
import { OpenAIService } from './openai'
import type { RecommendationsRequest } from '../types'

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

describe('RecommendationsService', () => {
  let recommendationsService: RecommendationsService
  let mockOpenAI: OpenAIService

  beforeEach(() => {
    mockOpenAI = {
      chatCompletion: vi.fn(),
      generateSummary: vi.fn(),
      generateRecommendations: vi.fn()
    } as any

    recommendationsService = new RecommendationsService(mockOpenAI)
  })

  describe('handleRecommendations', () => {
    it('should return 405 for non-POST methods', async () => {
      const context = createMockContext('GET')
      
      await recommendationsService.handleRecommendations(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
    })

    it('should return 400 when both content and title are missing', async () => {
      const requestBody: RecommendationsRequest = {
        url: 'https://example.com'
      }
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Content or title required" },
        400
      )
    })

    it('should successfully generate recommendations with content', async () => {
      const requestBody: RecommendationsRequest = {
        content: 'This is an article about artificial intelligence and machine learning.',
        title: 'AI Article',
        url: 'https://example.com/ai'
      }
      
      const mockResponse = {
        recommendations: [
          { title: 'What is AI?', description: 'Learn about artificial intelligence' },
          { title: 'How does ML work?', description: 'Understand machine learning' }
        ],
        placeholder: 'Ask me about AI'
      }
      
      ;(mockOpenAI.generateRecommendations as any).mockResolvedValue(mockResponse)
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(mockOpenAI.generateRecommendations).toHaveBeenCalledWith(
        'This is an article about artificial intelligence and machine learning.',
        'AI Article',
        'https://example.com/ai',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should work with only title provided', async () => {
      const requestBody: RecommendationsRequest = {
        title: 'Climate Change Article',
        url: 'https://example.com/climate'
      }
      
      const mockResponse = {
        recommendations: [
          { title: 'What causes climate change?', description: 'Understand the causes' }
        ],
        placeholder: 'Ask me about climate'
      }
      
      ;(mockOpenAI.generateRecommendations as any).mockResolvedValue(mockResponse)
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(mockOpenAI.generateRecommendations).toHaveBeenCalledWith(
        '',
        'Climate Change Article',
        'https://example.com/climate',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should work with only content provided', async () => {
      const requestBody: RecommendationsRequest = {
        content: 'Article content about renewable energy'
      }
      
      const mockResponse = {
        recommendations: [
          { title: 'How does solar work?', description: 'Learn about solar energy' }
        ],
        placeholder: 'Ask me about energy'
      }
      
      ;(mockOpenAI.generateRecommendations as any).mockResolvedValue(mockResponse)
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(mockOpenAI.generateRecommendations).toHaveBeenCalledWith(
        'Article content about renewable energy',
        '',
        '',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should handle undefined values gracefully', async () => {
      const requestBody: RecommendationsRequest = {
        content: 'Test content',
        title: undefined,
        url: undefined
      }
      
      const mockResponse = {
        recommendations: [
          { title: 'Test question?', description: 'Test description' }
        ],
        placeholder: 'Ask me about this'
      }
      
      ;(mockOpenAI.generateRecommendations as any).mockResolvedValue(mockResponse)
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(mockOpenAI.generateRecommendations).toHaveBeenCalledWith(
        'Test content',
        '',
        '',
        expect.any(AbortSignal)
      )
    })

    it('should handle abort error', async () => {
      const requestBody: RecommendationsRequest = {
        content: 'Test content',
        title: 'Test Article'
      }
      
      const abortError = new Error('Request aborted')
      abortError.name = 'AbortError'
      
      ;(mockOpenAI.generateRecommendations as any).mockRejectedValue(abortError)
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(context.json).toHaveBeenCalledWith(
        {
          error: "Request cancelled",
          recommendations: [],
          placeholder: "Ask me about this content"
        },
        499
      )
    })

    it('should return fallback response on general error', async () => {
      const requestBody: RecommendationsRequest = {
        content: 'Test content',
        title: 'Test Article'
      }
      
      const generalError = new Error('OpenAI API error')
      
      ;(mockOpenAI.generateRecommendations as any).mockRejectedValue(generalError)
      
      const context = createMockContext('POST', requestBody)
      
      // Spy on console.error to verify error logging
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      await recommendationsService.handleRecommendations(context)
      
      expect(consoleSpy).toHaveBeenCalledWith("Recommendations API error:", generalError)
      
      const expectedFallbackResponse = {
        recommendations: [
          { title: "What is this about?", description: "Understand the main topic" },
          { title: "How does this work?", description: "Learn the process" },
          { title: "Why is this important?", description: "Explore the significance" },
          { title: "What are the implications?", description: "Consider the impact" },
          { title: "Who is this for?", description: "Identify the target audience" },
          { title: "What happens next?", description: "Explore future steps" }
        ],
        placeholder: "Ask me about this article"
      }
      
      expect(context.json).toHaveBeenCalledWith(expectedFallbackResponse, 200)
      
      consoleSpy.mockRestore()
    })

    it('should handle malformed request body', async () => {
      const requestBody = {
        // Missing content, title, and url
      }
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Content or title required" },
        400
      )
    })

    it('should handle empty string values correctly', async () => {
      const requestBody: RecommendationsRequest = {
        content: '',
        title: 'Valid Title',
        url: ''
      }
      
      const mockResponse = {
        recommendations: [
          { title: 'About this title?', description: 'Learn more' }
        ],
        placeholder: 'Ask me about this'
      }
      
      ;(mockOpenAI.generateRecommendations as any).mockResolvedValue(mockResponse)
      
      const context = createMockContext('POST', requestBody)
      
      await recommendationsService.handleRecommendations(context)
      
      // Should pass validation since title is provided
      expect(mockOpenAI.generateRecommendations).toHaveBeenCalledWith(
        '',
        'Valid Title',
        '',
        expect.any(AbortSignal)
      )
      
      expect(context.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should use abort signal from request', async () => {
      const abortController = new AbortController()
      const requestBody: RecommendationsRequest = {
        content: 'Test content',
        title: 'Test Article'
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
      
      const mockResponse = {
        recommendations: [],
        placeholder: 'Ask me'
      }
      
      ;(mockOpenAI.generateRecommendations as any).mockResolvedValue(mockResponse)
      
      await recommendationsService.handleRecommendations(mockContext as any)
      
      expect(mockOpenAI.generateRecommendations).toHaveBeenCalledWith(
        'Test content',
        'Test Article',
        '',
        abortController.signal
      )
    })
  })
})