/**
 * CodeAgent Discussion Mode — Pre-Change Dialog System
 * Clarifying questions, impact preview, approval gates
 * 
 * Mirrors the human agent workflow: discuss before implementing
 */

// ═══════════════════════════════════════════════════════════════
// DISCUSSION TYPES
// ═══════════════════════════════════════════════════════════════

export interface ClarifyingQuestion {
  id: string;
  question: string;
  type: 'choice' | 'confirm' | 'input' | 'multi-choice';
  options?: string[];
  required: boolean;
  answered: boolean;
  answer?: string | string[] | boolean;
}

export interface ImpactPreview {
  filesAffected: Array<{
    path: string;
    operation: 'create' | 'modify' | 'delete';
    reason: string;
  }>;
  modulesImpacted: string[];
  risksIdentified: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  estimatedDuration: string;
  breakingChanges: boolean;
  suggestedApproach: string;
}

export interface ApprovalGate {
  id: string;
  stage: 'pre-analysis' | 'pre-write' | 'pre-submit';
  description: string;
  approved: boolean;
  approvedAt?: Date;
  skippable: boolean;
}

export interface DiscussionState {
  active: boolean;
  mode: 'clarify' | 'preview' | 'approve' | 'complete';
  questions: ClarifyingQuestion[];
  pendingQuestions: number;
  impactPreview: ImpactPreview | null;
  approvalGates: ApprovalGate[];
  context: Record<string, unknown>;
  startedAt: Date | null;
}

// ═══════════════════════════════════════════════════════════════
// STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

let discussionState: DiscussionState = createInitialDiscussionState();

function createInitialDiscussionState(): DiscussionState {
  return {
    active: false,
    mode: 'clarify',
    questions: [],
    pendingQuestions: 0,
    impactPreview: null,
    approvalGates: [],
    context: {},
    startedAt: null,
  };
}

export function getDiscussionState(): DiscussionState {
  return { ...discussionState };
}

export function resetDiscussion(): void {
  discussionState = createInitialDiscussionState();
}

// ═══════════════════════════════════════════════════════════════
// QUESTION GENERATION — Context-Aware Clarifications
// ═══════════════════════════════════════════════════════════════

interface RequestAnalysis {
  module: string;
  changeType: string;
  description: string;
  hasAmbiguity: boolean;
  needsClarification: string[];
  confidence: number;
}

export function analyzeRequest(input: string): RequestAnalysis {
  const modules = ['brain', 'defense', 'nexus', 'vision', 'dream', 'system', 'core', 'ripple', 'access', 'decode', 'evolution'];
  const changeTypes = ['edge_function', 'config_update', 'prompt_refinement', 'rate_limit', 'rls_policy', 'react_component', 'react_hook', 'api_client', 'database_migration', 'test_suite'];
  
  const lowerInput = input.toLowerCase();
  const foundModule = modules.find(m => lowerInput.includes(m));
  const foundType = changeTypes.find(t => lowerInput.includes(t.replace('_', ' ')));
  
  const needsClarification: string[] = [];
  
  if (!foundModule) needsClarification.push('target_module');
  if (!foundType) needsClarification.push('change_type');
  if (lowerInput.length < 30) needsClarification.push('more_details');
  if (lowerInput.includes('update') || lowerInput.includes('change')) needsClarification.push('scope');
  if (lowerInput.includes('fix') || lowerInput.includes('bug')) needsClarification.push('issue_details');
  
  const hasAmbiguity = needsClarification.length > 0;
  const confidence = hasAmbiguity ? 0.5 + (0.5 * (1 - needsClarification.length / 5)) : 0.9;
  
  return {
    module: foundModule || 'system',
    changeType: foundType || 'edge_function',
    description: input,
    hasAmbiguity,
    needsClarification,
    confidence,
  };
}

