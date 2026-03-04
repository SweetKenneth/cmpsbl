/**
 * BRAIN Neural Substrate Layer — Automated Maintenance Manager
 * Handles all recurring maintenance tasks autonomously:
 * 
 * Neural Substrate:
 *  - Incremental embedding of new artifacts
 *  - Vector index refresh
 *  - Confidence classifier retraining
 *  - Drift detection checks
 * 
 * BRAIN (pre-existing, now automated):
 *  - Memory tiering (hot → warm → cold → archive)
 *  - Confidence decay application
 *  - Warm memory compression
 *  - Metacognitive assessment
 *  - Contradiction detection cleanup
 *  - User fingerprint updates
 * 
 * All tasks run on autonomous intervals with no operator intervention.
 */

import { supabase } from '@/integrations/supabase/client';
import { embeddingEngine } from './embedding-engine';
import { vectorIndex } from './vector-index';
import { confidenceClassifier } from './confidence-classifier';
import { driftDetector } from './drift-detector';

interface MaintenanceTask {
  name: string;
  intervalMs: number;
  lastRunAt: number;
  runCount: number;
  lastError: string | null;
  enabled: boolean;
}

interface MaintenanceManagerState {
  running: boolean;
  tasks: MaintenanceTask[];
  totalRunsCompleted: number;
  totalErrors: number;
  startedAt: string | null;
}

/**
 * Log a maintenance task execution
 */
async function logMaintenance(
  taskType: string,
  status: 'completed' | 'failed' | 'skipped',
  startTime: number,
  details?: Record<string, any>,
  errorMessage?: string
): Promise<void> {
  try {
    await supabase.from('brain_maintenance_log').insert({
      task_type: taskType,
      status,
      started_at: new Date(startTime).toISOString(),
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      details: details ?? {},
      error_message: errorMessage,
    });
  } catch {
    // Silent fail on logging
  }
}

class MaintenanceManager {
  private tasks: Map<string, MaintenanceTask> = new Map();
  private timers: Map<string, ReturnType<typeof setInterval>> = new Map();
  private state: MaintenanceManagerState = {
    running: false,
    tasks: [],
    totalRunsCompleted: 0,
    totalErrors: 0,
    startedAt: null,
  };

  constructor() {
    // Define all maintenance tasks with intervals
    const taskDefs: Array<[string, number, boolean]> = [
      // Neural Substrate tasks
      ['neural_embed_new_artifacts', 10 * 60 * 1000, true],       // Every 10 min
      ['neural_refresh_vector_index', 5 * 60 * 1000, true],       // Every 5 min
      ['neural_classifier_retrain', 4 * 60 * 60 * 1000, true],    // Every 4 hours
      ['neural_drift_check', 30 * 60 * 1000, true],               // Every 30 min
      ['neural_drift_retrain', 7 * 24 * 60 * 60 * 1000, true],   // Weekly

      // BRAIN memory maintenance
      ['brain_memory_tiering', 60 * 60 * 1000, true],             // Every 1 hour
      ['brain_confidence_decay', 6 * 60 * 60 * 1000, true],       // Every 6 hours
      ['brain_warm_compression', 4 * 60 * 60 * 1000, true],       // Every 4 hours
      ['brain_metacognition', 2 * 60 * 60 * 1000, true],          // Every 2 hours
      ['brain_stale_embedding_cleanup', 24 * 60 * 60 * 1000, true], // Daily
    ];

    for (const [name, interval, enabled] of taskDefs) {
      this.tasks.set(name, {
        name,
        intervalMs: interval,
        lastRunAt: 0,
        runCount: 0,
        lastError: null,
        enabled,
      });
    }
  }

  /**
   * Start all automated maintenance
   */
  async start(): Promise<void> {
    if (this.state.running) return;

    this.state.running = true;
    this.state.startedAt = new Date().toISOString();

    // Initialize neural components
    await embeddingEngine.initialize();
    await vectorIndex.load();
    await confidenceClassifier.initialize();
    await driftDetector.initialize();

    // Schedule each task with staggered initial delays to avoid
    // flooding the network with 10+ simultaneous API calls on boot
    let staggerDelay = 0;
    for (const [name, task] of this.tasks) {
      if (!task.enabled) continue;

      // Stagger initial runs by 5s each instead of running all immediately
      setTimeout(() => this.runTask(name), staggerDelay);
      staggerDelay += 5000;

      const timer = setInterval(() => this.runTask(name), task.intervalMs);
      this.timers.set(name, timer);
    }

    console.log(`[Neural] Maintenance manager started: ${this.tasks.size} tasks scheduled`);
  }

