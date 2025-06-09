import type { Context } from 'hono';
import type { SelectorAnalysisRequest, SelectorAnalysisResponse } from '../types';
import { ServiceValidation, ErrorHandler } from './common';
import { OpenAIService } from './openai';

export class SelectorAnalysisService {
  constructor(private openaiService: OpenAIService) {}

  async handle(c: Context): Promise<Response> {
    try {
      // Validate HTTP method
      ServiceValidation.validatePostMethod(c);

      // Parse request body
      const request = await ServiceValidation.parseRequestBody(c) as SelectorAnalysisRequest;

      // Validate required fields
      if (!request.html || typeof request.html !== 'string') {
        return c.json({ error: 'HTML content is required' }, 400);
      }

      // Trim HTML if too large (limit to 10KB)
      const html = request.html.slice(0, 10000);
      const title = request.title || '';
      const url = request.url || '';

      console.log(`Analyzing HTML structure for selector generation`);

      // Call OpenAI to analyze HTML structure
      const analysis = await this.openaiService.analyzeHtmlStructure(
        html,
        title,
        url,
        c.req.raw.signal
      );

      const response: SelectorAnalysisResponse = {
        contentSelector: analysis.contentSelector,
        reasoning: analysis.reasoning
      };

      console.log(`Generated selector: ${analysis.contentSelector}`);
      return c.json(response);

    } catch (error) {
      console.error('Selector analysis service error:', error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        return ErrorHandler.handleAbortError(c);
      }
      
      return ErrorHandler.handleGeneralError(c, error, 'Failed to analyze HTML structure');
    }
  }
}