/**
 * Core Terminal Handlers
 * Registers the 5 foundational commands at boot: help, status, version, clear, audit
 */

import { registerHandler } from './validate-registry';

export function registerCoreHandlers(): void {
  registerHandler('help', async () => ({
    success: true,
    output: 'Use `help <module>` for module-specific commands.',
  }));

  registerHandler('status', async () => ({
    success: true,
    output: 'System status: operational. Use `system.status` for full diagnostics.',
  }));

  registerHandler('version', async () => ({
    success: true,
    output: 'CMPSBL Substrate OS — Cognitive Infrastructure Standard',
  }));

  registerHandler('clear', async () => ({
    success: true,
    output: '',
  }));

  registerHandler('audit', async () => ({
    success: true,
    output: 'Use `audit.run` to execute a full audit, or `audit.status` for current results.',
  }));
}
