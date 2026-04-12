/**
 * CMPSBL® Education Vertical Substrate
 * 
 * Subdomain: education.cmpsbl.com
 * 
 * The Education Vertical powers cognitive infrastructure for learning platforms,
 * courseware, student assessment, tutoring systems, and educational content delivery.
 *
 * Hot-swapped Engines (8):
 *   SYLLABUS  — Curriculum design and learning path orchestration
 *   LECTURE   — Content delivery, lesson generation, and presentation synthesis
 *   QUIZ      — Assessment generation, adaptive testing, and question banks
 *   TUTOR     — Personalized tutoring with knowledge-gap detection
 *   GRADE     — Automated grading, rubric enforcement, and feedback generation
 *   CLASSROOM — Virtual classroom management and collaboration tools
 *   LAB       — Interactive lab simulations and hands-on exercise generation
 *   LIBRARY   — Educational resource curation, citation management, and content indexing
 *
 * Hot-swapped Agents (8):
 *   MENTOR    — Student progress tracking and intervention recommendations
 *   PROCTOR   — Academic integrity monitoring and plagiarism detection
 *   ADVISOR   — Course recommendation and academic planning
 *   SCHOLAR   — Research assistance, literature review, and knowledge synthesis
 *   COACH     — Skill development tracking and competency assessment
 *   SCRIBE    — Note-taking assistance, summarization, and study guide generation
 *   ARBITER   — Fair assessment validation and bias detection
 *   HERALD_ED — Learning analytics, engagement metrics, and outcome measurement
 *
 * © CMPSBL® — All rights reserved.
 */

import type { VerticalPrimitive, VerticalSubstrateConfig } from '../vertical-substrate';
import { getSpinePrimitives, assembleVerticalPrimitives } from '../vertical-substrate';
import { EDUCATION_CROWN_JEWELS, getEducationJewelsByPrimitive, getEducationJewelSummary } from '@/crownjewels/education-vertical-registry';
import type { STierEntry } from '@/crownjewels/types';

const EDUCATION_ENGINES: VerticalPrimitive[] = [
  { id: 'SYLLABUS', name: 'SYLLABUS', role: 'engine', description: 'Curriculum design and learning path orchestration engine. Creates adaptive course structures, prerequisite maps, competency frameworks, and personalized learning journeys.', inherited: false, replaces: 'CORTEX', capabilities: ['curriculum_design', 'learning_path_generation', 'prerequisite_mapping', 'competency_framework', 'adaptive_sequencing', 'standards_alignment', 'pace_optimization'], weight: 0.035, classification: 'active' },
  { id: 'LECTURE', name: 'LECTURE', role: 'engine', description: 'Content delivery and lesson generation engine. Produces lecture materials, slide decks, interactive presentations, and multi-modal educational content with difficulty calibration.', inherited: false, replaces: 'ARCHITECT', capabilities: ['lesson_generation', 'slide_synthesis', 'interactive_content', 'difficulty_calibration', 'multi_modal_delivery', 'concept_visualization', 'example_generation'], weight: 0.030, classification: 'active' },
  { id: 'QUIZ', name: 'QUIZ', role: 'engine', description: 'Assessment generation and adaptive testing engine. Creates question banks, adaptive tests, formative assessments, and spaced-repetition review sets with item response theory.', inherited: false, capabilities: ['question_generation', 'adaptive_testing', 'item_response_theory', 'spaced_repetition', 'rubric_creation', 'distractor_analysis', 'test_blueprint_design'], weight: 0.030, classification: 'active' },
  { id: 'TUTOR', name: 'TUTOR', role: 'engine', description: 'Personalized tutoring engine with knowledge-gap detection. Provides one-on-one instruction, Socratic questioning, worked examples, and scaffolded problem-solving.', inherited: false, capabilities: ['knowledge_gap_detection', 'socratic_questioning', 'worked_examples', 'scaffolded_learning', 'misconception_identification', 'hint_generation', 'mastery_tracking'], weight: 0.025, classification: 'active' },
  { id: 'GRADE', name: 'GRADE', role: 'engine', description: 'Automated grading and feedback generation engine. Evaluates submissions against rubrics, provides constructive feedback, and maintains grade consistency across sections.', inherited: false, capabilities: ['auto_grading', 'rubric_enforcement', 'feedback_generation', 'grade_calibration', 'peer_review_management', 'late_policy_enforcement', 'grade_analytics'], weight: 0.025, classification: 'active' },
  { id: 'CLASSROOM', name: 'CLASSROOM', role: 'engine', description: 'Virtual classroom management and collaboration engine. Handles breakout rooms, discussion forums, real-time polling, attendance tracking, and group project coordination.', inherited: false, capabilities: ['classroom_management', 'breakout_rooms', 'discussion_forums', 'real_time_polling', 'attendance_tracking', 'group_coordination', 'participation_scoring'], weight: 0.020, classification: 'active' },
  { id: 'LAB', name: 'LAB', role: 'engine', description: 'Interactive lab simulation and hands-on exercise engine. Generates coding exercises, science simulations, virtual labs, and practical skill assessments.', inherited: false, capabilities: ['lab_simulation', 'coding_exercises', 'virtual_experiments', 'skill_assessment', 'sandbox_environments', 'step_by_step_guidance', 'safety_protocols'], weight: 0.020, classification: 'active' },
  { id: 'LIBRARY', name: 'LIBRARY', role: 'engine', description: 'Educational resource curation and content indexing engine. Manages citation databases, reading lists, open educational resources, and cross-references with curriculum standards.', inherited: false, capabilities: ['resource_curation', 'citation_management', 'reading_list_generation', 'oer_indexing', 'content_tagging', 'accessibility_formatting', 'version_control'], weight: 0.015, classification: 'passive' },
];

