/**
 * CMPSBL ROBOTICS™ — Vertical Crown Jewel Registry
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 80 Architectural Crown Jewels: 5 per each of the 16 robotics primitives.
 * Classification: Architecture (permanently black-boxed).
 * All CJPI ≥ 92 — governor-curated, S-Tier.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { STierEntry } from './types';

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

// ── SERVO ──
const SERVO_JEWELS: STierEntry[] = [
  cj(400, 'S-SRV01', 'Adaptive PID Auto-Tuner', 97, 'SERVO',
    'Self-tuning PID controller that uses Ziegler-Nichols and relay feedback methods to automatically converge on optimal gains for any actuator configuration. Adapts in real-time to payload changes and mechanical wear.',
    'r1s2t3u4'),
  cj(401, 'S-SRV02', 'Torque Ripple Compensator', 96, 'SERVO',
    'Eliminates torque ripple in brushless DC and stepper motors through harmonic injection and field-oriented control. Achieves sub-1% torque variation at all speeds.',
    'r2s3t4u5'),
  cj(402, 'S-SRV03', 'Multi-Axis Synchronization Kernel', 95, 'SERVO',
    'Synchronizes up to 32 servo axes with microsecond-level coordination using EtherCAT-compatible distributed clock protocols. Ensures smooth coordinated motion across complex kinematic chains.',
    'r3s4t5u6'),
  cj(403, 'S-SRV04', 'Haptic Force Rendering Engine', 94, 'SERVO',
    'Renders programmable force feedback through impedance and admittance control loops. Enables compliant manipulation with configurable virtual fixtures and force boundaries.',
    'r4s5t6u7'),
  cj(404, 'S-SRV05', 'Motor Health Prognostics System', 95, 'SERVO',
    'Monitors motor current signatures, vibration spectra, and thermal profiles to predict bearing failures, winding degradation, and encoder drift before they cause downtime.',
    'r5s6t7u8'),
];

// ── KINETIC ──
const KINETIC_JEWELS: STierEntry[] = [
  cj(405, 'S-KIN01', 'RRT* Real-Time Path Planner', 97, 'KINETIC',
    'Asymptotically optimal rapidly-exploring random tree planner with real-time rewiring. Computes collision-free paths in high-dimensional configuration spaces with dynamic obstacle updates.',
    's1t2u3v4'),
  cj(406, 'S-KIN02', 'Trajectory Time-Optimal Smoother', 96, 'KINETIC',
    'Converts piecewise-linear paths into time-optimal smooth trajectories respecting velocity, acceleration, and jerk limits. Uses B-spline parameterization with dynamic programming.',
    's2t3u4v5'),
  cj(407, 'S-KIN03', 'Inverse Kinematics Solver Suite', 95, 'KINETIC',
    'Analytical and numerical IK solvers for serial, parallel, and redundant manipulators. Handles singularity avoidance, joint limit enforcement, and weighted damped least-squares solutions.',
    's3t4u5v6'),
  cj(408, 'S-KIN04', 'Dynamic Obstacle Predictor', 94, 'KINETIC',
    'Predicts future positions of moving obstacles using Kalman-filtered velocity estimates and intention models. Feeds predicted occupancy into the planner for proactive avoidance.',
    's4t5u6v7'),
  cj(409, 'S-KIN05', 'Configuration Space Analyzer', 95, 'KINETIC',
    'Pre-computes configuration space representations including collision volumes, self-collision maps, and reachability envelopes for rapid online motion planning queries.',
    's5t6u7v8'),
];

// ── LIDAR ──
const LIDAR_JEWELS: STierEntry[] = [
  cj(410, 'S-LDR01', 'Real-Time SLAM Fusion Engine', 97, 'LIDAR',
    'Simultaneous localization and mapping combining LiDAR point clouds, visual features, and IMU data through graph-based optimization with loop closure detection.',
    't1u2v3w4'),
  cj(411, 'S-LDR02', 'Semantic Point Cloud Classifier', 96, 'LIDAR',
    'Classifies 3D point cloud segments into semantic categories (ground, obstacle, human, machine) using PointNet-derived feature extraction with sub-frame latency.',
    't2u3v4w5'),
  cj(412, 'S-LDR03', 'Occupancy Grid Generator', 95, 'LIDAR',
    'Generates probabilistic 2.5D and 3D occupancy grids from multi-sensor depth data with Bayesian update rules. Supports both static mapping and dynamic environment tracking.',
    't3u4v5w6'),
  cj(413, 'S-LDR04', 'Terrain Traversability Analyzer', 94, 'LIDAR',
    'Analyzes terrain geometry from point clouds to classify traversability grades considering slope, roughness, step height, and surface material properties.',
    't4u5v6w7'),
  cj(414, 'S-LDR05', 'Multi-Sensor Registration Engine', 96, 'LIDAR',
    'Performs extrinsic calibration and real-time registration between LiDAR, cameras, and radar using ICP variants with outlier rejection and temporal alignment.',
    't5u6v7w8'),
];

// ── FORGE ──
const FORGE_JEWELS: STierEntry[] = [
  cj(415, 'S-FRG01', 'Predictive Maintenance Scheduler', 97, 'FORGE',
    'Forecasts component failure timelines using Weibull distribution modeling on vibration, temperature, and cycle-count data. Generates optimal replacement schedules minimizing downtime.',
    'u1v2w3x4'),
  cj(416, 'S-FRG02', 'Additive Manufacturing Parameter Optimizer', 96, 'FORGE',
    'Optimizes 3D printing parameters (layer height, infill, speed, temperature) through design-of-experiment analysis to maximize part strength while minimizing material usage and print time.',
    'u2v3w4x5'),
  cj(417, 'S-FRG03', 'Digital Twin Synchronizer', 95, 'FORGE',
    'Maintains real-time digital twin models of physical robot assemblies by synchronizing sensor data, wear models, and operational parameters with sub-millisecond latency.',
    'u3v4w5x6'),
  cj(418, 'S-FRG04', 'Thermal Stress Analyzer', 94, 'FORGE',
    'Simulates thermal expansion and stress distribution across mechanical assemblies to predict deformation, identify hotspots, and recommend cooling strategies.',
    'u4v5w6x7'),
  cj(419, 'S-FRG05', 'Component Lifecycle Tracker', 95, 'FORGE',
    'Tracks full lifecycle of every mechanical component from manufacture through installation, operation, maintenance, and eventual replacement. Maintains cryptographic provenance chains.',
    'u5v6w7x8'),
];

// ── FLUX ──
const FLUX_JEWELS: STierEntry[] = [
  cj(420, 'S-FLX01', 'Battery State-of-Health Estimator', 97, 'FLUX',
    'Estimates battery state-of-health and remaining useful life through impedance spectroscopy analysis and coulomb counting with temperature-compensated aging models.',
    'v1w2x3y4'),
  cj(421, 'S-FLX02', 'Regenerative Energy Recovery Controller', 96, 'FLUX',
    'Maximizes energy recovery during braking and deceleration phases through optimal switching between regenerative and resistive braking based on battery SOC and thermal state.',
    'v2w3x4y5'),
  cj(422, 'S-FLX03', 'Dynamic Power Budget Allocator', 95, 'FLUX',
    'Allocates power budgets across actuator subsystems in real-time based on task priority, remaining energy, and mission requirements. Implements graceful degradation under low-power conditions.',
    'v3w4x5y6'),
  cj(423, 'S-FLX04', 'Charge Scheduling Optimizer', 94, 'FLUX',
    'Optimizes fleet charging schedules considering electricity tariffs, mission timelines, battery health, and charger availability. Minimizes total energy cost while maximizing fleet uptime.',
    'v4w5x6y7'),
  cj(424, 'S-FLX05', 'Thermal Throttle Controller', 95, 'FLUX',
    'Manages thermal throttling across motors, batteries, and electronics to prevent overheating while minimizing performance impact. Uses predictive thermal models for proactive derating.',
    'v5w6x7y8'),
];

// ── VECTOR ──
const VECTOR_JEWELS: STierEntry[] = [
  cj(425, 'S-VCT01', 'Multi-Source Localization Fuser', 97, 'VECTOR',
    'Fuses GPS, RTK corrections, UWB beacons, visual landmarks, and wheel odometry through factor graph optimization for centimeter-accurate indoor/outdoor localization.',
    'w1x2y3z4'),
  cj(426, 'S-VCT02', 'Autonomous Waypoint Navigator', 96, 'VECTOR',
    'Executes waypoint-based navigation missions with dynamic rerouting around obstacles, no-go zones, and traffic. Handles GPS-denied transitions with seamless fallback to visual navigation.',
    'w2x3y4z5'),
  cj(427, 'S-VCT03', 'Geofence Enforcement Engine', 95, 'VECTOR',
    'Enforces geofence boundaries with configurable response actions (slow, stop, alert, return-to-base). Supports complex polygon geofences with altitude constraints and time-based schedules.',
    'w3x4y5z6'),
  cj(428, 'S-VCT04', 'Visual Odometry Pipeline', 94, 'VECTOR',
    'Stereo and monocular visual odometry with feature tracking, keyframe management, and scale recovery. Provides drift-bounded pose estimates in GPS-denied environments.',
    'w4x5y6z7'),
  cj(429, 'S-VCT05', 'Map-Based Re-Localization Engine', 96, 'VECTOR',
    'Re-localizes robots within pre-built maps using place recognition, point cloud matching, and visual bag-of-words queries. Recovers from kidnapped robot scenarios within seconds.',
    'w5x6y7z8'),
];

// ── TENSOR ──
const TENSOR_JEWELS: STierEntry[] = [
  cj(430, 'S-TNS01', 'Extended Kalman Fusion Core', 97, 'TENSOR',
    'Multi-rate extended Kalman filter fusing IMU, encoders, force/torque sensors, and cameras at their native rates. Produces unified state estimates with covariance-tracked uncertainty.',
    'x1y2z3a4'),
  cj(431, 'S-TNS02', 'Anomaly Signal Detector', 96, 'TENSOR',
    'Detects anomalous sensor readings through statistical process monitoring with CUSUM and EWMA charts. Isolates faulty sensors and triggers fallback estimation modes.',
    'x2y3z4a5'),
  cj(432, 'S-TNS03', 'Multi-Modal Object Tracker', 95, 'TENSOR',
    'Tracks objects using fused camera, LiDAR, and radar data with Hungarian assignment and Kalman prediction. Maintains persistent object IDs through occlusions and re-appearances.',
    'x3y4z5a6'),
  cj(433, 'S-TNS04', 'Noise Characterization Engine', 94, 'TENSOR',
    'Automatically characterizes sensor noise profiles through Allan variance analysis and power spectral density estimation. Updates filter parameters as sensor characteristics drift over time.',
    'x4y5z6a7'),
  cj(434, 'S-TNS05', 'Contact Force Estimator', 95, 'TENSOR',
    'Estimates contact forces from motor current and joint position data without dedicated force sensors using momentum observer and disturbance observer techniques.',
    'x5y6z7a8'),
];

// ── CALIBER ──
const CALIBER_JEWELS: STierEntry[] = [
  cj(435, 'S-CLB01', 'Kinematic Parameter Identifier', 97, 'CALIBER',
    'Identifies DH parameters and non-geometric error sources through optimized calibration routines using redundant measurements and least-squares fitting with outlier rejection.',
    'y1z2a3b4'),
  cj(436, 'S-CLB02', 'Thermal Drift Compensator', 96, 'CALIBER',
    'Models and compensates for thermal expansion effects on robot geometry using embedded temperature sensors and finite-element thermal models updated in real-time.',
    'y2z3a4b5'),
  cj(437, 'S-CLB03', 'Backlash Characterization Engine', 95, 'CALIBER',
    'Measures and compensates for mechanical backlash in gear trains through bidirectional motion analysis and hysteresis modeling. Applies feedforward correction for precision applications.',
    'y3z4a5b6'),
  cj(438, 'S-CLB04', 'Repeatability Certification Suite', 94, 'CALIBER',
    'Performs ISO 9283 repeatability and accuracy certification tests automatically. Generates compliance reports with statistical analysis of position, path, and orientation errors.',
    'y4z5a6b7'),
  cj(439, 'S-CLB05', 'Sensor-to-Frame Alignment Wizard', 95, 'CALIBER',
    'Automates extrinsic calibration between sensors and robot frames through guided calibration procedures with automatic feature detection and optimization-based alignment.',
    'y5z6a7b8'),
];


/* ═══════════════════════════════════════════════
   AGENTS (8 × 5 = 40 Crown Jewels)
   ═══════════════════════════════════════════════ */

