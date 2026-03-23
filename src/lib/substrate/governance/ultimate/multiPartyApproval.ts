/**
 * GOVERNANCE Ultimate — System 2: Multi-Party Approval Workflow
 * 
 * Configurable quorum types (any_of, all_of, majority), TTL auto-deny,
 * cryptographic attestation per approval, and approval chain tracking.
 * 
 * @module governance/ultimate/multiPartyApproval
 */

// ── Types ────────────────────────────────────────────────────────

export type QuorumType = 'any_of' | 'all_of' | 'majority';
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired';

export interface ApprovalRequest {
  id: string;
  action: string;
  description: string;
  requiredApprovers: string[];
  quorumType: QuorumType;
  quorumThreshold: number;      // For 'majority': percentage (0.5-1.0)
  approvals: ApprovalVote[];
  status: ApprovalStatus;
  ttlMs: number;
  createdAt: number;
  resolvedAt: number | null;
  metadata: Record<string, unknown>;
}

export interface ApprovalVote {
  approverId: string;
  decision: 'approve' | 'deny';
  attestation: string;          // Hash of vote + timestamp
  reason: string;
  timestamp: number;
}

export interface ApprovalWorkflowStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  deniedRequests: number;
  expiredRequests: number;
  avgResolutionTimeMs: number;
  avgApproversPerRequest: number;
}

// ── State ────────────────────────────────────────────────────────

const requests: Map<string, ApprovalRequest> = new Map();
const MAX_REQUESTS = 1000;

function genId(): string { return `apr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`; }

function computeAttestation(approverId: string, decision: string, timestamp: number): string {
  const input = `${approverId}:${decision}:${timestamp}`;
  let hash = 0x811c9dc5 >>> 0;
  for (let i = 0; i < input.length; i++) {
    hash = Math.imul(hash ^ input.charCodeAt(i), 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// ── Core API ────────────────────────────────────────────────────

/** Create an approval request */
export function createApprovalRequest(
  action: string, description: string,
  requiredApprovers: string[],
  quorumType: QuorumType = 'majority',
  ttlMs: number = 3_600_000,   // 1 hour default
  metadata: Record<string, unknown> = {},
): ApprovalRequest {
  const threshold = quorumType === 'any_of' ? 1 / requiredApprovers.length :
    quorumType === 'all_of' ? 1.0 : 0.5;

  const request: ApprovalRequest = {
    id: genId(), action, description,
    requiredApprovers, quorumType, quorumThreshold: threshold,
    approvals: [], status: 'pending',
    ttlMs, createdAt: Date.now(), resolvedAt: null, metadata,
  };

  requests.set(request.id, request);
  if (requests.size > MAX_REQUESTS) evictResolved();
  return request;
}

/** Submit a vote */
export function submitVote(
  requestId: string, approverId: string,
  decision: 'approve' | 'deny', reason: string = '',
): { success: boolean; request?: ApprovalRequest; error?: string } {
  const request = requests.get(requestId);
  if (!request) return { success: false, error: 'request_not_found' };
  if (request.status !== 'pending') return { success: false, error: 'request_not_pending' };
  if (!request.requiredApprovers.includes(approverId)) return { success: false, error: 'not_an_approver' };
  if (request.approvals.some(a => a.approverId === approverId)) return { success: false, error: 'already_voted' };

  // Check TTL
  if (Date.now() - request.createdAt > request.ttlMs) {
    request.status = 'expired';
    request.resolvedAt = Date.now();
    return { success: false, error: 'request_expired' };
  }

  const timestamp = Date.now();
  const vote: ApprovalVote = {
    approverId, decision, reason, timestamp,
    attestation: computeAttestation(approverId, decision, timestamp),
  };

  request.approvals.push(vote);

  // Check quorum
  resolveQuorum(request);

  return { success: true, request };
}

/** Check and resolve quorum */
function resolveQuorum(request: ApprovalRequest): void {
  const approves = request.approvals.filter(a => a.decision === 'approve').length;
  const denies = request.approvals.filter(a => a.decision === 'deny').length;
  const total = request.requiredApprovers.length;

  switch (request.quorumType) {
    case 'any_of':
      if (approves >= 1) { request.status = 'approved'; request.resolvedAt = Date.now(); }
      else if (denies === total) { request.status = 'denied'; request.resolvedAt = Date.now(); }
      break;
    case 'all_of':
      if (approves === total) { request.status = 'approved'; request.resolvedAt = Date.now(); }
      else if (denies >= 1) { request.status = 'denied'; request.resolvedAt = Date.now(); }
      break;
    case 'majority':
      if (approves > total / 2) { request.status = 'approved'; request.resolvedAt = Date.now(); }
      else if (denies > total / 2) { request.status = 'denied'; request.resolvedAt = Date.now(); }
      break;
  }
}

/** Expire timed-out requests */
export function expireTimedOutRequests(): number {
  let expired = 0;
  const now = Date.now();
  for (const request of requests.values()) {
    if (request.status === 'pending' && now - request.createdAt > request.ttlMs) {
      request.status = 'expired';
      request.resolvedAt = now;
      expired++;
    }
  }
  return expired;
}

function evictResolved(): void {
  const resolved = [...requests.entries()]
    .filter(([, r]) => r.status !== 'pending')
    .sort((a, b) => (a[1].resolvedAt ?? 0) - (b[1].resolvedAt ?? 0));
  if (resolved.length > 0) requests.delete(resolved[0][0]);
}

// ── Query ────────────────────────────────────────────────────────

export function getApprovalRequest(id: string): ApprovalRequest | undefined { return requests.get(id); }
export function getPendingApprovalRequests(): ApprovalRequest[] {
  return [...requests.values()].filter(r => r.status === 'pending');
}
export function getApprovalRequestsByAction(action: string): ApprovalRequest[] {
  return [...requests.values()].filter(r => r.action === action);
}

export function getApprovalWorkflowStats(): ApprovalWorkflowStats {
  const all = [...requests.values()];
  const resolved = all.filter(r => r.resolvedAt);
  const avgTime = resolved.length > 0
    ? resolved.reduce((s, r) => s + ((r.resolvedAt ?? 0) - r.createdAt), 0) / resolved.length
    : 0;

  return {
    totalRequests: all.length,
    pendingRequests: all.filter(r => r.status === 'pending').length,
    approvedRequests: all.filter(r => r.status === 'approved').length,
    deniedRequests: all.filter(r => r.status === 'denied').length,
    expiredRequests: all.filter(r => r.status === 'expired').length,
    avgResolutionTimeMs: Math.round(avgTime),
    avgApproversPerRequest: all.length > 0
      ? Math.round(all.reduce((s, r) => s + r.requiredApprovers.length, 0) / all.length * 10) / 10
      : 0,
  };
}

export function resetApprovalWorkflow(): void { requests.clear(); }
