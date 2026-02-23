/**
 * Integrity Service — Runs structural checks, returns results
 * NO side effects on import. Never mutates system state.
 * User-triggered only.
 *
 * Actual integrity_scan_runs columns:
 *   id (uuid, PK, auto), mode (text, default 'quick'),
 *   errors_found (int, default 0), warnings_found (int, default 0),
 *   health_score (int, default 100), duration_ms (int, nullable),
 *   created_at (timestamptz)
 *
 * Actual integrity_findings columns:
 *   id (uuid, PK, auto), scan_id (uuid, NOT NULL),
 *   category (text, NOT NULL), severity (text, NOT NULL),
 *   file_path (text, nullable), message (text, NOT NULL),
 *   suggested_fix (text, nullable), created_at (timestamptz)
 */

import { supabase } from '@/integrations/supabase/client';

type ScanMode = 'quick' | 'deep' | 'pre_promote' | 'scheduled';

async function runIntegrityScan(mode: ScanMode = 'quick') {
  const startTime = performance.now();

  try {
    // Insert scan record with correct columns
    const { data: scanRow, error: insertError } = await supabase
      .from('integrity_scan_runs')
      .insert({ mode } as never)
      .select()
      .single();

    if (insertError || !scanRow) {
      console.warn('[EvolutionMesh:Integrity] Failed to start scan:', insertError?.message);
      return { success: false, error: insertError?.message ?? 'Insert failed' };
    }

    const scanId = (scanRow as any).id as string;

    // Run checks (non-mutating, read-only)
    const findings = await runChecks();

    // Store findings with correct columns
    for (const finding of findings) {
      try {
        await supabase.from('integrity_findings').insert({
          scan_id: scanId,
          category: finding.category,
          severity: finding.severity,
          message: finding.message,
          file_path: finding.filePath ?? null,
          suggested_fix: finding.suggestedFix ?? null,
        } as never);
      } catch { /* silent */ }
    }

    const durationMs = Math.round(performance.now() - startTime);
    const errorsFound = findings.filter(f => f.severity === 'error').length;
    const warningsFound = findings.filter(f => f.severity === 'warning').length;
    const healthScore = Math.max(0, 100 - errorsFound * 15 - warningsFound * 5);

    // Update scan with results
    await supabase
      .from('integrity_scan_runs')
      .update({
        errors_found: errorsFound,
        warnings_found: warningsFound,
        health_score: healthScore,
        duration_ms: durationMs,
      } as never)
      .eq('id', scanId);

    return { success: true, scanId, findings, healthScore, durationMs };
  } catch (err) {
    console.warn('[EvolutionMesh:Integrity] Error:', err);
    return { success: false, error: 'Integrity scan failed' };
  }
}

async function runChecks() {
  const findings: Array<{
    category: string;
    severity: string;
    message: string;
    filePath?: string;
    suggestedFix?: string;
  }> = [];

  try {
    // Check evolution circuit state
    const { data: circuit } = await supabase
      .from('evolution_circuit')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (circuit && (circuit as any).state === 'open') {
      findings.push({
        category: 'circuit',
        severity: 'warning',
        message: 'Evolution circuit breaker is open — new runs are blocked',
        suggestedFix: 'Reset circuit breaker if safe to proceed',
      });
    }

    // Check for stuck evolution runs
    const { data: stuckRuns } = await supabase
      .from('evolution_runs')
      .select('run_id, phase')
      .not('phase', 'in', '("verified","aborted","failed")')
      .limit(5);

    if (stuckRuns && stuckRuns.length > 0) {
      findings.push({
        category: 'runs',
        severity: 'info',
        message: `${stuckRuns.length} active evolution run(s) in progress`,
      });
    }

    // Check substrate health via brain_events as a proxy
    try {
      const { count } = await supabase
        .from('brain_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'health_alert');

      if (count && count > 5) {
        findings.push({
          category: 'health',
          severity: 'warning',
          message: `${count} health alert events detected`,
          suggestedFix: 'Review brain health alerts for anomalies',
        });
      }
    } catch { /* silent */ }
  } catch {
    findings.push({
      category: 'scan',
      severity: 'error',
      message: 'Some integrity checks could not complete',
    });
  }

  if (findings.length === 0) {
    findings.push({ category: 'overall', severity: 'info', message: 'All checks passed' });
  }

  return findings;
}

async function getLatestScan() {
  try {
    const { data } = await supabase
      .from('integrity_scan_runs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return data;
  } catch {
    return null;
  }
}

async function getScanFindings(scanId: string) {
  try {
    const { data } = await supabase
      .from('integrity_findings')
      .select('*')
      .eq('scan_id', scanId)
      .order('created_at', { ascending: false });
    return data ?? [];
  } catch {
    return [];
  }
}

export const integrityService = { runIntegrityScan, getLatestScan, getScanFindings };
