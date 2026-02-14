<div align="center">

# 🔒 Value Score Formula

### Proprietary Scoring Algorithm — CRITICAL

<table>
<tr><td><strong>Document</strong></td><td>03 — Value Score Formula</td></tr>
<tr><td><strong>Classification</strong></td><td>🔴 CRITICAL — Core IP</td></tr>
</table>

</div>

---

> ⚠️ **CRITICAL IP** — This is the proprietary scoring algorithm. Do not distribute.

---

## The Value Score Formula

The Value Score determines how the substrate prioritizes memories, capabilities, and evolution proposals. It is the single most important proprietary algorithm in the system.

### Formula

```
value_score = (
  confidence × confidence_weight +
  recency × recency_weight +
  frequency × frequency_weight +
  impact × impact_weight
) × normalization_factor
```

### Parameters

| Parameter | Range | Description | Default Weight |
|-----------|-------|-------------|----------------|
| `confidence` | 0.0–1.0 | How reliable the item is | 0.35 |
| `recency` | 0.0–1.0 | How recently it was used/validated | 0.25 |
| `frequency` | 0.0–1.0 | How often it's accessed | 0.20 |
| `impact` | 0.0–1.0 | How much it affects outcomes | 0.20 |

### Normalization

The normalization factor ensures scores remain in the 0.0–1.0 range regardless of input distribution. The specific normalization algorithm uses a sigmoid-based curve that prevents extreme values from dominating.

```
normalization_factor = 1 / (1 + e^(-k * (raw_score - midpoint)))

Where:
  k = steepness parameter (default: 6.0)
  midpoint = 0.5
```

### Where It's Used

| System | Application |
|--------|------------|
| BRAIN | Memory prioritization for recall |
| DREAM | Insight ranking during dream cycles |
| MODERNIZER | Evolution proposal priority |
| CORTEX | Task assignment scoring |
| NEXUS | Provider selection weighting |

### Why This Matters

This formula is the "secret sauce" that makes the substrate's decisions feel intelligent. Without it, the system would have no way to distinguish important information from noise, or high-value improvements from low-value ones.

**If a competitor obtained this formula AND the weight values AND the normalization algorithm**, they could replicate the substrate's decision-making quality. This is why it is classified as Crown Jewel IP.

---

<div align="center">

*INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

</div>
