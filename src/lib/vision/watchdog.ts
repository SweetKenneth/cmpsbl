/**
 * CMPSBL® VISION "Vee" — Watchdog Operative
 * Auto-action with guardrails in operative mode
 */

import { supabase } from '@/integrations/supabase/client';
import { analyzeWindow, type Anomaly } from './anomaly';

export type VisionMode = 'passive' | 'advisory' | 'operative';

export interface WatchdogResult {
  mode: VisionMode;
  anomalies_detected: number;
  actions_taken: Array<{
    anomaly_id: string;
    action_type: string;
    target: string;
    outcome: 'requested' | 'skipped' | 'failed';
    reason?: string;
  }>;
  timestamp: string;
}

// In-memory cooldown tracker (module -> last heal timestamp, bounded)
const MAX_COOLDOWN_ENTRIES = 200;
const healCooldowns = new Map<string, number>();
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get current vision mode from config
 */
export async function getVisionMode(): Promise<{ mode: VisionMode; source: 'env' | 'config' }> {
  // Check environment variable first (browser-safe check)
  const envMode = typeof globalThis !== 'undefined' && 'process' in globalThis
    ? (globalThis as unknown as { process: { env: Record<string, string> } }).process?.env?.VISION_MODE
    : undefined;
  
  if (envMode && ['passive', 'advisory', 'operative'].includes(envMode)) {
    return { mode: envMode as VisionMode, source: 'env' };
  }

  // Fall back to database config
  try {
    const { data } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'vision_mode')
      .maybeSingle();

    if (data?.value) {
      // Handle both raw string and JSON-wrapped string values
      const raw = data.value;
      const cleanMode = (typeof raw === 'string' ? raw : String(raw)).replace(/^"|"$/g, '').trim();
      if (['passive', 'advisory', 'operative'].includes(cleanMode)) {
        return { mode: cleanMode as VisionMode, source: 'config' };
      }
    }
  } catch (error) {
    console.error('Error fetching vision mode:', error);
  }

  // Default to operative
  return { mode: 'operative', source: 'config' };
}

/**
 * Check if module is on cooldown for auto-heal
 */
function isOnCooldown(module: string): boolean {
  const lastHeal = healCooldowns.get(module);
  if (!lastHeal) return false;
  if (Date.now() - lastHeal >= COOLDOWN_MS) {
    healCooldowns.delete(module); // evict expired
    return false;
  }
  return true;
}

/**
 * Record a heal action for cooldown tracking
 */
function recordHealAction(module: string): void {
  // Evict oldest if at capacity
  if (healCooldowns.size >= MAX_COOLDOWN_ENTRIES && !healCooldowns.has(module)) {
    const oldest = healCooldowns.keys().next().value;
    if (oldest) healCooldowns.delete(oldest);
  }
  healCooldowns.set(module, Date.now());
}

/**
 * Log a vision auto-action event
 */
async function logAutoAction(
  anomalyId: string,
  actionType: string,
  target: string,
  outcome: 'requested' | 'skipped' | 'failed',
  mode: VisionMode,
  reason?: string
): Promise<void> {
  try {
    await supabase.from('brain_events').insert({
      event_type: 'vision_auto_action',
      module: 'vision',
      outcome: outcome === 'requested' ? 'success' : outcome,
      data: {
        anomaly_id: anomalyId,
        action_type: actionType,
        target,
        vision_mode: mode,
        reason,
        proof_mode: true,
      },
    });
  } catch (error) {
    console.error('Failed to log auto-action:', error);
  }
}

/**
 * Run the Vision watchdog routine
 */
