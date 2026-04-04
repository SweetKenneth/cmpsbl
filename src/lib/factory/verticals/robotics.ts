/**
 * CMPSBL® Robotics Vertical Substrate
 * 
 * Subdomain: robotics.cmpsbl.com
 * 
 * Hot-swapped Engines (8):
 *   SERVO    — Motor control and actuator orchestration
 *   KINETIC  — Motion planning and trajectory optimization
 *   LIDAR    — Spatial perception and 3D point cloud mapping
 *   FABRICATOR — Hardware fabrication and component lifecycle
 *   FLUX     — Power management and energy distribution
 *   VECTOR   — Navigation, pathfinding, and localization
 *   TENSOR   — Sensor fusion and multi-modal signal processing
 *   CALIBER  — Precision calibration and tolerance enforcement
 * 
 * Hot-swapped Agents (8):
 *   GRIPPER   — Manipulation and dexterous object handling
 *   SWARM     — Multi-robot coordination and fleet management
 *   ENVIRON   — Environmental awareness and scene understanding
 *   MARSHAL   — Safety monitoring and collision avoidance
 *   DISPATCH  — Task sequencing and workflow automation
 *   WELDER    — Assembly operations and joining processes
 *   INSPECTOR — Quality inspection and defect detection
 *   PIONEER   — Autonomous exploration and frontier mapping
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { assembleVerticalPrimitives } from '../vertical-substrate';
import { ROBOTICS_CROWN_JEWELS, getRoboticsJewelsByPrimitive, getRoboticsJewelSummary } from '@/crownjewels/robotics-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

/* ─── Robotics Engines ─── */

