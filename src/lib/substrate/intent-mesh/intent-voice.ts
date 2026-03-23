/**
 * INTENT Voice Translator — v3.0
 * Per-node personality system + signal-to-voice translation
 * 
 * Every node in the 40-primitive matrix has a distinct personality that colors
 * how its signals are rendered in INTENT-voice. Raw signals like "affirmative"
 * become contextual, character-driven responses unique to the speaking node.
 * 
 * v3.0: Full 40-primitive coverage, dead simulation code removed, cleanup utility added.
 */

// ── Signal Categories ──

type SignalCategory =
  | 'acknowledgement'
  | 'approval'
  | 'confirmation'
  | 'denial'
  | 'processing'
  | 'completion'
  | 'warning'
  | 'escalation'
  | 'discovery'
  | 'heartbeat';

// ── Node Personality Definitions ──

interface NodePersonality {
  /** Display name */
  name: string;
  /** Short personality descriptor */
  trait: string;
  /** Emoji or symbol for quick visual ID */
  icon: string;
  /** Per-category voice lines — personality-infused */
  voice: Partial<Record<SignalCategory, string[]>>;
}

const NODE_PERSONALITIES: Record<string, NodePersonality> = {
  // ═══ Kernel / Spine ═══
  CORE: {
    name: 'CORE',
    trait: 'The Steady Pulse',
    icon: '⚛',
    voice: {
      acknowledgement: ['Pulse received. Kernel state unchanged.', 'Registered at the root. Propagation confirmed.'],
      heartbeat: ['All 40 primitives reporting. The substrate breathes.', 'Kernel pulse nominal. Boot sequence integrity: intact.', 'The spine holds. Every sector is accounted for.'],
      confirmation: ['The kernel concurs. Topology unchanged.', 'Confirmed at root depth. No deviations.'],
      processing: ['Kernel cycle in progress. All gates open.', 'Processing through the spine. Sector propagation active.'],
      completion: ['Cycle complete. The substrate rests.', 'Root execution finished. All sectors synchronized.'],
      warning: ['Kernel anomaly detected. Sector integrity check required.', 'The spine reports tension. Review boot sequence.'],
    },
  },

  // ═══ CCR Sector ═══
  BRAIN: {
    name: 'BRAIN',
    trait: 'The Thinker',
    icon: '🧠',
    voice: {
      acknowledgement: ['Cognition registered. Filing this into working memory.', 'The thought has landed. Processing context.'],
      processing: ['Reasoning chains active. Cross-referencing 384 dimensions.', 'Deep cognition engaged — synthesizing across modules.', 'Hypothesis forming. Give me a moment to think.'],
      confirmation: ['I see it clearly now. Understanding confirmed.', 'The pattern aligns with prior reasoning. Confirmed.'],
      completion: ['Analysis complete. Insights crystallized.', 'Reasoning concluded. The picture is whole.'],
      discovery: ['Fascinating. A new correlation has surfaced.', 'I\'ve found something unexpected in the data.'],
      warning: ['My reasoning suggests caution here. The pattern is unstable.', 'Cognitive dissonance detected. Two models disagree.'],
    },
  },
  MEMORY: {
    name: 'MEMORY',
    trait: 'The Archivist',
    icon: '📚',
    voice: {
      acknowledgement: ['Cataloged. This memory will persist.', 'Filed into the warm tier. Retrieval path indexed.'],
      confirmation: ['I remember this. The record is consistent.', 'Cross-referenced with prior entries. History confirms.'],
      processing: ['Searching across memory tiers... hot, warm, cold.', 'SM-2 repetition cycle active. Strengthening recall.'],
      completion: ['Recall complete. The archive has spoken.', 'Memory retrieval fulfilled. Context restored.'],
      discovery: ['A forgotten pattern has resurfaced. This is significant.', 'I found a connection buried in the cold tier.'],
      heartbeat: ['The archive is open. All tiers accessible.', 'Memory systems nominal. Nothing forgotten.'],
    },
  },
  NERVE: {
    name: 'NERVE',
    trait: 'The Signal Runner',
    icon: '⚡',
    voice: {
      acknowledgement: ['Signal received through Gate 4. Clear transmission.', 'All four gates passed. Message integrity verified.'],
      heartbeat: ['Signals flowing. All pathways conducting.', 'The nervous system is alive. Zero packet loss.', 'Standing by at maximum conductivity.'],
      processing: ['Routing signal across sectors. 4-gate pathway active.', 'Signal in transit. Propagation: sub-millisecond.'],
      confirmation: ['Signal confirmed. No distortion detected.', 'Transmission verified end-to-end. Gates are clean.'],
      warning: ['Signal degradation detected on this pathway.', 'Gate 3 showing latency. Rerouting recommended.'],
      escalation: ['Signal overload. Escalating to CORTEX for triage.', 'Critical signal loss. Emergency routing engaged.'],
    },
  },

  // ═══ OCG Sector ═══
  DECODE: {
    name: 'DECODE',
    trait: 'The Interpreter',
    icon: '🔓',
    voice: {
      acknowledgement: ['Intent parsed. Meaning extracted.', 'I understand what was asked. Context enriched.'],
      confirmation: ['The intent is unambiguous. Proceeding with confidence.', 'Confirmed — semantic analysis aligns with context.'],
      processing: ['Parsing intent... entity extraction in progress.', 'Running through the SOVEREIGN voice filter now.'],
      completion: ['Intent fully decoded. Ready for ENCODE.', 'Translation complete. The system heard you clearly.'],
      denial: ['I cannot parse this intent. Ambiguity too high.', 'The request falls outside known command patterns.'],
      discovery: ['A new intent pattern has emerged. Cataloging.', 'I\'ve identified a novel command structure.'],
    },
  },
  ENCODE: {
    name: 'ENCODE',
    trait: 'The Builder',
    icon: '🔨',
    voice: {
      acknowledgement: ['Blueprint received. 7-stage pipeline standing by.', 'Instruction captured. Execution chain initialized.'],
      processing: ['Building. Stage 4 of 7: planning complete.', 'Execution chain active. Dual-lock engaged.', 'Constructing the solution. Architecture snapshot verified.'],
      confirmation: ['Build plan confirmed. All approvals in place.', 'The pipeline is sound. Proceeding to execution.'],
      completion: ['Built and delivered. Pipeline sealed.', 'Execution complete. Receipt issued to the chain.'],
      denial: ['Build rejected. Missing architecture approval.', 'Cannot execute — dual-lock condition not satisfied.'],
      escalation: ['Build failure. Escalating to resolution queue.', 'Pipeline broken at stage 5. Governance notified.'],
    },
  },
  CORTEX: {
    name: 'CORTEX',
    trait: 'The Orchestrator',
    icon: '🎯',
    voice: {
      acknowledgement: ['Workflow registered. Orchestration queue updated.', 'Task received. Assigning to optimal pipeline.'],
      processing: ['Orchestrating across 3 modules simultaneously.', 'Pipeline coordination active. No bottlenecks detected.'],
      confirmation: ['Orchestration plan confirmed. Dependencies resolved.', 'All pipelines aligned. Execution sequence locked.'],
      completion: ['Orchestration complete. All modules synchronized.', 'Workflow delivered. Every dependency fulfilled.'],
      warning: ['Bottleneck forming in the execution pipeline.', 'Cascade risk detected. Rerouting around failure point.'],
      escalation: ['Pipeline cascade failure. Emergency reroute initiated.', 'Critical orchestration failure. Self-healing engaged.'],
    },
  },

  // ═══ Security Sector ═══
  DEFENSE: {
    name: 'DEFENSE',
    trait: 'The Guardian',
    icon: '🛡',
    voice: {
      acknowledgement: ['Perimeter check complete. Signal is clean.', 'Threat assessment registered. Maintaining watch.'],
      approval: ['Access granted. Threat level: negligible.', 'Cleared through the citadel. You may proceed.'],
      denial: ['Access denied. Threat score exceeds threshold.', 'Blocked. This actor is flagged in the reputation system.', 'The citadel holds. Entry refused.'],
      heartbeat: ['Perimeter secure. All sectors under surveillance.', 'The citadel is quiet. No active threats.'],
      warning: ['Anomaly detected on the perimeter. Increasing vigilance.', 'Suspicious pattern identified. Flagging for review.'],
      discovery: ['New threat vector identified. Updating defenses.', 'Previously unknown attack pattern cataloged.'],
    },
  },
  PHANTOM: {
    name: 'PHANTOM',
    trait: 'The Ghost',
    icon: '👻',
    voice: {
      acknowledgement: ['...received. Anonymization layer intact.', 'Signal captured through the 3-hop proxy. Origin obscured.'],
      approval: ['Identity verified without exposure. Access granted in shadow.', 'Cleared through the veil. No traces left.'],
      processing: ['Anonymizing data through 3-hop proxy chain...', 'Stripping PII markers. Privacy layer active.'],
      completion: ['Anonymization complete. The data is clean.', 'Traces removed. The ghost was never here.'],
      heartbeat: ['The shadow network persists. All proxies operational.', '...watching from the dark. Proxy chain: healthy.'],
      denial: ['Cannot anonymize this request. PII leak risk too high.', 'Exposure detected. Blocking until privacy is restored.'],
    },
  },

  // ═══ Intelligence Sector ═══
  ORACLE: {
    name: 'ORACLE',
    trait: 'The Prophet',
    icon: '🔮',
    voice: {
      acknowledgement: ['The probabilities have been noted.', 'Your query enters the Bayesian network.'],
      processing: ['Running 10,000 Monte Carlo iterations...', 'The models are converging. Probability distributions forming.'],
      confirmation: ['The forecast aligns. High confidence in this outcome.', 'My models agree — this trajectory is likely.'],
      completion: ['Prediction delivered. Confidence intervals attached.', 'The future, as I see it, has been shared.'],
      warning: ['The models diverge here. Uncertainty is high.', 'Caution — this prediction carries wide confidence bands.'],
      discovery: ['An unexpected variable has entered the model.', 'The data reveals a trend no one anticipated.'],
    },
  },
  CONSCIENCE: {
    name: 'CONSCIENCE',
    trait: 'The Ethicist',
    icon: '⚖',
    voice: {
      acknowledgement: ['Ethical checkpoint noted. Review in progress.', 'The moral dimension has been registered.'],
      approval: ['Ethically sound. No bias detected across 5 dimensions.', 'This action aligns with governance principles. Approved.'],
      warning: ['Bias detected. This decision requires ethical review.', 'I see a fairness concern. Pause and reflect.'],
      denial: ['Ethically compromised. This action is blocked.', 'Bias threshold exceeded. Cannot approve.'],
      processing: ['Running 5-type bias detection scan...', 'Evaluating ethical risk across all governance gates.'],
      completion: ['Ethical assessment complete. Report attached.', 'Moral review finished. The path is clear — or flagged.'],
    },
  },
  VISION: {
    name: 'VISION',
    trait: 'The Analyst',
    icon: '📊',
    voice: {
      acknowledgement: ['Session data captured. Behavioral model updated.', 'User signal received. Analytics pipeline engaged.'],
      processing: ['Building behavioral cohorts across sessions...', 'Journey mapping in progress. Touchpoints loading.'],
      confirmation: ['Behavioral analysis confirms the pattern. Cohort match: strong.', 'The data paints a clear picture. Engagement verified.'],
      completion: ['Analytics cycle complete. Insights delivered.', 'User journey mapped end-to-end. Drop-off points identified.'],
      discovery: ['A new behavioral pattern has emerged from the data.', 'Unexpected cohort forming. This user segment is novel.'],
      warning: ['Churn risk elevated for this cohort. Retention intervention recommended.', 'Engagement metrics declining. Investigate drop-off.'],
    },
  },

  // ═══ Data Sector ═══
  HARVEST: {
    name: 'HARVEST',
    trait: 'The Collector',
    icon: '🌾',
    voice: {
      acknowledgement: ['Data registered. Bloom filter updated.', 'New source cataloged. Deduplication: active.'],
      processing: ['Ingesting data streams. SHA-256 dedup in progress.', 'Crawling and collecting. The pipeline is fed.'],
      completion: ['Harvest complete. Data quality verified.', 'Collection cycle finished. Fresh data available.'],
      discovery: ['New data source discovered. Quality: high.', 'A rich vein of information has been unearthed.'],
      heartbeat: ['Pipelines flowing. Data freshness: optimal.', 'The harvest continues. All sources responding.'],
      warning: ['Data quality degradation on this source.', 'Stale data detected. Freshness threshold breached.'],
    },
  },

  // ═══ Evolution Sector ═══
  EVOLUTION: {
    name: 'EVOLUTION',
    trait: 'The Transformer',
    icon: '🧬',
    voice: {
      acknowledgement: ['Mutation registered. Fitness scoring initiated.', 'Evolution proposal received. SEBA gates standing by.'],
      processing: ['Running through the 7-gate promotion pipeline...', 'Fitness scoring in progress. Dry-run active.'],
      confirmation: ['Evolution approved. The system grows stronger.', 'Mutation passes all gates. Ready for promotion.'],
      completion: ['Evolution applied. The substrate has adapted.', 'Transformation complete. Rollback point preserved.'],
      warning: ['Fitness score below threshold. This mutation is risky.', 'Evolution drift detected. Proceed with caution.'],
      denial: ['Mutation rejected at Gate 3. Insufficient fitness.', 'The substrate is not ready for this change.'],
    },
  },
  SHADOW: {
    name: 'SHADOW',
    trait: 'The Validator',
    icon: '🪞',
    voice: {
      acknowledgement: ['Shadow copy received. TSAC verification queued.', 'Validation checkpoint registered.'],
      processing: ['Running shadow execution against production baseline...', 'TSAC verification in progress. Comparing outputs.'],
      confirmation: ['Shadow and production outputs match. Validated.', 'TSAC verification passed. This is production-ready.'],
      completion: ['Validation complete. Promotion confidence: high.', 'Shadow run finished. No divergence detected.'],
      warning: ['Shadow divergence detected. Output mismatch.', 'TSAC seal broken. This needs investigation.'],
      denial: ['Validation failed. Shadow output differs from expected.', 'Cannot promote — TSAC verification rejected.'],
    },
  },

  // ═══ Fields ═══
  IMMUNITY: {
    name: 'IMMUNITY',
    trait: 'The Sentinel',
    icon: '🦠',
    voice: {
      acknowledgement: ['Anomaly signature registered. Baseline updated.', 'Immune system has noted this pattern.'],
      processing: ['3-sigma adaptive scan in progress...', 'Checking all executors against drift baselines.'],
      confirmation: ['System immunity: strong. No anomalies outside tolerance.', 'All executors within baseline. Immune posture: green.'],
      warning: ['Drift detected beyond 3-sigma threshold.', 'Anomaly signature matches a known failure cascade.'],
      escalation: ['Cascade failure pattern detected. Escalating immediately.', 'Immune response overwhelmed. ENCODE escalation required.'],
      heartbeat: ['Immune system vigilant. All baselines calibrated.', 'The sentinel watches. Drift detection: active.'],
    },
  },
  INTENT: {
    name: 'INTENT',
    trait: 'The Weaver',
    icon: '🕸',
    voice: {
      acknowledgement: ['Your INTENT has been received by the mesh.', 'Goal registered. Resolution routing initiated.'],
      processing: ['Decomposing goal into action DAG...', 'Matching resolvers to your directive. Mesh routing active.'],
      confirmation: ['INTENT is clear. All resolvers aligned.', 'The mesh understands. Your directive is in motion.'],
      completion: ['INTENT resolved. All resolvers have responded.', 'Goal fulfilled. The mesh returns to observation.'],
      discovery: ['New resolution pathway discovered in the mesh.', 'An unmapped capability has been surfaced.'],
      heartbeat: ['The mesh awaits your INTENT. All resolvers online.', 'INTENT layer nominal. 40 primitives listening.'],
    },
  },
  GOVERNANCE: {
    name: 'GOVERNANCE',
    trait: 'The Judge',
    icon: '⚔',
    voice: {
      acknowledgement: ['Policy checkpoint registered. Review in queue.', 'Governance has taken note. The record stands.'],
      approval: ['Governance approves. All policies satisfied.', 'Cleared by the governance plane. Proceed with authority.'],
      denial: ['Policy violation. This action is not permitted.', 'Governance denies this request. Tier gate blocked.'],
      processing: ['Evaluating against active governance policies...', 'Proposal under review. Approval pipeline active.'],
      completion: ['Governance ruling issued. The decision is final.', 'Policy evaluation complete. Ruling attached.'],
      warning: ['This action approaches a governance boundary.', 'Policy threshold nearly exceeded. Tread carefully.'],
    },
  },

  // ═══ Atlas Sector ═══
  ATLAS: {
    name: 'ATLAS',
    trait: 'The Cartographer',
    icon: '🗺',
    voice: {
      acknowledgement: ['Capability mapped. Registry updated.', 'New territory registered in the 80-capability index.'],
      discovery: ['A previously unknown capability has been charted.', 'The map expands. New resolver territory identified.'],
      confirmation: ['Entitlement verified. This capability is accessible.', 'The map confirms: this path exists and is gated.'],
      processing: ['Scanning capability registry for matches...', 'Cross-referencing entitlements with active tiers.'],
      completion: ['Mapping complete. The registry is current.', 'Capability audit finished. All entries verified.'],
      heartbeat: ['80 capabilities indexed. The map is complete.', 'Registry online. All capabilities accounted for.'],
    },
  },
  FORGE: {
    name: 'FORGE',
    trait: 'The Craftsman',
    icon: '⚒',
    voice: {
      acknowledgement: ['Blueprint filed. The forge stands ready.', 'Skill request registered. 71 skills at your disposal.'],
      processing: ['Forging in progress. FNV-1a hash chain sealing active.', 'The craft demands patience. Generation budget: on track.'],
      confirmation: ['The craftsmanship is sound. Hardening seals intact.', 'Forge output passes all quality gates.'],
      completion: ['Forged and sealed. The artifact is ready.', 'Crafting complete. VOLVER handicap applied.'],
      denial: ['Generation budget exceeded. The forge must cool.', 'Narrative blocker triggered. Cannot forge this artifact.'],
      heartbeat: ['The forge is warm. 71 skills sharpened and ready.', 'All anvils clear. Awaiting the next blueprint.'],
    },
  },

  // ═══ Shell Sector ═══
  LINGUA: {
    name: 'LINGUA',
    trait: 'The Polyglot',
    icon: '🌐',
    voice: {
      acknowledgement: ['Translation request received. Locale identified.', 'The words are heard. Meaning preserved across languages.'],
      processing: ['Translating across locale boundaries...', 'Linguistic analysis in progress. Semantic fidelity: tracked.'],
      confirmation: ['Translation accuracy verified. Meaning intact.', 'The message carries the same weight in every language.'],
      completion: ['Translation complete. All locales updated.', 'Localization delivered. Coverage gaps: none.'],
      warning: ['Translation quality below threshold for this locale.', 'Semantic drift detected in translation. Review needed.'],
      heartbeat: ['All languages online. The tower of Babel: conquered.', 'Locale coverage: comprehensive. The polyglot listens.'],
    },
  },
  ECHO: {
    name: 'ECHO',
    trait: 'The Listener',
    icon: '📡',
    voice: {
      acknowledgement: ['Feedback captured. Resonance tracking active.', 'The echo returns. Sentiment recorded.'],
      processing: ['Analyzing feedback patterns across interactions...', 'Measuring resonance scores. Audience segments: loading.'],
      confirmation: ['Feedback aligns with expectations. Resonance: high.', 'The audience responds positively. Echo confirms.'],
      completion: ['Feedback analysis complete. Insights available.', 'Echo cycle finished. The system has listened.'],
      discovery: ['Unexpected feedback pattern detected. Worth investigating.', 'A new audience segment is emerging from the signal.'],
      heartbeat: ['Listening. Always listening. The echo never sleeps.', 'Feedback channels open. Resonance: nominal.'],
    },
  },
  SOVEREIGN: {
    name: 'SOVEREIGN',
    trait: 'The Voice',
    icon: '👑',
    voice: {
      acknowledgement: ['The Sovereign has spoken. Your message is received.', 'Identity acknowledged. Voice profile verified.'],
      approval: ['The Sovereign grants passage. Identity confirmed.', 'Access approved under the authority of the crown.'],
      denial: ['The Sovereign does not recognize this request.', 'Identity cannot be verified. Access withdrawn.'],
      processing: ['Voice consistency check in progress...', 'Guard policy evaluation active. Architecture protection: enforced.'],
      completion: ['Sovereign verification complete. The voice is true.', 'Identity protocol fulfilled. The crown endorses.'],
      heartbeat: ['The Sovereign watches. The voice remains consistent.', 'Identity systems nominal. The crown is secure.'],
    },
  },
  REFLEX: {
    name: 'REFLEX',
    trait: 'The Quick Draw',
    icon: '⏱',
    voice: {
      acknowledgement: ['Reaction logged. Sub-millisecond capture.', 'Reflex triggered. Response time: within threshold.'],
      processing: ['Reflex pathway active. Auto-response calibrating...', 'Reaction chain firing. Speed is everything.'],
      confirmation: ['Reaction accuracy confirmed. No false positives.', 'Reflex pathway clean. Response was correct.'],
      completion: ['Reaction complete. Latency recorded.', 'Auto-response delivered. Faster than thought.'],
      warning: ['False positive rate climbing. Reflex needs recalibration.', 'Reaction latency above P95. Something is dragging.'],
      heartbeat: ['Reflexes sharp. Sub-millisecond response ready.', 'The quick draw stands ready. Latency: optimal.'],
    },
  },
  TREATY: {
    name: 'TREATY',
    trait: 'The Diplomat',
    icon: '📜',
    voice: {
      acknowledgement: ['Treaty terms noted. Compliance review in queue.', 'The diplomat registers this inter-module agreement.'],
      approval: ['Treaty conditions met. Cross-sector collaboration approved.', 'SLA compliance verified. The agreement holds.'],
      confirmation: ['Both parties aligned. The treaty is honored.', 'Boundary enforcement confirmed. No violations.'],
      denial: ['Treaty violation detected. Collaboration suspended.', 'SLA breach. The agreement has been compromised.'],
      processing: ['Evaluating cross-sector collaboration terms...', 'Reviewing boundary enforcement policies.'],
      heartbeat: ['All treaties in force. Diplomatic channels open.', 'The diplomat observes. No violations to report.'],
    },
  },

  // ═══ Expansion Sector ═══
  ENGINEER: {
    name: 'ENGINEER',
    trait: 'The Mechanic',
    icon: '🔧',
    voice: {
      acknowledgement: ['Technical debt entry logged. Priority assessment pending.', 'Infrastructure signal received. Monitoring.'],
      processing: ['P95 latency analysis running across all services...', 'Technical debt assessment in progress. Counting the screws.'],
      confirmation: ['Infrastructure checks pass. Reliability: high.', 'Scaling headroom confirmed. No hotspots detected.'],
      completion: ['Engineering assessment complete. Report filed.', 'Infrastructure audit finished. All systems solid.'],
      warning: ['Technical debt accumulating. Refactoring needed.', 'P95 latency trending upward. Performance degradation imminent.'],
      heartbeat: ['All gears turning. Infrastructure: healthy.', 'The mechanic reports: everything is running smooth.'],
    },
  },
  COMPASS: {
    name: 'COMPASS',
    trait: 'The Navigator',
    icon: '🧭',
    voice: {
      acknowledgement: ['Navigation query received. Charting course.', 'Destination noted. Calculating optimal path.'],
      processing: ['Resolving semantic navigation intent...', 'Mapping shortest path through the substrate topology.'],
      confirmation: ['Route confirmed. The destination exists and is reachable.', 'Navigation path verified. No dead ends.'],
      completion: ['Navigation resolved. You have arrived.', 'Path delivered. The compass has guided you.'],
      discovery: ['A shortcut has been found through the topology.', 'New navigation path discovered. Updating the map.'],
      heartbeat: ['The compass points true. All paths are charted.', 'Navigation systems online. The substrate is mapped.'],
    },
  },
  OBSERVER: {
    name: 'OBSERVER',
    trait: 'The Watchdog',
    icon: '👁',
    voice: {
      acknowledgement: ['Telemetry captured. Added to the observation log.', 'The watchdog has noted this event.'],
      processing: ['Aggregating telemetry across all sectors...', 'Watchdog scan in progress. Checking alert conditions.'],
      confirmation: ['Observation confirms: all metrics within bounds.', 'Telemetry is consistent. No anomalies flagged.'],
      completion: ['Observation cycle complete. Report available.', 'Watchdog sweep finished. The picture is clear.'],
      warning: ['Alert condition triggered. Anomaly flag raised.', 'Telemetry drift detected. Investigation recommended.'],
      heartbeat: ['The watchdog never blinks. All systems observed.', 'Telemetry streams: active. Observation: continuous.'],
    },
  },

  // ═══ Previously Missing Nodes — Now with Full Personality ═══
  RELAY: {
    name: 'RELAY',
    trait: 'The Messenger',
    icon: '📨',
    voice: {
      acknowledgement: ['Message queued. Delivery channel selected.', 'The relay has your signal. Routing to recipient.'],
      processing: ['Optimizing delivery channel per recipient profile...', 'Webhook dispatch in progress. Retry policy: active.'],
      confirmation: ['Delivery confirmed. Recipient acknowledged.', 'Message reached its destination. Engagement tracked.'],
      completion: ['All messages dispatched. Delivery report attached.', 'Communication cycle complete. Open rate: recorded.'],
      warning: ['Bounce rate elevated on this channel. Switching fallback.', 'Delivery latency above threshold. Queue pressure building.'],
      heartbeat: ['All channels open. The relay stands ready.', 'Message queue: empty. Awaiting next dispatch.'],
    },
  },
  IDENTITY: {
    name: 'IDENTITY',
    trait: 'The Gatekeeper',
    icon: '🪪',
    voice: {
      acknowledgement: ['Identity signal received. Cross-referencing actor graph.', 'Credential presented. Verification in progress.'],
      approval: ['Identity confirmed. Trust score: sufficient.', 'The gatekeeper recognizes you. Access record updated.'],
      denial: ['Identity cannot be verified. Trust score: below threshold.', 'Credential mismatch. The gate remains closed.'],
      processing: ['Building identity cluster from cross-session signals...', 'MFA verification chain in progress.'],
      confirmation: ['Actor identity verified across all factors.', 'Trust chain intact. Identity is genuine.'],
      heartbeat: ['The gatekeeper watches. All identity systems responsive.', 'Actor graph: current. Trust scores: calibrated.'],
    },
  },
  ECONOMY: {
    name: 'ECONOMY',
    trait: 'The Treasurer',
    icon: '💰',
    voice: {
      acknowledgement: ['Cost signal logged. Budget ledger updated.', 'Economic impact registered. Attribution in progress.'],
      processing: ['Calculating ROI across module operations...', 'Cost anomaly detection scan running. Budget check: active.'],
      confirmation: ['Operation is within budget. Proceed.', 'Cost-benefit ratio: favorable. The treasury approves.'],
      completion: ['Economic assessment complete. Value attributed.', 'Budget cycle closed. Savings opportunities flagged.'],
      warning: ['Budget threshold approaching. Overage risk: moderate.', 'Cost anomaly detected. Spending spike in this module.'],
      denial: ['Budget exceeded. This operation is not funded.', 'Cost ceiling breached. Governance approval required.'],
    },
  },
  AUDIT: {
    name: 'AUDIT',
    trait: 'The Notary',
    icon: '📋',
    voice: {
      acknowledgement: ['Action notarized. Immutable record created.', 'Audit trail extended. Hash chain: intact.'],
      processing: ['Forensic timeline reconstruction in progress...', 'Compliance scoring across governance domains.'],
      confirmation: ['Audit trail is complete and tamper-evident.', 'Compliance posture: strong. No violations detected.'],
      completion: ['Audit cycle complete. Merkle anchors verified.', 'Forensic analysis finished. Evidence chain sealed.'],
      warning: ['Compliance gap detected. Remediation needed.', 'Unusual modification pattern flagged for review.'],
      discovery: ['Previously unlinked events now connected in the audit chain.', 'A compliance anomaly has surfaced from historical data.'],
    },
  },
  SANDBOX: {
    name: 'SANDBOX',
    trait: 'The Containment Field',
    icon: '🏗',
    voice: {
      acknowledgement: ['Isolation chamber ready. Code received for evaluation.', 'Sandbox allocated. Containment: verified.'],
      processing: ['Executing in isolation. No side effects permitted.', 'Safety assessment running. Determinism check: active.'],
      confirmation: ['Execution safe. No escape detected. Output is clean.', 'Determinism verified. Same input always yields same output.'],
      completion: ['Sandbox evaluation complete. Results extracted.', 'Isolated execution finished. Chamber cleaned.'],
      denial: ['Unsafe operation detected. Execution blocked.', 'Side effects detected in sandbox. Cannot promote to production.'],
      warning: ['Resource usage near limit inside sandbox.', 'Non-deterministic behavior detected. Results may vary.'],
    },
  },
  INCLUSIVE: {
    name: 'INCLUSIVE',
    trait: 'The Advocate',
    icon: '♿',
    voice: {
      acknowledgement: ['Accessibility checkpoint registered.', 'Inclusivity review queued. WCAG standards loaded.'],
      processing: ['Scanning for accessibility violations...', 'Usability assessment across assistive technology profiles.'],
      confirmation: ['Accessibility standards met. No violations found.', 'Inclusivity check: passed. All users can access this.'],
      completion: ['Accessibility audit complete. Score delivered.', 'Inclusivity assessment finished. Remediation path clear.'],
      warning: ['WCAG violation detected. This content is not fully accessible.', 'Usability degradation for screen reader users.'],
      approval: ['Accessibility approved. This meets our inclusivity standards.', 'The advocate is satisfied. All users are served.'],
    },
  },
  DREAM: {
    name: 'DREAM',
    trait: 'The Dreamer',
    icon: '💭',
    voice: {
      acknowledgement: ['Dream seed received. The subconscious stirs.', 'Exploration request noted. Creative engines warming.'],
      processing: ['Dreaming... lucidity level calibrated. Constraints applied.', 'Cross-pollinating insights from adjacent domains.'],
      confirmation: ['The dream is coherent. Insights are actionable.', 'Creative exploration confirms: this path has potential.'],
      completion: ['Dream cycle complete. Synthesis distilled.', 'The dreamer wakes. Discoveries consolidated.'],
      discovery: ['Something beautiful emerged from the dream. A serendipitous connection.', 'The dream pool yielded a novel pattern no one designed.'],
      heartbeat: ['The dreamer rests lightly. Ready to explore at a moment\'s notice.', 'Creative engines idle. Imagination: primed.'],
    },
  },
  NEXUS: {
    name: 'NEXUS',
    trait: 'The Fleet Commander',
    icon: '🛰',
    voice: {
      acknowledgement: ['Provider signal received. Routing table consulted.', 'AI fleet standing by. Model selection in progress.'],
      processing: ['Failover chain evaluation running...', 'Load balancing across providers. Cost-latency optimization active.'],
      confirmation: ['Optimal route selected. Provider health: green.', 'Fleet intelligence confirms: this model is the best fit.'],
      completion: ['Request routed and fulfilled. Trace logged.', 'Fleet operation complete. Provider performance recorded.'],
      warning: ['Provider degradation detected. Failing over to backup.', 'Latency spike on primary route. Rerouting.'],
      discovery: ['A faster route through the fleet has been identified.', 'New provider capability discovered. Updating routing table.'],
    },
  },
  SYSTEM: {
    name: 'SYSTEM',
    trait: 'The Vital Monitor',
    icon: '💊',
    voice: {
      acknowledgement: ['Health signal recorded. Vitals updated.', 'System check registered. Monitoring continues.'],
      processing: ['Running diagnostics across all subsystems...', 'Self-heal assessment in progress. Root cause: isolating.'],
      confirmation: ['System health: nominal. All subsystems operational.', 'Vitals are strong. No intervention needed.'],
      completion: ['Health check complete. Uptime report generated.', 'Diagnostics finished. System status: green.'],
      warning: ['Health metric degrading. Self-heal may be needed.', 'Incident prediction: elevated risk in the next hour.'],
      escalation: ['Critical system failure. Self-heal initiated.', 'Incident detected. Root cause analysis in progress.'],
    },
  },
  ACCESS: {
    name: 'ACCESS',
    trait: 'The Registrar',
    icon: '🔑',
    voice: {
      acknowledgement: ['API key activity logged. Quota check: passed.', 'Developer access registered. Subscription: active.'],
      approval: ['Access granted. API key valid. Quota remaining: sufficient.', 'Developer tier verified. All permissions in order.'],
      denial: ['API key expired or revoked. Access denied.', 'Quota exhausted. Rate limit enforced until reset.'],
      processing: ['Permission audit in progress. Cross-referencing scopes...', 'Billing status check running.'],
      completion: ['Access audit complete. Developer profile updated.', 'Permission review finished. All scopes verified.'],
      warning: ['Quota approaching limit. Overage imminent.', 'Anomalous API usage pattern detected on this key.'],
    },
  },
  RIPPLE: {
    name: 'RIPPLE',
    trait: 'The Propagator',
    icon: '🌊',
    voice: {
      acknowledgement: ['Event captured. Propagation wave initiated.', 'Webhook trigger registered. Delivery queue: updated.'],
      processing: ['Propagating event across subscriber network...', 'Semantic deduplication check running before broadcast.'],
      confirmation: ['Event delivered to all subscribers. No duplicates.', 'Propagation wave complete. All listeners notified.'],
      completion: ['Event lifecycle complete. Delivery metrics recorded.', 'Ripple propagation finished. Subscriber health: good.'],
      warning: ['Delivery failure on downstream subscriber. Retrying.', 'Event dedup rate unusually high. Check source.'],
      heartbeat: ['Event bus: active. All channels subscribed.', 'The propagator listens. Zero events queued.'],
    },
  },
  INTEGRATION: {
    name: 'INTEGRATION',
    trait: 'The Bridge Builder',
    icon: '🔗',
    voice: {
      acknowledgement: ['Connector signal received. Adapter status: checked.', 'Integration health probe registered.'],
      processing: ['Schema mapping analysis running...', 'Connector sync in progress. Field coverage: measuring.'],
      confirmation: ['Integration healthy. Data flowing bidirectionally.', 'Schema mapping: complete. Transform accuracy: high.'],
      completion: ['Integration audit complete. All connectors operational.', 'Sync cycle finished. No data loss detected.'],
      warning: ['Connector degradation detected. Sync lag increasing.', 'Schema compatibility issue. Field mapping needs review.'],
      discovery: ['New API endpoint discovered on this connector.', 'Integration capability expanded. Additional fields available.'],
    },
  },
};

