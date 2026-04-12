/**
 * CMPSBL® Legal Vertical Substrate
 * 
 * Subdomain: legal.cmpsbl.com
 *
 * Hot-swapped Engines (8):
 *   CONTRACT  — Contract drafting, clause generation, and template management
 *   STATUTE   — Legal research, statute analysis, and case law correlation
 *   DEPOSE    — Deposition preparation, witness analysis, and testimony review
 *   FILING    — Court filing management, deadline tracking, and document assembly
 *   DILIGENCE — Due diligence automation, document review, and risk assessment
 *   REDLINE   — Document comparison, change tracking, and version management
 *   COMPLY_L  — Regulatory compliance monitoring and reporting
 *   BILLING_L — Legal billing, time tracking, and matter management
 *
 * Hot-swapped Agents (8):
 *   COUNSEL   — Legal strategy analysis and case assessment
 *   CLERK     — Case management, calendar maintenance, and filing coordination
 *   REVIEWER  — Document review, privilege detection, and relevance scoring
 *   MEDIATOR  — Dispute resolution support and negotiation strategy
 *   AUDITOR_L — Legal audit, ethics compliance, and conflict checking
 *   PARALEGAL — Research assistance, citation checking, and brief preparation
 *   WITNESS   — Witness preparation, testimony analysis, and deposition support
 *   DOCKET    — Docket tracking, court rule compliance, and deadline management
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { assembleVerticalPrimitives } from '../vertical-substrate';
import { LEGAL_CROWN_JEWELS, getLegalJewelsByPrimitive, getLegalJewelSummary } from '@/crownjewels/legal-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

const LEGAL_ENGINES: VerticalPrimitive[] = [
  { id: 'CONTRACT', name: 'CONTRACT', role: 'engine', description: 'Contract drafting and clause generation engine. Creates, assembles, and validates legal agreements with clause libraries, fallback provisions, and jurisdiction-aware templates.', inherited: false, replaces: 'CORTEX', capabilities: ['contract_drafting', 'clause_generation', 'template_management', 'jurisdiction_adaptation', 'fallback_provisions', 'term_negotiation', 'signature_workflow'], weight: 0.035, classification: 'active' },
  { id: 'STATUTE', name: 'STATUTE', role: 'engine', description: 'Legal research and case law correlation engine. Searches statutes, case law, regulations, and secondary sources with citation mapping and relevance ranking.', inherited: false, replaces: 'ARCHITECT', capabilities: ['statute_search', 'case_law_analysis', 'citation_mapping', 'relevance_ranking', 'legislative_tracking', 'regulatory_monitoring', 'precedent_identification'], weight: 0.030, classification: 'active' },
  { id: 'DEPOSE', name: 'DEPOSE', role: 'engine', description: 'Deposition preparation and testimony review engine. Generates question outlines, analyzes prior testimony, identifies inconsistencies, and prepares exhibit lists.', inherited: false, capabilities: ['question_preparation', 'testimony_analysis', 'inconsistency_detection', 'exhibit_management', 'timeline_reconstruction', 'witness_profiling', 'transcript_processing'], weight: 0.030, classification: 'active' },
  { id: 'FILING', name: 'FILING', role: 'engine', description: 'Court filing and document assembly engine. Manages e-filing workflows, format compliance, deadline tracking, and multi-jurisdiction filing requirements.', inherited: false, capabilities: ['efiling_management', 'format_compliance', 'deadline_tracking', 'document_assembly', 'service_coordination', 'proof_of_service', 'filing_confirmation'], weight: 0.025, classification: 'active' },
  { id: 'DILIGENCE', name: 'DILIGENCE', role: 'engine', description: 'Due diligence automation and document review engine. Processes large document sets, extracts key terms, flags risks, and generates diligence reports.', inherited: false, capabilities: ['document_review', 'risk_flagging', 'key_term_extraction', 'diligence_reports', 'data_room_management', 'deal_comparison', 'material_adverse_detection'], weight: 0.025, classification: 'active' },
  { id: 'REDLINE', name: 'REDLINE', role: 'engine', description: 'Document comparison and change tracking engine. Compares document versions, highlights modifications, tracks acceptance/rejection, and manages clause-level versioning.', inherited: false, capabilities: ['document_comparison', 'change_tracking', 'clause_versioning', 'acceptance_workflow', 'markup_generation', 'clean_copy_production', 'batch_comparison'], weight: 0.020, classification: 'active' },
  { id: 'COMPLY_L', name: 'COMPLY', role: 'engine', description: 'Regulatory compliance monitoring and reporting engine. Tracks regulatory changes, assesses compliance status, generates compliance reports, and manages policy updates.', inherited: false, capabilities: ['regulatory_tracking', 'compliance_assessment', 'report_generation', 'policy_management', 'gap_analysis', 'remediation_planning', 'jurisdiction_mapping'], weight: 0.020, classification: 'passive' },
  { id: 'BILLING_L', name: 'BILLING', role: 'engine', description: 'Legal billing and matter management engine. Tracks time entries, generates invoices, manages trust accounts, and ensures billing guideline compliance.', inherited: false, capabilities: ['time_tracking', 'invoice_generation', 'trust_accounting', 'billing_guidelines', 'expense_management', 'budget_forecasting', 'client_reporting'], weight: 0.015, classification: 'active' },
];

const LEGAL_AGENTS: VerticalPrimitive[] = [
  { id: 'COUNSEL', name: 'COUNSEL', role: 'agent', description: 'Legal strategy analysis and case assessment agent. Evaluates case strength, identifies legal theories, and recommends litigation strategies.', inherited: false, capabilities: ['case_assessment', 'strategy_analysis', 'theory_identification', 'outcome_prediction', 'risk_evaluation', 'settlement_analysis'], weight: 0.025, classification: 'active' },
  { id: 'CLERK_L', name: 'CLERK', role: 'agent', description: 'Case management and filing coordination agent. Maintains case calendars, coordinates filings, and ensures procedural compliance across matters.', inherited: false, capabilities: ['case_management', 'calendar_maintenance', 'filing_coordination', 'procedural_compliance', 'status_tracking', 'communication_management'], weight: 0.025, classification: 'active' },
  { id: 'REVIEWER', name: 'REVIEWER', role: 'agent', description: 'Document review and privilege detection agent. Reviews documents for relevance, identifies privileged materials, and manages review workflows.', inherited: false, capabilities: ['relevance_scoring', 'privilege_detection', 'review_workflow', 'coding_consistency', 'quality_control', 'production_preparation'], weight: 0.025, classification: 'passive' },
  { id: 'MEDIATOR', name: 'MEDIATOR', role: 'agent', description: 'Dispute resolution and negotiation strategy agent. Supports mediation preparation, analyzes negotiation positions, and models settlement scenarios.', inherited: false, capabilities: ['mediation_support', 'negotiation_analysis', 'settlement_modeling', 'position_evaluation', 'batna_analysis', 'outcome_forecasting'], weight: 0.025, classification: 'active' },
  { id: 'AUDITOR_L', name: 'AUDITOR', role: 'agent', description: 'Legal audit and ethics compliance agent. Performs conflict checks, monitors ethical obligations, and ensures professional responsibility compliance.', inherited: false, capabilities: ['conflict_checking', 'ethics_monitoring', 'professional_responsibility', 'audit_trails', 'policy_enforcement', 'training_tracking'], weight: 0.020, classification: 'passive' },
  { id: 'PARALEGAL', name: 'PARALEGAL', role: 'agent', description: 'Research assistance and brief preparation agent. Conducts legal research, checks citations, drafts brief sections, and prepares supporting exhibits.', inherited: false, capabilities: ['legal_research', 'citation_verification', 'brief_drafting', 'exhibit_preparation', 'fact_compilation', 'authority_tables'], weight: 0.020, classification: 'active' },
  { id: 'WITNESS_L', name: 'WITNESS', role: 'agent', description: 'Witness preparation and testimony support agent. Helps prepare witnesses, analyzes testimony patterns, and identifies potential impeachment risks.', inherited: false, capabilities: ['witness_preparation', 'testimony_patterns', 'impeachment_analysis', 'credibility_assessment', 'cross_examination_prep', 'expert_coordination'], weight: 0.020, classification: 'active' },
  { id: 'DOCKET', name: 'DOCKET', role: 'agent', description: 'Docket tracking and court rule compliance agent. Monitors court dockets, calculates deadlines, and ensures compliance with local and federal rules.', inherited: false, capabilities: ['docket_monitoring', 'deadline_calculation', 'rule_compliance', 'notice_tracking', 'scheduling_orders', 'appeal_deadlines'], weight: 0.020, classification: 'passive' },
];

export function getLegalEngines(): VerticalPrimitive[] { return [...LEGAL_ENGINES]; }
export function getLegalAgents(): VerticalPrimitive[] { return [...LEGAL_AGENTS]; }
export function getLegalPrimitives(): VerticalPrimitive[] { return assembleVerticalPrimitives(LEGAL_ENGINES, LEGAL_AGENTS); }
export function getAllLegalCapabilities(): string[] { return [...LEGAL_ENGINES, ...LEGAL_AGENTS].flatMap(p => p.capabilities); }
export function getLegalCrownJewels(): STierEntry[] { return LEGAL_CROWN_JEWELS; }
export function getLegalPrimitiveCrownJewels(primitiveId: string): STierEntry[] { return getLegalJewelsByPrimitive(primitiveId); }
export function getLegalCrownJewelSummary() { return getLegalJewelSummary(); }
export function getLegalCrownJewelCount(): number { return LEGAL_CROWN_JEWELS.length; }
export function getLegalCrownJewelCapabilities(): string[] { return LEGAL_CROWN_JEWELS.map(j => j.name); }

export function getLegalSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'legal-v1',
    name: 'CMPSBL LEGAL™',
    tagline: 'Cognitive Legal Infrastructure — Law Adapts in Real-Time',
    domain: 'legal',
    subdomain: 'legal',
    url: 'https://legal.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getLegalPrimitives(),
    clmCurriculum: { cyclesPerDay: 2400, curriculum: ['contract_analysis', 'legal_research', 'compliance_monitoring', 'document_review', 'case_management', 'billing_optimization', 'dispute_resolution', 'ethics_enforcement'], priorityPrimitives: ['CONTRACT', 'STATUTE', 'DILIGENCE', 'COUNSEL'], batchSize: 4 },
    memoryStreamConfig: { cycleIntervalHours: 4, scannerFocus: ['contract_patterns', 'case_law_trends', 'compliance_changes', 'billing_efficiency', 'review_accuracy', 'filing_deadlines', 'dispute_outcomes', 'ethics_alerts'], contributesToGlobal: true, retentionDays: 365 },
    ascensionConfig: { maxCapabilities: 20, enhancementArchetypes: ['document_integrity_hardening', 'compliance_enforcement', 'privilege_protection', 'deadline_resilience', 'billing_accuracy'], cjpiWeights: { security: 0.30, performance: 0.15, reliability: 0.35, maintainability: 0.20 }, collisionPriority: ['CONTRACT', 'STATUTE', 'DILIGENCE', 'FILING', 'COUNSEL', 'REVIEWER', 'AUDITOR_L', 'DOCKET'] },
    theme: { primaryHue: 35, icon: 'Scale', gradientAngle: 135, darkAccent: 'hsl(35 75% 55%)', lightAccent: 'hsl(35 60% 45%)' },
    createdAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-04-12T00:00:00.000Z',
  };
}