export function generateClarifyingQuestions(analysis: RequestAnalysis): ClarifyingQuestion[] {
  const questions: ClarifyingQuestion[] = [];
  
  if (analysis.needsClarification.includes('target_module')) {
    questions.push({
      id: 'q_module',
      question: 'Which module should this change target?',
      type: 'choice',
      options: ['brain', 'defense', 'nexus', 'vision', 'dream', 'system', 'core', 'decode', 'evolution'],
      required: true,
      answered: false,
    });
  }
  
  if (analysis.needsClarification.includes('change_type')) {
    questions.push({
      id: 'q_change_type',
      question: 'What type of change do you need?',
      type: 'choice',
      options: [
        'Edge Function — Backend logic',
        'React Component — UI element',
        'React Hook — State/data logic',
        'Config Update — Settings/parameters',
        'RLS Policy — Database security',
        'Rate Limiter — Traffic control',
      ],
      required: true,
      answered: false,
    });
  }
  
  if (analysis.needsClarification.includes('more_details')) {
    questions.push({
      id: 'q_details',
      question: 'Could you provide more details about what this should do?',
      type: 'input',
      required: true,
      answered: false,
    });
  }
  
  if (analysis.needsClarification.includes('scope')) {
    questions.push({
      id: 'q_scope',
      question: 'Should this be a minimal change or a comprehensive update?',
      type: 'choice',
      options: ['Minimal — Just what\'s needed', 'Moderate — Include related improvements', 'Comprehensive — Full feature with tests'],
      required: false,
      answered: false,
    });
  }
  
  if (analysis.needsClarification.includes('issue_details')) {
    questions.push({
      id: 'q_issue',
      question: 'Can you describe the issue you\'re seeing?',
      type: 'input',
      required: true,
      answered: false,
    });
  }
  
  return questions;
}

// ═══════════════════════════════════════════════════════════════
// IMPACT PREVIEW — Show What Will Change
// ═══════════════════════════════════════════════════════════════

const MODULE_FILE_MAP: Record<string, string[]> = {
  brain: ['src/lib/substrate.ts', 'src/hooks/useSubstrate.ts', 'supabase/functions/pf-substrate/index.ts'],
  defense: ['src/lib/codeagent/circuit-breaker.ts', 'src/lib/codeagent/executor.ts', 'supabase/functions/pf-substrate/index.ts'],
  decode: ['src/components/substrate-os/DecodeTab.tsx', 'src/lib/substrate.ts'],
  nexus: ['src/lib/nexus/', 'src/components/substrate-os/NexusTab.tsx'],
  vision: ['src/components/substrate-os/VisionTab.tsx', 'src/hooks/useSubstrate.ts'],
  evolution: ['src/lib/evolve/', 'src/lib/substrate/evolution-cycle.ts'],
  system: ['src/lib/substrate.ts', 'src/config/'],
  core: ['src/lib/codeagent/', 'src/config/'],
  dream: ['src/lib/substrate.ts', 'supabase/functions/pf-substrate/index.ts'],
  ripple: ['src/lib/substrate.ts', 'supabase/functions/pf-substrate/index.ts'],
  access: ['src/lib/substrate.ts', 'supabase/functions/pf-substrate/index.ts'],
};

const CHANGE_TYPE_RISKS: Record<string, string[]> = {
  edge_function: ['May require new secrets/env vars', 'Affects backend behavior', 'Needs deployment'],
  config_update: ['May change runtime behavior', 'Could affect multiple modules'],
  rls_policy: ['Security-critical change', 'Affects data access', 'Requires thorough testing'],
  rate_limit: ['May affect API availability', 'Could block legitimate requests'],
  react_component: ['UI changes visible to users', 'May affect layout'],
  react_hook: ['May affect component re-renders', 'Could introduce memory leaks if misused'],
  database_migration: ['Irreversible without backup', 'May require data migration'],
};

