/**
 * Module Bus → Supabase Realtime Bridge v1.0.0
 * Connects the in-memory module bus to Supabase Realtime channels
 * for cross-tab, cross-session signal propagation
 */

import { supabase } from '@/integrations/supabase/client';
import { moduleBus } from '../module-bus';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface BridgeConfig {
  channelPrefix: string;
  bridgedSignals: string[];
  enabled: boolean;
}

const DEFAULT_CONFIG: BridgeConfig = {
  channelPrefix: 'substrate',
  bridgedSignals: [
    'THREAT_DETECTED',
    'PROVIDER_DOWN',
    'EVOLUTION_APPLIED',
    'MEMORY_PRESSURE',
    'MODULE_DEGRADED',
    'COST_ALERT',
    'ANOMALY_DETECTED',
    'ROLLBACK_TRIGGERED',
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
      // Avoid echo — don't re-emit signals that originated locally
      if (source === 'local') return;
      
      console.log(`[Realtime-Bridge] Received remote signal: ${signal}`);
      moduleBus.emit(signal, { ...data, _remote: true });
    })
    .subscribe();
  
  // Subscribe to all bridged signals on the local bus
  for (const signal of cfg.bridgedSignals) {
    moduleBus.on(signal, (data: any) => {
      // Don't re-broadcast remote signals
      if (data?._remote) return;
      
      bridgeChannel?.send({
        type: 'broadcast',
        event: 'bus_signal',
        payload: { signal, data, source: 'local' },
      });
    });
  }
  
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
