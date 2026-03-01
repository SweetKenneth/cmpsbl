# 15 — Consensus Engine

> **Module:** NEXUS | **Source:** `src/crownjewels/s-tier/018-consensus-engine.ts`

Multi-source agreement/voting for critical decisions. Supports majority, supermajority, unanimity, and weighted voting. Built for multi-model AI consensus, distributed approvals, and Byzantine-tolerant decision making.

## Quick Start

```typescript
import { createConsensusEngine } from './consensus-engine';

const consensus = createConsensusEngine({
  strategy: 'supermajority',
  minVoters: 3,
  timeoutMs: 15_000,
});

// Register AI model voters
consensus.registerVoter({ id: 'gpt5', weight: 1.2, reliability: 0.95 });
consensus.registerVoter({ id: 'gemini', weight: 1.0, reliability: 0.92 });
consensus.registerVoter({ id: 'claude', weight: 1.1, reliability: 0.94 });

// Run consensus round
const result = await consensus.runRound(
  'Is this transaction fraudulent?',
  async (voter, question) => {
    const answer = await callModel(voter.id, question);
    return { value: answer.decision, confidence: answer.confidence, reasoning: answer.explanation };
  },
);

if (result.reached) {
  console.log(`Consensus: ${result.winner} (${Math.round(result.agreement * 100)}% agreement)`);
} else {
  console.log(`No consensus. Dissenting: ${result.dissenting.join(', ')}`);
}
```

## API Reference

| Method | Description |
|--------|-------------|
| `registerVoter(voter)` | Add a voter with weight and reliability |
| `removeVoter(id)` | Remove a voter |
| `runRound(question, collector, opts?)` | Run a consensus round with all voters |
| `getStats()` | Get consensus success rates |
| `history` | Access past consensus results |

## Voting Strategies

| Strategy | Threshold | Best For |
|----------|-----------|----------|
| `majority` | >50% | General decisions |
| `supermajority` | >66.7% | High-stakes decisions |
| `unanimity` | 100% | Critical safety decisions |
| `weighted_majority` | >50% weighted | Expert-weighted panels |

## Use Cases

- **AI consensus** — Multi-model agreement on critical classifications
- **Approval workflows** — Distributed team decision making
- **Fraud detection** — Multiple signal agreement before flagging
- **Content moderation** — Multi-model safety consensus
