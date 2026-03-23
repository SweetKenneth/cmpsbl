/**
 * ORACLE Ultimate #6 — Early Warning System
 * Multi-signal convergence detection: when 3+ weak signals align, issue warning.
 * Signal fusion from VISION, DEFENSE, MEDIC, NERVE health data.
 */

// ── Types ──

export type WarningSeverity = 'advisory' | 'caution' | 'warning' | 'imminent';
export type WarningHorizon = '5min' | '15min' | '1hr';

export interface WeakSignal {
  id: string;
  source: string;       // Node that emitted it
  category: string;     // e.g., 'performance', 'security', 'capacity'
  description: string;
  strength: number;     // 0-1
  detectedAt: number;
  expiresAt: number;
}

export interface EarlyWarning {
  id: string;
  severity: WarningSeverity;
  horizon: WarningHorizon;
  title: string;
  description: string;
  convergingSignals: string[];  // Signal IDs
  convergenceScore: number;     // How strongly signals align
  category: string;
  createdAt: number;
  acknowledged: boolean;
  resolvedAt: number | null;
}

// ── State ──

const activeSignals = new Map<string, WeakSignal>();
const warnings: EarlyWarning[] = [];
const MAX_WARNINGS = 500;
let signalIdCounter = 0;
let warningIdCounter = 0;
let totalWarnings = 0;

// ── Core ──

export function ingestSignal(input: {
  source: string;
  category: string;
  description: string;
  strength: number;
  ttlMs?: number;
}): WeakSignal {
  const signal: WeakSignal = {
    id: `sig-${++signalIdCounter}`,
    source: input.source,
    category: input.category,
    description: input.description,
    strength: Math.max(0, Math.min(1, input.strength)),
    detectedAt: Date.now(),
    expiresAt: Date.now() + (input.ttlMs ?? 15 * 60_000),
  };
  activeSignals.set(signal.id, signal);
  return signal;
}

/** Evaluate all active signals for convergence patterns. Returns new warnings. */
export function evaluateConvergence(): EarlyWarning[] {
  const now = Date.now();
  
  // Expire old signals
  for (const [id, sig] of activeSignals) {
    if (sig.expiresAt < now) activeSignals.delete(id);
  }

  // Group by category
  const byCategory = new Map<string, WeakSignal[]>();
  for (const sig of activeSignals.values()) {
    const group = byCategory.get(sig.category) ?? [];
    group.push(sig);
    byCategory.set(sig.category, group);
  }

  const newWarnings: EarlyWarning[] = [];

  for (const [category, signals] of byCategory) {
    if (signals.length < 3) continue; // Need 3+ signals to converge

    // Check for multi-source convergence (signals from different nodes)
    const uniqueSources = new Set(signals.map(s => s.source));
    if (uniqueSources.size < 2) continue; // Need signals from different sources

    const avgStrength = signals.reduce((s, sig) => s + sig.strength, 0) / signals.length;
    const convergenceScore = Math.min(1, avgStrength * (uniqueSources.size / 5));

    // Determine severity
    let severity: WarningSeverity;
    if (convergenceScore > 0.8) severity = 'imminent';
    else if (convergenceScore > 0.6) severity = 'warning';
    else if (convergenceScore > 0.4) severity = 'caution';
    else severity = 'advisory';

    // Determine horizon based on signal recency
    const avgAge = signals.reduce((s, sig) => s + (now - sig.detectedAt), 0) / signals.length;
    let horizon: WarningHorizon;
    if (avgAge < 5 * 60_000) horizon = '5min';
    else if (avgAge < 15 * 60_000) horizon = '15min';
    else horizon = '1hr';

    // Avoid duplicate warnings for same category within 5 min
    const recentDuplicate = warnings.find(
      w => w.category === category && (now - w.createdAt) < 5 * 60_000 && !w.resolvedAt
    );
    if (recentDuplicate) continue;

    const warning: EarlyWarning = {
      id: `ew-${++warningIdCounter}`,
      severity,
      horizon,
      title: `${category} convergence detected`,
      description: `${signals.length} signals from ${uniqueSources.size} sources converging in ${category}`,
      convergingSignals: signals.map(s => s.id),
      convergenceScore: Math.round(convergenceScore * 1000) / 1000,
      category,
      createdAt: now,
      acknowledged: false,
      resolvedAt: null,
    };

    warnings.push(warning);
    newWarnings.push(warning);
    totalWarnings++;
  }

  // Trim warnings
  if (warnings.length > MAX_WARNINGS) {
    warnings.splice(0, warnings.length - MAX_WARNINGS);
  }

  return newWarnings;
}

export function acknowledgeWarning(id: string): boolean {
  const w = warnings.find(w => w.id === id);
  if (!w) return false;
  w.acknowledged = true;
  return true;
}

export function resolveWarning(id: string): boolean {
  const w = warnings.find(w => w.id === id);
  if (!w) return false;
  w.resolvedAt = Date.now();
  return true;
}

export function getActiveWarnings(): EarlyWarning[] {
  return warnings.filter(w => !w.resolvedAt);
}

export function getEarlyWarningStats(): {
  activeSignals: number; totalWarnings: number;
  activeWarnings: number; bySeverity: Record<WarningSeverity, number>;
} {
  const active = warnings.filter(w => !w.resolvedAt);
  const bySeverity: Record<WarningSeverity, number> = { advisory: 0, caution: 0, warning: 0, imminent: 0 };
  for (const w of active) bySeverity[w.severity]++;
  return {
    activeSignals: activeSignals.size,
    totalWarnings,
    activeWarnings: active.length,
    bySeverity,
  };
}

export function resetEarlyWarningState(): void {
  activeSignals.clear();
  warnings.length = 0;
  signalIdCounter = 0;
  warningIdCounter = 0;
  totalWarnings = 0;
}
