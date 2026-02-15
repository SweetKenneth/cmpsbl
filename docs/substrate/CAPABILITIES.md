# Substrate Capabilities Reference

**CMPSBL Substrate OS v6.0.0 — Capability Documentation**

This document catalogs all cognitive capabilities available in Substrate templates and the AI Template Generator.

---

## Overview

Every template built on the CMPSBL Substrate inherits **48+ production-ready cognitive capabilities** organized into 8 categories. These capabilities are accessible via the SDK and are automatically integrated into generated templates.

---

## 1. Memory & Context

Persistent context across sessions with multi-tier memory architecture.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Context Recall** | Retrieve relevant memories from previous interactions | `brain.recall(query, limit?)` |
| **Session Persistence** | Maintain conversation state across browser sessions | `brain.remember(content, type)` |
| **Memory Tiering** | Hot/Warm/Cold memory tiers for optimal retrieval | `brain.status()` |
| **Knowledge Graphs** | Semantic relationships between learned concepts | `brain.graph()` |
| **Memory Compression** | Intelligent summarization of older memories | `brain.optimize()` |
| **Cross-Session Learning** | Build knowledge over multiple interactions | `brain.learn(content, source?)` |

### Usage Example

```typescript
import { substrate } from '@/lib/substrate';

// Store a memory
await substrate.brain.remember(
  'User prefers dark mode',
  'preference',
  0.9
);

// Recall relevant memories
const memories = await substrate.brain.recall('user preferences', 10);

// Build knowledge graph connections
await substrate.brain.graphBuild();
```

---

## 2. Analysis & Understanding

Deep understanding of content, intent, and emotional context.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Mood Detection** | Analyze emotional tone and sentiment in real-time | `decode.intent(message)` |
| **Intent Recognition** | Understand what users really want from their input | `decode.intent(message)` |
| **Sentiment Analysis** | Track emotional states across conversations | `nexus.text(prompt, 'sentiment')` |
| **Theme Extraction** | Identify key themes and topics automatically | `brain.patterns()` |
| **Pattern Recognition** | Detect behavioral and usage patterns | `defense.anomaly(window)` |
| **Anomaly Detection** | Flag unusual patterns for review | `defense.anomalyProbe(hours?)` |

### Usage Example

```typescript
// Extract intent from user message
const intent = await substrate.decode.intent('I want to book a flight');
// Returns: { intent: 'booking', entity: 'flight', confidence: 0.92 }

// Analyze sentiment
const sentiment = await substrate.nexus.text(
  'Analyze sentiment: The product exceeded expectations',
  'gpt-5-mini'
);
```

---

## 3. Relationship Mapping

Build and traverse semantic connections between concepts.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Entity Extraction** | Identify people, places, and concepts from text | `brain.learn(content)` |
| **Semantic Linking** | Connect related concepts automatically | `brain.graphBuild()` |
| **Causal Chains** | Track cause-and-effect relationships | `brain.graph({ inspect: true })` |
| **Hierarchy Building** | Organize knowledge in structured trees | `brain.graph({ stats: true })` |
| **Association Scoring** | Weighted connections between concepts | `brain.graphSummary()` |
| **Graph Traversal** | Find paths between any two concepts | `brain.query(query)` |

### Usage Example

```typescript
// Build the knowledge graph
await substrate.brain.graphBuild();

// Get graph statistics
const stats = await substrate.brain.graph({ stats: true });
console.log(`Nodes: ${stats.data.nodes}, Edges: ${stats.data.edges}`);

// Query for related concepts
const related = await substrate.brain.query('machine learning');
```

---

## 4. Adaptive Learning

Self-improving systems that get smarter with each interaction.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Difficulty Scaling** | Adjust complexity based on user mastery | Custom template logic |
| **Skill Tracking** | Monitor progress across knowledge domains | `brain.patterns()` |
| **Personalized Paths** | Custom learning journeys per user | `brain.sessionReflection(hours?)` |
| **Feedback Integration** | Learn from corrections and preferences | `brain.reinforce(memory_id, boost?)` |
| **Competency Scoring** | Track and improve task performance | `brain.coherenceCheck(depth?)` |
| **Continuous Improvement** | Background optimization of responses | `brain.continuousLearn(enabled)` |

### Usage Example

```typescript
// Enable continuous learning
await substrate.brain.continuousLearn(true);

// Reinforce a successful pattern
await substrate.brain.reinforce('memory-abc123', 1.5);

// Check learning coherence
const coherence = await substrate.brain.coherenceCheck('deep');
```

---

## 5. Security & Defense