// ── GRIPPER ──
const GRIPPER_JEWELS: STierEntry[] = [
  cj(440, 'S-GRP01', 'Adaptive Grasp Strategy Planner', 97, 'GRIPPER',
    'Computes optimal grasp poses for arbitrary object geometries using antipodal analysis, force closure verification, and uncertainty-aware grasp quality metrics.',
    'z1a2b3c4'),
  cj(441, 'S-GRP02', 'Compliant Manipulation Controller', 96, 'GRIPPER',
    'Implements impedance-controlled manipulation for delicate and deformable objects. Automatically adjusts stiffness and damping based on tactile feedback and object material properties.',
    'z2a3b4c5'),
  cj(442, 'S-GRP03', 'In-Hand Manipulation Engine', 95, 'GRIPPER',
    'Plans and executes in-hand object reorientation using dexterous finger gaiting, pivoting, and rolling motions with real-time slip detection and recovery.',
    'z3a4b5c6'),
  cj(443, 'S-GRP04', 'Tactile Sensing Interpreter', 94, 'GRIPPER',
    'Processes high-resolution tactile sensor arrays to estimate contact geometry, force distribution, slip onset, and object material properties during grasping.',
    'z4a5b6c7'),
  cj(444, 'S-GRP05', 'Bin Picking Orchestrator', 96, 'GRIPPER',
    'Orchestrates autonomous bin picking operations combining 3D perception, grasp planning, collision checking, and motion planning for random pile configurations.',
    'z5a6b7c8'),
];

