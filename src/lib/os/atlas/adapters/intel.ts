/**
 * Atlas Intelligence Adapter
 * CLM and learning intelligence summaries — now routed through NEXUS via bridge.
 */

import { getCLMStatus } from '@/lib/substrate/clm';
import { checkOpAllowed } from '../capabilities';
import { writeAuditEntry, generateTraceId } from '../audit';
import { nexusCLMBridge } from '@/lib/control-plane/intel/nexus-clm-bridge';
import type { IntelSummary } from '../types';

export interface IntelAdapterResult {
  ok: boolean;
  summaries: IntelSummary[];
  error?: string;
  trace_id: string;
  execution_ms: number;
}

/**
 * Gather intelligence summaries from all modules.
 * Also ensures the NEXUS → CLM bridge is running.
 */
export async function gatherIntel(
  actor?: string,
  actor_role?: string
): Promise<IntelAdapterResult> {
  const startTime = performance.now();
  const trace_id = generateTraceId();
  
  // Check capability
  const allowed = await checkOpAllowed('intel');
  if (!allowed.allowed) {
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'intel',
      result_summary: allowed.reason,
      status: 'blocked',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      summaries: [],
      error: allowed.reason,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
  
  const summaries: IntelSummary[] = [];
  
  try {
    // Ensure NEXUS → CLM bridge is running
    const bridgeState = nexusCLMBridge.getState();
    if (!bridgeState.running) {
      const bridgeResult = nexusCLMBridge.start();
      summaries.push({
        module: 'nexus-clm-bridge',
        type: 'pattern',
        title: 'NEXUS → CLM Bridge',
        summary: bridgeResult.ok
          ? `Bridge started — CLM cycles now routing through NEXUS`
          : `Bridge not started: ${bridgeResult.reason}`,
        confidence: bridgeResult.ok ? 0.95 : 0.3,
        timestamp: new Date().toISOString(),
        data: { started: bridgeResult.ok, reason: bridgeResult.reason },
      });
    } else {
      summaries.push({
        module: 'nexus-clm-bridge',
        type: 'pattern',
        title: 'NEXUS → CLM Bridge',
        summary: `Active — ${bridgeState.cyclesCompleted} cycles completed, ${bridgeState.cyclesFailed} failed`,
        confidence: 0.95,
        timestamp: new Date().toISOString(),
        data: {
          cycles_completed: bridgeState.cyclesCompleted,
          cycles_failed: bridgeState.cyclesFailed,
          last_cycle: bridgeState.lastCycleAt,
          started_at: bridgeState.startedAt,
        },
      });
    }

    // CLM Status
    try {
      const clmStatus = getCLMStatus();
      if (clmStatus) {
        summaries.push({
          module: 'clm',
          type: 'clm',
          title: 'Constant Learning Mode',
          summary: `Enabled: ${clmStatus.enabled}, Topics: ${clmStatus.topics_count}, Running: ${clmStatus.running}`,
          confidence: 0.9,
          timestamp: new Date().toISOString(),
          data: {
            enabled: clmStatus.enabled,
            running: clmStatus.running,
            topics_count: clmStatus.topics_count,
            budget_used: clmStatus.budget_used,
            budget_total: clmStatus.budget_total,
            kill_switch: clmStatus.kill_switch,
          },
        });
      }
    } catch {
      // CLM may not be initialized
    }
    
    // System summary
    summaries.push({
      module: 'system',
      type: 'pattern',
      title: 'System Status',
      summary: 'Atlas control plane operational',
      confidence: 1.0,
      timestamp: new Date().toISOString(),
    });
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'intel',
      result_summary: `Gathered ${summaries.length} intelligence summaries`,
      status: 'success',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: true,
      summaries,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    
    await writeAuditEntry({
      actor,
      actor_role,
      op: 'intel',
      result_summary: errorMessage,
      status: 'fail',
      trace_id,
      execution_ms: performance.now() - startTime,
    });
    
    return {
      ok: false,
      summaries,
      error: errorMessage,
      trace_id,
      execution_ms: performance.now() - startTime,
    };
  }
}
