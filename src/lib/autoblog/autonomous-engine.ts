/**
 * AutoBlog Autonomous Engine
 * Self-running, self-learning blog automation
 */

import { 
  getAutoblogSettings, 
  queueDraft, 
  updateQueueStatus, 
  saveDraft, 
  recordRun 
} from './store';
import { checkAutoblogCircuit, reportSuccess, reportFailure } from './circuit';
import { 
  gatherResearchInsights, 
  getEvolutionDigests, 
  performSelfAudit,
  captureAutoblogLearning 
} from './brain-integration';
import type { AutoblogSettings, AutonomousState, AutoblogChannel } from './types';

let autonomousState: AutonomousState = {
  is_running: false,
  last_cycle_at: null,
  next_cycle_at: null,
  cycles_completed: 0,
  posts_generated: 0,
  research_insights_captured: 0,
  evolution_updates_posted: 0,
  current_focus: null,
};

let autonomousInterval: ReturnType<typeof setInterval> | null = null;

export function getAutonomousState(): AutonomousState {
  return { ...autonomousState };
}

export async function startAutonomousMode(): Promise<{ ok: boolean; message: string }> {
  const settings = await getAutoblogSettings();
  if (!settings?.enabled) return { ok: false, message: 'AutoBlog must be enabled first' };
  if (autonomousState.is_running) return { ok: false, message: 'Already running' };

  const circuit = await checkAutoblogCircuit();
  if (!circuit.canProceed) return { ok: false, message: `Circuit ${circuit.state}` };

  autonomousState.is_running = true;
  runAutonomousCycle(settings);
  autonomousInterval = setInterval(() => runAutonomousCycle(settings), settings.cadence_minutes * 60 * 1000);

  return { ok: true, message: 'Autonomous mode started' };
}

export function stopAutonomousMode(): { ok: boolean; message: string } {
  if (!autonomousState.is_running) return { ok: false, message: 'Not running' };
  if (autonomousInterval) clearInterval(autonomousInterval);
  autonomousState.is_running = false;
  return { ok: true, message: `Stopped after ${autonomousState.cycles_completed} cycles` };
}

async function runAutonomousCycle(settings: AutoblogSettings): Promise<void> {
  try {
    autonomousState.last_cycle_at = new Date().toISOString();
    const circuit = await checkAutoblogCircuit();
    if (!circuit.canProceed) return;

    // Check for evolution updates to post
    const digests = await getEvolutionDigests(1);
    if (digests.length > 0) {
      const latest = digests[0];
      const queued = await queueDraft({
        channel: 'changelog' as AutoblogChannel,
        topic: `System Update: ${latest.improvements[0] || 'Enhancement'}`,
        dedupeKey: `evolution:${latest.run_id}`,
        plannedAt: new Date().toISOString(),
      });

      if (queued) {
        await updateQueueStatus(queued.id, 'drafting');
        const draft = {
          title: 'System Evolution Update',
          body: `## Recent Improvements\n\n${latest.improvements.map(i => `- ${i}`).join('\n')}\n\n${latest.summary}`,
        };
        await saveDraft(queued.id, draft);
        await updateQueueStatus(queued.id, 'ready', { confidence: 0.9, risk: 'low' });
        
        if (!settings.dry_run) {
          await updateQueueStatus(queued.id, 'published');
          autonomousState.posts_generated++;
          autonomousState.evolution_updates_posted++;
          await reportSuccess();
        }
        await recordRun({ queueId: queued.id, phase: 'publish', outcome: 'success', reason: 'Evolution update' });
      }
    }

    // Gather research insights
    const insights = await gatherResearchInsights(['cognitive architecture', 'self-improvement']);
    autonomousState.research_insights_captured += insights.length;

    // Periodic self-audit
    if (autonomousState.cycles_completed % 10 === 0) {
      const audit = await performSelfAudit();
      await captureAutoblogLearning({
        topic: 'self_audit',
        insights: audit.recommendations,
        source: 'autonomous',
        confidence: audit.quality_score,
      });
    }

    autonomousState.cycles_completed++;
  } catch (error) {
    console.error('[AutoBlog] Cycle error:', error);
    await reportFailure(error instanceof Error ? error.message : 'Unknown');
  }
}