// ── SWARM ──
const SWARM_JEWELS: STierEntry[] = [
  cj(445, 'S-SWM01', 'Decentralized Task Allocator', 97, 'SWARM',
    'Allocates tasks across robot fleets using auction-based algorithms with consensus protocols. Optimizes for total completion time, energy usage, and workload balance.',
    'a1b2c3d4r'),
  cj(446, 'S-SWM02', 'Formation Control Engine', 96, 'SWARM',
    'Maintains geometric formations during multi-robot navigation using virtual structure and behavior-based approaches. Handles dynamic formation changes and obstacle-induced splitting.',
    'a2b3c4d5r'),
  cj(447, 'S-SWM03', 'Fleet Health Monitor', 95, 'SWARM',
    'Aggregates health telemetry across robot fleets with anomaly detection, performance trending, and automated dispatch of replacement units when degradation exceeds thresholds.',
    'a3b4c5d6r'),
  cj(448, 'S-SWM04', 'Inter-Robot Communication Protocol', 94, 'SWARM',
    'Manages peer-to-peer and broadcast communication between robots with message prioritization, bandwidth management, and graceful degradation under network congestion.',
    'a4b5c6d7r'),
  cj(449, 'S-SWM05', 'Collaborative Mapping Merger', 96, 'SWARM',
    'Merges partial maps from multiple exploring robots into a consistent global map using relative pose estimation and map alignment with overlap detection.',
    'a5b6c7d8r'),
];

