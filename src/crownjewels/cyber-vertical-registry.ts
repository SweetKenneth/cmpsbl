/**
 * CMPSBL CYBER™ — Vertical Crown Jewel Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 Architectural Crown Jewels: 5 per each of the 16 cyber primitives.
 * Classification: Architecture (permanently black-boxed).
 * All CJPI ≥ 92 — governor-curated, S-Tier.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from './types';

/* ─── Helper ─── */
function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-03T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── WATCHTOWER ──
const WATCHTOWER_JEWELS: STierEntry[] = [
  cj(242, 'S-SENT01', 'Behavioral Telemetry Fusion Matrix', 96, 'WATCHTOWER',
    'Merges heterogeneous telemetry streams (syslog, netflow, EDR, cloud audit) into a unified behavioral model. Applies temporal correlation windows with configurable decay to surface multi-stage attack patterns invisible to single-source analysis.',
    'a1b2c3d4'),
  cj(243, 'S-SENT02', 'MITRE ATT&CK Live Mapper', 95, 'WATCHTOWER',
    'Real-time classification engine that maps observed behaviors to MITRE ATT&CK techniques, tactics, and sub-techniques. Maintains a rolling heat map of adversary TTPs with confidence-weighted attribution chains.',
    'a2b3c4d5'),
  cj(244, 'S-SENT03', 'Adaptive IOC Correlation Engine', 97, 'WATCHTOWER',
    'Cross-correlates indicators of compromise across temporal, spatial, and contextual dimensions using graph-based similarity scoring. Auto-promotes high-fidelity IOCs to block lists while suppressing noise through Bayesian false-positive calibration.',
    'a3b4c5d6'),
  cj(245, 'S-SENT04', 'Threat Severity Scoring Kernel', 94, 'WATCHTOWER',
    'Multi-factor threat scoring algorithm combining asset criticality, exploitability, blast radius, and threat actor sophistication into a single severity index. Feeds into automated escalation and containment policies.',
    'a4b5c6d7'),
  cj(246, 'S-SENT05', 'Anomaly Drift Detector', 95, 'WATCHTOWER',
    'Detects gradual behavioral drift in network baselines using exponential moving average divergence analysis. Distinguishes between organic infrastructure changes and low-and-slow adversary activity.',
    'a5b6c7d8'),
];

// ── SHADE ──
const SHADE_JEWELS: STierEntry[] = [
  cj(247, 'S-PHN01', 'Stealth Exfiltration Fingerprinter', 96, 'SHADE',
    'Identifies data exfiltration patterns through DNS tunneling, steganography, and covert channel analysis. Uses statistical frequency analysis on packet timing to detect sub-bandwidth exfil attempts.',
    'b1c2d3e4'),
  cj(248, 'S-PHN02', 'Lateral Movement Graph Tracer', 95, 'SHADE',
    'Constructs real-time lateral movement graphs from authentication logs, RDP sessions, and SMB traffic. Identifies pivot points and predicts next-hop targets using Markov chain transition probabilities.',
    'b2c3d4e5'),
  cj(249, 'S-PHN03', 'Covert Channel Spectral Analyzer', 94, 'SHADE',
    'Applies spectral analysis to network traffic patterns to detect covert channels hidden in legitimate protocol exchanges. Identifies timing-based, storage-based, and hybrid covert communication mechanisms.',
    'b3c4d5e6'),
  cj(250, 'S-PHN04', 'Silent Probe Orchestrator', 93, 'SHADE',
    'Coordinates passive reconnaissance probes that operate below detection thresholds by distributing observation points across multiple vantage points with randomized timing and minimal footprint.',
    'b4c5d6e7'),
  cj(251, 'S-PHN05', 'Adversary Dwell-Time Calculator', 95, 'SHADE',
    'Reverse-engineers adversary dwell time by correlating initial compromise indicators with lateral movement timelines. Produces probabilistic breach-age estimates for incident response prioritization.',
    'b5c6d7e8'),
];

