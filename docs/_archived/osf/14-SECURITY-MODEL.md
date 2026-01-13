# promptfluid substrate — Security Model

## v2026.01 — Cognitive Orchestration Substrate for AI Systems

promptfluid® is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. It is model-agnostic, provider-agnostic, and runs on commodity cloud.

---

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-SEC-001 |
| Version | v2026.01 |
| Last Updated | 2026-01-13 |
| Status | STABLE |

---

## Security Philosophy

promptfluid implements defense-in-depth security with multiple layers of protection. The system assumes breach and implements controls at every layer to minimize impact.

### Core Principles

1. **Least Privilege** - Minimal access by default
2. **Defense in Depth** - Multiple security layers
3. **Zero Trust** - Verify everything
4. **Secure by Default** - Safe configurations out of box
5. **Audit Everything** - Complete visibility

---

## Authentication

### Authentication Methods

| Method | Use Case | Implementation |
|--------|----------|----------------|
| JWT | User sessions | Supabase Auth |
| API Key | Service-to-service | Custom header validation |
| Service Role | Internal operations | Supabase service key |
| Anonymous | Public endpoints | Rate-limited only |

### JWT Validation

```typescript
// Edge function JWT validation
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

async function validateJWT(req: Request): Promise<User | null> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  
  const token = authHeader.split(' ')[1];
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) return null;
  return user;
}
```

### API Key Validation

```typescript
async function validateAPIKey(apiKey: string): Promise<boolean> {
  const keyHash = await hashKey(apiKey);
  
  const { data } = await supabase
    .from('bot_sniper_api_keys')
    .select('id')
    .eq('api_key_hash', keyHash)
    .single();
    
  return !!data;
}
```

---

## Authorization

### Row-Level Security (RLS)

All tables have RLS enabled with appropriate policies.

#### Policy Patterns

**Public Read:**
```sql
CREATE POLICY "Public read access"
ON public.core_plans
FOR SELECT
USING (true);
```

**Authenticated Access:**
```sql
CREATE POLICY "Authenticated users can read"
ON public.brain_memories
FOR SELECT
TO authenticated
USING (true);
```

**Owner Access:**
```sql
CREATE POLICY "Users own their data"
ON public.user_profiles
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Service Role Only:**
```sql
CREATE POLICY "Service role only"
ON public.audit_logs
FOR INSERT
TO service_role
USING (true);
```

### Role Hierarchy

```
┌─────────────────────────────────────┐
│           service_role              │
│     (Full database access)          │
├─────────────────────────────────────┤
│           authenticated             │
│     (User-specific access)          │
├─────────────────────────────────────┤
│             anon                    │
│     (Public read only)              │
└─────────────────────────────────────┘
```

---

## Data Protection

### Encryption at Rest

- PostgreSQL: AES-256 encryption
- Storage: AES-256 encryption
- Backups: Encrypted

### Encryption in Transit

- TLS 1.3 for all connections
- Certificate pinning where applicable
- HSTS enabled

### Sensitive Data Handling

```typescript
// Never log sensitive data
function sanitizeLog(data: any): any {
  const sensitive = ['password', 'token', 'key', 'secret', 'auth'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    if (sensitive.some(s => key.toLowerCase().includes(s))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}
```

### Secret Management

```typescript
// Secrets stored in Supabase Vault
const secrets = {
  api_keys: 'vault', // Encrypted at rest
  user_tokens: 'database', // With RLS
  session_data: 'jwt', // Short-lived
  config: 'environment' // Edge function env
};
```

---

## Network Security

### CORS Configuration

```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400'
};
```

### Rate Limiting

```typescript
const RATE_LIMITS = {
  anonymous: {
    requests: 60,
    window: 60, // seconds
  },
  authenticated: {
    requests: 300,
    window: 60,
  },
  api_key: {
    requests: 1000,
    window: 60,
  }
};

async function checkRateLimit(identifier: string, tier: string): Promise<boolean> {
  const key = `rate:${tier}:${identifier}`;
  const count = await incrementCounter(key, RATE_LIMITS[tier].window);
  return count <= RATE_LIMITS[tier].requests;
}
```

### IP Filtering

```typescript
// Block known malicious IPs
async function checkIPReputation(ip: string): Promise<boolean> {
  const { data } = await supabase
    .from('ip_reputation')
    .select('score, blocked_count')
    .eq('ip', ip)
    .single();
    
  if (!data) return true; // Unknown IP allowed
  
  // Block if score below threshold or too many blocks
  return data.score > 20 && data.blocked_count < 10;
}
```

---

## Input Validation

### Schema Validation

```typescript
import { z } from 'zod';

const LearnRequestSchema = z.object({
  content: z.string().min(1).max(10000),
  source: z.string().min(1).max(100),
  memory_type: z.enum(['fact', 'insight', 'pattern', 'rule']),
  confidence: z.number().min(0).max(1).optional(),
  metadata: z.record(z.unknown()).optional()
});

function validateRequest(body: unknown) {
  return LearnRequestSchema.parse(body);
}
```

### SQL Injection Prevention

```typescript
// Always use parameterized queries
const { data, error } = await supabase
  .from('brain_memories')
  .select('*')
  .eq('memory_type', userInput) // Parameterized
  .limit(100);

// NEVER do this:
// await supabase.rpc('search', { query: `SELECT * WHERE type = '${userInput}'` });
```

### XSS Prevention

```typescript
// Sanitize HTML output
import DOMPurify from 'dompurify';

function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: []
  });
}
```

---

## Defense Intelligence

### Bot Detection

Multi-signal bot detection system:

```typescript
interface BotDetectionSignals {
  header_analysis: number;      // 0-100
  behavioral_analysis: number;  // 0-100
  fingerprint_analysis: number; // 0-100
  reputation_score: number;     // 0-100
  
