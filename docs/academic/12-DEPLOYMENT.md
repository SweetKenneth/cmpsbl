# Deployment Model

## CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch

**DOI:** [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)  
**Author:** Kenneth E Sweet Jr (ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX))

---

## 12. Deployment Model

### 12.1 Infrastructure Requirements

The substrate operates on commodity cloud infrastructure:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | PostgreSQL 15+ with pgvector | Persistent storage, RLS, real-time |
| Edge Runtime | Deno-compatible platform | Module logic, API handlers |
| Client | TypeScript / React | Terminal UI, admin dashboard |
| AI Providers | External (BYOK) | LLM inference |

### 12.2 BYOK Model

The substrate follows a Bring Your Own Keys model. Users provide their own infrastructure, AI provider API keys, and deployment environment. No compute resources are included. This ensures complete data sovereignty.

### 12.3 Deployment Topology

The system follows a three-tier architecture: client (browser) → edge functions (Deno) → database (PostgreSQL) with external AI provider connections from the edge layer. All communication uses HTTPS/TLS.

### 12.4 Data Sovereignty

All data remains within the user's own infrastructure. The substrate does not transmit data to any external system other than the user-configured AI providers for inference requests.

---

*CMPSBL OS Substrate v9.1.0 — Academic Documentation*  
*Kenneth E Sweet Jr · ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX)*  
*DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)*  
*© 2025–2026 PromptFluid®. All rights reserved.*
