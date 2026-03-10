/**
 * DECODE Module — Natural Language Understanding & Intent Resolution
 * Substrate Interpreter Layer
 * 
 * Provides:
 * - Natural language parsing to structured commands
 * - Intent classification and entity extraction
 * - Context-aware command resolution
 * - Fuzzy matching for terminal commands
 * - Multi-language support foundations
 * - Contract-based command validation
 */

// ============ Types ============

export type IntentConfidence = 'high' | 'medium' | 'low' | 'ambiguous';
export type CommandCategory = 'query' | 'mutation' | 'navigation' | 'system' | 'meta';

export interface ParsedIntent {
  raw: string;
  intent: string;
  confidence: IntentConfidence;
  confidence_score: number;
  entities: Record<string, unknown>;
  category: CommandCategory;
  suggested_command?: string;
  alternatives?: string[];
}

export interface Entity {
  type: string;
  value: string;
  start: number;
  end: number;
  confidence: number;
}

export interface CommandMatch {
  command: string;
  module: string;
  action: string;
  similarity: number;
  params: Record<string, unknown>;
}

export interface DecodeContext {
  previous_commands: string[];
  current_module?: string;
  user_preferences?: Record<string, unknown>;
  session_entities?: Record<string, unknown>;
}

// ============ Intent Patterns ============

const INTENT_PATTERNS: Record<string, RegExp[]> = {
  // Query intents
  'query.status': [
    /^(show|get|check|what('?s| is)|display)\s+(the\s+)?(status|state|health)/i,
    /^status(\s+of)?/i,
  ],
  'query.list': [
    /^(list|show|get|display)\s+(all\s+)?(\w+)/i,
    /^what\s+(\w+)\s+(are|do we have)/i,
  ],
  'query.search': [
    /^(search|find|look\s+for|locate)\s+(.+)/i,
    /^where\s+is\s+(.+)/i,
  ],
  
  // Mutation intents
  'mutation.create': [
    /^(create|add|new|make|generate)\s+(.+)/i,
    /^start\s+a?\s*(new\s+)?(.+)/i,
  ],
  'mutation.update': [
    /^(update|change|modify|edit|set)\s+(.+)/i,
    /^make\s+(.+)\s+(be|equal|=)/i,
  ],
  'mutation.delete': [
    /^(delete|remove|drop|destroy|clear)\s+(.+)/i,
    /^get\s+rid\s+of\s+(.+)/i,
  ],
  
  // Navigation intents
  'navigation.goto': [
    /^(go\s+to|navigate\s+to|open|show\s+me)\s+(.+)/i,
    /^take\s+me\s+to\s+(.+)/i,
  ],
  'navigation.back': [
    /^(go\s+)?back/i,
    /^return(\s+to\s+previous)?/i,
  ],
  
  // System intents
  'system.help': [
    /^(help|how\s+do\s+I|what\s+can|commands?)/i,
    /^\?+$/,
  ],
  'system.clear': [
    /^(clear|reset|cls)/i,
  ],
  'system.exit': [
    /^(exit|quit|bye|close)/i,
  ],
};

// ============ Entity Extractors ============

const ENTITY_PATTERNS: Record<string, RegExp> = {
  module: /\b(brain|nexus|vision|dream|defense|access|system|decode|cortex|ripple|evolution|integration|inclusive|core|memory|relay|audit|identity|economy|sandbox|encode|sovereign|conscience|treaty|oracle|compass|echo|reflex|forge|lingua|harvest|phantom|shadow|immunity|intent|governance|engineer|atlas|nerve)\b/i,
  uuid: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  number: /\b(\d+(?:\.\d+)?)\b/,
  date: /\b(\d{4}-\d{2}-\d{2})\b/,
  email: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/,
  url: /https?:\/\/[^\s]+/i,
  quoted: /"([^"]+)"|'([^']+)'/,
};

// ============ Core Functions ============

/**
 * Parse natural language input into structured intent
 */
export function parseIntent(input: string, context?: DecodeContext): ParsedIntent {
  const trimmed = input.trim();
  
  // Check against intent patterns
  let bestMatch: { intent: string; score: number } | null = null;
  
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(trimmed)) {
        const score = calculatePatternScore(trimmed, pattern);
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { intent, score };
        }
      }
    }
  }
  
  // Extract entities
  const entities = extractEntities(trimmed);
  
  // Determine confidence
  const confidence_score = bestMatch?.score || 0;
  const confidence = getConfidenceLevel(confidence_score);
  
  // Determine category
  const category = bestMatch?.intent.split('.')[0] as CommandCategory || 'query';
  
  // Build suggested command
  const suggested_command = buildSuggestedCommand(bestMatch?.intent, entities, context);
  
  return {
    raw: input,
    intent: bestMatch?.intent || 'unknown',
    confidence,
    confidence_score,
    entities,
    category,
    suggested_command,
    alternatives: generateAlternatives(trimmed, bestMatch?.intent),
  };
}

/**
 * Extract entities from input text
 */
export function extractEntities(input: string): Record<string, unknown> {
  const entities: Record<string, unknown> = {};
  
  for (const [type, pattern] of Object.entries(ENTITY_PATTERNS)) {
    const match = input.match(pattern);
    if (match) {
      entities[type] = match[1] || match[0];
    }
  }
  
  return entities;
}

/**
 * Find best matching command from registry
 */
