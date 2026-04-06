/**
 * CMPSBL® Genre → Vertical Spec Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Converts a human-readable genre string (e.g. "Health", "Legal")
 * into a fully populated VerticalFactoryInput with 8 engines + 8 agents,
 * capabilities, CLM curriculum, and CJPI weights.
 *
 * Uses domain-knowledge templates for known genres and falls back
 * to a universal derivation engine for unknown genres.
 *
 * © CMPSBL® — All rights reserved.
 */

import type {
  VerticalFactoryInput,
  VerticalEngineSpec,
  VerticalAgentSpec,
} from './vertical-factory-engine';
import type { SpecialtyDomain } from './specialty-substrates';

/* ─────────────────────────────────────────────────
   GENRE TEMPLATES
   Known genres with domain-specific primitives
   ───────────────────────────────────────────────── */

interface GenreTemplate {
  domain: SpecialtyDomain;
  engines: Array<{ id: string; name: string; description: string; capabilities: string[]; classification: 'active' | 'passive' | 'hybrid' }>;
  agents: Array<{ id: string; name: string; description: string; capabilities: string[]; classification: 'active' | 'passive' | 'hybrid' }>;
  clmCurriculum: string[];
  memoryStreamFocus: string[];
  ascensionArchetypes: string[];
  cjpiWeights: { security: number; performance: number; reliability: number; maintainability: number };
  accentColor: string;
  iconName: string;
}