// ── AEGIS ──
const AEGIS_JEWELS: STierEntry[] = [
  cj(252, 'S-AEG01', 'Adaptive DDoS Absorption Matrix', 97, 'AEGIS',
    'Multi-layer DDoS mitigation combining volumetric scrubbing, protocol analysis, and application-layer challenge-response. Dynamically scales absorption capacity based on attack vector classification.',
    'c1d2e3f4'),
  cj(253, 'S-AEG02', 'Intelligent Rate Limiter with Behavioral Exemption', 95, 'AEGIS',
    'Token-bucket rate limiter augmented with behavioral profiling that automatically exempts known-good traffic patterns while aggressively throttling anomalous request signatures.',
    'c2d3e4f5'),
  cj(254, 'S-AEG03', 'Bot Classification Neural Filter', 94, 'AEGIS',
    'Multi-signal bot detection engine analyzing TLS fingerprints, JavaScript execution patterns, mouse entropy, and request cadence to classify traffic as human, good-bot, or malicious-bot with sub-100ms latency.',
    'c3d4e5f6'),
  cj(255, 'S-AEG04', 'Geo-Aware Traffic Shaping Controller', 93, 'AEGIS',
    'Enforces geographic access policies with granular per-ASN and per-CIDR controls. Applies differential rate limits based on origin reputation scores and real-time threat intelligence feeds.',
    'c4d5e6f7'),
  cj(256, 'S-AEG05', 'Shield Cascade Orchestrator', 96, 'AEGIS',
    'Coordinates multi-tier shield activation across network, transport, and application layers. Implements progressive escalation from observation to challenge to block with automatic de-escalation on threat clearance.',
    'c5d6e7f8'),
];

// ── CIPHER ──
const CIPHER_JEWELS: STierEntry[] = [
  cj(257, 'S-CIP01', 'Quantum-Resistant Key Rotation Engine', 97, 'CIPHER',
    'Automated key lifecycle management with post-quantum cryptographic algorithm support. Implements lattice-based key exchange with backward-compatible hybrid mode for transitional deployments.',
    'd1e2f3g4'),
  cj(258, 'S-CIP02', 'Certificate Chain Integrity Verifier', 95, 'CIPHER',
    'Real-time PKI chain validation with CT log cross-referencing, OCSP stapling verification, and certificate transparency monitoring. Detects rogue CA issuance and mis-issued certificates.',
    'd2e3f4g5'),
  cj(259, 'S-CIP03', 'Encryption Protocol Enforcer', 94, 'CIPHER',
    'Policy-driven encryption enforcement engine that validates cipher suite selection, key lengths, and protocol versions across all communication channels. Auto-remediates downgrade attempts.',
    'd3e4f5g6'),
  cj(260, 'S-CIP04', 'Cryptographic Agility Arbitrator', 96, 'CIPHER',
    'Enables hot-swap of cryptographic primitives without service interruption. Maintains algorithm inventory with deprecation schedules and automated migration paths for compromised algorithms.',
    'd4e5f6g7'),
  cj(261, 'S-CIP05', 'Secret Zero Vault Controller', 95, 'CIPHER',
    'Manages the root-of-trust bootstrap problem through hardware-backed secret zero derivation with shamir secret sharing for distributed trust anchoring.',
    'd5e6f7g8'),
];

// ── RECON ──
const RECON_JEWELS: STierEntry[] = [
  cj(262, 'S-RCN01', 'Attack Surface Cartographer', 97, 'RECON',
    'Continuous attack surface mapping engine that discovers exposed services, shadow IT assets, and third-party integrations. Produces risk-weighted asset inventories with drift detection.',
    'e1f2g3h4'),
  cj(263, 'S-RCN02', 'Vulnerability Priority Intelligence', 96, 'RECON',
    'Context-aware vulnerability prioritization that combines CVSS scores with asset criticality, exploit maturity, and active exploitation data to produce actionable remediation queues.',
    'e2f3g4h5'),
  cj(264, 'S-RCN03', 'Service Fingerprint Classifier', 94, 'RECON',
    'Passive service identification through banner analysis, response timing, and protocol behavior fingerprinting. Classifies services without generating detectable scan traffic.',
    'e3f4g5h6'),
  cj(265, 'S-RCN04', 'Exposure Drift Monitor', 95, 'RECON',
    'Tracks changes in organizational attack surface over time, detecting newly exposed services, configuration drift, and unauthorized network changes. Generates delta reports with risk impact scoring.',
    'e4f5g6h7'),
  cj(266, 'S-RCN05', 'Shadow Asset Discovery Engine', 93, 'RECON',
    'Discovers unmanaged and shadow IT assets through passive DNS analysis, certificate transparency logs, and cloud API enumeration. Maps rogue infrastructure to organizational ownership.',
    'e5f6g7h8'),
];

