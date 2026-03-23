# Auto-Activation Capability Registry

**Version:** 3.0.0 (150 Rules)  
**Date:** 2026-03-23  
**Author:** Substrate Engine  

---

## Overview

The substrate's autonomic nervous system transforms 150 capabilities into event-reactive behaviors. Each rule defines a capability that activates automatically when specific system signals match predefined conditions.

**Architecture:**
```
System Event → Signal Match → Arbitration → Confidence Gate → Guard Layer → Execute → Telemetry
```

---

## Tier Classification

| Tier | Code | Response Time | Count | Purpose |
|------|------|--------------|-------|---------|
| **T1** | `T1_CRITICAL` | < 100ms | 18 | Immediate security & stability |
| **T2** | `T2_OPERATIONAL` | < 500ms | 24 | Fast infrastructure response |
| **T3** | `T3_INTELLIGENCE` | < 2s | 26 | Learning & predictive capabilities |
| **T4** | `T4_OPTIMIZATION` | < 5s | 18 | Background performance tuning |
| **T5** | `T5_AUTONOMOUS` | Idle-triggered | 14 | Self-improvement cycles |

---

## Wave 1 — Foundation (ACT_001–ACT_050)

### T1 — Critical (001–010)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_001 | Threat Neutralization | DEFENSE | `defense.threat_detected` | ≥7 | 5s | Engages kill-chain correlation and actor quarantine |
| ACT_002 | Cascade Containment | NERVE | `nerve.cascade_detected` | ≥8 | 3s | Activates cascade failure detector and isolation boundaries |
| ACT_003 | Session Kill on Leakage | SHADOW | `shadow.data_leakage` | ≥9 | 2s | Immediately terminates compromised sessions and isolates actor |
| ACT_004 | Zero-Day Shield | IMMUNITY | `defense.unknown_signature` | ≥8 | 5s | Deploys behavioral analysis and signature-less threat blocking |
| ACT_005 | Privilege Escalation Block | ACCESS | `access.privilege_escalation` | ≥9 | 1s | Revokes elevated permissions and quarantines requesting identity |
| ACT_006 | Privacy Budget Alarm | PHANTOM | `phantom.privacy_budget_exceeded` | ≥8 | 10s | Halts data operations and re-calibrates noise injection thresholds |
| ACT_007 | Circuit Breaker Trip | NERVE | `nerve.breaker_tripped` | ≥7 | 5s | Engages predictive circuit breaker with Z-score trend analysis |
| ACT_008 | Exfiltration Block | SHADOW | `defense.exfiltration_attempt` | ≥9 | 2s | Blocks outbound data channels and alerts governance |
| ACT_009 | Sovereign Jurisdiction Lock | SOVEREIGN | `sovereign.jurisdiction_violation` | ≥8 | 30s | Enforces data residency rules and blocks cross-boundary transfers |
| ACT_010 | Integrity Violation Response | AUDIT | `audit.integrity_violation` | ≥9 | 5s | Freezes affected data paths and initiates forensic chain verification |

### T2 — Operational (011–020)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_011 | Adaptive Route Optimization | RELAY | `relay.latency_spike` | ≥5 | 15s | Re-scores routing adjacency matrix and redirects traffic (>500ms latency) |
| ACT_012 | Backpressure Engagement | NERVE | `nerve.queue_depth_warning` | ≥6 | 10s | Engages adaptive backpressure calibrator with EMA tuning (>75% queue) |
| ACT_013 | Self-Heal Trigger | MEDIC | `medic.health_degraded` | ≥6 | 30s | Initiates targeted repair sequence on degraded module |
| ACT_014 | Cortex Load Shedding | CORTEX | `cortex.pipeline_overload` | ≥6 | 20s | Activates predictive load shedding and task redistribution (>50 queued) |
| ACT_015 | Dead Letter Recovery | NERVE | `nerve.dlq_threshold` | ≥5 | 60s | Batch-retries eligible dead letters with exponential backoff (>20 DLQ) |
| ACT_016 | Provider Failover | NEXUS | `nexus.provider_down` | ≥7 | 10s | Reranks provider health scores and reroutes to backup |
| ACT_017 | Topology Self-Repair | NERVE | `nerve.topology_broken` | ≥6 | 30s | Rebuilds communication topology and re-registers edges |
| ACT_018 | Quota Burst Protection | ECONOMY | `economy.quota_warning` | ≥5 | 60s | Applies rate limiting and alerts on projected overage (>85% usage) |
| ACT_019 | Config Drift Correction | SYSTEM | `system.config_drift` | ≥5 | 120s | Detects runtime config divergence and applies correction patches |
| ACT_020 | Heartbeat Zombie Detection | NERVE | `nerve.heartbeat_anomaly` | ≥6 | 30s | Fingerprints zombie nodes and initiates recovery protocol |

