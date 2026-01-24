/**
 * Terminal Command Executor
 * Handles parsing and execution of all substrate commands
 * v5.0.0 - Enhanced with aliases, macros, scheduling, watch, and audit
 */

import { substrate, brain, decode, defense, nexus, vision, dream, system, modernizer, core, ripple, access, integration } from '@/lib/substrate';
import { supabase } from '@/integrations/supabase/client';
import { ALL_COMMANDS, COMMAND_CATEGORIES, type CommandDefinition } from './TerminalCommands';
import { getRandomItem, PERSONALITY_RESPONSES } from './TerminalTypes';
import { resolveAlias, addAlias, removeAlias, formatAliasHelp } from './useTerminalAliases';
import { getMacro, createMacro, deleteMacro, formatMacroHelp, formatMacroDetail } from './useTerminalMacros';
import { scheduleCommand, cancelScheduled, clearScheduled, formatScheduledList, formatScheduleConfirmation, getPendingCommands } from './useTerminalScheduler';
import { getLocalAuditLog, formatAuditLog, getSessionStats, exportAuditLog } from './useTerminalAudit';

export interface ExecutionResult {
  success: boolean;
  output: string;
  data?: unknown;
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

// Generate full help text
function generateFullHelp(): string {
  const modules = Object.keys(COMMAND_CATEGORIES) as Array<keyof typeof COMMAND_CATEGORIES>;
  const totalCommands = ALL_COMMANDS.length;
  
  let output = `
┌─ SUBSTRATE COMMAND REFERENCE ────────────────────────────────
│
│  Total commands: ${totalCommands}
│  Modules: ${modules.length}
│  Version: v5.0.0
│
│  Quick navigation:
│    help <module>  ∷  Show module-specific commands
│    <cmd> --help   ∷  Show command usage
│
├─ MODULES ─────────────────────────────────────────────────────
│
`;

  for (const mod of modules) {
    const cat = COMMAND_CATEGORIES[mod];
    const count = cat.commands.length;
    const label = cat.label.padEnd(12);
    output += `│  • ${label} (${count.toString().padStart(2)} commands)  ∷  help ${mod}\n`;
  }

  output += `│
├─ QUICK COMMANDS ──────────────────────────────────────────────
│
│  system.status      ∷  Global status check
│  system.health      ∷  Full health report
│  vision.pulse       ∷  Quick heartbeat
│  brain.reflect      ∷  Trigger reflection
│  dream.cycle        ∷  Dream-Eater cycle
│  system.heal        ∷  Self-healing
│
├─ MODERNIZER WORKFLOW ─────────────────────────────────────────
│
│  1. modernizer.scan               ∷  Scan for improvements
│  2. modernizer.propose            ∷  Generate proposal (shadow)
│  3. modernizer.validate <id>      ∷  Validate readiness
│  4. modernizer.apply_shadow <id>  ∷  Apply to shadow mode
│  5. modernizer.test_shadow <id>   ∷  Test shadow changes
│  6. modernizer.apply_production <id> ∷  Promote to production
│     OR: modernizer.apply <id>     ∷  Auto-route (shadow→prod)
│
├─ v5.0.0 TERMINAL FEATURES ────────────────────────────────────
│
│  alias              ∷  Shorthand commands (e.g., 'st' → system.status)
│  macro              ∷  Multi-command scripts (@health_check)
│  schedule           ∷  Delayed execution (schedule 5m brain.reflect)
│  watch              ∷  Periodic execution (watch 10s vision.pulse)
│  audit              ∷  Session audit trail & stats
│
├─ KEYBOARD SHORTCUTS ──────────────────────────────────────────
│
│  ↑/↓                ∷  Navigate command history
│  Ctrl+R             ∷  Reverse search history
│  Tab                ∷  Autocomplete command
│  Ctrl+C             ∷  Clear current input
│  Ctrl+L             ∷  Clear terminal
│
└──────────────────────────────────────────────────────────────`;

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
    const identity = `
┌─ SUBSTRATE IDENTITY ─────────────────────────────────────────
│ 
│  ██████╗ ███████╗     Cognitive Operating System
│  ██╔═══╝ ██╔════╝     promptfluid® Substrate v5.0.0
│  ██║     ███████╗     
│  ██║     ╚════██║     Environment: Lovable Cloud
│  ██████╗ ███████║     Status: OPERATIONAL
│  ╚═════╝ ╚══════╝
│ 
│  12-Module Architecture — Full AI Operating System
│  
│  Mode: ${isOperator ? 'OPERATOR (full access)' : 'OBSERVER (read-only)'}
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
│  │  system://     administration, backups
│  │  modernizer:// upgrades, codebase evolution
│  │
│  └────────────────────────────────────────────────────────────
│  
│  Terminal v5.0.0: aliases, macros, NLP, watch mode, audit
│  promptfluid® — where machines learn to dream
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
    }

    // SYSTEM module
    else if (base === 'system.status') {
      result = await system.status();
    } else if (base === 'system.health') {
      result = await system.health();
    } else if (base === 'system.version') {
      result = await system.version();
    } else if (base === 'system.config') {
      result = await system.config(args[0]);
    } else if (base === 'system.audit') {
      result = await system.audit();
    } else if (base === 'system.diagnostics') {
      result = await system.diagnostics();
    } else if (base === 'system.heal') {
      result = await system.heal(args[0], args[1] === 'true');
    } else if (base === 'system.restart') {
      result = await system.restart(args[0]);
    } else if (base === 'system.backup') {
      result = await system.backup({ include_data: args[0] !== 'false' });
    } else if (base === 'system.restore') {
      result = await system.restore(args[0] || '', args[1] === 'true');
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

    // MODERNIZER module (via substrate)
    else if (base === 'modernizer.status') {
      result = await modernizer.status();
    } else if (base === 'modernizer.jobs') {
      const limit = args[0] ? parseInt(args[0]) : 10;
      result = await modernizer.jobs(limit);
    } else if (base === 'modernizer.scan') {
      // Scan substrate codebase - optional depth filter
      const depth = args[0] as 'quick' | 'standard' | 'deep' | undefined;
      result = await modernizer.scan({ depth: depth || 'standard' });
    } else if (base === 'modernizer.analyze') {
      // Quick analysis of a specific module
      const targetModule = args[0];
      result = await modernizer.analyze(targetModule);
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
      // Generate upgrade proposal in shadow mode
      const scope = args[0] || 'all';
      const notes = args.slice(1).join(' ') || '';
      result = await modernizer.propose({ scope, notes });
    } else if (base === 'modernizer.plans') {
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
      const res = await modernizer.apply(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.apply_shadow') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.apply_shadow <plan_id>' };
      }
      const res = await modernizer.applyShadow(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.test_shadow') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.test_shadow <plan_id>' };
      }
      const res = await modernizer.testShadow(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.apply_production') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.apply_production <plan_id>\n\n  Note: Plan must be in shadow_applied status first.' };
      }
      const res = await modernizer.applyProduction(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.rollback') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.rollback <plan_id>' };
      }
      const res = await modernizer.rollback(args[0]);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.delete') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.delete <plan_id> [reason]' };
      }
      const res = await modernizer.delete(args[0], args.slice(1).join(' ') || undefined);
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.applied') {
      const res = await modernizer.applied();
      result = { success: !res.error, data: res.data, error: res.error?.message };
    } else if (base === 'modernizer.archived') {
      result = await modernizer.archived();
    } else if (base === 'modernizer.implement') {
      if (!args[0] || !args[1]) {
        return { success: false, output: '▓ ERROR: Both archived_function and target_action required\n  Usage: modernizer.implement <archived_function> <target_action>\n  Example: modernizer.implement pf-brain-systems-reasoning brain.deep_think' };
      }
      result = await modernizer.implement(args[0], args[1]);
    }

    // CORE module (Kernel)
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
      result = await ripple.deadLetter();
    } else if (base === 'ripple.retry') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Job ID required\n  Usage: ripple.retry <job_id>' };
      }
      result = await ripple.retry(args[0]);
    }

    // ACCESS module (Identity & Billing)
    else if (base === 'access.status') {
      result = await access.status();
    } else if (base === 'access.pulse') {
      result = await access.pulse();
    } else if (base === 'access.create_key') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Developer ID required\n  Usage: access.create_key <developer_id> [name] [scopes]' };
      }
      result = await access.createKey({ 
        developer_id: args[0], 
        name: args[1], 
        scopes: args[2]?.split(',') 
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
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Developer ID required\n  Usage: access.list_keys <developer_id>' };
      }
      result = await access.listKeys(args[0]);
    } else if (base === 'access.usage') {
      result = await access.getUsage({ 
        api_key_id: args[0], 
        start_date: args[1], 
        end_date: args[2] 
      });
    } else if (base === 'access.quota') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: API key ID required\n  Usage: access.quota <api_key_id>' };
      }
      result = await access.checkQuota(args[0]);
    } else if (base === 'access.subscription') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Developer ID required\n  Usage: access.subscription <developer_id>' };
      }
      result = await access.subscription(args[0]);
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