  /**
   * Stop all maintenance
   */
  stop(): void {
    for (const [name, timer] of this.timers) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.state.running = false;
    vectorIndex.destroy();
    console.log('[Neural] Maintenance manager stopped');
  }

  /**
   * Run a specific maintenance task
   */
  private async runTask(taskName: string): Promise<void> {
    const task = this.tasks.get(taskName);
    if (!task) return;

    const startTime = Date.now();

    try {
      let details: Record<string, any> = {};

      switch (taskName) {
        case 'neural_embed_new_artifacts':
          details = await this.embedNewArtifacts();
          break;
        case 'neural_refresh_vector_index':
          details = await this.refreshVectorIndex();
          break;
        case 'neural_classifier_retrain':
          details = await this.retrainClassifier();
          break;
        case 'neural_drift_check':
          details = await this.checkDrift();
          break;
        case 'neural_drift_retrain':
          details = await this.retrainDriftDetector();
          break;
        case 'brain_memory_tiering':
          details = await this.runMemoryTiering();
          break;
        case 'brain_confidence_decay':
          details = await this.runConfidenceDecay();
          break;
        case 'brain_warm_compression':
          details = await this.runWarmCompression();
          break;
        case 'brain_metacognition':
          details = await this.runMetacognition();
          break;
        case 'brain_stale_embedding_cleanup':
          details = await this.cleanupStaleEmbeddings();
          break;
        default:
          return;
      }

      task.runCount++;
      task.lastRunAt = startTime;
      task.lastError = null;
      this.state.totalRunsCompleted++;

      await logMaintenance(taskName, 'completed', startTime, details);
    } catch (err: any) {
      task.lastError = err.message ?? String(err);
      this.state.totalErrors++;
      await logMaintenance(taskName, 'failed', startTime, undefined, task.lastError ?? undefined);
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // Neural Substrate Tasks
  // ═══════════════════════════════════════════════════════════════

  private async embedNewArtifacts(): Promise<Record<string, any>> {
    if (!embeddingEngine.getState().activationMet) {
      return { skipped: true, reason: 'activation_threshold_not_met' };
    }

    // Find crystals not yet embedded
    const { data: crystals } = await supabase
      .from('brain_knowledge_crystals')
      .select('id, distilled_content')
      .order('created_at', { ascending: false })
      .limit(50);

    if (!crystals || crystals.length === 0) {
      return { new_artifacts: 0 };
    }

    // Check which ones already have embeddings
    const ids = crystals.map((c: any) => c.id);
    const { data: existing } = await supabase
      .from('brain_embeddings')
      .select('artifact_id')
      .in('artifact_id', ids);

    const existingIds = new Set((existing ?? []).map(e => e.artifact_id));
    const toEmbed = crystals.filter((c: any) => !existingIds.has(c.id));

    if (toEmbed.length === 0) {
      return { new_artifacts: 0, already_embedded: crystals.length };
    }

    const encoded = await embeddingEngine.batchEncode(
      toEmbed.map((c: any) => ({
        id: c.id,
        type: 'crystal',
        content: typeof c.distilled_content === 'string' ? c.distilled_content : JSON.stringify(c.distilled_content),
      }))
    );

    return { new_artifacts: encoded, checked: crystals.length };
  }

  private async refreshVectorIndex(): Promise<Record<string, any>> {
    const count = await vectorIndex.load();
    return { entries_loaded: count };
  }

  private async retrainClassifier(): Promise<Record<string, any>> {
    const result = await confidenceClassifier.train();
    if (!result) {
      return { skipped: true, reason: 'insufficient_training_data' };
    }
    return { samples: result.samples, accuracy: result.accuracy };
  }

  private async checkDrift(): Promise<Record<string, any>> {
    // Get recent artifacts for drift check
    const { data } = await supabase
      .from('brain_knowledge_crystals')
      .select('distilled_content')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!data || data.length < 5) {
      return { skipped: true, reason: 'insufficient_recent_data' };
    }

    const texts = (data as any[]).map((d: any) => 
      typeof d.distilled_content === 'string' ? d.distilled_content : JSON.stringify(d.distilled_content)
    );
    const signal = await driftDetector.checkDrift(texts);

    return {
      is_anomaly: signal.isAnomaly,
      reconstruction_error: signal.reconstructionError,
      sigma_deviation: signal.sigmaDeviation,
    };
  }

  private async retrainDriftDetector(): Promise<Record<string, any>> {
    const result = await driftDetector.train();
    if (!result) {
      return { skipped: true, reason: 'insufficient_embeddings' };
    }
    return { samples: result.samples, avg_error: result.avgError };
  }

  // ═══════════════════════════════════════════════════════════════
  // BRAIN Memory Maintenance Tasks (previously manual/missing)
  // ═══════════════════════════════════════════════════════════════

  private async runMemoryTiering(): Promise<Record<string, any>> {
    try {
      const { data } = await supabase.rpc('run_memory_tiering', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_agent_id: 'substrate',
      });
      return (data as Record<string, any>) ?? { skipped: true };
    } catch {
      return { skipped: true, reason: 'rpc_unavailable' };
    }
  }

