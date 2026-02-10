/**
 * Regression Test Auto-Trigger v1.0.0
 * Automatically fires the regression test suite after every
 * seba.execute or modernizer.evolve completion
 */

import { supabase } from '@/integrations/supabase/client';
import { runRegressionSuite } from '../regression-testing';
import { moduleBus } from '../module-bus';

interface TriggerConfig {
  enabled: boolean;
  autoRollbackOnFailure: boolean;
  minPassRate: number; // 0-1, default 0.75
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
  
  // Listen for evolution completion signals
  const signals = ['EVOLUTION_APPLIED', 'SEBA_EXECUTED', 'MODERNIZER_EVOLVED'];
  
  for (const signal of signals) {
    moduleBus.on(signal, async (data: any) => {
      console.log(`[Regression-Trigger] Evolution event detected: ${signal}`);
      
      const startTime = Date.now();
      const results = await runRegressionSuite();
      const duration = Date.now() - startTime;
      
      const passed = results.filter(r => r.passed).length;
      const total = results.length;
      const passRate = total > 0 ? passed / total : 1;
      
      const outcome = passRate >= cfg.minPassRate ? 'success' : 'failure';
      
      // Log to brain_events
      await supabase.from('brain_events').insert({
        module: 'system',
        event_type: 'regression_auto_run',
        data: {
          trigger: signal,
          evolution_id: data?.proposalId || data?.runId || null,
          passed,
          total,
          pass_rate: passRate,
          duration_ms: duration,
          failed_tests: results.filter(r => !r.passed).map(r => r.name),
        } as any,
        outcome,
      });
      
      if (outcome === 'failure') {
        console.warn(`[Regression-Trigger] ⚠️ Pass rate ${(passRate * 100).toFixed(0)}% below threshold`);
        
        moduleBus.emit('REGRESSION_FAILED', {
          trigger: signal,
          passRate,
          failedTests: results.filter(r => !r.passed).map(r => r.name),
        });
        
        if (cfg.autoRollbackOnFailure) {
          moduleBus.emit('ROLLBACK_TRIGGERED', {
            reason: 'regression_failure',
            evolution_id: data?.proposalId || data?.runId,
            pass_rate: passRate,
          });
        }
      } else {
        console.log(`[Regression-Trigger] ✅ All clear: ${passed}/${total} passed`);
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
