/**
 * pf-backup-import — Import Substrate Backup from Export Package
 * 
 * Restores a substrate from an exported backup package:
 * - Validates package structure and version compatibility
 * - Restores all core tables
 * - Logs import progress and errors
 * 
 * @version 2.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBSTRATE_VERSION = "5.5.0";

// Tables that can be safely restored (v5.5.0 - extended list)
const RESTORABLE_TABLES = [
  // Brain module - memory system
  'brain_memories',
  'brain_memory_hot',
  'brain_memory_warm', 
  'brain_memory_cold',
  'brain_graph_nodes',
  'brain_graph_edges',
  'brain_events',
  'brain_orchestrator_state',
  'brain_cross_insights',
  'brain_curiosity_log',
  'brain_daily_reports',
  'brain_curiosity_settings',
  // Dream module
  'cascade_conversations',
  'cascade_dreams',
  'dream_anomalies',
  // Learning system
  'learning_logs',
  // Defense module
  'defense_events',
  'defense_rules',
  // AI usage tracking
  'ai_daily_quota',
  'ai_usage_log',
  // Agency system (optional)
  'agency_dream_memory',
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server misconfiguration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = await req.json();
    const { 
      export_package,
      dry_run = false,
      clear_existing = false,
    } = body;

    if (!export_package || !export_package._meta) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid export package: missing _meta' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const meta = export_package._meta;
    console.log(`📥 ${dry_run ? '[DRY RUN] ' : ''}Importing backup from ${meta.export_id}`);
    console.log(`   Source version: ${meta.substrate_version}`);
    console.log(`   Total records: ${meta.total_records}`);

    // Version compatibility check
    const compatibleVersions = export_package._restore_instructions?.compatible_versions || [];
    if (!compatibleVersions.includes(SUBSTRATE_VERSION) && meta.substrate_version !== SUBSTRATE_VERSION) {
      console.warn(`⚠️ Version mismatch: source ${meta.substrate_version}, target ${SUBSTRATE_VERSION}`);
    }

    // Start import log
    const importLogId = crypto.randomUUID();
    await supabase.from('backup_import_log').insert({
      id: importLogId,
      source_backup_id: meta.export_id,
      source_project_id: meta.source_project_id || null,
      import_status: dry_run ? 'dry_run' : 'in_progress',
    });

    const results: Record<string, { restored: number; errors: string[] }> = {};
    const errors: string[] = [];

    // Process each table
    for (const table of RESTORABLE_TABLES) {
      const tableData = export_package.data?.[table];
      
      if (!tableData || !Array.isArray(tableData) || tableData.length === 0) {
        results[table] = { restored: 0, errors: [] };
        continue;
      }

      console.log(`  📋 ${table}: ${tableData.length} records`);

      if (dry_run) {
        results[table] = { restored: tableData.length, errors: [] };
        continue;
      }

      try {
        // Optionally clear existing data
        if (clear_existing) {
          await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        }

        // Insert in batches of 500
        const batchSize = 500;
        let restored = 0;
        const tableErrors: string[] = [];

        for (let i = 0; i < tableData.length; i += batchSize) {
          const batch = tableData.slice(i, i + batchSize);
          
          // Remove fields that might cause conflicts
          const cleanBatch = batch.map((row: Record<string, unknown>) => {
            const { id, ...rest } = row;
            return rest;
          });

          const { error: insertError } = await supabase.from(table).insert(cleanBatch);
          
          if (insertError) {
            tableErrors.push(`Batch ${i}-${i + batchSize}: ${insertError.message}`);
          } else {
            restored += batch.length;
          }
        }

        results[table] = { restored, errors: tableErrors };
        if (tableErrors.length > 0) {
          errors.push(...tableErrors.map(e => `${table}: ${e}`));
        }
      } catch (e) {
        const errMsg = e instanceof Error ? e.message : 'Unknown error';
        results[table] = { restored: 0, errors: [errMsg] };
        errors.push(`${table}: ${errMsg}`);
      }
    }

    // Calculate totals
    const totalRestored = Object.values(results).reduce((sum, r) => sum + r.restored, 0);

    // Update import log
    await supabase.from('backup_import_log').update({
      import_status: dry_run ? 'dry_run_complete' : (errors.length > 0 ? 'completed_with_errors' : 'completed'),
      tables_restored: results,
      errors: errors,
      completed_at: new Date().toISOString(),
    }).eq('id', importLogId);

    // Log event
    await supabase.from('brain_events').insert({
      event_type: 'backup_import',
      module: 'system',
      outcome: errors.length > 0 ? 'partial' : 'success',
      data: {
        source_export_id: meta.export_id,
        source_version: meta.substrate_version,
        dry_run,
        total_restored: totalRestored,
        error_count: errors.length,
      },
    });

    // Check for required secrets
    const secretsManifest = export_package._secrets_manifest || [];
    const missingSecrets = secretsManifest.filter((s: string) => !Deno.env.get(s));

    console.log(`✅ Import ${dry_run ? '(dry run) ' : ''}complete: ${totalRestored} records`);

    return new Response(
      JSON.stringify({
        success: true,
        dry_run,
        source_export_id: meta.export_id,
        source_version: meta.substrate_version,
        total_restored: totalRestored,
        table_results: results,
        errors: errors.length > 0 ? errors : undefined,
        missing_secrets: missingSecrets.length > 0 ? missingSecrets : undefined,
        message: dry_run 
          ? `✅ Dry run complete: ${totalRestored} records would be restored`
          : `✅ Import complete: ${totalRestored} records restored`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Import failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
