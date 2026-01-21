/**
 * Agency Telemetry — Track real work throughput and verify non-LARP execution
 * Provides hooks for recording metrics, artifacts, and API calls
 */

import { supabase } from '@/integrations/supabase/client';

// ============================================================================
// TYPES
// ============================================================================

export interface TelemetryMetrics {
  tasks_completed: number;
  tasks_failed: number;
  datasets_processed: number;
  websites_crawled: number;
  api_calls: number;
  enrichment_operations: number;
  monitoring_cycles: number;
  total_execution_time_ms: number;
  avg_latency_ms: number | null;
  estimated_cost_cents: number;
  skill_usage: Record<string, number>;
}

export interface AgentLedger {
  member_id: string;
  period_date: string;
  metrics: TelemetryMetrics;
}

export interface TaskArtifact {
  id: string;
  task_id: string;
  artifact_type: 'csv' | 'json' | 'pdf' | 'markdown' | 'screenshot' | 'zip';
  file_name: string;
  file_path?: string;
  file_size_bytes?: number;
  inline_content?: string;
  download_count: number;
  created_at: string;
}

export interface ApiCallLog {
  id: string;
  api_name: string;
  endpoint?: string;
  success: boolean;
  response_time_ms?: number;
  estimated_cost_cents?: number;
  created_at: string;
}

// ============================================================================
// TELEMETRY RECORDING
// ============================================================================

/**
 * Record a telemetry event (increment counters)
 */
export async function recordTelemetryEvent(
  agencyId: string,
  memberId: string | null,
  field: keyof Omit<TelemetryMetrics, 'avg_latency_ms' | 'skill_usage'>,
  increment: number = 1,
  options?: {
    skillUsage?: Record<string, number>;
    executionTimeMs?: number;
  }
): Promise<void> {
  try {
    const { error } = await supabase.rpc('increment_agent_telemetry', {
      p_agency_id: agencyId,
      p_member_id: memberId,
      p_field: field,
      p_increment: increment,
      p_skill_usage: options?.skillUsage || null,
      p_execution_time_ms: options?.executionTimeMs || 0,
    });
    
    if (error) {
      console.warn('Failed to record telemetry:', error);
    }
  } catch (err) {
    console.warn('Telemetry recording error:', err);
  }
}

/**
 * Log an API call
 */
export async function logApiCall(
  agencyId: string,
  taskId: string | null,
  memberId: string | null,
  apiName: string,
  options: {
    endpoint?: string;
    method?: string;
    success: boolean;
    responseTimeMs?: number;
    statusCode?: number;
    errorMessage?: string;
    estimatedCostCents?: number;
    tokensUsed?: number;
    requestMetadata?: Record<string, any>;
    responseMetadata?: Record<string, any>;
  }
): Promise<void> {
  try {
    await supabase.from('agency_api_calls').insert({
      agency_id: agencyId,
      task_id: taskId,
      member_id: memberId,
      api_name: apiName,
      endpoint: options.endpoint,
      method: options.method || 'GET',
      success: options.success,
      response_time_ms: options.responseTimeMs,
      status_code: options.statusCode,
      error_message: options.errorMessage,
      estimated_cost_cents: options.estimatedCostCents,
      tokens_used: options.tokensUsed,
      request_metadata: options.requestMetadata || {},
      response_metadata: options.responseMetadata || {},
    });
  } catch (err) {
    console.warn('API call logging error:', err);
  }
}

/**
 * Create a task artifact
 */
export async function createArtifact(
  taskId: string,
  agencyId: string,
  memberId: string | null,
  artifact: {
    type: TaskArtifact['artifact_type'];
    fileName: string;
    content?: string;
    filePath?: string;
    fileSizeBytes?: number;
    contentHash?: string;
    metadata?: Record<string, any>;
  }
): Promise<string | null> {
  try {
    const { data, error } = await supabase.from('agency_task_artifacts').insert({
      task_id: taskId,
      agency_id: agencyId,
      member_id: memberId,
      artifact_type: artifact.type,
      file_name: artifact.fileName,
      inline_content: artifact.content,
      file_path: artifact.filePath,
      file_size_bytes: artifact.fileSizeBytes,
      content_hash: artifact.contentHash,
      metadata: artifact.metadata || {},
    }).select('id').single();
    
    if (error) {
      console.warn('Failed to create artifact:', error);
      return null;
    }
    
    return data.id;
  } catch (err) {
    console.warn('Artifact creation error:', err);
    return null;
  }
}

// ============================================================================
// TELEMETRY RETRIEVAL
// ============================================================================

/**
 * Fetch agency-wide telemetry summary
 */
