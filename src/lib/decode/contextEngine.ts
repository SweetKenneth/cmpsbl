/**
 * DECODE Context Engine
 * v8.0.0 — SYNERGY+ Epoch — Multi-turn conversation context and memory
 */
 
 // Context window
 export interface ContextWindow {
   id: string;
   turns: ConversationTurn[];
   entities: Map<string, EntitySlot>;
   intents: string[];
   moduleContext?: string;
   createdAt: string;
   lastActivity: string;
 }
 
 // Conversation turn
 export interface ConversationTurn {
   role: 'user' | 'system' | 'module';
   content: string;
   timestamp: string;
   intent?: string;
   entities?: Record<string, unknown>;
 }
 
 // Entity slot
 export interface EntitySlot {
   type: string;
   value: unknown;
   confidence: number;
   source: string;
   updatedAt: string;
 }
 
 // Context resolution result
 export interface ContextResolution {
   resolvedEntities: Record<string, unknown>;
   ambiguities: string[];
   suggestions: string[];
   confidence: number;
 }
 
 // Active context windows
 const contextWindows = new Map<string, ContextWindow>();
 const MAX_TURNS = 20;
 const CONTEXT_TTL_MS = 30 * 60 * 1000; // 30 minutes
 
 /**
  * Create or get a context window
  */
 export function getOrCreateContext(sessionId: string): ContextWindow {
   let context = contextWindows.get(sessionId);
   
   if (!context) {
     context = {
       id: sessionId,
       turns: [],
       entities: new Map(),
       intents: [],
       createdAt: new Date().toISOString(),
       lastActivity: new Date().toISOString(),
     };
     contextWindows.set(sessionId, context);
   }
   
   return context;
 }
 
 /**
  * Add a turn to the context
  */
 export function addTurn(
   sessionId: string,
   turn: Omit<ConversationTurn, 'timestamp'>
 ): ContextWindow {
   const context = getOrCreateContext(sessionId);
   
   context.turns.push({
     ...turn,
     timestamp: new Date().toISOString(),
   });
   
   // Limit turns
   if (context.turns.length > MAX_TURNS) {
     context.turns.shift();
   }
   
   // Track intent
   if (turn.intent && !context.intents.includes(turn.intent)) {
     context.intents.push(turn.intent);
     if (context.intents.length > 10) context.intents.shift();
   }
   
   // Extract entities
   if (turn.entities) {
     for (const [key, value] of Object.entries(turn.entities)) {
       context.entities.set(key, {
         type: key,
         value,
         confidence: 0.9,
         source: turn.role,
         updatedAt: new Date().toISOString(),
       });
     }
   }
   
   context.lastActivity = new Date().toISOString();
   return context;
 }
 
 /**
  * Resolve entity references using context
  */
 export function resolveReferences(
   sessionId: string,
   input: string
 ): ContextResolution {
   const context = contextWindows.get(sessionId);
   const resolvedEntities: Record<string, unknown> = {};
   const ambiguities: string[] = [];
   const suggestions: string[] = [];
   
   if (!context) {
     return { resolvedEntities, ambiguities, suggestions, confidence: 0.5 };
   }
   
   // Resolve pronouns and references
   const pronounPatterns = [
     { pattern: /\b(it|this|that)\b/gi, type: 'thing' },
     { pattern: /\b(them|those|these)\b/gi, type: 'things' },
     { pattern: /\b(he|him)\b/gi, type: 'person' },
     { pattern: /\b(she|her)\b/gi, type: 'person' },
   ];
   
   for (const { pattern, type } of pronounPatterns) {
     if (pattern.test(input)) {
       // Find most recent matching entity
       const candidates = Array.from(context.entities.entries())
         .filter(([, slot]) => slot.type.includes(type) || type === 'thing')
         .sort((a, b) => 
           new Date(b[1].updatedAt).getTime() - new Date(a[1].updatedAt).getTime()
         );
       
       if (candidates.length === 1) {
         resolvedEntities[candidates[0][0]] = candidates[0][1].value;
       } else if (candidates.length > 1) {
         ambiguities.push(`Ambiguous reference: "${type}" could refer to multiple entities`);
       }
     }
   }
   
   // Copy known entities
   for (const [key, slot] of context.entities.entries()) {
     if (input.toLowerCase().includes(key.toLowerCase())) {
       resolvedEntities[key] = slot.value;
     }
   }
   
   // Generate suggestions based on recent intents
   if (context.intents.length > 0) {
     const lastIntent = context.intents[context.intents.length - 1];
     suggestions.push(`Continue with: ${lastIntent}`);
   }
   
   const confidence = ambiguities.length === 0 ? 0.9 : 0.6;
   
   return { resolvedEntities, ambiguities, suggestions, confidence };
 }
 
 /**
  * Set module context
  */
 export function setModuleContext(sessionId: string, module: string): void {
   const context = getOrCreateContext(sessionId);
   context.moduleContext = module;
 }
 
 /**
  * Get conversation history
  */
 export function getHistory(
   sessionId: string,
   limit?: number
 ): ConversationTurn[] {
   const context = contextWindows.get(sessionId);
   if (!context) return [];
   
   const turns = [...context.turns];
   return limit ? turns.slice(-limit) : turns;
 }
 
 /**
  * Get entity slot
  */
 export function getEntity(sessionId: string, entityType: string): EntitySlot | null {
   const context = contextWindows.get(sessionId);
   return context?.entities.get(entityType) || null;
 }
 
 /**
  * Set entity value
  */
 export function setEntity(
   sessionId: string,
   entityType: string,
   value: unknown,
   source: string = 'system'
 ): void {
   const context = getOrCreateContext(sessionId);
   context.entities.set(entityType, {
     type: entityType,
     value,
     confidence: 1.0,
     source,
     updatedAt: new Date().toISOString(),
   });
 }
 
 /**
  * Clear context
  */
 export function clearContext(sessionId: string): boolean {
   return contextWindows.delete(sessionId);
 }
 
 /**
  * Clean up stale contexts
  */
 export function cleanupStaleContexts(): number {
   const now = Date.now();
   let cleaned = 0;
   
   for (const [id, context] of contextWindows.entries()) {
     const lastActivity = new Date(context.lastActivity).getTime();
     if (now - lastActivity > CONTEXT_TTL_MS) {
       contextWindows.delete(id);
       cleaned++;
     }
   }
   
   return cleaned;
 }
 
 /**
  * Get context summary for a session
  */
 export function getContextSummary(sessionId: string): {
   turns: number;
   entities: number;
   intents: string[];
   moduleContext?: string;
   age: number;
 } | null {
   const context = contextWindows.get(sessionId);
   if (!context) return null;
   
   return {
     turns: context.turns.length,
     entities: context.entities.size,
     intents: context.intents,
     moduleContext: context.moduleContext,
     age: Date.now() - new Date(context.createdAt).getTime(),
   };
 }
 
 /**
  * Get active context count
  */
 export function getActiveContextCount(): number {
   return contextWindows.size;
 }