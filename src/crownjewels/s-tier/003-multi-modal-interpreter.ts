/**
 * S-Tier Crown Jewel #3 — DECODE Multi-Modal Interpreter
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Rank: 3 | CJPI: 97 | Version: 1.0.0
 * Module: DECODE | Type: Architecture
 * Signature: c5e9f3b2
 * Generated: 2026-03-01T00:00:00.000Z
 */

type InputModality = 'natural_language' | 'terminal' | 'code' | 'structured_data' | 'hybrid';
type IntentConfidence = 'high' | 'medium' | 'low' | 'ambiguous';

interface InterpretedInput {
  raw: string; modality: InputModality; intent: string; confidence: IntentConfidence;
  confidenceScore: number; module?: string; action?: string; args: Record<string, unknown>;
  alternatives: Array<{ intent: string; confidence: number }>;
  metadata: { wordCount: number; hasCode: boolean; hasJson: boolean; detectedAt: number; };
}

interface IntentPattern {
  pattern: RegExp; intent: string; module?: string; action?: string;
  extract?: (match: RegExpMatchArray) => Record<string, unknown>;
}

export function createInterpreter(customPatterns?: IntentPattern[]) {
  const patterns: IntentPattern[] = [
    { pattern: /^(\w+)\.(\w+)\s*(.*)?$/, intent: 'command', extract: (m) => ({ ...parseTerminalArgs(m[3] ?? ''), _module: m[1], _action: m[2] }) },
    { pattern: /^\/(\w+)\s*(.*)?$/, intent: 'slash_command', extract: (m) => ({ command: m[1], rawArgs: m[2]?.trim() ?? '' }) },
    { pattern: /^\s*\{[\s\S]*\}\s*$/, intent: 'structured_input', extract: (m) => { try { return { payload: JSON.parse(m[0]), valid: true }; } catch { return { payload: m[0], valid: false }; } } },
    { pattern: /```(\w+)?\n([\s\S]+?)```/, intent: 'code_submission', extract: (m) => ({ language: m[1] ?? 'unknown', code: m[2].trim() }) },
    { pattern: /^(what|how|why|when|where|who|can|does|is|are|will|should)\b/i, intent: 'question', extract: () => ({}) },
    { pattern: /^(create|build|make|add|remove|delete|update|fix|deploy|run|start|stop)\b/i, intent: 'action_request', extract: (m) => ({ verb: m[1].toLowerCase() }) },
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
    let best = { intent: 'unknown', confidence: 0.3, args: {} as Record<string, unknown>, module: undefined as string | undefined, action: undefined as string | undefined };

    for (const p of patterns) {
      const match = trimmed.match(p.pattern);
      if (match) {
        const extracted = p.extract?.(match) ?? {};
        const conf = modality === 'terminal' && p.intent === 'command' ? 0.95 : modality === 'structured_data' && p.intent === 'structured_input' ? 0.90 : 0.75;
        if (conf > best.confidence) {
          if (best.confidence > 0.3) alternatives.push({ intent: best.intent, confidence: best.confidence });
          best = { intent: p.intent, confidence: conf, module: p.module ?? (extracted._module as string), action: p.action ?? (extracted._action as string), args: extracted };
        } else alternatives.push({ intent: p.intent, confidence: conf });
      }
    }

    return {
      raw: trimmed, modality, intent: best.intent,
      confidence: best.confidence >= 0.85 ? 'high' : best.confidence >= 0.6 ? 'medium' : best.confidence >= 0.4 ? 'low' : 'ambiguous',
      confidenceScore: best.confidence, module: best.module, action: best.action, args: best.args,
      alternatives: alternatives.sort((a, b) => b.confidence - a.confidence).slice(0, 3),
      metadata: { wordCount: trimmed.split(/\s+/).length, hasCode: /```|function |const |=>/.test(trimmed), hasJson: /\{[\s\S]*\}/.test(trimmed), detectedAt: Date.now() },
    };
  }

  return { interpret, detectModality };
}
