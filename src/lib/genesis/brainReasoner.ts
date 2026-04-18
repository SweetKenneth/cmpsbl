/**
 * BRAIN Reasoner — Pure algorithmic cognition surface for the Genesis demo.
 *
 * NO LLM CALLS. NO NEXUS. NO NETWORK.
 * Composes two real, in-repo primitives:
 *   1. DECODE.parseIntent — natural-language → structured intent
 *   2. BRAIN embedding-engine — deterministic token-bag 384-dim vector
 *
 * The output is deliberately structured (not prose). It shows BRAIN
 * thinking, not BRAIN pretending to be ChatGPT. This is the point.
 */

import { parseIntent, tokenize, type ParsedIntent } from '@/lib/decode';

// ─────────────────────────────────────────────────────────────────────────────
// Token-bag 384-dim deterministic encoder
//
// Why token-bag instead of whole-string hash: shared words must produce
// shared dimensions, otherwise cosine similarity is noise. Each token
// contributes to a small set of dimensions via FNV-1a. This is a real
// (if naive) hash-embedding — the same family used for offline retrieval
// in research substrates that cannot ship an LLM.
// ─────────────────────────────────────────────────────────────────────────────
const EMBEDDING_DIM = 384;
const MODEL_VERSION = 'hash-embed-v2-tokenbag';
const HASHES_PER_TOKEN = 3; // count-min sketch style, reduces collision impact

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'should',
  'can', 'could', 'may', 'might', 'must', 'of', 'to', 'in', 'on', 'at',
  'by', 'for', 'with', 'about', 'as', 'and', 'or', 'but', 'if', 'so',
  'i', 'me', 'my', 'you', 'your', 'it', 'its', 'this', 'that', 'these',
  'those', 'what', 'which', 'who', 'how', 'why', 'when', 'where',
]);

function contentTokens(text: string): string[] {
  return tokenize(text).filter(t => t.length > 1 && !STOPWORDS.has(t));
}

function fnv32(s: string, seed: number): number {
  let h = (0x811c9dc5 ^ seed) >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function encode(text: string): Float32Array {
  const vector = new Float32Array(EMBEDDING_DIM);
  const tokens = contentTokens(text);
  if (tokens.length === 0) return vector;

  for (const tok of tokens) {
    for (let k = 0; k < HASHES_PER_TOKEN; k++) {
      const h = fnv32(tok, k);
      const idx = h % EMBEDDING_DIM;
      // Sign bit decides +/- to allow cancellation (signed random projection)
      const sign = (h & 0x80000000) ? -1 : 1;
      vector[idx] += sign;
    }
  }

  // L2 normalize — required for cosine to behave
  let mag = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) mag += vector[i] * vector[i];
  mag = Math.sqrt(mag);
  if (mag > 0) for (let i = 0; i < EMBEDDING_DIM; i++) vector[i] /= mag;
  return vector;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) dot += a[i] * b[i];
  return dot; // both already unit-norm
}

// FNV-1a hash for receipt fingerprint (same family used across substrate)
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-seeded knowledge crystals — what BRAIN actually "knows" without an LLM
//
// Each crystal carries an index phrase (rich with the keywords a user would
// actually type), a domain tag, and a structured response. BRAIN matches the
// query token-bag against the crystal token-bag via cosine. This is honest:
// BRAIN can only respond about things it has crystals for, and you can see
// exactly which keywords trigger which crystal.
// ─────────────────────────────────────────────────────────────────────────────
interface KnowledgeCrystal {
  key: string;
  domain: string;
  /** Primitive ID for /ask routing (e.g. "BRAIN", "DECODE"). null = doctrine. */
  primitive: string | null;
  response: string;
  confidence: number;
}