// ── ENVIRON ──
const ENVIRON_JEWELS: STierEntry[] = [
  cj(450, 'S-ENV01', 'Dynamic Scene Graph Builder', 97, 'ENVIRON',
    'Builds and maintains hierarchical scene graphs representing objects, their relationships, and spatial properties in real-time from multi-sensor perception data.',
    'b1c2d3e4r'),
  cj(451, 'S-ENV02', 'Workspace Zone Manager', 96, 'ENVIRON',
    'Dynamically classifies and manages workspace zones (safe, restricted, hazardous, human-occupied) based on real-time sensor data and operational context.',
    'b2c3d4e5r'),
  cj(452, 'S-ENV03', 'Change Detection Pipeline', 95, 'ENVIRON',
    'Detects and classifies environmental changes by comparing current perception against stored baseline maps. Distinguishes between permanent structural changes and temporary disturbances.',
    'b3c4d5e6r'),
  cj(453, 'S-ENV04', 'Object Permanence Tracker', 94, 'ENVIRON',
    'Maintains persistent object hypotheses even when objects are occluded or leave the sensor field of view. Uses motion prediction and contextual reasoning for tracking.',
    'b4c5d6e7r'),
  cj(454, 'S-ENV05', 'Lighting Condition Adapter', 93, 'ENVIRON',
    'Automatically adjusts perception pipeline parameters to maintain detection performance across varying lighting conditions including direct sunlight, shadows, and artificial illumination.',
    'b5c6d7e8r'),
];

