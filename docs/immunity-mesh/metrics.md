# Immunity Mesh — Metrics

## Intelligence Metrics

| Metric | Full Name | Description |
|--------|-----------|-------------|
| **MRI** | Mutation Readiness Index | 0-100 composite score: DKD (35%), FNR inverse (20%), escalation control (20%), repair accuracy (20%), cascade control (5%) |
| **DKD** | Domain Knowledge Depth | Ratio of covered failure signatures to total failures |
| **FNR** | Failure Novelty Rate | Ratio of novel (unseen in 7d) failure signatures |
| **RMI** | Rule Maturity Index | Tracks rule invocations, success rates, stability |
| **CKP** | Cross-Executor Knowledge Propagation | Rule breadth across distinct executors |
| **IIL** | Immunity Intervention Log | Intervention counts: preflight blocks, safe-fails, escalations |

## Rule Scoring

| Score | Formula | Purpose |
|-------|---------|---------|
| **Dominant** | `log2(invocations+1) × success_rate × (1+log2(breadth))` | Identifies most influential rules |
| **Risk** | `(1-success_rate) × log2(invocations+1) × severity` | Flags dangerous rules |
| **Spread Velocity** | `breadth / days_since_first_adoption` | Measures adoption speed |

## Thresholds (constants.ts)

- Promotion: success_rate ≥80%, confidence ≥0.80, no conflicts 24h
- Candidate: ≥20 invocations OR ≥3 executors, confidence ≥0.80  
- Demotion: success_rate <60% after promotion
- Risky: success_rate <60% AND invocations ≥20
- Retirement: 0 invocations in 7d
