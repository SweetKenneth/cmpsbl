/**
 * Natural Language to Command Translation
 * Smart suggestions based on context
 */

import { ALL_COMMANDS, type CommandDefinition } from './TerminalCommands';

interface NLPMatch {
  command: string;
  confidence: number;
  explanation: string;
}

// Intent patterns mapped to commands
const INTENT_PATTERNS: Array<{
  patterns: RegExp[];
  command: string;
  explanation: string;
}> = [
  // Health & Status
  {
    patterns: [/how.*system/i, /system.*ok/i, /everything.*working/i, /status/i, /what.*state/i],
    command: 'system.status',
    explanation: 'Check overall system status',
  },
  {
    patterns: [/health/i, /healthy/i, /diagnostics/i, /check.*everything/i],
    command: 'system.health',
    explanation: 'Full health diagnostic',
  },
  {
    patterns: [/quick.*check/i, /pulse/i, /heartbeat/i, /alive/i],
    command: 'vision.pulse',
    explanation: 'Quick system pulse check',
  },
  
  // Memory & Brain
  {
    patterns: [/remember/i, /store.*memory/i, /save.*fact/i, /learn.*that/i],
    command: 'brain.remember',
    explanation: 'Store a new memory',
  },
  {
    patterns: [/what.*know.*about/i, /recall/i, /find.*memory/i, /search.*memory/i],
    command: 'brain.recall',
    explanation: 'Search memories',
  },
  {
    patterns: [/reflect/i, /think.*about/i, /process.*memories/i, /consolidate/i],
    command: 'brain.reflect',
    explanation: 'Trigger reflection cycle',
  },
  {
    patterns: [/brain.*status/i, /cognitive.*state/i, /memory.*stats/i],
    command: 'brain.status',
    explanation: 'Brain module status',
  },
  
  // Security
  {
    patterns: [/security/i, /threats/i, /defense.*status/i, /under.*attack/i],
    command: 'defense.posture',
    explanation: 'Security posture summary',
  },
  {
    patterns: [/anomaly/i, /anomalies/i, /unusual/i, /suspicious/i, /weird.*activity/i],
    command: 'defense.anomaly_probe',
    explanation: 'Anomaly detection',
  },
  {
    patterns: [/ip.*reputation/i, /check.*ip/i, /is.*ip.*safe/i],
    command: 'defense.reputation',
    explanation: 'Check IP reputation',
  },
  
  // AI & Generation
  {
    patterns: [/generate.*text/i, /write.*something/i, /create.*text/i, /ai.*write/i],
    command: 'nexus.text',
    explanation: 'Generate text with AI',
  },
  {
    patterns: [/generate.*image/i, /create.*image/i, /make.*picture/i],
    command: 'nexus.image',
    explanation: 'Generate an image',
  },
  {
    patterns: [/which.*provider/i, /ai.*providers/i, /available.*models/i],
    command: 'nexus.providers',
    explanation: 'List AI providers',
  },
  
  // Dreams
  {
    patterns: [/dream/i, /dreaming/i, /dream.*cycle/i, /imagination/i],
    command: 'dream.cycle',
    explanation: 'Execute dream cycle',
  },
  {
    patterns: [/dream.*status/i, /dream.*state/i, /dream-eater/i],
    command: 'dream.status',
    explanation: 'Dream module status',
  },
  
  // Modernizer
  {
    patterns: [/upgrade/i, /improve/i, /optimize/i, /modernize/i, /scan.*improvements/i],
    command: 'modernizer.scan',
    explanation: 'Scan for improvements',
  },
  {
    patterns: [/pending.*upgrades/i, /upgrade.*plans/i, /what.*upgrade/i],
    command: 'modernizer.plans',
    explanation: 'List upgrade plans',
  },
  
  // System Management
  {
    patterns: [/heal/i, /fix/i, /repair/i, /auto.*fix/i, /self.*heal/i],
    command: 'system.heal',
    explanation: 'Trigger self-healing',
  },
  {
    patterns: [/backup/i, /save.*state/i, /snapshot/i],
    command: 'system.backup',
    explanation: 'Create backup',
  },
  {
    patterns: [/restart/i, /reboot/i, /reset/i],
    command: 'system.restart',
    explanation: 'Restart services',
  },
  
  // Logs & Monitoring
  {
    patterns: [/logs/i, /show.*logs/i, /recent.*activity/i, /what.*happened/i],
    command: 'vision.logs',
    explanation: 'View system logs',
  },
  {
    patterns: [/metrics/i, /statistics/i, /numbers/i, /performance/i],
    command: 'vision.metrics',
    explanation: 'View system metrics',
  },
  
  // Help
  {
    patterns: [/help/i, /commands/i, /what.*can.*do/i, /how.*use/i],
    command: 'help',
    explanation: 'Show available commands',
  },
  {
    patterns: [/clear/i, /clean.*screen/i, /reset.*terminal/i],
    command: 'clear',
    explanation: 'Clear terminal',
  },
];

