/**
 * CMPSBL® Decode Contract Types
 * Human-Compatible Cognitive Interpreter
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
  // ── Kernel Layer ──
  /** Route to CORE scheduling & lifecycle */
  toCore(input: string): Promise<unknown>;
  /** Route to RIPPLE event bus */
  toRipple(input: string): Promise<unknown>;
  /** Route to ACCESS identity & permissions */
  toAccess(input: string): Promise<unknown>;
  
  // ── Cognitive Layer ──
  /** Route cognitive queries to Brain */
  toBrain(input: string): Promise<unknown>;
  /** Route pattern synthesis to Dream */
  toDream(input: string): Promise<unknown>;
  
  // ── Operational Layer ──
  /** Route security analysis to Defense */
  toDefense(input: string): Promise<unknown>;
  /** Route AI orchestration to Nexus */
  toNexus(input: string): Promise<unknown>;
  /** Route observability queries to Vision */
  toVision(input: string): Promise<unknown>;
  /** Route code generation to Encode */
  toEncode(input: string): Promise<unknown>;
  
  // ── Administrative Layer ──
  /** Route system orchestration to System */
  toSystem(input: string): Promise<unknown>;
  /** Route self-evolution to Evolution */
  toEvolution(input: string): Promise<unknown>;
  /** Route connector queries to Integration */
  toIntegration(input: string): Promise<unknown>;
  /** Route accessibility to Inclusive */
  toInclusive(input: string): Promise<unknown>;
  
  // ── Orchestrator Layer ──
  /** Route policy orchestration to Cortex */
  toCortex(input: string): Promise<unknown>;
  /** Route capability registry to Atlas */
  toAtlas(input: string): Promise<unknown>;
  
  // ── Infrastructure Layer ──
  /** Route vector/RAG recall to Memory */
  toMemory(input: string): Promise<unknown>;
  /** Route outbound delivery to Relay */
  toRelay(input: string): Promise<unknown>;
  /** Route compliance logging to Audit */
  toAudit(input: string): Promise<unknown>;
  /** Route actor attribution to Identity */
  toIdentity(input: string): Promise<unknown>;
  /** Route cost tracking to Economy */
  toEconomy(input: string): Promise<unknown>;
  /** Route safe execution to Sandbox */
  toSandbox(input: string): Promise<unknown>;
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
  substrate?: Record<string, unknown>;
  
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
