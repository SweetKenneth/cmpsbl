/**
 * Nexus Analytics Logger
 * Tracks AI routing performance and provider health
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface NexusLogEvent {
  provider: string;
  latency_ms: number;
  token_count: number;
  cost_usd_est: number;
  status: 'success' | 'failure';
  route_key: string;
}

export async function logNexus(event: NexusLogEvent): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Nexus logging disabled: missing Supabase credentials');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase
      .from('nexus_logs')
      .insert({
        provider: event.provider,
        latency_ms: event.latency_ms,
        token_count: event.token_count,
        cost_usd_est: event.cost_usd_est,
        status: event.status,
        route_key: event.route_key
      });

    if (error) {
      console.error('Failed to log nexus event:', error);
    }
  } catch (error) {
    console.error('Nexus logging error:', error);
  }
}
