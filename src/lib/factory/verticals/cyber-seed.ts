/**
 * CMPSBL® Cyber Vertical — Discovery Seed Engine (GENESIS)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries using the cyber primitive matrix.
 * Routes:
 *   - Architecture-class (CJPI ≥ 95) → Registry (is_crown_jewel=true)
 *   - Showroom-class (CJPI 68–94)   → Showroom catalog
 *   - Raw-tier (CJPI < 68)          → Junkyard pool
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeDiscovery } from '../foundry-engine';
import { routeDiscovery } from '../foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './seed-persistence';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface CyberDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'threat-detection' | 'incident-response' | 'security-automation' | 'vulnerability-management' | 'adversarial-simulation' | 'cryptography' | 'perimeter-defense' | 'forensics';
  discoveredAt: string;
}

export interface CyberSeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: CyberDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — PRIMITIVES & TEMPLATES
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

const CYBER_PRIMITIVES = [
  'WATCHTOWER', 'SHADE', 'AEGIS', 'CIPHER', 'RECON', 'VANGUARD',
  'BASTION', 'TEMPEST', 'PROWLER', 'ONYX', 'SPECTER', 'BLACKOUT',
  'TRACER', 'NOCTURNE', 'IRONCLAD', 'CITADEL',
];

const SPINE_IDS = [
  'BRAIN', 'MEMORY', 'IDENTITY', 'CONSCIENCE', 'COMPASS', 'REFLEX',
  'DEFENSE', 'GOVERNANCE', 'EVOLUTION', 'SHADOW', 'SOVEREIGN',
  'TREATY', 'RELAY', 'IMMUNITY', 'BEACON', 'NERVE', 'NEXUS',
  'CORE', 'SYSTEM', 'MEDIC', 'ATLAS', 'ACCESS', 'INTENT', 'INTEGRATION',
];

interface DiscoveryTemplate {
  namePattern: string;
  descriptionPattern: string;
  category: CyberDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // ═══ THREAT DETECTION (high CJPI, vault candidates) ═══
  { namePattern: 'Zero-Day Behavioral Anomaly Detector', descriptionPattern: 'Real-time behavioral analysis engine that identifies zero-day threats through deviation scoring against baseline system fingerprints without signature databases.', category: 'threat-detection', primaryPrimitives: ['WATCHTOWER', 'PROWLER', 'TRACER'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Multi-Vector Threat Correlation Engine', descriptionPattern: 'Cross-correlates threat signals from network, endpoint, and application layers to identify coordinated attack campaigns invisible to single-layer analysis.', category: 'threat-detection', primaryPrimitives: ['WATCHTOWER', 'RECON', 'ONYX'], minChainLength: 5, maxChainLength: 8, cjpiBias: 28 },
  { namePattern: 'Lateral Movement Detection Mesh', descriptionPattern: 'Graph-based analysis of authentication events and network flows to detect east-west lateral movement patterns indicative of post-compromise activity.', category: 'threat-detection', primaryPrimitives: ['TRACER', 'SPECTER', 'WATCHTOWER'], minChainLength: 5, maxChainLength: 8, cjpiBias: 32 },
  { namePattern: 'Encrypted Traffic Anomaly Scanner', descriptionPattern: 'Statistical analysis of encrypted traffic metadata including packet sizes, timing, and destination patterns to detect C2 channels without decryption.', category: 'threat-detection', primaryPrimitives: ['CIPHER', 'WATCHTOWER', 'NOCTURNE'], minChainLength: 5, maxChainLength: 7, cjpiBias: 29 },

  // ═══ INCIDENT RESPONSE (high CJPI) ═══
  { namePattern: 'Autonomous Incident Containment Orchestrator', descriptionPattern: 'Automated incident response pipeline that isolates compromised assets, preserves forensic evidence, and initiates remediation workflows within seconds of detection.', category: 'incident-response', primaryPrimitives: ['AEGIS', 'BASTION', 'IRONCLAD'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Blast Radius Estimation Engine', descriptionPattern: 'Real-time impact assessment that maps compromise blast radius across network topology, data access graphs, and credential chains.', category: 'incident-response', primaryPrimitives: ['RECON', 'TRACER', 'AEGIS'], minChainLength: 5, maxChainLength: 7, cjpiBias: 27 },
  { namePattern: 'Forensic Timeline Reconstruction System', descriptionPattern: 'Automated forensic timeline assembly from disparate log sources with event correlation, gap detection, and adversary dwell time estimation.', category: 'incident-response', primaryPrimitives: ['TRACER', 'ONYX', 'RECON'], minChainLength: 4, maxChainLength: 7, cjpiBias: 25 },
  { namePattern: 'Automated Playbook Execution Engine', descriptionPattern: 'SOAR-grade playbook runner with conditional branching, evidence collection at each step, and human-in-the-loop escalation gates for high-severity incidents.', category: 'incident-response', primaryPrimitives: ['VANGUARD', 'AEGIS', 'BASTION'], minChainLength: 5, maxChainLength: 7, cjpiBias: 26 },

  // ═══ SECURITY AUTOMATION (mid-high CJPI) ═══
  { namePattern: 'Continuous Compliance Verification Engine', descriptionPattern: 'Automated compliance scanner that continuously validates infrastructure against CIS benchmarks, SOC2 controls, and custom security policies with drift alerting.', category: 'security-automation', primaryPrimitives: ['IRONCLAD', 'WATCHTOWER', 'GOVERNANCE'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Security Policy Enforcement Mesh', descriptionPattern: 'Distributed policy enforcement layer that translates high-level security requirements into granular network and access controls across hybrid environments.', category: 'security-automation', primaryPrimitives: ['CITADEL', 'IRONCLAD', 'GOVERNANCE'], minChainLength: 4, maxChainLength: 6, cjpiBias: 18 },
  { namePattern: 'Automated Threat Intelligence Enrichment Pipeline', descriptionPattern: 'Multi-source threat intelligence aggregator that enriches IOCs with context, scores confidence, and auto-distributes to detection rules.', category: 'security-automation', primaryPrimitives: ['RECON', 'ONYX', 'VANGUARD'], minChainLength: 3, maxChainLength: 5, cjpiBias: 16 },
  { namePattern: 'Credential Rotation Automation Framework', descriptionPattern: 'Zero-downtime credential rotation engine that manages secrets lifecycle, detects stale credentials, and enforces rotation policies across services.', category: 'security-automation', primaryPrimitives: ['CIPHER', 'IDENTITY', 'CITADEL'], minChainLength: 4, maxChainLength: 6, cjpiBias: 17 },

  // ═══ VULNERABILITY MANAGEMENT (mid CJPI) ═══
  { namePattern: 'Attack Surface Discovery Scanner', descriptionPattern: 'Continuous attack surface enumeration that discovers shadow IT, exposed APIs, misconfigured services, and orphaned infrastructure assets.', category: 'vulnerability-management', primaryPrimitives: ['RECON', 'PROWLER', 'SHADE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Vulnerability Prioritization Intelligence Engine', descriptionPattern: 'Risk-based vulnerability prioritization combining CVSS scores with asset criticality, exploit availability, and environmental context.', category: 'vulnerability-management', primaryPrimitives: ['ONYX', 'RECON', 'WATCHTOWER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Patch Impact Simulation Engine', descriptionPattern: 'Pre-deployment patch testing that simulates update impact on service dependencies, performance characteristics, and security posture.', category: 'vulnerability-management', primaryPrimitives: ['VANGUARD', 'BASTION', 'EVOLUTION'], minChainLength: 3, maxChainLength: 5, cjpiBias: 10 },

  // ═══ ADVERSARIAL SIMULATION (mid CJPI) ═══
  { namePattern: 'Autonomous Red Team Simulation Engine', descriptionPattern: 'Automated adversary emulation that executes MITRE ATT&CK technique chains against live infrastructure with safety guardrails and evidence capture.', category: 'adversarial-simulation', primaryPrimitives: ['SHADE', 'PROWLER', 'SPECTER'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Purple Team Collaboration Framework', descriptionPattern: 'Structured attack-defense collaboration platform that synchronizes offensive testing with defensive detection tuning in real-time.', category: 'adversarial-simulation', primaryPrimitives: ['SHADE', 'AEGIS', 'WATCHTOWER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Adversary Technique Emulation Library', descriptionPattern: 'Comprehensive library of adversary technique implementations mapped to MITRE ATT&CK with configurable intensity and stealth parameters.', category: 'adversarial-simulation', primaryPrimitives: ['SPECTER', 'SHADE', 'NOCTURNE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 13 },
  { namePattern: 'Social Engineering Simulation Platform', descriptionPattern: 'Automated phishing and social engineering campaigns with employee awareness scoring and targeted training recommendations.', category: 'adversarial-simulation', primaryPrimitives: ['BLACKOUT', 'SHADE', 'PROWLER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 11 },

  // ═══ CRYPTOGRAPHY (mid CJPI) ═══
  { namePattern: 'Post-Quantum Key Exchange Protocol', descriptionPattern: 'Lattice-based key exchange implementation with hybrid classical-quantum fallback ensuring forward secrecy against quantum adversaries.', category: 'cryptography', primaryPrimitives: ['CIPHER', 'IRONCLAD', 'BASTION'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Homomorphic Computation Gateway', descriptionPattern: 'Encrypted computation layer enabling operations on ciphertext without decryption for privacy-preserving analytics and secure multi-party computation.', category: 'cryptography', primaryPrimitives: ['CIPHER', 'CITADEL', 'ONYX'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },

  // ═══ PERIMETER DEFENSE (lower CJPI) ═══
  { namePattern: 'Adaptive Firewall Rule Optimizer', descriptionPattern: 'Machine-learning-free statistical analysis of firewall logs to identify redundant rules, overly permissive policies, and optimal rule ordering.', category: 'perimeter-defense', primaryPrimitives: ['BASTION', 'CITADEL'], minChainLength: 2, maxChainLength: 4, cjpiBias: 8 },
  { namePattern: 'DNS Sinkhole Intelligence Engine', descriptionPattern: 'Dynamic DNS sinkhole management with automated malicious domain detection, false positive mitigation, and threat feed integration.', category: 'perimeter-defense', primaryPrimitives: ['BLACKOUT', 'WATCHTOWER'], minChainLength: 2, maxChainLength: 3, cjpiBias: 4 },
  { namePattern: 'Network Segmentation Validator', descriptionPattern: 'Continuous verification of network segmentation boundaries through controlled probe testing and traffic flow analysis.', category: 'perimeter-defense', primaryPrimitives: ['CITADEL', 'BASTION'], minChainLength: 2, maxChainLength: 3, cjpiBias: 2 },

  // ═══ FORENSICS (lower CJPI, junkyard candidates) ═══
  { namePattern: 'Memory Forensics Artifact Extractor', descriptionPattern: 'Volatile memory analysis tool that extracts process trees, network connections, injected code, and encryption keys from memory dumps.', category: 'forensics', primaryPrimitives: ['TRACER', 'ONYX'], minChainLength: 2, maxChainLength: 3, cjpiBias: 0 },
  { namePattern: 'Log Integrity Verification Chain', descriptionPattern: 'Hash-chain verification for audit logs ensuring tamper detection and establishing evidentiary chain of custody for incident response.', category: 'forensics', primaryPrimitives: ['IRONCLAD', 'TRACER'], minChainLength: 2, maxChainLength: 3, cjpiBias: -2 },
  { namePattern: 'Disk Image Analysis Pipeline', descriptionPattern: 'Automated disk forensics pipeline for file carving, deleted file recovery, and timeline extraction from raw disk images.', category: 'forensics', primaryPrimitives: ['ONYX', 'RECON'], minChainLength: 2, maxChainLength: 3, cjpiBias: -3 },
];

// ═══════════════════════════════════════════════════════════════
// §3 — SCORING
// ═══════════════════════════════════════════════════════════════

function scoreCjpi(chainLength: number, bias: number, rand: () => number): number {
  const chainBonus = chainLength * 5;
  const base = 45 + chainBonus + Math.floor(rand() * 15);
  return Math.min(100, Math.max(30, base + bias));
}

function classifyTier(score: number): CyberDiscovery['tier'] {
  if (score === 100) return 'Apex';
  if (score >= 94) return 'Mythic';
  if (score >= 90) return 'Relic';
  if (score >= 80) return 'Prime';
  if (score >= 68) return 'Mint';
  return 'Raw';
}

// ═══════════════════════════════════════════════════════════════
// §4 — CHAIN BUILDER
// ═══════════════════════════════════════════════════════════════

function buildChain(template: DiscoveryTemplate, rand: () => number): string[] {
  const chain = [...template.primaryPrimitives];
  const targetLen = template.minChainLength + Math.floor(rand() * (template.maxChainLength - template.minChainLength + 1));
  const allPool = [...CYBER_PRIMITIVES, ...SPINE_IDS];
  while (chain.length < targetLen) {
    const candidate = allPool[Math.floor(rand() * allPool.length)];
    if (!chain.includes(candidate)) chain.push(candidate);
  }
  return chain;
}

// ═══════════════════════════════════════════════════════════════
// §5 — VARIANT NAME GENERATOR
// ═══════════════════════════════════════════════════════════════

const VARIANT_PREFIXES = [
  'Autonomous', 'Adaptive', 'Recursive', 'Distributed', 'Zero-Trust',
  'Adversarial', 'Proactive', 'Hardened', 'Predictive', 'Stealthy',
  'Continuous', 'Deterministic', 'Intelligent', 'Self-Healing', 'Dynamic',
  'Perimeter-Wide', 'Mission-Critical', 'Threat-Aware', 'Context-Preserving', 'Defense-Grade',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Shield', 'Protocol', 'Pipeline', 'Matrix',
  'Orchestrator', 'Analyzer', 'Mesh', 'System', 'Sentinel',
  'Network', 'Controller', 'Optimizer', 'Scanner', 'Layer',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// §6 — (Plan B Step 9: In-memory vault & pool removed — DB is source of truth)

// ═══════════════════════════════════════════════════════════════
// §7 — MAIN SEED ENGINE (GENESIS)
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;
let _seedResult: CyberSeedResult | null = null;

export function seedCyberDiscoveries(): CyberSeedResult {
  if (_seedResult) return _seedResult;

  const runId = 'cy-seed-' + Date.now().toString(36);
  const rand = seedRng(0xC78E_CAFE);
  const discoveries: CyberDiscovery[] = [];
  let vaultCount = 0, showroomCount = 0, junkyardCount = 0, memoryStreamCount = 0;
  let templateIdx = 0;

  for (let i = 0; i < TOTAL_DISCOVERIES; i++) {
    const template = DISCOVERY_TEMPLATES[templateIdx % DISCOVERY_TEMPLATES.length];
    const variantIndex = Math.floor(templateIdx / DISCOVERY_TEMPLATES.length);
    templateIdx++;

    const chain = buildChain(template, rand);
    const cjpiScore = scoreCjpi(chain.length, template.cjpiBias, rand);
    const tier = classifyTier(cjpiScore);
    const route = cjpiScore >= ARCHITECTURE_GATE_THRESHOLD ? 'vault' : routeDiscovery(cjpiScore);

    const discovery: CyberDiscovery = {
      id: `CDSC-${String(i + 1).padStart(3, '0')}`,
      name: generateVariantName(template.namePattern, variantIndex, rand),
      description: template.descriptionPattern,
      cjpiScore, primitiveChain: chain, tier, route,
      category: template.category,
      discoveredAt: new Date().toISOString(),
    };

    discoveries.push(discovery);
    if (route === 'vault') { vaultCount++; }
    else {
      if (route === 'showroom') showroomCount++; else junkyardCount++;
      memoryStreamCount++;
    }
  }

  _seedResult = { runId, totalDiscoveries: TOTAL_DISCOVERIES, vaultCount, showroomCount, junkyardCount, memoryStreamCount, discoveries, completedAt: new Date().toISOString() };

  const seedRunId = `cy-seed-${Date.now().toString(36)}`;
  ensureSeedRun(seedRunId, 'cyber', TOTAL_DISCOVERIES).then(() => {
    const rows = discoveries.map(d => ({ id: d.id, name: d.name, description: d.description, cjpiScore: d.cjpiScore, primitiveChain: d.primitiveChain, tier: d.tier, route: d.route, category: d.category, vertical: 'cyber', runId: seedRunId }));
    persistSeedDiscoveries(rows, 'cyber', seedRunId);
  });

  return _seedResult;
}

export function getCyberSeedResult(): CyberSeedResult | null { return _seedResult; }
export function getCyberSeedSummary() {
  if (!_seedResult) return { total: 0, vault: 0, showroom: 0, junkyard: 0, memoryStream: 0 };
  return { total: _seedResult.totalDiscoveries, vault: _seedResult.vaultCount, showroom: _seedResult.showroomCount, junkyard: _seedResult.junkyardCount, memoryStream: _seedResult.memoryStreamCount };
}
export function resetCyberSeed(): void { _seedResult = null; CYBER_VAULT.clear(); CYBER_MEMORY_STREAM_POOL.length = 0; }
