/**
 * Terminal Command Executor
 * Handles parsing and execution of all substrate commands
 * v6.0.0 - Full-system audit completed 2026-01-27
 * 
 * 14 modules (13 core + inclusive) | 260+ commands | All handlers verified
 */

import { substrate, brain, decode, defense, nexus, vision, dream, system, modernizer, core, ripple, access, integration, cortex, inclusive } from '@/lib/substrate';
import { supabase } from '@/integrations/supabase/client';
import { ALL_COMMANDS, COMMAND_CATEGORIES, type CommandDefinition } from './TerminalCommands';
import { getRandomItem, PERSONALITY_RESPONSES } from './TerminalTypes';
import { resolveAlias, addAlias, removeAlias, formatAliasHelp } from './useTerminalAliases';
import { getMacro, createMacro, deleteMacro, formatMacroHelp, formatMacroDetail } from './useTerminalMacros';
import { scheduleCommand, cancelScheduled, clearScheduled, formatScheduledList, formatScheduleConfirmation, getPendingCommands } from './useTerminalScheduler';
import { getLocalAuditLog, formatAuditLog, getSessionStats, exportAuditLog } from './useTerminalAudit';
import { renderForMobile, getOptimalCharWidth } from './TerminalMobileRenderer';

// Mobile-first evolution log formatter (organism-focused, no implementation details)
function formatEvolutionLogForTerminal(): string {
  const charWidth = getOptimalCharWidth();
  const isMobile = charWidth < 50;
  
  // Evolution entries (v6.x.x public versioning)
  const entries = [
    {
      id: '014',
      date: '2026-01-30',
      pressures: [
        'Visibility into emergent behaviors',
        'Context for informed decisions',
        'Hypothetical threat analysis'
      ],
      responses: [
        'Synergy patterns documented',
        'Proposals self-descriptive',
        'Simulation channel emerged'
      ],
      capabilities: [
        'Pipelines observable',
        'Full proposal context',
        'Safe failure exploration'
      ]
    },
    {
      id: '013',
      date: '2026-01-29',
      pressures: [
        'Adapt to all screen sizes',
        'Sustainable resource governance',
        'Stronger isolation guarantees'
      ],
      responses: [
        'Rendering respects constraints',
        'Budget governance integral',
        'Circuit breakers crystallized'
      ],
      capabilities: [
        'Graceful adaptation',
        'Defined resource envelopes',
        'Contained failures'
      ]
    }
  ];
  
  let output = `
┌─ LIVING EVOLUTION LOG ────────────────`;
  
  if (isMobile) {
    output += `
│ v6.x.x — Human Compatibility Era
│ Major versions only (public)
└───────────────────────────────────────`;
  } else {
    output += `─────────────────────┐
│ v6.x.x — Human Compatibility Era                             │
│ One living log per major version. Patches abstracted.        │
└──────────────────────────────────────────────────────────────┘`;
  }
  
  for (const entry of entries) {
    if (isMobile) {
      // Compact mobile format
      output += `

┌─ Evolution ${entry.id} ─ ${entry.date} ───
│
│ PRESSURES:`;
      for (const p of entry.pressures) {
        output += `
│  ▸ ${p}`;
      }
      output += `
│
│ RESPONSES:`;
      for (const r of entry.responses) {
        output += `
│  ▸ ${r}`;
      }
      output += `
│
│ CAPABILITIES:`;
      for (const c of entry.capabilities) {
        output += `
│  ▸ ${c}`;
      }
      output += `
└─────────────────────────────────────`;
    } else {
      // Full desktop format
      output += `

┌─ Evolution ${entry.id} ─ ${entry.date} ──────────────────────────────────────
│
│ ◆ OBSERVED PRESSURES
│   ${entry.pressures.join('\n│   ')}
│
│ ◆ LEARNED RESPONSES
│   ${entry.responses.join('\n│   ')}
│
│ ◆ RESULTING CAPABILITIES
│   ${entry.capabilities.join('\n│   ')}
│
└──────────────────────────────────────────────────────────────`;
    }
  }
  
  output += `

┌─ Archived Versions ──────────────────`;
  if (isMobile) {
    output += `
│ v5.x.x: Stabilization Era
│ v4.x.x: Kernel Architecture
│ v3.x.x: Resilience Architecture
│ v1-2.x.x: Genesis & Formation
└───────────────────────────────────────`;
  } else {
    output += `─────────────────────┐
│ v5.x.x — Full System Stabilization (frozen)                  │
│ v4.x.x — Kernel Architecture (frozen)                        │
│ v3.x.x — Resilience Architecture (frozen)                    │
│ v1-2.x.x — Genesis & Formation (frozen)                      │
└──────────────────────────────────────────────────────────────┘`;
  }
  
  return output;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  data?: unknown;
}

// Resolve short Plan ID (8+ chars) to full UUID
async function resolveShortPlanId(shortId: string): Promise<string | null> {
  // If it's already a full UUID (36 chars with dashes), return as-is
  if (shortId.length === 36 && shortId.includes('-')) {
    return shortId;
  }
  
  // Query for plans that start with this prefix
  try {
    const { data: plans } = await supabase
      .from('substrate_upgrade_plans')
      .select('id')
      .ilike('id', `${shortId}%`)
      .neq('status', 'deleted')
      .limit(2);
    
    if (!plans || plans.length === 0) {
      return null;
    }
    
    if (plans.length > 1) {
      console.warn(`Multiple plans match prefix '${shortId}', using first match`);
    }
    
    return plans[0].id;
  } catch (e) {
    console.error('Failed to resolve short plan ID:', e);
    return null;
  }
}

// Parse command arguments
function parseArgs(command: string): { base: string; args: string[] } {
  const parts = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  const base = parts[0]?.toLowerCase() || '';
  const args = parts.slice(1).map(arg => arg.replace(/^"(.*)"$/, '$1'));
  return { base, args };
}

// Generate help text for a specific module
function generateModuleHelp(module: keyof typeof COMMAND_CATEGORIES): string {
  const cat = COMMAND_CATEGORIES[module];
  const maxCmdLen = Math.max(...cat.commands.map(c => c.command.length));
  
  let output = `\n┌─ ${cat.label} MODULE ─────────────────────────────────────────\n│\n`;
  
  for (const cmd of cat.commands) {
    const paddedCmd = cmd.command.padEnd(maxCmdLen + 2);
    const opMarker = cmd.requiresOperator ? '⚡' : '○';
    const argsHint = cmd.args ? ` ${cmd.args}` : '';
    output += `│ ${opMarker} ${paddedCmd} ∷ ${cmd.description}${argsHint}\n`;
  }
  
  output += `│\n│ ⚡ = Operator required  ○ = Observer accessible\n`;
  output += `└──────────────────────────────────────────────────────────`;
  
  return output;
}

// Generate full help text with all modules
function generateFullHelp(): string {
  const modules = Object.keys(COMMAND_CATEGORIES) as Array<keyof typeof COMMAND_CATEGORIES>;
  const totalCommands = ALL_COMMANDS.length;
  
  let output = `
┌─────────────────────────────────────────────────────────────┐
│         SUBSTRATE OS v6.3.1 — COMMAND REFERENCE             │
├─────────────────────────────────────────────────────────────┤
│  Total commands: ${totalCommands.toString().padEnd(5)}    Modules: 15                     │
│  Architecture: 14-module + CLM                              │
│                                                             │
│  Quick navigation:                                          │
│    help <module>   Show module commands                     │
│    <cmd> --help    Show command usage                       │
└─────────────────────────────────────────────────────────────┘

┌─ MODULE INDEX ──────────────────────────────────────────────┐
│                                                             │
│  ⬢ KERNEL LAYER                                             │
│    core         (${COMMAND_CATEGORIES.core.commands.length.toString().padStart(2)} cmds)  Scheduler, lifecycle, routing      │
│    ripple       (${COMMAND_CATEGORIES.ripple.commands.length.toString().padStart(2)} cmds)  Message bus, pub/sub, queues       │
│    access       (${COMMAND_CATEGORIES.access.commands.length.toString().padStart(2)} cmds)  API keys, billing, metering        │
│                                                             │
│  ◈ COGNITIVE LAYER                                          │
│    brain        (${COMMAND_CATEGORIES.brain.commands.length.toString().padStart(2)} cmds)  Memory, learning, reflection       │
│    decode       (${COMMAND_CATEGORIES.decode.commands.length.toString().padStart(2)} cmds)  Interpretation, intent parsing     │
│    dream        (${COMMAND_CATEGORIES.dream.commands.length.toString().padStart(2)} cmds)  Dream-Eater, mutation, cycles      │
│                                                             │
│  ◆ OPERATIONS LAYER                                         │
│    defense      (${COMMAND_CATEGORIES.defense.commands.length.toString().padStart(2)} cmds)  Security, threats, anomalies       │
│    nexus        (${COMMAND_CATEGORIES.nexus.commands.length.toString().padStart(2)} cmds)  AI routing, multi-provider         │
│    vision       (${COMMAND_CATEGORIES.vision.commands.length.toString().padStart(2)} cmds)  Observability, metrics, logs       │
│                                                             │
│  ◇ ADMIN LAYER                                              │
│    system       (${COMMAND_CATEGORIES.system.commands.length.toString().padStart(2)} cmds)  Orchestration, heal, backup        │
│    modernizer   (${COMMAND_CATEGORIES.modernizer.commands.length.toString().padStart(2)} cmds)  Evolution engine, upgrades         │
│    inclusive    (${COMMAND_CATEGORIES.inclusive.commands.length.toString().padStart(2)} cmds)  Accessibility, WCAG scanning       │
│                                                             │
│  ★ ORCHESTRATOR LAYER                                       │
│    cortex       (${COMMAND_CATEGORIES.cortex.commands.length.toString().padStart(2)} cmds)  Policy intent, PAAEL loop          │
│    integration  (${COMMAND_CATEGORIES.integration.commands.length.toString().padStart(2)} cmds)  Enterprise adapters, discovery     │
│                                                             │
│  ◉ CONSTANT LEARNING MODE (CLM)                             │
│    clm          (10 cmds)  Autonomous learning, curriculum     │
│                                                             │
│  ⚙ META COMMANDS                                            │
│    meta         (${COMMAND_CATEGORIES.meta.commands.length.toString().padStart(2)} cmds)  Terminal controls, help, aliases    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ QUICK COMMANDS ────────────────────────────────────────────┐
│                                                             │
│  system.status      Global status check                     │
│  system.health      Full health report                      │
│  vision.pulse       Quick heartbeat                         │
│  brain.reflect      Trigger reflection                      │
│  dream.cycle        Dream-Eater cycle                       │
│  system.heal        Self-healing                            │
│  cortex.status      Orchestrator mode                       │
│  clm.status         CLM status & budget                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ EVOLUTION CYCLE v0.7.7 ────────────────────────────────────┐
│                                                             │
│  ┌─ COGNITIVE SCAN ─────────────────────────────────────┐   │
│  │  modernizer.scan              Full systems scan       │   │
│  │  modernizer.scan --explain    Human-readable output   │   │
│  │  modernizer.scan --llm-report LLM reasoning included  │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ LIFECYCLE ──────────────────────────────────────────┐   │
│  │  1. modernizer.scan           Creates plan            │   │
│  │  2. modernizer.evolve shadow  Apply to shadow env     │   │
│  │  3. modernizer.evolve production  Promote (needs 2)   │   │
│  │  4. modernizer.evolve verify  Complete cycle          │   │
│  │     modernizer.evolve abort   Cancel active run       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ CIRCUIT BREAKER ────────────────────────────────────┐   │
│  │  modernizer.circuit status    Check circuit state     │   │
│  │  modernizer.circuit reset     Close circuit           │   │
│  │  modernizer.autonomy status   View autonomy mode      │   │
│  │  modernizer.autonomy set <m>  off|advisory|governed   │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ CLM (CONSTANT LEARNING MODE) v6.7.0 ───────────────────────┐
│                                                             │
│  clm.status          Status, budget, queue size             │
│  clm.enable          Enable autonomous learning             │
│  clm.disable         Disable autonomous learning            │
│  clm.cycle           Run a manual CLM cycle                 │
│  clm.budget          View daily budget allocation           │
│  clm.kill_switch     Activate/deactivate kill switch        │
│  clm.topics          View topic bank with mastery           │
│  clm.add_topic       Add custom topic to bank               │
│  clm.review_queue    View spaced repetition queue           │
│  clm.next_review     Get next review item                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ TERMINAL FEATURES v5.0.0 ──────────────────────────────────┐
│                                                             │
│  alias               Shorthand commands                     │
│  macro               Multi-command scripts (@name)          │
│  schedule            Delayed execution (schedule 5m cmd)    │
│  watch               Periodic execution (watch 10s cmd)     │
│  audit               Session audit trail & stats            │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─ KEYBOARD SHORTCUTS ────────────────────────────────────────┐
│                                                             │
│  ↑/↓                 Navigate command history               │
│  Tab                 Autocomplete command                   │
│  Ctrl+C              Clear current input                    │
│  Ctrl+L              Clear terminal                         │
│  1-4                 Execute smart suggestions              │
│                                                             │
└─────────────────────────────────────────────────────────────┘`;

  return output;
}

