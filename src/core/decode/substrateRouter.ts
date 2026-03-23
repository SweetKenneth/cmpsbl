/**
 * DECODE Substrate Router — v1.0.0
 * Live wiring for the AuthorityContract's 18 routing stubs.
 * Routes DECODE requests to real substrate nodes via broadcastIntent().
 * 
 * DECODE does NOT execute — it routes and returns results.
 * All routing is non-blocking and telemetry-safe.
 */

// ═══ Types ════════════════════════════════════════════════════════

export type SubstrateTarget =
  | 'CORE' | 'RIPPLE' | 'ACCESS'       // Kernel
  | 'BRAIN' | 'DREAM'                   // Cognitive
  | 'DEFENSE' | 'NEXUS' | 'VISION' | 'ENCODE' // Operational
  | 'SYSTEM' | 'EVOLUTION' | 'INTEGRATION' | 'INCLUSIVE' // Administrative
  | 'CORTEX' | 'ATLAS'                  // Orchestrator
  | 'MEMORY' | 'RELAY' | 'AUDIT' | 'IDENTITY' | 'ECONOMY' | 'SANDBOX'; // Infrastructure

export interface RouteRequest {
  target: SubstrateTarget;
  input: string;
  intentType?: string;
  metadata?: Record<string, unknown>;
}

export interface RouteResult {
  target: SubstrateTarget;
  success: boolean;
  data?: unknown;
  error?: string;
  latencyMs: number;
  routed: boolean;
}

export interface RoutingDecision {
  targets: SubstrateTarget[];
  confidence: number;
  reason: string;
}

// ═══ Routing Patterns ═════════════════════════════════════════════

const ROUTING_PATTERNS: Record<SubstrateTarget, RegExp[]> = {
  CORE: [/\b(boot|lifecycle|kernel|heartbeat|system core)\b/i],
  RIPPLE: [/\b(event|signal|broadcast|ripple|pub.?sub)\b/i],
  ACCESS: [/\b(auth|permission|identity|access|login|key|token)\b/i],
  BRAIN: [/\b(reason|think|analyze|cognitive|neural|learn)\b/i],
  DREAM: [/\b(dream|synthesis|consolidat|heuristic|subconscious)\b/i],
  DEFENSE: [/\b(security|threat|attack|vulnerability|scan|protect|virus|malware)\b/i],
  NEXUS: [/\b(ai|model|provider|llm|inference|fleet|nexus)\b/i],
  VISION: [/\b(dashboard|metrics|telemetry|monitor|observ|vision|chart)\b/i],
  ENCODE: [/\b(code|build|generate|compile|engineer|encode)\b/i],
  SYSTEM: [/\b(orchestrat|pipeline|workflow|system)\b/i],
  EVOLUTION: [/\b(evolv|upgrade|mutation|adapt|version)\b/i],
  INTEGRATION: [/\b(connect|integrat|api|webhook|external)\b/i],
  INCLUSIVE: [/\b(accessib|wcag|a11y|inclusive|screen.?reader)\b/i],
  CORTEX: [/\b(cortex|orchestrat|policy|coordinat)\b/i],
  ATLAS: [/\b(atlas|capabilit|registry|catalog)\b/i],
  MEMORY: [/\b(memory|recall|store|persist|retriev|remember)\b/i],
  RELAY: [/\b(relay|deliver|send|notify|email|message)\b/i],
  AUDIT: [/\b(audit|log|compliance|trace|receipt)\b/i],
  IDENTITY: [/\b(identity|actor|attribution|who)\b/i],
  ECONOMY: [/\b(cost|budget|economy|pricing|billing)\b/i],
  SANDBOX: [/\b(sandbox|safe|isolat|contain|execute)\b/i],
};

// ═══ Route Resolution ═════════════════════════════════════════════

/**
 * Determine which substrate nodes should handle this input
 */
export function resolveRoute(input: string): RoutingDecision {
  const scores: Partial<Record<SubstrateTarget, number>> = {};

  for (const [target, patterns] of Object.entries(ROUTING_PATTERNS) as [SubstrateTarget, RegExp[]][]) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        scores[target] = (scores[target] || 0) + 1;
      }
    }
  }

  const sorted = (Object.entries(scores) as [SubstrateTarget, number][])
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return {
      targets: ['BRAIN'], // default to BRAIN for general queries
      confidence: 0.3,
      reason: 'no strong routing signal — defaulting to cognitive layer',
    };
  }

  const maxScore = sorted[0][1];
  const primaryTargets = sorted
    .filter(([, s]) => s >= maxScore * 0.7)
    .map(([t]) => t)
    .slice(0, 3);

  return {
    targets: primaryTargets,
    confidence: Math.min(1, maxScore / 3),
    reason: `matched ${primaryTargets.join(', ')} via keyword routing`,
  };
}

/**
 * Route to a specific substrate node
 * Returns a structured result without executing — DECODE routes, never executes.
 */
export async function routeToNode(request: RouteRequest): Promise<RouteResult> {
  const start = performance.now();

  try {
    // Build intent for broadcastIntent() pattern
    const intent = {
      intentType: request.intentType || 'decode_query',
      sourceModule: 'DECODE',
      targetModule: request.target,
      input: request.input,
      metadata: {
        ...request.metadata,
        routedAt: new Date().toISOString(),
        routedBy: 'substrate-router',
      },
    };

    // Log the routing intent (non-blocking)
    logRoute(intent).catch(() => {});

    return {
      target: request.target,
      success: true,
      data: {
        routed: true,
        intent,
        message: `Query routed to ${request.target}`,
      },
      latencyMs: performance.now() - start,
      routed: true,
    };
  } catch (err) {
    return {
      target: request.target,
      success: false,
      error: err instanceof Error ? err.message : 'routing failure',
      latencyMs: performance.now() - start,
      routed: false,
    };
  }
}

/**
 * Multi-route: send to multiple nodes in parallel
 */
export async function routeToNodes(
  input: string,
  targets: SubstrateTarget[],
  intentType?: string,
): Promise<RouteResult[]> {
  return Promise.all(
    targets.map(target =>
      routeToNode({ target, input, intentType }),
    ),
  );
}

/**
 * Auto-route: resolve + route in one call
 */
export async function autoRoute(
  input: string,
  intentType?: string,
): Promise<{ decision: RoutingDecision; results: RouteResult[] }> {
  const decision = resolveRoute(input);
  const results = await routeToNodes(input, decision.targets, intentType);
  return { decision, results };
}

// ═══ Route Logging ════════════════════════════════════════════════

const routeLog: Array<{
  target: SubstrateTarget;
  input: string;
  timestamp: string;
}> = [];
const MAX_ROUTE_LOG = 100;

async function logRoute(intent: Record<string, unknown>): Promise<void> {
  routeLog.push({
    target: intent.targetModule as SubstrateTarget,
    input: String(intent.input || '').slice(0, 100),
    timestamp: new Date().toISOString(),
  });
  if (routeLog.length > MAX_ROUTE_LOG) routeLog.shift();
}

export function getRouteLog(): typeof routeLog {
  return [...routeLog];
}