### T3 — Intelligence (021–030)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_021 | Memory Tier Promotion | MEMORY | `memory.access_frequency_spike` | ≥3 | 60s | Promotes hot memories from Cold/Warm to Hot tier via EMA scoring (>10 accesses) |
| ACT_022 | Anomaly Prediction | ORACLE | `oracle.pattern_anomaly` | ≥4 | 120s | Runs Bayesian network prediction on detected anomaly patterns |
| ACT_023 | Behavioral Drift Alert | OBSERVER | `observer.drift_detected` | ≥4 | 300s | Analyzes behavioral baseline deviation and flags for review |
| ACT_024 | Knowledge Graph Update | BRAIN | `brain.new_knowledge_edge` | ≥2 | 60s | Integrates new knowledge edges via Hebbian pathway strengthening |
| ACT_025 | Mutation Shadow Testing | SHADOW | `evolution.mutation_proposed` | ≥3 | 120s | Auto-shadows proposed mutations with A/B verdict scoring |
| ACT_026 | Causal Inference Activation | BRAIN | `nerve.correlation_detected` | ≥4 | 180s | Runs Pearl causal hierarchy analysis on correlated signal chains |
| ACT_027 | Context Enrichment Injection | MEMORY | `decode.context_gap` | ≥3 | 30s | Augments conversation context with semantic memory retrieval |
| ACT_028 | Skill Proficiency Boost | EVOLUTION | `evolution.skill_gap_detected` | ≥3 | 300s | Triggers focused CLM study sessions on weakest proficiency areas |
| ACT_029 | Heuristic Refinement Cycle | DREAM | `dream.heuristic_stale` | ≥3 | 600s | Consolidates recent execution data to refine decision heuristics |
| ACT_030 | Semantic Similarity Reindex | BRAIN | `memory.index_stale` | ≥2 | 600s | Rebuilds cross-tier semantic index with updated FNV-1a hashes |

### T4 — Optimization (031–040)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_031 | Provider Health Reranking | NEXUS | `nexus.health_check_complete` | ≥0 | 300s | Recomputes provider reliability rankings from latest health data |
| ACT_032 | Pipeline Bottleneck Analysis | CORTEX | `cortex.throughput_drop` | ≥4 | 120s | Identifies critical path bottlenecks and reallocates resources |
| ACT_033 | Resource Leak Detection | ENGINEER | `system.memory_pressure` | ≥5 | 300s | Scans for resource leaks and orphaned allocations |
| ACT_034 | Technical Debt Quantification | ENGINEER | `engineer.maintenance_window` | ≥0 | 3600s | Calculates and reports current technical debt metrics |
| ACT_035 | SLA Compliance Check | TREATY | `treaty.sla_check_due` | ≥0 | 600s | Evaluates all active SLA constraints against current performance |
| ACT_036 | Telemetry Aggregation Sweep | ANALYTICS | `analytics.aggregation_due` | ≥0 | 600s | Compresses and aggregates raw telemetry into summary snapshots |
| ACT_037 | Canary Deployment Validation | ENGINEER | `evolution.upgrade_deployed` | ≥3 | 300s | Monitors canary metrics and auto-rolls-back on regression |
| ACT_038 | Intent Amplification Tuning | INTENT | `intent.resolution_accuracy_drop` | ≥4 | 300s | Re-calibrates intent routing weights based on recent accuracy data |
| ACT_039 | Cross-Engine Impact Analysis | ENGINEER | `engineer.change_proposed` | ≥3 | 120s | Simulates blast radius of proposed engine changes across modules |
| ACT_040 | Compass Spatial Reindex | COMPASS | `compass.spatial_index_stale` | ≥2 | 600s | Rebuilds R-tree spatial index for optimal temporal-spatial queries |

