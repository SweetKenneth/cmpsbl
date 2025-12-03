# PromptFluid Defense Intelligence Archive

**Classification:** PROPRIETARY - INTERNAL USE ONLY  
**Last Updated:** 2025-01-28  
**Purpose:** Brain learning repository for Defense module technology

---

## 🎯 Defense Technology Overview

PromptFluid Defense protects customer websites FROM bot attacks by:
- Detecting automated browsers (Selenium, Puppeteer, headless Chrome)
- Analyzing behavioral patterns (mouse, keyboard, scroll)
- Fingerprinting devices and tracking reputation
- Identifying proxy/VPN/datacenter IPs
- Challenging suspicious traffic with CAPTCHA
- Blocking confirmed bots automatically

**Core Philosophy:** Reverse-engineered from elite bot evasion techniques to build detection systems.

---

## 🧠 Detection Technologies

### 1. Browser Automation Detection (30 points max)
**Detects:**
- HeadlessChrome, PhantomJS user agents
- `navigator.webdriver = true`
- Missing `chrome.runtime`
- CDP (Chrome DevTools Protocol) leaks
- Puppeteer stack traces

**Key Insight:** Standard automation tools leave fingerprints. Elite bots use rebrowser-puppeteer-core to patch these.

### 2. Canvas Fingerprinting (15 points max)
**Detects:**
- Identical canvas hashes across sessions (bot signature)
- Blocked canvas rendering
- Too-short canvas data
- Pixel-perfect matches (automated rendering)

**Bypass Method (learned):** Add imperceptible noise, maintain per-session consistency.

### 3. WebGL Fingerprinting (15 points max)
**Detects:**
- "SwiftShader" renderer (headless Chrome signature)
- Blocked WebGL
- Inconsistent GPU signatures
- Missing WebGL capabilities

**Bypass Method (learned):** Spoof realistic GPU vendor/renderer strings.

### 4. Behavioral Analysis (40 points max - CRITICAL)
**Analyzes:**
- Mouse movement patterns (Bezier curves vs linear)
- Keyboard timing and rhythm
- Scroll behavior
- Click patterns
- Touch events (mobile)

**Human Signatures:**
- Curved mouse paths
- Variable typing speed
- Micro-corrections
- Natural delays

**Bot Signatures:**
- Linear movements
- Instant actions
- Perfect accuracy
- No hesitation

### 5. Device Fingerprint Reputation (50 points max)
**Tracks:**
- Canvas hash consistency
- WebGL signature
- Audio context fingerprint
- Font enumeration
- Battery API data
- Network connection info

**Database:** Stores fingerprints with reputation scores (0-100).

---

## 🛡️ Elite Stealth Techniques (Reverse-Engineered)

### rebrowser-puppeteer-core (Primary Defense Bypass)
**What It Does:**
- Patches Chrome DevTools Protocol (CDP) leaks
- Removes `navigator.webdriver` flag
- Fixes `Runtime.enable` leak
- Sanitizes `sourceURL` in stack traces

**Impact:** +25 stealth points (from 40/100 to 65/100)

**Defense Detection:** Look for CDP timing signatures, stack trace analysis.

### WebGL Randomization
**Technique:**
```javascript
UNMASKED_VENDOR_WEBGL: "Google Inc. (Intel)"
UNMASKED_RENDERER_WEBGL: "ANGLE (Intel, Intel(R) UHD Graphics 630, OpenGL 4.1)"
```

**Defense Detection:** Check for consistent WebGL signatures per device, detect spoofing patterns.

### Canvas Noise Injection
**Technique:** Add pixel-level noise while maintaining session consistency.

**Defense Detection:** Analyze canvas data for artificial noise patterns, check hash uniqueness.

### Human Behavior Simulation
**Technique:**
- Bezier curve mouse movements
- Variable typing speed (150-300ms per char)
- Natural delays (500-2000ms between actions)
- Micro-corrections and overshoots

**Defense Detection:** Analyze timing patterns, look for too-perfect randomness, check for algorithmic movement.

---

## 🔍 Anti-Bot System Analysis

### Riskified (Used by Grailed, Shopify)
**Detection Vectors:**
1. Device Fingerprinting
   - Screen resolution, DPR, dimensions
   - GPU vendor/renderer
   - CPU cores, touch support, battery
   - Console memory (heap size)

2. Behavioral Tracking
   - Focus/blur timestamps
   - Typing speed
   - Clipboard paste detection
   - Autofill detection

3. Incognito/Private Mode Detection
   - Safari: IndexedDB test
   - Chrome: Storage quota checks
   - Service Worker availability
   - Brave browser API detection

