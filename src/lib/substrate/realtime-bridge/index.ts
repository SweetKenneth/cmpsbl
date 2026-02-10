/**
 * Module Bus → Supabase Realtime Bridge v1.0.0
 * Connects the in-memory module bus to Supabase Realtime channels
 * for cross-tab, cross-session signal propagation
 */

import { supabase } from '@/integrations/supabase/client';
import { subscribe, publish, type ModuleName } from '../module-bus';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface BridgeConfig {
  channelPrefix: string;
  bridgedSignals: string[];
  enabled: boolean;
}

const DEFAULT_CONFIG: BridgeConfig = {
  channelPrefix: 'substrate',
  bridgedSignals: [
    'threat.detected',
    'health.degraded',
    'evolution.applied',
    'resource.pressure',
    'anomaly.detected',
    'rollback.triggered',
  ],
  enabled: true,
};

let bridgeChannel: RealtimeChannel | null = null;
let bridgeActive = false;

/**
 * Start the realtime bridge — subscribes to bus signals and
 * broadcasts them via Supabase Realtime, and vice versa
 */
export function startRealtimeBridge(config: Partial<BridgeConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (!cfg.enabled || bridgeActive) return;
  
  const channelName = `${cfg.channelPrefix}:bus`;
  
  bridgeChannel = supabase
    .channel(channelName)
    .on('broadcast', { event: 'bus_signal' }, (payload) => {
      const { signal, data, source } = payload.payload as any;
      if (source === 'local') return;
      
      console.log(`[Realtime-Bridge] Received remote signal: ${signal}`);
      // Re-publish into local bus from 'system' as relay
      publish('system' as ModuleName, signal, data || {});
    })
    .subscribe();
  
  // Subscribe to all bridged signals on the local bus via wildcard
  subscribe('system' as ModuleName, '*', (signal) => {
    if (!cfg.bridgedSignals.includes(signal.type)) return;
    if ((signal.payload as any)?._remote) return;
    
    bridgeChannel?.send({
      type: 'broadcast',
      event: 'bus_signal',
      payload: { signal: signal.type, data: signal.payload, source: 'local' },
    });
  });
  
  bridgeActive = true;
  console.log(`[Realtime-Bridge] Active, bridging ${cfg.bridgedSignals.length} signals`);
}

/**
 * Stop the bridge
 */
export function stopRealtimeBridge(): void {
  if (bridgeChannel) {
    supabase.removeChannel(bridgeChannel);
    bridgeChannel = null;
  }
  bridgeActive = false;
  console.log('[Realtime-Bridge] Stopped');
}

/**
 * Check bridge status
 */
export function getBridgeStatus(): { active: boolean; channel: string | null } {
  return {
    active: bridgeActive,
    channel: bridgeChannel ? 'connected' : null,
  };
}
