<div align="center">

# Security Model

### Defense-in-Depth

<table>
<tr><td><strong>Document</strong></td><td>10 — Security Model</td></tr>
<tr><td><strong>Classification</strong></td><td>Library — No Trade Secrets</td></tr>
<tr><td><strong>DOI</strong></td><td><a href="https://doi.org/10.5281/zenodo.XXXXXXX">10.5281/zenodo.XXXXXXX</a></td></tr>
</table>

</div>

---

## Security Philosophy

Security is not a module — it is a property of the entire system. While DEFENSE is the dedicated security module, security controls are applied at every layer:

| Layer | Security Control |
|-------|-----------------|
| **Kernel** | API key validation, rate limiting, quota enforcement |
| **Cognitive** | Memory access scoping, proposal validation |
| **Operational** | Threat detection, behavioral analysis, bot filtering |
| **Administrative** | Health monitoring, incident detection |
| **Infrastructure** | Audit logging, actor attribution, isolated execution |
| **Orchestrator** | Pipeline authorization, cross-module access control |

---

## DEFENSE Module

### Threat Detection

DEFENSE analyzes every incoming request for:

| Check | Description |
|-------|-------------|
| **IP Reputation** | Known bad actors, tor exit nodes, datacenter IPs |
| **Behavioral Analysis** | Request fingerprinting, anomaly detection |
| **Rate Anomalies** | Sudden traffic spikes, distributed attacks |
| **Payload Analysis** | Injection attempts, malformed data |
| **Bot Detection** | Automated traffic identification |

### Response Actions

| Action | When Used |
|--------|-----------|
| **Allow** | Request passes all checks |
| **Throttle** | Suspicious but not confirmed threat |
| **Challenge** | Requires additional verification |
| **Block** | Confirmed threat |
| **Quarantine** | Sophisticated attack, preserved for analysis |

### Incident Response

When a threat is confirmed:

1. Immediate blocking of the source
2. Incident record created in AUDIT
3. Pattern stored in BRAIN for future recognition
4. Alert sent to SYSTEM
5. Related requests reviewed for lateral movement

---

## Access Control

### Hierarchical RBAC

ACCESS implements role-based access control with:

- **Scoped API keys** — each key specifies which modules and actions are permitted
- **Rate limits** — per-key and global limits
- **Quota enforcement** — daily and monthly usage caps
- **Subscription tiers** — capabilities gated by plan level

### Crown Jewel Protection

54 capabilities are classified as Crown Jewels and are excluded from all external tiers. They are:

- Not visible in any API catalog
- Not accessible through any subscription plan
- Not searchable in the marketplace
- Admin-only in the UI

---

## Data Protection

- **Row-Level Security** — database tables enforce per-user data isolation
- **Encryption at rest** — all stored data is encrypted
- **Encryption in transit** — all API communication uses TLS
- **Secrets vault** — API keys and tokens are stored in AES-GCM encrypted vault with per-module scoping

---

## Audit Trail

AUDIT provides immutable, tamper-evident logging of all security-relevant events. The ledger supports chain-of-custody verification for regulatory compliance.

---

## What's Next

Continue to [`11-API-REFERENCE.md`](./11-API-REFERENCE.md) for the complete API surface.

---

<div align="center">

*CMPSBL OS Substrate v9.1.0 — ARCHITECT Epoch*

**Kenneth E Sweet Jr** · PromptFluid®  
ORCID: [XXXX-XXXX-XXXX-XXXX](https://orcid.org/XXXX-XXXX-XXXX-XXXX) · DOI: [10.5281/zenodo.XXXXXXX](https://doi.org/10.5281/zenodo.XXXXXXX)

© 2025–2026 PromptFluid®. All rights reserved.

</div>
