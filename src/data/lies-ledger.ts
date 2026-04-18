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
    title: 'Discoveries database holds 171 distinct primitive names — code defines only 40',
    severity: 'PARTIAL',
    source: {
      document: 'AGENTS.md + multiple whitepapers',
      quote:
        '"40-Primitive · 12 Organs · 12 Layers · 8 Engines · 8 Agents" — the substrate is described as a fixed 40-primitive matrix.',
    },
    evidence: {
      reality:
        'discoveries.module_chain contains 171 unique primitive names across 10,266 rows. That includes many primitives never referenced in canonical-primitives.ts. Either historical drift or the matrix has informally expanded beyond the documented 40.',
      method:
        "SELECT COUNT(DISTINCT primitive) FROM (SELECT unnest(module_chain) AS primitive FROM discoveries WHERE module_chain IS NOT NULL) s;  → 171",
    },
    verdict:
      'The "fixed 40-primitive matrix" claim is undermined by the data. Either the documentation is stale, the matrix silently grew, or many discovered primitives were synthetic — but the public claim of strict canonicity is not supported by the database.',
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
