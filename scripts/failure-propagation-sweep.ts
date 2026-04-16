/**
 * Failure-Propagation Sweep
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Proves the architectural fix: when a Layer-1 handler raises, the generated
 * `cmpsbl_execute` MUST throw `CmpsblExecutionError` (not return success=False).
 * This is what lets Circuit Breaker, Retry, and Self-Healing wrappers actually
 * activate on handler failures in the chain.
 *
 * Tests every supported runtime that can be exec'd in the sandbox: Python, PHP.
 * (TypeScript is type-checked separately — runtime test would need a tsx host
 * that's not always available; PY+PHP cover the same code path.)
 */
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import {
  generateUnifiedCapabilityFile,
  type UnifiedCapabilityInput,
} from '@/lib/export/unified-capability-file';
import { getAvailableLayers } from '@/lib/export/cmpsbl-layers';

const OUT_DIR = '/tmp/fail-prop-out';
rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });
console.log(`[fail-prop] cleaned ${OUT_DIR} — every export is freshly generated`);

const CAP: UnifiedCapabilityInput[] = [{
  id: 'failprop-cap', name: 'FailProp_Worker', cjpiScore: 90, tier: 'mythic',
  chain: ['DEFENSE', 'BRAIN', 'IMMUNITY'],
  fingerprint: 'FAILPROP00000000000000000000000A',
  moatSignature: 'FAILPROP', capabilityType: 'worker',
}];

const layers = getAvailableLayers();
// Use cores-only — the 7-piece CMPSBL Hardening Layer is what we're proving.
const selectedLayers: typeof layers = [];

interface Result { lang: string; passed: boolean; detail: string }
const results: Result[] = [];

// ── PYTHON ─────────────────────────────────────────────────────────────
{
  const failingHandler = `
def run(input_data):
    """A user handler that always raises — proves wrappers see the throw."""
    raise RuntimeError("simulated handler crash")
`;
  const exportSrc = generateUnifiedCapabilityFile(
    CAP, 'failprop_py', 'python',
    [{ name: 'failing.py', extension: 'py', language: 'python', content: failingHandler }],
    selectedLayers,
  );
  const exportPath = join(OUT_DIR, 'ascended-failing.py');
  writeFileSync(exportPath, exportSrc);

  // Driver: import the export, call cmpsbl_execute, expect CmpsblExecutionError.
  const driver = `
import sys, importlib.util
spec = importlib.util.spec_from_file_location("ascended", "${exportPath}")
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

try:
    result = mod.cmpsbl_execute("FailProp_Worker", {"x": 1})
    print("FAIL: expected CmpsblExecutionError, got dict:", type(result).__name__)
    sys.exit(2)
except mod.CmpsblExecutionError as e:
    # The wrapper-visible behavior we need: a real exception with structured detail.
    assert e.capability == "FailProp_Worker", f"capability={e.capability}"
    assert e.reason == "handler_failure", f"reason={e.reason}"
    assert "simulated handler crash" in str(e), f"msg={e}"
    assert isinstance(e.envelope, dict), "envelope must be preserved"
    assert e.envelope["_cmpsbl"]["execution"]["original_executed"] is False
    print("PASS:", e.reason, "—", str(e)[:80])
    sys.exit(0)
except Exception as e:
    print("FAIL: wrong exception type:", type(e).__name__, "—", e)
    sys.exit(3)
`;
  const driverPath = join(OUT_DIR, 'driver.py');
  writeFileSync(driverPath, driver);
  try {
    const out = execSync(`python3 "${driverPath}"`, { timeout: 15000, stdio: 'pipe' }).toString().trim();
    results.push({ lang: 'python', passed: true, detail: out });
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; message?: string };
    const out = (err.stdout?.toString() || '') + (err.stderr?.toString() || '') + (err.message || '');
    results.push({ lang: 'python', passed: false, detail: out.slice(0, 300) });
  }
}

// ── PHP ────────────────────────────────────────────────────────────────
{
  const failingHandler = `<?php
function run($input) {
    // A user handler that always raises — proves wrappers see the throw.
    throw new RuntimeException("simulated handler crash");
}
`;
  const exportSrc = generateUnifiedCapabilityFile(
    CAP, 'failprop_php', 'php',
    [{ name: 'failing.php', extension: 'php', language: 'php', content: failingHandler }],
    selectedLayers,
  );
  const exportPath = join(OUT_DIR, 'ascended-failing.php');
  writeFileSync(exportPath, exportSrc);

  const driver = `<?php
require_once "${exportPath}";
try {
    $result = cmpsbl_execute("FailProp_Worker", ["x" => 1]);
    echo "FAIL: expected CmpsblExecutionError, got array\\n";
    exit(2);
} catch (CmpsblExecutionError $e) {
    if ($e->capability !== "FailProp_Worker") { echo "FAIL capability=" . $e->capability; exit(3); }
    if ($e->reason !== "handler_failure") { echo "FAIL reason=" . $e->reason; exit(4); }
    if (strpos($e->getMessage(), "simulated handler crash") === false) {
        echo "FAIL msg=" . $e->getMessage(); exit(5);
    }
    if (!is_array($e->envelope)) { echo "FAIL envelope not preserved"; exit(6); }
    if ($e->envelope["_cmpsbl"]["execution"]["original_executed"] !== false) {
        echo "FAIL original_executed not false"; exit(7);
    }
    echo "PASS: " . $e->reason . " — " . substr($e->getMessage(), 0, 80) . "\\n";
    exit(0);
} catch (Throwable $e) {
    echo "FAIL: wrong exception type: " . get_class($e) . " — " . $e->getMessage();
    exit(8);
}
`;
  const driverPath = join(OUT_DIR, 'driver.php');
  writeFileSync(driverPath, driver);
  try {
    const out = execSync(`php "${driverPath}"`, { timeout: 15000, stdio: 'pipe' }).toString().trim();
    results.push({ lang: 'php', passed: true, detail: out });
  } catch (e: unknown) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; message?: string };
    const out = (err.stdout?.toString() || '') + (err.stderr?.toString() || '') + (err.message || '');
    results.push({ lang: 'php', passed: false, detail: out.slice(0, 300) });
  }
}

// ── Report ────────────────────────────────────────────────────────────────
console.log('━'.repeat(80));
console.log('FAILURE-PROPAGATION SWEEP');
console.log('Proves: handler crash → CmpsblExecutionError raised (not swallowed)');
console.log('Why it matters: wrappers (Circuit Breaker, Retry, Self-Healing)');
console.log('only activate on real throws. Returning success=False masks failures.');
console.log('━'.repeat(80));
for (const r of results) {
  console.log(`${r.passed ? '✓ PASS' : '✗ FAIL'}  ${r.lang.padEnd(8)}  ${r.detail.replace(/\n/g, ' | ').slice(0, 200)}`);
}
console.log('━'.repeat(80));
const passed = results.filter(r => r.passed).length;
console.log(`Verdict: ${passed}/${results.length} runtimes propagate handler failures correctly`);
process.exit(passed === results.length ? 0 : 1);
