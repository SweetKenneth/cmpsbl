/**
 * S-Tier Synergy Pipeline Definitions
 * 32 Premium Cross-Module Pipelines
 * 
 * These are the highest-value pipelines designed for enterprise buyers
 */

import type { SynergyDefinition } from '../types';

export const STIER_SYNERGY_DEFINITIONS: SynergyDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 INTELLIGENCE × CONTROL (High Prestige)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'strategic-foresight-engine',
    name: 'Strategic Foresight Engine',
    description: 'Long-horizon scenario forecasting with confidence weighting using VISION metrics, DREAM pattern synthesis, BRAIN memory consolidation, and CORTEX decision orchestration',
    category: 'intelligence',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 2500,
    minModulesRequired: 4,
  },
  
  {
    id: 'decision-confidence-governor',
    name: 'Decision Confidence Governor',
    description: 'Blocks high-impact decisions unless confidence is justified through CORTEX reasoning validation, VISION impact analysis, and BRAIN historical pattern matching',
    category: 'intelligence',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 3,
  },
  
  {
    id: 'explainable-intelligence-compiler',
    name: 'Explainable Intelligence Compiler',
    description: 'Transforms deep reasoning into executive-ready explanations using DECODE translation, CORTEX reasoning extraction, BRAIN context enrichment, and SYSTEM formatting',
    category: 'intelligence',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 1200,
    minModulesRequired: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ⚙️ AUTONOMY × OPERATIONS (Big Money)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'autonomous-ops-steward',
    name: 'Autonomous Ops Steward',
    description: 'Fully self-maintaining infrastructure with guardrails via SYSTEM health management, CORTEX decision automation, VISION observability, and MODERNIZER self-repair',
    category: 'automation',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'high',
    reversible: true,
    estimatedMs: 3000,
    minModulesRequired: 4,
  },
  
  {
    id: 'autonomy-budget-manager',
    name: 'Autonomy Budget Manager',
    description: 'Limits autonomous system spending per day through ACCESS quota enforcement, CORTEX budget governance, VISION spend tracking, and DEFENSE rate limiting',
    category: 'automation',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 4,
  },
  
  {
    id: 'autonomy-rollback-authority',
    name: 'Autonomy Rollback Authority',
    description: 'One-command rollback of autonomous behavior with full receipts via CORTEX state management, DEFENSE kill-switch activation, RIPPLE event replay, and SYSTEM restoration',
    category: 'automation',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'high',
    reversible: true,
    estimatedMs: 1500,
    minModulesRequired: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔐 SECURITY × TRUST (Non-Optional at Scale)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'intelligence-containment-engine',
    name: 'Intelligence Containment Engine',
    description: 'Prevents learned IP leakage through outputs using DEFENSE output filtering, BRAIN memory access control, DECODE content analysis, and SYSTEM data boundaries',
    category: 'security',
    modules: [
      { name: 'DEFENSE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 4,
  },
  
  {
    id: 'emergent-threat-anticipator',
    name: 'Emergent Threat Anticipator',
    description: 'Predicts new attack classes before signatures exist through VISION anomaly detection, DREAM pattern synthesis, DEFENSE threat modeling, and BRAIN attack history',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'DREAM', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 1800,
    minModulesRequired: 4,
  },
  
  {
    id: 'behavioral-trust-scoring',
    name: 'Behavioral Trust Scoring',
    description: 'Scores system trustworthiness over time using VISION behavior monitoring, BRAIN pattern learning, and ACCESS permission adjustment',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'ACCESS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 💸 COST × PERFORMANCE (Instant ROI)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'autonomous-cost-arbitrage-engine',
    name: 'Autonomous Cost Arbitrage Engine',
    description: 'Dynamically exploits price/performance gaps via NEXUS provider arbitrage, ACCESS quota optimization, VISION cost tracking, and CORTEX routing decisions',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'ACCESS', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 300,
    minModulesRequired: 4,
  },
  
  {
    id: 'value-weighted-reasoning-router',
    name: 'Value-Weighted Reasoning Router',
    description: 'Routes expensive reasoning only when payoff justifies it through NEXUS model selection, CORTEX value assessment, and BRAIN outcome prediction',
    category: 'optimization',
    modules: [
      { name: 'NEXUS', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 200,
    minModulesRequired: 3,
  },
  
  {
    id: 'waste-detection-intelligence',
    name: 'Waste Detection Intelligence',
    description: 'Finds silent compute and logic waste using VISION resource monitoring, SYSTEM utilization analysis, and BRAIN inefficiency pattern recognition',
    category: 'optimization',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'BRAIN', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 600,
    minModulesRequired: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧩 PRODUCT × UX (Adoption Drivers)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'intent-drift-tracker',
    name: 'Intent Drift Tracker',
    description: 'Detects when users change goals mid-journey via DECODE intent parsing, BRAIN session history, RIPPLE event correlation, and VISION behavior analysis',
    category: 'intelligence',
    modules: [
      { name: 'DECODE', role: 'primary', required: true },
      { name: 'BRAIN', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 350,
    minModulesRequired: 4,
  },
  
  {
    id: 'adaptive-product-brain',
    name: 'Adaptive Product Brain',
    description: 'Product behavior evolves with usage patterns through BRAIN learning, VISION usage analytics, and DECODE user preference extraction',
    category: 'intelligence',
    modules: [
      { name: 'BRAIN', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 800,
    minModulesRequired: 3,
  },
  
  {
    id: 'friction-auto-removal-engine',
    name: 'Friction Auto-Removal Engine',
    description: 'Detects and removes UX friction automatically using VISION drop-off detection, CORTEX optimization proposals, and MODERNIZER automated fixes',
    category: 'automation',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'EVOLUTION', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 1500,
    minModulesRequired: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧬 PLATFORM × SCALE (Valuation Boosters)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'cross-pipeline-arbitration-engine',
    name: 'Cross-Pipeline Arbitration Engine',
    description: 'Resolves conflicts between autonomous pipelines via CORTEX arbitration, RIPPLE event coordination, and DEFENSE conflict prevention',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'medium',
    reversible: true,
    estimatedMs: 400,
    minModulesRequired: 3,
  },
  
  {
    id: 'capability-impact-forecaster',
    name: 'Capability Impact Forecaster',
    description: 'Predicts second-order effects before enabling features through VISION dependency analysis, CORTEX impact simulation, and SYSTEM integration testing',
    category: 'intelligence',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 900,
    minModulesRequired: 3,
  },
  
  {
    id: 'self-scaling-intelligence-fabric',
    name: 'Self-Scaling Intelligence Fabric',
    description: 'Intelligence scales itself under load via SYSTEM auto-scaling, VISION load monitoring, CORTEX capacity decisions, and RIPPLE work distribution',
    category: 'orchestration',
    modules: [
      { name: 'SYSTEM', role: 'primary', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'enhancer', required: true },
      { name: 'RIPPLE', role: 'validator', required: true },
    ],
    risk: 'high',
    reversible: true,
    estimatedMs: 2000,
    minModulesRequired: 4,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🏛️ COMPLIANCE × LEGITIMACY (Deal Closers)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'regulatory-mode-switcher',
    name: 'Regulatory Mode Switcher',
    description: 'One system, many compliance personas via ACCESS permission modes, INCLUSIVE accessibility compliance, DECODE locale handling, and CORTEX policy application',
    category: 'accessibility',
    modules: [
      { name: 'ACCESS', role: 'primary', required: true },
      { name: 'INCLUSIVE', role: 'enhancer', required: true },
      { name: 'DECODE', role: 'enhancer', required: true },
      { name: 'CORTEX', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 500,
    minModulesRequired: 4,
  },
  
  {
    id: 'audit-grade-decision-ledger',
    name: 'Audit-Grade Decision Ledger',
    description: 'Immutable reasoning and action logs via VISION event capture, RIPPLE event persistence, SYSTEM storage, and DEFENSE integrity verification',
    category: 'security',
    modules: [
      { name: 'VISION', role: 'primary', required: true },
      { name: 'RIPPLE', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'enhancer', required: true },
      { name: 'DEFENSE', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: false,
    estimatedMs: 300,
    minModulesRequired: 4,
  },
  
  {
    id: 'policy-aware-intelligence-gate',
    name: 'Policy-Aware Intelligence Gate',
    description: 'Decisions filtered through live policy via CORTEX policy engine, DEFENSE rule enforcement, and ACCESS permission validation',
    category: 'security',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'ACCESS', role: 'validator', required: true },
    ],
    risk: 'low',
    reversible: true,
    estimatedMs: 250,
    minModulesRequired: 3,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 🧠 META / CROWN-CLASS (Scarcity Drivers)
  // ═══════════════════════════════════════════════════════════════════════════
  
  {
    id: 'intelligence-governance-kernel',
    name: 'Intelligence Governance Kernel',
    description: 'Governs all intelligence behavior globally via CORTEX meta-governance, DEFENSE security policies, VISION global monitoring, and SYSTEM resource boundaries',
    category: 'orchestration',
    modules: [
      { name: 'CORTEX', role: 'primary', required: true },
      { name: 'DEFENSE', role: 'enhancer', required: true },
      { name: 'VISION', role: 'enhancer', required: true },
      { name: 'SYSTEM', role: 'validator', required: true },
    ],
    risk: 'high',
    reversible: true,
    estimatedMs: 1000,
    minModulesRequired: 4,
  },
];

export default STIER_SYNERGY_DEFINITIONS;