### T5 — Autonomous (041–050)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_041 | Dream Consolidation Cycle | DREAM | `system.idle_detected` | ≥0 | 30min | Runs full sleep-cycle memory consolidation and dream synthesis |
| ACT_042 | Evolution Fitness Sweep | EVOLUTION | `system.idle_detected` (>60s idle) | ≥0 | 1hr | Evaluates all module fitness scores and proposes upgrade candidates |
| ACT_043 | Forge Discovery Sweep | FORGE | `system.idle_detected` (>120s idle) | ≥0 | 1hr | Explores combinatorial capability space for novel pipeline discoveries |
| ACT_044 | Ethics Baseline Refresh | CONSCIENCE | `system.idle_detected` (>300s idle) | ≥0 | 2hr | Re-evaluates ethical constraint baselines against recent decisions |
| ACT_045 | Echo Twin Synchronization | ECHO | `echo.twin_divergence` | ≥3 | 10min | Resynchronizes digital twin state with live substrate metrics |
| ACT_046 | Reflex Edge Calibration | REFLEX | `reflex.calibration_due` | ≥0 | 30min | Re-calibrates edge computing decision thresholds from recent data |
| ACT_047 | Lingua Translation Model Refresh | LINGUA | `lingua.translation_drift` | ≥3 | 1hr | Recalibrates translation quality scoring from accumulated feedback |
| ACT_048 | Governance Policy Audit | GOVERNANCE | `system.idle_detected` (>600s idle) | ≥0 | 2hr | Full governance policy sweep verifying all constraint satisfaction |
| ACT_049 | Atlas Knowledge Map Refresh | ATLAS | `atlas.map_stale` | ≥2 | 1hr | Rebuilds the global knowledge topology map with new discoveries |
| ACT_050 | Harvest ETL Pipeline Optimization | HARVEST | `harvest.pipeline_inefficiency` | ≥3 | 30min | Analyzes ETL pipeline bottlenecks and restructures data flow |

---

## Wave 2 — Deep Systems (ACT_051–ACT_100)

### T1 — Critical (051–058)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_051 | Immune Response Orchestration | IMMUNITY | `immunity.pathogen_detected` | ≥8 | 5s | Full immune response: isolate, neutralize, generate antibody rules |
| ACT_052 | Quarantine Zone Activation | IMMUNITY | `defense.infection_spreading` | ≥9 | 3s | Isolates infected modules in quarantine zones with network fencing |
| ACT_053 | Identity Theft Response | IDENTITY | `identity.identity_collision` | ≥8 | 5s | Resolves identity conflicts and locks compromised credentials |
| ACT_054 | Tamper Detection Alert | AUDIT | `audit.tamper_detected` | ≥9 | 2s | Freezes audit chain, validates Merkle tree, preserves evidence |
| ACT_055 | Outbreak Containment | IMMUNITY | `immunity.outbreak_detected` (≥3 nodes) | ≥9 | 5s | Multi-node containment with propagation blocking and sentinel coordination |
| ACT_056 | Governance Emergency Override | GOVERNANCE | `governance.emergency_escalation` | ≥9 | 10s | Escalates to highest governance authority with emergency powers |
| ACT_057 | Fault Domain Isolation | NERVE | `nerve.fault_domain_breach` | ≥8 | 5s | Isolates fault domains to prevent cross-boundary failure propagation |
| ACT_058 | Poison Message Quarantine | RELAY | `relay.poison_message` | ≥7 | 3s | Quarantines toxic messages, alerts origin node, preserves forensics |

