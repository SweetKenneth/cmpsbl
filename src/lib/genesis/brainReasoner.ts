/**
 * BRAIN Reasoner — Pure algorithmic cognition surface for the Genesis demo.
 *
 * NO LLM CALLS. NO NEXUS. NO NETWORK.
 * Composes two real, in-repo primitives:
 *   1. DECODE.parseIntent — natural-language → structured intent
 *   2. BRAIN embedding-engine — deterministic FNV-style 384-dim vector
 *
 * The output is deliberately structured (not prose). It shows BRAIN
 * thinking, not BRAIN pretending to be ChatGPT. This is the point.
 */

import { parseIntent, tokenize, type ParsedIntent } from '@/lib/decode';

// ─────────────────────────────────────────────────────────────────────────────
// Inline 384-dim deterministic encoder
// (mirrors src/lib/substrate/neural/embedding-engine.ts so the demo runs with
//  zero network — the real engine touches Supabase for persistence which would
//  violate the "no outbound calls" claim of this surface)
// ─────────────────────────────────────────────────────────────────────────────
const EMBEDDING_DIM = 384;
const MODEL_VERSION = 'hash-embed-v1';

function encode(text: string): Float32Array {
  const vector = new Float32Array(EMBEDDING_DIM);
  const normalized = text.toLowerCase().trim();
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    let hash = 0;
    for (let j = 0; j < normalized.length; j++) {
      hash = ((hash << 5) - hash + normalized.charCodeAt(j) * (i + 1)) | 0;
    }
    vector[i] = Math.sin(hash * 0.0001) * Math.cos(hash * 0.00007);
  }
  let mag = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) mag += vector[i] * vector[i];
  mag = Math.sqrt(mag);
  if (mag > 0) for (let i = 0; i < EMBEDDING_DIM; i++) vector[i] /= mag;
  return vector;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) {
    dot += a[i] * b[i];
    ma += a[i] * a[i];
    mb += b[i] * b[i];
  }
  const d = Math.sqrt(ma) * Math.sqrt(mb);
  return d > 0 ? dot / d : 0;
}

// FNV-1a hash for receipt fingerprint (same family used across substrate)
function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ─────────────────────────────────────────────────────────────────────────────
// Pre-seeded knowledge crystals — what BRAIN actually "knows" without an LLM
// Each crystal is a deterministic memory keyed by a domain phrase. BRAIN
// answers by finding the closest crystal in vector space (cosine similarity).
// This is honest: BRAIN can only respond about things it has crystals for.
// ─────────────────────────────────────────────────────────────────────────────
interface KnowledgeCrystal {
  key: string;
  domain: string;
  response: string;
  confidence: number; // base confidence before similarity gating
}