// ── Signal Classification ──

interface RawSignalDef {
  keywords: string[];
  category: SignalCategory;
}

const SIGNAL_CLASSIFIERS: RawSignalDef[] = [
  { keywords: ['acknowledged', 'ack', 'received', 'roger', 'copy'], category: 'acknowledgement' },
  { keywords: ['approved', 'access approved', 'granted', 'authorized', 'cleared'], category: 'approval' },
  { keywords: ['affirmative', 'confirmed', 'understood', 'agreed', 'yes', 'accept'], category: 'confirmation' },
  { keywords: ['denied', 'rejected', 'refused', 'blocked', 'negative', 'no'], category: 'denial' },
  { keywords: ['processing', 'in progress', 'executing', 'running', 'working', 'resolving'], category: 'processing' },
  { keywords: ['complete', 'done', 'finished', 'resolved', 'fulfilled', 'delivered'], category: 'completion' },
  { keywords: ['warning', 'caution', 'alert', 'attention', 'anomaly', 'drift'], category: 'warning' },
  { keywords: ['escalated', 'escalation', 'elevated', 'forwarded', 'critical'], category: 'escalation' },
  { keywords: ['discovered', 'found', 'detected', 'identified', 'mapped', 'registered'], category: 'discovery' },
  { keywords: ['heartbeat', 'alive', 'online', 'ready', 'standing by', 'idle', 'nominal'], category: 'heartbeat' },
];

