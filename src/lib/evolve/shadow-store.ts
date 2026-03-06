/**
 * Shadow Store — Persistent Storage for Shadow Artifacts
 * Minimum viable, blocking implementation
 */

import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface ShadowArtifact {
  id: string;
  evolution_id: string;
  file_path: string;
  content: string;
  diff?: string;
  operation: 'create' | 'modify' | 'delete';
  created_at: Date;
  metadata?: Record<string, unknown>;
}

export interface ShadowStoreEntry {
  evolution_id: string;
  artifacts: ShadowArtifact[];
  status: 'pending' | 'written' | 'verified' | 'applied' | 'failed';
  created_at: Date;
  updated_at: Date;
  verified_at?: Date;
  applied_at?: Date;
  error?: string;
}

export interface WriteResult {
  success: boolean;
  artifact_id?: string;
  error?: string;
}

export interface StoreState {
  entries: Map<string, ShadowStoreEntry>;
  totalArtifacts: number;
}

// ═══════════════════════════════════════════════════════════════
// IN-MEMORY STORE (with persistence hooks)
// ═══════════════════════════════════════════════════════════════

class ShadowStoreClient {
  private entries: Map<string, ShadowStoreEntry> = new Map();
  
  // Hardening: Max entries to prevent unbounded memory growth
  private readonly MAX_ENTRIES = 50;
  // Hardening: Max content size per artifact (1MB)
  private readonly MAX_CONTENT_SIZE = 1_048_576;
  // Hardening: Max artifacts per evolution
  private readonly MAX_ARTIFACTS_PER_EVOLUTION = 100;
  // Hardening: Blocked path traversal patterns
  private readonly BLOCKED_PATH_PATTERNS = [/\.\.\//, /\.\.\\/, /^\//, /^~\//];
  
  /**
   * Initialize or get entry for an evolution
   */
  private getOrCreateEntry(evolution_id: string): ShadowStoreEntry {
    let entry = this.entries.get(evolution_id);
    if (!entry) {
      // Hardening 5: Evict oldest entries if at capacity
      if (this.entries.size >= this.MAX_ENTRIES) {
        const oldest = Array.from(this.entries.entries())
          .sort((a, b) => a[1].updated_at.getTime() - b[1].updated_at.getTime())[0];
        if (oldest) this.entries.delete(oldest[0]);
      }
      entry = {
        evolution_id,
        artifacts: [],
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };
      this.entries.set(evolution_id, entry);
    }
    return entry;
  }

  /**
   * Write an artifact to the shadow store
   * BLOCKING: If this fails, evolve.shadow MUST fail
   */
  async writeArtifact(
    evolution_id: string,
    file_path: string,
    content: string,
    options?: {
      diff?: string;
      operation?: 'create' | 'modify' | 'delete';
      metadata?: Record<string, unknown>;
    }
  ): Promise<WriteResult> {
    try {
      // Hardening 1: Validate file_path against traversal attacks
      if (this.BLOCKED_PATH_PATTERNS.some(p => p.test(file_path))) {
        return { success: false, error: 'Path traversal detected — blocked' };
      }
      
      // Hardening 2: Enforce content size limit
      if (content.length > this.MAX_CONTENT_SIZE) {
        return { success: false, error: `Content exceeds ${this.MAX_CONTENT_SIZE} byte limit` };
      }

      const entry = this.getOrCreateEntry(evolution_id);
      
      // Hardening 3: Cap artifacts per evolution
      if (entry.artifacts.length >= this.MAX_ARTIFACTS_PER_EVOLUTION) {
        return { success: false, error: `Max ${this.MAX_ARTIFACTS_PER_EVOLUTION} artifacts per evolution` };
      }
      
      // Hardening 4: Prevent duplicate file_path in same evolution
      if (entry.artifacts.some(a => a.file_path === file_path && a.operation !== 'delete')) {
        // Overwrite existing artifact instead of duplicating
        const idx = entry.artifacts.findIndex(a => a.file_path === file_path);
        if (idx >= 0) entry.artifacts.splice(idx, 1);
      }
      
      // Validate content
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: 'Content cannot be empty',
        };
      }
      
      // Create artifact
      const artifact: ShadowArtifact = {
        id: crypto.randomUUID(),
        evolution_id,
        file_path,
        content,
        diff: options?.diff,
        operation: options?.operation || 'create',
        created_at: new Date(),
        metadata: options?.metadata,
      };
      
      // Add to entry
      entry.artifacts.push(artifact);
      entry.status = 'written';
      entry.updated_at = new Date();
      
      // Persist to database (non-blocking on failure but we report it)
      await this.persistArtifact(artifact);
      
      return {
        success: true,
        artifact_id: artifact.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Write failed',
      };
    }
  }

  /**
   * Persist artifact to database
   */
  private async persistArtifact(artifact: ShadowArtifact): Promise<void> {
    try {
      await supabase.from('brain_events').insert({
        module: 'evolve',
        event_type: 'shadow_artifact_written',
        data: {
          artifact_id: artifact.id,
          evolution_id: artifact.evolution_id,
          file_path: artifact.file_path,
          operation: artifact.operation,
          content_length: artifact.content.length,
        },
        outcome: 'success',
      });
    } catch (e) {
      console.warn('[ShadowStore] Failed to persist artifact:', e);
    }
  }

  /**
   * Get all artifacts for an evolution
   */
  getArtifacts(evolution_id: string): ShadowArtifact[] {
    const entry = this.entries.get(evolution_id);
    return entry?.artifacts || [];
  }

  /**
   * Get entry status
   */
  getEntry(evolution_id: string): ShadowStoreEntry | undefined {
    return this.entries.get(evolution_id);
  }

  /**
   * Check if shadow has any artifacts
   */
  hasArtifacts(evolution_id: string): boolean {
    const entry = this.entries.get(evolution_id);
    return (entry?.artifacts.length || 0) > 0;
  }

  /**
   * Mark entry as verified
   */
  markVerified(evolution_id: string): boolean {
    const entry = this.entries.get(evolution_id);
    if (!entry) return false;
    
    entry.status = 'verified';
    entry.verified_at = new Date();
    entry.updated_at = new Date();
    return true;
  }

  /**
   * Mark entry as applied
   */
  markApplied(evolution_id: string): boolean {
    const entry = this.entries.get(evolution_id);
    if (!entry) return false;
    
    entry.status = 'applied';
    entry.applied_at = new Date();
    entry.updated_at = new Date();
    return true;
  }

  /**
   * Mark entry as failed
   */
  markFailed(evolution_id: string, error: string): boolean {
    const entry = this.entries.get(evolution_id);
    if (!entry) return false;
    
    entry.status = 'failed';
    entry.error = error;
    entry.updated_at = new Date();
    return true;
  }

  /**
   * Check if entry is verified
   */
  isVerified(evolution_id: string): boolean {
    const entry = this.entries.get(evolution_id);
    return entry?.status === 'verified' || entry?.status === 'applied';
  }

  /**
   * Get total artifact count
   */
  getTotalArtifacts(): number {
    let total = 0;
    this.entries.forEach(entry => {
      total += entry.artifacts.length;
    });
    return total;
  }

  /**
   * Get store state
   */
  getState(): StoreState {
    return {
      entries: new Map(this.entries),
      totalArtifacts: this.getTotalArtifacts(),
    };
  }

  /**
   * Clear all entries (for testing)
   */
  clear(): void {
    this.entries.clear();
  }

  /**
   * Delete entry
   */
  deleteEntry(evolution_id: string): boolean {
    return this.entries.delete(evolution_id);
  }
}

// ═══════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════

export const shadowStore = new ShadowStoreClient();
export { ShadowStoreClient };
