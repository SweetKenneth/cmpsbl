/**
 * Terminal Formatter — v0.7.9 — Mobile-First Rendering
 * 
 * RENDERING CONTRACT:
 * - Words NEVER break mid-token
 * - Line breaks only at whitespace/punctuation/layout boundaries
 * - UUIDs, hashes, timestamps are atomic units
 * - Browser auto-wrap forbidden
 * 
 * RESPONSIVE MODES (auto-detected):
 * - compact  → mobile (default, <640px)
 * - standard → tablet (640-1024px)
 * - full     → desktop (>1024px)
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type OutputMode = 'compact' | 'standard' | 'full';

export interface FormatOptions {
  mode?: OutputMode;
  maxWidth?: number;
}

// ═══════════════════════════════════════════════════════════════
// VIEWPORT DETECTION
// ═══════════════════════════════════════════════════════════════

/**
 * Auto-detect viewport mode
 * No flags, no user config - fully automatic
 */
export function detectOutputMode(): OutputMode {
  if (typeof window === 'undefined') return 'standard';
  
  const width = window.innerWidth;
  
  if (width < 640) return 'compact';
  if (width < 1024) return 'standard';
  return 'full';
}

// ═══════════════════════════════════════════════════════════════
// NO-BREAK ZONES
// ═══════════════════════════════════════════════════════════════

// Patterns that should NEVER be broken mid-token
const ATOMIC_PATTERNS = [
  // UUIDs
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
  // Short IDs (8+ hex chars)
  /[0-9a-f]{8,}/gi,
  // Plan/Scan IDs
  /(?:plan|scan|run|act|prop)_[a-z0-9_]+/gi,
  // Timestamps
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g,
  // Module names
  /(?:BRAIN|DECODE|DREAM|VISION|NEXUS|DEFENSE|CORE|RIPPLE|ACCESS|SYSTEM|EVOLUTION|INTEGRATION|CORTEX|INCLUSIVE|MEMORY|RELAY|AUDIT|IDENTITY|ECONOMY|SANDBOX|ENCODE|ATLAS)/g,
  // Status labels
  /(?:OK|HEALTHY|BLOCKED|READY|PENDING|FAILED|VERIFIED|ABORTED)/g,
  // Command names
  /[a-z]+\.[a-z_]+/g,
];

/**
 * Wrap text with non-breaking spans for atomic units
 */
export function wrapAtomicUnits(text: string): string {
  let result = text;
  
  for (const pattern of ATOMIC_PATTERNS) {
    result = result.replace(pattern, (match) => `\u00A0${match}\u00A0`);
  }
  
  return result;
}

// ═══════════════════════════════════════════════════════════════
// TRUNCATION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Truncate ID with stable ellipsis
 * For UUIDs: shows first 8 chars + ellipsis
 */
export function truncateId(id: string, maxLen: number = 12): string {
  if (!id || id.length <= maxLen) return id;
  
  // For UUIDs, show first 8 chars
  if (id.includes('-') && id.length === 36) {
    return `${id.substring(0, 8)}…`;
  }
  
  // For other IDs, show prefix
  return `${id.substring(0, maxLen - 1)}…`;
}

/**
 * Truncate text at word boundary
 * Never breaks mid-word
 */
export function truncateAtWord(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text;
  
  // Find last space before maxLen
  const truncated = text.substring(0, maxLen);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLen * 0.5) {
    return truncated.substring(0, lastSpace) + '…';
  }
  
  return truncated + '…';
}

// ═══════════════════════════════════════════════════════════════
// COMPACT MODE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Format key-value for compact mode
 * Label on its own line, value below
 */
export function formatCompactKV(label: string, value: string | number): string {
  return `${label}\n  ${value}`;
}

/**
 * Format a table row for compact mode
 * Collapses into stacked format
 */
