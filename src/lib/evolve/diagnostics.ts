/**
 * System Diagnostics — Always returns structured response
 * Never returns non-2xx, always structured error payload
 */

import { evolutionRuns } from './evolution-runs';
import { evolutionReceipts } from './evolution-receipts';
import { emitEvolveEvent } from './telemetry';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface DiagnosticResult {
  success: boolean;
  correlation_id: string;
  timestamp: string;
  status: 'healthy' | 'degraded' | 'error';
  components: ComponentDiagnostic[];
  evolution_state: EvolutionDiagnostic;
  errors: DiagnosticError[];
}

export interface ComponentDiagnostic {
  name: string;
  status: 'ok' | 'warn' | 'error';
  message?: string;
  latency_ms?: number;
}

export interface EvolutionDiagnostic {
  active_run: boolean;
  run_id?: string;
  phase?: string;
  receipts_count: number;
  last_receipt_at?: string;
}

export interface DiagnosticError {
  component: string;
  error: string;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTICS ENGINE
// ═══════════════════════════════════════════════════════════════

class DiagnosticsEngine {
  /**
   * Run full diagnostics — ALWAYS returns structured response
   */
  async runDiagnostics(): Promise<DiagnosticResult> {
    const correlation_id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const errors: DiagnosticError[] = [];
    const components: ComponentDiagnostic[] = [];

    // Check evolution state
    let evolutionDiagnostic: EvolutionDiagnostic;
    try {
      evolutionDiagnostic = await this.checkEvolutionState();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      errors.push({
        component: 'evolution',
        error: errorMsg,
        timestamp,
      });
      evolutionDiagnostic = {
        active_run: false,
        receipts_count: 0,
      };
    }

    // Check core components
    const componentChecks = [
      this.checkComponent('database'),
      this.checkComponent('shadow_store'),
      this.checkComponent('telemetry'),
      this.checkComponent('receipts'),
    ];

    for (const check of componentChecks) {
      try {
        const result = await check;
        components.push(result);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        components.push({
          name: 'unknown',
          status: 'error',
          message: errorMsg,
        });
        errors.push({
          component: 'component_check',
          error: errorMsg,
          timestamp,
        });
      }
    }

    // Determine overall status
    const hasError = components.some(c => c.status === 'error') || errors.length > 0;
    const hasWarn = components.some(c => c.status === 'warn');
    const status = hasError ? 'error' : hasWarn ? 'degraded' : 'healthy';

    // Log to telemetry
    emitEvolveEvent('diagnostics_completed', {
      correlation_id,
      status,
      component_count: components.length,
      error_count: errors.length,
    });

    return {
      success: true, // Always success for HTTP 2xx
      correlation_id,
      timestamp,
      status,
      components,
      evolution_state: evolutionDiagnostic,
      errors,
    };
  }

  /**
   * Check evolution state
   */
  private async checkEvolutionState(): Promise<EvolutionDiagnostic> {
    const activeRun = await evolutionRuns.getActiveRun();
    const recentReceipts = await evolutionReceipts.getRecentReceipts(1);

    return {
      active_run: !!activeRun,
      run_id: activeRun?.run_id,
      phase: activeRun?.phase,
      receipts_count: recentReceipts.length,
      last_receipt_at: recentReceipts[0]?.timestamp,
    };
  }

  /**
   * Check individual component
   */
  private async checkComponent(name: string): Promise<ComponentDiagnostic> {
    const start = performance.now();

    try {
      switch (name) {
        case 'database':
          // Quick DB check
          await evolutionRuns.getAllRuns(1);
          break;
        case 'shadow_store':
          // Shadow store is in-memory, always available
          break;
        case 'telemetry':
          // Telemetry is fire-and-forget
          break;
        case 'receipts':
          await evolutionReceipts.getRecentReceipts(1);
          break;
      }

      const latency_ms = Math.round(performance.now() - start);

      return {
        name,
        status: latency_ms > 1000 ? 'warn' : 'ok',
        message: latency_ms > 1000 ? 'High latency' : undefined,
        latency_ms,
      };
    } catch (error) {
      return {
        name,
        status: 'error',
        message: error instanceof Error ? error.message : 'Check failed',
        latency_ms: Math.round(performance.now() - start),
      };
    }
  }

  /**
   * Format diagnostics for display
   */
  formatDiagnostics(result: DiagnosticResult): string {
    const statusIcon = result.status === 'healthy' ? '✅' : result.status === 'degraded' ? '⚠️' : '❌';
    
    const lines = [
      '╔══════════════════════════════════════════════════════════════╗',
      '║  SYSTEM DIAGNOSTICS                                          ║',
      '╠══════════════════════════════════════════════════════════════╣',
      `║  Status: ${statusIcon} ${result.status.toUpperCase().padEnd(20)}                      ║`,
      `║  Correlation ID: ${result.correlation_id.substring(0, 8)}...                         ║`,
      `║  Timestamp: ${result.timestamp}           ║`,
      '╠══════════════════════════════════════════════════════════════╣',
      '║  COMPONENTS                                                   ║',
    ];

    for (const comp of result.components) {
      const icon = comp.status === 'ok' ? '✅' : comp.status === 'warn' ? '⚠️' : '❌';
      lines.push(`║  ${icon} ${comp.name.padEnd(15)} ${(comp.latency_ms + 'ms').padEnd(10)} ${(comp.message || '').padEnd(20)} ║`);
    }

    lines.push('╠══════════════════════════════════════════════════════════════╣');
    lines.push('║  EVOLUTION STATE                                             ║');
    lines.push(`║  Active Run: ${result.evolution_state.active_run ? 'Yes' : 'No'}                                          ║`);
    
    if (result.evolution_state.run_id) {
      lines.push(`║  Run ID: ${result.evolution_state.run_id.substring(0, 8)}...                                      ║`);
      lines.push(`║  Phase: ${result.evolution_state.phase?.padEnd(20) || 'N/A'}                        ║`);
    }

    if (result.errors.length > 0) {
      lines.push('╠══════════════════════════════════════════════════════════════╣');
      lines.push('║  ERRORS                                                      ║');
      for (const err of result.errors) {
        lines.push(`║  ❌ ${err.component}: ${err.error.substring(0, 40).padEnd(40)} ║`);
      }
    }

    lines.push('╚══════════════════════════════════════════════════════════════╝');

    return lines.join('\n');
  }
}

export const diagnosticsEngine = new DiagnosticsEngine();
