/**
 * Encoded Terminal Handlers
 * v2.1.0 — Terminal commands for Encoded agent operations
 */

import { registerHandler } from './validate-registry';
import { supabase } from '@/integrations/supabase/client';
import { 
  getEncodedConfig, 
  updateEncodedConfig,
  getExecutionModeLabel,
  getPrimaryModelLabel,
  type ExecutionMode,
  type PrimaryModel,
} from '@/lib/codeagent/encoded';
import { log } from '@/lib/system/log';

/**
 * Register all encoded-related terminal commands
 */
export function registerEncodedHandlers(): void {
  // encoded.status — Get Encoded agent status and configuration
  registerHandler('encoded.status', async () => {
    const config = await getEncodedConfig();
    
    // Get stats from edge function
    let stats = { patterns_learned: 0, executions_today: 0 };
    try {
      const { data } = await supabase.functions.invoke('pf-encoded-agent', {
        body: { action: 'status' },
      });
      if (data?.stats) {
        stats = data.stats;
      }
    } catch (err) {
      console.warn('Failed to fetch encoded stats:', err);
    }

    return {
      success: true,
      data: {
        version: '2.1.0',
        mode: {
          current: config.executionMode,
          label: getExecutionModeLabel(config.executionMode),
        },
        model: {
          current: config.primaryModel,
          label: getPrimaryModelLabel(config.primaryModel),
        },
        integrations: {
          seba: config.sebaIntegration,
          clm_training: config.clmTraining,
        },
        limits: {
          max_retries: config.maxRetries,
        },
        stats,
        policy: {
          require_file_read: true,
          require_anchor_check: true,
          deny_narrative_code: true,
          fail_closed: true,
          max_removed_lines: 10,
          max_change_percent: '20%',
        },
      },
    };
  });

  // encoded.config — View current configuration
  registerHandler('encoded.config', async () => {
    const config = await getEncodedConfig();
    
    return {
      success: true,
      data: {
        execution_mode: config.executionMode,
        seba_integration: config.sebaIntegration,
        clm_training: config.clmTraining,
        primary_model: config.primaryModel,
        max_retries: config.maxRetries,
      },
    };
  });

  // encoded.set_mode <mode> — Set execution mode
  registerHandler('encoded.set_mode', async () => {
    return {
      success: false,
      error: 'Usage: encoded.set_mode <dry_run|human_approval|semi_autonomous|autonomous>',
      modes: {
        dry_run: 'Preview changes without writing (safest)',
        human_approval: 'Require approval for all changes',
        semi_autonomous: 'Auto-approve low-risk, require approval for high-risk',
        autonomous: 'Auto-approve all passing changes (use with caution)',
      },
    };
  });

  // encoded.dry_run — Enable dry-run mode (safe default)
  registerHandler('encoded.dry_run', async () => {
    const result = await updateEncodedConfig({ executionMode: 'dry_run' });
    
    return {
      success: result.success,
      message: result.success 
        ? 'Encoded now in DRY-RUN mode — changes will be previewed, not written'
        : result.error,
    };
  });

  // encoded.enable — Enable human approval mode
  registerHandler('encoded.enable', async () => {
    const result = await updateEncodedConfig({ executionMode: 'human_approval' });
    
    return {
      success: result.success,
      message: result.success 
        ? 'Encoded now in HUMAN APPROVAL mode — all changes require explicit approval'
        : result.error,
    };
  });

  // encoded.semi_auto — Enable semi-autonomous mode
  registerHandler('encoded.semi_auto', async () => {
    const result = await updateEncodedConfig({ executionMode: 'semi_autonomous' });
    
    return {
      success: result.success,
      message: result.success 
        ? 'Encoded now in SEMI-AUTONOMOUS mode — low-risk auto, high-risk requires approval'
        : result.error,
      warning: 'Additive and localized changes will be auto-applied',
    };
  });

  // encoded.verify <code> — Verify code without executing
  registerHandler('encoded.verify', async () => {
    return {
      success: false,
      error: 'Usage: encoded.verify (with code in task payload)',
      description: 'Validates code against Encoded guardrails without applying changes',
      checks: [
        'Syntax validation',
        'Anchor preservation (exports, handlers, entrypoints)',
        'Narrative pattern detection',
        'Security checks (no eval, no Function())',
      ],
    };
  });

  // encoded.generate — Generate code (preview mode)
  registerHandler('encoded.generate', async () => {
    return {
      success: false,
      error: 'Usage: encoded.generate (with task specification)',
      required_fields: {
        module: 'Target module name',
        change_type: 'Type of change (add, modify, refactor)',
        description: 'What the code should do',
      },
      optional_fields: {
        file_path: 'Target file path',
        existing_code: 'Current code (for modifications)',
      },
    };
  });

  // encoded.patterns — List learned patterns
  registerHandler('encoded.patterns', async () => {
    const { data: patterns, error } = await supabase
      .from('brain_memories')
      .select('content, confidence, metadata, created_at')
      .eq('memory_type', 'code_pattern')
      .order('confidence', { ascending: false })
      .limit(20);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        total: patterns?.length || 0,
        patterns: patterns?.map(p => ({
          content: p.content,
          confidence: p.confidence,
          metadata: p.metadata,
          learned: p.created_at,
        })) || [],
      },
    };
  });

  // encoded.history — Recent Encoded executions
  registerHandler('encoded.history', async () => {
    const { data: events, error } = await supabase
      .from('brain_events')
      .select('outcome, data, created_at')
      .eq('event_type', 'encoded_execution')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        executions: events?.map(e => ({
          outcome: e.outcome,
          module: e.data?.task_module,
          change_type: e.data?.change_type,
          provider: e.data?.provider,
          model: e.data?.model,
          timestamp: e.created_at,
        })) || [],
      },
    };
  });

  // encoded.seba.enable — Enable SEBA integration
  registerHandler('encoded.seba.enable', async () => {
    const result = await updateEncodedConfig({ sebaIntegration: true });
    
    return {
      success: result.success,
      message: result.success 
        ? 'SEBA integration ENABLED — Encoded can now receive evolution proposals'
        : result.error,
    };
  });

  // encoded.seba.disable — Disable SEBA integration
  registerHandler('encoded.seba.disable', async () => {
    const result = await updateEncodedConfig({ sebaIntegration: false });
    
    return {
      success: result.success,
      message: result.success 
        ? 'SEBA integration DISABLED — Encoded operates independently'
        : result.error,
    };
  });

  // encoded.model.lovable — Use Lovable AI as primary
  registerHandler('encoded.model.lovable', async () => {
    const result = await updateEncodedConfig({ primaryModel: 'lovable_ai' });
    
    return {
      success: result.success,
      message: result.success 
        ? 'Primary model set to LOVABLE AI (Gemini 3 Flash)'
        : result.error,
    };
  });

  // encoded.model.free — Use free-tier as primary
  registerHandler('encoded.model.free', async () => {
    const result = await updateEncodedConfig({ primaryModel: 'free_tier' });
    
    return {
      success: result.success,
      message: result.success 
        ? 'Primary model set to FREE TIER (Groq → Cerebras fallback)'
        : result.error,
    };
  });

  // encoded.guard.test — Test guard against sample code
  registerHandler('encoded.guard.test', async () => {
    return {
      success: true,
      data: {
        description: 'Guard test endpoint',
        usage: 'Provide before/after code to test guard validation',
        checks: [
          'Anchor preservation',
          'Narrative pattern detection',
          'Change classification (comment_only, additive, localized, destructive)',
          'Risk assessment',
        ],
      },
    };
  });

  // encoded.help — Show all encoded commands
  registerHandler('encoded.help', async () => {
    return {
      success: true,
      data: {
        version: '2.1.0',
        description: 'Encoded — Precision Code Generation Agent',
        commands: {
          'encoded.status': 'Get agent status and configuration',
          'encoded.config': 'View current configuration',
          'encoded.dry_run': 'Enable dry-run mode (preview only)',
          'encoded.enable': 'Enable human approval mode',
          'encoded.semi_auto': 'Enable semi-autonomous mode',
          'encoded.verify': 'Verify code against guardrails',
          'encoded.generate': 'Generate code (with task spec)',
          'encoded.patterns': 'List learned code patterns',
          'encoded.history': 'Recent Encoded executions',
          'encoded.seba.enable': 'Enable SEBA integration',
          'encoded.seba.disable': 'Disable SEBA integration',
          'encoded.model.lovable': 'Use Lovable AI as primary',
          'encoded.model.free': 'Use free-tier as primary',
          'encoded.guard.test': 'Test guard validation',
        },
      },
    };
  });

  log.info('terminal', 'Encoded handlers registered', { count: 15 });
}

/**
 * Execute encoded command with arguments
 */
export async function executeEncodedCommand(
  action: string,
  args: Record<string, unknown> = {}
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('pf-encoded-agent', {
      body: { action, ...args },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
}

/**
 * Set execution mode with validation
 */
export async function setEncodedMode(
  mode: ExecutionMode
): Promise<{ success: boolean; message: string }> {
  const validModes: ExecutionMode[] = ['dry_run', 'human_approval', 'semi_autonomous', 'autonomous'];
  
  if (!validModes.includes(mode)) {
    return { 
      success: false, 
      message: `Invalid mode: ${mode}. Valid modes: ${validModes.join(', ')}` 
    };
  }

  const result = await updateEncodedConfig({ executionMode: mode });
  
  return {
    success: result.success,
    message: result.success 
      ? `Encoded mode set to: ${getExecutionModeLabel(mode)}`
      : result.error || 'Failed to update mode',
  };
}
