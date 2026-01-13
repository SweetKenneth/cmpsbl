# PromptFluid Defense: Security Intelligence Layer

## Document Metadata

| Field | Value |
|-------|-------|
| Document ID | PF-DEFENSE-001 |
| Version | 1.0.0 |
| Last Updated | 2026-01-13 |
| Status | STABLE |
| Citation | Sese, K. (2026). PromptFluid Defense Intelligence. doi:10.5281/zenodo.XXXXXXX |

---

## 1. Introduction

Defense is the security intelligence layer of PromptFluid, providing behavioral bot detection, device fingerprinting, threat intelligence, and adaptive rule generation. Unlike signature-based detection systems, Defense uses AI-powered behavioral analysis to identify threats in real-time.

### 1.1 Design Philosophy

Traditional bot detection relies on known signatures and patterns. Defense takes a fundamentally different approach:

1. **Behavioral Analysis:** Detect anomalies in behavior, not known patterns
2. **Adaptive Learning:** Rules evolve based on observed attack patterns
3. **Zero-Day Protection:** Detect novel threats without prior signatures
4. **Low False Positives:** AI reduces false positive rate through context analysis
5. **Privacy-Preserving:** Minimal data collection, maximum protection

### 1.2 Market Context

- **Global Bot Management Market:** $3.5B (2025), 15% CAGR
- **Annual ADA Lawsuits:** 4,500+ targeting inaccessible websites
- **Bot Traffic:** 40-50% of all internet traffic is non-human

---

## 2. Architecture

### 2.1 Defense Pipeline

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          DEFENSE PIPELINE                                │
│                                                                          │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │ Request  │ -> │ Feature  │ -> │  Risk    │ -> │    Decision      │  │
│  │ Capture  │    │ Extract  │    │ Scoring  │    │ (Allow/Challenge)│  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────────────┘  │
│       │               │               │                   │             │
│       ▼               ▼               ▼                   ▼             │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────────┐  │
│  │  Headers │    │ Device   │    │Behavioral│    │     Actions      │  │
│  │    IP    │    │Fingerprnt│    │ Analysis │    │  ┌───────────┐   │  │
│  │    UA    │    │ JS Sigs  │    │ ML Model │    │  │  ALLOW    │   │  │
│  │ Cookies  │    │ TLS Data │    │          │    │  ├───────────┤   │  │
│  └──────────┘    └──────────┘    └──────────┘    │  │ CHALLENGE │   │  │
│                                                   │  ├───────────┤   │  │
│                                                   │  │  BLOCK    │   │  │
│                                                   │  └───────────┘   │  │
│                                                   └──────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     FEEDBACK LOOP TO BRAIN                        │   │
│  │  Event Logging → Pattern Detection → Rule Evolution → Adaptation  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Overview

| Component | Purpose | Data Sources |
|-----------|---------|--------------|
| Request Capture | Collect request metadata | HTTP headers, cookies, body |
| Feature Extraction | Generate analysis features | Device signals, behavioral metrics |
| Risk Scoring | Calculate threat probability | ML models, rule engine |
| Decision Engine | Determine response action | Risk score, policy config |
| Feedback Loop | Improve detection | Event outcomes, Brain insights |

---

## 3. Feature Extraction

### 3.1 Header Analysis

Extracted features from HTTP headers:

| Feature | Source | Weight |
|---------|--------|--------|
| User-Agent consistency | `User-Agent` header | High |
| Accept-Language plausibility | `Accept-Language` header | Medium |
| Referer chain validity | `Referer` header | Medium |
| Header order | Request structure | High |
| Missing standard headers | Header presence | High |

### 3.2 Device Fingerprinting

Multi-factor device identification:

