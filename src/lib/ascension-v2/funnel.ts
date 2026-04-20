/**
 * Ascension V2 Funnel Emitter
 *
 * Six events that prove the pipeline converts:
 *   upload_started  → user submitted source
 *   gate_passed     → Pre-Ascension Gate accepted it
 *   discovery_complete → analysis produced ≥1 capability
 *   layer_attached  → user attached at least one layer
 *   export_clicked  → user pressed "Download" on results
 *   export_complete → ZIP successfully generated and saved
 *
 * Writes to public.analytics_events (category='funnel'). Always
 * fire-and-forget — telemetry must never block the pipeline.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';

export type FunnelEvent =
  | 'upload_started'
  | 'gate_passed'
  | 'discovery_complete'
  | 'layer_attached'
  | 'export_clicked'
  | 'export_complete';

export interface FunnelEventPayload {
  runId: string;
  language?: string;
  fileCount?: number;
  durationMs?: number;
  capabilityCount?: number;
  layerCount?: number;
  /** IDs of layers attached on this run (used by /ascension-v2/layers). */
  layerIds?: string[];
  fingerprint?: string;
  /** Optional free-form extras — never PII. */
  extras?: Record<string, string | number | boolean | null>;
}

const SESSION_KEY = 'cmpsbl_v2_sid';

function getSessionId(): string {
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `nosession-${Date.now()}`;
  }
}

/**
 * Emit a funnel event. Never throws, never awaits caller-visible work.
 * Returns the underlying promise only so tests can await it.
 */
export function emitFunnelEvent(
  event: FunnelEvent,
  payload: FunnelEventPayload,
): Promise<void> {
  const send = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id ?? null;
      const metadata: Record<string, unknown> = {
        run_id: payload.runId,
      };
      if (payload.language !== undefined) metadata.language = payload.language;
      if (payload.fileCount !== undefined) metadata.file_count = payload.fileCount;
      if (payload.durationMs !== undefined) metadata.duration_ms = payload.durationMs;
      if (payload.capabilityCount !== undefined) metadata.capability_count = payload.capabilityCount;
      if (payload.layerCount !== undefined) metadata.layer_count = payload.layerCount;
      if (payload.layerIds !== undefined) metadata.layer_ids = payload.layerIds;
      if (payload.fingerprint !== undefined) metadata.fingerprint = payload.fingerprint;
      if (payload.extras) Object.assign(metadata, payload.extras);

      await supabase.from('analytics_events').insert([
        {
          event_type: event,
          category: 'funnel',
          label: payload.language ?? undefined,
          value: payload.durationMs ?? undefined,
          page: '/ascension-v2',
          session_id: getSessionId(),
          user_id: userId ?? undefined,
          metadata: metadata as never,
        },
      ]);
    } catch {
      // Telemetry is best-effort. Never surface failures to the user.
    }
  };
  return send();
}
