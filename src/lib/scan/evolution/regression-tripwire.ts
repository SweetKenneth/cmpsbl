/**
 * #24 — Regression Tripwire Generator
 * For each fix applied, auto-generate a lightweight check that future scans
 * can run to verify the fix hasn't been reverted.
 */

export interface TripwireReport {
  tripwires: Tripwire[];
  activeTripwires: number;
  trippedWires: TrippedWire[];
  totalChecked: number;
  regressionCount: number;
  scanTimestamp: string;
}

export interface Tripwire {
  id: string;
  fixId: string;
  title: string;
  category: string;
  checkType: 'pattern_absent' | 'pattern_present' | 'file_exists' | 'config_value' | 'policy_exists' | 'metric_threshold';
  target: string;
  expectedValue: string;
  createdAt: string;
  lastChecked: string | null;
  status: 'active' | 'passed' | 'tripped' | 'disabled';
}

export interface TrippedWire {
  tripwireId: string;
  title: string;
  expectedValue: string;
  actualValue: string;
  trippedAt: string;
  severity: 'critical' | 'high' | 'medium';
}

/**
 * Generate tripwires from applied fixes
 */
export function generateTripwires(
  appliedFixes: Array<{
    id: string;
    title: string;
    category: string;
    type: string;
    file: string;
    beforePattern?: string;
    afterPattern?: string;
    configKey?: string;
    configValue?: string;
  }>
): Tripwire[] {
  const tripwires: Tripwire[] = [];

  for (const fix of appliedFixes) {
    // If we have a "before" pattern, create a tripwire that checks it's absent
    if (fix.beforePattern) {
      tripwires.push({
        id: `tw-absent-${tripwires.length}`,
        fixId: fix.id,
        title: `Verify fix: ${fix.title}`,
        category: fix.category,
        checkType: 'pattern_absent',
        target: fix.file,
        expectedValue: fix.beforePattern,
        createdAt: new Date().toISOString(),
        lastChecked: null,
        status: 'active',
      });
    }

    // If we have an "after" pattern, create a tripwire that checks it's present
    if (fix.afterPattern) {
      tripwires.push({
        id: `tw-present-${tripwires.length}`,
        fixId: fix.id,
        title: `Verify presence: ${fix.title}`,
        category: fix.category,
        checkType: 'pattern_present',
        target: fix.file,
        expectedValue: fix.afterPattern,
        createdAt: new Date().toISOString(),
        lastChecked: null,
        status: 'active',
      });
    }

    // Config-based tripwires
    if (fix.configKey && fix.configValue) {
      tripwires.push({
        id: `tw-config-${tripwires.length}`,
        fixId: fix.id,
        title: `Config guard: ${fix.configKey}`,
        category: fix.category,
        checkType: 'config_value',
        target: fix.configKey,
        expectedValue: fix.configValue,
        createdAt: new Date().toISOString(),
        lastChecked: null,
        status: 'active',
      });
    }

    // RLS/policy tripwires
    if (fix.type === 'rls_policy' || fix.category === 'security') {
      tripwires.push({
        id: `tw-policy-${tripwires.length}`,
        fixId: fix.id,
        title: `Policy guard: ${fix.title}`,
        category: 'security',
        checkType: 'policy_exists',
        target: fix.file,
        expectedValue: 'enabled',
        createdAt: new Date().toISOString(),
        lastChecked: null,
        status: 'active',
      });
    }
  }

  return tripwires;
}

/**
 * Run tripwire checks against current codebase state
 */
export function checkTripwires(
  tripwires: Tripwire[],
  currentFiles: Map<string, string>,
  currentConfigs: Record<string, string>
): TripwireReport {
  const trippedWires: TrippedWire[] = [];
  const now = new Date().toISOString();

  for (const wire of tripwires) {
    if (wire.status === 'disabled') continue;

    wire.lastChecked = now;
    let tripped = false;

    switch (wire.checkType) {
      case 'pattern_absent': {
        const content = currentFiles.get(wire.target);
        if (content && new RegExp(escapeRegex(wire.expectedValue)).test(content)) {
          tripped = true;
          trippedWires.push({
            tripwireId: wire.id,
            title: wire.title,
            expectedValue: `Pattern should be absent: ${wire.expectedValue.slice(0, 50)}`,
            actualValue: 'Pattern found — fix may have been reverted',
            trippedAt: now,
            severity: wire.category === 'security' ? 'critical' : 'high',
          });
        }
        break;
      }

      case 'pattern_present': {
        const content = currentFiles.get(wire.target);
        if (content && !new RegExp(escapeRegex(wire.expectedValue)).test(content)) {
          tripped = true;
          trippedWires.push({
            tripwireId: wire.id,
            title: wire.title,
            expectedValue: `Pattern should be present: ${wire.expectedValue.slice(0, 50)}`,
            actualValue: 'Pattern not found — fix may have been removed',
            trippedAt: now,
            severity: 'high',
          });
        }
        break;
      }

      case 'config_value': {
        const actual = currentConfigs[wire.target];
        if (actual !== undefined && actual !== wire.expectedValue) {
          tripped = true;
          trippedWires.push({
            tripwireId: wire.id,
            title: wire.title,
            expectedValue: wire.expectedValue,
            actualValue: actual,
            trippedAt: now,
            severity: 'medium',
          });
        }
        break;
      }

      case 'file_exists': {
        if (!currentFiles.has(wire.target)) {
          tripped = true;
          trippedWires.push({
            tripwireId: wire.id,
            title: wire.title,
            expectedValue: 'File should exist',
            actualValue: 'File not found',
            trippedAt: now,
            severity: 'high',
          });
        }
        break;
      }
    }

    wire.status = tripped ? 'tripped' : 'passed';
  }

  return {
    tripwires,
    activeTripwires: tripwires.filter(t => t.status === 'active' || t.status === 'passed').length,
    trippedWires,
    totalChecked: tripwires.filter(t => t.status !== 'disabled').length,
    regressionCount: trippedWires.length,
    scanTimestamp: now,
  };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
