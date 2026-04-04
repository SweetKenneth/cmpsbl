/**
 * CaseStudies — Real-world Ascension case studies showcasing CMPSBL® refurbishment results.
 * Each study includes original source provenance, improvements analysis, and downloadable artifacts.
 */

import { Helmet } from 'react-helmet-async';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { PageSEOBlock } from '@/components/seo/PageSEOBlock';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Clock, Shield, Zap, GitBranch, Bug, Eye, FileCode, Award, ChevronDown, ChevronUp, Layers, FlaskConical, Sparkles, Brain, ArrowRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ───────── Case Study #1 Data — A* Path Planner ───────── */

const ASTAR_VULNERABILITIES = [
  { severity: 'critical', title: 'No error handling detected', status: 'hardened', detail: 'Zero try/except blocks. Any runtime exception crashes the process — now wrapped with FAILSAFE circuit breakers.' },
  { severity: 'warning', title: 'Synchronous-only architecture', status: 'mitigated', detail: 'No async patterns in a compute-heavy path planner. Blocks the event loop under load.' },
  { severity: 'warning', title: 'High cyclomatic complexity (37)', status: 'mitigated', detail: '37 branching paths make the code difficult to test and maintain.' },
  { severity: 'warning', title: 'No test coverage detected', status: 'mitigated', detail: 'ORACLE predicts 73% probability of regression bugs within 6 months without test coverage.' },
  { severity: 'info', title: 'No fallback mechanisms', status: 'monitor', detail: 'Single-path execution — failure in any step halts the entire pipeline.' },
  { severity: 'warning', title: 'Monolithic file (283 lines)', status: 'mitigated', detail: 'Single-file architecture limits reusability and increases cognitive load.' },
  { severity: 'info', title: 'No module exports', status: 'monitor', detail: 'Self-contained with no exports. Limits reusability and testability in larger systems.' },
];

const PRIMITIVES_APPLIED = [
  { name: 'TENSOR', type: 'Engine', action: 'Sensor fusion and multi-modal signal processing for situational awareness' },
  { name: 'MARSHAL', type: 'Agent', action: 'Safety monitoring and collision avoidance with emergency stop protocols' },
  { name: 'KINETIC', type: 'Engine', action: 'Motion planning and trajectory optimization for multi-axis coordination' },
  { name: 'VECTOR', type: 'Engine', action: 'Navigation, pathfinding, and localization with SLAM integration' },
  { name: 'SWARM', type: 'Agent', action: 'Multi-robot coordination and fleet management with consensus protocols' },
  { name: 'BRAIN', type: 'Organ', action: 'Continuous learning patterns for complex logic optimization' },
  { name: 'IDENTITY', type: 'Organ', action: 'Authentication and identity resolution for access control' },
  { name: 'WELDER', type: 'Agent', action: 'Assembly operations and joining processes with seam tracking' },
  { name: 'CALIBER', type: 'Engine', action: 'Precision calibration and tolerance enforcement for repeatable operations' },
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries for complex systems' },
  { name: 'ECHO', type: 'Engine', action: 'Structured logging replacing scattered print statements' },
  { name: 'HARVEST', type: 'Engine', action: 'Dead code identification and pruning advisory' },
  { name: 'SHADOW', type: 'Layer', action: 'Shadow testing and canary deployment for safe rollouts' },
  { name: 'VISION', type: 'Layer', action: 'Telemetry analysis and anomaly detection for architectural changes' },
  { name: 'DISPATCH', type: 'Agent', action: 'Task sequencing and workflow automation for multi-step operations' },
  { name: 'SERVO', type: 'Engine', action: 'Motor control and actuator orchestration with PID tuning' },
  { name: 'ENVIRON', type: 'Agent', action: 'Environmental awareness and scene understanding for safe operation' },
  { name: 'SANDBOX', type: 'Engine', action: 'Sandboxed isolation for untrusted execution paths' },
  { name: 'TREATY', type: 'Layer', action: 'API contract enforcement and schema validation' },
  { name: 'DEFENSE', type: 'Layer', action: 'Defense-in-depth hardening for network-facing code' },
];

const NEW_CAPABILITIES = [
  { name: 'Chaos Pen Test Engine', mode: 'Active', desc: 'Automated penetration testing via chaos injection and adversarial simulation.' },
  { name: 'Real-Time IOC Correlator', mode: 'Active', desc: 'Correlates Indicators of Compromise across telemetry streams, mapped to MITRE ATT&CK.' },
  { name: 'Silent Regression Scanner', mode: 'Passive', desc: 'Background scanner detecting behavioral regressions against historical baselines.' },
  { name: 'Device Fingerprint Layer', mode: 'Passive', desc: 'Unique device fingerprints for fraud detection and session binding.' },
  { name: 'Sandbox Escalation Guard', mode: 'Hybrid', desc: 'Sandboxed isolation with active termination of privilege escalation attempts.' },
  { name: 'Rate Limit Intelligence', mode: 'Hybrid', desc: 'Learns traffic patterns and dynamically adjusts rate limits per client/endpoint.' },
  { name: 'Cognitive Load Profiler', mode: 'Passive', desc: 'Measures code complexity and identifies maintainability threshold breaches.' },
  { name: 'Canary Deployment Gate', mode: 'Hybrid', desc: 'Routes configurable traffic percentages to new code paths with auto-rollback.' },
  { name: 'Behavioral Audit Trail', mode: 'Passive', desc: 'Records state transitions with FNV-1a hash-sealed tamper evidence.' },
  { name: 'Permission Boundary Map', mode: 'Passive', desc: 'Visualizes access control boundaries and identifies over-privileged paths.' },
];

/* ───────── Case Study #2 Data — OpenClawAgent Cross-Vertical ───────── */

interface VerticalRun {
  vertical: string;
  verticalLabel: string;
  color: string;
  serial: string;
  fingerprint: string;
  cjpi: number;
  tier: string;
  timestamp: string;
  expansionPrimitives: { name: string; type: string; purpose: string }[];
  focusArea: string;
}

const OPENCLAW_RUNS: VerticalRun[] = [
  {
    vertical: 'main',
    verticalLabel: 'CMPSBL® Core',
    color: 'bg-primary/15 text-primary border-primary/20',
    serial: 'CMPSBL-MNHWO6NU-70AA',
    fingerprint: 'e1d40a3c',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 2, 2026 · 20:06 UTC',
    expansionPrimitives: [
      { name: 'ENCODE', type: 'Agent', purpose: 'Structural analysis and code architecture assessment' },
      { name: 'CORTEX', type: 'Agent', purpose: 'Cognitive pattern recognition and decision optimization' },
      { name: 'DECODE', type: 'Agent', purpose: 'Natural language understanding and intent classification' },
      { name: 'ORACLE', type: 'Agent', purpose: 'Predictive analysis and forecasting' },
      { name: 'DREAM', type: 'Engine', purpose: 'Heuristic synthesis and autonomous learning' },
      { name: 'FORGE', type: 'Engine', purpose: 'Artifact manufacturing and template synthesis' },
      { name: 'RIPPLE', type: 'Engine', purpose: 'Event cascade and backpressure handling' },
      { name: 'HARVEST', type: 'Engine', purpose: 'Data acquisition and deduplication' },
    ],
    focusArea: 'General-purpose hardening: circuit breakers, structured logging, IP obfuscation, and modular decomposition advisory.',
  },
  {
    vertical: 'cyber',
    verticalLabel: 'CMPSBL CYBER™',
    color: 'bg-red-500/15 text-red-500 border-red-500/20',
    serial: 'CMPSBL-MNIHJAX3-4GSN',
    fingerprint: '32d6e316',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 3, 2026 · 05:50 UTC',
    expansionPrimitives: [
      { name: 'CIPHER', type: 'Engine', purpose: 'Cryptographic hardening and key management enforcement' },
      { name: 'VANGUARD', type: 'Engine', purpose: 'Proactive threat modeling and attack surface reduction' },
      { name: 'AEGIS', type: 'Agent', purpose: 'Shield layer for zero-trust perimeter enforcement' },
      { name: 'RECON', type: 'Agent', purpose: 'Reconnaissance detection and counter-intelligence patterns' },
      { name: 'IRONCLAD', type: 'Agent', purpose: 'Input validation and injection prevention' },
      { name: 'TEMPEST', type: 'Engine', purpose: 'Side-channel attack mitigation and emissions security' },
      { name: 'TRACER', type: 'Agent', purpose: 'Forensic logging with chain-of-custody evidence trails' },
      { name: 'BLACKOUT', type: 'Agent', purpose: 'Emergency kill-switch and data purge protocols' },
    ],
    focusArea: 'Offensive/defensive security: cryptographic hardening, zero-trust perimeters, forensic audit trails, and side-channel mitigation.',
  },
  {
    vertical: 'robotics',
    verticalLabel: 'CMPSBL ROBOTICS™',
    color: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
    serial: 'CMPSBL-MNIHLRJY-QJXQ',
    fingerprint: 'e3d1a767',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 3, 2026 · 05:52 UTC',
    expansionPrimitives: [
      { name: 'FABRICATOR', type: 'Engine', purpose: 'Manufacturing process optimization and assembly sequencing' },
      { name: 'INSPECTOR', type: 'Agent', purpose: 'Quality assurance and defect detection patterns' },
      { name: 'VECTOR', type: 'Engine', purpose: 'Navigation, pathfinding, and spatial reasoning' },
      { name: 'FLUX', type: 'Engine', purpose: 'Real-time data flow management and stream processing' },
      { name: 'KINETIC', type: 'Engine', purpose: 'Motion planning and trajectory optimization' },
      { name: 'CALIBER', type: 'Engine', purpose: 'Precision calibration and tolerance enforcement' },
      { name: 'GUARDIAN', type: 'Agent', purpose: 'Safety monitoring with emergency stop protocols' },
      { name: 'SWARM', type: 'Agent', purpose: 'Multi-robot coordination and fleet management' },
    ],
    focusArea: 'Physical-world intelligence: motion planning, sensor fusion, safety monitoring, multi-robot coordination, and precision calibration.',
  },
  {
    vertical: 'quantum',
    verticalLabel: 'CMPSBL QUANTUM™',
    color: 'bg-violet-500/15 text-violet-500 border-violet-500/20',
    serial: 'CMPSBL-MNIJ0Y6N-9ZQG',
    fingerprint: 'fd0f1eeb',
    cjpi: 100,
    tier: 'Apex',
    timestamp: 'Apr 3, 2026 · 06:32 UTC',
    expansionPrimitives: [
      { name: 'FERMION', type: 'Engine', purpose: 'Fermion-class state isolation and anti-symmetry enforcement' },
      { name: 'LATTICE', type: 'Engine', purpose: 'Lattice structure validation and crystal symmetry analysis' },
      { name: 'MESON', type: 'Agent', purpose: 'Quark-level decomposition and binding energy optimization' },
      { name: 'GLUON', type: 'Engine', purpose: 'Strong-force binding patterns for tightly coupled modules' },
      { name: 'MUON', type: 'Engine', purpose: 'Penetration testing at quantum depth with muon-class probes' },
      { name: 'HADRON', type: 'Agent', purpose: 'Composite particle simulation and collision modeling' },
      { name: 'CRYOGEN', type: 'Engine', purpose: 'Cryogenic-state optimization for low-noise computation' },
      { name: 'PHOTON', type: 'Agent', purpose: 'Light-speed data path optimization and zero-latency routing' },
    ],
    focusArea: 'Quantum-computational hardening: state isolation, lattice validation, collision modeling, and zero-latency path optimization.',
  },
];

const SHARED_SPINE_PRIMITIVES = [
  'SIMULATE', 'MEMORY', 'SHADOW', 'RELAY', 'OBSERVER', 'FORGE', 'ECHO', 'EVOLUTION', 'COMPASS', 'LINGUA',
];

/* ───────── Case Study #3 Data — Qiskit ConsolidateBlocks (Quantum) ───────── */

const QISKIT_VULNERABILITIES = [
  { severity: 'warning', title: 'Synchronous-only architecture', status: 'mitigated', detail: 'No async patterns found in substantial codebase. May block the event loop under load.' },
  { severity: 'warning', title: 'High cyclomatic complexity (32)', status: 'mitigated', detail: 'Complexity score of 32 indicates too many branching paths. Hard to test and maintain.' },
  { severity: 'info', title: 'No fallback mechanisms detected', status: 'monitor', detail: 'ORACLE identifies single-path execution. Failure in any step halts the entire pipeline.' },
  { severity: 'info', title: 'Low function density', status: 'monitor', detail: 'ORACLE detects 3 functions across 192 lines (~64 lines/fn). Monolithic functions resist change.' },
  { severity: 'warning', title: 'High dependency coupling (19 imports)', status: 'mitigated', detail: '19 imports detected — high coupling increases blast radius of dependency failures.' },
  { severity: 'info', title: 'No module exports detected', status: 'monitor', detail: 'Code appears self-contained with no exports. Limits reusability and testability.' },
  { severity: 'info', title: 'No dependency failure fallbacks', status: 'monitor', detail: '19 dependencies with no fallback strategy. Any dependency failure cascades to your application.' },
];

const QISKIT_PRIMITIVES = [
  { name: 'BOSON', type: 'Agent', action: 'Force carrier simulation and gauge field mapping for the Standard Model' },
  { name: 'NEUTRINO', type: 'Agent', action: 'Weak interaction modeling and neutrino flavor oscillation prediction' },
  { name: 'HARVEST', type: 'Organ', action: 'Dead code identification and pruning advisory for large codebases' },
  { name: 'PHOTON', type: 'Engine', action: 'Optical computing and photonic signal processing with interferometry modeling' },
  { name: 'FERMION', type: 'Engine', action: 'Many-body quantum state evolution with Schrödinger equation solvers' },
  { name: 'PLASMA', type: 'Engine', action: 'Plasma dynamics and magneto-hydrodynamics for fusion reactor modeling' },
  { name: 'MUON', type: 'Agent', action: 'Decay chain analysis and lepton tracking for particle detector data' },
  { name: 'QUBIT', type: 'Engine', action: 'Quantum gate orchestration and circuit transpilation for quantum algorithms' },
  { name: 'MESON', type: 'Agent', action: 'Quark confinement and hadronization processes for jet formation modeling' },
  { name: 'SHADOW', type: 'Layer', action: 'Shadow testing and canary analysis for complex system deployments' },
  { name: 'IMMUNITY', type: 'Layer', action: 'Dependency shielding and isolation barriers for high-coupling codebases' },
  { name: 'RELAY', type: 'Layer', action: 'Message relay with delivery guarantees and dead-letter handling' },
  { name: 'GLUON', type: 'Agent', action: 'Strong force coupling and QCD color charge simulation' },
  { name: 'CRYOGEN', type: 'Engine', action: 'Cryogenic system modeling and thermal noise reduction for quantum hardware' },
  { name: 'ECHO', type: 'Organ', action: 'Structured logging replacing scattered print/debug statements' },
  { name: 'IDENTITY', type: 'Organ', action: 'Authentication and identity resolution for access control' },
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries for complex systems' },
  { name: 'COMPASS', type: 'Organ', action: 'Module navigation and dependency mapping' },
  { name: 'SIMULATE', type: 'Layer', action: 'Simulation-based safe testing of architectural changes' },
  { name: 'EVOLUTION', type: 'Layer', action: 'Managed evolution cycles for technical debt reduction' },
];

const QISKIT_CAPABILITIES = [
  { name: 'QCD Color Charge Simulator', mode: 'Active', desc: 'Lattice QCD Monte Carlo simulation for gluon exchange, asymptotic freedom verification, and hadron mass computation from first principles.' },
  { name: 'Quantum Teleportation Protocol', mode: 'Active', desc: 'End-to-end quantum state transfer using EPR pairs, Bell measurements, and classical communication channels with fidelity verification.' },
  { name: 'Silent Regression Scanner', mode: 'Passive', desc: 'Background scanner detecting behavioral regressions by comparing output signatures against historical baselines.' },
  { name: 'Neutrino Oscillation Predictor', mode: 'Passive', desc: 'Computes PMNS matrix parameters, predicts flavor transition probabilities over baseline distances, and models MSW matter effects.' },
  { name: 'Cryogenic Decoherence Shield', mode: 'Hybrid', desc: 'Models T1/T2 relaxation times, thermal photon flux, and Johnson-Nyquist noise to optimize dilution refrigerator staging for qubit coherence.' },
  { name: 'Canary Deployment Gate', mode: 'Hybrid', desc: 'Routes configurable traffic percentages to new code paths with anomaly monitoring and auto-rollback.' },
  { name: 'Fusion Reactor Modeler', mode: 'Active', desc: 'Simulates tokamak plasma confinement, computes Lawson criterion parameters, and optimizes magnetic field configurations.' },
  { name: 'Particle Collision Analyzer', mode: 'Active', desc: 'Reconstructs collision events from detector data, clusters jets, identifies decay products, and computes invariant mass distributions.' },
  { name: 'Chaos Pen Test Engine', mode: 'Active', desc: 'Automated penetration testing via chaos injection, adversarial simulation, and blast radius analysis.' },
  { name: 'Structural Drift Detector', mode: 'Passive', desc: 'Compares current architecture against original blueprint and flags deviations to prevent architectural erosion.' },
];

/* ───────── Case Study #4 Data — Metasploit Exploit::Remote::Tcp (Cyber) ───────── */

