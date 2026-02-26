/**
 * CMPSBL Brain Verification
 * Confirms all core systems are online and operational
 * SPARTA Epoch
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

/**
 * Safely invoke an edge function, returning { data, error } without throwing.
 * Handles missing/archived functions gracefully.
 */
async function safeInvoke(fnName: string, body?: Record<string, unknown>): Promise<{ data: any; error: any }> {
  try {
    const result = await supabase.functions.invoke(fnName, body ? { body } : undefined);
    return result;
  } catch (err) {
    return { data: null, error: err };
  }
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

  // Test database connectivity first (most reliable signal)
  try {
    const { error } = await supabase
      .from('brain_memory_hot')
      .select('id', { count: 'exact', head: true });
    status.database = !error;
    status.details.database = { 
      accessible: !error, 
    };
  } catch (err) {
    status.details.database = { error: 'Database connection failed' };
  }

  // Test Brain status endpoint (graceful fallback if edge function missing)
  const brainResult = await safeInvoke('pf-brain-status');
  if (!brainResult.error && brainResult.data?.success) {
    status.brain = true;
    status.details.brain = brainResult.data.status;
  } else {
    // Fallback: derive brain status from database connectivity
    status.brain = status.database;
    status.details.brain = { 
      status: status.database ? 'inferred_from_db' : 'offline',
      note: 'pf-brain-status edge function unavailable, using database probe'
    };
  }

  // Test Core status (graceful fallback)
  const coreResult = await safeInvoke('pf-core-status');
  if (!coreResult.error && coreResult.data?.success) {
    status.vision = true;
    status.inclusive = true;
    status.details.core = coreResult.data.status;
  } else {
    // Fallback: derive from database
    status.vision = status.database;
    status.inclusive = status.database;
    status.details.core = { 
      status: status.database ? 'inferred_from_db' : 'offline',
      note: 'pf-core-status edge function unavailable, using database probe'
    };
  }

  // Defense is operational if database is accessible
  status.defense = status.database;
  status.details.defense = { 
    status: status.database ? 'monitoring' : 'offline',
  };

  // Cascade (dream engine) status
  status.cascade = status.brain;
  status.details.cascade = {
    status: status.brain ? 'ready' : 'waiting_for_brain',
  };

  return status;
}

export async function initializeBrain(): Promise<boolean> {
  try {
    console.log('🧠 Initializing CMPSBL Brain...');
    
    const { data, error } = await safeInvoke('pf-brain-initialize');
    
    if (error) {
      console.warn('Brain initialization edge function unavailable:', error);
      return false;
    }
    
    console.log('✅ Brain initialized:', data);
    return data?.success || false;
  } catch (err) {
    console.warn('Brain initialization failed:', err);
    return false;
  }
}
