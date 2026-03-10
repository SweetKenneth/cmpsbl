/**
 * Natural Language Terminal Interface
 * Translates natural language input into substrate terminal commands
 * 
 * Makes the terminal approachable for non-developers.
 * Thin NL parsing layer over the existing command registry.
 */

export interface NLParseResult {
  input: string;
  command: string | null;
  confidence: number;
  args: Record<string, unknown>;
  alternatives: Array<{ command: string; confidence: number; description: string }>;
  explanation: string;
}

interface CommandPattern {
  patterns: RegExp[];
  command: string;
  description: string;
  extractArgs?: (match: RegExpMatchArray, input: string) => Record<string, unknown>;
}

const COMMAND_PATTERNS: CommandPattern[] = [
  // Brain / Memory
  { patterns: [/\b(?:remember|memorize|store|save)\b.*["'](.+?)["']/i, /\b(?:remember|memorize)\b\s+(.+)/i], command: 'brain.remember', description: 'Store a memory', extractArgs: (m) => ({ content: m[1] }) },
  { patterns: [/\b(?:recall|search|find|look\s*up)\b.*["'](.+?)["']/i, /\bwhat\s+(?:do you|did|does)\s+(?:know|remember)\s+about\s+(.+)/i], command: 'brain.recall', description: 'Search memories', extractArgs: (m) => ({ query: m[1] }) },
  { patterns: [/\b(?:learn|study)\b.*(?:about|from)\s+(.+)/i], command: 'brain.learn', description: 'Learn new content', extractArgs: (m) => ({ content: m[1] }) },
  { patterns: [/\bbrain\s*status\b/i, /\bhow(?:'s| is)\s+(?:the\s+)?brain\b/i, /\bmemory\s*status\b/i], command: 'brain.status', description: 'Check brain status' },
  { patterns: [/\breflect\b/i, /\bself[- ]reflect/i], command: 'brain.reflect', description: 'Run brain reflection' },
  { patterns: [/\boptimize\s+(?:memory|brain)\b/i, /\bclean\s*up\s+memor/i], command: 'brain.optimize', description: 'Optimize brain memory' },

  // System
  { patterns: [/\b(?:system|substrate)\s*status\b/i, /\bhow(?:'s| is)\s+(?:the\s+)?system\b/i, /\bare\s+(?:you|we)\s+(?:ok|healthy|good)\b/i], command: 'system.status', description: 'Check system status' },
  { patterns: [/\bhealth\s*check\b/i, /\bcheck\s+health\b/i, /\bhow\s+healthy\b/i], command: 'system.health', description: 'Run health check' },
  { patterns: [/\bheal\b.*system/i, /\bfix\b.*system/i, /\brepair\b/i], command: 'system.heal', description: 'Heal the system' },
  { patterns: [/\bdiagnostics?\b/i, /\bdiagnose\b/i], command: 'system.diagnostics', description: 'Run diagnostics' },
  { patterns: [/\bversion\b/i, /\bwhat\s+version\b/i], command: 'system.version', description: 'Show version info' },

  // Vision / Monitoring
  { patterns: [/\bmetrics?\b/i, /\bshow\s+(?:me\s+)?stats\b/i], command: 'vision.metrics', description: 'Show system metrics' },
  { patterns: [/\bdashboard\b/i, /\boverview\b/i], command: 'vision.dashboard', description: 'Show dashboard overview' },
  { patterns: [/\bpulse\b/i, /\bheartbeat\b/i, /\bping\b/i], command: 'vision.pulse', description: 'Quick heartbeat check' },
  { patterns: [/\baudit\s*log\b/i, /\bshow\s+audit\b/i], command: 'vision.audit', description: 'Show audit log' },

  // Defense / Security
  { patterns: [/\bsecurity\s*status\b/i, /\bdefense\s*status\b/i, /\bthreat\b/i], command: 'defense.status', description: 'Check security status' },
  { patterns: [/\banomaly\b/i, /\banomalies\b/i, /\bsuspicious\b/i], command: 'defense.anomaly', description: 'Check for anomalies' },
  { patterns: [/\brate\s*limit/i, /\blimits?\b/i], command: 'defense.limits', description: 'Check rate limits' },

  // SEBA / Evolution
  { patterns: [/\bseba\s*status\b/i, /\bevolution\s*status\b/i], command: 'seba.status', description: 'Check SEBA status' },
  { patterns: [/\brun\s+(?:a\s+)?(?:seba\s+)?cycle\b/i, /\bevolve\b/i, /\bstart\s+evolution\b/i], command: 'seba.cycle', description: 'Run SEBA evolution cycle' },
  { patterns: [/\breview\s+proposals?\b/i, /\bpending\s+proposals?\b/i, /\bwhat(?:'s| is)\s+pending\b/i], command: 'seba.review', description: 'Review pending proposals' },

  // Evolution
  { patterns: [/\bmodernize\b/i, /\bupgrade\b/i, /\bscan\s+(?:for\s+)?improvements?\b/i], command: 'evolution.evolve', description: 'Start evolution scan' },
  { patterns: [/\bevolution\s*status\b/i, /\bmodernizer\s*status\b/i], command: 'evolution.status', description: 'Check EVOLUTION status' },

  // Cortex
  { patterns: [/\bcortex\s*status\b/i, /\borchestrator\b/i], command: 'cortex.status', description: 'Check cortex status' },
  { patterns: [/\bsynerg/i, /\blist\s+synergies\b/i], command: 'cortex.synergy.list', description: 'List synergy pipelines' },

  // Mesh / Discovery
  { patterns: [/\bmesh\s*status\b/i, /\bmesh\s*info\b/i], command: 'mesh.status', description: 'Check mesh status' },
  { patterns: [/\bmesh\s*log\b/i, /\bmesh\s*history\b/i, /\bmesh\s*receipts?\b/i], command: 'mesh.log', description: 'Show mesh activity log' },
  { patterns: [/\bmesh\s*discover\b/i, /\bdiscover\s*capabilit/i, /\brun\s+discovery\b/i, /\bgap\s*analysis\b/i], command: 'mesh.discover', description: 'Run capability discovery cycle' },
  { patterns: [/\bmesh\s*gaps?\b/i, /\bcapability\s*gaps?\b/i], command: 'mesh.gaps', description: 'Show capability gaps' },
  { patterns: [/\bmesh\s*recommend/i, /\bcapability\s*recommend/i], command: 'mesh.recommendations', description: 'Show capability recommendations' },
  { patterns: [/\bmesh\s*expand\b/i, /\bexpand\s*(?:mesh|capabilities)\b/i], command: 'mesh.expand', description: 'Expand mesh with recommended capabilities' },
  { patterns: [/\bmesh\s*affinity\b/i, /\bmodule\s*affinity\b/i], command: 'mesh.affinity', description: 'Analyze cross-module affinity' },
  { patterns: [/\bmesh\s*broadcast\b/i], command: 'mesh.broadcast', description: 'Broadcast a mesh intent' },

  // Decode
  { patterns: [/\bdecode\s*status\b/i], command: 'decode.status', description: 'Check decode status' },

  // Dream
  { patterns: [/\bdream\s*(?:cycle|status)\b/i, /\bstart\s+dream/i], command: 'dream.cycle', description: 'Run dream cycle' },

  // Nexus
  { patterns: [/\bnexus\s*status\b/i, /\bai\s*(?:router|routing)\b/i], command: 'nexus.status', description: 'Check nexus status' },
  { patterns: [/\bproviders?\b/i, /\bai\s+providers?\b/i], command: 'nexus.providers', description: 'List AI providers' },

  // Integration
  { patterns: [/\bintegration\s*status\b/i, /\badapters?\b/i], command: 'integration.status', description: 'Check integration status' },

  // Inclusive / Accessibility
  { patterns: [/\baccessibility\b/i, /\ba11y\b/i, /\bwcag\b/i, /\binclusive\b/i], command: 'inclusive.status', description: 'Check accessibility status' },

  // Cron
  { patterns: [/\bcron\s*(?:status|list|jobs)\b/i, /\bscheduled\s+(?:tasks?|jobs?)\b/i], command: 'cron.list', description: 'List cron jobs' },

  // Help
  { patterns: [/\bhelp\b/i, /\bwhat\s+can\s+(?:you|i)\s+do\b/i, /\bcommands?\b/i], command: 'help', description: 'Show available commands' },
];

class NLTerminal {
  private static instance: NLTerminal;
  private parseHistory: NLParseResult[] = [];

  private constructor() {}

  static getInstance(): NLTerminal {
    if (!NLTerminal.instance) {
      NLTerminal.instance = new NLTerminal();
    }
    return NLTerminal.instance;
  }

  /** Parse natural language input into a command */
  parse(input: string): NLParseResult {
    const trimmed = input.trim();

    // Check if it's already a valid command (module.action format)
    if (/^[a-z]+\.[a-z_.]+/i.test(trimmed) && !trimmed.includes(' ')) {
      const result: NLParseResult = {
        input: trimmed,
        command: trimmed.toLowerCase(),
        confidence: 1.0,
        args: {},
        alternatives: [],
        explanation: `Direct command: ${trimmed}`,
      };
      this.parseHistory.push(result);
      return result;
    }

    // Pattern matching
    const matches: Array<{ pattern: CommandPattern; match: RegExpMatchArray; confidence: number }> = [];

    for (const pattern of COMMAND_PATTERNS) {
      for (const regex of pattern.patterns) {
        const match = trimmed.match(regex);
        if (match) {
          // Calculate confidence based on match specificity
          const matchLength = match[0].length;
          const confidence = Math.min(0.95, 0.5 + (matchLength / trimmed.length) * 0.5);
          matches.push({ pattern, match, confidence });
        }
      }
    }

    // Sort by confidence
    matches.sort((a, b) => b.confidence - a.confidence);

    if (matches.length === 0) {
      // Fuzzy fallback — suggest closest commands
      const suggestions = this.fuzzyMatch(trimmed);
      const result: NLParseResult = {
        input: trimmed,
        command: null,
        confidence: 0,
        args: {},
        alternatives: suggestions,
        explanation: `Could not parse "${trimmed}". Did you mean one of these?`,
      };
      this.parseHistory.push(result);
      return result;
    }

    const best = matches[0];
    const args = best.pattern.extractArgs?.(best.match, trimmed) || {};

    const result: NLParseResult = {
      input: trimmed,
      command: best.pattern.command,
      confidence: best.confidence,
      args,
      alternatives: matches.slice(1, 4).map(m => ({
        command: m.pattern.command,
        confidence: m.confidence,
        description: m.pattern.description,
      })),
      explanation: `Interpreted as: ${best.pattern.command} (${best.pattern.description})`,
    };

    this.parseHistory.push(result);
    if (this.parseHistory.length > 100) this.parseHistory.shift();
    return result;
  }

  /** Check if input looks like natural language vs a command */
  isNaturalLanguage(input: string): boolean {
    const trimmed = input.trim();
    // Already a command
    if (/^[a-z]+\.[a-z_.]+$/i.test(trimmed)) return false;
    // Contains spaces or question marks
    if (trimmed.includes(' ') || trimmed.includes('?')) return true;
    // Starts with common NL starters
    if (/^(what|how|show|check|run|start|get|is|can|do|list|find|search)/i.test(trimmed)) return true;
    return false;
  }

  /** Get parse history */
  history(limit = 20): NLParseResult[] {
    return this.parseHistory.slice(-limit);
  }

  /** Get all known patterns for help display */
  getKnownIntents(): Array<{ command: string; description: string; examples: string[] }> {
    const seen = new Set<string>();
    const intents: Array<{ command: string; description: string; examples: string[] }> = [];

    for (const pattern of COMMAND_PATTERNS) {
      if (seen.has(pattern.command)) continue;
      seen.add(pattern.command);
      intents.push({
        command: pattern.command,
        description: pattern.description,
        examples: pattern.patterns.map(r => r.source.replace(/\\b/g, '').replace(/\(.*?\)/g, '...').slice(0, 40)),
      });
    }

    return intents;
  }

  private fuzzyMatch(input: string): NLParseResult['alternatives'] {
    const words = input.toLowerCase().split(/\s+/);
    const scores: Array<{ command: string; description: string; score: number }> = [];

    for (const pattern of COMMAND_PATTERNS) {
      let score = 0;
      const cmdWords = pattern.command.split('.').concat(pattern.description.toLowerCase().split(/\s+/));
      
      for (const word of words) {
        for (const cmdWord of cmdWords) {
          if (cmdWord.includes(word) || word.includes(cmdWord)) {
            score += word.length;
          }
        }
      }

      if (score > 0) {
        scores.push({ command: pattern.command, description: pattern.description, score });
      }
    }

    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(s => ({
        command: s.command,
        confidence: Math.min(0.5, s.score / (input.length * 0.5)),
        description: s.description,
      }));
  }
}

export const nlTerminal = NLTerminal.getInstance();