### T2 — Operational (059–070)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_059 | Graceful Shutdown Orchestration | NERVE | `system.shutdown_requested` | ≥5 | 30s | Drains in-flight signals, persists state, coordinates ordered node shutdown |
| ACT_060 | Relay Failover Engagement | RELAY | `relay.channel_down` | ≥7 | 10s | Activates backup relay channels and reroutes message traffic |
| ACT_061 | Warm Standby Activation | NERVE | `nerve.primary_degraded` | ≥6 | 30s | Promotes warm standby nodes to active and begins state sync |
| ACT_062 | Traffic Shaping Engagement | NERVE | `nerve.traffic_burst` (>3x burst) | ≥5 | 15s | Shapes traffic with priority queuing and burst absorption |
| ACT_063 | Connection Pool Recovery | NERVE | `nerve.pool_exhaustion` | ≥6 | 20s | Evicts stale connections, expands pool, applies health checks |
| ACT_064 | Retry Budget Enforcement | NERVE | `nerve.retry_storm` (>50/s retries) | ≥6 | 30s | Caps retry budgets to prevent thundering herd and cascading retries |
| ACT_065 | Fan-Out Coordination | RELAY | `cortex.broadcast_requested` | ≥3 | 10s | Coordinates multi-target message delivery with backpressure awareness |
| ACT_066 | Self-Healing Trigger | IMMUNITY | `medic.repair_needed` | ≥5 | 60s | Triggers immune-system self-healing with recovery playbooks |
| ACT_067 | Consumer Group Rebalance | RELAY | `relay.consumer_imbalance` | ≥4 | 60s | Rebalances message consumer groups for even load distribution |
| ACT_068 | Engine Graceful Restart | ENGINEER | `engineer.engine_unresponsive` | ≥7 | 60s | Gracefully restarts unresponsive engine with state preservation |
| ACT_069 | Schema Evolution Management | ENCODE | `encode.schema_mismatch` | ≥5 | 120s | Manages schema migration with backward compatibility validation |
| ACT_070 | Incident Response Automation | DEFENSE | `defense.incident_declared` | ≥6 | 30s | Executes automated incident response playbook with notification |

### T3 — Intelligence (071–082)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_071 | Latent Pattern Extraction | DREAM | `brain.pattern_cluster_found` | ≥3 | 300s | Extracts latent patterns from accumulated signal clusters |
| ACT_072 | Scenario Simulation Launch | ORACLE | `oracle.forecast_divergence` | ≥4 | 300s | Runs Monte Carlo simulations on divergent forecasts |
| ACT_073 | Bias Detection Scan | CONSCIENCE | `conscience.fairness_drift` | ≥4 | 600s | Scans recent decisions for systematic bias patterns |
| ACT_074 | Threat Intelligence Aggregation | IMMUNITY | `defense.new_threat_intel` | ≥3 | 300s | Aggregates threat intelligence into immune memory bank |
| ACT_075 | Anomaly Root Cause Analysis | ANALYTICS | `analytics.anomaly_cluster` | ≥5 | 120s | Traces anomaly clusters to root causes via causal graph |
| ACT_076 | Immune Learning Cycle | IMMUNITY | `immunity.threat_resolved` | ≥2 | 300s | Learns from resolved threats to strengthen future responses |
| ACT_077 | Predictive Model Recalibration | ORACLE | `oracle.prediction_error_high` (>15%) | ≥4 | 600s | Recalibrates Bayesian prediction models using recent outcomes |
| ACT_078 | Metric Correlation Discovery | ANALYTICS | `analytics.new_data_batch` (>100 pts) | ≥2 | 600s | Discovers hidden correlations between system metrics |
| ACT_079 | Creative Mutation Generation | FORGE | `evolution.stagnation_detected` | ≥3 | 600s | Generates creative capability mutations to break stagnation |
| ACT_080 | Data Lineage Tracking | AUDIT | `audit.lineage_gap` | ≥4 | 300s | Traces data provenance chains to fill lineage gaps |
| ACT_081 | Forecast Confidence Scoring | ORACLE | `oracle.forecast_generated` | ≥0 | 120s | Scores forecast reliability using historical accuracy |
| ACT_082 | Behavioral Baseline Rebuild | IMMUNITY | `immunity.baseline_stale` | ≥2 | 1hr | Rebuilds behavioral baselines from recent traffic patterns |

