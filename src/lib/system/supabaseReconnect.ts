/**
 * Supabase Reconnection Utility
 * Reinitializes connection using existing credentials
 */

import { supabase } from '@/integrations/supabase/client';
import { secureSet, secureGet } from '@/lib/system/secureStorage';

export async function reconnectSupabase() {
  try {
    // Simple health check to confirm connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    const status = {
      connected: true,
      project_id: import.meta.env.VITE_SUPABASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    };

    secureSet('pf_supabase_status', status);
    
    return status;
  } catch (error) {
    const status = {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      timestamp: new Date().toISOString()
    };

    secureSet('pf_supabase_status', status);
    
    throw error;
  }
}

export function getConnectionStatus() {
  const stored = secureGet<{ connected: boolean; error?: string; timestamp?: string }>('pf_supabase_status');
  return stored ?? { connected: false };
}
