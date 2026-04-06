/**
 * CMPSBL® Robotics Vertical — Discovery Seed Engine (GENESIS)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates 200 high-bias discoveries using the robotics primitive matrix.
 *
 * © CMPSBL® — All rights reserved.
 */

import { routeDiscovery } from '../foundry-engine';
import { routeDiscovery } from '../foundry-engine';
import { persistSeedDiscoveries, ensureSeedRun } from './seed-persistence';

// ═══════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════

export interface RoboticsDiscovery {
  id: string;
  name: string;
  description: string;
  cjpiScore: number;
  primitiveChain: string[];
  tier: 'Raw' | 'Mint' | 'Prime' | 'Relic' | 'Mythic' | 'Apex';
  route: 'vault' | 'showroom' | 'junkyard';
  category: 'motion-control' | 'perception' | 'planning' | 'manipulation' | 'swarm-coordination' | 'hardware-abstraction' | 'safety' | 'telemetry';
  discoveredAt: string;
}

export interface RoboticsSeedResult {
  runId: string;
  totalDiscoveries: number;
  vaultCount: number;
  showroomCount: number;
  junkyardCount: number;
  memoryStreamCount: number;
  discoveries: RoboticsDiscovery[];
  completedAt: string;
}

// ═══════════════════════════════════════════════════════════════
// §2 — PRIMITIVES & TEMPLATES
// ═══════════════════════════════════════════════════════════════

function seedRng(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff; };
}

const ROBOTICS_PRIMITIVES = [
  'SERVO', 'KINETIC', 'LIDAR', 'FABRICATOR', 'FLUX', 'VECTOR',
  'TENSOR', 'CALIBER', 'GRIPPER', 'SWARM', 'ENVIRON', 'MARSHAL',
  'DISPATCH', 'WELDER', 'INSPECTOR', 'PIONEER',
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
  category: RoboticsDiscovery['category'];
  primaryPrimitives: string[];
  minChainLength: number;
  maxChainLength: number;
  cjpiBias: number;
}