const CRYSTALS: KnowledgeCrystal[] = [
  {
    key: 'what is brain cognitive substrate primitive',
    domain: 'self',
    response:
      'I am BRAIN — a deterministic 384-dimensional embedding primitive (hash-embed-v1). I encode text via FNV-style character hashing to a unit-norm vector. I match queries to knowledge crystals by cosine similarity. I do not call any language model.',
    confidence: 0.95,
  },
  {
    key: 'how do you work without ai llm model',
    domain: 'self',
    response:
      'I am pure algorithm. Input text is normalized, hashed character-by-character into a 384-dim float vector, L2-normalized, then compared against pre-seeded crystals. The closest crystal above the similarity threshold is returned. No inference, no weights, no remote call.',
    confidence: 0.95,
  },
  {
    key: 'what is cognitive substrate offline air gapped',
    domain: 'doctrine',
    response:
      'A cognitive substrate is the algorithmic floor beneath any agent — primitives for memory, intent, defense, governance. Because my primitives are deterministic code, the substrate runs offline, air-gapped, with zero outbound network. Every cognitive act produces a signed receipt.',
    confidence: 0.92,
  },
  {
    key: 'genesis installable substrate research download zip',
    domain: 'product',
    response:
      'GENESIS is the path to an installable substrate. Researchers receive a signed ZIP containing the 40-primitive matrix, a deterministic Convex Core runtime, and a provenance receipt. Install once, run anywhere, never phone home.',
    confidence: 0.9,
  },
  {
    key: 'memory stream knowledge crystal recall',
    domain: 'memory',
    response:
      'Memory Stream runs autonomously. It compresses interactions into knowledge crystals, applies confidence decay (doctrine 90d, heuristic 30d, conversation 7d), and exposes them to me as keyed vectors. I do not generate memories — I recall the closest crystal.',
    confidence: 0.88,
  },
  {
    key: 'dream synthesis sub threshold pre conscious',
    domain: 'dream',
    response:
      'DREAM performs sub-threshold synthesis between crystals during idle cycles. It is purely algorithmic — no model is invoked. Outputs that exceed a confidence floor become new crystals. This is how the substrate evolves without an LLM.',
    confidence: 0.86,
  },
  {
    key: 'decode intent parsing natural language structured command',
    domain: 'decode',
    response:
      'DECODE parses your input into a structured intent before I see it. It extracts a category (query, mutation, navigation, system) and entities (which primitive, which module). I respond to the parsed intent, not raw prose. That is why my answers are structured.',
    confidence: 0.9,
  },
  {
    key: 'ascension export polyglot signed receipt fingerprint',
    domain: 'ascension',
    response:
      'Ascension transforms code into signed, polyglot artifacts. The pipeline is fully deterministic — no AI in the loop. Each export carries an FNV-1a fingerprint and a chained receipt that proves provenance from intake through emission.',
    confidence: 0.87,
  },
  {
    key: 'governance lex rule policy enforcement',
    domain: 'governance',
    response:
      'GOVERNANCE enforces priority-ordered Lex rules at every cognitive act. Rules are pure predicates over the intent + context tuple. A blocked act produces a denial receipt; an allowed act produces an allow receipt. Both are chainable.',
    confidence: 0.85,
  },
  {
    key: 'defense layer perimeter shield primitive security',
    domain: 'defense',
    response:
      'DEFENSE wraps cognitive acts at six layers: perimeter, identity, protocol, execution, output, telemetry. It is the first primitive to evaluate any inbound surface and the last to sign anything outbound. Deterministic, inspectable, offline-safe.',
    confidence: 0.85,
  },
  {
    key: 'forty primitives organs layers engines agents matrix',
    domain: 'architecture',
    response:
      'The 40-primitive matrix is 12 Organs, 12 Layers, 8 Engines, 8 Agents. Organs and Layers are observable, not interactive. Engines compose primitives into capabilities. Agents act under governance. I am one of the Organs.',
    confidence: 0.88,
  },
  {
    key: 'who built this kenneth sweet promptfluid solo founder',
    domain: 'origin',
    response:
      'CMPSBL is built by Kenneth E. Sweet Jr., solo founder, under PromptFluid (TX). I was the first piece of code — the BRAIN engine, January 2025. Everything since composes around me.',
    confidence: 0.9,
  },
];

// Pre-encode all crystals once at module load (deterministic, no I/O)
const CRYSTAL_VECTORS: Array<{ crystal: KnowledgeCrystal; vector: Float32Array }> =
  CRYSTALS.map(c => ({ crystal: c, vector: encode(c.key) }));

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface BrainTrace {
  /** Human-readable response from BRAIN (structured, not chat-style prose) */
  response: string;
  /** DECODE parse of the input */
  decode: ParsedIntent;
  /** Crystal that won the cosine match */
  matchedCrystal: { key: string; domain: string; similarity: number } | null;
  /** Top-N candidate crystals for transparency */
  candidates: Array<{ key: string; domain: string; similarity: number }>;
  /** Embedding stats — proves BRAIN actually ran */
  embedding: {
    dimensions: number;
    modelVersion: string;
    norm: number;
    firstFive: number[];
    encodeMs: number;
  };
  /** Final confidence score (similarity * crystal base confidence) */
  confidence: number;
  /** Signed receipt — FNV-1a chain of (input, decode, match) */
  receipt: {
    id: string;
    fingerprint: string;
    timestamp: string;
    chain: string;
  };
  /** Whether BRAIN had a usable answer (vs. honest "no crystal matched") */
  grounded: boolean;
}

