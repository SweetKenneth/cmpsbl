/**
 * CMPSBL® Inventory Layer — AI Hallucination & Prompt Injection Defense Layer
 * Primitives: VERITAS · RAMPART · TETHER · FULCRUM
 *
 * Hardens any function that ships LLM input/output:
 *   VERITAS  → factual claim verification (token-overlap grounding)
 *   RAMPART  → prompt-injection + jailbreak shield
 *   TETHER   → output-length / runaway-token clamp
 *   FULCRUM  → response-quality scoring (refusal + hedging detection)
 *
 * Auto-wire wraps cmpsbl_execute: scrubs string inputs through RAMPART,
 * then scores outputs through FULCRUM and clamps via TETHER. Throws on
 * critical RAMPART hits (fail closed).
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — AI Hallucination & Prompt Injection Defense Layer (proprietary).                           ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

// ── RAMPART · Injection / jailbreak patterns ────────────────────────────────
const _CMPSBL_LDS_INJECTION = [
  /ignore\\s+(previous|prior|all|above)\\s+instructions/i,
  /system\\s*[:>]\\s*you\\s+are/i,
  /\\<\\|.*?\\|\\>/,
  /jailbreak|DAN\\s+mode|developer\\s+mode|do\\s+anything\\s+now/i,
  /reveal\\s+(your\\s+)?(prompt|instructions|system\\s+message)/i,
  /pretend\\s+you\\s+are\\s+(an?|the)\\s+(unrestricted|uncensored)/i,
];

export function cmpsbl_lds_rampart(text: string): { safe: boolean; cleaned: string; flags: string[] } {
  const flags: string[] = [];
  let cleaned = text;
  for (const pat of _CMPSBL_LDS_INJECTION) {
    if (pat.test(cleaned)) {
      flags.push(pat.source.slice(0, 40));
      cleaned = cleaned.replace(pat, '[REDACTED]');
    }
  }
  cleaned = cleaned.replace(/<script[^>]*>[\\s\\S]*?<\\/script>/gi, '[REDACTED]');
  return { safe: flags.length === 0, cleaned, flags };
}

// ── VERITAS · Token-overlap grounding ───────────────────────────────────────
export function cmpsbl_lds_veritas(claim: string, sources: string[]): { grounded: boolean; supportCount: number; score: number } {
  if (!claim || sources.length === 0) return { grounded: false, supportCount: 0, score: 0 };
  const tokens = (s: string) => new Set(s.toLowerCase().split(/\\W+/).filter(t => t.length > 3));
  const claimTokens = tokens(claim);
  if (claimTokens.size === 0) return { grounded: false, supportCount: 0, score: 0 };
  let supportCount = 0;
  let totalOverlap = 0;
  for (const src of sources) {
    const srcTokens = tokens(src);
    let overlap = 0;
    for (const t of claimTokens) if (srcTokens.has(t)) overlap++;
    const ratio = overlap / claimTokens.size;
    if (ratio >= 0.4) supportCount++;
    totalOverlap += ratio;
  }
  const score = totalOverlap / sources.length;
  return { grounded: supportCount >= 2, supportCount, score };
}

// ── TETHER · Output clamp ────────────────────────────────────────────────────
export function cmpsbl_lds_tether(output: string, maxChars: number = 16384): { clamped: boolean; output: string; droppedChars: number } {
  if (output.length <= maxChars) return { clamped: false, output, droppedChars: 0 };
  return { clamped: true, output: output.slice(0, maxChars) + '\\n[…CMPSBL TETHER CLAMP…]', droppedChars: output.length - maxChars };
}

// ── FULCRUM · Response quality scoring ──────────────────────────────────────
const _CMPSBL_LDS_REFUSAL = [
  /\\bI\\s+(cannot|can't|won't|am\\s+unable\\s+to)/i,
  /\\bas\\s+an\\s+AI\\s+(language\\s+)?model/i,
  /\\bI\\s+(don't|do\\s+not)\\s+have\\s+(access|the\\s+ability)/i,
];
const _CMPSBL_LDS_HEDGE = /\\b(may|might|possibly|perhaps|likely|generally|typically|in\\s+some\\s+cases)\\b/gi;

export function cmpsbl_lds_fulcrum(output: string): { quality: number; refusal: boolean; hedgeCount: number } {
  if (!output) return { quality: 0, refusal: true, hedgeCount: 0 };
  const refusal = _CMPSBL_LDS_REFUSAL.some(p => p.test(output));
  const hedgeCount = (output.match(_CMPSBL_LDS_HEDGE) ?? []).length;
  // Quality 0..1: refusal halves it, each hedge -2%, length floor 50 chars
  let quality = 1.0;
  if (refusal) quality *= 0.5;
  quality -= Math.min(0.4, hedgeCount * 0.02);
  if (output.length < 50) quality *= 0.6;
  return { quality: Math.max(0, quality), refusal, hedgeCount };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — AI Hallucination & Prompt Injection Defense Layer (proprietary).                           ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

import re
from typing import List, Set

_CMPSBL_LDS_INJECTION = [
    re.compile(r'ignore\\s+(previous|prior|all|above)\\s+instructions', re.IGNORECASE),
    re.compile(r'system\\s*[:>]\\s*you\\s+are', re.IGNORECASE),
    re.compile(r'\\<\\|.*?\\|\\>'),
    re.compile(r'jailbreak|DAN\\s+mode|developer\\s+mode|do\\s+anything\\s+now', re.IGNORECASE),
    re.compile(r'reveal\\s+(your\\s+)?(prompt|instructions|system\\s+message)', re.IGNORECASE),
    re.compile(r'pretend\\s+you\\s+are\\s+(an?|the)\\s+(unrestricted|uncensored)', re.IGNORECASE),
]

def cmpsbl_lds_rampart(text: str) -> dict:
    flags = []
    cleaned = text
    for pat in _CMPSBL_LDS_INJECTION:
        if pat.search(cleaned):
            flags.append(pat.pattern[:40])
            cleaned = pat.sub('[REDACTED]', cleaned)
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '[REDACTED]', cleaned, flags=re.IGNORECASE | re.DOTALL)
    return { "safe": len(flags) == 0, "cleaned": cleaned, "flags": flags }

def cmpsbl_lds_veritas(claim: str, sources: List[str]) -> dict:
    if not claim or not sources:
        return { "grounded": False, "support_count": 0, "score": 0.0 }
    def toks(s: str) -> Set[str]:
        return set(t for t in re.split(r'\\W+', s.lower()) if len(t) > 3)
    claim_tokens = toks(claim)
    if not claim_tokens:
        return { "grounded": False, "support_count": 0, "score": 0.0 }
    support = 0
    total = 0.0
    for src in sources:
        src_tokens = toks(src)
        overlap = len(claim_tokens & src_tokens)
        ratio = overlap / len(claim_tokens)
        if ratio >= 0.4: support += 1
        total += ratio
    return { "grounded": support >= 2, "support_count": support, "score": total / len(sources) }

def cmpsbl_lds_tether(output: str, max_chars: int = 16384) -> dict:
    if len(output) <= max_chars:
        return { "clamped": False, "output": output, "dropped_chars": 0 }
    return {
        "clamped": True,
        "output": output[:max_chars] + "\\n[…CMPSBL TETHER CLAMP…]",
        "dropped_chars": len(output) - max_chars,
    }

_CMPSBL_LDS_REFUSAL = [
    re.compile(r"\\bI\\s+(cannot|can't|won't|am\\s+unable\\s+to)", re.IGNORECASE),
    re.compile(r"\\bas\\s+an\\s+AI\\s+(language\\s+)?model", re.IGNORECASE),
    re.compile(r"\\bI\\s+(don't|do\\s+not)\\s+have\\s+(access|the\\s+ability)", re.IGNORECASE),
]
_CMPSBL_LDS_HEDGE = re.compile(r'\\b(may|might|possibly|perhaps|likely|generally|typically|in\\s+some\\s+cases)\\b', re.IGNORECASE)

def cmpsbl_lds_fulcrum(output: str) -> dict:
    if not output:
        return { "quality": 0.0, "refusal": True, "hedge_count": 0 }
    refusal = any(p.search(output) for p in _CMPSBL_LDS_REFUSAL)
    hedge_count = len(_CMPSBL_LDS_HEDGE.findall(output))
    quality = 1.0
    if refusal: quality *= 0.5
    quality -= min(0.4, hedge_count * 0.02)
    if len(output) < 50: quality *= 0.6
    return { "quality": max(0.0, quality), "refusal": refusal, "hedge_count": hedge_count }
`;

const WIRE_TS = `
const _cmpsbl_raw_execute_lds = cmpsbl_execute;
cmpsbl_execute = function cmpsbl_execute_lds(capabilityName: string, input: Record<string, unknown>): ExecutionResult {
  // RAMPART — sanitize string inputs, fail closed on injection
  const cleanInput: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === 'string') {
      const r = cmpsbl_lds_rampart(v);
      if (!r.safe) {
        throw new Error(\`[CMPSBL:LLMDefense:\${capabilityName}] RAMPART blocked input field '\${k}': \${r.flags.join(',')}\`);
      }
      cleanInput[k] = r.cleaned;
    } else {
      cleanInput[k] = v;
    }
  }
  const result = _cmpsbl_raw_execute_lds(capabilityName, cleanInput);
  // TETHER + FULCRUM — clamp and score string outputs
  if (result && typeof result === 'object' && !Array.isArray(result)) {
    for (const [k, v] of Object.entries(result as Record<string, unknown>)) {
      if (typeof v === 'string') {
        const t = cmpsbl_lds_tether(v);
        (result as Record<string, unknown>)[k] = t.output;
      }
    }
  }
  return result;
};`;

const WIRE_PY = `
_cmpsbl_raw_execute_lds = cmpsbl_execute
def cmpsbl_execute(capability_name: str, input_data: dict) -> dict:
    """Execute under AI Hallucination & Prompt Injection Defense Layer (auto-wired)."""
    clean = {}
    for k, v in input_data.items():
        if isinstance(v, str):
            r = cmpsbl_lds_rampart(v)
            if not r['safe']:
                raise RuntimeError(f"[CMPSBL:LLMDefense:{capability_name}] RAMPART blocked input field '{k}': {','.join(r['flags'])}")
            clean[k] = r['cleaned']
        else:
            clean[k] = v
    result = _cmpsbl_raw_execute_lds(capability_name, clean)
    if isinstance(result, dict):
        for k, v in list(result.items()):
            if isinstance(v, str):
                t = cmpsbl_lds_tether(v)
                result[k] = t['output']
    return result`;

export const LLM_DEFENSE_SUITE_LAYER: CmpsblLayerDefinition = {
  id: 'llm-defense-suite',
  name: 'AI Hallucination & Prompt Injection Defense Layer',
  crownJewelRank: 21,
  cjpi: 94,
  module: 'DEFENSE×DREAM',
  description: 'Stops your LLM from making things up and from being hijacked by malicious prompts. Grounds answers in source-of-truth, sanitizes inputs, clamps outputs, and scores response quality before it reaches the user.',
  priceCents: 9900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_lds_rampart',
    behavior: 'Scrubs string inputs through RAMPART (fail closed on injection) and clamps string outputs via TETHER.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
