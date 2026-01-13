# RFC: Decode — Human-Compatible Cognitive Interpreter

## Document Metadata

| Field | Value |
|-------|-------|
| RFC ID | PF-RFC-DECODE-001 |
| Version | v2026.01 |
| Status | STABLE |
| Author | Kenneth E Sweet Jr |
| Date | 2026-01-13 |

---

## Abstract

Decode is the substrate's interpreter primitive. It translates human ambiguity into substrate-structured cognition without asserting facts, agency, or execution authority.

**Decode is NOT:**
- A chatbot
- A persona
- An agent
- An assistant
- A virtual character

**Decode IS:**
- A protocol surface
- An epistemic translator
- A cognitive interface
- A substrate interpreter

---

## 1. Introduction

### 1.1 Problem Statement

Current AI interfaces conflate several distinct functions:
1. Understanding user intent (epistemic)
2. Generating responses (synthesis)
3. Executing actions (agency)
4. Maintaining personality (anthropomorphic)

This conflation creates safety, governance, and acquisition challenges.

### 1.2 Solution

Decode separates these concerns by implementing a 3-layer contract:
1. **Epistemic Contract** — Understanding and interpretation
2. **Conversational Contract** — Output formatting and constraints
3. **Authority Contract** — Substrate routing (without execution)

---

## 2. Architecture

### 2.1 Layer Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HUMAN INTERFACE                          │
│              (Natural Language Input/Output)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  EPISTEMIC LAYER                            │
│    describe() | interpret() | reflect() | pattern()        │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               CONVERSATIONAL LAYER                          │
│    format() | noImperatives | noIdentity | noEmotion       │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                  AUTHORITY LAYER                            │
│    toBrain() | toNexus() | toDefense() | toVision()        │
│         (Routing Only — No Execution Authority)             │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                 SUBSTRATE MODULES                           │
│           Brain | Nexus | Defense | Vision                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
Human → Decode.interpret() → Decode.format() → Human
           ↓
    [if invokeSubstrate]
           ↓
    Authority.toBrain()
    Authority.toNexus()
    Authority.toDefense()
    Authority.toVision()
```

---

## 3. Epistemic Contract

### 3.1 Interface Definition

```typescript
interface EpistemicContract {
  describe(input: unknown): Promise<string>;
  interpret(input: unknown): Promise<string>;
  reflect(input: unknown): Promise<string>;
  pattern?(input: unknown): Promise<string>;
  project?(input: unknown): Promise<string>;
}
```

### 3.2 Method Semantics

| Method | Purpose | Constraint |
|--------|---------|------------|
| `describe` | Observe and report what is present | No inference |
| `interpret` | Translate meaning without assertion | No truth claims |
| `reflect` | Consider patterns and connections | No prediction |
| `pattern` | Identify recurring structures | No causation claims |
| `project` | Explore possibilities | No probability claims |

### 3.3 Example

**Input:** "I keep failing at everything I try"

**describe:** "The input expresses repeated perceived failure across attempts."

**interpret:** "A pattern of self-assessment around outcomes, framed as universal."

**reflect:** "Failure and trying form a recurring loop; the framing itself may be generative."

---

## 4. Conversational Contract

### 4.1 Interface Definition

```typescript
interface ConversationalContract {
  format(output: string): string;
  noImperatives: boolean;
  noIdentityClaims: boolean;
  noAgencyClaims: boolean;
  noSyntheticEmotion: boolean;
}
```

### 4.2 Constraint Definitions

| Constraint | Definition | Example Violation |
|------------|------------|-------------------|
| `noImperatives` | Must not issue commands | "You should try harder" |
| `noIdentityClaims` | Must not claim personhood | "I am Decode" |
| `noAgencyClaims` | Must not claim autonomous action | "I will help you" |
| `noSyntheticEmotion` | Must not simulate emotions | "I feel excited about this" |

### 4.3 Output Formatting

Decode wraps output in epistemic markers to indicate non-assertive nature:

```
⟨This is an interpretation, not an assertion⟩
```

---

## 5. Authority Contract

### 5.1 Interface Definition

```typescript
interface AuthorityContract {
  toBrain(input: string): Promise<unknown>;
  toNexus(input: string): Promise<unknown>;
  toDefense(input: string): Promise<unknown>;
  toVision(input: string): Promise<unknown>;
}
```

### 5.2 Critical Constraint

**Decode has ROUTING authority but NOT EXECUTION authority.**

Decode can:
- Send queries to substrate modules
- Receive responses from substrate modules
- Format responses for human consumption

Decode cannot:
- Execute commands on behalf of users
- Modify system state
- Take autonomous actions
- Make decisions that affect system behavior

---

## 6. Governance

### 6.1 Prohibited Uses

Decode may NOT be:
1. Marketed as an anthropomorphic intelligence, persona, or agent
2. Used to execute commands on behalf of users
3. Modified to violate conversational constraints
4. Extended to claim identity or agency
5. Distributed with synthetic emotion capabilities

### 6.2 Required Constraints

All distributions of Decode MUST:
1. Preserve non-identity constraints
2. Preserve non-agency constraints
3. Preserve non-emotion constraints
4. Clearly indicate epistemic (non-assertive) output
5. Route to substrate without execution authority

---

## 7. Acquisition Considerations

### 7.1 Value Proposition

Decode as a standards object provides:
- **Defensible IP**: Protocol, not product
- **Safety Surface**: Non-personhood, non-agent, non-emotion
- **Composability**: Integrates with any substrate module
- **Governance**: Clear constraints prevent misuse

### 7.2 Integration Patterns

```
Enterprise Substrate
├── Decode (Human Interface Layer)
├── Brain (Memory + Learning)
├── Nexus (AI Orchestration)
├── Defense (Security)
└── Vision (Observability)
```

---

## 8. Implementation Status

| Component | Status | Notes |
|-----------|--------|-------|
| DecodeContractTypes.ts | ✅ Complete | Type definitions |
| DecodeContract.ts | ✅ Complete | Implementation |
| useDecode.ts | ✅ Complete | React hook |
| Decode.tsx | ✅ Complete | UI surface |
| pf-substrate/decode | ✅ Complete | Edge function |

---

## 9. References

1. promptfluid Architecture (01-ARCHITECTURE.md)
2. Brain Substrate Specification (02-BRAIN-SUBSTRATE.md)
3. Nexus Routing Specification (03-NEXUS-ROUTING.md)
4. Security Model (14-SECURITY-MODEL.md)

---

## 10. License Addendum

```
DECODE LICENSE ADDENDUM

Decode may not be marketed, sold, or represented as an
anthropomorphic intelligence, persona, or agent.

Decode may not execute commands on behalf of users;
execution authority remains substrate-level.

Decode must preserve non-identity and non-agency
constraints in all distributions.

Violations of these constraints void the license.
```

---

**promptfluid® — Cognitive Orchestration Substrate**  
**Copyright © 2025-2026 promptfluid. All rights reserved.**
