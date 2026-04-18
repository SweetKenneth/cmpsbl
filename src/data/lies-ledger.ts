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
];

export const LEDGER_STATS = {
  totalFindings: LIES_LEDGER.length,
  fiction: LIES_LEDGER.filter((f) => f.severity === 'FICTION').length,
  theater: LIES_LEDGER.filter((f) => f.severity === 'THEATER').length,
  partial: LIES_LEDGER.filter((f) => f.severity === 'PARTIAL').length,
  fact: LIES_LEDGER.filter((f) => f.severity === 'FACT').length,
};
