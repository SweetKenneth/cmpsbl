/**
 * Atlas Command Interpreter
 * Natural language command processing for substrate control
 * 
 * Interprets conversational commands like:
 * - "activate SeBA in 24/7 mode"
 * - "show me Ripple's logs"
 * - "run an evolution cycle"
 * - "what's the system health?"
 * - "consolidate memories"
 * - "pause autoblog"
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
  | 'memory_ops'
  | 'brain_control'
  | 'autoblog'
  | 'health_check'
  | 'usage_query'
  | 'clear_session'
  | 'version_info'
  | 'help'
  | 'unknown';

export interface ParsedCommand {
  category: CommandCategory;
  intent: string;
  entities: {
    module?: string;
    capability?: CapabilityId;
    mode?: AtlasMode | string;
    action?: 'enable' | 'disable' | 'approve' | 'reject' | 'run' | 'pause' | 'resume' | 'query' | 'consolidate' | 'prune' | 'check';
    target?: string;
    limit?: number;
    query?: string;
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
      /\btrigger\s+cycle\b/i,
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
      /\blogs?\s+for\s+(\w+)\b/i,
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
      /\bsystem\s+overview\b/i,
    ],
    category: 'status_check',
    extractEntities: () => ({}),
  },
  // Health Check (separate from status)
  {
    patterns: [
      /\b(run|perform|execute)\s+(health|diagnostic)\s+(check|scan)\b/i,
      /\bdiagnostic\b/i,
      /\bhealth\s+scan\b/i,
    ],
    category: 'health_check',
    extractEntities: () => ({}),
  },
  // Metrics Query
  {
    patterns: [
      /\b(show|display|get)\s+(me\s+)?(\w+)?\s*(metrics?|stats?|telemetry|analytics)\b/i,
    ],
    category: 'metrics_query',
    extractEntities: (match) => ({
      module: normalizeModule(match[3]),
    }),
  },
  // Usage Query
  {
    patterns: [
      /\b(show|display|get|check)\s+(my\s+)?(usage|quota|credits?|calls?)\b/i,
      /\bhow\s+many\s+(calls?|credits?|cycles?)\b/i,
      /\bremaining\s+(calls?|credits?|cycles?)\b/i,
    ],
    category: 'usage_query',
    extractEntities: () => ({}),
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
  {
    patterns: [
      /\b(show|list|view)\s+(pending\s+)?(proposals?)\b/i,
      /\bpending\s+(proposals?|approvals?)\b/i,
    ],
    category: 'proposal_action',
    extractEntities: () => ({
      action: 'check',
      target: 'pending',
    }),
  },
  // Memory Operations
  {
    patterns: [
      /\b(show|list|view)\s+(recent\s+)?memories\b/i,
      /\bmemory\s+(list|overview)\b/i,
    ],
    category: 'memory_ops',
    extractEntities: () => ({
      action: 'query',
      limit: 10,
    }),
  },
  {
    patterns: [
      /\bquery\s+memories?\s*(for|about)?\s*(.+)?$/i,
      /\bsearch\s+memories?\s*(for|about)?\s*(.+)?$/i,
    ],
    category: 'memory_ops',
    extractEntities: (match) => ({
      action: 'query',
      query: match[2]?.trim() || '',
      limit: 20,
    }),
  },
  {
    patterns: [
      /\b(consolidate|merge)\s+memories\b/i,
    ],
    category: 'memory_ops',
    extractEntities: () => ({
      action: 'consolidate',
    }),
  },
  {
    patterns: [
      /\b(prune|clean|remove|delete)\s+(old|stale|expired)?\s*memories\b/i,
      /\bmemory\s+(cleanup|prune)\b/i,
    ],
    category: 'memory_ops',
    extractEntities: () => ({
      action: 'prune',
    }),
  },
  // Brain Control
  {
    patterns: [
      /\b(scan|analyze)\s+(the\s+)?brain\b/i,
      /\bbrain\s+(scan|analysis)\b/i,
    ],
    category: 'brain_control',
    extractEntities: () => ({
      action: 'query',
      module: 'brain',
    }),
  },
  {
    patterns: [
      /\b(show|display|get)\s+(brain|cognitive)\s+(stats?|metrics?|health)\b/i,
    ],
    category: 'brain_control',
    extractEntities: () => ({
      action: 'query',
      module: 'brain',
    }),
  },
  // Autoblog Control
  {
    patterns: [
      /\b(check|show|view)\s+(autoblog|blog)\s+(queue|status)\b/i,
      /\bautoblog\s+(status|queue)\b/i,
    ],
    category: 'autoblog',
    extractEntities: () => ({
      action: 'check',
      module: 'autoblog',
    }),
  },
  {
    patterns: [
      /\b(pause|stop)\s+autoblog\b/i,
      /\bautoblog\s+(pause|stop)\b/i,
    ],
    category: 'autoblog',
    extractEntities: () => ({
      action: 'pause',
      module: 'autoblog',
    }),
  },
  {
    patterns: [
      /\b(resume|start)\s+autoblog\b/i,
      /\bautoblog\s+(resume|start)\b/i,
    ],
    category: 'autoblog',
    extractEntities: () => ({
      action: 'resume',
      module: 'autoblog',
    }),
  },
  // Clear Session
  {
    patterns: [
      /\b(clear|reset)\s+(chat|session|conversation|history)\b/i,
    ],
    category: 'clear_session',
    extractEntities: () => ({}),
  },
  // Version Info
  {
    patterns: [
      /\b(version|about|info)\b/i,
      /\bwhat\s+version\b/i,
    ],
    category: 'version_info',
    extractEntities: () => ({}),
  },
  // Help
  {
    patterns: [
      /\b(help|commands?|what can you do)\b/i,
      /\bhow\s+do\s+I\b/i,
      /\blist\s+commands\b/i,
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
    learning: 'brain_learning',
    routing: 'nexus_routing',
    metrics: 'vision_metrics',
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
    cognitive: 'brain',
    memory: 'brain',
    evolution: 'seba',
    encoded: 'seba',
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
    const trimmedInput = input.trim().slice(0, 500); // Max 500 chars for safety
    
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
      case 'health_check':
        return this.handleHealthCheck(command);
      case 'proposal_action':
        return this.handleProposalAction(command);
      case 'memory_ops':
        return this.handleMemoryOps(command);
      case 'brain_control':
        return this.handleBrainControl(command);
      case 'autoblog':
        return this.handleAutoblog(command);
      case 'usage_query':
        return this.handleUsageQuery(command);
      case 'clear_session':
        return this.handleClearSession();
      case 'version_info':
        return this.handleVersionInfo();
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
        message: "I couldn't identify which capability you want to toggle.\n\n**Available capabilities:**\n• seba, clm, encoded\n• dream, nexus, defense\n• ripple, brain, vision",
        suggestions: ['enable CLM', 'disable dream', 'enable encoded'],
      };
    }

    const enabled = action === 'enable';
    await atlas.toggleCapability(capability, enabled, 'user');

    const capabilityNames: Record<CapabilityId, string> = {
      seba: 'SEBA (Self-Evolving Agent)',
      clm: 'CLM (Continuous Learning)',
      encoded: 'Encoded (Code Agent)',
      dream_eater: 'Dream-Eater (Ingestion)',
      evolution_engine: 'Evolution Engine',
      nexus_routing: 'Nexus (Router)',
      defense_active: 'Defense (Security)',
      ripple_bus: 'Ripple (Event Bus)',
      brain_learning: 'Brain (Learning)',
      vision_metrics: 'Vision (Metrics)',
    };

    return {
      success: true,
      message: `✓ ${capabilityNames[capability] || capability.toUpperCase()} ${enabled ? 'enabled' : 'disabled'}.`,
      data: { capability, enabled },
    };
  }

  private async handleModeChange(command: ParsedCommand): Promise<CommandResult> {
    const { mode } = command.entities;
    
    if (!mode || !['autonomous', 'advisory', 'manual', 'emergency'].includes(mode)) {
      return {
        success: false,
        message: '**Invalid mode.** Available modes:\n• **autonomous** — Auto-execute low-risk\n• **advisory** — All requires approval\n• **manual** — No automation\n• **emergency** — Full shutdown',
        suggestions: ['set advisory mode', 'set autonomous mode'],
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
      message: `✓ Mode set to **${mode.toUpperCase()}**.\n${modeDescriptions[mode as AtlasMode]}`,
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

      if (!logs || logs.length === 0) {
        return {
          success: true,
          message: `📋 **${(module || 'system').toUpperCase()} Logs**\n\nNo recent logs found for this module.`,
          suggestions: ['show system logs', 'show brain logs', 'show atlas logs'],
        };
      }

      const formattedLogs = logs.map(log => ({
        time: new Date(log.created_at).toLocaleTimeString(),
        date: new Date(log.created_at).toLocaleDateString(),
        event: log.event_type,
        outcome: log.outcome,
      }));

      return {
        success: true,
        message: `📋 **${(module || 'system').toUpperCase()} Logs** (last ${logs.length})\n\n${
          formattedLogs.map(l => `• ${l.date} ${l.time} — ${l.event} [${l.outcome}]`).join('\n')
        }`,
        data: logs,
      };
    } catch (err) {
      return {
        success: false,
        message: `Failed to fetch ${module} logs. The module may not have recent activity.`,
        suggestions: ['show system logs', 'show atlas logs'],
      };
    }
  }

  private async handleMetricsQuery(command: ParsedCommand): Promise<CommandResult> {
    const state = atlas.getState();
    
    // Fetch usage stats
    const { data: usage } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, tokens_used')
      .gte('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    // Fetch monthly usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: monthlyUsage } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, tokens_used')
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    const monthlyTotals = monthlyUsage?.reduce(
      (acc, day) => ({
        calls: acc.calls + (day.calls_used || 0),
        tokens: acc.tokens + (day.tokens_used || 0),
      }),
      { calls: 0, tokens: 0 }
    ) || { calls: 0, tokens: 0 };

    return {
      success: true,
      message: `📊 **System Metrics**\n\n**Atlas State:**\n• Mode: ${state.mode.toUpperCase()}\n• Health: ${state.systemHealth}%\n• Pending Approvals: ${state.pendingApprovals}\n\n**Today's Usage:**\n• AI Calls: ${usage?.calls_used || 0} / 50\n• Tokens: ${(usage?.tokens_used || 0).toLocaleString()}\n\n**This Month:**\n• Total Calls: ${monthlyTotals.calls} / 1,000\n• Total Tokens: ${monthlyTotals.tokens.toLocaleString()}`,
      data: { state, usage, monthlyTotals },
    };
  }

  private async handleUsageQuery(command: ParsedCommand): Promise<CommandResult> {
    // Fetch today's usage
    const { data: todayUsage } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, tokens_used')
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    // Fetch monthly usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { data: monthlyUsage } = await supabase
      .from('ai_daily_quota')
      .select('calls_used, tokens_used')
      .gte('date', startOfMonth.toISOString().split('T')[0]);

    const monthlyTotals = monthlyUsage?.reduce(
      (acc, day) => ({
        calls: acc.calls + (day.calls_used || 0),
        tokens: acc.tokens + (day.tokens_used || 0),
      }),
      { calls: 0, tokens: 0 }
    ) || { calls: 0, tokens: 0 };

    const dailyRemaining = Math.max(0, 50 - (todayUsage?.calls_used || 0));
    const monthlyRemaining = Math.max(0, 1000 - monthlyTotals.calls);
    const cyclesRemaining = Math.floor(dailyRemaining / 2.5);

    return {
      success: true,
      message: `💳 **Usage & Quota**\n\n**Today:**\n• Calls: ${todayUsage?.calls_used || 0} / 50 (${dailyRemaining} remaining)\n• Cycles: ~${cyclesRemaining} remaining\n• Tokens: ${(todayUsage?.tokens_used || 0).toLocaleString()}\n\n**This Month:**\n• Calls: ${monthlyTotals.calls} / 1,000 (${monthlyRemaining} remaining)\n• Tokens: ${monthlyTotals.tokens.toLocaleString()}\n\n**Free Tier:**\n• ~50 calls/day\n• ~20 evolution cycles/day\n• ~400 cycles/month`,
      data: { todayUsage, monthlyTotals, dailyRemaining, monthlyRemaining },
    };
  }

  private async handleCycleRun(command: ParsedCommand): Promise<CommandResult> {
    // Check usage first
    const { data: todayUsage } = await supabase
      .from('lovable_ai_usage')
      .select('calls_used')
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();

    if ((todayUsage?.calls_used || 0) >= 50) {
      return {
        success: false,
        message: '⚠️ Daily call limit reached (50/50). Evolution cycles paused to stay within free tier.\n\nReset at midnight UTC.',
        suggestions: ['show usage', 'show status'],
      };
    }

    try {
      const result = await sebaAgent.runCycle();
      
      if (result.success) {
        return {
          success: true,
          message: `✓ **Evolution cycle complete.**\n\n• Insights analyzed: ${result.insights_analyzed || 0}\n• Proposals generated: ${result.proposals_generated || 0}\n• Evolutions applied: ${result.evolutions_applied || 0}\n\n${result.proposals_generated > 0 ? 'Use **"show pending proposals"** to review.' : ''}`,
          data: result,
        };
      } else {
        return {
          success: false,
          message: `Evolution cycle failed: ${result.error || 'Unknown error'}`,
          suggestions: ['show status', 'activate SEBA'],
        };
      }
    } catch (err) {
      return {
        success: false,
        message: 'Failed to run evolution cycle. Is SEBA enabled?',
        suggestions: ['activate SEBA', 'show status'],
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

    const disabledCaps = Object.entries(state.capabilities)
      .filter(([, v]) => !v.enabled)
      .map(([k]) => k);

    return {
      success: true,
      message: `🔮 **Atlas Control Plane Status**\n\n**Mode:** ${state.mode.toUpperCase()}\n**Health:** ${state.systemHealth}%\n\n**SEBA Agent:**\n• Phase: ${sebaState.current_phase}\n• Total Cycles: ${sebaState.total_cycles}\n• Pending Proposals: ${sebaState.pending_proposals}\n\n**Enabled Capabilities (${enabledCaps.length}):**\n${enabledCaps.map(c => `• ${c}`).join('\n') || '• None'}\n\n**Disabled Capabilities (${disabledCaps.length}):**\n${disabledCaps.map(c => `• ${c}`).join('\n') || '• None'}`,
      data: { atlasState: state, sebaState },
    };
  }

  private async handleHealthCheck(command: ParsedCommand): Promise<CommandResult> {
    const state = atlas.getState();
    
    // Run diagnostic checks
    const checks: { name: string; status: 'pass' | 'warn' | 'fail'; detail: string }[] = [];
    
    // Check database connectivity
    try {
      const { error } = await supabase.from('brain_events').select('id').limit(1);
      checks.push({
        name: 'Database',
        status: error ? 'fail' : 'pass',
        detail: error ? error.message : 'Connected',
      });
    } catch {
      checks.push({ name: 'Database', status: 'fail', detail: 'Unreachable' });
    }
    
    // Check SEBA status
    const sebaState = sebaAgent.getState();
    checks.push({
      name: 'SEBA Agent',
      status: state.capabilities.seba?.enabled ? 'pass' : 'warn',
      detail: state.capabilities.seba?.enabled ? `Active (${sebaState.current_phase})` : 'Disabled',
    });
    
    // Check free tier usage
    const { data: usage } = await supabase
      .from('lovable_ai_usage')
      .select('calls_used')
      .eq('date', new Date().toISOString().split('T')[0])
      .maybeSingle();
    
    const callsUsed = usage?.calls_used || 0;
    checks.push({
      name: 'Daily Quota',
      status: callsUsed >= 50 ? 'fail' : callsUsed >= 40 ? 'warn' : 'pass',
      detail: `${callsUsed}/50 calls (${Math.max(0, 50 - callsUsed)} remaining)`,
    });
    
    // Check pending approvals
    checks.push({
      name: 'Pending Approvals',
      status: state.pendingApprovals > 5 ? 'warn' : 'pass',
      detail: `${state.pendingApprovals} pending`,
    });

    const statusIcon = (s: string) => s === 'pass' ? '✓' : s === 'warn' ? '⚠' : '✗';

    return {
      success: true,
      message: `🩺 **Health Diagnostic**\n\n${checks.map(c => `${statusIcon(c.status)} **${c.name}:** ${c.detail}`).join('\n')}\n\n**Overall Health:** ${state.systemHealth}%`,
      data: { checks, health: state.systemHealth },
    };
  }

  private async handleProposalAction(command: ParsedCommand): Promise<CommandResult> {
    const { action } = command.entities;
    
    // Handle "show pending proposals"
    if (action === 'check') {
      const { data: proposals } = await supabase
        .from('evolution_proposals')
        .select('id, title, target_system, confidence, summary, created_at')
        .eq('status', 'pending_review')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!proposals || proposals.length === 0) {
        return {
          success: true,
          message: '📋 **Pending Proposals**\n\nNo proposals awaiting review.\n\nRun **"run evolution cycle"** to generate new proposals.',
        };
      }

      return {
        success: true,
        message: `📋 **Pending Proposals** (${proposals.length})\n\n${proposals.map(p => 
          `• **${p.title}**\n  Target: ${p.target_system} | Confidence: ${Math.round((p.confidence || 0) * 100)}%`
        ).join('\n\n')}`,
        data: proposals,
        suggestions: ['approve pending proposals', 'reject proposals'],
      };
    }

    const pendingActions = atlas.getPendingActions();

    if (pendingActions.length === 0) {
      return {
        success: true,
        message: 'No pending proposals to process.',
        suggestions: ['run evolution cycle', 'show status'],
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

  private async handleMemoryOps(command: ParsedCommand): Promise<CommandResult> {
    const { action, query, limit = 10 } = command.entities;

    if (action === 'query') {
      try {
        let queryBuilder = supabase
          .from('brain_memories')
          .select('id, content, memory_type, confidence, created_at')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (query) {
          queryBuilder = queryBuilder.ilike('content', `%${query}%`);
        }

        const { data: memories, error } = await queryBuilder;

        if (error) throw error;

        if (!memories || memories.length === 0) {
          return {
            success: true,
            message: `🧠 **Memory Query**\n\n${query ? `No memories found matching "${query}".` : 'No recent memories found.'}`,
          };
        }

        return {
          success: true,
          message: `🧠 **Memories** (${memories.length})\n\n${memories.map(m => 
            `• **${m.memory_type}** (confidence: ${Math.round((m.confidence || 0) * 100)}%)\n  ${(m.content || '').slice(0, 80)}...`
          ).join('\n\n')}`,
          data: memories,
        };
      } catch (err) {
        return {
          success: false,
          message: 'Failed to query memories.',
        };
      }
    }

    if (action === 'consolidate') {
      // Trigger memory consolidation
      try {
        await supabase.from('brain_events').insert({
          module: 'brain',
          event_type: 'memory_consolidation_requested',
          data: { requested_by: 'atlas_command' },
          outcome: 'pending',
        });

        return {
          success: true,
          message: '✓ Memory consolidation requested. The system will merge redundant entries during the next background cycle.',
        };
      } catch {
        return {
          success: false,
          message: 'Failed to request memory consolidation.',
        };
      }
    }

    if (action === 'prune') {
      // Count low-value memories (using confidence as value proxy)
      const { count } = await supabase
        .from('brain_memories')
        .select('*', { count: 'exact', head: true })
        .lt('confidence', 0.3);

      return {
        success: true,
        message: `🧹 **Memory Prune**\n\n${count || 0} low-value memories identified.\n\n⚠️ Automatic pruning is disabled for safety. Contact an operator to execute cleanup.`,
        data: { lowValueCount: count },
      };
    }

    return {
      success: false,
      message: 'Unknown memory operation.',
      suggestions: ['show memories', 'query memories', 'consolidate memories'],
    };
  }

  private async handleBrainControl(command: ParsedCommand): Promise<CommandResult> {
    try {
      // Get brain stats
      const { count: memoryCount } = await supabase
        .from('brain_memories')
        .select('*', { count: 'exact', head: true });

      const { count: eventCount } = await supabase
        .from('brain_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const { data: recentEvents } = await supabase
        .from('brain_events')
        .select('event_type, outcome')
        .order('created_at', { ascending: false })
        .limit(5);

      const outcomes = recentEvents?.reduce((acc, e) => {
        acc[e.outcome] = (acc[e.outcome] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return {
        success: true,
        message: `🧠 **Brain Status**\n\n**Memory Store:**\n• Total Memories: ${memoryCount?.toLocaleString() || 0}\n\n**Last 24 Hours:**\n• Events: ${eventCount || 0}\n• Success: ${outcomes.success || 0}\n• Failures: ${outcomes.fail || 0}\n\n**Recent Activity:**\n${recentEvents?.map(e => `• ${e.event_type} [${e.outcome}]`).join('\n') || '• No recent events'}`,
        data: { memoryCount, eventCount, outcomes },
      };
    } catch (err) {
      return {
        success: false,
        message: 'Failed to fetch brain status.',
      };
    }
  }

  private async handleAutoblog(command: ParsedCommand): Promise<CommandResult> {
    const { action } = command.entities;

    if (action === 'check') {
      try {
        const { data: queue } = await supabase
          .from('autoblog_queue')
          .select('id, topic, channel, status, created_at')
          .in('status', ['pending', 'scheduled', 'processing'])
          .order('created_at', { ascending: true })
          .limit(10);

        if (!queue || queue.length === 0) {
          return {
            success: true,
            message: '📝 **Autoblog Queue**\n\nNo pending posts in the queue.',
          };
        }

        return {
          success: true,
          message: `📝 **Autoblog Queue** (${queue.length})\n\n${queue.map(q => 
            `• **${q.topic || 'Untitled'}**\n  Channel: ${q.channel} | Status: ${q.status}`
          ).join('\n\n')}`,
          data: queue,
        };
      } catch {
        return {
          success: false,
          message: 'Failed to fetch autoblog queue.',
        };
      }
    }

    if (action === 'pause') {
      await atlas.toggleCapability('dream_eater', false, 'user');
      return {
        success: true,
        message: '✓ Autoblog paused. No new posts will be generated.',
      };
    }

    if (action === 'resume') {
      await atlas.toggleCapability('dream_eater', true, 'user');
      return {
        success: true,
        message: '✓ Autoblog resumed. Post generation will continue.',
      };
    }

    return {
      success: false,
      message: 'Unknown autoblog operation.',
      suggestions: ['check autoblog queue', 'pause autoblog', 'resume autoblog'],
    };
  }

  private handleClearSession(): CommandResult {
    return {
      success: true,
      message: '✓ Session cleared. Ready for new commands.',
      data: { action: 'clear_session' },
    };
  }

  private handleVersionInfo(): CommandResult {
    return {
      success: true,
      message: `🔮 **Atlas Control Plane**\n\n**Codename:** ARCHITECT\n\n**CMPSBL Substrate:**\n• 21 Core Modules\n• 200 Synergy Pipelines\n• 6-Layer Architecture\n• Bounded Autonomy Framework\n\n**Capabilities:**\n• Conversational Control\n• SEBA Evolution\n• Continuous Learning\n• Intent Mesh\n• Full Audit Logging`,
    };
  }

  private handleHelp(): CommandResult {
    return {
      success: true,
      message: `🎛️ **Atlas Command Reference**\n\n**SEBA Control:**\n• "activate SEBA" / "activate SEBA in advisory mode"\n• "deactivate SEBA"\n• "run evolution cycle"\n\n**Mode Control:**\n• "set advisory mode" / "set autonomous mode"\n\n**Capabilities:**\n• "enable CLM" / "disable dream"\n\n**Observability:**\n• "show status" / "show metrics"\n• "show Ripple logs" / "show brain logs"\n• "check usage"\n\n**Proposals:**\n• "show pending proposals"\n• "approve pending proposals"\n• "reject proposals"\n\n**Memory:**\n• "show memories" / "query memories [topic]"\n• "consolidate memories" / "prune memories"\n\n**Autoblog:**\n• "check autoblog queue"\n• "pause autoblog" / "resume autoblog"\n\n**Other:**\n• "health check" / "version"\n• "clear session"`,
      suggestions: ['show status', 'activate SEBA', 'show usage', 'help'],
    };
  }
}

// Singleton export
export const atlasInterpreter = new AtlasCommandInterpreter();
