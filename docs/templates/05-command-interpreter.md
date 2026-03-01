# Command Interpreter

> Zero-dependency, drop-in multi-modal input parser that classifies natural language, terminal commands, slash commands, JSON payloads, and code blocks into structured intents with confidence scoring.

## What It Does

Parses any text input and classifies it by modality (natural language, terminal, code, structured data, hybrid), matches it against intent patterns, extracts arguments, and returns confidence-ranked interpretations with alternatives. Fully extensible with custom patterns.

## Use Cases

- **AI chatbots** — Understand user intent before routing to handlers
- **CLI tools** — Parse mixed natural language + flag-based commands
- **Developer tools** — Detect code, JSON, slash commands in input
- **Workflow automation** — Route inputs to the right processor
- **Internal tools** — Build Slack-like command interfaces

## Drop-In Instructions

1. Copy into `src/lib/command-interpreter.ts`
2. Optionally add custom patterns
3. Interpret any input string

```typescript
import { createCommandInterpreter } from './command-interpreter';

const interpreter = createCommandInterpreter();

// Natural language
interpreter.interpret("How do I deploy to production?");
// → { intent: 'question', modality: 'natural_language', confidence: 'high' }

// Terminal command
interpreter.interpret("deploy.run --env production --force");
// → { intent: 'command', modality: 'terminal', args: { env: 'production', force: true } }

// Slash command
interpreter.interpret("/search latest logs");
// → { intent: 'slash_command', args: { command: 'search', rawArgs: 'latest logs' } }

// JSON payload
interpreter.interpret('{"action": "create", "name": "my-project"}');
// → { intent: 'structured_input', modality: 'structured_data', args: { payload: {...} } }

// Code block
interpreter.interpret('```typescript\nconst x = 42;\n```');
// → { intent: 'code_submission', args: { language: 'typescript', code: 'const x = 42;' } }

// Custom patterns
const custom = createCommandInterpreter([
  {
    pattern: /^deploy\s+(\w+)\s+to\s+(\w+)$/i,
    intent: 'deploy',
    module: 'ops',
    action: 'deploy',
    extract: (m) => ({ service: m[1], environment: m[2] }),
  },
]);

custom.interpret("deploy api to staging");
// → { intent: 'deploy', module: 'ops', action: 'deploy', args: { service: 'api', environment: 'staging' } }
```

## Full Source

