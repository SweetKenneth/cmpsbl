# 07 — Merkle Audit Chain

**Zenodo v19 · SYMBIOTIC Epoch**

---

## What the Audit Chain Is

Every governed action in the substrate produces a structured receipt. Receipts are linked into a Merkle chain whose head is periodically anchored to durable storage. Anchoring produces tamper-evidence: any modification to a historical receipt invalidates the head hash and is detectable on next anchor verification.

---

## Receipt Structure (Public)

A receipt contains, at minimum:

- A monotonically increasing sequence number scoped to its store.
- The previous receipt's hash.
- A canonicalized payload describing the governed event.
- A computed hash of (sequence, previous hash, payload).

The chain head is the hash of the most recent receipt.

---

## Anchoring

At a fixed cadence the current head hash and receipt count are written to an `audit_chain_anchors` durable record. Anchors are append-only. A verifier walking the chain from any anchor forward can detect any insertion, deletion, or modification of intermediate receipts.

---

## What Is Disclosed Here

- The substrate emits structured receipts.
- Receipts are Merkle-chained.
- Chain heads are anchored periodically.
- The anchor table is append-only.
- Verification traverses the chain forward from a known good anchor.

## What Is Not Disclosed Here

- The hash function family.
- The canonicalization rules for receipt payloads.
- The anchor cadence.
- The set of operations that are receipt-generating versus silent.
- The receipt payload schema fields.

---

## Why This Matters

Audit posture in most AI tooling reduces to "we log to a database." That logging is mutable by anyone with write access to the database. Merkle anchoring provides cryptographic evidence of integrity — a property that survives database compromise, retroactive editing, and operator tampering. Customers operating in regulated environments (healthcare, finance, defense) require this property; CMPSBL provides it natively rather than as a bolt-on.

---

© 2025–2026 CMPSBL® · CC BY 4.0
