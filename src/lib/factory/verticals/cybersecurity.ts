/**
 * CMPSBL® CyberSecurity Vertical Substrate
 * 
 * Subdomain: security.cmpsbl.com
 * 
 * Hot-swapped Engines (8):
 *   WATCHTOWER — Real-time threat detection and classification
 *   SHADE    — Stealth operations and covert reconnaissance
 *   AEGIS    — Shield orchestration and DDoS mitigation
 *   CIPHER   — Cryptographic operations and key management
 *   RECON    — Network reconnaissance and attack surface mapping
 *   VANGUARD — Incident response and forensic analysis
 *   BASTION  — Zero-trust perimeter enforcement
 *   TEMPEST  — Chaos engineering and penetration testing
 * 
 * Hot-swapped Agents (8):
 *   WRAITH   — Silent threat hunter (inherited from core)
 *   OBSIDIAN — Deep analysis and pattern correlation
 *   SPECTER  — Deception and honeypot orchestration
 *   BLACKOUT — Emergency kill-switch and isolation
 *   TRACER   — Attack chain reconstruction
 *   NOCTURNE — Dark web intelligence and OSINT
 *   IRONCLAD — Compliance enforcement (SOC2, ISO27001, NIST)
 *   BULWARK  — Supply chain security and dependency auditing
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { CYBER_CROWN_JEWELS, getCyberJewelsByPrimitive, getCyberJewelSummary } from '@/crownjewels/cyber-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

/* ─── CyberSecurity Engines ─── */

