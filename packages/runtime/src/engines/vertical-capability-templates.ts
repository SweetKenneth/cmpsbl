/**
 * CMPSBL® Vertical Capability Templates — Tier 3
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Auto-generates runtime-attachable capability definitions
 * from vertical expansion primitive metadata.
 *
 * Each vertical primitive's capabilities[] array is decomposed
 * into registrable capability definitions with deterministic
 * engine classification and action chain assignment.
 *
 * © CMPSBL® — All rights reserved.
 */

import { registerCapability } from './capability-registry';
import type { OrchestrationAction, OrchestrationSignal } from './orchestration-engine';

// ═══════════════════════════════════════════════════════════════════
// §1 — CLASSIFICATION RULES
// ═══════════════════════════════════════════════════════════════════

type CapabilityArchetype = 'enforcement' | 'observation' | 'persistence' | 'resilience' | 'coordination';

/**
 * Keyword-based archetype classification for capability strings.
 * Determines the default action chain and signal assignment.
 */
function classifyCapabilityString(cap: string): CapabilityArchetype {
  const c = cap.toLowerCase();

  if (/block|gate|shield|enforc|sanitiz|validat|deny|firewall|quarantine|defense|protect|guard|secure|restrict|lock|reject|ban|censor|filter|moderate/
    .test(c)) return 'enforcement';

  if (/persist|store|snapshot|cache|memory|state|ledger|journal|archive|log|record|save|write|capture|retain/
    .test(c)) return 'persistence';

  if (/retry|circuit|timeout|heal|recover|degrade|failover|resilience|fallback|backoff|restart|repair|rollback/
    .test(c)) return 'resilience';

  if (/route|orchestrat|dispatch|coordinat|pipeline|schedule|compose|delegate|sequence|plan|assign|queue|priorit/
    .test(c)) return 'coordination';

  // Default: observation (detect, analyze, score, classify, monitor, etc.)
  return 'observation';
}

/** Map archetype to default action chain */
function archetypeToActions(archetype: CapabilityArchetype): readonly OrchestrationAction[] {
  switch (archetype) {
    case 'enforcement':
      return ['validate_input', 'block_execution'];
    case 'persistence':
      return ['persist_state'];
    case 'resilience':
      return ['trip_execution', 'log_only'];
    case 'coordination':
      return ['log_only'];
    case 'observation':
    default:
      return ['log_only'];
  }
}

/** Map archetype to default signal */
function archetypeToSignal(archetype: CapabilityArchetype): OrchestrationSignal {
  switch (archetype) {
    case 'enforcement':
      return 'execution_started';
    case 'persistence':
      return 'execution_succeeded';
    case 'resilience':
      return 'execution_failed';
    case 'coordination':
      return 'execution_started';
    case 'observation':
    default:
      return 'execution_succeeded';
  }
}

// ═══════════════════════════════════════════════════════════════════
// §2 — TEMPLATE DEFINITION
// ═══════════════════════════════════════════════════════════════════

export interface VerticalCapabilityTemplate {
  readonly slug: string;
  readonly description: string;
  readonly primitiveCategory: string;
  readonly vertical: string;
  readonly archetype: CapabilityArchetype;
  readonly defaultActions: readonly OrchestrationAction[];
  readonly defaultSignal: OrchestrationSignal;
  readonly enforces: boolean;
}

/**
 * Generate capability templates from a primitive's metadata.
 */
function generateTemplatesForPrimitive(
  primitiveName: string,
  vertical: string,
  capabilities: readonly string[],
): VerticalCapabilityTemplate[] {
  return capabilities.map(cap => {
    const archetype = classifyCapabilityString(cap);
    const slug = `${vertical}_${primitiveName}_${cap}`.toLowerCase();
    return {
      slug,
      description: `${cap.replace(/_/g, ' ')} — ${primitiveName} (${vertical})`,
      primitiveCategory: primitiveName,
      vertical,
      archetype,
      defaultActions: archetypeToActions(archetype),
      defaultSignal: archetypeToSignal(archetype),
      enforces: archetype === 'enforcement',
    };
  });
}

// ═══════════════════════════════════════════════════════════════════
// §3 — VERTICAL PRIMITIVE CATALOG
// ═══════════════════════════════════════════════════════════════════