export async function runVisionWatchdog(): Promise<WatchdogResult> {
  const { mode } = await getVisionMode();
  const analysis = await analyzeWindow('5m');
  const actionsTaken: WatchdogResult['actions_taken'] = [];

  for (const anomaly of analysis.anomalies_detected) {
    if (mode === 'passive') {
      // Just log detection
      await logAutoAction(anomaly.id, 'detect', anomaly.module, 'skipped', mode, 'passive mode');
      actionsTaken.push({
        anomaly_id: anomaly.id,
        action_type: 'detect',
        target: anomaly.module,
        outcome: 'skipped',
        reason: 'Passive mode - no action taken',
      });
      continue;
    }

    if (mode === 'advisory') {
      // Log detection with recommendation
      const recommendation = getRecommendation(anomaly);
      await logAutoAction(anomaly.id, 'recommend', anomaly.module, 'skipped', mode, recommendation);
      actionsTaken.push({
        anomaly_id: anomaly.id,
        action_type: 'recommend',
        target: anomaly.module,
        outcome: 'skipped',
        reason: recommendation,
      });
      continue;
    }

    // Operative mode - take action for high/critical severity
    if (mode === 'operative' && (anomaly.severity === 'high' || anomaly.severity === 'critical')) {
      // Check cooldown
      if (isOnCooldown(anomaly.module)) {
        await logAutoAction(anomaly.id, 'heal', anomaly.module, 'skipped', mode, 'cooldown active');
        actionsTaken.push({
          anomaly_id: anomaly.id,
          action_type: 'heal',
          target: anomaly.module,
          outcome: 'skipped',
          reason: 'Cooldown active - waiting before next heal attempt',
        });
        continue;
      }

      // Determine action based on anomaly type
      const action = determineAction(anomaly);
      
      try {
        await executeAction(action, anomaly);
        recordHealAction(anomaly.module);
        await logAutoAction(anomaly.id, action.type, anomaly.module, 'requested', mode);
        actionsTaken.push({
          anomaly_id: anomaly.id,
          action_type: action.type,
          target: anomaly.module,
          outcome: 'requested',
        });
      } catch (error) {
        await logAutoAction(anomaly.id, action.type, anomaly.module, 'failed', mode, String(error));
        actionsTaken.push({
          anomaly_id: anomaly.id,
          action_type: action.type,
          target: anomaly.module,
          outcome: 'failed',
          reason: String(error),
        });
      }
    }
  }

  return {
    mode,
    anomalies_detected: analysis.anomalies_detected.length,
    actions_taken: actionsTaken,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Get recommendation for advisory mode
 */
function getRecommendation(anomaly: Anomaly): string {
  switch (anomaly.anomaly_type) {
    case 'error_spike':
      return `Recommend running system.heal for ${anomaly.module}`;
    case 'latency_spike':
      return `Recommend checking provider ${(anomaly.details as any)?.provider} or switching routes`;
    case 'health_drop':
      return `Recommend investigating ${anomaly.module} module health`;
    case 'provider_skew':
      return 'Recommend enabling fallback providers in Nexus';
    default:
      return 'Recommend manual investigation';
  }
}

/**
 * Determine action for operative mode
 */
function determineAction(anomaly: Anomaly): { type: string; params: Record<string, unknown> } {
  switch (anomaly.anomaly_type) {
    case 'error_spike':
    case 'health_drop':
      return { type: 'targeted_heal', params: { module: anomaly.module } };
    case 'latency_spike':
      return { type: 'provider_reroute', params: { provider: (anomaly.details as any)?.provider } };
    case 'provider_skew':
      return { type: 'enable_fallback', params: {} };
    default:
      return { type: 'log_alert', params: {} };
  }
}

/**
 * Execute an operative action
 */
async function executeAction(
  action: { type: string; params: Record<string, unknown> },
  anomaly: Anomaly
): Promise<void> {
  // Log the action request - actual healing is handled by pf-brain-auto-heal
  await supabase.from('brain_events').insert([{
    event_type: 'vision_heal_request',
    module: 'vision',
    outcome: 'pending',
    data: JSON.parse(JSON.stringify({
      action_type: action.type,
      params: action.params,
      anomaly_id: anomaly.id,
      anomaly_type: anomaly.anomaly_type,
      target_module: anomaly.module,
      severity: anomaly.severity,
      proof_mode: true,
    })),
  }]);

  // For targeted heal, we emit a request that pf-brain-auto-heal will pick up
  // This respects the existing healing architecture
  if (action.type === 'targeted_heal') {
    await supabase.from('brain_events').insert([{
      event_type: 'auto_heal_request',
      module: anomaly.module,
      outcome: 'pending',
      data: JSON.parse(JSON.stringify({
        requested_by: 'vision_watchdog',
        severity: anomaly.severity,
        anomaly_details: anomaly.details,
      })),
    }]);
  }
}
