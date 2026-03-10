/**
 * Regression Test Auto-Trigger v1.0.0
 * Automatically fires the regression test suite after every
 * seba.execute or evolution.evolve completion
 */

import { supabase } from '@/integrations/supabase/client';
import { runRegressionSuite, type RegressionSuiteResult } from '../regression-testing';
import { subscribe, publish, type ModuleName } from '../module-bus';

interface TriggerConfig {
  enabled: boolean;
  autoRollbackOnFailure: boolean;
  minPassRate: number;
}

const DEFAULT_CONFIG: TriggerConfig = {
  enabled: true,
  autoRollbackOnFailure: false,
  minPassRate: 0.75,
};

let triggerActive = false;

/**
 * Wire regression tests to fire after evolution events
 */
export function enableRegressionTrigger(config: Partial<TriggerConfig> = {}): void {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  
  if (triggerActive || !cfg.enabled) return;
  
  // Listen for evolution completion signals via module bus
  const signals = ['evolution.applied', 'seba.executed', 'modernizer.evolved'];
  
  for (const signal of signals) {
    subscribe('system' as ModuleName, signal, async (busSignal) => {
      console.log(`[Regression-Trigger] Evolution event detected: ${signal}`);
      
      const result: RegressionSuiteResult = await runRegressionSuite(signal);
      
      const passRate = result.total > 0 ? result.passed / result.total : 1;
      const outcome = passRate >= cfg.minPassRate ? 'success' : 'failure';
      
      // Log to brain_events
      await supabase.from('brain_events').insert({
        module: 'system',
        event_type: 'regression_auto_run',
        data: {
          trigger: signal,
          evolution_id: busSignal.payload?.proposalId || busSignal.payload?.runId || null,
          passed: result.passed,
          total: result.total,
          pass_rate: passRate,
          duration_ms: result.duration_ms,
          verdict: result.verdict,
          failed_tests: result.results.filter(r => r.status === 'failed').map(r => r.test_name),
        } as any,
        outcome,
      });
      
      if (outcome === 'failure') {
        console.warn(`[Regression-Trigger] ⚠️ Pass rate ${(passRate * 100).toFixed(0)}% below threshold`);
        
        publish('system' as ModuleName, 'regression.failed', {
          trigger: signal,
          passRate,
          failedTests: result.results.filter(r => r.status === 'failed').map(r => r.test_name),
        });
        
        if (cfg.autoRollbackOnFailure) {
          publish('system' as ModuleName, 'rollback.triggered', {
            reason: 'regression_failure',
            evolution_id: busSignal.payload?.proposalId || busSignal.payload?.runId,
            pass_rate: passRate,
          });
        }
      } else {
        console.log(`[Regression-Trigger] ✅ All clear: ${result.passed}/${result.total} passed`);
      }
    });
  }
  
  triggerActive = true;
  console.log('[Regression-Trigger] Active, monitoring evolution events');
}

/**
 * Check trigger status
 */
export function getRegressionTriggerStatus(): { active: boolean } {
  return { active: triggerActive };
}
