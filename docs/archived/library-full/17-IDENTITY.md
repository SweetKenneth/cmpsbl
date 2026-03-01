# CMPSBL® Library 17 — IDENTITY Module

**Epoch:** CONTRACT (V13)  
**Classification:** Internal  
**Author:** Kenneth E. Sweet Jr.  
**Date:** 2026-02  

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Library ID** | CMPSBL-LIB-017 |
| **Module** | IDENTITY |
| **Sector** | OCG (Operational Compliance Grid) |
| **Codename** | Provenance |
| **Weight** | 0.040 (4%) |
| **Boot Order** | 8 |

---

## 1. Purpose

IDENTITY manages session management, role resolution, actor identity, and action signing. Every action in the substrate is signed with an actor identity for provenance tracking.

---

## 2. Key Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `registerActor()` | `(actor: ActorDef) → ActorId` | Register a new actor |
| `whoami()` | `() → ActorIdentity` | Current actor identity |
| `setCurrentActor()` | `(actorId: ActorId) → void` | Switch active actor |
| `signAction()` | `(action: Action) → SignedAction` | Sign an action for provenance |

---

## 3. Actor Types

| Type | Description |
|------|-------------|
| `human` | End user interacting via UI |
| `agent` | AI cognitive agent |
| `system` | Internal substrate process |
| `service` | External service integration |

---

## 4. Trust Model

- Every action is signed with the actor's identity
- Signatures enable full provenance tracking through AUDIT
- Trust levels determine action permissions
- Role resolution maps actors to permission scopes

---

© 2025–2026 PromptFluid®. All rights reserved.
