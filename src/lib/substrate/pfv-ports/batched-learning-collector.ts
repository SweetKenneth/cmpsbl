/**
 * PFV Port → Batched Learning Collector
 * Queue-based event batching with beforeunload safety flush
 * Benefits: CLM, BRAIN, ANALYTICS
 * Source: PromptFluid-Vision learning/collector.ts
 */

import { supabase } from '@/integrations/supabase/client';

export interface LearningEvent {
  event_type: string;
  module: string;
  project_id?: string;
  payload: Record<string, any>;
  success: boolean;
  error_message?: string;
  metadata?: Record<string, any>;
}

/**
 * Batched Learning Collector
 * Queues events and flushes in batches to minimize DB writes
 */
export class BatchedLearningCollector {
  private static queue: LearningEvent[] = [];
  private static isProcessing = false;
  private static readonly BATCH_SIZE = 10;
  private static readonly FLUSH_INTERVAL = 5000;
  private static readonly MAX_QUEUE_SIZE = 200;
  private static intervalId: ReturnType<typeof setInterval> | null = null;

  /**
   * Initialize auto-flush interval
   */
  static init(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.flush(), this.FLUSH_INTERVAL);

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.forceFlush());
    }
  }

  /**
   * Enqueue a learning event
   */
  static async logEvent(event: LearningEvent): Promise<void> {
    this.queue.push({
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
      },
    });

    // Cap queue to prevent unbounded growth
    if (this.queue.length > this.MAX_QUEUE_SIZE) {
      this.queue.splice(0, this.queue.length - this.MAX_QUEUE_SIZE / 2);
    }

    if (this.queue.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  /**
   * Convenience: log a BRAIN event
   */
  static async logBrain(data: {
    event_type: string;
    result: 'success' | 'failure';
    details?: Record<string, any>;
    error?: string;
  }): Promise<void> {
    await this.logEvent({
      event_type: `brain_${data.event_type}`,
      module: 'brain',
      payload: data.details || {},
      success: data.result === 'success',
      error_message: data.error,
    });
  }

  /**
   * Convenience: log a DEFENSE event
   */
  static async logDefense(data: {
    event_type: string;
    risk_score: number;
    action: string;
    details?: Record<string, any>;
  }): Promise<void> {
    await this.logEvent({
      event_type: `defense_${data.event_type}`,
      module: 'defense',
      payload: { risk_score: data.risk_score, action: data.action, ...data.details },
      success: true,
    });
  }

  /**
   * Convenience: log a CLM event
   */
  static async logCLM(data: {
    event_type: string;
    topic?: string;
    tokens?: number;
    success: boolean;
    error?: string;
  }): Promise<void> {
    await this.logEvent({
      event_type: `clm_${data.event_type}`,
      module: 'clm',
      payload: { topic: data.topic, tokens: data.tokens },
      success: data.success,
      error_message: data.error,
    });
  }

  /**
   * Flush batch to backend
   */
  private static async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.BATCH_SIZE);

    try {
      const { error } = await supabase.functions.invoke('pf-learning-log', {
        body: { events: batch },
      });

      if (error) {
        // Only re-queue on transient errors
        const isPermissionError = String(error).includes('row-level security');
        if (!isPermissionError) {
          this.queue.unshift(...batch);
        }
      }
    } catch {
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Force flush all remaining events
   */
  static async forceFlush(): Promise<void> {
    let attempts = 0;
    while (this.queue.length > 0 && attempts < 10) {
      await this.flush();
      attempts++;
      await new Promise(r => setTimeout(r, 100));
    }
  }

  /**
   * Teardown
   */
  static destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}
