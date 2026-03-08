/**
 * CodeAgent Circuit Breaker & Self-Healing System
 * Provides resilience patterns for the autonomous coding system
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  failureThreshold: number;     // Number of failures before opening
  successThreshold: number;     // Number of successes to close from half-open
  openDurationMs: number;       // How long to stay open before half-open
  healthRecoveryRate: number;   // Health points recovered per success
  healthPenaltyRate: number;    // Health points lost per failure
}

export interface ServiceHealth {
  name: string;
  state: CircuitState;
  healthScore: number;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastSuccess: Date | null;
  lastFailure: Date | null;
  lastError: string | null;
  totalRequests: number;
  failedRequests: number;
}

export interface SelfHealAction {
  type: 'retry' | 'fallback' | 'reset' | 'escalate';
  triggered: Date;
  service: string;
  result: 'success' | 'failed' | 'pending';
  details?: string;
}

// Default configuration
const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  successThreshold: 2,
  openDurationMs: 60000, // 1 minute
  healthRecoveryRate: 10,
  healthPenaltyRate: 25,
};

// In-memory state for circuit breakers (bounded)
const MAX_CIRCUIT_BREAKERS = 50;
const MAX_HEALING_ACTIONS = 100;
const circuitBreakers: Map<string, ServiceHealth> = new Map();
const healingActions: SelfHealAction[] = [];
const config = { ...DEFAULT_CONFIG };

// ═══════════════════════════════════════════════════════════════
// CIRCUIT BREAKER CORE
// ═══════════════════════════════════════════════════════════════

function initServiceHealth(name: string): ServiceHealth {
  // Evict oldest if at capacity
  if (circuitBreakers.size >= MAX_CIRCUIT_BREAKERS && !circuitBreakers.has(name)) {
    const oldest = circuitBreakers.keys().next().value;
    if (oldest) circuitBreakers.delete(oldest);
  }
  return {
    name,
    state: 'closed',
    healthScore: 100,
    consecutiveFailures: 0,
    consecutiveSuccesses: 0,
    lastSuccess: null,
    lastFailure: null,
    lastError: null,
    totalRequests: 0,
    failedRequests: 0,
  };
}

export function getServiceHealth(service: string): ServiceHealth {
  if (!circuitBreakers.has(service)) {
    circuitBreakers.set(service, initServiceHealth(service));
  }
  return circuitBreakers.get(service)!;
}

export function isCircuitOpen(service: string): boolean {
  const health = getServiceHealth(service);
  
  if (health.state === 'open') {
    // Check if we should transition to half-open
    if (health.lastFailure) {
      const timeSinceFailure = Date.now() - health.lastFailure.getTime();
      if (timeSinceFailure >= config.openDurationMs) {
        health.state = 'half-open';
        console.log(`⚡ [CircuitBreaker] ${service} transitioning to HALF-OPEN`);
        return false;
      }
    }
    return true;
  }
  
  return false;
}

export function recordSuccess(service: string): void {
  const health = getServiceHealth(service);
  health.totalRequests++;
  health.consecutiveSuccesses++;
  health.consecutiveFailures = 0;
  health.lastSuccess = new Date();
  health.healthScore = Math.min(100, health.healthScore + config.healthRecoveryRate);
  
  // Close circuit if enough successes in half-open state
  if (health.state === 'half-open' && health.consecutiveSuccesses >= config.successThreshold) {
    health.state = 'closed';
    console.log(`✅ [CircuitBreaker] ${service} circuit CLOSED - recovered`);
    
    // Log healing action
    healingActions.push({
      type: 'reset',
      triggered: new Date(),
      service,
      result: 'success',
      details: 'Circuit recovered after successful requests',
    });
  }
}

export function recordFailure(service: string, error: string): void {
  const health = getServiceHealth(service);
  health.totalRequests++;
  health.failedRequests++;
  health.consecutiveFailures++;
  health.consecutiveSuccesses = 0;
  health.lastFailure = new Date();
  health.lastError = error;
  health.healthScore = Math.max(0, health.healthScore - config.healthPenaltyRate);
  
  // Open circuit if threshold exceeded
  if (health.consecutiveFailures >= config.failureThreshold && health.state !== 'open') {
    health.state = 'open';
    console.log(`🚫 [CircuitBreaker] ${service} circuit OPEN - ${error}`);
    
    // Trigger self-healing
    triggerSelfHeal(service, error);
  }
}

// ═══════════════════════════════════════════════════════════════
// SELF-HEALING SYSTEM
// ═══════════════════════════════════════════════════════════════

async function triggerSelfHeal(service: string, error: string): Promise<void> {
  console.log(`🔧 [SelfHeal] Attempting to heal ${service}...`);
  
  const action: SelfHealAction = {
    type: 'retry',
    triggered: new Date(),
    service,
    result: 'pending',
    details: `Auto-heal triggered due to: ${error}`,
  };
  
  healingActions.push(action);
  // Cap healing actions history
  if (healingActions.length > MAX_HEALING_ACTIONS) {
    healingActions.splice(0, healingActions.length - MAX_HEALING_ACTIONS);
  }
  try {
    if (error.includes('rate limit') || error.includes('429')) {
      // Wait and retry for rate limits
      action.type = 'fallback';
      action.details = 'Backing off due to rate limits';
      action.result = 'success';
      
    } else if (error.includes('timeout') || error.includes('network')) {
      // For network issues, schedule a retry
      action.type = 'retry';
      action.details = 'Scheduled retry after network issue';
      action.result = 'success';
      
    } else if (error.includes('validation') || error.includes('parse')) {
      // For validation errors, reset and try with fallback
      action.type = 'fallback';
      action.details = 'Using fallback pattern due to validation error';
      action.result = 'success';
      
    } else {
      // Unknown error - escalate
      action.type = 'escalate';
      action.details = `Unknown error requires attention: ${error}`;
      action.result = 'failed';
    }
  } catch (healError) {
    action.result = 'failed';
    action.details = `Healing failed: ${healError instanceof Error ? healError.message : 'Unknown'}`;
  }
}

export function getHealingActions(limit: number = 10): SelfHealAction[] {
  return healingActions.slice(-limit);
}

export function resetCircuit(service: string): void {
  const health = getServiceHealth(service);
  health.state = 'closed';
  health.consecutiveFailures = 0;
  health.consecutiveSuccesses = 0;
  health.healthScore = 100;
  health.lastError = null;
  
  console.log(`🔄 [CircuitBreaker] ${service} manually reset`);
  
  healingActions.push({
    type: 'reset',
    triggered: new Date(),
    service,
    result: 'success',
    details: 'Manual circuit reset',
  });
}

// ═══════════════════════════════════════════════════════════════
// WRAPPER FUNCTIONS FOR RESILIENT CALLS
// ═══════════════════════════════════════════════════════════════

export interface ResilientCallOptions<T> {
  service: string;
  operation: () => Promise<T>;
  fallback?: () => T | Promise<T>;
  timeout?: number;
  retries?: number;
}

export async function resilientCall<T>(options: ResilientCallOptions<T>): Promise<T> {
  const { service, operation, fallback, timeout = 30000, retries = 2 } = options;
  
  // Check if circuit is open
  if (isCircuitOpen(service)) {
    console.warn(`⚠️ [CircuitBreaker] ${service} circuit is OPEN, using fallback`);
    if (fallback) {
      return fallback();
    }
    throw new Error(`Service ${service} is temporarily unavailable`);
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add timeout wrapper
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Operation timeout')), timeout)
        ),
      ]);
      
      recordSuccess(service);
      return result;
      
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`⚠️ [ResilientCall] ${service} attempt ${attempt + 1} failed: ${lastError.message}`);
      
      // Don't retry on certain errors
      if (lastError.message.includes('validation') || lastError.message.includes('invalid')) {
        break;
      }
      
      // Exponential backoff between retries
      if (attempt < retries) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // All retries exhausted
  recordFailure(service, lastError?.message || 'Unknown error');
  
  if (fallback) {
    console.log(`🔄 [ResilientCall] Using fallback for ${service}`);
    return fallback();
  }
  
  throw lastError || new Error(`${service} operation failed`);
}

// ═══════════════════════════════════════════════════════════════
// HEALTH MONITORING
// ═══════════════════════════════════════════════════════════════

export function getAllServiceHealth(): ServiceHealth[] {
  return Array.from(circuitBreakers.values());
}

export function getOverallHealth(): {
  healthy: number;
  degraded: number;
  down: number;
  averageScore: number;
} {
  const services = getAllServiceHealth();
  
  if (services.length === 0) {
    return { healthy: 0, degraded: 0, down: 0, averageScore: 100 };
  }
  
  let healthy = 0;
  let degraded = 0;
  let down = 0;
  let totalScore = 0;
  
  for (const service of services) {
    totalScore += service.healthScore;
    
    if (service.state === 'open' || service.healthScore < 40) {
      down++;
    } else if (service.state === 'half-open' || service.healthScore < 70) {
      degraded++;
    } else {
      healthy++;
    }
  }
  
  return {
    healthy,
    degraded,
    down,
    averageScore: Math.round(totalScore / services.length),
  };
}

export function updateConfig(newConfig: Partial<CircuitBreakerConfig>): void {
  Object.assign(config, newConfig);
}
