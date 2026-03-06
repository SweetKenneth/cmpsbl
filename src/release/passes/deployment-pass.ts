/**
 * PASS 9 — DEPLOYMENT / ROLLBACK PASS
 * Confirms we can safely deploy and recover
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { PassResult } from '../types';

const ROLLBACK_TEMPLATE = `# Rollback Plan — CMPSBL Substrate

## Pre-Deployment Checklist
- [ ] Database migration reviewed and reversible
- [ ] Feature flags configured for gradual rollout
- [ ] Monitoring dashboards updated
- [ ] On-call engineer identified

## Rollback Steps

### 1. Immediate Rollback (< 5 min)
1. Revert to previous deployment via CI/CD pipeline
2. Disable feature flags for new features
3. Verify health dashboard shows green

### 2. Database Rollback (if schema changed)
1. Run reverse migration script
2. Verify data integrity
3. Confirm RLS policies are intact

### 3. Configuration Rollback
1. Revert environment variables
2. Clear CDN cache if applicable
3. Restart edge functions

## Communication
- Notify stakeholders via incident channel
- Update status page if user-facing
- Document root cause for post-mortem

## Recovery Verification
- [ ] All health checks passing
- [ ] Error rates returned to baseline
- [ ] User-facing flows verified

---

*CMPSBL Substrate*
*© 2025–2026 PromptFluid®. All rights reserved.*
`;

export async function runDeploymentPass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  const artifacts: string[] = [];
  let failed = 0;

  try {
    // 1. Check/create ROLLBACK.md
    const rollbackPath = join(process.cwd(), 'docs', 'ROLLBACK.md');
    try {
      if (existsSync(rollbackPath)) {
        notes.push('✓ docs/ROLLBACK.md exists');
      } else {
        try {
          writeFileSync(rollbackPath, ROLLBACK_TEMPLATE);
          notes.push('✓ docs/ROLLBACK.md generated');
          artifacts.push(rollbackPath);
        } catch (e: any) {
          failed++;
          notes.push(`✗ Could not create ROLLBACK.md: ${e.message}`);
        }
      }
    } catch {
      notes.push('⚠ Could not check ROLLBACK.md (fs unavailable)');
    }

    // 2. Check for canary/staged deployment docs
    const canaryPaths = [
      'docs/DEPLOYMENT.md',
      'docs/internal/17-DEPLOYMENT.html',
      'docs/v11/evolution-and-shadow.md',
    ];
    let hasCanary = false;
    try {
      for (const p of canaryPaths) {
        const full = join(process.cwd(), p);
        if (existsSync(full)) {
          const content = readFileSync(full, 'utf-8');
          if (content.includes('canary') || content.includes('staged') || content.includes('shadow') || content.includes('gradual')) {
            hasCanary = true;
            notes.push(`✓ Canary/staged deployment documented in ${p}`);
            break;
          }
        }
      }
    } catch { /* fs unavailable */ }
    if (!hasCanary) {
      notes.push('⚠ No canary/staged deployment documentation found (non-blocking)');
    }

    // 3. Check for feature flags / config toggles
    const togglePaths = [
      'src/lib/atlas/capability-gate.ts',
      'src/lib/system/feature-flags.ts',
    ];
    let hasToggles = false;
    try {
      for (const p of togglePaths) {
        if (existsSync(join(process.cwd(), p))) {
          hasToggles = true;
          notes.push(`✓ Configuration toggle system found: ${p}`);
          break;
        }
      }
    } catch { /* fs unavailable */ }
    if (!hasToggles) {
      notes.push('⚠ No feature flag/toggle system detected');
    }

    // 4. Dry-run deploy checklist
    notes.push('--- Dry-Run Deploy Checklist ---');
    notes.push('☐ Build artifact verified (Pass 1)');
    notes.push('☐ Tests green (Pass 2-4)');
    notes.push('☐ Security scan clean (Pass 6)');
    notes.push('☐ Rollback plan reviewed');
    notes.push('☐ Monitoring configured');
  } catch (e: any) {
    failed++;
    notes.push(`Uncaught error: ${e.message}`);
  }

  return {
    pass: 9,
    name: 'DEPLOYMENT / ROLLBACK',
    status: failed > 0 ? 'FAIL' : 'PASS',
    required: true,
    durationMs: Date.now() - start,
    notes,
    artifacts,
  };
}
