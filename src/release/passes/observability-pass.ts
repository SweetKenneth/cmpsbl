/**
 * PASS 7 — OBSERVABILITY PASS
 * Confirms logs/metrics/error boundaries are wired
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { PassResult } from '../types';

interface ObservabilityCheck {
  name: string;
  check: () => { ok: boolean; detail: string };
}

function createChecks(): ObservabilityCheck[] {
  const srcRoot = join(process.cwd(), 'src');

  return [
    {
      name: 'Error boundary at app root',
      check() {
        const candidates = ['App.tsx', 'main.tsx'];
        for (const f of candidates) {
          const path = join(srcRoot, f);
          if (existsSync(path)) {
            const content = readFileSync(path, 'utf-8');
            if (content.includes('ErrorBoundary') || content.includes('errorElement')) {
              return { ok: true, detail: `Found in ${f}` };
            }
          }
        }
        return { ok: false, detail: 'No ErrorBoundary found in App.tsx or main.tsx' };
      },
    },
    {
      name: 'Production log guard installed',
      check() {
        const guardPath = join(srcRoot, 'lib/system/productionLogGuard.ts');
        if (!existsSync(guardPath)) {
          return { ok: false, detail: 'productionLogGuard.ts not found' };
        }
        // Check it's imported in main.tsx
        const mainPath = join(srcRoot, 'main.tsx');
        if (existsSync(mainPath)) {
          const content = readFileSync(mainPath, 'utf-8');
          if (content.includes('productionLogGuard') || content.includes('installProductionLogGuard')) {
            return { ok: true, detail: 'Guard installed in main.tsx' };
          }
        }
        return { ok: false, detail: 'Guard exists but not imported in main.tsx' };
      },
    },
    {
      name: 'console.error remains unsuppressed',
      check() {
        const guardPath = join(srcRoot, 'lib/system/productionLogGuard.ts');
        if (!existsSync(guardPath)) {
          return { ok: true, detail: 'No guard file — console.error untouched' };
        }
        const content = readFileSync(guardPath, 'utf-8');
        if (content.includes('console.error') && content.includes('NEVER suppressed')) {
          return { ok: true, detail: 'console.error explicitly preserved' };
        }
        if (!content.includes('console.error =')) {
          return { ok: true, detail: 'console.error not overridden' };
        }
        return { ok: false, detail: 'console.error may be suppressed' };
      },
    },
    {
      name: 'Event emission system exists',
      check() {
        const emitPath = join(srcRoot, 'lib/substrate/events/emit.ts');
        if (existsSync(emitPath)) {
          return { ok: true, detail: 'emit.ts present' };
        }
        return { ok: false, detail: 'No event emission system found' };
      },
    },
    {
      name: 'Telemetry/logging system exists',
      check() {
        const logPath = join(srcRoot, 'lib/system/log.ts');
        if (existsSync(logPath)) {
          return { ok: true, detail: 'log.ts present' };
        }
        return { ok: false, detail: 'No logging system found' };
      },
    },
  ];
}

export async function runObservabilityPass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  const checks = createChecks();
  let failed = 0;

  for (const c of checks) {
    try {
      const result = c.check();
      if (result.ok) {
        notes.push(`✓ ${c.name}: ${result.detail}`);
      } else {
        failed++;
        notes.push(`✗ ${c.name}: ${result.detail}`);
      }
    } catch (e: any) {
      failed++;
      notes.push(`✗ ${c.name}: Error — ${e.message}`);
    }
  }

  return {
    pass: 7,
    name: 'OBSERVABILITY',
    status: failed > 0 ? 'FAIL' : 'PASS',
    required: true,
    durationMs: Date.now() - start,
    notes,
    artifacts: [],
    details: { total: checks.length, passed: checks.length - failed, failed },
  };
}
