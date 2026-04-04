/**
 * CMPSBL CYBER™ — A-Tier Crown Jewel Vault
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 A-Tier Crown Jewels: 5 per each of the 16 cyber primitives.
 * CJPI range: 85–91. Governor-curated, Architecture-class.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from '../types';

function cj(
  rank: number, id: string, name: string, cjpi: number,
  module: string, description: string, sig: string,
): STierEntry {
  return {
    rank, id, name, cjpi, module,
    type: 'Architecture',
    cluster: 'A-Tier',
    description,
    dependencyFootprint: [],
    exportMode: 'PureStandalone',
    signatureHash: sig,
    version: '1.0.0',
    approved: true,
    generatedAt: '2026-04-04T00:00:00.000Z',
    hasCode: true,
  };
}

/* ═══════════════════════════════════════════════
   ENGINES (8 × 5 = 40 A-Tier Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── WATCHTOWER ──
const WATCHTOWER: STierEntry[] = [
  cj(1001, 'A-WT01', 'Multi-Horizon Threat Forecaster', 91, 'WATCHTOWER', 'Predicts future attack vectors by modeling adversary capability evolution across 30/60/90 day horizons using Monte Carlo trajectory simulations.', 'cya-wt01'),
  cj(1002, 'A-WT02', 'Alert Fatigue Suppression Engine', 90, 'WATCHTOWER', 'Clusters and deduplicates security alerts using semantic similarity and temporal proximity to reduce analyst cognitive load by up to 85%.', 'cya-wt02'),
  cj(1003, 'A-WT03', 'Kill Chain Stage Classifier', 89, 'WATCHTOWER', 'Maps observed activities to Cyber Kill Chain stages with confidence scoring and gap analysis for incomplete chains.', 'cya-wt03'),
  cj(1004, 'A-WT04', 'Threat Intel Fusion Correlator', 88, 'WATCHTOWER', 'Correlates external threat intelligence feeds with internal telemetry using TLP-aware data fusion and provenance tracking.', 'cya-wt04'),
  cj(1005, 'A-WT05', 'Deception Detection Matrix', 87, 'WATCHTOWER', 'Identifies adversary anti-detection techniques including log tampering, timestamp manipulation, and evidence destruction patterns.', 'cya-wt05'),
];

// ── SHADE ──
const SHADE: STierEntry[] = [
  cj(1006, 'A-SH01', 'Covert Channel Bandwidth Estimator', 91, 'SHADE', 'Calculates maximum covert channel bandwidth through timing, storage, and behavioral side channels in network infrastructure.', 'cya-sh01'),
  cj(1007, 'A-SH02', 'Dark Web Intelligence Mapper', 90, 'SHADE', 'Maps adversary infrastructure on dark web services using onion routing analysis and marketplace correlation techniques.', 'cya-sh02'),
  cj(1008, 'A-SH03', 'Insider Threat Behavioral Profiler', 89, 'SHADE', 'Builds employee behavioral baselines and detects deviations indicative of insider threat using access pattern analysis.', 'cya-sh03'),
  cj(1009, 'A-SH04', 'Supply Chain Attack Detector', 88, 'SHADE', 'Identifies compromised dependencies and supply chain injection points through build artifact integrity verification.', 'cya-sh04'),
  cj(1010, 'A-SH05', 'Network Camouflage Fingerprinter', 87, 'SHADE', 'Detects encrypted tunnel obfuscation and protocol mimicry using statistical traffic analysis and entropy profiling.', 'cya-sh05'),
];

// ── AEGIS ──
const AEGIS: STierEntry[] = [
  cj(1011, 'A-AE01', 'Adaptive Firewall Rule Optimizer', 91, 'AEGIS', 'Continuously optimizes firewall rulesets by analyzing traffic patterns and removing redundant or shadowed rules.', 'cya-ae01'),
  cj(1012, 'A-AE02', 'DDoS Absorption Orchestrator', 90, 'AEGIS', 'Coordinates multi-layer DDoS mitigation with anycast traffic redistribution and progressive challenge escalation.', 'cya-ae02'),
  cj(1013, 'A-AE03', 'Certificate Lifecycle Governor', 89, 'AEGIS', 'Manages TLS certificate provisioning, rotation, and revocation across distributed infrastructure with CT log monitoring.', 'cya-ae03'),
  cj(1014, 'A-AE04', 'Microsegmentation Policy Compiler', 88, 'AEGIS', 'Generates zero-trust microsegmentation policies from application dependency maps and communication flow analysis.', 'cya-ae04'),
  cj(1015, 'A-AE05', 'Endpoint Hardening Assessor', 87, 'AEGIS', 'Scores endpoint security posture against CIS benchmarks with automated remediation playbook generation.', 'cya-ae05'),
];

// ── CIPHER ──
const CIPHER: STierEntry[] = [
  cj(1016, 'A-CI01', 'Post-Quantum Migration Planner', 91, 'CIPHER', 'Inventories cryptographic dependencies and generates migration roadmaps for post-quantum algorithm transitions.', 'cya-ci01'),
  cj(1017, 'A-CI02', 'Key Ceremony Automation Engine', 90, 'CIPHER', 'Automates HSM-backed key generation ceremonies with multi-party computation and audit trail generation.', 'cya-ci02'),
  cj(1018, 'A-CI03', 'Cryptographic Agility Assessor', 89, 'CIPHER', 'Evaluates system readiness for cryptographic algorithm swaps and identifies hardcoded cipher dependencies.', 'cya-ci03'),
  cj(1019, 'A-CI04', 'Entropy Quality Monitor', 88, 'CIPHER', 'Continuously validates random number generator quality using NIST SP 800-90B statistical tests.', 'cya-ci04'),
  cj(1020, 'A-CI05', 'Homomorphic Computation Optimizer', 85, 'CIPHER', 'Optimizes homomorphic encryption circuits for practical computation on encrypted data with noise budget management.', 'cya-ci05'),
];

// ── RECON ──
const RECON: STierEntry[] = [
  cj(1021, 'A-RC01', 'Attack Surface Topology Mapper', 91, 'RECON', 'Discovers and visualizes the complete external attack surface including shadow IT, abandoned assets, and cloud sprawl.', 'cya-rc01'),
  cj(1022, 'A-RC02', 'Vulnerability Prioritization Engine', 90, 'RECON', 'Ranks vulnerabilities by exploitability, asset criticality, and threat actor interest rather than raw CVSS scores.', 'cya-rc02'),
  cj(1023, 'A-RC03', 'Credential Exposure Scanner', 89, 'RECON', 'Monitors public repositories, paste sites, and breach databases for leaked organizational credentials.', 'cya-rc03'),
  cj(1024, 'A-RC04', 'DNS Reconnaissance Analyzer', 88, 'RECON', 'Performs passive DNS enumeration and zone transfer detection with subdomain takeover vulnerability identification.', 'cya-rc04'),
  cj(1025, 'A-RC05', 'OSINT Collection Orchestrator', 86, 'RECON', 'Coordinates open-source intelligence gathering across social media, public records, and technical databases.', 'cya-rc05'),
];

// ── VANGUARD ──
const VANGUARD: STierEntry[] = [
  cj(1026, 'A-VG01', 'Automated Incident Playbook Engine', 91, 'VANGUARD', 'Executes pre-defined incident response playbooks with dynamic branching based on real-time evidence collection.', 'cya-vg01'),
  cj(1027, 'A-VG02', 'Breach Containment Orchestrator', 90, 'VANGUARD', 'Coordinates automated containment actions across network, endpoint, and identity layers during active incidents.', 'cya-vg02'),
  cj(1028, 'A-VG03', 'Evidence Preservation Chain', 89, 'VANGUARD', 'Maintains forensic-grade evidence collection with chain-of-custody tracking and tamper-evident checksums.', 'cya-vg03'),
  cj(1029, 'A-VG04', 'Threat Hunting Query Generator', 88, 'VANGUARD', 'Generates hypothesis-driven threat hunting queries from threat intelligence reports and behavioral indicators.', 'cya-vg04'),
  cj(1030, 'A-VG05', 'Post-Incident Lessons Engine', 86, 'VANGUARD', 'Extracts actionable improvements from incident timelines and automatically updates detection rules and playbooks.', 'cya-vg05'),
];

// ── BASTION ──
const BASTION: STierEntry[] = [
  cj(1031, 'A-BA01', 'Privileged Access Session Recorder', 91, 'BASTION', 'Records and indexes all privileged access sessions with keystroke-level granularity and session replay capability.', 'cya-ba01'),
  cj(1032, 'A-BA02', 'Just-In-Time Access Provisioner', 90, 'BASTION', 'Grants time-bounded elevated privileges with automatic revocation and approval workflow integration.', 'cya-ba02'),
  cj(1033, 'A-BA03', 'Identity Federation Analyzer', 89, 'BASTION', 'Maps identity trust chains across federated identity providers and detects misconfigured SAML/OIDC assertions.', 'cya-ba03'),
  cj(1034, 'A-BA04', 'Service Account Rotation Engine', 88, 'BASTION', 'Automatically rotates service account credentials with zero-downtime deployment and dependency-aware scheduling.', 'cya-ba04'),
  cj(1035, 'A-BA05', 'Lateral Movement Barrier', 86, 'BASTION', 'Enforces credential isolation boundaries between network segments to prevent credential-based lateral movement.', 'cya-ba05'),
];

// ── TEMPEST ──
const TEMPEST: STierEntry[] = [
  cj(1036, 'A-TE01', 'Red Team Automation Framework', 91, 'TEMPEST', 'Orchestrates automated adversary simulation campaigns using TTPs mapped to specific threat actor profiles.', 'cya-te01'),
  cj(1037, 'A-TE02', 'Purple Team Collaboration Engine', 90, 'TEMPEST', 'Facilitates real-time collaboration between attack and defense teams with shared visibility and scoring.', 'cya-te02'),
  cj(1038, 'A-TE03', 'Exploit Chain Composer', 89, 'TEMPEST', 'Composes multi-step exploit chains from individual vulnerability primitives to demonstrate realistic attack paths.', 'cya-te03'),
  cj(1039, 'A-TE04', 'Defense Gap Identifier', 88, 'TEMPEST', 'Maps detection coverage against the full MITRE ATT&CK matrix to identify blind spots in defensive telemetry.', 'cya-te04'),
  cj(1040, 'A-TE05', 'Resilience Stress Tester', 86, 'TEMPEST', 'Simulates high-intensity attack scenarios to validate security infrastructure resilience under sustained pressure.', 'cya-te05'),
];

/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 A-Tier Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── WRAITH ──
const WRAITH: STierEntry[] = [
  cj(1041, 'A-WR01', 'Adversary Emulation Profiler', 91, 'WRAITH', 'Creates behavioral profiles of specific threat actors from historical campaign data for targeted emulation exercises.', 'cya-wr01'),
  cj(1042, 'A-WR02', 'Living-Off-The-Land Detector', 90, 'WRAITH', 'Identifies malicious use of legitimate system tools through behavioral context analysis rather than signature matching.', 'cya-wr02'),
  cj(1043, 'A-WR03', 'Fileless Malware Analyzer', 89, 'WRAITH', 'Detects and analyzes in-memory-only malware using memory forensics and runtime behavior instrumentation.', 'cya-wr03'),
  cj(1044, 'A-WR04', 'Anti-Forensics Countermeasure', 88, 'WRAITH', 'Counters adversary anti-forensics techniques including timestomping, log wiping, and artifact destruction.', 'cya-wr04'),
  cj(1045, 'A-WR05', 'Persistence Mechanism Hunter', 86, 'WRAITH', 'Discovers hidden persistence mechanisms across registry, scheduled tasks, WMI, and bootkit layers.', 'cya-wr05'),
];

// ── OBSIDIAN ──
const OBSIDIAN_A: STierEntry[] = [
  cj(1046, 'A-OB01', 'Cloud Misconfiguration Scanner', 91, 'OBSIDIAN', 'Continuously audits cloud infrastructure against security benchmarks with drift detection and auto-remediation.', 'cya-ob01'),
  cj(1047, 'A-OB02', 'Container Escape Detector', 90, 'OBSIDIAN', 'Monitors container runtimes for escape attempts including kernel exploit triggers and mount namespace breakouts.', 'cya-ob02'),
  cj(1048, 'A-OB03', 'Infrastructure-as-Code Auditor', 89, 'OBSIDIAN', 'Scans Terraform, CloudFormation, and Pulumi templates for security violations before deployment.', 'cya-ob03'),
  cj(1049, 'A-OB04', 'Secrets Sprawl Detector', 88, 'OBSIDIAN', 'Identifies hardcoded secrets, API keys, and credentials across code repositories and configuration files.', 'cya-ob04'),
  cj(1050, 'A-OB05', 'Runtime Security Policy Enforcer', 86, 'OBSIDIAN', 'Enforces security policies at runtime using eBPF-based system call filtering and process monitoring.', 'cya-ob05'),
];

// ── SPECTER ──
const SPECTER_A: STierEntry[] = [
  cj(1051, 'A-SP01', 'Memory Corruption Detector', 91, 'SPECTER', 'Identifies buffer overflow, use-after-free, and heap corruption vulnerabilities through dynamic analysis.', 'cya-sp01'),
  cj(1052, 'A-SP02', 'Binary Diffing Engine', 90, 'SPECTER', 'Compares binary patches to identify silently fixed vulnerabilities and assess patch completeness.', 'cya-sp02'),
  cj(1053, 'A-SP03', 'Firmware Integrity Verifier', 89, 'SPECTER', 'Validates firmware images against known-good baselines with entropy analysis and embedded secret detection.', 'cya-sp03'),
  cj(1054, 'A-SP04', 'Shellcode Pattern Analyzer', 88, 'SPECTER', 'Identifies shellcode patterns in network traffic and file uploads using instruction-level emulation and heuristics.', 'cya-sp04'),
  cj(1055, 'A-SP05', 'ROP Chain Detector', 86, 'SPECTER', 'Detects return-oriented programming chains in exploit payloads using control flow graph analysis.', 'cya-sp05'),
];

// ── BLACKOUT ──
const BLACKOUT_A: STierEntry[] = [
  cj(1056, 'A-BL01', 'Ransomware Early Warning System', 91, 'BLACKOUT', 'Detects ransomware pre-encryption behaviors including mass file enumeration, shadow copy deletion, and encryption library loading.', 'cya-bl01'),
  cj(1057, 'A-BL02', 'Data Loss Prevention Engine', 90, 'BLACKOUT', 'Classifies sensitive data in motion and at rest with content-aware policies and automated quarantine actions.', 'cya-bl02'),
  cj(1058, 'A-BL03', 'Backup Integrity Validator', 89, 'BLACKOUT', 'Continuously validates backup integrity and recoverability through automated restoration testing.', 'cya-bl03'),
  cj(1059, 'A-BL04', 'Business Continuity Simulator', 88, 'BLACKOUT', 'Simulates disaster scenarios to validate recovery time objectives and identify single points of failure.', 'cya-bl04'),
  cj(1060, 'A-BL05', 'Wiper Malware Detector', 86, 'BLACKOUT', 'Identifies destructive malware patterns including MBR overwriting, file system corruption, and mass deletion.', 'cya-bl05'),
];

// ── TRACER ──
const TRACER_A: STierEntry[] = [
  cj(1061, 'A-TR01', 'Digital Forensics Timeline Builder', 91, 'TRACER', 'Reconstructs forensic timelines from multiple evidence sources with cross-reference validation and gap detection.', 'cya-tr01'),
  cj(1062, 'A-TR02', 'Network Packet Carver', 90, 'TRACER', 'Extracts and reassembles files and sessions from raw packet captures with protocol-aware reconstruction.', 'cya-tr02'),
  cj(1063, 'A-TR03', 'Malware Sandbox Orchestrator', 89, 'TRACER', 'Executes malware samples in isolated environments with behavioral logging, API call tracing, and network monitoring.', 'cya-tr03'),
  cj(1064, 'A-TR04', 'Indicator Enrichment Pipeline', 88, 'TRACER', 'Enriches raw indicators with geolocation, WHOIS, passive DNS, and threat intelligence context.', 'cya-tr04'),
  cj(1065, 'A-TR05', 'Attribution Confidence Scorer', 86, 'TRACER', 'Scores adversary attribution hypotheses using Diamond Model analysis with multi-factor confidence weighting.', 'cya-tr05'),
];

// ── NOCTURNE ──
const NOCTURNE_A: STierEntry[] = [
  cj(1066, 'A-NC01', 'Deception Network Orchestrator', 91, 'NOCTURNE', 'Deploys and manages honeypot networks with realistic service emulation and adversary interaction tracking.', 'cya-nc01'),
  cj(1067, 'A-NC02', 'Canary Token Generator', 90, 'NOCTURNE', 'Creates and monitors honeytoken credentials, documents, and URLs to detect unauthorized access and exfiltration.', 'cya-nc02'),
  cj(1068, 'A-NC03', 'Adversary Engagement Engine', 89, 'NOCTURNE', 'Manages controlled adversary engagement sessions to collect intelligence while containing threat activity.', 'cya-nc03'),
  cj(1069, 'A-NC04', 'Decoy Infrastructure Manager', 88, 'NOCTURNE', 'Generates convincing fake infrastructure including servers, databases, and file shares to misdirect attackers.', 'cya-nc04'),
  cj(1070, 'A-NC05', 'Attacker Profiling Engine', 86, 'NOCTURNE', 'Profiles adversary skill level and tooling from interaction patterns with deception infrastructure.', 'cya-nc05'),
];

// ── IRONCLAD ──
const IRONCLAD_A: STierEntry[] = [
  cj(1071, 'A-IC01', 'Compliance Automation Framework', 91, 'IRONCLAD', 'Maps security controls to multiple compliance frameworks simultaneously with evidence collection automation.', 'cya-ic01'),
  cj(1072, 'A-IC02', 'Audit Trail Integrity Engine', 90, 'IRONCLAD', 'Ensures audit log immutability using hash chains and distributed consensus verification.', 'cya-ic02'),
  cj(1073, 'A-IC03', 'Regulatory Change Tracker', 89, 'IRONCLAD', 'Monitors regulatory changes across jurisdictions and maps impacts to existing control implementations.', 'cya-ic03'),
  cj(1074, 'A-IC04', 'Security Metrics Dashboard Generator', 88, 'IRONCLAD', 'Computes and visualizes key security metrics including MTTD, MTTR, and risk exposure trending.', 'cya-ic04'),
  cj(1075, 'A-IC05', 'Third-Party Risk Assessor', 86, 'IRONCLAD', 'Evaluates vendor security posture using questionnaire automation, continuous monitoring, and breach history analysis.', 'cya-ic05'),
];

// ── BULWARK ──
const BULWARK_A: STierEntry[] = [
  cj(1076, 'A-BW01', 'WAF Rule Optimization Engine', 91, 'BULWARK', 'Tunes web application firewall rules by analyzing false positive rates and coverage gaps against OWASP Top 10.', 'cya-bw01'),
  cj(1077, 'A-BW02', 'API Security Gateway', 90, 'BULWARK', 'Enforces API security policies including rate limiting, schema validation, and broken access control detection.', 'cya-bw02'),
  cj(1078, 'A-BW03', 'Bot Detection Classifier', 89, 'BULWARK', 'Distinguishes automated bot traffic from legitimate users using behavioral biometrics and browser fingerprinting.', 'cya-bw03'),
  cj(1079, 'A-BW04', 'Request Anomaly Scorer', 88, 'BULWARK', 'Scores HTTP requests for anomalous patterns using statistical baselines and protocol conformance checks.', 'cya-bw04'),
  cj(1080, 'A-BW05', 'Origin Shield Coordinator', 86, 'BULWARK', 'Coordinates multi-CDN origin shielding to protect backend infrastructure from volumetric and application-layer attacks.', 'cya-bw05'),
];

export const CYBER_ATIER_JEWELS: STierEntry[] = [
  ...WATCHTOWER, ...SHADE, ...AEGIS, ...CIPHER,
  ...RECON, ...VANGUARD, ...BASTION, ...TEMPEST,
  ...WRAITH, ...OBSIDIAN_A, ...SPECTER_A, ...BLACKOUT_A,
  ...TRACER_A, ...NOCTURNE_A, ...IRONCLAD_A, ...BULWARK_A,
];
