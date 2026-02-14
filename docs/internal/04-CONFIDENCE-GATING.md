<div align="center">

# 🔒 Confidence Gating

### Memory Confidence Thresholds and Decay Curves — CRITICAL

<table>
<tr><td><strong>Document</strong></td><td>04 — Confidence Gating</td></tr>
<tr><td><strong>Classification</strong></td><td>🔴 CRITICAL — Core IP</td></tr>
</table>

</div>

---

> ⚠️ **CRITICAL IP** — Proprietary memory confidence system. Do not distribute.

---

## How Confidence Works

Every memory in BRAIN has a confidence score (0.0–1.0). This score is not static — it changes over time based on reinforcement, decay, and contradiction.

### Initial Confidence

| Source | Initial Confidence |
|--------|-------------------|
| User-provided fact | 0.70 |
| AI-generated insight | 0.50 |
| Dream-cycle hypothesis | 0.30 |
| Cross-validated knowledge | 0.85 |
| System observation | 0.60 |

### Reinforcement

When a memory is validated by new evidence:

```
new_confidence = min(1.0, current_confidence + boost × (1 - current_confidence))

Default boost: 0.15
```

The `(1 - current_confidence)` factor ensures diminishing returns — boosting a 0.5 confidence memory is more impactful than boosting a 0.95 confidence memory.

### Decay

Memories decay over time if not accessed or reinforced:

```
decayed_confidence = confidence × e^(-λ × days_since_last_access)

Where:
  λ (lambda) = decay rate
```

**Decay rates by memory type:**

| Memory Type | λ (decay rate) | Half-life |
|-------------|---------------|-----------|
| Episodic | 0.023 | ~30 days |
| Semantic | 0.0046 | ~150 days |
| Procedural | 0.0023 | ~300 days |
| Meta-cognitive | 0.0116 | ~60 days |

### Contradiction

When conflicting information is encountered:

```
reduced_confidence = confidence × (1 - contradiction_strength)

Where:
  contradiction_strength = 0.0–1.0 (how directly it contradicts)
```

### Gating Thresholds

Confidence gates determine when memories are used:

| Threshold | Value | Behavior |
|-----------|-------|----------|
| **Recall gate** | ≥ 0.30 | Memory appears in query results |
| **Response gate** | ≥ 0.50 | Memory is included in AI context |
| **Assert gate** | ≥ 0.70 | Memory is stated as fact to users |
| **Teach gate** | ≥ 0.85 | Memory is used to train other systems |
| **Archive gate** | < 0.10 | Memory is moved to cold storage |

### Why This Is Critical IP

The specific decay rates, boost values, and gating thresholds are the result of extensive tuning. They determine how the system balances recall (using everything it knows) vs. precision (only using what it's confident about). Getting this wrong produces either:

- **Too aggressive recall** (low gates) → system confidently states unreliable information
- **Too conservative recall** (high gates) → system "forgets" useful information

The current values represent the optimal balance discovered through production operation.

---

<div align="center">

*INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

</div>