export function generateImpactPreview(
  module: string,
  changeType: string,
  description: string
): ImpactPreview {
  const relatedFiles = MODULE_FILE_MAP[module] || ['src/lib/substrate.ts'];
  const risks = CHANGE_TYPE_RISKS[changeType] || ['Standard change risk'];
  
  // Determine if this affects multiple modules
  const crossModuleKeywords = ['integration', 'shared', 'global', 'all modules', 'system-wide'];
  const affectsMultiple = crossModuleKeywords.some(kw => description.toLowerCase().includes(kw));
  
  const filesAffected: Array<{ path: string; operation: 'create' | 'modify' | 'delete'; reason: string }> = relatedFiles.map(path => ({
    path,
    operation: 'modify' as const,
    reason: `Required for ${changeType} in ${module}`,
  }));
  
  // Add new file if creating
  if (['edge_function', 'react_component', 'react_hook'].includes(changeType)) {
    const newPath = changeType === 'edge_function' 
      ? `supabase/functions/${module}-new/index.ts`
      : `src/components/${module}/${changeType.replace('_', '-')}.tsx`;
    filesAffected.unshift({
      path: newPath,
      operation: 'create' as const,
      reason: `New ${changeType.replace('_', ' ')} for ${description.slice(0, 50)}...`,
    });
  }
  
  const complexityScore = 
    filesAffected.length > 3 ? 'high' :
    filesAffected.length > 1 ? 'medium' : 'low';
  
  return {
    filesAffected,
    modulesImpacted: affectsMultiple ? [module, 'system', 'core'] : [module],
    risksIdentified: risks,
    estimatedComplexity: complexityScore,
    estimatedDuration: complexityScore === 'high' ? '5-10 minutes' : complexityScore === 'medium' ? '2-5 minutes' : '< 2 minutes',
    breakingChanges: ['rls_policy', 'database_migration'].includes(changeType),
    suggestedApproach: getSuggestedApproach(changeType, complexityScore),
  };
}

function getSuggestedApproach(changeType: string, complexity: string): string {
  const approaches: Record<string, string> = {
    edge_function: 'Create function → Test locally → Deploy → Verify logs',
    react_component: 'Create component → Add to page → Test rendering → Polish styling',
    react_hook: 'Create hook → Add tests → Integrate into components',
    config_update: 'Update config → Verify type safety → Test affected features',
    rls_policy: 'Draft policy → Review access patterns → Apply to staging → Production',
    rate_limit: 'Configure limits → Add monitoring → Test edge cases',
    database_migration: 'Backup data → Apply migration → Verify schema → Update types',
  };
  
  return approaches[changeType] || 'Analyze → Implement → Test → Deploy';
}

// ═══════════════════════════════════════════════════════════════
// APPROVAL GATES — Explicit Confirmation Before Actions
// ═══════════════════════════════════════════════════════════════

export function createApprovalGates(preview: ImpactPreview): ApprovalGate[] {
  const gates: ApprovalGate[] = [];
  
  // Always require pre-analysis approval for clarity
  gates.push({
    id: 'gate_analysis',
    stage: 'pre-analysis',
    description: `Proceed with ${preview.estimatedComplexity} complexity change affecting ${preview.filesAffected.length} file(s)?`,
    approved: false,
    skippable: preview.estimatedComplexity === 'low',
  });
  
  // Pre-write gate for medium+ complexity
  if (preview.estimatedComplexity !== 'low') {
    gates.push({
      id: 'gate_write',
      stage: 'pre-write',
      description: 'Review the generated code before applying?',
      approved: false,
      skippable: false,
    });
  }
  
  // Pre-submit gate for breaking changes
  if (preview.breakingChanges) {
    gates.push({
      id: 'gate_submit',
      stage: 'pre-submit',
      description: '⚠️ This includes breaking changes. Confirm final submission?',
      approved: false,
      skippable: false,
    });
  }
  
  return gates;
}

// ═══════════════════════════════════════════════════════════════
// DISCUSSION FLOW ORCHESTRATION
// ═══════════════════════════════════════════════════════════════

export interface DiscussionStep {
  type: 'question' | 'preview' | 'approval' | 'proceed';
  content: ClarifyingQuestion | ImpactPreview | ApprovalGate | null;
  message: string;
}

