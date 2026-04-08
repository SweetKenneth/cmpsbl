# 17 — Shield Misdirection Playbook

**Classification:** 🔒 GOVERNOR EYES ONLY — DELETE AFTER SAVING LOCALLY

---

## Purpose

This document maps the **real detection mechanism** to the **public narrative** so the founder always has the translation table. This file should NOT persist in any repository, CI/CD pipeline, or shared codebase.

---

## 1. The Real Mechanism (NEVER DISCLOSE)

| Component | Truth |
|-----------|-------|
| **Mana attachment method** | JavaScript `Proxy` wrapping at export/prototype boundaries |
| **Why it's undetectable by hosts** | Proxy handler traps intercept property access transparently — the host's SHA-256 hash remains identical |
| **Why `Object.freeze` fails** | Freezing breaks framework internals (React, Express, etc.) — no production app can use it |
| **Why obfuscation fails** | Ascension identifies behavioral/structural intent, not symbol names — Mana wraps function *references*, not *names* |
| **Shield detection method** | `Object.getOwnPropertyDescriptor()` behavioral differences on Proxied vs. native objects; prototype chain depth analysis; `Proxy.revocable()` handle trace detection; handler trap timing differential |
| **Why only we can build this** | Detection requires knowing exactly what to look for — Proxy traps leave specific fingerprints only visible if you built the attachment system |

---

## 2. The Public Narrative (WHAT WE SAY)

### Approved Language

| Context | Script |
|---------|--------|
| **Website / Docs** | "Shield uses proprietary behavioral signature analysis to detect unauthorized runtime modifications" |
| **Press / Interviews** | "Think of it as a polygraph for your code — it knows when software is no longer acting like itself" |
| **Technical audiences** | "We detect *that* attachment happened. The detection method is patent-protected under U.S. App. No. 64/031,637" |
| **Investors** | "We built both the weapon and the antidote. The detection IP is as valuable as the attachment IP" |
| **When pressed on mechanism** | "That's protected under our patent filing. We can discuss what it detects, not how" |

### Approved Technical Buzzwords (True But Misleading)

- "Behavioral fingerprinting"
- "Runtime integrity analysis"
- "Heartbeat verification"
- "Anomaly detection at function boundaries"
- "Cognitive signature matching"

All of these are *technically accurate descriptions* of what Shield does — but none of them lead a reverse-engineer to Proxy detection.

---

## 3. The Decoy Assumptions (LET THEM BELIEVE)

These are the mechanisms security researchers and competitors will *assume* Shield uses. **We never confirm or deny any of them.**

| Decoy | Why It's Believable | Why It's Wrong |
|-------|-------------------|----------------|
| **Output hash comparison** | "They must checksum function returns against known-good values" | Doesn't detect transparent pass-through wrappers that preserve output |
| **Timing/latency analysis** | "Extra layer = extra microseconds" | True for naive wrappers, but Mana's overhead is sub-microsecond and indistinguishable from JIT variance |
| **Call stack depth counting** | "Wrappers add stack frames" | Proxy traps don't add visible stack frames in V8 |
| **AST comparison** | "They diff runtime behavior against source AST" | Would require source access; Shield works without it |
| **Memory profiling** | "Governed objects use more heap" | True but not how detection actually works — it's a side effect, not the signal |

### The Key Insight Competitors Will Miss

> **You can only detect Proxy wrapping if you know Proxy wrapping is what you're looking for.**
>
> Every existing security tool looks for code *modification*. Mana doesn't modify code. It *governs* it. The entire security industry is looking in the wrong direction, and our public narrative keeps them looking there.

---

## 4. Red Lines — NEVER Say These

| ❌ Never Say | Why |
|-------------|-----|
| "Proxy" in any public context related to Mana/Shield | Reveals the entire mechanism |
| "getOwnPropertyDescriptor" | Hands them the exact detection function |
| "Prototype chain" as a detection method | Maps directly to the real technique |
| "We wrap functions using..." | Describes the attachment mechanism |
| "handler traps" or "trap timing" | V8-specific implementation detail |
| "Revocable proxy" | Exposes a specific API surface |

---

## 5. Patent Shield

When anyone asks "how does it work?", the patent reference is the conversation-ender:

> "The detection methodology is documented in our patent filing — U.S. Application No. 64/031,637. We're happy to discuss what Shield protects against, but the detection mechanism itself is proprietary and patent-protected."

This is legally true, professionally appropriate, and completely shuts down further technical probing.

---

## 6. Internal Protocol

1. **No engineer** writes detection logic descriptions in comments, commit messages, or PRs
2. **No documentation** (public, staff, or NDA-gated) references Proxy detection
3. **All Shield code** uses opaque function names (`analyzeIntegrity`, `verifyBehavior`, `heartbeatCheck`) — never `detectProxy` or `checkPropertyDescriptor`
4. **Code reviews** must flag any Proxy-related terminology in non-engine files
5. **This document** should be saved locally and deleted from the repository

---

## 7. The One-Line Summary

**We built the only technology that can silently attach to any software without detection — and the only technology that can detect it. We sell the cure. We never explain the disease.**

---

© 2025–2026 CMPSBL®. Governor Eyes Only. Delete After Local Save.