```typescript
interface DeviceFingerprint {
  // Browser signals
  canvas_hash: string;           // Canvas rendering signature
  webgl_hash: string;            // WebGL renderer fingerprint
  audio_hash: string;            // AudioContext fingerprint
  font_list_hash: string;        // Installed fonts signature
  
  // Hardware signals
  screen_resolution: string;     // Display dimensions
  color_depth: number;           // Color bit depth
  device_memory: number;         // RAM (approximate)
  hardware_concurrency: number;  // CPU cores
  
  // Browser behavior
  timezone: string;              // Timezone string
  language: string;              // Browser language
  plugins_hash: string;          // Plugin list signature
  do_not_track: boolean;         // DNT preference
  
  // Derived
  composite_hash: string;        // Combined fingerprint
  entropy_score: number;         // Uniqueness measure
}
```

### 3.3 Behavioral Signals

Real-time behavioral analysis:

| Signal | Description | Bot Indicator |
|--------|-------------|---------------|
| Mouse movement | Path, velocity, jitter | Linear paths, no jitter |
| Keystroke dynamics | Timing, pattern | Uniform timing |
| Scroll behavior | Speed, pattern | Mechanical scrolling |
| Time on page | Engagement duration | Too fast/too slow |
| Navigation pattern | Page sequence | Unnatural sequence |
| Form interaction | Field focus, typing | No hesitation |

---

## 4. Risk Scoring

### 4.1 Scoring Model

Risk scores range from 0 (definitely human) to 100 (definitely bot):

```typescript
interface RiskScore {
  total: number;              // 0-100 composite score
  components: {
    header_score: number;     // 0-25 based on header analysis
    device_score: number;     // 0-25 based on fingerprint
    behavior_score: number;   // 0-25 based on behavioral signals
    reputation_score: number; // 0-25 based on IP/history
  };
  confidence: number;         // Model confidence (0-1)
  factors: string[];          // Contributing factors
}
```

### 4.2 Score Calculation

```typescript
function calculateRiskScore(features: RequestFeatures): RiskScore {
  // Header analysis (0-25)
  const headerScore = analyzeHeaders(features.headers);
  
  // Device fingerprint (0-25)
  const deviceScore = analyzeFingerprint(features.fingerprint);
  
  // Behavioral signals (0-25)
  const behaviorScore = analyzeBehavior(features.behavior);
  
  // IP/history reputation (0-25)
  const reputationScore = await getReputationScore(features.ip);
  
  const total = headerScore + deviceScore + behaviorScore + reputationScore;
  
  return {
    total,
    components: { headerScore, deviceScore, behaviorScore, reputationScore },
    confidence: calculateConfidence(features),
    factors: identifyFactors(features)
  };
}
```

### 4.3 Decision Thresholds

| Score Range | Decision | Action |
|-------------|----------|--------|
| 0-30 | Allow | Pass through, minimal logging |
| 31-60 | Monitor | Allow with enhanced logging |
| 61-80 | Challenge | Present CAPTCHA or puzzle |
| 81-100 | Block | Reject request, block IP |

---

## 5. IP Reputation System

### 5.1 Reputation Schema

```sql
CREATE TABLE ip_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL UNIQUE,
  score INTEGER DEFAULT 50,
  total_requests INTEGER DEFAULT 0,
  blocked_count INTEGER DEFAULT 0,
  last_seen TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 5.2 Score Evolution

IP reputation evolves based on behavior:

```typescript
function updateReputation(ip: string, event: SecurityEvent): void {
  const delta = calculateReputationDelta(event);
  
  // Positive events (confirmed human)
  // - Successful CAPTCHA solve: +5
  // - Normal browsing pattern: +1
  // - Successful purchase: +10
  
  // Negative events (bot indicators)
  // - Failed CAPTCHA: -10
  // - Rate limit hit: -5
  // - Blocked request: -15
  // - Attack pattern: -25
  
  await supabase
    .from('ip_reputation')
    .upsert({
      ip,
      score: currentScore + delta,
      total_requests: currentRequests + 1,
      last_seen: new Date().toISOString()
    });
}
```

### 5.3 Reputation Decay

Reputation scores decay toward neutral over time:

```sql
-- Daily reputation normalization
UPDATE ip_reputation
SET score = CASE
  WHEN score > 50 THEN score - 1
  WHEN score < 50 THEN score + 1
  ELSE score
