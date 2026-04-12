/**
 * CMPSBL EDUCATION™ — Vertical Crown Jewel Registry
 * 89 Architectural Crown Jewels: 5 per primitive (80) + 9 compound.
 * © CMPSBL® — All rights reserved.
 */
import type { STierEntry } from './types';

function cj(rank: number, id: string, name: string, cjpi: number, module: string, description: string, sig: string): STierEntry {
  return { rank, id, name, cjpi, module, type: 'Architecture', description, dependencyFootprint: [], exportMode: 'PureStandalone', signatureHash: sig, version: '1.0.0', approved: true, generatedAt: '2026-04-12T00:00:00.000Z', hasCode: true };
}

const SYLLABUS_JEWELS: STierEntry[] = [
  cj(1,'edu-syl-1','Adaptive Learning Path Orchestrator',98,'SYLLABUS','Dynamic curriculum sequencing that adapts to student performance in real-time with prerequisite validation.','sha256-edu-syl-1'),
  cj(2,'edu-syl-2','Competency Framework Generator',96,'SYLLABUS','Automated competency matrix creation with standards alignment and progression mapping.','sha256-edu-syl-2'),
  cj(3,'edu-syl-3','Prerequisite Chain Validator',95,'SYLLABUS','Graph-based prerequisite validation ensuring learning path integrity across curricula.','sha256-edu-syl-3'),
  cj(4,'edu-syl-4','Pace Optimization Engine',94,'SYLLABUS','Student-specific pacing that balances mastery with progression speed.','sha256-edu-syl-4'),
  cj(5,'edu-syl-5','Standards Alignment Mapper',93,'SYLLABUS','Maps curriculum content to national and international education standards.','sha256-edu-syl-5'),
];
const LECTURE_JEWELS: STierEntry[] = [
  cj(6,'edu-lec-1','Multi-Modal Lesson Synthesizer',97,'LECTURE','Generates lesson content across text, visual, and interactive formats with difficulty calibration.','sha256-edu-lec-1'),
  cj(7,'edu-lec-2','Concept Visualization Engine',95,'LECTURE','Transforms abstract concepts into interactive visual explanations.','sha256-edu-lec-2'),
  cj(8,'edu-lec-3','Example Generation Pipeline',94,'LECTURE','Creates domain-specific worked examples with step-by-step scaffolding.','sha256-edu-lec-3'),
  cj(9,'edu-lec-4','Slide Deck Composer',93,'LECTURE','Professional presentation generation with pedagogical sequencing.','sha256-edu-lec-4'),
  cj(10,'edu-lec-5','Difficulty Gradient Calibrator',92,'LECTURE','Adjusts content complexity based on learner profiles and assessment data.','sha256-edu-lec-5'),
];
const QUIZ_JEWELS: STierEntry[] = [
  cj(11,'edu-qz-1','Adaptive Test Engine',97,'QUIZ','Item response theory-based adaptive testing with real-time difficulty adjustment.','sha256-edu-qz-1'),
  cj(12,'edu-qz-2','Question Bank Generator',96,'QUIZ','High-volume question generation with distractor analysis and bloom taxonomy tagging.','sha256-edu-qz-2'),
  cj(13,'edu-qz-3','Spaced Repetition Scheduler',95,'QUIZ','Optimal review scheduling using forgetting curve models.','sha256-edu-qz-3'),
  cj(14,'edu-qz-4','Rubric Enforcement Engine',94,'QUIZ','Consistent rubric application across graders with calibration scoring.','sha256-edu-qz-4'),
  cj(15,'edu-qz-5','Test Blueprint Designer',93,'QUIZ','Assessment blueprint creation ensuring content coverage and difficulty distribution.','sha256-edu-qz-5'),
];
const TUTOR_JEWELS: STierEntry[] = [
  cj(16,'edu-tut-1','Knowledge Gap Detector',97,'TUTOR','Identifies specific knowledge gaps through diagnostic questioning patterns.','sha256-edu-tut-1'),
  cj(17,'edu-tut-2','Socratic Questioning Engine',96,'TUTOR','Guides learners through discovery-based reasoning with adaptive prompts.','sha256-edu-tut-2'),
  cj(18,'edu-tut-3','Misconception Identifier',95,'TUTOR','Detects and addresses common misconceptions with targeted remediation.','sha256-edu-tut-3'),
  cj(19,'edu-tut-4','Scaffolded Problem Solver',94,'TUTOR','Progressive hint system that maintains productive struggle.','sha256-edu-tut-4'),
  cj(20,'edu-tut-5','Mastery Tracking Dashboard',93,'TUTOR','Real-time mastery visualization with competency progression.','sha256-edu-tut-5'),
];
const GRADE_JEWELS: STierEntry[] = [
  cj(21,'edu-gr-1','Automated Essay Scorer',96,'GRADE','Multi-dimensional essay evaluation with constructive feedback generation.','sha256-edu-gr-1'),
  cj(22,'edu-gr-2','Grade Calibration System',95,'GRADE','Cross-section grade consistency ensuring equitable evaluation.','sha256-edu-gr-2'),
  cj(23,'edu-gr-3','Feedback Generation Engine',94,'GRADE','Personalized constructive feedback tied to rubric criteria.','sha256-edu-gr-3'),
  cj(24,'edu-gr-4','Peer Review Orchestrator',93,'GRADE','Structured peer review with anonymization and quality scoring.','sha256-edu-gr-4'),
  cj(25,'edu-gr-5','Grade Analytics Dashboard',92,'GRADE','Item-level grade analytics with trend detection and outlier flagging.','sha256-edu-gr-5'),
];
const CLASSROOM_JEWELS: STierEntry[] = [
  cj(26,'edu-cl-1','Breakout Room Orchestrator',95,'CLASSROOM','Dynamic group formation with skill-balanced team assignment.','sha256-edu-cl-1'),
  cj(27,'edu-cl-2','Discussion Forum Moderator',94,'CLASSROOM','Automated forum management with quality scoring and engagement nudges.','sha256-edu-cl-2'),
  cj(28,'edu-cl-3','Real-Time Polling Engine',93,'CLASSROOM','Live polling with instant visualization and comprehension checks.','sha256-edu-cl-3'),
  cj(29,'edu-cl-4','Participation Scorer',92,'CLASSROOM','Multi-channel participation tracking across discussions, assignments, and activities.','sha256-edu-cl-4'),
  cj(30,'edu-cl-5','Attendance Analytics',92,'CLASSROOM','Pattern-based attendance tracking with early warning for disengagement.','sha256-edu-cl-5'),
];
const LAB_JEWELS: STierEntry[] = [
  cj(31,'edu-lab-1','Virtual Lab Simulator',96,'LAB','Interactive science simulations with realistic parameter controls and data collection.','sha256-edu-lab-1'),
  cj(32,'edu-lab-2','Coding Exercise Generator',95,'LAB','Auto-generated programming exercises with test case validation and hint systems.','sha256-edu-lab-2'),
  cj(33,'edu-lab-3','Sandbox Environment Manager',94,'LAB','Isolated practice environments with state persistence and reset capabilities.','sha256-edu-lab-3'),
  cj(34,'edu-lab-4','Step-by-Step Lab Guide',93,'LAB','Procedural lab guidance with checkpoint validation and safety protocols.','sha256-edu-lab-4'),
  cj(35,'edu-lab-5','Skill Assessment Engine',92,'LAB','Hands-on skill evaluation with rubric-based performance measurement.','sha256-edu-lab-5'),
];
const LIBRARY_JEWELS: STierEntry[] = [
  cj(36,'edu-lib-1','OER Discovery Engine',95,'LIBRARY','Open educational resource discovery with quality scoring and license verification.','sha256-edu-lib-1'),
  cj(37,'edu-lib-2','Citation Manager',94,'LIBRARY','Multi-format citation generation with cross-reference validation.','sha256-edu-lib-2'),
  cj(38,'edu-lib-3','Reading List Curator',93,'LIBRARY','Intelligent reading list assembly with difficulty sequencing.','sha256-edu-lib-3'),
  cj(39,'edu-lib-4','Accessibility Formatter',92,'LIBRARY','Content accessibility conversion for screen readers and assistive technologies.','sha256-edu-lib-4'),
  cj(40,'edu-lib-5','Content Versioning System',92,'LIBRARY','Educational content version control with diff tracking and rollback.','sha256-edu-lib-5'),
];
const MENTOR_JEWELS: STierEntry[] = [
  cj(41,'edu-men-1','At-Risk Student Detector',97,'MENTOR','Multi-signal early warning system for academic and engagement risk.','sha256-edu-men-1'),
  cj(42,'edu-men-2','Intervention Recommender',96,'MENTOR','Evidence-based intervention suggestion with success probability scoring.','sha256-edu-men-2'),
  cj(43,'edu-men-3','Progress Trajectory Analyzer',95,'MENTOR','Learning trajectory modeling with milestone prediction.','sha256-edu-men-3'),
  cj(44,'edu-men-4','Motivation Analysis Engine',94,'MENTOR','Student motivation assessment with engagement pattern analysis.','sha256-edu-men-4'),
  cj(45,'edu-men-5','Retention Predictor',93,'MENTOR','Course completion probability with dropout risk factors.','sha256-edu-men-5'),
];
const PROCTOR_JEWELS: STierEntry[] = [
  cj(46,'edu-pro-1','Plagiarism Detection Engine',96,'PROCTOR','Multi-source plagiarism detection with similarity scoring and source attribution.','sha256-edu-pro-1'),
  cj(47,'edu-pro-2','AI Content Detector',95,'PROCTOR','AI-generated content identification with confidence scoring.','sha256-edu-pro-2'),
  cj(48,'edu-pro-3','Exam Integrity Monitor',94,'PROCTOR','Behavioral pattern analysis during assessments for integrity assurance.','sha256-edu-pro-3'),
  cj(49,'edu-pro-4','Source Attribution Engine',93,'PROCTOR','Traces content origins across databases and web sources.','sha256-edu-pro-4'),
  cj(50,'edu-pro-5','Honor Code Enforcer',92,'PROCTOR','Automated honor code violation detection and reporting workflow.','sha256-edu-pro-5'),
];
const ADVISOR_JEWELS: STierEntry[] = [
  cj(51,'edu-adv-1','Course Recommendation Engine',96,'ADVISOR','Personalized course recommendations based on goals, performance, and prerequisites.','sha256-edu-adv-1'),
  cj(52,'edu-adv-2','Degree Audit System',95,'ADVISOR','Automated degree requirement checking with what-if scenario planning.','sha256-edu-adv-2'),
  cj(53,'edu-adv-3','Schedule Optimizer',94,'ADVISOR','Conflict-free schedule generation with preference balancing.','sha256-edu-adv-3'),
  cj(54,'edu-adv-4','Career Path Aligner',93,'ADVISOR','Maps coursework to career outcomes and industry requirements.','sha256-edu-adv-4'),
  cj(55,'edu-adv-5','Credit Transfer Evaluator',92,'ADVISOR','Cross-institution credit evaluation with equivalency mapping.','sha256-edu-adv-5'),
];
const SCHOLAR_JEWELS: STierEntry[] = [
  cj(56,'edu-sch-1','Literature Review Synthesizer',96,'SCHOLAR_ED','Automated literature review with thematic grouping and gap identification.','sha256-edu-sch-1'),
  cj(57,'edu-sch-2','Hypothesis Generator',95,'SCHOLAR_ED','Research hypothesis generation from literature analysis.','sha256-edu-sch-2'),
  cj(58,'edu-sch-3','Methodology Recommender',94,'SCHOLAR_ED','Research methodology selection based on question type and data availability.','sha256-edu-sch-3'),
  cj(59,'edu-sch-4','Citation Format Engine',93,'SCHOLAR_ED','Multi-style citation formatting with cross-reference validation.','sha256-edu-sch-4'),
  cj(60,'edu-sch-5','Writing Assistance Suite',92,'SCHOLAR_ED','Academic writing support with clarity, coherence, and style checking.','sha256-edu-sch-5'),
];
const COACH_JEWELS: STierEntry[] = [
  cj(61,'edu-coa-1','Skill Progression Tracker',95,'COACH','Competency-based skill tracking with mastery level visualization.','sha256-edu-coa-1'),
  cj(62,'edu-coa-2','Practice Recommendation Engine',94,'COACH','Targeted practice exercise recommendation based on skill gaps.','sha256-edu-coa-2'),
  cj(63,'edu-coa-3','Competency Certification System',93,'COACH','Evidence-based competency certification with portfolio validation.','sha256-edu-coa-3'),
  cj(64,'edu-coa-4','Performance Benchmarking',92,'COACH','Peer and industry benchmark comparison for skill development.','sha256-edu-coa-4'),
  cj(65,'edu-coa-5','Goal Setting Framework',92,'COACH','SMART goal creation with milestone tracking and adjustment.','sha256-edu-coa-5'),
];
const SCRIBE_JEWELS: STierEntry[] = [
  cj(66,'edu-scr-1','Lecture Summarizer',95,'SCRIBE','Real-time lecture summarization with key concept extraction.','sha256-edu-scr-1'),
  cj(67,'edu-scr-2','Flashcard Generator',94,'SCRIBE','Automated flashcard creation from lecture content with spaced repetition integration.','sha256-edu-scr-2'),
  cj(68,'edu-scr-3','Concept Map Builder',93,'SCRIBE','Visual concept mapping with relationship identification.','sha256-edu-scr-3'),
  cj(69,'edu-scr-4','Study Schedule Planner',92,'SCRIBE','Optimal study schedule generation based on exam dates and material difficulty.','sha256-edu-scr-4'),
  cj(70,'edu-scr-5','Key Term Extractor',92,'SCRIBE','Domain-specific terminology extraction with definition sourcing.','sha256-edu-scr-5'),
];
const ARBITER_JEWELS: STierEntry[] = [
  cj(71,'edu-arb-1','Assessment Bias Detector',96,'ARBITER','Statistical bias detection in test items across demographic groups.','sha256-edu-arb-1'),
  cj(72,'edu-arb-2','Fairness Validation Engine',95,'ARBITER','Equitable assessment validation with differential item functioning analysis.','sha256-edu-arb-2'),
  cj(73,'edu-arb-3','Accommodation Manager',94,'ARBITER','Disability accommodation management with compliance tracking.','sha256-edu-arb-3'),
  cj(74,'edu-arb-4','Grading Equity Auditor',93,'ARBITER','Cross-grader equity analysis with bias pattern detection.','sha256-edu-arb-4'),
  cj(75,'edu-arb-5','Reliability Analyzer',92,'ARBITER','Assessment reliability measurement with Cronbach alpha and test-retest analysis.','sha256-edu-arb-5'),
];
const HERALD_JEWELS: STierEntry[] = [
  cj(76,'edu-her-1','Learning Analytics Dashboard',96,'HERALD_ED','Comprehensive learning analytics with outcome correlation and trend visualization.','sha256-edu-her-1'),
  cj(77,'edu-her-2','Engagement Metrics Engine',95,'HERALD_ED','Multi-channel engagement measurement with actionable insights.','sha256-edu-her-2'),
  cj(78,'edu-her-3','Course Effectiveness Analyzer',94,'HERALD_ED','Course design effectiveness measurement with improvement recommendations.','sha256-edu-her-3'),
  cj(79,'edu-her-4','Completion Analysis System',93,'HERALD_ED','Module-level completion analysis with bottleneck identification.','sha256-edu-her-4'),
  cj(80,'edu-her-5','Outcome Measurement Framework',92,'HERALD_ED','Learning outcome attainment tracking with competency mapping.','sha256-edu-her-5'),
];