### T4 — Optimization (083–092)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_083 | Attack Surface Mapping | DEFENSE | `defense.surface_scan_due` | ≥0 | 1hr | Maps complete attack surface and identifies newly exposed vectors |
| ACT_084 | Policy Conflict Detection | GOVERNANCE | `governance.policy_updated` | ≥2 | 300s | Scans for conflicting governance policies after updates |
| ACT_085 | Permission Graph Audit | IDENTITY | `identity.permission_audit_due` | ≥0 | 1hr | Traverses permission graph to detect over-privileged paths |
| ACT_086 | Relay Topology Optimization | RELAY | `relay.topology_suboptimal` | ≥3 | 600s | Restructures relay topology for minimal latency |
| ACT_087 | Encoding Performance Profile | ENCODE | `encode.encoding_slow` | ≥4 | 300s | Profiles encoding pipeline bottlenecks |
| ACT_088 | Dynamic Pricing Adjustment | ECONOMY | `economy.demand_shift` | ≥3 | 600s | Adjusts pricing models based on demand elasticity |
| ACT_089 | Compliance Gap Analysis | GOVERNANCE | `governance.regulation_change` | ≥3 | 600s | Identifies compliance gaps from regulatory changes |
| ACT_090 | Data Quality Scoring | HARVEST | `harvest.ingestion_complete` | ≥0 | 300s | Scores freshly ingested data for completeness and accuracy |
| ACT_091 | Simulation Drift Correction | ECHO | `echo.simulation_drift` | ≥4 | 300s | Corrects drift between digital twin and live state |
| ACT_092 | Preventive Maintenance Scheduling | ENGINEER | `engineer.decay_threshold_crossed` | ≥3 | 30min | Schedules preventive maintenance based on EMA projections |

### T5 — Autonomous (093–100)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_093 | Nocturnal Optimization Run | DREAM | `system.idle_detected` (>180s) | ≥0 | 2hr | Full nocturnal optimization: defrag, index rebuilds, cache warming |
| ACT_094 | Resilience Stress Testing | IMMUNITY | `system.idle_detected` (>600s) | ≥0 | 2hr | Chaos-engineering stress tests against immune defenses |
| ACT_095 | Orphan Account Cleanup | IDENTITY | `system.idle_detected` (>300s) | ≥0 | 2hr | Scans for orphaned accounts, expired tokens, stale sessions |
| ACT_096 | Artifact Recombination Discovery | FORGE | `system.idle_detected` (>240s) | ≥0 | 1hr | Recombines existing artifacts to discover novel compositions |
| ACT_097 | Immune Strength Assessment | IMMUNITY | `system.idle_detected` (>120s) | ≥0 | 1hr | Comprehensive immune strength assessment across all layers |
| ACT_098 | Control Effectiveness Audit | AUDIT | `system.idle_detected` (>600s) | ≥0 | 2hr | Scores effectiveness of all security controls |
| ACT_099 | Idea Incubation Cycle | DREAM | `system.idle_detected` (>900s) | ≥0 | 2hr | Incubates promising but unvalidated ideas from discovery memory chain |
| ACT_100 | Cross-Domain Policy Harmonization | GOVERNANCE | `system.idle_detected` (>600s) | ≥0 | 2hr | Harmonizes policies across governance domains |

---

## Wave 3 — Apex Autonomy (ACT_101–ACT_150)

### T1 — Critical (101–108)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_101 | Phantom Counter-Intelligence Deploy | PHANTOM | `shadow.covert_intrusion` | ≥8 | 5s | Deploys counter-intelligence honeypots and canary tokens along intrusion path |
| ACT_102 | Shadow Session Forensics | SHADOW | `shadow.session_compromise` | ≥9 | 3s | Captures full session forensics before termination, preserving attack evidence |
| ACT_103 | Nerve Signal Storm Dampener | NERVE | `nerve.signal_storm` (>500/s) | ≥8 | 5s | Emergency backpressure activation with critical signal buffering during storms |
| ACT_104 | Immunity Antibody Generation | IMMUNITY | `immunity.novel_pathogen` | ≥8 | 10s | Generates targeted antibody rules from novel pathogen signatures |
| ACT_105 | Defense Kill-Chain Interrupt | DEFENSE | `defense.kill_chain_advanced` (stage≥4) | ≥9 | 3s | Interrupts active kill-chain by severing lateral movement paths |
| ACT_106 | Sovereign Emergency Data Lock | SOVEREIGN | `sovereign.data_residency_breach` | ≥9 | 5s | Locks all cross-border data transfers and freezes affected records |
| ACT_107 | Governance Emergency Tribunal | GOVERNANCE | `conscience.systemic_ethical_concern` | ≥9 | 30s | Convenes emergency tribunal for systemic ethical violations |
| ACT_108 | Relay Poison Pill Ejection | RELAY | `relay.recursive_poison` | ≥8 | 2s | Ejects recursive poison messages that cause infinite relay loops |