END
WHERE last_seen < now() - interval '7 days';
```

---

## 6. Adaptive Rule Engine

### 6.1 Rule Schema

```sql
CREATE TABLE defense_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  pattern TEXT NOT NULL,
  action TEXT DEFAULT 'challenge',
  priority INTEGER DEFAULT 50,
  threshold INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 6.2 Rule Types

| Type | Description | Example |
|------|-------------|---------|
| Header | Match header patterns | UA contains "bot" |
| Rate | Request frequency limits | >100 req/min |
| Geo | Geographic restrictions | Block TOR exit nodes |
| Behavioral | Behavioral anomalies | Linear mouse paths |
| Composite | Combined conditions | Rate + Geo + Header |

### 6.3 Brain-Powered Rule Evolution

Defense learns from attack patterns and generates new rules:

```typescript
interface RuleEvolution {
  trigger: 'pattern_detected' | 'false_positive' | 'new_attack';
  source_events: string[];
  proposed_rule: DefenseRule;
  confidence: number;
  requires_approval: boolean;
}

async function evolveRules(): Promise<void> {
  // Analyze recent blocked events
  const patterns = await detectPatterns(recentEvents);
  
  // Generate rule proposals
  for (const pattern of patterns) {
    if (pattern.frequency > THRESHOLD) {
      const rule = generateRule(pattern);
      
      if (rule.confidence > AUTO_APPROVE_THRESHOLD) {
        await activateRule(rule);
      } else {
        await queueForReview(rule);
      }
    }
  }
}
```

---

## 7. Challenge Systems

### 7.1 Challenge Types

| Challenge | Difficulty | Bot Resistance | User Friction |
|-----------|------------|----------------|---------------|
| Invisible reCAPTCHA | Low | Medium | Very Low |
| Image Selection | Medium | High | Medium |
| Proof of Work | High | Very High | Low |
| Custom Puzzle | Variable | High | Medium |

### 7.2 Challenge Selection

```typescript
function selectChallenge(riskScore: number, context: RequestContext): Challenge {
  if (riskScore < 65) {
    return { type: 'invisible', difficulty: 'low' };
  }
  
  if (riskScore < 80) {
    return { type: 'image_selection', difficulty: 'medium' };
  }
  
  if (context.is_critical_endpoint) {
    return { type: 'proof_of_work', difficulty: 'high' };
  }
  
  return { type: 'custom_puzzle', difficulty: 'high' };
}
```

### 7.3 Proof of Work Implementation

```typescript
interface ProofOfWork {
  challenge: string;      // SHA256(random + difficulty)
  difficulty: number;     // Leading zeros required
  issued_at: number;      // Timestamp
  expires_at: number;     // Expiration
}

function generatePoW(difficulty: number): ProofOfWork {
  const random = crypto.randomBytes(32).toString('hex');
  const challenge = crypto.createHash('sha256')
    .update(random)
    .digest('hex');
  
  return {
    challenge,
    difficulty,
    issued_at: Date.now(),
    expires_at: Date.now() + 300000 // 5 minutes
  };
}

function verifyPoW(challenge: string, nonce: string, difficulty: number): boolean {
  const hash = crypto.createHash('sha256')
    .update(challenge + nonce)
    .digest('hex');
  
  return hash.startsWith('0'.repeat(difficulty));
}
```

---

## 8. Event Logging

### 8.1 Event Schema

```sql
CREATE TABLE defense_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  action TEXT NOT NULL,
  risk_score INTEGER NOT NULL,
  reason TEXT,
  user_agent TEXT,
  fingerprint_hash TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ DEFAULT now()
);
```

### 8.2 Event Types

| Event | Description | Data Captured |
|-------|-------------|---------------|
| `allow` | Request passed | IP, score, fingerprint |
| `challenge` | Challenge presented | IP, score, challenge type |
| `challenge_pass` | Challenge solved | IP, solve time |
| `challenge_fail` | Challenge failed | IP, attempt count |
| `block` | Request blocked | IP, score, block reason |
| `rate_limit` | Rate limit hit | IP, endpoint, rate |

---

## 9. WordPress Integration

### 9.1 Plugin Architecture

