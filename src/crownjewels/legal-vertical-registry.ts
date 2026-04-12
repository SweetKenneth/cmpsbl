/**
 * CMPSBL LEGAL™ — Vertical Crown Jewel Registry
 * 89 Architectural Crown Jewels: 5 per primitive (80) + 9 compound.
 * © CMPSBL® — All rights reserved.
 */
import type { STierEntry } from './types';

function cj(rank: number, id: string, name: string, cjpi: number, module: string, description: string, sig: string): STierEntry {
  return { rank, id, name, cjpi, module, type: 'Architecture', description, dependencyFootprint: [], exportMode: 'PureStandalone', signatureHash: sig, version: '1.0.0', approved: true, generatedAt: '2026-04-12T00:00:00.000Z', hasCode: true };
}

const CONTRACT_J: STierEntry[] = [
  cj(1,'leg-con-1','Smart Contract Drafter',98,'CONTRACT','Automated contract assembly with clause selection, jurisdiction adaptation, and risk flagging.','sha256-leg-con-1'),
  cj(2,'leg-con-2','Clause Library Manager',96,'CONTRACT','Organized clause library with version control, usage analytics, and conflict detection.','sha256-leg-con-2'),
  cj(3,'leg-con-3','Negotiation Tracker',95,'CONTRACT','Term-by-term negotiation tracking with history and position comparison.','sha256-leg-con-3'),
  cj(4,'leg-con-4','Signature Workflow Engine',94,'CONTRACT','Multi-party electronic signature workflow with authentication and audit trails.','sha256-leg-con-4'),
  cj(5,'leg-con-5','Template Generator',93,'CONTRACT','Jurisdiction-aware contract template creation with customization.','sha256-leg-con-5'),
];
const STATUTE_J: STierEntry[] = [
  cj(6,'leg-sta-1','Case Law Search Engine',98,'STATUTE','Semantic legal research with relevance ranking and citation network analysis.','sha256-leg-sta-1'),
  cj(7,'leg-sta-2','Precedent Identifier',96,'STATUTE','Controlling precedent identification with jurisdiction and court hierarchy awareness.','sha256-leg-sta-2'),
  cj(8,'leg-sta-3','Legislative Tracker',95,'STATUTE','Real-time legislative change tracking with impact assessment.','sha256-leg-sta-3'),
  cj(9,'leg-sta-4','Citation Network Mapper',94,'STATUTE','Legal citation graph analysis with treatment history tracking.','sha256-leg-sta-4'),
  cj(10,'leg-sta-5','Regulatory Monitor',93,'STATUTE','Cross-jurisdictional regulatory change monitoring with compliance implications.','sha256-leg-sta-5'),
];
const DEPOSE_J: STierEntry[] = [
  cj(11,'leg-dep-1','Deposition Prep Engine',96,'DEPOSE','Comprehensive deposition preparation with question outlines and strategy.','sha256-leg-dep-1'),
  cj(12,'leg-dep-2','Testimony Inconsistency Detector',95,'DEPOSE','Cross-reference testimony analysis with inconsistency highlighting.','sha256-leg-dep-2'),
  cj(13,'leg-dep-3','Exhibit Manager',94,'DEPOSE','Deposition exhibit organization with cross-reference and timeline mapping.','sha256-leg-dep-3'),
  cj(14,'leg-dep-4','Witness Profile Builder',93,'DEPOSE','Comprehensive witness profiling with credibility factors.','sha256-leg-dep-4'),
  cj(15,'leg-dep-5','Transcript Analyzer',92,'DEPOSE','Deposition transcript analysis with key admission extraction.','sha256-leg-dep-5'),
];
const FILING_J: STierEntry[] = [
  cj(16,'leg-fil-1','E-Filing Manager',96,'FILING','Multi-court e-filing with format compliance and confirmation tracking.','sha256-leg-fil-1'),
  cj(17,'leg-fil-2','Deadline Calculator',95,'FILING','Court rule-based deadline calculation with holidays and extensions.','sha256-leg-fil-2'),
  cj(18,'leg-fil-3','Document Assembly Engine',94,'FILING','Automated pleading assembly with court-specific formatting.','sha256-leg-fil-3'),
  cj(19,'leg-fil-4','Service Coordinator',93,'FILING','Service of process coordination with proof tracking.','sha256-leg-fil-4'),
  cj(20,'leg-fil-5','Format Compliance Checker',92,'FILING','Court-specific document formatting validation.','sha256-leg-fil-5'),
];
const DILIGENCE_J: STierEntry[] = [
  cj(21,'leg-dil-1','Due Diligence Automation Engine',97,'DILIGENCE','Large-scale document review with key term extraction and risk flagging.','sha256-leg-dil-1'),
  cj(22,'leg-dil-2','Data Room Manager',96,'DILIGENCE','Virtual data room with access tracking and document organization.','sha256-leg-dil-2'),
  cj(23,'leg-dil-3','Risk Assessment Engine',95,'DILIGENCE','Deal risk assessment with material adverse change detection.','sha256-leg-dil-3'),
  cj(24,'leg-dil-4','Diligence Report Generator',94,'DILIGENCE','Automated due diligence report generation with findings summary.','sha256-leg-dil-4'),
  cj(25,'leg-dil-5','Deal Comparison Tool',93,'DILIGENCE','Side-by-side deal term comparison with market benchmarking.','sha256-leg-dil-5'),
];
const REDLINE_J: STierEntry[] = [
  cj(26,'leg-red-1','Document Comparison Engine',96,'REDLINE','Clause-level document comparison with semantic change detection.','sha256-leg-red-1'),
  cj(27,'leg-red-2','Change Tracking System',95,'REDLINE','Collaborative change tracking with accept/reject workflows.','sha256-leg-red-2'),
  cj(28,'leg-red-3','Clause Versioning Manager',94,'REDLINE','Individual clause version history with rollback support.','sha256-leg-red-3'),
  cj(29,'leg-red-4','Markup Generator',93,'REDLINE','Professional redline generation with formatting preservation.','sha256-leg-red-4'),
  cj(30,'leg-red-5','Batch Comparison Tool',92,'REDLINE','Multi-document batch comparison with summary reports.','sha256-leg-red-5'),
];
const COMPLY_L_J: STierEntry[] = [
  cj(31,'leg-cmp-1','Regulatory Change Tracker',96,'COMPLY_L','Real-time regulatory change monitoring with impact assessment.','sha256-leg-cmp-1'),
  cj(32,'leg-cmp-2','Compliance Assessment Engine',95,'COMPLY_L','Multi-framework compliance assessment with gap analysis.','sha256-leg-cmp-2'),
  cj(33,'leg-cmp-3','Policy Management System',94,'COMPLY_L','Corporate policy management with update tracking and distribution.','sha256-leg-cmp-3'),
  cj(34,'leg-cmp-4','Gap Analysis Report Generator',93,'COMPLY_L','Compliance gap identification with remediation prioritization.','sha256-leg-cmp-4'),
  cj(35,'leg-cmp-5','Jurisdiction Mapper',92,'COMPLY_L','Multi-jurisdictional compliance requirement mapping.','sha256-leg-cmp-5'),
];
const BILLING_L_J: STierEntry[] = [
  cj(36,'leg-bil-1','Time Entry Optimizer',95,'BILLING_L','Intelligent time entry with task code suggestion and description generation.','sha256-leg-bil-1'),
  cj(37,'leg-bil-2','Invoice Generator',94,'BILLING_L','Automated invoice generation with billing guideline compliance.','sha256-leg-bil-2'),
  cj(38,'leg-bil-3','Trust Account Manager',93,'BILLING_L','IOLTA trust accounting with reconciliation and reporting.','sha256-leg-bil-3'),
  cj(39,'leg-bil-4','Budget Forecaster',92,'BILLING_L','Matter budget forecasting with historical comparison.','sha256-leg-bil-4'),
  cj(40,'leg-bil-5','Client Reporting Engine',92,'BILLING_L','Customizable client billing reports with analytics.','sha256-leg-bil-5'),
];
const COUNSEL_J: STierEntry[] = [
  cj(41,'leg-cou-1','Case Strength Evaluator',97,'COUNSEL','Multi-factor case strength assessment with outcome prediction.','sha256-leg-cou-1'),
  cj(42,'leg-cou-2','Strategy Recommender',96,'COUNSEL','Litigation strategy recommendation with risk-reward analysis.','sha256-leg-cou-2'),
  cj(43,'leg-cou-3','Settlement Analyzer',95,'COUNSEL','Settlement value modeling with negotiation range calculation.','sha256-leg-cou-3'),
  cj(44,'leg-cou-4','Theory Identifier',94,'COUNSEL','Legal theory identification with supporting authority mapping.','sha256-leg-cou-4'),
  cj(45,'leg-cou-5','Risk Evaluator',93,'COUNSEL','Litigation risk evaluation with exposure quantification.','sha256-leg-cou-5'),
];
const CLERK_J: STierEntry[] = [
  cj(46,'leg-clk-1','Case Management System',95,'CLERK_L','Comprehensive case management with milestone tracking.','sha256-leg-clk-1'),
  cj(47,'leg-clk-2','Calendar Manager',94,'CLERK_L','Court and filing calendar with conflict detection.','sha256-leg-clk-2'),
  cj(48,'leg-clk-3','Filing Coordinator',93,'CLERK_L','Multi-matter filing coordination with status tracking.','sha256-leg-clk-3'),
  cj(49,'leg-clk-4','Communication Manager',92,'CLERK_L','Client and court communication tracking with response tracking.','sha256-leg-clk-4'),
  cj(50,'leg-clk-5','Status Dashboard',92,'CLERK_L','Real-time case status dashboard with milestone visualization.','sha256-leg-clk-5'),
];
const REVIEWER_J: STierEntry[] = [
  cj(51,'leg-rev-1','Privilege Detection Engine',97,'REVIEWER','Attorney-client privilege detection with confidence scoring.','sha256-leg-rev-1'),
  cj(52,'leg-rev-2','Relevance Scorer',96,'REVIEWER','Document relevance scoring with issue coding assistance.','sha256-leg-rev-2'),
  cj(53,'leg-rev-3','Review Workflow Manager',95,'REVIEWER','Batched review workflow with quality control and consistency checks.','sha256-leg-rev-3'),
  cj(54,'leg-rev-4','Production Preparation Engine',94,'REVIEWER','Document production preparation with redaction and Bates numbering.','sha256-leg-rev-4'),
  cj(55,'leg-rev-5','Coding Consistency Checker',93,'REVIEWER','Cross-reviewer coding consistency with calibration scoring.','sha256-leg-rev-5'),
];
const MEDIATOR_J: STierEntry[] = [
  cj(56,'leg-med-1','Mediation Prep Engine',95,'MEDIATOR','Comprehensive mediation preparation with position analysis.','sha256-leg-med-1'),
  cj(57,'leg-med-2','BATNA Calculator',94,'MEDIATOR','Best alternative to negotiated agreement modeling.','sha256-leg-med-2'),
  cj(58,'leg-med-3','Settlement Scenario Modeler',93,'MEDIATOR','Multi-variable settlement scenario modeling with outcome prediction.','sha256-leg-med-3'),
  cj(59,'leg-med-4','Position Evaluator',92,'MEDIATOR','Negotiation position strength evaluation with leverage analysis.','sha256-leg-med-4'),
  cj(60,'leg-med-5','Outcome Forecaster',92,'MEDIATOR','Dispute resolution outcome forecasting based on case factors.','sha256-leg-med-5'),
];
const AUDITOR_J: STierEntry[] = [
  cj(61,'leg-aud-1','Conflict Checker',96,'AUDITOR_L','Comprehensive conflict of interest checking across matters and parties.','sha256-leg-aud-1'),
  cj(62,'leg-aud-2','Ethics Monitor',95,'AUDITOR_L','Professional responsibility compliance monitoring with alert system.','sha256-leg-aud-2'),
  cj(63,'leg-aud-3','Audit Trail System',94,'AUDITOR_L','Complete audit trail for matter activities with tamper detection.','sha256-leg-aud-3'),
  cj(64,'leg-aud-4','Policy Enforcement Engine',93,'AUDITOR_L','Firm policy enforcement with violation detection and reporting.','sha256-leg-aud-4'),
  cj(65,'leg-aud-5','Training Tracker',92,'AUDITOR_L','CLE and ethics training tracking with compliance reporting.','sha256-leg-aud-5'),
];
const PARALEGAL_J: STierEntry[] = [
  cj(66,'leg-par-1','Legal Research Assistant',96,'PARALEGAL','Comprehensive legal research with authority compilation.','sha256-leg-par-1'),
  cj(67,'leg-par-2','Citation Verifier',95,'PARALEGAL','Case citation verification with treatment history checking.','sha256-leg-par-2'),
  cj(68,'leg-par-3','Brief Section Drafter',94,'PARALEGAL','Brief section drafting with authority integration.','sha256-leg-par-3'),
  cj(69,'leg-par-4','Exhibit Preparation Engine',93,'PARALEGAL','Exhibit preparation with numbering, indexing, and cross-referencing.','sha256-leg-par-4'),
  cj(70,'leg-par-5','Authority Table Builder',92,'PARALEGAL','Table of authorities generation with formatting compliance.','sha256-leg-par-5'),
];
const WITNESS_J: STierEntry[] = [
  cj(71,'leg-wit-1','Witness Prep System',95,'WITNESS_L','Comprehensive witness preparation with anticipated questions.','sha256-leg-wit-1'),
  cj(72,'leg-wit-2','Testimony Pattern Analyzer',94,'WITNESS_L','Historical testimony pattern analysis with prediction.','sha256-leg-wit-2'),
  cj(73,'leg-wit-3','Impeachment Risk Analyzer',93,'WITNESS_L','Prior statement analysis for impeachment risk identification.','sha256-leg-wit-3'),
  cj(74,'leg-wit-4','Expert Coordinator',92,'WITNESS_L','Expert witness coordination with report management.','sha256-leg-wit-4'),
  cj(75,'leg-wit-5','Credibility Assessor',92,'WITNESS_L','Multi-factor witness credibility assessment.','sha256-leg-wit-5'),
];
const DOCKET_J: STierEntry[] = [
  cj(76,'leg-doc-1','Docket Monitor',96,'DOCKET','Real-time court docket monitoring with change alerting.','sha256-leg-doc-1'),
  cj(77,'leg-doc-2','Deadline Calculator',95,'DOCKET','Rule-based deadline calculation with jurisdictional variations.','sha256-leg-doc-2'),
  cj(78,'leg-doc-3','Scheduling Order Tracker',94,'DOCKET','Scheduling order compliance tracking with milestone management.','sha256-leg-doc-3'),
  cj(79,'leg-doc-4','Appeal Deadline Engine',93,'DOCKET','Appeal-specific deadline calculation with notice requirements.','sha256-leg-doc-4'),
  cj(80,'leg-doc-5','Court Rule Compliance',92,'DOCKET','Local and federal rule compliance checking with updates.','sha256-leg-doc-5'),
];

