# CMPSBL® Primitive Reference

**Classification:** 📖 Internal Reference  
**Version:** 1.0.0  
**Last Updated:** 2026-04-03

---

The CMPSBL® substrate is built on a **40-primitive matrix**: a fixed 24-primitive **Spine** (12 Organs + 12 Layers) shared across every vertical, plus 16 **hot-swappable** expansion primitives (8 Engines + 8 Agents) that are domain-specific per vertical.

This document catalogs every primitive across the core substrate and all three verticals, along with their purpose and top Crown Jewel capabilities.

---

## Table of Contents

1. [Spine — 12 Organs](#spine--12-organs)
2. [Spine — 12 Layers](#spine--12-layers)
3. [Standard Engines & Agents (cmpsbl.com)](#standard-engines--agents-cmpsblcom)
4. [CMPSBL CYBER™ (security.cmpsbl.com)](#cmpsbl-cyber-securitycmpsblcom)
5. [CMPSBL ROBOTICS™ (robotics.cmpsbl.com)](#cmpsbl-robotics-roboticscmpsblcom)
6. [CMPSBL QUANTUM™ (quantum.cmpsbl.com)](#cmpsbl-quantum-quantumcmpsblcom)

---

## Spine — 12 Organs

The Organs are the foundational biological core of every substrate instance. They are **observable but not interactive** — their internals are protected.

### CORE — Genesis
**Purpose:** Kernel boot and matrix integrity. Responsible for the boot sequence, integrity checks, and lifecycle management of the entire 40-primitive matrix.  
**Top Capabilities:** `boot_sequence` · `integrity_check` · `lifecycle_management`

### SYSTEM — Lifecycle
**Purpose:** Lifecycle coordination, configuration management, and environment resolution. Manages config, env variables, and lifecycle events across the substrate.  
**Top Capabilities:** `config_management` · `env_resolution` · `lifecycle_events`

### BRAIN — Thinker
**Purpose:** Reasoning and knowledge fusion. The substrate's central knowledge store, reasoning engine, and pattern matching core. Powers CLM learning cycles.  
**Top Capabilities:** `knowledge_store` · `reasoning_engine` · `pattern_matching`

### MEMORY — Archive Prime
**Purpose:** Persistent state across 4 tiers (hot, warm, cold, glacier). Manages all substrate memory with tiered retention policies.  
**Top Capabilities:** `hot_memory` · `warm_memory` · `cold_memory` · `glacier_memory`

### DREAM — Weaver
**Purpose:** Sub-threshold synthesis and pre-conscious emergence. Pure algorithmic — **no AI inside**. Collects fragments, amplifies resonance patterns, and detects emergent capabilities. Patentable.  
**Top Capabilities:** `fragment_collection` · `resonance_amplification` · `emergence_detection`

### NERVE — Conductor
**Purpose:** Autonomic signal routing. Dispatches signals, manages reaction chains, and triggers auto-activation across the primitive matrix.  
**Top Capabilities:** `signal_dispatch` · `reaction_chains` · `auto_activation`

### IDENTITY — Sentinel
**Purpose:** Authentication and identity resolution. Handles auth resolution, session management, and identity binding for all substrate operations.  
**Top Capabilities:** `auth_resolution` · `session_management` · `identity_binding`

### RELAY — Courier
**Purpose:** Event routing and message passing. The substrate's pub/sub backbone for inter-primitive communication.  
**Top Capabilities:** `event_routing` · `message_passing` · `pub_sub`

### AUDIT — Chronicler
**Purpose:** Tamper-evident logging. Maintains an immutable audit log with chain anchoring for compliance trails.  
**Top Capabilities:** `immutable_log` · `chain_anchoring` · `compliance_trail`

### RIPPLE — Cascade
**Purpose:** Compliance and boundary enforcement. Propagates policies and enforces boundaries across the substrate.  
**Top Capabilities:** `boundary_enforcement` · `compliance_check` · `policy_propagation`

### ACCESS — Gatekeeper
**Purpose:** Authorization and permission management. Manages RBAC, permission checks, and scope validation for all substrate operations.  
**Top Capabilities:** `rbac` · `permission_check` · `scope_validation`

### GOVERNANCE — Chancellor
**Purpose:** Supervisory legitimacy checks. The ultimate gatekeeper — approves actions, gates mutations, and ensures legitimacy of all substrate operations.  
**Top Capabilities:** `legitimacy_check` · `action_approval` · `mutation_gate`

---

## Spine — 12 Layers

Layers are the cross-cutting concerns that wrap every operation. Like Organs, they are **observable but not interactive**.

### DEFENSE — Bulwark
**Purpose:** Terminal containment boundary. The last line of defense — threat assessment, perimeter security, and encryption enforcement.  
**Top Capabilities:** `threat_assessment` · `perimeter_security` · `encryption_layer`

### IMMUNITY — Antibody
**Purpose:** Cross-cutting transformation fabric. Detects anomalies, triggers self-healing, and quarantines compromised components.  
**Top Capabilities:** `anomaly_detection` · `self_healing` · `quarantine`

### INTENT — Translator
**Purpose:** Purpose resolution and routing. Parses user intent, extracts goals, and maps them to actionable primitives.  
**Top Capabilities:** `intent_parsing` · `goal_extraction` · `action_mapping`

### ATLAS — Prometheus
**Purpose:** Governance hub and topology mapping. Maintains the substrate's topology map, discovers capabilities, and manages the health grid.  
**Top Capabilities:** `topology_map` · `capability_discovery` · `health_grid`

### ENGINEER — Mechanic
**Purpose:** Maintenance intelligence. Proposes maintenance actions, plans patches, and detects drift across the substrate.  
**Top Capabilities:** `maintenance_proposals` · `patch_planning` · `drift_detection`

### DECODE — Parser
**Purpose:** Conversational interface. Handles natural language input, context resolution, and conversation state management.  
**Top Capabilities:** `natural_language` · `context_resolution` · `conversation_state`

### ENCODE — Builder
**Purpose:** Systems engineering and code generation. Generates code, writes patches, and executes blueprints for substrate evolution.  
**Top Capabilities:** `code_generation` · `patch_writing` · `blueprint_execution`

### VISION — Observer
**Purpose:** Visual analysis and perception. Image analysis, visual reasoning, and pattern recognition for substrate inputs.  
**Top Capabilities:** `image_analysis` · `visual_reasoning` · `pattern_recognition`

### ECONOMY — Treasurer
**Purpose:** Cost optimization and resource allocation. Tracks costs, allocates resources, and calculates ROI across all substrate operations.  
**Top Capabilities:** `cost_tracking` · `resource_allocation` · `roi_calculation`

### SANDBOX
**Purpose:** Isolated execution environment. Provides safe evaluation, containment, and isolated execution for untrusted code.  
**Top Capabilities:** `isolated_execution` · `safe_eval` · `containment`

### INCLUSIVE — Advocate
**Purpose:** Accessibility and adaptation. Enforces a11y standards, manages adaptive interfaces, and ensures universal design compliance.  
**Top Capabilities:** `a11y_enforcement` · `adaptive_interface` · `universal_design`

### MEDIC — Surgeon
**Purpose:** Diagnostic and recovery. Performs health diagnostics, executes recovery protocols, and triages substrate failures.  
**Top Capabilities:** `health_diagnostic` · `recovery_protocol` · `system_triage`

---

## Standard Engines & Agents (cmpsbl.com)

The default expansion primitives on the main substrate at cmpsbl.com.

### Engines (8)

| Primitive | Tier | Purpose |
|-----------|------|---------|
| **FAILSAFE** | Free | Circuit breaker and graceful degradation. Catches cascading failures and isolates faulty primitives. |
| **BEACON** | Free | Health signaling and observability. Emits health pulses, status beacons, and diagnostic telemetry. |
| **AUTOMATON** | $79 | Workflow automation engine. Executes multi-step automated workflows with retry and fallback logic. |
| **CORTEX** | $129 | Cognitive orchestration engine. Coordinates complex reasoning across BRAIN, MEMORY, and DREAM. |
| **NEXUS** | $159 | Default AI router. Routes AI requests to optimal providers with cost/latency balancing. |
| **ARCHITECT** | $249 | Ascension engine. Powers the code → classification → collision → CJPI scoring pipeline. |
| **ENCODE** | — | Code generation engine. Systems engineering and patch writing. |
| **ENGINEER** | — | Maintenance intelligence engine. Drift detection and patch planning. |

### Agents (8)

| Primitive | Tier | Purpose |
|-----------|------|---------|
| **PRIMITIVE** | Free | Base agent. Foundation for all agent operations and primitive interactions. |
| **WRAITH** | $79 | Silent hunter. Operates autonomously to detect anomalies and hidden patterns. |
| **OBSIDIAN** | $129 | Deep analysis agent. Pattern correlation and knowledge fusion across disparate data. |
| **MONOLITH** | $159 | Heavy-lift agent. Processes large-scale operations and batch transformations. |
| **RAPTOR** | $249 | Apex predator agent. Top-tier execution with maximum intelligence and autonomy. |
| **DECODE** | — | Conversational agent. Natural language interface and context management. |
| **SENTINEL** | — | Watchdog agent. Continuous monitoring and anomaly alerting. |
| **ATLAS** | — | Topology agent. Capability discovery and health grid management. |

---

## CMPSBL CYBER™ (security.cmpsbl.com)

The cybersecurity vertical. All 24 spine primitives are inherited; 16 domain-specific Engines and Agents are hot-swapped. 80 S-Tier Crown Jewels (5 per expansion primitive).

### Cyber Engines (8)

#### WATCHTOWER
**Purpose:** Real-time threat detection and classification. Ingests telemetry, correlates IOCs, and assigns threat severity via behavioral heuristics.  
**Replaces:** CORTEX  
**Top Capabilities:** `ioc_correlation` · `threat_classification` · `behavioral_analysis` · `mitre_attack_mapping` · `real_time_alerting`  
**Top Crown Jewels:** IOC Correlation Engine · Threat Classifier · Behavioral Analyzer · Anomaly Scorer · Real-Time Alerting

#### SHADE
**Purpose:** Stealth operations for covert network reconnaissance and silent data exfiltration detection.  
**Replaces:** SHADOW  
**Top Capabilities:** `stealth_scanning` · `covert_channel_detection` · `data_exfiltration_monitoring` · `lateral_movement_tracking` · `silent_probe`  
**Top Crown Jewels:** Stealth Scanner · Covert Channel Detector · Exfiltration Monitor · Lateral Movement Tracker · Silent Probe

#### AEGIS
**Purpose:** Shield orchestration for DDoS mitigation, rate limiting, and adaptive traffic shaping.  
**Top Capabilities:** `ddos_mitigation` · `rate_limiting` · `traffic_shaping` · `geo_blocking` · `bot_detection`  
**Top Crown Jewels:** DDoS Mitigation Shield · Rate Limiter · Traffic Shaper · Geo-Blocker · Bot Detector

#### CIPHER
**Purpose:** Cryptographic operations — key lifecycle, certificate management, and encryption protocol enforcement.  
**Top Capabilities:** `key_rotation` · `certificate_management` · `encryption_enforcement` · `pki_orchestration` · `quantum_resistant_prep`  
**Top Crown Jewels:** Key Rotation Engine · Certificate Manager · Encryption Enforcer · PKI Orchestrator · Quantum-Resistant Prep

#### RECON
**Purpose:** Network reconnaissance — attack surface mapping, service fingerprinting, and vulnerability scanning.  
**Top Capabilities:** `attack_surface_mapping` · `port_enumeration` · `service_fingerprinting` · `vulnerability_scanning` · `exposure_scoring`  
**Top Crown Jewels:** Attack Surface Mapper · Port Enumerator · Service Fingerprinter · Vulnerability Scanner · Exposure Scorer

#### VANGUARD
**Purpose:** Incident response and digital forensics. Automates containment, evidence preservation, and root cause analysis.  
**Top Capabilities:** `incident_containment` · `evidence_preservation` · `root_cause_analysis` · `forensic_timeline` · `playbook_execution`  
**Top Crown Jewels:** Incident Containment Engine · Evidence Preserver · Root Cause Analyzer · Forensic Timeline Builder · Playbook Executor

#### BASTION
**Purpose:** Zero-trust perimeter enforcement. Micro-segmentation, least-privilege access, and continuous verification.  
**Top Capabilities:** `micro_segmentation` · `least_privilege_enforcement` · `continuous_verification` · `trust_scoring` · `zero_trust_policy`  
**Top Crown Jewels:** Micro-Segmentation Controller · Least-Privilege Enforcer · Continuous Verifier · Trust Scorer · Zero-Trust Policy Engine

#### TEMPEST
**Purpose:** Chaos engineering and penetration testing. Simulates attacks, stress-tests defenses, and validates resilience.  
**Top Capabilities:** `chaos_injection` · `penetration_simulation` · `resilience_validation` · `blast_radius_analysis` · `red_team_automation`  
**Top Crown Jewels:** Chaos Injector · Penetration Simulator · Resilience Validator · Blast Radius Analyzer · Red Team Automator

### Cyber Agents (8)

#### WRAITH
**Purpose:** Silent threat hunter. Detects advanced persistent threats (APTs) across network segments autonomously.  
**Top Capabilities:** `apt_detection` · `silent_monitoring` · `behavioral_profiling` · `threat_hunting` · `persistence_detection`

#### OBSIDIAN
**Purpose:** Deep analysis. Correlates disparate security events into unified attack narratives.  
**Top Capabilities:** `event_correlation` · `attack_narrative` · `pattern_fusion` · `kill_chain_mapping` · `indicator_enrichment`

#### SPECTER
**Purpose:** Deception agent. Deploys honeypots, canary tokens, and decoy infrastructure to lure attackers.  
**Top Capabilities:** `honeypot_deployment` · `canary_token_management` · `decoy_infrastructure` · `attacker_profiling` · `deception_orchestration`

#### BLACKOUT
**Purpose:** Emergency isolation. Kill-switch protocols to contain active breaches and sever compromised connections.  
**Top Capabilities:** `emergency_isolation` · `kill_switch` · `connection_severing` · `quarantine_enforcement` · `breach_containment`

#### TRACER
**Purpose:** Attack chain reconstruction. Traces lateral movement and reconstructs full attack timelines.  
**Top Capabilities:** `lateral_movement_trace` · `timeline_reconstruction` · `privilege_escalation_detection` · `credential_abuse_tracking` · `pivot_point_identification`

#### NOCTURNE
**Purpose:** Dark web intelligence and OSINT. Monitors underground forums, paste sites, and threat actor communications.  
**Top Capabilities:** `dark_web_monitoring` · `credential_leak_detection` · `threat_actor_tracking` · `brand_monitoring` · `osint_collection`

#### IRONCLAD
**Purpose:** Compliance enforcement. Validates security postures against SOC2, ISO 27001, NIST, and CIS benchmarks.  
**Top Capabilities:** `soc2_validation` · `iso27001_audit` · `nist_framework_check` · `cis_benchmark` · `compliance_reporting`

#### BULWARK
**Purpose:** Supply chain security. Audits dependencies, monitors for compromised packages, and validates SBOMs.  
**Top Capabilities:** `dependency_audit` · `sbom_generation` · `compromised_package_detection` · `license_compliance` · `typosquat_detection`

---

## CMPSBL ROBOTICS™ (robotics.cmpsbl.com)

The industrial automation and precision engineering vertical. 80 S-Tier Crown Jewels (5 per expansion primitive).

### Robotics Engines (8)

#### SERVO
**Purpose:** Motor control and actuator orchestration. Manages joint trajectories, torque profiles, PID tuning, and real-time servo loop execution.  
**Replaces:** CORTEX  
**Top Capabilities:** `pid_tuning` · `torque_profiling` · `joint_trajectory` · `servo_loop_execution` · `motor_diagnostics` · `haptic_feedback` · `force_control`

#### KINETIC
**Purpose:** Motion planning and trajectory optimization. Computes collision-free paths through configuration space with dynamic obstacle avoidance.  
**Replaces:** SHADOW  
**Top Capabilities:** `path_planning` · `trajectory_optimization` · `collision_avoidance` · `inverse_kinematics` · `dynamic_replanning`

#### LIDAR
**Purpose:** Spatial perception and 3D point cloud mapping. Processes LiDAR, stereo vision, and depth sensor data into real-time occupancy grids.  
**Top Capabilities:** `point_cloud_processing` · `occupancy_grid` · `slam_mapping` · `object_detection_3d` · `terrain_classification`

#### FABRICATOR
**Purpose:** Hardware fabrication and component lifecycle. Manages CAD-to-part pipelines, additive manufacturing, and predictive maintenance.  
**Top Capabilities:** `cad_pipeline` · `additive_manufacturing` · `predictive_maintenance` · `component_lifecycle` · `material_selection`

#### FLUX
**Purpose:** Power management and energy distribution. Optimizes battery discharge, manages regenerative braking, and enforces energy budgets.  
**Top Capabilities:** `battery_management` · `energy_distribution` · `regenerative_braking` · `power_budgeting` · `thermal_throttling`

#### VECTOR
**Purpose:** Navigation, pathfinding, and localization. Fuses GPS, IMU, wheel odometry, and visual landmarks for centimeter-accurate navigation.  
**Top Capabilities:** `gps_fusion` · `imu_integration` · `visual_odometry` · `waypoint_navigation` · `map_localization`

#### TENSOR
**Purpose:** Sensor fusion and multi-modal signal processing. Merges cameras, IMUs, force sensors, and encoders via Kalman filtering.  
**Top Capabilities:** `kalman_filtering` · `sensor_fusion` · `signal_conditioning` · `noise_reduction` · `state_estimation`

#### CALIBER
**Purpose:** Precision calibration and tolerance enforcement. Kinematic calibration, sensor alignment, and thermal drift compensation.  
**Top Capabilities:** `kinematic_calibration` · `sensor_alignment` · `thermal_compensation` · `backlash_correction` · `repeatability_analysis`

### Robotics Agents (8)

#### GRIPPER
**Purpose:** Manipulation and dexterous object handling. Plans grasp strategies and manages compliant contact with force feedback.  
**Top Capabilities:** `grasp_planning` · `force_feedback` · `compliant_contact` · `object_manipulation` · `dexterous_handling`

#### SWARM
**Purpose:** Multi-robot coordination and fleet management. Orchestrates task allocation, formation control, and collision-free path coordination.  
**Top Capabilities:** `fleet_coordination` · `task_allocation` · `formation_control` · `inter_robot_comms` · `load_balancing`

#### ENVIRON
**Purpose:** Environmental awareness and scene understanding. Builds semantic maps, tracks dynamic objects, and classifies workspace zones.  
**Top Capabilities:** `scene_understanding` · `dynamic_tracking` · `zone_classification` · `semantic_mapping` · `change_detection`

#### GUARDIAN
**Purpose:** Safety monitoring and collision avoidance. Enforces safety zones, monitors human proximity, and triggers protective stops (ISO 10218 / ISO/TS 15066).  
**Top Capabilities:** `safety_zone_enforcement` · `human_detection` · `protective_stop` · `collision_prediction` · `iso_compliance`

#### CONDUCTOR
**Purpose:** Task sequencing and workflow automation. Orchestrates multi-step robotic operations with dependency management and error recovery.  
**Top Capabilities:** `task_sequencing` · `dependency_management` · `error_recovery` · `workflow_orchestration` · `cycle_optimization`

#### WELDER
**Purpose:** Assembly operations and joining processes. Controls welding parameters, manages fastening sequences, and validates joint integrity.  
**Top Capabilities:** `weld_parameter_control` · `fastening_sequence` · `joint_integrity` · `process_monitoring` · `seam_tracking`

#### INSPECTOR
**Purpose:** Quality inspection and defect detection. Dimensional verification, surface analysis, and statistical process control.  
**Top Capabilities:** `dimensional_verification` · `surface_analysis` · `defect_detection` · `spc_monitoring` · `metrology`

#### PIONEER
**Purpose:** Autonomous exploration and frontier mapping. Discovers unknown environments and builds progressively detailed maps.  
**Top Capabilities:** `frontier_detection` · `exploration_planning` · `terrain_assessment` · `progressive_mapping` · `unknown_navigation`

---

## CMPSBL QUANTUM™ (quantum.cmpsbl.com)

The quantum physics software development vertical. 80 S-Tier Crown Jewels (5 per expansion primitive).

### Quantum Engines (8)

#### HADRON
**Purpose:** Particle simulation and collision modeling. Simulates high-energy particle interactions, tracks decay products, and computes scattering cross-sections via Monte Carlo.  
**Replaces:** CORTEX  
**Top Capabilities:** `particle_collision_sim` · `decay_chain_modeling` · `cross_section_computation` · `monte_carlo_integration` · `feynman_diagram_eval`

#### QUBIT
**Purpose:** Quantum gate orchestration and circuit design. Compiles quantum algorithms into optimized gate sequences with noise-aware transpilation.  
**Top Capabilities:** `gate_synthesis` · `circuit_optimization` · `qubit_allocation` · `noise_modeling` · `error_correction_codes`

#### PHOTON
**Purpose:** Optical computing and photonic signal processing. Models photon propagation, beam splitting, interferometry, and squeezed light generation.  
**Top Capabilities:** `interferometry_sim` · `beam_splitter_modeling` · `coherence_analysis` · `squeezed_state_gen` · `photon_counting`

#### FERMION
**Purpose:** Many-body quantum state evolution. Solves Schrödinger and Dirac equations for multi-fermion systems with Pauli exclusion enforcement.  
**Top Capabilities:** `wavefunction_evolution` · `pauli_exclusion` · `slater_determinant` · `density_matrix_calc` · `hartree_fock`

#### ENTANGLE
**Purpose:** Quantum entanglement management and Bell state preparation. Creates, verifies, and distributes entangled pairs for teleportation protocols.  
**Top Capabilities:** `bell_state_prep` · `entanglement_verification` · `quantum_teleportation` · `epr_pair_distribution` · `concurrence_measurement`

#### LATTICE
**Purpose:** Crystal structure simulation and phonon modeling. Computes band structures, phonon dispersion, and lattice dynamics for condensed matter physics.  
**Top Capabilities:** `band_structure_calc` · `phonon_dispersion` · `brillouin_zone_mapping` · `tight_binding_model` · `superconductor_pairing`

#### PLASMA
**Purpose:** Plasma dynamics and magneto-hydrodynamics. Models tokamak confinement, plasma instabilities, and fusion reaction kinetics.  
**Top Capabilities:** `mhd_simulation` · `tokamak_confinement` · `plasma_instability` · `fusion_kinetics` · `debye_shielding`

#### CRYOGEN
**Purpose:** Cryogenic system modeling and thermal noise reduction. Simulates dilution refrigerators, thermal budget management, and quantum decoherence mitigation.  
**Top Capabilities:** `thermal_noise_model` · `dilution_fridge_sim` · `decoherence_mitigation` · `cryostat_design` · `thermal_budget`

### Quantum Agents (8)

#### MUON
**Purpose:** Decay chain analysis and lepton tracking. Reconstructs particle decay trees, identifies muon signatures, and classifies lepton flavors.  
**Top Capabilities:** `decay_tree_reconstruction` · `lepton_classification` · `muon_tracking` · `lifetime_measurement` · `flavor_tagging`

#### BOSON
**Purpose:** Force carrier simulation and gauge field mapping. Models W/Z boson exchange, Higgs field coupling, and electroweak symmetry breaking.  
**Top Capabilities:** `gauge_field_mapping` · `higgs_coupling` · `electroweak_symmetry` · `boson_propagator` · `resonance_detection`

#### NEUTRINO
**Purpose:** Weak interaction modeling and oscillation prediction. Computes mass-mixing matrices, predicts flavor oscillations, and models weak decay channels.  
**Top Capabilities:** `flavor_oscillation` · `mass_mixing_matrix` · `weak_decay_modeling` · `cross_section_estimate` · `sterile_neutrino_search`

#### GLUON
**Purpose:** Strong force coupling and QCD color charge. Simulates gluon exchange, color confinement, asymptotic freedom, and parton distributions.  
**Top Capabilities:** `color_charge_sim` · `asymptotic_freedom` · `parton_distribution` · `gluon_splitting` · `confinement_modeling`

#### GRAVITON
**Purpose:** Gravitational wave detection and spacetime curvature. Models metric tensor perturbations, LIGO signal templates, and GR corrections.  
**Top Capabilities:** `grav_wave_template` · `metric_perturbation` · `geodesic_computation` · `frame_dragging` · `binary_merger_sim`

#### TACHYON
**Purpose:** Superluminal signal modeling and causality analysis. Explores theoretical FTL frameworks, tachyonic field instabilities, and Lorentz violation bounds.  
**Top Capabilities:** `ftl_framework_model` · `causality_analysis` · `lorentz_violation_bound` · `tachyonic_condensation` · `imaginary_mass_field`

#### MESON
**Purpose:** Quark confinement and hadronization processes. Models quark-antiquark bound states, fragmentation functions, and jet formation in QCD.  
**Top Capabilities:** `quark_confinement` · `hadronization` · `fragmentation_function` · `jet_formation` · `string_breaking`

#### PRISM
**Purpose:** Spectroscopy analysis and wavelength decomposition. Atomic emission line identification, Raman spectral analysis, and quantum transition mapping.  
**Top Capabilities:** `emission_line_id` · `raman_spectroscopy` · `transition_mapping` · `doppler_shift_calc` · `fine_structure_analysis`

---

## Summary

| Substrate | Spine (Inherited) | Engines | Agents | Total | S-Tier Crown Jewels |
|-----------|-------------------|---------|--------|-------|---------------------|
| **Core** (cmpsbl.com) | 24 | 8 | 8 | 40 | 80 |
| **CYBER™** (security) | 24 | 8 | 8 | 40 | 80 |
| **ROBOTICS™** (robotics) | 24 | 8 | 8 | 40 | 80 |
| **QUANTUM™** (quantum) | 24 | 8 | 8 | 40 | 80 |

Each vertical shares the same 24-primitive spine and swaps in its own 16 domain-specific expansion primitives. The architecture guarantees that every vertical always operates on exactly 40 primitives.

---

© 2025–2026 CMPSBL® · PromptFluid™ · All rights reserved.
