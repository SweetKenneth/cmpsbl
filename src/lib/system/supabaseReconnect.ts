/**
 * Supabase Reconnection Utility
 * Reinitializes connection using existing credentials
 */

import { supabase } from '@/integrations/supabase/client';

export async function reconnectSupabase() {
  try {
    // Simple health check to confirm connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" which is fine - means connection works
      throw error;
    }

    const status = {
      connected: true,
      project_id: import.meta.env.VITE_SUPABASE_PROJECT_ID,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('pf_supabase_status', JSON.stringify(status));
    
    return status;
  } catch (error) {
    const status = {
      connected: false,
      error: error instanceof Error ? error.message : 'Connection failed',
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('pf_supabase_status', JSON.stringify(status));
    
    throw error;
  }
}

export function getConnectionStatus() {
  const stored = localStorage.getItem('pf_supabase_status');
  return stored ? JSON.parse(stored) : { connected: false };
}
