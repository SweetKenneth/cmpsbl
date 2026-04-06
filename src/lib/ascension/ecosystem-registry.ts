/**
 * CMPSBL® Ecosystem Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * As the scanner processes more codebases, it builds a registry of
 * capability implementations organized by ecosystem, language, and
 * quality score.
 *
 * When a gap is found, the registry can suggest specific known-good
 * implementations ranked by compatibility with the target environment.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface RegistryEntry {
  /** Capability/archetype this implements */
  archetypeId: string;
  /** Implementation name (e.g., "express-rate-limit") */
  name: string;
  /** Which ecosystem it belongs to */
  ecosystem: string;
  /** Quality score (0–100) based on scan results */
  qualityScore: number;
  /** Which primitives it maps to */
  primitives: string[];
  /** How many times the scanner has confirmed this implementation */
  scanConfirmations: number;
  /** Common package/library names */
  packages: string[];
  /** Brief description */
  description: string;
  /** Last seen timestamp */
  lastSeen: number;
}

export interface RegistrySuggestion {
  entry: RegistryEntry;
  /** Compatibility score with the target (0–1) */
  compatibility: number;
  /** Why this was suggested */
  reason: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SEED REGISTRY
// ═══════════════════════════════════════════════════════════════════════════════
//
// Pre-seeded with known-good implementations across ecosystems.
// The feedback loop will grow this over time.
// ═══════════════════════════════════════════════════════════════════════════════

const SEED_ENTRIES: RegistryEntry[] = [
  // ── Rate Limiting ──
  { archetypeId: 'rate-limiting', name: 'express-rate-limit', ecosystem: 'javascript', qualityScore: 85, primitives: ['ACCESS', 'REFLEX'], scanConfirmations: 0, packages: ['express-rate-limit'], description: 'Express middleware for rate limiting with memory/Redis store', lastSeen: 0 },
  { archetypeId: 'rate-limiting', name: 'slowapi', ecosystem: 'python', qualityScore: 80, primitives: ['ACCESS', 'REFLEX'], scanConfirmations: 0, packages: ['slowapi'], description: 'FastAPI/Starlette rate limiter based on limits', lastSeen: 0 },
  { archetypeId: 'rate-limiting', name: 'golang-rate', ecosystem: 'go', qualityScore: 90, primitives: ['ACCESS', 'REFLEX'], scanConfirmations: 0, packages: ['golang.org/x/time/rate'], description: 'Go standard library token bucket rate limiter', lastSeen: 0 },
  { archetypeId: 'rate-limiting', name: 'governor', ecosystem: 'rust', qualityScore: 88, primitives: ['ACCESS', 'REFLEX'], scanConfirmations: 0, packages: ['governor'], description: 'Rust rate limiting library with GCRA algorithm', lastSeen: 0 },
  { archetypeId: 'rate-limiting', name: 'bucket4j', ecosystem: 'java', qualityScore: 87, primitives: ['ACCESS', 'REFLEX'], scanConfirmations: 0, packages: ['bucket4j'], description: 'Java rate limiting with token bucket algorithm', lastSeen: 0 },

  // ── Error Recovery ──
  { archetypeId: 'error-recovery', name: 'opossum', ecosystem: 'javascript', qualityScore: 82, primitives: ['REFLEX', 'MEDIC'], scanConfirmations: 0, packages: ['opossum'], description: 'Node.js circuit breaker with fallback support', lastSeen: 0 },
  { archetypeId: 'error-recovery', name: 'tenacity', ecosystem: 'python', qualityScore: 88, primitives: ['REFLEX', 'MEDIC'], scanConfirmations: 0, packages: ['tenacity'], description: 'Python retry library with exponential backoff', lastSeen: 0 },
  { archetypeId: 'error-recovery', name: 'resilience4j', ecosystem: 'java', qualityScore: 92, primitives: ['REFLEX', 'MEDIC', 'IMMUNITY'], scanConfirmations: 0, packages: ['resilience4j'], description: 'Java fault tolerance with circuit breaker, retry, bulkhead', lastSeen: 0 },
  { archetypeId: 'error-recovery', name: 'polly', ecosystem: 'csharp', qualityScore: 90, primitives: ['REFLEX', 'MEDIC', 'IMMUNITY'], scanConfirmations: 0, packages: ['Polly'], description: '.NET resilience and transient-fault handling', lastSeen: 0 },
  { archetypeId: 'error-recovery', name: 'gobreaker', ecosystem: 'go', qualityScore: 85, primitives: ['REFLEX', 'MEDIC'], scanConfirmations: 0, packages: ['github.com/sony/gobreaker'], description: 'Go circuit breaker implementation', lastSeen: 0 },

  // ── Observability ──
  { archetypeId: 'observability', name: 'opentelemetry', ecosystem: 'javascript', qualityScore: 93, primitives: ['AUDIT', 'VISION'], scanConfirmations: 0, packages: ['@opentelemetry/sdk-node'], description: 'Vendor-neutral distributed tracing and metrics', lastSeen: 0 },
  { archetypeId: 'observability', name: 'structlog', ecosystem: 'python', qualityScore: 88, primitives: ['AUDIT', 'VISION'], scanConfirmations: 0, packages: ['structlog'], description: 'Structured logging for Python with processors', lastSeen: 0 },
  { archetypeId: 'observability', name: 'zap', ecosystem: 'go', qualityScore: 91, primitives: ['AUDIT', 'VISION'], scanConfirmations: 0, packages: ['go.uber.org/zap'], description: 'Blazing fast structured logger for Go', lastSeen: 0 },
  { archetypeId: 'observability', name: 'tracing', ecosystem: 'rust', qualityScore: 90, primitives: ['AUDIT', 'VISION'], scanConfirmations: 0, packages: ['tracing'], description: 'Rust application-level tracing framework', lastSeen: 0 },
  { archetypeId: 'observability', name: 'serilog', ecosystem: 'csharp', qualityScore: 89, primitives: ['AUDIT', 'VISION'], scanConfirmations: 0, packages: ['Serilog'], description: '.NET structured logging with sinks', lastSeen: 0 },

  // ── Encryption ──
  { archetypeId: 'encryption', name: 'node-forge', ecosystem: 'javascript', qualityScore: 80, primitives: ['DEFENSE', 'SOVEREIGN'], scanConfirmations: 0, packages: ['node-forge'], description: 'JS implementation of TLS, PKI, and various ciphers', lastSeen: 0 },
  { archetypeId: 'encryption', name: 'cryptography', ecosystem: 'python', qualityScore: 92, primitives: ['DEFENSE', 'SOVEREIGN'], scanConfirmations: 0, packages: ['cryptography'], description: 'Python cryptographic recipes and primitives', lastSeen: 0 },
  { archetypeId: 'encryption', name: 'ring', ecosystem: 'rust', qualityScore: 94, primitives: ['DEFENSE', 'SOVEREIGN'], scanConfirmations: 0, packages: ['ring'], description: 'Rust safe, fast crypto using BoringSSL primitives', lastSeen: 0 },

  // ── Testing ──
  { archetypeId: 'testing', name: 'vitest', ecosystem: 'javascript', qualityScore: 90, primitives: ['SANDBOX', 'ECHO'], scanConfirmations: 0, packages: ['vitest'], description: 'Blazing fast Vite-native test framework', lastSeen: 0 },
  { archetypeId: 'testing', name: 'pytest', ecosystem: 'python', qualityScore: 93, primitives: ['SANDBOX', 'ECHO'], scanConfirmations: 0, packages: ['pytest'], description: 'Python testing framework with fixtures and plugins', lastSeen: 0 },
  { archetypeId: 'testing', name: 'testify', ecosystem: 'go', qualityScore: 87, primitives: ['SANDBOX', 'ECHO'], scanConfirmations: 0, packages: ['github.com/stretchr/testify'], description: 'Go testing toolkit with assertions and mocks', lastSeen: 0 },

  // ── Authentication ──
  { archetypeId: 'auth-control', name: 'passport', ecosystem: 'javascript', qualityScore: 82, primitives: ['ACCESS', 'IDENTITY'], scanConfirmations: 0, packages: ['passport'], description: 'Express-compatible authentication middleware', lastSeen: 0 },
  { archetypeId: 'auth-control', name: 'spring-security', ecosystem: 'java', qualityScore: 91, primitives: ['ACCESS', 'IDENTITY', 'GOVERNANCE'], scanConfirmations: 0, packages: ['spring-boot-starter-security'], description: 'Java comprehensive security framework', lastSeen: 0 },
  { archetypeId: 'auth-control', name: 'devise', ecosystem: 'ruby', qualityScore: 86, primitives: ['ACCESS', 'IDENTITY'], scanConfirmations: 0, packages: ['devise'], description: 'Rails flexible authentication solution', lastSeen: 0 },

  // ── Data Pipeline ──
  { archetypeId: 'data-pipeline', name: 'apache-airflow', ecosystem: 'python', qualityScore: 89, primitives: ['HARVEST', 'CORTEX'], scanConfirmations: 0, packages: ['apache-airflow'], description: 'Workflow orchestration platform', lastSeen: 0 },
  { archetypeId: 'data-pipeline', name: 'bull', ecosystem: 'javascript', qualityScore: 84, primitives: ['HARVEST', 'CORTEX'], scanConfirmations: 0, packages: ['bull', 'bullmq'], description: 'Redis-based queue for Node.js', lastSeen: 0 },

  // ── Compliance ──
  { archetypeId: 'data-sovereignty', name: 'onetrust', ecosystem: 'javascript', qualityScore: 78, primitives: ['SOVEREIGN', 'CONSCIENCE'], scanConfirmations: 0, packages: ['onetrust'], description: 'Consent management and privacy compliance', lastSeen: 0 },
  { archetypeId: 'data-sovereignty', name: 'django-gdpr-assist', ecosystem: 'python', qualityScore: 75, primitives: ['SOVEREIGN', 'CONSCIENCE'], scanConfirmations: 0, packages: ['django-gdpr-assist'], description: 'Django GDPR compliance toolkit', lastSeen: 0 },

  // ── ML/AI ──
  { archetypeId: 'ml-inference', name: 'langchain', ecosystem: 'python', qualityScore: 85, primitives: ['NEXUS', 'BRAIN', 'ORACLE'], scanConfirmations: 0, packages: ['langchain'], description: 'LLM application framework with chains and agents', lastSeen: 0 },
  { archetypeId: 'ml-inference', name: 'transformers', ecosystem: 'python', qualityScore: 94, primitives: ['NEXUS', 'BRAIN'], scanConfirmations: 0, packages: ['transformers'], description: 'Hugging Face state-of-the-art ML models', lastSeen: 0 },
  { archetypeId: 'ml-inference', name: 'onnxruntime', ecosystem: 'javascript', qualityScore: 82, primitives: ['NEXUS', 'BRAIN'], scanConfirmations: 0, packages: ['onnxruntime-node'], description: 'Cross-platform ML inference engine', lastSeen: 0 },

  // ── Accessibility ──
  { archetypeId: 'accessibility', name: 'axe-core', ecosystem: 'javascript', qualityScore: 91, primitives: ['INCLUSIVE', 'CONSCIENCE'], scanConfirmations: 0, packages: ['axe-core', '@axe-core/react'], description: 'Accessibility testing engine for web', lastSeen: 0 },
  { archetypeId: 'accessibility', name: 'pa11y', ecosystem: 'javascript', qualityScore: 83, primitives: ['INCLUSIVE', 'CONSCIENCE'], scanConfirmations: 0, packages: ['pa11y'], description: 'Automated accessibility testing tool', lastSeen: 0 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — REGISTRY STORE (in-memory, bounded)
// ═══════════════════════════════════════════════════════════════════════════════

const MAX_ENTRIES = 500;
const _registry = new Map<string, RegistryEntry>();

// Initialize from seeds
for (const entry of SEED_ENTRIES) {
  _registry.set(`${entry.ecosystem}::${entry.name}`, entry);
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — QUERY API
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Find implementations for a specific archetype, optionally filtered by ecosystem.
 */
export function findImplementations(
  archetypeId: string,
  ecosystem?: string,
): RegistryEntry[] {
  const results: RegistryEntry[] = [];
  for (const entry of _registry.values()) {
    if (entry.archetypeId !== archetypeId) continue;
    if (ecosystem && entry.ecosystem !== ecosystem) continue;
    results.push(entry);
  }
  return results.sort((a, b) => b.qualityScore - a.qualityScore);
}

/**
 * Suggest implementations for gaps in the target codebase.
 * Uses the gap list + ecosystem to find the best matches.
 */
export function suggestForGaps(
  gaps: string[],
  targetEcosystem: string,
): RegistrySuggestion[] {
  // Map gaps back to archetypes
  const gapToArchetype: Record<string, string> = {
    'no-input-validation': 'input-validation',
    'no-error-recovery': 'error-recovery',
    'no-logging': 'observability',
    'no-auth': 'auth-control',
    'no-cost-tracking': 'cost-governance',
    'no-encryption': 'encryption',
    'no-testing': 'testing',
    'no-compliance': 'data-sovereignty',
    'no-accessibility': 'accessibility',
    'no-observability': 'observability',
    'no-caching': 'state-persistence',
    'no-rate-limiting': 'rate-limiting',
    'no-data-pipeline': 'data-pipeline',
    'no-prediction': 'ml-inference',
  };

  const suggestions: RegistrySuggestion[] = [];

  for (const gap of gaps) {
    const archetypeId = gapToArchetype[gap];
    if (!archetypeId) continue;

    const implementations = findImplementations(archetypeId);
    for (const entry of implementations) {
      // Same ecosystem = highest compatibility
      const ecosystemMatch = entry.ecosystem === targetEcosystem ? 1.0 : 0.5;
      const qualityFactor = entry.qualityScore / 100;
      const confirmationFactor = Math.min(1, entry.scanConfirmations / 10);

      const compatibility = Math.round(
        (ecosystemMatch * 0.5 + qualityFactor * 0.3 + confirmationFactor * 0.2) * 1000
      ) / 1000;

      suggestions.push({
        entry,
        compatibility,
        reason: `Closes gap: ${gap} | Quality: ${entry.qualityScore}/100 | Ecosystem: ${entry.ecosystem}`,
      });
    }
  }

  return suggestions
    .sort((a, b) => b.compatibility - a.compatibility)
    .slice(0, 15); // Top 15 suggestions
}

/**
 * Record a confirmed implementation from a scan.
 * Grows the registry over time.
 */
export function recordImplementation(
  entry: Omit<RegistryEntry, 'scanConfirmations' | 'lastSeen'>,
): void {
  const key = `${entry.ecosystem}::${entry.name}`;
  const existing = _registry.get(key);

  if (existing) {
    existing.scanConfirmations++;
    existing.lastSeen = Date.now();
    existing.qualityScore = Math.round(
      (existing.qualityScore * 0.8 + entry.qualityScore * 0.2)
    );
  } else {
    if (_registry.size >= MAX_ENTRIES) {
      // Evict lowest quality + oldest
      let weakestKey = '';
      let weakestScore = Infinity;
      for (const [k, v] of _registry) {
        const score = v.qualityScore + v.scanConfirmations * 5;
        if (score < weakestScore) {
          weakestScore = score;
          weakestKey = k;
        }
      }
      if (weakestKey) _registry.delete(weakestKey);
    }

    _registry.set(key, {
      ...entry,
      scanConfirmations: 1,
      lastSeen: Date.now(),
    });
  }
}

/**
 * Get registry stats.
 */
export function getRegistryStats(): {
  totalEntries: number;
  byEcosystem: Record<string, number>;
  byArchetype: Record<string, number>;
  avgQuality: number;
} {
  const byEcosystem: Record<string, number> = {};
  const byArchetype: Record<string, number> = {};
  let qualitySum = 0;

  for (const entry of _registry.values()) {
    byEcosystem[entry.ecosystem] = (byEcosystem[entry.ecosystem] ?? 0) + 1;
    byArchetype[entry.archetypeId] = (byArchetype[entry.archetypeId] ?? 0) + 1;
    qualitySum += entry.qualityScore;
  }

  return {
    totalEntries: _registry.size,
    byEcosystem,
    byArchetype,
    avgQuality: _registry.size > 0 ? Math.round(qualitySum / _registry.size) : 0,
  };
}

/** Reset registry (for testing) */
export function resetRegistry(): void {
  _registry.clear();
  for (const entry of SEED_ENTRIES) {
    _registry.set(`${entry.ecosystem}::${entry.name}`, entry);
  }
}