  final_risk: number;           // 0-100
  action: 'allow' | 'challenge' | 'block';
}
```

### Threat Classification

| Threat Level | Risk Score | Action |
|--------------|------------|--------|
| Low | 0-30 | Allow |
| Medium | 31-60 | Monitor |
| High | 61-80 | Challenge |
| Critical | 81-100 | Block |

### Adaptive Rules

```typescript
interface DefenseRule {
  id: string;
  rule_name: string;
  pattern: string;
  action: 'allow' | 'challenge' | 'block' | 'monitor';
  threshold: number;
  priority: number;
  is_active: boolean;
}

// Rules are dynamically updated based on threat patterns
async function evaluateRules(request: Request): Promise<string> {
  const rules = await getActiveRules();
  
  for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
    if (matchesPattern(request, rule.pattern)) {
      return rule.action;
    }
  }
  
  return 'allow'; // Default allow
}
```

---

## Audit Logging

### Audit Events

| Category | Events |
|----------|--------|
| Authentication | login, logout, password_change, mfa_enable |
| Authorization | permission_granted, permission_denied |
| Data Access | read, create, update, delete |
| Security | block, challenge, threat_detected |
| System | config_change, deployment, error |

### Audit Log Schema

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR NOT NULL,
  entity_type VARCHAR,
  entity_id VARCHAR,
  performed_by VARCHAR,
  details JSONB,
  ip_address VARCHAR,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Immutable: No UPDATE or DELETE policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Insert only"
ON audit_logs FOR INSERT
TO service_role
USING (true);

CREATE POLICY "Read for admins"
ON audit_logs FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));
```

### Logging Implementation

```typescript
async function auditLog(event: AuditEvent): Promise<void> {
  await supabase.from('audit_logs').insert({
    action: event.action,
    entity_type: event.entity_type,
    entity_id: event.entity_id,
    performed_by: event.user_id || 'system',
    details: event.details,
    ip_address: event.ip,
    user_agent: event.user_agent
  });
}
```

---

## Incident Response

### Detection

```typescript
// Anomaly detection triggers
const ANOMALY_TRIGGERS = {
  high_error_rate: (rate: number) => rate > 0.1,
  unusual_traffic: (requests: number, baseline: number) => requests > baseline * 3,
  auth_failures: (count: number) => count > 10,
  data_exfiltration: (volume: number) => volume > 1000000 // 1MB
};
```

### Response Procedures

1. **Detection** - Automated anomaly detection
2. **Triage** - Severity assessment
3. **Containment** - Isolate affected systems
4. **Eradication** - Remove threat
5. **Recovery** - Restore normal operations
6. **Lessons** - Post-incident review

### Emergency Controls

```typescript
// Emergency shutdown
async function emergencyShutdown(scope: string): Promise<void> {
  switch (scope) {
    case 'defense':
      await disableAllRules();
      await blockAllTraffic();
      break;
    case 'ai':
      await disableAIRouting();
      break;
    case 'full':
      await disableAllFunctions();
      break;
  }
  
  await auditLog({
    action: 'emergency_shutdown',
    details: { scope, timestamp: new Date() }
  });
}
```

---

## Compliance

### Data Handling

| Data Type | Retention | Access | Encryption |
|-----------|-----------|--------|------------|
| User PII | 90 days after deletion | Owner only | At rest + transit |
| Audit Logs | 7 years | Admin only | At rest |
| Memories | Permanent | Service role | At rest |
| Security Events | 1 year | Admin only | At rest |

### GDPR Considerations

```typescript
// Data export
async function exportUserData(userId: string): Promise<UserData> {
  const [profile, memories, conversations] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId),
    supabase.from('brain_memories').select('*').eq('user_id', userId),
    supabase.from('cascade_conversations').select('*').eq('user_id', userId)
  ]);
  
  return { profile, memories, conversations };
}

// Data deletion
async function deleteUserData(userId: string): Promise<void> {
  await supabase.rpc('delete_user_data', { target_user_id: userId });
  await auditLog({ action: 'user_data_deleted', entity_id: userId });
}
```

---

## Security Testing

### Automated Scans

| Tool | Purpose | Frequency |
|------|---------|-----------|
| Dependency audit | Vulnerability scan | Daily |
| SAST | Static analysis | On commit |
| DAST | Dynamic testing | Weekly |
| Penetration test | Manual testing | Quarterly |

### Security Review Process

1. **Code Review** - Security-focused review for all PRs
2. **Threat Modeling** - For new features
3. **Security Testing** - Before release
4. **Incident Review** - After security events

---

## Ownership & Licensing

promptfluid® is a registered trademark. For ownership inquiries, licensing arrangements, or enterprise partnerships:

| Contact | Details |
|---------|---------|
| **Founder** | Kenneth E Sweet Jr |
| **Email** | promptfluid@gmail.com |
| **Phone** | (760) FLUID-AI |
| **Web** | https://promptfluid.com |

---

**Last Updated:** January 13, 2026  
**Document Status:** STABLE
