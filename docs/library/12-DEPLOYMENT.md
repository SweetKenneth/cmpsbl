<div align="center">

# Deployment Model

<table>
<tr><td><strong>Document</strong></td><td>12 — Deployment</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>

</div>

---

## Infrastructure Requirements

The substrate runs on commodity cloud infrastructure. No specialized hardware is required.

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Database** | PostgreSQL (Supabase) | Persistent storage, RLS, real-time subscriptions |
| **Edge Functions** | Deno (Supabase Edge Functions) | Module logic, API handlers |
| **Client** | TypeScript / React | Terminal UI, admin dashboard |
| **AI Providers** | BYOK (Bring Your Own Keys) | LLM inference |

### Minimum Requirements

| Resource | Minimum |
|----------|---------|
| Database | PostgreSQL 15+ with pgvector extension |
| Edge Runtime | Deno-compatible edge function platform |
| Storage | 1GB+ for memory and audit logs |
| AI API Keys | At least one provider (OpenAI, Anthropic, Google, or Mistral) |

---

## BYOK Model

The substrate is **Bring Your Own Keys**. No compute resources, AI model access, or infrastructure are included. You provide:

1. Your own cloud infrastructure (Supabase project)
2. Your own AI provider API keys
3. Your own domain and deployment

This ensures complete data sovereignty — your data never leaves your infrastructure.

---

## Deployment Topology

```
┌─────────────────────────────────────────┐
│              Client (Browser)            │
│         Terminal UI / Admin Dashboard    │
└─────────────┬───────────────────────────┘
              │ HTTPS
┌─────────────▼───────────────────────────┐
│          Edge Functions (Deno)           │
│     pf-substrate (unified endpoint)     │
│     21 module handlers                  │
└─────────────┬───────────────────────────┘
              │ SQL / REST
┌─────────────▼───────────────────────────┐
│         PostgreSQL (Supabase)            │
│   ~40 tables · RLS · Real-time          │
└─────────────┬───────────────────────────┘
              │ HTTPS
┌─────────────▼───────────────────────────┐
│         AI Providers (External)          │
│   OpenAI · Anthropic · Google · Mistral │
└─────────────────────────────────────────┘
```

---

<div align="center">

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