const EDUCATION_AGENTS: VerticalPrimitive[] = [
  { id: 'MENTOR', name: 'MENTOR', role: 'agent', description: 'Student progress tracking and intervention agent. Monitors learning trajectories, flags at-risk students, and recommends interventions with early warning systems.', inherited: false, capabilities: ['progress_tracking', 'at_risk_detection', 'intervention_recommendation', 'early_warning', 'motivation_analysis', 'retention_prediction'], weight: 0.025, classification: 'active' },
  { id: 'PROCTOR', name: 'PROCTOR', role: 'agent', description: 'Academic integrity monitoring and plagiarism detection agent. Ensures assessment authenticity, detects copied work, and enforces honor code policies.', inherited: false, capabilities: ['plagiarism_detection', 'identity_verification', 'behavior_monitoring', 'honor_code_enforcement', 'ai_content_detection', 'source_attribution'], weight: 0.025, classification: 'passive' },
  { id: 'ADVISOR', name: 'ADVISOR', role: 'agent', description: 'Course recommendation and academic planning agent. Guides students through degree requirements, prerequisite chains, and career-aligned course selection.', inherited: false, capabilities: ['course_recommendation', 'degree_planning', 'prerequisite_validation', 'career_alignment', 'schedule_optimization', 'credit_audit'], weight: 0.025, classification: 'active' },
  { id: 'SCHOLAR_ED', name: 'SCHOLAR', role: 'agent', description: 'Research assistance and knowledge synthesis agent. Helps with literature reviews, citation formatting, hypothesis generation, and methodology selection.', inherited: false, capabilities: ['literature_review', 'citation_formatting', 'hypothesis_generation', 'methodology_selection', 'data_analysis_guidance', 'writing_assistance'], weight: 0.025, classification: 'active' },
  { id: 'COACH', name: 'COACH', role: 'agent', description: 'Skill development tracking and competency assessment agent. Monitors hands-on skill progression, certifies competencies, and recommends practice exercises.', inherited: false, capabilities: ['skill_tracking', 'competency_certification', 'practice_recommendation', 'performance_benchmarking', 'portfolio_building', 'goal_setting'], weight: 0.020, classification: 'active' },
  { id: 'SCRIBE', name: 'SCRIBE', role: 'agent', description: 'Note-taking assistance, summarization, and study guide generation agent. Creates summaries, flashcards, concept maps, and revision materials from lectures.', inherited: false, capabilities: ['note_summarization', 'flashcard_generation', 'concept_mapping', 'revision_materials', 'key_term_extraction', 'study_schedule_planning'], weight: 0.020, classification: 'passive' },
  { id: 'ARBITER', name: 'ARBITER', role: 'agent', description: 'Fair assessment validation and bias detection agent. Audits test items for cultural bias, ensures equitable grading, and validates assessment reliability.', inherited: false, capabilities: ['bias_detection', 'fairness_validation', 'assessment_reliability', 'equitable_grading', 'accommodation_management', 'differential_item_analysis'], weight: 0.020, classification: 'passive' },
  { id: 'HERALD_ED', name: 'HERALD', role: 'agent', description: 'Learning analytics, engagement metrics, and outcome measurement agent. Tracks course effectiveness, student satisfaction, and learning outcome attainment.', inherited: false, capabilities: ['learning_analytics', 'engagement_metrics', 'outcome_measurement', 'course_effectiveness', 'satisfaction_tracking', 'completion_analysis'], weight: 0.020, classification: 'passive' },
];

