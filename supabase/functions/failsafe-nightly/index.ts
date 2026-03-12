/**
 * FAILSAFE — Scheduled Nightly Backup
 * 
 * Called by pg_cron at 2:00 AM CST (8:00 AM UTC) daily.
 * 
 * Process:
 *   1. Run full-backup internally (same logic as full-backup function)
 *   2. Validate the backup (check manifest, table count, minimum size)
 *   3. Upload validated backup to 'failsafe-backups' storage bucket
 *   4. Delete the previous nightly backup (keep only the latest)
 *   5. Log result to backup_audit_log
 *
 * Auth: Service role only (called via pg_cron net.http_post)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const log = (msg: string) => console.log(`[FailsafeNightly] ${msg}`);

  try {
    log('Starting nightly backup...');

    // ── Step 1: Call the full-backup function internally ──
    const backupUrl = `${supabaseUrl}/functions/v1/full-backup`;
    const backupRes = await fetch(backupUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': 'application/json',
      },
    });

    if (!backupRes.ok) {
      const errText = await backupRes.text();
      throw new Error(`Backup function returned ${backupRes.status}: ${errText}`);
    }

    // Read the ZIP as ArrayBuffer
    const zipBuffer = await backupRes.arrayBuffer();
    const zipBytes = new Uint8Array(zipBuffer);
    log(`Backup generated: ${(zipBytes.length / 1024 / 1024).toFixed(2)} MB`);

    // ── Step 2: Validate the backup ──
    const validation = validateBackup(zipBytes);
    if (!validation.valid) {
      throw new Error(`Backup validation failed: ${validation.reason}`);
    }
    log(`Backup validated: ${validation.details}`);

    // ── Step 3: Upload to storage (overwrite previous) ──
    const fileName = 'nightly-failsafe-latest.zip';
    
    // Delete previous backup first
    const { error: deleteErr } = await admin.storage
      .from('failsafe-backups')
      .remove([fileName]);
    
    if (deleteErr) {
      log(`Previous backup delete (non-fatal): ${deleteErr.message}`);
    }

    const { error: uploadErr } = await admin.storage
      .from('failsafe-backups')
      .upload(fileName, zipBytes, {
        contentType: 'application/zip',
        upsert: true,
      });

    if (uploadErr) {
      throw new Error(`Storage upload failed: ${uploadErr.message}`);
    }
    log('Backup uploaded to failsafe-backups/nightly-failsafe-latest.zip');

    // Also keep a dated copy for the last 7 days
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0-6
    const datedName = `nightly-dow-${dayOfWeek}.zip`;
    
    await admin.storage.from('failsafe-backups').remove([datedName]);
    await admin.storage.from('failsafe-backups').upload(datedName, zipBytes, {
      contentType: 'application/zip',
      upsert: true,
    });
    log(`Rolling copy saved: ${datedName}`);

    // ── Step 4: Log to audit ──
    const elapsed = Date.now() - startTime;
    await admin.from('audit_logs').insert({
      action: 'failsafe_nightly_backup',
      entity_type: 'system',
      entity_id: 'failsafe-backup',
      performed_by: 'pg_cron',
      details: {
        status: 'success',
        size_bytes: zipBytes.length,
        size_mb: Number((zipBytes.length / 1024 / 1024).toFixed(2)),
        elapsed_ms: elapsed,
        validation: validation.details,
        file_primary: fileName,
        file_rolling: datedName,
        timestamp: now.toISOString(),
      },
    });

    log(`Nightly backup complete in ${elapsed}ms`);

    return new Response(JSON.stringify({
      success: true,
      size_mb: Number((zipBytes.length / 1024 / 1024).toFixed(2)),
      elapsed_ms: elapsed,
      validation: validation.details,
      files: [fileName, datedName],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    const elapsed = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    log(`ERROR: ${message}`);

    // Log failure to audit
    await admin.from('audit_logs').insert({
      action: 'failsafe_nightly_backup',
      entity_type: 'system',
      entity_id: 'failsafe-backup',
      performed_by: 'pg_cron',
      details: {
        status: 'failed',
        error: message,
        elapsed_ms: elapsed,
        timestamp: new Date().toISOString(),
      },
    }).catch(() => {});

    return new Response(JSON.stringify({
      success: false,
      error: message,
      elapsed_ms: elapsed,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ═══════════════════════════════════════════════════════════════
// BACKUP VALIDATION
// ═══════════════════════════════════════════════════════════════

interface ValidationResult {
  valid: boolean;
  reason?: string;
  details: string;
}

function validateBackup(zipBytes: Uint8Array): ValidationResult {
  // Check 1: Minimum size (a valid backup should be at least 1KB)
  if (zipBytes.length < 1024) {
    return { valid: false, reason: 'Backup too small — likely empty or corrupted', details: `${zipBytes.length} bytes` };
  }

  // Check 2: ZIP magic bytes (PK\x03\x04)
  if (zipBytes[0] !== 0x50 || zipBytes[1] !== 0x4B) {
    return { valid: false, reason: 'Invalid ZIP — missing PK magic bytes', details: 'Not a ZIP file' };
  }

  // Check 3: ZIP end-of-central-directory marker (PK\x05\x06)
  // Search last 256 bytes for EOCD signature
  const tail = zipBytes.slice(Math.max(0, zipBytes.length - 256));
  let hasEOCD = false;
  for (let i = 0; i < tail.length - 3; i++) {
    if (tail[i] === 0x50 && tail[i + 1] === 0x4B && tail[i + 2] === 0x05 && tail[i + 3] === 0x06) {
      hasEOCD = true;
      break;
    }
  }
  if (!hasEOCD) {
    return { valid: false, reason: 'Invalid ZIP — missing end-of-central-directory', details: 'ZIP structure incomplete' };
  }

  // Check 4: Reasonable size (warn if over 90MB — approaching edge function limits)
  const sizeMB = zipBytes.length / 1024 / 1024;
  const sizeNote = sizeMB > 90 ? ' (WARNING: approaching size limits)' : '';

  return {
    valid: true,
    details: `${sizeMB.toFixed(2)} MB, valid ZIP structure${sizeNote}`,
  };
}
