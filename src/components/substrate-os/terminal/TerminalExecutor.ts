/**
 * Terminal Command Executor
 * Handles parsing and execution of all substrate commands
 */

import { substrate, brain, decode, defense, nexus, vision, dream, system, modernizer } from '@/lib/substrate';
import { supabase } from '@/integrations/supabase/client';
import { ALL_COMMANDS, COMMAND_CATEGORIES, type CommandDefinition } from './TerminalCommands';
import { getRandomItem, PERSONALITY_RESPONSES } from './TerminalTypes';

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
    const label = cat.label.padEnd(10);
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
├─ KEYBOARD SHORTCUTS ──────────────────────────────────────────
│
│  ↑/↓                ∷  Navigate command history
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
│  ██████╗ ███████╗     Cognitive Orchestration
│  ██╔═══╝ ██╔════╝     Substrate v2026.01
│  ██║     ███████╗     
│  ██║     ╚════██║     Environment: Lovable Cloud
│  ██████╗ ███████║     Status: OPERATIONAL
│  ╚═════╝ ╚══════╝     
│ 
│  promptfluid® — where machines learn to dream
│  
│  Modules: Brain, Decode, Defense, Nexus, Vision, Dream, System
│  Mode: ${isOperator ? 'OPERATOR (full access)' : 'OBSERVER (read-only)'}
│  
│  Endpoints:
│    substrate://brain     memory + cognition
│    substrate://decode    interpretation
│    substrate://defense   security
│    substrate://nexus     AI routing
│    substrate://vision    observability
│    substrate://dream     dream-eater
│    substrate://system    administration
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
    } else if (base === 'modernizer.apply') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.apply <plan_id>' };
      }
      result = await modernizer.apply(args[0]);
    } else if (base === 'modernizer.rollback') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.rollback <plan_id>' };
      }
      result = await modernizer.rollback(args[0]);
    } else if (base === 'modernizer.delete') {
      if (!args[0]) {
        return { success: false, output: '▓ ERROR: Plan ID required\n  Usage: modernizer.delete <plan_id> [reason]' };
      }
      result = await modernizer.delete(args[0], args.slice(1).join(' ') || undefined);
    } else if (base === 'modernizer.archived') {
      result = await modernizer.archived();
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