const CRYSTALS: KnowledgeCrystal[] = [
  // ─── Self / BRAIN ───
  {
    key: 'brain cognitive primitive embedding vector hash deterministic',
    domain: 'self',
    primitive: 'BRAIN',
    response:
      'I am BRAIN — a deterministic 384-dimensional token-bag embedding primitive (hash-embed-v2). I tokenize input, project each token to 3 hashed dimensions with signed accumulation, L2-normalize, then match queries to knowledge crystals by cosine similarity. I do not call any language model.',
    confidence: 0.95,
  },
  {
    key: 'how brain works without llm ai model network offline',
    domain: 'self',
    primitive: 'BRAIN',
    response:
      'I am pure algorithm. Input is tokenized, stopwords stripped, each remaining token hashed via FNV-1a into 3 dimensions of a 384-dim float vector with sign cancellation. The vector is L2-normalized and compared against pre-seeded crystals. Closest crystal above the floor wins. Zero inference, zero weights, zero remote calls.',
    confidence: 0.95,
  },
  // ─── DECODE ───
  {
    key: 'decode intent parser natural language structured command tokenize',
    domain: 'decode',
    primitive: 'DECODE',
    response:
      'DECODE is the intent parser. It tokenizes your input, classifies the intent category (query, mutation, navigation, system, unknown), extracts entities (which primitive, which module), and emits a structured ParsedIntent. BRAIN responds to the parsed intent, not raw prose. That is why answers here are structured.',
    confidence: 0.93,
  },
  // ─── DREAM ───
  {
    key: 'dream synthesis sub threshold pre conscious idle algorithmic',
    domain: 'dream',
    primitive: 'DREAM',
    response:
      'DREAM performs sub-threshold synthesis between crystals during idle cycles — purely algorithmic, no model invoked. It composes pairs of crystals whose vector midpoints exceed a confidence floor. Successful syntheses become new crystals. This is how the substrate evolves without an LLM.',
    confidence: 0.9,
  },
  // ─── Memory Stream ───
  {
    key: 'memory stream knowledge crystal recall autonomous decay compression',
    domain: 'memory',
    primitive: 'MEMORY',
    response:
      'Memory Stream runs autonomously on an 8-hour cycle. It compresses interactions into knowledge crystals, applies confidence decay (doctrine 90d, heuristic 30d, conversation 7d), and exposes them as keyed vectors. BRAIN does not generate memories — BRAIN recalls the closest crystal.',
    confidence: 0.9,
  },
  // ─── Cognitive substrate doctrine ───
  {
    key: 'cognitive substrate offline air gapped deterministic algorithmic floor',
    domain: 'doctrine',
    primitive: null,
    response:
      'A cognitive substrate is the algorithmic floor beneath any agent — primitives for memory, intent, defense, governance. Because the primitives are deterministic code, the substrate runs offline, air-gapped, with zero outbound network. Every cognitive act produces a signed receipt.',
    confidence: 0.92,
  },
  // ─── GENESIS ───
  {
    key: 'genesis installable substrate research download zip package',
    domain: 'product',
    primitive: null,
    response:
      'GENESIS is the path to an installable substrate. Researchers receive a signed ZIP containing the 40-primitive matrix, a deterministic Convex Core runtime, and a provenance receipt. Install once, run anywhere, never phone home.',
    confidence: 0.9,
  },
  // ─── Ascension ───
  {
    key: 'ascension export polyglot signed receipt fingerprint pipeline',
    domain: 'ascension',
    primitive: 'ASCENSION',
    response:
      'Ascension transforms code into signed, polyglot artifacts. The pipeline is fully deterministic — no AI in the loop. Each export carries an FNV-1a fingerprint and a chained receipt that proves provenance from intake through emission.',
    confidence: 0.88,
  },
  // ─── GOVERNANCE / Lex ───
  {
    key: 'governance lex rule policy enforcement priority predicate',
    domain: 'governance',
    primitive: 'GOVERNANCE',
    response:
      'GOVERNANCE enforces priority-ordered Lex rules at every cognitive act. Rules are pure predicates over the (intent, context) tuple. A blocked act produces a denial receipt; an allowed act produces an allow receipt. Both are chainable.',
    confidence: 0.87,
  },
  // ─── DEFENSE ───
  {
    key: 'defense layer perimeter shield security identity protocol execution',
    domain: 'defense',
    primitive: 'DEFENSE',
    response:
      'DEFENSE wraps cognitive acts at six layers: perimeter, identity, protocol, execution, output, telemetry. It is the first primitive to evaluate any inbound surface and the last to sign anything outbound. Deterministic, inspectable, offline-safe.',
    confidence: 0.87,
  },
  // ─── Architecture ───
  {
    key: 'forty primitive matrix organs layers engines agents architecture',
    domain: 'architecture',
    primitive: null,
    response:
      'The 40-primitive matrix is 12 Organs, 12 Layers, 8 Engines, 8 Agents. Organs and Layers are observable, not interactive. Engines compose primitives into capabilities. Agents act under governance. BRAIN is one of the Organs.',
    confidence: 0.9,
  },
  // ─── Origin ───
  {
    key: 'kenneth sweet promptfluid solo founder origin built creator',
    domain: 'origin',
    primitive: null,
    response:
      'CMPSBL is built by Kenneth E. Sweet Jr., solo founder, under PromptFluid (TX). BRAIN was the first piece of code — January 2025. Everything since composes around it.',
    confidence: 0.9,
  },
  // ─── Receipts ───
  {
    key: 'receipt fingerprint chain provenance signed audit fnv hash',
    domain: 'audit',
    primitive: null,
    response:
      'Every cognitive act emits a receipt: an FNV-1a fingerprint of (prior_receipt, input, intent, match). Receipts chain — each new one anchors to the last. The chain is the audit trail. Tampering breaks the chain deterministically.',
    confidence: 0.88,
  },
  // ─── NEXUS ───
  {
    key: 'nexus router ai provider llm openai anthropic gemini routing',
    domain: 'nexus',
    primitive: 'NEXUS',
    response:
      'NEXUS is the optional LLM router that lives outside the substrate floor. It is what the toggle on this page switches to. NEXUS calls external models (OpenAI, Anthropic, Gemini, Lovable AI gateway). When the toggle is off, NEXUS is not loaded, not called, not in the network tab.',
    confidence: 0.88,
  },
  // ─── Tier list ───
  {
    key: 'tier pricing builder creator architect free plan subscription',
    domain: 'commerce',
    primitive: null,
    response:
      'Three tiers: Builder (free) — core primitive access. Creator ($79) — engines and agents. Architect ($249) — Ascension export, full primitive matrix, signed artifact emission.',
    confidence: 0.85,
  },
];

