/**
 * Audit Check: Terminal Command Registry
 * Validates all terminal commands have handlers wired.
 * Skipped entirely if no terminal UI is detected in the installation.
 */

import type { AuditFinding } from '../audit-types';
import { getRegistrationStats } from '@/lib/terminal/validate-registry';
import { isTerminalPresent } from '@/lib/terminal/detect';

const EXPECTED_MESH_COMMANDS = [
  'mesh.status', 'mesh.toggle', 'mesh.on', 'mesh.off',
  'mesh.log', 'mesh.resolvers', 'mesh.broadcast', 'mesh.help',
];

const EXPECTED_CORE_COMMANDS = [
  'help', 'status', 'version', 'clear', 'audit',
];

export function checkTerminalRegistry(): AuditFinding[] {
  // Skip terminal scan entirely if no terminal UI is detected
  if (!isTerminalPresent()) {
    return [{
      id: 'terminal_skipped',
      category: 'terminal',
      severity: 'info',
      title: 'Terminal scan skipped — no terminal UI detected',
      detail: 'Terminal command registration checks are only run when a terminal component is present in the installation.',
    }];
  }
  
  const findings: AuditFinding[] = [];
  const stats = getRegistrationStats();

  const MIN_EXPECTED_COMMANDS = 50;
  findings.push({
    id: 'terminal_registered_count',
    category: 'terminal',
    severity: stats.registered < MIN_EXPECTED_COMMANDS ? 'warn' : 'info',
    title: `${stats.registered} terminal commands registered`,
    detail: stats.registered < MIN_EXPECTED_COMMANDS
      ? `Expected ≥${MIN_EXPECTED_COMMANDS} commands; found ${stats.registered}. Some handlers may not be wired.`
      : `Handlers wired: ${stats.registered}. Meets minimum threshold.`,
  });

  // Check mesh commands specifically
  const missingMesh = EXPECTED_MESH_COMMANDS.filter(
    cmd => !stats.commands.includes(cmd)
  );

  if (missingMesh.length > 0) {
    findings.push({
      id: 'terminal_missing_mesh',
      category: 'terminal',
      severity: 'warn',
      title: `${missingMesh.length} mesh commands not registered`,
      detail: `Missing: ${missingMesh.join(', ')}. These may be registered lazily at runtime.`,
      hint: 'Mesh commands register on first OS mount. This is expected pre-boot.',
    });
  } else {
    findings.push({
      id: 'terminal_mesh_ok',
      category: 'terminal',
      severity: 'info',
      title: 'All mesh commands registered',
      detail: `All ${EXPECTED_MESH_COMMANDS.length} mesh commands have handlers.`,
    });
  }

  // Check core commands
  const missingCore = EXPECTED_CORE_COMMANDS.filter(
    cmd => !stats.commands.includes(cmd)
  );

  if (missingCore.length > 0) {
    findings.push({
      id: 'terminal_missing_core',
      category: 'terminal',
      severity: 'warn',
      title: `${missingCore.length} core commands not registered`,
      detail: `Missing: ${missingCore.join(', ')}.`,
      hint: 'Core commands should be registered at boot.',
    });
  }

  return findings;
}
