/**
 * BRAIN Reasoner — Self-contained, deterministic cognition for the Genesis demo.
 *
 * NO LLM CALLS. NO NEXUS. NO NETWORK. NO IMPORTS FROM THE MAIN SUBSTRATE.
 *
 * This file is intentionally standalone — the Genesis page is the public proof
 * that BRAIN can think without any model. To keep that proof honest, this
 * version of DECODE + BRAIN does not depend on any other module in the repo.
 * Everything BRAIN needs is in this file:
 *
 *   1. Internal DECODE  — tokenizer + intent classifier (pure regex/lookup).
 *   2. Internal BRAIN   — 384-dim hash-embedding (FNV-1a, signed bag-of-tokens).
 *   3. Knowledge crystals — pre-seeded facts BRAIN actually knows.
 *   4. Thinking flow    — when no single crystal matches, BRAIN decomposes the
 *                         query, finds the closest crystal per concept token,
 *                         and composes a structured response from its own
 *                         associations instead of failing.
 *   5. Receipts         — every act emits an FNV-1a chained fingerprint.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. Internal DECODE — tokenizer + intent classifier (no external imports)
// ─────────────────────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'will', 'would', 'should',
  'can', 'could', 'may', 'might', 'must', 'of', 'to', 'in', 'on', 'at',
  'by', 'for', 'with', 'about', 'as', 'and', 'or', 'but', 'if', 'so',
  'i', 'me', 'my', 'you', 'your', 'it', 'its', 'this', 'that', 'these',
  'those', 'what', 'which', 'who', 'how', 'why', 'when', 'where',
  'tell', 'explain', 'describe', 'show', 'give', 'know',
]);

export type DecodeIntent =
  | 'query'        // user is asking a question
  | 'mutation'     // user is asking BRAIN to change state
  | 'navigation'   // user wants to go somewhere
  | 'system'       // diagnostic / meta question about BRAIN itself
  | 'route'        // explicit /ask routing
  | 'unknown';

export interface ParsedIntent {
  intent: DecodeIntent;
  confidence: 'high' | 'medium' | 'low' | 'ambiguous';
  tokens: string[];
  contentTokens: string[];
  entities: { primitive: string | null; topic: string | null };
  isRouted: boolean;
  routedPrimitive: string | null;
  routedRest: string | null;
}

const QUERY_MARKERS = /^(what|who|how|why|when|where|which|is|are|do|does|can|tell|explain|describe|show)\b/i;
const MUTATION_MARKERS = /\b(create|delete|set|update|change|reset|wipe|store|save)\b/i;
const NAV_MARKERS = /^(go|open|take|navigate|show me)\b/i;
const SYSTEM_MARKERS = /\b(brain|decode|substrate|primitive|crystal|encode|embedding|receipt|chain)\b/i;
const ASK_PATTERN = /^\/ask\s+([A-Za-z]+)\s*(.*)$/i;

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function contentTokensOf(text: string): string[] {
  return tokenize(text).filter(t => t.length > 1 && !STOPWORDS.has(t));
}

/** Internal DECODE — turns raw input into a structured intent. Pure function. */
function parseIntent(input: string): ParsedIntent {
  const trimmed = input.trim();
  const tokens = tokenize(trimmed);
  const content = contentTokensOf(trimmed);

  // Routing form: /ask <PRIMITIVE> <question>
  const askMatch = trimmed.match(ASK_PATTERN);
  if (askMatch) {
    return {
      intent: 'route',
      confidence: 'high',
      tokens,
      contentTokens: content,
      entities: { primitive: askMatch[1].toUpperCase(), topic: askMatch[2].trim() || null },
      isRouted: true,
      routedPrimitive: askMatch[1].toUpperCase(),
      routedRest: askMatch[2].trim() || askMatch[1].toUpperCase(),
    };
  }

  let intent: DecodeIntent = 'unknown';
  let confidence: ParsedIntent['confidence'] = 'ambiguous';

  if (NAV_MARKERS.test(trimmed)) { intent = 'navigation'; confidence = 'medium'; }
  else if (MUTATION_MARKERS.test(trimmed)) { intent = 'mutation'; confidence = 'medium'; }
  else if (QUERY_MARKERS.test(trimmed)) {
    intent = SYSTEM_MARKERS.test(trimmed) ? 'system' : 'query';
    confidence = content.length >= 2 ? 'high' : 'medium';
  } else if (SYSTEM_MARKERS.test(trimmed)) {
    intent = 'system';
    confidence = 'medium';
  } else if (content.length > 0) {
    intent = 'query';
    confidence = 'low';
  }

  // Entity extraction: which primitive is the user asking about?
  const upperTokens = tokens.map(t => t.toUpperCase());
  const knownPrimitiveSet = new Set(['BRAIN', 'DECODE', 'DREAM', 'MEMORY', 'DEFENSE', 'GOVERNANCE', 'ASCENSION', 'NEXUS']);
  const primitive = upperTokens.find(t => knownPrimitiveSet.has(t)) ?? null;

  return {
    intent,
    confidence,
    tokens,
    contentTokens: content,
    entities: { primitive, topic: content[0] ?? null },
    isRouted: false,
    routedPrimitive: null,
    routedRest: null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Internal BRAIN — token-bag 384-dim deterministic hash-embedding
// ─────────────────────────────────────────────────────────────────────────────

const EMBEDDING_DIM = 384;
const MODEL_VERSION = 'brain-standalone-v3-tokenbag';
const HASHES_PER_TOKEN = 3;

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
  const toks = contentTokensOf(text);
  if (toks.length === 0) return vector;

  for (const tok of toks) {
    for (let k = 0; k < HASHES_PER_TOKEN; k++) {
      const h = fnv32(tok, k);
      const idx = h % EMBEDDING_DIM;
      const sign = (h & 0x80000000) ? -1 : 1;
      vector[idx] += sign;
    }
  }

  let mag = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) mag += vector[i] * vector[i];
  mag = Math.sqrt(mag);
  if (mag > 0) for (let i = 0; i < EMBEDDING_DIM; i++) vector[i] /= mag;
  return vector;
}

