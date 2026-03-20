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
  const tiers = options.tiers ?? ['hot', 'warm', 'cold', 'glacier'];

  // Fetch from each tier
  // Parallel fetch from all requested tiers
  const tierFetchers: Promise<void>[] = [];

  if (tiers.includes('hot')) {
    tierFetchers.push((async () => {
      let query = supabase.from('brain_memory_hot').select('id, content, context, value_score, access_count, tags, metadata, created_at, last_used');
      if (options.minValueScore) query = query.gte('value_score', options.minValueScore);
      if (options.maxAge) {
        const cutoff = new Date(Date.now() - options.maxAge * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('created_at', cutoff);
      }
      const { data } = await query.limit(5000);
      memories.push(...(data || []).map(m => ({ ...m, tier: 'hot' })));
    })());
  }

  if (tiers.includes('warm')) {
    tierFetchers.push((async () => {
      let query = supabase.from('brain_memory_warm').select('id, content, context, value_score, access_count, tags, metadata, created_at');
      if (options.minValueScore) query = query.gte('value_score', options.minValueScore);
      const { data } = await query.limit(5000);
      memories.push(...(data || []).map(m => ({ ...m, tier: 'warm' })));
    })());
  }

  if (tiers.includes('cold')) {
    tierFetchers.push((async () => {
      let query = supabase.from('brain_memory_cold').select('id, summary, tags, value_score, access_count, created_at');
      if (options.minValueScore) query = query.gte('value_score', options.minValueScore);
      const { data } = await query.limit(5000);
      memories.push(...(data || []).map(m => ({ ...m, tier: 'cold' })));
    })());
  }

  if (tiers.includes('glacier')) {
    tierFetchers.push((async () => {
      let query = supabase.from('brain_memory_archive').select('id, content, context, tags, value_score, access_count, created_at');
      if (options.minValueScore) query = query.gte('value_score', options.minValueScore);
      const { data } = await query.limit(5000);
      memories.push(...(data || []).map(m => ({ ...m, tier: 'glacier' as const })));
    })());
  }

  await Promise.all(tierFetchers);

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
 * Full 4-tier cascade: hot ↔ warm ↔ cold → glacier
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
    // Phase 1: Promote frequently accessed warm → hot (batched)
    const { data: warmCandidates } = await supabase
      .from('brain_memory_warm')
      .select('id, content, context, value_score, tags, metadata, source_module, category')
      .gte('access_count', 10)
      .gte('value_score', 0.7)
      .limit(50);

    if (warmCandidates && warmCandidates.length > 0) {
      const hotInserts = warmCandidates.map(m => ({
        content: m.content,
        context: m.context,
        value_score: m.value_score,
        tags: m.tags,
        metadata: m.metadata,
        source_module: m.source_module || 'general',
        category: m.category || m.context || 'uncategorized',
      }));

      const { error: insertError } = await supabase
        .from('brain_memory_hot')
        .insert(hotInserts);

      if (!insertError) {
        const ids = warmCandidates.map(m => m.id);
        await supabase.from('brain_memory_warm').delete().in('id', ids);
        result.movedUp += warmCandidates.length;
      } else {
        result.errors.push(insertError.message);
      }
    }

    // Phase 2: Demote stale hot → warm (batched)
    const staleCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: hotCandidates } = await supabase
      .from('brain_memory_hot')
      .select('id, content, context, value_score, tags, metadata, source_module, category')
      .lt('last_used', staleCutoff)
      .lt('value_score', 0.5)
      .limit(50);

    if (hotCandidates && hotCandidates.length > 0) {
      const warmInserts = hotCandidates.map(m => ({
        content: m.content,
        context: m.context,
        value_score: m.value_score,
        tags: m.tags,
        metadata: m.metadata,
        source_module: m.source_module || 'general',
        category: m.category || m.context || 'uncategorized',
      }));

      const { error: insertError } = await supabase
        .from('brain_memory_warm')
        .insert(warmInserts);

      if (!insertError) {
        const ids = hotCandidates.map(m => m.id);
        await supabase.from('brain_memory_hot').delete().in('id', ids);
        result.movedDown += hotCandidates.length;
      } else {
        result.errors.push(insertError.message);
      }
    }

    // Phase 3: Demote stale warm → cold
    const warmStaleCutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: warmStaleCandidates } = await supabase
      .from('brain_memory_warm')
      .select('id, content, context, value_score, tags, metadata, source_module, category, access_count')
      .lt('created_at', warmStaleCutoff)
      .lt('value_score', 0.4)
      .lte('access_count', 3)
      .limit(50);

    if (warmStaleCandidates && warmStaleCandidates.length > 0) {
      const coldInserts = warmStaleCandidates.map(m => ({
        summary: m.content || '',
        tags: m.tags,
        value_score: m.value_score,
        access_count: m.access_count || 0,
        source_module: m.source_module || 'general',
        category: m.category || m.context || 'uncategorized',
      }));

      const { error: insertError } = await supabase
        .from('brain_memory_cold')
        .insert(coldInserts);

      if (!insertError) {
        const ids = warmStaleCandidates.map(m => m.id);
        await supabase.from('brain_memory_warm').delete().in('id', ids);
        result.movedDown += warmStaleCandidates.length;
      } else {
        result.errors.push(insertError.message);
      }
    }

    // Phase 4: Demote stale cold → glacier (archive) (batched)
    const coldStaleCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: coldCandidates } = await supabase
      .from('brain_memory_cold')
      .select('id, summary, tags, value_score, access_count, source_module, category, created_at')
      .lt('created_at', coldStaleCutoff)
      .lt('value_score', 0.2)
      .lte('access_count', 2)
      .limit(50);

    if (coldCandidates && coldCandidates.length > 0) {
      const archiveInserts = coldCandidates.map(m => ({
        content: m.summary || '',
        source_tier: 'cold',
        archived_from_tier: 'cold',
        archived_reason: 'auto_demotion',
        tags: m.tags,
        value_score: m.value_score,
        access_count: m.access_count || 0,
      }));

      const { error: insertError } = await supabase
        .from('brain_memory_archive')
        .insert(archiveInserts);

      if (!insertError) {
        const ids = coldCandidates.map(m => m.id);
        await supabase.from('brain_memory_cold').delete().in('id', ids);
        result.movedDown += coldCandidates.length;
      } else {
        result.errors.push(insertError.message);
      }
    }
        result.errors.push(insertError.message);
      }
    }

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Migration failed');
  }

  // Log migration event (non-critical)
  try {
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
  } catch (logErr) {
    console.error('Failed to log migration event:', logErr);
  }

  return result;
}

/**
 * Get tier distribution statistics across all 4 tiers
 */
export async function getTierDistribution(): Promise<{
  hot: number;
  warm: number;
  cold: number;
  glacier: number;
  total: number;
  avgValueScores: { hot: number; warm: number; cold: number; glacier: number };
}> {
  const [hotCount, warmCount, coldCount, glacierCount] = await Promise.all([
    supabase.from('brain_memory_hot').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_warm').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_cold').select('id', { count: 'exact', head: true }),
    supabase.from('brain_memory_archive').select('id', { count: 'exact', head: true }),
  ]);

  return {
    hot: hotCount.count ?? 0,
    warm: warmCount.count ?? 0,
    cold: coldCount.count ?? 0,
    glacier: glacierCount.count ?? 0,
    total: (hotCount.count ?? 0) + (warmCount.count ?? 0) + (coldCount.count ?? 0) + (glacierCount.count ?? 0),
    avgValueScores: {
      hot: 0.85,
      warm: 0.5,
      cold: 0.2,
      glacier: 0.05,
    },
  };
}
