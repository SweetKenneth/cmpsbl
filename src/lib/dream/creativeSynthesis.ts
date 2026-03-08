/**
 * DREAM Creative Synthesis
 * Pattern mutation and novel insight generation
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Synthesis input
 export interface SynthesisInput {
   patterns: string[];
   context: string;
   temperature: number; // 0-1, higher = more creative
   constraints?: string[];
 }
 
 // Synthesized output
 export interface SynthesisOutput {
   id: string;
   novel_concept: string;
   reasoning_chain: string[];
   confidence: number;
   creativity_score: number;
   applicability: string[];
   parent_patterns: string[];
   timestamp: string;
 }
 
 // Mutation operation
 export type MutationType = 'combine' | 'invert' | 'abstract' | 'specialize' | 'analogize';
 
 // Pattern mutation
 export interface PatternMutation {
   type: MutationType;
   original: string;
   mutated: string;
   viability: number;
 }
 
 // Synthesis history
 const synthesisHistory: SynthesisOutput[] = [];
 const MAX_HISTORY = 100;
 
 /**
  * Synthesize new insights from existing patterns
  */
 export async function synthesize(input: SynthesisInput): Promise<SynthesisOutput> {
   const { patterns, context, temperature, constraints } = input;
   
   // Generate combinations of patterns
   const combinations = generateCombinations(patterns, Math.min(3, patterns.length));
   
   // Apply mutations based on temperature
   const mutations = combinations.flatMap(combo => 
     applyMutations(combo, temperature)
   );
   
   // Filter by constraints
   const viable = constraints?.length 
     ? mutations.filter(m => meetsConstraints(m, constraints))
     : mutations;
   
   // Select best mutation
   const best = viable.reduce((a, b) => 
     a.viability > b.viability ? a : b
   , viable[0] || { type: 'combine' as MutationType, original: '', mutated: '', viability: 0 });
   
   // Build synthesis output
   const output: SynthesisOutput = {
     id: `synth_${Date.now()}`,
     novel_concept: best.mutated || `Novel insight from ${patterns.length} patterns`,
     reasoning_chain: [
       `Analyzed ${patterns.length} input patterns`,
       `Generated ${combinations.length} combinations`,
       `Applied ${mutations.length} mutations at temperature ${temperature}`,
       `Selected ${best.type} mutation with viability ${best.viability.toFixed(2)}`,
     ],
     confidence: best.viability,
     creativity_score: temperature * best.viability,
     applicability: deriveApplicability(best.mutated, context),
     parent_patterns: patterns,
     timestamp: new Date().toISOString(),
   };
   
    // Store in history
    synthesisHistory.push(output);
    if (synthesisHistory.length > MAX_HISTORY) {
      synthesisHistory.splice(0, synthesisHistory.length - MAX_HISTORY);
    }
   
   // Log to database (fire-and-forget — don't block caller)
   logSynthesis(output);
   
   return output;
 }
 
 /**
  * Generate pattern combinations
  */
 function generateCombinations(patterns: string[], size: number): string[][] {
   if (size === 1) return patterns.map(p => [p]);
   
   const combinations: string[][] = [];
   
   for (let i = 0; i < patterns.length; i++) {
     const remaining = patterns.slice(i + 1);
     const subCombinations = generateCombinations(remaining, size - 1);
     
     for (const combo of subCombinations) {
       combinations.push([patterns[i], ...combo]);
     }
   }
   
   return combinations;
 }
 
 /**
  * Apply mutations to pattern combinations
  */
 function applyMutations(patterns: string[], temperature: number): PatternMutation[] {
   const mutations: PatternMutation[] = [];
   const types: MutationType[] = ['combine', 'invert', 'abstract', 'specialize', 'analogize'];
   
   for (const type of types) {
     const mutation = mutate(patterns, type, temperature);
     if (mutation.viability > 0.3) {
       mutations.push(mutation);
     }
   }
   
   return mutations;
 }
 
 /**
  * Mutate patterns according to type
  */
 function mutate(patterns: string[], type: MutationType, temperature: number): PatternMutation {
   const original = patterns.join(' + ');
   let mutated: string;
   let viability: number;
   
   switch (type) {
     case 'combine':
       mutated = `Synthesis of (${patterns.join(', ')})`;
       viability = 0.5 + (temperature * 0.3);
       break;
       
     case 'invert':
       mutated = `Inverse of (${patterns[0]})`;
       viability = 0.4 + (temperature * 0.4);
       break;
       
     case 'abstract':
       mutated = `Abstraction: Common principle underlying ${patterns.length} patterns`;
       viability = 0.6 + (temperature * 0.2);
       break;
       
     case 'specialize':
       mutated = `Specialized application of (${patterns[0]}) to domain`;
       viability = 0.55 + (temperature * 0.25);
       break;
       
     case 'analogize':
       mutated = `Analogical transfer: (${patterns[0]}) → new domain`;
       viability = 0.45 + (temperature * 0.35);
       break;
       
     default:
       mutated = original;
       viability = 0.3;
   }
   
   // Add randomness based on temperature
   viability = Math.min(1, viability + (Math.random() - 0.5) * temperature * 0.2);
   
   return { type, original, mutated, viability };
 }
 
 /**
  * Check if mutation meets constraints
  */
 function meetsConstraints(mutation: PatternMutation, constraints: string[]): boolean {
   // Simple constraint checking
   return constraints.every(c => !mutation.mutated.toLowerCase().includes(c.toLowerCase()));
 }
 
 /**
  * Derive applicability domains
  */
 function deriveApplicability(concept: string, context: string): string[] {
   const domains = ['strategy', 'optimization', 'pattern', 'architecture', 'behavior'];
   
   // Simple heuristic based on context
   return domains.filter(() => Math.random() > 0.5);
 }
 
 /**
  * Log synthesis to database
  */
 async function logSynthesis(output: SynthesisOutput): Promise<void> {
   try {
     await supabase.from('brain_events').insert({
       event_type: 'synthesis.completed',
       module: 'dream',
       data: {
         synthesis_id: output.id,
         confidence: output.confidence,
         creativity_score: output.creativity_score,
         parent_count: output.parent_patterns.length,
       },
     } as never);
   } catch {
     // Silent fail for logging
   }
 }
 
 /**
  * Get synthesis history
  */
 export function getSynthesisHistory(limit?: number): SynthesisOutput[] {
   const history = [...synthesisHistory].reverse();
   return limit ? history.slice(0, limit) : history;
 }
 
 /**
  * Evaluate a synthesis for production use
  */
 export function evaluateSynthesis(synthesis: SynthesisOutput): {
   ready: boolean;
   score: number;
   concerns: string[];
 } {
   const concerns: string[] = [];
   
   if (synthesis.confidence < 0.5) {
     concerns.push('Low confidence score');
   }
   if (synthesis.creativity_score > 0.9) {
     concerns.push('High creativity may indicate instability');
   }
   if (synthesis.applicability.length === 0) {
     concerns.push('No clear applicability domains');
   }
   
   const score = (synthesis.confidence * 0.6) + 
                 (Math.min(synthesis.creativity_score, 0.7) * 0.4);
   
   return {
     ready: concerns.length === 0 && score > 0.5,
     score,
     concerns,
   };
 }
 
 /**
  * Cross-pollinate insights from different synthesis sessions
  */
 export async function crossPollinate(count: number = 3): Promise<SynthesisOutput | null> {
   if (synthesisHistory.length < 2) {
     return null;
   }
   
   // Pick random historical syntheses
   const selected: SynthesisOutput[] = [];
   const available = [...synthesisHistory];
   
   for (let i = 0; i < Math.min(count, available.length); i++) {
     const idx = Math.floor(Math.random() * available.length);
     selected.push(available.splice(idx, 1)[0]);
   }
   
   // Use their novel concepts as input patterns
   return synthesize({
     patterns: selected.map(s => s.novel_concept),
     context: 'cross-pollination',
     temperature: 0.7,
   });
 }