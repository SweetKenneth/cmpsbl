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
    patterns: [/resilience/i, /circuit.*breaker/i, /circuits/i, /open.*circuit/i, /heal.*attempts/i],
    command: 'system.resilience',
    explanation: 'Resilience snapshot with safety switches and heal history',
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
    explanation: 'Generate text with AI via routing spine',
  },
  {
    patterns: [/generate.*image/i, /create.*image/i, /make.*picture/i],
    command: 'nexus.image',
    explanation: 'Generate an image',
  },
  {
    patterns: [/which.*provider/i, /ai.*providers/i, /available.*models/i, /provider.*list/i, /model.*capabilities/i],
    command: 'nexus.providers',
    explanation: 'List AI providers with capabilities',
  },
  {
    patterns: [/ai.*analytics/i, /nexus.*stats/i, /routing.*stats/i, /ai.*usage/i, /token.*usage/i],
    command: 'nexus.analytics',
    explanation: 'AI usage analytics accumulator',
  },
  {
    patterns: [/route.*stats/i, /routing.*analytics/i, /ai.*routing/i],
    command: 'nexus.route_stats',
    explanation: 'AI routing analytics (24h)',
  },
  {
    patterns: [/test.*ai/i, /test.*provider/i, /test.*nexus/i, /quick.*ai.*test/i],
    command: 'nexus.test',
    explanation: 'Test AI provider routing',
  },
  
  // Dreams (v1.1)
  {
    patterns: [/dream.*cycle/i, /run.*dream/i, /execute.*dream/i, /start.*dreaming/i],
    command: 'dream.cycle',
    explanation: 'Execute dream cycle',
  },
  {
    patterns: [/dream.*status/i, /dream.*state/i, /dream-eater/i, /dream.*histogram/i, /dream.*stats/i],
    command: 'dream.status',
    explanation: 'Dream module status with histograms and metabolic data',
  },
  {
    patterns: [/feed.*dream/i, /submit.*dream/i, /had.*dream/i, /new.*dream/i, /dream.*feed/i],
    command: 'dream.feed',
    explanation: 'Feed dream text (auto-classifies type)',
  },
  {
    patterns: [/mood.*decay/i, /dream.*mood/i, /current.*mood/i, /set.*mood/i, /idle.*time/i],
    command: 'dream.mood',
    explanation: 'Get/set mood with decay calculation',
  },
  {
    patterns: [/dream.*anomal/i, /dream.*error/i, /dream.*issue/i, /dream.*problem/i],
    command: 'dream.anomalies',
    explanation: 'View dream anomaly logs',
  },
  {
    patterns: [/awaken/i, /wake.*up/i, /reset.*dream/i, /circadian.*reset/i],
    command: 'dream.awaken',
    explanation: 'Awaken Dream-Eater with reset reason',
  },
  {
    patterns: [/dream.*pulse/i, /dream.*heartbeat/i, /dream.*alive/i],
    command: 'dream.pulse',
    explanation: 'Dream heartbeat with circadian data',
  },
  
  // Evolution
  {
    patterns: [/upgrade/i, /improve/i, /optimize/i, /modernize/i, /scan.*improvements/i, /evolve/i, /evolution/i],
    command: 'evolution.evolve',
    explanation: 'Start Evolution Cycle',
  },
  {
    patterns: [/pending.*upgrades/i, /upgrade.*plans/i, /what.*upgrade/i, /evolution.*status/i, /evolve.*status/i],
    command: 'evolution.evolve status',
    explanation: 'Check evolution status',
  },
  
  // Cortex (Orchestrator module)
  {
    patterns: [/propose/i, /suggest.*improvement/i, /generate.*proposal/i, /improvement.*idea/i, /new.*proposal/i],
    command: 'cortex.propose',
    explanation: 'Generate an improvement proposal',
  },
  {
    patterns: [/evaluate.*proposal/i, /score.*proposal/i, /assess/i, /feasibility/i],
    command: 'cortex.evaluate',
    explanation: 'Evaluate and score a proposal',
  },
  {
    patterns: [/apply.*proposal/i, /execute.*proposal/i, /apply.*change/i, /implement.*proposal/i],
    command: 'cortex.apply',
    explanation: 'Apply approved proposal changes',
  },
  {
    patterns: [/cortex.*status/i, /orchestrat.*status/i, /cascade.*status/i, /proposal.*status/i],
    command: 'cortex.status',
    explanation: 'Cortex orchestrator status',
  },
  {
    patterns: [/cortex.*audit/i, /proposal.*audit/i, /decision.*log/i, /cortex.*history/i],
    command: 'cortex.audit',
    explanation: 'Query Cortex decisions and deltas',
  },
  {
    patterns: [/cortex.*learn/i, /reinforce/i, /outcome.*feedback/i, /proposal.*result/i],
    command: 'cortex.learn',
    explanation: 'Ingest outcome for reinforcement learning',
  },
  {
    patterns: [/cortex.*summary/i, /agency.*summary/i, /cascade.*summary/i, /proposal.*loop/i],
    command: 'cortex.summary',
    explanation: 'Human-readable Cortex context dump',
  },
  {
    patterns: [/rollback.*proposal/i, /undo.*apply/i, /revert.*change/i, /cortex.*rollback/i],
    command: 'cortex.rollback',
    explanation: 'Rollback applied Cortex changes',
  },
  
  // Ripple v2 — Hybrid Event Orchestrator
  {
    patterns: [/ripple.*status/i, /bus.*status/i, /message.*bus/i, /queue.*status/i],
    command: 'ripple.status',
    explanation: 'Ripple bus status with job breakdown',
  },
  {
    patterns: [/pending.*jobs/i, /list.*jobs/i, /job.*queue/i, /show.*jobs/i],
    command: 'ripple.jobs',
    explanation: 'List jobs with filtering',
  },
  {
    patterns: [/dead.*letter/i, /failed.*jobs/i, /dlq/i],
    command: 'ripple.dead_letter',
    explanation: 'View dead-letter queue',
  },
  {
    patterns: [/drain.*queue/i, /process.*all.*jobs/i, /empty.*queue/i],
    command: 'ripple.drain',
    explanation: 'Process all pending jobs in queue',
  },
  {
    patterns: [/work.*job/i, /process.*job/i, /run.*job/i],
    command: 'ripple.work',
    explanation: 'Process job(s) from queue',
  },
  {
    patterns: [/replay.*event/i, /reprocess.*event/i, /retry.*event/i],
    command: 'ripple.replay',
    explanation: 'Re-process events on topic',
  },
  {
    patterns: [/circuit.*breaker/i, /subscriber.*circuit/i, /ripple.*circuit/i],
    command: 'ripple.circuits',
    explanation: 'View subscriber safety switches',
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
  const quickCommands = ['system.status', 'vision.pulse', 'brain.reflect', 'evolution.status'];
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