Built-in protection against threats and misuse.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Bot Detection** | Identify and block automated abuse | `defense.analyze(fingerprint, ip?)` |
| **Rate Limiting** | Adaptive throttling to prevent abuse | `defense.limits()` |
| **Input Sanitization** | Clean and validate all user input | Built into all endpoints |
| **Threat Analysis** | Real-time threat scoring and blocking | `defense.posture()` |
| **IP Intelligence** | Reputation-based access control | `defense.ipIntel(ip, history?)` |
| **Audit Logging** | Complete activity trail for compliance | `vision.audit(entity?, action?)` |

### Usage Example

```typescript
// Analyze a potential threat
const threat = await substrate.defense.analyze(
  { userAgent: navigator.userAgent, screen: '1920x1080' },
  '192.168.1.1'
);

// Check current security posture
const posture = await substrate.defense.posture();
console.log(`Threat Level: ${posture.data.threat_level}`);
```

---

## 6. Dream & Evolution

Nocturnal processing for system-wide improvements.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Dream Cycles** | Background processing for optimization | `dream.cycle()` |
| **Heuristic Synthesis** | Generate new strategies from patterns | `dream.feed(insights)` |
| **Memory Consolidation** | Strengthen important memories overnight | `brain.dream()` |
| **Pattern Fusion** | Combine insights across domains | `brain.synthesize()` |
| **Self-Improvement** | Autonomous capability enhancement | `dream.awaken()` |
| **Mutation Engine** | Controlled variation for evolution | `dream.status()` |

### Usage Example

```typescript
// Trigger a dream cycle
const dreamResult = await substrate.dream.cycle();

// Feed insights for synthesis
await substrate.dream.feed({
  patterns: ['user-engagement-high', 'error-rate-low'],
  confidence: 0.85
});

// Awaken with new heuristics
const newHeuristics = await substrate.dream.awaken();
```

---

## 7. Observability & Health

Real-time monitoring and health tracking.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **Health Monitoring** | Track system health in real-time | `vision.health()` |
| **Metrics Collection** | Comprehensive performance metrics | `vision.metrics()` |
| **Distributed Tracing** | Track requests across all modules | `vision.trace(traceId?)` |
| **Alert Management** | Proactive issue notification | `vision.alert(severity, message)` |
| **Dashboard Analytics** | Visual insights into system state | `vision.dashboard()` |
| **Dependency Mapping** | Visualize module relationships | `vision.dependencyMap()` |

### Usage Example

```typescript
// Get health snapshot
const health = await substrate.vision.healthSnapshot();
console.log(`System Health: ${health.data.overall_health}%`);

// Create a trace for debugging
await substrate.vision.trace(undefined, {
  create: true,
  module: 'brain',
  action: 'query'
});
```

---

## 8. Human Compatibility

WCAG compliance and accessibility built-in.

| Capability | Description | SDK Method |
|------------|-------------|------------|
| **WCAG 2.2 Scanning** | Automated accessibility auditing | `inclusive.scan(url)` |
| **Auto-Repair** | Fix common accessibility issues | `inclusive.repair(issues)` |
| **Screen Reader Support** | Optimized for assistive tech | Built into templates |
| **Keyboard Navigation** | Full keyboard accessibility | Built into templates |
| **Color Contrast** | Ensure readable color combinations | `inclusive.validate(element)` |
| **Semantic HTML** | Proper document structure | Template defaults |

### Usage Example

```typescript
// Scan a page for accessibility issues
const scan = await substrate.inclusive.scan('https://example.com');

// Auto-repair common issues
if (scan.data.issues.length > 0) {
  await substrate.inclusive.repair(scan.data.issues);
}

// Generate accessibility report
const report = await substrate.inclusive.report();
```

---

## Template Integration

All capabilities are pre-wired in generated templates. When you purchase or generate a template, these features are automatically available:

```typescript
// Every template includes the substrate client
import { substrate } from '@/lib/substrate';

// Access any capability immediately
const result = await substrate.brain.recall('user context');
```

---

## Quick Reference

| Category | Features | Primary Module |
|----------|----------|----------------|
| Memory & Context | 6 | BRAIN |
| Analysis & Understanding | 6 | DECODE, NEXUS |
| Relationship Mapping | 6 | BRAIN |
| Adaptive Learning | 6 | BRAIN |
| Security & Defense | 6 | DEFENSE |
| Dream & Evolution | 6 | DREAM |
| Observability & Health | 6 | VISION |
| Human Compatibility | 6 | INCLUSIVE |

**Total: 400+ capabilities across 21 modules (6 layers)**

---

*CMPSBL Substrate OS v10.5.0*
*© 2025-2026 PromptFluid®. All rights reserved.*
