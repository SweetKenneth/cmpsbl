 /**
   * NEXUS Circuit Breaker
   * Intelligent provider failure detection and recovery
   */
 
 export type CircuitState = 'closed' | 'open' | 'half-open';
 
 export interface ProviderCircuit {
   provider: string;
   state: CircuitState;
   failures: number;
   successes: number;
   last_failure_at: string | null;
   last_success_at: string | null;
   opened_at: string | null;
   half_open_at: string | null;
   cooldown_until: string | null;
 }
 
 export interface CircuitBreakerConfig {
   failure_threshold: number;
   success_threshold: number;
   cooldown_ms: number;
   half_open_requests: number;
 }
 
 // Default configuration
 const DEFAULT_CONFIG: CircuitBreakerConfig = {
   failure_threshold: 5,
   success_threshold: 3,
   cooldown_ms: 30000, // 30 seconds
   half_open_requests: 2,
 };
 
// Circuit state per provider — capped to prevent unbounded growth
const MAX_CIRCUITS = 50;
const circuits = new Map<string, ProviderCircuit>();
let config = { ...DEFAULT_CONFIG };
 
 /**
  * Get or create circuit for provider
  */
function getCircuit(provider: string): ProviderCircuit {
   if (!circuits.has(provider)) {
     // Evict oldest circuit if at capacity
     if (circuits.size >= MAX_CIRCUITS) {
       const oldest = circuits.keys().next().value;
       if (oldest) circuits.delete(oldest);
     }
     circuits.set(provider, {
       provider,
       state: 'closed',
       failures: 0,
       successes: 0,
       last_failure_at: null,
       last_success_at: null,
       opened_at: null,
       half_open_at: null,
       cooldown_until: null,
     });
   }
   return circuits.get(provider)!;
 }
 
 /**
  * Check if provider is available
  */
 export function isProviderAvailable(provider: string): boolean {
   const circuit = getCircuit(provider);
   const now = Date.now();
 
   switch (circuit.state) {
     case 'closed':
       return true;
 
     case 'open':
       // Check if cooldown has passed
       if (circuit.cooldown_until && now >= new Date(circuit.cooldown_until).getTime()) {
         // Transition to half-open
         circuit.state = 'half-open';
         circuit.half_open_at = new Date().toISOString();
         circuit.successes = 0;
         return true;
       }
       return false;
 
     case 'half-open':
       // Allow limited requests in half-open
       return circuit.successes < config.half_open_requests;
 
     default:
       return true;
   }
 }
 
 /**
  * Record a successful request
  */
 export function recordSuccess(provider: string): ProviderCircuit {
   const circuit = getCircuit(provider);
   circuit.last_success_at = new Date().toISOString();
   circuit.successes++;
 
   if (circuit.state === 'half-open') {
     if (circuit.successes >= config.success_threshold) {
       // Close the circuit
       circuit.state = 'closed';
       circuit.failures = 0;
       circuit.opened_at = null;
       circuit.half_open_at = null;
       circuit.cooldown_until = null;
     }
   } else if (circuit.state === 'closed') {
     // Reset failures on success
     circuit.failures = Math.max(0, circuit.failures - 1);
   }
 
   return circuit;
 }
 
 /**
  * Record a failed request
  */
 export function recordFailure(provider: string): ProviderCircuit {
   const circuit = getCircuit(provider);
   circuit.last_failure_at = new Date().toISOString();
   circuit.failures++;
 
   if (circuit.state === 'half-open') {
     // Immediately reopen on failure in half-open
     circuit.state = 'open';
     circuit.opened_at = new Date().toISOString();
     circuit.cooldown_until = new Date(Date.now() + config.cooldown_ms).toISOString();
   } else if (circuit.state === 'closed' && circuit.failures >= config.failure_threshold) {
     // Open the circuit
     circuit.state = 'open';
     circuit.opened_at = new Date().toISOString();
     circuit.cooldown_until = new Date(Date.now() + config.cooldown_ms).toISOString();
   }
 
   return circuit;
 }
 
 /**
  * Get circuit status for provider
  */
 export function getCircuitStatus(provider: string): ProviderCircuit {
   return { ...getCircuit(provider) };
 }
 
 /**
  * Get all circuit statuses
  */
 export function getAllCircuitStatuses(): ProviderCircuit[] {
   return Array.from(circuits.values()).map(c => ({ ...c }));
 }
 
 /**
  * Force reset a circuit to closed state
  */
 export function resetCircuit(provider: string): ProviderCircuit {
   const circuit = getCircuit(provider);
   circuit.state = 'closed';
   circuit.failures = 0;
   circuit.successes = 0;
   circuit.opened_at = null;
   circuit.half_open_at = null;
   circuit.cooldown_until = null;
   return { ...circuit };
 }
 
 /**
  * Reset all circuits
  */
 export function resetAllCircuits(): void {
   circuits.clear();
 }
 
 /**
  * Update circuit breaker configuration
  */
 export function updateCircuitConfig(updates: Partial<CircuitBreakerConfig>): CircuitBreakerConfig {
   config = { ...config, ...updates };
   return { ...config };
 }
 
 /**
  * Get current configuration
  */
 export function getCircuitConfig(): CircuitBreakerConfig {
   return { ...config };
 }
 
 /**
  * Get health summary across all circuits
  */
 export function getCircuitHealthSummary(): {
   total_providers: number;
   closed: number;
   open: number;
   half_open: number;
   health_score: number;
 } {
   const all = Array.from(circuits.values());
   const closed = all.filter(c => c.state === 'closed').length;
   const open = all.filter(c => c.state === 'open').length;
   const halfOpen = all.filter(c => c.state === 'half-open').length;
   const total = all.length || 1;
 
   return {
     total_providers: all.length,
     closed,
     open,
     half_open: halfOpen,
     health_score: Math.round((closed / total) * 100),
   };
 }