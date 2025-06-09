import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenAIService } from './openai'
import type { ChatMessage } from '../types'

describe('OpenAIService', () => {
  let openaiService: OpenAIService
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    openaiService = new OpenAIService(mockApiKey)
    vi.resetAllMocks()
  })

  describe('chatCompletion', () => {
    it('should make successful API call with default options', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test response' } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ]

      const result = await openaiService.chatCompletion(messages)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4.1-mini',
            messages,
            temperature: 0.2
          }),
          signal: undefined
        }
      )

      expect(result).toBe('Test response')
    })

    it('should use custom options when provided', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Custom response' } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ]

      const abortController = new AbortController()
      const options = {
        model: 'gpt-4',
        temperature: 0.8,
        maxTokens: 1000,
        signal: abortController.signal
      }

      const result = await openaiService.chatCompletion(messages, options)

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${mockApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages,
            temperature: 0.8,
            max_tokens: 1000
          }),
          signal: abortController.signal
        }
      )

      expect(result).toBe('Custom response')
    })

    it('should handle API error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ]

      await expect(openaiService.chatCompletion(messages)).rejects.toThrow(
        'OpenAI API error: 429 Too Many Requests'
      )
    })

    it('should handle missing response content', async () => {
      const mockResponse = {
        choices: []
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ]

      const result = await openaiService.chatCompletion(messages)

      expect(result).toBe("I couldn't generate a response.")
    })

    it('should handle malformed response', async () => {
      const mockResponse = {
        choices: [{ message: null }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ]

      const result = await openaiService.chatCompletion(messages)

      expect(result).toBe("I couldn't generate a response.")
    })
  })

  describe('generateSummary', () => {
    it('should generate summary with correct system prompt', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'This is a summary' } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const content = 'Article content here'
      const title = 'Test Article'
      const url = 'https://example.com'

      const result = await openaiService.generateSummary(content, title, url)

      const expectedMessages: ChatMessage[] = [
        {
          role: 'system',
          content: `You are a helpful assistant that creates concise, informative summaries of web page content. 
        You are working with the webpage "${title}" (${url}). Page content: ${content.slice(0, 50000)}
        
        Provide a clear, direct summary in 2-3 paragraphs based on the provided content. Do not include any prefacing text like "Summary of" or similar headers.`
        },
        {
          role: 'user',
          content: 'Please summarize this webpage content.'
        }
      ]

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          body: JSON.stringify({
            model: 'gpt-4.1-mini',
            messages: expectedMessages,
            temperature: 0.5
          })
        })
      )

      expect(result).toBe('This is a summary')
    })

    it('should handle long content by truncating', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Summary of long content' } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const longContent = 'a'.repeat(75000)
      const title = 'Long Article'
      const url = 'https://example.com'

      await openaiService.generateSummary(longContent, title, url)

      const call = (fetch as any).mock.calls[0]
      const requestBody = JSON.parse(call[1].body)
      const systemMessage = requestBody.messages[0].content

      // Should contain the expected system prompt with truncated content
      expect(systemMessage).toContain('You are a helpful assistant that creates concise, informative summaries')
      expect(systemMessage).toContain(title)
      expect(systemMessage).toContain(url)
      
      // The content in the message should be truncated - verify by checking the pattern
      const contentMatch = systemMessage.match(/Page content: (.+?)\s+Provide a clear, direct summary/)
      expect(contentMatch).toBeTruthy()
      if (contentMatch) {
        const extractedContent = contentMatch[1]
        // Should be exactly 50000 characters of 'a'
        expect(extractedContent).toBe('a'.repeat(50000))
        expect(extractedContent.length).toBe(50000)
      }
    })

    it('should handle abort signal', async () => {
      const abortController = new AbortController()
      
      global.fetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'))

      const content = 'Article content'
      const title = 'Test Article'
      const url = 'https://example.com'

      await expect(
        openaiService.generateSummary(content, title, url, abortController.signal)
      ).rejects.toThrow('Aborted')
    })
  })

  describe('generateRecommendations', () => {
    it('should generate recommendations with correct format', async () => {
      const mockResponseContent = JSON.stringify({
        recommendations: [
          { title: 'What is AI?', description: 'Learn about artificial intelligence' },
          { title: 'How does it work?', description: 'Understand the process' }
        ],
        placeholder: 'Ask me about AI'
      })

      const mockResponse = {
        choices: [{ message: { content: mockResponseContent } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const content = 'AI article content'
      const title = 'AI Article'
      const url = 'https://example.com/ai'

      const result = await openaiService.generateRecommendations(content, title, url)

      expect(result).toEqual({
        recommendations: [
          { title: 'What is AI?', description: 'Learn about artificial intelligence' },
          { title: 'How does it work?', description: 'Understand the process' }
        ],
        placeholder: 'Ask me about AI'
      })

      const call = (fetch as any).mock.calls[0]
      const requestBody = JSON.parse(call[1].body)
      
      expect(requestBody.model).toBe('gpt-4.1-mini')
      expect(requestBody.temperature).toBe(0.7)
      expect(requestBody.max_tokens).toBe(300)
    })

    it('should return fallback recommendations on JSON parse error', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Invalid JSON response' } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const content = 'Article content'
      const title = 'Test Article'
      const url = 'https://example.com'

      const result = await openaiService.generateRecommendations(content, title, url)

      expect(result).toEqual({
        recommendations: [
          { title: "What is this about?", description: "Understand the main topic" },
          { title: "How does this work?", description: "Learn the process" },
          { title: "Why is this important?", description: "Explore the significance" },
          { title: "What are the implications?", description: "Consider the impact" },
          { title: "Who is this for?", description: "Identify the target audience" },
          { title: "What happens next?", description: "Explore future steps" }
        ],
        placeholder: "Ask me about this article"
      })
    })

    it('should include correct system prompt with content', async () => {
      const mockResponseContent = JSON.stringify({
        recommendations: [],
        placeholder: 'Ask me'
      })

      const mockResponse = {
        choices: [{ message: { content: mockResponseContent } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const content = 'Test content'
      const title = 'Test Title'
      const url = 'https://test.com'

      await openaiService.generateRecommendations(content, title, url)

      const call = (fetch as any).mock.calls[0]
      const requestBody = JSON.parse(call[1].body)
      const systemMessage = requestBody.messages[0].content

      expect(systemMessage).toContain(title)
      expect(systemMessage).toContain(url)
      expect(systemMessage).toContain(content.slice(0, 50000))
      expect(systemMessage).toContain('Generate exactly 6 specific, engaging questions')
    })

    it('should handle empty content gracefully', async () => {
      const mockResponseContent = JSON.stringify({
        recommendations: [],
        placeholder: 'Ask me'
      })

      const mockResponse = {
        choices: [{ message: { content: mockResponseContent } }]
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      await openaiService.generateRecommendations('', 'Title', 'https://test.com')

      const call = (fetch as any).mock.calls[0]
      const requestBody = JSON.parse(call[1].body)
      const systemMessage = requestBody.messages[0].content

      expect(systemMessage).toContain('No content available.')
    })
  })
})