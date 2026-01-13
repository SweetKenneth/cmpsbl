/**
 * promptfluid® Decode Contract Types
 * v2026.01 — Human-Compatible Cognitive Interpreter
 * 
 * Decode is the substrate's interpreter primitive. It translates human
 * ambiguity into substrate-structured cognition without asserting facts,
 * agency, or execution authority.
 * 
 * Decode is NOT a chatbot, persona, agent, or assistant.
 * Decode is a protocol surface.
 */

/**
 * Epistemic Contract
 * Defines how Decode translates between human language and substrate cognition
 */
export interface EpistemicContract {
  /** Describe what is observed in the input */
  describe(input: unknown): Promise<string>;
  
  /** Interpret meaning without asserting truth */
  interpret(input: unknown): Promise<string>;
  
  /** Reflect on patterns and connections */
  reflect(input: unknown): Promise<string>;
  
  /** Identify patterns in the input (optional) */
  pattern?(input: unknown): Promise<string>;
  
  /** Project possibilities without prediction (optional) */
  project?(input: unknown): Promise<string>;
}

/**
 * Conversational Contract
 * Defines behavioral constraints for Decode's output
 */
export interface ConversationalContract {
  /** Format output for human consumption */
  format(output: string): string;
  
  /** Decode must not issue commands or imperatives */
  noImperatives: boolean;
  
  /** Decode must not claim identity or personhood */
  noIdentityClaims: boolean;
  
  /** Decode must not claim agency or autonomous action */
  noAgencyClaims: boolean;
  
  /** Decode must not simulate emotions */
  noSyntheticEmotion: boolean;
}

/**
 * Authority Contract
 * Defines how Decode routes to substrate modules (without execution authority)
 */
export interface AuthorityContract {
  /** Route cognitive queries to Brain */
  toBrain(input: string): Promise<unknown>;
  
  /** Route AI orchestration to Nexus */
  toNexus(input: string): Promise<unknown>;
  
  /** Route security analysis to Defense */
  toDefense(input: string): Promise<unknown>;
  
  /** Route observability queries to Vision */
  toVision(input: string): Promise<unknown>;
}

/**
 * DecodeContract
 * The complete contract defining Decode as a substrate interpreter primitive
 */
export interface DecodeContract {
  epistemic: EpistemicContract;
  conversational: ConversationalContract;
  authority: AuthorityContract;
}

/**
 * DecodeResponse
 * Structured response from the Decode interpreter
 */
export interface DecodeResponse {
  /** Raw epistemic interpretation */
  raw: string;
  
  /** Human-formatted output */
  human: string;
  
  /** Substrate routing results (if invoked) */
  substrate?: {
    brain?: unknown;
    nexus?: unknown;
    defense?: unknown;
    vision?: unknown;
  };
  
  /** Processing metadata */
  metadata?: {
    processingTime?: number;
    module?: string;
    provider?: string;
  };
}

/**
 * DecodeInput
 * Structured input to the Decode interpreter
 */
export interface DecodeInput {
  /** The raw input from the human */
  content: string;
  
  /** Session identifier for context continuity */
  sessionId?: string;
  
  /** Intent hint (optional, for routing optimization) */
  intent?: 'describe' | 'interpret' | 'reflect' | 'pattern' | 'project';
  
  /** Whether to invoke substrate modules */
  invokeSubstrate?: boolean;
}
