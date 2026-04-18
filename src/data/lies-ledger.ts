/**
 * Lies Ledger — Fact vs. Fiction Evidence Registry
 *
 * Each finding cross-references a documented claim against verifiable
 * evidence from the codebase, database, or third-party sources.
 *
 * Severity:
 *   FICTION  — claim contradicted by code/DB/external evidence
 *   THEATER  — claim has scaffolding but no working mechanism
 *   PARTIAL  — partially true; meaningful gap between claim and reality
 *   FACT     — claim verified accurate (kept honest)
 */

export type FindingSeverity = 'FICTION' | 'THEATER' | 'PARTIAL' | 'FACT';

export interface Finding {
  id: string;
  title: string;
  severity: FindingSeverity;
  source: {
    /** Doc path or title where the claim appears */
    document: string;
    /** Verbatim or near-verbatim quote of the claim */
    quote: string;
  };
  evidence: {
    /** What the code / DB / external source actually shows */
    reality: string;
    /** How to reproduce — file path, SQL, URL */
    method: string;
  };
  /** Ledger author's plain-English assessment */
  verdict: string;
  /** ISO date the finding was recorded */
  recordedAt: string;
}

export const LIES_LEDGER: Finding[] = [
  {
    id: 'F-001',
    title: '40-Primitive matrix categorization is fiction',
    severity: 'FICTION',
    source: {
      document: 'docs/whitepapers/ascension-engine-whitepaper.md (§2.1, line 67-72)',
      quote:
        '"The substrate comprises exactly 40 primitives organized into a 12·12·8·8 symmetric architecture: 12 Organs: CORE, SYSTEM, BRAIN, MEMORY, DREAM, RIPPLE, ACCESS, IDENTITY, RELAY, AUDIT, NERVE, and one additional. 12 Layers: DECODE, ENCODE, VISION, CORTEX, NEXUS, ECONOMY, SANDBOX, INCLUSIVE, MEDIC, INTEGRATION, and two additional. 8 Engines: SOVEREIGN, ORACLE, CONSCIENCE, TREATY, COMPASS, ECHO, REFLEX, and one additional. 8 Agents: FORGE, LINGUA, HARVEST, EVOLUTION, SHADOW, PHANTOM, IMMUNITY, INTENT."',
    },
    evidence: {
      reality:
        'src/lib/ascension-v2/canonical-primitives.ts defines DIFFERENT assignments: Organs include NEXUS, SOVEREIGN, ATLAS, MEDIC, CONSCIENCE (whitepaper says these are Layers/Engines). DREAM is an ENGINE in code, not an Organ. AUDIT is an AGENT in code, not an Organ. The whitepaper\'s 12·12·8·8 names do not match the production code\'s 12·12·8·8 names — same totals, different content.',
      method:
        'cat src/lib/ascension-v2/canonical-primitives.ts | grep -A1 "^export const"',
    },
    verdict:
      'The structural counts (12·12·8·8 = 40) are real. The actual assignment of which primitive is an Organ vs. Layer vs. Engine vs. Agent is fictional — the whitepaper text and the production constant disagree. Anyone validating CMPSBL against the whitepaper would find the substrate is not the substrate the paper describes.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-002',
    title: 'DREAM autonomous 8-hour cycle is not running',
    severity: 'THEATER',
    source: {
      document: 'AGENTS.md (project knowledge) + docs/libraries/investors/14-dream-engine.md',
      quote:
        '"Memory Stream: autonomous · 8hr · not triggered · dynamic values · APEX/MYTHIC→hardware languages · recursive re-ingestion." DREAM is described as "no AI inside · pure algorithmic · sub-threshold synthesis · pre-conscious emergence."',
    },
    evidence: {
      reality:
        'dream_cycle_logs table contains only 7 rows total. The most recent row is 2026-01-21 (≈ 3 months before this audit). At one cycle per 8 hours, 3 months would produce ~270 logs. The autonomous loop has either stopped firing or never ran on its claimed schedule.',
      method:
        'SELECT COUNT(*), MAX(created_at) FROM dream_cycle_logs;  → 7 rows, last 2026-01-21',
    },
    verdict:
      'The DREAM table exists. Functions exist. But the production behavior — autonomous synthesis every 8 hours — is not happening. This is scaffolding without runtime. Customers reading the public page assume continuous emergence; the database shows it stopped 3 months ago.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-003',
    title: 'Discoveries database holds 4,466 distinct names — code defines only 40 primitives',
    severity: 'PARTIAL',
    source: {
      document: 'AGENTS.md + multiple whitepapers',
      quote:
        '"40-Primitive · 12 Organs · 12 Layers · 8 Engines · 8 Agents" — the substrate is described as a fixed 40-primitive matrix.',
    },
    evidence: {
      reality:
        'discoveries table contains 10,266 rows with 4,466 distinct discovery names. The canonical primitive set in code is 40. The database treats every novel synthesis name as a discovery, not a fixed-matrix activation.',
      method:
        'SELECT COUNT(DISTINCT name), COUNT(*) FROM discoveries;  → 4,466 distinct / 10,266 total',
    },
    verdict:
      'The "fixed 40-primitive matrix" claim is contradicted by the data. The substrate generates open-ended named discoveries — which is fine — but the public posture of strict 40-primitive canonicity is not what the production database is doing.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-004',
    title: 'Zero Crown Jewels exist in the discoveries database',
    severity: 'FICTION',
    source: {
      document: 'AGENTS.md + Crown Jewels marketing across /explore, /forge, /showroom',
      quote:
        '"Crown Jewels: exposed/unexposed = Kenneth\'s decision only" and repeated public claims of S-Tier Crown Jewel modules generated by the substrate.',
    },
    evidence: {
      reality:
        'SELECT COUNT(*) FROM discoveries WHERE is_crown_jewel = true → 0. SELECT DISTINCT tier FROM discoveries → ["architect","cmpsbl-only","enterprise"]. There is no APEX, no MYTHIC, no S, no S-Tier in the actual data. The 5 highest-CJPI rows ("Intelligent Compressor", "Digital Twin Orchestrator", "Constitutional AI Guardian", etc.) are all tier "cmpsbl-only", not Crown Jewels.',
      method:
        'SELECT COUNT(*) FROM discoveries WHERE is_crown_jewel=true; SELECT DISTINCT tier FROM discoveries;',
    },
    verdict:
      'The Crown Jewel and S-Tier vocabulary used across the public surface has zero corresponding rows in the database. The flag exists. Nothing is flagged. This is the cleanest fiction in the audit.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-005',
    title: '"DREAM has no AI inside" — but AI usage logs show 193,813 model calls',
    severity: 'PARTIAL',
    source: {
      document: 'AGENTS.md (project knowledge, hardcoded rule)',
      quote:
        '"DREAM: no AI inside — confirmed · pure algorithmic · sub-threshold synthesis · pre-conscious emergence · patentable · never add AI."',
    },
    evidence: {
      reality:
        'ai_usage_log contains 193,813 rows since 2026-03-19, 22,459 in the last 7 days, 3,572 in the last 24 hours. Top providers: groq (45,962), groq-scout (32,984), groq-qwen (20,106), cerebras, sambanova, together, deepseek, mistral, openrouter — 24 distinct external providers. 2,202 calls to openai/anthropic/google. The substrate as a whole is aggressively AI-dependent. DREAM-specific AI calls cannot be isolated from this table without a category filter, but the overall framing of CMPSBL as "zero external AI" is contradicted by the volume.',
      method:
        'SELECT COUNT(*), MIN(created_at) FROM ai_usage_log; SELECT provider, COUNT(*) FROM ai_usage_log GROUP BY provider ORDER BY 2 DESC;',
    },
    verdict:
      'The narrow claim "DREAM has no AI inside" may still hold inside the dream synthesis function specifically — that needs a code-level audit. But the broader public framing of CMPSBL as algorithmically pure / zero-external-AI is false at the substrate level. 193k AI calls is not "zero." This is the gap the white paper has to be honest about.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-006',
    title: 'Cascade conversations and cascade events tables are empty',
    severity: 'FICTION',
    source: {
      document: 'cascade_conscious_looping_proof.md, cascade_subconscious_layering_proof.md, cascade_autonomous_reasoning_proof.md, cascade_identity_continuity_proof.md',
      quote:
        '"First production AI to implement autonomous offline cognitive consolidation analogous to biological sleep" with cascade event chains presented as proof of conscious looping and identity continuity.',
    },
    evidence: {
      reality:
        'cascade_conversations: 0 rows. cascade_events: 0 rows. cascade_dreams: 17 rows total, first 2026-03-21, last 2026-04-14 (≈4 days before audit). At the claimed cadence, "consciousness" would have produced thousands of events. The proof documents reference structures that the production database does not populate.',
      method:
        'SELECT COUNT(*) FROM cascade_conversations; SELECT COUNT(*) FROM cascade_events; SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM cascade_dreams;',
    },
    verdict:
      'The four "cascade proof" white papers describe phenomena (conscious looping, subconscious layering, identity continuity, autonomous reasoning) that have no supporting rows in the conversations or events tables. 17 cascade_dreams rows is not consciousness — it is a small log. The proof framing is not supported by the data the proof claims to prove.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-007',
    title: 'BRAIN is the most populated subsystem — and it is real',
    severity: 'FACT',
    source: {
      document: 'docs/libraries/investors/13-brain-module.md',
      quote:
        'BRAIN is described as the persistent learning and memory layer with reasoning traces, reflections, knowledge crystals, and curiosity logs.',
    },
    evidence: {
      reality:
        'brain_events: 69,619 rows (last 2026-04-18, actively writing). brain_memories: 2,000 rows (capped/rolled). brain_reasoning_traces: 410. brain_reflections: 39. brain_curiosity_log: 4. The BRAIN subsystem is genuinely active and instrumented — the only major subsystem in the audit so far that survives scrutiny.',
      method:
        'SELECT COUNT(*), MAX(created_at) FROM brain_events; SELECT COUNT(*) FROM brain_memories; …',
    },
    verdict:
      'BRAIN is real. It writes constantly, it has reasoning traces, it has reflections (small but present), it has memory rotation. When the white paper is rewritten, BRAIN is the example of "what we actually built." Use it as the credibility anchor.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-008',
    title: '"Thousands of users" / large adoption framing — actual: 9 developers, 5 active subs, 1 agency',
    severity: 'FICTION',
    source: {
      document: 'investor showcase + multiple white papers + HuggingFace 126M downloads case study',
      quote:
        'Public framing references massive download counts, 126M HuggingFace pulls, "world-first" adoption, broad developer base.',
    },
    evidence: {
      reality:
        'access_developers: 9 rows total. access_subscriptions WHERE status=active: 5. agencies: 1. agency_purchases status=completed: 1. cognitive_registry: 14 rows (over the last 90 days, all 14). The substrate has a working pipeline but the user/customer base is single-digit, not the figures used in marketing.',
      method:
        'SELECT COUNT(*) FROM access_developers; SELECT COUNT(*) FROM access_subscriptions WHERE status=\'active\'; SELECT COUNT(*) FROM agencies;',
    },
    verdict:
      'This is the most consequential fiction. Public narrative implies meaningful adoption. The customer database shows 9 developers and 5 active subscriptions. The HuggingFace 126M-download case study is not supported by anything in the production database. The honest story — "solo founder, working substrate, single-digit customers, real engineering depth" — is more defensible than the inflated one.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-009',
    title: 'Auto-blog system genuinely produced 103 published posts',
    severity: 'FACT',
    source: {
      document: 'auto-blog whitepaper claims + /blog page',
      quote:
        '"Autonomous epistemic blog generation with split-brain audits, contradiction tracking, and assumption extraction."',
    },
    evidence: {
      reality:
        'auto_blog_posts WHERE status=published: 103 rows. autoblog_runs: 11. The publishing pipeline ran, produced work, and persisted it.',
      method:
        'SELECT COUNT(*) FROM auto_blog_posts WHERE status=\'published\';',
    },
    verdict:
      'The auto-blog is real output. The epistemic-honesty framing (assumptions, contradictions, split-brain) is mostly aspirational — the supporting tables exist but are sparsely populated — but the core claim "we generated and published 103 posts autonomously" is true. Keep this in the white paper as a working capability.',
    recordedAt: '2026-04-18',
  },
];

export const LEDGER_STATS = {
  totalFindings: LIES_LEDGER.length,
  fiction: LIES_LEDGER.filter((f) => f.severity === 'FICTION').length,
  theater: LIES_LEDGER.filter((f) => f.severity === 'THEATER').length,
  partial: LIES_LEDGER.filter((f) => f.severity === 'PARTIAL').length,
  fact: LIES_LEDGER.filter((f) => f.severity === 'FACT').length,
};