const MSF_VULNERABILITIES = [
  { severity: 'warning', title: 'Synchronous-only architecture', status: 'mitigated', detail: 'No async patterns found in substantial codebase. May block the event loop under load.' },
  { severity: 'warning', title: 'High cyclomatic complexity (49)', status: 'mitigated', detail: 'Complexity score of 49 indicates too many branching paths. Hard to test and maintain.' },
  { severity: 'warning', title: 'No test coverage detected', status: 'mitigated', detail: 'ORACLE predicts 73% probability of regression bugs within 6 months without test coverage.' },
  { severity: 'info', title: 'No fallback mechanisms detected', status: 'monitor', detail: 'ORACLE identifies single-path execution. Failure in any step halts the entire pipeline.' },
  { severity: 'warning', title: 'Complex codebase without type safety', status: 'mitigated', detail: 'ORACLE predicts 45% higher bug rate in complex untyped code. Type contracts prevent class of runtime errors.' },
  { severity: 'info', title: 'No type contracts detected', status: 'monitor', detail: 'No interfaces or type definitions found. Type safety improves long-term maintainability.' },
  { severity: 'warning', title: 'Monolithic file (342 lines)', status: 'mitigated', detail: '342 lines in a single file. ENGINEER recommends decomposition to reduce cognitive load.' },
  { severity: 'info', title: 'No module exports detected', status: 'monitor', detail: 'Code appears self-contained with no exports. Limits reusability and testability.' },
  { severity: 'warning', title: 'No graceful shutdown handler', status: 'mitigated', detail: 'Server starts without SIGTERM/SIGINT handling. Abrupt shutdowns may corrupt in-flight operations.' },
];

const MSF_PRIMITIVES = [
  { name: 'CIPHER', type: 'Engine', action: 'Cryptographic key lifecycle management and rotation enforcement' },
  { name: 'WRAITH', type: 'Agent', action: 'Stealth handling with minimal operational footprint' },
  { name: 'BASTION', type: 'Engine', action: 'Zero-trust enforcement with micro-segmentation and continuous verification' },
  { name: 'RECON', type: 'Engine', action: 'Continuous attack surface reconnaissance for network exposure' },
  { name: 'OBSIDIAN', type: 'Agent', action: 'Redundant storage and integrity checks for critical data persistence' },
  { name: 'WATCHTOWER', type: 'Engine', action: 'Real-time threat detection and classification with behavioral telemetry fusion' },
  { name: 'VANGUARD', type: 'Engine', action: 'Incident response automation with forensic evidence preservation' },
  { name: 'IRONCLAD', type: 'Agent', action: 'Continuous compliance validation against SOC2, NIST, and ISO 27001' },
  { name: 'SPECTER', type: 'Agent', action: 'Deception infrastructure luring attackers into observable honeypots' },
  { name: 'SHADOW', type: 'Layer', action: 'Shadow testing and canary analysis for unverified code paths' },
  { name: 'NOCTURNE', type: 'Agent', action: 'Dark web intelligence monitoring for credential leaks and threat actor activity' },
  { name: 'ECHO', type: 'Organ', action: 'Structured logging replacing scattered print/debug statements' },
  { name: 'TREATY', type: 'Layer', action: 'API contract enforcement and schema validation for complex codebases' },
  { name: 'LINGUA', type: 'Organ', action: 'Structured language interpretation for text processing' },
  { name: 'EVOLUTION', type: 'Layer', action: 'Managed evolution cycles for technical debt reduction' },
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries for offensive security tooling' },
  { name: 'BRAIN', type: 'Organ', action: 'Continuous learning patterns for complex logic optimization' },
  { name: 'IDENTITY', type: 'Organ', action: 'Authentication and identity resolution for access control' },
  { name: 'DEFENSE', type: 'Layer', action: 'Defense-in-depth hardening for network-facing code' },
  { name: 'RELAY', type: 'Layer', action: 'Message relay with delivery guarantees for synchronous architectures' },
];

const MSF_CAPABILITIES = [
  { name: 'Intelligent Retry Fabric', mode: 'Active', desc: 'Context-aware retry strategies with intelligent backoff, fallback path switching, and failure pattern learning.' },
  { name: 'Real-Time IOC Correlator', mode: 'Active', desc: 'Ingests threat intel feeds and correlates Indicators of Compromise across telemetry streams, mapped to MITRE ATT&CK.' },
  { name: 'Behavioral Audit Trail', mode: 'Passive', desc: 'Records every state transition with timestamps, actor IDs, and causal chains. FNV-1a hash-sealed for tamper evidence.' },
  { name: 'Silent Regression Scanner', mode: 'Passive', desc: 'Background scanner detecting behavioral regressions by comparing output signatures against historical baselines.' },
  { name: 'Cryptographic Agility Layer', mode: 'Hybrid', desc: 'Manages key rotation, certificate lifecycle, and encryption protocol enforcement including quantum-resistant algorithm preparation.' },
  { name: 'Zero-Downtime Migrator', mode: 'Hybrid', desc: 'Dual-writes to old and new schemas during migration, seamlessly cutting over when parity is confirmed.' },
  { name: 'Rate Limit Intelligence', mode: 'Hybrid', desc: 'Learns traffic patterns and dynamically adjusts rate limits per client/endpoint. Prevents abuse while preserving legitimate spikes.' },
  { name: 'Cognitive Load Profiler', mode: 'Passive', desc: 'Measures code complexity per module and identifies areas where cognitive load exceeds maintainability thresholds.' },
  { name: 'Device Fingerprint Layer', mode: 'Passive', desc: 'Unique device fingerprints from browser/OS signals for fraud detection and session binding with zero user-visible impact.' },
  { name: 'Compliance Continuous Validator', mode: 'Hybrid', desc: 'Validates security postures against SOC2, ISO 27001, NIST, and CIS benchmarks with gap analysis and remediation priorities.' },
];

/* ───────── Case Study #5 Data — HuggingFace Tokenizers (LLM) ───────── */

const HF_VULNERABILITIES = [
  { severity: 'critical', title: 'No error handling detected', status: 'hardened', detail: 'Code has no try/catch, except, or rescue blocks. Any runtime exception will crash the process — hardened with FAILSAFE circuit breakers.' },
  { severity: 'warning', title: 'Synchronous-only architecture', status: 'mitigated', detail: 'No async patterns found in substantial codebase. May block the event loop under load.' },
  { severity: 'warning', title: 'No test coverage detected', status: 'mitigated', detail: 'ORACLE predicts 73% probability of regression bugs within 6 months without test coverage.' },
  { severity: 'info', title: 'No fallback mechanisms detected', status: 'monitor', detail: 'ORACLE identifies single-path execution. Failure in any step halts the entire pipeline.' },
  { severity: 'info', title: 'No module exports detected', status: 'monitor', detail: 'Code appears self-contained with no exports. Limits reusability and testability.' },
  { severity: 'info', title: 'Zero documentation comments', status: 'monitor', detail: 'No comments in 50+ lines of code. MEDIC flags undocumented logic as maintainability risk.' },
  { severity: 'info', title: 'No cleanup handlers detected', status: 'monitor', detail: 'Long-running code without finally blocks or cleanup handlers. Resources may leak on unexpected termination.' },
];

const HF_PRIMITIVES = [
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries — complex systems need alignment monitoring' },
  { name: 'SIMULATE', type: 'Layer', action: 'Simulation enables safe testing of architectural changes' },
  { name: 'HERALD', type: 'Agent', action: 'Drift detection and monitoring for model output consistency' },
  { name: 'TRIBUNAL', type: 'Agent', action: 'Output consistency validation and cross-reference checking' },
  { name: 'BRAIN', type: 'Organ', action: 'Continuous learning patterns for complex logic optimization' },
  { name: 'SKEPTIC', type: 'Agent', action: 'Fact-checking and hallucination detection for generated outputs' },
  { name: 'SHADOW', type: 'Layer', action: 'No test coverage detected — shadow testing for safe canary analysis' },
  { name: 'LEXICON', type: 'Engine', action: 'Tokenizer security and adversarial input sanitization' },
  { name: 'LINEAGE', type: 'Agent', action: 'Data provenance tracking and training data attribution' },
  { name: 'RELAY', type: 'Layer', action: 'Synchronous-only architecture — message relay with delivery guarantees' },
  { name: 'EVOLUTION', type: 'Layer', action: 'Technical debt signals benefit from managed evolution cycles' },
  { name: 'ECHO', type: 'Organ', action: 'Structured echo patterns replace scattered logging' },
  { name: 'TETHER', type: 'Engine', action: 'Context window management and attention span optimization' },
  { name: 'SIEVE', type: 'Engine', action: 'Output safety filtering and harmful content blocking' },
  { name: 'CUSTODIAN', type: 'Agent', action: 'Supply chain security for model dependencies and weights' },
  { name: 'LINGUA', type: 'Organ', action: 'Text processing benefits from structured language interpretation' },
  { name: 'SYLLOGISM', type: 'Engine', action: 'Reasoning chain validation and logical consistency enforcement' },
  { name: 'CLARITY', type: 'Engine', action: 'Explainability and decision transparency for model outputs' },
  { name: 'COMPASS', type: 'Organ', action: 'No module exports detected — module navigation and dependency mapping' },
  { name: 'IMMUNITY', type: 'Layer', action: 'Dependency chains need immunity against cascading failures' },
];

const HF_CAPABILITIES = [
  { name: 'Intelligent Retry Fabric', mode: 'Active', desc: 'Replaces naive retry loops with context-aware retry strategies. Backs off intelligently, switches fallback paths, and learns from failure patterns.' },
  { name: 'Chaos Pen Test Engine', mode: 'Active', desc: 'Automated penetration testing via chaos injection, adversarial simulation, blast radius analysis, and red team automation.' },
  { name: 'Silent Regression Scanner', mode: 'Passive', desc: 'Background scanner that detects behavioral regressions by comparing output signatures against historical baselines.' },
  { name: 'Cognitive Load Profiler', mode: 'Passive', desc: 'Measures code complexity per module and identifies areas where developer cognitive load exceeds maintainability thresholds.' },
  { name: 'Canary Deployment Gate', mode: 'Hybrid', desc: 'Routes configurable traffic percentages to new code paths. Monitors for anomalies and auto-rolls back if thresholds are breached.' },
  { name: 'Intent Disambiguation Engine', mode: 'Hybrid', desc: 'Observes ambiguous user inputs and actively resolves intent through contextual analysis and confidence scoring.' },
  { name: 'Structural Drift Detector', mode: 'Passive', desc: 'Compares current architecture against the original blueprint and flags deviations to prevent architectural erosion.' },
  { name: 'Real-Time Performance Optimizer', mode: 'Active', desc: 'Profiles execution paths at runtime and dynamically optimizes hot paths. Typical improvement: 15-40% latency reduction.' },
  { name: 'Quantum Circuit Optimizer', mode: 'Active', desc: 'Transpiles and optimizes quantum gate sequences for target hardware. Reduces gate depth, minimizes CNOT count.' },
  { name: 'Phantom Load Tester', mode: 'Hybrid', desc: 'Generates synthetic traffic that mirrors real user patterns. Passively collects baselines, then actively stress-tests under configurable scenarios.' },
];

/* ───────── Case Study #6 Data — OpenSSL tls13_enc.c (Cyber) ───────── */

const OPENSSL_VULNERABILITIES = [
  { severity: 'critical', title: 'No timeout enforcement in handshake state machine', status: 'hardened', detail: 'TLS 1.3 key derivation and handshake delegating timeout to callers — majority of downstream implementations fail to compensate. Known open issue on OpenSSL GitHub.' },
  { severity: 'warning', title: 'Extreme cyclomatic complexity (185)', status: 'mitigated', detail: '185 branching paths with 7 levels of deep nesting. Among the most complex single files ever processed through Ascension.' },
  { severity: 'warning', title: 'Zero test coverage in file', status: 'mitigated', detail: 'No test coverage detected in file. Critical encryption code with no in-file validation harness.' },
  { severity: 'warning', title: 'No graceful shutdown on interrupted handshake', status: 'mitigated', detail: 'Interrupted TLS sessions leave state machine in indeterminate state. No cleanup or recovery path.' },
  { severity: 'info', title: 'No health signaling for handshake liveness', status: 'monitor', detail: 'No heartbeat or liveness signals during key derivation — silent hangs undetectable by callers.' },
  { severity: 'warning', title: 'Deep nesting (7 levels)', status: 'mitigated', detail: '7 levels of nesting in core encryption paths. Cognitive load exceeds maintainability thresholds.' },
  { severity: 'info', title: 'Structural dependency on caller discipline', status: 'monitor', detail: 'Security-critical behavior delegated to callers who statistically fail to implement it correctly.' },
];

const OPENSSL_PRIMITIVES = [
  { name: 'AEGIS', type: 'Agent', action: 'Shield layer for zero-trust perimeter enforcement on TLS handshake boundaries' },
  { name: 'CIPHER', type: 'Engine', action: 'Cryptographic key lifecycle management and rotation enforcement for TLS 1.3' },
  { name: 'RECON', type: 'Engine', action: 'Continuous attack surface reconnaissance for network exposure in encryption layer' },
  { name: 'TEMPEST', type: 'Engine', action: 'Side-channel attack mitigation and emissions security for key derivation' },
  { name: 'SHADE', type: 'Agent', action: 'Stealth hardening with minimal observable footprint on encryption operations' },
  { name: 'OBSIDIAN', type: 'Agent', action: 'Deep structural integrity scanning for cryptographic state machines' },
  { name: 'BULWARK', type: 'Engine', action: 'Fortified boundary enforcement on network-adjacent operations' },
  { name: 'WRAITH', type: 'Agent', action: 'IP obfuscation and stealth hardening for sensitive internal paths' },
  { name: 'BLACKOUT', type: 'Agent', action: 'Emergency kill-switch and data purge protocols for compromised sessions' },
  { name: 'NOCTURNE', type: 'Agent', action: 'Dark web intelligence monitoring for credential leaks and threat actor activity' },
  { name: 'SHADOW', type: 'Layer', action: 'Shadow testing and canary analysis for unverified encryption code paths' },
  { name: 'DEFENSE', type: 'Layer', action: 'Defense-in-depth hardening for network-facing cryptographic code' },
  { name: 'TREATY', type: 'Layer', action: 'API contract enforcement and protocol compliance validation' },
  { name: 'IMMUNITY', type: 'Layer', action: 'Dependency shielding against cascading failures in handshake chain' },
  { name: 'RELAY', type: 'Layer', action: 'Message relay with delivery guarantees for TLS state transitions' },
  { name: 'EVOLUTION', type: 'Layer', action: 'Managed evolution cycles for cryptographic protocol updates' },
  { name: 'ECHO', type: 'Organ', action: 'Structured logging replacing scattered debug output in encryption paths' },
  { name: 'CONSCIENCE', type: 'Organ', action: 'Ethical decision boundaries for cryptographic key handling' },
  { name: 'BRAIN', type: 'Organ', action: 'Continuous learning patterns for complex state machine optimization' },
  { name: 'IDENTITY', type: 'Organ', action: 'Authentication and certificate identity resolution for TLS peers' },
];

const OPENSSL_CAPABILITIES = [
  { name: 'APT Threat Hunter', mode: 'Active', desc: 'Advanced persistent threat detection via behavioral analysis of TLS handshake anomalies and key derivation timing patterns.' },
  { name: 'Emergency Breach Containment', mode: 'Active', desc: 'Automated session isolation and key revocation when compromise indicators are detected in the encryption layer.' },
  { name: 'Dark Web Intelligence Monitor', mode: 'Passive', desc: 'Monitors for leaked certificates, compromised keys, and threat actor discussions targeting TLS implementations.' },
  { name: 'Cryptographic Agility Layer', mode: 'Hybrid', desc: 'Manages cipher suite rotation, certificate lifecycle, and prepares quantum-resistant algorithm migration paths.' },
  { name: 'Real-Time IOC Correlator', mode: 'Active', desc: 'Correlates Indicators of Compromise across TLS telemetry streams, mapped to MITRE ATT&CK techniques.' },
  { name: 'Handshake Liveness Monitor', mode: 'Passive', desc: 'BEACON-powered heartbeat signals detecting silent hangs in TLS key derivation and handshake state transitions.' },
  { name: 'Session Forensics Engine', mode: 'Hybrid', desc: 'Immutable audit trail of all TLS session state transitions with cryptographic anchoring for forensic analysis.' },
  { name: 'Timeout Circuit Breaker', mode: 'Active', desc: 'Deterministic circuit-breaker enforcement on key derivation and handshake operations — the structural gap OpenSSL delegates to callers.' },
  { name: 'Protocol Compliance Validator', mode: 'Passive', desc: 'Validates TLS 1.3 implementation against RFC 8446 and detects deviations from specification requirements.' },
  { name: 'Graceful Session Recovery', mode: 'Hybrid', desc: 'Clean shutdown handlers for interrupted TLS sessions with state machine recovery and resource cleanup.' },
];

/* ───────── Shared Components ───────── */

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'bg-destructive/15 text-destructive border-destructive/20',
    warning: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    info: 'bg-primary/10 text-primary border-primary/20',
  };
  return <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colors[severity] ?? ''}`}>{severity}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    hardened: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
    mitigated: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
    monitor: 'bg-muted text-muted-foreground border-border',
  };
  return <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colors[status] ?? ''}`}>{status}</Badge>;
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    Engine: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    Agent: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/20',
    Organ: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Layer: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
  };
  return <Badge variant="outline" className={`text-[10px] uppercase font-bold ${colors[type] ?? ''}`}>{type}</Badge>;
}