const GENRE_TEMPLATES: Record<string, GenreTemplate> = {
  health: {
    domain: 'security' as SpecialtyDomain,
    engines: [
      { id: 'VITALS', name: 'Vitals Engine', description: 'Real-time patient vitals monitoring and anomaly detection.', capabilities: ['vitals_monitoring', 'anomaly_detection', 'threshold_alerting', 'waveform_analysis'], classification: 'active' },
      { id: 'DIAGNOSE', name: 'Diagnose Engine', description: 'Differential diagnosis generation from symptom matrices.', capabilities: ['symptom_analysis', 'differential_diagnosis', 'clinical_reasoning', 'evidence_correlation'], classification: 'active' },
      { id: 'PHARMA', name: 'Pharma Engine', description: 'Drug interaction checking and formulary management.', capabilities: ['drug_interaction', 'formulary_check', 'dosage_optimization', 'contraindication_scan'], classification: 'hybrid' },
      { id: 'GENOME', name: 'Genome Engine', description: 'Genomic data processing and variant interpretation.', capabilities: ['variant_calling', 'genome_assembly', 'phenotype_mapping', 'population_genetics'], classification: 'passive' },
      { id: 'TRIAGE', name: 'Triage Engine', description: 'Patient priority scoring and resource allocation.', capabilities: ['severity_scoring', 'resource_allocation', 'queue_optimization', 'escalation_protocol'], classification: 'active' },
      { id: 'IMAGING', name: 'Imaging Engine', description: 'Medical imaging analysis and report generation.', capabilities: ['image_segmentation', 'abnormality_detection', 'radiology_report', 'volumetric_analysis'], classification: 'hybrid' },
      { id: 'PATHWAY', name: 'Pathway Engine', description: 'Clinical pathway optimization and adherence tracking.', capabilities: ['pathway_modeling', 'adherence_tracking', 'outcome_prediction', 'protocol_compliance'], classification: 'passive' },
      { id: 'BIOMARK', name: 'Biomarker Engine', description: 'Biomarker identification and longitudinal tracking.', capabilities: ['biomarker_discovery', 'longitudinal_tracking', 'reference_ranging', 'trend_analysis'], classification: 'hybrid' },
    ],
    agents: [
      { id: 'HIPAA', name: 'HIPAA Agent', description: 'HIPAA compliance enforcement and PHI protection.', capabilities: ['phi_detection', 'access_control', 'audit_trail', 'breach_response'], classification: 'active' },
      { id: 'CONSENT', name: 'Consent Agent', description: 'Patient consent management and authorization workflow.', capabilities: ['consent_capture', 'authorization_workflow', 'revocation_handling', 'preference_sync'], classification: 'active' },
      { id: 'INTEROP', name: 'Interop Agent', description: 'HL7 FHIR interoperability and data exchange.', capabilities: ['fhir_mapping', 'hl7_translation', 'cda_generation', 'resource_bundling'], classification: 'hybrid' },
      { id: 'EPIDEM', name: 'Epidemiology Agent', description: 'Epidemiological surveillance and outbreak detection.', capabilities: ['outbreak_detection', 'contact_tracing', 'incidence_modeling', 'syndromic_surveillance'], classification: 'passive' },
      { id: 'CLINICAL', name: 'Clinical Agent', description: 'Clinical trial matching and evidence synthesis.', capabilities: ['trial_matching', 'evidence_grading', 'protocol_design', 'cohort_selection'], classification: 'hybrid' },
      { id: 'WELLNESS', name: 'Wellness Agent', description: 'Wellness scoring and preventive care recommendations.', capabilities: ['wellness_scoring', 'preventive_care', 'lifestyle_analysis', 'risk_stratification'], classification: 'passive' },
      { id: 'RECORDS', name: 'Records Agent', description: 'Electronic health record management and reconciliation.', capabilities: ['record_reconciliation', 'deduplication', 'history_assembly', 'provenance_tracking'], classification: 'active' },
      { id: 'COMPLY', name: 'Compliance Agent', description: 'Healthcare regulatory compliance and quality reporting.', capabilities: ['quality_reporting', 'regulatory_audit', 'cms_compliance', 'accreditation_tracking'], classification: 'active' },
    ],
    clmCurriculum: ['HIPAA compliance', 'Clinical decision support', 'Medical imaging', 'Drug interactions', 'Genomics', 'Health interoperability', 'Epidemiology'],
    memoryStreamFocus: ['patient safety', 'clinical accuracy', 'compliance adherence', 'diagnostic precision'],
    ascensionArchetypes: ['Clinical Intelligence', 'Patient Safety', 'Regulatory Compliance', 'Precision Medicine'],
    cjpiWeights: { security: 0.35, performance: 0.20, reliability: 0.30, maintainability: 0.15 },
    accentColor: '142 70% 45%',
    iconName: 'HeartPulse',
  },
  legal: {
    domain: 'security' as SpecialtyDomain,
    engines: [
      { id: 'STATUTE', name: 'Statute Engine', description: 'Statutory analysis and legislative tracking.', capabilities: ['statute_parsing', 'legislative_tracking', 'amendment_analysis', 'jurisdiction_mapping'], classification: 'passive' },
      { id: 'CONTRACT', name: 'Contract Engine', description: 'Contract analysis, clause extraction, and risk scoring.', capabilities: ['clause_extraction', 'risk_scoring', 'obligation_tracking', 'term_comparison'], classification: 'active' },
      { id: 'LITIGATE', name: 'Litigation Engine', description: 'Case strategy analysis and outcome prediction.', capabilities: ['case_analysis', 'outcome_prediction', 'precedent_matching', 'timeline_construction'], classification: 'hybrid' },
      { id: 'PATENT', name: 'Patent Engine', description: 'Patent landscape analysis and prior art search.', capabilities: ['prior_art_search', 'claim_analysis', 'landscape_mapping', 'freedom_to_operate'], classification: 'passive' },
      { id: 'COMPLY_L', name: 'Compliance Engine', description: 'Regulatory compliance monitoring and gap analysis.', capabilities: ['compliance_monitoring', 'gap_analysis', 'policy_enforcement', 'regulatory_change'], classification: 'active' },
      { id: 'DISCOVER', name: 'Discovery Engine', description: 'E-discovery, document review, and privilege detection.', capabilities: ['document_review', 'privilege_detection', 'relevance_scoring', 'production_set'], classification: 'active' },
      { id: 'DOCKET', name: 'Docket Engine', description: 'Court docket management and deadline tracking.', capabilities: ['deadline_tracking', 'filing_management', 'calendar_sync', 'jurisdictional_rules'], classification: 'hybrid' },
      { id: 'REGULATE', name: 'Regulatory Engine', description: 'Multi-jurisdictional regulatory intelligence.', capabilities: ['regulatory_intelligence', 'jurisdiction_comparison', 'enforcement_tracking', 'rulemaking_analysis'], classification: 'passive' },
    ],
    agents: [
      { id: 'PRIVILEGE', name: 'Privilege Agent', description: 'Attorney-client privilege protection and waiver detection.', capabilities: ['privilege_tagging', 'waiver_detection', 'claw_back', 'privilege_log'], classification: 'active' },
      { id: 'CITE', name: 'Citation Agent', description: 'Legal citation verification and Shepardizing.', capabilities: ['citation_validation', 'shepardizing', 'authority_ranking', 'treatise_linking'], classification: 'passive' },
      { id: 'REDACT', name: 'Redaction Agent', description: 'Automated PII redaction and confidentiality enforcement.', capabilities: ['pii_redaction', 'confidentiality_mark', 'selective_disclosure', 'redaction_log'], classification: 'active' },
      { id: 'BRIEF', name: 'Brief Agent', description: 'Legal brief drafting assistance and argument structuring.', capabilities: ['argument_structuring', 'brief_drafting', 'issue_spotting', 'counterargument_analysis'], classification: 'hybrid' },
      { id: 'JURIS', name: 'Jurisdiction Agent', description: 'Jurisdictional analysis and conflict-of-law resolution.', capabilities: ['jurisdiction_analysis', 'conflict_resolution', 'venue_selection', 'choice_of_law'], classification: 'passive' },
      { id: 'WITNESS', name: 'Witness Agent', description: 'Witness preparation and deposition analysis.', capabilities: ['deposition_analysis', 'testimony_tracking', 'credibility_scoring', 'impeachment_detection'], classification: 'hybrid' },
      { id: 'ETHICS', name: 'Ethics Agent', description: 'Legal ethics compliance and conflict-of-interest detection.', capabilities: ['conflict_check', 'ethics_screening', 'duty_monitoring', 'bar_compliance'], classification: 'active' },
      { id: 'VERDICT', name: 'Verdict Agent', description: 'Verdict analysis and damages estimation.', capabilities: ['verdict_analysis', 'damages_estimation', 'settlement_modeling', 'jury_analytics'], classification: 'hybrid' },
    ],
    clmCurriculum: ['Contract law', 'Litigation strategy', 'E-discovery', 'Patent prosecution', 'Regulatory compliance', 'Legal ethics', 'Jurisdictional analysis'],
    memoryStreamFocus: ['precedent accuracy', 'compliance coverage', 'privilege protection', 'citation validity'],
    ascensionArchetypes: ['Legal Intelligence', 'Compliance Automation', 'Discovery Optimization', 'Risk Assessment'],
    cjpiWeights: { security: 0.30, performance: 0.15, reliability: 0.35, maintainability: 0.20 },
    accentColor: '220 60% 50%',
    iconName: 'Scale',
  },
  fintech: {
    domain: 'security' as SpecialtyDomain,
    engines: [
      { id: 'LEDGER', name: 'Ledger Engine', description: 'Immutable transaction ledger and reconciliation.', capabilities: ['transaction_recording', 'reconciliation', 'double_entry', 'audit_trail'], classification: 'active' },
      { id: 'RISK', name: 'Risk Engine', description: 'Financial risk modeling and exposure analysis.', capabilities: ['risk_modeling', 'exposure_analysis', 'var_calculation', 'stress_testing'], classification: 'active' },
      { id: 'FRAUD', name: 'Fraud Engine', description: 'Real-time fraud detection and pattern recognition.', capabilities: ['fraud_detection', 'pattern_recognition', 'anomaly_scoring', 'velocity_checking'], classification: 'active' },
      { id: 'COMPLY_F', name: 'Compliance Engine', description: 'Financial regulatory compliance (KYC/AML/SOX).', capabilities: ['kyc_verification', 'aml_screening', 'sox_compliance', 'regulatory_reporting'], classification: 'hybrid' },
      { id: 'MARKET', name: 'Market Engine', description: 'Market data processing and signal generation.', capabilities: ['market_data', 'signal_generation', 'order_routing', 'price_discovery'], classification: 'active' },
      { id: 'SETTLE', name: 'Settlement Engine', description: 'Trade settlement and clearing operations.', capabilities: ['trade_settlement', 'netting', 'collateral_management', 'dvp_processing'], classification: 'hybrid' },
      { id: 'CREDIT', name: 'Credit Engine', description: 'Credit scoring and underwriting intelligence.', capabilities: ['credit_scoring', 'underwriting', 'default_prediction', 'portfolio_analysis'], classification: 'passive' },
      { id: 'TREASURY', name: 'Treasury Engine', description: 'Cash management and liquidity optimization.', capabilities: ['cash_management', 'liquidity_forecasting', 'fx_hedging', 'yield_optimization'], classification: 'hybrid' },
    ],
    agents: [
      { id: 'KYC', name: 'KYC Agent', description: 'Customer identity verification and due diligence.', capabilities: ['identity_verification', 'document_validation', 'sanction_screening', 'pep_detection'], classification: 'active' },
      { id: 'AUDIT_F', name: 'Audit Agent', description: 'Financial audit trail and SOC compliance.', capabilities: ['audit_trail', 'soc_compliance', 'control_testing', 'exception_reporting'], classification: 'active' },
      { id: 'TAX', name: 'Tax Agent', description: 'Tax calculation, reporting, and jurisdiction handling.', capabilities: ['tax_calculation', 'jurisdiction_handling', 'withholding', 'form_generation'], classification: 'hybrid' },
      { id: 'PAYMENT', name: 'Payment Agent', description: 'Payment processing and gateway orchestration.', capabilities: ['payment_processing', 'gateway_routing', 'retry_logic', 'reconciliation'], classification: 'active' },
      { id: 'INSURE', name: 'Insurance Agent', description: 'Insurance underwriting and claims processing.', capabilities: ['policy_underwriting', 'claims_processing', 'loss_modeling', 'reinsurance'], classification: 'hybrid' },
      { id: 'WEALTH', name: 'Wealth Agent', description: 'Wealth management and portfolio construction.', capabilities: ['portfolio_construction', 'rebalancing', 'tax_loss_harvesting', 'benchmark_tracking'], classification: 'passive' },
      { id: 'REGTECH', name: 'RegTech Agent', description: 'Regulatory technology and reporting automation.', capabilities: ['regulatory_reporting', 'change_management', 'policy_mapping', 'impact_assessment'], classification: 'passive' },
      { id: 'SANCTION', name: 'Sanctions Agent', description: 'Global sanctions screening and embargo enforcement.', capabilities: ['sanctions_screening', 'embargo_enforcement', 'watchlist_monitoring', 'beneficial_ownership'], classification: 'active' },
    ],
    clmCurriculum: ['Financial regulations', 'Risk management', 'Fraud detection', 'Payment systems', 'Capital markets', 'AML/KYC', 'Treasury management'],
    memoryStreamFocus: ['transaction integrity', 'fraud patterns', 'regulatory changes', 'market signals'],
    ascensionArchetypes: ['Financial Intelligence', 'Risk Management', 'Compliance Automation', 'Fraud Prevention'],
    cjpiWeights: { security: 0.40, performance: 0.20, reliability: 0.25, maintainability: 0.15 },
    accentColor: '45 80% 50%',
    iconName: 'Banknote',
  },
  education: {
    domain: 'security' as SpecialtyDomain,
    engines: [
      { id: 'CURRICUL', name: 'Curriculum Engine', description: 'Curriculum design, mapping, and standards alignment.', capabilities: ['curriculum_mapping', 'standards_alignment', 'scope_sequencing', 'competency_framework'], classification: 'passive' },
      { id: 'ASSESS', name: 'Assessment Engine', description: 'Adaptive assessment creation and psychometric analysis.', capabilities: ['item_generation', 'adaptive_testing', 'psychometric_analysis', 'rubric_design'], classification: 'active' },
      { id: 'TUTOR', name: 'Tutor Engine', description: 'Personalized learning path generation and pacing.', capabilities: ['learning_path', 'pace_optimization', 'scaffolding', 'mastery_tracking'], classification: 'active' },
      { id: 'CONTENT', name: 'Content Engine', description: 'Educational content generation and curation.', capabilities: ['content_generation', 'media_curation', 'accessibility_check', 'difficulty_calibration'], classification: 'hybrid' },
      { id: 'ANALYT_E', name: 'Analytics Engine', description: 'Learning analytics and outcome measurement.', capabilities: ['learning_analytics', 'outcome_measurement', 'engagement_tracking', 'predictive_modeling'], classification: 'passive' },
      { id: 'COLLAB', name: 'Collaboration Engine', description: 'Collaborative learning and group formation.', capabilities: ['group_formation', 'peer_review', 'discussion_facilitation', 'team_assessment'], classification: 'hybrid' },
      { id: 'CERTIFY', name: 'Certification Engine', description: 'Credential management and skill verification.', capabilities: ['credential_issuance', 'skill_verification', 'badge_management', 'transcript_generation'], classification: 'active' },
      { id: 'ACCREDIT', name: 'Accreditation Engine', description: 'Institutional accreditation tracking and reporting.', capabilities: ['accreditation_tracking', 'self_study', 'evidence_collection', 'continuous_improvement'], classification: 'passive' },
    ],
    agents: [
      { id: 'LEARNER', name: 'Learner Agent', description: 'Learner profile management and preference tracking.', capabilities: ['profile_management', 'preference_tracking', 'accommodation_support', 'goal_setting'], classification: 'active' },
      { id: 'INSTRUCT', name: 'Instructor Agent', description: 'Instructor support and teaching effectiveness analysis.', capabilities: ['teaching_analytics', 'course_design', 'grade_management', 'feedback_generation'], classification: 'hybrid' },
      { id: 'PLAGIAR', name: 'Integrity Agent', description: 'Academic integrity and plagiarism detection.', capabilities: ['plagiarism_detection', 'citation_check', 'ai_detection', 'honor_code'], classification: 'active' },
      { id: 'ENROLL', name: 'Enrollment Agent', description: 'Enrollment management and scheduling.', capabilities: ['enrollment_processing', 'schedule_optimization', 'waitlist_management', 'capacity_planning'], classification: 'active' },
      { id: 'ADVISOR', name: 'Advisor Agent', description: 'Academic advising and degree planning.', capabilities: ['degree_audit', 'course_recommendation', 'career_guidance', 'transfer_evaluation'], classification: 'passive' },
      { id: 'PARENT', name: 'Guardian Agent', description: 'Parent/guardian communication and progress reporting.', capabilities: ['progress_reporting', 'communication_hub', 'alert_management', 'conference_scheduling'], classification: 'hybrid' },
      { id: 'SPECIAL', name: 'Special Ed Agent', description: 'Special education support and IEP management.', capabilities: ['iep_management', 'accommodation_tracking', 'progress_monitoring', 'transition_planning'], classification: 'active' },
      { id: 'LIBRARY', name: 'Library Agent', description: 'Digital library management and resource discovery.', capabilities: ['resource_discovery', 'catalog_management', 'citation_formatting', 'oer_curation'], classification: 'passive' },
    ],
    clmCurriculum: ['Pedagogical theory', 'Assessment design', 'Learning science', 'EdTech', 'Accessibility', 'Credentialing', 'Academic integrity'],
    memoryStreamFocus: ['learning outcomes', 'student engagement', 'curriculum effectiveness', 'assessment validity'],
    ascensionArchetypes: ['Learning Intelligence', 'Assessment Innovation', 'Curriculum Design', 'Student Success'],
    cjpiWeights: { security: 0.20, performance: 0.25, reliability: 0.30, maintainability: 0.25 },
    accentColor: '260 60% 55%',
    iconName: 'GraduationCap',
  },
  gaming: {
    domain: 'security' as SpecialtyDomain,
    engines: [
      { id: 'PHYSICS', name: 'Physics Engine', description: 'Real-time physics simulation and collision detection.', capabilities: ['rigid_body', 'collision_detection', 'particle_systems', 'fluid_dynamics'], classification: 'active' },
      { id: 'RENDER', name: 'Render Engine', description: 'Graphics rendering pipeline and shader management.', capabilities: ['shader_pipeline', 'lighting_model', 'texture_streaming', 'lod_management'], classification: 'active' },
      { id: 'AI_NPC', name: 'NPC Engine', description: 'NPC behavior trees and decision-making systems.', capabilities: ['behavior_tree', 'pathfinding', 'decision_making', 'dialogue_system'], classification: 'hybrid' },
      { id: 'WORLD', name: 'World Engine', description: 'Procedural world generation and terrain management.', capabilities: ['procedural_generation', 'terrain_management', 'biome_distribution', 'loot_tables'], classification: 'passive' },
      { id: 'NETCODE', name: 'Netcode Engine', description: 'Multiplayer networking and state synchronization.', capabilities: ['state_sync', 'lag_compensation', 'matchmaking', 'server_authority'], classification: 'active' },
      { id: 'AUDIO_G', name: 'Audio Engine', description: 'Spatial audio processing and dynamic soundscaping.', capabilities: ['spatial_audio', 'dynamic_music', 'sound_effects', 'voice_chat'], classification: 'hybrid' },
      { id: 'ECONOM', name: 'Economy Engine', description: 'In-game economy balancing and marketplace management.', capabilities: ['economy_balance', 'marketplace', 'crafting_system', 'currency_management'], classification: 'passive' },
      { id: 'QUEST', name: 'Quest Engine', description: 'Dynamic quest generation and narrative branching.', capabilities: ['quest_generation', 'narrative_branching', 'objective_tracking', 'reward_calculation'], classification: 'hybrid' },
    ],
    agents: [
      { id: 'ANTICHEAT', name: 'Anti-Cheat Agent', description: 'Cheat detection, exploit prevention, and ban management.', capabilities: ['cheat_detection', 'exploit_prevention', 'ban_management', 'replay_analysis'], classification: 'active' },
      { id: 'BALANCE', name: 'Balance Agent', description: 'Game balance analysis and meta-game monitoring.', capabilities: ['balance_analysis', 'meta_monitoring', 'winrate_tracking', 'patch_impact'], classification: 'passive' },
      { id: 'MODERAT', name: 'Moderation Agent', description: 'Chat moderation and community management.', capabilities: ['chat_moderation', 'toxicity_detection', 'report_handling', 'community_health'], classification: 'active' },
      { id: 'ACHIEVE', name: 'Achievement Agent', description: 'Achievement tracking and progression systems.', capabilities: ['achievement_tracking', 'progression_system', 'leaderboard', 'season_pass'], classification: 'hybrid' },
      { id: 'REPLAY', name: 'Replay Agent', description: 'Replay recording, playback, and highlight generation.', capabilities: ['replay_recording', 'highlight_detection', 'spectator_mode', 'clip_export'], classification: 'passive' },
      { id: 'TUTORIAL', name: 'Tutorial Agent', description: 'Dynamic tutorial creation and onboarding flow.', capabilities: ['tutorial_flow', 'hint_system', 'difficulty_adjustment', 'new_player_experience'], classification: 'hybrid' },
      { id: 'LIVE_OPS', name: 'LiveOps Agent', description: 'Live operations, events, and seasonal content management.', capabilities: ['event_scheduling', 'content_rotation', 'ab_testing', 'feature_flags'], classification: 'active' },
      { id: 'ANALYTICS_G', name: 'Analytics Agent', description: 'Player behavior analytics and retention modeling.', capabilities: ['behavior_analytics', 'retention_modeling', 'funnel_analysis', 'churn_prediction'], classification: 'passive' },
    ],
    clmCurriculum: ['Game design', 'Multiplayer systems', 'Physics simulation', 'Economy design', 'Anti-cheat', 'LiveOps', 'Player analytics'],
    memoryStreamFocus: ['player engagement', 'balance metrics', 'cheat patterns', 'performance benchmarks'],
    ascensionArchetypes: ['Game Intelligence', 'Player Experience', 'Anti-Cheat Innovation', 'LiveOps Automation'],
    cjpiWeights: { security: 0.25, performance: 0.35, reliability: 0.25, maintainability: 0.15 },
    accentColor: '330 70% 55%',
    iconName: 'Gamepad2',
  },
};