export function startDiscussion(input: string): DiscussionStep {
  const analysis = analyzeRequest(input);
  discussionState.active = true;
  discussionState.startedAt = new Date();
  discussionState.context = { originalInput: input, analysis };
  
  // Be more lenient - only ask questions for very low confidence
  if (analysis.hasAmbiguity && analysis.confidence < 0.5) {
    // Need clarification first - but only for truly ambiguous requests
    discussionState.mode = 'clarify';
    discussionState.questions = generateClarifyingQuestions(analysis);
    discussionState.pendingQuestions = discussionState.questions.filter(q => q.required).length;
    
    // If we have a module and can infer the rest, skip questions
    if (analysis.module !== 'system' || input.length > 50) {
      return skipToPreview(analysis.module, analysis.changeType, analysis.description);
    }
    
    const firstQuestion = discussionState.questions[0];
    return {
      type: 'question',
      content: firstQuestion,
      message: formatQuestionMessage(firstQuestion),
    };
  }
  
  // Good enough confidence — skip directly to proceed (no preview gate)
  if (analysis.confidence >= 0.7) {
    discussionState.mode = 'complete';
    return {
      type: 'proceed',
      content: null,
      message: `📋 **Got it!** I'll work on: *${analysis.description.slice(0, 100)}*\n\nModule: **${analysis.module}** | Type: **${analysis.changeType.replace('_', ' ')}**\n\nStarting workflow...`,
    };
  }
  
  // Medium confidence — show preview but auto-approve for low complexity
  return skipToPreview(analysis.module, analysis.changeType, analysis.description);
}

export function answerQuestion(questionId: string, answer: string | string[] | boolean): DiscussionStep {
  const question = discussionState.questions.find(q => q.id === questionId);
  if (!question) {
    return { type: 'proceed', content: null, message: 'Question not found, proceeding...' };
  }
  
  question.answered = true;
  question.answer = answer;
  
  // Update context based on answer
  if (questionId === 'q_module' && typeof answer === 'string') {
    (discussionState.context as any).module = answer.toLowerCase();
  }
  if (questionId === 'q_change_type' && typeof answer === 'string') {
    const typeMap: Record<string, string> = {
      'Edge Function': 'edge_function',
      'React Component': 'react_component',
      'React Hook': 'react_hook',
      'Config Update': 'config_update',
      'RLS Policy': 'rls_policy',
      'Rate Limiter': 'rate_limit',
    };
    const key = Object.keys(typeMap).find(k => answer.includes(k));
    (discussionState.context as any).changeType = key ? typeMap[key] : 'edge_function';
  }
  if (questionId === 'q_details' && typeof answer === 'string') {
    (discussionState.context as any).additionalDetails = answer;
  }
  
  // Check for next unanswered required question
  const nextQuestion = discussionState.questions.find(q => q.required && !q.answered);
  if (nextQuestion) {
    discussionState.pendingQuestions--;
    return {
      type: 'question',
      content: nextQuestion,
      message: formatQuestionMessage(nextQuestion),
    };
  }
  
  // All questions answered — move to preview
  const ctx = discussionState.context as any;
  const module = ctx.module || ctx.analysis?.module || 'system';
  const changeType = ctx.changeType || ctx.analysis?.changeType || 'edge_function';
  const description = ctx.additionalDetails 
    ? `${ctx.originalInput}. ${ctx.additionalDetails}`
    : ctx.originalInput;
  
  return skipToPreview(module, changeType, description);
}

function skipToPreview(module: string, changeType: string, description: string): DiscussionStep {
  discussionState.mode = 'preview';
  const preview = generateImpactPreview(module, changeType, description);
  discussionState.impactPreview = preview;
  discussionState.approvalGates = createApprovalGates(preview);
  
  return {
    type: 'preview',
    content: preview,
    message: formatPreviewMessage(preview),
  };
}

export function approveGate(gateId: string): DiscussionStep {
  const gate = discussionState.approvalGates.find(g => g.id === gateId);
  if (!gate) {
    return { type: 'proceed', content: null, message: 'Gate not found, proceeding...' };
  }
  
  gate.approved = true;
  gate.approvedAt = new Date();
  
  // Check for next unapproved gate
  const nextGate = discussionState.approvalGates.find(g => !g.approved && !g.skippable);
  if (nextGate) {
    discussionState.mode = 'approve';
    return {
      type: 'approval',
      content: nextGate,
      message: formatApprovalMessage(nextGate),
    };
  }
  
  // All gates passed — ready to proceed
  discussionState.mode = 'complete';
  return {
    type: 'proceed',
    content: null,
    message: '✅ **All approvals received.** Starting code generation...',
  };
}