/**
 * Complete catalog of vertical expansion primitives and their capabilities.
 * Sourced from the factory vertical files — kept in sync manually.
 * 8 verticals × 16 primitives each = 128 expansion primitives.
 */
const VERTICAL_CATALOG: Array<{
  vertical: string;
  primitive: string;
  capabilities: string[];
}> = [
  // ─── CYBERSECURITY ───
  { vertical: 'cyber', primitive: 'WATCHTOWER', capabilities: ['ioc_correlation', 'threat_classification', 'behavioral_analysis', 'anomaly_scoring', 'real_time_alerting', 'threat_intelligence_fusion', 'mitre_attack_mapping'] },
  { vertical: 'cyber', primitive: 'SHADE', capabilities: ['covert_reconnaissance', 'stealth_probing', 'traffic_camouflage', 'exfiltration_detection', 'deception_layer', 'signal_masking'] },
  { vertical: 'cyber', primitive: 'AEGIS', capabilities: ['shield_orchestration', 'ddos_mitigation', 'traffic_filtering', 'rate_limiting', 'geo_blocking', 'ip_reputation'] },
  { vertical: 'cyber', primitive: 'CIPHER', capabilities: ['encryption_orchestration', 'key_management', 'certificate_lifecycle', 'crypto_agility', 'hashing_verification', 'key_rotation'] },
  { vertical: 'cyber', primitive: 'RECON', capabilities: ['attack_surface_mapping', 'port_scanning', 'vulnerability_assessment', 'network_topology', 'service_fingerprinting', 'osint_collection'] },
  { vertical: 'cyber', primitive: 'VANGUARD', capabilities: ['incident_response', 'forensic_analysis', 'evidence_preservation', 'containment_execution', 'eradication_planning', 'recovery_orchestration'] },
  { vertical: 'cyber', primitive: 'BASTION', capabilities: ['zero_trust_enforcement', 'micro_segmentation', 'access_control', 'identity_verification', 'least_privilege', 'perimeter_hardening'] },
  { vertical: 'cyber', primitive: 'TEMPEST', capabilities: ['penetration_testing', 'chaos_injection', 'attack_simulation', 'red_team_automation', 'vulnerability_exploitation', 'security_regression'] },
  { vertical: 'cyber', primitive: 'PROWLER', capabilities: ['threat_hunting', 'silent_detection', 'behavioral_profiling', 'lateral_movement_detection', 'persistence_identification'] },
  { vertical: 'cyber', primitive: 'ONYX', capabilities: ['pattern_correlation', 'deep_analysis', 'threat_intelligence', 'indicator_enrichment', 'campaign_attribution'] },
  { vertical: 'cyber', primitive: 'SPECTER', capabilities: ['honeypot_orchestration', 'deception_deployment', 'attacker_profiling', 'trap_management', 'lure_generation'] },
  { vertical: 'cyber', primitive: 'BLACKOUT', capabilities: ['emergency_isolation', 'kill_switch', 'network_severance', 'containment_blast_radius', 'emergency_response'] },
  { vertical: 'cyber', primitive: 'TRACER', capabilities: ['attack_chain_reconstruction', 'timeline_correlation', 'evidence_linking', 'root_cause_analysis', 'impact_assessment'] },
  { vertical: 'cyber', primitive: 'NOCTURNE', capabilities: ['dark_web_monitoring', 'osint_analysis', 'credential_leak_detection', 'brand_monitoring', 'threat_actor_profiling'] },
  { vertical: 'cyber', primitive: 'IRONCLAD', capabilities: ['compliance_enforcement', 'soc2_validation', 'iso27001_mapping', 'nist_alignment', 'audit_readiness'] },
  { vertical: 'cyber', primitive: 'CITADEL', capabilities: ['supply_chain_audit', 'dependency_scanning', 'sbom_generation', 'license_compliance', 'vulnerability_tracking'] },

  // ─── ROBOTICS ───
  { vertical: 'robotics', primitive: 'SERVO', capabilities: ['pid_tuning', 'torque_profiling', 'joint_trajectory', 'servo_loop_execution', 'motor_diagnostics', 'haptic_feedback', 'force_control', 'commutation_sequencing'] },
  { vertical: 'robotics', primitive: 'KINETIC', capabilities: ['motion_planning', 'trajectory_optimization', 'inverse_kinematics', 'collision_avoidance', 'path_smoothing', 'jerk_minimization'] },
  { vertical: 'robotics', primitive: 'LIDAR', capabilities: ['point_cloud_mapping', 'obstacle_detection', 'slam_integration', 'depth_estimation', 'terrain_classification', 'object_segmentation'] },
  { vertical: 'robotics', primitive: 'FABRICATOR', capabilities: ['component_lifecycle', 'assembly_sequencing', 'material_tracking', 'quality_gate', 'tooling_management', 'additive_manufacturing'] },
  { vertical: 'robotics', primitive: 'FLUX', capabilities: ['power_management', 'energy_distribution', 'battery_optimization', 'regenerative_braking', 'thermal_management', 'power_budgeting'] },
  { vertical: 'robotics', primitive: 'VECTOR', capabilities: ['pathfinding', 'localization', 'map_building', 'waypoint_navigation', 'gps_integration', 'inertial_navigation'] },
  { vertical: 'robotics', primitive: 'TENSOR', capabilities: ['sensor_fusion', 'multi_modal_processing', 'signal_filtering', 'data_synchronization', 'feature_extraction', 'noise_reduction'] },
  { vertical: 'robotics', primitive: 'CALIBER', capabilities: ['precision_calibration', 'tolerance_enforcement', 'measurement_verification', 'drift_compensation', 'reference_alignment', 'repeatability_testing'] },
  { vertical: 'robotics', primitive: 'GRIPPER', capabilities: ['object_manipulation', 'grasp_planning', 'force_sensing', 'dexterous_handling', 'grip_adaptation'] },
  { vertical: 'robotics', primitive: 'SWARM', capabilities: ['fleet_coordination', 'consensus_protocol', 'task_allocation', 'formation_control', 'distributed_planning'] },
  { vertical: 'robotics', primitive: 'ENVIRON', capabilities: ['scene_understanding', 'environmental_mapping', 'hazard_detection', 'climate_monitoring', 'spatial_awareness'] },
  { vertical: 'robotics', primitive: 'MARSHAL', capabilities: ['collision_prevention', 'safety_monitoring', 'emergency_stop', 'zone_enforcement', 'human_detection'] },
  { vertical: 'robotics', primitive: 'DISPATCH', capabilities: ['task_sequencing', 'workflow_automation', 'priority_scheduling', 'resource_assignment', 'deadline_management'] },
  { vertical: 'robotics', primitive: 'WELDER', capabilities: ['weld_planning', 'seam_tracking', 'heat_control', 'joint_quality', 'parameter_optimization'] },
  { vertical: 'robotics', primitive: 'INSPECTOR', capabilities: ['defect_detection', 'quality_scoring', 'visual_inspection', 'dimensional_verification', 'surface_analysis'] },
  { vertical: 'robotics', primitive: 'PIONEER', capabilities: ['frontier_mapping', 'autonomous_exploration', 'coverage_planning', 'unknown_terrain_navigation', 'discovery_logging'] },

  // ─── QUANTUM ───
  { vertical: 'quantum', primitive: 'HADRON', capabilities: ['particle_collision_sim', 'decay_chain_modeling', 'cross_section_computation', 'monte_carlo_integration', 'event_reconstruction', 'jet_clustering', 'feynman_diagram_eval'] },
  { vertical: 'quantum', primitive: 'QUBIT', capabilities: ['gate_orchestration', 'circuit_design', 'qubit_allocation', 'noise_aware_transpilation', 'error_correction', 'surface_code_decoding'] },
  { vertical: 'quantum', primitive: 'PHOTON', capabilities: ['optical_computing', 'photonic_signal', 'waveguide_simulation', 'interference_modeling', 'quantum_optics', 'photon_counting'] },
  { vertical: 'quantum', primitive: 'FERMION', capabilities: ['many_body_evolution', 'wavefunction_collapse', 'density_matrix', 'quantum_state_tomography', 'entanglement_entropy'] },
  { vertical: 'quantum', primitive: 'ENTANGLE', capabilities: ['bell_state_preparation', 'entanglement_distribution', 'quantum_teleportation', 'decoherence_modeling', 'fidelity_estimation'] },
  { vertical: 'quantum', primitive: 'LATTICE', capabilities: ['crystal_simulation', 'phonon_modeling', 'band_structure', 'defect_engineering', 'lattice_qcd'] },
  { vertical: 'quantum', primitive: 'PLASMA', capabilities: ['plasma_dynamics', 'magnetohydrodynamics', 'tokamak_simulation', 'plasma_confinement', 'instability_analysis'] },
  { vertical: 'quantum', primitive: 'CRYOGEN', capabilities: ['cryogenic_modeling', 'thermal_noise_reduction', 'dilution_refrigeration', 'qubit_coherence', 'temperature_control'] },
  { vertical: 'quantum', primitive: 'MUON', capabilities: ['decay_analysis', 'lepton_tracking', 'lifetime_measurement', 'muon_tomography', 'cosmic_ray_detection'] },
  { vertical: 'quantum', primitive: 'BOSON', capabilities: ['gauge_field_mapping', 'force_carrier_sim', 'boson_sampling', 'higgs_coupling', 'weak_boson_decay'] },
  { vertical: 'quantum', primitive: 'NEUTRINO', capabilities: ['oscillation_prediction', 'weak_interaction', 'mass_hierarchy', 'neutrino_detection', 'flavor_mixing'] },
  { vertical: 'quantum', primitive: 'GLUON', capabilities: ['color_charge_sim', 'qcd_coupling', 'confinement_modeling', 'asymptotic_freedom', 'gluon_splitting'] },
  { vertical: 'quantum', primitive: 'GRAVITON', capabilities: ['gravitational_wave_detection', 'spacetime_curvature', 'tensor_perturbation', 'weak_field_limit', 'quantum_gravity'] },
  { vertical: 'quantum', primitive: 'TACHYON', capabilities: ['superluminal_modeling', 'causality_analysis', 'tachyon_condensation', 'imaginary_mass', 'field_instability'] },
  { vertical: 'quantum', primitive: 'MESON', capabilities: ['quark_confinement', 'hadronization', 'pion_dynamics', 'kaon_oscillation', 'meson_spectroscopy'] },
  { vertical: 'quantum', primitive: 'PRISM', capabilities: ['spectroscopy_analysis', 'wavelength_decomposition', 'emission_spectrum', 'absorption_mapping', 'line_identification'] },

  // ─── LLM ───
  { vertical: 'llm', primitive: 'VERITAS', capabilities: ['hallucination_detection', 'factual_grounding', 'multi_source_verification', 'claim_extraction', 'confidence_calibration', 'citation_verification'] },
  { vertical: 'llm', primitive: 'RAMPART', capabilities: ['prompt_injection_defense', 'input_sanitization', 'jailbreak_detection', 'payload_inspection', 'adversarial_filtering', 'context_boundary'] },
  { vertical: 'llm', primitive: 'SYLLOGISM', capabilities: ['reasoning_chain_validation', 'logic_integrity', 'argument_structure', 'fallacy_detection', 'deduction_verification'] },
  { vertical: 'llm', primitive: 'LEXICON', capabilities: ['tokenizer_security', 'data_poisoning_detection', 'embedding_integrity', 'vocabulary_auditing', 'token_boundary_check'] },
  { vertical: 'llm', primitive: 'CLARITY', capabilities: ['explainability', 'attribution_mapping', 'decision_transparency', 'feature_importance', 'reasoning_trace'] },
  { vertical: 'llm', primitive: 'FULCRUM', capabilities: ['bias_detection', 'fairness_calibration', 'demographic_parity', 'equalized_odds', 'disparate_impact'] },
  { vertical: 'llm', primitive: 'TETHER', capabilities: ['context_coherence', 'memory_boundary', 'conversation_state', 'context_window_management', 'temporal_fact_verification'] },
  { vertical: 'llm', primitive: 'SIEVE', capabilities: ['output_sanitization', 'safety_filtering', 'content_classification', 'harmful_content_detection', 'pii_redaction'] },
  { vertical: 'llm', primitive: 'SKEPTIC', capabilities: ['adversarial_fact_checking', 'claim_challenging', 'source_verification', 'contradiction_detection', 'confidence_scoring'] },
  { vertical: 'llm', primitive: 'TRIBUNAL', capabilities: ['output_consistency', 'cross_model_arbitration', 'ensemble_arbitration', 'response_ranking', 'quality_scoring'] },
  { vertical: 'llm', primitive: 'HERALD', capabilities: ['alignment_drift_monitoring', 'behavioral_shift_detection', 'metric_tracking', 'trend_alerting', 'regression_detection'] },
  { vertical: 'llm', primitive: 'MIMIC', capabilities: ['sycophancy_detection', 'authenticity_enforcement', 'response_independence', 'style_consistency', 'persona_stability'] },
  { vertical: 'llm', primitive: 'LINEAGE', capabilities: ['data_provenance', 'training_data_audit', 'attribution_chain', 'dataset_fingerprinting', 'contamination_detection'] },
  { vertical: 'llm', primitive: 'EMBARGO', capabilities: ['information_leakage_prevention', 'data_boundary_enforcement', 'exfiltration_detection', 'secret_detection', 'output_gating'] },
  { vertical: 'llm', primitive: 'GAUNTLET', capabilities: ['adversarial_stress_testing', 'jailbreak_fuzzing', 'robustness_evaluation', 'edge_case_generation', 'safety_benchmarking'] },
  { vertical: 'llm', primitive: 'CUSTODIAN', capabilities: ['model_supply_chain', 'dependency_audit', 'weight_integrity', 'checkpoint_verification', 'license_compliance'] },

  // ─── AGENCY ───
  { vertical: 'agency', primitive: 'MANDATE', capabilities: ['mission_decomposition', 'task_dependency_graphing', 'priority_scoring', 'deadline_scheduling', 'objective_alignment', 'milestone_tracking', 'autonomous_replanning'] },
  { vertical: 'agency', primitive: 'DELEGATE', capabilities: ['skill_based_routing', 'workload_distribution', 'capacity_balancing', 'specialization_matching', 'dynamic_reassignment'] },
  { vertical: 'agency', primitive: 'UPLINK', capabilities: ['inter_agent_communication', 'knowledge_sharing', 'broadcast_messaging', 'selective_routing', 'protocol_negotiation'] },
  { vertical: 'agency', primitive: 'SCRIBE', capabilities: ['content_generation', 'document_drafting', 'template_rendering', 'format_conversion', 'editorial_quality'] },
  { vertical: 'agency', primitive: 'INCENTIVE', capabilities: ['reward_programs', 'reinforcement_loops', 'skill_progression', 'performance_scoring', 'gamification'] },
  { vertical: 'agency', primitive: 'REASON', capabilities: ['chain_of_thought', 'decision_making', 'hypothesis_generation', 'evidence_weighing', 'conclusion_validation'] },
  { vertical: 'agency', primitive: 'TOOLKIT', capabilities: ['tool_orchestration', 'api_integration', 'capability_discovery', 'tool_selection', 'execution_sandboxing'] },
  { vertical: 'agency', primitive: 'OPERATOR', capabilities: ['autonomous_execution', 'mission_completion', 'error_recovery', 'progress_reporting', 'self_monitoring'] },
  { vertical: 'agency', primitive: 'OVERSEER', capabilities: ['agent_health_monitoring', 'self_healing', 'graceful_degradation', 'performance_tracking', 'anomaly_alerting'] },
  { vertical: 'agency', primitive: 'LIAISON', capabilities: ['conflict_resolution', 'team_coordination', 'consensus_building', 'role_negotiation', 'collaboration_protocol'] },
  { vertical: 'agency', primitive: 'SCHOLAR', capabilities: ['skill_acquisition', 'knowledge_distillation', 'curriculum_learning', 'transfer_learning', 'competency_evaluation'] },
  { vertical: 'agency', primitive: 'ENVOY', capabilities: ['user_communication', 'progress_reporting', 'status_updates', 'feedback_collection', 'clarity_enforcement'] },
  { vertical: 'agency', primitive: 'WARDEN', capabilities: ['governance_enforcement', 'safety_boundary', 'policy_compliance', 'escalation_management', 'rollback_recovery'] },
  { vertical: 'agency', primitive: 'ROGUE', capabilities: ['creative_problem_solving', 'unconventional_approach', 'lateral_thinking', 'constraint_breaking', 'novel_synthesis'] },
  { vertical: 'agency', primitive: 'ANCHOR', capabilities: ['context_persistence', 'long_term_memory', 'session_continuity', 'reference_management', 'knowledge_indexing'] },

  // ─── MEDIA ───
  { vertical: 'media', primitive: 'CANVAS', capabilities: ['image_generation', 'style_transfer', 'thumbnail_synthesis', 'graphic_layout', 'photo_manipulation', 'brand_visual_enforcement', 'batch_image_processing'] },
  { vertical: 'media', primitive: 'SCORE', capabilities: ['music_composition', 'audio_synthesis', 'sound_design', 'melody_generation', 'beat_matching', 'mixing_mastering'] },
  { vertical: 'media', primitive: 'REEL', capabilities: ['video_generation', 'editing_pipeline', 'motion_graphics', 'transition_design', 'timeline_management', 'format_encoding'] },
  { vertical: 'media', primitive: 'COPY', capabilities: ['copywriting', 'ad_text_generation', 'persuasive_content', 'headline_optimization', 'cta_generation', 'brand_voice'] },
  { vertical: 'media', primitive: 'CAMPAIGN', capabilities: ['multi_channel_orchestration', 'campaign_scheduling', 'audience_targeting', 'budget_allocation', 'performance_tracking', 'ab_testing'] },
  { vertical: 'media', primitive: 'FEED', capabilities: ['social_scheduling', 'posting_automation', 'engagement_tracking', 'platform_optimization', 'hashtag_strategy', 'trend_surfing'] },
  { vertical: 'media', primitive: 'PALETTE', capabilities: ['brand_identity', 'style_guide', 'design_tokens', 'color_harmony', 'typography_management', 'visual_consistency'] },
  { vertical: 'media', primitive: 'RENDER', capabilities: ['real_time_rendering', 'transcoding', 'format_conversion', 'quality_optimization', 'batch_rendering', 'gpu_acceleration'] },
  { vertical: 'media', primitive: 'CURATOR', capabilities: ['content_curation', 'trend_detection', 'editorial_strategy', 'topic_clustering', 'relevance_scoring'] },
  { vertical: 'media', primitive: 'CRITIC', capabilities: ['quality_scoring', 'variant_evaluation', 'creative_feedback', 'aesthetic_analysis', 'engagement_prediction'] },
  { vertical: 'media', primitive: 'AMPLIFY', capabilities: ['distribution_optimization', 'seo_enhancement', 'reach_maximization', 'viral_coefficient', 'cross_promotion'] },
  { vertical: 'media', primitive: 'PERSONA', capabilities: ['audience_segmentation', 'persona_modeling', 'targeting_optimization', 'demographic_analysis', 'behavioral_clustering'] },
  { vertical: 'media', primitive: 'STORYARC', capabilities: ['narrative_structure', 'content_calendar', 'storyline_coherence', 'arc_planning', 'episodic_continuity'] },
  { vertical: 'media', primitive: 'MUSE', capabilities: ['creative_inspiration', 'prompt_engineering', 'ideation_generation', 'brainstorming', 'concept_synthesis'] },
  { vertical: 'media', primitive: 'COMPLY', capabilities: ['content_moderation', 'copyright_check', 'platform_compliance', 'age_gating', 'regulatory_adherence'] },
  { vertical: 'media', primitive: 'METRIC', capabilities: ['analytics_collection', 'attribution_modeling', 'roi_measurement', 'conversion_tracking', 'funnel_analysis'] },

  // ─── FINTECH ───
  { vertical: 'fintech', primitive: 'LEDGER', capabilities: ['double_entry_accounting', 'multi_currency_support', 'trial_balance_generation', 'journal_immutability', 'reconciliation_engine', 'accrual_recognition', 'intercompany_elimination'] },
  { vertical: 'fintech', primitive: 'VAULT_FIN', capabilities: ['key_hierarchy_management', 'multisig_authorization', 'cold_hot_segregation', 'asset_tokenization', 'custody_attestation', 'withdrawal_governance'] },
  { vertical: 'fintech', primitive: 'TICKER', capabilities: ['market_data_ingestion', 'price_normalization', 'ohlcv_aggregation', 'orderbook_reconstruction', 'latency_optimization'] },
  { vertical: 'fintech', primitive: 'CLEARING', capabilities: ['trade_settlement', 'netting_optimization', 'margin_calculation', 'collateral_management', 'settlement_finality'] },
  { vertical: 'fintech', primitive: 'RISKCORE', capabilities: ['risk_modeling', 'var_calculation', 'stress_testing', 'scenario_analysis', 'exposure_aggregation'] },
  { vertical: 'fintech', primitive: 'PAYRAIL', capabilities: ['payment_processing', 'transaction_routing', 'fee_calculation', 'disbursement', 'refund_management'] },
  { vertical: 'fintech', primitive: 'REGULATOR', capabilities: ['regulatory_reporting', 'aml_screening', 'kyc_verification', 'sanctions_checking', 'compliance_filing'] },
  { vertical: 'fintech', primitive: 'MATCHBOOK', capabilities: ['order_matching', 'price_discovery', 'auction_mechanism', 'liquidity_aggregation', 'market_making'] },
  { vertical: 'fintech', primitive: 'SENTINEL_FIN', capabilities: ['fraud_detection', 'transaction_monitoring', 'risk_scoring', 'pattern_recognition', 'alert_generation'] },
  { vertical: 'fintech', primitive: 'UNDERWRITER', capabilities: ['risk_assessment', 'credit_scoring', 'pricing_model', 'portfolio_analysis', 'loss_projection'] },
  { vertical: 'fintech', primitive: 'PORTFOLIO', capabilities: ['portfolio_optimization', 'asset_allocation', 'rebalancing', 'performance_attribution', 'benchmark_tracking'] },
  { vertical: 'fintech', primitive: 'AUDITOR_FIN', capabilities: ['financial_audit', 'variance_analysis', 'internal_controls', 'sampling_methodology', 'audit_trail'] },
  { vertical: 'fintech', primitive: 'RECONCILER', capabilities: ['account_reconciliation', 'break_detection', 'auto_matching', 'exception_handling', 'aging_analysis'] },
  { vertical: 'fintech', primitive: 'COMPLIANCE_FIN', capabilities: ['regulatory_compliance', 'policy_enforcement', 'risk_appetite', 'control_testing', 'remediation_tracking'] },
  { vertical: 'fintech', primitive: 'LIQUIDATOR', capabilities: ['position_liquidation', 'forced_settlement', 'auction_execution', 'loss_waterfall', 'recovery_optimization'] },
  { vertical: 'fintech', primitive: 'TREASURY', capabilities: ['cash_management', 'liquidity_forecasting', 'funding_optimization', 'counterparty_management', 'yield_optimization'] },

  // ─── ULTIMATE (gap-fillers) ───
  { vertical: 'ultimate', primitive: 'APEX', capabilities: ['hot_path_detection', 'algorithmic_complexity_analysis', 'memory_allocation_profiling', 'cache_optimization', 'bottleneck_identification'] },
  { vertical: 'ultimate', primitive: 'CONDUIT', capabilities: ['data_pipeline_orchestration', 'stream_processing', 'back_pressure_management', 'fan_out_distribution', 'batch_aggregation'] },
  { vertical: 'ultimate', primitive: 'PRISM_ULT', capabilities: ['multi_paradigm_analysis', 'code_quality_scoring', 'pattern_extraction', 'complexity_mapping', 'architecture_inference'] },
  { vertical: 'ultimate', primitive: 'GENESIS_ULT', capabilities: ['project_scaffolding', 'boilerplate_detection', 'architecture_seeding', 'template_generation', 'convention_enforcement'] },
  { vertical: 'ultimate', primitive: 'FLUX_ULT', capabilities: ['state_pattern_detection', 'reactive_flow_analysis', 'data_flow_mapping', 'mutation_tracking', 'store_architecture'] },
  { vertical: 'ultimate', primitive: 'CRUCIBLE', capabilities: ['load_testing', 'stress_analysis', 'bottleneck_identification', 'performance_profiling', 'regression_detection'] },
  { vertical: 'ultimate', primitive: 'MERIDIAN', capabilities: ['api_design_validation', 'contract_verification', 'interface_governance', 'schema_evolution', 'backward_compatibility'] },
  { vertical: 'ultimate', primitive: 'DYNAMO', capabilities: ['concurrency_analysis', 'async_orchestration', 'parallelism_detection', 'deadlock_prevention', 'race_condition_check'] },
  { vertical: 'ultimate', primitive: 'SENTINEL_ULT', capabilities: ['universal_input_validation', 'boundary_enforcement', 'type_checking', 'constraint_verification', 'invariant_enforcement'] },
  { vertical: 'ultimate', primitive: 'CATALYST', capabilities: ['dependency_optimization', 'dead_code_elimination', 'tree_shaking_analysis', 'bundle_analysis', 'import_graph'] },
  { vertical: 'ultimate', primitive: 'ARBITER', capabilities: ['error_strategy_analysis', 'recovery_pattern_detection', 'exception_hierarchy', 'fallback_evaluation', 'error_boundary'] },
  { vertical: 'ultimate', primitive: 'HERALD_ULT', capabilities: ['logging_pattern_detection', 'observability_scoring', 'telemetry_coverage', 'trace_completeness', 'metric_extraction'] },
  { vertical: 'ultimate', primitive: 'NOMAD', capabilities: ['cross_platform_analysis', 'portability_scoring', 'platform_abstraction', 'compatibility_matrix', 'runtime_detection'] },
  { vertical: 'ultimate', primitive: 'WELDER_ULT', capabilities: ['integration_pattern_detection', 'protocol_analysis', 'api_client_scoring', 'webhook_evaluation', 'event_sourcing'] },
  { vertical: 'ultimate', primitive: 'ORACLE_ULT', capabilities: ['config_management', 'feature_flag_governance', 'environment_detection', 'secret_management', 'runtime_configuration'] },
  { vertical: 'ultimate', primitive: 'PHOENIX', capabilities: ['migration_pattern_detection', 'version_upgrade_path', 'breaking_change_detection', 'deprecation_management', 'backward_compat'] },
];

