/**
 * Code Signals — lightweight static evidence extraction
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * Pure-regex scanner that walks user source and returns the *evidence*
 * the recommender needs to make picks that reflect what the code actually
 * does — instead of suggesting layers in canonical-primitive order.
 *
 * Conservative: each signal must match real syntax (HTTP route decorators,
 * DB driver calls, crypto APIs, etc.). When in doubt we DO NOT fire.
 *
 * Output is a small flat structure — easy to weight, easy to explain.
 *
 * © CMPSBL® — All rights reserved.
 */

export type SignalKind =
  | 'http_route'        // app.get / @app.route / req: Request / RouteCollection
  | 'db_query'          // SELECT / sequelize / drizzle / sqlx / fluent / prisma
  | 'auth'              // jwt / session / bcrypt / OAuth / passport
  | 'crypto'            // SHA / AES / sign / verify / hash
  | 'external_http'     // fetch / axios / requests / URLSession / reqwest
  | 'concurrency'       // async / await / actor / goroutine / Mutex / Lock
  | 'file_io'           // fs.read / open(' / File(
  | 'serialization'     // JSON.stringify / json.dumps / Codable / serde
  | 'validation'        // zod / joi / pydantic / Validator / validate(
  | 'env_secret';       // process.env / os.environ / Environment.get

export interface CodeSignal {
  kind: SignalKind;
  /** First textual snippet that triggered this signal (for explainability) */
  evidence: string;
  /** Source file the signal came from */
  file: string;
  /** Number of distinct hits across the corpus (capped at 99) */
  count: number;
}

export interface CodeScanInput {
  files: ReadonlyArray<{ name: string; content: string }>;
}

/**
 * Patterns are intentionally narrow — false positives poison the rationale.
 * Each entry is `(snippet) => triggers signal` evaluated case-sensitively
 * unless the regex is `i`-flagged.
 */