// ── VANGUARD ──
const VANGUARD_JEWELS: STierEntry[] = [
  cj(267, 'S-VNG01', 'Forensic Evidence Preservation Chain', 97, 'VANGUARD',
    'Tamper-evident evidence collection with cryptographic chain-of-custody. Captures volatile memory, disk images, and network captures with court-admissible integrity guarantees.',
    'f1g2h3i4'),
  cj(268, 'S-VNG02', 'Automated Containment Orchestrator', 96, 'VANGUARD',
    'Executes pre-defined containment playbooks with graduated response levels. Isolates compromised assets while preserving forensic evidence and maintaining business-critical service continuity.',
    'f2g3h4i5'),
  cj(269, 'S-VNG03', 'Root Cause Analysis Graph Engine', 95, 'VANGUARD',
    'Constructs causal graphs from incident data to identify the root cause of security breaches. Traverses dependency chains, configuration changes, and access patterns to pinpoint initial compromise vectors.',
    'f3g4h5i6'),
  cj(270, 'S-VNG04', 'Incident Timeline Reconstructor', 94, 'VANGUARD',
    'Assembles high-fidelity incident timelines from disparate log sources with automatic clock-skew correction. Produces analyst-ready chronologies with evidence linking.',
    'f4g5h6i7'),
  cj(271, 'S-VNG05', 'Playbook Evolution Engine', 95, 'VANGUARD',
    'Learns from incident outcomes to continuously refine response playbooks. Tracks mean-time-to-contain, analyst efficiency, and false-escalation rates to optimize future response actions.',
    'f5g6h7i8'),
];

// ── BASTION ──
const BASTION_JEWELS: STierEntry[] = [
  cj(272, 'S-BST01', 'Zero-Trust Policy Compiler', 97, 'BASTION',
    'Compiles declarative zero-trust policies into enforceable micro-segmentation rules across network, identity, and application layers. Validates policy consistency and detects privilege escalation paths.',
    'g1h2i3j4'),
  cj(273, 'S-BST02', 'Continuous Identity Verification Engine', 96, 'BASTION',
    'Real-time identity verification that re-evaluates trust scores based on behavioral biometrics, device posture, and contextual signals. Triggers step-up authentication on trust degradation.',
    'g2h3i4j5'),
  cj(274, 'S-BST03', 'Micro-Segmentation Topology Enforcer', 95, 'BASTION',
    'Dynamically enforces micro-segmentation boundaries between workloads, containers, and services. Monitors segment violations and auto-remediates unauthorized lateral communication.',
    'g3h4i5j6'),
  cj(275, 'S-BST04', 'Least-Privilege Access Calculator', 94, 'BASTION',
    'Analyzes historical access patterns to compute minimum-viable permission sets. Recommends privilege reductions and detects over-provisioned accounts with quantified risk scoring.',
    'g4h5i6j7'),
  cj(276, 'S-BST05', 'Session Binding Integrity Monitor', 93, 'BASTION',
    'Binds sessions to device fingerprints, network characteristics, and behavioral patterns. Detects session hijacking, cookie theft, and token replay attacks through continuous binding validation.',
    'g5h6i7j8'),
];