export function getEducationEngines(): VerticalPrimitive[] { return [...EDUCATION_ENGINES]; }
export function getEducationAgents(): VerticalPrimitive[] { return [...EDUCATION_AGENTS]; }
export function getEducationPrimitives(): VerticalPrimitive[] { return assembleVerticalPrimitives(EDUCATION_ENGINES, EDUCATION_AGENTS); }
export function getAllEducationCapabilities(): string[] { return [...EDUCATION_ENGINES, ...EDUCATION_AGENTS].flatMap(p => p.capabilities); }
export function getEducationCrownJewels(): STierEntry[] { return EDUCATION_CROWN_JEWELS; }
export function getEducationPrimitiveCrownJewels(primitiveId: string): STierEntry[] { return getEducationJewelsByPrimitive(primitiveId); }
export function getEducationCrownJewelSummary() { return getEducationJewelSummary(); }
export function getEducationCrownJewelCount(): number { return EDUCATION_CROWN_JEWELS.length; }
export function getEducationCrownJewelCapabilities(): string[] { return EDUCATION_CROWN_JEWELS.map(j => j.name); }

export function getEducationSubstrate(): VerticalSubstrateConfig {
  return {
    verticalId: 'education-v1',
    name: 'CMPSBL EDUCATION™',
    tagline: 'Cognitive Education Infrastructure — Learning Evolves Itself',
    domain: 'education',
    subdomain: 'education',
    url: 'https://education.cmpsbl.com',
    status: 'active',
    version: '1.0.0',
    primitives: getEducationPrimitives(),
    clmCurriculum: {
      cyclesPerDay: 2400,
      curriculum: ['adaptive_learning_pipelines', 'assessment_generation', 'student_analytics', 'curriculum_optimization', 'content_delivery', 'integrity_enforcement', 'competency_tracking', 'resource_curation'],
      priorityPrimitives: ['SYLLABUS', 'TUTOR', 'QUIZ', 'MENTOR'],
      batchSize: 4,
    },
    memoryStreamConfig: {
      cycleIntervalHours: 4,
      scannerFocus: ['curriculum_patterns', 'assessment_strategies', 'tutoring_approaches', 'student_engagement', 'learning_outcomes', 'content_effectiveness', 'integrity_patterns', 'analytics_insights'],
      contributesToGlobal: true,
      retentionDays: 365,
    },
    ascensionConfig: {
      maxCapabilities: 20,
      enhancementArchetypes: ['adaptive_learning_hardening', 'assessment_integrity', 'content_pipeline_protection', 'analytics_resilience', 'student_data_security'],
      cjpiWeights: { security: 0.20, performance: 0.25, reliability: 0.30, maintainability: 0.25 },
      collisionPriority: ['SYLLABUS', 'TUTOR', 'QUIZ', 'LECTURE', 'GRADE', 'MENTOR', 'PROCTOR', 'ADVISOR'],
    },
    theme: { primaryHue: 200, icon: 'GraduationCap', gradientAngle: 135, darkAccent: 'hsl(200 80% 55%)', lightAccent: 'hsl(200 65% 45%)' },
    createdAt: '2026-04-12T00:00:00.000Z',
    updatedAt: '2026-04-12T00:00:00.000Z',
  };
}
