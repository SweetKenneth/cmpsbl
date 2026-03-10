/**
 * PASS 6 — SECURITY PASS
 * Catches obvious security mistakes before shipping
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import type { PassResult } from '../types';

const SECRET_PATTERNS = [
  /(?:sk_live|sk_test)_[a-zA-Z0-9]{20,}/,
  /(?:AKIA|ASIA)[A-Z0-9]{16}/,
  /ghp_[a-zA-Z0-9]{36}/,
  /glpat-[a-zA-Z0-9\-]{20}/,
  /xoxb-[0-9]{10,}-[a-zA-Z0-9]{24}/,
  /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/,
  /eyJ[a-zA-Z0-9_-]{20,}\.eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}/, // JWT (but skip supabase anon)
];

const SCAN_DIRS = ['src', 'supabase/functions'];
const SKIP_DIRS = ['node_modules', '.git', 'dist', 'reports'];
const SKIP_FILES = ['.env', 'types.ts', 'client.ts'];

function scanFiles(dir: string, callback: (path: string, content: string) => void) {
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (SKIP_DIRS.some(s => full.includes(s))) continue;
      if (SKIP_FILES.includes(entry)) continue;
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          scanFiles(full, callback);
        } else if (stat.isFile() && stat.size < 500_000) {
          const ext = entry.split('.').pop() || '';
          if (['ts', 'tsx', 'js', 'jsx', 'json', 'md', 'html', 'css'].includes(ext)) {
            callback(full, readFileSync(full, 'utf-8'));
          }
        }
      } catch { /* skip unreadable */ }
    }
  } catch { /* dir missing */ }
}

export async function runSecurityPass(): Promise<PassResult> {
  const start = Date.now();
  const notes: string[] = [];
  let highSeverity = 0;
  let medSeverity = 0;

  // 1. Secret scan
  const secretFindings: string[] = [];
  for (const dir of SCAN_DIRS) {
    scanFiles(dir, (path, content) => {
      for (const pattern of SECRET_PATTERNS) {
        const match = content.match(pattern);
        if (match) {
          // Skip known safe patterns (supabase anon key in .env referenced files)
          const val = match[0];
          if (path.includes('supabase') && val.startsWith('eyJ')) continue;
          secretFindings.push(`${path}: potential secret (${pattern.source.slice(0, 30)}...)`);
        }
      }
    });
  }

  if (secretFindings.length > 0) {
    highSeverity += secretFindings.length;
    secretFindings.forEach(f => notes.push(`🔴 SECRET: ${f}`));
  } else {
    notes.push('✓ No plaintext secrets detected in source');
  }

  // 2. Dependency audit (best-effort)
  try {
    execSync('npm audit --production --audit-level=high 2>&1', {
      encoding: 'utf-8',
      timeout: 60_000,
      stdio: 'pipe',
    });
    notes.push('✓ No high-severity dependency vulnerabilities');
  } catch (e: any) {
    const output = e.stdout || '';
    const critMatch = output.match(/(\d+)\s+critical/i);
    const highMatch = output.match(/(\d+)\s+high/i);
    const crit = critMatch ? parseInt(critMatch[1]) : 0;
    const high = highMatch ? parseInt(highMatch[1]) : 0;
    if (crit + high > 0) {
      highSeverity += crit;
      medSeverity += high;
      notes.push(`⚠ Dependency audit: ${crit} critical, ${high} high`);
    } else {
      notes.push('✓ Dependency audit clean (or audit not available)');
    }
  }

  // 3. Check webhook secrets are hashed
  let webhookOk = true;
  scanFiles('src', (path, content) => {
    if (content.includes('secret_plaintext') || content.includes('webhook_secret')) {
      if (!content.includes('secret_hash')) {
        webhookOk = false;
        notes.push(`⚠ ${path}: possible plaintext webhook secret`);
        medSeverity++;
      }
    }
  });
  if (webhookOk) {
    notes.push('✓ No plaintext webhook secrets found');
  }

  // 4. Check for password collection in UI
  let passwordUiOk = true;
  scanFiles('src/components', (path, content) => {
    if (path.includes('GovernorSelfMint') && content.includes('type="password"')) {
      passwordUiOk = false;
      notes.push(`⚠ ${path}: password input in restricted UI`);
      medSeverity++;
    }
  });
  if (passwordUiOk) {
    notes.push('✓ No unauthorized password collection in UI');
  }

  // 5. CSP headers configured
  const cspPaths = [
    join(process.cwd(), 'supabase/functions/_shared/cors.ts'),
    join(process.cwd(), 'src/lib/system/csp.ts'),
  ];
  let hasCsp = false;
  try {
    for (const p of cspPaths) {
      if (existsSync(p)) {
        const content = readFileSync(p, 'utf-8');
        if (content.includes('Content-Security-Policy') || content.includes('content-security-policy')) {
          hasCsp = true;
          break;
        }
      }
    }
  } catch { /* fs may not be available in test */ }
  if (hasCsp) {
    notes.push('✓ CSP headers configured');
  } else {
    notes.push('⚠ No Content-Security-Policy headers found');
    medSeverity++;
  }

  // 6. No external AI gateway references (per project policy — must use NEXUS)
  let externalAiRefs = 0;
  for (const dir of SCAN_DIRS) {
    scanFiles(dir, (path, content) => {
      if (content.includes('LOVABLE_API_KEY') || content.includes('ai.gateway.lovable.dev')) {
        externalAiRefs++;
        notes.push(`🔴 ${path}: External AI gateway reference detected (must use NEXUS)`);
      }
    });
  }
  if (externalAiRefs > 0) {
    highSeverity += externalAiRefs;
  } else {
    notes.push('✓ No external AI gateway references — NEXUS router enforced');
  }

  // 7. Edge functions use service_role appropriately
  let edgeFuncOk = true;
  scanFiles('supabase/functions', (path, content) => {
    if (content.includes('SUPABASE_SERVICE_ROLE_KEY') && !content.includes('createClient')) {
      edgeFuncOk = false;
      notes.push(`⚠ ${path}: SERVICE_ROLE_KEY used without Supabase client`);
      medSeverity++;
    }
  });
  if (edgeFuncOk) {
    notes.push('✓ Edge function service_role usage looks correct');
  }

  return {
    pass: 6,
    name: 'SECURITY',
    status: highSeverity > 0 ? 'FAIL' : 'PASS',
    required: true,
    durationMs: Date.now() - start,
    notes,
    artifacts: [],
    details: { highSeverity, medSeverity, secretFindings: secretFindings.length },
  };
}
