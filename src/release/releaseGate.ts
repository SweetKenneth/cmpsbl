#!/usr/bin/env node
/**
 * Release Gate Runner — CMPSBL Substrate
 * SPARTA Epoch — 10-pass pre-release validation
 *
 * Usage:
 *   bun src/release/releaseGate.ts
 *   RELEASE_GATE_COST=1 RELEASE_GATE_CHAOS=1 bun src/release/releaseGate.ts
 */

import type { PassResult, PassRunner } from './types';
import { buildReport, writeReports, toMarkdown } from './report';

import { runBuildPass } from './passes/build-pass';
import { runUnitTestPass } from './passes/unit-test-pass';
import { runIntegrationPass } from './passes/integration-pass';
import { runRegressionPass } from './passes/regression-pass';
import { runPerformancePass } from './passes/performance-pass';
import { runSecurityPass } from './passes/security-pass';
import { runObservabilityPass } from './passes/observability-pass';
import { runCostPass } from './passes/cost-pass';
import { runDeploymentPass } from './passes/deployment-pass';
import { runChaosPass } from './passes/chaos-pass';

const PASSES: PassRunner[] = [
  { pass: 1,  name: 'BUILD / COMPILE',       required: true,  run: runBuildPass },
  { pass: 2,  name: 'UNIT TESTS',            required: true,  run: runUnitTestPass },
  { pass: 3,  name: 'INTEGRATION',           required: true,  run: runIntegrationPass },
  { pass: 4,  name: 'REGRESSION / INVARIANTS', required: true, run: runRegressionPass },
  { pass: 5,  name: 'PERFORMANCE',           required: true,  run: runPerformancePass },
  { pass: 6,  name: 'SECURITY',              required: true,  run: runSecurityPass },
  { pass: 7,  name: 'OBSERVABILITY',         required: true,  run: runObservabilityPass },
  { pass: 8,  name: 'COST / ECONOMY',        required: false, gateEnvVar: 'RELEASE_GATE_COST', run: runCostPass },
  { pass: 9,  name: 'DEPLOYMENT / ROLLBACK', required: true,  run: runDeploymentPass },
  { pass: 10, name: 'CHAOS / FAILURE SIM',   required: false, gateEnvVar: 'RELEASE_GATE_CHAOS', run: runChaosPass },
];

function statusIcon(s: string): string {
  if (s === 'PASS') return '✅';
  if (s === 'FAIL') return '❌';
  return '⏭️';
}

function printScoreboard(results: PassResult[]) {
  console.log('\n' + '═'.repeat(72));
  console.log('  CMPSBL RELEASE GATE — SCOREBOARD');
  console.log('═'.repeat(72));
  console.log(
    '  #'.padEnd(5) +
    'Pass'.padEnd(28) +
    'Status'.padEnd(10) +
    'Required'.padEnd(12) +
    'Duration'
  );
  console.log('─'.repeat(72));

  for (const r of results) {
    console.log(
      `  ${r.pass}`.padEnd(5) +
      r.name.padEnd(28) +
      `${statusIcon(r.status)} ${r.status}`.padEnd(14) +
      (r.required ? 'Yes' : 'No').padEnd(12) +
      `${r.durationMs}ms`
    );
  }

  console.log('═'.repeat(72));
}

async function main() {
  console.log('\n🚀 CMPSBL Release Gate — Starting 10-pass validation...\n');

  const results: PassResult[] = [];

  for (const pass of PASSES) {
    console.log(`\n▸ Pass ${pass.pass}: ${pass.name}...`);
    try {
      const result = await pass.run();
      results.push(result);
      console.log(`  → ${statusIcon(result.status)} ${result.status} (${result.durationMs}ms)`);
      if (result.notes.length > 0) {
        for (const note of result.notes.slice(0, 5)) {
          console.log(`    ${note}`);
        }
        if (result.notes.length > 5) {
          console.log(`    ... and ${result.notes.length - 5} more`);
        }
      }
    } catch (e: any) {
      const failResult: PassResult = {
        pass: pass.pass,
        name: pass.name,
        status: 'FAIL',
        required: pass.required,
        durationMs: 0,
        notes: [`Uncaught error: ${e.message}`],
        artifacts: [],
      };
      results.push(failResult);
      console.log(`  → ❌ FAIL (uncaught: ${e.message})`);
    }
  }

  // Build & write report
  const report = buildReport(results);

  printScoreboard(results);

  try {
    const { jsonPath, mdPath } = writeReports(report);
    console.log(`\n📄 Reports written:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   MD:   ${mdPath}`);
  } catch (e: any) {
    console.error(`\n⚠ Could not write reports: ${e.message}`);
  }

  // Final verdict
  if (report.summary.allRequiredPassed) {
    console.log('\n✅ RELEASE GATE: ALL REQUIRED PASSES SUCCEEDED');
    console.log(`   ${report.summary.passed} passed, ${report.summary.skipped} skipped, ${report.summary.failed} failed\n`);
    process.exit(0);
  } else {
    const failedRequired = results.filter(r => r.required && r.status === 'FAIL');
    console.log('\n❌ RELEASE GATE: BLOCKED');
    console.log(`   Failed required passes: ${failedRequired.map(r => `#${r.pass} ${r.name}`).join(', ')}\n`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('💥 Release Gate crashed:', e);
  process.exit(2);
});