### T2 — Operational (109–120)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_109 | Cortex Pipeline Fusion | CORTEX | `cortex.pipeline_redundancy` (>3) | ≥4 | 120s | Merges redundant memory chains into optimized fusion, reducing overhead 40%+ |
| ACT_110 | Medic Predictive Triage | MEDIC | `medic.degradation_trend` | ≥5 | 60s | Predicts node failures 15 min ahead using EMA decay analysis |
| ACT_111 | Nexus Smart Routing | NEXUS | `nexus.route_suboptimal` | ≥4 | 30s | Re-evaluates provider routing using real-time latency and cost scoring |
| ACT_112 | Economy Cost Anomaly Alert | ECONOMY | `economy.cost_anomaly` (>50% deviation) | ≥6 | 60s | Detects sudden cost spikes and throttles expensive operations |
| ACT_113 | System Hot-Path Cache Warm | SYSTEM | `system.cache_miss_spike` (>30% miss) | ≥4 | 120s | Pre-warms hot-path caches based on predictive access patterns |
| ACT_114 | Inclusive Accessibility Auto-Fix | INCLUSIVE | `inclusive.accessibility_violation` | ≥5 | 120s | Automatically patches WCAG violations in generated content |
| ACT_115 | Vision Anomaly Correlator | VISION | `vision.multi_anomaly` (≥3) | ≥5 | 60s | Correlates multiple anomalies to identify systemic root cause |
| ACT_116 | Atlas Capability Deduplication | ATLAS | `atlas.capability_overlap` | ≥3 | 300s | Detects and merges overlapping capabilities to reduce bloat |
| ACT_117 | Sandbox Escape Prevention | SANDBOX | `sandbox.escape_attempt` | ≥7 | 10s | Freezes sandbox, captures forensic snapshot, alerts defense |
| ACT_118 | Integration Protocol Negotiation | INTEGRATION | `integration.protocol_mismatch` | ≥5 | 30s | Auto-negotiates compatible protocol version between services |
| ACT_119 | Audit Chain Integrity Validator | AUDIT | `audit.chain_gap_detected` | ≥6 | 120s | Validates entire Merkle chain and repairs gaps via reconstruction |
| ACT_120 | Observer Z-Score Alert | OBSERVER | `observer.zscore_threshold` (>3σ) | ≥5 | 60s | Fires targeted alerts when any metric Z-score exceeds 3σ |

### T3 — Intelligence (121–134)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_121 | Brain Associative Graph Expansion | BRAIN | `brain.graph_saturation` | ≥3 | 300s | Expands associative memory graph via Hebbian learning |
| ACT_122 | Oracle Monte Carlo Forecast | ORACLE | `oracle.high_uncertainty_forecast` (>0.3) | ≥4 | 300s | Runs 1000-iteration Monte Carlo simulation to bound uncertainty |
| ACT_123 | Dream Lucid Synthesis | DREAM | `dream.lucid_state_achieved` | ≥3 | 600s | Synthesizes novel architectural patterns during lucid dream states |
| ACT_124 | Compass Trend Prediction | COMPASS | `compass.emerging_trend` | ≥3 | 300s | Projects emerging trends using temporal-spatial regression models |
| ACT_125 | Echo What-If Simulator | ECHO | `evolution.change_proposed` | ≥3 | 120s | Runs digital twin what-if simulations before system changes deploy |
| ACT_126 | Conscience Fairness Audit | CONSCIENCE | `conscience.disparity_detected` | ≥4 | 600s | Deep audit of all decisions for systematic fairness violations |
| ACT_127 | Forge Recombinant Discovery | FORGE | `forge.recombination_opportunity` | ≥2 | 600s | Discovers novel capabilities by recombining artifact primitives |
| ACT_128 | Lingua Cross-Modal Translation | LINGUA | `lingua.modality_gap` | ≥3 | 300s | Bridges semantic gaps between communication modalities |
| ACT_129 | Memory Cross-Tier Synthesis | MEMORY | `memory.cross_tier_correlation` (>0.7) | ≥3 | 300s | Synthesizes correlated memories across Hot/Warm/Cold tiers |
| ACT_130 | Harvest Intelligent ETL Routing | HARVEST | `harvest.data_classification_complete` | ≥2 | 120s | Routes classified data through optimized ETL pipeline |
| ACT_131 | Evolution Fitness Landscape Mapping | EVOLUTION | `evolution.landscape_shift` | ≥3 | 600s | Maps full fitness landscape to identify opportunities and dead ends |
| ACT_132 | Decode Multi-Turn Reasoning | DECODE | `decode.ambiguous_intent` (>0.6) | ≥4 | 30s | Activates multi-turn reasoning graph for ambiguous intents |
| ACT_133 | Encode Shadow Verdict Testing | ENCODE | `encode.high_risk_patch` | ≥4 | 120s | Runs A/B shadow verdict testing on high-risk patches |
| ACT_134 | Analytics Root Cause Synthesis | ANALYTICS | `analytics.correlated_anomalies` (≥3) | ≥4 | 180s | Synthesizes root cause from 3+ correlated anomalies |