// Pre-encode all crystals once at module load (deterministic, no I/O)
const CRYSTAL_VECTORS: Array<{ crystal: KnowledgeCrystal; vector: Float32Array }> =
  CRYSTALS.map(c => ({ crystal: c, vector: encode(c.key) }));

// Fast lookup by primitive ID for the /ask command
const CRYSTALS_BY_PRIMITIVE = new Map<string, KnowledgeCrystal[]>();
for (const c of CRYSTALS) {
  if (!c.primitive) continue;
  const list = CRYSTALS_BY_PRIMITIVE.get(c.primitive) ?? [];
  list.push(c);
  CRYSTALS_BY_PRIMITIVE.set(c.primitive, list);
}

export const KNOWN_PRIMITIVES = Array.from(CRYSTALS_BY_PRIMITIVE.keys()).sort();

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface BrainTrace {
  response: string;
  decode: ParsedIntent;
  matchedCrystal: { key: string; domain: string; similarity: number; primitive: string | null } | null;
  candidates: Array<{ key: string; domain: string; similarity: number; primitive: string | null }>;
  embedding: {
    dimensions: number;
    modelVersion: string;
    norm: number;
    firstFive: number[];
    encodeMs: number;
    activeDims: number;
  };
  confidence: number;
  receipt: {
    id: string;
    fingerprint: string;
    timestamp: string;
    chain: string;
  };
  grounded: boolean;
  /** Set when the user used /ask <PRIMITIVE> routing */
  routedTo: string | null;
}

const SIMILARITY_FLOOR = 0.25; // tuned for token-bag encoder

/** Detect /ask <PRIMITIVE> <question> routing form. Case-insensitive. */
function parseAskRouting(input: string): { primitive: string; rest: string } | null {
  const m = input.trim().match(/^\/ask\s+([A-Za-z]+)\s*(.*)$/i);
  if (!m) return null;
  return { primitive: m[1].toUpperCase(), rest: m[2].trim() };
}