const COMPOUND_JEWELS: STierEntry[] = [
  cj(81,'leg-cx-1','Deal Execution Pipeline',98,'CONTRACT×DILIGENCE×REDLINE','End-to-end deal execution from diligence through negotiation to signing.','sha256-leg-cx-1'),
  cj(82,'leg-cx-2','Litigation Command Center',97,'COUNSEL×FILING×DOCKET','Unified litigation management from strategy to filing to deadline tracking.','sha256-leg-cx-2'),
  cj(83,'leg-cx-3','Discovery Pipeline',96,'REVIEWER×DEPOSE×PARALEGAL','Complete discovery workflow from document review to deposition.','sha256-leg-cx-3'),
  cj(84,'leg-cx-4','Compliance Fortress',96,'COMPLY_L×AUDITOR_L×STATUTE','Full regulatory compliance with ethics and legislative tracking.','sha256-leg-cx-4'),
  cj(85,'leg-cx-5','Trial Preparation Suite',95,'WITNESS_L×DEPOSE×COUNSEL','Integrated trial prep with witness, deposition, and strategy.','sha256-leg-cx-5'),
  cj(86,'leg-cx-6','Contract Intelligence',95,'CONTRACT×STATUTE×REDLINE','Contract drafting with legal research and version management.','sha256-leg-cx-6'),
  cj(87,'leg-cx-7','Matter Economics Engine',94,'BILLING_L×CLERK_L','Complete matter economics with billing, budgeting, and management.','sha256-leg-cx-7'),
  cj(88,'leg-cx-8','ADR Intelligence',93,'MEDIATOR×COUNSEL×DOCKET','Alternative dispute resolution with strategy and deadline management.','sha256-leg-cx-8'),
  cj(89,'leg-cx-9','Knowledge Management System',93,'STATUTE×PARALEGAL×REVIEWER','Firm knowledge management with research, review, and precedent.','sha256-leg-cx-9'),
];

export const LEGAL_CROWN_JEWELS: STierEntry[] = [
  ...CONTRACT_J, ...STATUTE_J, ...DEPOSE_J, ...FILING_J,
  ...DILIGENCE_J, ...REDLINE_J, ...COMPLY_L_J, ...BILLING_L_J,
  ...COUNSEL_J, ...CLERK_J, ...REVIEWER_J, ...MEDIATOR_J,
  ...AUDITOR_J, ...PARALEGAL_J, ...WITNESS_J, ...DOCKET_J,
  ...COMPOUND_JEWELS,
];

export function getLegalJewelsByPrimitive(primitiveId: string): STierEntry[] {
  const upper = primitiveId.toUpperCase();
  return LEGAL_CROWN_JEWELS.filter(j => j.module.toUpperCase() === upper || j.module.toUpperCase().includes(upper));
}

export function getLegalJewelSummary() {
  return { total: LEGAL_CROWN_JEWELS.length, engines: 40, agents: 40, compound: 9, avgCjpi: Math.round(LEGAL_CROWN_JEWELS.reduce((s, j) => s + j.cjpi, 0) / LEGAL_CROWN_JEWELS.length), version: '1.0.0' };
}
