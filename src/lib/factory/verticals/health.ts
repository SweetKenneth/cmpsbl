/**
 * CMPSBL® Health Vertical Substrate
 * 
 * Subdomain: health.cmpsbl.com
 *
 * Hot-swapped Engines (8):
 *   VITALS    — Patient data collection and biometric signal processing
 *   DIAGNOSE  — Symptom analysis, differential diagnosis, and clinical decision support
 *   PRESCRIBE — Treatment recommendation and drug interaction checking
 *   IMAGING   — Medical image analysis, radiology support, and visual diagnostics
 *   GENOMIC   — Genomic data processing, variant analysis, and pharmacogenomics
 *   TRIAGE    — Patient prioritization, acuity scoring, and resource allocation
 *   PATHWAY   — Clinical pathway management and care plan orchestration
 *   COMPLY_H  — HIPAA compliance, consent management, and audit trails
 *
 * Hot-swapped Agents (8):
 *   NURSE     — Care coordination, patient monitoring, and alert management
 *   PHARMA    — Medication management, formulary checking, and adverse event detection
 *   RESEARCHER— Clinical trial matching, evidence synthesis, and protocol assistance
 *   ADVOCATE  — Patient engagement, health literacy, and communication
 *   SENTINEL_H— Epidemiological surveillance, outbreak detection, and public health reporting
 *   RECORDER  — Clinical documentation, EHR integration, and coding assistance
 *   ETHICS    — Ethical review support, informed consent, and patient rights protection
 *   ANALYST_H — Health outcome analytics, population health, and quality metrics
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { assembleVerticalPrimitives } from '../vertical-substrate';
import { HEALTH_CROWN_JEWELS, getHealthJewelsByPrimitive, getHealthJewelSummary } from '@/crownjewels/health-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

const HEALTH_ENGINES: VerticalPrimitive[] = [
  { id: 'VITALS', name: 'VITALS', role: 'engine', description: 'Patient data collection and biometric signal processing engine. Ingests vitals, lab results, and wearable data with normalization, trend detection, and anomaly alerting.', inherited: false, replaces: 'CORTEX', capabilities: ['vital_sign_processing', 'lab_result_ingestion', 'wearable_data_sync', 'trend_detection', 'anomaly_alerting', 'data_normalization', 'baseline_tracking'], weight: 0.035, classification: 'active' },
  { id: 'DIAGNOSE', name: 'DIAGNOSE', role: 'engine', description: 'Symptom analysis and clinical decision support engine. Powers differential diagnosis, symptom correlation, evidence-based recommendations, and clinical guideline matching.', inherited: false, replaces: 'ARCHITECT', capabilities: ['differential_diagnosis', 'symptom_correlation', 'guideline_matching', 'evidence_ranking', 'risk_stratification', 'comorbidity_analysis', 'clinical_decision_support'], weight: 0.030, classification: 'active' },
  { id: 'PRESCRIBE', name: 'PRESCRIBE', role: 'engine', description: 'Treatment recommendation and drug interaction engine. Checks medication interactions, suggests treatment plans, validates dosing, and supports formulary compliance.', inherited: false, capabilities: ['treatment_recommendation', 'drug_interaction_check', 'dosing_validation', 'formulary_compliance', 'allergy_cross_check', 'therapeutic_monitoring', 'deprescribing_analysis'], weight: 0.030, classification: 'active' },
  { id: 'IMAGING', name: 'IMAGING', role: 'engine', description: 'Medical image analysis and radiology support engine. Processes X-rays, MRIs, CT scans, and pathology slides with pattern detection and measurement tools.', inherited: false, capabilities: ['image_classification', 'anomaly_detection', 'measurement_tools', 'comparison_overlay', 'report_generation', 'dicom_processing', 'annotation_management'], weight: 0.025, classification: 'active' },
  { id: 'GENOMIC', name: 'GENOMIC', role: 'engine', description: 'Genomic data processing and pharmacogenomics engine. Analyzes genetic variants, predicts drug response, and supports precision medicine workflows.', inherited: false, capabilities: ['variant_analysis', 'pharmacogenomics', 'genetic_risk_scoring', 'pathway_analysis', 'ancestry_inference', 'mutation_cataloging', 'precision_medicine'], weight: 0.025, classification: 'active' },
  { id: 'TRIAGE', name: 'TRIAGE', role: 'engine', description: 'Patient prioritization and resource allocation engine. Scores acuity, optimizes bed assignments, manages wait queues, and predicts capacity needs.', inherited: false, capabilities: ['acuity_scoring', 'resource_allocation', 'wait_queue_management', 'capacity_prediction', 'escalation_routing', 'priority_balancing', 'surge_planning'], weight: 0.020, classification: 'active' },
  { id: 'PATHWAY', name: 'PATHWAY', role: 'engine', description: 'Clinical pathway management and care plan orchestration engine. Creates standardized care protocols, tracks milestone completion, and adapts plans to patient response.', inherited: false, capabilities: ['care_plan_creation', 'milestone_tracking', 'protocol_adherence', 'plan_adaptation', 'transition_management', 'discharge_planning', 'follow_up_scheduling'], weight: 0.020, classification: 'active' },
  { id: 'COMPLY_H', name: 'COMPLY', role: 'engine', description: 'HIPAA compliance and audit trail engine. Manages patient consent, access logging, data anonymization, breach detection, and regulatory reporting.', inherited: false, capabilities: ['hipaa_compliance', 'consent_management', 'access_logging', 'data_anonymization', 'breach_detection', 'regulatory_reporting', 'retention_enforcement'], weight: 0.015, classification: 'passive' },
];

const HEALTH_AGENTS: VerticalPrimitive[] = [
  { id: 'NURSE', name: 'NURSE', role: 'agent', description: 'Care coordination and patient monitoring agent. Manages care team communication, tracks vitals against thresholds, and escalates critical changes.', inherited: false, capabilities: ['care_coordination', 'threshold_monitoring', 'critical_escalation', 'shift_handoff', 'medication_reminders', 'patient_education'], weight: 0.025, classification: 'active' },
  { id: 'PHARMA', name: 'PHARMA', role: 'agent', description: 'Medication management and adverse event detection agent. Monitors medication adherence, detects adverse reactions, and ensures safe polypharmacy.', inherited: false, capabilities: ['adherence_monitoring', 'adverse_event_detection', 'polypharmacy_review', 'refill_management', 'cost_optimization', 'generic_substitution'], weight: 0.025, classification: 'active' },
  { id: 'RESEARCHER_H', name: 'RESEARCHER', role: 'agent', description: 'Clinical trial matching and evidence synthesis agent. Matches patients to eligible trials, synthesizes research evidence, and supports protocol compliance.', inherited: false, capabilities: ['trial_matching', 'evidence_synthesis', 'protocol_compliance', 'patient_screening', 'outcome_tracking', 'literature_monitoring'], weight: 0.025, classification: 'active' },
  { id: 'ADVOCATE', name: 'ADVOCATE', role: 'agent', description: 'Patient engagement and health literacy agent. Translates medical jargon, provides educational materials, and supports shared decision-making.', inherited: false, capabilities: ['health_literacy', 'patient_education', 'shared_decision_making', 'material_translation', 'question_preparation', 'resource_navigation'], weight: 0.025, classification: 'active' },
  { id: 'SENTINEL_H', name: 'SENTINEL', role: 'agent', description: 'Epidemiological surveillance and outbreak detection agent. Monitors disease patterns, detects clusters, and generates public health reports.', inherited: false, capabilities: ['disease_surveillance', 'outbreak_detection', 'cluster_analysis', 'contact_tracing', 'reporting_automation', 'trend_forecasting'], weight: 0.020, classification: 'passive' },
  { id: 'RECORDER', name: 'RECORDER', role: 'agent', description: 'Clinical documentation and EHR integration agent. Assists with note generation, medical coding, and structured data extraction from clinical narratives.', inherited: false, capabilities: ['note_generation', 'medical_coding', 'data_extraction', 'ehr_integration', 'template_management', 'voice_transcription'], weight: 0.020, classification: 'passive' },
  { id: 'ETHICS_H', name: 'ETHICS', role: 'agent', description: 'Ethical review support and patient rights protection agent. Validates informed consent, flags ethical concerns, and supports institutional review processes.', inherited: false, capabilities: ['consent_validation', 'ethical_flagging', 'irb_support', 'patient_rights', 'conflict_of_interest', 'equity_analysis'], weight: 0.020, classification: 'passive' },
  { id: 'ANALYST_H', name: 'ANALYST', role: 'agent', description: 'Health outcome analytics and population health agent. Tracks quality metrics, analyzes treatment effectiveness, and generates population health reports.', inherited: false, capabilities: ['outcome_analytics', 'population_health', 'quality_metrics', 'effectiveness_analysis', 'cost_analysis', 'benchmark_comparison'], weight: 0.020, classification: 'passive' },
];

export function getHealthEngines(): VerticalPrimitive[] { return [...HEALTH_ENGINES]; }
export function getHealthAgents(): VerticalPrimitive[] { return [...HEALTH_AGENTS]; }
export function getHealthPrimitives(): VerticalPrimitive[] { return assembleVerticalPrimitives(HEALTH_ENGINES, HEALTH_AGENTS); }
export function getAllHealthCapabilities(): string[] { return [...HEALTH_ENGINES, ...HEALTH_AGENTS].flatMap(p => p.capabilities); }
export function getHealthCrownJewels(): STierEntry[] { return HEALTH_CROWN_JEWELS; }
export function getHealthPrimitiveCrownJewels(primitiveId: string): STierEntry[] { return getHealthJewelsByPrimitive(primitiveId); }
export function getHealthCrownJewelSummary() { return getHealthJewelSummary(); }
export function getHealthCrownJewelCount(): number { return HEALTH_CROWN_JEWELS.length; }
export function getHealthCrownJewelCapabilities(): string[] { return HEALTH_CROWN_JEWELS.map(j => j.name); }

export function getHealthSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'health-v1',
    name: 'CMPSBL HEALTH™',
    tagline: 'Cognitive Health Infrastructure — Care Learns Continuously',
    domain: 'healthcare',
    subdomain: 'health',
    url: 'https://health.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getHealthPrimitives(),
    clmCurriculum: { cyclesPerDay: 2400, curriculum: ['clinical_decision_support', 'diagnostic_accuracy', 'treatment_optimization', 'patient_safety', 'compliance_enforcement', 'population_health', 'research_evidence', 'care_coordination'], priorityPrimitives: ['DIAGNOSE', 'VITALS', 'PRESCRIBE', 'PATHWAY'], batchSize: 4 },
    memoryStreamConfig: { cycleIntervalHours: 4, scannerFocus: ['diagnostic_patterns', 'treatment_outcomes', 'drug_interactions', 'imaging_findings', 'genomic_insights', 'triage_effectiveness', 'compliance_gaps', 'patient_engagement'], contributesToGlobal: true, retentionDays: 365 },
    ascensionConfig: { maxCapabilities: 20, enhancementArchetypes: ['clinical_data_hardening', 'patient_safety_enforcement', 'compliance_pipeline', 'diagnostic_resilience', 'privacy_protection'], cjpiWeights: { security: 0.30, performance: 0.20, reliability: 0.30, maintainability: 0.20 }, collisionPriority: ['DIAGNOSE', 'VITALS', 'PRESCRIBE', 'IMAGING', 'GENOMIC', 'NURSE', 'PHARMA', 'RESEARCHER_H'] },
    theme: { primaryHue: 160, icon: 'HeartPulse', gradientAngle: 135, darkAccent: 'hsl(160 75% 50%)', lightAccent: 'hsl(160 60% 40%)' },
    createdAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-04-12T00:00:00.000Z',
  };
}