export async function getAgencyTelemetry(
  agencyId: string,
  startDate?: string,
  endDate?: string
): Promise<TelemetryMetrics | null> {
  try {
    let query = supabase
      .from('agency_agent_telemetry')
      .select('*')
      .eq('agency_id', agencyId);
    
    if (startDate) {
      query = query.gte('period_date', startDate);
    }
    if (endDate) {
      query = query.lte('period_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error || !data) {
      return null;
    }
    
    // Aggregate metrics
    const aggregated: TelemetryMetrics = {
      tasks_completed: 0,
      tasks_failed: 0,
      datasets_processed: 0,
      websites_crawled: 0,
      api_calls: 0,
      enrichment_operations: 0,
      monitoring_cycles: 0,
      total_execution_time_ms: 0,
      avg_latency_ms: null,
      estimated_cost_cents: 0,
      skill_usage: {},
    };
    
    for (const row of data) {
      aggregated.tasks_completed += row.tasks_completed || 0;
      aggregated.tasks_failed += row.tasks_failed || 0;
      aggregated.datasets_processed += row.datasets_processed || 0;
      aggregated.websites_crawled += row.websites_crawled || 0;
      aggregated.api_calls += row.api_calls || 0;
      aggregated.enrichment_operations += row.enrichment_operations || 0;
      aggregated.monitoring_cycles += row.monitoring_cycles || 0;
      aggregated.total_execution_time_ms += row.total_execution_time_ms || 0;
      aggregated.estimated_cost_cents += row.estimated_cost_cents || 0;
      
      // Merge skill usage
      const skillUsage = row.skill_usage as Record<string, number> || {};
      for (const [skill, count] of Object.entries(skillUsage)) {
        aggregated.skill_usage[skill] = (aggregated.skill_usage[skill] || 0) + count;
      }
    }
    
    // Calculate average latency
    if (aggregated.tasks_completed > 0) {
      aggregated.avg_latency_ms = aggregated.total_execution_time_ms / aggregated.tasks_completed;
    }
    
    return aggregated;
  } catch (err) {
    console.error('Failed to fetch telemetry:', err);
    return null;
  }
}

/**
 * Fetch per-agent ledger data
 */
export async function getAgentLedgers(
  agencyId: string,
  startDate?: string,
  endDate?: string
): Promise<AgentLedger[]> {
  try {
    let query = supabase
      .from('agency_agent_telemetry')
      .select('*')
      .eq('agency_id', agencyId)
      .order('period_date', { ascending: false });
    
    if (startDate) {
      query = query.gte('period_date', startDate);
    }
    if (endDate) {
      query = query.lte('period_date', endDate);
    }
    
    const { data, error } = await query;
    
    if (error || !data) {
      return [];
    }
    
    return data.map(row => ({
      member_id: row.member_id,
      period_date: row.period_date,
      metrics: {
        tasks_completed: row.tasks_completed || 0,
        tasks_failed: row.tasks_failed || 0,
        datasets_processed: row.datasets_processed || 0,
        websites_crawled: row.websites_crawled || 0,
        api_calls: row.api_calls || 0,
        enrichment_operations: row.enrichment_operations || 0,
        monitoring_cycles: row.monitoring_cycles || 0,
        total_execution_time_ms: row.total_execution_time_ms || 0,
        avg_latency_ms: row.avg_latency_ms,
        estimated_cost_cents: row.estimated_cost_cents || 0,
        skill_usage: row.skill_usage as Record<string, number> || {},
      },
    }));
  } catch (err) {
    console.error('Failed to fetch agent ledgers:', err);
    return [];
  }
}

/**
 * Fetch artifacts for a task
 */
export async function getTaskArtifacts(taskId: string): Promise<TaskArtifact[]> {
  try {
    const { data, error } = await supabase
      .from('agency_task_artifacts')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    
    if (error || !data) {
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      task_id: row.task_id,
      artifact_type: row.artifact_type as TaskArtifact['artifact_type'],
      file_name: row.file_name,
      file_path: row.file_path,
      file_size_bytes: row.file_size_bytes,
      inline_content: row.inline_content,
      download_count: row.download_count || 0,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch artifacts:', err);
    return [];
  }
}

/**
 * Increment artifact download count
 */
export async function incrementArtifactDownload(artifactId: string): Promise<void> {
  try {
    await supabase
      .from('agency_task_artifacts')
      .update({ download_count: supabase.rpc as any }) // Will use raw SQL update
      .eq('id', artifactId);
    
    // Direct increment via raw update
    const { error } = await supabase
      .from('agency_task_artifacts')
      .select('download_count')
      .eq('id', artifactId)
      .single()
      .then(async ({ data }) => {
        if (data) {
          return supabase
            .from('agency_task_artifacts')
            .update({ download_count: (data.download_count || 0) + 1 })
            .eq('id', artifactId);
        }
        return { error: null };
      });
      
    if (error) console.warn('Failed to increment download:', error);
  } catch (err) {
    console.warn('Failed to increment download count:', err);
  }
}

/**
 * Fetch recent API calls for an agency
 */
export async function getRecentApiCalls(
  agencyId: string,
  limit: number = 50
): Promise<ApiCallLog[]> {
  try {
    const { data, error } = await supabase
      .from('agency_api_calls')
      .select('id, api_name, endpoint, success, response_time_ms, estimated_cost_cents, created_at')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error || !data) {
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      api_name: row.api_name,
      endpoint: row.endpoint,
      success: row.success,
      response_time_ms: row.response_time_ms,
      estimated_cost_cents: row.estimated_cost_cents,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error('Failed to fetch API calls:', err);
    return [];
  }
}