// ═══════════════════════════════════════════════════════════════════
// §4 — TEMPLATE GENERATION AND REGISTRATION
// ═══════════════════════════════════════════════════════════════════

let _templates: VerticalCapabilityTemplate[] | null = null;

/**
 * Build all vertical capability templates from the catalog.
 * Cached after first call.
 */
export function buildVerticalTemplates(): VerticalCapabilityTemplate[] {
  if (_templates) return _templates;

  const result: VerticalCapabilityTemplate[] = [];
  for (const entry of VERTICAL_CATALOG) {
    result.push(...generateTemplatesForPrimitive(
      entry.primitive,
      entry.vertical,
      entry.capabilities,
    ));
  }
  _templates = result;
  return result;
}

/**
 * Register all vertical capability templates into the runtime capability registry.
 * Idempotent — safe to call multiple times.
 * Returns the count of newly registered capabilities.
 */
export function seedVerticalCapabilities(): number {
  const templates = buildVerticalTemplates();
  let registered = 0;

  for (const t of templates) {
    const isNew = registerCapability({
      slug: t.slug,
      description: t.description,
      primitiveCategory: t.primitiveCategory,
      defaultActions: [...t.defaultActions],
      defaultSignal: t.defaultSignal,
      enforces: t.enforces,
    });
    if (isNew) registered++;
  }
  return registered;
}

/** Get templates for a specific vertical */
export function getVerticalTemplates(vertical: string): VerticalCapabilityTemplate[] {
  return buildVerticalTemplates().filter(t => t.vertical === vertical);
}

/** Get template count per vertical */
export function getVerticalTemplateCounts(): Record<string, number> {
  const templates = buildVerticalTemplates();
  const counts: Record<string, number> = {};
  for (const t of templates) {
    counts[t.vertical] = (counts[t.vertical] ?? 0) + 1;
  }
  return counts;
}

/** Get total template count */
export function getTotalTemplateCount(): number {
  return buildVerticalTemplates().length;
}

/** Reset cache (for testing) */
export function resetVerticalTemplates(): void {
  _templates = null;
}
