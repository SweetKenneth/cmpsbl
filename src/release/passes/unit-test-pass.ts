/**
 * PASS 2 — UNIT TEST PASS
 * Runs the existing unit test suite
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import type { PassResult } from '../types';

export async function runUnitTestPass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  const artifacts: string[] = [];

  try {
    const output = execSync('npx vitest run --reporter=json 2>&1', {
      encoding: 'utf-8',
      timeout: 300_000,
      stdio: 'pipe',
    });

    // Try to parse vitest JSON output
    let total = 0, passed = 0, failed = 0;
    try {
      const jsonStart = output.indexOf('{');
      if (jsonStart >= 0) {
        const json = JSON.parse(output.slice(jsonStart));
        total = json.numTotalTests || 0;
        passed = json.numPassedTests || 0;
        failed = json.numFailedTests || 0;
      }
    } catch {
      // Fallback: parse text output
      const passMatch = output.match(/(\d+)\s+pass/i);
      const failMatch = output.match(/(\d+)\s+fail/i);
      passed = passMatch ? parseInt(passMatch[1]) : 0;
      failed = failMatch ? parseInt(failMatch[1]) : 0;
      total = passed + failed;
    }

    notes.push(`Tests: ${total} total, ${passed} passed, ${failed} failed`);

    return {
      pass: 2,
      name: 'UNIT TESTS',
      status: failed > 0 ? 'FAIL' : 'PASS',
      required: true,
      durationMs: Date.now() - start,
      notes,
      artifacts,
      details: { total, passed, failed },
    };
  } catch (e: any) {
    const output = e.stdout || e.message || '';
    const failMatch = output.match(/(\d+)\s+fail/i);
    const failCount = failMatch ? parseInt(failMatch[1]) : 'unknown';
    notes.push(`Unit tests failed: ${failCount} failures`);

    return {
      pass: 2,
      name: 'UNIT TESTS',
      status: 'FAIL',
      required: true,
      durationMs: Date.now() - start,
      notes,
      artifacts,
      details: { output: output.slice(-500) },
    };
  }
}