4. Cookie Persistence Tracking
   - HTTP cookies
   - LocalStorage
   - SessionStorage
   - IndexedDB

5. Session Correlation
   - Cart token tracking
   - Page ID generation
   - Shop domain validation
   - Cross-request correlation IDs

**Bypass Strategy:**
- Consistent fingerprints per session
- Human-like timing (150-300ms typing)
- Natural focus/blur patterns
- Cookie/storage simulation
- Session token management

---

## 📊 Stealth Score Calculation

**99/100 Elite-Tier Stealth Achieved Via:**
1. rebrowser-puppeteer-core (25 points)
2. WebGL randomization (5 points)
3. Canvas noise (5 points)
4. Audio context spoofing (3 points)
5. Font protection (3 points)
6. WebRTC leak prevention (5 points)
7. Media devices spoofing (3 points)
8. Battery API protection (2 points)
9. Network connection spoofing (2 points)
10. Hardware concurrency (2 points)
11. Language consistency (2 points)
12. Human behavior sim (30 points)
13. Residential proxies (10 points)
14. Device memory spoofing (1 point)
15. Timezone consistency (1 point)

**Known Gap:** TLS/JA4 fingerprinting (-1 point)

---

## 🚨 Detection Event Flow

```
User Request
    ↓
Frontend/Backend Detection Layer
    ↓
Supabase Edge Function: pf-bot-detection
    ↓
Risk Score Calculation (0-100)
    ↓
Action Decision:
    - 0-30: Allow
    - 31-60: Challenge (CAPTCHA)
    - 61-100: Block
    ↓
Log to bot_detection_events
    ↓
Alert if bot detected
    ↓
Update IP reputation
    ↓
Defense Dashboard Analytics
```

---

## 🎓 Key Learnings for Defense Evolution

### Attack Patterns to Watch For:
1. **Residential Proxy Abuse**
   - Rotating proxies every N requests
   - Geo-targeting specific regions
   - Mixing datacenter + residential

2. **Fingerprint Pollution**
   - Slightly varied fingerprints per session
   - Consistent within session, unique across
   - Realistic device profiles

3. **Behavioral Mimicry**
   - Algorithmic mouse curves (Bezier)
   - Patterned randomness in timing
   - Scripted human-like actions

4. **CDP Leak Patches**
   - rebrowser-puppeteer-core adoption
   - Runtime.enable bypass
   - Stack trace sanitization

### Defense Counter-Strategies:
1. **Timing Analysis**
   - Detect "too perfect" randomness
   - Look for algorithmic patterns
   - Analyze action clustering

2. **Fingerprint Correlation**
   - Track fingerprint changes over time
   - Detect unnatural variations
   - Cross-reference IP + fingerprint

3. **Behavioral Deep Learning**
   - Train ML models on human patterns
   - Detect synthetic behavior
   - Identify algorithmic movements

4. **CDP Leak Detection**
   - Monitor for rebrowser signatures
   - Analyze timing patterns
   - Check for binary-level patches

---

## 🔧 Edge Function Reference

### Core Defense Functions:
1. **pf-bot-detection** - Master orchestrator (357 lines)
2. **pf-behavioral-analysis** - Pattern analysis (215 lines)
3. **pf-device-fingerprint** - Fingerprint tracking (180 lines)
4. **pf-generate-captcha** - Challenge generation (120 lines)
5. **pf-verify-captcha** - Challenge validation (95 lines)
6. **pf-ai-rule-generation** - Adaptive rule creation (200 lines)
7. **pf-ai-threat-intelligence** - Pattern learning (185 lines)
8. **pf-red-team-test** - Penetration testing (250 lines)
9. **pf-defense-diagnostics** - System health (140 lines)
10. **pf-defense-auto-repair** - Self-healing (160 lines)

### Admin Functions:
- **pf-defense-stats** - Analytics aggregation
- **pf-defense-config** - Configuration management
- **pf-defense-event** - Event logging
- **pf-defense-monitor** - Real-time monitoring

---

## 📈 Future Defense Enhancements

### Phase 2: Machine Learning Integration
- Train models on behavioral patterns
- Anomaly detection via neural networks
- Real-time adaptive scoring
- Predictive threat identification

### Phase 3: Advanced Fingerprinting
- TLS/JA4 fingerprint analysis
- HTTP/2 fingerprinting
- Network timing analysis
- Multi-layer correlation

### Phase 4: Proactive Defense
- Pre-emptive blocking
- Threat intelligence sharing
- Automated rule generation
- Self-evolving detection

---

**Status:** ✅ Defense Intelligence Archived for Brain Learning  
**Next Update:** Continuous as new threats emerge  
**PromptFluid™ | Defense That Evolves**