const DISCOVERY_TEMPLATES: DiscoveryTemplate[] = [
  // ═══ MOTION CONTROL (high CJPI) ═══
  { namePattern: 'Jerk-Minimized Trajectory Planner', descriptionPattern: 'Real-time trajectory optimization that minimizes mechanical jerk across all joints while maintaining path accuracy and cycle time constraints.', category: 'motion-control', primaryPrimitives: ['SERVO', 'KINETIC', 'VECTOR'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Adaptive Impedance Control Engine', descriptionPattern: 'Force-torque adaptive control that dynamically adjusts impedance parameters during contact tasks for safe human-robot and robot-environment interaction.', category: 'motion-control', primaryPrimitives: ['SERVO', 'TENSOR', 'CALIBER'], minChainLength: 5, maxChainLength: 8, cjpiBias: 28 },
  { namePattern: 'Commutation Sequencing Optimizer', descriptionPattern: 'Optimal motor commutation timing engine that maximizes torque output while minimizing cogging and thermal buildup across brushless DC motor arrays.', category: 'motion-control', primaryPrimitives: ['FLUX', 'SERVO', 'KINETIC'], minChainLength: 5, maxChainLength: 8, cjpiBias: 32 },
  { namePattern: 'Multi-Axis Coordinated Motion Fabric', descriptionPattern: 'Synchronized multi-axis motion coordination for complex multi-DOF tasks with sub-millisecond synchronization guarantees.', category: 'motion-control', primaryPrimitives: ['VECTOR', 'SERVO', 'MARSHAL'], minChainLength: 5, maxChainLength: 7, cjpiBias: 29 },

  // ═══ PERCEPTION (high CJPI) ═══
  { namePattern: 'Real-Time 3D Scene Reconstruction Engine', descriptionPattern: 'Fuses LIDAR point clouds with stereo vision to produce dense 3D scene reconstructions at 30Hz for dynamic environment mapping.', category: 'perception', primaryPrimitives: ['LIDAR', 'ENVIRON', 'VECTOR'], minChainLength: 5, maxChainLength: 8, cjpiBias: 30 },
  { namePattern: 'Object Pose Estimation Pipeline', descriptionPattern: 'Six-DOF object pose estimation from depth and RGB data with occlusion handling and uncertainty quantification for grasp planning.', category: 'perception', primaryPrimitives: ['LIDAR', 'GRIPPER', 'TENSOR'], minChainLength: 5, maxChainLength: 7, cjpiBias: 27 },
  { namePattern: 'Sensor Fusion Calibration Framework', descriptionPattern: 'Automated extrinsic and intrinsic calibration of heterogeneous sensor arrays including cameras, LIDAR, IMUs, and force-torque sensors.', category: 'perception', primaryPrimitives: ['CALIBER', 'LIDAR', 'ENVIRON'], minChainLength: 4, maxChainLength: 7, cjpiBias: 25 },
  { namePattern: 'Dynamic Obstacle Tracking System', descriptionPattern: 'Multi-object tracking in dynamic environments using Kalman-filtered predictions with occlusion reasoning and re-identification.', category: 'perception', primaryPrimitives: ['LIDAR', 'ENVIRON', 'INSPECTOR'], minChainLength: 5, maxChainLength: 7, cjpiBias: 26 },

  // ═══ PLANNING (mid-high CJPI) ═══
  { namePattern: 'Sampling-Based Motion Planning Engine', descriptionPattern: 'RRT* and PRM-based motion planning with dynamic obstacle avoidance, joint limit enforcement, and asymptotic optimality guarantees.', category: 'planning', primaryPrimitives: ['VECTOR', 'ENVIRON', 'BRAIN'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Task-Level Action Sequencer', descriptionPattern: 'Symbolic task planning that decomposes high-level goals into executable motion primitives with precondition checking and replanning on failure.', category: 'planning', primaryPrimitives: ['DISPATCH', 'MARSHAL', 'BRAIN'], minChainLength: 4, maxChainLength: 6, cjpiBias: 18 },
  { namePattern: 'Collision-Free Path Optimizer', descriptionPattern: 'Continuous collision checking with swept-volume analysis and trajectory shortcutting to minimize path length while maintaining safety margins.', category: 'planning', primaryPrimitives: ['VECTOR', 'ENVIRON', 'DEFENSE'], minChainLength: 3, maxChainLength: 5, cjpiBias: 16 },
  { namePattern: 'Multi-Robot Task Allocation Engine', descriptionPattern: 'Auction-based task allocation for heterogeneous robot fleets with capability matching, load balancing, and deadline-aware scheduling.', category: 'planning', primaryPrimitives: ['DISPATCH', 'SWARM', 'MARSHAL'], minChainLength: 4, maxChainLength: 6, cjpiBias: 17 },

  // ═══ MANIPULATION (mid CJPI) ═══
  { namePattern: 'Grasp Quality Evaluation Engine', descriptionPattern: 'Force-closure and form-closure grasp quality metrics with finger placement optimization for multi-fingered and parallel jaw grippers.', category: 'manipulation', primaryPrimitives: ['GRIPPER', 'TENSOR', 'CALIBER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 14 },
  { namePattern: 'Deformable Object Manipulation Pipeline', descriptionPattern: 'Manipulation strategies for deformable objects including cloth, cables, and soft materials using tactile feedback and deformation models.', category: 'manipulation', primaryPrimitives: ['GRIPPER', 'SERVO', 'TENSOR'], minChainLength: 3, maxChainLength: 5, cjpiBias: 12 },
  { namePattern: 'Tool Use Learning Engine', descriptionPattern: 'Learns tool affordances through exploration and demonstration, enabling robots to use novel tools for tasks beyond their end-effector capabilities.', category: 'manipulation', primaryPrimitives: ['GRIPPER', 'PIONEER', 'BRAIN'], minChainLength: 3, maxChainLength: 5, cjpiBias: 10 },

  // ═══ SWARM COORDINATION (mid CJPI) ═══
  { namePattern: 'Decentralized Swarm Consensus Protocol', descriptionPattern: 'Byzantine-fault-tolerant consensus for robot swarms enabling coordinated decisions without centralized controllers or reliable communication.', category: 'swarm-coordination', primaryPrimitives: ['SWARM', 'MARSHAL', 'DISPATCH'], minChainLength: 4, maxChainLength: 6, cjpiBias: 20 },
  { namePattern: 'Formation Control with Obstacle Avoidance', descriptionPattern: 'Maintains geometric formations while navigating through obstacle-rich environments with dynamic reconfiguration on topology changes.', category: 'swarm-coordination', primaryPrimitives: ['SWARM', 'VECTOR', 'ENVIRON'], minChainLength: 3, maxChainLength: 5, cjpiBias: 15 },
  { namePattern: 'Coverage Path Planning for Robot Teams', descriptionPattern: 'Optimal area partitioning and coverage path generation for multi-robot teams with energy-aware scheduling and overlap minimization.', category: 'swarm-coordination', primaryPrimitives: ['SWARM', 'DISPATCH', 'PIONEER'], minChainLength: 3, maxChainLength: 5, cjpiBias: 13 },
  { namePattern: 'Inter-Robot Communication Mesh', descriptionPattern: 'Self-organizing mesh network for robot-to-robot communication with message prioritization, bandwidth management, and relay routing.', category: 'swarm-coordination', primaryPrimitives: ['SWARM', 'RELAY', 'MARSHAL'], minChainLength: 3, maxChainLength: 5, cjpiBias: 11 },

  // ═══ HARDWARE ABSTRACTION (lower CJPI) ═══
  { namePattern: 'Universal Motor Driver Abstraction Layer', descriptionPattern: 'Hardware-agnostic motor control interface supporting stepper, servo, brushless DC, and linear actuators through a unified command API.', category: 'hardware-abstraction', primaryPrimitives: ['SERVO', 'FLUX'], minChainLength: 2, maxChainLength: 4, cjpiBias: 8 },
  { namePattern: 'Sensor Plugin Architecture', descriptionPattern: 'Hot-pluggable sensor driver framework with automatic calibration, data normalization, and health monitoring for heterogeneous sensor arrays.', category: 'hardware-abstraction', primaryPrimitives: ['CALIBER', 'ENVIRON'], minChainLength: 2, maxChainLength: 3, cjpiBias: 4 },
  { namePattern: 'Actuator Health Monitor', descriptionPattern: 'Continuous monitoring of actuator temperature, current draw, and position error with predictive maintenance alerts and graceful degradation.', category: 'hardware-abstraction', primaryPrimitives: ['INSPECTOR', 'SERVO'], minChainLength: 2, maxChainLength: 3, cjpiBias: 2 },

  // ═══ SAFETY & TELEMETRY (lower CJPI, junkyard candidates) ═══
  { namePattern: 'Safety-Rated Speed Monitor', descriptionPattern: 'ISO 13849 compliant speed monitoring with configurable thresholds, safe stop initiation, and audit trail generation.', category: 'safety', primaryPrimitives: ['KINETIC', 'DEFENSE'], minChainLength: 2, maxChainLength: 3, cjpiBias: 0 },
  { namePattern: 'Robot Cell Occupancy Tracker', descriptionPattern: 'Zone-based occupancy detection for collaborative robot cells using safety-rated sensors with configurable protective and warning zones.', category: 'safety', primaryPrimitives: ['ENVIRON', 'DEFENSE'], minChainLength: 2, maxChainLength: 3, cjpiBias: -2 },
  { namePattern: 'Telemetry Compression Pipeline', descriptionPattern: 'Bandwidth-efficient telemetry streaming with configurable sampling rates, delta encoding, and priority-based channel allocation.', category: 'telemetry', primaryPrimitives: ['INSPECTOR', 'RELAY'], minChainLength: 2, maxChainLength: 3, cjpiBias: -3 },
];

// ═══════════════════════════════════════════════════════════════
// §3 — SCORING
// ═══════════════════════════════════════════════════════════════

function scoreCjpi(chainLength: number, bias: number, rand: () => number): number {
  const chainBonus = chainLength * 5;
  const base = 45 + chainBonus + Math.floor(rand() * 15);
  return Math.min(100, Math.max(30, base + bias));
}

function classifyTier(score: number): RoboticsDiscovery['tier'] {
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
  const allPool = [...ROBOTICS_PRIMITIVES, ...SPINE_IDS];
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
  'Autonomous', 'Adaptive', 'Recursive', 'Distributed', 'Real-Time',
  'Coordinated', 'Proactive', 'Hardened', 'Predictive', 'Precision',
  'Continuous', 'Deterministic', 'Intelligent', 'Self-Calibrating', 'Dynamic',
  'Fleet-Wide', 'Safety-Rated', 'Force-Aware', 'Multi-DOF', 'Sub-Millisecond',
];

const VARIANT_SUFFIXES = [
  'Engine', 'Controller', 'Protocol', 'Pipeline', 'Matrix',
  'Orchestrator', 'Planner', 'Framework', 'System', 'Coordinator',
  'Network', 'Driver', 'Optimizer', 'Scanner', 'Layer',
];

function generateVariantName(base: string, index: number, rand: () => number): string {
  if (index === 0) return base;
  const prefix = VARIANT_PREFIXES[Math.floor(rand() * VARIANT_PREFIXES.length)];
  const suffix = VARIANT_SUFFIXES[Math.floor(rand() * VARIANT_SUFFIXES.length)];
  const core = base.split(' ').slice(0, 3).join(' ');
  return `${prefix} ${core} ${suffix}`;
}

// ═══════════════════════════════════════════════════════════════
// §6 — VAULT & MEMORY STREAM POOL
// ═══════════════════════════════════════════════════════════════

const ROBOTICS_VAULT = new Map<string, RoboticsDiscovery>();
const ROBOTICS_MEMORY_STREAM_POOL: RoboticsDiscovery[] = [];

export function getRoboticsVault(): RoboticsDiscovery[] { return Array.from(ROBOTICS_VAULT.values()); }
export function getRoboticsVaultCount(): number { return ROBOTICS_VAULT.size; }
export function getRoboticsMemoryStreamPool(): RoboticsDiscovery[] { return [...ROBOTICS_MEMORY_STREAM_POOL]; }
export function getRoboticsMemoryStreamCount(): number { return ROBOTICS_MEMORY_STREAM_POOL.length; }

// ═══════════════════════════════════════════════════════════════
// §7 — MAIN SEED ENGINE (GENESIS)
// ═══════════════════════════════════════════════════════════════

const TOTAL_DISCOVERIES = 200;
const ARCHITECTURE_GATE_THRESHOLD = 95;
let _seedResult: RoboticsSeedResult | null = null;

export function seedRoboticsDiscoveries(): RoboticsSeedResult {
  if (_seedResult) return _seedResult;

  const runId = 'rb-seed-' + Date.now().toString(36);
  const rand = seedRng(0xB0B0_CAFE);
  const discoveries: RoboticsDiscovery[] = [];
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

    const discovery: RoboticsDiscovery = {
      id: `RDSC-${String(i + 1).padStart(3, '0')}`,
      name: generateVariantName(template.namePattern, variantIndex, rand),
      description: template.descriptionPattern,
      cjpiScore, primitiveChain: chain, tier, route,
      category: template.category,
      discoveredAt: new Date().toISOString(),
    };

    discoveries.push(discovery);
    if (route === 'vault') { ROBOTICS_VAULT.set(discovery.id, discovery); vaultCount++; }
    else {
      addDiscovery(discovery.id, discovery.name, discovery.description, discovery.cjpiScore, discovery.primitiveChain);
      if (route === 'showroom') showroomCount++; else junkyardCount++;
      ROBOTICS_MEMORY_STREAM_POOL.push(discovery); memoryStreamCount++;
    }
  }

  _seedResult = { runId, totalDiscoveries: TOTAL_DISCOVERIES, vaultCount, showroomCount, junkyardCount, memoryStreamCount, discoveries, completedAt: new Date().toISOString() };

  const seedRunId = `rb-seed-${Date.now().toString(36)}`;
  ensureSeedRun(seedRunId, 'robotics', TOTAL_DISCOVERIES).then(() => {
    const rows = discoveries.map(d => ({ id: d.id, name: d.name, description: d.description, cjpiScore: d.cjpiScore, primitiveChain: d.primitiveChain, tier: d.tier, route: d.route, category: d.category, vertical: 'robotics', runId: seedRunId }));
    persistSeedDiscoveries(rows, 'robotics', seedRunId);
  });

  return _seedResult;
}

export function getRoboticsSeedResult(): RoboticsSeedResult | null { return _seedResult; }
export function getRoboticsSeedSummary() {
  if (!_seedResult) return { total: 0, vault: 0, showroom: 0, junkyard: 0, memoryStream: 0 };
  return { total: _seedResult.totalDiscoveries, vault: _seedResult.vaultCount, showroom: _seedResult.showroomCount, junkyard: _seedResult.junkyardCount, memoryStream: _seedResult.memoryStreamCount };
}
export function resetRoboticsSeed(): void { _seedResult = null; ROBOTICS_VAULT.clear(); ROBOTICS_MEMORY_STREAM_POOL.length = 0; }