// ── GUARDIAN ──
const GUARDIAN_JEWELS: STierEntry[] = [
  cj(455, 'S-GRD01', 'ISO 10218 Compliance Engine', 97, 'GUARDIAN',
    'Continuously validates robot operations against ISO 10218 safety requirements including speed monitoring, force limiting, and safety-rated monitored stop verification.',
    'c1d2e3f4r'),
  cj(456, 'S-GRD02', 'Human Proximity Speed Scaler', 96, 'GUARDIAN',
    'Dynamically scales robot speed based on detected human proximity using ISO/TS 15066 speed and separation monitoring. Implements progressive deceleration curves.',
    'c2d3e4f5r'),
  cj(457, 'S-GRD03', 'Collision Force Limiter', 95, 'GUARDIAN',
    'Limits contact forces during unexpected collisions using current-based impact detection with sub-10ms reaction time. Implements ISO/TS 15066 biomechanical force limits.',
    'c3d4e5f6r'),
  cj(458, 'S-GRD04', 'Safety Zone Dynamic Enforcer', 96, 'GUARDIAN',
    'Computes and enforces dynamic safety zones around robots based on current velocity, payload, and stopping distance calculations. Zones adapt in real-time to operational conditions.',
    'c4d5e6f7r'),
  cj(459, 'S-GRD05', 'Protective Stop Orchestrator', 94, 'GUARDIAN',
    'Orchestrates protective stop sequences with graceful deceleration profiles that minimize mechanical stress while achieving safety-rated stop times. Manages restart verification procedures.',
    'c5d6e7f8r'),
];

// ── CONDUCTOR ──
const CONDUCTOR_JEWELS: STierEntry[] = [
  cj(460, 'S-CND01', 'Finite State Machine Orchestrator', 96, 'CONDUCTOR',
    'Manages complex multi-step robotic operations through hierarchical finite state machines with conditional branching, timeout handling, and automatic error recovery transitions.',
    'd1e2f3g4r'),
  cj(461, 'S-CND02', 'Cycle Time Optimizer', 95, 'CONDUCTOR',
    'Analyzes and optimizes production cycle times by identifying bottlenecks, parallelizing independent operations, and minimizing non-productive robot movements.',
    'd2e3f4g5r'),
  cj(462, 'S-CND03', 'Error Recovery Protocol Engine', 97, 'CONDUCTOR',
    'Implements hierarchical error recovery strategies from simple retries through alternative approaches to graceful task abandonment with workspace cleanup.',
    'd3e4f5g6r'),
  cj(463, 'S-CND04', 'Multi-Robot Workflow Scheduler', 94, 'CONDUCTOR',
    'Schedules workflows across multiple robots with shared resource management, precedence constraint satisfaction, and dynamic re-scheduling on disruptions.',
    'd4e5f6g7r'),
  cj(464, 'S-CND05', 'Production Recipe Manager', 95, 'CONDUCTOR',
    'Manages parameterized production recipes with version control, variant management, and runtime parameter adaptation based on material batch properties.',
    'd5e6f7g8r'),
];

// ── WELDER ──
const WELDER_JEWELS: STierEntry[] = [
  cj(465, 'S-WLD01', 'Adaptive Weld Parameter Controller', 97, 'WELDER',
    'Adjusts welding parameters (current, voltage, speed, wire feed) in real-time based on seam tracking sensor feedback, gap detection, and puddle monitoring.',
    'e1f2g3h4r'),
  cj(466, 'S-WLD02', 'Seam Tracking Vision System', 96, 'WELDER',
    'Tracks weld seam geometry using structured light and laser scanning with real-time path correction. Handles varying joint types including butt, lap, fillet, and corner joints.',
    'e2f3g4h5r'),
  cj(467, 'S-WLD03', 'Weld Quality Prediction Model', 95, 'WELDER',
    'Predicts weld quality metrics (penetration, porosity, undercut) from process parameters and sensor data using physics-informed models with online adaptation.',
    'e3f4g5h6r'),
  cj(468, 'S-WLD04', 'Multi-Pass Strategy Planner', 94, 'WELDER',
    'Plans multi-pass welding strategies for thick joints including pass sequencing, inter-pass temperature management, and distortion minimization through balanced filling.',
    'e4f5g6h7r'),
  cj(469, 'S-WLD05', 'Fastening Torque Controller', 95, 'WELDER',
    'Controls fastening operations with torque-angle monitoring, yield point detection, and clamp force verification. Manages multi-spindle tightening sequences with configurable patterns.',
    'e5f6g7h8r'),
];