### T4 — Optimization (135–142)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_135 | Treaty SLA Renegotiation | TREATY | `treaty.sla_performance_gap` | ≥3 | 600s | Proposes SLA renegotiations when targets are consistently missed |
| ACT_136 | Reflex Decision Tree Pruning | REFLEX | `reflex.decision_tree_bloat` | ≥3 | 600s | Prunes unused branches from edge decision trees |
| ACT_137 | Identity Trust Score Recompute | IDENTITY | `identity.trust_score_stale` | ≥2 | 30min | Recomputes trust scores for all active identities |
| ACT_138 | Relay Channel Compression | RELAY | `relay.bandwidth_pressure` | ≥4 | 300s | Enables adaptive compression on high-traffic relay channels |
| ACT_139 | Core Module Weight Rebalance | CORE | `core.weight_drift` | ≥3 | 30min | Rebalances node weights based on actual usage patterns |
| ACT_140 | Sandbox Resource Reclamation | SANDBOX | `sandbox.gc_due` | ≥0 | 600s | Reclaims resources from terminated/suspended sandboxes |
| ACT_141 | Ripple Impact Prediction | RIPPLE | `ripple.ripple_detected` | ≥3 | 300s | Predicts blast radius and downstream impact of ripple effects |
| ACT_142 | Access Permission Pruning | ACCESS | `access.permission_bloat` | ≥2 | 1hr | Prunes stale/unused permissions to minimize attack surface |

### T5 — Autonomous (143–150)

| ID | Name | Owner | Trigger | Severity | Cooldown | Effect |
|----|------|-------|---------|----------|----------|--------|
| ACT_143 | Brain Neural Plasticity Cycle | BRAIN | `system.idle_detected` (>300s) | ≥0 | 2hr | Full neural plasticity: pathway strengthening, dead connection pruning |
| ACT_144 | Evolution Genome Compaction | EVOLUTION | `system.idle_detected` (>600s) | ≥0 | 2hr | Compacts evolutionary genome removing dead mutations |
| ACT_145 | Memory Glacier Archive Sweep | MEMORY | `system.idle_detected` (>900s) | ≥0 | 2hr | Deep sweep of glacier storage: compress, deduplicate, index |
| ACT_146 | Oracle Prediction Market Calibration | ORACLE | `system.idle_detected` (>300s) | ≥0 | 1hr | Calibrates all prediction models against actual outcomes |
| ACT_147 | Compass Landscape Full Scan | COMPASS | `system.idle_detected` (>600s) | ≥0 | 2hr | Full spatial-temporal landscape scan updating trend maps |
| ACT_148 | Immunity Vaccine Synthesis | IMMUNITY | `system.idle_detected` (>600s) | ≥0 | 2hr | Synthesizes preemptive vaccines from known threat patterns |
| ACT_149 | Conscience Ethical Framework Evolution | CONSCIENCE | `system.idle_detected` (>900s) | ≥0 | 2hr | Evolves ethical frameworks based on accumulated decision outcomes |
| ACT_150 | Substrate Self-Portrait | SYSTEM | `system.idle_detected` (>1200s) | ≥0 | 4hr | Generates comprehensive substrate self-portrait: strengths, weaknesses, trajectory |

