/**
 * Safe Mode Controller — DB-backed cascade severity + deterministic containment
 * S1: local isolation, S2: freeze evolution + degrade, S3: full Safe Mode
 */

import type { SafeModeLevel, SafeModeState } from '../scheduler/types';
import { supabase } from '@/integrations/supabase/client';

export type CascadeSeverity = 'S1' | 'S2' | 'S3';

export interface CascadeEvent {
  id: string;
  severity: CascadeSeverity;
  origin_module: string;
  affected_modules: string[];
  actions_taken: ContainmentAction[];
  timestamp: string;
  resolved: boolean;
  resolved_at: string | null;
}

export interface ContainmentAction {
  type: 'isolate_origin' | 'open_downstream_breakers' | 'freeze_evolution' | 'degrade_features' | 'safe_mode' | 'lock_spend';
  target: string;
  executed_at: string;
}

/** Determine cascade severity from affected modules */
export function classifySeverity(originModule: string, affectedModules: string[]): CascadeSeverity {
  const coreModules = ['CORE', 'SYSTEM', 'DEFENSE', 'IDENTITY'];
  const affectedUpper = affectedModules.map(m => m.toUpperCase());
  const hitCore = affectedUpper.some(m => coreModules.includes(m));
  const count = affectedModules.length;

  if (hitCore && count >= 3) return 'S3';
  if (count >= 4) return 'S2';
  return 'S1';
}

/** Execute deterministic containment for a cascade */
export async function containCascade(
  originModule: string,
  affectedModules: string[],
  actorId: string
): Promise<CascadeEvent> {
  const severity = classifySeverity(originModule, affectedModules);
  const now = new Date().toISOString();
  const actions: ContainmentAction[] = [];

  // S1: Isolate origin + open downstream breakers
  actions.push({ type: 'isolate_origin', target: originModule, executed_at: now });
  for (const m of affectedModules) {
    actions.push({ type: 'open_downstream_breakers', target: m, executed_at: now });
  }

  // S2: Also freeze evolution + degrade nonessential
  if (severity === 'S2' || severity === 'S3') {
    actions.push({ type: 'freeze_evolution', target: 'EVOLUTION', executed_at: now });
    actions.push({ type: 'degrade_features', target: 'nonessential', executed_at: now });
  }

  // S3: Full Safe Mode
  if (severity === 'S3') {
    actions.push({ type: 'safe_mode', target: 'system', executed_at: now });
    actions.push({ type: 'lock_spend', target: 'providers', executed_at: now });
  }

  const eventId = crypto.randomUUID();

  const event: CascadeEvent = {
    id: eventId,
    severity,
    origin_module: originModule,
    affected_modules: affectedModules,
    actions_taken: actions,
    timestamp: now,
    resolved: false,
    resolved_at: null,
  };

  // Persist cascade event to DB
  await supabase.from('cascade_events').insert({
    id: eventId,
    severity,
    origin_module: originModule,
    affected_modules: affectedModules as any,
    actions_taken: actions as any,
    resolved: false,
  });

  // S3: Also update safe mode in DB
  if (severity === 'S3') {
    await setSafeMode('read_only', actorId, `S3 cascade from ${originModule}`, eventId);
  }

  return event;
}

/** Set Safe Mode level — persisted to DB (governor/admin only) */
export async function setSafeMode(
  level: SafeModeLevel,
  actorId: string,
  reason: string,
  cascadeEventId: string | null
): Promise<void> {
  await supabase.from('substrate_safe_mode').upsert({
    id: 1,
    level,
    activated_at: level === 'off' ? null : new Date().toISOString(),
    activated_by: actorId,
    reason,
    cascade_event_id: cascadeEventId,
  });
}

/** Get current Safe Mode state from DB */
export async function getSafeModeState(): Promise<SafeModeState> {
  const { data } = await supabase
    .from('substrate_safe_mode')
    .select('*')
    .eq('id', 1)
    .single();

  if (!data) {
    return { level: 'off', activated_at: null, activated_by: null, reason: null, cascade_event_id: null };
  }

  return {
    level: (data as any).level ?? 'off',
    activated_at: (data as any).activated_at ?? null,
    activated_by: (data as any).activated_by ?? null,
    reason: (data as any).reason ?? null,
    cascade_event_id: (data as any).cascade_event_id ?? null,
  };
}

/** Resolve a cascade event in DB */
export async function resolveCascade(eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('cascade_events')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', eventId)
    .eq('resolved', false)
    .select('id');

  return (data?.length ?? 0) > 0;
}

/** Get cascade history from DB */
export async function getCascadeLog(limit = 50): Promise<CascadeEvent[]> {
  const { data } = await supabase
    .from('cascade_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    severity: row.severity as CascadeSeverity,
    origin_module: row.origin_module,
    affected_modules: row.affected_modules ?? [],
    actions_taken: row.actions_taken ?? [],
    timestamp: row.created_at,
    resolved: row.resolved,
    resolved_at: row.resolved_at,
  }));
}

/** Check if system is in degraded or higher safe mode */
export async function isInSafeMode(): Promise<boolean> {
  const state = await getSafeModeState();
  return state.level !== 'off';
}
