# 05 — Security & IP Protection

**Classification:** INTERNAL — Team Members Only

---

## 1. What We Protect

CMPSBL has three layers of protected intellectual property:

### Tier 1 — Crown Jewels (54 capabilities)
Permanently black-boxed. Never appear in exports, logs, documentation, or external APIs. These are the system's most valuable proprietary algorithms.

### Tier 2 — Trade Secrets
Discovery engine heuristics, CJPI scoring weights, convergence formulas, and internal orchestration logic. Protected through:
- **Obfuscation**: Hex-encoded constants (e.g., `_W = [0x1E, 0x1E, 0x14, 0x14]`)
- **Comment stripping**: Internal implementation notes removed from exports
- **Sealed runtimes**: Engines and Agents run source-blocked

### Tier 3 — Production Infrastructure
200,000+ lines of production code, 100+ memory chains, 40-primitive topology. Protected through:
- Standard software licensing
- RBAC and Row-Level Security
- Immutable audit trails

---

## 2. Export IP Protection (Black-Box System)

When artifacts are exported through Ascension, the `blackbox.ts` module applies:

| Protection | Method |
|-----------|--------|
| CJPI weights | Hex-encoded arrays (`[0x1E, 0x1E, 0x14, 0x14]`) |
| Tier thresholds | Hex-encoded (`[0x5C, 0x50, 0x41, 0x2D]`) |
| Internal comments | Stripped entirely |
| Architecture references | Genericized |
| Discovery heuristics | Never included |

The exported artifact is a **functional, zero-dependency single file** that works perfectly — but reveals nothing about how CMPSBL discovers, scores, or evolves capabilities internally.

---

## 3. Data Access Control

### Row-Level Security (RLS)
All sensitive database tables enforce RLS. Key restrictions:

| Table Category | Access |
|---------------|--------|
| `brain_memories`, `brain_events` | Admin/Governor only |
| `governance_*` | Governor only |
| `audit_*` | Read-only, append-only |
| User-scoped data | Authenticated user owns their rows |
| Public content | Readable by all |

### Role Hierarchy
- **Governor**: Full system access, policy authority
- **Admin**: Operational access, no policy changes
- **Authenticated User**: Own data only
- **Anonymous**: Public content only

---

## 4. Your Security Responsibilities

### Everyone
- Never store private keys in source code (publishable/anon keys are OK)
- Never share Crown Jewel details externally — even with partners
- Never disable RLS on any table, even for "testing"
- Report any suspected vulnerability to security@CMPSBL.com immediately

### Engineering
- All new tables require RLS policies before deployment
- Telemetry must be non-blocking (`catch(() => {})`)
- Never bypass `broadcastIntent()` for "convenience"
- Never create alternate database clients

### Sales & Communications
- Never claim capabilities the system doesn't have
- Never share internal architecture details with prospects
- Never demo Crown Jewel capabilities
- Position IP protection as a feature ("your artifacts are yours")

---

## 5. Incident Response

If you discover or suspect a security issue:

1. **Immediately notify**: security@CMPSBL.com and founder@CMPSBL.com
2. **Do not attempt to fix** the issue yourself unless you are the security lead
3. **Preserve evidence** — do not modify logs or delete data
4. **Document** what you observed, when, and what you were doing

Response priority levels:
- **P0**: Active data breach → Immediate escalation, all hands
- **P1**: Exploitable vulnerability → 4-hour response window
- **P2**: Potential vulnerability → 24-hour assessment
- **P3**: Security improvement → Normal sprint cycle

---

© 2025–2026 CMPSBL®. Internal Use Only.
