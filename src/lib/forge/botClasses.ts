/**
 * Cognitive Bot Class Definitions
 * D-Mode Forge — Multi-Class Manufacturing
 */

export interface BotCapability {
  id: string;
  name: string;
  description: string;
  methodName: string;
}

export interface BotClass {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  capabilities: BotCapability[];
}

export const BOT_CLASSES: BotClass[] = [
  {
    id: 'Research',
    name: 'Research Cognitive',
    description: 'Autonomous research agent with web search, summarization, and knowledge graph building',
    color: 'cyan',
    icon: 'Search',
    capabilities: [
      { id: 'web.research', name: 'Web Research', description: 'Search and extract information from the web', methodName: 'research' },
      { id: 'summarize', name: 'Summarize', description: 'Condense content into key points', methodName: 'summarize' },
      { id: 'compare.sources', name: 'Compare Sources', description: 'Analyze and compare multiple sources', methodName: 'compareSources' },
      { id: 'report.write', name: 'Write Reports', description: 'Generate structured reports', methodName: 'writeReport' },
      { id: 'thread.track', name: 'Track Threads', description: 'Monitor ongoing research threads', methodName: 'trackThreads' },
      { id: 'graph.build', name: 'Build Knowledge Graph', description: 'Construct knowledge relationships', methodName: 'buildGraph' },
      { id: 'continuous.learn', name: 'Continuous Learning', description: '24/7 learning from interactions', methodName: 'continuousLearn' },
      { id: 'retain.longterm', name: 'Long-Term Retention', description: 'Persist memories across sessions', methodName: 'remember' },
    ],
  },
  {
    id: 'Coding',
    name: 'Coding Cognitive',
    description: 'Code analysis, generation, and refactoring with hallucination guards',
    color: 'emerald',
    icon: 'Code',
    capabilities: [
      { id: 'code.read', name: 'Code Read', description: 'Parse and understand code', methodName: 'readCode' },
      { id: 'code.write', name: 'Code Write', description: 'Generate new code', methodName: 'writeCode' },
      { id: 'code.refactor', name: 'Code Refactor', description: 'Improve existing code', methodName: 'refactorCode' },
      { id: 'code.explain', name: 'Code Explain', description: 'Explain code functionality', methodName: 'explainCode' },
      { id: 'code.test.suggest', name: 'Test Suggestions', description: 'Suggest test cases', methodName: 'suggestTests' },
      { id: 'code.memory.learn', name: 'Code Memory', description: 'Learn from prior code', methodName: 'learnFromCode' },
      { id: 'api.learn', name: 'API Learning', description: 'Learn from API interactions', methodName: 'learnFromAPI' },
      { id: 'hallucination.guard', name: 'Hallucination Guard', description: 'Prevent fake APIs/libs', methodName: 'guardHallucination' },
      { id: 'fragmentation.resolve', name: 'Fragmentation Resolve', description: 'Fix broken logic', methodName: 'resolveFragmentation' },
    ],
  },
  {
    id: 'Analyst',
    name: 'Analyst Cognitive',
    description: 'Data analysis, insights extraction, and decision support',
    color: 'violet',
    icon: 'BarChart3',
    capabilities: [
      { id: 'data.ingest', name: 'Data Ingest', description: 'Import and process data', methodName: 'ingestData' },
      { id: 'data.compare', name: 'Data Compare', description: 'Compare datasets', methodName: 'compareData' },
      { id: 'data.summarize', name: 'Data Summarize', description: 'Summarize data patterns', methodName: 'summarizeData' },
      { id: 'insight.extract', name: 'Extract Insights', description: 'Derive actionable insights', methodName: 'extractInsights' },
      { id: 'chart.suggest', name: 'Chart Suggestions', description: 'Recommend visualizations', methodName: 'suggestCharts' },
      { id: 'decision.maker', name: 'Decision Maker', description: 'Support decision processes', methodName: 'makeDecision' },
      { id: 'recommendations.generate', name: 'Generate Recommendations', description: 'Produce recommendations', methodName: 'generateRecommendations' },
      { id: 'anomaly.detect', name: 'Anomaly Detection', description: 'Detect data anomalies', methodName: 'detectAnomalies' },
    ],
  },
  {
    id: 'Ops',
    name: 'Ops Cognitive',
    description: 'Process mapping, SOP building, and operational planning',
    color: 'amber',
    icon: 'Workflow',
    capabilities: [
      { id: 'process.map', name: 'Process Mapping', description: 'Map operational processes', methodName: 'mapProcess' },
      { id: 'SOP.build', name: 'SOP Builder', description: 'Create standard procedures', methodName: 'buildSOP' },
      { id: 'tasks.plan', name: 'Task Planning', description: 'Plan and sequence tasks', methodName: 'planTasks' },
      { id: 'checklist.generate', name: 'Checklist Generator', description: 'Generate checklists', methodName: 'generateChecklist' },
      { id: 'risk.assess', name: 'Risk Assessment', description: 'Assess operational risks', methodName: 'assessRisk' },
      { id: 'vendor.compare', name: 'Vendor Comparison', description: 'Compare vendors', methodName: 'compareVendors' },
      { id: 'scheduling.assist', name: 'Scheduling Assist', description: 'Assist with scheduling', methodName: 'assistScheduling' },
      { id: 'notification.escalate', name: 'Notification Escalation', description: 'Escalate notifications', methodName: 'escalateNotification' },
    ],
  },
  {
    id: 'Writing',
    name: 'Writing Cognitive',
    description: 'Long-form writing, editing, and content generation',
    color: 'rose',
    icon: 'PenLine',
    capabilities: [
      { id: 'write.longform', name: 'Long-form Writing', description: 'Write extended content', methodName: 'writeLongform' },
      { id: 'edit.style', name: 'Style Editing', description: 'Edit for style', methodName: 'editStyle' },
      { id: 'rewrite.target', name: 'Target Rewriting', description: 'Rewrite for audience', methodName: 'rewriteTarget' },
      { id: 'persona.apply', name: 'Persona Application', description: 'Apply voice/persona', methodName: 'applyPersona' },
      { id: 'tone.adjust', name: 'Tone Adjustment', description: 'Adjust content tone', methodName: 'adjustTone' },
      { id: 'outlines.build', name: 'Outline Building', description: 'Build content outlines', methodName: 'buildOutline' },
      { id: 'citations.format', name: 'Citation Formatting', description: 'Format citations', methodName: 'formatCitations' },
      { id: 'drafts.persist', name: 'Draft Persistence', description: 'Persist draft versions', methodName: 'persistDraft' },
    ],
  },
  {
    id: 'Hybrid',
    name: 'Hybrid Cognitive',
    description: 'Custom multi-capability cognitive for specialized use cases',
    color: 'fuchsia',
    icon: 'Layers',
    capabilities: [],
  },
];