const PATTERNS: Array<{ kind: SignalKind; re: RegExp }> = [
  // ── HTTP routes (Express, Vapor, Spring, Gin, Flask, FastAPI, ASP, Rails) ─
  { kind: 'http_route', re: /\bapp\.(get|post|put|delete|patch)\s*\(/g },
  { kind: 'http_route', re: /@(app|router)\.(get|post|put|delete|patch|route)\s*\(/g },
  { kind: 'http_route', re: /\brouter\.(get|post|put|delete|patch)\s*\(/g },
  { kind: 'http_route', re: /\bRouteCollection\b|\breq:\s*Request\b|\bapp\.routes\.(get|post|put|delete)\b/g },
  { kind: 'http_route', re: /@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\b/g },
  { kind: 'http_route', re: /\b(gin|echo|fiber)\.(GET|POST|PUT|DELETE|PATCH)\s*\(/g },
  { kind: 'http_route', re: /\[(HttpGet|HttpPost|HttpPut|HttpDelete|Route)\b/g },

  // ── Database / ORM ────────────────────────────────────────────────────────
  { kind: 'db_query', re: /\b(SELECT|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b/g },
  { kind: 'db_query', re: /\b(sequelize|drizzle|prisma|knex|typeorm|sqlx|fluent|gorm|sqlalchemy|mongoose)\b/gi },
  { kind: 'db_query', re: /\.(query|exec|execute|find|save|create|delete|update)\s*\(\s*['"`][^'"`]*\b(SELECT|INSERT|UPDATE|DELETE)\b/gi },
  { kind: 'db_query', re: /\bModel\(\s*['"`]\w+['"`]/g },

  // ── Auth / sessions / tokens ──────────────────────────────────────────────
  { kind: 'auth', re: /\b(jwt|jsonwebtoken|passport|bcrypt|argon2|next-auth|nextauth|firebase\/auth|supabase\.auth)\b/gi },
  { kind: 'auth', re: /\b(OAuth|OIDC|SAML)\b/g },
  { kind: 'auth', re: /\b(verifyToken|signToken|hashPassword|comparePassword)\b/g },
  { kind: 'auth', re: /Authorization:\s*['"`]?Bearer\b/g },

  // ── Crypto primitives ─────────────────────────────────────────────────────
  { kind: 'crypto', re: /\b(crypto\.createHash|createHmac|createCipheriv|createDecipheriv)\b/g },
  { kind: 'crypto', re: /\b(SHA-?256|SHA-?512|AES-?\d+|RSA|Ed25519|Curve25519)\b/g },
  { kind: 'crypto', re: /\b(hashlib|cryptography|libsodium|tink)\b/gi },
  { kind: 'crypto', re: /\b(CryptoKit|CommonCrypto|MessageDigest|Cipher\.getInstance)\b/g },

  // ── External HTTP calls ───────────────────────────────────────────────────
  { kind: 'external_http', re: /\b(fetch|axios|got|httpx|requests|reqwest|URLSession|HttpClient|RestTemplate)\b/g },
  { kind: 'external_http', re: /\b(http\.Client|http\.NewRequest|http\.Get|http\.Post)\b/g },

  // ── Concurrency / async ───────────────────────────────────────────────────
  { kind: 'concurrency', re: /\b(async\s+(?:func|fn|fun|def|function)|await\b|actor\b|nonisolated\b|@MainActor)\b/g },
  { kind: 'concurrency', re: /\b(Mutex|RwLock|Lock\(\)|Semaphore|sync\.Mutex|threading\.Lock|NSLock)\b/g },
  { kind: 'concurrency', re: /\b(go\s+func|goroutine|Promise\.all|asyncio\.gather|TaskGroup)\b/g },

  // ── File I/O ──────────────────────────────────────────────────────────────
  { kind: 'file_io', re: /\b(fs\.(read|write|open|stat|unlink|mkdir)|fs\/promises)\b/g },
  { kind: 'file_io', re: /\b(open\s*\(\s*['"`]|FileInputStream|FileOutputStream|std::fs::|os\.open)\b/g },

  // ── Serialization ─────────────────────────────────────────────────────────
  { kind: 'serialization', re: /\b(JSON\.(stringify|parse)|json\.(dumps|loads)|Codable|serde::|Jackson|Gson)\b/g },

  // ── Validation ────────────────────────────────────────────────────────────
  { kind: 'validation', re: /\b(zod|joi|yup|pydantic|class-validator|validator\.js|Validator)\b/gi },
  { kind: 'validation', re: /\b(z\.object|\.parse\s*\(|\.safeParse\s*\(|@Valid\b|\.validates?\s*\()/g },

  // ── Secrets / env ─────────────────────────────────────────────────────────
  { kind: 'env_secret', re: /\b(process\.env\.\w+|os\.environ\[|Deno\.env\.get|Environment\.get|System\.getenv)\b/g },
];

const MAX_EVIDENCE = 80;
const MAX_HITS_PER_SIGNAL = 99;

export function scanCodeSignals(input: CodeScanInput): CodeSignal[] {
  const acc = new Map<SignalKind, CodeSignal>();
  for (const f of input.files) {
    if (!f.content || f.content.length === 0) continue;
    for (const { kind, re } of PATTERNS) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(f.content)) !== null) {
        const existing = acc.get(kind);
        if (existing) {
          if (existing.count < MAX_HITS_PER_SIGNAL) existing.count += 1;
        } else {
          const snippet = (m[0] || '').slice(0, MAX_EVIDENCE);
          acc.set(kind, { kind, file: f.name, evidence: snippet, count: 1 });
        }
        // Avoid pathological infinite loops on zero-width matches
        if (m.index === re.lastIndex) re.lastIndex += 1;
      }
    }
  }
  // Stable order: highest count first, then alphabetical for determinism
  return [...acc.values()].sort(
    (a, b) => b.count - a.count || a.kind.localeCompare(b.kind),
  );
}

/**
 * Map each detected signal to one or more CMPSBL primitives that should
 * receive a recommendation boost. Curated — this is the ONLY place where
 * "what the code does" turns into "which primitive matters".
 *
 * Boosts are additive; primitives accumulate weight across signals.
 */
const SIGNAL_TO_PRIMITIVES: Record<SignalKind, ReadonlyArray<string>> = {
  http_route:    ['DEFENSE', 'AUDIT', 'IDENTITY', 'VISION'],
  db_query:      ['MEMORY', 'AUDIT', 'COMPASS'],
  auth:          ['IDENTITY', 'DEFENSE', 'AUDIT'],
  crypto:        ['DEFENSE', 'AUDIT', 'CONSCIENCE'],
  external_http: ['NEXUS', 'DEFENSE', 'VISION'],
  concurrency:   ['REFLEX', 'CORTEX', 'NERVE'],
  file_io:       ['DEFENSE', 'AUDIT'],
  serialization: ['DECODE', 'ENCODE'],
  validation:    ['CONSCIENCE', 'COMPASS', 'DEFENSE'],
  env_secret:    ['DEFENSE', 'IDENTITY'],
};

/** Human-friendly verbs for rationale strings — no jargon. */
const SIGNAL_LABELS: Record<SignalKind, string> = {
  http_route: 'HTTP routes',
  db_query: 'database calls',
  auth: 'authentication code',
  crypto: 'cryptographic operations',
  external_http: 'outbound HTTP calls',
  concurrency: 'async/concurrent code',
  file_io: 'filesystem access',
  serialization: 'serialization',
  validation: 'input validation',
  env_secret: 'environment secrets',
};

export interface PrimitiveBoost {
  primitive: string;
  /** Sum of contributing signal counts (used for ranking) */
  weight: number;
  /** Top contributing signal, used for the rationale string */
  topSignal: SignalKind;
  /** Friendly verb for the rationale */
  topSignalLabel: string;
  /** Original evidence snippet from the source */
  evidence: string;
}

/**
 * Aggregate signal hits into a per-primitive weight table. The top entries
 * are what the recommender prioritizes; below the cutoff it falls back to
 * gap/adjacency as before.
 */
export function boostsFromSignals(signals: ReadonlyArray<CodeSignal>): PrimitiveBoost[] {
  const acc = new Map<string, PrimitiveBoost>();
  for (const sig of signals) {
    const primitives = SIGNAL_TO_PRIMITIVES[sig.kind] ?? [];
    for (const p of primitives) {
      const existing = acc.get(p);
      if (existing) {
        existing.weight += sig.count;
        // Keep the highest-count signal as the explanation driver
        if (sig.count > 0 && SIGNAL_LABELS[sig.kind]) {
          // (No swap unless the new signal contributes more weight.)
          // existing.topSignal already wins by count; nothing to do.
        }
      } else {
        acc.set(p, {
          primitive: p,
          weight: sig.count,
          topSignal: sig.kind,
          topSignalLabel: SIGNAL_LABELS[sig.kind],
          evidence: sig.evidence,
        });
      }
    }
  }
  return [...acc.values()].sort((a, b) => b.weight - a.weight);
}