/* ─────────────────────────────────────────────────
   UNIVERSAL FALLBACK — generates primitives
   from the genre name when no template exists
   ───────────────────────────────────────────────── */

function generateUniversalSpec(subdomain: string, genre: string): GenreTemplate {
  const g = genre.toLowerCase();
  const G = genre.charAt(0).toUpperCase() + genre.slice(1);

  const engines: GenreTemplate['engines'] = [
    { id: `${g.toUpperCase().slice(0, 6)}_CORE`, name: `${G} Core Engine`, description: `Core ${g} processing and orchestration.`, capabilities: [`${g}_processing`, `${g}_orchestration`, `${g}_analysis`, `${g}_optimization`], classification: 'active' },
    { id: `${g.toUpperCase().slice(0, 6)}_DATA`, name: `${G} Data Engine`, description: `${G} data ingestion and transformation.`, capabilities: [`data_ingestion`, `data_transform`, `data_validation`, `schema_mapping`], classification: 'passive' },
    { id: `${g.toUpperCase().slice(0, 6)}_INTL`, name: `${G} Intelligence Engine`, description: `${G} intelligence and insight generation.`, capabilities: [`insight_generation`, `pattern_detection`, `trend_analysis`, `predictive_model`], classification: 'hybrid' },
    { id: `${g.toUpperCase().slice(0, 6)}_AUTO`, name: `${G} Automation Engine`, description: `${G} workflow automation and scheduling.`, capabilities: [`workflow_automation`, `task_scheduling`, `event_processing`, `trigger_management`], classification: 'active' },
    { id: `${g.toUpperCase().slice(0, 6)}_PIPE`, name: `${G} Pipeline Engine`, description: `${G} pipeline construction and execution.`, capabilities: [`pipeline_build`, `stage_execution`, `error_handling`, `retry_logic`], classification: 'active' },
    { id: `${g.toUpperCase().slice(0, 6)}_EVAL`, name: `${G} Evaluation Engine`, description: `${G} quality evaluation and scoring.`, capabilities: [`quality_scoring`, `benchmark_eval`, `metric_tracking`, `threshold_check`], classification: 'passive' },
    { id: `${g.toUpperCase().slice(0, 6)}_SYNC`, name: `${G} Sync Engine`, description: `${G} state synchronization and replication.`, capabilities: [`state_sync`, `conflict_resolution`, `version_control`, `delta_propagation`], classification: 'hybrid' },
    { id: `${g.toUpperCase().slice(0, 6)}_OPTIM`, name: `${G} Optimization Engine`, description: `${G} performance optimization and tuning.`, capabilities: [`performance_tuning`, `resource_optimization`, `cost_reduction`, `throughput_scaling`], classification: 'hybrid' },
  ];

  const agents: GenreTemplate['agents'] = [
    { id: `${g.toUpperCase().slice(0, 6)}_GUARD`, name: `${G} Guard Agent`, description: `${G} security and access control.`, capabilities: [`access_control`, `threat_detection`, `policy_enforcement`, `audit_logging`], classification: 'active' },
    { id: `${g.toUpperCase().slice(0, 6)}_MONIT`, name: `${G} Monitor Agent`, description: `${G} monitoring and alerting.`, capabilities: [`health_monitoring`, `anomaly_alerting`, `sla_tracking`, `incident_response`], classification: 'active' },
    { id: `${g.toUpperCase().slice(0, 6)}_REPRT`, name: `${G} Report Agent`, description: `${G} reporting and visualization.`, capabilities: [`report_generation`, `data_visualization`, `export_formatting`, `scheduled_delivery`], classification: 'passive' },
    { id: `${g.toUpperCase().slice(0, 6)}_COMPL`, name: `${G} Compliance Agent`, description: `${G} compliance and regulation tracking.`, capabilities: [`compliance_check`, `regulation_tracking`, `policy_mapping`, `gap_analysis`], classification: 'active' },
    { id: `${g.toUpperCase().slice(0, 6)}_INTEG`, name: `${G} Integration Agent`, description: `${G} third-party integration and API management.`, capabilities: [`api_management`, `webhook_handling`, `data_bridging`, `protocol_translation`], classification: 'hybrid' },
    { id: `${g.toUpperCase().slice(0, 6)}_LEARN`, name: `${G} Learning Agent`, description: `${G} continuous learning and model improvement.`, capabilities: [`model_training`, `feedback_loop`, `knowledge_update`, `performance_tracking`], classification: 'passive' },
    { id: `${g.toUpperCase().slice(0, 6)}_SCHED`, name: `${G} Scheduler Agent`, description: `${G} scheduling and job management.`, capabilities: [`job_scheduling`, `queue_management`, `priority_handling`, `deadline_tracking`], classification: 'hybrid' },
    { id: `${g.toUpperCase().slice(0, 6)}_ADMIN`, name: `${G} Admin Agent`, description: `${G} administration and configuration management.`, capabilities: [`config_management`, `user_management`, `permission_control`, `environment_setup`], classification: 'active' },
  ];

  return {
    domain: 'security' as SpecialtyDomain,
    engines,
    agents,
    clmCurriculum: [`${G} fundamentals`, `${G} best practices`, `${G} security`, `${G} optimization`, `${G} compliance`, `${G} analytics`, `${G} integration`],
    memoryStreamFocus: [`${g} quality`, `${g} performance`, `${g} compliance`, `${g} innovation`],
    ascensionArchetypes: [`${G} Intelligence`, `${G} Automation`, `${G} Optimization`, `${G} Compliance`],
    cjpiWeights: { security: 0.25, performance: 0.25, reliability: 0.25, maintainability: 0.25 },
    accentColor: '200 60% 50%',
    iconName: 'Cpu',
  };
}

