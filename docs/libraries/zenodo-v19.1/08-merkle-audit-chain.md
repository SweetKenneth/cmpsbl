# Merkle Audit Chain

## What It Is

Every Ascension v2 run produces a **Merkle-linked audit chain** — an append-only sequence of cryptographically linked receipts, one per pipeline phase.

## Phases That Emit Receipts

| Phase | Receipt Content |
|-------|----------------|
| Upload | Source fingerprint, size, language detection |
| Discovery | Top capabilities, confidence bands |
| Locking | Frozen capability set, contract extraction |
| Ascension | Layer attachments, Lex decisions |
| Pre-Export | Polyglot readiness, integrity check |
| Export | Final fingerprint, polyglot manifests |

## Chain Structure

```
Receipt[0] = H(phase_data[0])
Receipt[1] = H(phase_data[1] || Receipt[0])
Receipt[2] = H(phase_data[2] || Receipt[1])
...
Receipt[N] = H(phase_data[N] || Receipt[N-1])
```

The final receipt commits to the entire run. Tampering with any prior phase invalidates the head.

## Anchoring

The chain head is periodically **anchored** to a Cloud audit table (`audit_chain_anchors`):
- Anchored head hash
- Receipt count at anchor time
- Anchor timestamp
- Anchoring store identifier

Future phases will support **third-party anchoring** to external SBOM tools.

## Public Verification

Anyone can verify an artifact at:
```
/verify/:fingerprint
```

The verification page shows:
- Fingerprint match
- Receipt chain integrity
- Anchor proof (if anchored)
- Phase-by-phase breakdown

## Why It Matters

- **Tamper evidence:** chain detects any phase modification
- **Replay capability:** receipts contain enough state to re-execute a historical run
- **Compliance:** chain is exportable as an SBOM artifact
- **Trust:** verification is public, not gated behind a login

## Reproducibility Statement

Given:
- The original source
- The same layer attachments
- The same Lex policy version

Re-running Ascension v2 produces a chain whose **final fingerprint matches** the original. This is the formal reproducibility guarantee.

## What's Not Disclosed

- Hash function family choices for sealing (we publish that the chain uses standard cryptographic hashes; specific construction details are versioned and may evolve)
- Anchoring schedule and store mapping
- Internal audit log schema beyond what `/verify/:fingerprint` exposes

---

*© CMPSBL® · PromptFluid™ · 2026*