export function translateNaturalLanguage(input: string): NLPMatch[] {
  const matches: NLPMatch[] = [];
  const inputLower = input.toLowerCase().trim();
  
  // Skip if it looks like a direct command
  if (inputLower.includes('.') && !inputLower.includes(' ')) {
    return [];
  }
  
  for (const intent of INTENT_PATTERNS) {
    for (const pattern of intent.patterns) {
      if (pattern.test(inputLower)) {
        const confidence = calculateConfidence(inputLower, pattern);
        matches.push({
          command: intent.command,
          confidence,
          explanation: intent.explanation,
        });
        break; // Only match once per intent
      }
    }
  }
  
  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);
  
  // Return top matches
  return matches.slice(0, 3);
}

function calculateConfidence(input: string, pattern: RegExp): number {
  const match = input.match(pattern);
  if (!match) return 0;
  
  // Base confidence on how much of the input matched
  const matchLength = match[0].length;
  const inputLength = input.length;
  
  return Math.min(0.5 + (matchLength / inputLength) * 0.5, 0.95);
}

export function suggestFromContext(
  recentCommands: string[],
  currentInput: string
): CommandDefinition[] {
  // Extract recently used modules
  const recentModules = new Set<string>();
  recentCommands.slice(-10).forEach(cmd => {
    const parts = cmd.split('.');
    if (parts.length > 1) {
      recentModules.add(parts[0]);
    }
  });
  
  // If user started typing, filter by that
  if (currentInput.trim()) {
    return ALL_COMMANDS.filter(cmd => 
      cmd.command.toLowerCase().includes(currentInput.toLowerCase()) ||
      cmd.description.toLowerCase().includes(currentInput.toLowerCase())
    ).slice(0, 10);
  }
  
  // Otherwise, suggest based on recent usage + common commands
  const suggestions: CommandDefinition[] = [];
  
  // Add commands from recently used modules
  recentModules.forEach(mod => {
    const moduleCmds = ALL_COMMANDS.filter(c => c.category === mod);
    suggestions.push(...moduleCmds.slice(0, 2));
  });
  
  // Add common quick commands
  const quickCommands = ['system.status', 'vision.pulse', 'brain.reflect', 'modernizer.status'];
  quickCommands.forEach(qc => {
    const cmd = ALL_COMMANDS.find(c => c.command === qc);
    if (cmd && !suggestions.includes(cmd)) {
      suggestions.push(cmd);
    }
  });
  
  return suggestions.slice(0, 8);
}

export function formatNLPSuggestions(matches: NLPMatch[]): string {
  if (matches.length === 0) {
    return '';
  }
  
  let output = `
┌─ SUGGESTED COMMANDS ─────────────────────────────────────────
│
`;

  matches.forEach((match, i) => {
    const conf = Math.round(match.confidence * 100);
    output += `│  ${i + 1}. ${match.command.padEnd(25)} (${conf}% match)\n`;
    output += `│     ${match.explanation}\n`;
  });

  output += `│
│  Press number to execute or type command directly
└──────────────────────────────────────────────────────────────`;
  return output;
}

export function getAutoFixSuggestion(errorMessage: string): NLPMatch | null {
  const errorLower = errorMessage.toLowerCase();
  
  if (errorLower.includes('memory') || errorLower.includes('brain')) {
    return {
      command: 'brain.optimize',
      confidence: 0.7,
      explanation: 'Optimize brain memory to fix issues',
    };
  }
  
  if (errorLower.includes('health') || errorLower.includes('degraded')) {
    return {
      command: 'system.heal',
      confidence: 0.8,
      explanation: 'Trigger self-healing to restore health',
    };
  }
  
  if (errorLower.includes('connection') || errorLower.includes('timeout')) {
    return {
      command: 'system.restart',
      confidence: 0.6,
      explanation: 'Restart services to restore connections',
    };
  }
  
  if (errorLower.includes('security') || errorLower.includes('threat')) {
    return {
      command: 'defense.posture',
      confidence: 0.75,
      explanation: 'Check security posture',
    };
  }
  
  return null;
}