/* ─────────────────────────────────────────────────
   PUBLIC API
   ───────────────────────────────────────────────── */

/**
 * Generate a full VerticalFactoryInput from a subdomain and genre string.
 * Uses a curated template if available, otherwise derives one universally.
 */
export function generateVerticalSpec(subdomain: string, genre: string): VerticalFactoryInput {
  const genreKey = genre.toLowerCase().trim();
  const template = GENRE_TEMPLATES[genreKey] ?? generateUniversalSpec(subdomain, genre);
  const displayGenre = genre.charAt(0).toUpperCase() + genre.slice(1).toLowerCase();

  const engineWeight = 0.025; // 8 × 0.025 = 0.200
  const agentWeight = 0.025;  // 8 × 0.025 = 0.200
  // Spine = 0.600, total = 1.000

  const engines: VerticalEngineSpec[] = template.engines.map(e => ({
    ...e,
    role: 'engine' as const,
    weight: engineWeight,
  }));

  const agents: VerticalAgentSpec[] = template.agents.map(a => ({
    ...a,
    role: 'agent' as const,
    weight: agentWeight,
  }));

  return {
    verticalId: `${subdomain}-v1`,
    name: `CMPSBL ${displayGenre.toUpperCase()}™`,
    tagline: `${displayGenre}-grade cognitive infrastructure`,
    domain: template.domain,
    subdomain,
    engines,
    agents,
    theme: {
      primaryHue: parseInt(template.accentColor.split(' ')[0], 10) || 200,
      icon: template.iconName,
      gradientAngle: 135,
      darkAccent: `hsl(${template.accentColor})`,
      lightAccent: `hsl(${template.accentColor})`,
    },
    clmCurriculum: template.clmCurriculum,
    clmPriorityPrimitives: engines.slice(0, 4).map(e => e.id),
    memoryStreamFocus: template.memoryStreamFocus,
    ascensionArchetypes: template.ascensionArchetypes,
    cjpiWeights: template.cjpiWeights,
    collisionPriority: engines.slice(0, 3).map(e => e.id),
    iconName: template.iconName,
    portalAccentColor: template.accentColor,
  };
}

/** List all genres with curated templates */
export function getAvailableGenres(): string[] {
  return Object.keys(GENRE_TEMPLATES);
}
