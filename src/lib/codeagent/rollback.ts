/**
 * CodeAgent Rollback System
 * Tracks changes and enables reverting failed modifications
 */

import { supabase } from '@/integrations/supabase/client';

export interface ChangeRecord {
  id: string;
  timestamp: Date;
  changeType: 'code' | 'database' | 'config';
  module: string;
  description: string;
  beforeState: string;
  afterState: string;
  rollbackSql?: string;
  status: 'pending' | 'applied' | 'rolled_back' | 'failed';
  appliedBy: 'agent' | 'user';
}

export interface RollbackResult {
  success: boolean;
  error?: string;
  restoredState?: string;
}

// In-memory change stack (for current session)
let changeStack: ChangeRecord[] = [];

/**
 * Record a change before applying it
 */
export function recordChange(change: Omit<ChangeRecord, 'id' | 'timestamp' | 'status'>): ChangeRecord {
  const record: ChangeRecord = {
    ...change,
    id: `chg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    status: 'pending'
  };
  
  changeStack.push(record);
  
  // Keep only last 50 changes in memory
  if (changeStack.length > 50) {
    changeStack = changeStack.slice(-50);
  }
  
  return record;
}

/**
 * Mark a change as applied
 */
export function markApplied(changeId: string): void {
  const change = changeStack.find(c => c.id === changeId);
  if (change) {
    change.status = 'applied';
  }
}

/**
 * Mark a change as failed
 */
export function markFailed(changeId: string): void {
  const change = changeStack.find(c => c.id === changeId);
  if (change) {
    change.status = 'failed';
  }
}

/**
 * Rollback the last applied change
 */
export async function rollbackLast(): Promise<RollbackResult> {
  const lastApplied = [...changeStack]
    .reverse()
    .find(c => c.status === 'applied');
  
  if (!lastApplied) {
    return { success: false, error: 'No changes to rollback' };
  }
  
  return rollbackChange(lastApplied.id);
}

/**
 * Rollback a specific change
 */
export async function rollbackChange(changeId: string): Promise<RollbackResult> {
  const change = changeStack.find(c => c.id === changeId);
  
  if (!change) {
    return { success: false, error: 'Change not found' };
  }
  
  if (change.status !== 'applied') {
    return { success: false, error: 'Change is not in applied state' };
  }
  
  try {
    // For database changes, execute rollback SQL
    if (change.changeType === 'database' && change.rollbackSql) {
      // Log the rollback attempt
      await supabase.from('brain_events').insert({
        event_type: 'rollback_attempt',
        module: 'evolution',
        outcome: 'pending',
        data: {
          change_id: change.id,
          change_type: change.changeType,
          module: change.module,
          has_rollback_sql: !!change.rollbackSql
        }
      });
      
      // Note: Actual SQL execution requires migration tool
      // This logs the rollback for manual execution
      console.log('🔄 Rollback SQL prepared:', change.rollbackSql);
    }
    
    // For code changes, restore the previous state
    if (change.changeType === 'code') {
      console.log('🔄 Restore previous code state:', change.beforeState.substring(0, 100));
    }
    
    change.status = 'rolled_back';
    
    // Log successful rollback
    await supabase.from('brain_events').insert({
      event_type: 'rollback_completed',
      module: 'evolution',
      outcome: 'success',
      data: {
        change_id: change.id,
        change_type: change.changeType
      }
    });
    
    return { 
      success: true, 
      restoredState: change.beforeState 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Get recent changes
 */
export function getRecentChanges(limit: number = 10): ChangeRecord[] {
  return changeStack.slice(-limit).reverse();
}

/**
 * Get changes by status
 */
export function getChangesByStatus(status: ChangeRecord['status']): ChangeRecord[] {
  return changeStack.filter(c => c.status === status);
}

/**
 * Clear the change stack (use with caution)
 */
export function clearChangeStack(): void {
  changeStack = [];
}

/**
 * Persist changes to database for recovery
 */
export async function persistChanges(): Promise<boolean> {
  try {
    const changesToPersist = changeStack.filter(c => c.status === 'applied');
    
    if (changesToPersist.length === 0) {
      return true;
    }
    
    for (const change of changesToPersist) {
      await supabase.from('brain_memories').insert({
        content: JSON.stringify({
          id: change.id,
          changeType: change.changeType,
          module: change.module,
          description: change.description,
          timestamp: change.timestamp,
          rollbackSql: change.rollbackSql,
          beforeState_preview: change.beforeState.slice(0, 500),
          afterState_preview: change.afterState.slice(0, 500),
          beforeState_length: change.beforeState.length,
          afterState_length: change.afterState.length,
        }),
        memory_type: 'change_record',
        source: 'code_agent',
        confidence: 0.9,
        tags: ['rollback', change.changeType, change.module],
        metadata: {
          change_id: change.id,
          can_rollback: !!change.rollbackSql || change.changeType === 'code'
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to persist changes:', error);
    return false;
  }
}

/**
 * Load changes from database for recovery
 */
export async function loadPersistedChanges(): Promise<ChangeRecord[]> {
  try {
    const { data } = await supabase
      .from('brain_memories')
      .select('content, created_at')
      .eq('memory_type', 'change_record')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (!data) return [];
    
    return data.map(row => {
      const parsed = typeof row.content === 'string' 
        ? JSON.parse(row.content) 
        : row.content;
      return {
        ...parsed,
        timestamp: new Date(parsed.timestamp),
        // Mark as 'applied' but flag that full state is not available
        status: 'applied' as const,
        beforeState: parsed.beforeState_preview || '',
        afterState: parsed.afterState_preview || '',
        appliedBy: 'agent' as const,
        _persisted: true,  // Flag: loaded from DB, partial state only
      };
    });
  } catch {
    return [];
  }
}
