/**
 * PromptFluid Brain - Context Classifier
 * Categorizes incoming memory content by type
 */

export type ContextType = 'code' | 'doc' | 'chat' | 'plan';

export interface ClassificationResult {
  context: ContextType;
  confidence: number;
  suggestedPriority: number;
  suggestedTags: Record<string, any>;
}

/**
 * Classify content into appropriate context category
 */
export function classifyContext(content: string, metadata?: Record<string, any>): ClassificationResult {
  const lowerContent = content.toLowerCase();
  
  // Code detection patterns
  const codePatterns = [
    /function\s+\w+\s*\(/,
    /const\s+\w+\s*=/,
    /import\s+.*from/,
    /class\s+\w+/,
    /<\w+.*>/,
    /\{\s*[\w\s:]+\}/,
    /=>/,
    /console\./,
  ];
  
  // Documentation patterns
  const docPatterns = [
    /^#\s+\w+/m,
    /\*\*.*\*\*/,
    /documentation/i,
    /readme/i,
    /guide/i,
    /tutorial/i,
  ];
  
  // Chat/conversation patterns
  const chatPatterns = [
    /^(user|assistant|system):/im,
    /\bask\b.*\bquestion\b/i,
    /\bhow\s+(do|can|should)\b/i,
    /\bwhat\s+is\b/i,
    /\bplease\b/i,
  ];
  
  // Planning patterns
  const planPatterns = [
    /roadmap/i,
    /milestone/i,
    /objective/i,
    /goal/i,
    /strategy/i,
    /architecture/i,
    /design/i,
  ];
  
  let codeScore = 0;
  let docScore = 0;
  let chatScore = 0;
  let planScore = 0;
  
  // Score each category
  codePatterns.forEach(pattern => {
    if (pattern.test(content)) codeScore++;
  });
  
  docPatterns.forEach(pattern => {
    if (pattern.test(content)) docScore++;
  });
  
  chatPatterns.forEach(pattern => {
    if (pattern.test(content)) chatScore++;
  });
  
  planPatterns.forEach(pattern => {
    if (pattern.test(content)) planScore++;
  });
  
  // Check metadata for hints
  if (metadata?.type === 'code' || metadata?.source?.includes('code')) codeScore += 2;
  if (metadata?.type === 'doc' || metadata?.source?.includes('doc')) docScore += 2;
  if (metadata?.type === 'chat' || metadata?.source?.includes('chat')) chatScore += 2;
  if (metadata?.type === 'plan' || metadata?.source?.includes('plan')) planScore += 2;
  
  // Determine winner
  const scores = [
    { context: 'code' as ContextType, score: codeScore },
    { context: 'doc' as ContextType, score: docScore },
    { context: 'chat' as ContextType, score: chatScore },
    { context: 'plan' as ContextType, score: planScore },
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  const winner = scores[0];
  const total = codeScore + docScore + chatScore + planScore;
  const confidence = total > 0 ? winner.score / total : 0.5;
  
  // Assign priority based on context
  const priorityMap: Record<ContextType, number> = {
    code: 8,      // Code is highest priority
    plan: 7,      // Plans are important
    doc: 6,       // Documentation is moderately important
    chat: 5,      // Chat is lower priority
  };
  
  // Generate suggested tags
  const suggestedTags: Record<string, any> = {
    confidence,
    auto_classified: true,
    timestamp: new Date().toISOString(),
  };
  
  if (metadata) {
    suggestedTags.source_module = metadata.source_module || 'unknown';
    if (metadata.origin) suggestedTags.origin = metadata.origin;
    if (metadata.affects) suggestedTags.affects = metadata.affects;
  }
  
  return {
    context: winner.context,
    confidence,
    suggestedPriority: priorityMap[winner.context],
    suggestedTags,
  };
}

/**
 * Extract goal reference from content or use default
 */
export function extractGoalRef(content: string, defaultGoal: string = 'make PromptFluid profitable'): string {
  const goalPatterns = [
    /goal:\s*([^\n]+)/i,
    /objective:\s*([^\n]+)/i,
    /aim:\s*([^\n]+)/i,
    /target:\s*([^\n]+)/i,
  ];
  
  for (const pattern of goalPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return defaultGoal;
}

/**
 * Extract causal links from tags
 */
export function extractCausalLinks(metadata?: Record<string, any>): {
  origin?: string;
  affects?: string[];
} {
  return {
    origin: metadata?.origin,
    affects: Array.isArray(metadata?.affects) ? metadata.affects : undefined,
  };
}