const ROBO_ENGINES: VerticalPrimitive[] = [
  {
    id: 'SERVO',
    name: 'SERVO',
    role: 'engine',
    description: 'Motor control and actuator orchestration engine. Manages joint trajectories, torque profiles, PID tuning, and real-time servo loop execution across multi-axis robotic systems.',
    inherited: false,
    replaces: 'CORTEX',
    capabilities: [
      'pid_tuning',
      'torque_profiling',
      'joint_trajectory',
      'servo_loop_execution',
      'motor_diagnostics',
      'haptic_feedback',
      'force_control',
    ],
    weight: 0.035,
    classification: 'active',
  },
  {
    id: 'KINETIC',
    name: 'KINETIC',
    role: 'engine',
    description: 'Motion planning and trajectory optimization engine. Computes collision-free paths through configuration space with dynamic obstacle avoidance and real-time replanning.',
    inherited: false,
    replaces: 'SHADOW',
    capabilities: [
      'path_planning',
      'trajectory_optimization',
      'collision_avoidance',
      'inverse_kinematics',
      'dynamic_replanning',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'LIDAR',
    name: 'LIDAR',
    role: 'engine',
    description: 'Spatial perception and 3D point cloud mapping engine. Processes LiDAR, stereo vision, and depth sensor data into real-time occupancy grids and semantic maps.',
    inherited: false,
    capabilities: [
      'point_cloud_processing',
      'occupancy_grid',
      'slam_mapping',
      'object_detection_3d',
      'terrain_classification',
      'depth_estimation',
    ],
    weight: 0.030,
    classification: 'active',
  },
  {
    id: 'FABRICATOR',
    name: 'FABRICATOR',
    role: 'engine',
    description: 'Hardware fabrication and component lifecycle engine. Manages CAD-to-part pipelines, additive manufacturing parameters, and predictive maintenance schedules.',
    inherited: false,
    capabilities: [
      'cad_pipeline',
      'additive_manufacturing',
      'predictive_maintenance',
      'component_lifecycle',
      'material_selection',
      'thermal_analysis',
    ],
    weight: 0.025,
    classification: 'hybrid',
  },
  {
    id: 'FLUX',
    name: 'FLUX',
    role: 'engine',
    description: 'Power management and energy distribution engine. Optimizes battery discharge curves, manages regenerative braking, and enforces energy budgets across actuator subsystems.',
    inherited: false,
    capabilities: [
      'battery_management',
      'energy_distribution',
      'regenerative_braking',
      'power_budgeting',
      'thermal_throttling',
      'charge_scheduling',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'VECTOR',
    name: 'VECTOR',
    role: 'engine',
    description: 'Navigation, pathfinding, and localization engine. Fuses GPS, IMU, wheel odometry, and visual landmarks for centimeter-accurate autonomous navigation.',
    inherited: false,
    capabilities: [
      'gps_fusion',
      'imu_integration',
      'visual_odometry',
      'waypoint_navigation',
      'map_localization',
      'geofencing',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'TENSOR',
    name: 'TENSOR',
    role: 'engine',
    description: 'Sensor fusion and multi-modal signal processing engine. Merges data from cameras, IMUs, force sensors, and encoders into unified state estimates using Kalman filtering.',
    inherited: false,
    capabilities: [
      'kalman_filtering',
      'sensor_fusion',
      'signal_conditioning',
      'noise_reduction',
      'state_estimation',
      'multi_modal_fusion',
    ],
    weight: 0.025,
    classification: 'passive',
  },
  {
    id: 'CALIBER',
    name: 'CALIBER',
    role: 'engine',
    description: 'Precision calibration and tolerance enforcement engine. Manages kinematic calibration, sensor alignment, and real-time compensation for thermal drift and mechanical wear.',
    inherited: false,
    capabilities: [
      'kinematic_calibration',
      'sensor_alignment',
      'thermal_compensation',
      'backlash_correction',
      'repeatability_analysis',
      'tolerance_enforcement',
    ],
    weight: 0.020,
    classification: 'hybrid',
  },
];

/* ─── Robotics Agents ─── */

const ROBO_AGENTS: VerticalPrimitive[] = [
  {
    id: 'GRIPPER',
    name: 'GRIPPER',
    role: 'agent',
    description: 'Manipulation and dexterous object handling agent. Plans grasp strategies, adapts to object geometry, and manages compliant contact with force feedback.',
    inherited: false,
    capabilities: [
      'grasp_planning',
      'force_feedback',
      'compliant_contact',
      'object_manipulation',
      'dexterous_handling',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'SWARM',
    name: 'SWARM',
    role: 'agent',
    description: 'Multi-robot coordination and fleet management agent. Orchestrates task allocation, formation control, and collision-free path coordination across robot fleets.',
    inherited: false,
    capabilities: [
      'fleet_coordination',
      'task_allocation',
      'formation_control',
      'inter_robot_comms',
      'load_balancing',
    ],
    weight: 0.020,
    classification: 'active',
  },
  {
    id: 'ENVIRON',
    name: 'ENVIRON',
    role: 'agent',
    description: 'Environmental awareness and scene understanding agent. Builds semantic maps, tracks dynamic objects, and classifies workspace zones for safe operation.',
    inherited: false,
    capabilities: [
      'scene_understanding',
      'dynamic_tracking',
      'zone_classification',
      'semantic_mapping',
      'change_detection',
    ],
    weight: 0.020,
    classification: 'passive',
  },
  {
    id: 'GUARDIAN',
    name: 'GUARDIAN',
    role: 'agent',
    description: 'Safety monitoring and collision avoidance agent. Enforces safety zones, monitors human proximity, and triggers protective stops per ISO 10218 and ISO/TS 15066.',
    inherited: false,
    capabilities: [
      'safety_zone_enforcement',
      'human_detection',
      'protective_stop',
      'collision_prediction',
      'iso_compliance',
    ],
    weight: 0.025,
    classification: 'active',
  },
  {
    id: 'CONDUCTOR',
    name: 'CONDUCTOR',
    role: 'agent',
    description: 'Task sequencing and workflow automation agent. Orchestrates multi-step robotic operations, manages dependencies, and handles error recovery in production workflows.',
    inherited: false,
    capabilities: [
      'task_sequencing',
      'dependency_management',
      'error_recovery',
      'workflow_orchestration',
      'cycle_optimization',
    ],
    weight: 0.015,
    classification: 'hybrid',
  },
  {
    id: 'WELDER',
    name: 'WELDER',
    role: 'agent',
    description: 'Assembly operations and joining processes agent. Controls welding parameters, manages fastening sequences, and validates joint integrity through process monitoring.',
    inherited: false,
    capabilities: [
      'weld_parameter_control',
      'fastening_sequence',
      'joint_integrity',
      'process_monitoring',
      'seam_tracking',
    ],
    weight: 0.015,
    classification: 'hybrid',
  },
  {
    id: 'INSPECTOR',
    name: 'INSPECTOR',
    role: 'agent',
    description: 'Quality inspection and defect detection agent. Performs dimensional verification, surface analysis, and statistical process control for automated quality assurance.',
    inherited: false,
    capabilities: [
      'dimensional_verification',
      'surface_analysis',
      'defect_detection',
      'spc_monitoring',
      'metrology',
      'pass_fail_classification',
    ],
    weight: 0.015,
    classification: 'passive',
  },
  {
    id: 'PIONEER',
    name: 'PIONEER',
    role: 'agent',
    description: 'Autonomous exploration and frontier mapping agent. Discovers unknown environments, builds progressively detailed maps, and identifies traversable terrain boundaries.',
    inherited: false,
    capabilities: [
      'frontier_detection',
      'exploration_planning',
      'terrain_assessment',
      'progressive_mapping',
      'unknown_navigation',
    ],
    weight: 0.015,
    classification: 'active',
  },
];

/* ─── Assembled Robotics Substrate ─── */

export function getRoboticsSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'robo-v1',
    name: 'CMPSBL ROBOTICS™',
    tagline: 'Cognitive Robotics Infrastructure — Machines Think Here',
    domain: 'robotics',
    subdomain: 'robotics',
    url: 'https://robotics.cmpsbl.com',
    status: 'assembling',
    version: '1.0.0',
    primitives: getRoboticsPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: [
        'motion_planning_optimization',
        'sensor_fusion_techniques',
        'force_control_strategies',
        'slam_algorithm_tuning',
        'battery_lifecycle_management',
        'safety_standard_compliance',
        'fleet_coordination_patterns',
        'precision_calibration_methods',
        'quality_inspection_algorithms',
        'exploration_frontier_heuristics',
      ],
      priorityPrimitives: ['SERVO', 'GUARDIAN', 'KINETIC', 'LIDAR'],
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: [
        'actuator_performance_trends',
        'sensor_calibration_drift',
        'safety_incident_analysis',
        'fleet_utilization_patterns',
        'manufacturing_defect_patterns',
        'navigation_failure_modes',
      ],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: [
        'Autonomous Navigation Stack',
        'Multi-Robot Formation Control',
        'Adaptive Grasp Planning',
        'Predictive Maintenance Pipeline',
        'Real-Time SLAM Optimization',
        'Force-Torque Compliance Layer',
        'Safety Zone Dynamic Enforcement',
        'Sensor Fusion Kalman Tuner',
        'Quality Inspection Automation',
        'Energy-Optimal Path Planning',
      ],
      cjpiWeights: {
        security: 0.15,
        performance: 0.35,
        reliability: 0.35,
        maintainability: 0.15,
      },
      collisionPriority: ['SERVO', 'KINETIC', 'GUARDIAN', 'LIDAR', 'TENSOR'],
    },
    theme: {
      primaryHue: 200,
      icon: 'Cpu',
      gradientAngle: 135,
      darkAccent: '200 100% 55%',
      lightAccent: '200 80% 45%',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function getRoboticsPrimitives(): VerticalPrimitive[] {
  return assembleVerticalPrimitives(ROBO_ENGINES, ROBO_AGENTS);
}

export function getRoboticsEngines(): VerticalPrimitive[] {
  return [...ROBO_ENGINES];
}

export function getRoboticsAgents(): VerticalPrimitive[] {
  return [...ROBO_AGENTS];
}

export function getAllRoboticsCapabilities(): string[] {
  const primitives = getRoboticsPrimitives();
  const capabilities = new Set<string>();
  for (const p of primitives) {
    for (const cap of p.capabilities) capabilities.add(cap);
  }
  return Array.from(capabilities).sort();
}

/* ═══════════════════════════════════════════════
   Crown Jewel Integration — S-Tier Registry Surface
   ═══════════════════════════════════════════════ */

export function getRoboticsCrownJewels(): STierEntry[] {
  return [...ROBOTICS_CROWN_JEWELS];
}

export function getRoboticsPrimitiveCrownJewels(primitiveId: string): STierEntry[] {
  return getRoboticsJewelsByPrimitive(primitiveId);
}

export function getRoboticsCrownJewelSummary() {
  return getRoboticsJewelSummary();
}

export function getRoboticsCrownJewelCount(): number {
  return ROBOTICS_CROWN_JEWELS.length;
}

export function getRoboticsCrownJewelCapabilities(): string[] {
  return ROBOTICS_CROWN_JEWELS.map(j =>
    j.id.toLowerCase().replace(/^s-/, 'cj_')
  );
}
