/**
 * pf-backup-prune — Backup Retention & Permanent Failsafe
 * 
 * Manages backup retention:
 * - Keeps only last N backups (configurable, default 3)
 * - Never prunes permanent/failsafe backups
 * - Creates permanent failsafe backup on demand
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
const DEFAULT_RETENTION_COUNT = 3;
const MAX_SIZE_THRESHOLD_MB = 50; // If backups exceed this, use stricter retention

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
    const body = await req.json().catch(() => ({}));
    const { 
      action = 'prune',
      retention_count = DEFAULT_RETENTION_COUNT,
      create_failsafe = false,
      failsafe_notes = '',
    } = body;

    console.log(`🗂️ Backup management: action=${action}, retention=${retention_count}`);

    // ════════════════════════════════════════════════════════════
    // ACTION: Create Permanent Failsafe
    // ════════════════════════════════════════════════════════════
    if (action === 'create_failsafe' || create_failsafe) {
      console.log('🔒 Creating permanent failsafe backup...');

      // Check if failsafe already exists
      const { data: existingFailsafe } = await supabase
        .from('daily_backups')
        .select('*')
        .eq('is_permanent', true)
        .eq('backup_category', 'failsafe')
        .limit(1);

      if (existingFailsafe && existingFailsafe.length > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'A permanent failsafe backup already exists',
            existing_failsafe: existingFailsafe[0],
            message: 'Delete existing failsafe first if you want to create a new one',
          }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Create the failsafe by calling the backup function internally
      const { data: backupResult, error: backupError } = await supabase.functions.invoke('pf-backup-daily', {
        body: { type: 'failsafe', restore_point: true }
      });

      if (backupError) {
        throw new Error(`Failsafe backup failed: ${backupError.message}`);
      }

      // Mark as permanent
      if (backupResult?.backup_id) {
        await supabase
          .from('daily_backups')
          .update({ 
            is_permanent: true, 
            backup_category: 'failsafe',
            notes: failsafe_notes || `Permanent failsafe created at v${SUBSTRATE_VERSION}`,
            expires_at: null, // Never expires
          })
          .eq('backup_id', backupResult.backup_id);
      }

      console.log(`✅ Permanent failsafe created: ${backupResult?.backup_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          action: 'create_failsafe',
          failsafe_id: backupResult?.backup_id,
          message: '✅ Permanent failsafe backup created - will never be auto-pruned',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ════════════════════════════════════════════════════════════
    // ACTION: Prune Old Backups
    // ════════════════════════════════════════════════════════════
    
    // Get all non-permanent backups ordered by date
    const { data: allBackups, error: fetchError } = await supabase
      .from('daily_backups')
      .select('*')
      .or('is_permanent.is.null,is_permanent.eq.false')
      .order('created_at', { ascending: false });

    if (fetchError) throw fetchError;

    const backupsToKeep = allBackups?.slice(0, retention_count) || [];
    const backupsToPrune = allBackups?.slice(retention_count) || [];

    console.log(`📊 Backups: ${allBackups?.length || 0} total, keeping ${backupsToKeep.length}, pruning ${backupsToPrune.length}`);

    // Get permanent backups count
    const { count: permanentCount } = await supabase
      .from('daily_backups')
      .select('*', { count: 'exact', head: true })
      .eq('is_permanent', true);

    let prunedCount = 0;
    let freedBytes = 0;

    for (const backup of backupsToPrune) {
      try {
        // Delete from storage
        if (backup.backup_path) {
          await supabase.storage.from('backups').remove([backup.backup_path]);
        }

        // Delete from database
        await supabase.from('daily_backups').delete().eq('id', backup.id);
        
        prunedCount++;
        freedBytes += backup.size_bytes || 0;
      } catch (e) {
        console.warn(`Failed to prune backup ${backup.backup_id}:`, e);
      }
    }

    // Log prune event
    await supabase.from('brain_events').insert({
      event_type: 'backup_prune',
      module: 'system',
      outcome: 'success',
      data: {
        retention_count,
        total_backups: allBackups?.length || 0,
        pruned_count: prunedCount,
        freed_bytes: freedBytes,
        permanent_backups: permanentCount || 0,
      },
    });

    console.log(`✅ Pruned ${prunedCount} backups, freed ${(freedBytes / 1024).toFixed(2)} KB`);

    return new Response(
      JSON.stringify({
        success: true,
        action: 'prune',
        retention_count,
        total_backups: allBackups?.length || 0,
        kept_count: backupsToKeep.length,
        pruned_count: prunedCount,
        freed_bytes: freedBytes,
        freed_kb: (freedBytes / 1024).toFixed(2),
        permanent_backups: permanentCount || 0,
        message: `✅ Pruned ${prunedCount} old backups, keeping ${backupsToKeep.length} recent + ${permanentCount || 0} permanent`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Backup management failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
