# ⚔️ PromptFluid Defense API Reference

Complete API documentation for all 19 Defense edge functions.

---

## Table of Contents
1. [Core Detection](#core-detection)
2. [AI-Powered](#ai-powered)
3. [Monitoring & Alerts](#monitoring--alerts)
4. [Maintenance](#maintenance)
5. [Usage Examples](#usage-examples)

---

## Core Detection

### 1. Behavioral Analysis
**Endpoint**: `/functions/v1/pf-defense-behavioral-analysis`  
**Auth**: Public (no JWT)  
**Method**: POST

Analyzes user behavior patterns to detect bots.

**Request**:
```json
{
  "fingerprint_hash": "abc123...",
  "mouse_movements": [{ "x": 100, "y": 200, "timestamp": 1234567890 }],
  "keyboard_events": [{ "key": "a", "timestamp": 1234567890, "type": "keydown" }],
  "scroll_events": [{ "scrollY": 500, "timestamp": 1234567890 }],
  "click_events": [{ "x": 150, "y": 250, "timestamp": 1234567890 }],
  "page_focus_times": [{ "focused": true, "timestamp": 1234567890 }]
}
```

**Response**:
```json
{
  "overall_score": 75,
  "risk_level": "suspicious",
  "analysis": {
    "mouse_score": 80,
    "keyboard_score": 70,
    "scroll_score": 75,
    "timing_score": 75
  },
  "flags": ["abnormal_mouse_speed", "robotic_click_timing"]
}
```

---

### 2. Anomaly Detection
**Endpoint**: `/functions/v1/pf-defense-anomaly-detection`  
**Auth**: Admin JWT required  
**Method**: POST

Detects statistical anomalies in defense events.

**Request**:
```json
{
  "lookbackHours": 24
}
```

**Response**:
```json
{
  "anomalies": [
    {
      "event_id": "evt_123",
      "timestamp": "2025-01-31T12:00:00Z",
      "risk_score": 95,
      "action": "block",
      "ip_address": "1.2.3.4",
      "anomaly_score": 85,
      "confidence": 0.92
    }
  ],
  "total_anomalies": 5,
  "baseline_events": 1234,
  "statistics": {
    "avg_risk_score": "65.4",
    "std_dev_risk_score": "12.3",
    "unique_fingerprints": 456
  }
}
```

---

### 3. IP Reputation
**Endpoint**: `/functions/v1/pf-defense-ip-reputation`  
**Auth**: Public (no JWT)  
**Method**: POST

Checks IP reputation with 24-hour caching.

**Request**:
```json
{
  "ip_address": "1.2.3.4"
}
```

**Response**:
```json
{
  "ip_address": "1.2.3.4",
  "reputation_score": 45,
  "is_vpn": false,
  "is_proxy": false,
  "is_datacenter": true,
  "is_tor": false,
  "country_code": "US",
  "risk_level": "high",
  "reasons": ["datacenter_ip_aws"]
}
```

---

### 4. Rate Limit
**Endpoint**: `/functions/v1/pf-defense-rate-limit`  
**Auth**: Public (no JWT)  
**Method**: POST

Enforces rate limiting per identifier.

**Request**:
```json
{
  "identifier": "1.2.3.4",
  "action": "api_call",
  "limit": 100,
  "window_seconds": 3600
}
```

**Response** (200 OK):
```json
{
  "allowed": true,
  "current_count": 45,
  "limit": 100,
  "reset_at": "2025-01-31T13:00:00Z"
}
```

**Response** (429 Rate Limited):
```json
{
  "allowed": false,
  "current_count": 100,
  "limit": 100,
  "reset_at": "2025-01-31T13:00:00Z",
  "retry_after_seconds": 600
}
```

**Headers**:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Requests left
- `X-RateLimit-Reset`: Reset timestamp
- `Retry-After`: Seconds to wait (if 429)

---

### 5. System Health
**Endpoint**: `/functions/v1/pf-defense-system-health`  
**Auth**: Admin JWT required  
**Method**: GET

Comprehensive system health check.

**Response**:
```json
{
  "services": {
    "database": { "status": "online", "details": "Operational" },
    "auth": { "status": "online", "details": "Operational" },
    "edge_functions": { "status": "online", "details": "Operational" },
    "defense_engine": { 
      "status": "online", 
      "details": "1234 requests in 24h, 56 blocked" 
    }
  },
  "metrics": {
    "total_requests_24h": 1234,
    "blocked_requests_24h": 56,
    "avg_risk_score": 42,
    "block_rate": 4
  },
  "overallScore": 100,
  "status": "healthy",
  "timestamp": "2025-01-31T12:00:00Z"
}
```

---

## AI-Powered

### 6. Challenge Optimizer
**Endpoint**: `/functions/v1/pf-defense-challenge-optimizer`  
**Auth**: Admin JWT required  
**Method**: POST

AI-powered challenge difficulty optimization.

**Request**: None (analyzes last 7 days automatically)

**Response**:
```json
{
  "success": true,
  "recommendations": {
    "adjustments": [
      {
        "threshold": "challenge",
        "new_value": 75,
        "reason": "Current block rate suggests challenges are too aggressive"
      }
    ],
    "confidence": 85
  },
  "current_stats": {
    "totalEvents": 5678,
    "challengedEvents": 234,
    "blockedEvents": 123,
    "avgRiskScore": 45.6
  }
}
```

---

### 7. Security Report
**Endpoint**: `/functions/v1/pf-defense-security-report`  
**Auth**: Public (no JWT)  
**Method**: POST

Generates AI-powered threat intelligence reports.

**Request**:
```json
{
  "technicalDetails": "Recent spike in bot traffic from datacenter IPs. Behavioral analysis shows robotic patterns..."
}
```

**Response**:
```json
{
  "report": "# Threat Intelligence Report\n\n## Executive Summary\n..."
}
```

---

## Monitoring & Alerts

### 8. Auto Shutdown
**Endpoint**: `/functions/v1/pf-defense-auto-shutdown`  
**Auth**: Public (no JWT)  
**Method**: GET

Monitors threat levels and triggers emergency shutdown.

**Response**:
```json
{
  "monitored": true,
  "action": "shutdown_triggered",
  "avg_risk_score": 87.5,
  "max_risk_score": 95,
  "threshold": 85,
  "message": "Emergency shutdown activated"
}
```

---

### 9. Monitor
**Endpoint**: `/functions/v1/pf-defense-monitor`  
**Auth**: Public (no JWT)  
**Method**: GET

Continuous detection rate monitoring.

**Response**:
```json
{
  "success": true,
  "alert_triggered": true,
  "alert": {
    "success_rate": 0.75,
    "total_events": 1000,
    "failed_events": 250,
    "time_window": "1 hour",
    "severity": "high",
    "recommendations": [
      "High block rate detected",
      "Review bot detection patterns"
    ]
  }
}
```

---

### 10. Notification Queue
**Endpoint**: `/functions/v1/pf-defense-notification-queue`  
**Auth**: Public (no JWT)  
**Method**: GET

Processes pending threat notifications.

**Response**:
```json
{
  "success": true,
  "processed": 3,
  "results": [
    { "event_id": "evt_1", "status": "sent", "recipient": "admin@example.com" }
  ]
}
```

---

### 11. Alert Email
**Endpoint**: `/functions/v1/pf-defense-alert-email`  
**Auth**: Public (no JWT)  
**Method**: POST

Prepares email alerts for threats.

**Request**:
```json
{
  "defense_event": {
    "ip": "1.2.3.4",
    "risk_score": 95,
    "action": "block",
    "reason": "Multiple bot indicators detected"
  },
  "alert_email": "admin@example.com"
}
```

---

## Maintenance

### 12. Auto Repair
**Endpoint**: `/functions/v1/pf-defense-auto-repair`  
**Auth**: Public (no JWT)  
**Method**: POST

Self-healing system diagnostics.

**Request**:
```json
{
  "diagnostics": [
    { "check": "High Risk Activity", "status": "warning" },
    { "check": "Database Connection", "status": "fail" }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "repair_actions": [
    {
      "check": "High Risk Activity",
      "action": "enable_rate_limit",
      "status": "success",
      "details": "Rate limiting enabled automatically"
    }
  ],
  "summary": {
    "total_actions": 2,
    "successful": 1,
    "failed": 1
  }
}
```

---

### 13. Export Analytics
**Endpoint**: `/functions/v1/pf-defense-export-analytics`  
**Auth**: Admin JWT required  
**Method**: POST

Exports defense data as CSV or JSON.

**Request**:
```json
{
  "format": "csv",
  "dataType": "events",
  "startDate": "2025-01-01",
  "endDate": "2025-01-31"
}
```

**Response** (CSV):
```
Content-Type: text/csv
Content-Disposition: attachment; filename="promptfluid-defense-events-1234567890.csv"

id,ip,risk_score,action,created_at
...
```

---

### 14. Comprehensive Logs
**Endpoint**: `/functions/v1/pf-defense-comprehensive-logs`  
**Auth**: Admin JWT required  
**Method**: POST

Unified log aggregation from all sources.

**Request**:
```json
{
  "limit": 100,
  "types": ["defense", "learning"]
}
```

---

### 15-19. Update Management Suite

**Validate Update**: `/functions/v1/pf-defense-validate-update` (Admin)  
**Rollback Update**: `/functions/v1/pf-defense-rollback-update` (Admin)  
**Push Update**: `/functions/v1/pf-defense-push-update` (Admin)  
**Update Checker**: `/functions/v1/pf-defense-update-checker` (Admin)  
**Tenant Operations**: `/functions/v1/pf-defense-tenant-operations` (Admin)  
**Remote Repairs**: `/functions/v1/pf-defense-remote-repairs` (Admin)

All follow similar patterns with admin auth and operation-specific payloads.

---

## Usage Examples

### WordPress Plugin Integration

```javascript
// Frontend protection script
async function checkRequest() {
  const fingerprint = await collectFingerprint();
  const behavioral = trackBehavior();
  
  const response = await fetch('/wp-json/pfdef/v1/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fingerprint_hash: fingerprint.hash,
      mouse_movements: behavioral.mouse,
      keyboard_events: behavioral.keyboard,
      scroll_events: behavioral.scroll,
      click_events: behavioral.clicks,
      page_focus_times: behavioral.focus
    })
  });
  
  const result = await response.json();
  if (result.risk_level === 'bot') {
    showChallenge();
  }
}
```

### Admin Dashboard Integration

```typescript
// React component
const useDefenseHealth = () => {
  const { data } = useQuery({
    queryKey: ['defense-health'],
    queryFn: async () => {
      const { data } = await supabase.functions.invoke('pf-defense-system-health');
      return data;
    },
    refetchInterval: 30000 // Every 30 seconds
  });
  
  return data;
};
```

---

## Rate Limiting

All public endpoints enforce rate limiting:
- Default: 100 requests per hour per IP
- Configurable per endpoint
- Returns 429 with Retry-After header

---

## Error Handling

All endpoints follow consistent error format:

```json
{
  "error": "Error message",
  "details": "Additional context (optional)"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `429`: Rate Limited
- `500`: Server Error

---

**PromptFluid Defense API v1.0**  
*AI That Flows.*
