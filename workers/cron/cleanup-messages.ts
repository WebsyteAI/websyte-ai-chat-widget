import { MessageService } from '../services/messages';
import { DatabaseService } from '../services/database';
import type { Env } from '../types';

export interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
  noRetry(): void;
}

export async function cleanupOldMessages(event: ScheduledEvent, env: Env) {
  console.log('[CRON] Starting message cleanup job at', new Date(event.scheduledTime).toISOString());
  
  try {
    // Initialize services
    const database = new DatabaseService(env.DATABASE_URL);
    const messageService = new MessageService(database);
    
    // Get retention period from environment or default to 90 days
    const retentionDays = parseInt(env.MESSAGE_RETENTION_DAYS || '90');
    
    console.log(`[CRON] Deleting messages older than ${retentionDays} days`);
    
    // Delete old messages
    const deletedCount = await messageService.deleteOldMessages(retentionDays);
    
    console.log(`[CRON] Successfully deleted old messages`);
    
    // Log metrics if available
    if (env.METRICS_ENDPOINT) {
      await logMetrics(env.METRICS_ENDPOINT, {
        job: 'cleanup-messages',
        retention_days: retentionDays,
        deleted_count: deletedCount,
        timestamp: event.scheduledTime
      });
    }
  } catch (error) {
    console.error('[CRON] Error in message cleanup job:', error);
    
    // Don't retry on errors - wait for next scheduled run
    event.noRetry();
    
    // Log error metrics if available
    if (env.METRICS_ENDPOINT) {
      await logMetrics(env.METRICS_ENDPOINT, {
        job: 'cleanup-messages',
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: event.scheduledTime
      });
    }
    
    throw error;
  }
}

async function logMetrics(endpoint: string, metrics: any) {
  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  } catch (error) {
    console.error('[CRON] Failed to log metrics:', error);
  }
}