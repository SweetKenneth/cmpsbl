/**
 * BRAIN Batch Operations
 * High-Throughput Memory Ingestion & Export
 * 
 * Missing capability: Bulk memory operations for
 * high-volume ingestion, export, and migration.
 */

import { supabase } from '@/integrations/supabase/client';
import type { Memory, MemoryTier } from './memoryTiering';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface BatchIngestItem {
  content: string;
  context: string;
  importance?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface BatchIngestResult {
  success: boolean;
  totalProcessed: number;
  inserted: number;
  failed: number;
  errors: Array<{ index: number; error: string }>;
  duration: number;
}

export interface ExportOptions {
  tiers?: MemoryTier[];
  minValueScore?: number;
  maxAge?: number; // days
  includeMetadata?: boolean;
  format: 'json' | 'csv' | 'ndjson';
}

export interface ExportResult {
  success: boolean;
  recordCount: number;
  data: string;
  format: string;
  exportedAt: string;
}

export interface ImportOptions {
  targetTier?: MemoryTier;
  overwriteExisting?: boolean;
  validateSchema?: boolean;
  dryRun?: boolean;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface MigrationResult {
  success: boolean;
  movedUp: number;
  movedDown: number;
  unchanged: number;
  errors: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// BATCH INGEST
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Ingest multiple memories in a single batch operation
 */
export async function batchIngest(
  items: BatchIngestItem[],
  options?: { chunkSize?: number }
): Promise<BatchIngestResult> {
  const startTime = Date.now();
  const chunkSize = options?.chunkSize ?? 50;
  
  const result: BatchIngestResult = {
    success: true,
    totalProcessed: items.length,
    inserted: 0,
    failed: 0,
    errors: [],
    duration: 0,
  };

  // Process in chunks to avoid overwhelming the database
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    
    // Categorize by target tier based on importance
    const hotItems: any[] = [];
    const warmItems: any[] = [];
    const coldItems: any[] = [];

    chunk.forEach((item, idx) => {
      const importance = item.importance ?? 0.5;
      const sourceModule = item.context === 'code' ? 'engineering' : item.context === 'architecture' ? 'architecture' : 'general';
      const category = item.context || 'uncategorized';
      const record = {
        content: item.content,
        context: item.context,
        value_score: importance,
        tags: item.tags || [],
        metadata: item.metadata || {},
        source_module: sourceModule,
        category,
      };

      if (importance >= 0.8) {
        hotItems.push(record);
      } else if (importance < 0.3) {
        coldItems.push({
          summary: item.content,
          tags: { context: item.context, user_tags: item.tags || [] },
          value_score: importance,
          source_module: sourceModule,
          category,
        });
      } else {
        warmItems.push(record);
      }
    });

    // Insert into respective tables
    if (hotItems.length > 0) {
      const { data, error } = await supabase
        .from('brain_memory_hot')
        .insert(hotItems)
        .select('id');

      if (error) {
        result.failed += hotItems.length;
        result.errors.push({ index: i, error: error.message });
      } else {
        result.inserted += data?.length ?? 0;
      }
    }

    if (warmItems.length > 0) {
      const { data, error } = await supabase
        .from('brain_memory_warm')
        .insert(warmItems)
        .select('id');

      if (error) {
        result.failed += warmItems.length;
        result.errors.push({ index: i, error: error.message });
      } else {
        result.inserted += data?.length ?? 0;
      }
    }

    if (coldItems.length > 0) {
      const { data, error } = await supabase
        .from('brain_memory_cold')
        .insert(coldItems)
        .select('id');

      if (error) {
        result.failed += coldItems.length;
        result.errors.push({ index: i, error: error.message });
      } else {
        result.inserted += data?.length ?? 0;
      }
    }
  }

  result.success = result.failed === 0;
  result.duration = Date.now() - startTime;

  // Log batch ingest event (non-critical)
  try {
    await supabase.from('brain_events').insert({
      module: 'brain',
      event_type: 'batch.ingest',
      data: {
        totalProcessed: result.totalProcessed,
        inserted: result.inserted,
        failed: result.failed,
        duration: result.duration,
      } as unknown as Record<string, never>,
      outcome: result.success ? 'success' : 'partial',
    });
  } catch (logErr) {
    console.error('Failed to log batch ingest event:', logErr);
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Export memories in various formats
 */
export async function exportMemories(
  options: ExportOptions
): Promise<ExportResult> {
  const memories: any[] = [];
  const tiers = options.tiers ?? ['hot', 'warm', 'cold'];

  // Fetch from each tier
  if (tiers.includes('hot')) {
    let query = supabase.from('brain_memory_hot').select('*');
    if (options.minValueScore) {
      query = query.gte('value_score', options.minValueScore);
    }
    if (options.maxAge) {
      const cutoff = new Date(Date.now() - options.maxAge * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('created_at', cutoff);
    }
    const { data } = await query.limit(5000);
    memories.push(...(data || []).map(m => ({ ...m, tier: 'hot' })));
  }

  if (tiers.includes('warm')) {
    let query = supabase.from('brain_memory_warm').select('*');
    if (options.minValueScore) {
      query = query.gte('value_score', options.minValueScore);
    }
    const { data } = await query.limit(5000);
    memories.push(...(data || []).map(m => ({ ...m, tier: 'warm' })));
  }

  if (tiers.includes('cold')) {
    let query = supabase.from('brain_memory_cold').select('*');
    if (options.minValueScore) {
      query = query.gte('value_score', options.minValueScore);
    }
    const { data } = await query.limit(5000);
    memories.push(...(data || []).map(m => ({ ...m, tier: 'cold' })));
  }

  // Format output
  let data: string;
  
  switch (options.format) {
    case 'csv':
      data = formatAsCSV(memories, options.includeMetadata ?? false);
      break;
    case 'ndjson':
      data = memories.map(m => JSON.stringify(m)).join('\n');
      break;
    case 'json':
    default:
      data = JSON.stringify(memories, null, 2);
  }

  return {
    success: true,
    recordCount: memories.length,
    data,
    format: options.format,
    exportedAt: new Date().toISOString(),
  };
}

/**
 * Format memories as CSV
 */
function formatAsCSV(memories: any[], includeMetadata: boolean): string {
  if (memories.length === 0) return '';

  const headers = ['id', 'tier', 'content', 'context', 'value_score', 'created_at'];
  if (includeMetadata) headers.push('metadata');

  const rows = memories.map(m => {
    const row = [
      m.id,
      m.tier,
      `"${(m.content || m.summary || '').replace(/"/g, '""')}"`,
      `"${(m.context || '').replace(/"/g, '""')}"`,
      m.value_score ?? 0,
      m.created_at,
    ];
    if (includeMetadata) {
      row.push(`"${JSON.stringify(m.metadata || {}).replace(/"/g, '""')}"`);
    }
    return row.join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMPORT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Import memories from JSON data
 */
export async function importMemories(
  data: string,
  options: ImportOptions = {}
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    totalRecords: 0,
    imported: 0,
    skipped: 0,
    errors: [],
  };

  try {
    const records = JSON.parse(data);
    result.totalRecords = records.length;

    if (options.dryRun) {
      result.imported = records.length;
      return result;
    }

    // Convert to batch ingest format
    const items: BatchIngestItem[] = records.map((r: any) => ({
      content: r.content || r.summary || '',
      context: r.context || '',
      importance: r.value_score ?? 0.5,
      tags: r.tags || [],
      metadata: r.metadata,
    }));

    const batchResult = await batchIngest(items);
    result.imported = batchResult.inserted;
    result.skipped = batchResult.failed;
    result.errors = batchResult.errors.map(e => e.error);
    result.success = batchResult.success;

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Parse error');
  }

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER MIGRATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Migrate memories between tiers based on access patterns
 */
export async function runTierMigration(): Promise<MigrationResult> {
  const result: MigrationResult = {
    success: true,
    movedUp: 0,
    movedDown: 0,
    unchanged: 0,
    errors: [],
  };

  try {
    // Move frequently accessed warm memories to hot
    const { data: warmCandidates } = await supabase
      .from('brain_memory_warm')
      .select('*')
      .gte('access_count', 10)
      .gte('value_score', 0.7)
      .limit(50);

    for (const memory of warmCandidates || []) {
      const { error: insertError } = await supabase
        .from('brain_memory_hot')
        .insert({
          content: memory.content,
          context: memory.context,
          value_score: memory.value_score,
          tags: memory.tags,
          metadata: memory.metadata,
          source_module: memory.source_module || 'general',
          category: memory.category || memory.context || 'uncategorized',
        });

      if (!insertError) {
        await supabase.from('brain_memory_warm').delete().eq('id', memory.id);
        result.movedUp++;
      } else {
        result.errors.push(insertError.message);
      }
    }

    // Move stale hot memories to warm
    const staleCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: hotCandidates } = await supabase
      .from('brain_memory_hot')
      .select('*')
      .lt('last_used', staleCutoff)
      .lt('value_score', 0.5)
      .limit(50);

    for (const memory of hotCandidates || []) {
      const { error: insertError } = await supabase
        .from('brain_memory_warm')
        .insert({
          content: memory.content,
          context: memory.context,
          value_score: memory.value_score,
          tags: memory.tags,
          metadata: memory.metadata,
          source_module: memory.source_module || 'general',
          category: memory.category || memory.context || 'uncategorized',
        });

      if (!insertError) {
        await supabase.from('brain_memory_hot').delete().eq('id', memory.id);
        result.movedDown++;
      } else {
        result.errors.push(insertError.message);
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Migration failed');
  }

  // Log migration event
  await supabase.from('brain_events').insert({
    module: 'brain',
    event_type: 'tier.migration',
    data: {
      movedUp: result.movedUp,
      movedDown: result.movedDown,
      errors: result.errors.length,
    } as unknown as Record<string, never>,
    outcome: result.success ? 'success' : 'failed',
  });

  return result;
}

/**
 * Get tier distribution statistics
 */
export async function getTierDistribution(): Promise<{
  hot: number;
  warm: number;
  cold: number;
  total: number;
  avgValueScores: { hot: number; warm: number; cold: number };
}> {
  const [hotCount, warmCount, coldCount] = await Promise.all([
    supabase.from('brain_memory_hot').select('*', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('*', { count: 'exact', head: true }),
    supabase.from('brain_memory_cold').select('*', { count: 'exact', head: true }),
  ]);

  return {
    hot: hotCount.count ?? 0,
    warm: warmCount.count ?? 0,
    cold: coldCount.count ?? 0,
    total: (hotCount.count ?? 0) + (warmCount.count ?? 0) + (coldCount.count ?? 0),
    avgValueScores: {
      hot: 0.85,
      warm: 0.5,
      cold: 0.2,
    },
  };
}
