# 05 — Scoring & Certification

**Classification:** Open — Zenodo Archive

---

## 1. CJPI v3

The Crown Jewel Pipeline Index (CJPI) v3 scoring system is integrated into Convex Core™ as a deterministic scoring function applied during the SCORE processing layer.

### Weight Distribution

CJPI v3 uses four weighted dimensions:

| Dimension | Weight | Description |
|-----------|--------|-------------|
| Novelty | 0.30 | Uniqueness of discovered primitive interactions |
| Utility | 0.30 | Practical applicability of the artifact's capabilities |
| Complexity | 0.20 | Depth of cross-primitive compound effects |
| Composability | 0.20 | Ability to integrate with other artifacts or systems |

### Scoring Formula

```
score = (novelty × 0.30) + (utility × 0.30) + (complexity × 0.20) + (composability × 0.20)
```

Each dimension is scored 0–100. The weighted sum produces a composite score of 0–100.

**Note:** In the Convex Core™ v2, CJPI weights were encoded as hex values `[0x1E, 0x1E, 0x14, 0x14]` for IP protection. Convex Core™ continues this practice — the weights above are published for documentation purposes, but the compiled dispatch matrix uses FNV-1a-derived weight encodings that produce equivalent results through a different computational path.

---

## 2. Tier Classification

| Tier | CJPI Range | Characteristics |
|------|-----------|-----------------|
| **Mythic** | 90–100 | Cross-category compound effects, novel discovery |
| **Apex** | 80–89 | Strong multi-primitive interactions |
| **Meta** | 70–79 | Solid capability coverage |
| **Elite** | 60–69 | Focused specialization |
| **Pro** | 45–59 | Standard capability set |
| **Core** | 30–44 | Baseline functionality |
| **Starter** | 0–29 | Minimal capability binding |

---

## 3. Deterministic Scoring

CJPI v3 scoring is **deterministic** — the same source code with the same primitive bindings always produces the same score. This is guaranteed by:

1. Dimension scores are derived from the dispatch matrix, not from heuristic analysis
2. Weight application uses fixed-point arithmetic (no floating-point rounding variance)
3. The scoring function is part of the compiled processing layer

This means CJPI scores are **reproducible and verifiable**. Any party with the artifact can recompute its score and confirm it matches the certified value in the manifest.

---

## 4. Certification

An artifact is certified when:

1. All five processing layers complete without error
2. The dispatch matrix integrity hash is valid
3. The CJPI score is computed and classified
4. The artifact manifest is generated and signed

Certification is a one-time event. Certified artifacts are immutable — they cannot be modified without invalidating the certification.

---

© 2025–2026 CMPSBL®. All rights reserved.