Defense powers three WordPress plugins:

| Plugin | Focus | Features |
|--------|-------|----------|
| Reflex Bot Sniper (Full) | Complete suite | WAF, malware, behavioral |
| Bot Sniper Standalone | Core detection | Behavioral only |
| Clarity | Accessibility | WCAG scanning |

### 9.2 WordPress API Bridge

```php
// WordPress plugin integration
class PF_Defense_Bridge {
  private $api_key;
  private $endpoint = 'https://api.promptfluid.com/v1/defense';
  
  public function check_request($request_data) {
    $response = wp_remote_post($this->endpoint . '/analyze', [
      'headers' => ['X-API-Key' => $this->api_key],
      'body' => json_encode([
        'ip' => $request_data['ip'],
        'user_agent' => $request_data['ua'],
        'endpoint' => $request_data['path'],
        'fingerprint' => $request_data['fp']
      ])
    ]);
    
    return json_decode(wp_remote_retrieve_body($response));
  }
}
```

### 9.3 Protection Modes

| Mode | Performance Impact | Protection Level |
|------|-------------------|------------------|
| Passive | None | Monitor only |
| Standard | Low | Basic protection |
| Aggressive | Medium | Full protection |
| Lockdown | High | Maximum security |

---

## 10. Edge Functions

### 10.1 Core Defense Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `pf-bot-detection` | Main analysis endpoint | API call |
| `pf-behavioral-analysis` | Behavioral scoring | Detection request |
| `pf-defense-event` | Event logging | All decisions |
| `pf-defense-stats` | Analytics aggregation | Dashboard |
| `pf-defense-rules` | Rule management | Admin |
| `pf-defense-ip-reputation` | IP scoring | Detection |

### 10.2 Specialized Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `pf-defense-threat-feed` | External threat intel | Scheduled |
| `pf-defense-auto-repair` | Self-healing rules | Anomaly detected |
| `pf-defense-anomaly-detection` | Pattern detection | Continuous |
| `pf-defense-alert-email` | Admin notifications | Critical events |

---

## 11. Metrics & Observability

### 11.1 Key Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Block rate | Percentage of blocked requests | < 5% (legit traffic) |
| False positive rate | Humans incorrectly blocked | < 0.1% |
| Challenge solve rate | CAPTCHA completion rate | > 95% for humans |
| Detection latency | Time to decision | < 50ms |
| Rule effectiveness | Blocks per rule | Varies |

### 11.2 Dashboard Visualizations

- Real-time threat map (geographic)
- Attack timeline (temporal)
- Top blocked IPs
- Rule performance matrix
- Challenge success rates

---

## 12. Extension Points

### 12.1 Custom Rules API

```typescript
await supabase.functions.invoke('pf-defense-rules', {
  body: {
    action: 'create',
    rule: {
      name: 'Block suspicious UA',
      pattern: 'user_agent CONTAINS "crawler"',
      action: 'block',
      priority: 80
    }
  }
});
```

### 12.2 Webhook Integration

```typescript
// Register webhook for security events
await supabase.functions.invoke('pf-defense-config', {
  body: {
    webhooks: [{
      url: 'https://your-server.com/security-hook',
      events: ['block', 'challenge_fail'],
      secret: 'your-webhook-secret'
    }]
  }
});
```

### 12.3 Custom Fingerprinting

```typescript
// Add custom fingerprint signals
await supabase.functions.invoke('pf-bot-detection', {
  body: {
    // Standard signals
    ip: '1.2.3.4',
    user_agent: 'Mozilla/5.0...',
    
    // Custom signals
    custom_signals: {
      custom_js_hash: 'abc123',
      app_specific_token: 'xyz789'
    }
  }
});
```

---

## References

1. Imperva Bot Management Report. https://www.imperva.com/resources/reports/bad-bot-report
2. OWASP Automated Threats. https://owasp.org/www-project-automated-threats
3. Device Fingerprinting. https://fingerprintjs.com/resources/
4. CAPTCHA Effectiveness Studies. Various academic sources.

---

**Document Status:** STABLE  
**Next Review:** 2026-07-13