// Execute a substrate command
export async function executeCommand(
  command: string, 
  isOperator: boolean
): Promise<ExecutionResult> {
  const { base, args } = parseArgs(command);
  
  // Meta commands
  if (base === 'help') {
    const module = args[0]?.toLowerCase();
    if (module && module in COMMAND_CATEGORIES) {
      return { success: true, output: generateModuleHelp(module as keyof typeof COMMAND_CATEGORIES) };
    }
    return { success: true, output: generateFullHelp() };
  }

  if (base === 'clear') {
    return { success: true, output: '__CLEAR__' };
  }

  if (base === 'whoami') {
    // Fetch actual identity from Access module for unified role display
    let roleDisplay = isOperator ? 'OPERATOR (full access)' : 'OBSERVER (read-only)';
    let identityLine = '';
    let subRole = 'observer';
    let devName = '';
    
    try {
      const identityResult = await access.identity() as any;
      if (identityResult?.success) {
        subRole = identityResult.substrate_role || 'observer';
        devName = identityResult.developer?.display_name || '';
        
        if (subRole === 'governor') {
          roleDisplay = 'GOVERNOR (full system authority)';
        } else if (subRole === 'operator') {
          roleDisplay = 'OPERATOR (full access)';
        } else {
          roleDisplay = 'OBSERVER (read-only)';
        }
        
        if (devName) {
          identityLine = `│  Identity: ${devName}\n│  Role: ${subRole.toUpperCase()}\n`;
        }
      }
    } catch (e) {
      console.log('Identity fetch failed, using fallback');
    }
    
    // If no identity from API, try to get from Supabase directly
    if (!devName) {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Check admin role directly
          const { data: isAdmin } = await supabase.rpc('has_role_text', {
            _user_id: user.id,
            _role: 'admin'
          });
          if (isAdmin === true) {
            subRole = 'governor';
            roleDisplay = 'GOVERNOR (full system authority)';
          }
          
          // Get developer profile
          const { data: dev } = await supabase
            .from('access_developers')
            .select('display_name')
            .eq('user_id', user.id)
            .maybeSingle();
          
          devName = dev?.display_name || user.email?.split('@')[0] || 'User';
          identityLine = `│  Identity: ${devName}\n│  Role: ${subRole.toUpperCase()}\n│  Email: ${user.email}\n`;
        }
      } catch (e) {
        // Fallback to basic display
      }
    }
    
    const identity = `
┌─ SUBSTRATE IDENTITY ─────────────────────────────────────────
│ 
│  ██████╗ ███████╗     Cognitive Operating System
│  ██╔═══╝ ██╔════╝     promptfluid® Substrate v6.0.0
│  ██║     ███████╗     
│  ██║     ╚════██║     Environment: Lovable Cloud
│  ██████╗ ███████║     Status: OPERATIONAL
│  ╚═════╝ ╚══════╝
│ 
│  14-Module Architecture — Full AI Operating System
│  Where Dreams Come To Adapt
│  
${identityLine}│  Mode: ${roleDisplay}
│  
│  ┌─ KERNEL LAYER ────────────────────────────────────────────
│  │  core://       scheduler, lifecycle, routing
│  │  ripple://     message bus, pub/sub, queues
│  │  access://     API keys, billing, metering
│  │
│  ├─ COGNITION LAYER ─────────────────────────────────────────
│  │  brain://      memory, learning, reflection
│  │  decode://     interpretation, intent parsing
│  │  dream://      dream-eater, mutation
│  │
│  ├─ OPERATIONS LAYER ────────────────────────────────────────
│  │  defense://    security, threats, anomalies
│  │  nexus://      AI routing, multi-provider
│  │  vision://     observability, metrics
│  │  integration://enterprise adapters, LLM governance
│  │
│  ├─ ADMIN LAYER ─────────────────────────────────────────────
│  │  system://     orchestration, lifecycle, heal
│  │  modernizer:// upgrades, codebase evolution
│  │  inclusive://  accessibility, human compatibility
│  │
│  ├─ ORCHESTRATOR LAYER ──────────────────────────────────────
│  │  cortex://     policy intent, manual mode
│  │
│  └────────────────────────────────────────────────────────────
│  
│  Terminal v6.0.0: aliases, macros, NLP, watch mode, audit
│  14 modules | 260+ commands | health: 100%
│  promptfluid® — where dreams come to adapt
│  
└──────────────────────────────────────────────────────────────`;
    return { success: true, output: identity };
  }

  if (base === 'history') {
    return { success: true, output: '__HISTORY__' };
  }

  if (base === 'export') {
    return { success: true, output: '__EXPORT__' };
  }

  if (base === 'theme') {
    const theme = args[0] || 'toggle';
    return { success: true, output: `__THEME__${theme}` };
  }

  // v5.0.0: Alias commands
  if (base === 'alias') {
    if (args[0] === 'add' && args[1] && args[2]) {
      const success = addAlias(args[1], args.slice(2).join(' '));
      return {
        success,
        output: success 
          ? `◉ Alias created: ${args[1]} → ${args.slice(2).join(' ')}`
          : `▓ ERROR: Cannot override builtin alias '${args[1]}'`,
      };
    }
    if (args[0] === 'remove' && args[1]) {
      const success = removeAlias(args[1]);
      return {
        success,
        output: success 
          ? `◉ Alias removed: ${args[1]}`
          : `▓ ERROR: Alias '${args[1]}' not found or is builtin`,
      };
    }
    return { success: true, output: formatAliasHelp() };
  }

  // v5.0.0: Macro commands
  if (base === 'macro') {
    if (args[0] === 'list' || args.length === 0) {
      return { success: true, output: formatMacroHelp() };
    }
    if (args[0] === 'show' && args[1]) {
      return { success: true, output: formatMacroDetail(args[1]) };
    }
    if (args[0] === 'create' && args[1]) {
      // Expect format: macro create <name> "cmd1; cmd2; cmd3" "description"
      const name = args[1];
      const commandStr = args[2] || '';
      const commands = commandStr.split(';').map(c => c.trim()).filter(Boolean);
      const description = args[3] || 'Custom macro';
      
      if (commands.length === 0) {
        return { 
          success: false, 
          output: '▓ ERROR: No commands provided\n  Usage: macro create <name> "cmd1; cmd2; cmd3" "description"',
        };
      }
      
      const success = createMacro(name, description, commands);
      return {
        success,
        output: success 
          ? `◉ Macro created: @${name} with ${commands.length} commands`
          : `▓ ERROR: Cannot override builtin macro '${name}'`,
      };
    }
    if (args[0] === 'delete' && args[1]) {
      const success = deleteMacro(args[1]);
      return {
        success,
        output: success 
          ? `◉ Macro deleted: @${args[1]}`
          : `▓ ERROR: Macro '${args[1]}' not found or is builtin`,
      };
    }
    if (args[0] === 'run' && args[1]) {
      const macro = getMacro(args[1]);
      if (!macro) {
        return { success: false, output: `▓ ERROR: Macro '${args[1]}' not found` };
      }
      // Return special marker for macro execution
      return { success: true, output: `__MACRO_RUN__${args[1]}` };
    }
    return { success: true, output: formatMacroHelp() };
  }

  // v5.0.0: Schedule commands
  if (base === 'schedule') {
    if (args[0] === 'list' || args.length === 0) {
      return { success: true, output: formatScheduledList() };
    }
    if (args[0] === 'cancel' && args[1]) {
      // Find matching schedule by prefix
      const pending = getPendingCommands();
      const match = pending.find(s => s.id.startsWith(args[1]) || s.id.slice(0, 10) === args[1]);
      if (match) {
        cancelScheduled(match.id);
        return { success: true, output: `◉ Scheduled command cancelled: ${match.id.slice(0, 12)}` };
      }
      return { success: false, output: `▓ ERROR: Schedule '${args[1]}' not found` };
    }
    if (args[0] === 'clear') {
      const count = clearScheduled();
      return { success: true, output: `◉ Cancelled ${count} scheduled command(s)` };
    }
    // schedule <delay> <command>
    if (args[0] && args[1]) {
      const delay = args[0];
      const cmd = args.slice(1).join(' ');
      try {
        const executeAt = new Date(Date.now() + (parseInt(delay) * 1000 || 5000));
        return { 
          success: true, 
          output: `__SCHEDULE__${delay}__${cmd}`,
        };
      } catch (e) {
        return { success: false, output: `▓ ERROR: Invalid delay format: ${delay}` };
      }
    }
    return { success: true, output: formatScheduledList() };
  }

  // v5.0.0: Watch commands
  if (base === 'watch') {
    if (args[0] === 'list' || args.length === 0) {
      return { success: true, output: '__WATCH_LIST__' };
    }
    if (args[0] === 'stop') {
      return { success: true, output: `__WATCH_STOP__${args[1] || 'all'}` };
    }
    // watch <interval> <command>
    if (args[0] && args[1]) {
      const interval = args[0];
      const cmd = args.slice(1).join(' ');
      return { success: true, output: `__WATCH_START__${interval}__${cmd}` };
    }
    return { success: true, output: '__WATCH_LIST__' };
  }

  // v5.0.0: Audit commands
  if (base === 'audit') {
    if (args[0] === 'stats') {
      const stats = getSessionStats();
      return {
        success: true,
        output: `
┌─ SESSION STATISTICS ─────────────────────────────────────────
│
│  Session ID:    ${stats.session_id.substring(0, 20)}...
│  Commands Run:  ${stats.command_count}
│  Success Rate:  ${stats.success_rate.toFixed(1)}%
│  Total Time:    ${(stats.total_duration_ms / 1000).toFixed(1)}s
│  Avg Duration:  ${stats.avg_duration_ms.toFixed(0)}ms
│  Started:       ${stats.started_at.toLocaleTimeString()}
│
└──────────────────────────────────────────────────────────────`,
      };
    }
    if (args[0] === 'export') {
      return { success: true, output: `__AUDIT_EXPORT__` };
    }
    const limit = args[0] ? parseInt(args[0]) : 20;
    return { success: true, output: formatAuditLog(getLocalAuditLog(), limit) };
  }

  // Check if command requires operator
  const cmdDef = ALL_COMMANDS.find(c => c.command.toLowerCase() === base);
  if (cmdDef?.requiresOperator && !isOperator) {
    return { 
      success: false, 
      output: `▓ ACCESS DENIED: Operator privileges required for '${base}'\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}` 
    };
  }

  // Execute substrate commands
  try {
    let result;

    // BRAIN module
    if (base === 'brain.status') {
      result = await brain.status();
    } else if (base === 'brain.query') {
      result = await brain.query(args[0] || '', args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'brain.remember') {
      result = await brain.remember(args[0] || '', args[1] || 'fact', args[2] ? parseFloat(args[2]) : undefined);
    } else if (base === 'brain.recall') {
      result = await brain.recall(args[0] || '', args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'brain.reflect') {
      result = await brain.reflect();
    } else if (base === 'brain.dream') {
      result = await brain.dream();
    } else if (base === 'brain.reinforce') {
      result = await brain.reinforce(args[0] || '', args[1] ? parseFloat(args[1]) : undefined);
    } else if (base === 'brain.synthesize') {
      result = await brain.synthesize();
    } else if (base === 'brain.optimize') {
      result = await brain.optimize();
    } else if (base === 'brain.deep_think') {
      result = await brain.deepThink(args[0] || '', args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'brain.hypothesis_test') {
      result = await brain.hypothesisTest(args[0] || '');
    } else if (base === 'brain.cognitive_cycle') {
      result = await brain.cognitiveCycle();
    } else if (base === 'brain.continuous_learn') {
      result = await brain.continuousLearn(args[0] === 'true');
    } else if (base === 'brain.graph_build') {
      result = await brain.graphBuild();
    } else if (base === 'brain.graph_summary') {
      result = await brain.graphSummary();
    } else if (base === 'brain.graph') {
      const inspect = args.includes('--inspect');
      const stats = args.includes('--stats');
      const exportGraph = args.includes('--export');
      const page = args.find(a => !a.startsWith('--') && /^\d+$/.test(a));
      result = await substrate.invoke({ 
        module: 'brain', 
        action: 'graph', 
        payload: { inspect, stats, export: exportGraph, page: page ? parseInt(page) : undefined } 
      });
    } else if (base === 'brain.curiosity') {
      result = await brain.curiosity();
    } else if (base === 'brain.explore') {
      result = await brain.explore(args[0] || '');
    } else if (base === 'brain.patterns') {
      result = await brain.patterns();
    } else if (base === 'brain.session_reflection') {
      result = await brain.sessionReflection(args[0] ? parseInt(args[0]) : undefined);
    } else if (base === 'brain.coherence_check') {
      result = await brain.coherenceCheck(args[0] as 'standard' | 'deep' | undefined);
    } else if (base === 'brain.forecast') {
      result = await brain.forecast(args[0], args[1]);
    }

    // DECODE module
    else if (base === 'decode.status') {
      result = await decode.status();
    } else if (base === 'decode.chat') {
      result = await decode.chat(args[0] || '');
    } else if (base === 'decode.intent') {
      result = await decode.intent(args[0] || '');
    } else if (base === 'decode.dream') {
      result = await decode.dream();
    } else if (base === 'decode.propose') {
      result = await decode.propose(args[0] || '');
    } else if (base === 'decode.learn') {
      result = await decode.learn(args[0] || '', args[1]);
    }

    // DEFENSE module
    else if (base === 'defense.status') {
      result = await defense.status();
    } else if (base === 'defense.analyze') {
      result = await defense.analyze({}, args[0]);
    } else if (base === 'defense.reputation') {
      result = await defense.reputation(args[0] || '');
    } else if (base === 'defense.ip_intel') {
      result = await defense.ipIntel(args[0] || '', args[1] === 'true');
    } else if (base === 'defense.anomaly') {
      result = await defense.anomaly(args[0] as '1h' | '6h' | '24h' | undefined);
    } else if (base === 'defense.anomaly_probe') {
      result = await defense.anomalyProbe(args[0] ? parseInt(args[0]) : undefined);
    } else if (base === 'defense.posture') {
      result = await defense.posture();
    } else if (base === 'defense.limits') {
      result = await defense.limits();
    } else if (base === 'defense.rules') {
      result = await defense.rules();
    }

    // NEXUS module
    else if (base === 'nexus.status') {
      result = await nexus.status();
    } else if (base === 'nexus.route') {
      result = await nexus.route(args[0] || '');
    } else if (base === 'nexus.text') {
      result = await nexus.text(args[0] || '', args[1]);
    } else if (base === 'nexus.image') {
      result = await nexus.image(args[0] || '', args[1]);
    } else if (base === 'nexus.providers') {
      result = await nexus.providers();
    } else if (base === 'nexus.route_stats') {
      result = await nexus.routeStats();
    } else if (base === 'nexus.test') {
      result = await nexus.text(args[0] || 'Hello, substrate.', undefined);
    } else if (base === 'nexus.pulse') {
      result = await substrate.invoke({ module: 'nexus', action: 'pulse' });
    } else if (base === 'nexus.analytics') {
      result = await substrate.invoke({ module: 'nexus', action: 'analytics' });
    }

    // VISION module
    else if (base === 'vision.status') {
      result = await vision.status();
    } else if (base === 'vision.health') {
      result = await vision.health();
    } else if (base === 'vision.pulse') {
      result = await vision.pulse();
    } else if (base === 'vision.metrics') {
      result = await vision.metrics();
    } else if (base === 'vision.logs') {
      result = await vision.logs(args[0] as any, args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'vision.alert') {
      result = await vision.alert(args[0] as any || 'info', args.slice(1).join(' ') || 'Terminal alert');
    } else if (base === 'vision.audit') {
      result = await vision.audit(args[0], args[1]);
    } else if (base === 'vision.dashboard') {
      result = await vision.dashboard();
    } else if (base === 'vision.trace') {
      result = await vision.trace(args[0]);
    } else if (base === 'vision.monitor') {
      result = await vision.monitor();
    } else if (base === 'vision.resilience') {
      result = await vision.resilience();
    } else if (base === 'vision.analytics') {
      result = await vision.analytics();
    } else if (base === 'vision.health_snapshot') {
      result = await vision.healthSnapshot();
    } else if (base === 'vision.introspection') {
      result = await vision.introspection();
    } else if (base === 'vision.quota') {
      result = await vision.quota();
    } else if (base === 'vision.dependency_map') {
      result = await vision.dependencyMap();
    } else if (base === 'vision.anomalies') {
      // Parse --window flag from args
      const windowArg = args.find(a => a.startsWith('--window'));
      const windowVal = windowArg ? windowArg.split('=')[1] || args[args.indexOf(windowArg) + 1] : '1h';
      const limit = args[0] && !args[0].startsWith('--') ? parseInt(args[0]) : 10;
      result = await substrate.invoke({ module: 'vision', action: 'anomalies', payload: { limit, window: windowVal } });
    } else if (base === 'vision.mode') {
      const newMode = args[0] as 'passive' | 'advisory' | 'operative' | undefined;
      result = await substrate.invoke({ module: 'vision', action: 'mode', payload: { mode: newMode } });
    } else if (base === 'vision.replay') {
      const window = args[0] || '1h';
      result = await substrate.invoke({ module: 'vision', action: 'replay', payload: { window } });
    } else if (base === 'vision.inspect') {
      const links = args.includes('--links');
      result = await substrate.invoke({ module: 'vision', action: 'inspect', payload: { links } });
    } else if (base === 'vision.diagnostics') {
      const full = args.includes('--full');
      result = await substrate.invoke({ module: 'vision', action: 'diagnostics', payload: { full } });
    }

    // DREAM module
    else if (base === 'dream.status') {
      result = await dream.status();
    } else if (base === 'dream.mood') {
      result = await dream.mood(args[0]);
    } else if (base === 'dream.cycle') {
      result = await dream.cycle();
    } else if (base === 'dream.consume') {
      result = await dream.consume(args[0] || '');
    } else if (base === 'dream.interpret') {
      result = await dream.interpret(args.join(' ') || '');
    } else if (base === 'dream.mutate') {
      result = await dream.mutate();
    } else if (base === 'dream.reflect') {
      result = await dream.reflect();
    } else if (base === 'dream.feed') {
      result = await substrate.invoke({ module: 'dream', action: 'feed', payload: { dream_content: args[0] || '', dream_type: args[1] || 'dream' } });
    } else if (base === 'dream.awaken') {
      result = await substrate.invoke({ module: 'dream', action: 'awaken' });
    } else if (base === 'dream.pulse') {
      result = await substrate.invoke({ module: 'dream', action: 'pulse' });
    } else if (base === 'dream.anomalies') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      const showResolved = args.includes('--resolved');
      result = await substrate.invoke({ module: 'dream', action: 'anomalies', payload: { limit, show_resolved: showResolved } });
    }

    // SYSTEM module
    else if (base === 'system.status') {
      result = await system.status();
    } else if (base === 'system.health') {
      result = await system.health();
    } else if (base === 'system.version') {
      result = await system.version();
    } else if (base === 'system.changelog' || base === 'system.evolution') {
      // Mobile-first evolution log display (organism-focused, no internals)
      const evolutionLog = formatEvolutionLogForTerminal();
      return { success: true, output: evolutionLog };
    } else if (base === 'system.config') {
      result = await system.config(args[0]);
    } else if (base === 'system.audit') {
      result = await system.audit();
    } else if (base === 'system.diagnostics') {
      const full = args.includes('--full');
      result = await substrate.invoke({ module: 'system', action: 'diagnostics', payload: { full } });
    } else if (base === 'system.resilience') {
      const role = args[0] as 'observer' | 'operator' | undefined;
      result = await system.resilience(role);
    } else if (base === 'system.heal') {
      result = await system.heal(args[0], args[1] === 'true');
    } else if (base === 'system.restart') {
      result = await system.restart(args[0]);
    } else if (base === 'system.backup') {
      result = await system.backup({ include_data: args[0] !== 'false' });
    } else if (base === 'system.restore') {
      result = await system.restore(args[0] || '', args[1] === 'true');
    } else if (base === 'system.restore_portable') {
      // Portable backup restore (governor only) - expects JSON input or file reference
      if (!isOperator) {
        return { success: false, output: '▓ ACCESS DENIED: system.restore_portable requires Governor role\n  Only governors can restore portable backups.' };
      }
      // Parse mode from args
      const dryRun = args.includes('--dry-run');
      const modeArg = args.find(a => a.startsWith('--mode='));
      const mode = modeArg ? modeArg.split('=')[1] as 'merge' | 'replace' : 'merge';
      
      // Check if JSON was provided (would be in first arg as parsed JSON string)
      const jsonArg = args.find(a => a.startsWith('{') || a === '--json');
      if (!jsonArg || jsonArg === '--json') {
        return { 
          success: false, 
          output: `▓ USAGE: system.restore_portable requires a JSON export package

┌─ PORTABLE BACKUP RESTORE ────────────────────────────────────
│
│  Usage:
│    system.restore_portable <json_file_content> [--dry-run] [--mode=merge|replace]
│
│  Options:
│    --dry-run      Validate without restoring
│    --mode=merge   Upsert rows (default)
│    --mode=replace Truncate tables first
│
│  For large backups, use the System panel in /os dashboard.
│  Upload the portable JSON file there for processing.
│
└──────────────────────────────────────────────────────────────`
        };
      }
      
      try {
        const exportPackage = JSON.parse(jsonArg);
        const res = await system.restorePortable({ export_package: exportPackage, dry_run: dryRun, mode });
        result = { success: !res.error, data: res.data, error: res.error?.message };
      } catch (e) {
        result = { success: false, error: `Invalid JSON: ${e instanceof Error ? e.message : 'Parse error'}` };
      }
    } else if (base === 'system.list_backups') {
      result = await system.listBackups();
    } else if (base === 'system.upgrade.propose') {
      const res = await system.upgrade.propose({ scope: args[0], notes: args.slice(1).join(' ') });
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'system.upgrade.list') {
      const res = await system.upgrade.listPlans();
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'system.upgrade.apply') {
      const res = await system.upgrade.applyPlan(args[0] || '');
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'system.upgrade.rollback') {
      const res = await system.upgrade.rollbackPlan(args[0] || '');
      result = { success: !res.error, data: res.data, error: res.error?.message };
    }
    // v5.6.0: Module Registry commands
    else if (base === 'system.modules') {
      const full = args.includes('--full');
      const health = args.includes('--health');
      const dag = args.includes('--dag');
      const roles = args.includes('--roles');
      const boot = args.includes('--boot');
      const inventory = args.includes('--inventory');
      result = await system.modules({ full, health, dag, roles, boot, inventory });
    } else if (base === 'system.module') {
      result = await system.module(args[0] || '');
    }

    // MODERNIZER module (via substrate)
    else if (base === 'modernizer.status') {
      result = await modernizer.status();
    } else if (base === 'modernizer.jobs') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      result = await modernizer.jobs(limit);
    }
    // ═══ EVOLUTION CYCLE v6.5.0 ═══
    else if (base === 'modernizer.evolve') {
      const { evolutionCycle } = await import('@/lib/substrate/evolution-cycle');
      
      // Parse target from args
      const targetArg = args[0]?.toLowerCase();
      const hasConfirm = args.includes('--confirm') || args.includes('-y');
      const depthArg = args.find(a => ['quick', 'standard', 'deep'].includes(a)) as 'quick' | 'standard' | 'deep' | undefined;
      
      let target: 'scan' | 'shadow' | 'production' | 'verify' | 'abort' | 'status' = 'scan';
      if (targetArg === 'shadow' || targetArg === 'apply_shadow') target = 'shadow';
      else if (targetArg === 'production' || targetArg === 'apply_production' || targetArg === 'prod') target = 'production';
      else if (targetArg === 'verify' || targetArg === 'test') target = 'verify';
      else if (targetArg === 'abort' || targetArg === 'cancel' || targetArg === 'delete') target = 'abort';
      else if (targetArg === 'status' || targetArg === 'state') target = 'status';
      
      const cycleResult = await evolutionCycle.evolve({
        target,
        depth: depthArg || 'standard',
        confirm_override: hasConfirm,
      });
      
      // Handle confirmation prompt
      if (cycleResult.requires_confirmation) {
        return {
          success: false,
          output: `
┌─ EVOLUTION CYCLE — CONFIRMATION REQUIRED ────────────────────
│
│  ⚠  An active evolution plan exists: ${cycleResult.existing_plan_id}
│
│  Running a new scan will DELETE the existing plan and
│  start a fresh Evolution Cycle.
│
│  To confirm override, run:
│    modernizer.evolve --confirm
│
│  To view current plan status:
│    modernizer.evolve status
│
│  To abort current plan:
│    modernizer.evolve abort
│
└──────────────────────────────────────────────────────────────`,
        };
      }
      
      // Format evolution result
      const phaseIcon = cycleResult.success ? '✓' : '✗';
      const phaseDisplay = cycleResult.phase.toUpperCase().replace('_', ' ');
      
      let output = `
┌─ EVOLUTION CYCLE ────────────────────────────────────────────
│
│  ${phaseIcon} Phase: ${phaseDisplay}
${cycleResult.plan_id ? `│  Plan ID: ${cycleResult.short_id} (${cycleResult.plan_id.substring(0, 20)}...)` : ''}
│
│  ${cycleResult.message}
│`;

      // Add scan results if available
      const data = cycleResult.data as any;
      if (data?.scan_results) {
        const sr = data.scan_results;
        output += `
│  ┌─ SCAN RESULTS ───────────────────────────────────────────
│  │  Modules scanned: ${sr.modules_scanned}
│  │  Improvements found: ${sr.improvements_found}
│  │  Risk level: ${sr.risk_level}
│  │  Health before: ${sr.health_before}%
│  └──────────────────────────────────────────────────────────`;
      }
      
      // Add verification results if available
      if (data?.verification) {
        const v = data.verification;
        output += `
│  ┌─ VERIFICATION ───────────────────────────────────────────
│  │  Tests run: ${v.tests_run}
│  │  Tests passed: ${v.tests_passed}
│  │  Health after: ${v.health_after}%
│  │  Health delta: ${v.health_delta >= 0 ? '+' : ''}${v.health_delta}%
│  └──────────────────────────────────────────────────────────`;
      }
      
      // Add next steps
      if (cycleResult.success && cycleResult.phase === 'planning') {
        output += `
│
│  Next steps:
│    1. modernizer.evolve shadow    — Apply to shadow environment
│    2. modernizer.evolve production — Promote to production
│    3. modernizer.evolve verify    — Run verification tests`;
      } else if (cycleResult.phase === 'shadow_applied') {
        output += `
│
│  Next step:
│    modernizer.evolve production   — Promote to production`;
      }
      
      output += `
│
└──────────────────────────────────────────────────────────────`;
      
      return { success: cycleResult.success, output };
    }
    else if (base === 'modernizer.scan') {
      // v0.7.7: Cognitive Systems Scan with options
      const hasExplain = args.includes('--explain');
      const hasLLMReport = args.includes('--llm-report');
      const hasDryRun = args.includes('--dry-run');
      
      // Import and execute the new scan pipeline
      try {
        const { modernizerScan, formatScanResult } = await import('@/lib/evolve/scan');
        const scanResult = await modernizerScan({
          explain: hasExplain,
          llm_report: hasLLMReport,
          dry_run: hasDryRun,
        });
        
        return {
          success: scanResult.plan_ready || scanResult.proposals.length === 0,
          output: formatScanResult(scanResult, { explain: hasExplain, llm_report: hasLLMReport, dry_run: hasDryRun }),
          data: scanResult,
        };
      } catch (err) {
        // Fallback to legacy scan if new pipeline not available
        const depth = args[0] as 'quick' | 'standard' | 'deep' | undefined;
        result = await modernizer.scan({ depth: depth || 'standard' });
      }
    // NOTE: modernizer.analyze is handled by Omega Observer Engine (see line ~1354)
    // Legacy handler removed to prevent duplicate handling
    } else if (base === 'modernizer.export') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: modernizer.export <job_id>' };
      }
      result = await modernizer.export(args[0]);
    } else if (base === 'modernizer.quota') {
      result = await modernizer.quota();
    } else if (base === 'modernizer.pulse') {
      result = await modernizer.pulse();
    } else if (base === 'modernizer.propose') {
      // Legacy: Generate upgrade proposal in shadow mode
      const scope = args[0] || 'all';
      const notes = args.slice(1).join(' ') || '';
      result = await modernizer.propose({ scope, notes });
    } else if (base === 'modernizer.plans') {
      // Forward to evolution cycle
      result = await modernizer.plans();
    } else if (base === 'modernizer.review') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.review <plan_id>' };
      }
      result = await modernizer.review(args[0]);
    } else if (base === 'modernizer.validate') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.validate <plan_id>' };
      }
      const res = await modernizer.validate(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.diff') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.diff <plan_id>' };
      }
      const res = await modernizer.diff(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.apply') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.apply <plan_id>\n\n  Workflow: proposed → shadow_applied → applied (production)' };
      }
      // Resolve short plan ID to full UUID
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'modernizer.plans' to list available plans.` };
      }
      const res = await modernizer.apply(planId);
      // Check both fetch error and success:false in response data
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Apply failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.apply_shadow') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.apply_shadow <plan_id>' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'modernizer.plans' to list available plans.` };
      }
      const res = await modernizer.applyShadow(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Shadow apply failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.test_shadow') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.test_shadow <plan_id>' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found` };
      }
      const res = await modernizer.testShadow(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Shadow test failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.apply_production') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.apply_production <plan_id>\n\n  Note: Plan must be in shadow_applied status first.' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found\n  Use 'modernizer.plans' to list available plans.` };
      }
      const res = await modernizer.applyProduction(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Production apply failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.rollback') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.rollback <plan_id>' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found` };
      }
      const res = await modernizer.rollback(planId);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Rollback failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.delete') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.delete <plan_id> [reason]' };
      }
      const planId = await resolveShortPlanId(args[0]);
      if (!planId) {
        return { success: false, output: `▓ ERROR: Plan '${args[0]}' not found` };
      }
      const res = await modernizer.delete(planId, args.slice(1).join(' ') || undefined);
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Delete failed';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.applied') {
      const res = await modernizer.applied();
      const data = res.data as any;
      if (res.error || (data && data.success === false)) {
        const errMsg = res.error?.message || data?.error_message || data?.error || 'Failed to fetch applied';
        result = { success: false, data: res.data, error: errMsg };
      } else {
        result = { success: true, data: res.data };
      }
    } else if (base === 'modernizer.archived') {
      result = await modernizer.archived();
    } else if (base === 'modernizer.implement') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Both archived_function and target_action required\n  Usage: modernizer.implement <archived_function> <target_action>\n  Example: modernizer.implement pf-brain-systems-reasoning brain.deep_think' };
      }
      result = await modernizer.implement(args[0], args[1]);
    } else if (base === 'modernizer.refresh') {
      result = await substrate.invoke({ module: 'modernizer', action: 'refresh' });
    } else if (base === 'modernizer.autopilot') {
      result = await substrate.invoke({ module: 'modernizer', action: 'autopilot' });
    } else if (base === 'modernizer.confidence') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.confidence <plan_id>' };
      }
      result = await substrate.invoke({ module: 'modernizer', action: 'confidence', payload: { plan_id: args[0] } });
    }

    // ═══ v0.7.6/v0.7.7: CIRCUIT BREAKER, AUTONOMY, RECEIPTS ═══
    else if (base === 'modernizer.circuit') {
      const subCmd = args[0] || 'status';
      if (subCmd === 'status') {
        try {
          const { circuitBreaker } = await import('@/lib/evolve/circuit-breaker');
          const status = await circuitBreaker.getStatus();
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  EVOLUTION CIRCUIT BREAKER                                   ║
╠══════════════════════════════════════════════════════════════╣
║  State: ${status.state.toUpperCase().padEnd(8)} ${status.state === 'open' ? '🔴 BLOCKING' : '🟢 READY'}              ║
║  Can Evolve: ${status.can_evolve ? 'YES' : 'NO '}                                           ║
${status.trip_reason ? `║  Trip Reason: ${status.trip_reason.substring(0, 40).padEnd(40)}  ║\n` : ''}${status.auto_reset_after ? `║  Auto Reset: ${status.auto_reset_after.padEnd(20)}                    ║\n` : ''}╚══════════════════════════════════════════════════════════════╝`,
            data: status,
          };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get circuit status'}` };
        }
      } else if (subCmd === 'reset') {
        try {
          const { resetCircuit } = await import('@/lib/evolve/circuit-breaker');
          const result = await resetCircuit('Manual reset via terminal');
          return { success: result.success, output: result.message };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to reset circuit'}` };
        }
      } else if (subCmd === 'open') {
        const reason = args.slice(1).join(' ') || 'Manual trip via terminal';
        try {
          const { tripCircuit } = await import('@/lib/evolve/circuit-breaker');
          const result = await tripCircuit(reason);
          return { success: result.success, output: result.message };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to trip circuit'}` };
        }
      } else {
        return { success: false, output: '▓ ERROR: Invalid subcommand\n  Usage: modernizer.circuit [status|reset|open <reason>]' };
      }
    } else if (base === 'modernizer.autonomy') {
      const subCmd = args[0] || 'status';
      if (subCmd === 'status') {
        try {
          const { getAutonomyStatus } = await import('@/lib/evolve/autonomy');
        const status = await getAutonomyStatus();
          return {
            success: true,
            output: `╔══════════════════════════════════════════════════════════════╗
║  GOVERNED AUTONOMY                                           ║
╠══════════════════════════════════════════════════════════════╣
║  Mode: ${status.mode.toUpperCase().padEnd(12)}                                    ║
║  Can Auto-Evolve: ${status.can_auto_evolve ? 'YES' : 'NO '}                                     ║
║  Confidence Threshold: ${(status.confidence_threshold * 100).toFixed(0)}%                             ║
║  Runs Today: ${status.runs_today}/${status.max_runs_today}                                         ║
${status.blocking_reasons.length > 0 ? `║  Blockers: ${status.blocking_reasons[0].substring(0, 40).padEnd(40)}    ║\n` : ''}╚══════════════════════════════════════════════════════════════╝`,
            data: status,
          };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get autonomy status'}` };
        }
      } else if (subCmd === 'set') {
        const mode = args[1];
        if (!mode || !['off', 'advisory', 'governed'].includes(mode)) {
          return { success: false, output: '▓ ERROR: Invalid mode\n  Usage: modernizer.autonomy set <off|advisory|governed>' };
        }
        try {
          const { setAutonomyMode } = await import('@/lib/evolve/autonomy');
          const result = await setAutonomyMode(mode as 'off' | 'advisory' | 'governed');
          return { success: result.success, output: result.message };
        } catch (err) {
          return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to set autonomy mode'}` };
        }
      } else {
        return { success: false, output: '▓ ERROR: Invalid subcommand\n  Usage: modernizer.autonomy [status|set <mode>]' };
      }
    } else if (base === 'modernizer.receipts') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      try {
        const { modernizerCommands } = await import('@/lib/evolve/modernizer-commands');
        const res = await modernizerCommands.receipts(limit);
        return { success: res.success, output: res.formatted || JSON.stringify(res.data, null, 2), data: res.data };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get receipts'}` };
      }
    } else if (base === 'modernizer.receipt') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Run ID required\n  Usage: modernizer.receipt <run_id>' };
      }
      try {
        const { modernizerCommands } = await import('@/lib/evolve/modernizer-commands');
        const res = await modernizerCommands.receipt(args[0]);
        return { success: res.success, output: res.formatted || JSON.stringify(res.data, null, 2), data: res.data };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Failed to get receipt'}` };
      }
    }

    // ═══ OMEGA OBSERVER ENGINE v1.0.0 ═══
    else if (base === 'modernizer.verify') {
      try {
        const { checkEligibility, formatEligibility } = await import('@/lib/evolve/eligibility-gate');
        const result = await checkEligibility();
        
        return {
          success: true,
          output: formatEligibility(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Verify failed'}` };
      }
    }
    
    else if (base === 'modernizer.analyze') {
      try {
        const { analyzeForwardIntent, formatAnalysis } = await import('@/lib/evolve/forward-analyzer');
        const result = await analyzeForwardIntent();
        
        return {
          success: true,
          output: formatAnalysis(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Analyze failed'}` };
      }
    }
    
    else if (base === 'modernizer.forensics') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Component required\n  Usage: modernizer.forensics <component> [--since 24h|7d|last_run]' };
      }
      try {
        const { runForensics, formatForensics } = await import('@/lib/evolve/forensics');
        const component = args[0];
        const sinceArg = args.find(a => a.startsWith('--since'))?.split('=')[1] || 
                         (args.indexOf('--since') !== -1 ? args[args.indexOf('--since') + 1] : '24h');
        
        const result = await runForensics(component, sinceArg as 'last_phase' | 'last_run' | '24h' | '7d' | '30d');
        
        return {
          success: true,
          output: formatForensics(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Forensics failed'}` };
      }
    }
    
    else if (base === 'modernizer.omega') {
      try {
        const { observeOmega, formatOmega, formatOmegaCompact } = await import('@/lib/evolve/omega-observer');
        
        // Parse component (optional now)
        const component = args[0] && !args[0].startsWith('--') ? args[0] : undefined;
        
        // Parse --since flag
        const sinceArg = args.find(a => a.startsWith('--since'))?.split('=')[1] || 
                         (args.indexOf('--since') !== -1 ? args[args.indexOf('--since') + 1] : '24h');
        
        // Parse --compact flag
        const isCompact = args.includes('--compact') || args.includes('-c');
        
        const result = await observeOmega(component, sinceArg as 'last_phase' | 'last_run' | '24h' | '7d' | '30d');
        
        return {
          success: true,
          output: isCompact ? formatOmegaCompact(result) : formatOmega(result),
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ ERROR: ${err instanceof Error ? err.message : 'Omega observation failed'}` };
      }
    }

    else if (base === 'core.status') {
      result = await core.status();
    } else if (base === 'core.pulse') {
      result = await core.pulse();
    } else if (base === 'core.boot') {
      result = await core.boot();
    } else if (base === 'core.schedule') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Module and action required\n  Usage: core.schedule <module> <action> [delay]' };
      }
      result = await core.schedule({ 
        module: args[0] as any, 
        action: args[1], 
        delay: args[2] 
      });
    } else if (base === 'core.jobs') {
      result = await core.jobs(args[0] as any, args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'core.process') {
      result = await core.process();
    } else if (base === 'core.config') {
      result = await core.config(args[0], args[1]);
    } else if (base === 'core.shutdown') {
      result = await core.shutdown();
    }

    // RIPPLE module (Message Bus)
    else if (base === 'ripple.status') {
      result = await ripple.status();
    } else if (base === 'ripple.pulse') {
      result = await ripple.pulse();
    } else if (base === 'ripple.topics') {
      result = await ripple.topics();
    } else if (base === 'ripple.events') {
      result = await ripple.events({ topic: args[0], limit: args[1] ? parseInt(args[1]) : undefined });
    } else if (base === 'ripple.publish') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Topic and event_type required\n  Usage: ripple.publish <topic> <event_type> [payload]' };
      }
      const payload = args[2] ? JSON.parse(args[2]) : undefined;
      result = await ripple.publish(args[0], args[1], payload);
    } else if (base === 'ripple.subscribe') {
      if (!args[0] || !args[1] || !args[2]) {
        return { success: false, output: '▓ ERROR: Topic, module, and action required\n  Usage: ripple.subscribe <topic> <module> <action>' };
      }
      result = await ripple.subscribe(args[0], args[1] as any, args[2]);
    } else if (base === 'ripple.enqueue') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Queue and payload required\n  Usage: ripple.enqueue <queue> <payload>' };
      }
      const payload = JSON.parse(args[1]);
      result = await ripple.enqueue(args[0], payload);
    } else if (base === 'ripple.dequeue') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Queue name required\n  Usage: ripple.dequeue <queue>' };
      }
      result = await ripple.dequeue(args[0]);
    } else if (base === 'ripple.dead_letter') {
      result = await ripple.deadLetter(args[0], args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'ripple.retry') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.retry <job_id>' };
      }
      result = await ripple.retry(args[0]);
    } else if (base === 'ripple.metrics') {
      result = await ripple.metrics();
    } else if (base === 'ripple.replay') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Topic required\n  Usage: ripple.replay <topic> [limit]' };
      }
      result = await ripple.replay(args[0], args[1] ? parseInt(args[1]) : undefined);
    } else if (base === 'ripple.jobs') {
      result = await ripple.jobs({ queue: args[0], status: args[1], limit: args[2] ? parseInt(args[2]) : undefined });
    } else if (base === 'ripple.work') {
      const once = args.includes('--once');
      const queue = args.find(a => !a.startsWith('--'));
      result = await ripple.work(queue, once);
    } else if (base === 'ripple.drain') {
      result = await ripple.drain(args[0]);
    } else if (base === 'ripple.ack') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.ack <job_id>' };
      }
      result = await ripple.ack(args[0]);
    } else if (base === 'ripple.nack') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.nack <job_id> [reason]' };
      }
      result = await ripple.nack(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'ripple.circuits') {
      result = await ripple.circuits();
    }

    // ACCESS module (Identity & Billing)
    else if (base === 'access.status') {
      result = await access.status();
    } else if (base === 'access.pulse') {
      result = await access.pulse();
    } else if (base === 'access.create_key') {
      // access.create_key [name] [scopes...] - developer auto-created from auth
      result = await access.createKey({ 
        name: args[0], 
        scopes: args.slice(1) 
      });
    } else if (base === 'access.validate_key') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: API key required\n  Usage: access.validate_key <api_key>' };
      }
      result = await access.validateKey(args[0]);
    } else if (base === 'access.revoke_key') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Key ID required\n  Usage: access.revoke_key <key_id>' };
      }
      result = await access.revokeKey(args[0]);
    } else if (base === 'access.list_keys') {
      result = await access.listKeys(args[0]);
    } else if (base === 'access.usage') {
      result = await access.getUsage({ 
        product_code: args[0], 
        days: args[1] ? parseInt(args[1]) : undefined 
      });
    } else if (base === 'access.quota') {
      result = await access.checkQuota(args[0]);
    } else if (base === 'access.subscription') {
      result = await access.subscription(args[0]);
    } else if (base === 'access.register') {
      result = await access.register(args[0]);
    } else if (base === 'access.bootstrap') {
      // Bootstrap creates developer + assigns roles + seeds governor if first user
      result = await access.bootstrap(args[0] || args.join(' ') || undefined);
    } else if (base === 'access.developer') {
      result = await access.developer(args[0]);
    } else if (base === 'access.developers') {
      result = await access.developers();
    } else if (base === 'access.identity') {
      result = await access.identity();
    } else if (base === 'access.entitlements') {
      result = await access.entitlements();
    } else if (base === 'access.products') {
      result = await access.products(args[0]);
    }

    // INTEGRATION module (Enterprise Adapters)
    else if (base === 'integration.status') {
      result = await integration.status();
    } else if (base === 'integration.pulse') {
      result = await integration.pulse();
    } else if (base === 'integration.adapters') {
      result = await integration.adapters();
    } else if (base === 'integration.connections') {
      result = await integration.connections();
    } else if (base === 'integration.discovered') {
      result = await integration.discovered(args[0]);
    } else if (base === 'integration.mapped_commands') {
      result = await integration.mappedCommands(args[0]);
    } else if (base === 'integration.policies') {
      result = await integration.policies();
    } else if (base === 'integration.audit_log') {
      result = await integration.auditLog({ adapter_id: args[0], limit: args[1] ? parseInt(args[1]) : undefined });
    } else if (base === 'integration.connect') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Type and name required\n  Usage: integration.connect <type> <name> <config>' };
      }
      const configStr = args.slice(2).join(' ') || '{}';
      result = await integration.connect({ 
        adapter_type: args[0] as any, 
        name: args[1], 
        config: JSON.parse(configStr) 
      });
    } else if (base === 'integration.disconnect') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Adapter ID required\n  Usage: integration.disconnect <adapter_id>' };
      }
      result = await integration.disconnect(args[0]);
    } else if (base === 'integration.test') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Adapter ID required\n  Usage: integration.test <adapter_id>' };
      }
      result = await integration.test(args[0]);
    } else if (base === 'integration.discover') {
      result = await integration.discover({ 
        target: args[0], 
        depth: args[1] as 'shallow' | 'deep' | undefined 
      });
    } else if (base === 'integration.map_command') {
      if (!args[0] || !args[1] || !args[2]) {
        return { success: false, output: '▓ ERROR: Function, command, and description required\n  Usage: integration.map_command <func> <cmd> <desc>' };
      }
      result = await integration.mapCommand({ 
        discovered_function: args[0], 
        terminal_command: args[1], 
        description: args.slice(2).join(' ') 
      });
    } else if (base === 'integration.set_policy') {
      const policyStr = args.slice(1).join(' ') || '{}';
      result = await integration.setPolicy({ 
        adapter_id: args[0], 
        policy: JSON.parse(policyStr) 
      });
    } else if (base === 'integration.execute') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Adapter ID and action required\n  Usage: integration.execute <adapter_id> <action> [params]' };
      }
      const paramsStr = args.slice(2).join(' ') || '{}';
      result = await integration.execute({ 
        adapter_id: args[0], 
        action: args[1], 
        parameters: JSON.parse(paramsStr) 
      });
    } else if (base === 'integration.game_discover') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Engine type required\n  Usage: integration.game_discover <engine_type>\n  Engines: unity, unreal, godot, custom' };
      }
      result = await integration.gameEngine.discover(args[0] as any, args[1]);
    } else if (base === 'integration.enterprise_discover') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: System type required\n  Usage: integration.enterprise_discover <system_type>\n  Systems: sap, salesforce, workday, servicenow, dynamics, custom' };
      }
      result = await integration.enterprise.discover(args[0] as any);
    } else if (base === 'integration.dev_discover') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Platform type required\n  Usage: integration.dev_discover <platform_type>\n  Platforms: github, gitlab, jira, confluence, linear, notion, custom' };
      }
      result = await integration.devPlatform.discover(args[0] as any);
    } else if (base === 'integration.payroll') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Adapter ID and operation required\n  Usage: integration.payroll <adapter_id> <operation> [params]\n  Operations: calculate, schedule, status' };
      }
      const paramsStr = args.slice(2).join(' ') || '{}';
      result = await integration.enterprise.payroll(args[0], args[1] as any, JSON.parse(paramsStr));
    } else if (base === 'integration.customer_service') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Adapter ID and operation required\n  Usage: integration.customer_service <adapter_id> <operation> [params]\n  Operations: respond, escalate, summarize' };
      }
      const paramsStr = args.slice(2).join(' ') || '{}';
      result = await integration.enterprise.customerService(args[0], args[1] as any, JSON.parse(paramsStr));
    }

    // CORTEX module (Agency-class Orchestrator)
    else if (base === 'cortex.status') {
      result = await cortex.status();
    } else if (base === 'cortex.health') {
      result = await cortex.health();
    } else if (base === 'cortex.pulse') {
      result = await cortex.pulse();
    } else if (base === 'cortex.diagnostics') {
      result = await cortex.diagnostics();
    } else if (base === 'cortex.mode') {
      const mode = args[0] as 'manual' | 'shadow' | 'auto' | undefined;
      result = await cortex.mode(mode);
    } else if (base === 'cortex.restart') {
      result = await cortex.restart();
    } else if (base === 'cortex.panic') {
      const panicAction = args[0] as 'freeze' | 'resume' | 'status' || 'status';
      const reason = args.slice(1).join(' ') || undefined;
      result = await cortex.panic(panicAction, reason);
    } else if (base === 'cortex.dispatch') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: cortex.dispatch <module.action> [args]\n  Example: cortex.dispatch brain.reflect' };
      }
      const [targetMod, targetAct] = args[0].split('.');
      const dispatchArgs = args[1] ? JSON.parse(args[1]) : undefined;
      result = await cortex.dispatch(targetMod, targetAct, dispatchArgs);
    } else if (base === 'cortex.observe') {
      result = await cortex.observe(args[0], args[1]?.split(','));
    } else if (base === 'cortex.propose') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Goal required\n  Usage: cortex.propose <goal> [context]\n  Example: cortex.propose "Optimize memory tiering"' };
      }
      result = await cortex.propose(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'cortex.evaluate') {
      result = await cortex.evaluate(args[0]);
    } else if (base === 'cortex.apply') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Proposal ID required\n  Usage: cortex.apply <proposal_id> [target_module]' };
      }
      result = await cortex.apply(args[0], args[1]);
    } else if (base === 'cortex.rollback') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Apply ID required\n  Usage: cortex.rollback <apply_id> [reason]' };
      }
      result = await cortex.rollback(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'cortex.audit') {
      result = await cortex.audit(args[0], args[1]);
    } else if (base === 'cortex.learn') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Outcome required\n  Usage: cortex.learn <outcome> [proposal_id] [feedback]\n  Example: cortex.learn success prop_abc123' };
      }
      result = await cortex.learn(args[0], args[1], args.slice(2).join(' ') || undefined);
    } else if (base === 'cortex.summary') {
      result = await cortex.summary();
    } else if (base === 'cortex.plan') {
      const eligible = args.includes('--eligible');
      const sequenceId = args.find(a => !a.startsWith('--'));
      result = await substrate.invoke({ 
        module: 'cortex', 
        action: 'plan', 
        payload: { sequence_id: sequenceId, eligible } 
      });
    } else if (base === 'cortex.run') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Sequence ID required\n  Usage: cortex.run <sequence_id> [mode]\n  Example: cortex.run abc123 shadow' };
      }
      result = await cortex.run(args[0], args[1] as 'shadow' | 'production' | undefined);
    }
    // v5.6.0: Cortex World Model + Inventory
    else if (base === 'cortex.world') {
      const dag = args.includes('--dag');
      const roles = args.includes('--roles');
      const eligible = args.includes('--eligible');
      result = await cortex.world({ dag, roles, eligible });
    } else if (base === 'cortex.inventory') {
      const eligible = args.includes('--eligible');
      result = await substrate.invoke({ 
        module: 'cortex', 
        action: 'inventory', 
        payload: { eligible } 
      });
    }

    // INCLUSIVE module (Human Compatibility Pipeline)
    else if (base === 'inclusive.status') {
      result = await inclusive.status();
    } else if (base === 'inclusive.health') {
      result = await inclusive.health();
    } else if (base === 'inclusive.pulse') {
      result = await inclusive.pulse();
    } else if (base === 'inclusive.scan') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.scan <url_or_html> [--wcag A|AA|AAA] [--depth quick|standard|deep]\n  Example: inclusive.scan https://example.com --wcag AA' };
      }
      const wcagLevel = args.includes('--wcag') ? args[args.indexOf('--wcag') + 1] as 'A' | 'AA' | 'AAA' : undefined;
      const depth = args.includes('--depth') ? args[args.indexOf('--depth') + 1] as 'quick' | 'standard' | 'deep' : undefined;
      result = await inclusive.scan(args[0], { wcag_level: wcagLevel, scan_depth: depth });
    } else if (base === 'inclusive.self_scan') {
      result = await inclusive.selfScan();
    } else if (base === 'inclusive.repair') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.repair <url_or_html> [issue_ids...]' };
      }
      result = await inclusive.repair(args[0], args.slice(1).length > 0 ? args.slice(1) : undefined);
    } else if (base === 'inclusive.validate') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.validate <url_or_html>' };
      }
      result = await inclusive.validate(args[0]);
    } else if (base === 'inclusive.profile') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Context required\n  Usage: inclusive.profile <context>\n  Example: inclusive.profile "user prefers high contrast"' };
      }
      result = await inclusive.profile(args.join(' '));
    } else if (base === 'inclusive.report') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Target required\n  Usage: inclusive.report <url_or_html> [json|markdown]' };
      }
      const format = args[1] as 'json' | 'markdown' | undefined;
      result = await inclusive.report(args[0], format);
    } else if (base === 'inclusive.scan_all_templates') {
      result = await inclusive.scanAllTemplates();
    } else if (base === 'inclusive.regressions') {
      const hours = args[0] ? parseInt(args[0]) : undefined;
      result = await inclusive.regressions(hours);
    } else if (base === 'inclusive.coverage') {
      result = await inclusive.coverage();
    }

    // ═══════════════════════════════════════════════════════════════
    // CLM (Constant Learning Mode) v6.7.0
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'clm.status') {
      try {
        const { getCLMStatus } = await import('@/lib/substrate/clm');
        const status = await getCLMStatus();
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CONSTANT LEARNING MODE — v6.7.0                             ║
╠══════════════════════════════════════════════════════════════╣
║  Status:      ${status.enabled ? '🟢 ENABLED' : '🔴 DISABLED'}                                    ║
║  Kill Switch: ${status.kill_switch ? '🛑 ACTIVE' : '✅ OFF'}                                      ║
║  Budget Used: ${((status.budget_used / status.budget_total) * 100).toFixed(0)}% (${status.budget_used}/${status.budget_total} tokens)              ║
║  Topics:      ${status.topics_count} in bank                                  ║
║  Queue:       ${status.review_queue_size} items pending review                      ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM not initialized or error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.enable') {
      try {
        const { enableCLM } = await import('@/lib/substrate/clm');
        await enableCLM();
        return { success: true, output: '◉ Constant Learning Mode ENABLED — autonomous learning active' };
      } catch (err) {
        return { success: false, output: `▓ Failed to enable CLM: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.disable') {
      try {
        const { disableCLM } = await import('@/lib/substrate/clm');
        await disableCLM();
        return { success: true, output: '◉ Constant Learning Mode DISABLED' };
      } catch (err) {
        return { success: false, output: `▓ Failed to disable CLM: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.cycle') {
      try {
        const { runCLMCycle } = await import('@/lib/substrate/clm');
        const result = await runCLMCycle();
        if (!result) {
          return { success: false, output: '▓ CLM cycle returned no result — check if CLM is enabled' };
        }
        return { 
          success: result.success, 
          output: result.success 
            ? `◉ CLM cycle complete — topic: ${result.topic || 'unknown'}, ${result.unitsUsed || 0} units used` 
            : `▓ CLM cycle failed: ${result.error || 'Unknown error'}`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM cycle error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.kill_switch') {
      const action = args[0];
      if (!action || !['on', 'off'].includes(action)) {
        return { success: false, output: '▓ ERROR: Specify on or off\n  Usage: clm.kill_switch <on|off>' };
      }
      try {
        if (action === 'on') {
          const { activateKillSwitch } = await import('@/lib/substrate/clm');
          await activateKillSwitch();
          return { success: true, output: '🛑 CLM Kill Switch ACTIVATED — all learning halted' };
        } else {
          const { deactivateKillSwitch } = await import('@/lib/substrate/clm');
          await deactivateKillSwitch();
          return { success: true, output: '✅ CLM Kill Switch deactivated — learning resumed' };
        }
      } catch (err) {
        return { success: false, output: `▓ Kill switch error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.budget') {
      try {
        const { budgetGovernor } = await import('@/lib/substrate/clm');
        const status = budgetGovernor.getStatus();
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CLM BUDGET GOVERNOR                                         ║
╠══════════════════════════════════════════════════════════════╣
║  Daily Budget:  ${status.daily_limit.toLocaleString()} tokens                           ║
║  Used Today:    ${status.used_today.toLocaleString()} tokens (${((status.used_today / status.daily_limit) * 100).toFixed(1)}%)                    ║
║  Remaining:     ${status.remaining.toLocaleString()} tokens                           ║
║  Rate Limit:    ${status.calls_per_hour}/hr                                   ║
║  Reset Time:    ${status.reset_time}                                ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ Budget error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.topics') {
      try {
        const { topicBank } = await import('@/lib/substrate/clm');
        const topics = topicBank.getTopics();
        const lines = ['╔══════════════════════════════════════════════════════════════╗'];
        lines.push('║  CLM TOPIC BANK                                              ║');
        lines.push('╠══════════════════════════════════════════════════════════════╣');
        for (const topic of topics.slice(0, 15)) {
          const mastery = `${(topic.mastery * 100).toFixed(0)}%`.padEnd(5);
          const name = topic.name.substring(0, 40).padEnd(40);
          lines.push(`║  ${mastery} ${name}     ║`);
        }
        if (topics.length > 15) {
          lines.push(`║  ... and ${topics.length - 15} more topics                               ║`);
        }
        lines.push('╚══════════════════════════════════════════════════════════════╝');
        return { success: true, output: lines.join('\n'), data: topics };
      } catch (err) {
        return { success: false, output: `▓ Topics error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.review_queue') {
      try {
        const { spacedRepetition } = await import('@/lib/substrate/clm');
        const queue = spacedRepetition.getQueue();
        if (queue.length === 0) {
          return { success: true, output: '◉ Review queue is empty — all caught up!' };
        }
        const lines = ['╔══════════════════════════════════════════════════════════════╗'];
        lines.push('║  SPACED REPETITION QUEUE                                     ║');
        lines.push('╠══════════════════════════════════════════════════════════════╣');
        for (const item of queue.slice(0, 10)) {
          const due = item.next_review ? new Date(item.next_review).toLocaleDateString() : 'Now';
          lines.push(`║  📚 ${item.topic.substring(0, 35).padEnd(35)} Due: ${due.padEnd(10)} ║`);
        }
        lines.push('╚══════════════════════════════════════════════════════════════╝');
        return { success: true, output: lines.join('\n'), data: queue };
      } catch (err) {
        return { success: false, output: `▓ Queue error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.add_topic') {
      if (args.length < 2) {
        return { success: false, output: '▓ ERROR: Missing arguments\n  Usage: clm.add_topic <topic> <category>\n  Categories: core_curriculum, gap_detection, spaced_repetition, deep_dive' };
      }
      const topicName = args[0];
      const category = args[1] as any;
      try {
        const { topicBank } = await import('@/lib/substrate/clm');
        const topic = topicBank.addTopic(topicName, category);
        return {
          success: true,
          output: `◉ Topic added to CLM bank: "${topic.name}" (${topic.category})`,
          data: topic,
        };
      } catch (err) {
        return { success: false, output: `▓ Failed to add topic: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'clm.next_review') {
      try {
        const { spacedRepetition } = await import('@/lib/substrate/clm');
        const next = spacedRepetition.getNextDueTopic();
        if (!next) {
          return { success: true, output: '◉ No items due for review — all caught up!' };
        }
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  NEXT REVIEW ITEM                                            ║
╠══════════════════════════════════════════════════════════════╣
║  Topic:      ${next.name.substring(0, 45).padEnd(45)} ║
║  Confidence: ${((next.confidenceLevel || 0) * 100).toFixed(0)}%                                           ║
║  Studied:    ${next.studyCount || 0} times                                        ║
╚══════════════════════════════════════════════════════════════╝`,
          data: next,
        };
      } catch (err) {
        return { success: false, output: `▓ Next review error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTOBLOG (Governed Blog Automation) v1.0.0
    // ═══════════════════════════════════════════════════════════════
    else if (base === 'autoblog.status') {
      try {
        const { getAutoblogStatus } = await import('@/lib/autoblog');
        const status = await getAutoblogStatus();
        const s = status.settings;
        const modeIcon = s?.enabled ? '🟢' : '🔴';
        const circuitIcon = status.circuit.state === 'closed' ? '✅' : status.circuit.state === 'open' ? '🛑' : '⚡';
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  AUTOBLOG PRIMITIVE — v1.0.0                                 ║
╠══════════════════════════════════════════════════════════════╣
║  Status:     ${modeIcon} ${s?.enabled ? 'ENABLED' : 'DISABLED'}                                       ║
║  Mode:       ${(s?.mode || 'off').toUpperCase().padEnd(10)}                                      ║
║  Circuit:    ${circuitIcon} ${status.circuit.state.toUpperCase().padEnd(10)}                                 ║
║  Dry Run:    ${s?.dry_run ? '✓ ON (publish blocked)' : '✗ OFF'}                      ║
║  Cadence:    ${s?.cadence_minutes || 360} min between posts                        ║
║  Max/Day:    ${s?.max_posts_per_day || 2} posts                                        ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ AutoBlog error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.enable') {
      try {
        const { updateAutoblogSettings } = await import('@/lib/autoblog');
        const result = await updateAutoblogSettings({ enabled: true });
        if (!result.ok) {
          return { success: false, output: `▓ Failed to enable AutoBlog: ${result.error}` };
        }
        return { success: true, output: '◉ AutoBlog ENABLED — governed automation active\n  Note: dry_run is still ON by default' };
      } catch (err) {
        return { success: false, output: `▓ Enable error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.disable') {
      try {
        const { updateAutoblogSettings } = await import('@/lib/autoblog');
        const result = await updateAutoblogSettings({ enabled: false });
        if (!result.ok) {
          return { success: false, output: `▓ Failed to disable AutoBlog: ${result.error}` };
        }
        return { success: true, output: '◉ AutoBlog DISABLED' };
      } catch (err) {
        return { success: false, output: `▓ Disable error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.plan') {
      try {
        const { autoblogPlan } = await import('@/lib/autoblog');
        const result = await autoblogPlan();
        if (!result.ok) {
          return { success: false, output: `▓ Plan blocked: ${result.reason}` };
        }
        return {
          success: true,
          output: `◉ Blog post planned and queued
  Queue ID:  ${result.queueId?.slice(0, 8)}...
  Channel:   ${result.data?.channel}
  Topic:     ${result.data?.topic}`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ Plan error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.draft') {
      const queueId = args[0];
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.draft <queue_id>' };
      }
      try {
        const { autoblogDraft } = await import('@/lib/autoblog');
        const result = await autoblogDraft(queueId);
        if (!result.ok) {
          return { success: false, output: `▓ Draft failed: ${result.reason}` };
        }
        return { success: true, output: `◉ Draft generated for ${queueId.slice(0, 8)}... — ready for verification` };
      } catch (err) {
        return { success: false, output: `▓ Draft error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.verify') {
      const queueId = args[0];
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.verify <queue_id>' };
      }
      try {
        const { autoblogVerify } = await import('@/lib/autoblog');
        const result = await autoblogVerify(queueId);
        if (!result.ok) {
          return { success: false, output: `▓ Verification failed: ${result.reason}` };
        }
        return {
          success: true,
          output: `◉ Draft verified — confidence: ${((result.data?.confidence as number) * 100).toFixed(0)}%
  Checks passed: ${(result.data?.checks as string[])?.join(', ')}`,
          data: result,
        };
      } catch (err) {
        return { success: false, output: `▓ Verify error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.publish') {
      const queueId = args[0];
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.publish <queue_id>\n  Or use: autoblog.publish.all' };
      }
      try {
        const { autoblogPublish } = await import('@/lib/autoblog');
        const result = await autoblogPublish(queueId);
        if (!result.ok) {
          return { success: false, output: `▓ Publish blocked: ${result.reason}` };
        }
        return { 
          success: true, 
          output: `◉ POST PUBLISHED SUCCESSFULLY
  Queue ID:  ${queueId.slice(0, 8)}...
  Post ID:   ${result.data?.postId || 'N/A'}
  Slug:      ${result.data?.slug || 'N/A'}
  
  View at: /blog/${result.data?.slug || ''}`,
          data: result.data
        };
      } catch (err) {
        return { success: false, output: `▓ Publish error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.publish.all') {
      try {
        const { autoblogPublishAll } = await import('@/lib/autoblog');
        const result = await autoblogPublishAll();
        if (!result.ok) {
          return { success: false, output: `▓ Publish all failed: ${result.reason}` };
        }
        return { 
          success: true, 
          output: `◉ BATCH PUBLISH COMPLETE
  Published: ${result.data?.published || 0} posts
  Failed:    ${result.data?.failed || 0} posts
  
  Use 'autoblog.queue' to verify status`,
          data: result.data
        };
      } catch (err) {
        return { success: false, output: `▓ Publish all error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.abort') {
      const queueId = args[0];
      const reason = args.slice(1).join(' ') || 'Aborted by operator';
      if (!queueId) {
        return { success: false, output: '▓ ERROR: Queue ID required\n  Usage: autoblog.abort <queue_id> [reason]' };
      }
      try {
        const { autoblogAbort } = await import('@/lib/autoblog');
        const result = await autoblogAbort(queueId, reason);
        return { success: true, output: `◉ Aborted ${queueId.slice(0, 8)}... — ${reason}` };
      } catch (err) {
        return { success: false, output: `▓ Abort error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.queue') {
      try {
        const { getAutoblogQueue } = await import('@/lib/autoblog');
        const queue = await getAutoblogQueue();
        if (queue.length === 0) {
          return { success: true, output: '◉ Queue is empty — no pending posts' };
        }
        const charWidth = getOptimalCharWidth();
        const isMobile = charWidth < 50;
        
        let output = '╔══════════════════════════════════════════════════════════════╗\n';
        output += '║  AUTOBLOG QUEUE                                              ║\n';
        output += '╠══════════════════════════════════════════════════════════════╣\n';
        
        for (const item of queue.slice(0, 10)) {
          const id = item.id.slice(0, 8);
          const status = item.status.toUpperCase().padEnd(10);
          const channel = item.channel.padEnd(12);
          if (isMobile) {
            output += `║ ${id} ${status}           ║\n`;
            output += `║   └─ ${channel}                    ║\n`;
          } else {
            output += `║  ${id}  ${status}  ${channel}                    ║\n`;
          }
        }
        output += '╚══════════════════════════════════════════════════════════════╝';
        
        return { success: true, output, data: queue };
      } catch (err) {
        return { success: false, output: `▓ Queue error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.runs') {
      const limit = parseInt(args[0]) || 20;
      try {
        const { getAutoblogRuns } = await import('@/lib/autoblog');
        const runs = await getAutoblogRuns(limit);
        if (runs.length === 0) {
          return { success: true, output: '◉ No runs recorded yet' };
        }
        let output = '╔══════════════════════════════════════════════════════════════╗\n';
        output += '║  AUTOBLOG RUNS (Audit Trail)                                 ║\n';
        output += '╠══════════════════════════════════════════════════════════════╣\n';
        
        for (const run of runs.slice(0, 15)) {
          const phase = run.phase.toUpperCase().padEnd(8);
          const outcome = run.outcome === 'success' ? '✓' : run.outcome === 'blocked' ? '⚠' : '✗';
          const reason = (run.reason || '').substring(0, 35);
          output += `║  ${outcome} ${phase}  ${reason.padEnd(40)} ║\n`;
        }
        output += '╚══════════════════════════════════════════════════════════════╝';
        
        return { success: true, output, data: runs };
      } catch (err) {
        return { success: false, output: `▓ Runs error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.settings') {
      const action = args[0];
      
      if (action === 'set' && args.length >= 3) {
        const key = args[1];
        const value = args.slice(2).join(' ');
        try {
          const { updateAutoblogSettings } = await import('@/lib/autoblog');
          const updates: Record<string, unknown> = {};
          
          // Parse value based on key
          if (key === 'cadence_minutes' || key === 'max_posts_per_day' || key === 'max_failures_per_hour') {
            updates[key] = parseInt(value);
          } else if (key === 'min_confidence_publish') {
            updates[key] = parseFloat(value);
          } else if (key === 'dry_run' || key === 'enabled') {
            updates[key] = value === 'true';
          } else if (key === 'mode') {
            if (!['governed', 'shadow', 'off'].includes(value)) {
              return { success: false, output: '▓ Invalid mode. Use: governed, shadow, or off' };
            }
            updates[key] = value;
          } else {
            return { success: false, output: `▓ Unknown setting: ${key}` };
          }
          
          const result = await updateAutoblogSettings(updates as any);
          if (!result.ok) {
            return { success: false, output: `▓ Update failed: ${result.error}` };
          }
          return { success: true, output: `◉ Updated ${key} = ${value}` };
        } catch (err) {
          return { success: false, output: `▓ Settings error: ${err instanceof Error ? err.message : 'Unknown'}` };
        }
      }
      
      // View settings
      try {
        const { getAutoblogSettings } = await import('@/lib/autoblog');
        const settings = await getAutoblogSettings();
        if (!settings) {
          return { success: false, output: '▓ Settings not found' };
        }
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  AUTOBLOG SETTINGS                                           ║
╠══════════════════════════════════════════════════════════════╣
║  enabled:              ${settings.enabled}                              ║
║  mode:                 ${settings.mode}                           ║
║  dry_run:              ${settings.dry_run}                             ║
║  cadence_minutes:      ${settings.cadence_minutes}                              ║
║  max_posts_per_day:    ${settings.max_posts_per_day}                                ║
║  max_failures_per_hour: ${settings.max_failures_per_hour}                               ║
║  min_confidence:       ${settings.min_confidence_publish}                             ║
║  allowed_channels:     ${settings.allowed_channels.join(', ')}   ║
║  circuit_state:        ${settings.circuit_state}                          ║
╚══════════════════════════════════════════════════════════════╝`,
          data: settings,
        };
      } catch (err) {
        return { success: false, output: `▓ Settings error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.circuit') {
      const action = args[0];
      try {
        if (action === 'reset') {
          const { resetAutoblogCircuit } = await import('@/lib/autoblog');
          await resetAutoblogCircuit();
          return { success: true, output: '◉ AutoBlog circuit reset to CLOSED' };
        }
        
        const { checkAutoblogCircuit } = await import('@/lib/autoblog');
        const circuit = await checkAutoblogCircuit();
        const icon = circuit.state === 'closed' ? '✅' : circuit.state === 'open' ? '🛑' : '⚡';
        return {
          success: true,
          output: `◉ AutoBlog Circuit: ${icon} ${circuit.state.toUpperCase()}
  Can proceed: ${circuit.canProceed ? 'Yes' : 'No'}
  Reason:      ${circuit.reason || 'None'}`,
        };
      } catch (err) {
        return { success: false, output: `▓ Circuit error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.heal') {
      const full = args.includes('--full');
      try {
        const { healAutoblog } = await import('@/lib/autoblog');
        const result = await healAutoblog({ full, source: 'terminal' });
        
        let output = full
          ? '🔧 AutoBlog FULL HEAL executed:\n'
          : '🔧 AutoBlog soft heal executed:\n';
        
        for (const action of result.actions) {
          output += `  ▸ ${action}\n`;
        }
        output += `\nFinal state: enabled=${result.finalState.enabled}, circuit=${result.finalState.circuitState}`;
        if (result.finalState.itemsCleared > 0) {
          output += `, cleared=${result.finalState.itemsCleared}`;
        }
        
        return { success: result.ok, output, data: result };
      } catch (err) {
        return { success: false, output: `▓ Heal error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    // AUTONOMOUS MODE COMMANDS v2.0
    else if (base === 'autoblog.start') {
      try {
        const { startAutonomousMode } = await import('@/lib/autoblog');
        const result = await startAutonomousMode();
        if (!result.ok) {
          return { success: false, output: `▓ Start failed: ${result.message}` };
        }
        return {
          success: true,
          output: `◉ AUTONOMOUS MODE ACTIVATED
  Status:   Running continuously
  Cadence:  Posts generated on schedule
  Learning: Brain integration active
  
  Use 'autoblog.state' to monitor
  Use 'autoblog.stop' to halt`,
        };
      } catch (err) {
        return { success: false, output: `▓ Start error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.stop') {
      try {
        const { stopAutonomousMode } = await import('@/lib/autoblog');
        const result = stopAutonomousMode();
        if (!result.ok) {
          return { success: false, output: `▓ Stop failed: ${result.message}` };
        }
        return { success: true, output: `◉ Autonomous mode stopped — ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ Stop error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.state') {
      try {
        const { getAutonomousState } = await import('@/lib/autoblog');
        const state = getAutonomousState();
        const runningIcon = state.is_running ? '🟢' : '⚫';
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  AUTONOMOUS ENGINE STATE                                     ║
╠══════════════════════════════════════════════════════════════╣
║  Status:     ${runningIcon} ${state.is_running ? 'RUNNING' : 'STOPPED'}                                      ║
║  Cycles:     ${String(state.cycles_completed).padEnd(5)} completed                             ║
║  Posts:      ${String(state.posts_generated).padEnd(5)} generated                             ║
║  Insights:   ${String(state.research_insights_captured).padEnd(5)} captured                              ║
║  Evolutions: ${String(state.evolution_updates_posted).padEnd(5)} posted                               ║
╠══════════════════════════════════════════════════════════════╣
║  Last Cycle: ${(state.last_cycle_at || 'Never').toString().substring(0, 20).padEnd(20)}                     ║
║  Next Cycle: ${(state.next_cycle_at || 'Not scheduled').toString().substring(0, 20).padEnd(20)}                     ║
╚══════════════════════════════════════════════════════════════╝`,
          data: state,
        };
      } catch (err) {
        return { success: false, output: `▓ State error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.seed') {
      const count = parseInt(args[0]) || 3;
      try {
        const { seedAutoblogPosts } = await import('@/lib/autoblog');
        const result = await seedAutoblogPosts(count);
        
        if (!result.ok) {
          return { success: false, output: `▓ Seed failed: ${result.errors.join(', ')}` };
        }
        
        let output = `◉ SEEDED ${result.seeded} POSTS\n\n`;
        for (const post of result.posts) {
          output += `  ▸ [${post.channel.toUpperCase()}] ${post.topic.substring(0, 40)}...\n`;
          output += `    Queue ID: ${post.queueId.slice(0, 8)}...\n\n`;
        }
        output += `All posts are in 'ready' status.\nUse 'autoblog.queue' to view them.\nUse 'autoblog.publish <id>' to publish.`;
        
        return { success: true, output, data: result };
      } catch (err) {
        return { success: false, output: `▓ Seed error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }
    // CLM (Constant Learning Mode) COMMANDS v2.1
    else if (base === 'autoblog.clm' || base === 'autoblog.clm.start') {
      try {
        const { startCLMMode } = await import('@/lib/autoblog');
        const result = await startCLMMode();
        if (!result.ok) {
          return { success: false, output: `▓ CLM start failed: ${result.message}` };
        }
        return {
          success: true,
          output: `◉ CLM (CONSTANT LEARNING MODE) ACTIVATED
  ┌────────────────────────────────────────┐
  │  Target:      3-6 posts per week       │
  │  Intelligence: Weighing enabled        │
  │  Tone:        Changelog unified        │
  │  Learning:    24/7 continuous          │
  └────────────────────────────────────────┘
  
  The system will:
  ▸ Assess importance before publishing
  ▸ Check uniqueness vs recent posts
  ▸ Match changelog tone guidelines
  ▸ Self-audit every 5 cycles
  
  Use 'autoblog.clm.status' to monitor
  Use 'autoblog.clm.stop' to halt`,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM start error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.clm.stop') {
      try {
        const { stopCLMMode } = await import('@/lib/autoblog');
        const result = stopCLMMode();
        if (!result.ok) {
          return { success: false, output: `▓ CLM stop failed: ${result.message}` };
        }
        return { success: true, output: `◉ CLM stopped — ${result.message}` };
      } catch (err) {
        return { success: false, output: `▓ CLM stop error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    } else if (base === 'autoblog.clm.status') {
      try {
        const { getCLMStatus } = await import('@/lib/autoblog');
        const status = getCLMStatus();
        const runningIcon = status.running ? '🟢' : '⚫';
        const qualityBar = '█'.repeat(Math.floor(status.stats.quality_avg * 10)) + '░'.repeat(10 - Math.floor(status.stats.quality_avg * 10));
        
        return {
          success: true,
          output: `╔══════════════════════════════════════════════════════════════╗
║  CLM (CONSTANT LEARNING MODE) STATUS                         ║
╠══════════════════════════════════════════════════════════════╣
║  Status:       ${runningIcon} ${status.running ? 'RUNNING 24/7' : 'STOPPED'}                              ║
║  Mode:         ${status.mode.toUpperCase().padEnd(12)}                                ║
╠══════════════════════════════════════════════════════════════╣
║  WEEKLY PROGRESS                                             ║
║  Posts:        ${String(status.stats.posts_this_week).padEnd(2)}/${status.config.MAX_POSTS_PER_WEEK} target (${status.config.MIN_POSTS_PER_WEEK}-${status.config.MAX_POSTS_PER_WEEK}/week)              ║
║  Total Posts:  ${String(status.stats.posts_total).padEnd(5)}                                          ║
║  Cycles:       ${String(status.stats.cycles).padEnd(5)}                                          ║
╠══════════════════════════════════════════════════════════════╣
║  QUALITY TREND                                               ║
║  ${qualityBar} ${(status.stats.quality_avg * 100).toFixed(0)}%                        ║
╚══════════════════════════════════════════════════════════════╝`,
          data: status,
        };
      } catch (err) {
        return { success: false, output: `▓ CLM status error: ${err instanceof Error ? err.message : 'Unknown'}` };
      }
    }

    // Unknown command
    else {
      return {
        success: false,
        output: `▓ UNKNOWN COMMAND: ${base}\n  Type 'help' for available commands or 'help <module>' for specifics`,
      };
    }

    // Format result
    if (result?.success) {
      const output = `◉ ${getRandomItem(PERSONALITY_RESPONSES.success)}\n\n${JSON.stringify(result.data || result, null, 2)}`;
      return { success: true, output, data: result.data };
    } else {
      return {
        success: false,
        output: `▓ ${result?.error || 'Command failed'}\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      output: `▓ EXCEPTION: ${error instanceof Error ? error.message : 'Unknown error'}\n  ${getRandomItem(PERSONALITY_RESPONSES.error)}`,
    };
  }
}