export function formatCompactRow(data: Record<string, string | number>): string {
  return Object.entries(data)
    .map(([key, val]) => `${key}: ${val}`)
    .join('\n');
}

// ═══════════════════════════════════════════════════════════════
// SCAN RESULT FORMATTER — v0.7.9
// ═══════════════════════════════════════════════════════════════

import type { ScanResultExtended } from './index';
import type { ScanOptions } from './types';

/**
 * Format scan result with mobile-first rendering
 */
export function formatScanResultMobile(
  result: ScanResultExtended, 
  options: ScanOptions = {}
): string {
  const mode = detectOutputMode();
  
  if (mode === 'compact') {
    return formatCompactScan(result, options);
  } else if (mode === 'standard') {
    return formatStandardScan(result, options);
  }
  
  return formatFullScan(result, options);
}

/**
 * Compact format for mobile (<640px)
 */
function formatCompactScan(result: ScanResultExtended, options: ScanOptions): string {
  const lines: string[] = [];
  
  lines.push('┌─ SCAN RESULTS ─┐');
  lines.push('');
  lines.push(formatCompactKV('Scan ID', truncateId(result.scan_id)));
  lines.push(formatCompactKV('Duration', `${(result.scan_duration_ms / 1000).toFixed(2)}s`));
  lines.push('');
  
  // System snapshot
  lines.push('── SYSTEM ──');
  lines.push(`Health: ${result.system_snapshot.health_overall}%`);
  lines.push(`Modules: ${result.system_snapshot.modules_active}`);
  lines.push(`Version: v${result.system_snapshot.substrate_version}`);
  lines.push('');
  
  // Edge analysis
  lines.push('── EDGE ──');
  lines.push(`Live: ${result.edge_analysis.live_functions_count}`);
  lines.push(`Overlap: ${result.edge_analysis.archived_overlap_count}`);
  lines.push(`Risks: ${result.edge_analysis.risk_flags.length}`);
  lines.push('');
  
  // System state + module health
  lines.push('── STATE ──');
  lines.push(`Circuit: ${result.system_state.circuit_states.evolution_circuit}`);
  lines.push(`Modules: ${result.system_state.modules_healthy}/${result.system_state.modules_scanned} healthy`);
  lines.push(`Anomalies: ${result.system_state.detected_anomalies.length}`);
  lines.push('');
  
  // Proposals (shortened)
  lines.push(`── PROPOSALS (${result.proposals.length}) ──`);
  if (result.proposals.length === 0) {
    lines.push('✨ No changes needed');
  } else {
    for (const prop of result.proposals.slice(0, 3)) {
      const icon = prop.risk_level === 'high' ? '🔴' : prop.risk_level === 'medium' ? '🟡' : '🟢';
      lines.push(`${icon} ${truncateAtWord(prop.title, 30)}`);
    }
    if (result.proposals.length > 3) {
      lines.push(`  +${result.proposals.length - 3} more`);
    }
  }
  lines.push('');
  
  // Normalization
  if (result.normalization) {
    lines.push('── NORMALIZE ──');
    lines.push(`OK: ${result.normalization.normalized_actions.length}`);
    lines.push(`Rejected: ${result.normalization.rejected_proposals.length}`);
    lines.push('');
  }
  
  // Status
  if (result.plan_ready && result.plan_id) {
    lines.push(`✅ PLAN READY`);
    lines.push(`Short: ${truncateId(result.plan_id)}`);
    lines.push(`Full: ${result.plan_id}`);
    lines.push(`Actions: ${result.normalized_actions_count || 0}`);
  } else if (result.blocked_reasons.length > 0) {
    lines.push(`⚠️ BLOCKED`);
    lines.push(truncateAtWord(result.blocked_reasons[0], 40));
  } else {
    lines.push('✨ HEALTHY');
  }
  
  lines.push('');
  lines.push('└────────────────┘');
  
  return lines.join('\n');
}

/**
 * Standard format for tablet (640-1024px)
 */
