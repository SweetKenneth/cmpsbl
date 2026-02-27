/**
 * Audit Check: Terminal Command Registry
 * Validates all terminal commands have handlers wired
 */

import type { AuditFinding } from '../audit-types';
import { getRegistrationStats } from '@/lib/terminal/validate-registry';

const EXPECTED_MESH_COMMANDS = [
  'mesh.status', 'mesh.toggle', 'mesh.on', 'mesh.off',
  'mesh.log', 'mesh.resolvers', 'mesh.broadcast', 'mesh.help',
];

const EXPECTED_CORE_COMMANDS = [
  'help', 'status', 'version', 'clear', 'audit',
];

export function checkTerminalRegistry(): AuditFinding[] {
  const findings: AuditFinding[] = [];
  const stats = getRegistrationStats();

  findings.push({
    id: 'terminal_registered_count',
    category: 'terminal',
    severity: 'info',
    title: `${stats.registered} terminal commands registered`,
    detail: `Handlers wired: ${stats.registered}.`,
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