// ── TEMPEST ──
const TEMPEST_JEWELS: STierEntry[] = [
  cj(277, 'S-TMP01', 'Adversary Simulation Framework', 96, 'TEMPEST',
    'Automated red team simulation engine that executes multi-stage attack chains based on threat intelligence. Models adversary capabilities, intent, and opportunity to validate defensive controls.',
    'h1i2j3k4'),
  cj(278, 'S-TMP02', 'Blast Radius Prediction Engine', 95, 'TEMPEST',
    'Simulates the propagation impact of security failures across infrastructure dependency graphs. Predicts cascade effects and identifies critical failure amplification points.',
    'h2i3j4k5'),
  cj(279, 'S-TMP03', 'Chaos Injection Controller', 94, 'TEMPEST',
    'Orchestrates controlled chaos experiments in security infrastructure to validate resilience. Injects failures at network, application, and identity layers with automatic rollback on safety threshold breach.',
    'h3i4j5k6'),
  cj(280, 'S-TMP04', 'Penetration Test Orchestrator', 95, 'TEMPEST',
    'Coordinates automated penetration testing campaigns across external and internal attack surfaces. Manages scope, rules of engagement, and finding deduplication with minimal analyst overhead.',
    'h4i5j6k7'),
  cj(281, 'S-TMP05', 'Resilience Posture Quantifier', 93, 'TEMPEST',
    'Produces a single resilience score from aggregated chaos experiment, pen test, and tabletop exercise outcomes. Tracks resilience trends over time with regression detection.',
    'h5i6j7k8'),
];


/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── WRAITH ──
const WRAITH_JEWELS: STierEntry[] = [
  cj(282, 'S-WRT01', 'APT Behavioral Genome Sequencer', 97, 'WRAITH',
    'Profiles advanced persistent threat groups by sequencing their behavioral DNA — tooling preferences, timing patterns, target selection, and operational security habits — into matchable adversary genomes.',
    'i1j2k3l4'),
  cj(283, 'S-WRT02', 'Persistence Mechanism Hunter', 96, 'WRAITH',
    'Systematically enumerates and validates persistence mechanisms across registry, scheduled tasks, services, bootkit locations, and firmware. Detects novel persistence techniques through behavioral deviation analysis.',
    'i2j3k4l5'),
  cj(284, 'S-WRT03', 'Threat Hunting Hypothesis Engine', 95, 'WRAITH',
    'Generates data-driven threat hunting hypotheses from environmental telemetry, threat intelligence, and adversary TTPs. Prioritizes hypotheses by expected information gain and investigative cost.',
    'i3j4k5l6'),
  cj(285, 'S-WRT04', 'Silent Network Segment Scanner', 94, 'WRAITH',
    'Performs autonomous network segment sweeps using passive traffic analysis and ARP cache inspection. Identifies rogue devices, unauthorized network segments, and covert communication channels without generating scan traffic.',
    'i4j5k6l7'),
  cj(286, 'S-WRT05', 'Living-off-the-Land Detector', 96, 'WRAITH',
    'Detects adversary use of legitimate system tools (PowerShell, WMI, certutil, etc.) for malicious purposes through behavioral context analysis. Distinguishes between legitimate admin activity and LOLBin abuse.',
    'i5j6k7l8'),
];

// ── OBSIDIAN ──
const OBSIDIAN_JEWELS: STierEntry[] = [
  cj(287, 'S-OBS01', 'Kill Chain Reconstruction Engine', 97, 'OBSIDIAN',
    'Assembles complete kill chains from fragmented security events across multiple data sources. Maps each phase from initial access through impact with confidence-weighted evidence linking.',
    'j1k2l3m4'),
  cj(288, 'S-OBS02', 'Cross-Domain Event Correlator', 96, 'OBSIDIAN',
    'Correlates security events across identity, network, endpoint, and cloud domains using temporal and causal graph analysis. Surfaces compound threats invisible to single-domain detection.',
    'j2k3l4m5'),
  cj(289, 'S-OBS03', 'Indicator Enrichment Pipeline', 95, 'OBSIDIAN',
    'Automatically enriches raw indicators with contextual intelligence: WHOIS data, geolocation, reputation scores, historical associations, and related campaign attribution.',
    'j3k4l5m6'),
  cj(290, 'S-OBS04', 'Attack Pattern Synthesis Engine', 94, 'OBSIDIAN',
    'Synthesizes recurring attack patterns from historical incident data into reusable detection signatures. Identifies emerging attack methodologies before they receive formal classification.',
    'j4k5l6m7'),
  cj(291, 'S-OBS05', 'Narrative Intelligence Compiler', 95, 'OBSIDIAN',
    'Compiles raw security telemetry into human-readable attack narratives with executive summaries, technical details, and recommended actions. Produces SOC-ready briefings automatically.',
    'j5k6l7m8'),
];