const COMPOUND_JEWELS: STierEntry[] = [
  cj(81,'edu-cx-1','Adaptive Assessment Pipeline',97,'SYLLABUS×QUIZ','End-to-end adaptive assessment from curriculum to test generation.','sha256-edu-cx-1'),
  cj(82,'edu-cx-2','Intelligent Tutoring System',97,'TUTOR×MENTOR','Complete ITS with gap detection, intervention, and progress tracking.','sha256-edu-cx-2'),
  cj(83,'edu-cx-3','Academic Integrity Pipeline',96,'PROCTOR×GRADE','Integrated integrity verification and grading workflow.','sha256-edu-cx-3'),
  cj(84,'edu-cx-4','Research-to-Curriculum Bridge',95,'SCHOLAR_ED×SYLLABUS','Translates research findings into curriculum improvements.','sha256-edu-cx-4'),
  cj(85,'edu-cx-5','Student Success Predictor',96,'MENTOR×HERALD_ED','Combined analytics and intervention for student success optimization.','sha256-edu-cx-5'),
  cj(86,'edu-cx-6','Personalized Learning Loop',95,'LECTURE×TUTOR×QUIZ','Closed-loop personalized learning with content, tutoring, and assessment.','sha256-edu-cx-6'),
  cj(87,'edu-cx-7','Equity Assurance System',94,'ARBITER×GRADE×PROCTOR','Full equity pipeline from assessment creation to grading.','sha256-edu-cx-7'),
  cj(88,'edu-cx-8','Lab-to-Credential Pipeline',94,'LAB×COACH','Hands-on lab completion to competency certification pathway.','sha256-edu-cx-8'),
  cj(89,'edu-cx-9','Knowledge Synthesis Engine',93,'LIBRARY×SCHOLAR_ED×SCRIBE','Complete research-to-notes knowledge synthesis workflow.','sha256-edu-cx-9'),
];

