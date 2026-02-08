/**
 * promptfluid® Decode Contract Implementation
 * v8.0.0 — SYNERGY+ Epoch Substrate Interpreter Primitive
 * 
 * This implements the Decode contract as defined in the RFC.
 * Decode is non-executive, epistemic, reflective, translational, and non-anthropomorphic.
 */

import { 
  DecodeContract, 
  EpistemicContract, 
  ConversationalContract, 
  AuthorityContract,
  DecodeResponse,
  DecodeInput
} from './DecodeContractTypes';
import { substrate } from '../substrate';

/**
 * Epistemic Layer Implementation
 * Handles translation between human language and substrate cognition
 */
const epistemic: EpistemicContract = {
  async describe(input: unknown): Promise<string> {
    const response = await substrate.decode.chat(
      `[DESCRIBE] ${String(input)}`,
      `epistemic_describe_${Date.now()}`
    );
    return (response.data as any)?.reply || String(input);
  },

  async interpret(input: unknown): Promise<string> {
    const response = await substrate.decode.chat(
      `[INTERPRET] ${String(input)}`,
      `epistemic_interpret_${Date.now()}`
    );
    return (response.data as any)?.reply || String(input);
  },

  async reflect(input: unknown): Promise<string> {
    const response = await substrate.decode.chat(
      `[REFLECT] ${String(input)}`,
      `epistemic_reflect_${Date.now()}`
    );
    return (response.data as any)?.reply || String(input);
  },

  async pattern(input: unknown): Promise<string> {
    const response = await substrate.decode.chat(
      `[PATTERN] ${String(input)}`,
      `epistemic_pattern_${Date.now()}`
    );
    return (response.data as any)?.reply || String(input);
  },

  async project(input: unknown): Promise<string> {
    const response = await substrate.decode.chat(
      `[PROJECT] ${String(input)}`,
      `epistemic_project_${Date.now()}`
    );
    return (response.data as any)?.reply || String(input);
  }
};

/**
 * Conversational Layer Implementation
 * Enforces behavioral constraints for non-anthropomorphic output
 */
const conversational: ConversationalContract = {
  format(output: string): string {
    // v8.0.0: Return plain text without cryptic markers for clarity
    return output;
  },
  
  // Decode behavioral constraints
  noImperatives: true,
  noIdentityClaims: true,
  noAgencyClaims: true,
  noSyntheticEmotion: true
};

/**
 * Authority Layer Implementation
 * Routes to substrate modules without execution authority
 */
const authority: AuthorityContract = {
  async toBrain(input: string): Promise<unknown> {
    const response = await substrate.brain.recall(input, 10);
    return response.data;
  },

  async toNexus(input: string): Promise<unknown> {
    const response = await substrate.nexus.route(input);
    return response.data;
  },

  async toDefense(input: string): Promise<unknown> {
    const response = await substrate.defense.analyze({ query: input });
    return response.data;
  },

  async toVision(input: string): Promise<unknown> {
    const response = await substrate.vision.metrics();
    return response.data;
  }
};

/**
 * The Decode Contract
 * Complete implementation of the interpreter primitive
 */
export const decodeContract: DecodeContract = {
  epistemic,
  conversational,
  authority
};

/**
 * Process input through the Decode interpreter
 * This is the primary entry point for Decode operations
 */
export async function processDecodeInput(input: DecodeInput): Promise<DecodeResponse> {
  const startTime = Date.now();
  
  // Determine which epistemic operation to use
  let raw: string;
  switch (input.intent) {
    case 'describe':
      raw = await epistemic.describe(input.content);
      break;
    case 'interpret':
      raw = await epistemic.interpret(input.content);
      break;
    case 'reflect':
      raw = await epistemic.reflect(input.content);
      break;
    case 'pattern':
      raw = await epistemic.pattern!(input.content);
      break;
    case 'project':
      raw = await epistemic.project!(input.content);
      break;
    default:
      raw = await epistemic.interpret(input.content);
  }
  
  // Format for human consumption
  const human = conversational.format(raw);
  
  // Build response
  const response: DecodeResponse = {
    raw,
    human,
    metadata: {
      processingTime: Date.now() - startTime,
      module: 'decode'
    }
  };
  
  // Optionally invoke substrate modules
  if (input.invokeSubstrate) {
    response.substrate = {
      brain: await authority.toBrain(raw),
      nexus: await authority.toNexus(raw),
      defense: await authority.toDefense(raw),
      vision: await authority.toVision(raw)
    };
  }
  
  return response;
}

/**
 * Validate that an output conforms to conversational constraints
 */
export function validateOutput(output: string): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  // Check for imperative patterns
  const imperativePatterns = [
    /^(do|make|create|build|execute|run|start|stop)\s/i,
    /you (must|should|need to|have to)/i
  ];
  for (const pattern of imperativePatterns) {
    if (pattern.test(output)) {
      violations.push('Contains imperative language');
      break;
    }
  }
  
  // Check for identity claims
  const identityPatterns = [
    /\bi am\b/i,
    /\bmy name is\b/i,
    /\bi('m| am) (a|an|the)\b/i
  ];
  for (const pattern of identityPatterns) {
    if (pattern.test(output)) {
      violations.push('Contains identity claims');
      break;
    }
  }
  
  // Check for synthetic emotion
  const emotionPatterns = [
    /\bi feel\b/i,
    /\bmakes me (happy|sad|excited|worried)\b/i,
    /\bi('m| am) (excited|happy|sad|worried|concerned)\b/i
  ];
  for (const pattern of emotionPatterns) {
    if (pattern.test(output)) {
      violations.push('Contains synthetic emotion');
      break;
    }
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

export default decodeContract;
