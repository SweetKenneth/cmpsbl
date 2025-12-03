/**
 * Force Supabase Reconnection
 * Triggers immediate reconnection without diagnostics
 */

import { reconnectSupabase } from './supabaseReconnect';
import { supabase } from '@/integrations/supabase/client';

export async function forceReconnect() {
  console.log('🔄 Forcing Supabase reconnection...');
  
  try {
    // Clear any cached connection state
    localStorage.removeItem('pf_supabase_status');
    
    // Remove all active realtime channels
    const channels = supabase.getChannels();
    await Promise.all(channels.map(ch => ch.unsubscribe()));
    
    // Wait a moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Trigger fresh connection
    const status = await reconnectSupabase();
    
    console.log('✅ Reconnection complete:', status);
    return status;
  } catch (error) {
    console.error('❌ Reconnection failed:', error);
    throw error;
  }
}