// ── SPECTER ──
const SPECTER_JEWELS: STierEntry[] = [
  cj(292, 'S-SPC01', 'Adaptive Honeypot Topology Generator', 96, 'SPECTER',
    'Generates realistic honeypot environments that mirror production infrastructure. Dynamically adjusts deception fidelity based on attacker sophistication signals.',
    'k1l2m3n4'),
  cj(293, 'S-SPC02', 'Canary Token Weaver', 95, 'SPECTER',
    'Distributes canary tokens across documents, credentials, DNS records, and API keys. Tracks activation with zero-latency alerting and attacker source attribution.',
    'k2l3m4n5'),
  cj(294, 'S-SPC03', 'Decoy Infrastructure Orchestrator', 94, 'SPECTER',
    'Manages full-stack decoy environments including fake databases, credential stores, and API endpoints. Routes attacker traffic through instrumented observation paths.',
    'k3l4m5n6'),
  cj(295, 'S-SPC04', 'Attacker Behavior Profiler', 96, 'SPECTER',
    'Profiles attacker behavior within deception environments capturing tool usage, exploitation techniques, and objective patterns. Feeds intelligence back to WATCHTOWER for detection rule generation.',
    'k4l5m6n7'),
  cj(296, 'S-SPC05', 'Deception Confidence Calibrator', 93, 'SPECTER',
    'Measures the effectiveness of deception deployments by tracking interaction rates, dwell times, and attacker engagement depth. Optimizes deception placement through A/B testing.',
    'k5l6m7n8'),
];

// ── BLACKOUT ──
const BLACKOUT_JEWELS: STierEntry[] = [
  cj(297, 'S-BLK01', 'Emergency Isolation Protocol Engine', 97, 'BLACKOUT',
    'Executes sub-second network isolation of compromised segments while maintaining critical service connectivity through pre-computed safe communication graphs.',
    'l1m2n3o4'),
  cj(298, 'S-BLK02', 'Kill-Switch Cascade Controller', 96, 'BLACKOUT',
    'Manages graduated kill-switch activation across infrastructure tiers. Implements progressive isolation from service-level to segment-level to full network quarantine with rollback guarantees.',
    'l2m3n4o5'),
  cj(299, 'S-BLK03', 'Breach Blast Containment Engine', 95, 'BLACKOUT',
    'Contains active breaches by dynamically computing and enforcing blast radius boundaries. Prevents lateral spread while preserving forensic state for investigation.',
    'l3m4n5o6'),
  cj(300, 'S-BLK04', 'Connection Severing Arbitrator', 94, 'BLACKOUT',
    'Selectively severs compromised connections while maintaining business-critical communication paths. Uses dependency graph analysis to minimize operational impact during containment.',
    'l4m5n6o7'),
  cj(301, 'S-BLK05', 'Quarantine Zone Manager', 95, 'BLACKOUT',
    'Provisions isolated quarantine zones for compromised assets with full network, storage, and compute isolation. Enables safe forensic analysis without risk of contagion.',
    'l5m6n7o8'),
];

