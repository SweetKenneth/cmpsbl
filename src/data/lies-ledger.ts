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
  {
    id: 'F-010',
    title: 'BRAIN embeddings table is empty — semantic memory is hollow',
    severity: 'FICTION',
    source: {
      document: '13-BRAIN-MODULE.md + investor decks',
      quote:
        'BRAIN is described as a vector-embedded semantic memory layer with knowledge crystals, embedded artifacts, and similarity-based retrieval.',
    },
    evidence: {
      reality:
        'brain_embeddings: 0 rows. brain_knowledge_edges: 0 rows. brain_classifier_models WHERE is_active=true: 0. The live preview just made GET requests to /brain_embeddings (returned []) and /brain_knowledge_crystals (returned []) — visible in network logs at 02:33:33 UTC. The "semantic memory" component the docs describe has no vectors stored.',
      method:
        'SELECT COUNT(*) FROM brain_embeddings; SELECT COUNT(*) FROM brain_classifier_models WHERE is_active=true; + live network capture',
    },
    verdict:
      'BRAIN is half-real. The events/memories/reasoning_traces tables are populated (F-007 stands). But the vector/semantic/knowledge-graph layer that the white papers showcase as the differentiator is empty. The UI is fetching nothing and silently rendering empty arrays.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-011',
    title: 'BRAIN knowledge graph: 731 nodes / 4,636 edges (real) — but 0 typed knowledge edges',
    severity: 'PARTIAL',
    source: {
      document: '13-BRAIN-MODULE.md',
      quote:
        '"Knowledge graph with typed edges, distillation runs, and crystallized knowledge."',
    },
    evidence: {
      reality:
        'brain_graph_nodes: 731. brain_graph_edges: 4,636. brain_knowledge_crystals: 734. brain_distillation_runs: 532. These are real and substantial. BUT brain_knowledge_edges (the typed-relationship table the docs describe) is 0. The graph exists structurally; the typed semantic layer over it does not.',
      method:
        'SELECT COUNT(*) FROM brain_graph_nodes / brain_graph_edges / brain_knowledge_crystals / brain_knowledge_edges;',
    },
    verdict:
      'Real graph, real distillation, real crystals — but the "typed knowledge relationships" claim is unsupported. Honest restatement: "untyped graph of 731 nodes and 4,636 edges with 734 distilled crystals." That is a defensible artifact. Don\'t over-promise typed semantics.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-012',
    title: 'EVOLUTION engine: 34 proposals, 0 ever applied',
    severity: 'THEATER',
    source: {
      document: 'AGENTS.md + investor showcase: "EVOLUTION for patching" + cortex PAAEL loop docs',
      quote:
        '"propose / evaluate / apply / rollback - PAAEL loop" — substrate self-modifies via the EVOLUTION engine.',
    },
    evidence: {
      reality:
        'evolution_proposals: 34 rows. evolution_proposals WHERE status=\'applied\': 0. cortex_audit_log: 1 row. The proposals exist; nothing has ever been applied. The PAAEL loop has the propose/evaluate steps and stops there.',
      method:
        'SELECT COUNT(*), COUNT(*) FILTER (WHERE status=\'applied\') FROM evolution_proposals;',
    },
    verdict:
      'EVOLUTION is theater for self-modification. It proposes; it never patches. "Self-modifying substrate" is not what the database shows. Honest restatement: "human-reviewed proposal queue with 34 entries." That is fine — it just isn\'t autonomy.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-013',
    title: 'IMMUNITY engine: zero rules, zero invocations — pure shell',
    severity: 'FICTION',
    source: {
      document: 'mem://architecture/immune/core-logic-and-training-v2-0-0 + investor materials',
      quote:
        '"Autonomous self-healing through a governed promotion pipeline (Shadow → Simulation → Production)."',
    },
    evidence: {
      reality:
        'immunity_rules: 0 rows. The live status call to module=immunity returned `total_records:0, recent_activity_1h:0, last_run:null` (network log 02:33:43). There is no immune system running.',
      method:
        'SELECT COUNT(*) FROM immunity_rules; + live POST /pf-substrate {module:"immunity"}',
    },
    verdict:
      'IMMUNITY is a status endpoint and a table. It has zero rules, zero runs, zero invocations. The "autonomous self-healing" claim has no execution behind it. Remove or restate as "scaffolded, not running."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-014',
    title: 'DEFENSE engine: 2,558 events real — but zero blocks, zero challenges in 24h',
    severity: 'PARTIAL',
    source: {
      document: 'DEFENSE Layer + 6-Layer Cognitive Security Matrix docs',
      quote:
        '"6-layer Cognitive Security Matrix (Perimeter, Identity, Protocol, Execution, Behavior, Recovery)."',
    },
    evidence: {
      reality:
        'defense_events: 2,558 rows total — real telemetry. BUT live status call: events_24h:0, blocked_24h:0, challenged_24h:0, allowed_24h:0, mode:"observe", block_rate:"0%". 6 active rules but top 3 rules each have 0 matches. DEFENSE is logging in observe-mode and never enforcing.',
      method:
        'SELECT COUNT(*) FROM defense_events; + live POST /pf-substrate {module:"defense"}',
    },
    verdict:
      'DEFENSE collected 2,558 events historically but in production today it is in observe mode with 0% block rate. Calling it a "6-layer security matrix" implies enforcement. Honest restatement: "passive telemetry with 6 inactive rules in shadow mode."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-015',
    title: 'CORTEX audit log: 1 row, 0 PAAEL applies, 0 learn cycles',
    severity: 'THEATER',
    source: {
      document: '22-CORTEX-MODULE.md',
      quote:
        '"CORTEX Orchestration Engine (v3.0.0) provides behavior-agnostic, policy-driven enforcement" with reinforcement loop and learn cycles.',
    },
    evidence: {
      reality:
        'cortex_audit_log: 1 row total. Live status call: proposals_applied:0, proposals_rejected:0, learn_cycles:0, pending_sequences:0, recent_events:10. CORTEX has dispatch wired and reports healthy, but the orchestration/learning behavior is dormant.',
      method:
        'SELECT COUNT(*) FROM cortex_audit_log; + live POST /pf-substrate {module:"cortex"}',
    },
    verdict:
      'CORTEX is wired but idle. It can dispatch, but it has not orchestrated, not learned, not applied a single proposal. The "policy-driven enforcement" claim is potential, not behavior. The white paper should describe it as "control plane primed for orchestration" — accurate.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-016',
    title: 'Autoblog epistemic-honesty layer (assumptions/contradictions/split-brain) is empty',
    severity: 'THEATER',
    source: {
      document: 'auto-blog white papers + /blog page',
      quote:
        '"Autonomous epistemic blog generation with split-brain audits, contradiction tracking, assumption extraction, and memory-of-error reports."',
    },
    evidence: {
      reality:
        'autoblog_split_brain_audits: 0. autoblog_assumptions WHERE is_broken=true: 0. autoblog_memory_reports WHERE is_published=true: 0. brain_memory_contradictions: 0. brain_drift_log: 0. The 103 published posts are real (F-009). The epistemic-honesty machinery wrapped around them is unpopulated.',
      method:
        'SELECT COUNT(*) FROM autoblog_split_brain_audits / autoblog_assumptions / autoblog_memory_reports / brain_memory_contradictions / brain_drift_log;',
    },
    verdict:
      'The blog publishes. The epistemic infrastructure that supposedly governs the blog (split-brain reader/skeptic scoring, broken-assumption tracking, contradiction logs, memory reports) has zero rows. The columns exist on auto_blog_posts but the supporting tables are empty. The "honest AI that tracks its own wrongness" framing is the most ironic theater in the audit.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-017',
    title: 'CLI Ascension: 2 lifetime sessions — not the developer-facing pipeline the docs describe',
    severity: 'FICTION',
    source: {
      document: 'ascension-engine-whitepaper.md + 19-INTEGRATION-MODULE.md + cli docs',
      quote:
        '"Ascension is the developer entry point — used at scale across substrate adopters." HuggingFace case study claims a 217.7-second Ascension run as exemplar.',
    },
    evidence: {
      reality:
        'cli_ascension_sessions: 2 rows total. Last session 2026-04-14. cli_sessions: 0 rows. The CLI Ascension flow has been invoked exactly twice in the lifetime of the database.',
      method:
        'SELECT COUNT(*), MAX(created_at) FROM cli_ascension_sessions; SELECT COUNT(*) FROM cli_sessions;',
    },
    verdict:
      'Ascension exists as code. As a used developer pipeline, it has 2 historical invocations. The HuggingFace 126M-download / 217.7s case study is not represented anywhere in cli_ascension_sessions. Public claims of broad Ascension adoption are not supported.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-018',
    title: 'Lex registry and audit chain anchors are completely empty',
    severity: 'FICTION',
    source: {
      document: 'mem://security/lex/registry-backend-hardening-spec + audit-chain whitepaper',
      quote:
        '"Lex Registry hardened with hash-based audits, 60/min limiters, max 5KB payloads" + "audit chain anchors with cryptographic head hashes."',
    },
    evidence: {
      reality:
        'lex_registry: 0 rows. lex_registry_events: 0 rows. audit_chain_anchors: 0 rows. audit_logs has 78 rows of basic application audit, but the cryptographically-anchored Lex chain is empty.',
      method:
        'SELECT COUNT(*) FROM lex_registry; SELECT COUNT(*) FROM lex_registry_events; SELECT COUNT(*) FROM audit_chain_anchors;',
    },
    verdict:
      'The "fingerprint gate + continuous governance" architecture written into the core memory rules has zero entries in production. Lex is a contract with no enforcement record. Audit chain has no anchors. Central to the patent narrative — and absent from the database.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-019',
    title: 'Artifact registry: 199 entries, all owned by a single user',
    severity: 'PARTIAL',
    source: {
      document: 'investor showcase + Foundry/Junkyard documentation',
      quote:
        '"Artifact registry tracks substrate-generated software exports across users, tiers, and verticals."',
    },
    evidence: {
      reality:
        'artifact_registry: 199 rows. COUNT(DISTINCT user_id): 1. Every artifact is owned by one user.',
      method:
        'SELECT COUNT(*), COUNT(DISTINCT user_id) FROM artifact_registry;',
    },
    verdict:
      '199 artifacts is real engineering work — keep it. But framing the registry as multi-user substrate output is fiction. It is the founder\'s personal output catalog. Restate as "199 founder-generated artifacts" — defensible and impressive on its own.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-020',
    title: 'Public API access usage table is empty — zero recorded external calls',
    severity: 'FICTION',
    source: {
      document: 'developer/access docs + API key management memory',
      quote:
        '"API key lifecycle, rate limits per minute/day, scoped access, usage metering."',
    },
    evidence: {
      reality:
        'access_usage: 0 rows total. access_api_keys WHERE is_active=true: 4. Four keys provisioned, zero recorded usage.',
      method:
        'SELECT COUNT(*) FROM access_usage; SELECT COUNT(*) FROM access_api_keys WHERE is_active=true;',
    },
    verdict:
      'Developer API has 4 keys and zero recorded usage. The 193k internal AI calls (ai_usage_log) are NOT external developer API usage — different table, different meaning. The public "metered substrate API" claim is not happening.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-021',
    title: 'Real, modest site traffic — 1,446 sessions / 17 lifetime users (defensible truth)',
    severity: 'FACT',
    source: {
      document: 'analytics_events + investor showcase framing',
      quote:
        'Public framing implies meaningful engagement and growth metrics.',
    },
    evidence: {
      reality:
        'analytics_events: 21,790 lifetime. Last 7 days: 3,188 events / 1,446 unique sessions. Distinct logged-in users ever: 17. client_error_log: 260.',
      method:
        'SELECT COUNT(*), COUNT(DISTINCT session_id) FROM analytics_events WHERE created_at > now()-interval \'7 days\'; SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE user_id IS NOT NULL;',
    },
    verdict:
      'Site is alive. 1,446 weekly sessions is real engagement for a solo-founder substrate. 17 lifetime authenticated users is the honest number. Use these in the white paper instead of inflated counts — defensible and interesting on their own.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-022',
    title: 'Discovery engine IS real and active — 10,266 discoveries, 3,339 runs',
    severity: 'FACT',
    source: {
      document: 'docs/libraries/internal/16-trade-secrets.md + 17-crown-jewel-registry.md',
      quote: '"CJPI Scoring — Crown Jewel Pipeline Index — novelty, utility, complexity, composability." 6 mining waves.',
    },
    evidence: {
      reality:
        'discoveries: 10,266 rows (855 architect / 2,252 enterprise / 7,159 cmpsbl-only). discovery_runs: 3,339. discovered_pipelines: 40. All discoveries created between 2026-04-13 and 2026-04-18 — i.e. last 5 days.',
      method:
        "SELECT tier, count(*) FROM discoveries GROUP BY tier; SELECT min(created_at), max(created_at) FROM discoveries;",
    },
    verdict:
      'The discovery engine is genuinely producing scored output at scale — 10k discoveries in 5 days is real algorithmic work. BUT: the entire history is 5 days old. There is no multi-month "6 mining waves" history in the database. The waves narrative is retroactive framing on a 5-day-old engine.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-023',
    title: 'Evolution proposals are evaluated but ZERO ever applied (governance theater)',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/staff/02-architecture-and-primitives.md §5 SEBA Pipeline',
      quote: '"7-gate validation pipeline: Candidate → Shadow Run → Behavioral Diff → TSAC Truth Check → Confidence Gate → Governance Approval → Staged Promotion → Production."',
    },
    evidence: {
      reality:
        'evolution_proposals by status: approved=19, rejected=13, rolled_back=2, applied=0. evolution_receipts=0. evolution_snapshots=0. evolution_repair_log=0. tsac_verifications=0.',
      method:
        "SELECT status, count(*) FROM evolution_proposals GROUP BY status; SELECT count(*) FROM tsac_verifications;",
    },
    verdict:
      'The pipeline runs the first 5 gates (proposals get scored, approved or rejected) but Gate 6 (Staged Promotion) and Gate 7 (Production) have never fired. 19 approved proposals sit in limbo. TSAC has zero verifications. The "self-improving substrate" claim is unsupported — nothing has ever been promoted to production.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-024',
    title: 'Mesh communication IS real — 1,316 inter-primitive comms recorded',
    severity: 'FACT',
    source: {
      document: 'docs/libraries/staff/02-architecture-and-primitives.md §2 Execution Model',
      quote: '"All execution routes through broadcastIntent(). Primitives never call each other directly — only through resolvers via the intent mesh."',
    },
    evidence: {
      reality:
        'mesh_intents: 25 registered. mesh_comms: 1,316 events recorded. The intent-routing fabric exists and is logging traffic.',
      method: 'SELECT count(*) FROM mesh_intents; SELECT count(*) FROM mesh_comms;',
    },
    verdict:
      'The mesh communication layer is real and active. This is one of the architectural claims that holds up under audit. Defensible in the white paper.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-025',
    title: 'Integration layer is hollow — 31 adapters claimed, 0 connections, 0 usage',
    severity: 'FICTION',
    source: {
      document: 'INTEGRATION primitive status endpoint + integration adapter docs',
      quote: '"31 adapters across enterprise, payroll, development, gaming, data categories. 6 discovered systems."',
    },
    evidence: {
      reality:
        'integration_connections: 0. integration_usage: 0. integration_discoveries: 6 (matches claim). The 31 adapters are code-defined — they have never been connected to a real external system or invoked.',
      method: 'SELECT count(*) FROM integration_connections; SELECT count(*) FROM integration_usage;',
    },
    verdict:
      'Adapter code exists but has never been used. "31 enterprise adapters" framing implies operational integration — reality is zero connections, zero calls. Fiction unless restated as "31 adapter scaffolds, none yet connected to production systems."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-026',
    title: 'Vertical CLM cycles ARE running — 1,684 cycles recorded',
    severity: 'FACT',
    source: {
      document: 'vertical substrate ecosystem spec (12 verticals) + CLM serialization claims',
      quote: '"12 operational 40-primitive environments running Continuous Learning Machine cycles."',
    },
    evidence: {
      reality:
        'vertical_clm_cycles: 1,684 rows. vertical_ascension_sessions: 1. dream_cycle_logs: 7. dream_stream: 3. dream_sessions: 0.',
      method: 'SELECT count(*) FROM vertical_clm_cycles; SELECT count(*) FROM dream_sessions;',
    },
    verdict:
      'CLM cycles are real and at volume. BUT — only 1 vertical Ascension session and 0 dream_sessions. The "12 vertical environments running autonomously" claim is partial: cycles run, but the dream-synthesis layer above them is essentially idle. Honest restate: "1,684 CLM cycles, dream synthesis not yet engaged."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-027',
    title: 'Memory tier receipts table is empty — no audit trail for the 4-tier memory system',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/staff/02-architecture-and-primitives.md §3 Memory Architecture',
      quote: '"4-tier persistent memory: Working / Episodic / Semantic / Archival. CLM promotes insights up through tiers as confidence increases."',
    },
    evidence: {
      reality:
        'BRAIN tier counts (live RPC): hot=528, warm=7,921, cold=9,954, flat=2,000, pruned=5,000. Tiering is real. BUT memory_tier_receipts: 0 — there is NO audit/provenance trail for any tier promotion or demotion.',
      method: 'SELECT count(*) FROM memory_tier_receipts; RPC brain_get_tier_counts.',
    },
    verdict:
      'Tiered memory exists and has 25,403 records distributed across tiers. That part is real. The "audit-grade promotion chain" is not — zero receipts means tier transitions are happening untraceably. Honest restate: "tiering operational, provenance trail not yet captured."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-028',
    title: 'CLM "14,400 calls/day always-on" claim is off by ~120× — and the legacy engine has been dead for 2 months',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/02-technology-architecture.md + 08-survivability.md + public/11-glossary.md',
      quote:
        '"CLM 14,400 calls/day, 70% system telemetry, 30% scheduled curriculum, knowledge permanently distilled." "The substrate has operated autonomously, running CLM at 14,400 calls/day... without manual intervention." "The always-on learning engine — up to 14,400 cycles/day."',
    },
    evidence: {
      reality:
        'learning_cycles: 483 lifetime, last cycle 2026-02-21 (~2 months silent), 0 in last 7 days. vertical_clm_cycles: 1,684 lifetime, 120 in last 24h, 780 in last 7 days. ai_learning_data: 0 rows EVER. learning_results: 0. learning_logs: 0. learning_confidence: 0. learning_patterns: 3 lifetime. Edge function pf-clm-engine literally logs: "Auto-chain skipped — failure rate 58% too high."',
      method:
        "SELECT count(*) FROM learning_cycles WHERE created_at > now()-interval '24 hours'; SELECT count(*) FROM vertical_clm_cycles WHERE created_at > now()-interval '24 hours'; SELECT count(*) FROM ai_learning_data; pf-clm-engine edge function logs.",
    },
    verdict:
      'The 14,400/day claim fails on every dimension: (1) The legacy learning_cycles engine has been DEAD since Feb 21 — not "always-on." (2) Current vertical CLM runs at 120 cycles/day = 0.83% of the claimed 14,400. (3) Zero rows in ai_learning_data, learning_results, learning_logs, learning_confidence — there is no "knowledge permanently distilled" anywhere queryable. (4) The current CLM engine is actively self-throttling because its own failure rate is 58%. (5) "Operates autonomously without governor" is unsupported — the only running cycles are the 4-hour vertical scheduler. Honest restate: "Vertical CLM scheduler runs ~120 cycles/day at a 42% success rate. Legacy CLM engine has been offline since February 2026."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-029',
    title: 'CLM is currently self-throttling — substrate edge function reports 58% failure rate',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/09-founder-intent.md',
      quote:
        '"Learning is continuous. CLM is a foundational property, not optional. The substrate must always be learning."',
    },
    evidence: {
      reality:
        'Live edge function pf-clm-engine log (timestamp 2026-04-18T02:40:08Z): "Cycle #39: 3 AI calls in 7343ms" immediately followed by "Auto-chain skipped — failure rate 58% too high." Cycle counter shows only 39 chained cycles have completed in this engine instance — and the chain is currently halted by its own circuit breaker.',
      method:
        'Direct read of pf-clm-engine edge function logs. Cross-checked with empty ai_learning_data, learning_results, learning_logs, learning_confidence tables.',
    },
    verdict:
      '"CLM is foundational, must always be learning" is contradicted by the engine itself, which auto-disables when failures exceed threshold. The system is honest enough to throttle when broken — but the docs claiming "always learning" are not honest about the current state. The right framing: "CLM has a circuit breaker that fires when failure rate exceeds 50% — currently tripped at 58%."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-030',
    title: 'Evolution Engine "166 bugs fixed for $0.06 / 340 cycles" is unsupported by database',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/11-evolution-engine.md (§1, §3, §6)',
      quote:
        '"Over 340 controlled evolution cycles, the system found and fixed 166 real production bugs in its own codebase for a total cost of $0.06 ... 166 unique patches applied to production substrate files across five categories."',
    },
    evidence: {
      reality:
        'evolution_proposals: 34 total rows (not 340), 0 applied, 19 approved, 13 rejected, 2 rolled_back. evolution_runs: 31 rows. evolution_receipts: 0 rows. evolution_snapshots: 0 rows. system_diffs: 7 rows. system_snapshots: 23 rows. modernizer_outputs: 0. modernizer_analytics: 0. modernizer_reports: 0. modernizer_autonomy_log: 0. No table contains evidence of 166 applied patches or 340 cycles. Activity range: 2026-02-02 → 2026-03-06 (stopped over 6 weeks ago).',
      method:
        'SELECT counts and date ranges from evolution_proposals, evolution_runs, evolution_receipts, evolution_snapshots, system_diffs, system_snapshots, modernizer_* tables.',
    },
    verdict:
      'The investor doc inflates real numbers by ~10x (34 proposals → "340 cycles") and claims 166 applied patches when production shows ZERO applied. The engine ran a small batch in Feb–early March, then stopped. "Continuous evolution" and "$0.06 cost" cannot be verified from any table. This is the highest-stakes fabrication in the audit so far — it appears in an investor-facing document.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-031',
    title: 'SEBA 7-gate pipeline and TSAC have no operational evidence',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/04-evolution-seba.md (§3, §4)',
      quote:
        '"Every change must pass all 7 gates ... Minimum 10 shadow cycles required before promotion eligibility ... TSAC ensures evolution candidates preserve system truth."',
    },
    evidence: {
      reality:
        'Zero shadow_runs / TSAC / SEBA tables exist in the schema. evolution_receipts (which would record gate passes) is empty. evolution_snapshots (rollback substrate) is empty. evolution_repair_log is empty. evolution_entropy_ledger is empty. evolution_pre_metrics is empty. The 19 "approved" proposals never advanced to applied — meaning no gate-passage records exist for any production promotion.',
      method:
        'Schema scan for shadow/seba/tsac tables; row counts on evolution_receipts, evolution_snapshots, evolution_repair_log, evolution_entropy_ledger, evolution_pre_metrics.',
    },
    verdict:
      'The 7-gate SEBA + TSAC pipeline is documented in detail but leaves no operational footprint. Either the gates run in-memory and discard receipts (contradicting "auditable transitions"), or the pipeline never actually executed in production. Either way, the "validated, auditable" claim is unsupported.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-032',
    title: 'DREAM "every idle cycle" runs at ~0 cycles/day in production',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/14-dream-engine.md (§3, §4)',
      quote:
        '"20 agents compounding across every idle cycle ... DREAM | Every idle cycle | Cross-agent intelligence synthesis."',
    },
    evidence: {
      reality:
        'dream_cycle_logs has 7 rows total — all stamped 2026-01-21 (a single day, 3 months ago). dream_sessions: 0 rows. dream_log: 0 rows. dream_stream: 3 rows, frozen since 2026-02-11. There has been no DREAM cycle activity in production for ~9 weeks. The "every idle cycle" cadence is not occurring.',
      method:
        'Row counts and min/max(created_at) across dream_cycle_logs, dream_sessions, dream_log, dream_stream, dream_eater_audit, node_dream_log.',
    },
    verdict:
      'The investor doc claims continuous idle-time consolidation across a 20-agent fleet. The database shows the engine has been silent since February. The "compounding while investors sleep" narrative is not currently true.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-033',
    title: 'Synthetic Intuition Engine has zero artifacts in any DREAM table',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/14-dream-engine.md (§2a Crown Jewel)',
      quote:
        '"Fragment Collection ... Resonance Amplification ... Bias Injection ... CJPI Score: Novelty 98 · Complexity 96 · Total 90 — the highest novelty score in the entire substrate."',
    },
    evidence: {
      reality:
        'dream_artifacts: 0 rows. dream_archaeology: 0 rows. dream_learning_metrics: 0 rows. agency_dream_pool: 0 rows. agency_dream_memory: 0 rows. No "intuition vector", "resonance", "fragment", or "bias injection" column exists in any dream_* table. There is no schema-level evidence the three-layer Synthetic Intuition Engine was ever wired to storage.',
      method:
        'Row counts on every dream_* and agency_dream_* table; information_schema column scan for intuition/resonance/fragment/bias terms.',
    },
    verdict:
      'The single highest-novelty Crown Jewel in the investor pack (CJPI 90, "Novelty 98") has no production footprint. The architecture exists in src/lib/dream/* code (heuristicBuilder, semanticDrift, lineageTracker, consolidationOrchestrator) but never wrote a single row. Pre-conscious emergence is, at present, unverified theater.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-034',
    title: 'CLM "14,400 calls/day" reaffirmed alongside DREAM doc — both inactive',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/investors/14-dream-engine.md (§4 Moat Contribution table)',
      quote:
        '"CLM | 14,400 training calls/day | Permanent knowledge distillation. Memory Stream | Every 8 hours | New pipeline discoveries. DREAM | Every idle cycle | Cross-agent intelligence synthesis."',
    },
    evidence: {
      reality:
        'All three "compounding engines" are presented as live in the same investor table. Production reality: CLM is throttled (logs: "Auto-chain skipped — failure rate 55% too high", reduced to 1 cycle/burst — see F-028/F-029). DREAM dormant since Feb (F-032). Memory Stream / discoveries table has no inserts in the last 5+ days outside the recent backfill window. Three "parallel compounding engines" are in fact zero currently compounding.',
      method:
        'Cross-reference of pf-clm-engine edge function logs (2026-04-18) with dream_cycle_logs and discoveries created_at distribution.',
    },
    verdict:
      'The "moat widens while investors sleep" claim depends on three engines running. On the date this audit was performed, none of the three were running at the documented cadence. The moat is not currently widening — it is paused.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-035',
    title: '"200,000+ lines of production code" overstates the codebase by ~4x',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/01-executive-summary.md (§Key Numbers)',
      quote: '"Production code | 200,000+ lines"',
    },
    evidence: {
      reality:
        '`find src -name "*.ts" -o -name "*.tsx" | xargs wc -l` returns 51,489 total lines across the entire src tree (including tests, types, and generated files). Even adding edge functions and supabase migrations, the codebase is well under 100k lines.',
      method: 'wc -l on every .ts/.tsx file under src/.',
    },
    verdict:
      'Investor doc inflates the codebase ~4x. 51k lines is a respectable solo-founder codebase; the inflated number undermines credibility unnecessarily.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-036',
    title: '"60+ production database tables" understates by 7x',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/investors/01-executive-summary.md, 05-engineering-proof.md',
      quote: '"Database tables | 60+ production tables"',
    },
    evidence: {
      reality:
        'information_schema.tables shows 442 BASE TABLEs in the public schema. The real number is 7x larger than claimed. Whether all 442 are "production" is a separate question — many are empty per prior findings (F-007, F-018, F-031).',
      method: "SELECT count(*) FROM information_schema.tables WHERE table_schema='public'.",
    },
    verdict:
      'The "60+" claim is technically satisfied by 442 but radically understates scale. Combined with empty-table findings, the honest framing would be "442 tables exist, ~X actively populated."',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-037',
    title: '"Paying subscribers reaching Stripe checkout" — there are zero paying subs',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/01-executive-summary.md (§Traction)',
      quote: '"Paying subscribers reaching Stripe checkout"',
    },
    evidence: {
      reality:
        'access_subscriptions: 4 rows tier=free/status=active, 1 row tier=enterprise/status=active. Zero rows at the paid tiers documented in the same doc (Studio $29, Creator $49, Architect $79). The single enterprise row appears to be an internal grant, not a paying customer.',
      method: 'SELECT tier, status, count(*) FROM access_subscriptions GROUP BY tier, status.',
    },
    verdict:
      'The traction claim implies revenue is starting. The database shows zero paying subscribers exist. "Reaching checkout" without converting is a funnel event, not traction.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-038',
    title: '"230 returning visitors in last 30 days" — actual count is 28',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/01-executive-summary.md (§Traction)',
      quote: '"230 returning visitors in last 30 days"',
    },
    evidence: {
      reality:
        'Counting analytics_events sessions with activity on 2+ distinct days in the last 30 days returns 28. Total distinct sessions in 30 days: 5,280. The "230 returning" claim is overstated ~8x against the most generous interpretation of returning behavior.',
      method:
        "SELECT count(*) FROM (SELECT session_id FROM analytics_events WHERE created_at > now() - interval '30 days' GROUP BY session_id HAVING count(DISTINCT date_trunc('day',created_at)) > 1).",
    },
    verdict:
      'The traction section uses a number 8x larger than what the analytics_events table supports. Real engagement is small but honest; the inflated number creates audit risk in any diligence call.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-039',
    title: '"$2.9M per Memory Stream discovery" — no valuation column exists',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/20-why-invest-now.md (§1, §2)',
      quote:
        '"Memory Stream produces pipeline artifacts valued at up to $2.9M per discovery, already in service, running every 8 hours."',
    },
    evidence: {
      reality:
        'The discoveries table has 10,266 rows but no column named valuation, value, market_value, price, or worth_usd. There is no source-of-truth for the "$2.9M" figure anywhere in the schema. The number appears only in marketing prose, not in any computed or stored data.',
      method: 'information_schema.columns scan on discoveries; metadata JSON inspection.',
    },
    verdict:
      'A specific dollar figure attached to a per-unit output, repeated twice in the same investor document, with no underlying calculation or stored value. Textbook fabricated traction metric.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-040',
    title: '"166 bugs auto-fixed for $0.06" — evolution_proposals shows zero applied',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/20-why-invest-now.md (§2, §3)',
      quote:
        '"166 bugs auto-fixed for $0.06 ... Capital efficient — $0.06 for 166 bug fixes demonstrates extreme efficiency."',
    },
    evidence: {
      reality:
        'evolution_proposals: 34 total rows, 0 applied, 19 approved, 13 rejected. evolution_receipts: 0 rows. No table tracks "bugs fixed." The $0.06 cost figure has no source row in ai_usage_log filtered to evolution-related calls (most evolution work was throttled per F-029).',
      method: 'evolution_proposals.status counts; evolution_receipts row count; ai_usage_log filter.',
    },
    verdict:
      'Same fabrication as F-030, but elevated to the "Why Invest Now" pitch. The headline "$0.06 for 166 fixes" appears as a bullet in the investment thesis. Zero of those 166 fixes can be substantiated.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-041',
    title: '"675+ registered capabilities" and "500+ terminal commands" unverifiable',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/investors/01-executive-summary.md, 05-engineering-proof.md',
      quote: '"Registered capabilities | 675+", "Terminal commands | 500+"',
    },
    evidence: {
      reality:
        'No database table named capabilities, capability_registry, terminal_commands, or commands exists in the public schema. The numbers may be derived from a code-side registry, but they are not introspectable from production data. The doc-05 footnote defines "capability" in terms unfalsifiable without an authoritative list.',
      method: 'information_schema scan for capability/command tables.',
    },
    verdict:
      'Not necessarily false — but not auditable. Investor diligence will ask "show me the 675" and there is no canonical answer. Either publish the list or remove the specific number.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-042',
    title: '"Merkle audit chain" cited as proof — production chain has 12 rows',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/investors/05-engineering-proof.md (§3, §5)',
      quote:
        '"Merkle chain bounded at 10,000 entries ✅ ... Every autonomous change recorded in SHA-256 hash chains. Call verifyChain() to confirm integrity."',
    },
    evidence: {
      reality:
        'activation_audit_log (the closest production hash-chain table) has 12 rows total. evolution_receipts: 0. No production table holds a chain remotely close to the 10,000 bound. The verifyChain() function may exist in code but has almost nothing of operational scale to verify.',
      method: 'Row count on activation_audit_log, evolution_receipts; schema search for merkle/hash_chain tables.',
    },
    verdict:
      'The mechanism exists in code; the operational footprint (12 rows) reveals it has barely been exercised. The implication of a battle-tested tamper-evident audit trail is unsupported.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-043',
    title: '"90+ languages" export claim contradicted by code and own docs',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/01-executive-summary.md, 02-technology-architecture.md, 09-defensible-valuation.md, 12-ascension-product-factory.md, public/ascension-user-guide.md',
      quote:
        '"single-file, zero-dependency, IP-protected artifact in 90+ languages (18 software + 7 HDL + GPU/blockchain/quantum/robotics)" — repeated across 10+ investor and public docs. Same investor pack also states: "Export languages: 25 (18 software, 7 HDL)."',
    },
    evidence: {
      reality:
        'src/lib/ascension-v2/ contains ZERO emitter directories. The only language strings found in the v2 pipeline are 10 software languages (typescript, javascript, python, rust, go, java, csharp, kotlin, swift, scala) used as classification tokens — not full code emitters. No GLSL, WGSL, VHDL, Verilog, CUDA, Solidity, Move, Cairo, Qiskit, Cirq, Q#, Quil, ROS2, or PX4 emitter is present in the active pipeline. The "90+" figure has no production basis; even the "25" figure (18+7) cannot be substantiated by code.',
      method: 'find src/lib -path "*emitter*" → 0 results. grep for hardware/GPU/blockchain/quantum language tokens in src/lib/ascension-v2/ → none.',
    },
    verdict:
      '"90+ languages" is the single most-repeated claim in the investor pack. The codebase ships with at most 10 software languages as classification labels and no working hardware/GPU/blockchain/quantum emitters. Two contradictory numbers (25 vs 90+) appear in the same document set, both unverified.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-044',
    title: 'Ascension production pipeline has 2 lifetime runs',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/12-ascension-product-factory.md, 10-ascension-demo-script.md',
      quote:
        '"Already built. Already functional." · "self-compounding software factory ... discovers, builds, compiles, prices, and sells software products"',
    },
    evidence: {
      reality:
        'The only Ascension session tables in the database are cli_ascension_sessions (2 rows total) and vertical_ascension_sessions (1 row). No ascension_runs, ascension_exports, or ascension_artifacts tables exist. No production export has produced a sellable artifact tracked in the database.',
      method: 'SELECT COUNT(*) on cli_ascension_sessions, vertical_ascension_sessions; information_schema scan for ascension_* tables.',
    },
    verdict:
      '3 total Ascension sessions across all surfaces is not a "software factory." The pipeline runs in code; it has not been exercised at any meaningful scale.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-045',
    title: '"Silent Software Symbiosis" patent product has zero registry footprint',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/investors/21-mana-the-real-product.md, 22-fear-equals-free-advertising.md, internal/22-mana-lex-e2e-architecture.md',
      quote:
        '"Mana is the Silent Software Symbiosis Engine ... U.S. Patent App. No. 64/031,637" · "the only reliable defense: the Lex Registry and the Shield" · "Lex Blacklist registration ... 100% qualified"',
    },
    evidence: {
      reality:
        'lex_registry: 0 rows. lex_registry_events: 0 rows. lex_registry_public: exists but empty. No mana_attachments, mana_sessions, or symbiosis_* tables exist. The "fear equals free advertising" thesis depends on demonstrated attachments; none are recorded.',
      method: 'SELECT COUNT(*) on lex_registry, lex_registry_events; information_schema scan for mana_*, symbios*, attach* tables.',
    },
    verdict:
      'The Mana/Lex/Shield trio is positioned as the patent-protected "real product" that markets itself through fear. With zero registry entries and zero attachment records, the marketing flywheel has nothing to spin on.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-046',
    title: '"Self-compounding software factory" claim has no compounding evidence',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/compounding-autonomy-specification.md, flywheel-operations-guide.md',
      quote:
        '"The CMPSBL® substrate is a self-compounding software factory. It autonomously discovers, builds, compiles, prices, and sells software products — without human intervention" · "you\'re literally discovering new software products while you sleep"',
    },
    evidence: {
      reality:
        'Cross-referenced with prior findings: Memory Stream silent (F-008), DREAM silent ~9 weeks (F-032), CLM auto-throttled with 55% failure rate (F-034), Evolution 0 applied / activity ceased 2026-03-06 (F-030), Ascension 3 lifetime runs (F-044), Lex registry empty (F-045). Every engine the "compounding" thesis depends on is stalled or empty.',
      method: 'Aggregate of F-008, F-030, F-032, F-034, F-044, F-045.',
    },
    verdict:
      'The "factory while you sleep" narrative requires at least one engine to be running. None are. This is the load-bearing investor claim and it is currently unsupported.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-047',
    title: '"World\'s first cognitive substrate" is unverifiable and category-confused',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/roadmaps/cmpsbl-master-roadmap-2026-2028.md (line 780), internal/18-vertical-ecosystem.md (line 12)',
      quote:
        '"✅ World\'s first cognitive substrate" (listed as already-documented achievement) · "CMPSBL® is the world\'s first Software Refurbishment & Cognitive Infrastructure Factory"',
    },
    evidence: {
      reality:
        'No publication, patent citation, or third-party recognition supports the "world\'s first" framing. Web search for "cognitive substrate" returns prior-art philosophy/ML papers (Bostick 2025, CODES Intelligence) using the exact term. "Software Refurbishment" is a long-established industry term (t2informatik smartpedia). The "factory" pattern is occupied (Cognizant AI Factory). No Zenodo/OSF record is cited next to the ✅.',
      method: 'Web search for "cognitive substrate" and "software refurbishment" — both terms have established prior usage. The roadmap marks ✅ without an evidence link.',
    },
    verdict:
      'Marking "world\'s first" as ✅ documented without a citation is self-attestation, not documentation. Both anchor terms have prior art findable in a single search.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-048',
    title: 'Roadmap simultaneously claims silicon pipeline is achieved and still-achievable',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/roadmaps/cmpsbl-master-roadmap-2026-2028.md (lines 754-763 vs 779-789)',
      quote:
        '"World Firsts Still Achievable: ... First deterministic-to-silicon pipeline" (line 760) — and on line 784: "✅ Software-to-silicon pipeline (HDL export)"',
    },
    evidence: {
      reality:
        'The same document lists silicon export as both an unachieved world-first and an already-documented achievement. Cross-ref F-043 confirms zero HDL/VHDL/Verilog emitters exist in src/lib/ascension-v2/. "First autonomous software factory" depends on engines that are silent (F-008, F-044). "First self-evolving codebase" depends on Evolution which has 0 applied proposals and ceased 2026-03-06 (F-030).',
      method: 'Diff between achievable list (lines 754-763) and achieved list (lines 779-789) in the same roadmap file; cross-reference with F-008, F-030, F-043, F-044.',
    },
    verdict:
      'A roadmap that contradicts itself within 30 lines is not a credibility document. Neither the "achieved" nor the "achievable" framing is supported by code or database evidence.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-049',
    title: '"20 sealed-runtime agents" is overstated — registry holds 14',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/investors/09-defensible-valuation.md (§3.4, line 81) · 01-executive-summary.md (line 33)',
      quote:
        '"Agent count: 20 sealed-runtime agents" · "Cognitive agents: 20 sealed-runtime agents"',
    },
    evidence: {
      reality:
        'cognitive_registry contains 14 rows, not 20. substrate_agents: 0 rows. cognitive_orders: 0 rows (no agent has ever been purchased). The "$3–5M raw value · $2–4M risk-adjusted" line item in the valuation table is therefore based on an inflated unit count and zero commercial traction.',
      method: 'SELECT count(*) FROM cognitive_registry, substrate_agents, cognitive_orders.',
    },
    verdict:
      'Two investor docs cite "20 agents" as a load-bearing valuation input. Database shows 14 registered, 0 sold. The headline number is wrong and the supporting marketplace is empty.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-050',
    title: '"54 Crown Jewel algorithms" valued at $5–10M have zero artifact-registry footprint',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/09-defensible-valuation.md (§3.5, §4, §7, line 96, 158, 249)',
      quote:
        '"Crown Jewels: 54 governor-only capabilities" · "54 Crown Jewel algorithms · Raw $5–10M · Risk-Adjusted $3–7M" · "Algorithm IP: 54 Crown Jewels, sealed and classified · Cannot be accessed"',
    },
    evidence: {
      reality:
        'artifact_registry: 199 total artifacts across 6 categories, 0 rows match tier/category ILIKE %crown% or %jewel%. There is no crown_jewels table in the public schema. The "sealed and classified, cannot be accessed" framing is consistent with there being no database evidence of their existence.',
      method: "SELECT count(*) FROM artifact_registry WHERE tier ILIKE '%crown%' OR category ILIKE '%crown%' OR category ILIKE '%jewel%'; information_schema scan for crown_*/jewel_* tables.",
    },
    verdict:
      'A $3–7M risk-adjusted line item should leave a database trace. None exists. "Sealed and classified" is not a substitute for evidence — at minimum a count, hash registry, or version manifest would be expected.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-051',
    title: 'Defensible-valuation doc relies on "90+ language export" already shown to be 0',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/09-defensible-valuation.md (§3.8, line 143, line 274)',
      quote:
        '"Export targets: 90+ languages (software, HDL, GPU, blockchain, quantum & robotics)" · "Universal Export (90+ languages) · Raw $15–30M · Risk-Adjusted $11–21M"',
    },
    evidence: {
      reality:
        'Cross-ref F-043: src/lib/ascension-v2/ contains 0 emitter directories and 10 software language tokens used only for classification. Cross-ref F-044: Ascension has 3 lifetime runs across cli_ascension_sessions + vertical_ascension_sessions. The $11–21M risk-adjusted "Universal Export" line item is built on a capability that has not shipped.',
      method: 'Aggregate of F-043 (emitter inventory) and F-044 (run counts) applied to the §3.8 / §7 valuation rows.',
    },
    verdict:
      'The valuation document monetizes the same "90+ languages" claim that the codebase contradicts. Removing this row alone collapses the ceiling estimate by $11–21M.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-052',
    title: '"$2.9M per discovery, every 8 hours" has no scoring evidence in DB',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/20-why-invest-now.md (lines 10, 18)',
      quote:
        '"Memory Stream produces pipeline artifacts valued at up to $2.9M per discovery, already in service, running every 8 hours" · "Memory Stream ($2.9M per discovery, already in service, running every 8 hours)"',
    },
    evidence: {
      reality:
        'artifact_registry: 199 rows total, 0 rows with metadata->>cjpi populated (max_cjpi is NULL). No valuation column, no CJPI scoring column anywhere queryable. Cross-ref F-008: Memory Stream silent. The "$2.9M" figure has no record in any table — neither as a stored valuation, a CJPI threshold derivation, nor a discovery event.',
      method: "SELECT max((metadata->>'cjpi')::numeric), count(*) WHERE metadata->>'cjpi' IS NOT NULL FROM artifact_registry; aggregate with F-008.",
    },
    verdict:
      'A specific dollar figure repeated twice on the lead investor doc should resolve to a stored value or a documented formula. Neither exists in the database. The 8-hour cadence is also contradicted by F-008.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-053',
    title: '"166 bugs auto-fixed for $0.06" has 0 applied evolution proposals',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/20-why-invest-now.md (line 19), 09-defensible-valuation.md (line 303)',
      quote:
        '"Validated · 166 bugs auto-fixed for $0.06, ENCODE 100% apply rate" · "Evolution cost per bug fixed: ~$0.00036"',
    },
    evidence: {
      reality:
        'evolution_proposals: 34 total rows, 0 with status=applied. The "100% apply rate" therefore divides by zero applied, and "166 bugs fixed" is unrepresented in the proposal ledger. The $0.00036/bug unit-economics row in the valuation doc is derived from $0.06 / 166 — both inputs fail to verify.',
      method: 'SELECT count(*) FROM evolution_proposals WHERE status=applied (=0). Cross-ref F-030 (Evolution activity ceased 2026-03-06).',
    },
    verdict:
      'The most-quoted "validation" stat in the why-invest-now doc and the unit-economics row in the valuation doc both rest on a number with no database trace. Apply rate is mathematically undefined when zero proposals have been applied.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-054',
    title: 'Floor valuation $23–51M premised on engines/agents that have not transacted',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/06-ip-defensibility.md (§3, lines 63-76)',
      quote:
        '"Crown Jewel algorithm corpus · 356+ sealed algorithms across 12 verticals · $5–12M" · "Sealed agent architecture · 20 agents with DREAM · $2–4M" · "Mana/Lex attachment engine · Two filed patents · $5–11M" · "Combined Floor · $23–51M"',
    },
    evidence: {
      reality:
        'Aggregate disconfirming evidence from prior findings and current DB: cognitive_orders=0, agency_purchases (completed)=1, access_subscriptions (active)=5, access_usage cost over last 90 days=$0.00, lex_registry=0 (F-045), cognitive_registry=14 not 20 (F-049), 0 crown-tier rows in artifact_registry (F-050), 3 lifetime Ascension runs (F-044). The "356+ sealed algorithms across 12 verticals" has no enumeration in the public schema. The "$23–51M floor" is built on seven line items, none of which carries a transactional or registry footprint.',
      method: 'Aggregate of F-008, F-030, F-032, F-034, F-044, F-045, F-049, F-050, F-051 plus current DB sums (cognitive_orders, agency_purchases, access_subscriptions, access_usage).',
    },
    verdict:
      'A floor valuation should survive when each input is independently verified. Every one of the seven IP line items either contradicts the database or has no database trace at all. With $0 in 90-day usage revenue and 5 active subscriptions, the floor is not defensible at the stated range.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-055',
    title: '"Mid-Range $42–60M" line items have no marketplace transactions',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/09-defensible-valuation.md (§7, lines 257-264) · internal/11-defensible-valuation.md (lines 257-262)',
      quote:
        '"SaaS subscription model (4 tiers) · $7–14M" · "Agent marketplace (20 agents) · $4–7M" · "Engine marketplace (54 engines) · $6–11M" · "CDM + Memory Stream corpus · $4–7M" · "Mid-Range Total · $42–60M"',
    },
    evidence: {
      reality:
        'Database snapshot: access_subscriptions total=5, all 5 active, 0 trialing. cognitive_orders=0 (agent marketplace has zero transactions). agency_purchases total=1, completed revenue=$0.00. access_usage cost over last 90 days=$0.00. The "CDM + Memory Stream corpus" valuation cross-references F-008 (silent) and F-052 ($2.9M/discovery has no DB scoring). Four of four mid-range line items lack the underlying volume.',
      method: 'SELECT count and sum on access_subscriptions, cognitive_orders, agency_purchases, access_usage; cross-ref F-008, F-049, F-051, F-052.',
    },
    verdict:
      'A mid-range valuation built on "marketplace" line items requires a marketplace with throughput. Five active subscriptions and zero agent orders do not support the $42–60M risk-adjusted band.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-056',
    title: '"Ceiling $132–268M" includes $35–105M Ascension line — 3 lifetime runs',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/investors/09-defensible-valuation.md (§7, lines 268-277)',
      quote:
        '"Ascension (software evolution) · $35–105M" · "Universal Export (90+ languages) · $11–21M" · "Category creation premium · $21–56M" · "Compounding data moat (CLM + CDM) · $14–35M" · "Ceiling Total · $132–268M"',
    },
    evidence: {
      reality:
        'Aggregate cross-ref: Ascension has 3 lifetime sessions across cli_ascension_sessions + vertical_ascension_sessions (F-044). Universal Export has 0 emitter directories (F-043, F-051). CLM is auto-throttled with 55% failure rate (F-034). CDM/Memory Stream is silent (F-008). "Category creation" is contested by published prior art on "cognitive substrate" (F-047). Every component of the ceiling stack has a finding against it.',
      method: 'Aggregate of F-008, F-034, F-043, F-044, F-047, F-051; ceiling-row cross-walk.',
    },
    verdict:
      'A ceiling valuation should be the most-aggressive case where every engine is delivering. Here every engine is silent, throttled, or empty. The $132–268M risk-adjusted ceiling is unsupported by every load-bearing input simultaneously.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-057',
    title: '"Series A readiness $200K/month" target vs. current $0 90-day revenue',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/roadmaps/cmpsbl-master-roadmap-2026-2028.md (line 260) · investors/20-why-invest-now.md (lines 33, 39)',
      quote:
        '"Goal: $200,000/month. Series A readiness. Team of 5–8" · "Massive TAM — $35B+ addressable market with no direct competitor" · "Seed funding to accelerate go-to-market"',
    },
    evidence: {
      reality:
        'Current state: 5 active subscriptions, 0 cognitive (agent) orders, 1 agency purchase with $0.00 completed revenue, 7 distinct authenticated users in last 30 days, $0.00 in access_usage cost over the last 90 days. Distance to the $200K/month goal: ~$200,000 from current run-rate. The $35B TAM number has no citation in the doc despite being marked "see Document 11, Section 07".',
      method: 'SELECT counts/sums on access_subscriptions, cognitive_orders, agency_purchases, auth_events, access_usage. Verified roadmap line 260 vs. why-invest-now lines 33-39.',
    },
    verdict:
      'A Series A readiness target requires a credible path from current MRR to $200K/month. With 5 active subs and $0 in 90-day usage revenue, the gap is the entire goal. The TAM citation is also a forward-reference to a section that does not derive the $35B number.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-058',
    title: '"8-hour DREAM synthesis runs" — 7 lifetime cycles, last on 2026-01-21',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/convergence/09-defensibility-playbook.md (line 19), cmpsbl-system-architecture-exposure-specification.md (line 349), 18-vertical-ecosystem.md (line 12)',
      quote:
        '"14,400 CLM observations per day, and 8-hour DREAM synthesis runs" · "DREAM synthesis contributions · Requires Memory Stream data and 8-hour autonomous cycle completion" · "Zero AI in DREAM synthesis. Pure algorithmic cognitive infrastructure"',
    },
    evidence: {
      reality:
        'dream_cycle_logs: 7 rows total lifetime, 0 in the last 30 days, last_cycle = 2026-01-21 (≈87 days stale at audit time). dream_artifacts: 0. dream_sessions: 0. dream_log: 0. An "8-hour cycle" cadence over the project lifetime would produce thousands of entries; 7 is a single day of cycles, not a continuous engine.',
      method: 'SELECT count(*), max(created_at) on dream_cycle_logs, dream_artifacts, dream_sessions, dream_log.',
    },
    verdict:
      'Multiple docs anchor the "8-hour autonomous synthesis" cadence as a load-bearing claim. The cadence is not running. There is no synthesis output stored, and the cycle log itself stopped on 2026-01-21.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-059',
    title: '"126 SynthesisTemplates" claim has no schema or row evidence',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/flywheel-operations-guide.md (line 139)',
      quote:
        '"Processes all 126 SynthesisTemplates from the Reactor"',
    },
    evidence: {
      reality:
        'information_schema scan for tables matching %synth% returns zero results in the public schema. There is no synthesis_templates, dream_synthesis, or reactor_templates table. The "126" figure does not resolve to any queryable artifact, registry row, or code constant in src/lib that enumerates templates.',
      method: "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name ILIKE '%synth%' (=0 rows).",
    },
    verdict:
      'A flywheel guide that quotes a specific count ("126") for templates "processed" by the system should resolve to either a database table or a code enumeration. Neither exists.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-060',
    title: '"Memory chains incl. KNOWLEDGE_SYNTHESIS, CAUSAL_SYNTHESIS, LINGUA_SYNTHESIS" lack execution records',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/13-primary-memory-chains.md (lines 58, 132, 175, 182)',
      quote:
        '"19 · KNOWLEDGE_SYNTHESIS · BRAIN → MEMORY → FORGE → ATLAS" · "56 · CAUSAL_SYNTHESIS · FORGE → BRAIN → DREAM → CORTEX" · "90 · LINGUA_SYNTHESIS" · "97 · MEMORY_TRANSCENDENCE"',
    },
    evidence: {
      reality:
        'dream_log: 0 rows. dream_sessions: 0 rows. dream_artifacts: 0 rows. cascade_dreams: 17 rows total (no per-chain attribution visible in name). The "100+ automated multi-primitive workflows" claim from staff/01-what-youre-building.md depends on these chains executing — they have no recorded executions in any synthesis-output table.',
      method: 'SELECT count(*) on dream_log, dream_sessions, dream_artifacts, cascade_dreams; cross-ref staff/01 line 99 ("100+ memory chains").',
    },
    verdict:
      'The chain catalog (90+ named chains incl. 4 explicitly named *_SYNTHESIS) reads as scaffolding. There is no execution ledger that records which chain ran, when, with what result. Cascade_dreams holds 17 rows total — far below "100+ automated workflows".',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-061',
    title: 'Governance "Decision Authority Matrix" has zero approval traffic',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/02-governance-authority.md (§3 Decision Authority Matrix, §2 Autonomy Levels)',
      quote:
        '"Supervised — System proposes, you approve" · "Mutation with confidence 0.85–0.94 → Governor Required (review)" · "Evolution pipeline reset → Governor Required" · "Governance policy change → Governor Required"',
    },
    evidence: {
      reality:
        'governance_transition_approvals: 0 rows lifetime. evolution_proposals: 34 rows (13 rejected, 21 approved/rolled_back, 0 pending), but 0 are in status="applied" — confirming F-053. Last evolution_proposal recorded 2026-03-06 (~43 days stale). The "Governor approval" workflow described in §3 has never been exercised against the approvals table.',
      method: 'SELECT count(*) FROM governance_transition_approvals; SELECT status, count(*) FROM evolution_proposals GROUP BY status; SELECT max(created_at) FROM evolution_proposals.',
    },
    verdict:
      'The decision matrix exists as documentation and the governance_mode singleton reads "ACTIVE", but the approvals queue that the matrix routes to is empty. No governor has ever approved or rejected anything through the documented surface — every "approved/rejected" proposal was state-flipped without a corresponding approval record.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-062',
    title: 'AUDIT immutability + Merkle chain claim has no anchor records',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/09-founder-intent.md (§2 Non-Negotiables #1) + 02-governance-authority.md (§5 Red Lines #5)',
      quote:
        '"AUDIT is immutable. No code path may delete, modify, or suppress audit records." · "No audit trail tampering — Merkle chain integrity is sacrosanct."',
    },
    evidence: {
      reality:
        'audit_chain_anchors: 0 rows lifetime. The table that anchors the Merkle chain head hash (the mechanism that makes "tamper-evidence" verifiable) has never been written to. audit_logs has 78 rows total / 64 in last 30 days — but with no anchors, there is no cryptographic chain to verify integrity against. The "Merkle chain integrity" red line protects a chain that does not exist on-disk.',
      method: 'SELECT count(*) FROM audit_chain_anchors; SELECT count(*) FROM audit_logs.',
    },
    verdict:
      'AUDIT writes happen, but the tamper-evidence layer described in two separate Governor-Eyes-Only documents is unbacked. A claim of "immutable + Merkle-anchored" requires anchors. Zero anchors = the immutability guarantee is documentation, not enforcement.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-063',
    title: 'Governance modes (OBSERVE/LOCKDOWN/EVOLVE) have never transitioned',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/02-governance-authority.md (§4 Governance Modes)',
      quote:
        '"ACTIVE → OBSERVE (manual)" · "ACTIVE → LOCKDOWN (manual or automatic on critical alert)" · "ACTIVE → EVOLVE (manual, requires your confirmation)" · "LOCKDOWN → ACTIVE (manual, requires health verification)"',
    },
    evidence: {
      reality:
        'governance_mode: 1 row, value "ACTIVE". governance_transition_approvals: 0 rows. The pf-substrate edge function reports {"mode":"ACTIVE"} on every call. There is no recorded transition into or out of OBSERVE, LOCKDOWN, or EVOLVE — meaning the four-mode state machine has only ever occupied one state in production.',
      method: 'SELECT * FROM governance_mode; SELECT count(*) FROM governance_transition_approvals; pf-substrate {module:"governance",action:"status"}.',
    },
    verdict:
      'A documented four-mode governance state machine that has never left its default state is a static flag, not a state machine. The OBSERVE/LOCKDOWN/EVOLVE branches are scaffolded but unexercised — including the "automatic on critical alert" LOCKDOWN trigger that should have fired at least once given 13 rejected evolution proposals.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-064',
    title: '"8+ Zenodo DOIs / 6 OSF projects / 19+ specification files" inflated ~5×',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/patents/kenneth-e-sweet-jr-story.html (lines 593, 616-618) + src/pages/InvestorsPublic.tsx ("14 documented world firsts with Zenodo DOI deposits")',
      quote:
        '"8+ Zenodo DOIs · 6 OSF Projects · 1 Patent Filed" · "19+ specification files covering every primitive" · "14 documented world firsts with Zenodo DOI deposits"',
    },
    evidence: {
      reality:
        'Public ORCID API (pub.orcid.org/v3.0/0009-0001-4237-1243/works) returns exactly 6 works total — not 8+ Zenodo + 6 OSF + 19+ specs (~33 implied). Zenodo API search by ORCID identifier returns 0 hits. The 6 actual works: 1 software (Cascade Dream Engine), 1 preprint (Cascade Whitepaper), 1 software (Substrate v5.5.0 docs), 2 reports (AIGVRN v0.3, Governance Lexicon), 1 generic "Technical documentation". No "v13.5 IRONCLAD" appears in the ORCID record.',
      method: 'curl https://pub.orcid.org/v3.0/0009-0001-4237-1243/works | python -c "json...group/length" → 6. Cross-ref with HeritagePaper.tsx and kenneth-e-sweet-jr-story.html.',
    },
    verdict:
      'The public ORCID record contains 6 works. Marketing materials cite 8+/14/19+ across overlapping registries. The numbers are inflated by ~5× when "primitive specifications" are counted as separate publications even though they live inside one or two technical-documentation deposits. The "6 OSF Projects" claim is unverifiable — Zenodo cross-search returns zero ORCID-linked OSF records.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-065',
    title: 'Cited DOI for "v13.5 IRONCLAD Academic Protection Set" resolves to a different title',
    severity: 'FICTION',
    source: {
      document: 'src/pages/HeritagePaper.tsx (line 252, line 912) + src/components/hero/HeroMetaSubstrate.tsx (line 308)',
      quote:
        '"Sweet, K. (2026). CMPSBL v13.5 IRONCLAD Academic Protection Set. Zenodo. doi:10.5281/zenodo.18234909" · "Academic Prior Art — Zenodo v13.5"',
    },
    evidence: {
      reality:
        'curl -L https://doi.org/10.5281/zenodo.18234909 → resolves (HTTP 302 → zenodo.org/records/18895141) to a record titled "CMPSBL Substrate OS: A Cognitive Orchestration System for Autonomous AI Evolution" — NOT "v13.5 IRONCLAD Academic Protection Set". The cited title does not exist at the cited DOI.',
      method: 'curl -sL https://doi.org/10.5281/zenodo.18234909 → grep <title>. Compare to HeritagePaper.tsx line 252 + 912 and HeroMetaSubstrate.tsx line 308.',
    },
    verdict:
      'A defensive-publication citation must match the artifact it cites. This one does not — the DOI is real and resolvable, but the title attached to it in the citation list is fabricated. Anyone clicking through gets a generic Substrate OS overview, not an "Academic Protection Set" establishing prior art for "all core architectural mechanisms".',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-066',
    title: 'No academic-citation monitor exists — the "12-stage pipeline detection" tripwire is unfired',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/convergence/02-magician-model.md (line 103) + 09-defensibility-playbook.md (line 101)',
      quote:
        '"An academic paper correctly identifies the 12-stage pipeline (hasn\'t happened)" · "Watch for: Academic papers that correctly identify the 12-stage pipeline"',
    },
    evidence: {
      reality:
        'Zero database tables track inbound academic citations: information_schema.tables ILIKE %academ%/%research%/%paper%/%citation%/%publication% → all 0. No monitoring code in src/ scrapes Google Scholar, Semantic Scholar, or arXiv for citations of CMPSBL/PromptFluid/AIGVRN. The "watch for" tripwire has no detector implementation.',
      method: "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND name patterns above → 0 rows. grep -r 'scholar\\|arxiv\\|citation' src/ → no monitor.",
    },
    verdict:
      'The convergence playbook claims active monitoring for academic adversaries reverse-engineering the pipeline. No such monitor exists. "Hasn\'t happened" is true by default because nobody is looking. Academic-credibility theater paired with academic-counter-intelligence theater.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-067',
    title: '"Autonomous Decision Authority" (ADA) has zero database persistence — entirely in-memory theater',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/14-autonomous-decision-authority.md (v1.0.0)',
      quote:
        '"7-Gate Pipeline... Verdict (approved/denied/deferred/escalated) with reasoning and audit hash" · "getADAuditLog(100) // Last 100 verdicts" · "trust scores" persisted per node',
    },
    evidence: {
      reality:
        'No tables in public schema match %autonomous%, %ada_%, or %decision_authority% (count = 0). The audit log, trust scores, suspensions, and verdict history live only in process memory and reset on every page reload — there is no durable record of any "autonomous decision" ever being made or audited.',
      method: "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND name ILIKE patterns → 0.",
    },
    verdict:
      'A 7-gate enterprise-grade decision pipeline with audit hashes and trust calibration is documented at v1.0.0, but it persists nothing. Reload the tab and the entire "authority" forgets every verdict, suspension, and trust score. Audit trails that vanish on refresh are not audit trails.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-068',
    title: '"Autonomous evolution" claim contradicted by 0 applied proposals despite 34 generated',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/05-ai-patch-evolution-pipeline.md + module status response',
      quote:
        'EVOLUTION described as autonomously self-patching the substrate; pf-substrate evolution.status reports total_proposals: 34',
    },
    evidence: {
      reality:
        'evolution_proposals contains 34 rows lifetime, but status=\'applied\' returns 0. Zero proposals have ever been autonomously executed. The "autonomous patching" loop generates suggestions and stops — no closure, no application, no measurable evolution.',
      method: "SELECT count(*) FROM evolution_proposals WHERE status='applied' → 0; total → 34.",
    },
    verdict:
      'EVOLUTION proposes but never patches. A self-improving substrate that has applied zero of its 34 self-generated improvements is not autonomous — it is a suggestion box nobody opens.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-069',
    title: 'AutoBlog autonomous engine is partially real — 29 posts in 30 days, but scheduler table is empty',
    severity: 'PARTIAL',
    source: {
      document: 'src/lib/autoblog/autonomous-engine.ts (cadence_minutes loop, runAutonomousCycle)',
      quote:
        '"Self-running, self-learning blog automation" with cadence-driven setInterval and circuit-breaker gating',
    },
    evidence: {
      reality:
        'auto_blog_posts: 103 lifetime, 29 in last 30d, 6 in last 7d, latest <1 day old → genuinely producing content. However, auto_blog_schedule contains 0 rows and agency_scheduled_tasks shows 0 active / 0 run_count, so the "autonomous schedule" is not driven by the documented scheduler table — posts arrive via the in-memory setInterval only while a tab is open.',
      method: 'SELECT count(*) FROM auto_blog_posts WHERE created_at > now() - interval \'30 days\' → 29; auto_blog_schedule → 0; agency_scheduled_tasks active → 0.',
    },
    verdict:
      'AutoBlog is the rare case where "autonomous" is mostly true on output (posts ship) but false on infrastructure (no persistent scheduler). It runs because someone keeps a browser tab open, not because a server-side cron drives it. Real output, fake autonomy mechanism.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-070',
    title: '"Constant Learning Mode" claims 14,400 cycles/day but ai_learning_data table is empty',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/convergence/05-memory-stream-internals.md + 05-memory-data.md §5',
      quote:
        '"CLM runs up to 14,400 cycles per day (one per 6 seconds at maximum)" · "Training records: ai_learning_data with CLM metadata tags" · "Throughput: Up to 14,400 calls/day"',
    },
    evidence: {
      reality:
        'ai_learning_data — the table the doc explicitly names as the CLM training-record store — contains 0 rows lifetime and 0 in the last 30 days. At the documented 14,400 cycles/day rate it should have ~432,000 rows in the last 30 days. Actual: zero.',
      method: "SELECT count(*) FROM ai_learning_data → 0; WHERE created_at > now() - interval '30 days' → 0.",
    },
    verdict:
      'CLM is the headline learning mechanism (and a claimed protected-IP serialization asset). The table that should hold its output is empty. Either CLM has never run a single cycle, or it runs but writes nothing — both readings make the "14,400 cycles/day" figure fiction.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-071',
    title: 'Agent competency "learning" frozen — last update 54 days ago, only 102 lifetime attempts across 15 agents',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/14-autonomous-decision-authority.md (trust calibration via competency)',
      quote:
        'Trust scores "earned through successful outcomes"; agent_competency tracks success_rate, total_attempts, heuristics, EMA-style learning',
    },
    evidence: {
      reality:
        'agent_competency: 15 rows, SUM(total_attempts)=102 lifetime (avg <7 per agent), MAX(updated_at) is 54 days stale. agency_members.total_learning_gain SUMs to 0.0000 across all members. agency_dream_memory (improvement payloads) contains 0 rows.',
      method: 'SELECT SUM(total_attempts) → 102; EXTRACT(day FROM now() - max(updated_at)) → 54; SUM(total_learning_gain) → 0.',
    },
    verdict:
      'The "agents learn from outcomes" loop has been silent for nearly two months. A competency model with 102 total attempts and zero accumulated learning gain is not a learning system — it is a schema. Trust calibration requires data flow that stopped.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-072',
    title: 'Brain knowledge crystallization is genuinely active — 637 crystals in 30 days, latest <1 day old',
    severity: 'FACT',
    source: {
      document: 'docs/libraries/internal/05-memory-data.md (knowledge distillation) + DREAM/Memory Stream specs',
      quote: 'Memory Stream crystallizes high-value patterns into reusable knowledge artifacts',
    },
    evidence: {
      reality:
        'brain_knowledge_crystals: 734 lifetime, 637 created in the last 30 days, max(created_at) is <1 day old. brain_events: 69,106 lifetime across 21 distinct types, 34,259 in the last 7 days. brain_reasoning_traces: 410 lifetime, 195 in the last 7 days. The Brain layer\'s observation→crystallization pipeline is producing measurable, recent output.',
      method: 'count(*) brain_knowledge_crystals 30d → 637; brain_events 7d → 34,259; brain_reasoning_traces 7d → 195.',
    },
    verdict:
      'Recorded as a fact, not a lie: when the docs say the Brain crystallizes patterns continuously, the database confirms it. This is the rare "Learning" claim that survives audit — though it lives in a different pipeline than CLM (F-070) or agent competency (F-071), neither of which back up the same narrative.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-073',
    title: 'CORTEX "Orchestrator" primitive has 1 lifetime audit entry — 0 dispatches in last 7 days',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/15-primitive-specifications.md (Primitive #38: CORTEX "Orchestrator" v9.0.0)',
      quote:
        'CORTEX advertised as the substrate-wide orchestration engine — "dispatch / observe / propose / evaluate / apply / rollback" PAAEL loop, governing all module-to-module dispatch',
    },
    evidence: {
      reality:
        'cortex_audit_log: 1 row lifetime, 0 in the last 7 days. cortex_modes: 1 row (single static mode). cortex_circuit_breakers: 4 rows (initialized, never tripped). The pf-substrate cortex.status response confirms proposals_pending=0, proposals_applied=0, proposals_rejected=0, learn_cycles=0. An orchestrator that has dispatched, evaluated, and applied nothing is not orchestrating.',
      method: 'count(*) cortex_audit_log → 1; 7d → 0; pf-substrate cortex.status → all PAAEL counters = 0.',
    },
    verdict:
      'CORTEX is documented as the central nervous system for primitive coordination. The audit table that should record every dispatch contains a single row. "Orchestrator" with one lifetime audit entry is a name on a diagram, not a runtime.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-074',
    title: 'Cascade orchestration tables empty — cascade_events = 0, substrate_cascade_history = 0, cascade_conversations = 0',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/13-primary-memory-chains.md (v15.1.7 "Chain Orchestrator Guard Layer") + cortex legacy_alias "cascade"',
      quote:
        '"Expanded to 50 chains across 7 categories" with a Guard Layer overseeing chain orchestration; cascade subsystem documented as the multi-primitive workflow engine',
    },
    evidence: {
      reality:
        'cascade_events: 0 lifetime. cascade_conversations: 0 lifetime. substrate_cascade_history: 0 lifetime. The only cascade-adjacent table with rows is cascade_dreams at 17 (the same 17 referenced in F-060). No event stream, no conversation stream, no historical record of any chain execution exists.',
      method: 'SELECT count(*) FROM cascade_events / cascade_conversations / substrate_cascade_history → 0, 0, 0.',
    },
    verdict:
      'The "50 chains across 7 categories" with a Guard Layer protecting orchestration is unbacked by any execution evidence. Three separate tables built to capture cascade activity are all empty. The Guard Layer guards an empty hallway.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-075',
    title: 'brain_orchestrator_state contains a single row — substrate-wide orchestrator is a singleton placeholder',
    severity: 'THEATER',
    source: {
      document: 'Primitive matrix (CORTEX as substrate orchestrator) + brain layer architecture docs',
      quote:
        'Brain layer maintains an orchestrator state machine coordinating Memory Stream, DREAM, and chain execution',
    },
    evidence: {
      reality:
        'brain_orchestrator_state: exactly 1 row. There is no history, no transition log, and no per-tenant or per-session state branching — the entire "orchestrator state" is a single mutable record. Combined with cortex_modes also having 1 row, the substrate has never had more than one simultaneous orchestration context in its lifetime.',
      method: 'SELECT count(*) FROM brain_orchestrator_state → 1; cortex_modes → 1.',
    },
    verdict:
      'A singleton row with no history is a configuration value pretending to be a state machine. The orchestrator does not orchestrate multiple flows because the schema only ever stores one — and even that one has no audited transitions (see F-073).',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-076',
    title: '10,266 "discoveries" reduce to 5 distinct pipeline fingerprints — 99.95% duplication',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/17-crown-jewel-registry.md + 11-defensible-valuation.md',
      quote:
        '"The substrate discovers new capabilities without human input. Every cycle compounds the IP corpus." · Discovery Engine framed as a growing vault of unique high-value algorithmic assets',
    },
    evidence: {
      reality:
        'discoveries: 10,266 rows, all created in the last 7 days, but COUNT(DISTINCT pipeline_fingerprint) = 5. The same five pipelines have been re-recorded ~2,053 times each. discovery_runs shows 3,339 lifetime / 1,470 in 30 days, but only 50 distinct run_ids actually appear in discoveries — the rest produced nothing.',
      method: 'count(*) → 10,266; count(distinct pipeline_fingerprint) → 5; count(distinct run_id in discoveries) → 50.',
    },
    verdict:
      'A "compounding IP corpus" that compounds duplicates is not compounding IP. The big number on the dashboard (10k+ discoveries) is row inflation: five real pipelines re-stamped thousands of times. Real novelty count is two orders of magnitude smaller than advertised.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-077',
    title: 'Crown Jewel registry says 0 — but 3,523 rows sit above the documented S-Tier CJPI threshold',
    severity: 'THEATER',
    source: {
      document: 'docs/libraries/internal/17-crown-jewel-registry.md (CJPI ≥ 100 → automatic S-Tier promotion)',
      quote:
        '"The highest-tier Crown Jewels (CJPI ≥ 100) are automatically promoted to the S-Tier Vault — a governor-curated collection."',
    },
    evidence: {
      reality:
        'discoveries.is_crown_jewel = true → 0 rows. discoveries WHERE cjpi >= 100 → 3,523 rows. The "automatic promotion" trigger has fired exactly zero times despite 3,523 candidates meeting the documented threshold. Every single discovery scores above the Prime floor (CJPI ≥ 68) and 78% scores above Apex (≥ 92), which itself indicates a broken scoring calibration.',
      method: 'count is_crown_jewel=true → 0; cjpi>=100 → 3,523; cjpi>=68 → 10,266 (100%); avg cjpi → 95.73.',
    },
    verdict:
      'Two failures stacked: (1) the auto-promotion mechanism is dead — 3,523 qualifying rows, 0 promoted; (2) the CJPI scorer is broken — 100% of discoveries clear the Prime floor and the average is 95.73/100, meaning scores are not discriminating quality. A registry that auto-promotes nothing while everything scores near-perfect is theater.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-078',
    title: 'Mesh discovery runs dead — 9 lifetime, 0 in last 30 days, 34 unresolved gaps',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/18-vertical-ecosystem.md (mesh discovery feeding cross-vertical learning)',
      quote:
        'Mesh discovery runs continuously, surfacing capability gaps and cross-vertical opportunities; gaps feed back to the BRAIN for autonomous closure',
    },
    evidence: {
      reality:
        'mesh_discovery_runs: 9 lifetime, 0 in the last 30 days. mesh_discovery_gaps: 34 unresolved rows accumulating with no run to close them. integration_discoveries: 6 lifetime. discovery_retired_combos: 99 (more retirements than mesh runs ever).',
      method: 'count mesh_discovery_runs → 9, 30d → 0; mesh_discovery_gaps → 34; integration_discoveries → 6.',
    },
    verdict:
      'The cross-vertical mesh discovery loop has run nine times in the substrate\'s entire history and not once in the last month. Meanwhile 34 capability gaps sit open with nothing scheduled to address them. "Continuous" is the wrong word — "abandoned" fits the data.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-079',
    title: 'S-Tier Vault: 233 capabilities advertised, 12 have actual code (5.2%)',
    severity: 'FICTION',
    source: {
      document: 'public/docs/stier/print/index.html + src/crownjewels/s-tier.registry.json',
      quote:
        '"233 capabilities across 41 modules… reproduction cost $22.4M – $31.4M… discovered, validated, and deployed in 72 hours" — and verbal claims of "$4B+ in software discovered."',
    },
    evidence: {
      reality:
        'src/crownjewels/s-tier.registry.json contains 233 entries. Filtering by hasCode=true returns 12 entries (Substrate Registry, Fleet Intelligence Orchestrator, Multi-Modal Interpreter, Autonomous Triage Engine, Consensus Heartbeat Protocol, Cost-Aware Routing Engine, Anomaly Correlation Engine, Self-Healing Orchestrator, Tamper-Evident Chain, Write-Ahead Log Engine, Pipeline Composition Engine, Mutation Proposal Engine). The other 221 entries are name + description + signatureHash + CJPI score with no implementation behind them. The "41 modules" figure is also wrong — the registry actually spans 58 distinct module strings (44 base modules plus 14 cross-module fusion labels like CORTEX×BRAIN).',
      method: 'JSON.parse → 233 entries; filter hasCode → 12; new Set(modules).size → 58.',
    },
    verdict:
      'A "vault" where 95% of items are catalog cards with no asset behind them is not a vault. The reproduction-cost math ($22M–$31M, escalated to "$4B" in pitch language) is multiplied across 233 phantom rows; reapplying the same per-item math to only the 12 code-backed entries collapses the headline by ~94%. The module count is inflated too.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-080',
    title: 'Database has 0 crown jewels and 0 S-Tier registry rows — the vault exists only as a static JSON file',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/17-crown-jewel-registry.md',
      quote:
        '"54 capabilities are classified as Crown Jewels… verified monthly by black-box enforcement… governor-curated collection of the substrate\'s most valuable assets."',
    },
    evidence: {
      reality:
        'Production database: discoveries.is_crown_jewel=true → 0; no public.crown_jewel_registry table exists; no public.s_tier_vault table exists. The only artifact backing the "vault" is src/crownjewels/s-tier.registry.json — a hand-edited static file checked into the repo, with generatedAt timestamps stuck at 2026-03-01 and no link to the runtime discovery pipeline. There is no "monthly black-box enforcement" job; there is no governor curation event log; there is no promotion path from discoveries → vault.',
      method: "information_schema.tables filter on '%crown_jewel%' / '%s_tier%' → 0; discoveries.is_crown_jewel=true → 0.",
    },
    verdict:
      'The Crown Jewel Vault is a JSON file with marketing copy, not a governed runtime registry. Numbers like "$22.4M–$31.4M reproduction cost" or "$4B in software discovered" derive from that file × a multiplier formula, not from any verified asset, deployment, or revenue. The "discovered, validated, and deployed in 72 hours for under $2,400 — 9,000:1 efficiency ratio" claim has no execution trace in the database to support any of the three verbs.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-081',
    title: '"Enterprise-grade" substrate has 1 enterprise subscription, 0 lifetime API calls, $0 revenue',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/* (Autonomous Product Compiler, ADA, hardening audits) + investor showcase',
      quote:
        '"enterprise-grade software suites", "scoped, enterprise-grade decision-making power", "Enterprise contracts", "5-pass Stop-the-Line Hardening Audit to achieve enterprise-grade readiness."',
    },
    evidence: {
      reality:
        'access_subscriptions: 5 total rows, 4 are tier=free / plan_slug=substrate_free, 1 is tier=enterprise — assigned to the founder\'s own developer record (plan_slug=substrate_operator, current_period_end=NULL, no Stripe subscription id). access_usage: 0 rows lifetime — no enterprise customer has ever made a single API call. cost_millicents sum lifetime = 0. agency_purchases.status=completed → 1 row, total_price_cents = 0. There are 9 access_developers and 4 active API keys, none of which have generated usage.',
      method: 'SELECT tier,plan_slug,status FROM access_subscriptions; count(access_usage) lifetime → 0; sum(cost_millicents) → 0; sum(total_price_cents) where status=completed → 0.',
    },
    verdict:
      'Every "enterprise" qualifier in the documentation — enterprise-grade, enterprise-ready, enterprise contracts, enterprise hardening — points to a customer base that does not exist. The single enterprise tier row in the database is the founder\'s own account with no billing attached. Zero lifetime API calls means no enterprise integration has ever executed, let alone been hardened in production. This is the most consequential finding in the ledger: the entire commercial narrative is built on a customer count of zero.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-082',
    title: 'Convex Core™ Zenodo DOI cited in IP strategy docs does not exist',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/ (IP strategy / prior-art chain) + cover-story playbook',
      quote:
        '"Convex Core™ v3 — DOI: 10.5281/zenodo.cmpsbl-convex-core — Dispatch matrix architecture (cover story + real prior art)" · "doi = {10.5281/zenodo.cmpsbl-convex-core}" cited in BibTeX-style attribution.',
    },
    evidence: {
      reality:
        'Resolving https://doi.org/10.5281/zenodo.cmpsbl-convex-core returns HTTP 404. Zenodo DOIs are exclusively numeric (e.g., 10.5281/zenodo.18895141). Querying Zenodo for q=cmpsbl returns exactly 6 records — none of them is titled "Convex Core" and none uses a slug-style DOI. The cover-story Convex Core archive that the IP strategy claims establishes prior art was never actually published.',
      method: 'curl -o/dev/null -w "%{http_code}" https://doi.org/10.5281/zenodo.cmpsbl-convex-core → 404; GET zenodo.org/api/records?q=cmpsbl → 6 hits, no Convex Core record.',
    },
    verdict:
      'A core leg of the documented "Zenodo Prior Art Chain" is fabricated. Investor and academic talking points that reference the Convex Core DOI as defensive prior art point to a record that has never existed on Zenodo. The cover-story strategy is real in the docs; the artifact backing it is not.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-083',
    title: '"1,000+ Zenodo downloads" headline is one record\'s aggregate, not the corpus',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/internal/ (defensible-valuation / prior-art chain)',
      quote:
        '"1,000+ Zenodo downloads on prior art record" — used as evidence of academic traction across the published CMPSBL corpus.',
    },
    evidence: {
      reality:
        'Zenodo API stats for the 6 published CMPSBL records (q=cmpsbl): 18895141 → 1,163 dl, 19409933 → 16 dl, 19423852 → 13 dl, 19324807 → 6 dl, 19026424 → 1 dl, 18721602 → 0 dl. Corpus total = 1,199 downloads, but 97% (1,163) come from a single Substrate-OS record published 2026-03-06; the other five records average 7 downloads each. The Ascension whitepaper specifically (cited as flagship prior art) has 16 lifetime downloads.',
      method: 'GET zenodo.org/api/records/{id} for each of 6 cmpsbl records; sum stats.downloads.',
    },
    verdict:
      'The "1,000+ downloads" number is technically true but uses a single record\'s count to imply broad academic engagement. The flagship Ascension whitepaper sits at 16 downloads. Honest framing would be "one record at 1.1k, five records under 20 each" — which materially weakens the "established prior art and academic traction" argument.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-084',
    title: '11 DOIs cited across the docs — 1 fabricated, 1 superseded, 4 are version-chain duplicates',
    severity: 'FICTION',
    source: {
      document: 'docs/libraries/internal/* + IP strategy + prior-art chain (every 10.5281/zenodo.* citation in the repo)',
      quote:
        'Eleven distinct DOI strings appear across docs/, src/, and public/ — presented as independent published artifacts establishing prior art for CMPSBL, Memory Stream, Ascension, Convex Core, and supporting whitepapers.',
    },
    evidence: {
      reality:
        'Resolved each cited DOI against the Zenodo API. Findings: (1) 10.5281/zenodo.cmpsbl-convex-core → 404, fabricated (already F-082). (2) 10.5281/zenodo.18234909 → 302-redirects to 18895141, meaning the cited record is a superseded version, not a standalone publication. (3) Four DOIs — 18234910, 18379258, 18834080, 18895141 — all report identical stats of 1,163 downloads and 1,157 unique downloads. They are version-chain siblings of the same Substrate-OS record; Zenodo returns the aggregate parent-stats for each child. They are not four independently-cited works generating ~4,600 downloads as the count would imply.',
      method: 'curl zenodo.org/api/records/{id} for all 11 cited DOIs; compared stats.downloads / unique_downloads; followed 302 chain on 18234909.',
    },
    verdict:
      'The "Zenodo prior-art chain" reads as 11 independent records but resolves to ~6 distinct works, of which one is fabricated and one is a deprecated alias. Anyone counting downloads across the cited DOI list would quadruple-count a single record. Honest count: ~6 records, ~1,222 total downloads, with one record carrying 95% of the traffic.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-085',
    title: 'Most CMPSBL Zenodo records have single-digit downloads, contradicting the "established academic prior art" framing',
    severity: 'PARTIAL',
    source: {
      document: 'docs/libraries/internal/11-defensible-valuation.md + 18-vertical-ecosystem.md',
      quote:
        '"Prior Art: ORCID-registered academic publications and Zenodo releases establish legal defensibility." · "established prior art and academic traction"',
    },
    evidence: {
      reality:
        'Per-record lifetime downloads for the 9 distinct CMPSBL/PromptFluid records on Zenodo (excluding the duplicated version-chain siblings): Substrate OS v5.5.0 → 1,163; SimNap whitepaper → 27; Ascension v2 → 16; Shapeshifter case study → 13; Ascension v1 → 6; Governance Lexicon → 3; SimNap GitHub release → 3; Heritage paper → 1; CMPSBL OS Governance Framework → 0. Median = 6 downloads. ORCID 0009-0001-4237-1243 (cited author) is real and links to these records, but 8 of 9 records sit below 30 lifetime downloads.',
      method: 'GET zenodo.org/api/records/{id} for each unique record; compute median.downloads.',
    },
    verdict:
      'The DOIs and ORCID exist — that part is real and the FACT-tier portion stands. What is theater is treating the body of work as "established academic prior art." Median 6 downloads, no peer review, no citations on Google Scholar — these are timestamped self-publications, not academic traction. Useful for prior-art priority date, misleading as evidence of scholarly engagement.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-086',
    title: 'Zenodo record 18895141 (Substrate OS v13.5) is real — 1,163 downloads verified',
    severity: 'FACT',
    source: {
      document: 'https://zenodo.org/records/18895141 — "CMPSBL Substrate OS: A Cognitive Orchestration System for Autonomous AI Evolution" (v13.5, published 2026-03-06)',
      quote:
        'Author: Kenneth E. Sweet Jr. (ORCID 0009-0001-4237-1243). Affiliation: PromptFluid. Released as v13.5 Academic Protection Set: 18 documents (md + html), 159 kB total, describing clockless orchestration, Memory Stream, pipeline crystallization, Universal Export, bounded-autonomy governance, IRONCLAD resilience, Intent Mesh, and domain extension.',
    },
    evidence: {
      reality:
        'Zenodo API confirms: title, ORCID, publication date, and file manifest match the page exactly. Lifetime stats: 1,163 downloads / 1,157 unique downloads / 956 views / 832 unique views. Codebase verification of the eight architectural concepts cited: src/components/admin/IntentMeshCommsFeed.tsx + mesh_intents table (Intent Mesh — real), src/lib/branding/memory-stream.ts + memory-stream tables (Memory Stream — real), src/lib/ascension/* 60+ files including pipeline-crystallization, universal-export, contract-extractor (Ascension/Universal Export — real), src/config/substrate.ts + IRONCLAD references (resilience layer — real), governance_mode + governance_transition_approvals tables (bounded autonomy — real), clockless references in src/components/heritage/ArchitectureDiagrams.tsx + SEO (clockless concept — real). Every architectural primitive named in the abstract has corresponding code or DB infrastructure in the repo.',
      method: 'GET https://zenodo.org/api/records/18895141 + grep -rli on each named concept across src/ and docs/.',
    },
    verdict:
      'This is the one Zenodo record where the headline claim holds: real DOI, real ORCID, real publication, real 1,163 downloads, and the 8 architectural concepts described are all backed by working code or schema in this repo. Kept in the ledger as a FACT entry to make clear which claims survive scrutiny — not everything is theater. The "1,000+ downloads" framing is accurate when applied to *this specific record* (it is misleading only when used to imply the entire prior-art chain has that traction — see F-083, F-084, F-085).',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-087',
    title: 'v13.5 release index self-cites a superseded DOI (18234909) instead of its own DOI (18895141)',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/academic-v13/print/18-zenodo-metadata.html + 00-release-index.md (inside Zenodo record 18895141)',
      quote:
        '"DOI: 10.5281/zenodo.18234909" — printed in the release index, the metadata document, the BibTeX block, and the APA/Chicago citations bundled inside record 18895141.',
    },
    evidence: {
      reality:
        'The actual Zenodo DOI for the v13.5 record the user is reading is 10.5281/zenodo.18895141. Resolving 10.5281/zenodo.18234909 returns a 302 redirect to 18895141 — meaning 18234909 is an older version in the same version chain, not the canonical record. Anyone copying the BibTeX from page 18 of the release set will cite the deprecated alias rather than the live record.',
      method: 'curl -I https://doi.org/10.5281/zenodo.18234909 → 302 → /records/18895141; compare to GET zenodo.org/api/records/18895141 → doi: 10.5281/zenodo.18895141.',
    },
    verdict:
      'Not a fabrication — both DOIs resolve and both belong to Kenneth — but the release set ships its own outdated DOI in every citation block. Citations harvested from the published artifact will point one version behind. Easy fix: regenerate the metadata file with the canonical 18895141 DOI before the next release.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-088',
    title: 'Clockless orchestration — claim matches reality (Lamport-style logical clock implemented)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/02-system-overview.html + 08-intent-mesh.html',
      quote: '"Clockless orchestration: cross-module collaboration without centralized wall-clock dependency."',
    },
    evidence: {
      reality:
        'src/core/clock/clocklessEpoch.ts implements a real monotonic logical clock with per-module vector clocks (Map<string,number>), causal-parent tracking, happens-before relation, and a 5,000-entry epoch log. wallTime is explicitly marked "for debugging only — NOT used for ordering." This is a textbook Lamport/vector-clock implementation, not vapor.',
      method: 'cat src/core/clock/clocklessEpoch.ts',
    },
    verdict:
      'Real and architecturally sound. The "clockless" branding is technically accurate — ordering is logical, not chronological. Whether it is actually USED to order cross-module events at scale is a separate question (epochLog is in-memory only, not persisted), but the primitive exists and works.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-089',
    title: 'Memory Stream — claim matches reality (full tiered memory infrastructure live)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/03-memory-stream-foundry.html',
      quote: '"Memory Stream: autonomous tiered memory with hot/warm/cold/archive lifecycle."',
    },
    evidence: {
      reality:
        '7 live tier tables in DB: brain_memory_hot/warm/cold/archive/pruned/contradictions/meta + memory_stream_config + memory_tier_receipts + vertical_memory_stream. RPCs run_memory_tiering, apply_confidence_decay, compress_warm_memories, run_metacognitive_assessment all return 200 in current network logs. Hot=564, Warm=7,962, Cold=9,952, Flat=2,000, Pruned=5,000 records observed live.',
      method: 'psql information_schema + RPC traces in /index page network requests.',
    },
    verdict:
      'Real, populated, and actively cycling. The autonomous tiering claim is backed by working RPCs and ~25K real memory records distributed across the documented tiers. One of the most substantiated claims in the v13.5 set.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-090',
    title: 'Pipeline Crystallization — partial: lifecycle described, but no "crystallized" gate exists in schema',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/academic-v13/print/04-pipeline-crystallization.html §2.3',
      quote:
        '"As of v13.5: 300+ identified synergy pipelines, 100 crystallized (frozen, production-verified), 7 sectors contributing."',
    },
    evidence: {
      reality:
        'pipeline_vault has 214 rows (not 100) and discovered_pipelines has 40 (not 300+). Schema check: pipeline_vault has NO status, fingerprint_frozen, or crystallized_at column — only pipeline_score/tier/fingerprint. The "crystallization" lifecycle described in §3.1 (Discovery → Validation → Staging → Crystallization → Production) has no enforcement column or state machine in the table. Every pipeline in the vault is implicitly treated as the same state. crystallized_assets is a separate table for a different purpose (purchased entitlements).',
      method:
        'psql -c "\\d pipeline_vault" + COUNT(*) on pipeline_vault, discovered_pipelines, crystallized_assets.',
    },
    verdict:
      'The infrastructure is real (214 + 40 rows is real data), but the doc\'s headline numbers (300+/100) and the 5-stage lifecycle are not backed by schema. There is no column distinguishing a "crystallized" pipeline from a "discovered" one — the gate is rhetorical, not enforced. Either add a status enum + crystallized_at timestamp to back the claim, or revise the doc to describe what actually exists.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-091',
    title: 'Universal Export — claim matches reality (4,104 LOC of adapter code)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/05-universal-export.html',
      quote: '"Universal Export: deterministic transformation of substrate state into portable artifacts."',
    },
    evidence: {
      reality:
        'src/lib/export/universal-adapter.ts = 2,743 LOC; src/lib/substrate/export-adapter/runtime.ts = 1,361 LOC; plus src/lib/export/marketplace-export.ts and 60+ files under src/lib/ascension/ implementing the export pipeline. This is one of the densest implementation areas in the repo.',
      method: 'wc -l on adapter files + grep -ril universal-export.',
    },
    verdict:
      'Real and substantial. 4,000+ lines of adapter code is not vapor. The polyglot/multi-target export claim is backed by the existence of 34 native emitters and 53 bridge emitters previously documented in mem://architecture/ascension/polyglot-signal-and-receipt-emitters.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-092',
    title: 'Bounded Autonomy — claim matches reality (executor + SEBA types + governance gate)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/06-governance-safety.html',
      quote: '"Bounded Autonomy tier: agents operate within governance-enforced action limits."',
    },
    evidence: {
      reality:
        'src/lib/capabilities/synergies/executors.ts:818 exports executeBoundedAutonomyGuard, registered in registry.ts:531 as synergy id "bounded-autonomy-guard". src/lib/substrate/seba/types.ts defines the Shadow→Production promotion gate. Wave7 activation registry describes "graduated intervention thresholds." TerminalExecutor exposes "seba.enable" command. governance_mode table is live with mode=ACTIVE.',
      method: 'grep -rn BoundedAutonomy src/ + psql governance_mode.',
    },
    verdict:
      'Real, executable, and integrated with the governance plane. The terminal command actually toggles the state. This is one of the cleaner claim-to-code mappings in the v13.5 set.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-093',
    title: 'IRONCLAD — partial: name appears in branding/scanner lists but no dedicated "resilience hardening layer"',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/academic-v13/print/07-resilience-hardening.html (referenced in 08-intent-mesh.html nav)',
      quote: '"IRONCLAD: cross-module resilience hardening layer with circuit breakers and graceful degradation."',
    },
    evidence: {
      reality:
        'Two appearances only: src/config/substrate.ts:12 lists IRONCLAD as one of 11 names in a "rotation path" branding sequence (SPARTA→ATHENA→TITAN→...→IRONCLAD→...), and src/lib/ascension/federated-scanner.ts:60 includes "IRONCLAD" in an array of 8 vertical seed names alongside PROWLER, ONYX, SPECTER. There is NO src/lib/ironclad/, no ironclad-* file, no IroncladEngine class, no dedicated circuit-breaker module branded IRONCLAD. Circuit breakers DO exist (e.g., NEXUS circuit_state, CORTEX circuit_breakers in pf-substrate responses), but they are not aggregated under an IRONCLAD layer.',
      method: 'grep -ril ironclad src/ supabase/functions/ + verify no module/folder/class with that name.',
    },
    verdict:
      'IRONCLAD is currently a brand label, not a layer. The underlying capabilities it claims (circuit breakers, graceful degradation) DO exist scattered across NEXUS, CORTEX, FAILSAFE, and DEFENSE — but there is no unified module that owns them under the IRONCLAD name. Either build the aggregator (a thin facade over the existing breakers would suffice) or rename doc 07 to describe the resilience features as they actually live in their host modules.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-094',
    title: 'Intent Mesh — claim matches reality (full panel suite + populated tables)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/08-intent-mesh.html',
      quote: '"Intent Mesh: decentralized cross-module collaboration via intent advertisement, negotiation, and routing."',
    },
    evidence: {
      reality:
        'DB: mesh_intents=25 rows, mesh_saved_pipelines=92, mesh_comms=1,570, mesh_discovery_runs + mesh_discovery_gaps + mesh_capability_recommendations all present. UI: 9 dedicated panels under src/components/substrate-os/mesh/ (MeshTopologyGraph, MeshHealthPanel, MeshScoringPanel, MeshFederationPanel, MeshProposalsPanel, MeshSchedulerPanel, PipelinesExplorer + IntentMeshCommsFeed admin view). pf-substrate intent.status returns health=90 with 25 intents.',
      method: 'psql counts on mesh_* tables + ls src/components/substrate-os/mesh/ + pf-substrate intent.status.',
    },
    verdict:
      'Real, populated, and visually exposed. 1,570 mesh communications is a non-trivial amount of cross-module traffic. The "decentralized routing" claim is backed by working schema and working UI. One of the strongest claim-to-implementation matches in the v13.5 set.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-095',
    title: 'NEXUS — claim matches reality (3,406 LOC + 193,937 real AI calls + 24 providers in production)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/02-system-overview.html + 08-intent-mesh.html §4.2 + 14-governance-risk.html',
      quote:
        '"NEXUS: AI provider routing and model selection — provider failover and load balancing, cost-aware routing, latency-optimized routing. Risk mitigation: technology obsolescence — Low — Model-agnostic via NEXUS."',
    },
    evidence: {
      reality:
        'src/lib/nexus/ contains 13 modules totaling 3,406 LOC: router.ts (524), batchRouting.ts (425), costEstimation.ts (398), loadBalancer.ts (299), healthRouter.ts (295), budgetGovernance.ts (251), cache.ts (233), circuitBreaker.ts (217), index.ts (194), learning.ts (166), core.ts (154), metrics.ts (135), cost-ceiling.ts (115). Six dedicated edge functions: pf-nexus-router, pf-nexus-pricing, pf-nexus-image-gen, nexus-budget-optimizer, nexus-code-assistant, nexus-provider-discovery. Live ai_usage_log: 193,937 total calls, 42.7M tokens, $2.81 actual spend, 24 distinct providers, 22,454 calls in last 7 days. First call 2026-03-19 → most recent today. router.ts references "provider" 66 times.',
      method: 'wc -l src/lib/nexus/*.ts; ls supabase/functions/ | grep nexus; psql aggregates on ai_usage_log.',
    },
    verdict:
      'Real, production-grade, and load-bearing. Among ALL the v13.5 claims, NEXUS is the most empirically substantiated — nearly 200K real calls is hard data. The "model-agnostic" claim in the risk register is genuinely true: top providers (groq, cerebras, sambanova, together, deepseek, mistral, openrouter, gemini) span 8+ vendors. This is one of the few places the substrate is unambiguously enterprise-grade.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-096',
    title: 'NEXUS provider count drift — runtime reports 14 providers, ai_usage_log shows 24',
    severity: 'PARTIAL',
    source: {
      document: 'pf-substrate edge function nexus.status response',
      quote: '"providers": {"total": 14, "available": 14, "healthy": 14, "routing_order": ["groq","groq-scout","groq-qwen","groq-70b","cerebras","sambanova","together","deepseek","mistral","openrouter","gemini","local"]}',
    },
    evidence: {
      reality:
        'Live ai_usage_log SELECT COUNT(DISTINCT provider) returns 24, not 14. The routing_order list omits providers that have logged real traffic: openrouter-qwen (1,705 calls), google-aistudio (1,261), openrouter-free (1,142), openrouter-deepseek-r1 (1,130), claude-haiku (575), groq-llama (575), openai-mini (575), groq-8b (473), openai (360) and several others. Either these were registered ad-hoc outside the canonical router list, or the runtime registry is stale.',
      method: 'Compare pf-substrate nexus.status routing_order vs psql SELECT DISTINCT provider FROM ai_usage_log.',
    },
    verdict:
      'Not a fabrication — both numbers are real measurements — but the system is reporting an undercount of its own surface area. Investor-facing "14 providers" understates the actual fleet by ~70%. Either expand the canonical routing_order to include the other 10 providers seen in production, or prune the orphan providers if they are unauthorized one-offs.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-097',
    title: 'NEXUS success_rate displays 100% in runtime status while ai_usage_log shows 20.7%',
    severity: 'PARTIAL',
    source: {
      document: 'pf-substrate edge function nexus.status response',
      quote: '"analytics": {"total_calls": 0, "success_rate": 100, "total_tokens": 0, "total_cost_usd": 0}',
    },
    evidence: {
      reality:
        'pf-substrate nexus.status returns success_rate=100 because total_calls=0 (default-on-empty). But the actual ai_usage_log table holds 193,937 calls of which only 20.74% have success=true. The "100%" is therefore a placeholder shown when the live counter is zero — it is not measuring anything. A reviewer glancing at the response would believe NEXUS has a perfect success rate when in fact ~80% of historical calls are flagged unsuccessful.',
      method: 'pf-substrate nexus.status network response vs psql -c "SELECT COUNT(*) FILTER (WHERE success=true)*100.0/COUNT(*) FROM ai_usage_log".',
    },
    verdict:
      'The 100% is technically a divide-by-zero default, not a lie — but it displays in the same panel that investors and operators read. Either backfill the analytics counter from ai_usage_log so the displayed number reflects reality, or render "n/a" when the live window is empty so no one mistakes the placeholder for a real metric. The 20.74% historical success rate itself deserves separate investigation — that is a real reliability signal being hidden.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-098',
    title: 'Executors — claim of "125 custom executors" matches reality exactly',
    severity: 'FACT',
    source: {
      document: 'public/docs/website/01-EXECUTIVE-SUMMARY.html + 03-KEY-CAPABILITIES.html + 09-SYNERGY-CAPABILITIES.html',
      quote:
        '"200 synergy pipelines with 125 custom executors" / "125 implementations (76 core + 22 S-tier + 27 discovery pipelines)"',
    },
    evidence: {
      reality:
        'src/lib/capabilities/synergies/executors.ts exports exactly 103 `executeXxx` functions (5,832 LOC); src/lib/capabilities/synergies/stier/executors.ts exports exactly 22 (2,006 LOC). 103 + 22 = 125 — matches the headline claim to the unit. Each executor is a real async function with module-by-module step accumulation (DECODE→BRAIN→DREAM pattern visible in executeSmartRecall etc.).',
      method: 'grep -cE "^export async function execute" on both executor files; wc -l for size.',
    },
    verdict:
      'Rare: a precise count claim that holds. The architecture is real and the math is honest. The internal sub-counts (76 core + 22 S-tier + 27 discovery) sum to 125 but the file split is 103/22 — the "76 + 27 = 103" decomposition is plausible but not separately verified here. Headline number is solid.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-099',
    title: 'Synergy pipeline count — docs say 200, registry holds 198',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/website/09-SYNERGY-CAPABILITIES.html',
      quote: '"Total Synergies: 200 production-ready pipelines"',
    },
    evidence: {
      reality:
        'grep of `id:` entries across src/lib/capabilities/synergies/registry.ts (2,183 LOC), stier/depot-registry.ts (706 LOC), and infrastructure-pipelines.ts returns 198 entries — two short of the round 200 advertised. Likely a rounding/marketing convenience rather than fabrication; the gap is 1%.',
      method: 'grep -E "^\\s*\\{?\\s*id:\\s*[\\\\\'\\\"]" on the three registry files.',
    },
    verdict:
      'Off by 2 in the user-facing direction. Either add the two missing pipelines to hit the claimed 200, or update the docs to "198+". Trivially fixable; flagging because exact integers in marketing copy create unnecessary attack surface.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-100',
    title: 'Resolvers — "80+ resolvers across 40 nodes" understates reality (131 in MESH_MANIFEST)',
    severity: 'FACT',
    source: {
      document: 'public/docs/meta-paper/heritage.html',
      quote:
        '"80+ resolvers across 40 nodes" / "node.resolver_name → composable primitives" / "edge-function-as-resolver pattern"',
    },
    evidence: {
      reality:
        'src/lib/substrate/intent-mesh/manifest.ts (the canonical MESH_MANIFEST) declares 131 resolver entries in the dotted node.capability form (defense.threat_score, relay.email_by_actor, brain.reasoning_context, etc.). The runtime in router.ts resolves steps by `MESH_MANIFEST.find(r => r.id === step.resolverId)`. packages/intent/src/index.ts also exposes `registerResolver(intentType, handler)` and `registerResolverMap()` as a public Tier-1 API — the resolver pattern is both internal and externally distributable.',
      method:
        'grep -cE "id:\\s*[\\\\\'\\\"]" src/lib/substrate/intent-mesh/manifest.ts; grep -E "registerResolver" packages/intent/src/index.ts.',
    },
    verdict:
      'Actually understated — reality is 131, claim is 80+. Both numbers are technically true (131 satisfies "80+") but the docs are leaving real distinctness on the table. The resolver pattern is real, externally packaged (@cmpsbl/intent), and load-bearing for Intent Mesh routing. Recommend updating docs to "130+ resolvers".',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-101',
    title: 'ENCODE — module exists and is large (17,563 LOC across 45 files), but doc description drifts from code reality',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/academic-v13/print/02-system-overview.html',
      quote: '"ENCODE — Content generation and structured output"',
    },
    evidence: {
      reality:
        'ENCODE is real and substantial: 45 ENCODE-tagged files totaling 17,563 LOC. Core module at src/lib/substrate/encode-module/ holds 19 files / 6,118 LOC including astPatchEngine, codeQualityScorer, diffSimulation, governanceCompliance, multiFileOrchestrator, shadowVerdictAnalyzer, skillProficiency, templateSynthesis, escalation-processor, escalation-telemetry. Companion: src/lib/codeagent/encoded/ (12 files: anchor, communication, expert-patterns, feedback-loop, guard, knowledge-transfer, policy, production-pipeline, shadow-practice, skills, substrate-navigator, system-manifest), src/lib/substrate/clm/encoded-curriculum.ts + encoded-learning-engine.ts, src/lib/substrate/encode-error-patterns/, src/components/substrate-os/encode-console/ (5 panels), hooks useEncode + useEncodeOrchestration, admin EncodeConsolePage. The customer-facing limited variant is renamed VOLVER (src/packages/evolution-mesh/agent/stubbed-encode.ts).',
      method: 'find src -ipath "*encode*" -type f | xargs wc -l; head src/lib/substrate/encode-module/index.ts.',
    },
    verdict:
      'The MODULE is real and serious — but the doc one-liner ("Content generation and structured output") materially understates and mis-frames it. The actual module header reads "ENCODE — Code Execution & Generation Intelligence ... receiving structured task packets from DECODE ... producing governed code artifacts" with AST patching, multi-file orchestration, shadow verdict analysis, and skill proficiency tracking. This is a code agent, not a content generator. Either update 02-system-overview.html to describe ENCODE as the code-execution module (matching the index.ts header), or scope down the implementation. The current gap means an investor reading the docs will not recognize the module they are looking at in the codebase.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-102',
    title: 'ENCODE has zero database tables and zero dedicated edge functions despite 17.5K LOC',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/academic-v13/print/03-memory-stream-foundry.html + 07-resilience-hardening.html',
      quote: '"Generation outputs (ENCODE)" feed Memory Stream / "Compute-heavy: FORGE, ENCODE — Lower throughput, longer execution"',
    },
    evidence: {
      reality:
        'psql information_schema scan for tables LIKE "%encode%" returns 0 rows. ls supabase/functions/ | grep -i encode returns nothing. Yet the docs describe ENCODE as a producer feeding Memory Stream and as a compute-heavy resilience tier. With 17,563 LOC and no persistence layer or server-side surface, every "generation output" must either be ephemeral (lost on reload) or be writing into a generically-named table (e.g. brain_memory_*, agency_task_artifacts) without the ENCODE label being preserved. The escalation-telemetry and escalation-processor files inside encode-module suggest write-paths exist but they are not bound to ENCODE-named persistence.',
      method: 'psql LIKE %encode% returned 0 tables; ls supabase/functions/ | grep -i encode returned nothing.',
    },
    verdict:
      'Real client-side module without a server-side counterpart — meaning the "Generation outputs feed Memory Stream" claim cannot be cleanly traced. Either: (1) rename the table writes ENCODE performs to encode_* so the data lineage matches the docs, (2) add a dedicated pf-encode edge function for compute-heavy generation as 07-resilience-hardening.html implies, or (3) clarify in docs that ENCODE is purely a client-side intelligence layer that emits into shared Memory Stream tables. Today the module is undeniably real but unobservable from the database side.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-103',
    title: 'DECODE — claim is real and well-supported (12,187 LOC + 2 edge functions + 2 DB tables)',
    severity: 'FACT',
    source: {
      document: 'public/docs/academic-v13/print/02-system-overview.html + 08-intent-mesh.html + public/docs/website/03-KEY-CAPABILITIES.html',
      quote: '"DECODE — Conversational interpretation and intent extraction" / "Intent Parsing — DECODE — Natural language interpretation, command routing"',
    },
    evidence: {
      reality:
        'DECODE is one of the most complete modules audited: 50 files / 12,187 LOC. Core at src/core/decode/ (14 files: commandExecutor, contextWindowManager, decodeAccessPolicy, depthResolver, epistemicAudit, integrityCache, intentClassifier, multiModalHandler, reasoningGraph, sessionMemory, streamingEngine, substrateRouter, voiceCalibration, voiceProfile). Library at src/lib/decode/ (command-router, contextEngine, governor-commands, index). Hardening at src/lib/substrate/decode/ (admin-directive, clockless-identity, decode-hardening, identity-context). Two dedicated edge functions: agent-decode-chat, pf-decode-search. Two live DB tables: decode_conversations, decode_search_results (389 rows). Contract-driven: src/lib/contracts/DecodeContract.ts + DecodeContractTypes.ts + DecodeRFC.md. Multiple UI surfaces (DecodeChat, DecodeFloat, DecodeStatusBar, DecodeIdentity, DecodeFactoryVoice, DecodeDebrief, DecodeOperativeControls).',
      method:
        'find src -ipath "*decode*" -type f; wc -l; psql counts; ls supabase/functions/ | grep -i decode.',
    },
    verdict:
      'Among the strongest claim-to-reality matches in the substrate. DECODE has client code, server functions, persistence layer, contract spec, RFC, and live data — the full vertical stack. The doc one-liner ("Conversational interpretation and intent extraction") actually undersells it: the real module also performs epistemic verb classification (describe/interpret/reflect/pattern/project), voice calibration, multi-modal handling, and contract-based command validation. This is the opposite of ENCODE — DECODE delivers MORE than the doc promises.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-104',
    title: 'DECODE — decode_conversations table holds only 2 rows despite "conversational" framing',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/academic-v13/print/02-system-overview.html',
      quote: '"DECODE — Conversational interpretation and intent extraction"',
    },
    evidence: {
      reality:
        'psql -c "SELECT COUNT(*) FROM decode_conversations" returns 2. Compare: decode_search_results holds 389 rows (search is healthy), and ai_usage_log holds 193,937 rows (NEXUS routing is healthy). The 2-row count for decode_conversations means either: (a) conversations are not being persisted by agent-decode-chat / pf-decode-search at write time, (b) sessionMemory.ts keeps state in-memory only and never reaches the table, or (c) the table is reserved for a future feature that is not yet wired.',
      method: 'psql -c "SELECT COUNT(*) FROM decode_conversations".',
    },
    verdict:
      'Module quality is high but conversation persistence is not actually happening at scale. The "conversational" claim in the academic doc is partially supported — search history persists, but the conversation thread itself does not. Recommend: either wire agent-decode-chat to insert into decode_conversations on every turn, or rename the doc capability to "Conversational interpretation (in-session) and persistent search history" so the data tells the same story as the marketing.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-105',
    title: 'Capabilities — "400+ depot capabilities" claim overstates the depot registry by ~3x',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/website/00-INDEX.html + 01-EXECUTIVE-SUMMARY.html',
      quote: '"400+ depot capabilities with Crown Jewel protection" / "200 synergy pipelines, 200 templates, 400+ depot capabilities, 100 engines"',
    },
    evidence: {
      reality:
        'Counted entries across all six depot registry files in src/lib/capabilities/depot/: registry.ts=20, registry-expansion.ts=36, registry-stier.ts=22, registry-ultra.ts=30, registry-premium.ts=18, registry-recursive.ts=10. Total = 136 entries — about one-third of the claimed 400+. If you ALSO count s-tier.registry.json (233 ids) plus the 12 vertical-registry files plus a-tier (6 files) plus expansion-jewels (1 file), the union approaches ~370–400 distinct items, but those are NOT all "depot" entries — depot is a specific subsystem under src/lib/capabilities/depot/. The headline number conflates the depot subsystem with the entire crown-jewel + vertical + s-tier surface area.',
      method: 'grep -cE "id:\\s*[\\\\\'\\\"]" src/lib/capabilities/depot/registry*.ts; cat src/crownjewels/s-tier.registry.json | grep -c \\\"id\\\".',
    },
    verdict:
      'Off by a factor of ~3 if you read "depot" strictly. Off by ~10% if you read it loosely as "all catalogued capabilities anywhere in the substrate". Either tighten the claim to "136+ depot capabilities (370+ across the full crown-jewel surface)" or move the non-depot registries under src/lib/capabilities/depot/ so the directory name matches the claim. The crown-jewel surface itself IS real and large — this is a labeling/scoping defect, not a fabrication.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-106',
    title: 'Capabilities — substantial code surface (51,707 LOC across 120 files) and live persistence verified',
    severity: 'FACT',
    source: {
      document: 'public/docs/website/03-KEY-CAPABILITIES.html (capability table mapping each capability to its module)',
      quote: '"Cross-Module Synergies — CORTEX — 200 pipelines, 125 executors, 171+ deployed actions"',
    },
    evidence: {
      reality:
        'find src -ipath "*capabilit*" returns 120 files totaling 51,707 LOC — substantial. Includes 5 Crown Jewel s-tier capability primitives (#026 capability-genesis-reactor, #074 capability-gate-engine, #133 capability-impact-forecaster, #140 recursive-capability-discoverer, #222 capability-forge-engine), capability-affinity, capability-scanner-primitive, expansion-capabilities, atlas/capability-gate, public-capability-manifest, tiered-unlock, crown-jewel-gate, crown-jewel-release-gate, compound-ip-guard. Live tables: atlas_capabilities (8 rows), substrate_capabilities (10 rows), mesh_capability_recommendations (128 rows). UI surface: CapabilityCard, CapabilityCardFree, CapabilityDetailModal, CapabilityMarketplace, CapabilitiesTab, RelatedCapabilities, SubstrateCapabilities. The infrastructure is real — gate logic, IP guard, manifest, marketplace, tiered unlock all wired.',
      method: 'find + wc -l on src/**/capabilit*; psql counts on three capability tables; ls src/crownjewels/s-tier/0[2-9]*-capability*.ts.',
    },
    verdict:
      'The capability infrastructure is unambiguously real and operational — gates, registries, IP guards, marketplace UI, and three live persistence tables. The architecture supports the larger story even though the specific "400+" depot count is loose (see F-105). Among substrate subsystems audited, capabilities ranks alongside DECODE and NEXUS in real implementation depth.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-107',
    title: 'Terminal Commands — total count is real and EXCEEDS the 500+ headline (966 actual command objects, 12,603 LOC)',
    severity: 'FACT',
    source: {
      document: 'public/docs/website/14-VALUATION-ANALYSIS.html + src/components/substrate-os/terminal/TerminalCommands.ts header',
      quote: '"Terminal Commands — 500+ commands — Operational interface IP; ~$200K"',
    },
    evidence: {
      reality:
        'src/components/substrate-os/terminal/TerminalCommands.ts (1,461 LOC) declares exactly 966 `{ command: \'…\', description, category, icon, requiresOperator, requiredTier }` objects in a single typed registry — nearly 2x the 500+ claim. Categories span 47 distinct namespaces (brain, decode, defense, nexus, vision, dream, evolution, cortex, atlas, sovereign, oracle, conscience, treaty, compass, echo, reflex, forge, lingua, phantom, harvest, medic, nerve, …). Total terminal infrastructure: 12,603 LOC across 25+ files including TerminalExecutor, TerminalBootScreen, TerminalMobileRenderer, plus 19 dedicated handler modules (analytics, core, encode, encoded, execution, expansion, governance, hardening, infra, infra-module, mesh, observability, ocg, power, seba, spine, synergy, system-audit, verification). Crown Jewel #098: terminal-command-parser. Plus useTerminalAliases, useTerminalAudit, useTerminalHistory, useTerminalMacros, useTerminalNLP, useTerminalScheduler, useTerminalVisuals, useTerminalWatch — eight dedicated hooks.',
      method: 'grep -cE "^\\s*\\{\\s*command:\\s*[\\\\\'\\\"]" src/components/substrate-os/terminal/TerminalCommands.ts.',
    },
    verdict:
      'Among the most under-claimed numbers in the substrate. 966 commands vs "500+" advertised — reality is nearly DOUBLE the headline. The valuation doc pegs Terminal Commands at ~$200K of IP based on 500+; if pricing scales with surface area, the real figure is closer to ~$385K. The infrastructure is unambiguously real and large.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-108',
    title: 'Terminal Commands — "12 terminal commands" for free tier is off by 54× (reality: 653 free-tier commands)',
    severity: 'PARTIAL',
    source: {
      document: 'public/docs/website/13-INVESTOR-OVERVIEW.html',
      quote: '"Every user gets persistent memory, Memory Stream access, rare agent discovery, 12 terminal commands, SDK templates, and full module telemetry at $0."',
    },
    evidence: {
      reality:
        'grep -E "requiredTier:\\s*\'free\'" src/components/substrate-os/terminal/TerminalCommands.ts returns 653 matches. The free tier in the canonical TerminalCommands registry actually exposes 653 of the 966 total commands — about 67.6%. The "12 terminal commands" claim in 13-INVESTOR-OVERVIEW.html is off by a factor of ~54x in the under-promising direction. Also note the same investor page elsewhere says "Terminal Commands: 66+ across 5 tiers" — that 66 figure matches src/lib/terminal/tiered-commands.ts (which has exactly 66 entries), suggesting two different count systems coexist: the tiered-commands.ts subset (66) and the full TerminalCommands.ts registry (966).',
      method: 'grep -E "requiredTier:\\s*\'free\'" src/components/substrate-os/terminal/TerminalCommands.ts | wc -l; wc -l src/lib/terminal/tiered-commands.ts.',
    },
    verdict:
      'Same module, three contradictory numbers in the public docs (12, 66+, 500+) and a real number that is none of them (653 free / 966 total). Recommend a single canonical claim updated to reality: "966 terminal commands across 47 categories and 5 tiers (653 available on the free tier)". The current investor copy massively undersells the free-tier offering — a free user gets ~14% of the substrate by command count for $0, not 12 commands. This is a pricing/marketing self-inflicted wound.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-109',
    title: 'Terminal Commands — RUNTIME audit: dream/evolution/modernizer/system commands actually return real data over the wire (live pf-substrate execution, 2026-04-18)',
    severity: 'FACT',
    source: {
      document: 'src/components/substrate-os/terminal/TerminalCommands.ts + src/lib/terminal/substrate-bridge.ts',
      quote: '"Every command goes through the same edge function the dashboard uses." (substrate-bridge.ts header) + investor docs claim 500+ commands routed through pf-substrate.',
    },
    evidence: {
      reality:
        'Live POSTs to https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/pf-substrate on 2026-04-18 03:36 UTC with the exact {module, action} payloads the bridge sends — not strawmen, not the same code path twice, real network round-trips. Results: dream.status → HTTP 200 in 643ms, returns live row {id:7c2215bd…, current_mood:"dreaming", mood_score:0.1, dreams_consumed_today:9, mutation_level:3, last_fed_at:2026-03-03, updated_at:2026-04-17 20:23 UTC} — this is real persisted state, not seeded fixtures. dream.pulse → 200/236ms with {alive:true, version:"11.1.0", health:100, circuit:"closed", mutation_cap:20}. dream.anomalies → 200/331ms with multiple real anomaly rows (e.g. bad_feed_input warnings dating back to 2026-01-25). evolution.status → 200/434ms with live_data {primary_table:"evolution_proposals", total_records:34, query_latency_ms:48} and personality:"The Mutator" zone:"csz". evolution.jobs/health/omega all return real `evolution_proposals` rows including a "[Performance Boost] High Event Volume Detected" job with 1628 events/hr telemetry. modernizer.status and modernizer.health return identical evolution.* payloads — the alias mapping in execution-handlers.ts works end-to-end. system.health → 200/265ms with {overall_health:100, diagnostics:[{module:"core", health_score:100, circuit_state:"closed"},…]}. system.diagnostics → 200/1382ms with {substrate:{version:"11.1.0", type:"Cognitive Orchestration Substrate (HARDENED)", uptime_ms:1228}, orchestrator:{status:"healing", current_phase:"reflection", cycles_completed:8214}}. governance.health → 200/272ms with `mode_audit` row showing ACTIVE since 2026-02-25 ("Clockless active mode"). The substrate is genuinely live, multi-zone, persisting real telemetry, with the Modernizer→Evolution rename wired correctly at the routing layer.',
      method: 'node /tmp/run-real.mjs — direct fetch() to pf-substrate edge function with the same body shape that callSubstrate(module, action, params) sends. No browser, no mocks, no instrumentation overhead.',
    },
    verdict:
      'Among the strongest verifications in the ledger so far. The terminal command surface is not vaporware: real edge function, real DB reads, real personalities/zones, real circuit-breaker state, real persisted dream-eater mood, real evolution proposals queue with 34 rows. Latencies are honest (236ms–1382ms range, system.diagnostics being the heaviest). The MODERNIZER→EVOLUTION terminology rename (Lov Rules v3.2) is correctly wired — modernizer.* aliases route to evolution.* and return identical payloads, no orphaned handler.',
    recordedAt: '2026-04-18',
  },
  {
    id: 'F-110',
    title: 'Terminal Commands — RUNTIME audit: 3 of 15 sampled commands fail at the edge despite being registered as handlers (mesh.health, nexus.health, doctor)',
    severity: 'PARTIAL',
    source: {
      document: 'src/lib/terminal/mesh-handlers.ts:35 + src/lib/terminal/execution-handlers.ts:28 + src/lib/terminal/core-handlers.ts:136',
      quote: '`registerHandler("mesh.health", bridge("mesh", "health"));` and `registerHandler("nexus.health", bridge("nexus", "health"));` and `registerHandler("doctor", …)` — all three are present in the handler registry and listed in TerminalCommands.ts, implying they execute end-to-end.',
    },
    evidence: {
      reality:
        'Same 2026-04-18 03:36 UTC live test against pf-substrate. Failures: (1) mesh.health → HTTP 500 in 2893ms with body {success:false, error:"Unknown module: mesh", health:{mesh:{score:75, status:"degraded"}}} — the edge function does not recognize "mesh" as a module at all, despite a registered handler claiming it does. The fallback degraded-status payload is returned instead. (2) nexus.health → HTTP 500/189ms with {error:"Unknown nexus action: health"} — the nexus module IS recognized, but the "health" action is not implemented for it, even though every other module exposes .health and the registered handler implies parity. (3) system/doctor probe → HTTP 500/197ms with {error:"Unknown system action: doctor"} — "doctor" is registered as a top-level core handler in core-handlers.ts:136 and listed as a COGNITIVE_ALIAS in TerminalExecutor.ts:1218, but no edge-side dispatcher exists. 12 of 15 sampled commands worked perfectly; 3 failed. Failure rate at the runtime boundary: 20% on this sample. The good news: failures are loud (HTTP 500 + structured error), not silent — the substrate honestly reports "Unknown module/action" rather than fabricating data.',
      method: 'Same /tmp/run-real.mjs run as F-109; failures captured verbatim from edge response bodies.',
    },
    verdict:
      'The handler-registry layer over-promises vs. the edge function dispatch layer. Three concrete fixes needed: (a) add a "mesh" module case to pf-substrate (or remove the bridge call from mesh-handlers.ts:35 and route mesh.* through a different surface); (b) add a "health" action to the nexus module dispatch in pf-substrate to match the .health convention every other module follows; (c) wire the legacy "doctor" alias to system.diagnostics in pf-substrate, since the front-end already treats them as equivalent. None of these are theater — they are real plumbing gaps where two layers (handler registry + edge dispatcher) drifted out of sync. Easy to close in one edge-function patch.',
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
