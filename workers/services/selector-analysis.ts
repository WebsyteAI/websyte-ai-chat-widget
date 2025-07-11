import type { Context } from 'hono';
import type { SelectorAnalysisRequest, SelectorAnalysisResponse, Env } from '../types';
import { ServiceValidation, ErrorHandler } from './common';
import { OpenAIService } from './openai';
import { DatabaseService } from './database';

type AppContext = Context<{ Bindings: Env; Variables: any }>;

export class SelectorAnalysisService {
  constructor(private openaiService: OpenAIService, private database?: DatabaseService) {}

  async handle(c: AppContext): Promise<Response> {
    try {
      // Validate HTTP method
      ServiceValidation.validatePostMethod(c);

      // Parse request body
      const request = await ServiceValidation.parseRequestBody(c) as SelectorAnalysisRequest;

      // Validate required fields
      if (!request.html || typeof request.html !== 'string') {
        return c.json({ error: 'HTML content is required' }, 400);
      }

      // Use full HTML without truncation for better accuracy
      const html = request.html;
      const title = request.title || '';
      const url = request.url || '';

      // Ensure URL is tracked in database regardless of caching status
      if (url && this.database) {
        await this.database.ensureUrlTracked(url);
      }

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
      
      return ErrorHandler.handleGeneralError(
        c,
        error,
        'Selector analysis service error:',
        { 
          error: 'Failed to analyze HTML structure',
          contentSelector: 'main',
          reasoning: 'Unable to analyze content structure'
        }
      );
    }
  }
}
