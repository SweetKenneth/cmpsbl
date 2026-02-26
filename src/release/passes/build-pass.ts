/**
 * PASS 1 — BUILD / COMPILE PASS
 * Ensures production build succeeds with zero errors
 */

import { execSync } from 'child_process';
import type { PassResult } from '../types';

export async function runBuildPass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  const artifacts: string[] = [];

  try {
    // Run TypeScript type check first
    try {
      execSync('npx tsc --noEmit --skipLibCheck 2>&1', {
        encoding: 'utf-8',
        timeout: 120_000,
        stdio: 'pipe',
      });
      notes.push('TypeScript type check passed');
    } catch (e: any) {
      const errorCount = (e.stdout || '').split('\n').filter((l: string) => l.includes('error TS')).length;
      notes.push(`TypeScript errors detected: ${errorCount}`);
      return {
        pass: 1,
        name: 'BUILD / COMPILE',
        status: 'FAIL',
        required: true,
        durationMs: Date.now() - start,
        notes,
        artifacts,
        details: { typeErrors: errorCount },
      };
    }

    // Run Vite production build
    const buildOutput = execSync('npx vite build 2>&1', {
      encoding: 'utf-8',
      timeout: 180_000,
      stdio: 'pipe',
    });

    const sizeMatch = buildOutput.match(/dist\/.*?(\d+[\.,]\d+\s*[kKmM][bB])/g);
    notes.push('Vite production build succeeded');
    if (sizeMatch) {
      notes.push(`Bundle artifacts: ${sizeMatch.length} files`);
    }

    return {
      pass: 1,
      name: 'BUILD / COMPILE',
      status: 'PASS',
      required: true,
      durationMs: Date.now() - start,
      notes,
      artifacts,
      details: { buildOutput: buildOutput.slice(-500) },
    };
  } catch (e: any) {
    notes.push(`Build failed: ${(e.message || '').slice(0, 300)}`);
    return {
      pass: 1,
      name: 'BUILD / COMPILE',
      status: 'FAIL',
      required: true,
      durationMs: Date.now() - start,
      notes,
      artifacts,
    };
  }
}