function formatStandardScan(result: ScanResultExtended, options: ScanOptions): string {
  const lines: string[] = [];
  const W = 50; // Column width
  
  lines.push('╔' + '═'.repeat(W) + '╗');
  lines.push('║  EVOLUTION SCAN RESULTS' + ' '.repeat(W - 25) + '║');
  lines.push('╠' + '═'.repeat(W) + '╣');
  
  lines.push(`║  Scan: ${truncateId(result.scan_id, 16).padEnd(W - 10)}║`);
  lines.push(`║  Duration: ${(result.scan_duration_ms / 1000).toFixed(2)}s${' '.repeat(W - 17)}║`);
  lines.push('╠' + '═'.repeat(W) + '╣');
  
  // Compact stats row
  lines.push(`║  Health: ${result.system_snapshot.health_overall}% │ Modules: ${result.system_snapshot.modules_active}${' '.repeat(W - 28)}║`);
  lines.push(`║  Circuit: ${result.system_state.circuit_states.evolution_circuit} │ Anomalies: ${result.system_state.detected_anomalies.length}${' '.repeat(W - 32)}║`);
  lines.push('╠' + '═'.repeat(W) + '╣');
  
  // Proposals
  lines.push(`║  📋 PROPOSALS (${result.proposals.length})${' '.repeat(W - 18 - String(result.proposals.length).length)}║`);
  if (result.proposals.length === 0) {
    lines.push(`║    ✨ No changes needed${' '.repeat(W - 25)}║`);
  } else {
    for (const prop of result.proposals.slice(0, 4)) {
      const icon = prop.risk_level === 'high' ? '🔴' : prop.risk_level === 'medium' ? '🟡' : '🟢';
      const title = truncateAtWord(prop.title, W - 8);
      lines.push(`║  ${icon} ${title.padEnd(W - 6)}║`);
    }
  }
  lines.push('╠' + '═'.repeat(W) + '╣');
  
  // Status
  if (result.plan_ready && result.plan_id) {
    const actionCount = result.normalized_actions_count || 0;
    lines.push(`║  ✅ PLAN READY — ${actionCount} actions${' '.repeat(W - 26 - String(actionCount).length)}║`);
    lines.push(`║     Short: ${truncateId(result.plan_id).padEnd(W - 14)}║`);
    lines.push(`║     Full:  ${result.plan_id.padEnd(W - 14)}║`);
  } else if (result.blocked_reasons.length > 0) {
    lines.push(`║  ⚠️ BLOCKED${' '.repeat(W - 13)}║`);
    lines.push(`║  ${truncateAtWord(result.blocked_reasons[0], W - 5).padEnd(W - 3)}║`);
  } else {
    lines.push(`║  ✨ HEALTHY — no changes${' '.repeat(W - 26)}║`);
  }
  
  lines.push('╚' + '═'.repeat(W) + '╝');
  
  // Detailed reasoning if requested
  if (options.explain && result.proposals.length > 0) {
    lines.push('');
    lines.push('═══ DETAILS ═══');
    for (const prop of result.proposals) {
      lines.push(`\n[${prop.category.toUpperCase()}] ${prop.title}`);
      lines.push(`  ${truncateAtWord(prop.description, 60)}`);
      lines.push(`  Confidence: ${(prop.confidence_score * 100).toFixed(0)}% | Risk: ${prop.risk_level}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Full format for desktop (>1024px)
 */
function formatFullScan(result: ScanResultExtended, options: ScanOptions): string {
  const lines: string[] = [];
  const W = 64; // Full width
  
  lines.push('╔' + '═'.repeat(W) + '╗');
  lines.push('║  EVOLUTION SCAN RESULTS' + ' '.repeat(W - 25) + '║');
  lines.push('╠' + '═'.repeat(W) + '╣');
  lines.push(`║  Scan ID: ${result.scan_id.substring(0, 24).padEnd(24)}` + ' '.repeat(W - 38) + '║');
  lines.push(`║  Duration: ${(result.scan_duration_ms / 1000).toFixed(2)}s` + ' '.repeat(W - 18) + '║');
  lines.push('╠' + '═'.repeat(W) + '╣');
  
  // System Snapshot
  lines.push('║  📊 SYSTEM SNAPSHOT' + ' '.repeat(W - 21) + '║');
  lines.push(`║    Health: ${result.system_snapshot.health_overall}% | Modules: ${result.system_snapshot.modules_active} | v${result.system_snapshot.substrate_version}` + ' '.repeat(W - 52) + '║');
  
  // Edge Analysis
  lines.push('╠' + '═'.repeat(W) + '╣');
  lines.push('║  🔌 EDGE ANALYSIS' + ' '.repeat(W - 19) + '║');
  lines.push(`║    Live: ${result.edge_analysis.live_functions_count} | Archived Overlap: ${result.edge_analysis.archived_overlap_count} | Risks: ${result.edge_analysis.risk_flags.length}` + ' '.repeat(W - 54) + '║');
  
  // System State
  lines.push('╠' + '═'.repeat(W) + '╣');
  lines.push('║  ⚙️  SYSTEM STATE' + ' '.repeat(W - 19) + '║');
  lines.push(`║    Circuit: ${result.system_state.circuit_states.evolution_circuit.padEnd(8)} | Anomalies: ${result.system_state.detected_anomalies.length}` + ' '.repeat(W - 42) + '║');
  lines.push(`║    Modules: ${result.system_state.modules_healthy}/${result.system_state.modules_scanned} healthy | Phase: ${result.system_state.orchestration_phase.padEnd(8)}` + ' '.repeat(W - 48) + '║');
  
  // Module issues (if any)
  const unhealthy = result.system_state.module_health_map.filter(m => !m.reachable || !m.table_accessible || m.anomalies.length > 0);
  if (unhealthy.length > 0) {
    for (const m of unhealthy.slice(0, 4)) {
      const issue = m.anomalies[0] || (m.reachable ? 'table issue' : 'unreachable');
      lines.push(`║    ⚠ ${m.module.toUpperCase().padEnd(12)} ${truncateAtWord(issue, W - 24).padEnd(W - 22)}║`);
    }
    if (unhealthy.length > 4) {
      lines.push(`║    ... +${unhealthy.length - 4} more module issues` + ' '.repeat(W - 32) + '║');
    }
  }
  
  // Code Health
  lines.push('╠' + '═'.repeat(W) + '╣');
  lines.push('║  🏥 CODE HEALTH' + ' '.repeat(W - 17) + '║');
  lines.push(`║    Stability: ${result.code_health.stability_score}% | Security: ${result.code_health.security_posture.padEnd(8)}` + ' '.repeat(W - 46) + '║');
  lines.push(`║    Pressure: ${result.code_health.upgrade_pressure.padEnd(8)} | Missing: ${result.code_health.missing_capabilities.length}` + ' '.repeat(W - 40) + '║');
  
  // Proposals
  lines.push('╠' + '═'.repeat(W) + '╣');
  lines.push(`║  📋 PROPOSALS (${result.proposals.length})` + ' '.repeat(W - 18 - String(result.proposals.length).length) + '║');
  
  if (result.proposals.length === 0) {
    lines.push('║    ✨ No changes recommended — system healthy' + ' '.repeat(W - 48) + '║');
  } else {
    for (const prop of result.proposals.slice(0, 5)) {
      const icon = prop.risk_level === 'high' ? '🔴' : prop.risk_level === 'medium' ? '🟡' : '🟢';
      const title = truncateAtWord(prop.title, W - 10);
      lines.push(`║  ${icon} ${title.padEnd(W - 6)}║`);
    }
    if (result.proposals.length > 5) {
      lines.push(`║    ... and ${result.proposals.length - 5} more` + ' '.repeat(W - 20) + '║');
    }
  }
  
  // Normalization Summary
  if (result.normalization) {
    lines.push('╠' + '═'.repeat(W) + '╣');
    lines.push('║  🔄 NORMALIZATION' + ' '.repeat(W - 19) + '║');
    lines.push(`║    Normalized: ${result.normalization.normalized_actions.length} | Rejected: ${result.normalization.rejected_proposals.length}` + ' '.repeat(W - 38) + '║');
    
    if (result.normalization.rejected_proposals.length > 0) {
      const breakdown = result.normalization.summary.rejection_breakdown;
      const reasons = Object.entries(breakdown)
        .filter(([, count]) => count > 0)
        .map(([code, count]) => `${code}: ${count}`)
        .join(', ');
      if (reasons) {
        lines.push(`║    Rejections: ${truncateAtWord(reasons, W - 20).padEnd(W - 18)}║`);
      }
    }
  }
  
  // Status
  lines.push('╠' + '═'.repeat(W) + '╣');
  if (result.plan_ready && result.plan_id) {
    const actionCount = result.normalized_actions_count || 0;
    lines.push(`║  ✅ PLAN READY — ${actionCount} actions normalized` + ' '.repeat(W - 38 - String(actionCount).length) + '║');
    lines.push(`║     Short ID: ${truncateId(result.plan_id).padEnd(12)}` + ' '.repeat(W - 30) + '║');
    lines.push(`║     Full ID:  ${result.plan_id}` + ' '.repeat(Math.max(0, W - 17 - result.plan_id.length)) + '║');
  } else if (result.blocked_reasons.length > 0) {
    lines.push(`║  ⚠️  PLAN BLOCKED — proposals could not be normalized` + ' '.repeat(W - 56) + '║');
    lines.push(`║     Reason: ${truncateAtWord(result.blocked_reasons[0], W - 16).padEnd(W - 14)}║`);
  } else if (result.proposals.length === 0) {
    lines.push('║  ✨ SYSTEM HEALTHY — no changes needed' + ' '.repeat(W - 41) + '║');
  } else {
    lines.push('║  ⏳ NO PLAN — review proposals with --explain' + ' '.repeat(W - 48) + '║');
  }
  
  lines.push('╠' + '═'.repeat(W) + '╣');
  lines.push(`║  → ${truncateAtWord(result.recommended_next_action, W - 7).padEnd(W - 5)}║`);
  lines.push('╚' + '═'.repeat(W) + '╝');
  
  // Detailed reasoning
  if (options.explain && result.proposals.length > 0) {
    lines.push('');
    lines.push('═══ DETAILED REASONING ═══');
    for (const prop of result.proposals) {
      lines.push(`\n[${prop.category.toUpperCase()}] ${prop.title}`);
      lines.push(`  Rationale: ${prop.description}`);
      lines.push(`  Impact: ${prop.rationale}`);
      lines.push(`  Confidence: ${(prop.confidence_score * 100).toFixed(0)}% | Risk: ${prop.risk_level} | Sources: ${prop.source_phases.join(', ')}`);
      lines.push(`  Requires Human: ${prop.requires_human ? 'Yes' : 'No'}`);
    }
    
    if (result.normalization && result.normalization.rejected_proposals.length > 0) {
      lines.push('');
      lines.push('═══ REJECTED PROPOSALS ═══');
      for (const rej of result.normalization.rejected_proposals) {
        lines.push(`\n❌ ${rej.title}`);
        lines.push(`   Code: ${rej.rejection_code}`);
        lines.push(`   Reason: ${rej.reason}`);
      }
    }
  }
  
  return lines.join('\n');
}

export const terminalFormatter = {
  format: formatScanResultMobile,
  detectMode: detectOutputMode,
  truncateId,
  truncateAtWord,
  wrapAtomicUnits,
};