---

## Node Coverage Summary

| Node | Rules | T1 | T2 | T3 | T4 | T5 |
|------|-------|----|----|----|----|-----|
| NERVE | 13 | 3 | 7 | 0 | 0 | 0 |
| IMMUNITY | 10 | 4 | 1 | 2 | 0 | 3 |
| DEFENSE | 6 | 2 | 1 | 0 | 1 | 0 |
| BRAIN | 5 | 0 | 0 | 4 | 0 | 1 |
| ORACLE | 5 | 0 | 0 | 3 | 0 | 1 |
| RELAY | 6 | 2 | 3 | 0 | 1 | 0 |
| ENGINEER | 6 | 0 | 1 | 0 | 3 | 0 |
| SHADOW | 4 | 2 | 0 | 1 | 0 | 0 |
| GOVERNANCE | 5 | 2 | 0 | 0 | 2 | 1 |
| DREAM | 4 | 0 | 0 | 2 | 0 | 2 |
| EVOLUTION | 4 | 0 | 0 | 2 | 0 | 2 |
| MEMORY | 4 | 0 | 0 | 2 | 0 | 1 |
| CORTEX | 3 | 0 | 2 | 0 | 1 | 0 |
| CONSCIENCE | 3 | 0 | 0 | 2 | 0 | 1 |
| FORGE | 3 | 0 | 0 | 2 | 0 | 1 |
| AUDIT | 4 | 1 | 1 | 1 | 0 | 1 |
| IDENTITY | 3 | 1 | 0 | 0 | 1 | 1 |
| PHANTOM | 2 | 2 | 0 | 0 | 0 | 0 |
| OBSERVER | 2 | 0 | 1 | 1 | 0 | 0 |
| ECHO | 3 | 0 | 0 | 1 | 1 | 0 |
| COMPASS | 2 | 0 | 0 | 1 | 1 | 1 |
| SOVEREIGN | 2 | 2 | 0 | 0 | 0 | 0 |
| MEDIC | 2 | 0 | 2 | 0 | 0 | 0 |
| NEXUS | 3 | 0 | 1 | 0 | 1 | 0 |
| ECONOMY | 2 | 0 | 1 | 0 | 1 | 0 |
| HARVEST | 2 | 0 | 0 | 1 | 1 | 0 |
| TREATY | 2 | 0 | 0 | 0 | 1 | 0 |
| REFLEX | 2 | 0 | 0 | 0 | 1 | 0 |
| LINGUA | 2 | 0 | 0 | 1 | 0 | 0 |
| ENCODE | 2 | 0 | 1 | 1 | 0 | 0 |
| DECODE | 1 | 0 | 0 | 1 | 0 | 0 |
| SYSTEM | 3 | 0 | 1 | 0 | 0 | 1 |
| SANDBOX | 2 | 0 | 1 | 0 | 1 | 0 |
| INTEGRATION | 1 | 0 | 1 | 0 | 0 | 0 |
| INCLUSIVE | 1 | 0 | 1 | 0 | 0 | 0 |
| VISION | 1 | 0 | 1 | 0 | 0 | 0 |
| ANALYTICS | 2 | 0 | 0 | 1 | 1 | 0 |
| ATLAS | 2 | 0 | 1 | 0 | 0 | 0 |
| INTENT | 1 | 0 | 0 | 0 | 1 | 0 |
| CORE | 1 | 0 | 0 | 0 | 1 | 0 |
| RIPPLE | 1 | 0 | 0 | 0 | 1 | 0 |
| ACCESS | 2 | 1 | 0 | 0 | 1 | 0 |

---

## Governance & Safety

- **Non-governable rules** (T1 critical): Cannot be overridden by GOVERNANCE — they represent existential threat responses
- **Confidence gating**: T2–T5 rules require computed confidence > threshold before activation
- **Arbitration**: Max 3 activations per signal; only 1 T1 override at a time
- **Cooldowns**: Prevent activation storms — range from 1s (T1) to 4hr (T5)

---

© 2025–2026 CMPSBL®. All rights reserved.