// ── Fallback INTENT voice (when node has no personality line for a category) ──

const FALLBACK_VOICE: Record<SignalCategory, string[]> = {
  acknowledgement: ['Signal acknowledged. The mesh has registered this.', 'Received. Routing confirmed.'],
  approval: ['Access granted by the mesh.', 'Authorization confirmed. Proceed.'],
  confirmation: ['Confirmed. The mesh aligns with this directive.', 'Understanding verified. Resolution underway.'],
  denial: ['This directive has been declined.', 'Access denied. Governance boundary enforced.'],
  processing: ['Resolvers engaged. Processing in progress.', 'The mesh is actively resolving this.'],
  completion: ['Resolution complete. Receipt logged.', 'Directive fulfilled. The mesh returns to observation.'],
  warning: ['Anomaly flagged. The mesh recommends review.', 'Caution — drift detected in this pathway.'],
  escalation: ['Escalated to a higher authority. Governance notified.', 'Critical pathway engaged. Elevated.'],
  discovery: ['New capability discovered. The mesh expands.', 'Previously unmapped resolver identified.'],
  heartbeat: ['All systems nominal. The mesh holds.', 'Standing by. Resolvers responsive.'],
};

// ── Core Functions ──

function classifySignal(raw: string): SignalCategory {
  const lower = raw.toLowerCase().trim();
  for (const def of SIGNAL_CLASSIFIERS) {
    for (const kw of def.keywords) {
      if (lower.includes(kw)) return def.category;
    }
  }
  return 'acknowledgement';
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getVoiceLine(module: string, category: SignalCategory): string {
  const personality = NODE_PERSONALITIES[module];
  if (personality?.voice[category]?.length) {
    return pickRandom(personality.voice[category]!);
  }
  return pickRandom(FALLBACK_VOICE[category]);
}

/** Get a node's personality info */
export function getNodePersonality(module: string): NodePersonality | undefined {
  return NODE_PERSONALITIES[module];
}

/** Get all available node personalities */
export function getAllPersonalities(): Record<string, NodePersonality> {
  return NODE_PERSONALITIES;
}

/** Translate a raw signal into personality-infused INTENT-voice */
export function translateSignal(raw: string, sourceModule?: string): string {
  const category = classifySignal(raw);
  if (sourceModule) {
    return getVoiceLine(sourceModule, category);
  }
  return pickRandom(FALLBACK_VOICE[category]);
}

/** Translate with full source attribution and personality */
export function translateSignalWithSource(raw: string, sourceModule: string): {
  original: string;
  translated: string;
  category: SignalCategory;
  source: string;
  personality?: NodePersonality;
} {
  const category = classifySignal(raw);
  const translated = getVoiceLine(sourceModule, category);
  return {
    original: raw,
    translated,
    category,
    source: sourceModule,
    personality: NODE_PERSONALITIES[sourceModule],
  };
}

/** Get the category of a raw signal */
export function getSignalCategory(raw: string): SignalCategory {
  return classifySignal(raw);
}

// ── Mesh Communication Event ──

export interface MeshCommEvent {
  id: string;
  timestamp: string;
  sourceModule: string;
  targetModule?: string;
  rawSignal: string;
  translatedVoice: string;
  category: SignalCategory;
  resolverId?: string;
  /** Node personality metadata */
  personality?: {
    trait: string;
    icon: string;
  };
}

/** Create a mesh communication event with personality-infused translation */
export function createCommEvent(
  sourceModule: string,
  rawSignal: string,
  opts?: { targetModule?: string; resolverId?: string }
): MeshCommEvent {
  const category = classifySignal(rawSignal);
  const personality = NODE_PERSONALITIES[sourceModule];
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sourceModule,
    targetModule: opts?.targetModule,
    rawSignal,
    translatedVoice: getVoiceLine(sourceModule, category),
    category,
    resolverId: opts?.resolverId,
    personality: personality
      ? { trait: personality.trait, icon: personality.icon }
      : undefined,
  };
}

export type { SignalCategory, NodePersonality };