// ── TRACER ──
const TRACER_JEWELS: STierEntry[] = [
  cj(302, 'S-TRC01', 'Lateral Movement Path Reconstructor', 97, 'TRACER',
    'Reconstructs complete lateral movement paths from authentication logs, process creation events, and network connections. Visualizes adversary traversal across the infrastructure graph.',
    'm1n2o3p4'),
  cj(303, 'S-TRC02', 'Privilege Escalation Chain Detector', 96, 'TRACER',
    'Identifies privilege escalation chains by analyzing permission inheritance, token manipulation, and credential delegation patterns. Maps escalation paths from initial foothold to domain dominance.',
    'm2n3o4p5'),
  cj(304, 'S-TRC03', 'Credential Abuse Timeline Builder', 95, 'TRACER',
    'Builds chronological timelines of credential usage across systems to detect pass-the-hash, pass-the-ticket, and golden ticket attacks. Correlates credential events with lateral movement.',
    'm3n4o5p6'),
  cj(305, 'S-TRC04', 'Pivot Point Identifier', 94, 'TRACER',
    'Identifies network and identity pivot points used by adversaries through graph centrality analysis. Detects compromised jump boxes, VPN concentrators, and service accounts acting as pivot infrastructure.',
    'm4n5o6p7'),
  cj(306, 'S-TRC05', 'Attack Chain Confidence Scorer', 93, 'TRACER',
    'Assigns confidence scores to reconstructed attack chains based on evidence completeness, temporal consistency, and behavioral coherence. Prioritizes high-confidence chains for analyst review.',
    'm5n6o7p8'),
];

// ── NOCTURNE ──
const NOCTURNE_JEWELS: STierEntry[] = [
  cj(307, 'S-NCT01', 'Dark Web Intelligence Aggregator', 96, 'NOCTURNE',
    'Continuously monitors dark web marketplaces, paste sites, and underground forums for organizational data exposure. Aggregates findings with source reliability scoring.',
    'n1o2p3q4'),
  cj(308, 'S-NCT02', 'Credential Leak Early Warning System', 97, 'NOCTURNE',
    'Detects credential leaks within minutes of exposure through real-time paste site monitoring, breach database cross-referencing, and underground market surveillance.',
    'n2o3p4q5'),
  cj(309, 'S-NCT03', 'Threat Actor Attribution Engine', 95, 'NOCTURNE',
    'Attributes threat activity to known adversary groups through linguistic analysis, infrastructure fingerprinting, and operational pattern matching against threat intelligence databases.',
    'n3o4p5q6'),
  cj(310, 'S-NCT04', 'Brand Impersonation Detector', 94, 'NOCTURNE',
    'Monitors for brand impersonation across domains, social media, and phishing infrastructure. Detects typosquatting, lookalike domains, and unauthorized brand usage with automated takedown workflows.',
    'n4o5p6q7'),
  cj(311, 'S-NCT05', 'OSINT Fusion Intelligence Compiler', 95, 'NOCTURNE',
    'Compiles open-source intelligence from public records, social media, code repositories, and technical forums into structured threat profiles with reliability-weighted assessments.',
    'n5o6p7q8'),
];

// ── IRONCLAD ──
const IRONCLAD_JEWELS: STierEntry[] = [
  cj(312, 'S-IRC01', 'Continuous Compliance Posture Engine', 97, 'IRONCLAD',
    'Continuously evaluates security posture against SOC2, ISO 27001, NIST CSF, and CIS benchmarks. Produces real-time compliance scores with drift detection and remediation queues.',
    'o1p2q3r4'),
  cj(313, 'S-IRC02', 'Automated Evidence Collection Pipeline', 96, 'IRONCLAD',
    'Automatically collects and organizes compliance evidence from infrastructure configurations, access logs, and security controls. Produces audit-ready evidence packages on demand.',
    'o2p3q4r5'),
  cj(314, 'S-IRC03', 'Control Gap Analyzer', 95, 'IRONCLAD',
    'Identifies gaps between implemented security controls and framework requirements. Produces prioritized remediation plans with effort estimates and risk impact quantification.',
    'o3p4q5r6'),
  cj(315, 'S-IRC04', 'Regulatory Change Impact Assessor', 94, 'IRONCLAD',
    'Monitors regulatory changes and assesses their impact on current security controls. Maps new requirements to existing implementations and identifies compliance gaps before enforcement deadlines.',
    'o4p5q6r7'),
  cj(316, 'S-IRC05', 'Audit Trail Integrity Verifier', 96, 'IRONCLAD',
    'Cryptographically verifies the integrity of audit trails to detect tampering, deletion, or modification. Maintains hash-chain anchors for court-admissible log integrity proofs.',
    'o5p6q7r8'),
];

