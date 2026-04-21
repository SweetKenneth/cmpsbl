/**
 * CMPSBL® Inventory Layer — Multi-AI Consensus & Dissent Layer
 * Primitives: QUORUM · VOTE · ARBITER
 *
 * Distinct from ai-safety (guardrails on one model) and ai-cost (routing) —
 * this submits the same prompt to N adapters and reports majority + dissent.
 */
import type { CmpsblLayerDefinition } from '../types';

const TS = `
// ╔═══════════════════════════════════════════════════════════════════════════════╗
// ║  ASCENSION LAYER — Multi-AI Consensus & Dissent Layer (proprietary).                       ║
// ╚═══════════════════════════════════════════════════════════════════════════════╝

type CmpsblModelAdapter = (prompt: string) => Promise<string> | string;

export interface CmpsblConsensusResult {
  consensus: string | null;
  agreement: number;
  votes: Array<{ adapter: string; output: string }>;
  dissent: string[];
}

export async function cmpsbl_mmc_quorum(
  prompt: string,
  adapters: Record<string, CmpsblModelAdapter>,
): Promise<CmpsblConsensusResult> {
  const entries = Object.entries(adapters);
  const votes: Array<{ adapter: string; output: string }> = [];
  for (const [name, fn] of entries) {
    try {
      const out = await fn(prompt);
      votes.push({ adapter: name, output: String(out).trim().toLowerCase() });
    } catch {
      votes.push({ adapter: name, output: '__error__' });
    }
  }
  const tally = new Map<string, number>();
  for (const v of votes) tally.set(v.output, (tally.get(v.output) ?? 0) + 1);
  let best: string | null = null; let bestCount = 0;
  for (const [k, c] of tally.entries()) { if (c > bestCount) { best = k; bestCount = c; } }
  const agreement = votes.length === 0 ? 0 : bestCount / votes.length;
  const dissent = votes.filter(v => v.output !== best).map(v => v.adapter);
  return { consensus: agreement >= 0.5 ? best : null, agreement, votes, dissent };
}

export function cmpsbl_mmc_arbiter(result: CmpsblConsensusResult, threshold: number = 0.66): { trusted: boolean; reason: string } {
  if (result.consensus === null) return { trusted: false, reason: 'no-majority' };
  if (result.agreement < threshold) return { trusted: false, reason: \`weak-agreement-\${result.agreement.toFixed(2)}\` };
  return { trusted: true, reason: 'quorum-passed' };
}
`;

const PY = `
# ╔═══════════════════════════════════════════════════════════════════════════════╗
# ║  ASCENSION LAYER — Multi-AI Consensus & Dissent Layer (proprietary).                       ║
# ╚═══════════════════════════════════════════════════════════════════════════════╝

from typing import Dict, Callable, List

def cmpsbl_mmc_quorum(prompt: str, adapters: Dict[str, Callable[[str], str]]) -> dict:
    votes: List[dict] = []
    for name, fn in adapters.items():
        try:
            out = fn(prompt)
            votes.append({ 'adapter': name, 'output': str(out).strip().lower() })
        except Exception:
            votes.append({ 'adapter': name, 'output': '__error__' })
    tally = {}
    for v in votes:
        tally[v['output']] = tally.get(v['output'], 0) + 1
    best, best_count = None, 0
    for k, c in tally.items():
        if c > best_count: best, best_count = k, c
    agreement = 0 if not votes else best_count / len(votes)
    dissent = [v['adapter'] for v in votes if v['output'] != best]
    return { 'consensus': best if agreement >= 0.5 else None, 'agreement': agreement, 'votes': votes, 'dissent': dissent }

def cmpsbl_mmc_arbiter(result: dict, threshold: float = 0.66) -> dict:
    if result['consensus'] is None: return { 'trusted': False, 'reason': 'no-majority' }
    if result['agreement'] < threshold: return { 'trusted': False, 'reason': f"weak-agreement-{result['agreement']:.2f}" }
    return { 'trusted': True, 'reason': 'quorum-passed' }
`;

const WIRE_TS = `
// Multi-Model Consensus is opt-in: customer code calls cmpsbl_mmc_quorum directly.
// No transparent wrapper — quorum requires explicit adapter map.`;

const WIRE_PY = `
# Multi-Model Consensus is opt-in: customer code calls cmpsbl_mmc_quorum directly.`;

export const MULTI_MODEL_CONSENSUS_LAYER: CmpsblLayerDefinition = {
  id: 'multi-model-consensus',
  name: 'Multi-AI Consensus & Dissent Layer',
  crownJewelRank: 28,
  cjpi: 96,
  module: 'INTELLIGENCE×DREAM',
  description: 'Asks N AI models the same question, returns the majority answer plus an agreement score and dissent list — catch hallucinations and edge-case disagreements before they reach the user.',
  priceCents: 9900,
  tsCode: TS,
  pyCode: PY,
  autoWire: {
    wrapperName: 'cmpsbl_mmc_quorum',
    behavior: 'Opt-in helper — customer code invokes quorum across registered adapters.',
    tsWire: WIRE_TS,
    pyWire: WIRE_PY,
  },
};
