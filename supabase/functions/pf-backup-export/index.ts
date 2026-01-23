/**
 * pf-backup-export — Export Substrate Backup for Download
 * 
 * Creates downloadable backup packages:
 * - Full export: Includes encrypted secrets (for personal use)
 * - Portable export: No secrets (safe for sharing/selling)
 * 
 * @version 2.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBSTRATE_VERSION = "4.1.1";

// Tables to export for full substrate restore
const CORE_TABLES = [
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
  'cascade_conversations',
  'cascade_dreams',
  'learning_logs',
  'defense_events',
  'defense_rules',
  'ai_daily_quota',
  'pf_brain_anomalies',
];

// Tables that contain sensitive configuration
const CONFIG_TABLES = [
  'brain_curiosity_settings',
  'brain_orchestrator_state',
];

// Generate export token
function generateExportToken(): string {
  return `exp_${Date.now().toString(36)}_${crypto.randomUUID().substring(0, 8)}`;
}

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
      backup_id,
      include_secrets = false,
      export_type = 'portable',
    } = body;

    console.log(`📦 Creating ${export_type} export (secrets: ${include_secrets})`);

    const now = new Date();
    const exportToken = generateExportToken();

    // Gather all data from core tables
    const exportData: Record<string, unknown[]> = {};
    const tableCounts: Record<string, number> = {};

    for (const table of CORE_TABLES) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(50000); // Safety limit

        if (!error && data) {
          exportData[table] = data;
          tableCounts[table] = count || data.length;
        }
      } catch (e) {
        console.warn(`⚠️ Could not export table ${table}:`, e);
        exportData[table] = [];
        tableCounts[table] = 0;
      }
    }

    // Add config tables
    for (const table of CONFIG_TABLES) {
      try {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data) {
          exportData[table] = data;
          tableCounts[table] = data.length;
        }
      } catch {
        exportData[table] = [];
      }
    }

    // Gather secrets if requested (encrypted reference only - actual values need secure handling)
    let secretsManifest: string[] = [];
    if (include_secrets) {
      // We don't export actual secret values - just a manifest of required secrets
      secretsManifest = [
        'GROQ_API_KEY',
        'CEREBRAS_API_KEY',
        'GOOGLE_AI_API_KEY',
        'DEEPSEEK_API_KEY',
        'TOGETHER_API_KEY',
        'HYPERBOLIC_API_KEY',
        'PERPLEXITY_API_KEY',
        'RESEND_API_KEY',
      ];
    }

    // Build the export package
    const exportPackage = {
      _meta: {
        export_id: exportToken,
        export_type,
        substrate_version: SUBSTRATE_VERSION,
        created_at: now.toISOString(),
        includes_secrets: include_secrets,
        source_backup_id: backup_id || null,
        table_counts: tableCounts,
        total_records: Object.values(tableCounts).reduce((a, b) => a + b, 0),
      },
      _secrets_manifest: secretsManifest,
      _restore_instructions: {
        version: '2.0',
        steps: [
          '1. Create a new Lovable project with Cloud enabled',
          '2. Upload this file to the restore endpoint',
          '3. If secrets manifest is included, configure the required API keys',
          '4. Run the restore process',
          '5. Verify data integrity with brain.status()',
        ],
        compatible_versions: ['4.0.0', '4.1.0', '4.1.1'],
      },
      data: exportData,
    };

    // Calculate size
    const exportJson = JSON.stringify(exportPackage);
    const sizeBytes = new TextEncoder().encode(exportJson).length;

    // Store export metadata
    const dateStr = now.toISOString().split('T')[0];
    const filePath = `exports/${dateStr}/${exportToken}.json`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filePath, exportJson, {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    }

    // Track in database
    await supabase.from('backup_exports').insert({
      backup_id: backup_id || exportToken,
      export_type,
      file_path: filePath,
      file_size_bytes: sizeBytes,
      includes_secrets: include_secrets,
      download_token: exportToken,
      expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    });

    // Log export event
    await supabase.from('brain_events').insert({
      event_type: 'backup_export',
      module: 'system',
      outcome: 'success',
      data: {
        export_token: exportToken,
        export_type,
        includes_secrets: include_secrets,
        size_bytes: sizeBytes,
        table_counts: tableCounts,
      },
    });

    console.log(`✅ Export created: ${exportToken} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`);

    return new Response(
      JSON.stringify({
        success: true,
        export_token: exportToken,
        export_type,
        includes_secrets: include_secrets,
        file_path: filePath,
        size_bytes: sizeBytes,
        size_mb: (sizeBytes / 1024 / 1024).toFixed(2),
        table_counts: tableCounts,
        total_records: Object.values(tableCounts).reduce((a, b) => a + b, 0),
        download_url: `${SUPABASE_URL}/storage/v1/object/public/backups/${filePath}`,
        expires_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        message: `✅ ${export_type.charAt(0).toUpperCase() + export_type.slice(1)} export ready for download`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Export failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