export function skipQuestion(questionId: string): DiscussionStep {
  const question = discussionState.questions.find(q => q.id === questionId);
  if (question && !question.required) {
    question.answered = true;
    question.answer = undefined;
  }
  
  // Find next question or move on
  const nextQuestion = discussionState.questions.find(q => !q.answered);
  if (nextQuestion) {
    return { type: 'question', content: nextQuestion, message: formatQuestionMessage(nextQuestion) };
  }
  
  const ctx = discussionState.context as any;
  return skipToPreview(
    ctx.module || 'system',
    ctx.changeType || 'edge_function',
    ctx.originalInput || ''
  );
}

// ═══════════════════════════════════════════════════════════════
// MESSAGE FORMATTING
// ═══════════════════════════════════════════════════════════════

function formatQuestionMessage(question: ClarifyingQuestion): string {
  const required = question.required ? '*(required)*' : '*(optional)*';
  
  if (question.type === 'choice' && question.options) {
    const optionsList = question.options.map((o, i) => `${i + 1}. ${o}`).join('\n');
    return `🤔 **Clarification Needed** ${required}\n\n${question.question}\n\n${optionsList}\n\n*Reply with the number or option text*`;
  }
  
  if (question.type === 'confirm') {
    return `🤔 **Confirmation** ${required}\n\n${question.question}\n\n*Reply "yes" or "no"*`;
  }
  
  return `🤔 **Clarification Needed** ${required}\n\n${question.question}\n\n*Type your response below*`;
}

function formatPreviewMessage(preview: ImpactPreview): string {
  const filesList = preview.filesAffected
    .map(f => `- \`${f.path}\` → ${f.operation}`)
    .join('\n');
  
  const risksList = preview.risksIdentified.map(r => `- ⚠️ ${r}`).join('\n');
  
  const complexityBadge = 
    preview.estimatedComplexity === 'high' ? '🔴 High' :
    preview.estimatedComplexity === 'medium' ? '🟡 Medium' : '🟢 Low';
  
  return `📋 **Impact Preview**\n\n` +
    `**Files Affected:**\n${filesList}\n\n` +
    `**Modules Impacted:** ${preview.modulesImpacted.join(', ')}\n\n` +
    `**Risks:**\n${risksList}\n\n` +
    `**Complexity:** ${complexityBadge}\n` +
    `**Estimated Time:** ${preview.estimatedDuration}\n` +
    `${preview.breakingChanges ? '⚠️ **Contains Breaking Changes**\n' : ''}` +
    `\n**Suggested Approach:** ${preview.suggestedApproach}\n\n` +
    `*Reply "proceed" to continue or "cancel" to abort*`;
}

function formatApprovalMessage(gate: ApprovalGate): string {
  const skippable = gate.skippable ? '\n*Reply "skip" to bypass this gate*' : '';
  return `🔐 **Approval Required** (${gate.stage})\n\n${gate.description}\n\n*Reply "approve" to continue*${skippable}`;
}

// ═══════════════════════════════════════════════════════════════
// DISCUSSION COMPLETION — Get Final Context
// ═══════════════════════════════════════════════════════════════

export interface FinalizedRequest {
  module: string;
  changeType: string;
  description: string;
  additionalContext: Record<string, unknown>;
  approvedAt: Date;
  discussionDuration: number;
}

export function finalizeDiscussion(): FinalizedRequest | null {
  if (!discussionState.active || discussionState.mode !== 'complete') {
    return null;
  }
  
  const ctx = discussionState.context as any;
  const startedAt = discussionState.startedAt || new Date();
  
  const result: FinalizedRequest = {
    module: ctx.module || ctx.analysis?.module || 'system',
    changeType: ctx.changeType || ctx.analysis?.changeType || 'edge_function',
    description: ctx.additionalDetails 
      ? `${ctx.originalInput}. ${ctx.additionalDetails}`
      : ctx.originalInput || '',
    additionalContext: {
      questions: discussionState.questions.filter(q => q.answered).map(q => ({ id: q.id, answer: q.answer })),
      impactPreview: discussionState.impactPreview,
    },
    approvedAt: new Date(),
    discussionDuration: Date.now() - startedAt.getTime(),
  };
  
  // Reset for next discussion
  resetDiscussion();
  
  return result;
}

export function isDiscussionActive(): boolean {
  return discussionState.active;
}

export function getDiscussionMode(): DiscussionState['mode'] {
  return discussionState.mode;
}
