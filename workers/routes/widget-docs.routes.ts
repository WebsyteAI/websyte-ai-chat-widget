import { Hono } from 'hono';
import { authMiddleware } from '../lib/middleware';
import type { AppType } from './types';

export const widgetDocsRoutes = new Hono<AppType>();

// Add documents to widget
widgetDocsRoutes.post('/:id/documents', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const formData = await c.req.formData();
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return c.json({ error: 'No files provided' }, 400);
    }

    await c.get('services').widget.addDocumentsToWidget(id, auth.user.id, files);
    return c.json({ success: true, count: files.length });
  } catch (error) {
    console.error('Error adding documents:', error);
    return c.json({ error: 'Failed to add documents' }, 500);
  }
});

// Get widget documents
widgetDocsRoutes.get('/:id/documents', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const documents = await c.get('services').widget.getWidgetDocuments(id, auth.user.id);
    return c.json({ documents });
  } catch (error) {
    console.error('Error getting documents:', error);
    return c.json({ error: 'Failed to get documents' }, 500);
  }
});

// Remove document from widget
widgetDocsRoutes.delete('/:id/documents/:documentId', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  const documentId = c.req.param('documentId');
  
  if (!id || !documentId) {
    return c.json({ error: 'Widget ID and Document ID are required' }, 400);
  }

  try {
    const success = await c.get('services').widget.removeDocumentFromWidget(id, auth.user.id, documentId);
    if (!success) {
      return c.json({ error: 'Document not found or unauthorized' }, 404);
    }
    return c.json({ success: true });
  } catch (error) {
    console.error('Error removing document:', error);
    return c.json({ error: 'Failed to remove document' }, 500);
  }
});

// Search widget content
widgetDocsRoutes.post('/:id/search', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const body = await c.req.json();
    const { query, limit = 10 } = body;

    if (!query) {
      return c.json({ error: 'Query is required' }, 400);
    }

    const results = await c.get('services').widget.searchWidgetContent(id, auth.user.id, query, limit);
    return c.json({ results });
  } catch (error) {
    console.error('Error searching widget:', error);
    return c.json({ error: 'Failed to search widget content' }, 500);
  }
});

// Generate recommendations for a widget
widgetDocsRoutes.post('/:id/recommendations', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Generate recommendations
    await c.get('services').widget.generateWidgetRecommendations(id);
    
    // Get updated widget with recommendations
    const updatedWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    
    return c.json({ 
      success: true,
      recommendations: updatedWidget?.recommendations || []
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return c.json({ error: 'Failed to generate recommendations' }, 500);
  }
});

// Regenerate important links for a widget
widgetDocsRoutes.post('/:id/links/regenerate', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Extract important links
    await c.get('services').widget.extractImportantLinks(id);
    
    // Get updated widget with links
    const updatedWidget = await c.get('services').widget.getWidget(id, auth.user.id);
    
    return c.json({ 
      success: true,
      links: updatedWidget?.links || []
    });
  } catch (error) {
    console.error('Error regenerating links:', error);
    return c.json({ error: 'Failed to regenerate links' }, 500);
  }
});

// Refresh embeddings for a widget
widgetDocsRoutes.post('/:id/embeddings/refresh', authMiddleware, async (c) => {
  const auth = c.get('auth');
  if (!auth?.user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const id = c.req.param('id');
  if (!id) {
    return c.json({ error: 'Widget ID is required' }, 400);
  }

  try {
    const widget = await c.get('services').widget.getWidget(id, auth.user.id);
    if (!widget) {
      return c.json({ error: 'Widget not found' }, 404);
    }

    // Refresh embeddings from existing files
    const result = await c.get('services').widget.refreshEmbeddings(id, auth.user.id);
    
    return c.json({ 
      success: true,
      embeddingsCreated: result.embeddingsCreated,
      filesProcessed: result.filesProcessed
    });
  } catch (error) {
    console.error('Error refreshing embeddings:', error);
    return c.json({ error: 'Failed to refresh embeddings' }, 500);
  }
});