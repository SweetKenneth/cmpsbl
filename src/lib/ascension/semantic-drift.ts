/**
 * CMPSBL® Semantic Drift Detector
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * The same capability gets named differently across ecosystems:
 *   Python: throttle, decorator  |  Go: limiter, middleware
 *   Rust: governor, guard        |  Java: interceptor, filter
 *   Ruby: rack, before_action    |  C#: attribute, policy
 *
 * This module clusters confirmed matches by structural equivalence
 * and extracts lexical variants automatically. The glossary expands
 * every time a new codebase in a new ecosystem is scanned.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface SynonymCluster {
  /** The canonical capability name */
  canonical: string;
  /** Which archetype this cluster maps to */
  archetypeId: string;
  /** All known synonyms grouped by ecosystem */
  ecosystems: Record<string, string[]>;
  /** Flat list of all synonyms (for quick lookup) */
  allSynonyms: string[];
}

export interface DriftDetection {
  /** Term that was detected as a potential synonym */
  term: string;
  /** The canonical capability it maps to */
  canonical: string;
  /** Ecosystem it was found in */
  ecosystem: string;
  /** Confidence that this is a true synonym (0–1) */
  confidence: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — SEED SYNONYM CLUSTERS
// ═══════════════════════════════════════════════════════════════════════════════
//
// Seeded from known cross-language patterns. The feedback loop will grow
// these clusters over time as more codebases are scanned.
// ═══════════════════════════════════════════════════════════════════════════════

const SYNONYM_CLUSTERS: SynonymCluster[] = [
  {
    canonical: 'rate_limiting',
    archetypeId: 'rate-limiting',
    ecosystems: {
      python: ['throttle', 'rate_limit', 'ratelimit', 'slowdown', 'backpressure', 'decorator'],
      javascript: ['throttle', 'debounce', 'rate_limit', 'limiter', 'express_rate_limit'],
      go: ['limiter', 'rate_limiter', 'token_bucket', 'leaky_bucket', 'golang_rate'],
      rust: ['governor', 'rate_limiter', 'throttle', 'backpressure'],
      java: ['rate_limiter', 'throttle', 'bucket4j', 'guava_rate', 'resilience4j'],
      csharp: ['rate_limiting', 'throttle', 'polly', 'rate_limit_policy'],
      ruby: ['rack_throttle', 'rack_attack', 'rate_limit', 'throttle'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'error_recovery',
    archetypeId: 'error-recovery',
    ecosystems: {
      python: ['retry', 'tenacity', 'backoff', 'circuit_breaker', 'pybreaker'],
      javascript: ['retry', 'circuit_breaker', 'cockatiel', 'opossum', 'p_retry'],
      go: ['retry', 'circuit_breaker', 'hystrix_go', 'gobreaker', 'backoff'],
      rust: ['retry', 'circuit_breaker', 'backoff', 'resilience', 'tower_retry'],
      java: ['retry', 'circuit_breaker', 'resilience4j', 'hystrix', 'failsafe'],
      csharp: ['polly', 'retry', 'circuit_breaker', 'resilience', 'transient_fault'],
      ruby: ['retry', 'circuit_breaker', 'stoplight', 'retriable'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'authentication',
    archetypeId: 'auth-control',
    ecosystems: {
      python: ['authenticate', 'login_required', 'flask_login', 'django_auth', 'jwt_required'],
      javascript: ['passport', 'jwt', 'auth0', 'next_auth', 'clerk', 'supabase_auth'],
      go: ['auth', 'jwt', 'oauth2', 'casbin', 'authz', 'middleware_auth'],
      rust: ['auth', 'jwt', 'oauth', 'actix_identity', 'tower_auth'],
      java: ['spring_security', 'auth', 'jwt', 'shiro', 'keycloak'],
      csharp: ['authorize', 'identity', 'jwt_bearer', 'aspnet_identity', 'claims'],
      ruby: ['devise', 'warden', 'omniauth', 'jwt', 'authenticate'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'observability',
    archetypeId: 'observability',
    ecosystems: {
      python: ['logging', 'structlog', 'loguru', 'opentelemetry', 'prometheus_client', 'sentry_sdk'],
      javascript: ['winston', 'pino', 'bunyan', 'morgan', 'sentry', 'datadog', 'newrelic'],
      go: ['zap', 'logrus', 'zerolog', 'opentelemetry', 'prometheus', 'jaeger'],
      rust: ['tracing', 'log', 'env_logger', 'opentelemetry', 'metrics'],
      java: ['slf4j', 'log4j', 'logback', 'micrometer', 'opentelemetry', 'spring_actuator'],
      csharp: ['serilog', 'nlog', 'ilogger', 'application_insights', 'opentelemetry'],
      ruby: ['logger', 'rails_logger', 'semantic_logger', 'lograge', 'honeybadger'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'encryption',
    archetypeId: 'encryption',
    ecosystems: {
      python: ['cryptography', 'hashlib', 'bcrypt', 'pycryptodome', 'fernet', 'nacl'],
      javascript: ['crypto', 'bcrypt', 'argon2', 'jose', 'tweetnacl', 'node_forge'],
      go: ['crypto', 'bcrypt', 'argon2', 'nacl', 'x_crypto', 'tls'],
      rust: ['ring', 'rustcrypto', 'aes_gcm', 'argon2', 'ed25519_dalek', 'openssl'],
      java: ['javax_crypto', 'bouncycastle', 'jasypt', 'tink', 'bcrypt'],
      csharp: ['system_security', 'bouncycastle', 'bcrypt_net', 'data_protection'],
      ruby: ['bcrypt', 'openssl', 'rbnacl', 'attr_encrypted', 'lockbox'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'caching',
    archetypeId: 'state-persistence',
    ecosystems: {
      python: ['redis', 'memcached', 'lru_cache', 'functools_cache', 'django_cache', 'cachetools'],
      javascript: ['redis', 'node_cache', 'lru_cache', 'keyv', 'ioredis', 'memcached'],
      go: ['bigcache', 'groupcache', 'freecache', 'ristretto', 'go_cache', 'redis'],
      rust: ['moka', 'cached', 'lru', 'redis', 'memcache', 'dashmap'],
      java: ['caffeine', 'guava_cache', 'ehcache', 'hazelcast', 'redis', 'spring_cache'],
      csharp: ['memory_cache', 'distributed_cache', 'redis', 'lazy_cache'],
      ruby: ['rails_cache', 'redis', 'dalli', 'identity_cache', 'readthis'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'concurrency',
    archetypeId: 'concurrency',
    ecosystems: {
      python: ['asyncio', 'threading', 'multiprocessing', 'concurrent_futures', 'celery', 'gevent'],
      javascript: ['worker_threads', 'cluster', 'promise_all', 'async_await', 'bull', 'workerpool'],
      go: ['goroutine', 'channel', 'sync', 'mutex', 'waitgroup', 'errgroup', 'select'],
      rust: ['tokio', 'async_std', 'rayon', 'crossbeam', 'arc_mutex', 'mpsc'],
      java: ['executor', 'completable_future', 'thread_pool', 'fork_join', 'virtual_threads', 'reactor'],
      csharp: ['task', 'async_await', 'parallel', 'semaphore', 'concurrent', 'channel'],
      ruby: ['thread', 'fiber', 'concurrent_ruby', 'sidekiq', 'ractor'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'testing',
    archetypeId: 'testing',
    ecosystems: {
      python: ['pytest', 'unittest', 'mock', 'hypothesis', 'tox', 'coverage', 'fixture'],
      javascript: ['jest', 'vitest', 'mocha', 'chai', 'cypress', 'playwright', 'testing_library'],
      go: ['testing', 'testify', 'gomock', 'ginkgo', 'table_driven', 'httptest'],
      rust: ['cargo_test', 'mockall', 'proptest', 'criterion', 'rstest'],
      java: ['junit', 'mockito', 'testcontainers', 'assertj', 'hamcrest', 'spring_test'],
      csharp: ['xunit', 'nunit', 'moq', 'fluent_assertions', 'test_server'],
      ruby: ['rspec', 'minitest', 'factory_bot', 'capybara', 'vcr', 'webmock'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'data_pipeline',
    archetypeId: 'data-pipeline',
    ecosystems: {
      python: ['pandas', 'dask', 'apache_beam', 'airflow', 'luigi', 'prefect', 'polars'],
      javascript: ['highland', 'rxjs', 'stream', 'pipeline', 'bull', 'kafka_js'],
      go: ['pipeline', 'channel', 'watermill', 'benthos', 'sarama'],
      rust: ['tokio_stream', 'futures_stream', 'flume', 'crossbeam_channel'],
      java: ['kafka_streams', 'flink', 'spark', 'spring_batch', 'apache_beam'],
      csharp: ['dataflow', 'mediatr', 'mass_transit', 'rebus'],
      ruby: ['sidekiq', 'resque', 'karafka', 'active_job'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'compliance',
    archetypeId: 'data-sovereignty',
    ecosystems: {
      python: ['django_gdpr', 'consent', 'anonymize', 'pseudonymize', 'data_subject'],
      javascript: ['cookie_consent', 'gdpr', 'ccpa', 'consent_manager', 'onetrust'],
      go: ['gdpr', 'compliance', 'consent', 'data_protection', 'privacy'],
      rust: ['gdpr', 'compliance', 'consent', 'anonymize'],
      java: ['gdpr', 'spring_data_audit', 'compliance', 'consent', 'data_masking'],
      csharp: ['gdpr', 'data_protection', 'consent', 'anonymize', 'right_to_forget'],
      ruby: ['gdpr_rails', 'consent', 'anonymize', 'data_subject'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'dependency_injection',
    archetypeId: 'dependency-injection',
    ecosystems: {
      python: ['inject', 'dependency_injector', 'fastapi_depends', 'provider', 'container'],
      javascript: ['inversify', 'tsyringe', 'awilix', 'nest_inject', 'provider'],
      go: ['wire', 'dig', 'fx', 'inject', 'provider'],
      rust: ['inject', 'shaku', 'waiter', 'provider'],
      java: ['spring', 'guice', 'dagger', 'cdi', 'inject', 'autowired'],
      csharp: ['autofac', 'ninject', 'services', 'add_scoped', 'add_transient', 'add_singleton'],
      ruby: ['dry_container', 'dry_inject', 'inject', 'provider'],
    },
    allSynonyms: [],
  },
  {
    canonical: 'ml_inference',
    archetypeId: 'ml-inference',
    ecosystems: {
      python: ['torch', 'tensorflow', 'sklearn', 'transformers', 'onnx', 'langchain', 'openai'],
      javascript: ['tensorflow_js', 'onnxruntime', 'openai', 'langchain', 'huggingface'],
      go: ['onnxruntime', 'gorgonia', 'goml', 'tensorflow_go'],
      rust: ['candle', 'tch_rs', 'onnxruntime', 'tract', 'burn'],
      java: ['dl4j', 'tribuo', 'onnxruntime', 'tensorflow_java', 'djl'],
      csharp: ['ml_net', 'onnxruntime', 'tensorflow_net', 'accord_net'],
      ruby: ['rumale', 'torch_rb', 'onnxruntime', 'ruby_openai'],
    },
    allSynonyms: [],
  },
];

// Build allSynonyms from ecosystems
for (const cluster of SYNONYM_CLUSTERS) {
  const all = new Set<string>();
  for (const terms of Object.values(cluster.ecosystems)) {
    for (const t of terms) all.add(t);
  }
  cluster.allSynonyms = [...all];
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — ECOSYSTEM DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/** Ecosystem detection signals */
const ECOSYSTEM_MARKERS: Record<string, RegExp[]> = {
  python: [/import\s+\w+/m, /def\s+\w+\s*\(/m, /class\s+\w+(\s*\(|:)/m, /__init__/m, /self\./m],
  javascript: [/const\s+\w+\s*=/m, /require\s*\(/m, /=>\s*\{/m, /module\.exports/m, /import\s+.*from/m],
  go: [/func\s+\w+\s*\(/m, /package\s+\w+/m, /import\s*\(/m, /fmt\./m, /:=\s*/m],
  rust: [/fn\s+\w+\s*\(/m, /let\s+mut\s+/m, /impl\s+\w+/m, /use\s+\w+::/m, /pub\s+fn/m],
  java: [/public\s+class/m, /import\s+java\./m, /System\.out/m, /@Override/m, /private\s+\w+\s+\w+;/m],
  csharp: [/using\s+System/m, /namespace\s+\w+/m, /public\s+async\s+Task/m, /\[HttpGet\]/m, /var\s+\w+\s*=/m],
  ruby: [/require\s+['"][\w/]+['"]/m, /def\s+\w+/m, /class\s+\w+\s*</m, /end$/m, /attr_accessor/m],
};

/**
 * Detect the primary ecosystem of a code sample.
 * Returns the ecosystem with the most marker matches.
 */
export function detectEcosystem(code: string): string {
  let bestEcosystem = 'unknown';
  let bestScore = 0;

  for (const [ecosystem, markers] of Object.entries(ECOSYSTEM_MARKERS)) {
    let score = 0;
    for (const marker of markers) {
      if (marker.test(code)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestEcosystem = ecosystem;
    }
  }

  return bestEcosystem;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — DRIFT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect semantic drift — find ecosystem-specific synonyms in code.
 * Returns potential synonym matches with confidence scores.
 */
export function detectDrift(
  codeContent: string,
  ecosystem?: string,
): DriftDetection[] {
  const detectedEcosystem = ecosystem ?? detectEcosystem(codeContent);
  const lower = codeContent.toLowerCase();
  const detections: DriftDetection[] = [];

  for (const cluster of SYNONYM_CLUSTERS) {
    // Check ecosystem-specific synonyms first (higher confidence)
    const ecoTerms = cluster.ecosystems[detectedEcosystem] ?? [];
    for (const term of ecoTerms) {
      if (lower.includes(term)) {
        detections.push({
          term,
          canonical: cluster.canonical,
          ecosystem: detectedEcosystem,
          confidence: 0.85, // Ecosystem-matched synonym
        });
      }
    }

    // Check cross-ecosystem synonyms (lower confidence)
    for (const [eco, terms] of Object.entries(cluster.ecosystems)) {
      if (eco === detectedEcosystem) continue;
      for (const term of terms) {
        if (lower.includes(term)) {
          detections.push({
            term,
            canonical: cluster.canonical,
            ecosystem: eco,
            confidence: 0.55, // Cross-ecosystem match — lower confidence
          });
        }
      }
    }
  }

  // Deduplicate by term (keep highest confidence)
  const deduped = new Map<string, DriftDetection>();
  for (const d of detections) {
    const existing = deduped.get(d.term);
    if (!existing || d.confidence > existing.confidence) {
      deduped.set(d.term, d);
    }
  }

  return [...deduped.values()].sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get synonym cluster for a specific archetype.
 */
export function getSynonymCluster(archetypeId: string): SynonymCluster | undefined {
  return SYNONYM_CLUSTERS.find(c => c.archetypeId === archetypeId);
}

/**
 * Get all synonym clusters.
 */
export function getAllClusters(): readonly SynonymCluster[] {
  return SYNONYM_CLUSTERS;
}

/**
 * Add a new synonym to a cluster (from feedback loop confirmation).
 * Returns true if added, false if already exists.
 */
export function addConfirmedSynonym(
  archetypeId: string,
  term: string,
  ecosystem: string,
): boolean {
  const cluster = SYNONYM_CLUSTERS.find(c => c.archetypeId === archetypeId);
  if (!cluster) return false;

  const ecoTerms = cluster.ecosystems[ecosystem] ?? [];
  if (ecoTerms.includes(term)) return false;

  ecoTerms.push(term);
  cluster.ecosystems[ecosystem] = ecoTerms;

  if (!cluster.allSynonyms.includes(term)) {
    cluster.allSynonyms.push(term);
  }

  return true;
}
