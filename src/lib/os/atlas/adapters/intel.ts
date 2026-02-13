/**
 * Atlas Intelligence Adapter
 * v9.1.0 — CLM and learning intelligence summaries
 */

import { getCLMStatus } from '@/lib/substrate/clm';
import { checkOpAllowed } from '../capabilities';
import { writeAuditEntry, generateTraceId, redactSecrets } from '../audit';
import type { IntelSummary } from '../types';

export interface IntelAdapterResult {
  ok: boolean;
  summaries: IntelSummary[];
  error?: string;
  trace_id: string;
  execution_ms: number;
}

/**
 * Gather intelligence summaries from all modules
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
    // CLM Status
    try {
      const clmStatus = getCLMStatus();
      if (clmStatus) {
        summaries.push({
          module: 'clm',
          type: 'clm',
          title: 'Continuous Learning Mode',
          summary: `Enabled: ${clmStatus.enabled}, Topics: ${clmStatus.topics_count}, Running: ${clmStatus.running}`,
          confidence: 0.9,
          timestamp: new Date().toISOString(),
          data: {
            enabled: clmStatus.enabled,
            running: clmStatus.running,
            topics_count: clmStatus.topics_count,
            budget_used: clmStatus.budget_used,
          },
        });
      }
    } catch {
      // CLM may not be initialized
    }
    
    // System summary (placeholder for other modules)
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