// ── INSPECTOR ──
const INSPECTOR_JEWELS: STierEntry[] = [
  cj(470, 'S-INS01', 'Dimensional Verification Engine', 97, 'INSPECTOR',
    'Performs automated dimensional inspection using structured light scanning with comparison against CAD models. Reports deviations with GD&T callout mapping and tolerance analysis.',
    'f1g2h3i4r'),
  cj(471, 'S-INS02', 'Surface Defect Classifier', 96, 'INSPECTOR',
    'Classifies surface defects (scratches, dents, porosity, discoloration) from high-resolution camera images using convolutional feature extraction with defect severity grading.',
    'f2g3h4i5r'),
  cj(472, 'S-INS03', 'Statistical Process Control Monitor', 95, 'INSPECTOR',
    'Implements real-time SPC with control charts (X-bar, R, p, c) for critical quality characteristics. Detects process shifts and trends with Western Electric rules.',
    'f3g4h5i6r'),
  cj(473, 'S-INS04', 'Non-Destructive Testing Coordinator', 94, 'INSPECTOR',
    'Coordinates automated NDT inspections including ultrasonic testing, eddy current, and magnetic particle inspection with robotic probe positioning and data collection.',
    'f4g5h6i7r'),
  cj(474, 'S-INS05', 'First Article Inspection Automator', 96, 'INSPECTOR',
    'Automates first article inspection workflows with full dimensional reporting, material certification verification, and compliance documentation generation per AS9102.',
    'f5g6h7i8r'),
];

// ── PIONEER ──
const PIONEER_JEWELS: STierEntry[] = [
  cj(475, 'S-PNR01', 'Frontier-Based Exploration Planner', 97, 'PIONEER',
    'Plans exploration trajectories by identifying and prioritizing frontiers (boundaries between known and unknown space) using information-theoretic utility functions.',
    'g1h2i3j4r'),
  cj(476, 'S-PNR02', 'Terrain Risk Assessor', 96, 'PIONEER',
    'Assesses terrain risk for autonomous traversal using slope analysis, surface stability estimation, and hazard detection. Produces risk-weighted traversability cost maps.',
    'g2h3i4j5r'),
  cj(477, 'S-PNR03', 'Progressive Map Builder', 95, 'PIONEER',
    'Builds multi-resolution maps progressively as exploration proceeds, starting with coarse occupancy grids and refining to semantic 3D models in explored areas.',
    'g3h4i5j6r'),
  cj(478, 'S-PNR04', 'Communication Relay Planner', 94, 'PIONEER',
    'Plans robot positions to maintain communication coverage during exploration, deploying relay waypoints when direct communication links degrade beyond threshold.',
    'g4h5i6j7r'),
  cj(479, 'S-PNR05', 'Return-to-Base Path Guarantor', 95, 'PIONEER',
    'Maintains guaranteed return-to-base paths throughout exploration missions by continuously computing safe retreat routes and monitoring energy reserves against distance costs.',
    'g5h6i7j8r'),
];


/* ─── Assembled Registry ─── */

export const ROBOTICS_CROWN_JEWELS: STierEntry[] = [
  ...SERVO_JEWELS,
  ...KINETIC_JEWELS,
  ...LIDAR_JEWELS,
  ...FORGE_JEWELS,
  ...FLUX_JEWELS,
  ...VECTOR_JEWELS,
  ...TENSOR_JEWELS,
  ...CALIBER_JEWELS,
  ...GRIPPER_JEWELS,
  ...SWARM_JEWELS,
  ...ENVIRON_JEWELS,
  ...GUARDIAN_JEWELS,
  ...CONDUCTOR_JEWELS,
  ...WELDER_JEWELS,
  ...INSPECTOR_JEWELS,
  ...PIONEER_JEWELS,
];

export const ROBOTICS_CJ_COUNT = ROBOTICS_CROWN_JEWELS.length; // 80

export function getRoboticsJewelsByPrimitive(primitiveId: string): STierEntry[] {
  return ROBOTICS_CROWN_JEWELS.filter(j => j.module === primitiveId);
}

export function getRoboticsJewelIds(): string[] {
  return ROBOTICS_CROWN_JEWELS.map(j => j.id);
}

export function getRoboticsJewelsByCJPI(minCjpi: number): STierEntry[] {
  return ROBOTICS_CROWN_JEWELS.filter(j => j.cjpi >= minCjpi);
}

export function getRoboticsJewelSummary(): Array<{
  primitive: string;
  count: number;
  avgCjpi: number;
  topJewel: string;
}> {
  const primitives = [...new Set(ROBOTICS_CROWN_JEWELS.map(j => j.module))];
  return primitives.map(p => {
    const jewels = ROBOTICS_CROWN_JEWELS.filter(j => j.module === p);
    const top = jewels.reduce((a, b) => a.cjpi > b.cjpi ? a : b);
    return {
      primitive: p,
      count: jewels.length,
      avgCjpi: Math.round(jewels.reduce((s, j) => s + j.cjpi, 0) / jewels.length * 10) / 10,
      topJewel: top.name,
    };
  });
}
