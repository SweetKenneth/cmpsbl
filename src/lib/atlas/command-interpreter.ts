/**
 * Atlas Command Interpreter
 * v7.2.0 — Natural language command processing for substrate control
 * 
 * Interprets conversational commands like:
 * - "activate SeBA in 24/7 mode"
 * - "show me Ripple's logs"
 * - "run an evolution cycle"
 * - "what's the system health?"
 */

import { supabase } from '@/integrations/supabase/client';
import { atlas, type AtlasMode, type CapabilityId } from './index';
import { sebaAgent } from '../substrate/seba';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type CommandCategory = 
  | 'seba_control'
  | 'capability_toggle'
  | 'mode_change'
  | 'logs_view'
  | 'metrics_query'
  | 'cycle_run'
  | 'status_check'
  | 'proposal_action'
  | 'help'
  | 'unknown';

export interface ParsedCommand {
  category: CommandCategory;
  intent: string;
  entities: {
    module?: string;
    capability?: CapabilityId;
    mode?: AtlasMode | string;
    action?: 'enable' | 'disable' | 'approve' | 'reject' | 'run';
    target?: string;
    limit?: number;
  };
  confidence: number;
  originalInput: string;
}

export interface CommandResult {
  success: boolean;
  message: string;
  data?: unknown;
  suggestions?: string[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND PATTERNS
// ═══════════════════════════════════════════════════════════════════════════════

const COMMAND_PATTERNS: Array<{
  patterns: RegExp[];
  category: CommandCategory;
  extractEntities: (match: RegExpMatchArray, input: string) => ParsedCommand['entities'];
}> = [
  // SEBA Control
  {
    patterns: [
      /\b(activate|enable|start|turn on)\s+(seba|evolution)\b/i,
      /\bseba\s+(on|activate|enable|start)\b/i,
      /\b(run|start)\s+seba\s+in\s+(\w+)\s+mode\b/i,
    ],
    category: 'seba_control',
    extractEntities: (match, input) => {
      const modeMatch = input.match(/\b(24\/7|autonomous|advisory|manual|off)\b/i);
      return {
        module: 'seba',
        action: 'enable',
        mode: modeMatch ? modeMatch[1].toLowerCase().replace('24/7', 'autonomous') : 'advisory',
      };
    },
  },
  {
    patterns: [
      /\b(deactivate|disable|stop|turn off|pause)\s+(seba|evolution)\b/i,
      /\bseba\s+(off|deactivate|disable|stop)\b/i,
    ],
    category: 'seba_control',
    extractEntities: () => ({
      module: 'seba',
      action: 'disable',
    }),
  },
  // Evolution Cycle
  {
    patterns: [
      /\b(run|execute|trigger|start)\s+(an?\s+)?(evolution|seba)\s+cycle\b/i,
      /\bevolution\s+cycle\b/i,
      /\brun\s+cycle\b/i,
    ],
    category: 'cycle_run',
    extractEntities: () => ({
      module: 'seba',
      action: 'run',
    }),
  },
  // Capability Toggles
  {
    patterns: [
      /\b(enable|activate|turn on)\s+(\w+)\b/i,
    ],
    category: 'capability_toggle',
    extractEntities: (match) => ({
      capability: normalizeCapability(match[2]),
      action: 'enable',
    }),
  },
  {
    patterns: [
      /\b(disable|deactivate|turn off)\s+(\w+)\b/i,
    ],
    category: 'capability_toggle',
    extractEntities: (match) => ({
      capability: normalizeCapability(match[2]),
      action: 'disable',
    }),
  },
  // Logs View
  {
    patterns: [
      /\b(show|display|get|view)\s+(me\s+)?(\w+)?\s*(logs?|events?|activity)\b/i,
      /\b(\w+)\s+(logs?|events?)\b/i,
    ],
    category: 'logs_view',
    extractEntities: (match) => {
      const module = match[3] || match[1];
      return {
        module: normalizeModule(module),
        limit: 20,
      };
    },
  },
  // Status Check
  {
    patterns: [
      /\b(what'?s?|show|display|get)\s+(the\s+)?(system\s+)?(health|status|state)\b/i,
      /\bhow\s+(is|are)\s+(things|the\s+system|seba)\b/i,
      /\bstatus\s+(check|report)\b/i,
    ],
    category: 'status_check',
    extractEntities: () => ({}),
  },
  // Metrics Query
  {
    patterns: [
      /\b(show|display|get)\s+(me\s+)?(\w+)?\s*(metrics?|stats?|telemetry)\b/i,
    ],
    category: 'metrics_query',
    extractEntities: (match) => ({
      module: normalizeModule(match[3]),
    }),
  },
  // Mode Change
  {
    patterns: [
      /\b(set|switch|change)\s+(to\s+)?(\w+)\s+mode\b/i,
      /\bmode\s+(to\s+)?(\w+)\b/i,
    ],
    category: 'mode_change',
    extractEntities: (match) => ({
      mode: normalizeMode(match[3] || match[2]),
    }),
  },
  // Proposal Actions
  {
    patterns: [
      /\b(approve|accept)\s+(all\s+)?(pending\s+)?(proposals?|changes?)\b/i,
    ],
    category: 'proposal_action',
    extractEntities: () => ({
      action: 'approve',
      target: 'pending',
    }),
  },
  {
    patterns: [
      /\b(reject|decline)\s+(all\s+)?(pending\s+)?(proposals?|changes?)\b/i,
    ],
    category: 'proposal_action',
    extractEntities: () => ({
      action: 'reject',
      target: 'pending',
    }),
  },
  // Help
  {
    patterns: [
      /\b(help|commands?|what can you do)\b/i,
      /\bhow\s+do\s+I\b/i,
    ],
    category: 'help',
    extractEntities: () => ({}),
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function normalizeCapability(input: string): CapabilityId | undefined {
  const normalized = input.toLowerCase().replace(/[^a-z]/g, '');
  const mapping: Record<string, CapabilityId> = {
    seba: 'seba',
    clm: 'clm',
    encoded: 'encoded',
    dreameater: 'dream_eater',
    dream: 'dream_eater',
    evolution: 'evolution_engine',
    nexus: 'nexus_routing',
    defense: 'defense_active',
    ripple: 'ripple_bus',
    brain: 'brain_learning',
    vision: 'vision_metrics',
  };
  return mapping[normalized];
}

function normalizeModule(input?: string): string {
  if (!input) return 'system';
  const normalized = input.toLowerCase().replace(/[^a-z]/g, '');
  const mapping: Record<string, string> = {
    ripple: 'ripple',
    seba: 'seba',
    brain: 'brain',
    decode: 'decode',
    nexus: 'nexus',
    defense: 'defense',
    vision: 'vision',
    dream: 'dream',
    clm: 'clm',
    cortex: 'cortex',
    atlas: 'atlas',
    system: 'system',
  };
  return mapping[normalized] || 'system';
}

function normalizeMode(input: string): AtlasMode {
  const normalized = input.toLowerCase();
  if (normalized.includes('auto') || normalized.includes('24')) return 'autonomous';
  if (normalized.includes('advis')) return 'advisory';
  if (normalized.includes('manual')) return 'manual';
  if (normalized.includes('emerg')) return 'emergency';
  return 'advisory';
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMMAND INTERPRETER
// ═══════════════════════════════════════════════════════════════════════════════

export class AtlasCommandInterpreter {
  /**
   * Parse natural language input into structured command
   */
  parse(input: string): ParsedCommand {
    const trimmedInput = input.trim();
    
    for (const pattern of COMMAND_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = trimmedInput.match(regex);
        if (match) {
          return {
            category: pattern.category,
            intent: match[0],
            entities: pattern.extractEntities(match, trimmedInput),
            confidence: 0.85,
            originalInput: trimmedInput,
          };
        }
      }
    }

    // Unknown command
    return {
      category: 'unknown',
      intent: 'unknown',
      entities: {},
      confidence: 0.1,
      originalInput: trimmedInput,
    };
  }

  /**
   * Execute a parsed command
   */
  async execute(command: ParsedCommand): Promise<CommandResult> {
    switch (command.category) {
      case 'seba_control':
        return this.handleSEBAControl(command);
      case 'capability_toggle':
        return this.handleCapabilityToggle(command);
      case 'mode_change':
        return this.handleModeChange(command);
      case 'logs_view':
        return this.handleLogsView(command);
      case 'metrics_query':
        return this.handleMetricsQuery(command);
      case 'cycle_run':
        return this.handleCycleRun(command);
      case 'status_check':
        return this.handleStatusCheck(command);
      case 'proposal_action':
        return this.handleProposalAction(command);
      case 'help':
        return this.handleHelp();
      default:
        return {
          success: false,
          message: "I didn't understand that command. Try saying things like:\n• \"activate SEBA in advisory mode\"\n• \"show me Ripple logs\"\n• \"what's the system status?\"\n• \"run an evolution cycle\"",
          suggestions: [
            'activate SEBA',
            'show system status',
            'view Ripple logs',
            'run evolution cycle',
          ],
        };
    }
  }

  // ═══ COMMAND HANDLERS ═══

  private async handleSEBAControl(command: ParsedCommand): Promise<CommandResult> {
    const { action, mode } = command.entities;

    if (action === 'enable') {
      // Enable SEBA
      await atlas.toggleCapability('seba', true, 'user');
      
      // Set mode
      const sebaMode = mode === 'autonomous' ? 'autonomous' : 'advisory';
      
      // Run initial cycle if activating
      try {
        const enableResult = await sebaAgent.handleCommand('enable');
        if (enableResult.success) {
          await sebaAgent.handleCommand('mode', { mode: sebaMode });
        }
        
        return {
          success: true,
          message: `✓ SEBA activated in ${sebaMode} mode. All evolution proposals will require your approval before execution.`,
          data: { mode: sebaMode },
        };
      } catch (err) {
        return {
          success: false,
          message: 'Failed to activate SEBA. Check system connectivity.',
        };
      }
    } else {
      // Disable SEBA
      await atlas.toggleCapability('seba', false, 'user');
      await sebaAgent.handleCommand('disable');
      
      return {
        success: true,
        message: '✓ SEBA deactivated. Autonomous evolution is now paused.',
      };
    }
  }

  private async handleCapabilityToggle(command: ParsedCommand): Promise<CommandResult> {
    const { capability, action } = command.entities;
    
    if (!capability) {
      return {
        success: false,
        message: "I couldn't identify which capability you want to toggle. Available: seba, clm, encoded, dream, nexus, defense, ripple, brain, vision",
      };
    }

    const enabled = action === 'enable';
    await atlas.toggleCapability(capability, enabled, 'user');

    return {
      success: true,
      message: `✓ ${capability.toUpperCase()} ${enabled ? 'enabled' : 'disabled'}.`,
      data: { capability, enabled },
    };
  }

  private async handleModeChange(command: ParsedCommand): Promise<CommandResult> {
    const { mode } = command.entities;
    
    if (!mode || !['autonomous', 'advisory', 'manual', 'emergency'].includes(mode)) {
      return {
        success: false,
        message: 'Invalid mode. Available modes: autonomous, advisory, manual, emergency',
      };
    }

    await atlas.setMode(mode as AtlasMode, 'user');

    const modeDescriptions: Record<AtlasMode, string> = {
      autonomous: 'SEBA can auto-approve low-risk evolutions',
      advisory: 'All evolutions require your approval',
      manual: 'No autonomous operations',
      emergency: 'All autonomous features disabled',
    };

    return {
      success: true,
      message: `✓ Mode set to ${mode.toUpperCase()}. ${modeDescriptions[mode as AtlasMode]}`,
      data: { mode },
    };
  }

  private async handleLogsView(command: ParsedCommand): Promise<CommandResult> {
    const { module, limit = 20 } = command.entities;
    
    try {
      const { data: logs, error } = await supabase
        .from('brain_events')
        .select('id, module, event_type, outcome, created_at, data')
        .eq('module', module || 'system')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedLogs = (logs || []).map(log => ({
        time: new Date(log.created_at).toLocaleTimeString(),
        event: log.event_type,
        outcome: log.outcome,
      }));

      return {
        success: true,
        message: `📋 **${(module || 'system').toUpperCase()} Logs** (last ${limit})\n\n${
          formattedLogs.length > 0
            ? formattedLogs.map(l => `• ${l.time} — ${l.event} [${l.outcome}]`).join('\n')
            : 'No logs found.'
        }`,
        data: logs,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to fetch ${module} logs.`,
      };
    }
  }

  private async handleMetricsQuery(command: ParsedCommand): Promise<CommandResult> {
    const state = atlas.getState();
    
    // Fetch usage stats
    const { data: usage } = await supabase
      .from('lovable_ai_usage')
      .select('calls_used, tokens_used')
      .gte('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    return {
      success: true,
      message: `📊 **System Metrics**\n\n• Mode: ${state.mode.toUpperCase()}\n• Health: ${state.systemHealth}%\n• Pending Approvals: ${state.pendingApprovals}\n• Active Sessions: ${state.activeSessions}\n• Today's AI Calls: ${usage?.calls_used || 0}\n• Tokens Used: ${usage?.tokens_used || 0}`,
      data: { state, usage },
    };
  }

  private async handleCycleRun(command: ParsedCommand): Promise<CommandResult> {
    try {
      const result = await sebaAgent.runCycle();
      
      if (result.success) {
        return {
          success: true,
          message: `✓ Evolution cycle complete.\n• Insights analyzed: ${result.insights_analyzed || 0}\n• Proposals generated: ${result.proposals_generated || 0}\n• Evolutions applied: ${result.evolutions_applied || 0}`,
          data: result,
        };
      } else {
        return {
          success: false,
          message: `Evolution cycle failed: ${result.error || 'Unknown error'}`,
        };
      }
    } catch (err) {
      return {
        success: false,
        message: 'Failed to run evolution cycle. Is SEBA enabled?',
        suggestions: ['activate SEBA', 'check system status'],
      };
    }
  }

  private async handleStatusCheck(command: ParsedCommand): Promise<CommandResult> {
    const state = atlas.getState();
    const sebaState = sebaAgent.getState();
    
    // Build capabilities list
    const enabledCaps = Object.entries(state.capabilities)
      .filter(([, v]) => v.enabled)
      .map(([k]) => k);

    return {
      success: true,
      message: `🔮 **Atlas Control Plane Status**\n\n**Mode:** ${state.mode.toUpperCase()}\n**Health:** ${state.systemHealth}%\n\n**SEBA Agent:**\n• Phase: ${sebaState.current_phase}\n• Cycles: ${sebaState.total_cycles}\n• Pending: ${sebaState.pending_proposals} proposals\n\n**Active Capabilities:**\n${enabledCaps.map(c => `• ${c}`).join('\n')}`,
      data: { atlasState: state, sebaState },
    };
  }

  private async handleProposalAction(command: ParsedCommand): Promise<CommandResult> {
    const { action } = command.entities;
    const pendingActions = atlas.getPendingActions();

    if (pendingActions.length === 0) {
      return {
        success: true,
        message: 'No pending proposals to process.',
      };
    }

    let processed = 0;
    for (const card of pendingActions) {
      if (action === 'approve') {
        await atlas.approveActionCard(card.id, 'user');
      } else {
        await atlas.rejectActionCard(card.id, 'Rejected via Atlas command');
      }
      processed++;
    }

    return {
      success: true,
      message: `✓ ${processed} proposal(s) ${action === 'approve' ? 'approved' : 'rejected'}.`,
      data: { processed },
    };
  }

  private handleHelp(): CommandResult {
    return {
      success: true,
      message: `🎛️ **Atlas Command Reference**\n\n**SEBA Control:**\n• "activate SEBA" / "activate SEBA in advisory mode"\n• "deactivate SEBA"\n• "run an evolution cycle"\n\n**Mode Control:**\n• "set advisory mode" / "set autonomous mode"\n\n**Capabilities:**\n• "enable CLM" / "disable dream"\n\n**Observability:**\n• "show Ripple logs"\n• "what's the system status?"\n• "show me metrics"\n\n**Proposals:**\n• "approve pending proposals"\n• "reject proposals"`,
    };
  }
}

// Singleton export
export const atlasInterpreter = new AtlasCommandInterpreter();