  private async runConfidenceDecay(): Promise<Record<string, any>> {
    try {
      const { data } = await supabase.rpc('apply_confidence_decay', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_agent_id: 'substrate',
      });
      return (data as Record<string, any>) ?? { skipped: true };
    } catch {
      return { skipped: true, reason: 'rpc_unavailable' };
    }
  }

  private async runWarmCompression(): Promise<Record<string, any>> {
    try {
      const { data } = await supabase.rpc('compress_warm_memories', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_agent_id: 'substrate',
      });
      return (data as Record<string, any>) ?? { skipped: true };
    } catch {
      return { skipped: true, reason: 'rpc_unavailable' };
    }
  }

  private async runMetacognition(): Promise<Record<string, any>> {
    try {
      const { data } = await supabase.rpc('run_metacognitive_assessment', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_agent_id: 'substrate',
      });
      return (data as Record<string, any>) ?? { skipped: true };
    } catch {
      return { skipped: true, reason: 'rpc_unavailable' };
    }
  }

  private async cleanupStaleEmbeddings(): Promise<Record<string, any>> {
    // Remove embeddings for artifacts that no longer exist
    const { data: orphaned } = await supabase
      .from('brain_embeddings')
      .select('id, artifact_id, artifact_type')
      .eq('artifact_type', 'crystal')
      .order('created_at', { ascending: true })
      .limit(100);

    if (!orphaned || orphaned.length === 0) {
      return { cleaned: 0 };
    }

    // Check which crystals still exist
    const crystalIds = orphaned
      .filter(o => o.artifact_type === 'crystal')
      .map(o => o.artifact_id);

    if (crystalIds.length === 0) return { cleaned: 0 };

    const { data: existing } = await supabase
      .from('brain_knowledge_crystals')
      .select('id')
      .in('id', crystalIds);

    const existingSet = new Set((existing ?? []).map(e => e.id));
    const toDelete = orphaned.filter(o => !existingSet.has(o.artifact_id));

    if (toDelete.length > 0) {
      await supabase
        .from('brain_embeddings')
        .delete()
        .in('id', toDelete.map(d => d.id));
    }

    return { cleaned: toDelete.length, checked: orphaned.length };
  }

  // ═══════════════════════════════════════════════════════════════
  // Status & Diagnostics
  // ═══════════════════════════════════════════════════════════════

  getState(): MaintenanceManagerState {
    return {
      ...this.state,
      tasks: Array.from(this.tasks.values()),
    };
  }

  getTaskStatus(taskName: string): MaintenanceTask | null {
    return this.tasks.get(taskName) ?? null;
  }
}

export const maintenanceManager = new MaintenanceManager();
export type { MaintenanceManagerState, MaintenanceTask };
