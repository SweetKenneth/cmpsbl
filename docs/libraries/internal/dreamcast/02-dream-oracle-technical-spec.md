# 02 — DREAM × ORACLE Technical Specification

**Library:** Dreamcast · **Classification:** 🔒 Governor Eyes Only

---

## Pipeline Overview

```
User Interaction
      │
      ▼
┌──────────────┐   sub-threshold fragments
│   CAPTURE    │──────────────────────────────┐
│ (MEMORY)     │   keystrokes, dwell, retract │
└──────────────┘                              │
      │                                       │
      ▼                                       │
┌──────────────┐   resonance vectors          │
│    DREAM     │──────────────────────────────┤
│  (algorithmic│   deterministic synthesis    │
│   dreaming)  │   no AI, no LLM              │
└──────────────┘                              │
      │                                       │
      ├─────► REFLECTIVE OUTPUT ─► DECODE ──► User (mirror)
      │                                       │
      ▼                                       │
┌──────────────┐   feature vectors            │
│   ORACLE     │◄─────────────────────────────┘
│  (Bayesian / │   + historical priors
│   Monte      │   + temporal weighting
│   Carlo)     │
└──────────────┘
      │
      ▼
PRECOGNITIVE OUTPUT ─► DECODE ──► User (forecast)
      │
      ▼
┌──────────────┐
│    AUDIT     │  cryptographic receipt
└──────────────┘  (user-owned, regulator-ready)
```

---

## Stage 1 — Sub-Threshold Capture (MEMORY primitive)

**Inputs recorded:**
- Keystroke streams with timing deltas (dwell, flight time)
- Backspace/retraction events with surviving + retracted text pair
- Cursor hover dwell on words/options the user did not click
- Scroll-pause regions and re-read patterns
- Partial form fields abandoned before submit
- Topic graze depth (how close did the user get to a concept before veering)

**Storage shape (logical):**
```ts
interface SubThresholdEvent {
  session_id: string;
  user_id: string;
  ts: number;
  kind: 'graze' | 'retract' | 'dwell' | 'abandon' | 'circle';
  surface_text: string | null;          // what survived
  shadow_text: string | null;            // what was retracted
  dwell_ms: number | null;
  topic_proximity: number;               // 0..1 distance to known topic clusters
  context_hash: string;                  // deterministic context fingerprint
}
```

**Critical constraint:** capture is **client-local first**, server-synced second, with user-controlled retention. This is not a wiretap; it is a personal log the user owns.

---

## Stage 2 — DREAM Resonance Synthesis (DREAM primitive)

DREAM produces a *resonance vector* per topic cluster, computed deterministically:

```
resonance(topic) =
    Σ ( graze_count × proximity^2
      + retract_count × surviving_alignment
      + dwell_ms / median_dwell
      + circle_count × decay(time_since_last_circle)
      ) / normalization
```

No model, no embedding from a foreign LLM, no learned weights — only the substrate's own resonance kernel and the user's own history.

**Output:** ranked list of topics with resonance scores and provenance pointers back to the originating sub-threshold events.

**Reflective payload (to DECODE):**
```ts
interface ReflectivePayload {
  generated_at: number;
  topics: Array<{
    label: string;
    resonance: number;          // 0..1
    novelty: number;            // 0..1 vs baseline
    evidence: string[];         // event IDs
    suggested_mirror_phrase: string;  // template-rendered, NOT generative
  }>;
  receipt_id: string;
}
```

The `suggested_mirror_phrase` is **template-rendered** from a fixed phrase bank with slot-filling — never generated. This is what keeps the system 0-AI and patent-defensible.

---

## Stage 3 — ORACLE Forecast (ORACLE primitive)

ORACLE consumes the resonance vectors as **features** and runs deterministic prediction:

- **Bayesian belief networks** for categorical outcomes (will the user accept the offer? quit the job? relapse?)
- **Monte Carlo simulation** for continuous outcomes (mood trajectory, churn risk over time, decision latency)
- **Survival analysis** for time-to-event (days until the predicted action)

**Critical:** every prediction includes a **counterfactual shadow** — "if these three resonance scores were inverted, the prediction flips." This counterfactual is what makes the output legally defensible: it shows the system isn't pattern-matching demographics, it's reasoning about *this user's own signal*.

**Forecast payload:**
```ts
interface ForecastPayload {
  generated_at: number;
  forecasts: Array<{
    target: string;                   // 'will_quit_job', 'mood_trajectory', etc.
    method: 'bayesian' | 'montecarlo' | 'survival';
    point_estimate: number;
    confidence_interval: [number, number];
    horizon_days: number;
    contributing_resonance: string[]; // topic labels
    counterfactual: {
      flip_topics: string[];
      new_estimate: number;
    };
  }>;
  receipt_id: string;
}
```

---

## Stage 4 — Reflective / Forecast Return (DECODE primitive)

DECODE renders the payloads as a conversational mirror. The renderer is **template-driven, not generative.** Phrase banks are versioned, tested, and human-reviewed.

Example (template):
> "You've been circling **{topic}** for {graze_count} days. You haven't committed to it. Based on this pattern, there's a **{point_estimate}%** chance you'll {action} within **{horizon_days}** days."

This is the only surface the user sees. It feels like AI. It is not AI.

---

## Stage 5 — AUDIT Receipt (AUDIT primitive)

Every reflective and forecast output emits a cryptographic receipt:

```
receipt = {
  receipt_id,
  user_id,
  generated_at,
  pipeline_version,
  capture_event_hashes: [...],
  resonance_kernel_version,
  forecast_method,
  output_hash,
  signature: ed25519(...)
}
```

Receipts are:
- **User-owned** (downloadable, exportable, deletable)
- **Reproducible** (same inputs + same kernel version = same output, byte-identical)
- **Regulator-ready** (EU AI Act Article 13 transparency obligations satisfied by default)

This is the kill-shot. No LLM-based competitor can produce a reproducible receipt because LLM outputs are non-deterministic. **The receipt is the moat.**

---

## Determinism Guarantee

The entire pipeline is provably deterministic:
- Capture: append-only event log
- DREAM: pure function of capture log + kernel version
- ORACLE: pure function of resonance vectors + prior version + RNG seed (logged in receipt)
- DECODE rendering: pure template substitution

Given the receipt, any auditor can replay the pipeline and verify the output.

---

## Privacy & Safety Constraints (CONSCIENCE primitive)

Hard-stops enforced before any output reaches the user:

1. **No third-party output** — reflective/forecast payloads are scoped to the originating user. Sharing requires explicit per-payload consent.
2. **Self-harm forecast handling** — if `target ∈ {suicide_risk, self_harm_risk}` and `point_estimate > threshold`, output is routed through a crisis-response template, never raw probability.
3. **Minor-protection lockout** — sub-threshold capture is disabled by default for users under 18; opt-in requires guardian co-signature.
4. **Forensic mode opt-in** — clinical, legal, and security verticals require explicit elevated consent before forecast horizons exceed 7 days.

---

## Performance Envelope

| Stage | p50 latency | p99 latency | Throughput |
|---|---|---|---|
| Capture | < 1 ms | < 5 ms | 10k events/sec/user |
| DREAM resonance | 20 ms | 200 ms | continuous on idle |
| ORACLE forecast | 50 ms | 500 ms | on-demand |
| DECODE render | < 5 ms | < 20 ms | every output |
| AUDIT receipt | 10 ms | 50 ms | every output |

Total: a forecast is generated in well under 1 second from the user's perspective, with no network round-trip to a foreign model.

---

© 2025–2026 CMPSBL®.