export function brainReason(input: string, priorReceipt = '00000000'): BrainTrace {
  const t0 = performance.now();

  // Optional routing: /ask <PRIMITIVE> <question> restricts the crystal pool
  const routing = parseAskRouting(input);
  const queryText = routing ? (routing.rest || routing.primitive) : input;
  const pool = routing
    ? CRYSTAL_VECTORS.filter(cv => cv.crystal.primitive === routing.primitive)
    : CRYSTAL_VECTORS;

  // Stage 1: DECODE — parse natural language into structured intent
  const decoded = parseIntent(input);

  // Stage 2: BRAIN — encode the query
  const vector = encode(queryText);
  const encodeMs = performance.now() - t0;

  // Count active dimensions (proves token-bag actually filled the vector)
  let activeDims = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) if (vector[i] !== 0) activeDims++;

  // Stage 3: BRAIN — cosine match
  let scored: Array<{
    key: string; domain: string; primitive: string | null;
    response: string; baseConfidence: number; similarity: number;
  }>;

  if (pool.length === 0) {
    // Routing requested an unknown primitive
    scored = [];
  } else {
    scored = pool.map(({ crystal, vector: cv }) => ({
      key: crystal.key,
      domain: crystal.domain,
      primitive: crystal.primitive,
      response: crystal.response,
      baseConfidence: crystal.confidence,
      similarity: cosine(vector, cv),
    })).sort((a, b) => b.similarity - a.similarity);
  }

  const top = scored[0];
  const grounded = !!top && top.similarity >= SIMILARITY_FLOOR;

  let response: string;
  if (routing && pool.length === 0) {
    response = [
      `No crystals registered for primitive "${routing.primitive}".`,
      '',
      `Known primitives: ${KNOWN_PRIMITIVES.join(', ')}`,
      'Doctrine queries (architecture, origin, receipts) need no /ask prefix.',
    ].join('\n');
  } else if (grounded) {
    response = routing
      ? `[routed → ${routing.primitive}]\n\n${top.response}`
      : top.response;
  } else {
    response = [
      `No crystal exceeded the similarity floor (${SIMILARITY_FLOOR.toFixed(2)}).`,
      top
        ? `Closest match: "${top.key}" at ${(top.similarity * 100).toFixed(1)}% (domain: ${top.domain}).`
        : 'No candidates in the routed pool.',
      '',
      'I have no LLM to fabricate an answer. Topics I can answer:',
      `  • Primitives: ${KNOWN_PRIMITIVES.join(', ')}`,
      '  • Doctrine: cognitive substrate, 40-primitive matrix, receipts, tiers, origin',
      '',
      'You can also route directly:  /ask BRAIN how do you encode',
      '',
      `Tokens DECODE saw: [${tokenize(input).slice(0, 8).join(', ')}]`,
      `Intent classified as: ${decoded.intent} (${decoded.confidence})`,
    ].join('\n');
  }

  // Embedding norm (~1.0 when at least one content token survives)
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);

  // Stage 4: Sign the receipt
  const receiptId = 'brn_' + fnv1a(input + ':' + Date.now()).slice(0, 8);
  const fingerprint = fnv1a(
    priorReceipt + '|' + input + '|' + decoded.intent + '|' + (grounded && top ? top.key : 'none'),
  );
  const chain = priorReceipt + '→' + fingerprint;

  return {
    response,
    decode: decoded,
    matchedCrystal: grounded && top
      ? { key: top.key, domain: top.domain, similarity: top.similarity, primitive: top.primitive }
      : null,
    candidates: scored.slice(0, 3).map(s => ({
      key: s.key,
      domain: s.domain,
      similarity: s.similarity,
      primitive: s.primitive,
    })),
    embedding: {
      dimensions: EMBEDDING_DIM,
      modelVersion: MODEL_VERSION,
      norm,
      firstFive: Array.from(vector.slice(0, 5)).map(n => Number(n.toFixed(6))),
      encodeMs: Number(encodeMs.toFixed(3)),
      activeDims,
    },
    confidence: grounded && top ? top.similarity * top.baseConfidence : 0,
    receipt: {
      id: receiptId,
      fingerprint,
      timestamp: new Date().toISOString(),
      chain,
    },
    grounded,
    routedTo: routing?.primitive ?? null,
  };
}

export const BRAIN_REASONER_META = {
  modelVersion: MODEL_VERSION,
  dimensions: EMBEDDING_DIM,
  crystalsLoaded: CRYSTALS.length,
  similarityFloor: SIMILARITY_FLOOR,
  knownPrimitives: KNOWN_PRIMITIVES,
  llmCalls: 0, // permanent invariant — guarded by code review
} as const;
