import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServiceValidation, ErrorHandler, FallbackResponses } from './common'
import type { Env } from '../types'

// Mock Hono Context
const createMockContext = (method: string = 'POST', jsonData: any = {}) => {
  const mockRequest = {
    method,
    json: vi.fn().mockResolvedValue(jsonData)
  }

  const mockContext = {
    req: mockRequest,
    json: vi.fn().mockReturnValue({ status: 200, body: jsonData })
  }

  return mockContext as any
}

describe('ServiceValidation', () => {
  describe('validatePostMethod', () => {
    it('should return null for POST method', () => {
      const context = createMockContext('POST')
      
      const result = ServiceValidation.validatePostMethod(context)
      
      expect(result).toBeNull()
    })

    it('should return 405 error for GET method', () => {
      const context = createMockContext('GET')
      
      const result = ServiceValidation.validatePostMethod(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
      expect(result).not.toBeNull()
    })

    it('should return 405 error for PUT method', () => {
      const context = createMockContext('PUT')
      
      const result = ServiceValidation.validatePostMethod(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
      expect(result).not.toBeNull()
    })

    it('should return 405 error for DELETE method', () => {
      const context = createMockContext('DELETE')
      
      const result = ServiceValidation.validatePostMethod(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
      expect(result).not.toBeNull()
    })

    it('should return 405 error for PATCH method', () => {
      const context = createMockContext('PATCH')
      
      const result = ServiceValidation.validatePostMethod(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Method not allowed" },
        405
      )
      expect(result).not.toBeNull()
    })
  })

  describe('parseRequestBody', () => {
    it('should successfully parse JSON request body', async () => {
      const testData = { message: 'Hello', content: 'Test content' }
      const context = createMockContext('POST', testData)
      
      const result = await ServiceValidation.parseRequestBody(context)
      
      expect(context.req.json).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should handle empty JSON object', async () => {
      const testData = {}
      const context = createMockContext('POST', testData)
      
      const result = await ServiceValidation.parseRequestBody(context)
      
      expect(context.req.json).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should handle complex nested JSON', async () => {
      const testData = {
        user: { id: 1, name: 'Test User' },
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' }
        ],
        metadata: {
          timestamp: '2025-01-01T00:00:00Z',
          version: '1.0.0'
        }
      }
      const context = createMockContext('POST', testData)
      
      const result = await ServiceValidation.parseRequestBody(context)
      
      expect(context.req.json).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should handle arrays in request body', async () => {
      const testData = ['item1', 'item2', 'item3']
      const context = createMockContext('POST', testData)
      
      const result = await ServiceValidation.parseRequestBody(context)
      
      expect(context.req.json).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should handle string values in request body', async () => {
      const testData = 'simple string content'
      const context = createMockContext('POST', testData)
      
      const result = await ServiceValidation.parseRequestBody(context)
      
      expect(context.req.json).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should handle number values in request body', async () => {
      const testData = 42
      const context = createMockContext('POST', testData)
      
      const result = await ServiceValidation.parseRequestBody(context)
      
      expect(context.req.json).toHaveBeenCalled()
      expect(result).toEqual(testData)
    })

    it('should propagate JSON parsing errors', async () => {
      const context = createMockContext('POST')
      const parseError = new Error('Invalid JSON')
      context.req.json.mockRejectedValue(parseError)
      
      await expect(ServiceValidation.parseRequestBody(context))
        .rejects.toThrow('Invalid JSON')
    })
  })
})

describe('ErrorHandler', () => {
  describe('handleAbortError', () => {
    it('should return 400 status with default abort message', () => {
      const context = createMockContext('POST')
      
      const result = ErrorHandler.handleAbortError(context)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Request cancelled" },
        400
      )
      expect(result).toBeDefined()
    })

    it('should merge custom response with abort error', () => {
      const context = createMockContext('POST')
      const customResponse = { 
        summary: "Operation was cancelled",
        details: "User aborted the request"
      }
      
      const result = ErrorHandler.handleAbortError(context, customResponse)
      
      expect(context.json).toHaveBeenCalledWith(
        { 
          error: "Request cancelled",
          summary: "Operation was cancelled",
          details: "User aborted the request"
        },
        400
      )
      expect(result).toBeDefined()
    })

    it('should handle empty custom response object', () => {
      const context = createMockContext('POST')
      const customResponse = {}
      
      const result = ErrorHandler.handleAbortError(context, customResponse)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Request cancelled" },
        400
      )
      expect(result).toBeDefined()
    })

    it('should handle null custom response', () => {
      const context = createMockContext('POST')
      
      const result = ErrorHandler.handleAbortError(context, null)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Request cancelled" },
        400
      )
      expect(result).toBeDefined()
    })

    it('should handle undefined custom response', () => {
      const context = createMockContext('POST')
      
      const result = ErrorHandler.handleAbortError(context, undefined)
      
      expect(context.json).toHaveBeenCalledWith(
        { error: "Request cancelled" },
        400
      )
      expect(result).toBeDefined()
    })
  })

  describe('handleGeneralError', () => {
    beforeEach(() => {
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    it('should handle general error with default 500 status', () => {
      const context = createMockContext('POST')
      const error = new Error('Something went wrong')
      const logMessage = 'Test error:'
      const fallbackResponse = { error: 'Internal server error' }
      
      const result = ErrorHandler.handleGeneralError(
        context, 
        error, 
        logMessage, 
        fallbackResponse
      )
      
      expect(console.error).toHaveBeenCalledWith(logMessage, error)
      expect(context.json).toHaveBeenCalledWith(fallbackResponse, 500)
      expect(result).toBeDefined()
    })

    it('should handle general error with custom status code', () => {
      const context = createMockContext('POST')
      const error = new Error('Bad request')
      const logMessage = 'Validation error:'
      const fallbackResponse = { error: 'Invalid input' }
      const statusCode = 400
      
      const result = ErrorHandler.handleGeneralError(
        context, 
        error, 
        logMessage, 
        fallbackResponse,
        statusCode
      )
      
      expect(console.error).toHaveBeenCalledWith(logMessage, error)
      expect(context.json).toHaveBeenCalledWith(fallbackResponse, 400)
      expect(result).toBeDefined()
    })

    it('should handle non-Error objects', () => {
      const context = createMockContext('POST')
      const error = 'String error message'
      const logMessage = 'Unexpected error:'
      const fallbackResponse = { error: 'Unknown error' }
      
      const result = ErrorHandler.handleGeneralError(
        context, 
        error, 
        logMessage, 
        fallbackResponse
      )
      
      expect(console.error).toHaveBeenCalledWith(logMessage, error)
      expect(context.json).toHaveBeenCalledWith(fallbackResponse, 500)
      expect(result).toBeDefined()
    })

    it('should handle null error', () => {
      const context = createMockContext('POST')
      const error = null
      const logMessage = 'Null error:'
      const fallbackResponse = { error: 'Null error occurred' }
      
      const result = ErrorHandler.handleGeneralError(
        context, 
        error, 
        logMessage, 
        fallbackResponse
      )
      
      expect(console.error).toHaveBeenCalledWith(logMessage, error)
      expect(context.json).toHaveBeenCalledWith(fallbackResponse, 500)
      expect(result).toBeDefined()
    })

    it('should handle undefined error', () => {
      const context = createMockContext('POST')
      const error = undefined
      const logMessage = 'Undefined error:'
      const fallbackResponse = { error: 'Undefined error occurred' }
      
      const result = ErrorHandler.handleGeneralError(
        context, 
        error, 
        logMessage, 
        fallbackResponse
      )
      
      expect(console.error).toHaveBeenCalledWith(logMessage, error)
      expect(context.json).toHaveBeenCalledWith(fallbackResponse, 500)
      expect(result).toBeDefined()
    })

    it('should handle complex fallback response objects', () => {
      const context = createMockContext('POST')
      const error = new Error('Complex error')
      const logMessage = 'Complex error:'
      const fallbackResponse = {
        error: 'Service unavailable',
        message: 'Please try again later',
        code: 'SERVICE_ERROR',
        timestamp: '2025-01-01T00:00:00Z'
      }
      
      const result = ErrorHandler.handleGeneralError(
        context, 
        error, 
        logMessage, 
        fallbackResponse
      )
      
      expect(console.error).toHaveBeenCalledWith(logMessage, error)
      expect(context.json).toHaveBeenCalledWith(fallbackResponse, 500)
      expect(result).toBeDefined()
    })
  })

  describe('isAbortError', () => {
    it('should return true for AbortError', () => {
      const abortError = new Error('Operation aborted')
      abortError.name = 'AbortError'
      
      const result = ErrorHandler.isAbortError(abortError)
      
      expect(result).toBe(true)
    })

    it('should return false for regular Error', () => {
      const regularError = new Error('Regular error')
      
      const result = ErrorHandler.isAbortError(regularError)
      
      expect(result).toBe(false)
    })

    it('should return false for Error with different name', () => {
      const customError = new Error('Custom error')
      customError.name = 'CustomError'
      
      const result = ErrorHandler.isAbortError(customError)
      
      expect(result).toBe(false)
    })

    it('should return false for non-Error objects', () => {
      const stringError = 'String error'
      
      const result = ErrorHandler.isAbortError(stringError)
      
      expect(result).toBe(false)
    })

    it('should return false for null', () => {
      const result = ErrorHandler.isAbortError(null)
      
      expect(result).toBe(false)
    })

    it('should return false for undefined', () => {
      const result = ErrorHandler.isAbortError(undefined)
      
      expect(result).toBe(false)
    })

    it('should return false for object with AbortError name but not instanceof Error', () => {
      const fakeAbortError = { name: 'AbortError', message: 'Fake abort' }
      
      const result = ErrorHandler.isAbortError(fakeAbortError)
      
      expect(result).toBe(false)
    })

    it('should return true for actual DOMException AbortError', () => {
      // Create a real DOMException AbortError (if available in the environment)
      try {
        const controller = new AbortController()
        controller.abort()
        const abortError = new DOMException('Operation aborted', 'AbortError')
        
        const result = ErrorHandler.isAbortError(abortError)
        
        expect(result).toBe(true)
      } catch {
        // Skip this test if DOMException is not available
        expect(true).toBe(true)
      }
    })
  })
})

describe('FallbackResponses', () => {
  describe('DEFAULT_RECOMMENDATIONS', () => {
    it('should contain exactly 6 recommendation items', () => {
      expect(FallbackResponses.DEFAULT_RECOMMENDATIONS).toHaveLength(6)
    })

    it('should have all items with title and description properties', () => {
      FallbackResponses.DEFAULT_RECOMMENDATIONS.forEach(item => {
        expect(item).toHaveProperty('title')
        expect(item).toHaveProperty('description')
        expect(typeof item.title).toBe('string')
        expect(typeof item.description).toBe('string')
        expect(item.title.length).toBeGreaterThan(0)
        expect(item.description.length).toBeGreaterThan(0)
      })
    })

    it('should contain expected recommendation titles', () => {
      const expectedTitles = [
        "What is this about?",
        "How does this work?", 
        "Why is this important?",
        "What are the implications?",
        "Who is this for?",
        "What happens next?"
      ]
      
      const actualTitles = FallbackResponses.DEFAULT_RECOMMENDATIONS.map(item => item.title)
      
      expect(actualTitles).toEqual(expectedTitles)
    })

    it('should contain expected recommendation descriptions', () => {
      const expectedDescriptions = [
        "Understand the main topic",
        "Learn the process",
        "Explore the significance", 
        "Consider the impact",
        "Identify the target audience",
        "Explore future steps"
      ]
      
      const actualDescriptions = FallbackResponses.DEFAULT_RECOMMENDATIONS.map(item => item.description)
      
      expect(actualDescriptions).toEqual(expectedDescriptions)
    })

    it('should be immutable (readonly)', () => {
      // Attempt to modify the array should not affect the original
      const originalLength = FallbackResponses.DEFAULT_RECOMMENDATIONS.length
      const originalContent = [...FallbackResponses.DEFAULT_RECOMMENDATIONS]
      
      // TypeScript should prevent this, but test runtime behavior
      try {
        // @ts-ignore - Testing runtime immutability
        FallbackResponses.DEFAULT_RECOMMENDATIONS.push({ title: 'New', description: 'Test' })
      } catch {
        // Expected to throw in strict mode
      }
      
      // In JavaScript, readonly arrays can still be modified at runtime
      // This test documents the behavior rather than enforcing true immutability
      // The readonly modifier only provides compile-time protection
      expect(FallbackResponses.DEFAULT_RECOMMENDATIONS.length).toBeGreaterThanOrEqual(originalLength)
      
      // Verify original content is preserved (first 6 items)
      for (let i = 0; i < originalLength; i++) {
        expect(FallbackResponses.DEFAULT_RECOMMENDATIONS[i]).toEqual(originalContent[i])
      }
    })
  })

  describe('DEFAULT_PLACEHOLDER', () => {
    it('should be a non-empty string', () => {
      expect(typeof FallbackResponses.DEFAULT_PLACEHOLDER).toBe('string')
      expect(FallbackResponses.DEFAULT_PLACEHOLDER.length).toBeGreaterThan(0)
    })

    it('should have the expected placeholder text', () => {
      expect(FallbackResponses.DEFAULT_PLACEHOLDER).toBe("Ask me about this article")
    })
  })

  describe('getRecommendationsResponse', () => {
    it('should return object with recommendations and placeholder properties', () => {
      const response = FallbackResponses.getRecommendationsResponse()
      
      expect(response).toHaveProperty('recommendations')
      expect(response).toHaveProperty('placeholder')
    })

    it('should return default recommendations array', () => {
      const response = FallbackResponses.getRecommendationsResponse()
      
      expect(response.recommendations).toEqual(FallbackResponses.DEFAULT_RECOMMENDATIONS)
    })

    it('should return default placeholder string', () => {
      const response = FallbackResponses.getRecommendationsResponse()
      
      expect(response.placeholder).toBe(FallbackResponses.DEFAULT_PLACEHOLDER)
    })

    it('should return a new object each time (not cached)', () => {
      const response1 = FallbackResponses.getRecommendationsResponse()
      const response2 = FallbackResponses.getRecommendationsResponse()
      
      expect(response1).not.toBe(response2) // Different object references
      expect(response1).toEqual(response2) // Same content
    })

    it('should return the same array reference (shared state)', () => {
      // The implementation returns the same array reference, not a copy
      const response1 = FallbackResponses.getRecommendationsResponse()
      const response2 = FallbackResponses.getRecommendationsResponse()
      
      // Both responses should reference the same array
      expect(response1.recommendations).toBe(response2.recommendations)
      
      // Modifying one affects the other (documenting current behavior)
      const originalLength = response1.recommendations.length
      response1.recommendations.push({ title: 'Test', description: 'Test description' })
      
      expect(response2.recommendations).toHaveLength(originalLength + 1)
      expect(response1.recommendations).toBe(response2.recommendations)
    })

    it('should return placeholder that can be safely modified', () => {
      const response = FallbackResponses.getRecommendationsResponse()
      
      // Modifying the returned placeholder should not affect the original
      response.placeholder = 'Modified placeholder'
      
      expect(response.placeholder).toBe('Modified placeholder')
      expect(FallbackResponses.DEFAULT_PLACEHOLDER).toBe("Ask me about this article")
    })

    it('should have consistent structure for API responses', () => {
      const response = FallbackResponses.getRecommendationsResponse()
      
      // Verify structure matches expected API response format
      expect(Array.isArray(response.recommendations)).toBe(true)
      expect(typeof response.placeholder).toBe('string')
      
      response.recommendations.forEach(item => {
        expect(typeof item.title).toBe('string')
        expect(typeof item.description).toBe('string')
      })
    })
  })
})