```typescript
/**
 * Command Interpreter — Multi-modal input parser with intent classification
 * Zero dependencies. Works in any TypeScript/JavaScript project.
 */

// ━━━ Types ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

type InputModality = 'natural_language' | 'terminal' | 'code' | 'structured_data' | 'hybrid';
type IntentConfidence = 'high' | 'medium' | 'low' | 'ambiguous';

interface InterpretedInput {
  raw: string;
  modality: InputModality;
  intent: string;
  confidence: IntentConfidence;
  confidenceScore: number;
  module?: string;
  action?: string;
  args: Record<string, unknown>;
  alternatives: Array<{ intent: string; confidence: number }>;
  metadata: {
    wordCount: number;
    hasCode: boolean;
    hasJson: boolean;
    detectedAt: number;
  };
}

interface IntentPattern {
  pattern: RegExp;
  intent: string;
  module?: string;
  action?: string;
  extract?: (match: RegExpMatchArray) => Record<string, unknown>;
}

// ━━━ Engine ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function createCommandInterpreter(customPatterns?: IntentPattern[]) {
  const patterns: IntentPattern[] = [
    {
      pattern: /^(\w+)\.(\w+)\s*(.*)?$/,
      intent: 'command',
      extract: (m) => ({ ...parseTerminalArgs(m[3] ?? ''), _module: m[1], _action: m[2] }),
    },
    {
      pattern: /^\/(\w+)\s*(.*)?$/,
      intent: 'slash_command',
      extract: (m) => ({ command: m[1], rawArgs: m[2]?.trim() ?? '' }),
    },
    {
      pattern: /^\s*\{[\s\S]*\}\s*$/,
      intent: 'structured_input',
      extract: (m) => {
        try { return { payload: JSON.parse(m[0]), valid: true }; }
        catch { return { payload: m[0], valid: false }; }
      },
    },
    {
      pattern: /```(\w+)?\n([\s\S]+?)```/,
      intent: 'code_submission',
      extract: (m) => ({ language: m[1] ?? 'unknown', code: m[2].trim() }),
    },
    {
      pattern: /^(what|how|why|when|where|who|can|does|is|are|will|should)\b/i,
      intent: 'question',
      extract: () => ({}),
    },
    {
      pattern: /^(create|build|make|add|remove|delete|update|fix|deploy|run|start|stop)\b/i,
      intent: 'action_request',
      extract: (m) => ({ verb: m[1].toLowerCase() }),
    },
    ...(customPatterns ?? []),
  ];

  function parseTerminalArgs(raw: string): Record<string, unknown> {
    const args: Record<string, unknown> = { _positional: [] as string[] };
    const tokens = raw.match(/--\w+\s+'[^']*'|--\w+\s+"[^"]*"|--\w+\s+\S+|--\w+|\S+/g) ?? [];
    for (const token of tokens) {
      const flagMatch = token.match(/^--(\w+)\s+['"]?(.+?)['"]?$/);
      if (flagMatch) args[flagMatch[1]] = flagMatch[2];
      else if (token.startsWith('--')) args[token.slice(2)] = true;
      else (args._positional as string[]).push(token);
    }
    return args;
  }

  function detectModality(input: string): InputModality {
    const t = input.trim();
    if (/^\w+\.\w+/.test(t) || /^\/\w+/.test(t)) return 'terminal';
    if (/^\s*\{[\s\S]*\}$/.test(t)) return 'structured_data';
    if (/```/.test(t)) return 'code';
    if ((t.match(/[{};=()=>]/g) ?? []).length > 5 && t.split('\n').length > 2) return 'code';
    if (/\{.*\}/.test(t) && /\b(what|how|create)\b/i.test(t)) return 'hybrid';
    return 'natural_language';
  }

  function interpret(input: string): InterpretedInput {
    const trimmed = input.trim();
    const modality = detectModality(trimmed);
    const alternatives: Array<{ intent: string; confidence: number }> = [];
    let best = {
      intent: 'unknown',
      confidence: 0.3,
      args: {} as Record<string, unknown>,
      module: undefined as string | undefined,
      action: undefined as string | undefined,
    };

    for (const p of patterns) {
      const match = trimmed.match(p.pattern);
      if (match) {
        const extracted = p.extract?.(match) ?? {};
        const conf =
          modality === 'terminal' && p.intent === 'command'
            ? 0.95
            : modality === 'structured_data' && p.intent === 'structured_input'
            ? 0.9
            : 0.75;
        if (conf > best.confidence) {
          if (best.confidence > 0.3) alternatives.push({ intent: best.intent, confidence: best.confidence });
          best = {
            intent: p.intent,
            confidence: conf,
            module: p.module ?? (extracted._module as string),
            action: p.action ?? (extracted._action as string),
            args: extracted,
          };
        } else {
          alternatives.push({ intent: p.intent, confidence: conf });
        }
      }
    }

    return {
      raw: trimmed,
      modality,
      intent: best.intent,
      confidence:
        best.confidence >= 0.85 ? 'high'
        : best.confidence >= 0.6 ? 'medium'
        : best.confidence >= 0.4 ? 'low'
        : 'ambiguous',
      confidenceScore: best.confidence,
      module: best.module,
      action: best.action,
      args: best.args,
      alternatives: alternatives.sort((a, b) => b.confidence - a.confidence).slice(0, 3),
      metadata: {
        wordCount: trimmed.split(/\s+/).length,
        hasCode: /```|function |const |=>/.test(trimmed),
        hasJson: /\{[\s\S]*\}/.test(trimmed),
        detectedAt: Date.now(),
      },
    };
  }

  return { interpret, detectModality };
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `createCommandInterpreter(patterns?)` | Create interpreter with optional custom patterns |
| `interpret(input)` | Parse input → structured intent with confidence |
| `detectModality(input)` | Classify input type without full interpretation |

## Supported Modalities

| Modality | Example |
|----------|---------|
| `terminal` | `deploy.run --env prod` |
| `slash_command` | `/search latest errors` |
| `structured_data` | `{"action": "create"}` |
| `code` | `` ```ts\nconst x = 1;\n``` `` |
| `natural_language` | `How do I fix this?` |
| `hybrid` | `Create a {name: "test"} config` |

## License

MIT — Drop in anywhere.
