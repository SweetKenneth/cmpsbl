<div align="center">

# 🔒 Onboarding Guide

### New Employee / New Developer Onboarding

<table>
<tr><td><strong>Document</strong></td><td>20 — Onboarding</td></tr>
<tr><td><strong>Classification</strong></td><td>🟢 LOW</td></tr>
</table>

</div>

---

## Welcome to CMPSBL

You're about to work on a cognitive orchestration system — an operating system for AI. Here's what you need to know to get productive.

---

## Day 1: Understand the System

### Read These First (in order)

1. **[Library: Executive Summary](../library/01-EXECUTIVE-SUMMARY.md)** — What the system is (15 min)
2. **[Library: System Architecture](../library/02-SYSTEM-ARCHITECTURE.md)** — How it's built (20 min)
3. **[Library: Module Reference](../library/03-MODULE-REFERENCE.md)** — What each module does (30 min)

### Key Concepts

| Concept | One-Liner |
|---------|-----------|
| **Substrate** | The complete system — 21 modules across 6 layers |
| **RIPPLE** | The event bus — modules never call each other directly |
| **Evolution** | The system improves itself with cryptographic proof |
| **Crown Jewels** | 54 capabilities we never expose publicly |
| **BYOK** | Bring Your Own Keys — users provide their own AI API keys |

---

## Day 2: Understand the Internals

### Read These (in order)

1. **[Internal: Architecture Internals](./01-ARCHITECTURE-INTERNALS.md)** — How it actually works
2. **[Internal: Value Score Formula](./03-VALUE-SCORE-FORMULA.md)** — The scoring algorithm
3. **[Internal: Confidence Gating](./04-CONFIDENCE-GATING.md)** — Memory confidence system
4. **[Internal: Operational Runbook](./14-OPERATIONAL-RUNBOOK.md)** — Day-to-day operations

---

## Day 3: Get Hands-On

### Key Files in the Codebase

| File | What It Is |
|------|-----------|
| `src/lib/substrate/` | Core substrate client code |
| `src/lib/capabilities/` | Capability registry and auto-loader |
| `src/lib/defense/` | Circuit breaker and security |
| `src/lib/agency/substrate/` | Agency integration (memory bridge, dream pipeline) |
| `supabase/functions/pf-substrate/` | Main edge function |
| `docs/substrate/MODULE-ACTIONS-REGISTRY.md` | All module actions |

### Try These Commands

```
POST /functions/v1/pf-substrate
{ "module": "core", "action": "health" }

POST /functions/v1/pf-substrate
{ "module": "brain", "action": "status" }

POST /functions/v1/pf-substrate
{ "module": "system", "action": "health_check" }
```

---

## Security Reminders

1. **Never** share Crown Jewels documentation outside the company
2. **Never** put trade secrets in public docs, library docs, or academic docs
3. **Always** use the Value Score Formula doc number (03) not the actual formula in Slack/email
4. **Always** verify you're in the right branch before committing internal docs

---

## Who to Ask

| Topic | Contact |
|-------|---------|
| Architecture decisions | Kenneth Sweet Jr |
| Deployment issues | Check the Operational Runbook first |
| Security concerns | Raise immediately — no question is too small |

---

<div align="center">

*INTERNAL USE ONLY*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

</div>
