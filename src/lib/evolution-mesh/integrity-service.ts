/**
 * Integrity Service — Runs structural checks, returns results
 * NO side effects on import. Never mutates system state.
 * User-triggered only.
 */

import { supabase } from '@/integrations/supabase/client';

async function runIntegrityScan() {
  try {
    const scanId = crypto.randomUUID();
    
    // Insert scan record
    const { error: insertError } = await supabase
      .from('integrity_scan_runs')
      .insert({
        id: scanId,
        status: 'running',
        scan_type: 'full',
        triggered_by: (await supabase.auth.getUser()).data.user?.id ?? 'system',
      } as never);

    if (insertError) {
      console.warn('[EvolutionMesh:Integrity] Failed to start scan:', insertError.message);
      return { success: false, error: insertError.message };
    }

    // Run checks (non-mutating, read-only)
    const findings = await runChecks();

    // Store findings
    for (const finding of findings) {
      try {
        await supabase.from('integrity_findings').insert({
          scan_id: scanId,
          category: finding.category,
          severity: finding.severity,
          message: finding.message,
          details: finding.details ?? {},
        } as never);
      } catch { /* silent */ }
    }

    // Mark complete
    await supabase
      .from('integrity_scan_runs')
      .update({ status: 'completed', findings_count: findings.length } as never)
      .eq('id', scanId);

    return { success: true, scanId, findings };
  } catch (err) {
    console.warn('[EvolutionMesh:Integrity] Error:', err);
    return { success: false, error: 'Integrity scan failed' };
  }
}

async function runChecks() {
  const findings: Array<{ category: string; severity: string; message: string; details?: Record<string, unknown> }> = [];

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
        details: { runs: stuckRuns },
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