export function matchCommand(
  input: string,
  commands: string[],
  threshold: number = 0.6
): CommandMatch[] {
  const matches: CommandMatch[] = [];
  const normalizedInput = input.toLowerCase().trim();
  
  for (const cmd of commands) {
    const similarity = calculateSimilarity(normalizedInput, cmd.toLowerCase());
    
    if (similarity >= threshold) {
      const [module, action] = cmd.split('.');
      matches.push({
        command: cmd,
        module,
        action,
        similarity,
        params: {},
      });
    }
  }
  
  // Sort by similarity descending
  return matches.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Resolve ambiguous input with context
 */
export function resolveAmbiguity(
  input: string,
  candidates: string[],
  context?: DecodeContext
): string | null {
  if (candidates.length === 0) return null;
  if (candidates.length === 1) return candidates[0];
  
  // Use context to disambiguate
  if (context?.current_module) {
    const moduleMatch = candidates.find(c => 
      c.startsWith(context.current_module + '.')
    );
    if (moduleMatch) return moduleMatch;
  }
  
  // Check recent commands for patterns
  if (context?.previous_commands?.length) {
    const recent = context.previous_commands[0];
    const [recentModule] = recent.split('.');
    const sameModuleMatch = candidates.find(c => c.startsWith(recentModule + '.'));
    if (sameModuleMatch) return sameModuleMatch;
  }
  
  // Default to first (highest similarity)
  return candidates[0];
}

/**
 * Tokenize input for analysis
 */
export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 0);
}

/**
 * Calculate semantic similarity between two strings
 */
export function calculateSimilarity(a: string, b: string): number {
  const tokensA = new Set(tokenize(a));
  const tokensB = new Set(tokenize(b));
  
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  
  const intersection = new Set([...tokensA].filter(x => tokensB.has(x)));
  const union = new Set([...tokensA, ...tokensB]);
  
  // Jaccard similarity + Levenshtein boost for exact matches
  const jaccard = intersection.size / union.size;
  const exactBoost = a === b ? 0.3 : 0;
  
  return Math.min(1, jaccard + exactBoost);
}

// ============ Helper Functions ============

function calculatePatternScore(input: string, pattern: RegExp): number {
  const match = input.match(pattern);
  if (!match) return 0;
  
  // Score based on how much of the input is matched
  const matchLength = match[0].length;
  const inputLength = input.length;
  
  return matchLength / inputLength;
}

function getConfidenceLevel(score: number): IntentConfidence {
  if (score >= 0.8) return 'high';
  if (score >= 0.6) return 'medium';
  if (score >= 0.4) return 'low';
  return 'ambiguous';
}

function buildSuggestedCommand(
  intent: string | undefined,
  entities: Record<string, unknown>,
  context?: DecodeContext
): string | undefined {
  if (!intent) return undefined;
  
  const [category, action] = intent.split('.');
  const module = entities.module as string || context?.current_module || 'core';
  
  switch (category) {
    case 'query':
      return `${module}.${action || 'status'}`;
    case 'mutation':
      return `${module}.${action}`;
    case 'navigation':
      return `navigate.${entities.module || 'dashboard'}`;
    case 'system':
      return `system.${action}`;
    default:
      return undefined;
  }
}

function generateAlternatives(input: string, matchedIntent?: string): string[] {
  const alternatives: string[] = [];
  const tokens = tokenize(input);
  
  // Generate module.action combinations from tokens
  const modules = ['brain', 'nexus', 'vision', 'dream', 'system', 'access', 'memory', 'relay', 'audit', 'identity', 'economy', 'sandbox', 'encode'];
  
  for (const token of tokens) {
    for (const module of modules) {
      if (calculateSimilarity(token, module) > 0.5) {
        alternatives.push(`${module}.status`);
        alternatives.push(`${module}.help`);
      }
    }
  }
  
  return alternatives.slice(0, 5);
}

// ============ Contract Integration ============

export interface DecodeContract {
  command: string;
  required_params: string[];
  optional_params: string[];
  param_types: Record<string, string>;
  description: string;
  examples: string[];
}

/**
 * Validate parsed command against contract
 */
export function validateAgainstContract(
  parsed: ParsedIntent,
  contract: DecodeContract
): { valid: boolean; missing: string[]; errors: string[] } {
  const missing: string[] = [];
  const errors: string[] = [];
  
  // Check required params
  for (const param of contract.required_params) {
    if (!(param in parsed.entities)) {
      missing.push(param);
    }
  }
  
  // Type check params
  for (const [param, value] of Object.entries(parsed.entities)) {
    const expectedType = contract.param_types[param];
    if (expectedType && typeof value !== expectedType) {
      errors.push(`${param} should be ${expectedType}, got ${typeof value}`);
    }
  }
  
  return {
    valid: missing.length === 0 && errors.length === 0,
    missing,
    errors,
  };
}

// ============ Module Metadata ============

import { SUBSTRATE_EPOCH as _DE } from '@/lib/substrate/versions';
export const DECODE_VERSION = _DE;
export const DECODE_CODENAME = 'Interpreter';

export interface DecodeModuleStatus {
  version: string;
  patterns_loaded: number;
  entity_types: string[];
  last_parse?: ParsedIntent;
}

export function getDecodeStatus(): DecodeModuleStatus {
  return {
    version: DECODE_VERSION,
    patterns_loaded: Object.keys(INTENT_PATTERNS).length,
    entity_types: Object.keys(ENTITY_PATTERNS),
  };
}
 
 // Context engine
 export * from './contextEngine';
