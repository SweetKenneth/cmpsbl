/**
 * Action Grammar — Standardized execution primitives
 * Defines atomic operations agents can perform
 */

export type ActionType = 
  | 'find'      // Locate resources/data
  | 'extract'   // Pull structured data
  | 'compute'   // Transform/analyze data
  | 'submit'    // POST/PUT to endpoints
  | 'schedule'  // Queue future actions
  | 'notify'    // Alert humans/systems
  | 'write'     // Store to database/files
  | 'verify';   // Check goal state

export type ActionStatus = 'pending' | 'running' | 'success' | 'partial' | 'fail' | 'retry' | 'escalated';

export interface ActionPrimitive {
  type: ActionType;
  target: string;
  params: Record<string, unknown>;
  timeout?: number;
  retryCount?: number;
  fallbackAction?: ActionPrimitive;
}

export interface ActionResult {
  action: ActionPrimitive;
  status: ActionStatus;
  data?: unknown;
  error?: string;
  evidence?: EvidenceBundle;
  durationMs: number;
  timestamp: string;
}

export interface EvidenceBundle {
  type: 'json' | 'html' | 'markdown' | 'screenshot' | 'snippet';
  content: string;
  url?: string;
  hash?: string;
  capturedAt: string;
}

export interface ExecutionPlan {
  id: string;
  agentId: string;
  taskId: string;
  goalState: string;
  actions: ActionPrimitive[];
  status: ActionStatus;
  results: ActionResult[];
  createdAt: string;
  completedAt?: string;
}

// Action Builders
export const Actions = {
  find: (target: string, params: Record<string, unknown> = {}): ActionPrimitive => ({
    type: 'find',
    target,
    params,
    timeout: 30000,
  }),

  extract: (target: string, schema?: Record<string, unknown>): ActionPrimitive => ({
    type: 'extract',
    target,
    params: { schema },
    timeout: 60000,
  }),

  compute: (operation: string, input: unknown): ActionPrimitive => ({
    type: 'compute',
    target: operation,
    params: { input },
    timeout: 120000,
  }),

  submit: (endpoint: string, payload: unknown, method: 'POST' | 'PUT' | 'DELETE' = 'POST'): ActionPrimitive => ({
    type: 'submit',
    target: endpoint,
    params: { payload, method },
    timeout: 30000,
  }),

  schedule: (action: ActionPrimitive, delay: number): ActionPrimitive => ({
    type: 'schedule',
    target: 'scheduler',
    params: { action, delayMs: delay },
  }),

  notify: (channel: string, message: string, metadata?: Record<string, unknown>): ActionPrimitive => ({
    type: 'notify',
    target: channel,
    params: { message, metadata },
  }),

  write: (destination: string, data: unknown): ActionPrimitive => ({
    type: 'write',
    target: destination,
    params: { data },
  }),

  verify: (goalState: string, observedState: unknown): ActionPrimitive => ({
    type: 'verify',
    target: 'verifier',
    params: { goalState, observedState },
  }),
};

// Parse natural language into action primitives
export function parseActionIntent(intent: string): ActionPrimitive[] {
  const actions: ActionPrimitive[] = [];
  const lowerIntent = intent.toLowerCase();

  if (lowerIntent.includes('search') || lowerIntent.includes('find') || lowerIntent.includes('look up')) {
    const target = extractTarget(intent);
    actions.push(Actions.find(target, { source: 'web' }));
  }

  if (lowerIntent.includes('extract') || lowerIntent.includes('scrape') || lowerIntent.includes('get data')) {
    const target = extractTarget(intent);
    actions.push(Actions.extract(target));
  }

  if (lowerIntent.includes('analyze') || lowerIntent.includes('compute') || lowerIntent.includes('calculate')) {
    actions.push(Actions.compute('analyze', { query: intent }));
  }

  if (lowerIntent.includes('notify') || lowerIntent.includes('alert') || lowerIntent.includes('report')) {
    actions.push(Actions.notify('user', intent));
  }

  if (lowerIntent.includes('save') || lowerIntent.includes('store') || lowerIntent.includes('write')) {
    actions.push(Actions.write('memory', { intent }));
  }

  // Default to find if no specific action detected
  if (actions.length === 0) {
    actions.push(Actions.find(intent, { source: 'web' }));
  }

  return actions;
}

function extractTarget(intent: string): string {
  // Extract URL if present
  const urlMatch = intent.match(/https?:\/\/[^\s]+/);
  if (urlMatch) return urlMatch[0];

  // Extract quoted text
  const quoteMatch = intent.match(/"([^"]+)"|'([^']+)'/);
  if (quoteMatch) return quoteMatch[1] || quoteMatch[2];

  // Return the main subject (simplified)
  return intent.replace(/^(search|find|extract|look up|get)\s+(for\s+)?/i, '').trim();
}

// Validate action chain
export function validatePlan(plan: ExecutionPlan): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!plan.actions.length) {
    errors.push('Plan has no actions');
  }

  if (!plan.goalState) {
    errors.push('Plan has no goal state defined');
  }

  for (const action of plan.actions) {
    if (!action.target) {
      errors.push(`Action ${action.type} missing target`);
    }
  }

  return { valid: errors.length === 0, errors };
}
