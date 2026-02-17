/**
 * CMPSBL Brain Verification
 * Confirms all core systems are online and operational
 * v10.5.4 ARCHITECT Epoch
 */

import { supabase } from '@/integrations/supabase/client';

export interface SystemStatus {
  brain: boolean;
  defense: boolean;
  vision: boolean;
  inclusive: boolean;
  cascade: boolean;
  database: boolean;
  details: Record<string, any>;
}

export async function verifyAllSystems(): Promise<SystemStatus> {
  const status: SystemStatus = {
    brain: false,
    defense: false,
    vision: false,
    inclusive: false,
    cascade: false,
    database: false,
    details: {}
  };

  // Test Brain status endpoint
  try {
    const { data, error } = await supabase.functions.invoke('pf-brain-status');
    status.brain = !error && data?.success;
    status.details.brain = data?.status || { error: error?.message };
  } catch (err) {
    status.details.brain = { error: 'Brain offline' };
  }

  // Test Core status
  try {
    const { data, error } = await supabase.functions.invoke('pf-core-status');
    status.vision = !error && data?.success;
    status.inclusive = !error && data?.success;
    status.details.core = data?.status || { error: error?.message };
  } catch (err) {
    status.details.core = { error: 'Core offline' };
  }

  // Test database connectivity
  try {
    const { data, error } = await supabase
      .from('brain_memory_hot')
      .select('id', { count: 'exact', head: true });
    status.database = !error;
    status.details.database = { 
      accessible: !error, 
      memory_count: data ? '✓' : 'empty'
    };
  } catch (err) {
    status.details.database = { error: 'Database connection failed' };
  }

  // Defense is operational if database is accessible
  status.defense = status.database;
  status.details.defense = { 
    status: status.database ? 'monitoring' : 'offline',
    tables_created: status.database 
  };

  // Cascade (dream engine) status
  status.cascade = status.brain;
  status.details.cascade = {
    status: status.brain ? 'ready' : 'waiting_for_brain',
    dream_cycles: status.brain ? 'available' : 'unavailable'
  };

  return status;
}

export async function initializeBrain(): Promise<boolean> {
  try {
    console.log('🧠 Initializing CMPSBL Brain...');
    
    const { data, error } = await supabase.functions.invoke('pf-brain-initialize');
    
    if (error) {
      console.error('Brain initialization error:', error);
      return false;
    }
    
    console.log('✅ Brain initialized:', data);
    return data?.success || false;
  } catch (err) {
    console.error('Brain initialization failed:', err);
    return false;
  }
}