export const EDUCATION_CROWN_JEWELS: STierEntry[] = [
  ...SYLLABUS_JEWELS, ...LECTURE_JEWELS, ...QUIZ_JEWELS, ...TUTOR_JEWELS,
  ...GRADE_JEWELS, ...CLASSROOM_JEWELS, ...LAB_JEWELS, ...LIBRARY_JEWELS,
  ...MENTOR_JEWELS, ...PROCTOR_JEWELS, ...ADVISOR_JEWELS, ...SCHOLAR_JEWELS,
  ...COACH_JEWELS, ...SCRIBE_JEWELS, ...ARBITER_JEWELS, ...HERALD_JEWELS,
  ...COMPOUND_JEWELS,
];

export function getEducationJewelsByPrimitive(primitiveId: string): STierEntry[] {
  const upper = primitiveId.toUpperCase();
  return EDUCATION_CROWN_JEWELS.filter(j => j.module.toUpperCase() === upper || j.module.toUpperCase().includes(upper));
}

export function getEducationJewelSummary() {
  return { total: EDUCATION_CROWN_JEWELS.length, engines: 40, agents: 40, compound: 9, avgCjpi: Math.round(EDUCATION_CROWN_JEWELS.reduce((s, j) => s + j.cjpi, 0) / EDUCATION_CROWN_JEWELS.length), version: '1.0.0' };
}