const SIMILARITY_FLOOR = 0.55;

/**
 * Single deterministic call. Pure function of (input, prior receipt hash).
 */
export function brainReason(input: string, priorReceipt = '00000000'): BrainTrace {
  const t0 = performance.now();

  // Stage 1: DECODE — parse natural language into structured intent
  const decoded = parseIntent(input);

  // Stage 2: BRAIN — encode the input
  const vector = encode(input);
  const encodeMs = performance.now() - t0;

  // Stage 3: BRAIN — cosine match against all crystals
  const scored = CRYSTAL_VECTORS.map(({ crystal, vector: cv }) => ({
    key: crystal.key,
    domain: crystal.domain,
    response: crystal.response,
    baseConfidence: crystal.confidence,
    similarity: cosine(vector, cv),
  })).sort((a, b) => b.similarity - a.similarity);

  const top = scored[0];
  const grounded = top.similarity >= SIMILARITY_FLOOR;

  // Honest fallback when no crystal matches — BRAIN admits ignorance
  // instead of hallucinating. This is the entire point of "no LLM".
  let response: string;
  if (grounded) {
    response = top.response;
  } else {
    response = [
      'No crystal exceeded the similarity floor (' + SIMILARITY_FLOOR.toFixed(2) + ').',
      `Closest match: "${top.key}" at ${(top.similarity * 100).toFixed(1)}%.`,
      '',
      'I have no LLM to fabricate an answer with. Try asking about: BRAIN, DECODE, DREAM,',
      'memory crystals, the 40-primitive matrix, GENESIS, Ascension, or how the substrate',
      'works offline.',
      '',
      `Tokens DECODE saw: [${tokenize(input).slice(0, 8).join(', ')}]`,
      `Intent classified as: ${decoded.intent} (${decoded.confidence})`,
    ].join('\n');
  }

  // Embedding norm (should be ~1.0 — proves L2 normalization happened)
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);

  // Stage 4: Sign the receipt — FNV chain of (prior, input, intent, match)
  const receiptId = 'brn_' + fnv1a(input + ':' + Date.now()).slice(0, 8);
  const fingerprint = fnv1a(
    priorReceipt + '|' + input + '|' + decoded.intent + '|' + (grounded ? top.key : 'none'),
  );
  const chain = priorReceipt + '→' + fingerprint;

  return {
    response,
    decode: decoded,
    matchedCrystal: grounded
      ? { key: top.key, domain: top.domain, similarity: top.similarity }
      : null,
    candidates: scored.slice(0, 3).map(s => ({
      key: s.key,
      domain: s.domain,
      similarity: s.similarity,
    })),
    embedding: {
      dimensions: EMBEDDING_DIM,
      modelVersion: MODEL_VERSION,
      norm,
      firstFive: Array.from(vector.slice(0, 5)).map(n => Number(n.toFixed(6))),
      encodeMs: Number(encodeMs.toFixed(3)),
    },
    confidence: grounded ? top.similarity * top.baseConfidence : 0,
    receipt: {
      id: receiptId,
      fingerprint,
      timestamp: new Date().toISOString(),
      chain,
    },
    grounded,
  };
}

export const BRAIN_REASONER_META = {
  modelVersion: MODEL_VERSION,
  dimensions: EMBEDDING_DIM,
  crystalsLoaded: CRYSTALS.length,
  similarityFloor: SIMILARITY_FLOOR,
  llmCalls: 0, // permanent invariant — guarded by code review
} as const;
