import { eq, and, desc } from 'drizzle-orm';
import { DatabaseService } from './database';
import { widget, type Widget, type NewWidget } from '../db/schema';
import { createLogger } from '../lib/logger';

export interface CreateWidgetRequest {
  name: string;
  description?: string;
  url?: string;
  logoUrl?: string;
  isPublic?: boolean;
}

export interface UpdateWidgetRequest {
  name?: string;
  description?: string;
  url?: string;
  logoUrl?: string;
  isPublic?: boolean;
}

export class WidgetCoreService {
  private logger = createLogger('WidgetCoreService');

  constructor(private db: DatabaseService) {}

  async createWidget(userId: string, request: CreateWidgetRequest): Promise<Widget> {
    const newWidget: NewWidget = {
      userId,
      name: request.name,
      description: request.description,
      url: request.url,
      logoUrl: request.logoUrl,
      isPublic: request.isPublic || false,
      cacheEnabled: true
    };

    const [createdWidget] = await this.db.getDatabase()
      .insert(widget)
      .values(newWidget)
      .returning();

    this.logger.info({ widgetId: createdWidget.id, name: createdWidget.name }, 'Widget created');
    return createdWidget;
  }

  async getWidget(id: string, userId: string): Promise<Widget | null> {
    const [widgetRecord] = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(and(
        eq(widget.id, id),
        eq(widget.userId, userId)
      ))
      .limit(1);

    return widgetRecord || null;
  }

  async getPublicWidget(id: string): Promise<Widget | null> {
    const [widgetRecord] = await this.db.getDatabase()
      .select()
      .from(widget)
      .where(and(
        eq(widget.id, id),
        eq(widget.isPublic, true)
      ))
      .limit(1);

    return widgetRecord || null;
  }

  async getUserWidgets(userId: string, limit: number = 50, offset: number = 0): Promise<Widget[]> {
    return await this.db.getDatabase()
      .select()
      .from(widget)
      .where(eq(widget.userId, userId))
      .orderBy(desc(widget.updatedAt))
      .limit(limit)
      .offset(offset);
  }

  async updateWidget(id: string, userId: string, request: UpdateWidgetRequest): Promise<Widget | null> {
    const updateData: Partial<NewWidget> = {};
    
    if (request.name !== undefined) updateData.name = request.name;
    if (request.description !== undefined) updateData.description = request.description;
    if (request.url !== undefined) updateData.url = request.url;
    if (request.logoUrl !== undefined) updateData.logoUrl = request.logoUrl;
    if (request.isPublic !== undefined) updateData.isPublic = request.isPublic;

    const [updatedWidget] = await this.db.getDatabase()
      .update(widget)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(and(
        eq(widget.id, id),
        eq(widget.userId, userId)
      ))
      .returning();

    if (updatedWidget) {
      this.logger.info({ widgetId: id }, 'Widget updated');
    }

    return updatedWidget || null;
  }

  async deleteWidget(id: string, userId: string): Promise<boolean> {
    const result = await this.db.getDatabase()
      .delete(widget)
      .where(and(
        eq(widget.id, id),
        eq(widget.userId, userId)
      ))
      .returning();

    const deleted = result.length > 0;
    if (deleted) {
      this.logger.info({ widgetId: id }, 'Widget deleted');
    }

    return deleted;
  }

  async updateTimestamp(widgetId: string): Promise<void> {
    await this.db.getDatabase()
      .update(widget)
      .set({ updatedAt: new Date() })
      .where(eq(widget.id, widgetId));
  }

  async updateCrawlStatus(
    widgetId: string, 
    status: string, 
    runId?: string | null, 
    pageCount?: number
  ): Promise<void> {
    const updateData: any = { crawlStatus: status };
    
    if (runId !== undefined) updateData.crawlRunId = runId;
    if (pageCount !== undefined) updateData.crawlPageCount = pageCount;
    if (status === 'completed') updateData.lastCrawlAt = new Date();

    await this.db.getDatabase()
      .update(widget)
      .set(updateData)
      .where(eq(widget.id, widgetId));
  }

  async updateRecommendations(widgetId: string, recommendations: Array<{title: string; description: string}>): Promise<void> {
    await this.db.getDatabase()
      .update(widget)
      .set({ recommendations })
      .where(eq(widget.id, widgetId));

    this.logger.info({ widgetId, count: recommendations.length }, 'Widget recommendations updated');
  }
}