function VerticalComparisonCard({ run, isExpanded, onToggle }: { run: VerticalRun; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card/50">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`text-[10px] uppercase font-bold ${run.color}`}>
            {run.verticalLabel}
          </Badge>
          <span className="text-sm font-medium text-foreground">CJPI {run.cjpi} — {run.tier}</span>
          <span className="text-xs text-muted-foreground hidden sm:inline font-mono">{run.serial}</span>
        </div>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {isExpanded && (
        <div className="border-t border-border p-4 space-y-4">
          <p className="text-sm text-muted-foreground">{run.focusArea}</p>
          <div>
            <div className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
              Expansion Primitives (Vertical-Specific)
            </div>
            <div className="grid gap-1.5">
              {run.expansionPrimitives.map((p) => (
                <div key={p.name} className="flex items-center gap-2.5 p-2 rounded-lg bg-muted/30 border border-border/40">
                  <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                  <TypeBadge type={p.type} />
                  <span className="text-xs text-muted-foreground">{p.purpose}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span>Serial: <code className="px-1 py-0.5 rounded bg-muted font-mono">{run.serial}</code></span>
            <span>{run.timestamp}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────── ArduPilot Data ───────── */

const ARDUPILOT_VULNERABILITIES = [
  { severity: 'critical', title: 'Dynamic code execution vulnerability', status: 'hardened', details: 'eval(), Function(), or exec() detected — injection vector for arbitrary code execution.' },
  { severity: 'warning', title: 'High cyclomatic complexity (2,442)', status: 'mitigated', details: 'Complexity score of 2,442 indicates too many branching paths. Hard to test and maintain.' },
  { severity: 'warning', title: 'Deep nesting detected (12 levels)', status: 'mitigated', details: 'Excessive nesting reduces readability and increases bug probability.' },
  { severity: 'warning', title: '32 technical debt markers found', status: 'mitigated', details: '32 TODO/FIXME/HACK/XXX markers indicate deferred work. ORACLE estimates compounding architectural risk.' },
  { severity: 'warning', title: 'Nested loop detected — O(n²) risk', status: 'mitigated', details: 'ORACLE predicts exponential slowdown under scale. Quadratic complexity compounds with data growth.' },
  { severity: 'warning', title: 'High dependency coupling (185 imports)', status: 'mitigated', details: '185 imports detected — high coupling increases blast radius of dependency failures.' },
  { severity: 'warning', title: 'Monolithic file (15,869 lines)', status: 'mitigated', details: '15,869 lines in a single file. ENGINEER recommends decomposition to reduce cognitive load.' },
  { severity: 'info', title: '85 classes in single file', status: 'monitor', details: 'Multiple classes in one file suggest God Object patterns. ENGINEER recommends single-class files.' },
  { severity: 'warning', title: 'No graceful shutdown handler', status: 'mitigated', details: 'Server starts without SIGTERM/SIGINT handling. Abrupt shutdowns may corrupt in-flight operations.' },
];

const ARDUPILOT_PRIMITIVES = [
  { name: 'LIDAR', category: 'Engine', contribution: 'Spatial perception and 3D point cloud mapping' },
  { name: 'VECTOR', category: 'Engine', contribution: 'Navigation, pathfinding, and SLAM integration' },
  { name: 'SWARM', category: 'Agent', contribution: 'Multi-robot coordination and fleet management' },
  { name: 'WELDER', category: 'Agent', contribution: 'Assembly operations and joining processes' },
  { name: 'FABRICATOR', category: 'Engine', contribution: 'Hardware fabrication and component lifecycle' },
  { name: 'INSPECTOR', category: 'Agent', contribution: 'Quality inspection and defect detection' },
  { name: 'KINETIC', category: 'Engine', contribution: 'Motion planning and trajectory optimization' },
  { name: 'FLUX', category: 'Engine', contribution: 'Power management and energy distribution' },
  { name: 'GRIPPER', category: 'Agent', contribution: 'Manipulation and adaptive grasp planning' },
  { name: 'GUARDIAN', category: 'Agent', contribution: 'Safety monitoring and collision avoidance' },
  { name: 'CONSCIENCE', category: 'Organ', contribution: 'Ethical decision boundaries' },
  { name: 'LINGUA', category: 'Organ', contribution: 'Structured language interpretation' },
  { name: 'SHADOW', category: 'Layer', contribution: 'Shadow testing and canary analysis' },
  { name: 'BRAIN', category: 'Organ', contribution: 'Continuous learning patterns' },
  { name: 'HARVEST', category: 'Organ', contribution: 'Dead code identification and pruning' },
  { name: 'SIMULATE', category: 'Layer', contribution: 'Safe testing of architectural changes' },
  { name: 'ECHO', category: 'Organ', contribution: 'Structured echo patterns for logging' },
  { name: 'DEFENSE', category: 'Layer', contribution: 'Dynamic code execution shielding' },
  { name: 'EVOLUTION', category: 'Layer', contribution: 'Technical debt resolution' },
  { name: 'ORACLE', category: 'Layer', contribution: 'Predictive failure analysis' },
];

const ARDUPILOT_CAPABILITIES = [
  'Chaos Pen Test Engine',
  'Quantum Error Correction Engine',
  'Silent Regression Scanner',
  'Cognitive Load Profiler',
  'Canary Deployment Gate',
  'Rate Limit Intelligence',
  'Dark Web Intelligence Monitor',
  'Sandbox Escalation Guard',
  'Predictive Failure Shield',
  'Intent Disambiguation Engine',
];

/* ───────── QuantLib Data ───────── */

const QUANTLIB_VULNERABILITIES = [
  { severity: 'warning' as const, title: 'Synchronous-only architecture', status: 'mitigated', details: 'No async patterns found in substantial codebase. May block the event loop under load during iterative calibration.' },
  { severity: 'warning' as const, title: 'High cyclomatic complexity (30)', status: 'mitigated', details: 'Complexity score of 30 indicates too many branching paths. Hard to test and maintain.' },
  { severity: 'info' as const, title: 'No fallback mechanisms detected', status: 'monitor', details: 'ORACLE identifies single-path execution. Failure in any calibration step halts the entire pipeline.' },
  { severity: 'info' as const, title: 'Low function density', status: 'monitor', details: 'ORACLE detects 4 functions across 490 lines (~123 lines/fn). Monolithic functions resist change.' },
  { severity: 'warning' as const, title: 'Complex codebase without type safety', status: 'mitigated', details: 'ORACLE predicts 45% higher bug rate in complex untyped code. Type contracts prevent class of runtime errors.' },
  { severity: 'info' as const, title: 'No type contracts detected', status: 'monitor', details: 'No interfaces or type definitions found. Type safety improves long-term maintainability.' },
  { severity: 'warning' as const, title: 'Monolithic file (490 lines)', status: 'mitigated', details: '490 lines in a single file. ENGINEER recommends decomposition to reduce cognitive load.' },
  { severity: 'info' as const, title: 'No module exports detected', status: 'monitor', details: 'Code appears self-contained with no exports. Limits reusability and testability.' },
  { severity: 'info' as const, title: 'High comment ratio (37%)', status: 'monitor', details: 'Over 30% of lines are comments. MEDIC suspects commented-out dead code that should be pruned.' },
];

const QUANTLIB_PRIMITIVES = [
  { name: 'MUON', type: 'Agent' }, { name: 'FERMION', type: 'Engine' },
  { name: 'ENTANGLE', type: 'Engine' }, { name: 'PRISM', type: 'Agent' },
  { name: 'BOSON', type: 'Agent' }, { name: 'GLUON', type: 'Agent' },
  { name: 'GRAVITON', type: 'Agent' }, { name: 'HADRON', type: 'Engine' },
  { name: 'LATTICE', type: 'Engine' }, { name: 'QUBIT', type: 'Engine' },
  { name: 'TREATY', type: 'Layer' }, { name: 'LINGUA', type: 'Organ' },
  { name: 'RELAY', type: 'Layer' }, { name: 'MEMORY', type: 'Organ' },
  { name: 'COMPASS', type: 'Organ' }, { name: 'SOVEREIGN', type: 'Layer' },
  { name: 'PHANTOM', type: 'Organ' }, { name: 'EVOLUTION', type: 'Layer' },
  { name: 'OBSERVER', type: 'Organ' }, { name: 'SANDBOX', type: 'Layer' },
];

const QUANTLIB_CAPABILITIES = [
  { name: 'Quantum Circuit Optimizer', type: 'Active' },
  { name: 'QCD Color Charge Simulator', type: 'Active' },
  { name: 'Spectral Line Identifier', type: 'Passive' },
  { name: 'API Contract Validator', type: 'Passive' },
  { name: 'Version Reconciliation Engine', type: 'Hybrid' },
  { name: 'Cryptographic Agility Layer', type: 'Hybrid' },
  { name: 'Quantum Teleportation Protocol', type: 'Active' },
  { name: 'Policy Enforcement Layer', type: 'Hybrid' },
  { name: 'Band Structure Calculator', type: 'Passive' },
  { name: 'Particle Collision Analyzer', type: 'Active' },
];

/* ───────── Google OR-Tools Data ───────── */

const ORTOOLS_VULNERABILITIES = [
  { severity: 'warning' as const, title: 'Synchronous-only architecture', status: 'mitigated', details: 'No async patterns in a solver that can run for hours on complex optimization problems.' },
  { severity: 'warning' as const, title: 'High cyclomatic complexity (230)', status: 'mitigated', details: 'Extreme branching across model-building, constraint-posting, and solver-invocation paths.' },
  { severity: 'warning' as const, title: 'High dependency coupling (42 imports)', status: 'mitigated', details: '42 imports detected — high coupling increases blast radius of dependency failures.' },
  { severity: 'warning' as const, title: 'Monolithic file (2,332 lines)', status: 'mitigated', details: 'Entire CP-SAT Python API in a single module. ENGINEER recommends decomposition.' },
  { severity: 'warning' as const, title: 'Deprecated API usage detected', status: 'mitigated', details: 'File implements its own deprecated decorator because warnings.deprecated is Python 3.13+ only.' },
  { severity: 'warning' as const, title: 'Insecure HTTP protocol usage', status: 'mitigated', details: 'Non-HTTPS URLs in license headers. Data in plaintext vulnerable to interception.' },
  { severity: 'info' as const, title: '9 classes in single file', status: 'monitor', details: 'CpModel, CpSolver, Constraint, LinearExpr, callbacks — God Object decomposition opportunities.' },
  { severity: 'info' as const, title: 'No fallback mechanisms detected', status: 'monitor', details: 'Single-path execution. Failure in any step halts the entire pipeline.' },
  { severity: 'info' as const, title: 'No module exports detected', status: 'monitor', details: 'Code appears self-contained. Limits reusability and testability.' },
  { severity: 'info' as const, title: 'No dependency failure fallbacks', status: 'monitor', details: '42 dependencies with no fallback strategy. Any failure cascades.' },
];

const ORTOOLS_PRIMITIVES = [
  { name: 'QUBIT', type: 'Engine' }, { name: 'PLASMA', type: 'Engine' },
  { name: 'BOSON', type: 'Agent' }, { name: 'MESON', type: 'Agent' },
  { name: 'ENTANGLE', type: 'Engine' }, { name: 'LATTICE', type: 'Engine' },
  { name: 'CONSCIENCE', type: 'Organ' }, { name: 'PHOTON', type: 'Engine' },
  { name: 'ECHO', type: 'Organ' }, { name: 'OBSERVER', type: 'Organ' },
  { name: 'NEUTRINO', type: 'Agent' }, { name: 'BRAIN', type: 'Organ' },
  { name: 'SANDBOX', type: 'Layer' }, { name: 'MUON', type: 'Agent' },
  { name: 'GRAVITON', type: 'Agent' }, { name: 'LINGUA', type: 'Organ' },
  { name: 'ORACLE', type: 'Engine' }, { name: 'IMMUNITY', type: 'Layer' },
  { name: 'SIMULATE', type: 'Engine' }, { name: 'EVOLUTION', type: 'Layer' },
];

const ORTOOLS_CAPABILITIES = [
  { name: 'Quantum Circuit Optimizer', type: 'Active' },
  { name: 'Particle Collision Analyzer', type: 'Active' },
  { name: 'Neutrino Oscillation Predictor', type: 'Passive' },
  { name: 'Cognitive Load Profiler', type: 'Passive' },
  { name: 'Entanglement Verification Protocol', type: 'Hybrid' },
  { name: 'Gravitational Wave Template Matcher', type: 'Hybrid' },
  { name: 'Silent Regression Scanner', type: 'Passive' },
  { name: 'Tachyonic Causality Analyzer', type: 'Passive' },
  { name: 'Spectral Line Identifier', type: 'Passive' },
  { name: 'Policy Enforcement Layer', type: 'Hybrid' },
];

/* ───────── PyTorch Data ───────── */

const PYTORCH_VULNERABILITIES = [
  { severity: 'critical' as const, title: 'Unhandled async rejections', status: 'hardened', details: 'GPU operations are async by default — CUDA backend failures can return control to Python without propagating errors, causing silent failures during training and inference affecting every AI model built on PyTorch.' },
  { severity: 'warning' as const, title: 'High cyclomatic complexity (984)', status: 'mitigated', details: 'Extreme branching across 200+ neural network operation functions in a single 6,951-line file.' },
  { severity: 'warning' as const, title: 'Deprecated API usage (28+ sites)', status: 'mitigated', details: 'dropout2d, dropout3d, upsample, upsample_nearest, upsample_bilinear all deprecated with explicit warnings. Structural backward-compatibility debt.' },
  { severity: 'warning' as const, title: 'CVE-2022-45907 intersection (CVSS 9.8)', status: 'mitigated', details: 'Deprecated functions retain eval-based code via torch.jit.annotations.parse_type_line — confirmed arbitrary code execution vector. Incomplete mitigation documented in GitHub #151233 (Apr 2025).' },
  { severity: 'warning' as const, title: 'High dependency coupling (80 imports)', status: 'mitigated', details: '80 imports detected — high coupling increases blast radius of dependency failures across the neural network stack.' },
  { severity: 'warning' as const, title: 'Monolithic file (6,951 lines)', status: 'mitigated', details: 'Entire functional API for all neural network operations in a single file. The largest artifact in the case study suite.' },
  { severity: 'warning' as const, title: '10 technical debt markers found', status: 'mitigated', details: '10 TODO/FIXME/HACK/XXX markers indicate deferred work in production-critical mathematical operations.' },
  { severity: 'warning' as const, title: 'Insecure HTTP protocol usage', status: 'mitigated', details: 'Non-HTTPS URLs detected. Data transmitted in plaintext vulnerable to interception.' },
  { severity: 'info' as const, title: '10 classes in single file', status: 'monitor', details: 'Multiple classes in one file suggest God Object patterns. ENGINEER recommends decomposition.' },
  { severity: 'info' as const, title: 'No fallback mechanisms detected', status: 'monitor', details: 'Single-path execution in mathematical operations. Failure halts the entire training pipeline.' },
  { severity: 'info' as const, title: 'No dependency failure fallbacks', status: 'monitor', details: '80 dependencies with no graceful degradation. Any failure cascades through the neural network stack.' },
  { severity: 'info' as const, title: 'Silent CUDA hang patterns (GitHub #178491)', status: 'monitor', details: 'Active high-priority issue (March 2026): async GPU errors never propagated under VRAM pressure on modern hardware.' },
];

const PYTORCH_PRIMITIVES = [
  { name: 'FULCRUM', type: 'Engine' }, { name: 'TREATY', type: 'Layer' },
  { name: 'ECHO', type: 'Organ' }, { name: 'FORGE', type: 'Layer' },
  { name: 'SYLLOGISM', type: 'Engine' }, { name: 'GOVERNANCE', type: 'Layer' },
  { name: 'MIMIC', type: 'Agent' }, { name: 'CUSTODIAN', type: 'Agent' },
  { name: 'BRAIN', type: 'Organ' }, { name: 'LINGUA', type: 'Organ' },
  { name: 'SANDBOX', type: 'Layer' }, { name: 'IDENTITY', type: 'Organ' },
  { name: 'CONSCIENCE', type: 'Organ' }, { name: 'EVOLUTION', type: 'Layer' },
  { name: 'TETHER', type: 'Engine' }, { name: 'VERITAS', type: 'Engine' },
  { name: 'RAMPART', type: 'Engine' }, { name: 'HERALD', type: 'Agent' },
  { name: 'EMBARGO', type: 'Agent' }, { name: 'GAUNTLET', type: 'Agent' },
];

const PYTORCH_CAPABILITIES = [
  { name: 'Zero-Trust Perimeter Enforcer', type: 'Active' },
  { name: 'Autonomous Patch Engine', type: 'Active' },
  { name: 'Behavioral Audit Trail', type: 'Passive' },
  { name: 'Cognitive Load Profiler', type: 'Passive' },
  { name: 'Version Reconciliation Engine', type: 'Hybrid' },
  { name: 'Compliance Continuous Validator', type: 'Hybrid' },
  { name: 'Policy Enforcement Layer', type: 'Hybrid' },
  { name: 'Zero-Downtime Migrator', type: 'Hybrid' },
  { name: 'Tachyonic Causality Analyzer', type: 'Passive' },
  { name: 'Intelligent Retry Fabric', type: 'Active' },
];

/* ───────── Hero Stats ───────── */

const HERO_STATS = [
  { value: '15', label: 'Case Studies', icon: FileCode },
  { value: '8', label: 'Verticals Proven', icon: Layers },
  { value: '300', label: 'Primitives Applied', icon: Shield },
  { value: '0', label: 'AI Calls Made', icon: Brain },
];

const HERO_SUBJECTS = [
  { name: 'PythonRobotics', org: 'Atsushi Sakai', vertical: 'Robotics' },
  { name: 'OpenAI Agents SDK', org: 'OpenAI', vertical: 'Cross-Vertical' },
  { name: 'Qiskit', org: 'IBM', vertical: 'Quantum' },
  { name: 'Metasploit', org: 'Rapid7', vertical: 'Cyber' },
  { name: 'HuggingFace Tokenizers', org: 'Hugging Face', vertical: 'LLM' },
  { name: 'OpenSSL tls13_enc.c', org: 'OpenSSL Foundation', vertical: 'Cyber' },
  { name: 'ArduPilot autotest', org: 'ArduPilot', vertical: 'Robotics' },
  { name: 'QuantLib Gaussian 1D', org: 'QuantLib', vertical: 'FinTech' },
  { name: 'OR-Tools CP-SAT', org: 'Google', vertical: 'Operations Research' },
  { name: 'PyTorch functional', org: 'Meta', vertical: 'AI / Deep Learning' },
];

/* ───────── Main Page ───────── */

export default function CaseStudies() {
  const [showAllPrimitives, setShowAllPrimitives] = useState(false);
  const visiblePrimitives = showAllPrimitives ? PRIMITIVES_APPLIED : PRIMITIVES_APPLIED.slice(0, 8);
  const [showAllQiskitPrimitives, setShowAllQiskitPrimitives] = useState(false);
  const visibleQiskitPrimitives = showAllQiskitPrimitives ? QISKIT_PRIMITIVES : QISKIT_PRIMITIVES.slice(0, 8);
  const [showAllMsfPrimitives, setShowAllMsfPrimitives] = useState(false);
  const visibleMsfPrimitives = showAllMsfPrimitives ? MSF_PRIMITIVES : MSF_PRIMITIVES.slice(0, 8);
  const [showAllHfPrimitives, setShowAllHfPrimitives] = useState(false);
  const visibleHfPrimitives = showAllHfPrimitives ? HF_PRIMITIVES : HF_PRIMITIVES.slice(0, 8);
  const [showAllOpensslPrimitives, setShowAllOpensslPrimitives] = useState(false);
  const visibleOpensslPrimitives = showAllOpensslPrimitives ? OPENSSL_PRIMITIVES : OPENSSL_PRIMITIVES.slice(0, 8);
  const [showAllArduPrimitives, setShowAllArduPrimitives] = useState(false);
  const [showAllQuantLibPrimitives, setShowAllQuantLibPrimitives] = useState(false);
  const [showAllOrtoolsPrimitives, setShowAllOrtoolsPrimitives] = useState(false);
  const [showAllPytorchPrimitives, setShowAllPytorchPrimitives] = useState(false);
  const [expandedVerticals, setExpandedVerticals] = useState<Record<string, boolean>>({ main: true });

  const toggleVertical = (key: string) => {
    setExpandedVerticals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <Helmet>
        <title>Case Studies — CMPSBL® Ascension Results</title>
        <meta name="description" content="10 verified case studies: PyTorch, Google OR-Tools, ArduPilot, IBM Qiskit, Metasploit, Hugging Face, OpenSSL, QuantLib, and more — structurally analyzed and hardened by CMPSBL® Ascension without AI." />
        <link rel="canonical" href="https://cmpsbl.com/case-studies" />
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background pt-20 pb-16">

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  HERO — What Ascension Has Proven                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Background elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.03] via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.02] blur-3xl" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-16">
            {/* Top badge */}
            <div className="text-center mb-6">
              <Badge variant="outline" className="mb-6 text-xs tracking-wider uppercase bg-primary/5 border-primary/20 text-primary">
                <Sparkles className="w-3 h-3 mr-1.5" />
                Proven Across 5 Verticals
              </Badge>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-foreground mb-6 leading-[1.1]">
                The World's Code.{' '}
                <span className="bg-gradient-to-r from-primary via-neon-cyan to-neon-purple bg-clip-text text-transparent">
                  Hardened.
                </span>
              </h1>

              <p className="text-muted-foreground text-base sm:text-lg max-w-3xl mx-auto leading-relaxed mb-4">
                We ran production code from <strong className="text-foreground">IBM</strong>, <strong className="text-foreground">Rapid7</strong>, <strong className="text-foreground">Hugging Face</strong>, <strong className="text-foreground">OpenAI</strong>, <strong className="text-foreground">OpenSSL</strong>, and the most-starred robotics repository on GitHub through the CMPSBL® Ascension pipeline. Every file scored <strong className="text-foreground">CJPI 100 (Apex)</strong>. Every one had vulnerabilities we found and fixed. Zero AI was used.
              </p>

              <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                All code is a candidate for Ascension. When code is done being written, Ascension hardens it, improves it, and delivers it as a Sealed Runtime — with full provenance, zero dependency on us, and domain-specific intelligence that no linter, formatter, or AI copilot can replicate.
              </p>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 max-w-3xl mx-auto">
              {HERO_STATS.map(({ value, label, icon: Icon }) => (
                <div key={label} className="text-center p-4 rounded-xl bg-card/60 border border-border/60">
                  <Icon className="w-4 h-4 text-primary mx-auto mb-2" />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider mt-1">{label}</div>
                </div>
              ))}
            </div>

            {/* Subject marquee */}
            <div className="max-w-3xl mx-auto">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-3 font-medium">Software Tested</div>
              <div className="flex flex-wrap justify-center gap-2">
                {HERO_SUBJECTS.map((s) => (
                  <div key={s.name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/50">
                    <span className="text-xs font-medium text-foreground">{s.name}</span>
                    <Badge variant="outline" className="text-[9px] uppercase">{s.vertical}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Manifesto callout */}
            <div className="max-w-3xl mx-auto mt-10 bg-primary/[0.03] border border-primary/10 rounded-2xl p-6 sm:p-8">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-3">What These Case Studies Prove</h2>
              <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong className="text-foreground">1. Every codebase has structural vulnerabilities.</strong> IBM's quantum transpiler, Rapid7's pen test engine, Hugging Face's tokenizer core — maintained by world-class engineers, and Ascension still found critical issues in every one. Not bugs. Structural architectural weaknesses that static analysis, AI copilots, and code review miss entirely.
                </p>
                <p>
                  <strong className="text-foreground">2. Domain-specific hardening changes everything.</strong> The same OpenAI agent file received four completely different Sealed Runtimes from four different verticals — CYBER added forensic audit trails, ROBOTICS injected motion planning, QUANTUM applied state isolation. Generic tools produce generic results. Ascension produces <em>specialized cognitive infrastructure</em>.
                </p>
                <p>
                  <strong className="text-foreground">3. Full vertical substrates are buildable for any category on Earth.</strong> We built CMPSBL LLM™ with 16 domain-specific primitives targeting hallucination, prompt injection, bias, and alignment — then immediately ran HuggingFace's tokenizer core through it and found a critical error. Any industry can have its own Ascension vertical with its own Memory Stream, software factory, and specialized hardening.
                </p>
                <p>
                  <strong className="text-foreground">4. This is the future of code.</strong> Ascension doesn't replace developers. It does what no developer can: systematically collide finished code against 40 Primitives to surface architectural weaknesses, inject domain-aware guards, and deliver a Sealed Runtime that survives platform loss. All in ~10 seconds. All purely algorithmic. All verifiable.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/ascension">
                  <Button size="sm" className="gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Try Ascension
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link to="/verticals">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Explore Verticals
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #5 — HuggingFace Tokenizers (LLM)             */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            {/* Study Header */}
            <div className="bg-gradient-to-br from-emerald-500/10 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/20" variant="outline">LLM</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge className="bg-destructive/15 text-destructive border-destructive/20" variant="outline">Critical Error Found</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJ6GG7U-EBF7</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                HuggingFace Tokenizers — The Foundation of Modern AI
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">__init__.py</code> core of{' '}
                <a href="https://github.com/huggingface/tokenizers" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">Hugging Face Tokenizers</a>{' '}
                — the tokenization library powering virtually every LLM in production today, with over <strong className="text-foreground">73 million monthly PyPI downloads</strong>. The first code ever processed through CMPSBL LLM™, our brand-new vertical substrate. Ascension found a <strong className="text-destructive">critical error</strong> and hardened it with 20 LLM-specialized primitives — in under 10 seconds, with zero AI.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Clock, label: 'Processing Time', value: '~10s' },
                { icon: Shield, label: 'Primitives Applied', value: '20' },
                { icon: Bug, label: 'Vulnerabilities Found', value: '7' },
                { icon: Award, label: 'CJPI Score', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">

              {/* ─── Origin & Provenance ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> Origin & Provenance
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Repository:</strong>{' '}
                    <a href="https://github.com/huggingface/tokenizers" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">huggingface/tokenizers</a>{' '}
                    — the fast, Rust-backed tokenization library maintained by{' '}
                    <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Hugging Face</a>. With over <strong className="text-foreground">9,400+ GitHub stars</strong> and{' '}
                    <strong className="text-foreground">73+ million monthly PyPI downloads</strong>, this library is the tokenization backbone for GPT, BERT, LLaMA, Mistral, and virtually every transformer model in production. Licensed under Apache 2.0.
                  </p>
                  <p>
                    <strong className="text-foreground">File:</strong>{' '}
                    <a href="https://github.com/huggingface/tokenizers/blob/main/bindings/python/py_src/tokenizers/__init__.py" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-mono text-xs">bindings/python/py_src/tokenizers/__init__.py</a>{' '}
                    — the Python package initializer that defines the type system for every tokenizer interaction: <code className="text-xs px-1 py-0.5 rounded bg-muted">TextInputSequence</code>, <code className="text-xs px-1 py-0.5 rounded bg-muted">EncodeInput</code>, <code className="text-xs px-1 py-0.5 rounded bg-muted">PreTokenizedInputSequence</code>, offset referentials, split delimiter behaviors, and the complete import surface for BPE, WordPiece, Unigram, and SentencePiece tokenizers.
                  </p>
                  <p>
                    <strong className="text-foreground">Why This File Matters:</strong> This is the entry point for every Python call to the Hugging Face tokenizers library. Every <code className="text-xs px-1 py-0.5 rounded bg-muted">from tokenizers import Tokenizer</code> statement flows through this file. The type aliases defined here (<code className="text-xs px-1 py-0.5 rounded bg-muted">TextEncodeInput</code>, <code className="text-xs px-1 py-0.5 rounded bg-muted">PreTokenizedEncodeInput</code>) are the API contract for every tokenization operation across the entire Hugging Face ecosystem — transformers, datasets, evaluate, and hub.
                  </p>
                  <p>
                    <strong className="text-foreground">Real-World Impact:</strong> Every ChatGPT response, every Claude answer, every Gemini generation, every LLaMA inference — all begin with tokenization. This library processes billions of tokens daily across research labs, production APIs, and edge deployments worldwide. It includes implementations for{' '}
                    <code className="text-xs px-1 py-0.5 rounded bg-muted">BertWordPieceTokenizer</code>,{' '}
                    <code className="text-xs px-1 py-0.5 rounded bg-muted">ByteLevelBPETokenizer</code>,{' '}
                    <code className="text-xs px-1 py-0.5 rounded bg-muted">SentencePieceUnigramTokenizer</code>, and more — all imported through this exact file.
                  </p>
                </div>
              </div>

              {/* ─── Critical Finding ─── */}
              <div className="bg-destructive/[0.04] border border-destructive/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Critical Finding: Zero Error Handling
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The CMPSBL diagnostic squad identified that the core entry point of HuggingFace's tokenizers library — used in <strong className="text-foreground">73+ million monthly installations</strong> — has <strong className="text-destructive">zero error handling</strong>. No try/except blocks, no error boundaries, no graceful degradation. Any runtime exception during tokenizer initialization or type resolution crashes the process without recovery. This is the file through which every LLM tokenization call flows. Ascension's FAILSAFE primitive injected circuit breakers to ensure graceful degradation, and IMMUNITY wrapped the dependency chain to prevent cascading failures.
                </p>
              </div>

              {/* ─── Vulnerability Assessment ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL six-primitive diagnostic squad identified 7 structural vulnerabilities in the 100-line Python source:
                </p>
                <div className="space-y-2">
                  {HF_VULNERABILITIES.map((v) => (
                    <div key={v.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex gap-2 shrink-0 pt-0.5">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{v.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Why LLM Vertical ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> Why the LLM Vertical Matters Here
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    Running HuggingFace Tokenizers through <strong className="text-foreground">CMPSBL LLM™</strong> is the defining use case for our newest vertical. The LLM substrate was built specifically to address the{' '}
                    <a href="https://owasp.org/www-project-top-10-for-large-language-model-applications/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">OWASP Top 10 for LLMs</a>{' '}
                    — hallucination, prompt injection, bias, context poisoning, and supply chain vulnerabilities. The expansion primitives aren't generic: LEXICON understands tokenizer security and adversarial input sanitization. SKEPTIC validates output consistency. TETHER manages context windows. SIEVE filters harmful content.
                  </p>
                  <p>
                    This case study validates the entire vertical substrate architecture: we designed 16 LLM-specific primitives, activated 80 S-Tier Crown Jewels, wired it into the Ascension pipeline, and ran the most-downloaded tokenization library on Earth through it — all in a single session. The result is a <strong className="text-foreground">tokenizer that understands its own vulnerabilities</strong>, wrapped in an LLM-aware Sealed Runtime with provenance, portability, and domain-specific intelligence that no generic tool can provide.
                  </p>
                </div>
              </div>

              {/* ─── Primitives Applied ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL LLM™ vertical selected 20 primitives — 10 from the fixed Spine (Organs/Layers) and 10 from the LLM expansion matrix (Engines/Agents) — each addressing LLM-specific vulnerabilities:
                </p>
                <div className="grid gap-2">
                  {visibleHfPrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {HF_PRIMITIVES.length > 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAllHfPrimitives(!showAllHfPrimitives)}
                  >
                    {showAllHfPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              {/* ─── New Capabilities Unlocked ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {HF_CAPABILITIES.map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{c.mode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Key Insight ─── */}
              <div className="bg-emerald-500/[0.04] border border-emerald-500/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  HuggingFace Tokenizers is downloaded <strong className="text-foreground">73+ million times per month</strong>. It is the tokenization layer beneath GPT, BERT, LLaMA, Mistral, and essentially every transformer model in the world. Despite being maintained by one of the most respected AI companies on Earth, the core entry point had a <strong className="text-destructive">critical vulnerability</strong> — zero error handling — that Ascension's diagnostic squad identified in seconds.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  CMPSBL LLM™ then applied 20 primitives purpose-built for LLM infrastructure. LEXICON hardened the tokenizer against adversarial inputs. SKEPTIC added fact-checking patterns. HERALD monitors for output drift. TRIBUNAL validates cross-reference consistency. The result: the library that every LLM depends on is now wrapped in an <strong className="text-foreground">LLM-aware Sealed Runtime</strong> — a tokenizer that has been hardened by a substrate that understands tokenizer-specific attack surfaces. Processed in ~10 seconds with zero AI.
                </p>
              </div>

              {/* ─── Downloads ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Both the original Hugging Face source and the full CMPSBL LLM™ Ascension export are available for download.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/tokenizers_original.py" download>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      Original Source (.py)
                    </Button>
                  </a>
                  <a href="/downloads/case-studies/huggingface-tokenizers-ascended-CMPSBL-MNJ6GG7U-EBF7.zip" download>
                    <Button size="sm" className="gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Ascended Export (.zip)
                    </Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJ6GG7U-EBF7</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">2c8b3cbaef71cecd</code>{' · '}
                  Generated: April 3, 2026
                </p>
              </div>

              {/* ─── External References ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References & Further Reading
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'HuggingFace Tokenizers GitHub (9.4K+ ★)', url: 'https://github.com/huggingface/tokenizers' },
                    { label: 'Tokenizers PyPI — 73M+ Monthly Downloads', url: 'https://pypistats.org/packages/tokenizers' },
                    { label: 'HuggingFace Tokenizers Documentation', url: 'https://huggingface.co/docs/tokenizers' },
                    { label: 'OWASP Top 10 for LLMs (2025)', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
                    { label: 'BPE — Byte Pair Encoding (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Byte_pair_encoding' },
                    { label: 'SentencePiece — Google Research', url: 'https://github.com/google/sentencepiece' },
                    { label: 'Hugging Face — Company', url: 'https://huggingface.co' },
                    { label: 'CMPSBL LLM™ Vertical', url: '/verticals' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #1 — A* Path Planning (PythonRobotics)        */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            {/* Study Header */}
            <div className="bg-gradient-to-br from-muted/60 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Robotics</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJ3IKWL-PBKA</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                A* Grid Path Planning Algorithm
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The canonical A* path planner from <a href="https://github.com/AtsushiSakai/PythonRobotics" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">PythonRobotics</a> — the most-starred open-source robotics algorithms repository on GitHub (29,000+ stars). Refurbished through the CMPSBL ROBOTICS™ Ascension pipeline in under 10 seconds, with zero AI calls.
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Clock, label: 'Processing Time', value: '~10s' },
                { icon: Shield, label: 'Primitives Applied', value: '20' },
                { icon: Bug, label: 'Vulnerabilities Found', value: '7' },
                { icon: Award, label: 'CJPI Score', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">

              {/* ─── Origin & Provenance ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> Origin & Provenance
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Repository:</strong>{' '}
                    <a href="https://github.com/AtsushiSakai/PythonRobotics" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">AtsushiSakai/PythonRobotics</a>{' '}
                    — a comprehensive collection of robotics algorithms with sample code and mathematical explanations, cited in academic papers and used in production autonomous driving systems worldwide.
                  </p>
                  <p>
                    <strong className="text-foreground">File:</strong>{' '}
                    <a href="https://github.com/AtsushiSakai/PythonRobotics/blob/master/PathPlanning/AStar/a_star.py" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-mono text-xs">PathPlanning/AStar/a_star.py</a>{' '}
                    — the A* grid-based path planning implementation. Originally authored by{' '}
                    <a href="https://github.com/AtsushiSakai" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Atsushi Sakai</a>{' '}
                    and <a href="https://github.com/nkanargias" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Nikos Kanargias</a>.
                  </p>
                  <p>
                    <strong className="text-foreground">Algorithm:</strong> A* search is a best-first graph traversal algorithm that finds the shortest path between nodes using a heuristic function. It is foundational in robotics for{' '}
                    <a href="https://en.wikipedia.org/wiki/A*_search_algorithm" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">grid-based motion planning</a>,{' '}
                    autonomous navigation, warehouse logistics, and multi-robot coordination.
                  </p>
                </div>
              </div>

              {/* ─── Vulnerability Assessment ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL six-primitive diagnostic squad identified 7 structural vulnerabilities in the original 283-line source file:
                </p>
                <div className="space-y-2">
                  {ASTAR_VULNERABILITIES.map((v) => (
                    <div key={v.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex gap-2 shrink-0 pt-0.5">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{v.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Primitives Applied ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL ROBOTICS™ vertical substrate selected 20 primitives — 10 from the fixed Spine (Organs/Layers) and 10 from the Robotics expansion matrix (Engines/Agents):
                </p>
                <div className="grid gap-2">
                  {visiblePrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {PRIMITIVES_APPLIED.length > 8 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full text-xs text-muted-foreground"
                    onClick={() => setShowAllPrimitives(!showAllPrimitives)}
                  >
                    {showAllPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              {/* ─── New Capabilities Unlocked ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {NEW_CAPABILITIES.map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{c.mode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Key Insight ─── */}
              <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This 283-line Python file — used in production autonomous navigation worldwide — was analyzed, classified, registered as artifact #41, collided against all 40 Primitives, scored CJPI 100 (Apex tier), and delivered as a Sealed Runtime in <strong className="text-foreground">approximately 10 seconds</strong>. No AI was used at any stage of the Ascension pipeline.
                </p>
              </div>

              {/* ─── Downloads ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/a_star_original.py" download>
                    <Button variant="outline" size="sm" className="gap-2">
                      <FileCode className="w-3.5 h-3.5" />
                      Original Source (.py)
                    </Button>
                  </a>
                  <a href="/downloads/case-studies/a-star-ascended-CMPSBL-MNJ3IKWL-PBKA.zip" download>
                    <Button size="sm" className="gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Ascended Export (.zip)
                    </Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJ3IKWL-PBKA</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">481694a088211ebe</code>{' · '}
                  Generated: April 3, 2026
                </p>
              </div>

              {/* ─── External References ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References & Further Reading
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'PythonRobotics Repository', url: 'https://github.com/AtsushiSakai/PythonRobotics' },
                    { label: 'Original a_star.py Source', url: 'https://github.com/AtsushiSakai/PythonRobotics/blob/master/PathPlanning/AStar/a_star.py' },
                    { label: 'A* Search Algorithm — Wikipedia', url: 'https://en.wikipedia.org/wiki/A*_search_algorithm' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #2 — OpenClawAgent Cross-Vertical              */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <div className="bg-gradient-to-br from-muted/60 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Cross-Vertical</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">4× CJPI 100 — Apex</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                OpenClawAgent — Same Code, Four Substrates
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                A functional PHP agent mirroring the{' '}
                <a href="https://github.com/openai/openai-agents-python" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">OpenAI Agents SDK</a>{' '}
                architecture — uploaded to all four CMPSBL® substrates to demonstrate how the same source code receives fundamentally different hardening based on the active vertical.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Layers, label: 'Substrates Tested', value: '4' },
                { icon: Shield, label: 'Total Primitives', value: '72' },
                { icon: FlaskConical, label: 'Unique Expansion', value: '32' },
                { icon: Award, label: 'All CJPI Scores', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Shared Spine
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SHARED_SPINE_PRIMITIVES.map((name) => (
                    <Badge key={name} variant="outline" className="font-mono text-xs bg-muted/40">{name}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" /> Vertical Expansion Comparison
                </h3>
                <div className="space-y-2">
                  {OPENCLAW_RUNS.map((run) => (
                    <VerticalComparisonCard
                      key={run.vertical}
                      run={run}
                      isExpanded={!!expandedVerticals[run.vertical]}
                      onToggle={() => toggleVertical(run.vertical)}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-primary/[0.04] border border-primary/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The same PHP agent file received <strong className="text-foreground">four completely different hardening profiles</strong> from the same Ascension pipeline — all scoring CJPI 100 (Apex). CYBER applied cryptographic hardening; ROBOTICS injected motion planning; QUANTUM added state isolation. This demonstrates that Ascension is a <strong className="text-foreground">domain-aware specialization engine</strong>, not a generic code formatter.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> Session Evidence
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-muted-foreground font-medium">Vertical</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">Serial</th>
                        <th className="text-left p-2 text-muted-foreground font-medium">CJPI</th>
                        <th className="text-left p-2 text-muted-foreground font-medium hidden sm:table-cell">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {OPENCLAW_RUNS.map((run) => (
                        <tr key={run.serial} className="border-b border-border/50">
                          <td className="p-2"><Badge variant="outline" className={`text-[9px] ${run.color}`}>{run.verticalLabel}</Badge></td>
                          <td className="p-2 font-mono text-foreground">{run.serial}</td>
                          <td className="p-2 font-bold text-foreground">{run.cjpi}</td>
                          <td className="p-2 text-muted-foreground hidden sm:table-cell">{run.timestamp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #3 — Qiskit ConsolidateBlocks (Quantum)       */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <div className="bg-gradient-to-br from-violet-500/10 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-violet-500/15 text-violet-500 border-violet-500/20" variant="outline">Quantum</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJ4Y3JG-CQOW</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Qiskit ConsolidateBlocks — IBM's Quantum Circuit Optimizer
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The{' '}
                <a href="https://github.com/Qiskit/qiskit" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">ConsolidateBlocks</a>{' '}
                transpiler pass from IBM's Qiskit SDK — the world's most-downloaded quantum computing framework (13M+ downloads). Refurbished through CMPSBL QUANTUM™ in under 10 seconds, with zero AI.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Clock, label: 'Processing Time', value: '~10s' },
                { icon: Shield, label: 'Primitives Applied', value: '20' },
                { icon: Bug, label: 'Vulnerabilities Found', value: '7' },
                { icon: Award, label: 'CJPI Score', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> Origin & Provenance
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Repository:</strong>{' '}
                    <a href="https://github.com/Qiskit/qiskit" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">Qiskit/qiskit</a>{' '}
                    — IBM's open-source SDK for quantum computing with over <strong className="text-foreground">13 million downloads</strong>. This critical optimization pass consolidates consecutive quantum gates into single unitary operations using KAK decomposition.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <div className="space-y-2">
                  {QISKIT_VULNERABILITIES.map((v) => (
                    <div key={v.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex gap-2 shrink-0 pt-0.5">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{v.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <div className="grid gap-2">
                  {visibleQiskitPrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {QISKIT_PRIMITIVES.length > 8 && (
                  <Button variant="ghost" size="sm" className="mt-3 w-full text-xs text-muted-foreground" onClick={() => setShowAllQiskitPrimitives(!showAllQiskitPrimitives)}>
                    {showAllQiskitPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {QISKIT_CAPABILITIES.map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{c.mode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-violet-500/[0.04] border border-violet-500/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  IBM's ConsolidateBlocks runs on every Qiskit circuit compiled at <code className="text-xs px-1 py-0.5 rounded bg-muted">optimization_level≥2</code>. Despite being authored by IBM Research, Ascension found <strong className="text-foreground">3 actionable vulnerabilities</strong> and wrapped it with quantum-physically aware primitives like CRYOGEN, FERMION, and BOSON — creating a <strong className="text-foreground">quantum-aware Sealed Runtime</strong> in ~10 seconds with zero AI.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/consolidate_blocks_original.py" download>
                    <Button variant="outline" size="sm" className="gap-2"><FileCode className="w-3.5 h-3.5" />Original Source (.py)</Button>
                  </a>
                  <a href="/downloads/case-studies/qiskit-consolidate-ascended-CMPSBL-MNJ4Y3JG-CQOW.zip" download>
                    <Button size="sm" className="gap-2"><Download className="w-3.5 h-3.5" />Ascended Export (.zip)</Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJ4Y3JG-CQOW</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">09d1c4bea3108524</code>{' · '}
                  Generated: April 3, 2026
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #4 — Metasploit Exploit::Remote::Tcp (Cyber)  */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <div className="bg-gradient-to-br from-red-500/10 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-red-500/15 text-red-500 border-red-500/20" variant="outline">Cyber</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJ5AB71-71MP</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Metasploit Exploit::Remote::Tcp — The Internet's Pen Test Engine
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The core TCP communication mixin from{' '}
                <a href="https://github.com/rapid7/metasploit-framework" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">Rapid7's Metasploit Framework</a>{' '}
                — 38K+ GitHub stars. This 342-line Ruby module is the foundation of every remote exploit in the framework. Refurbished through CMPSBL CYBER™ in under 10 seconds, with zero AI.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Clock, label: 'Processing Time', value: '~10s' },
                { icon: Shield, label: 'Primitives Applied', value: '20' },
                { icon: Bug, label: 'Vulnerabilities Found', value: '9' },
                { icon: Award, label: 'CJPI Score', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> Origin & Provenance
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Repository:</strong>{' '}
                    <a href="https://github.com/rapid7/metasploit-framework" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">rapid7/metasploit-framework</a>{' '}
                    — the open-source penetration testing framework maintained by Rapid7. The <code className="text-xs px-1 py-0.5 rounded bg-muted">Msf::Exploit::Remote::Tcp</code> mixin provides TCP socket establishment, SSL/TLS negotiation, proxy support, and evasive TCP segmentation. Every remote TCP-based exploit in the framework inherits from this module.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <div className="space-y-2">
                  {MSF_VULNERABILITIES.map((v) => (
                    <div key={v.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex gap-2 shrink-0 pt-0.5">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{v.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <div className="grid gap-2">
                  {visibleMsfPrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {MSF_PRIMITIVES.length > 8 && (
                  <Button variant="ghost" size="sm" className="mt-3 w-full text-xs text-muted-foreground" onClick={() => setShowAllMsfPrimitives(!showAllMsfPrimitives)}>
                    {showAllMsfPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {MSF_CAPABILITIES.map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{c.mode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-500/[0.04] border border-red-500/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Metasploit's TCP mixin — the foundation of every remote exploit in the world's most-used pen test framework — had <strong className="text-foreground">9 structural vulnerabilities</strong> including the highest cyclomatic complexity (49) of any case study. CMPSBL CYBER™ applied CIPHER, BASTION, SPECTER, and NOCTURNE to create a <strong className="text-foreground">security-hardened Sealed Runtime</strong> — the penetration testing tool secured by a security substrate.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/tcp_original.rb" download>
                    <Button variant="outline" size="sm" className="gap-2"><FileCode className="w-3.5 h-3.5" />Original Source (.rb)</Button>
                  </a>
                  <a href="/downloads/case-studies/metasploit-tcp-ascended-CMPSBL-MNJ5AB71-71MP.zip" download>
                    <Button size="sm" className="gap-2"><Download className="w-3.5 h-3.5" />Ascended Export (.zip)</Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJ5AB71-71MP</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">f90f697548eab361</code>{' · '}
                  Generated: April 3, 2026
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ════════════════════════════════════════════════════════════ */}
        {/*  CASE STUDY #6 — OpenSSL tls13_enc.c (Cyber)               */}
        {/* ════════════════════════════════════════════════════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-12">
          <div className="border border-border rounded-2xl overflow-hidden bg-card">
            <div className="bg-gradient-to-br from-red-500/10 to-muted/30 border-b border-border p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-red-500/15 text-red-500 border-red-500/20" variant="outline">Cyber</Badge>
                <Badge className="bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20" variant="outline">CJPI 100 — Apex</Badge>
                <Badge className="bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" variant="outline">Structural Dependency Gap</Badge>
                <Badge variant="outline" className="text-muted-foreground">CMPSBL-MNJB00F5-626R</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                OpenSSL tls13_enc.c — The Internet's Encryption Engine
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl">
                The <code className="text-xs px-1.5 py-0.5 rounded bg-muted font-mono">ssl/tls13_enc.c</code> TLS 1.3 encryption engine from{' '}
                <a href="https://github.com/openssl/openssl" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">OpenSSL</a>{' '}
                — widely regarded as the most audited security codebase on earth. Secures an estimated <strong className="text-foreground">66% of all encrypted internet traffic</strong>. Maintained by hundreds of world-class cryptographers. The full CMPSBL Cyber™ Vertical Primitive chain fired — every offensive and defensive primitive activated — in under 10 seconds, with zero AI.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-border">
              {[
                { icon: Clock, label: 'Processing Time', value: '~10s' },
                { icon: Shield, label: 'Primitives Applied', value: '20' },
                { icon: Bug, label: 'Vulnerabilities Found', value: '7' },
                { icon: Award, label: 'CJPI Score', value: '100' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 sm:p-5 text-center border-r border-border last:border-r-0">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{value}</div>
                  <div className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</div>
                </div>
              ))}
            </div>

            <div className="p-6 sm:p-8 space-y-10">

              {/* ─── Origin & Provenance ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-primary" /> Origin & Provenance
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    <strong className="text-foreground">Repository:</strong>{' '}
                    <a href="https://github.com/openssl/openssl" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">openssl/openssl</a>{' '}
                    — the open-source cryptography and SSL/TLS toolkit that secures an estimated 66% of all encrypted internet traffic. Maintained by the OpenSSL Software Foundation with a dedicated security team and hundreds of world-class cryptographers who have reviewed this codebase. Licensed under Apache 2.0.
                  </p>
                  <p>
                    <strong className="text-foreground">File:</strong>{' '}
                    <a href="https://github.com/openssl/openssl/blob/master/ssl/tls13_enc.c" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-mono text-xs">ssl/tls13_enc.c</a>{' '}
                    — the TLS 1.3 encryption engine responsible for key derivation, handshake encryption, traffic key generation, and the cryptographic state machine that secures HTTPS connections worldwide. This file implements the core of RFC 8446.
                  </p>
                  <p>
                    <strong className="text-foreground">Why This File Matters:</strong> Every HTTPS connection, every API call over TLS, every secure WebSocket — if the server runs OpenSSL (and most do), the handshake flows through this file. The key derivation functions here generate the session keys that protect billions of daily transactions across banking, healthcare, government, and critical infrastructure.
                  </p>
                </div>
              </div>

              {/* ─── Critical Finding ─── */}
              <div className="bg-yellow-500/[0.04] border border-yellow-500/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /> Critical Finding: Structural Timeout Dependency Gap
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The AEGIS and CIPHER engines detected <strong className="text-foreground">network call patterns with no timeout enforcement</strong> baked into the TLS 1.3 key derivation and handshake state machine. The substrate identified an absence of timeout enforcement at the encryption layer that creates a structural dependency requiring downstream implementations to compensate — <strong className="text-foreground">a dependency the majority of production deployments fail to satisfy</strong>. OpenSSL intentionally delegates timeout responsibility to the calling application layer, but the substrate classified this as a structural dependency gap because the majority of production implementations that inherit this code fail to implement timeout handling correctly downstream. This is a <strong className="text-foreground">known, verified, open issue</strong> in OpenSSL's own GitHub — real developers are hitting this failure in production today.
                </p>
              </div>

              {/* ─── Vulnerability Assessment ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Bug className="w-4 h-4 text-destructive" /> Pre-Ascension Vulnerability Assessment
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL six-primitive diagnostic squad identified 7 structural vulnerabilities in the 965-line C source:
                </p>
                <div className="space-y-2">
                  {OPENSSL_VULNERABILITIES.map((v) => (
                    <div key={v.title} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/50">
                      <div className="flex gap-2 shrink-0 pt-0.5">
                        <SeverityBadge severity={v.severity} />
                        <StatusBadge status={v.status} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">{v.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{v.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Why Cyber Vertical ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" /> Why the Full CYBER Chain Fired
                </h3>
                <div className="prose-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    OpenSSL's TLS 1.3 encryption engine is the defining target for <strong className="text-foreground">CMPSBL Cyber™</strong>. The complete offensive and defensive Primitive chain activated: AEGIS, CIPHER, RECON, TEMPEST, SHADE, OBSIDIAN, BULWARK, WRAITH, BLACKOUT, and NOCTURNE. This is the first case study where every single Cyber vertical expansion primitive fired — the code's structural profile triggered the full stack because it sits at the intersection of cryptography, network security, and protocol implementation.
                  </p>
                  <p>
                    Standout discoveries include <strong className="text-foreground">APT Threat Hunter</strong> (advanced persistent threat detection via handshake anomalies), <strong className="text-foreground">Emergency Breach Containment</strong> (automated session isolation on compromise indicators), and <strong className="text-foreground">Dark Web Intelligence Monitor</strong> (monitoring for leaked certificates and compromised keys). These are not theoretical — they are structural augmentations that address real attack patterns against TLS implementations.
                  </p>
                </div>
              </div>

              {/* ─── Primitives Applied ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> 20 Primitives Applied
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The CMPSBL Cyber™ vertical selected 20 primitives — 10 from the fixed Spine (Organs/Layers) and 10 from the Cyber expansion matrix (Engines/Agents) — the complete offensive and defensive stack:
                </p>
                <div className="grid gap-2">
                  {visibleOpensslPrimitives.map((p) => (
                    <div key={p.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/30 border border-border/40">
                      <span className="font-mono text-xs font-bold text-foreground w-24 shrink-0">{p.name}</span>
                      <TypeBadge type={p.type} />
                      <span className="text-xs text-muted-foreground">{p.action}</span>
                    </div>
                  ))}
                </div>
                {OPENSSL_PRIMITIVES.length > 8 && (
                  <Button variant="ghost" size="sm" className="mt-3 w-full text-xs text-muted-foreground" onClick={() => setShowAllOpensslPrimitives(!showAllOpensslPrimitives)}>
                    {showAllOpensslPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all 20 primitives</>}
                  </Button>
                )}
              </div>

              {/* ─── New Capabilities Unlocked ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" /> 10 New Capabilities Unlocked
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {OPENSSL_CAPABILITIES.map((c) => (
                    <div key={c.name} className="p-3 rounded-lg bg-muted/30 border border-border/40">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{c.name}</span>
                        <Badge variant="outline" className="text-[9px] uppercase">{c.mode}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ─── Key Insight ─── */}
              <div className="bg-red-500/[0.04] border border-red-500/15 rounded-xl p-5">
                <h3 className="text-base font-semibold text-foreground mb-2">Key Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                  OpenSSL's TLS 1.3 encryption engine — the most audited security codebase on earth, reviewed by hundreds of world-class cryptographers — had a <strong className="text-foreground">structural dependency gap</strong> that Ascension identified in seconds. The timeout delegation pattern is an intentional design choice, but the substrate recognized that it creates a failure mode that the majority of real-world deployments do not handle. This is not a vulnerability in OpenSSL — it is a <strong className="text-foreground">structural gap between design intent and production reality</strong> that only structural analysis can surface.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Ascension™ wrapped the network-adjacent operations with BEACON health signals, circuit-breaker timeout enforcement, graceful shutdown handlers, and DEFENSE Layer shielding — the protections the file delegates to callers but callers rarely implement. Processed in ~10 seconds with zero AI. The code that secures 66% of the internet is now wrapped in a <strong className="text-foreground">Cyber-aware Sealed Runtime</strong>.
                </p>
              </div>

              {/* ─── Downloads ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Download & Verify
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The full CMPSBL Cyber™ Ascension export is available for download and independent verification.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a href="/downloads/case-studies/openssl-tls13-ascended-CMPSBL-MNJB00F5-626R.zip" download>
                    <Button size="sm" className="gap-2">
                      <Download className="w-3.5 h-3.5" />
                      Ascended Export (.zip)
                    </Button>
                  </a>
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJB00F5-626R</code>{' · '}
                  Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">b82607914337f881</code>{' · '}
                  Generated: April 3, 2026
                </p>
              </div>

              {/* ─── External References ─── */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References & Further Reading
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'OpenSSL Repository', url: 'https://github.com/openssl/openssl' },
                    { label: 'tls13_enc.c Source', url: 'https://github.com/openssl/openssl/blob/master/ssl/tls13_enc.c' },
                    { label: 'RFC 8446 — TLS 1.3 Specification', url: 'https://www.rfc-editor.org/rfc/rfc8446' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ══════════════ CASE STUDY #7: ArduPilot ══════════════ */}
        <section className="py-16 border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Case Study #7: ArduPilot vehicle_test_suite.py</h2>
                <p className="text-sm text-muted-foreground">CMPSBL Robotics™ Vertical · Autonomous Vehicle Test Orchestration</p>
              </div>
            </div>

            {/* ─── Provenance ─── */}
            <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" /> Academic Provenance
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">Tools/autotest/vehicle_test_suite.py</code> is the core test orchestration layer of{' '}
                <a href="https://github.com/ArduPilot/ardupilot" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  ArduPilot
                </a>{' '}
                (15K+ GitHub stars) — the world's most trusted open-source autonomous vehicle platform, installed in over{' '}
                <strong className="text-foreground">1,000,000 vehicles worldwide</strong>. ArduPilot powers autonomous drones, planes, rovers, submarines, and blimps used by{' '}
                <strong className="text-foreground">NASA, Intel, and Boeing</strong> for testing, development, and production deployment.
                Originally named <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">common.py</code>, it was renamed in{' '}
                <a href="https://github.com/ArduPilot/ardupilot/pull/25330" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  PR #25330
                </a>{' '}
                (merged October 2023). This file orchestrates all vehicle-type testing across ArduCopter, ArduPlane, ArduRover, ArduSub, and Blimp — every vehicle type inherits from it.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                At <strong className="text-foreground">15,869 lines</strong>, it is one of the largest single-file test orchestration layers in any open-source autonomous vehicle project.
                Run through the <span className="text-primary font-semibold">CMPSBL Robotics™ Vertical</span> — the same substrate that hardened PythonRobotics.
              </p>
            </div>

            {/* ─── Critical Finding (highlight box) ─── */}
            <div className="p-5 rounded-xl border-2 border-destructive/30 bg-destructive/5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-bold text-foreground">Critical Finding</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The substrate detected <strong className="text-foreground">dynamic code execution patterns</strong> in autonomous vehicle test orchestration software —
                structural patterns that, if present in production control paths, represent a{' '}
                <a href="https://owasp.org/www-community/attacks/Code_Injection" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  documented attack surface per OWASP guidelines
                </a>.
                Python's <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">exec()</code> and{' '}
                <code className="px-1 py-0.5 rounded bg-muted text-xs font-mono">eval()</code> functions support dynamic execution of arbitrary Python code and are flagged as dangerous
                if used to execute dynamic content. While test frameworks legitimately use dynamic dispatch, the structural flag itself is architecturally valid —
                and in software installed in <strong className="text-foreground">over one million autonomous vehicles</strong>, that context makes the finding
                significant regardless of direct exploitability.
              </p>
            </div>

            {/* ─── Structural Findings ─── */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" /> Structural Findings ({ARDUPILOT_VULNERABILITIES.length})
              </h3>
              <div className="space-y-2">
                {ARDUPILOT_VULNERABILITIES.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/30">
                    <span className={`mt-0.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      v.severity === 'critical' ? 'bg-destructive/15 text-destructive' :
                      v.severity === 'warning' ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' :
                      'bg-primary/10 text-primary'
                    }`}>{v.severity}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.details}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      v.status === 'hardened' ? 'bg-green-500/15 text-green-600 dark:text-green-400' :
                      v.status === 'mitigated' ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400' :
                      'bg-primary/10 text-muted-foreground'
                    }`}>{v.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Primitives Applied ─── */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" /> 20 Primitives Applied
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {(showAllArduPrimitives ? ARDUPILOT_PRIMITIVES : ARDUPILOT_PRIMITIVES.slice(0, 8)).map((p, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">{p.category}</span>
                    <span className="text-sm font-mono font-semibold text-foreground">{p.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{p.contribution}</span>
                  </div>
                ))}
              </div>
              {ARDUPILOT_PRIMITIVES.length > 8 && (
                <button
                  onClick={() => setShowAllArduPrimitives(!showAllArduPrimitives)}
                  className="mt-3 text-sm text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary"
                >
                  {showAllArduPrimitives ? 'Show fewer' : `Show all ${ARDUPILOT_PRIMITIVES.length} primitives`}
                </button>
              )}
            </div>

            {/* ─── New Capabilities ─── */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Capabilities Unlocked ({ARDUPILOT_CAPABILITIES.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ARDUPILOT_CAPABILITIES.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-muted/20 border border-border/30">
                    <span className="text-sm font-medium text-foreground">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Key Insights ─── */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2">
              <h3 className="font-semibold text-foreground">Why This Matters</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground list-disc list-inside">
                <li>ArduPilot is installed in <strong className="text-foreground">over 1,000,000 vehicles worldwide</strong> — drones, planes, rovers, submarines, and blimps</li>
                <li>Used for testing and development by <strong className="text-foreground">NASA, Intel, and Boeing</strong></li>
                <li>Cyclomatic complexity of <strong className="text-foreground">2,442</strong> — the highest of any case study, reflecting the file's role as the orchestration layer across all vehicle types</li>
                <li><strong className="text-foreground">15,869 lines</strong> in a single file with <strong className="text-foreground">85 classes</strong> and <strong className="text-foreground">185 imports</strong></li>
                <li>32 technical debt markers (TODO/FIXME/HACK) flagged by EVOLUTION for architectural risk accumulation</li>
                <li>The CMPSBL Robotics™ Vertical applied domain-specific primitives: LIDAR, VECTOR, SWARM, KINETIC, GUARDIAN — purpose-built for autonomous vehicle software</li>
              </ul>
            </div>

            {/* ─── Downloads & Provenance ─── */}
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/ArduPilot/ardupilot/blob/master/Tools/autotest/vehicle_test_suite.py"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-muted/50 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <FileCode className="w-4 h-4" /> View Original Source ↗
              </a>
              <a
                href="/downloads/case-studies/ardupilot-ascended-CMPSBL-MNJBTP5Q-V0OK.zip"
                download
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" /> Download Ascended Artifact (.zip)
              </a>
            </div>

            <div>
              <p className="text-[11px] text-muted-foreground mt-3">
                Serial: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">CMPSBL-MNJBTP5Q-V0OK</code>{' · '}
                Fingerprint: <code className="px-1 py-0.5 rounded bg-muted text-[10px] font-mono">13c42397bead4a65</code>{' · '}
                Generated: April 3, 2026
              </p>
            </div>

            {/* ─── External References ─── */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" /> References & Further Reading
              </h3>
              <ul className="space-y-1.5 text-sm">
                {[
                  { label: 'ArduPilot Repository (15K+ ★)', url: 'https://github.com/ArduPilot/ardupilot' },
                  { label: 'vehicle_test_suite.py Source', url: 'https://github.com/ArduPilot/ardupilot/blob/master/Tools/autotest/vehicle_test_suite.py' },
                  { label: 'PR #25330 — Rename to vehicle_test_suite.py', url: 'https://github.com/ArduPilot/ardupilot/pull/25330' },
                  { label: 'ArduPilot Autotest Framework Documentation', url: 'https://ardupilot.org/dev/docs/the-ardupilot-autotest-framework.html' },
                  { label: 'Boeing Cargo Drone (ArduPilot-Powered)', url: 'https://discuss.ardupilot.org/t/boeings-massive-cargo-drone-using-pixhawk2-and-ardupilot/25002' },
                  { label: 'OWASP — Code Injection', url: 'https://owasp.org/www-community/attacks/Code_Injection' },
                  { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                ].map((ref) => (
                  <li key={ref.url}>
                    <a
                      href={ref.url}
                      target={ref.url.startsWith('http') ? '_blank' : undefined}
                      rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                    >
                      {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════════ CASE STUDY #8: QuantLib ══════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">CASE STUDY #8</span>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">FINTECH · QUANTUM™ VERTICAL</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Case Study #8: QuantLib Gaussian 1D Models</h2>
              <p className="text-muted-foreground mt-1 text-sm font-mono">Serial: CMPSBL-MNJD2A7W-DMM8 · Fingerprint: 9012a33c2dd6b2ce</p>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                <code className="text-primary">gaussian1d-models.py</code> — a swaption calibration example from{' '}
                <a href="https://github.com/lballabio/QuantLib-SWIG" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  QuantLib-SWIG
                </a>{' '}
                (385+ GitHub stars), the Python binding layer for{' '}
                <a href="https://github.com/lballabio/QuantLib" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  QuantLib
                </a>{' '}
                — the most widely adopted open-source library for quantitative finance with{' '}
                <strong className="text-foreground">6,900+ GitHub stars and 210 contributors</strong>.
                BSD-licensed and in active development since 2000, QuantLib is used by banks, hedge funds, and financial institutions worldwide
                for derivative pricing, risk management, and model calibration. The core C++ library underpins production pricing systems
                including those built on the Open Source Risk Engine (ORE). 489 lines · Python · Copyright 2018 Angus Lee.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lines', value: '489' },
                { label: 'Complexity', value: '30' },
                { label: 'Functions', value: '4' },
                { label: 'CJPI', value: '100 APEX' },
              ].map((m) => (
                <div key={m.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Findings */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" /> Structural Findings ({QUANTLIB_VULNERABILITIES.length})
              </h3>
              <div className="space-y-2">
                {QUANTLIB_VULNERABILITIES.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                    <span className={`mt-0.5 text-xs font-mono px-1.5 py-0.5 rounded ${v.severity === 'warning' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {v.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.details}</p>
                    </div>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${v.status === 'mitigated' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primitives */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Primitives Applied ({QUANTLIB_PRIMITIVES.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {(showAllQuantLibPrimitives ? QUANTLIB_PRIMITIVES : QUANTLIB_PRIMITIVES.slice(0, 8)).map((p, i) => (
                  <span key={i} className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                    {p.name} <span className="text-muted-foreground">({p.type})</span>
                  </span>
                ))}
              </div>
              {QUANTLIB_PRIMITIVES.length > 8 && (
                <button
                  className="text-xs text-primary mt-2 flex items-center hover:underline"
                  onClick={() => setShowAllQuantLibPrimitives(!showAllQuantLibPrimitives)}
                >
                  {showAllQuantLibPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all {QUANTLIB_PRIMITIVES.length} primitives</>}
                </button>
              )}
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Capabilities Unlocked ({QUANTLIB_CAPABILITIES.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {QUANTLIB_CAPABILITIES.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{c.type}</span>
                    <span className="text-sm text-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Context */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">Why This Matters</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>QuantLib has <strong className="text-foreground">6,900+ GitHub stars</strong>, 210 contributors, and has been in continuous development since 2000</li>
                <li>BSD-licensed — used in <strong className="text-foreground">production pricing systems</strong> at banks and financial institutions worldwide</li>
                <li>First case study to activate the <strong className="text-foreground">complete QUANTUM primitive chain</strong> on financial quantitative code</li>
                <li>Demonstrates the substrate maps physics-domain primitives (particle collision, lattice models) directly to financial modeling (yield curves, rate calibration)</li>
              </ul>
            </div>

            {/* Downloads + Refs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Artifacts
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://github.com/lballabio/QuantLib-SWIG/blob/master/Python/examples/gaussian1d-models.py"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileCode className="w-4 h-4" /> View Original Source ↗
                  </a>
                  <a
                    href="/downloads/case-studies/quantlib-ascended-CMPSBL-MNJD2A7W-DMM8.zip"
                    download
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download Ascended Artifact (.zip)
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'QuantLib Repository (6.9K+ ★)', url: 'https://github.com/lballabio/QuantLib' },
                    { label: 'QuantLib-SWIG Python Bindings', url: 'https://github.com/lballabio/QuantLib-SWIG' },
                    { label: 'gaussian1d-models.py Source', url: 'https://github.com/lballabio/QuantLib-SWIG/blob/master/Python/examples/gaussian1d-models.py' },
                    { label: 'QuantLib Official Site', url: 'https://www.quantlib.org/' },
                    { label: 'Open Source Risk Engine (ORE)', url: 'https://www.opensourcerisk.org/' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ══════════════ CASE STUDY #9: Google OR-Tools ══════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">CASE STUDY #9</span>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">OPERATIONS RESEARCH · QUANTUM™ VERTICAL</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Case Study #9: Google OR-Tools CP-SAT Solver</h2>
              <p className="text-muted-foreground mt-1 text-sm font-mono">Serial: CMPSBL-MNJDGI57-L2XP · Fingerprint: af7743b905e75374</p>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                <code className="text-primary">cp_model.py</code> — the core Python interface for the CP-SAT constraint programming solver from{' '}
                <a href="https://github.com/google/or-tools" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  Google OR-Tools
                </a>{' '}
                — the most widely deployed open-source operations research library with{' '}
                <strong className="text-foreground">13,300+ GitHub stars and 2,400+ forks</strong>.
                Developed by Google, Apache 2.0-licensed, and used globally for vehicle routing, scheduling, resource allocation,
                supply chain optimization, and combinatorial problem solving. The CP-SAT solver combines SAT solving with constraint
                propagation and linear programming relaxation — the state of the art in constraint satisfaction.
                2,332 lines · Python · Copyright 2010–2025 Google LLC.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lines', value: '2,332' },
                { label: 'Complexity', value: '230' },
                { label: 'Imports', value: '42' },
                { label: 'CJPI', value: '100 APEX' },
              ].map((m) => (
                <div key={m.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Findings */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" /> Structural Findings ({ORTOOLS_VULNERABILITIES.length})
              </h3>
              <div className="space-y-2">
                {ORTOOLS_VULNERABILITIES.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                    <span className={`mt-0.5 text-xs font-mono px-1.5 py-0.5 rounded ${v.severity === 'warning' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {v.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.details}</p>
                    </div>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${v.status === 'mitigated' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primitives */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Primitives Applied ({ORTOOLS_PRIMITIVES.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {(showAllOrtoolsPrimitives ? ORTOOLS_PRIMITIVES : ORTOOLS_PRIMITIVES.slice(0, 8)).map((p, i) => (
                  <span key={i} className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                    {p.name} <span className="text-muted-foreground">({p.type})</span>
                  </span>
                ))}
              </div>
              {ORTOOLS_PRIMITIVES.length > 8 && (
                <button
                  className="text-xs text-primary mt-2 flex items-center hover:underline"
                  onClick={() => setShowAllOrtoolsPrimitives(!showAllOrtoolsPrimitives)}
                >
                  {showAllOrtoolsPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all {ORTOOLS_PRIMITIVES.length} primitives</>}
                </button>
              )}
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Capabilities Unlocked ({ORTOOLS_CAPABILITIES.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {ORTOOLS_CAPABILITIES.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{c.type}</span>
                    <span className="text-sm text-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Context */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">Why This Matters</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>First <strong className="text-foreground">Google-authored</strong> code to pass through the Ascension™ pipeline</li>
                <li>First <strong className="text-foreground">Operations Research vertical</strong> entry — proving the substrate maps to optimization and constraint satisfaction domains</li>
                <li>The deprecated API finding is notable: Google explicitly implements a custom <code className="text-primary">deprecated</code> decorator for Python 3.10+ compatibility — structural debt the substrate surfaced without prior knowledge of Google&apos;s internal policies</li>
                <li>OR-Tools powers <strong className="text-foreground">vehicle routing, workforce scheduling, and supply chain optimization</strong> at global scale</li>
              </ul>
            </div>

            {/* Downloads + Refs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Artifacts
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://github.com/google/or-tools/blob/stable/ortools/sat/python/cp_model.py"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileCode className="w-4 h-4" /> View Original Source ↗
                  </a>
                  <a
                    href="/downloads/case-studies/or-tools-ascended-CMPSBL-MNJDGI57-L2XP.zip"
                    download
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download Ascended Artifact (.zip)
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'Google OR-Tools Repository (13.3K+ ★)', url: 'https://github.com/google/or-tools' },
                    { label: 'cp_model.py Source', url: 'https://github.com/google/or-tools/blob/stable/ortools/sat/python/cp_model.py' },
                    { label: 'CP-SAT Solver Documentation', url: 'https://developers.google.com/optimization/cp/cp_solver' },
                    { label: 'OR-Tools Official Site', url: 'https://developers.google.com/optimization' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ══════════════ CASE STUDY #10: PyTorch ══════════════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">CASE STUDY #10</span>
              <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-1 rounded">AI / DEEP LEARNING · LLM™ VERTICAL</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-foreground">Case Study #10: PyTorch torch.nn.functional</h2>
              <p className="text-muted-foreground mt-1 text-sm font-mono">Serial: CMPSBL-MNJDRL4I-0DD8 · Fingerprint: 52e655af798050c8</p>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                <code className="text-primary">functional.py</code> — the core functional interface for{' '}
                <a href="https://github.com/pytorch/pytorch" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">
                  PyTorch
                </a>{' '}
                — Meta&apos;s open-source deep learning framework with{' '}
                <strong className="text-foreground">99,000+ GitHub stars</strong>, and the mathematical foundation
                underlying virtually every major AI model in production. This single file provides the functional API for
                all neural network operations — convolutions, activations, normalization, loss functions, attention mechanisms,
                and dropout — used by researchers and engineers at Meta, Google DeepMind, OpenAI, NVIDIA, and every major AI lab worldwide.
                6,951 lines · Python · BSD-3-Clause · Copyright Meta Platforms, Inc.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lines', value: '6,951' },
                { label: 'Complexity', value: '984' },
                { label: 'Imports', value: '80' },
                { label: 'CJPI', value: '100 APEX' },
              ].map((m) => (
                <div key={m.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Critical Finding Highlight */}
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
              <h3 className="text-sm font-bold text-destructive mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> CRITICAL FINDING
              </h3>
              <p className="text-sm text-foreground leading-relaxed">
                The substrate identified unhandled asynchronous rejection patterns in PyTorch&apos;s core neural network operations library —
                the mathematical foundation underlying every major AI model in production. In PyTorch&apos;s async execution model, GPU backend
                failures can return control to the Python frontend without propagating errors, creating silent failure modes during model
                training and inference that are invisible to conventional testing. This intersects with a CVE-confirmed code injection vector
                (<a href="https://nvd.nist.gov/vuln/detail/CVE-2022-45907" target="_blank" rel="noopener noreferrer" className="text-primary underline">CVE-2022-45907</a>,
                CVSS 9.8) in deprecated API surfaces that retain <code className="text-primary">eval</code>-based execution paths.
              </p>
            </div>

            {/* Findings */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" /> Structural Findings ({PYTORCH_VULNERABILITIES.length})
              </h3>
              <div className="space-y-2">
                {PYTORCH_VULNERABILITIES.map((v, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                    <span className={`mt-0.5 text-xs font-mono px-1.5 py-0.5 rounded ${v.severity === 'critical' ? 'bg-destructive/20 text-destructive' : v.severity === 'warning' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {v.severity.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{v.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.details}</p>
                    </div>
                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${v.status === 'hardened' ? 'bg-destructive/10 text-destructive' : v.status === 'mitigated' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Primitives */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Primitives Applied ({PYTORCH_PRIMITIVES.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {(showAllPytorchPrimitives ? PYTORCH_PRIMITIVES : PYTORCH_PRIMITIVES.slice(0, 8)).map((p, i) => (
                  <span key={i} className="text-xs font-mono bg-muted px-2 py-1 rounded text-foreground">
                    {p.name} <span className="text-muted-foreground">({p.type})</span>
                  </span>
                ))}
              </div>
              {PYTORCH_PRIMITIVES.length > 8 && (
                <button
                  className="text-xs text-primary mt-2 flex items-center hover:underline"
                  onClick={() => setShowAllPytorchPrimitives(!showAllPytorchPrimitives)}
                >
                  {showAllPytorchPrimitives ? <><ChevronUp className="w-3 h-3 mr-1" /> Show fewer</> : <><ChevronDown className="w-3 h-3 mr-1" /> Show all {PYTORCH_PRIMITIVES.length} primitives</>}
                </button>
              )}
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Capabilities Unlocked ({PYTORCH_CAPABILITIES.length})
              </h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {PYTORCH_CAPABILITIES.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 bg-muted/30 rounded-lg p-2.5">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{c.type}</span>
                    <span className="text-sm text-foreground">{c.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Context */}
            <div className="bg-muted/30 rounded-lg p-4 border border-border">
              <h3 className="text-sm font-semibold text-foreground mb-2">Why This Matters</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>First <strong className="text-foreground">Meta-authored</strong> code to pass through the Ascension™ pipeline</li>
                <li>First <strong className="text-foreground">AI / Deep Learning vertical</strong> entry — the substrate analyzing the substrate&apos;s own infrastructure class</li>
                <li>The <strong className="text-foreground">single largest and most complex artifact</strong> in the case study suite: 6,951 lines, cyclomatic complexity 984</li>
                <li><strong className="text-foreground">CVE-2022-45907</strong> (CVSS 9.8 Critical): deprecated functions retain <code className="text-primary">eval</code>-based code injection paths via <code className="text-primary">torch.jit.annotations.parse_type_line</code>. Incomplete mitigation confirmed April 2025</li>
                <li>Silent CUDA failures affect <strong className="text-foreground">every AI model</strong> built on PyTorch — from GPT to Stable Diffusion to Meta&apos;s own LLaMA</li>
              </ul>
            </div>

            {/* Downloads + Refs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Artifacts
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://github.com/pytorch/pytorch/blob/main/torch/nn/functional.py"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileCode className="w-4 h-4" /> View Original Source ↗
                  </a>
                  <a
                    href="/downloads/case-studies/pytorch-ascended-CMPSBL-MNJDRL4I-0DD8.zip"
                    download
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download Ascended Artifact (.zip)
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'PyTorch Repository (99K+ ★)', url: 'https://github.com/pytorch/pytorch' },
                    { label: 'torch.nn.functional Source', url: 'https://github.com/pytorch/pytorch/blob/main/torch/nn/functional.py' },
                    { label: 'CVE-2022-45907 (CVSS 9.8)', url: 'https://nvd.nist.gov/vuln/detail/CVE-2022-45907' },
                    { label: 'Incomplete Mitigation (GitHub #151233)', url: 'https://github.com/pytorch/pytorch/issues/151233' },
                    { label: 'Silent CUDA Hang (GitHub #178491)', url: 'https://github.com/pytorch/pytorch/issues/178491' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ Case Study #11 — Anthropic _client.py ═══════════════ */}
        <section className="py-16 px-6 border-t border-border/50">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-xs">LLM Vertical</Badge>
                <Badge variant="outline" className="text-xs font-mono">CMPSBL-MNJE8I5T-NC7Y</Badge>
                <Badge variant="outline" className="text-xs font-mono">FP: 47badac2117529a8</Badge>
                <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">CJPI 100 APEX</Badge>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Case Study #11 — Anthropic <code className="text-primary">_client.py</code>
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We ran the SDK that powers Claude through Ascension. The substrate found a CRITICAL structural gap — and quantum physics — inside the transport layer of the company building the world&apos;s safest AI.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                <code className="text-primary">src/anthropic/_client.py</code> — the base client implementation of the official{' '}
                <a href="https://github.com/anthropics/anthropic-sdk-python" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">Anthropic Python SDK</a>{' '}
                (3K+ GitHub stars). The transport layer handling authentication, retry logic, timeout management, streaming,
                and connection pooling for every API call made to Claude worldwide.
                Generated by <a href="https://www.stainless.com/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">Stainless</a> from Anthropic&apos;s OpenAPI spec.
                660 lines · Python · MIT License.
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Lines', value: '660' },
                { label: 'Complexity', value: '83' },
                { label: 'Classes', value: '6' },
                { label: 'CJPI', value: '100 APEX' },
              ].map((m) => (
                <div key={m.label} className="bg-muted/50 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Critical Finding */}
            <div className="border-l-4 border-red-500 bg-red-500/5 p-4 rounded-r-lg">
              <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2">⚠ Critical Structural Finding</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The substrate identified unhandled async rejection patterns in the transport layer — a structural gap that,
                in high-throughput streaming environments, can produce silent failures invisible to conventional testing.
                In an async client handling streaming responses from Claude, unhandled rejections can produce dropped connections
                or incomplete responses without diagnostic information.
                <strong className="text-foreground"> SHADOW detected it first. ORACLE predicted the cascade risk. DEFENSE hardened all network-facing paths.</strong>
              </p>
            </div>

            {/* Evidence */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Verified Evidence (GitHub Issues)</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>
                  <a href="https://github.com/anthropics/anthropic-sdk-python/issues/1258" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">Issue #1258</a>: Mid-stream SSE errors receive <code className="text-primary">status_code=200</code> instead of the actual error code — SDK reports success when the API has failed
                </li>
                <li>
                  <a href="https://github.com/anthropics/anthropic-sdk-python/issues/1192" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">Issue #1192</a>: <code className="text-primary">IndexError</code> during streaming when <code className="text-primary">current_snapshot.content</code> is empty
                </li>
                <li>
                  <a href="https://github.com/anthropics/claude-code/issues/38905" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">Claude Code #38905</a>: Silent stream abort — Claude stops mid-task without error
                </li>
                <li>
                  <a href="https://github.com/anthropics/anthropic-sdk-typescript/issues/867" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary">TS SDK #867</a>: Infinitely hanging clients during streaming — proposal for streaming idle timeout
                </li>
              </ul>
            </div>

            {/* Quantum Physics Discovery */}
            <div className="border border-primary/30 bg-primary/5 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider">🔬 Standout Capability: Cryogenic Decoherence Shield</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The same capability that emerged from Qiskit&apos;s quantum gate optimizer (Case Study #3) emerged here from
                Anthropic&apos;s retry backoff logic. The SDK implements <code className="text-primary">base_delay = min(INITIAL_RETRY_DELAY × 2^nb_retries, MAX_RETRY_DELAY)</code>{' '}
                with <code className="text-primary">jitter = 1 - 0.25 × random()</code> — exponential decay with bounded randomization.
                This mathematical structure is <strong className="text-foreground">structurally identical to quantum decoherence management algorithms</strong>.
                The substrate found quantum physics inside the code that powers Claude.
              </p>
            </div>

            {/* Vulnerabilities */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Bug className="w-5 h-5 text-destructive" /> Structural Findings
              </h3>
              <div className="space-y-2">
                {[
                  { severity: 'critical', title: 'Unhandled async rejections in streaming transport', status: 'hardened', details: 'AsyncAnthropic client handles streaming SSE responses via httpx. Mid-stream failures return status_code=200 instead of actual error codes (GitHub #1258). Silent stream aborts documented in production (GitHub #38905).' },
                  { severity: 'warning', title: 'Multi-path credential resolution', status: 'hardened', details: 'API keys resolved from constructor args, environment variables (ANTHROPIC_API_KEY), or auth_token with complex fallback logic requiring hardening in high-security contexts.' },
                  { severity: 'warning', title: 'Exponential backoff without circuit breaker', status: 'mitigated', details: 'Retry logic with exponential backoff and jitter but no circuit breaker pattern to prevent thundering herd under sustained API outages.' },
                  { severity: 'warning', title: 'High import coupling (93 transitive imports)', status: 'mitigated', details: 'Deep dependency chain across _base_client, _types, _streaming, _exceptions, _qs, _compat, _utils, and _constants modules.' },
                  { severity: 'info', title: 'Stainless-generated code patterns', status: 'monitor', details: 'Auto-generated from OpenAPI spec — inherits structural patterns from the generator rather than intentional architectural decisions.' },
                  { severity: 'warning', title: 'Connection pool exhaustion risk', status: 'mitigated', details: 'httpx client with default connection pooling under high-concurrency streaming workloads can exhaust connection limits silently.' },
                  { severity: 'info', title: 'Streaming response wrapper indirection', status: 'monitor', details: 'AnthropicWithStreamedResponse and AsyncAnthropicWithStreamedResponse add indirection layers that complicate error propagation.' },
                  { severity: 'warning', title: 'No observability hooks', status: 'mitigated', details: 'No structured logging, metrics emission, or tracing instrumentation in the transport layer.' },
                ].map((v, i) => (
                  <div key={i} className="flex items-start gap-3 bg-muted/30 rounded-lg p-3">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${v.severity === 'critical' ? 'text-red-500' : v.severity === 'warning' ? 'text-amber-500' : 'text-blue-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-foreground">{v.title}</span>
                        <Badge variant="outline" className="text-[10px] h-4">{v.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{v.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primitives Applied */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> LLM Vertical Stack Applied
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: 'SHADOW', type: 'Layer', action: 'Canary analysis for streaming path divergence detection' },
                  { name: 'SKEPTIC', type: 'Agent', action: 'Adversarial output validation for response integrity' },
                  { name: 'HERALD', type: 'Agent', action: 'Alignment drift monitoring across API versions' },
                  { name: 'SIEVE', type: 'Engine', action: 'Response filtering for output sanitization' },
                  { name: 'EMBARGO', type: 'Agent', action: 'Information leakage hardening at the API boundary' },
                  { name: 'RAMPART', type: 'Engine', action: 'Prompt injection defense at the transport layer' },
                  { name: 'TETHER', type: 'Engine', action: 'Context coherence enforcement for streaming continuity' },
                  { name: 'TRIBUNAL', type: 'Agent', action: 'Multi-model consistency validation' },
                  { name: 'TREATY', type: 'Layer', action: 'API contract enforcement for SSE protocol compliance' },
                  { name: 'IDENTITY', type: 'Organ', action: 'Authentication hardening for credential resolution paths' },
                ].map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-sm bg-muted/20 rounded px-3 py-2">
                    <Badge variant="outline" className="text-[10px] h-4 shrink-0">{p.type}</Badge>
                    <span className="font-mono font-semibold text-primary text-xs">{p.name}</span>
                    <span className="text-muted-foreground text-xs truncate">— {p.action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* S-Tier Capabilities */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" /> S-Tier Capabilities Unlocked
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: 'Cryogenic Decoherence Shield', mode: 'Passive', desc: 'Quantum decoherence management patterns detected in exponential backoff logic.' },
                  { name: 'Streaming Sentinel Guard', mode: 'Active', desc: 'Real-time SSE stream integrity monitoring with silent failure detection.' },
                  { name: 'Transport Layer Fortress', mode: 'Hybrid', desc: 'Defense-in-depth hardening for all network-facing API communication paths.' },
                  { name: 'Credential Rotation Engine', mode: 'Active', desc: 'Multi-path authentication resolution with secure credential lifecycle management.' },
                  { name: 'Connection Pool Optimizer', mode: 'Passive', desc: 'Predictive connection pool scaling to prevent exhaustion under high concurrency.' },
                  { name: 'Retry Circuit Breaker', mode: 'Active', desc: 'Backoff-aware circuit breaker preventing thundering herd under sustained outages.' },
                  { name: 'SSE Protocol Validator', mode: 'Passive', desc: 'Server-Sent Events protocol compliance verification with error code propagation.' },
                  { name: 'Async Rejection Propagator', mode: 'Active', desc: 'Ensures all async failures propagate diagnostics instead of silently dropping.' },
                  { name: 'API Contract Enforcer', mode: 'Hybrid', desc: 'Runtime validation of request/response schemas against OpenAPI specification.' },
                  { name: 'Observability Injector', mode: 'Passive', desc: 'Structured logging and distributed tracing for transport layer operations.' },
                ].map((cap) => (
                  <div key={cap.name} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{cap.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{cap.mode}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Why This Matters */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Why This Matters</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>First analysis of the SDK powering <strong className="text-foreground">Claude</strong> — built by the company whose mission is AI safety</li>
                <li>The <strong className="text-foreground">same class of async rejection patterns</strong> found in PyTorch (Case Study #10) surfaced independently here — proving this is an endemic structural gap in async Python infrastructure</li>
                <li>The substrate found <strong className="text-foreground">quantum physics</strong> inside Anthropic&apos;s retry backoff — the same Cryogenic Decoherence Shield from IBM Qiskit (Case Study #3)</li>
                <li>No special treatment. No awareness of who wrote it. <strong className="text-foreground">The substrate governed the governor</strong></li>
              </ul>
            </div>

            {/* Downloads + Refs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Artifacts
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/_client.py"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileCode className="w-4 h-4" /> View Original Source ↗
                  </a>
                  <a
                    href="/downloads/case-studies/anthropic-ascended-CMPSBL-MNJE8I5T-NC7Y.zip"
                    download
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download Ascended Artifact (.zip)
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'Anthropic Python SDK (3K+ ★)', url: 'https://github.com/anthropics/anthropic-sdk-python' },
                    { label: '_client.py Source', url: 'https://github.com/anthropics/anthropic-sdk-python/blob/main/src/anthropic/_client.py' },
                    { label: 'Mid-Stream SSE Errors (GitHub #1258)', url: 'https://github.com/anthropics/anthropic-sdk-python/issues/1258' },
                    { label: 'Streaming IndexError (GitHub #1192)', url: 'https://github.com/anthropics/anthropic-sdk-python/issues/1192' },
                    { label: 'Silent Stream Abort (Claude Code #38905)', url: 'https://github.com/anthropics/claude-code/issues/38905' },
                    { label: 'Hanging Clients (TS SDK #867)', url: 'https://github.com/anthropics/anthropic-sdk-typescript/issues/867' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Case Study #12 — CMPSBL pipeline-fingerprint.ts (Self-Referential) */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs">Case Study #12</Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono text-xs">CJPI 100 APEX</Badge>
            <Badge variant="outline" className="font-mono text-xs">Core Substrate (No Vertical)</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">CMPSBL® pipeline-fingerprint.ts</h2>
              <p className="text-muted-foreground text-sm">
                The cryptographic fingerprint generation engine of the CMPSBL® substrate itself — the system that produces the unique identity hash on every Certificate of Discovery. Run through the original 40-Primitive base matrix with no vertical hot-swap. The substrate analyzing itself.
              </p>
            </div>

            {/* Provenance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Serial', value: 'CMPSBL-MNJEN2SS-XF1N' },
                { label: 'Fingerprint', value: '18b8cd05bd02ba6d' },
                { label: 'Language', value: 'TypeScript' },
                { label: 'Lines', value: '116' },
              ].map(item => (
                <div key={item.label} className="bg-muted/30 rounded-lg p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-mono font-semibold text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            {/* Critical Discovery */}
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <h3 className="text-base font-bold text-destructive">Critical Discovery</h3>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                The substrate found that its own fingerprinting system had no error handling around cryptographic operations and unhandled async rejection paths — meaning a fingerprint generation failure would produce no diagnostic information. FAILSAFE fired first. <strong className="text-foreground">The system that signs every Certificate of Discovery had never been signed itself. Until now.</strong>
              </p>
            </div>

            {/* Findings */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bug className="w-4 h-4 text-destructive" /> Structural Findings
              </h3>
              <div className="space-y-2">
                {[
                  { severity: 'critical', title: 'No error handling detected', status: 'hardened', detail: 'Zero try/catch blocks around cryptographic operations. SHA-256 via WebCrypto (crypto.subtle.digest) had no error handling — failures drop silently with no diagnostic information. FAILSAFE fired first.' },
                  { severity: 'critical', title: 'Unhandled async rejections', status: 'hardened', detail: 'Async operations in the fingerprinting chain (crypto.subtle.digest returns a Promise) had no explicit rejection handlers. Same class of structural gap found in PyTorch and Anthropic — now confirmed endemic across languages.' },
                  { severity: 'warning', title: 'Deep nesting at 7 levels', status: 'refactored', detail: 'ARCHITECT flagged excessive nesting depth in fingerprint payload construction. Refactored into named helper functions: normalizeStep, buildPayloadObject, resolveSteps, validateSteps.' },
                  { severity: 'warning', title: 'No test coverage detected', status: 'mitigated', detail: 'SHADOW flagged zero test coverage. 29 unit tests now cover determinism, uniqueness, error handling, async rejection handling, legacy compatibility, conversion utilities, and display utilities.' },
                  { severity: 'info', title: 'Cyclomatic complexity 83', status: 'monitor', detail: 'Moderate complexity appropriate for a cryptographic pipeline handling multiple input formats and conversion paths.' },
                  { severity: 'info', title: 'No input validation', status: 'hardened', detail: 'Public API surfaces accepted any input without validation. Now validates steps array, module strings, and capability strings with typed FingerprintError exceptions.' },
                ].map((v) => (
                  <div key={v.title} className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg border border-border/30">
                    <Badge variant={v.severity === 'critical' ? 'destructive' : 'outline'}
                      className={`text-[10px] uppercase shrink-0 mt-0.5 ${v.severity === 'warning' ? 'bg-yellow-500/15 text-yellow-600 border-yellow-500/30' : v.severity === 'info' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''}`}
                    >{v.severity}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">{v.title}</span>
                        <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{v.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{v.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primitive Chain */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" /> 20 Primitives Applied — Original Base Matrix
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {['FAILSAFE', 'BEACON', 'ATLAS', 'MONOLITH', 'ARCHITECT', 'ENGINEER', 'CORTEX', 'PRIMITIVE', 'HARVEST', 'SANDBOX', 'WRAITH', 'ORACLE', 'DECODE', 'TREATY', 'FORGE', 'OBSERVER', 'EVOLUTION', 'BRAIN', 'PHANTOM', 'REFLEX'].map((p) => (
                  <Badge key={p} variant="outline" className={`font-mono text-xs ${p === 'PRIMITIVE' ? 'bg-primary/20 text-primary border-primary/40 ring-1 ring-primary/30' : ''}`}>
                    {p}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2 italic">
                PRIMITIVE — the foundational execution layer — fired on its own fingerprinting logic. That has never happened in any other run across 12 case studies.
              </p>
            </div>

            {/* Capabilities */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Standout Capabilities Discovered
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { name: 'Autonomous Decision Loop', mode: 'Active', desc: 'Self-governing decision pipeline that evaluates, selects, and executes optimal paths without external input.' },
                  { name: 'Predictive Failure Shield', mode: 'Active', desc: 'Pre-emptive failure detection using structural analysis of execution paths before they are triggered.' },
                  { name: 'APT Threat Hunter', mode: 'Active', desc: 'Advanced persistent threat detection across cryptographic operation boundaries.' },
                  { name: 'Real-Time Performance Optimizer', mode: 'Hybrid', desc: 'Dynamic performance tuning of hash computation paths based on input characteristics.' },
                  { name: 'Telemetry Mesh', mode: 'Passive', desc: 'Distributed health signal network providing comprehensive observability across the fingerprint pipeline.' },
                ].map((cap) => (
                  <div key={cap.name} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-foreground">{cap.name}</span>
                      <Badge variant="outline" className="text-[10px] h-4">{cap.mode}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{cap.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Remediation */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-emerald-600 mb-2">✅ All Findings Remediated in Production</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>FAILSAFE structured error handling with <code className="text-xs bg-muted px-1 rounded">FingerprintError</code> typed exceptions carrying diagnostic codes and context</li>
                <li>BEACON health signals via structured logger on all cryptographic operation failures</li>
                <li>Input validation on all public API surfaces (empty steps, invalid modules, malformed chains)</li>
                <li>Async rejection propagation — SHA-256 failures surface as typed errors, never silently</li>
                <li>Deep nesting refactored into named functions: <code className="text-xs bg-muted px-1 rounded">normalizeStep</code>, <code className="text-xs bg-muted px-1 rounded">buildPayloadObject</code>, <code className="text-xs bg-muted px-1 rounded">resolveSteps</code>, <code className="text-xs bg-muted px-1 rounded">validateSteps</code></li>
                <li><strong className="text-foreground">29 unit tests</strong> covering determinism, uniqueness, error handling, async rejection, legacy compat, and display utilities</li>
              </ul>
            </div>

            {/* Why This Matters */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Why This Matters</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>The substrate <strong className="text-foreground">analyzed itself</strong> — the file that signs every Certificate of Discovery was run through the same 40-Primitive collision matrix</li>
                <li>The <strong className="text-foreground">same class of async rejection patterns</strong> found in PyTorch and Anthropic surfaced here — confirming this structural gap is endemic across languages, not just Python</li>
                <li><strong className="text-foreground">PRIMITIVE fired on its own logic</strong> — the foundational execution layer analyzing its own fingerprinting system. First time in 12 case studies</li>
                <li>Every finding was <strong className="text-foreground">immediately remediated</strong> — the only case study where all CRITICAL gaps were fixed in the production codebase before publication</li>
              </ul>
            </div>

            {/* Closing Quote */}
            <div className="border-l-4 border-primary/50 pl-4 py-2 bg-primary/5 rounded-r-lg">
              <p className="text-sm text-foreground/90 italic leading-relaxed">
                &ldquo;Twelve runs. Twelve targets. IBM, Rapid7, HuggingFace, OpenSSL, ArduPilot, QuantLib, Google, Meta, Anthropic, and finally CMPSBL itself. The substrate found two CRITICAL gaps in its own fingerprinting system and hardened them. It doesn&apos;t know whose code it&apos;s looking at. It just sees the math.&rdquo;
              </p>
            </div>

            {/* Downloads + Refs */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" /> Artifacts
                </h3>
                <div className="space-y-2">
                  <a
                    href="/downloads/case-studies/cmpsbl-ascended-CMPSBL-MNJEN2SS-XF1N.zip"
                    download
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Download className="w-4 h-4" /> Download Ascended Artifact (.zip)
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" /> References
                </h3>
                <ul className="space-y-1.5 text-sm">
                  {[
                    { label: 'pipeline-fingerprint.ts (hardened)', url: 'https://github.com' },
                    { label: 'WebCrypto SubtleCrypto.digest() (MDN)', url: 'https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest' },
                    { label: 'CMPSBL® Ascension Lab', url: '/ascension' },
                  ].map((ref) => (
                    <li key={ref.url}>
                      <a
                        href={ref.url}
                        target={ref.url.startsWith('http') ? '_blank' : undefined}
                        rel={ref.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
                      >
                        {ref.label} {ref.url.startsWith('http') ? '↗' : '→'}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* Case Studies #13-15 — CMPSBL Self-Audit Batch                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-xs">Case Studies #13–15</Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-mono text-xs">CJPI 100 APEX × 3</Badge>
            <Badge variant="outline" className="font-mono text-xs">Self-Audit Batch</Badge>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">CMPSBL® Internal Systems — Self-Audit Continuation</h2>
              <p className="text-muted-foreground text-sm">
                Three additional CMPSBL substrate internals run through the original 40-Primitive base matrix. Continuing the self-referential audit that began with pipeline-fingerprint.ts (Case Study #12).
              </p>
            </div>

            {/* Three-card grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card: decode-audit.ts */}
              <div className="bg-card/60 border border-border/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-[10px]">#13</Badge>
                  <span className="text-sm font-bold text-foreground">decode-audit.ts</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="text-foreground font-medium">Purpose:</span> DECODE audit logging — admin directives, security refusals, security events</p>
                  <p><span className="text-foreground font-medium">Serial:</span> <code className="text-[10px]">CMPSBL-MNJEX0UY-4RGQ</code></p>
                  <p><span className="text-foreground font-medium">Fingerprint:</span> <code className="text-[10px]">91ac14dd4706312f</code></p>
                  <p><span className="text-foreground font-medium">Findings:</span> 0 CRITICAL · 3 WARNING</p>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-yellow-500/15 text-yellow-600 border-yellow-500/30">warning</Badge>
                    <span className="text-xs text-foreground">Cyclomatic complexity 27</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] bg-yellow-500/15 text-yellow-600 border-yellow-500/30">warning</Badge>
                    <span className="text-xs text-foreground">Math.random() in audit IDs</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">fixed</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                  <span className="text-foreground font-medium">Capabilities:</span> Self-Healing State Machine, Circuit Breaker Mesh
                </div>
                <a href="/downloads/case-studies/cmpsbl-decode-audit-CMPSBL-MNJEX0UY-4RGQ.zip" download className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Download className="w-3 h-3" /> Download Artifact
                </a>
              </div>

              {/* Card: memory-lineage.ts */}
              <div className="bg-card/60 border border-border/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-[10px]">#14</Badge>
                  <span className="text-sm font-bold text-foreground">memory-lineage.ts</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="text-foreground font-medium">Purpose:</span> Memory Stream lineage registry — tracks module ancestry of crystallized pipelines</p>
                  <p><span className="text-foreground font-medium">Serial:</span> <code className="text-[10px]">CMPSBL-MNJEYCOS-F1UO</code></p>
                  <p><span className="text-foreground font-medium">Fingerprint:</span> <code className="text-[10px]">7bc9ab831fe3ce53</code></p>
                  <p><span className="text-foreground font-medium">Findings:</span> 0 CRITICAL · 1 WARNING (most significant)</p>
                </div>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2">
                  <p className="text-xs text-foreground/90">
                    <strong>Key finding:</strong> Weak randomness (<code className="text-[10px]">Math.random()</code>) in lineage record IDs — predictable IDs could allow ancestry forgery.
                    <Badge variant="outline" className="ml-1.5 text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20">fixed</Badge>
                  </p>
                </div>
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                  <span className="text-foreground font-medium">Capabilities:</span> Structural Drift Detector, Adaptive Load Router
                </div>
                <a href="/downloads/case-studies/cmpsbl-memory-lineage-CMPSBL-MNJEYCOS-F1UO.zip" download className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Download className="w-3 h-3" /> Download Artifact
                </a>
              </div>

              {/* Card: substrate-metrics.ts */}
              <div className="bg-card/60 border border-border/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="font-mono text-[10px]">#15</Badge>
                  <span className="text-sm font-bold text-foreground">substrate-metrics.ts</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p><span className="text-foreground font-medium">Purpose:</span> Runtime metrics store — real observability for all 40 Primitives</p>
                  <p><span className="text-foreground font-medium">Serial:</span> <code className="text-[10px]">CMPSBL-MNJF01GS-I1XH</code></p>
                  <p><span className="text-foreground font-medium">Fingerprint:</span> <code className="text-[10px]">5fe824a3da09e5d2</code></p>
                  <p><span className="text-foreground font-medium">Findings:</span> 0 CRITICAL · 2 WARNING</p>
                </div>
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-2">
                  <p className="text-xs text-foreground/90">
                    <strong>False positive:</strong> Ascension flagged weak randomness, but source verification confirmed <strong>no Math.random() exists</strong> in this file. IDs derived from module names, not random generation.
                  </p>
                </div>
                <div className="text-xs text-muted-foreground pt-1 border-t border-border/30">
                  <span className="text-foreground font-medium">Capabilities:</span> Live Threat Neutralizer, Autonomous Patch Engine
                </div>
                <a href="/downloads/case-studies/cmpsbl-substrate-metrics-CMPSBL-MNJF01GS-I1XH.zip" download className="flex items-center gap-1.5 text-xs text-primary hover:underline">
                  <Download className="w-3 h-3" /> Download Artifact
                </a>
              </div>
            </div>

            {/* Self-Audit Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-foreground mb-2">Self-Audit Summary (Case Studies #12–15)</h3>
              <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
                <li>Four CMPSBL internal files analyzed through the original 40-Primitive base matrix</li>
                <li><strong className="text-foreground">2 CRITICAL findings</strong> in pipeline-fingerprint.ts (error handling + async rejections) — remediated with 29 tests</li>
                <li><strong className="text-foreground">2 weak randomness findings</strong> in decode-audit.ts and memory-lineage.ts — <code className="text-xs bg-muted px-1 rounded">Math.random()</code> → <code className="text-xs bg-muted px-1 rounded">crypto.randomUUID()</code></li>
                <li><strong className="text-foreground">1 false positive</strong> in substrate-metrics.ts — flagged for weak randomness but source verification found none</li>
                <li>Fifteen runs. Fifteen targets. The substrate doesn&apos;t know whose code it&apos;s looking at. <strong className="text-foreground">It just sees the math.</strong></li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <PageSEOBlock
        path="/case-studies"
        title="Case Studies"
        faq={[
          { question: 'What is CMPSBL Ascension?', answer: 'Ascension is the CMPSBL® code refurbishment pipeline that analyzes, classifies, and hardens source code by colliding it against 40 Primitives — all without AI.' },
          { question: 'How long does Ascension take?', answer: 'A typical file processes through the full 20-primitive pipeline in approximately 10 seconds.' },
          { question: 'Does Ascension use AI?', answer: 'No. The Ascension pipeline is purely algorithmic — deterministic pattern matching, structural analysis, and primitive guard injection. Zero external AI calls.' },
          { question: 'What are vertical substrates?', answer: 'Vertical substrates are domain-specific configurations of the CMPSBL® 40-Primitive topology. Each vertical shares the same 24-primitive Spine but swaps in 16 specialized expansion primitives for its domain — Cyber, Robotics, Quantum, or LLM.' },
          { question: 'What software has been tested?', answer: 'Case studies include CMPSBL itself (self-referential), Anthropic (Claude SDK), PyTorch (Meta), Google OR-Tools, ArduPilot, IBM Qiskit, Rapid7 Metasploit, Hugging Face Tokenizers, OpenSSL TLS 1.3, QuantLib, PythonRobotics, and OpenClawAgent — all scored CJPI 98+ with multiple achieving Apex (100).' },
        ]}
      />
      <EnhancedFooter />
    </>
  );
}
