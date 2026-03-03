import { supabase } from '@/integrations/supabase/client';
import { debugMode } from '@/lib/debug-mode';

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
 * Learning Collector
 * Captures system events and sends them to the learning layer
 * 
 * Respects debugMode — when enabled, all writes are skipped
 */
export class LearningCollector {
  private static queue: LearningEvent[] = [];
  private static isProcessing = false;
  private static readonly BATCH_SIZE = 10;
  private static readonly FLUSH_INTERVAL = 5000; // 5 seconds

  static {
    // Auto-flush queue every 5 seconds (respects debug mode)
    setInterval(() => {
      if (debugMode.allowLearning()) {
        this.flush();
      }
    }, this.FLUSH_INTERVAL);
  }

  /**
   * Log a learning event
   * Skipped when debug mode is enabled
   */
  static async logEvent(event: LearningEvent): Promise<void> {
    // Skip if debug mode is active
    if (!debugMode.allowLearning()) {
      return;
    }
    
    this.queue.push({
      ...event,
      metadata: {
        ...event.metadata,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent
      }
    });

    // Cap queue to prevent unbounded growth on repeated flush failures
    if (this.queue.length > 200) {
      this.queue.splice(0, this.queue.length - 100);
    }

    // Flush if queue is full
    if (this.queue.length >= this.BATCH_SIZE) {
      await this.flush();
    }
  }

  /**
   * Log a build event
   */
  static async logBuild(data: {
    project_id: string;
    event_type: 'build_start' | 'build_success' | 'build_failure';
    duration_ms?: number;
    files_changed?: string[];
    error?: string;
  }): Promise<void> {
    await this.logEvent({
      event_type: data.event_type,
      module: 'studio',
      project_id: data.project_id,
      payload: {
        duration_ms: data.duration_ms,
        files_changed: data.files_changed || []
      },
      success: data.event_type === 'build_success',
      error_message: data.error,
      metadata: {
        build_type: 'studio_mvp'
      }
    });
  }

  /**
   * Log a validation event
   */
  static async logValidation(data: {
    project_id: string;
    validation_type: string;
    passed: boolean;
    issues?: any[];
    error?: string;
  }): Promise<void> {
    await this.logEvent({
      event_type: 'validation_' + (data.passed ? 'pass' : 'fail'),
      module: 'validation',
      project_id: data.project_id,
      payload: {
        validation_type: data.validation_type,
        issues_count: data.issues?.length || 0,
        issues: data.issues || []
      },
      success: data.passed,
      error_message: data.error
    });
  }

  /**
   * Log a merger event
   */
  static async logMerger(data: {
    event_type: 'merge_start' | 'merge_success' | 'merge_failure' | 'intent_parse';
    intent?: string;
    sections?: string[];
    duration_ms?: number;
    error?: string;
  }): Promise<void> {
    await this.logEvent({
      event_type: data.event_type,
      module: 'merger',
      payload: {
        intent: data.intent,
        sections: data.sections || [],
        duration_ms: data.duration_ms
      },
      success: !data.event_type.includes('failure'),
      error_message: data.error
    });
  }

  /**
   * Log a Brain event
   */
  static async logBrain(data: {
    event_type: 'train' | 'directive' | 'learn' | 'optimize';
    result: 'success' | 'failure';
    details?: Record<string, any>;
    error?: string;
  }): Promise<void> {
    await this.logEvent({
      event_type: `brain_${data.event_type}`,
      module: 'brain',
      payload: data.details || {},
      success: data.result === 'success',
      error_message: data.error
    });
  }

  /**
   * Log a Defense event
   */
  static async logDefense(data: {
    event_type: 'detection' | 'challenge' | 'block';
    risk_score: number;
    action: string;
    details?: Record<string, any>;
  }): Promise<void> {
    await this.logEvent({
      event_type: `defense_${data.event_type}`,
      module: 'defense',
      payload: {
        risk_score: data.risk_score,
        action: data.action,
        ...data.details
      },
      success: true
    });
  }

  /**
   * Flush the queue to the backend
   */
  private static async flush(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const batch = this.queue.splice(0, this.BATCH_SIZE);

    try {
      // Send batch to edge function
      const { error } = await supabase.functions.invoke('pf-learning-log', {
        body: { events: batch }
      });

      if (error) {
        console.error('Failed to flush learning events:', error);
        // Only re-queue on transient errors, not permission/RLS failures
        const isPermissionError = typeof error === 'object' && error !== null && 
          String(error).includes('row-level security');
        if (!isPermissionError) {
          this.queue.unshift(...batch);
        }
      } else {
        console.log(`✅ Flushed ${batch.length} learning events`);
      }
    } catch (error) {
      console.error('Learning collector flush error:', error);
      // Don't re-queue on hard errors to prevent infinite loops
      this.queue.unshift(...batch);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Force flush remaining events
   */
  static async forceFlush(): Promise<void> {
    while (this.queue.length > 0) {
      await this.flush();
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

// Auto-flush on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    LearningCollector.forceFlush();
  });
}
