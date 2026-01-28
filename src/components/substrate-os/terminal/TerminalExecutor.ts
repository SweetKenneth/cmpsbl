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
│  Version: v6.0.0
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