export const MEMORY_MODES = [
  { id: 'Stateless', name: 'Stateless', description: 'No state between calls', icon: 'Zap' },
  { id: 'Episodic', name: 'Episodic', description: 'Session-only memory', icon: 'Clock' },
  { id: 'Persistent', name: 'Persistent', description: 'Database persistence', icon: 'Database' },
  { id: 'CognitiveGraph', name: 'Cognitive Graph', description: 'Knowledge graph storage', icon: 'GitBranch' },
  { id: 'DreamRetention', name: 'Dream Retention', description: 'Dreams as memory insights', icon: 'Moon' },
] as const;

export const LEARNING_MODES = [
  { id: 'continuous', name: 'Continuous Learning', description: '24/7 learning from all interactions' },
  { id: 'task', name: 'Task Learning', description: 'Learn only during active tasks' },
  { id: 'dream', name: 'Dream Learning', description: 'Learn during sleep cycles' },
  { id: 'supervised', name: 'Supervised Learning', description: 'Learn from operator feedback' },
  { id: 'autodidactic', name: 'Autodidactic', description: 'Self-directed learning from API calls' },
] as const;

export const PROVIDERS = [
  { id: 'Groq', name: 'Groq', tier: 'fast' },
  { id: 'Cerebras', name: 'Cerebras', tier: 'fast' },
  { id: 'SambaNova', name: 'SambaNova', tier: 'fast' },
  { id: 'GPT', name: 'OpenAI GPT', tier: 'premium' },
  { id: 'Claude', name: 'Claude', tier: 'premium' },
  { id: 'Deepseek', name: 'Deepseek', tier: 'standard' },
  { id: 'Mixtral', name: 'Mixtral', tier: 'standard' },
] as const;

export type MemoryMode = typeof MEMORY_MODES[number]['id'];
export type LearningMode = typeof LEARNING_MODES[number]['id'];
export type Provider = typeof PROVIDERS[number]['id'];
export type BotClassId = typeof BOT_CLASSES[number]['id'];

export function getClassById(id: string): BotClass | undefined {
  return BOT_CLASSES.find(c => c.id === id);
}

export function getClassColor(classId: string): string {
  const cls = getClassById(classId);
  return cls?.color || 'gray';
}