function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) dot += a[i] * b[i];
  return dot;
}

function fnv1a(s: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Knowledge crystals — what BRAIN actually knows without an LLM
// ─────────────────────────────────────────────────────────────────────────────

interface KnowledgeCrystal {
  key: string;
  domain: string;
  primitive: string | null;
  response: string;
  confidence: number;
}

const CRYSTALS: KnowledgeCrystal[] = [
  {
    key: 'brain cognitive primitive embedding vector hash deterministic encode token',
    domain: 'self', primitive: 'BRAIN', confidence: 0.95,
    response:
      'I am BRAIN — a deterministic 384-dimensional token-bag embedding primitive (brain-standalone-v3). I tokenize input, project each token to 3 hashed dimensions with signed accumulation, L2-normalize, then match queries to knowledge crystals by cosine similarity. I do not call any language model.',
  },
  {
    key: 'how brain works without llm ai model network offline standalone',
    domain: 'self', primitive: 'BRAIN', confidence: 0.95,
    response:
      'I am pure algorithm. Input is tokenized, stopwords stripped, each remaining token hashed via FNV-1a into 3 dimensions of a 384-dim float vector with sign cancellation. The vector is L2-normalized and compared against pre-seeded crystals. Closest crystal above the floor wins. Zero inference, zero weights, zero remote calls.',
  },
  {
    key: 'brain think reason flow association compose synthesize structured',
    domain: 'self', primitive: 'BRAIN', confidence: 0.9,
    response:
      'When no single crystal matches your full question, I decompose it into concept tokens, find the closest crystal per token, and compose a structured association map from those partial matches. That is my "thinking" — deterministic concept routing, not generation.',
  },
  {
    key: 'decode intent parser natural language structured command tokenize entity',
    domain: 'decode', primitive: 'DECODE', confidence: 0.93,
    response:
      'DECODE (this standalone version) is my internal intent parser. It tokenizes your input, classifies the intent (query, mutation, navigation, system, route, unknown), extracts entities (which primitive you mentioned), and emits a ParsedIntent. I respond to the parsed intent, not raw prose. That is why answers here are structured.',
  },
  {
    key: 'dream synthesis sub threshold pre conscious idle algorithmic crystal pair',
    domain: 'dream', primitive: 'DREAM', confidence: 0.9,
    response:
      'DREAM performs sub-threshold synthesis between crystals during idle cycles — purely algorithmic, no model invoked. It composes pairs of crystals whose vector midpoints exceed a confidence floor. Successful syntheses become new crystals. This is how the substrate evolves without an LLM.',
  },
  {
    key: 'memory stream knowledge crystal recall autonomous decay compression cycle',
    domain: 'memory', primitive: 'MEMORY', confidence: 0.9,
    response:
      'Memory Stream runs autonomously on an 8-hour cycle. It compresses interactions into knowledge crystals, applies confidence decay (doctrine 90d, heuristic 30d, conversation 7d), and exposes them as keyed vectors. I do not generate memories — I recall the closest crystal.',
  },
  {
    key: 'cognitive substrate offline air gapped deterministic algorithmic floor primitive',
    domain: 'doctrine', primitive: null, confidence: 0.92,
    response:
      'A cognitive substrate is the algorithmic floor beneath any agent — primitives for memory, intent, defense, governance. Because the primitives are deterministic code, the substrate runs offline, air-gapped, with zero outbound network. Every cognitive act produces a signed receipt.',
  },
  {
    key: 'genesis installable substrate research download zip package signed',
    domain: 'product', primitive: null, confidence: 0.9,
    response:
      'GENESIS is the path to an installable substrate. Researchers receive a signed ZIP containing the 40-primitive matrix, a deterministic Convex Core runtime, and a provenance receipt. Install once, run anywhere, never phone home.',
  },
  {
    key: 'ascension export polyglot signed receipt fingerprint pipeline transform',
    domain: 'ascension', primitive: 'ASCENSION', confidence: 0.88,
    response:
      'Ascension transforms code into signed, polyglot artifacts. The pipeline is fully deterministic — no AI in the loop. Each export carries an FNV-1a fingerprint and a chained receipt that proves provenance from intake through emission.',
  },
  {
    key: 'governance lex rule policy enforcement priority predicate allow deny',
    domain: 'governance', primitive: 'GOVERNANCE', confidence: 0.87,
    response:
      'GOVERNANCE enforces priority-ordered Lex rules at every cognitive act. Rules are pure predicates over the (intent, context) tuple. A blocked act produces a denial receipt; an allowed act produces an allow receipt. Both are chainable.',
  },
  {
    key: 'defense layer perimeter shield security identity protocol execution telemetry',
    domain: 'defense', primitive: 'DEFENSE', confidence: 0.87,
    response:
      'DEFENSE wraps cognitive acts at six layers: perimeter, identity, protocol, execution, output, telemetry. It is the first primitive to evaluate any inbound surface and the last to sign anything outbound. Deterministic, inspectable, offline-safe.',
  },
  {
    key: 'forty primitive matrix organs layers engines agents architecture composition',
    domain: 'architecture', primitive: null, confidence: 0.9,
    response:
      'The 40-primitive matrix is 12 Organs, 12 Layers, 8 Engines, 8 Agents. Organs and Layers are observable, not interactive. Engines compose primitives into capabilities. Agents act under governance. BRAIN is one of the Organs.',
  },
  {
    key: 'kenneth sweet promptfluid solo founder origin built creator january',
    domain: 'origin', primitive: null, confidence: 0.9,
    response:
      'CMPSBL is built by Kenneth E. Sweet Jr., solo founder, under PromptFluid (TX). BRAIN was the first piece of code — January 2025. Everything since composes around it.',
  },
  {
    key: 'receipt fingerprint chain provenance signed audit fnv hash anchor',
    domain: 'audit', primitive: null, confidence: 0.88,
    response:
      'Every cognitive act emits a receipt: an FNV-1a fingerprint of (prior_receipt, input, intent, match). Receipts chain — each new one anchors to the last. The chain is the audit trail. Tampering breaks the chain deterministically.',
  },
  {
    key: 'nexus router ai provider llm openai anthropic gemini routing toggle',
    domain: 'nexus', primitive: 'NEXUS', confidence: 0.88,
    response:
      'NEXUS is the optional LLM router that lives outside the substrate floor. It is what the toggle on this page switches to. NEXUS calls external models. When the toggle is off, NEXUS is not loaded, not called, not in the network tab.',
  },
  {
    key: 'tier pricing builder creator architect free plan subscription cost',
    domain: 'commerce', primitive: null, confidence: 0.85,
    response:
      'Three tiers: Builder (free) — core primitive access. Creator ($79) — engines and agents. Architect ($249) — Ascension export, full primitive matrix, signed artifact emission.',
  },
];

// Pre-encode crystals once at module load
const CRYSTAL_VECTORS: Array<{ crystal: KnowledgeCrystal; vector: Float32Array }> =
  CRYSTALS.map(c => ({ crystal: c, vector: encode(c.key) }));

const CRYSTALS_BY_PRIMITIVE = new Map<string, KnowledgeCrystal[]>();
for (const c of CRYSTALS) {
  if (!c.primitive) continue;
  const list = CRYSTALS_BY_PRIMITIVE.get(c.primitive) ?? [];
  list.push(c);
  CRYSTALS_BY_PRIMITIVE.set(c.primitive, list);
}

export const KNOWN_PRIMITIVES = Array.from(CRYSTALS_BY_PRIMITIVE.keys()).sort();

// ─────────────────────────────────────────────────────────────────────────────
// 4. Thinking flow — per-token concept routing when no whole-query match
//
// This is BRAIN's substitute for "generation". Instead of a single similarity
// match, it asks: "for each meaningful concept in the query, what is the
// closest crystal I know?" — then assembles those into a structured answer.
// Deterministic. Inspectable. No fabrication: every line cites the token that
// produced it and the crystal it pulled from.
// ─────────────────────────────────────────────────────────────────────────────

interface ConceptMatch {
  token: string;
  crystalKey: string;
  domain: string;
  primitive: string | null;
  similarity: number;
  responseSnippet: string;
}

const CONCEPT_FLOOR = 0.18; // lower than whole-query floor — per-token signal is weaker

function thinkByConcepts(contentTokens: string[]): ConceptMatch[] {
  const seen = new Set<string>();
  const matches: ConceptMatch[] = [];

  for (const token of contentTokens) {
    const tokenVec = encode(token);
    let best: { cv: typeof CRYSTAL_VECTORS[number]; sim: number } | null = null;
    for (const cv of CRYSTAL_VECTORS) {
      const sim = cosine(tokenVec, cv.vector);
      if (!best || sim > best.sim) best = { cv, sim };
    }
    if (best && best.sim >= CONCEPT_FLOOR && !seen.has(best.cv.crystal.key)) {
      seen.add(best.cv.crystal.key);
      // First sentence of the crystal response — enough to seed the association
      const snippet = best.cv.crystal.response.split(/(?<=\.)\s/)[0];
      matches.push({
        token,
        crystalKey: best.cv.crystal.key,
        domain: best.cv.crystal.domain,
        primitive: best.cv.crystal.primitive,
        similarity: best.sim,
        responseSnippet: snippet,
      });
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity).slice(0, 4);
}

function composeThought(query: string, concepts: ConceptMatch[]): string {
  if (concepts.length === 0) return '';
  const lines: string[] = [
    'No single crystal matched your full query, so I composed an answer from my own associations:',
    '',
  ];
  for (const c of concepts) {
    const tag = c.primitive ? `[${c.primitive}]` : `[${c.domain}]`;
    lines.push(`• "${c.token}" → ${tag} ${c.responseSnippet}`);
  }
  lines.push('');
  lines.push(`These ${concepts.length} associations are the closest concepts I hold to your query. Pick one and ask directly with /ask <PRIMITIVE> for a focused answer.`);
  return lines.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Public API
// ─────────────────────────────────────────────────────────────────────────────

export interface BrainTrace {
  response: string;
  decode: ParsedIntent;
  matchedCrystal: { key: string; domain: string; similarity: number; primitive: string | null } | null;
  candidates: Array<{ key: string; domain: string; similarity: number; primitive: string | null }>;
  conceptMatches: ConceptMatch[];
  embedding: {
    dimensions: number;
    modelVersion: string;
    norm: number;
    firstFive: number[];
    encodeMs: number;
    activeDims: number;
  };
  confidence: number;
  receipt: { id: string; fingerprint: string; timestamp: string; chain: string };
  grounded: boolean;
  thoughtComposed: boolean;
  routedTo: string | null;
}

const SIMILARITY_FLOOR = 0.25;

export function brainReason(input: string, priorReceipt = '00000000'): BrainTrace {
  const t0 = performance.now();

  const decoded = parseIntent(input);
  const queryText = decoded.isRouted ? (decoded.routedRest ?? decoded.routedPrimitive ?? '') : input;
  const pool = decoded.isRouted
    ? CRYSTAL_VECTORS.filter(cv => cv.crystal.primitive === decoded.routedPrimitive)
    : CRYSTAL_VECTORS;

  const vector = encode(queryText);
  const encodeMs = performance.now() - t0;

  let activeDims = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) if (vector[i] !== 0) activeDims++;

  let scored: Array<{
    key: string; domain: string; primitive: string | null;
    response: string; baseConfidence: number; similarity: number;
  }> = [];

  if (pool.length > 0) {
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

  // Thinking flow — only triggered when whole-query match fails AND we are not
  // in routed mode (routed mode is a deliberate scope restriction by the user).
  let conceptMatches: ConceptMatch[] = [];
  let thoughtComposed = false;
  let composed = '';
  if (!grounded && !decoded.isRouted && decoded.contentTokens.length > 0) {
    conceptMatches = thinkByConcepts(decoded.contentTokens);
    if (conceptMatches.length > 0) {
      composed = composeThought(input, conceptMatches);
      thoughtComposed = true;
    }
  }

  let response: string;
  if (decoded.isRouted && pool.length === 0) {
    response = [
      `No crystals registered for primitive "${decoded.routedPrimitive}".`,
      '',
      `Known primitives: ${KNOWN_PRIMITIVES.join(', ')}`,
      'Doctrine queries (architecture, origin, receipts) need no /ask prefix.',
    ].join('\n');
  } else if (grounded) {
    response = decoded.isRouted
      ? `[routed → ${decoded.routedPrimitive}]\n\n${top.response}`
      : top.response;
  } else if (thoughtComposed) {
    response = composed;
  } else {
    response = [
      `No crystal exceeded the similarity floor (${SIMILARITY_FLOOR.toFixed(2)}) and I could not associate any concept tokens above the thinking floor (${CONCEPT_FLOOR.toFixed(2)}).`,
      top
        ? `Closest whole-query match: "${top.key}" at ${(top.similarity * 100).toFixed(1)}% (domain: ${top.domain}).`
        : 'No candidates in the routed pool.',
      '',
      'Topics I can answer:',
      `  • Primitives: ${KNOWN_PRIMITIVES.join(', ')}`,
      '  • Doctrine: cognitive substrate, 40-primitive matrix, receipts, tiers, origin',
      '',
      'Direct routing:  /ask BRAIN how do you encode',
      '',
      `Tokens DECODE saw: [${decoded.tokens.slice(0, 8).join(', ')}]`,
      `Intent classified as: ${decoded.intent} (${decoded.confidence})`,
    ].join('\n');
  }

  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += vector[i] * vector[i];
  norm = Math.sqrt(norm);

  const receiptId = 'brn_' + fnv1a(input + ':' + Date.now()).slice(0, 8);
  const matchKey = grounded && top
    ? top.key
    : thoughtComposed
      ? 'composed:' + conceptMatches.map(c => c.crystalKey).join('+')
      : 'none';
  const fingerprint = fnv1a(
    priorReceipt + '|' + input + '|' + decoded.intent + '|' + matchKey,
  );
  const chain = priorReceipt + '→' + fingerprint;

  return {
    response,
    decode: decoded,
    matchedCrystal: grounded && top
      ? { key: top.key, domain: top.domain, similarity: top.similarity, primitive: top.primitive }
      : null,
    candidates: scored.slice(0, 3).map(s => ({
      key: s.key, domain: s.domain, similarity: s.similarity, primitive: s.primitive,
    })),
    conceptMatches,
    embedding: {
      dimensions: EMBEDDING_DIM,
      modelVersion: MODEL_VERSION,
      norm,
      firstFive: Array.from(vector.slice(0, 5)).map(n => Number(n.toFixed(6))),
      encodeMs: Number(encodeMs.toFixed(3)),
      activeDims,
    },
    confidence: grounded && top
      ? top.similarity * top.baseConfidence
      : thoughtComposed
        ? conceptMatches.reduce((s, c) => s + c.similarity, 0) / conceptMatches.length * 0.6
        : 0,
    receipt: { id: receiptId, fingerprint, timestamp: new Date().toISOString(), chain },
    grounded,
    thoughtComposed,
    routedTo: decoded.routedPrimitive,
  };
}

export const BRAIN_REASONER_META = {
  modelVersion: MODEL_VERSION,
  embeddingDim: EMBEDDING_DIM,
  crystalCount: CRYSTALS.length,
  similarityFloor: SIMILARITY_FLOOR,
  conceptFloor: CONCEPT_FLOOR,
  standalone: true,
  externalImports: 0,
} as const;