const CYBER_ENGINES: VerticalPrimitive[] = [
  {
    id: 'WATCHTOWER',
    name: 'WATCHTOWER',
    role: 'engine',
    description: 'Real-time threat detection and classification engine. Ingests telemetry streams, correlates IOCs, and assigns threat severity scores using behavioral heuristics.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'ioc_correlation',
      'threat_classification',
      'behavioral_analysis',
      'anomaly_scoring',
      'real_time_alerting',
      'threat_intelligence_fusion',
      'mitre_attack_mapping',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'SHADE',
    name: 'SHADE',
    role: 'engine',
    description: 'Stealth operations engine for covert network reconnaissance and silent data exfiltration detection.',
    inherited: false,
    replaces: 'SHADOW',
    capabilities: [
      'stealth_scanning',
      'covert_channel_detection',
      'data_exfiltration_monitoring',
      'lateral_movement_tracking',
      'silent_probe',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'AEGIS',
    name: 'AEGIS',
    role: 'engine',
    description: 'Shield orchestration engine for DDoS mitigation, rate limiting, and adaptive traffic shaping.',
    inherited: false,
    capabilities: [
      'ddos_mitigation',
      'rate_limiting',
      'traffic_shaping',
      'geo_blocking',
      'bot_detection',
      'challenge_response',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'CIPHER',
    name: 'CIPHER',
    role: 'engine',
    description: 'Cryptographic operations engine handling key lifecycle, certificate management, and encryption protocol enforcement.',
    inherited: false,
    capabilities: [
      'key_rotation',
      'certificate_management',
      'encryption_enforcement',
      'hash_verification',
      'pki_orchestration',
      'quantum_resistant_prep',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'RECON',
    name: 'RECON',
    role: 'engine',
    description: 'Network reconnaissance engine mapping attack surfaces, discovering exposed services, and identifying vulnerability vectors.',
    inherited: false,
    capabilities: [
      'attack_surface_mapping',
      'port_enumeration',
      'service_fingerprinting',
      'vulnerability_scanning',
      'exposure_scoring',
      'asset_discovery',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'VANGUARD',
    name: 'VANGUARD',
    role: 'engine',
    description: 'Incident response and digital forensics engine. Automates containment, evidence preservation, and root cause analysis.',
    inherited: false,
    capabilities: [
      'incident_containment',
      'evidence_preservation',
      'root_cause_analysis',
      'forensic_timeline',
      'playbook_execution',
      'stakeholder_notification',
    ],
    weight: 0.030,
    classification: 'hybrid',
  },
  {
    id: 'BASTION',
    name: 'BASTION',
    role: 'engine',
    description: 'Zero-trust perimeter enforcement engine. Manages micro-segmentation, least-privilege access, and continuous verification.',
    inherited: false,
    capabilities: [
      'micro_segmentation',
      'least_privilege_enforcement',
      'continuous_verification',
      'session_binding',
      'trust_scoring',
      'zero_trust_policy',
    ],
    weight: 0.030,
    classification: 'hybrid',
  },
  {
    id: 'TEMPEST',
    name: 'TEMPEST',
    role: 'engine',
    description: 'Chaos engineering and penetration testing engine. Simulates attack scenarios, stress-tests defenses, and validates resilience postures.',
    inherited: false,
    capabilities: [
      'chaos_injection',
      'penetration_simulation',
      'resilience_validation',
      'blast_radius_analysis',
      'red_team_automation',
      'tabletop_exercise',
    ],
    weight: 0.020,
    classification: 'active',
  },
];

/* ─── CyberSecurity Agents ─── */

const CYBER_AGENTS: VerticalPrimitive[] = [
  {
    id: 'WRAITH',
    name: 'WRAITH',
    role: 'agent',
    description: 'Silent threat hunter. Operates autonomously across network segments to detect advanced persistent threats (APTs).',
    inherited: false,
    capabilities: [
      'apt_detection',
      'silent_monitoring',
      'behavioral_profiling',
      'threat_hunting',
      'persistence_detection',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'OBSIDIAN',
    name: 'OBSIDIAN',
    role: 'agent',
    description: 'Deep analysis agent. Correlates disparate security events into unified attack narratives.',
    inherited: false,
    capabilities: [
      'event_correlation',
      'attack_narrative',
      'pattern_fusion',
      'kill_chain_mapping',
      'indicator_enrichment',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'SPECTER',
    name: 'SPECTER',
    role: 'agent',
    description: 'Deception agent. Deploys and manages honeypots, canary tokens, and decoy infrastructure to lure and identify attackers.',
    inherited: false,
    capabilities: [
      'honeypot_deployment',
      'canary_token_management',
      'decoy_infrastructure',
      'attacker_profiling',
      'deception_orchestration',
    ],
    weight: 0.015,
    classification: 'hybrid',
  },
  {
    id: 'BLACKOUT',
    name: 'BLACKOUT',
    role: 'agent',
    description: 'Emergency isolation agent. Executes kill-switch protocols to contain active breaches and sever compromised connections.',
    inherited: false,
    capabilities: [
      'emergency_isolation',
      'kill_switch',
      'connection_severing',
      'quarantine_enforcement',
      'breach_containment',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'TRACER',
    name: 'TRACER',
    role: 'agent',
    description: 'Attack chain reconstruction agent. Traces lateral movement paths and reconstructs the full attack timeline.',
    inherited: false,
    capabilities: [
      'lateral_movement_trace',
      'timeline_reconstruction',
      'privilege_escalation_detection',
      'credential_abuse_tracking',
      'pivot_point_identification',
    ],
    weight: 0.015,
    classification: 'passive',
  },
  {
    id: 'NOCTURNE',
    name: 'NOCTURNE',
    role: 'agent',
    description: 'Dark web intelligence and OSINT agent. Monitors underground forums, paste sites, and threat actor communications.',
    inherited: false,
    capabilities: [
      'dark_web_monitoring',
      'credential_leak_detection',
      'threat_actor_tracking',
      'brand_monitoring',
      'osint_collection',
    ],
    weight: 0.015,
    classification: 'passive',
  },
  {
    id: 'IRONCLAD',
    name: 'IRONCLAD',
    role: 'agent',
    description: 'Compliance enforcement agent. Continuously validates security postures against SOC2, ISO 27001, NIST, and CIS benchmarks.',
    inherited: false,
    capabilities: [
      'soc2_validation',
      'iso27001_audit',
      'nist_framework_check',
      'cis_benchmark',
      'compliance_reporting',
      'gap_analysis',
    ],
    weight: 0.020,
    classification: 'hybrid',
  },
  {
    id: 'BULWARK',
    name: 'BULWARK',
    role: 'agent',
    description: 'Supply chain security agent. Audits dependencies, monitors for compromised packages, and validates software bill of materials.',
    inherited: false,
    capabilities: [
      'dependency_audit',
      'sbom_generation',
      'compromised_package_detection',
      'license_compliance',
      'typosquat_detection',
      'provenance_verification',
    ],
    weight: 0.015,
    classification: 'passive',
  },
];

/* ─── Assembled CyberSecurity Substrate ─── */

export function getCyberSecurityPrimitives(): VerticalPrimitive[] {
  return assembleVerticalPrimitives(CYBER_ENGINES, CYBER_AGENTS);
}

export function getCyberSecurityEngines(): VerticalPrimitive[] {
  return [...CYBER_ENGINES];
}

export function getCyberSecurityAgents(): VerticalPrimitive[] {
  return [...CYBER_AGENTS];
}

/**
 * Full CyberSecurity vertical substrate configuration
 */
export function getCyberSecuritySubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'cyber-v1',
    name: 'CMPSBL CYBER™',
    tagline: 'Cognitive Security Infrastructure — Threats Die Here',
    domain: 'security',
    subdomain: 'security',
    url: 'https://security.cmpsbl.com',
    status: 'assembling',
    version: '1.0.0',
    primitives: getCyberSecurityPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'threat_intelligence_analysis',
        'zero_day_detection_patterns',
        'incident_response_optimization',
        'compliance_framework_updates',
        'attack_surface_reduction',
        'cryptographic_best_practices',
        'supply_chain_risk_assessment',
        'adversary_simulation_tactics',
        'network_forensics_techniques',
        'cloud_security_posture_management',
      ],
      priorityPrimitives: ['WATCHTOWER', 'DEFENSE', 'VANGUARD', 'BASTION'],
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: [
        'CVE_database_monitoring',
        'threat_feed_ingestion',
        'compliance_standard_updates',
        'attack_technique_evolution',
        'vulnerability_disclosure_tracking',
        'zero_day_pattern_synthesis',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'Autonomous Threat Response',
        'Zero-Trust Architecture Enforcement',
        'Real-Time IOC Correlation',
        'Behavioral Anomaly Detection',
        'Cryptographic Agility Layer',
        'Supply Chain Integrity Monitor',
        'Incident Forensics Automation',
        'Compliance Continuous Validation',
        'Attack Surface Auto-Reduction',
        'Deception Grid Orchestration',
      ],
      cjpiWeights: {
        security: 0.45,
        performance: 0.20,
        reliability: 0.25,
        maintainability: 0.10,
      },
      collisionPriority: ['WATCHTOWER', 'AEGIS', 'BASTION', 'VANGUARD', 'CIPHER'],
    },
    theme: {
      primaryHue: 220,
      icon: 'Shield',
      gradientAngle: 135,
      darkAccent: '220 90% 60%',
      lightAccent: '220 80% 45%',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get all capabilities across the CyberSecurity vertical
 */
export function getAllCyberCapabilities(): string[] {
  const primitives = getCyberSecurityPrimitives();
  const capabilities = new Set<string>();
  for (const p of primitives) {
    for (const cap of p.capabilities) {
      capabilities.add(cap);
    }
  }
  return Array.from(capabilities).sort();
}

/* ═══════════════════════════════════════════════
   Crown Jewel Integration — S-Tier Registry Surface
   ═══════════════════════════════════════════════ */

/** All 80 architectural Crown Jewels for the CYBER™ vertical */
export function getCyberCrownJewels(): STierEntry[] {
  return [...CYBER_CROWN_JEWELS];
}

/** Crown Jewels for a specific cyber primitive */
export function getCyberPrimitiveCrownJewels(primitiveId: string): STierEntry[] {
  return getCyberJewelsByPrimitive(primitiveId);
}

/** Crown Jewel summary per primitive (for dashboard) */
export function getCyberCrownJewelSummary() {
  return getCyberJewelSummary();
}

/** Total Crown Jewel count for the vertical */
export function getCyberCrownJewelCount(): number {
  return CYBER_CROWN_JEWELS.length;
}

/** All Crown Jewel capability IDs as active capabilities */
export function getCyberCrownJewelCapabilities(): string[] {
  return CYBER_CROWN_JEWELS.map(j =>
    j.id.toLowerCase().replace(/^s-/, 'cj_')
  );
}
