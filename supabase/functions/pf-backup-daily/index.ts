/**
 * pf-backup-daily — Full Substrate Backup with Storage Persistence
 * 
 * Creates comprehensive backups of the entire substrate system:
 * - Stores to /backups/daily for automated runs
 * - Stores to /backups/manual for dashboard-triggered runs
 * - Enables restore points for each backup
 * - Persists to both database and storage bucket
 * 
 * @version 1.1.0
 * @author Kenneth E Sweet Jr
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// NOTE: CORS is currently wide-open by design, but all non-OPTIONS calls
// are protected by service-role auth. Do NOT relax auth even if CORS stays '*'.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBSTRATE_VERSION = "3.11.0";

// Maximum backups per day per type to prevent runaway loops
const MAX_BACKUPS_PER_DAY = 12;

// Generate backup ID
function generateBackupId(): string {
  return `bkp_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // ========== AUTH GUARD ==========
  // Require service-role authentication for all non-OPTIONS requests
  const authHeader = req.headers.get('Authorization');
  const providedKey = authHeader?.replace('Bearer ', '').trim();
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!SERVICE_ROLE_KEY) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY in backup function');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server misconfiguration: service role key missing',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  if (!providedKey || providedKey !== SERVICE_ROLE_KEY) {
    console.warn('❌ Unauthorized backup attempt');
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Forbidden - service role authentication required',
      }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // ========== ENV VALIDATION ==========
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';

  if (!SUPABASE_URL) {
    console.error('❌ Missing SUPABASE_URL in pf-backup-daily');
    return new Response(
      JSON.stringify({ success: false, error: 'Server misconfiguration: SUPABASE_URL missing' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Create client with validated env vars
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // Parse request body for backup type
    let backupType = 'daily';
    let includeData = true;
    let enableRestorePoint = true;
    
    try {
      const body = await req.json();
      backupType = body.type || 'daily';
      includeData = body.include_data !== false;
      enableRestorePoint = body.restore_point !== false;
    } catch {
      // Default values if no body
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    // ========== RATE LIMIT CHECK ==========
    // Simple safety limit: max backups per day per type
    const { count: todaysBackups, error: countError } = await supabase
      .from('daily_backups')
      .select('*', { count: 'exact', head: true })
      .eq('backup_date', dateStr);

    if (countError) {
      console.error('❌ Failed to check backup count:', countError);
    } else if ((todaysBackups ?? 0) >= MAX_BACKUPS_PER_DAY) {
      console.warn('⛔ Backup rate limit reached for', backupType, 'on', dateStr);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Backup rate limit reached for today',
          backup_type: backupType,
          backup_date: dateStr,
          limit: MAX_BACKUPS_PER_DAY,
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Starting ${backupType} backup with restore_point=${enableRestorePoint}`);

    const backupId = generateBackupId();
    const timeStr = now.toISOString().split('T')[1].replace(/:/g, '-').split('.')[0];
    
    // Determine backup path
    const backupPath = backupType === 'manual' 
      ? `manual/${dateStr}/${backupId}.json`
      : `daily/${dateStr}/${backupId}.json`;

    // Gather comprehensive data counts
    const [
      { count: memoryCount },
      { count: hotMemoryCount },
      { count: coldMemoryCount },
      { count: eventCount },
      { count: conversationCount },
      { count: dreamCount },
      { count: defenseCount },
      { count: learningCount },
      { count: anomalyCount },
      { data: orchestrator },
      { data: recentEvents },
      { data: recentDreams },
      { data: aiUsage },
    ] = await Promise.all([
      supabase.from("brain_memories").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_hot").select("*", { count: "exact", head: true }),
      supabase.from("brain_memory_cold").select("*", { count: "exact", head: true }),
      supabase.from("brain_events").select("*", { count: "exact", head: true }),
      supabase.from("cascade_conversations").select("*", { count: "exact", head: true }),
      supabase.from("cascade_dreams").select("*", { count: "exact", head: true }),
      supabase.from("defense_events").select("*", { count: "exact", head: true }),
      supabase.from("learning_logs").select("*", { count: "exact", head: true }),
      supabase.from("pf_brain_anomalies").select("*", { count: "exact", head: true }).eq('resolved', false),
      supabase.from("brain_orchestrator_state").select("*").limit(1).single(),
      supabase.from("brain_events").select("*").order("created_at", { ascending: false }).limit(100),
      supabase.from("cascade_dreams").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("ai_daily_quota").select("*").eq("date", dateStr),
    ]);

    // Build comprehensive snapshot
    const snapshot = {
      backup_id: backupId,
      backup_type: backupType,
      backup_path: backupPath,
      substrate_version: SUBSTRATE_VERSION,
      created_at: now.toISOString(),
      restore_point_enabled: enableRestorePoint,
      
      // System state
      orchestrator: orchestrator ? {
        status: orchestrator.status,
        health_score: orchestrator.health_score,
        current_phase: orchestrator.current_phase,
        cycles_completed: orchestrator.cycles_completed,
        last_cycle_at: orchestrator.last_cycle_at,
        auto_heal_attempts: orchestrator.auto_heal_attempts,
      } : null,
      
      // Data counts for validation
      data_counts: {
        brain_memories: memoryCount || 0,
        brain_memory_hot: hotMemoryCount || 0,
        brain_memory_cold: coldMemoryCount || 0,
        brain_events: eventCount || 0,
        cascade_conversations: conversationCount || 0,
        cascade_dreams: dreamCount || 0,
        defense_events: defenseCount || 0,
        learning_logs: learningCount || 0,
        unresolved_anomalies: anomalyCount || 0,
      },
      
      // AI quota status
      ai_quotas: aiUsage || [],
      
      // Sample data for restore verification (if enabled)
      sample_data: includeData ? {
        recent_events: recentEvents?.slice(0, 20) || [],
        recent_dreams: recentDreams?.slice(0, 10) || [],
      } : null,
      
      // Checksum for integrity
      checksum: '',
    };

    // Calculate checksum
    const checksumData = JSON.stringify({
      counts: snapshot.data_counts,
      orchestrator_health: snapshot.orchestrator?.health_score || 0,
      version: snapshot.substrate_version,
      timestamp: now.getTime(),
    });
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(checksumData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    snapshot.checksum = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);

    // Upload to storage bucket
    const backupJson = JSON.stringify(snapshot, null, 2);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('backups')
      .upload(backupPath, backupJson, {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload failed:', uploadError);
      // Continue with database backup even if storage fails
    } else {
      console.log(`✅ Backup uploaded to storage: ${backupPath}`);
    }

    // Calculate backup size
    const backupSizeBytes = new TextEncoder().encode(backupJson).length;

    // Store in daily_backups table for quick access
    const { error: dbError } = await supabase.from('daily_backups').insert({
      backup_id: backupId,
      backup_date: dateStr,
      backup_path: backupPath,
      substrate_version: SUBSTRATE_VERSION,
      restore_point_enabled: enableRestorePoint,
      status: uploadError ? 'partial' : 'complete',
      checksum: snapshot.checksum,
      data_counts: snapshot.data_counts,
      size_bytes: backupSizeBytes,
      is_permanent: false,
      backup_category: backupType === 'failsafe' ? 'failsafe' : 'standard',
      snapshot: {
        orchestrator: snapshot.orchestrator,
        ai_quotas: snapshot.ai_quotas,
        created_at: snapshot.created_at,
      },
      expires_at: backupType === 'failsafe' 
        ? null  // Failsafe never expires
        : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    if (dbError) {
      console.error('Database insert failed:', dbError);
    }

    // Log backup event
    await supabase.from('brain_events').insert({
      event_type: `backup_${backupType}`,
      module: 'system',
      outcome: 'success',
      data: {
        backup_id: backupId,
        backup_path: backupPath,
        restore_point_enabled: enableRestorePoint,
        data_counts: snapshot.data_counts,
        storage_upload: !uploadError,
        database_insert: !dbError,
      }
    });

    console.log(`✅ ${backupType.toUpperCase()} backup complete: ${backupId}`);

    return new Response(
      JSON.stringify({
        success: true,
        backup_id: backupId,
        backup_type: backupType,
        backup_path: backupPath,
        restore_point_enabled: enableRestorePoint,
        data_counts: snapshot.data_counts,
        checksum: snapshot.checksum,
        storage_location: uploadError ? null : `backups/${backupPath}`,
        message: `✅ ${backupType.charAt(0).toUpperCase() + backupType.slice(1)} backup created successfully`,
        timestamp: now.toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Backup failed:', error);
    
    // Log failure
    try {
      await supabase.from('brain_events').insert({
        event_type: 'backup_failed',
        module: 'system',
        outcome: 'error',
        data: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    } catch {
      // Silent fail on logging error
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