// ── BULWARK ──
const BULWARK_JEWELS: STierEntry[] = [
  cj(317, 'S-BLW01', 'Software Bill of Materials Analyzer', 96, 'BULWARK',
    'Deep SBOM analysis engine that traces transitive dependencies, identifies vulnerable components, and maps license obligations across the entire dependency tree.',
    'p1q2r3s4'),
  cj(318, 'S-BLW02', 'Dependency Compromise Detector', 97, 'BULWARK',
    'Real-time detection of compromised packages through behavioral analysis, maintainer account takeover signals, and malicious code injection pattern matching.',
    'p2q3r4s5'),
  cj(319, 'S-BLW03', 'Typosquat Shield', 95, 'BULWARK',
    'Detects typosquatting attacks on package registries through Levenshtein distance analysis, popularity anomaly detection, and maintainer reputation scoring.',
    'p3q4r5s6'),
  cj(320, 'S-BLW04', 'Supply Chain Provenance Verifier', 94, 'BULWARK',
    'Validates software provenance through SLSA framework compliance checking, build reproducibility verification, and artifact signing chain validation.',
    'p4q5r6s7'),
  cj(321, 'S-BLW05', 'License Compliance Arbitrator', 93, 'BULWARK',
    'Analyzes license compatibility across dependency trees, detects copyleft contamination risks, and produces compliance reports for legal review with automated remediation suggestions.',
    'p5q6r7s8'),
];


/* ─── Assembled Registry ─── */

export const CYBER_CROWN_JEWELS: STierEntry[] = [
  ...WATCHTOWER_JEWELS,
  ...SHADE_JEWELS,
  ...AEGIS_JEWELS,
  ...CIPHER_JEWELS,
  ...RECON_JEWELS,
  ...VANGUARD_JEWELS,
  ...BASTION_JEWELS,
  ...TEMPEST_JEWELS,
  ...WRAITH_JEWELS,
  ...OBSIDIAN_JEWELS,
  ...SPECTER_JEWELS,
  ...BLACKOUT_JEWELS,
  ...TRACER_JEWELS,
  ...NOCTURNE_JEWELS,
  ...IRONCLAD_JEWELS,
  ...BULWARK_JEWELS,
];

/** Total count of cyber vertical Crown Jewels */
export const CYBER_CJ_COUNT = CYBER_CROWN_JEWELS.length; // 80

/** Get Crown Jewels for a specific cyber primitive */
export function getCyberJewelsByPrimitive(primitiveId: string): STierEntry[] {
  return CYBER_CROWN_JEWELS.filter(j => j.module === primitiveId);
}

/** Get all cyber Crown Jewel IDs */
export function getCyberJewelIds(): string[] {
  return CYBER_CROWN_JEWELS.map(j => j.id);
}

/** Get cyber jewels by minimum CJPI */
export function getCyberJewelsByCJPI(minCjpi: number): STierEntry[] {
  return CYBER_CROWN_JEWELS.filter(j => j.cjpi >= minCjpi);
}

/** Primitive-to-jewel summary for dashboard display */
export function getCyberJewelSummary(): Array<{
  primitive: string;
  count: number;
  avgCjpi: number;
  topJewel: string;
}> {
  const primitives = [...new Set(CYBER_CROWN_JEWELS.map(j => j.module))];
  return primitives.map(p => {
    const jewels = CYBER_CROWN_JEWELS.filter(j => j.module === p);
    const top = jewels.reduce((a, b) => a.cjpi > b.cjpi ? a : b);
    return {
      primitive: p,
      count: jewels.length,
      avgCjpi: Math.round(jewels.reduce((s, j) => s + j.cjpi, 0) / jewels.length * 10) / 10,
      topJewel: top.name,
    };
  });
}
